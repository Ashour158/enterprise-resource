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
  logo?: string
  domain: string
  isActive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  permissions: string[]
  companyId: string
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