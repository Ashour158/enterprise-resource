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

// Company user profile with role assignments
export interface CompanyUserProfiles {
  id: string
  global_user_id: string
  company_id: string
  employee_id?: string
  department_id?: string
  job_title?: string
  role_id: string
  manager_id?: string
  cost_center?: string
  hire_date?: string
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern'
  salary_band?: string
  status: 'active' | 'inactive' | 'suspended' | 'terminated'
  permissions: string[]
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

// Database Schema Interfaces for Multi-Company Architecture

export interface Role {
  id: string
  company_id: string
  role_name: string
  description?: string
  permissions: string[]
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  permission_name: string
  description?: string
  module: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute'
  is_system_permission: boolean
  created_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  description?: string
  parent_department_id?: string
  manager_id?: string
  cost_center?: string
  budget?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  global_user_id: string
  company_id: string
  jwt_token: string
  refresh_token?: string
  expires_at: string
  last_activity: string
  ip_address?: string
  user_agent?: string
  is_active: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  global_user_id: string
  company_id: string
  action: string
  resource: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface CompanyInvitation {
  id: string
  company_id: string
  inviter_user_id: string
  email: string
  role_id: string
  department_id?: string
  token: string
  expires_at: string
  accepted_at?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  updated_at: string
}

export interface SyncConfiguration {
  id: string
  company_id: string
  module_id: string
  auto_sync: boolean
  sync_interval: number
  priority: 'high' | 'medium' | 'low'
  conflict_resolution: 'server_wins' | 'client_wins' | 'manual' | 'workflow'
  sync_fields: string[]
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}