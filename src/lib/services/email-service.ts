/**
 * EMAIL SERVICE
 * -------------
 * Provider-agnostic email service supporting Resend (primary) and SMTP relay (fallback).
 * Uses fetch() for all HTTP calls - no additional packages required.
 *
 * Environment variables:
 *   RESEND_API_KEY - Resend API key (primary provider)
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - SMTP fallback
 *   EMAIL_FROM - Default sender address (default: "Grants By AI <notifications@grantsbyai.com>")
 */

// ============= TYPES =============

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface GrantAlertGrant {
  title: string
  sponsor: string
  deadline?: string
  matchScore?: number
  url: string
}

interface DeadlineGrant {
  title: string
  sponsor: string
  deadline: string
  daysLeft: number
  workspaceUrl?: string
}

interface WeeklyDigestData {
  userName: string
  newMatches: number
  upcomingDeadlines: Array<{ title: string; deadline: string; daysLeft: number }>
  applicationUpdates: Array<{ title: string; status: string }>
  aiInsight: string
}

// ============= CONFIGURATION =============

const DEFAULT_FROM = 'Grants By AI <notifications@grantsbyai.com>'
const RESEND_API_URL = 'https://api.resend.com/emails'
const UNSUBSCRIBE_URL_PLACEHOLDER = '{{unsubscribe_url}}'
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://grantsbyai.com'

// ============= BRAND COLORS =============

const COLORS = {
  bgDark: '#0a0e27',
  bgCard: '#111638',
  bgCardAlt: '#0d1130',
  accent: '#40ffaa',
  accentDim: '#2db87a',
  text: '#f0f0f0',
  textMuted: '#a0a0b0',
  textDim: '#6b6b80',
  border: '#1a2040',
  urgentRed: '#ff6b6b',
  warningYellow: '#ffd93d',
} as const

// ============= PUBLIC API =============

/**
 * Check if at least one email provider is configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST)
}

/**
 * Send an email using the configured provider.
 * Tries Resend first, then falls back to SMTP relay.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const from = options.from || process.env.EMAIL_FROM || DEFAULT_FROM

  if (!isEmailConfigured()) {
    console.warn('[Email] No email provider configured. Set RESEND_API_KEY or SMTP_HOST.')
    return { success: false, error: 'No email provider configured' }
  }

  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    const result = await sendViaResend({ ...options, from })
    if (result.success) return result

    console.warn('[Email] Resend failed, attempting SMTP fallback:', result.error)
  }

  // Fallback to SMTP relay
  if (process.env.SMTP_HOST) {
    return sendViaSmtpRelay({ ...options, from })
  }

  return { success: false, error: 'All email providers failed' }
}

// ============= PROVIDER IMPLEMENTATIONS =============

/**
 * Send email via Resend API (POST https://api.resend.com/emails)
 */
async function sendViaResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[Email:Resend] API error:', response.status, errorBody)
      return {
        success: false,
        error: `Resend API error: ${response.status} - ${errorBody}`,
      }
    }

    const data = (await response.json()) as { id?: string }
    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email:Resend] Send failed:', message)
    return { success: false, error: `Resend send failed: ${message}` }
  }
}

/**
 * Send email via a simple SMTP relay HTTP endpoint.
 * This supports SMTP-to-HTTP bridges (e.g., smtp2go, Mailgun HTTP API, custom relay).
 *
 * Expects SMTP_HOST to be an HTTP endpoint that accepts POST with JSON body:
 *   { from, to, subject, html, text }
 *
 * Environment variables:
 *   SMTP_HOST - HTTP endpoint URL
 *   SMTP_PORT - Optional (used in endpoint construction if needed)
 *   SMTP_USER - Auth username (sent as Basic auth)
 *   SMTP_PASS - Auth password
 */
async function sendViaSmtpRelay(options: EmailOptions): Promise<EmailResult> {
  const host = process.env.SMTP_HOST
  if (!host) {
    return { success: false, error: 'SMTP_HOST not configured' }
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add Basic auth if credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const credentials = Buffer.from(
        `${process.env.SMTP_USER}:${process.env.SMTP_PASS}`
      ).toString('base64')
      headers['Authorization'] = `Basic ${credentials}`
    }

    const response = await fetch(host, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[Email:SMTP] Relay error:', response.status, errorBody)
      return {
        success: false,
        error: `SMTP relay error: ${response.status} - ${errorBody}`,
      }
    }

    const data = (await response.json()) as { id?: string; messageId?: string }
    return {
      success: true,
      messageId: data.id || data.messageId,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email:SMTP] Send failed:', message)
    return { success: false, error: `SMTP relay failed: ${message}` }
  }
}

// ============= EMAIL TEMPLATES =============

/**
 * Shared email layout wrapper with GrantEase branding
 */
function emailLayout(title: string, preheader: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgDark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <!-- Preheader text (hidden but shown in inbox preview) -->
  <div style="display:none;font-size:1px;color:${COLORS.bgDark};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLORS.bgDark};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:${COLORS.accent};letter-spacing:0.5px;">
                Grants By AI
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${COLORS.bgCard};border-radius:12px;padding:32px;border:1px solid ${COLORS.border};">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${COLORS.textDim};">
                You received this email because of your notification preferences on Grants By AI.
              </p>
              <p style="margin:0;font-size:12px;color:${COLORS.textDim};">
                <a href="${APP_URL}/app/settings" style="color:${COLORS.accentDim};text-decoration:underline;">Manage preferences</a>
                &nbsp;&middot;&nbsp;
                <a href="${UNSUBSCRIBE_URL_PLACEHOLDER}" style="color:${COLORS.accentDim};text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Render grant alert email for new matching grants
 */
export function renderGrantAlertEmail(
  grants: GrantAlertGrant[],
  userName: string
): { subject: string; html: string; text: string } {
  const count = grants.length
  const subject = `${count} new grant${count === 1 ? '' : 's'} matching your profile`

  const grantRows = grants
    .map((grant) => {
      const scoreHtml = grant.matchScore
        ? `<span style="display:inline-block;background-color:${COLORS.accent};color:${COLORS.bgDark};font-size:12px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:8px;">${grant.matchScore}% match</span>`
        : ''

      const deadlineHtml = grant.deadline
        ? `<p style="margin:4px 0 0;font-size:13px;color:${COLORS.textMuted};">Deadline: ${escapeHtml(grant.deadline)}</p>`
        : ''

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid ${COLORS.border};">
            <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:${COLORS.text};">
              <a href="${escapeHtml(grant.url)}" style="color:${COLORS.text};text-decoration:none;">${escapeHtml(grant.title)}</a>
              ${scoreHtml}
            </p>
            <p style="margin:0;font-size:14px;color:${COLORS.textMuted};">${escapeHtml(grant.sponsor)}</p>
            ${deadlineHtml}
            <p style="margin:8px 0 0;">
              <a href="${escapeHtml(grant.url)}" style="color:${COLORS.accent};font-size:13px;font-weight:500;text-decoration:none;">View details &rarr;</a>
            </p>
          </td>
        </tr>`
    })
    .join('')

  const bodyContent = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${COLORS.text};">
      Hi ${escapeHtml(userName)},
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.5;">
      We found ${count} new grant${count === 1 ? '' : 's'} that match${count === 1 ? 'es' : ''} your profile. Here${count === 1 ? "'s what we found" : ' are the top matches'}:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${grantRows}
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${APP_URL}/app/discover" style="display:inline-block;background-color:${COLORS.accent};color:${COLORS.bgDark};font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Explore All Grants
      </a>
    </p>`

  const html = emailLayout(subject, `${count} new grants match your profile on Grants By AI`, bodyContent)

  // Plain text version
  const textGrants = grants
    .map((g) => {
      const score = g.matchScore ? ` (${g.matchScore}% match)` : ''
      const deadline = g.deadline ? `\n  Deadline: ${g.deadline}` : ''
      return `- ${g.title}${score}\n  Sponsor: ${g.sponsor}${deadline}\n  ${g.url}`
    })
    .join('\n\n')

  const text = `Hi ${userName},

We found ${count} new grant${count === 1 ? '' : 's'} matching your profile:

${textGrants}

Explore all grants: ${APP_URL}/app/discover

---
Manage preferences: ${APP_URL}/app/settings
Unsubscribe: ${UNSUBSCRIBE_URL_PLACEHOLDER}`

  return { subject, html, text }
}

/**
 * Render deadline reminder email for upcoming grant deadlines
 */
export function renderDeadlineReminderEmail(
  grants: DeadlineGrant[],
  userName: string
): { subject: string; html: string; text: string } {
  const urgentCount = grants.filter((g) => g.daysLeft <= 3).length
  const subject =
    urgentCount > 0
      ? `Urgent: ${urgentCount} grant deadline${urgentCount === 1 ? '' : 's'} in ${grants[0].daysLeft} day${grants[0].daysLeft === 1 ? '' : 's'}`
      : `${grants.length} grant deadline${grants.length === 1 ? '' : 's'} approaching`

  const grantRows = grants
    .map((grant) => {
      const isUrgent = grant.daysLeft <= 3
      const urgencyColor = isUrgent ? COLORS.urgentRed : grant.daysLeft <= 7 ? COLORS.warningYellow : COLORS.accent
      const daysLabel = grant.daysLeft === 0 ? 'Today' : grant.daysLeft === 1 ? 'Tomorrow' : `${grant.daysLeft} days left`

      const workspaceLink = grant.workspaceUrl
        ? `<a href="${escapeHtml(grant.workspaceUrl)}" style="color:${COLORS.accent};font-size:13px;font-weight:500;text-decoration:none;margin-left:12px;">Open workspace &rarr;</a>`
        : ''

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid ${COLORS.border};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:${COLORS.text};">
                    ${escapeHtml(grant.title)}
                  </p>
                  <p style="margin:0;font-size:14px;color:${COLORS.textMuted};">${escapeHtml(grant.sponsor)}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:${COLORS.textMuted};">
                    Deadline: ${escapeHtml(grant.deadline)}
                  </p>
                </td>
                <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:16px;">
                  <span style="display:inline-block;background-color:${urgencyColor};color:${COLORS.bgDark};font-size:12px;font-weight:700;padding:4px 10px;border-radius:10px;">
                    ${daysLabel}
                  </span>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;">
              ${workspaceLink}
            </p>
          </td>
        </tr>`
    })
    .join('')

  const bodyContent = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${COLORS.text};">
      Hi ${escapeHtml(userName)},
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.5;">
      ${urgentCount > 0 ? `You have <strong style="color:${COLORS.urgentRed};">${urgentCount} urgent</strong> deadline${urgentCount === 1 ? '' : 's'} coming up. Don't miss out!` : `You have ${grants.length} upcoming grant deadline${grants.length === 1 ? '' : 's'} to keep track of.`}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${grantRows}
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${APP_URL}/app/workspace" style="display:inline-block;background-color:${COLORS.accent};color:${COLORS.bgDark};font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
        View All Workspaces
      </a>
    </p>`

  const html = emailLayout(subject, `Grant deadlines approaching - ${grants.length} need attention`, bodyContent)

  const textGrants = grants
    .map((g) => {
      const daysLabel = g.daysLeft === 0 ? 'TODAY' : g.daysLeft === 1 ? 'TOMORROW' : `${g.daysLeft} days left`
      return `- ${g.title} [${daysLabel}]\n  Sponsor: ${g.sponsor}\n  Deadline: ${g.deadline}`
    })
    .join('\n\n')

  const text = `Hi ${userName},

${urgentCount > 0 ? `URGENT: You have ${urgentCount} deadline${urgentCount === 1 ? '' : 's'} in the next 3 days!` : `You have ${grants.length} upcoming deadline${grants.length === 1 ? '' : 's'}.`}

${textGrants}

View workspaces: ${APP_URL}/app/workspace

---
Manage preferences: ${APP_URL}/app/settings
Unsubscribe: ${UNSUBSCRIBE_URL_PLACEHOLDER}`

  return { subject, html, text }
}

/**
 * Render weekly digest email with aggregated activity summary
 */
export function renderWeeklyDigestEmail(
  data: WeeklyDigestData,
  userName: string
): { subject: string; html: string; text: string } {
  const subject = `Your weekly grant digest - ${data.newMatches} new match${data.newMatches === 1 ? '' : 'es'}`

  // Stats row
  const statsHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${COLORS.bgCardAlt};border-radius:8px;padding:16px;text-align:center;width:50%;border:1px solid ${COLORS.border};">
          <p style="margin:0;font-size:28px;font-weight:700;color:${COLORS.accent};">${data.newMatches}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:0.5px;">New Matches</p>
        </td>
        <td style="width:12px;"></td>
        <td style="background-color:${COLORS.bgCardAlt};border-radius:8px;padding:16px;text-align:center;width:50%;border:1px solid ${COLORS.border};">
          <p style="margin:0;font-size:28px;font-weight:700;color:${COLORS.accent};">${data.upcomingDeadlines.length}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Upcoming Deadlines</p>
        </td>
      </tr>
    </table>`

  // Upcoming deadlines section
  let deadlinesHtml = ''
  if (data.upcomingDeadlines.length > 0) {
    const deadlineRows = data.upcomingDeadlines
      .slice(0, 5)
      .map((d) => {
        const isUrgent = d.daysLeft <= 3
        const urgencyColor = isUrgent ? COLORS.urgentRed : d.daysLeft <= 7 ? COLORS.warningYellow : COLORS.textMuted
        const daysLabel = d.daysLeft === 0 ? 'Today' : d.daysLeft === 1 ? 'Tomorrow' : `${d.daysLeft}d`
        return `
          <tr>
            <td style="padding:8px 0;font-size:14px;color:${COLORS.text};">${escapeHtml(d.title)}</td>
            <td style="padding:8px 0;font-size:13px;color:${COLORS.textMuted};text-align:right;">${escapeHtml(d.deadline)}</td>
            <td style="padding:8px 0;text-align:right;padding-left:8px;">
              <span style="font-size:12px;font-weight:600;color:${urgencyColor};">${daysLabel}</span>
            </td>
          </tr>`
      })
      .join('')

    deadlinesHtml = `
      <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:${COLORS.text};">Upcoming Deadlines</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
        ${deadlineRows}
      </table>`
  }

  // Application updates section
  let updatesHtml = ''
  if (data.applicationUpdates.length > 0) {
    const updateRows = data.applicationUpdates
      .slice(0, 5)
      .map((u) => {
        const statusColor = u.status === 'awarded' ? COLORS.accent : u.status === 'rejected' ? COLORS.urgentRed : COLORS.textMuted
        return `
          <tr>
            <td style="padding:6px 0;font-size:14px;color:${COLORS.text};">${escapeHtml(u.title)}</td>
            <td style="padding:6px 0;text-align:right;">
              <span style="font-size:12px;font-weight:600;color:${statusColor};text-transform:capitalize;">${escapeHtml(u.status)}</span>
            </td>
          </tr>`
      })
      .join('')

    updatesHtml = `
      <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:${COLORS.text};">Application Updates</h3>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
        ${updateRows}
      </table>`
  }

  // AI insight section
  const insightHtml = data.aiInsight
    ? `
      <div style="background-color:${COLORS.bgCardAlt};border-left:3px solid ${COLORS.accent};border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:${COLORS.accent};text-transform:uppercase;letter-spacing:0.5px;">AI Insight</p>
        <p style="margin:0;font-size:14px;color:${COLORS.text};line-height:1.5;">${escapeHtml(data.aiInsight)}</p>
      </div>`
    : ''

  const bodyContent = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${COLORS.text};">
      Hi ${escapeHtml(userName)},
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.5;">
      Here is your weekly grant activity summary.
    </p>
    ${statsHtml}
    ${insightHtml}
    ${deadlinesHtml}
    ${updatesHtml}
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/app" style="display:inline-block;background-color:${COLORS.accent};color:${COLORS.bgDark};font-size:15px;font-weight:600;padding:12px 32px;border-radius:8px;text-decoration:none;">
        Open Dashboard
      </a>
    </p>`

  const html = emailLayout(subject, `Weekly digest: ${data.newMatches} new matches, ${data.upcomingDeadlines.length} deadlines`, bodyContent)

  // Plain text version
  const textDeadlines =
    data.upcomingDeadlines.length > 0
      ? `\nUpcoming Deadlines:\n${data.upcomingDeadlines
          .map((d) => {
            const daysLabel = d.daysLeft === 0 ? 'TODAY' : d.daysLeft === 1 ? 'TOMORROW' : `${d.daysLeft} days`
            return `  - ${d.title} (${d.deadline}) [${daysLabel}]`
          })
          .join('\n')}\n`
      : ''

  const textUpdates =
    data.applicationUpdates.length > 0
      ? `\nApplication Updates:\n${data.applicationUpdates.map((u) => `  - ${u.title}: ${u.status}`).join('\n')}\n`
      : ''

  const textInsight = data.aiInsight ? `\nAI Insight: ${data.aiInsight}\n` : ''

  const text = `Hi ${userName},

Here is your weekly grant activity summary.

New Matches: ${data.newMatches}
Upcoming Deadlines: ${data.upcomingDeadlines.length}
${textDeadlines}${textUpdates}${textInsight}
Open dashboard: ${APP_URL}/app

---
Manage preferences: ${APP_URL}/app/settings
Unsubscribe: ${UNSUBSCRIBE_URL_PLACEHOLDER}`

  return { subject, html, text }
}

// ============= UTILITIES =============

/**
 * Escape HTML special characters to prevent XSS in email content
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
