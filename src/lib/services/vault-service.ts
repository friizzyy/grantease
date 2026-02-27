/**
 * USER DATA VAULT SERVICE
 * -----------------------
 * Service for managing user vault data - the reusable information
 * that powers grant applications.
 */

import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'
import type { UserVault as PrismaUserVault } from '@prisma/client'
import type {
  ParsedUserVault,
  VaultDocument,
  VaultTextBlock,
  VaultBudgetItem,
  VaultCompleteness,
  KeyPerson,
  BoardMember,
  CertificationType,
  DocumentType,
  TextBlockCategory,
  BudgetCategory,
} from '@/lib/types/vault'

// ============= VAULT CRUD =============

/**
 * Get or create a user's vault
 */
export async function getOrCreateVault(userId: string): Promise<ParsedUserVault> {
  let vault = await prisma.userVault.findUnique({
    where: { userId },
  })

  if (!vault) {
    vault = await prisma.userVault.create({
      data: {
        userId,
        country: 'US',
        samRegistered: false,
        stateCharityReg: false,
        certifications: '[]',
        keyPersonnel: '[]',
        boardMembers: '[]',
      },
    })
  }

  return parseVault(vault)
}

/**
 * Get vault with all related data
 */
export async function getVaultWithData(userId: string): Promise<{
  vault: ParsedUserVault
  documents: VaultDocument[]
  textBlocks: VaultTextBlock[]
  budgetItems: VaultBudgetItem[]
}> {
  const vault = await getOrCreateVault(userId)

  const [documents, textBlocks, budgetItems] = await Promise.all([
    prisma.vaultDocument.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vaultTextBlock.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vaultBudgetItem.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    vault,
    documents: documents as VaultDocument[],
    textBlocks: textBlocks as VaultTextBlock[],
    budgetItems: budgetItems as VaultBudgetItem[],
  }
}

/**
 * Update vault data
 */
export async function updateVault(
  userId: string,
  data: Partial<Omit<ParsedUserVault, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ParsedUserVault> {
  const vault = await getOrCreateVault(userId)

  // Convert parsed fields back to JSON strings
  const updateData: Record<string, unknown> = { ...data }

  if (data.certifications) {
    updateData.certifications = JSON.stringify(data.certifications)
  }
  if (data.keyPersonnel) {
    updateData.keyPersonnel = JSON.stringify(data.keyPersonnel)
  }
  if (data.boardMembers) {
    updateData.boardMembers = JSON.stringify(data.boardMembers)
  }
  if (data.populationsServed) {
    updateData.populationsServed = JSON.stringify(data.populationsServed)
  }

  const updated = await prisma.userVault.update({
    where: { id: vault.id },
    data: updateData,
  })

  return parseVault(updated)
}

// ============= DOCUMENT MANAGEMENT =============

/**
 * Add a document to the vault
 */
export async function addVaultDocument(
  vaultId: string,
  document: {
    name: string
    type: DocumentType
    description?: string
    fileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
    documentDate?: Date
    expiresAt?: Date
  }
): Promise<VaultDocument> {
  const doc = await prisma.vaultDocument.create({
    data: {
      vaultId,
      ...document,
      isPublic: false,
      usageCount: 0,
    },
  })

  return doc as VaultDocument
}

/**
 * Update a vault document
 */
export async function updateVaultDocument(
  documentId: string,
  data: Partial<{
    name: string
    description: string
    documentDate: Date
    expiresAt: Date
    isPublic: boolean
  }>
): Promise<VaultDocument> {
  const doc = await prisma.vaultDocument.update({
    where: { id: documentId },
    data,
  })

  return doc as VaultDocument
}

/**
 * Delete a vault document
 */
export async function deleteVaultDocument(documentId: string): Promise<void> {
  await prisma.vaultDocument.delete({
    where: { id: documentId },
  })
}

/**
 * Track document usage
 */
export async function trackDocumentUsage(documentId: string): Promise<void> {
  await prisma.vaultDocument.update({
    where: { id: documentId },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  })
}

// ============= TEXT BLOCK MANAGEMENT =============

/**
 * Add a text block to the vault
 */
export async function addVaultTextBlock(
  vaultId: string,
  block: {
    title: string
    category: TextBlockCategory
    content: string
    shortVersion?: string
    longVersion?: string
    aiGenerated?: boolean
  }
): Promise<VaultTextBlock> {
  const wordCount = block.content.split(/\s+/).filter(Boolean).length

  const textBlock = await prisma.vaultTextBlock.create({
    data: {
      vaultId,
      ...block,
      wordCount,
      aiGenerated: block.aiGenerated || false,
      aiImproved: false,
      usageCount: 0,
    },
  })

  return textBlock as VaultTextBlock
}

/**
 * Update a text block
 */
export async function updateVaultTextBlock(
  blockId: string,
  data: Partial<{
    title: string
    category: TextBlockCategory
    content: string
    shortVersion: string
    longVersion: string
    aiImproved: boolean
  }>
): Promise<VaultTextBlock> {
  const updateData: Record<string, unknown> = { ...data }

  if (data.content) {
    updateData.wordCount = data.content.split(/\s+/).filter(Boolean).length
  }

  if (data.aiImproved) {
    updateData.lastAiEdit = new Date()
  }

  const block = await prisma.vaultTextBlock.update({
    where: { id: blockId },
    data: updateData,
  })

  return block as VaultTextBlock
}

/**
 * Delete a text block
 */
export async function deleteVaultTextBlock(blockId: string): Promise<void> {
  await prisma.vaultTextBlock.delete({
    where: { id: blockId },
  })
}

/**
 * Track text block usage
 */
export async function trackTextBlockUsage(blockId: string): Promise<void> {
  await prisma.vaultTextBlock.update({
    where: { id: blockId },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  })
}

// ============= BUDGET ITEM MANAGEMENT =============

/**
 * Add a budget item to the vault
 */
export async function addVaultBudgetItem(
  vaultId: string,
  item: {
    category: BudgetCategory
    itemName: string
    description?: string
    unitCost?: number
    quantity?: number
    totalCost: number
    salaryRate?: number
    ftePercent?: number
    fringeBenefits?: number
    justification?: string
  }
): Promise<VaultBudgetItem> {
  const budgetItem = await prisma.vaultBudgetItem.create({
    data: {
      vaultId,
      ...item,
      usageCount: 0,
    },
  })

  return budgetItem as VaultBudgetItem
}

/**
 * Update a budget item
 */
export async function updateVaultBudgetItem(
  itemId: string,
  data: Partial<{
    category: BudgetCategory
    itemName: string
    description: string
    unitCost: number
    quantity: number
    totalCost: number
    salaryRate: number
    ftePercent: number
    fringeBenefits: number
    justification: string
  }>
): Promise<VaultBudgetItem> {
  const item = await prisma.vaultBudgetItem.update({
    where: { id: itemId },
    data,
  })

  return item as VaultBudgetItem
}

/**
 * Delete a budget item
 */
export async function deleteVaultBudgetItem(itemId: string): Promise<void> {
  await prisma.vaultBudgetItem.delete({
    where: { id: itemId },
  })
}

// ============= VAULT COMPLETENESS =============

/**
 * Calculate how complete the vault is
 */
export async function calculateVaultCompleteness(userId: string): Promise<VaultCompleteness> {
  const { vault, documents, textBlocks } = await getVaultWithData(userId)

  // Calculate section completeness
  const sections = {
    organization: calculateOrgCompleteness(vault),
    contact: calculateContactCompleteness(vault),
    address: calculateAddressCompleteness(vault),
    details: calculateDetailsCompleteness(vault),
    registrations: calculateRegistrationsCompleteness(vault),
    personnel: vault.keyPersonnel.length > 0 ? 100 : 0,
    documents: Math.min(100, (documents.length / 5) * 100), // 5 docs = 100%
    textBlocks: Math.min(100, (textBlocks.length / 3) * 100), // 3 blocks = 100%
  }

  // Calculate overall (weighted average)
  const weights = {
    organization: 0.2,
    contact: 0.15,
    address: 0.1,
    details: 0.15,
    registrations: 0.1,
    personnel: 0.1,
    documents: 0.1,
    textBlocks: 0.1,
  }

  const overall = Object.entries(sections).reduce((sum, [key, value]) => {
    return sum + value * weights[key as keyof typeof weights]
  }, 0)

  // Find critical missing items
  const missingCritical: string[] = []
  if (!vault.organizationName) missingCritical.push('Organization name')
  if (!vault.primaryContactEmail) missingCritical.push('Contact email')
  if (!vault.ein && vault.nonprofitStatus) missingCritical.push('EIN/Tax ID')
  if (!vault.missionStatement) missingCritical.push('Mission statement')

  // Generate recommendations
  const recommendations: string[] = []
  if (documents.length === 0) {
    recommendations.push('Upload your IRS determination letter or W-9')
  }
  if (textBlocks.length === 0) {
    recommendations.push('Add your mission statement to reuse across applications')
  }
  if (!vault.ueiNumber) {
    recommendations.push('Register for a UEI number on SAM.gov for federal grants')
  }
  if (vault.keyPersonnel.length === 0) {
    recommendations.push('Add key personnel to speed up applications')
  }

  return {
    overall: Math.round(overall),
    sections,
    missingCritical,
    recommendations,
  }
}

// ============= HELPER FUNCTIONS =============

function parseVault(vault: PrismaUserVault): ParsedUserVault {
  return {
    ...vault,
    certifications: safeJsonParse<CertificationType[]>(vault.certifications || '[]', []),
    keyPersonnel: safeJsonParse<KeyPerson[]>(vault.keyPersonnel || '[]', []),
    boardMembers: safeJsonParse<BoardMember[]>(vault.boardMembers || '[]', []),
    populationsServed: safeJsonParse<string[]>(vault.populationsServed || '[]', []),
  } as ParsedUserVault
}

function calculateOrgCompleteness(vault: ParsedUserVault): number {
  const fields = [
    vault.organizationName,
    vault.ein || vault.organizationLegalName,
    vault.yearFounded,
    vault.websiteUrl,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function calculateContactCompleteness(vault: ParsedUserVault): number {
  const fields = [
    vault.primaryContactName,
    vault.primaryContactEmail,
    vault.primaryContactPhone,
    vault.primaryContactTitle,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function calculateAddressCompleteness(vault: ParsedUserVault): number {
  const fields = [
    vault.streetAddress,
    vault.city,
    vault.state,
    vault.zipCode,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function calculateDetailsCompleteness(vault: ParsedUserVault): number {
  const fields = [
    vault.missionStatement,
    vault.organizationHistory,
    vault.serviceArea,
    vault.annualOperatingBudget,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function calculateRegistrationsCompleteness(vault: ParsedUserVault): number {
  let score = 0
  if (vault.samRegistered) score += 50
  if (vault.nonprofitStatus || vault.stateCharityReg) score += 30
  if (vault.ueiNumber || vault.dunsNumber) score += 20
  return score
}

// ============= AUTO-POPULATE FROM PROFILE =============

/**
 * Initialize vault from user profile data
 */
export async function initializeVaultFromProfile(userId: string): Promise<ParsedUserVault> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    return getOrCreateVault(userId)
  }

  const vault = await getOrCreateVault(userId)

  // Parse profile attributes
  const attributes = safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {})

  // Extract any company info from AI analysis
  const updateData: Record<string, unknown> = {}

  if (attributes.companyName) {
    updateData.organizationName = attributes.companyName
  }
  if (attributes.companyWebsite) {
    updateData.websiteUrl = attributes.companyWebsite
  }
  if (attributes.missionStatement) {
    updateData.missionStatement = attributes.missionStatement
  }

  // Set nonprofit status based on entity type
  if (profile.entityType === 'nonprofit') {
    updateData.nonprofitStatus = '501c3'
  }

  // Set state from profile
  if (profile.state) {
    updateData.state = profile.state
  }

  if (Object.keys(updateData).length > 0) {
    const updated = await prisma.userVault.update({
      where: { id: vault.id },
      data: updateData,
    })
    return parseVault(updated)
  }

  return vault
}
