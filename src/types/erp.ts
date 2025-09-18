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