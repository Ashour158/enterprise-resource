// Lead Management Types
export interface Lead {
  id: string
  companyId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  accountId?: string // Reference to Account instead of company string
  accountName?: string // Display name for account
  jobTitle?: string // Renamed from title
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number
  leadScore: number // AI-powered lead score
  priority: 'low' | 'medium' | 'high'
  estimatedValue: number
  assignedTo: string
  tags: string[]
  notes: string
  customFields: Record<string, any>
  activities: LeadActivity[]
  files: CRMFile[]
  createdAt: Date | string
  updatedAt: Date | string
  lastContactDate: Date | string | null
  nextFollowUpDate: Date | string | null
  nextFollowUp?: Date | string | null // Alias for compatibility
  // Lead aging and timeline fields
  leadAge?: number // Days since creation
  lastActivityDate?: Date | string | null
  overdueDays?: number // Days overdue for follow-up
  // Integration with accounts
  company?: string // Deprecated, use accountName instead
  title?: string // Deprecated, use jobTitle instead
}

export interface LeadActivity {
  id: string
  leadId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  subject: string
  description: string
  date: Date
  duration?: number
  outcome?: 'positive' | 'neutral' | 'negative'
  createdBy: string
  createdAt: Date
}

export interface CRMFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: Date
  tags: string[]
}

// Quote Management Types
export interface Quote {
  id: string
  companyId: string
  quoteNumber: string
  accountId?: string
  contactId?: string
  dealId?: string
  title: string
  description?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'cancelled'
  approvalStatus?: 'not_required' | 'pending' | 'approved' | 'rejected' | 'escalated'
  validUntil: Date
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  totalAmount: number
  terms: string
  notes?: string
  lineItems: QuoteLineItem[]
  templateId?: string
  customFields: Record<string, any>
  createdBy: string
  assignedTo?: string
  sentDate?: Date
  viewedDate?: Date
  acceptedDate?: Date
  rejectedDate?: Date
  rejectionReason?: string
  files: CRMFile[]
  activities: QuoteActivity[]
  emailSettings?: QuoteEmailSettings
  numberingConfig?: QuoteNumberingConfig
  customActions?: QuoteCustomAction[]
  approvalWorkflow?: QuoteApprovalWorkflow
  approvals: QuoteApproval[]
  createdAt: Date
  updatedAt: Date
}

// Quote Approval Workflow Types
export interface QuoteApprovalWorkflow {
  id: string
  companyId: string
  name: string
  description?: string
  isActive: boolean
  triggerConditions: ApprovalTriggerCondition[]
  approvalChain: ApprovalLevel[]
  settings: ApprovalWorkflowSettings
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalTriggerCondition {
  id: string
  type: 'amount_threshold' | 'discount_percentage' | 'product_category' | 'customer_type' | 'custom_field' | 'approval_matrix'
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains' | 'in_range'
  value: any
  secondaryValue?: any // For range conditions
  field?: string // For custom field conditions
  priority: number
}

export interface ApprovalLevel {
  id: string
  name: string
  order: number
  approvalType: 'any_user' | 'specific_users' | 'role_based' | 'department' | 'manager_hierarchy' | 'amount_based'
  approvers: ApprovalApprover[]
  requiredApprovals: number // How many approvals needed at this level
  timeoutHours?: number
  escalationRules?: EscalationRule[]
  skipConditions?: SkipCondition[]
  parallelApproval: boolean // Whether approvers can approve simultaneously
  autoApproval?: AutoApprovalRule
}

export interface ApprovalApprover {
  id: string
  type: 'user' | 'role' | 'department' | 'manager'
  userId?: string
  roleId?: string
  departmentId?: string
  managerLevel?: number // 1 = direct manager, 2 = manager's manager, etc.
  maxApprovalAmount?: number
  isBackup: boolean
  order: number
}

export interface EscalationRule {
  id: string
  triggerHours: number
  action: 'notify' | 'escalate' | 'auto_approve' | 'auto_reject'
  escalateTo: ApprovalApprover[]
  notificationTemplate?: string
}

export interface SkipCondition {
  id: string
  type: 'amount_under' | 'user_role' | 'department' | 'customer_tier' | 'product_type'
  value: any
  operator: string
}

export interface AutoApprovalRule {
  id: string
  conditions: ApprovalTriggerCondition[]
  action: 'approve' | 'reject'
  reason: string
}

export interface ApprovalWorkflowSettings {
  allowParallelApproval: boolean
  requireComments: boolean
  allowDelegation: boolean
  notifyCreator: boolean
  notifyAssignee: boolean
  emailTemplates: {
    pending: string
    approved: string
    rejected: string
    escalated: string
  }
  reminders: {
    enabled: boolean
    intervals: number[] // Hours after which to send reminders
    maxReminders: number
  }
  audit: {
    trackViews: boolean
    trackEdits: boolean
    requireSignature: boolean
  }
}

export interface QuoteApproval {
  id: string
  quoteId: string
  workflowId: string
  levelId: string
  approverId: string
  approverName: string
  approverRole: string
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'expired'
  requestedAt: Date
  respondedAt?: Date
  comments?: string
  digitalSignature?: string
  ipAddress?: string
  userAgent?: string
  delegatedTo?: {
    userId: string
    userName: string
    delegatedAt: Date
    reason: string
  }
  remindersSent: number
  viewedAt?: Date[]
  autoApproval?: {
    ruleId: string
    reason: string
    triggeredAt: Date
  }
}

export interface ApprovalMatrix {
  id: string
  companyId: string
  name: string
  description?: string
  dimensions: ApprovalDimension[]
  rules: ApprovalMatrixRule[]
  isDefault: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalDimension {
  id: string
  name: string
  type: 'amount' | 'percentage' | 'category' | 'region' | 'customer_tier'
  ranges: DimensionRange[]
}

export interface DimensionRange {
  id: string
  label: string
  minValue?: number
  maxValue?: number
  stringValues?: string[]
  order: number
}

export interface ApprovalMatrixRule {
  id: string
  name: string
  conditions: {
    dimensionId: string
    rangeId: string
  }[]
  approvers: ApprovalApprover[]
  requiredApprovals: number
  priority: number
}

export interface ApprovalAuditLog {
  id: string
  quoteId: string
  approvalId: string
  action: 'requested' | 'approved' | 'rejected' | 'delegated' | 'escalated' | 'expired' | 'cancelled'
  userId: string
  userName: string
  userRole: string
  timestamp: Date
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  previousStatus?: string
  newStatus?: string
  comments?: string
  digitalSignature?: string
}

export interface ApprovalNotification {
  id: string
  type: 'approval_request' | 'approval_reminder' | 'approval_approved' | 'approval_rejected' | 'approval_escalated'
  recipientId: string
  quoteId: string
  approvalId?: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  metadata: Record<string, any>
}

export interface QuoteTemplate {
  id: string
  companyId: string
  name: string
  description?: string
  type: 'ai_generated' | 'custom_upload' | 'system_default'
  format: 'docx' | 'pdf' | 'html' | 'csv'
  templateData: string // Base64 encoded template content
  variables: QuoteTemplateVariable[]
  isActive: boolean
  isDefault: boolean
  aiPrompt?: string // For AI-generated templates
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface QuoteTemplateVariable {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'image' | 'table'
  required: boolean
  defaultValue?: any
  options?: string[] // For dropdown variables
}

export interface QuoteEmailSettings {
  subject: string
  body: string
  ccEmails: string[]
  bccEmails: string[]
  attachPdf: boolean
  sendReminders: boolean
  reminderDays: number[]
}

export interface QuoteNumberingConfig {
  prefix: string
  suffix: string
  digitCount: number
  startNumber: number
  resetPeriod: 'never' | 'yearly' | 'monthly'
  lastNumber: number
  lastResetDate?: Date
}

export interface QuoteCustomAction {
  id: string
  label: string
  icon: string
  color: string
  position: 'header' | 'row' | 'detail'
  visibility: 'always' | 'status_dependent' | 'role_dependent'
  conditions?: {
    statuses?: string[]
    roles?: string[]
  }
  action: {
    type: 'webhook' | 'email' | 'status_change' | 'export' | 'custom'
    config: Record<string, any>
  }
  isActive: boolean
}

export interface QuoteExportConfig {
  format: 'pdf' | 'docx' | 'excel' | 'csv'
  templateId?: string
  includeAttachments: boolean
  watermark?: string
  password?: string
  emailDelivery?: {
    recipients: string[]
    subject: string
    body: string
  }
}

export interface QuoteLineItem {
  id: string
  productId?: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  discount: number
  discountAmount: number
  lineTotal: number
  order: number
}

export interface QuoteActivity {
  id: string
  quoteId: string
  type: 'created' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'modified' | 'expired'
  description: string
  metadata?: Record<string, any>
  createdBy: string
  createdAt: Date
}

// Forecasting Types
export interface Forecast {
  id: string
  companyId: string
  name: string
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
  ownerId: string
  teamId?: string
  targets: {
    revenue: number
    deals: number
    newCustomers: number
  }
  actuals: {
    revenue: number
    deals: number
    newCustomers: number
    pipeline: number
  }
  forecast: {
    committed: number
    bestCase: number
    worstCase: number
    pipeline: number
  }
  deals: ForecastDeal[]
  adjustments: ForecastAdjustment[]
  status: 'draft' | 'submitted' | 'approved' | 'final'
  submissions: ForecastSubmission[]
  createdAt: Date
  updatedAt: Date
}

export interface ForecastDeal {
  dealId: string
  dealName: string
  value: number
  probability: number
  closeDate: Date
  stage: string
  category: 'committed' | 'best_case' | 'omitted'
  notes?: string
}

export interface ForecastAdjustment {
  id: string
  type: 'add' | 'subtract'
  amount: number
  reason: string
  category: 'committed' | 'best_case'
  createdBy: string
  createdAt: Date
}

export interface ForecastSubmission {
  id: string
  submittedBy: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
  comments?: string
}

export interface Contact {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle?: string
  department?: string
  accountId: string
  leadSource: 'website' | 'referral' | 'cold_call' | 'email' | 'social' | 'event' | 'partner' | 'other'
  leadScore: number
  status: 'lead' | 'prospect' | 'qualified' | 'customer' | 'churned'
  tags: string[]
  socialProfiles: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
  createdBy: string
  assignedTo?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  notes: string
}

export interface Account {
  id: string
  companyId: string
  name: string
  website?: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  revenue?: number
  employees?: number
  address: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  phone?: string
  description?: string
  parentAccountId?: string
  accountType: 'prospect' | 'customer' | 'partner' | 'vendor' | 'competitor'
  status: 'active' | 'inactive' | 'churned'
  owner: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
  totalRevenue: number
  lastActivityDate?: string
  nextReviewDate?: string
}

export interface Deal {
  id: string
  companyId: string
  accountId: string
  contactId: string
  name: string
  description?: string
  value: number
  currency: string
  stage: string // Changed to string to support custom stages
  probability: number
  source: string
  type: 'new_business' | 'existing_business' | 'renewal' | 'upsell' | 'cross_sell'
  closeDate: string
  actualCloseDate?: string
  owner: string
  team: string[]
  competitors: string[]
  products: {
    id: string
    name: string
    quantity: number
    unitPrice: number
    discount: number
  }[]
  lossReason?: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
  lastActivityDate?: string
  nextAction?: string
  nextActionDate?: string
  // Additional pipeline-specific fields
  stageChangedAt?: string
  stageHistory: {
    stage: string
    changedAt: string
    changedBy: string
    reason?: string
  }[]
  temperature: 'cold' | 'warm' | 'hot'
  forecast: boolean
  estimatedRevenue: number
  weightedValue: number
}

export interface Activity {
  id: string
  companyId: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'proposal' | 'contract'
  subject: string
  description?: string
  startDate: string
  endDate?: string
  duration?: number
  status: 'planned' | 'completed' | 'cancelled' | 'no_show'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  outcome?: 'positive' | 'neutral' | 'negative'
  contactId?: string
  accountId?: string
  dealId?: string
  assignedTo: string
  participants: string[]
  location?: string
  isRecurring: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
  }
  reminders: {
    minutes: number
    sent: boolean
  }[]
  attachments: {
    id: string
    name: string
    url: string
    size: number
    type: string
  }[]
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CRMTask {
  id: string
  companyId: string
  title: string
  description?: string
  type: 'follow_up' | 'research' | 'proposal' | 'demo' | 'contract' | 'support' | 'other'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  completedDate?: string
  assignedTo: string
  createdBy: string
  contactId?: string
  accountId?: string
  dealId?: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  dependencies: string[]
  attachments: {
    id: string
    name: string
    url: string
  }[]
  comments: {
    id: string
    content: string
    createdAt: string
    createdBy: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface CRMTicket {
  id: string
  companyId: string
  ticketNumber: string
  subject: string
  description: string
  type: 'bug' | 'feature_request' | 'question' | 'complaint' | 'compliment' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  contactId: string
  accountId: string
  assignedTo?: string
  assignedTeam?: string
  source: 'email' | 'phone' | 'chat' | 'portal' | 'social' | 'internal'
  category: string
  subcategory?: string
  resolution?: string
  resolutionTime?: number
  firstResponseTime?: number
  customerSatisfaction?: number
  tags: string[]
  attachments: {
    id: string
    name: string
    url: string
    size: number
    type: string
  }[]
  timeline: {
    id: string
    action: string
    details?: string
    createdAt: string
    createdBy: string
  }[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
}

export interface CRMReport {
  id: string
  companyId: string
  name: string
  description?: string
  type: 'sales_pipeline' | 'lead_conversion' | 'activity_summary' | 'customer_satisfaction' | 'revenue_forecast' | 'team_performance'
  filters: {
    dateRange: {
      start: string
      end: string
    }
    owners?: string[]
    stages?: string[]
    tags?: string[]
    customFilters?: Record<string, any>
  }
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    recipients: string[]
    nextRun: string
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  lastRun?: string
  isActive: boolean
}

export interface CRMAnalytics {
  totalContacts: number
  totalAccounts: number
  totalDeals: number
  totalRevenue: number
  conversionRate: number
  averageDealSize: number
  salesCycleLength: number
  winRate: number
  pipelineValue: number
  forecastRevenue: number
  topPerformers: {
    userId: string
    name: string
    deals: number
    revenue: number
  }[]
  revenueByMonth: {
    month: string
    revenue: number
    deals: number
  }[]
  leadsBySource: {
    source: string
    count: number
    conversionRate: number
  }[]
  dealsByStage: {
    stage: string
    count: number
    value: number
  }[]
}

// Pipeline-specific types
export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  isActive: boolean
  color: string
  isWon: boolean
  isLost: boolean
  requirements?: string[]
  exitCriteria?: string[]
}

export interface PipelineSettings {
  stages: PipelineStage[]
  autoMove: boolean
  requireReason: boolean
  forecastInclude: string[]
}

export interface DealPipeline {
  id: string
  companyId: string
  name: string
  description?: string
  stages: PipelineStage[]
  deals: Deal[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface PipelineMetrics {
  totalValue: number
  weightedValue: number
  averageDealSize: number
  conversionRate: number
  averageSalesVelocity: number
  stageMetrics: {
    stageId: string
    count: number
    value: number
    averageTimeInStage: number
    conversionRate: number
  }[]
}

export interface CRMSettings {
  companyId: string
  dealStages: {
    id: string
    name: string
    order: number
    probability: number
    isActive: boolean
  }[]
  pipelineSettings: PipelineSettings
  leadSources: string[]
  industries: string[]
  accountTypes: string[]
  currencies: {
    code: string
    symbol: string
    isDefault: boolean
  }[]
  customFields: {
    entity: 'contact' | 'account' | 'deal' | 'activity'
    fields: {
      id: string
      name: string
      type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'url' | 'email'
      required: boolean
      options?: string[]
      defaultValue?: any
    }[]
  }[]
  automationRules: {
    id: string
    name: string
    trigger: string
    conditions: any[]
    actions: any[]
    isActive: boolean
  }[]
  integrations: {
    email: {
      provider: string
      enabled: boolean
      settings: Record<string, any>
    }
    calendar: {
      provider: string
      enabled: boolean
      settings: Record<string, any>
    }
    telephony: {
      provider: string
      enabled: boolean
      settings: Record<string, any>
    }
  }
  permissions: {
    role: string
    permissions: {
      contacts: ('create' | 'read' | 'update' | 'delete')[]
      accounts: ('create' | 'read' | 'update' | 'delete')[]
      deals: ('create' | 'read' | 'update' | 'delete')[]
      activities: ('create' | 'read' | 'update' | 'delete')[]
      reports: ('create' | 'read' | 'update' | 'delete')[]
    }
  }[]
  updatedAt: string
  updatedBy: string
}