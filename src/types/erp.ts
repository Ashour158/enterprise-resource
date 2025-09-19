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

// Company-specific user profile (aligned with database schema)
export interface CompanyUserProfile {
  id: string
  global_user_id: string
  company_id: string
  employee_id?: string // company-specific employee ID
  department?: string
  position?: string // job title/position
  manager_id?: string // references another company_user_profile
  hire_date?: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'consultant'
  work_location?: string
  status: 'active' | 'inactive' | 'suspended' | 'terminated'
  company_specific_settings: Record<string, any>
  last_company_login?: string
  created_at: string
  updated_at: string
}

// Combined user interface for UI usage (with role data populated from relationships)
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string // populated from current company context
  permissions: string[] // populated from current company context
  companyId: string
  employee_id?: string
  department?: string
  position?: string // job title from company profile
  is_owner?: boolean
  company_profiles: CompanyUserProfile[]
  global_profile: GlobalUser
  current_roles?: SystemRole[] // roles in current company
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

// Legacy Role interface for backward compatibility
export interface Role {
  id: string
  company_id: string
  role_name: string
  description?: string
  permissions: string[]
  is_system_role: boolean
  is_active: boolean
  hierarchy_level: number
  parent_role_id?: string
  max_users?: number
  current_users: number
  created_by: string
  created_at: string
  updated_at: string
}

// System roles table (company-specific)
export interface SystemRole {
  id: string
  company_id: string
  role_name: string
  role_level: number // 1=SuperAdmin, 2=Admin, 3=Manager, 4=User, 5=Viewer
  description?: string
  is_system_role: boolean
  permissions: Record<string, any>
  created_at: string
}

// Role permissions table
export interface RolePermissions {
  id: string
  role_id: string
  module_name: string
  permission_type: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'admin'
  resource_type?: string
  conditions: Record<string, any>
  created_at: string
}

// Company-specific role assignments
export interface CompanyUserRole {
  id: string
  company_user_profile_id: string
  role_id: string
  assigned_by: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
}

// Enhanced sessions table with company context
export interface UserSession {
  id: string
  global_user_id: string
  company_id: string // Current active company
  company_user_profile_id: string
  session_token: string
  refresh_token?: string
  expires_at: string
  ip_address?: string
  user_agent?: string
  device_fingerprint?: string
  location_data: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface Permission {
  id: string
  permission_name: string
  display_name: string
  description?: string
  module: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'export' | 'import'
  scope: 'global' | 'company' | 'department' | 'team' | 'own'
  is_system_permission: boolean
  requires_approval: boolean
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[]
  created_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  granted: boolean
  conditions?: PermissionCondition[]
  granted_by: string
  granted_at: string
  expires_at?: string
}

export interface PermissionCondition {
  type: 'time_based' | 'location_based' | 'approval_required' | 'mfa_required' | 'ip_whitelist'
  config: Record<string, any>
}

export interface UserPermissionOverride {
  id: string
  user_id: string
  company_id: string
  permission_id: string
  granted: boolean
  reason: string
  granted_by: string
  expires_at?: string
  created_at: string
}

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  permissions: string[]
  target_roles: string[]
  is_default: boolean
  created_at: string
}

export interface AccessPolicy {
  id: string
  company_id: string
  name: string
  description: string
  rules: PolicyRule[]
  priority: number
  is_active: boolean
  applies_to: 'users' | 'roles' | 'departments'
  target_ids: string[]
  created_at: string
  updated_at: string
}

export interface PolicyRule {
  id: string
  type: 'allow' | 'deny' | 'require_approval'
  resource: string
  action: string
  conditions: RuleCondition[]
  effect_priority: number
}

export interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface PermissionRequest {
  id: string
  requester_id: string
  company_id: string
  permission_id: string
  role_id?: string
  justification: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  approver_id?: string
  approval_notes?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface SecurityContext {
  user_id: string
  company_id: string
  role_id: string
  permissions: string[]
  session_id: string
  ip_address: string
  location?: string
  device_info: string
  mfa_verified: boolean
  last_permission_check: string
  security_level: 'standard' | 'elevated' | 'administrative' | 'system'
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
  company_id: string // Current active company
  company_user_profile_id: string
  session_token: string
  refresh_token?: string
  expires_at: string
  ip_address?: string
  user_agent?: string
  device_fingerprint?: string
  location_data: Record<string, any>
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

// User Profile Management Interfaces
export interface UserPreferences {
  // Appearance
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja'
  timezone: string
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  time_format: '12h' | '24h'
  currency_display: 'symbol' | 'code' | 'name'
  number_format: 'US' | 'EU' | 'custom'
  
  // Dashboard & Layout
  dashboard_layout: 'grid' | 'list' | 'compact'
  sidebar_collapsed: boolean
  default_page: string
  widgets_config: Record<string, any>
  quick_access_modules: string[]
  
  // Notifications
  email_notifications: boolean
  push_notifications: boolean
  desktop_notifications: boolean
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  notification_types: NotificationType[]
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
    timezone: string
  }
  
  // Accessibility
  high_contrast: boolean
  large_text: boolean
  reduce_motion: boolean
  screen_reader: boolean
  keyboard_shortcuts: boolean
  
  // Privacy & Security
  session_timeout: number
  two_factor_required: boolean
  login_notifications: boolean
  security_alerts: boolean
  data_export_format: 'csv' | 'json' | 'xlsx'
  
  // Advanced
  developer_mode: boolean
  beta_features: boolean
  analytics_opt_in: boolean
  auto_save_interval: number
  backup_frequency: 'daily' | 'weekly' | 'monthly'
}

export interface NotificationType {
  category: 'system' | 'security' | 'workflow' | 'social' | 'financial' | 'inventory' | 'hr'
  enabled: boolean
  channels: ('email' | 'push' | 'desktop' | 'sms')[]
  priority: 'high' | 'medium' | 'low'
}

export interface UserProfileUpdate {
  // Basic Info
  first_name?: string
  last_name?: string
  phone?: string
  profile_picture_url?: string
  
  // Professional Info
  job_title?: string
  department?: string
  bio?: string
  skills?: string[]
  certifications?: UserCertification[]
  
  // Preferences
  preferences?: Partial<UserPreferences>
  
  // Contact Info
  emergency_contact?: EmergencyContact
  address?: UserAddress
  
  // Social Links
  social_links?: SocialLink[]
}

export interface UserCertification {
  id: string
  name: string
  issuing_organization: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  verification_url?: string
  is_verified: boolean
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
}

export interface UserAddress {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  type: 'home' | 'work' | 'other'
}

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'github' | 'website' | 'other'
  url: string
  is_public: boolean
}

export interface AvatarUpload {
  file: File
  preview_url: string
  upload_progress: number
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed'
  error_message?: string
}

export interface ProfileChangeLog {
  id: string
  user_id: string
  field: string
  old_value: any
  new_value: any
  changed_by: string
  change_reason?: string
  timestamp: string
  company_id?: string
}

export interface ProfileSecuritySettings {
  mfa_enabled: boolean
  mfa_methods: ('totp' | 'sms' | 'email' | 'hardware_key')[]
  backup_codes: string[]
  active_sessions: UserSession[]
  recent_logins: LoginHistory[]
  trusted_devices: TrustedDevice[]
  api_keys: ApiKey[]
}

export interface LoginHistory {
  id: string
  timestamp: string
  ip_address: string
  location?: string
  device_info: string
  browser: string
  success: boolean
  failure_reason?: string
}

export interface TrustedDevice {
  id: string
  device_name: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  browser: string
  last_used: string
  is_current: boolean
  trusted_until: string
}

export interface ApiKey {
  id: string
  name: string
  key_preview: string
  permissions: string[]
  last_used?: string
  expires_at?: string
  is_active: boolean
  created_at: string
}