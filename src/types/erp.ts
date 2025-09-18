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
}