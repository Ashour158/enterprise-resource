// Enhanced Account Management with Fixed Database Schema
// TypeScript types for the enhanced account system

export interface EnhancedAccount {
  id: string
  customerId?: string
  companyId: string
  
  // Basic Information
  accountNumber: string
  companyName: string
  industry?: string
  companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
  annualRevenue?: number
  numberOfEmployees?: number
  websiteUrl?: string
  
  // Classification
  accountType: 'prospect' | 'customer' | 'partner' | 'vendor'
  accountStatus: 'active' | 'inactive' | 'suspended' | 'closed'
  priorityLevel: 'high' | 'medium' | 'low'
  territory?: string
  accountManagerId?: string
  
  // Contact Information
  primaryAddress?: Address
  billingAddress?: Address
  shippingAddress?: Address
  phone?: string
  fax?: string
  
  // Historical Tracking
  totalEmailCount: number
  totalMeetingCount: number
  totalCallCount: number
  totalQuoteCount: number
  totalDealCount: number
  totalSupportTickets: number
  totalDocumentsShared: number
  totalInvoices: number
  totalPayments: number
  
  // Engagement Metrics
  lastEmailDate?: Date
  lastMeetingDate?: Date
  lastCallDate?: Date
  lastQuoteDate?: Date
  lastDealDate?: Date
  lastSupportTicketDate?: Date
  lastLoginDate?: Date
  lastInteractionDate?: Date
  
  // Financial Information
  totalRevenue: number
  lifetimeValue: number
  averageDealSize: number
  paymentTerms: string
  creditLimit?: number
  creditRating?: string
  
  // AI Intelligence
  aiHealthScore: number // 0-100
  aiEngagementTrend: 'increasing' | 'stable' | 'decreasing' | 'critical'
  aiSatisfactionTrend: 'improving' | 'stable' | 'declining'
  aiExpansionReadiness: number // 0-100
  aiRetentionProbability: number // 0-1
  aiAdvocacyPotential: number // 0-100
  aiChurnRiskScore: number // 0-1
  aiNextBestAction?: string
  aiInsights: AIInsight[]
  
  // Portal Integration
  portalAccessEnabled: boolean
  portalLastLogin?: Date
  portalLoginCount: number
  portalFeaturesEnabled: string[]
  
  // Social Media
  socialMentionsCount: number
  socialSentimentScore: number // -1 to 1
  lastSocialMention?: Date
  socialProfiles: Record<string, string>
  
  // Metadata
  customFields: Record<string, any>
  tags: string[]
  notes?: string
  metadata: Record<string, any>
  
  // System Fields
  isDeleted: boolean
  deletedAt?: Date
  deletedBy?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'recommendation' | 'prediction'
  title: string
  description: string
  confidence: number // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical'
  actionRequired: boolean
  dueDate?: Date
  createdAt: Date
}

export interface CustomerTimelineEntry {
  id: string
  accountId: string
  companyId: string
  
  // Entry Details
  timelineType: 'email' | 'call' | 'meeting' | 'quote' | 'deal' | 'support' | 'payment' | 'document' | 'social' | 'website'
  timelineSubtype?: string
  
  // Content
  title: string
  description?: string
  summary?: string
  content: Record<string, any>
  
  // Related Records
  relatedContactId?: string
  relatedDealId?: string
  relatedQuoteId?: string
  relatedSupportTicketId?: string
  relatedDocumentId?: string
  relatedUserId?: string
  
  // External System
  externalSystem?: string
  externalId?: string
  externalUrl?: string
  
  // Metadata
  timelineDate: Date
  durationMinutes: number
  participants: TimelineParticipant[]
  attachments: TimelineAttachment[]
  tags: string[]
  
  // AI Analysis
  aiImportanceScore: number // 0-100
  aiSentimentScore: number // -1 to 1
  aiImpactOnRelationship: number
  aiExtractedInsights: string[]
  aiKeywords: string[]
  
  // Visibility
  isPublic: boolean
  visibleToRoles: string[]
  createdBy?: string
  
  // Features
  isPinned: boolean
  viewCount: number
  lastViewed?: Date
  
  // System
  createdAt: Date
  updatedAt: Date
}

export interface TimelineParticipant {
  id: string
  name: string
  email?: string
  role?: string
  type: 'internal' | 'external'
}

export interface TimelineAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface AccountEcosystemRelation {
  id: string
  primaryAccountId: string
  companyId: string
  
  // Relationship
  relatedEntityType: 'account' | 'contact' | 'vendor' | 'partner' | 'competitor'
  relatedEntityId: string
  relationshipNature: 'parent' | 'subsidiary' | 'partner' | 'vendor' | 'customer' | 'competitor'
  relationshipDescription?: string
  
  // Strength & Influence
  relationshipStrength: number // 0-100
  influenceLevel: number // 0-100
  collaborationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rarely'
  
  // Business Impact
  revenueImpact: number
  strategicImportance: 'critical' | 'high' | 'medium' | 'low'
  
  // AI Analysis
  aiRelationshipHealth: number // 0-100
  aiGrowthPotential: number // 0-100
  aiRiskFactors: string[]
  aiOpportunities: string[]
  
  // Tracking
  relationshipStartDate: Date
  lastInteractionDate?: Date
  interactionFrequencyScore: number
  
  // Status
  isActive: boolean
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerSuccessMetrics {
  id: string
  accountId: string
  companyId: string
  measurementDate: Date
  measurementPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  
  // Usage & Adoption
  productUsageScore: number // 0-100
  featureAdoptionRate: number // 0-1
  userActivityScore: number // 0-100
  loginFrequencyScore: number // 0-100
  
  // Satisfaction
  npsScore?: number // -100 to 100
  csatScore?: number // 0-100
  cesScore?: number // 0-100
  
  // Support
  supportTicketVolume: number
  averageResolutionTimeHours: number
  escalationRate: number // 0-1
  firstContactResolutionRate: number // 0-1
  
  // Financial Health
  paymentTimelinessScore: number // 0-100
  contractUtilizationRate: number // 0-1
  expansionRevenue: number
  
  // Engagement
  emailEngagementScore: number // 0-100
  meetingAttendanceRate: number // 0-1
  responseTimeScore: number // 0-100
  
  // AI Composite Scores
  aiOverallHealthScore: number // 0-100
  aiChurnRiskScore: number // 0-1
  aiExpansionReadiness: number // 0-100
  aiAdvocacyPotential: number // 0-100
  
  // Benchmarking
  industryBenchmarkComparison: Record<string, any>
  peerComparison: Record<string, any>
  historicalComparison: Record<string, any>
  
  // System
  createdBy?: string
  createdAt: Date
}

export interface CustomerDocument {
  id: string
  accountId: string
  companyId: string
  
  // Document Details
  documentName: string
  documentType: 'contract' | 'proposal' | 'presentation' | 'manual' | 'report' | 'invoice'
  documentCategory: 'sales' | 'legal' | 'technical' | 'financial' | 'marketing'
  documentDescription?: string
  
  // File Information
  fileUrl?: string
  fileType?: string
  fileSize: number
  thumbnailUrl?: string
  checksum?: string
  
  // Versioning
  documentVersion: string
  isLatestVersion: boolean
  parentDocumentId?: string
  
  // Access Control
  isSharedWithCustomer: boolean
  customerAccessLevel: 'none' | 'view' | 'download' | 'comment'
  internalAccessLevel: 'view' | 'edit' | 'admin'
  expirationDate?: Date
  
  // Tracking
  viewCount: number
  downloadCount: number
  lastAccessed?: Date
  lastModified?: Date
  
  // AI Analysis
  aiDocumentSummary?: string
  aiKeyTopics: string[]
  aiSentimentAnalysis: Record<string, any>
  aiImportanceScore: number // 0-100
  aiExtractedEntities: string[]
  
  // Collaboration
  commentsEnabled: boolean
  versionHistory: any[]
  
  // System
  createdBy?: string
  sharedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerPortalActivity {
  id: string
  accountId: string
  companyId: string
  contactId?: string
  
  // Activity
  activityType: 'login' | 'document_view' | 'document_download' | 'support_ticket' | 'payment' | 'profile_update'
  activityDescription?: string
  activityDetails: Record<string, any>
  
  // Session
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  operatingSystem?: string
  
  // Activity Data
  pageVisited?: string
  timeSpentSeconds: number
  actionsTaken: any[]
  referrerUrl?: string
  
  // Location
  country?: string
  region?: string
  city?: string
  timezone?: string
  
  // AI Analysis
  aiEngagementScore: number // 0-100
  aiIntentAnalysis?: string
  aiSatisfactionIndicators: string[]
  aiRiskIndicators: string[]
  
  // System
  activityTimestamp: Date
  createdAt: Date
}

export interface AccountEngagementAlert {
  id: string
  accountId: string
  companyId: string
  
  // Alert Details
  alertType: 'engagement_drop' | 'churn_risk' | 'expansion_opportunity' | 'satisfaction_decline'
  alertSeverity: 'low' | 'medium' | 'high' | 'critical'
  alertTitle: string
  alertDescription?: string
  alertMessage?: string
  
  // Configuration
  triggerConditions: Record<string, any>
  thresholdValues: Record<string, any>
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolvedBy?: string
  resolvedAt?: Date
  resolutionNotes?: string
  
  // Actions
  recommendedActions: string[]
  assignedTo?: string
  dueDate?: Date
  escalationLevel: number
  escalatedAt?: Date
  
  // AI Analysis
  aiUrgencyScore: number // 0-100
  aiImpactPrediction: Record<string, any>
  aiRecommendedResponse?: string
  
  // System
  createdAt: Date
  updatedAt: Date
}

export interface AccountSearchFilters {
  companyId?: string
  accountType?: string[]
  accountStatus?: string[]
  priorityLevel?: string[]
  industry?: string[]
  companySize?: string[]
  territory?: string[]
  accountManagerId?: string
  tags?: string[]
  searchQuery?: string
  dateRange?: {
    start: Date
    end: Date
  }
  aiHealthScoreRange?: {
    min: number
    max: number
  }
  aiChurnRiskRange?: {
    min: number
    max: number
  }
}

export interface AccountMetrics {
  totalAccounts: number
  activeAccounts: number
  newAccountsThisMonth: number
  averageHealthScore: number
  averageChurnRisk: number
  topPerformingAccounts: EnhancedAccount[]
  atRiskAccounts: EnhancedAccount[]
  expansionOpportunities: EnhancedAccount[]
  recentEngagements: CustomerTimelineEntry[]
  alertsSummary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
}