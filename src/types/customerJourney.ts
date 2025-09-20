export interface TouchPoint {
  id: string
  journeyId: string
  type: 'email' | 'call' | 'meeting' | 'website' | 'social' | 'support' | 'purchase' | 'demo'
  channel: string
  title: string
  description: string
  outcome?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  timestamp: string
  metadata?: Record<string, any>
}

export interface JourneyStage {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'skipped'
  startDate?: string
  completedDate?: string
  expectedDuration?: number // in days
  activities?: string[]
}

export interface JourneyMilestone {
  id: string
  journeyId: string
  name: string
  description: string
  type: 'engagement' | 'conversion' | 'retention' | 'satisfaction'
  status: 'pending' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  targetDate?: string
  completedAt?: string
  criteria: string
  automationTrigger?: string
  notificationSettings: {
    email: boolean
    inApp: boolean
    sms: boolean
  }
  assignedTo?: string
  dependencies?: string[]
  createdAt: string
  updatedAt?: string
}

export interface CustomerJourney {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  journeyType: 'sales' | 'onboarding' | 'support' | 'retention'
  description?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  currentStage: string
  startDate: string
  completedDate?: string
  expectedCompletionDate?: string
  stages: JourneyStage[]
  milestones: JourneyMilestone[]
  touchPoints: TouchPoint[]
  progressPercentage: number
  healthScore?: number
  predictedOutcome?: {
    outcome: 'success' | 'churn' | 'upsell' | 'neutral'
    confidence: number
    reasoning: string
  }
  assignedTo?: string
  tags?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface JourneyTemplate {
  id: string
  name: string
  type: 'sales' | 'onboarding' | 'support' | 'retention'
  description: string
  stages: Omit<JourneyStage, 'status' | 'startDate' | 'completedDate'>[]
  milestones: Omit<JourneyMilestone, 'id' | 'journeyId' | 'status' | 'completedAt' | 'createdAt'>[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface JourneyAnalytics {
  journeyId: string
  metrics: {
    conversionRate: number
    averageCompletionTime: number
    dropOffPoints: Array<{
      stage: string
      percentage: number
    }>
    customerSatisfaction: number
    touchPointEffectiveness: Array<{
      type: string
      engagementRate: number
      conversionImpact: number
    }>
  }
  insights: Array<{
    type: 'warning' | 'success' | 'info'
    message: string
    actionable: boolean
    priority: 'low' | 'medium' | 'high'
  }>
}

export interface JourneyAutomation {
  id: string
  journeyId: string
  trigger: {
    type: 'milestone_reached' | 'stage_completed' | 'time_based' | 'behavior_based'
    conditions: Record<string, any>
  }
  actions: Array<{
    type: 'send_email' | 'create_task' | 'update_stage' | 'notify_team' | 'schedule_meeting'
    parameters: Record<string, any>
    delay?: number // in hours
  }>
  isActive: boolean
  createdAt: string
  updatedAt: string
}