export interface OnboardingStep {
  id: string
  title: string
  description: string
  type: 'welcome' | 'form' | 'training' | 'task' | 'review' | 'approval' | 'completion'
  category: 'orientation' | 'hr' | 'it' | 'department' | 'compliance' | 'social'
  order: number
  estimatedDuration: number // in minutes
  isRequired: boolean
  dependsOn?: string[] // step IDs that must be completed first
  assignedTo: 'system' | 'hr' | 'manager' | 'buddy' | 'it' | 'employee'
  dueDate?: Date
  
  // Content configuration
  content?: {
    instructions?: string
    videoUrl?: string
    documentUrls?: string[]
    formFields?: OnboardingFormField[]
    tasks?: OnboardingTask[]
    checklistItems?: OnboardingChecklistItem[]
  }
  
  // Department-specific settings
  departmentSettings?: {
    moduleAccess?: string[]
    permissions?: string[]
    resources?: OnboardingResource[]
    mentorAssignment?: {
      buddyId?: string
      mentorId?: string
      meetingSchedule?: string
    }
  }
  
  // Completion tracking
  completedAt?: Date
  completedBy?: string
  approvedBy?: string
  approvedAt?: Date
  notes?: string
  attachments?: string[]
  
  // Automation
  autoComplete?: boolean
  autoApprove?: boolean
  triggerActions?: OnboardingAction[]
}

export interface OnboardingFormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'checkbox'
  label: string
  placeholder?: string
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    options?: string[]
  }
  value?: any
  error?: string
}

export interface OnboardingTask {
  id: string
  title: string
  description: string
  type: 'action' | 'meeting' | 'training' | 'setup' | 'verification'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  notes?: string
}

export interface OnboardingChecklistItem {
  id: string
  text: string
  required: boolean
  completed: boolean
  completedAt?: Date
  verifiedBy?: string
}

export interface OnboardingResource {
  id: string
  title: string
  type: 'document' | 'video' | 'link' | 'contact' | 'tool'
  url?: string
  description?: string
  category: 'policy' | 'training' | 'reference' | 'contact' | 'tool'
  accessLevel: 'public' | 'department' | 'role' | 'individual'
}

export interface OnboardingAction {
  id: string
  type: 'email' | 'notification' | 'task_creation' | 'permission_grant' | 'system_access' | 'calendar_invite'
  trigger: 'step_start' | 'step_complete' | 'step_approve' | 'workflow_complete'
  config: any
}

export interface OnboardingWorkflow {
  id: string
  name: string
  description: string
  version: string
  companyId: string
  departmentId?: string
  roleId?: string
  
  // Workflow configuration
  isActive: boolean
  isTemplate: boolean
  estimatedDuration: number // total duration in days
  
  // Steps and flow
  steps: OnboardingStep[]
  flowConfig: {
    allowSkipping: boolean
    requireApprovals: boolean
    enableReminders: boolean
    reminderFrequency: number // days
  }
  
  // Automation settings
  automation: {
    autoStart: boolean
    autoAssignBuddy: boolean
    autoScheduleMeetings: boolean
    autoProvisionAccess: boolean
    autoSendWelcomeEmail: boolean
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  tags: string[]
}

export interface OnboardingInstance {
  id: string
  workflowId: string
  workflowVersion: string
  employeeId: string
  companyId: string
  departmentId: string
  managerId?: string
  buddyId?: string
  hrContactId?: string
  
  // Status tracking
  status: 'not_started' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled' | 'paused'
  currentStepId?: string
  progress: number // percentage 0-100
  
  // Dates
  startDate: Date
  expectedCompletionDate: Date
  actualCompletionDate?: Date
  
  // Step progress
  stepProgress: OnboardingStepProgress[]
  
  // Communications
  notifications: OnboardingNotification[]
  messages: OnboardingMessage[]
  
  // Escalations
  escalations: OnboardingEscalation[]
  
  // Settings
  settings: {
    sendReminders: boolean
    allowSelfService: boolean
    requireManagerApproval: boolean
    enableMentoring: boolean
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  completedBy?: string
}

export interface OnboardingStepProgress {
  stepId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'pending_approval'
  startedAt?: Date
  completedAt?: Date
  approvedAt?: Date
  assignedTo?: string
  completedBy?: string
  approvedBy?: string
  notes?: string
  attachments?: string[]
  formData?: Record<string, any>
  timeSpent?: number // minutes
  attempts?: number
}

export interface OnboardingNotification {
  id: string
  type: 'reminder' | 'assignment' | 'approval_request' | 'completion' | 'escalation'
  recipientId: string
  title: string
  message: string
  actionUrl?: string
  sentAt: Date
  readAt?: Date
  acknowledged?: boolean
}

export interface OnboardingMessage {
  id: string
  fromId: string
  toId: string
  subject: string
  content: string
  type: 'question' | 'feedback' | 'support' | 'general'
  priority: 'low' | 'medium' | 'high'
  sentAt: Date
  readAt?: Date
  repliedAt?: Date
  tags: string[]
}

export interface OnboardingEscalation {
  id: string
  stepId: string
  reason: 'overdue' | 'stuck' | 'approval_needed' | 'issue_reported'
  severity: 'low' | 'medium' | 'high' | 'critical'
  escalatedTo: string
  escalatedAt: Date
  resolvedAt?: Date
  resolution?: string
  notes?: string
}

export interface OnboardingTemplate {
  id: string
  name: string
  description: string
  category: 'general' | 'executive' | 'manager' | 'technical' | 'sales' | 'support' | 'intern'
  departmentId?: string
  rolePattern?: string
  
  // Template configuration
  isPublic: boolean
  version: string
  estimatedDuration: number
  
  // Content
  steps: Omit<OnboardingStep, 'id' | 'completedAt' | 'completedBy'>[]
  
  // Usage tracking
  usageCount: number
  rating: number
  reviews: OnboardingTemplateReview[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  tags: string[]
}

export interface OnboardingTemplateReview {
  id: string
  reviewerId: string
  rating: number // 1-5
  comment?: string
  createdAt: Date
}

export interface OnboardingAnalytics {
  workflowId: string
  period: {
    startDate: Date
    endDate: Date
  }
  metrics: {
    totalInstances: number
    completedInstances: number
    averageCompletionTime: number // days
    completionRate: number // percentage
    dropoffRate: number // percentage
    averageRating: number
    commonIssues: OnboardingIssue[]
    stepAnalytics: OnboardingStepAnalytics[]
  }
}

export interface OnboardingIssue {
  stepId: string
  stepTitle: string
  issueType: 'timeout' | 'failure' | 'approval_delay' | 'technical' | 'content'
  frequency: number
  impact: 'low' | 'medium' | 'high'
  description: string
}

export interface OnboardingStepAnalytics {
  stepId: string
  stepTitle: string
  completionRate: number
  averageTimeToComplete: number // minutes
  skipRate: number
  failureRate: number
  userSatisfaction: number
  commonFeedback: string[]
}

export interface OnboardingPreferences {
  userId: string
  communicationPreferences: {
    emailReminders: boolean
    smsReminders: boolean
    inAppNotifications: boolean
    frequency: 'immediate' | 'daily' | 'weekly'
  }
  learningPreferences: {
    preferredFormat: 'video' | 'text' | 'interactive' | 'mixed'
    pace: 'self_paced' | 'structured' | 'accelerated'
    support: 'minimal' | 'guided' | 'intensive'
  }
  availabilityPreferences: {
    workingHours: {
      start: string
      end: string
      timezone: string
    }
    preferredMeetingTimes: string[]
    unavailableDates: string[]
  }
}

export interface OnboardingCalendarEvent {
  id: string
  instanceId: string
  stepId?: string
  title: string
  description: string
  type: 'orientation' | 'training' | 'meeting' | 'review' | 'social'
  attendees: {
    employeeId: string
    managerId?: string
    hrId?: string
    buddyId?: string
    others?: string[]
  }
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  agenda?: string[]
  documents?: string[]
  completed: boolean
  feedback?: {
    rating: number
    comments: string
  }
}

export interface OnboardingIntegration {
  id: string
  name: string
  type: 'hris' | 'lms' | 'calendar' | 'messaging' | 'documents' | 'directory'
  config: {
    endpoint?: string
    apiKey?: string
    webhookUrl?: string
    mapping?: Record<string, string>
  }
  isActive: boolean
  syncDirection: 'import' | 'export' | 'bidirectional'
  lastSyncAt?: Date
  errorCount: number
  lastError?: string
}

// Filter and search interfaces
export interface OnboardingFilter {
  status?: OnboardingInstance['status'][]
  department?: string[]
  role?: string[]
  manager?: string[]
  startDateRange?: {
    from: Date
    to: Date
  }
  completionDateRange?: {
    from: Date
    to: Date
  }
  progress?: {
    min: number
    max: number
  }
  overdue?: boolean
  hasIssues?: boolean
}

export interface OnboardingSortOptions {
  field: 'startDate' | 'progress' | 'status' | 'employee' | 'department' | 'completionDate'
  direction: 'asc' | 'desc'
}