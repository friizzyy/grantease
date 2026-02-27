/**
 * NOTIFICATION SENDER SERVICE
 * ---------------------------
 * Orchestrates in-app notification creation AND email delivery based on user preferences.
 * Respects quiet hours, email toggles per notification type, and timezone settings.
 */

import { prisma } from '@/lib/db'
import {
  sendEmail,
  isEmailConfigured,
  renderGrantAlertEmail,
  renderDeadlineReminderEmail,
  renderWeeklyDigestEmail,
} from './email-service'

// ============= TYPES =============

type NotificationType = 'deadline_reminder' | 'new_match' | 'application_update' | 'system'

interface NotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  emailData?: {
    grants?: Array<{
      title: string
      sponsor: string
      deadline?: string
      matchScore?: number
      url: string
    }>
    deadlines?: Array<{
      title: string
      sponsor: string
      deadline: string
      daysLeft: number
      workspaceUrl?: string
    }>
    weeklyDigest?: {
      userName: string
      newMatches: number
      upcomingDeadlines: Array<{ title: string; deadline: string; daysLeft: number }>
      applicationUpdates: Array<{ title: string; status: string }>
      aiInsight: string
    }
  }
}

interface NotificationResult {
  notificationId: string
  emailSent: boolean
}

interface BulkNotificationResult {
  sent: number
  failed: number
}

// ============= PUBLIC API =============

/**
 * Send a notification to a user (in-app + optional email).
 *
 * 1. Always creates an in-app Notification record in the database
 * 2. Checks the user's NotificationPreferences
 * 3. If email is enabled for this type AND not in quiet hours, sends email
 * 4. Returns the notification ID and whether email was sent
 */
export async function sendNotification(params: NotificationParams): Promise<NotificationResult> {
  const { userId, type, title, message, link, metadata, emailData } = params

  // Step 1: Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })

  // Step 2: Check if we should send an email
  let emailSent = false

  if (!isEmailConfigured()) {
    return { notificationId: notification.id, emailSent: false }
  }

  try {
    const shouldEmail = await shouldSendEmail(userId, type)
    if (!shouldEmail) {
      return { notificationId: notification.id, emailSent: false }
    }

    // Step 3: Get user info for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user?.email) {
      console.warn(`[NotificationSender] User ${userId} has no email address`)
      return { notificationId: notification.id, emailSent: false }
    }

    const userName = user.name || 'there'

    // Step 4: Render and send the appropriate email
    const emailContent = renderEmailContent(type, userName, emailData, title, message)
    if (emailContent) {
      const result = await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      emailSent = result.success
      if (!result.success) {
        console.error(
          `[NotificationSender] Email failed for user ${userId}:`,
          result.error
        )
      }
    }
  } catch (error) {
    // Email failure should not prevent in-app notification from succeeding
    console.error(
      `[NotificationSender] Email send error for user ${userId}:`,
      error instanceof Error ? error.message : error
    )
  }

  return { notificationId: notification.id, emailSent }
}

/**
 * Send notifications to multiple users in sequence.
 * Failures for individual users are logged but do not stop the batch.
 */
export async function sendBulkNotifications(
  notifications: NotificationParams[]
): Promise<BulkNotificationResult> {
  let sent = 0
  let failed = 0

  for (const notification of notifications) {
    try {
      await sendNotification(notification)
      sent++
    } catch (error) {
      failed++
      console.error(
        `[NotificationSender] Bulk send failed for user ${notification.userId}:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  return { sent, failed }
}

// ============= INTERNAL HELPERS =============

/**
 * Determine whether an email should be sent for a given notification type,
 * considering user preferences and quiet hours.
 */
async function shouldSendEmail(userId: string, type: NotificationType): Promise<boolean> {
  const prefs = await prisma.notificationPreferences.findUnique({
    where: { userId },
  })

  // No preferences record = use defaults (emails enabled)
  if (!prefs) {
    return true
  }

  // Master email toggle
  if (!prefs.emailEnabled) {
    return false
  }

  // Check type-specific toggle
  const typeEnabled = isTypeEnabled(prefs, type)
  if (!typeEnabled) {
    return false
  }

  // Check quiet hours
  if (prefs.quietHoursEnabled && prefs.quietHoursStart && prefs.quietHoursEnd) {
    const isQuiet = isInQuietHours(
      prefs.quietHoursStart,
      prefs.quietHoursEnd,
      prefs.timezone
    )
    if (isQuiet) {
      return false
    }
  }

  return true
}

/**
 * Check if a specific notification type is enabled in user preferences
 */
function isTypeEnabled(
  prefs: {
    grantAlerts: boolean
    deadlineReminders: boolean
    applicationUpdates: boolean
    aiRecommendations: boolean
    weeklyDigest: boolean
  },
  type: NotificationType
): boolean {
  switch (type) {
    case 'new_match':
      return prefs.grantAlerts
    case 'deadline_reminder':
      return prefs.deadlineReminders
    case 'application_update':
      return prefs.applicationUpdates
    case 'system':
      // System notifications are always sent (important platform updates)
      return true
    default:
      return true
  }
}

/**
 * Check if the current time falls within the user's quiet hours.
 * Quiet hours are specified in HH:MM format in the user's timezone.
 */
function isInQuietHours(
  startTime: string,
  endTime: string,
  timezone: string
): boolean {
  try {
    // Get current time in the user's timezone
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const parts = formatter.formatToParts(now)
    const currentHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10)
    const currentMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
    const currentMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    // Same-day quiet hours (e.g., 01:00 to 07:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  } catch (error) {
    // If timezone parsing fails, default to not quiet (send the email)
    console.warn(
      `[NotificationSender] Quiet hours check failed for timezone ${timezone}:`,
      error instanceof Error ? error.message : error
    )
    return false
  }
}

/**
 * Render the appropriate email content based on notification type and provided data.
 * Falls back to a generic notification email if no specific template data is available.
 */
function renderEmailContent(
  type: NotificationType,
  userName: string,
  emailData: NotificationParams['emailData'],
  fallbackTitle: string,
  fallbackMessage: string
): { subject: string; html: string; text: string } | null {
  // Use specific templates if rich data is provided
  if (emailData?.grants && emailData.grants.length > 0 && type === 'new_match') {
    return renderGrantAlertEmail(emailData.grants, userName)
  }

  if (emailData?.deadlines && emailData.deadlines.length > 0 && type === 'deadline_reminder') {
    return renderDeadlineReminderEmail(emailData.deadlines, userName)
  }

  if (emailData?.weeklyDigest) {
    return renderWeeklyDigestEmail(emailData.weeklyDigest, userName)
  }

  // Fall back to a generic notification email
  return renderGenericNotificationEmail(fallbackTitle, fallbackMessage, userName)
}

/**
 * Render a simple generic notification email for types without rich template data
 */
function renderGenericNotificationEmail(
  title: string,
  message: string,
  userName: string
): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://grantsbyai.com'

  const subject = title

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0e27;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0a0e27;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#40ffaa;letter-spacing:0.5px;">Grants By AI</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111638;border-radius:12px;padding:32px;border:1px solid #1a2040;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f0f0f0;">Hi ${escapeHtml(userName)},</h2>
              <h3 style="margin:0 0 12px;font-size:17px;font-weight:600;color:#f0f0f0;">${escapeHtml(title)}</h3>
              <p style="margin:0 0 24px;font-size:15px;color:#a0a0b0;line-height:1.6;">${escapeHtml(message)}</p>
              <p style="margin:0;text-align:center;">
                <a href="${appUrl}/app" style="display:inline-block;background-color:#40ffaa;color:#0a0e27;font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">Open Dashboard</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b6b80;">
                <a href="${appUrl}/app/settings" style="color:#2db87a;text-decoration:underline;">Manage preferences</a>
                &middot;
                <a href="{{unsubscribe_url}}" style="color:#2db87a;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `Hi ${userName},

${title}

${message}

Open dashboard: ${appUrl}/app

---
Manage preferences: ${appUrl}/app/settings
Unsubscribe: {{unsubscribe_url}}`

  return { subject, html, text }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
