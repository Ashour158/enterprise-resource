// Lead Management Types
export interface Lead {
  id: string
  companyId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  title: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number
  estimatedValue: number
  assignedTo: string
  tags: string[]
  notes: string
  customFields: Record<string, any>
  activities: LeadActivity[]
  files: CRMFile[]
  createdAt: Date
  updatedAt: Date
  lastContactDate: Date | null
  nextFollowUpDate: Date | null
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
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
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
  createdBy: string
  assignedTo?: string
  sentDate?: Date
  viewedDate?: Date
  acceptedDate?: Date
  rejectedDate?: Date
  rejectionReason?: string
  files: CRMFile[]
  activities: QuoteActivity[]
  createdAt: Date
  updatedAt: Date
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