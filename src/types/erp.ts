import { ReactNode } from 'react'

export interface ERPModule {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'maintenance' | 'offline'
  lastUpdated: string
  notifications: number
  quickStats: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
  }[]
}

export interface Company {
  id: string
  name: string
  company_code: string
  logo?: string
  domain: string
  address?: string
  phone?: string
  email?: string
  subscription_plan: 'enterprise' | 'professional' | 'standard' | 'starter'
  settings: Record<string, any>
  security_settings: Record<string, any>
  timezone: string
  currency: string
  isActive: boolean
  created_at: string
  updated_at: string
}

// Global user (authentication and personal info)
export interface GlobalUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  profile_picture_url?: string
  mfa_enabled: boolean
  mfa_secret?: string
  backup_codes: string[]
  last_login?: string
  failed_login_attempts: number
  account_locked_until?: string
  password_changed_at: string
  is_active: boolean
  preferences: Record<string, any>
  security_settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Company-specific user profile
export interface CompanyUserProfile {
  id: string
  global_user_id: string
  company_id: string
  employee_id?: string
  department?: string
  job_title?: string
  role: string
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended'
  hire_date?: string
  manager_id?: string
  cost_center?: string
  settings: Record<string, any>
  last_activity?: string
  created_at: string
  updated_at: string
}

// Combined user interface for UI usage
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  permissions: string[]
  companyId: string
  employee_id?: string
  department?: string
  job_title?: string
  is_owner?: boolean
  company_profiles: CompanyUserProfile[]
  global_profile: GlobalUser
}

// Multi-company session context
export interface SessionContext {
  global_user_id: string
  current_company_id: string
  available_companies: CompanyAccess[]
  jwt_token: string
  expires_at: string
  permissions: string[]
  role: string
}

export interface CompanyAccess {
  company_id: string
  company_name: string
  company_code: string
  role: string
  permissions: string[]
  status: 'active' | 'pending' | 'suspended'
  last_accessed?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  isRead: boolean
  module: string
}

export interface AIInsight {
  id: string
  title: string
  description: string
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization'
  confidence: number
  impact: 'high' | 'medium' | 'low'
  module: string
  actionable: boolean
  actions?: {
    label: string
    action: string
  }[]
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  services: {
    name: string
    status: 'online' | 'degraded' | 'offline'
    responseTime: number
    uptime: number
  }[]
  apiCalls: {
    total: number
    successful: number
    failed: number
  }
}

export interface SyncStatus {
  isConnected: boolean
  lastSync: string
  syncInProgress: boolean
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline'
  pendingUpdates: number
  conflictCount: number
}

export interface DataSyncEvent {
  id: string
  type: 'data_update' | 'sync_status' | 'conflict' | 'batch_update'
  module: string
  entity: string
  operation: 'create' | 'update' | 'delete' | 'sync'
  data: any
  timestamp: string
  companyId: string
  userId?: string
}

export interface ModuleSyncConfig {
  moduleId: string
  autoSync: boolean
  syncInterval: number // in seconds
  priority: 'high' | 'medium' | 'low'
  conflictResolution: 'server_wins' | 'client_wins' | 'manual'
  syncFields: string[]
}

export interface SyncConflict {
  id: string
  module: string
  entity: string
  entityId: string
  field: string
  serverValue: any
  clientValue: any
  timestamp: string
  resolved: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  conflictType: 'data_mismatch' | 'concurrent_edit' | 'version_conflict' | 'permission_conflict'
  affectedUsers: string[]
  businessImpact: 'revenue' | 'compliance' | 'operations' | 'reporting' | 'none'
  autoResolutionSuggestion?: ConflictResolutionStrategy
  metadata?: {
    lastModified: string
    modifiedBy: string
    version: number
    dependencies: string[]
    validationErrors?: string[]
  }
}

export interface ConflictResolutionStrategy {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual' | 'ai_assisted' | 'workflow_approval'
  confidence: number
  reasoning: string
  mergeRules?: MergeRule[]
  approvalWorkflow?: ApprovalWorkflow
}

export interface MergeRule {
  field: string
  rule: 'latest_timestamp' | 'highest_value' | 'combine_arrays' | 'custom_logic'
  customLogic?: string
}

export interface ApprovalWorkflow {
  id: string
  requiredApprovers: string[]
  approvalSteps: ApprovalStep[]
  escalationRules: EscalationRule[]
  timeout: number // hours
}

export interface ApprovalStep {
  id: string
  approverRole: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  timestamp?: string
  comments?: string
}

export interface EscalationRule {
  condition: 'timeout' | 'rejection' | 'business_critical'
  escalateTo: string
  action: 'notify' | 'auto_approve' | 'require_additional_approval'
}

export interface ConflictResolutionWorkflow {
  id: string
  name: string
  description: string
  triggers: ConflictTrigger[]
  steps: WorkflowStep[]
  isActive: boolean
  priority: number
}

export interface ConflictTrigger {
  field: 'module' | 'entity' | 'priority' | 'businessImpact' | 'conflictType'
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface WorkflowStep {
  id: string
  type: 'auto_resolution' | 'ai_analysis' | 'human_review' | 'escalation' | 'notification'
  config: any
  conditions?: WorkflowCondition[]
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}