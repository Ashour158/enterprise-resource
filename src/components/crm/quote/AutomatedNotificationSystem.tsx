import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Bell,
  Clock,
  ArrowUp,
  Warning as AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  GearSix as Settings,
  Trash,
  PencilSimple as Edit,
  Play,
  Pause,
  Eye,
  EnvelopeSimple as Mail,
  Phone,
  ChatCircle as MessageSquare,
  Stack as Slack,
  Calendar,
  Target,
  Timer,
  Lightning as Zap,
  Users,
  Crown,
  Building,
  TreeStructure,
  ChartLine,
  Activity,
  Lightning,
  Siren,
  File
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NotificationRule {
  id: string
  companyId: string
  name: string
  description: string
  isActive: boolean
  triggerType: 'quote_pending' | 'approval_overdue' | 'escalation_due' | 'approval_timeout' | 'quote_rejected' | 'quote_approved' | 'quote_created' | 'quote_modified'
  conditions: {
    quoteAmount?: { 
      min?: number; 
      max?: number;
      currency?: string;
      operator?: 'greater_than' | 'less_than' | 'between' | 'equals'
    }
    approvalLevel?: string[]
    department?: string[]
    userRole?: string[]
    customerType?: string[]
    productCategory?: string[]
    timeThreshold: number // hours
    priority: 'low' | 'medium' | 'high' | 'critical'
    businessHoursOnly?: boolean
    excludeWeekends?: boolean
    customTimeouts?: {
      initial: number
      reminder1: number
      reminder2: number
      escalation: number
      final: number
    }
  }
  notifications: NotificationChannel[]
  escalationChain: EscalationLevel[]
  reminderSettings: {
    enabled: boolean
    intervals: number[] // hours
    maxReminders: number
    escalateOnMaxReminders: boolean
    smartTiming: boolean // Adjust timing based on business hours
    urgencyMultiplier: number // Speed up for high-value quotes
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface NotificationChannel {
  id: string
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook'
  enabled: boolean
  config: {
    template?: string
    recipients?: string[]
    webhook?: string
    channel?: string
    priority: 'normal' | 'high' | 'urgent'
  }
}

interface EscalationLevel {
  id: string
  order: number
  name: string
  triggerAfterHours: number
  escalateTo: {
    type: 'role' | 'user' | 'department' | 'manager_hierarchy'
    roleId?: string
    userId?: string
    departmentId?: string
    level?: number // for manager hierarchy
  }[]
  notificationChannels: string[]
  requiresAcknowledgment: boolean
  autoAssign: boolean
}

interface NotificationLog {
  id: string
  ruleId: string
  quoteId: string
  approvalId: string
  type: string
  channel: string
  status: 'sent' | 'delivered' | 'failed' | 'acknowledged'
  recipient: string
  sentAt: Date
  deliveredAt?: Date
  acknowledgedAt?: Date
  error?: string
  metadata: Record<string, any>
}

interface AutomatedNotificationSystemProps {
  companyId: string
  userId: string
  userRole: string
}

// Mock data for notification rules
const mockNotificationRules: NotificationRule[] = [
  {
    id: 'rule-001',
    companyId: 'comp-001',
    name: 'High Value Quote Escalation',
    description: 'Escalate quotes over $50,000 if not approved within 24 hours',
    isActive: true,
    triggerType: 'approval_overdue',
    conditions: {
      quoteAmount: { 
        min: 50000,
        operator: 'greater_than',
        currency: 'USD'
      },
      timeThreshold: 24,
      priority: 'high',
      businessHoursOnly: true,
      customTimeouts: {
        initial: 2,
        reminder1: 12,
        reminder2: 24,
        escalation: 36,
        final: 48
      }
    },
    notifications: [
      {
        id: 'notif-001',
        type: 'email',
        enabled: true,
        config: {
          template: 'quote_escalation_email',
          priority: 'high'
        }
      },
      {
        id: 'notif-002',
        type: 'slack',
        enabled: true,
        config: {
          channel: '#sales-escalations',
          priority: 'urgent'
        }
      }
    ],
    escalationChain: [
      {
        id: 'esc-001',
        order: 1,
        name: 'Sales Manager',
        triggerAfterHours: 24,
        escalateTo: [
          { type: 'role', roleId: 'sales_manager' }
        ],
        notificationChannels: ['notif-001'],
        requiresAcknowledgment: true,
        autoAssign: false
      },
      {
        id: 'esc-002',
        order: 2,
        name: 'Sales Director',
        triggerAfterHours: 48,
        escalateTo: [
          { type: 'role', roleId: 'sales_director' }
        ],
        notificationChannels: ['notif-001', 'notif-002'],
        requiresAcknowledgment: true,
        autoAssign: true
      }
    ],
    reminderSettings: {
      enabled: true,
      intervals: [12, 24, 36],
      maxReminders: 3,
      escalateOnMaxReminders: true,
      smartTiming: true,
      urgencyMultiplier: 1.5
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'rule-002',
    companyId: 'comp-001',
    name: 'Standard Quote Reminders',
    description: 'Send reminders for pending quote approvals every 24 hours',
    isActive: true,
    triggerType: 'quote_pending',
    conditions: {
      quoteAmount: {
        min: 1000,
        max: 50000,
        operator: 'between',
        currency: 'USD'
      },
      timeThreshold: 12,
      priority: 'medium',
      businessHoursOnly: false,
      customTimeouts: {
        initial: 4,
        reminder1: 24,
        reminder2: 48,
        escalation: 72,
        final: 96
      }
    },
    notifications: [
      {
        id: 'notif-003',
        type: 'email',
        enabled: true,
        config: {
          template: 'quote_reminder_email',
          priority: 'normal'
        }
      }
    ],
    escalationChain: [],
    reminderSettings: {
      enabled: true,
      intervals: [24, 48],
      maxReminders: 2,
      escalateOnMaxReminders: false,
      smartTiming: false,
      urgencyMultiplier: 1.0
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'rule-003',
    companyId: 'comp-001',
    name: 'Critical Enterprise Quotes',
    description: 'Immediate escalation for enterprise quotes over $250,000',
    isActive: true,
    triggerType: 'quote_created',
    conditions: {
      quoteAmount: {
        min: 250000,
        operator: 'greater_than',
        currency: 'USD'
      },
      customerType: ['enterprise'],
      timeThreshold: 1,
      priority: 'critical',
      businessHoursOnly: false,
      customTimeouts: {
        initial: 1,
        reminder1: 4,
        reminder2: 8,
        escalation: 12,
        final: 16
      }
    },
    notifications: [
      {
        id: 'notif-004',
        type: 'email',
        enabled: true,
        config: {
          template: 'enterprise_quote_alert',
          priority: 'urgent'
        }
      },
      {
        id: 'notif-005',
        type: 'sms',
        enabled: true,
        config: {
          priority: 'urgent'
        }
      },
      {
        id: 'notif-006',
        type: 'slack',
        enabled: true,
        config: {
          channel: '#executive-alerts',
          priority: 'urgent'
        }
      }
    ],
    escalationChain: [
      {
        id: 'esc-003',
        order: 1,
        name: 'VP Sales',
        triggerAfterHours: 4,
        escalateTo: [
          { type: 'role', roleId: 'vp_sales' }
        ],
        notificationChannels: ['notif-004', 'notif-005'],
        requiresAcknowledgment: true,
        autoAssign: true
      },
      {
        id: 'esc-004',
        order: 2,
        name: 'CEO',
        triggerAfterHours: 12,
        escalateTo: [
          { type: 'role', roleId: 'ceo' }
        ],
        notificationChannels: ['notif-004', 'notif-005', 'notif-006'],
        requiresAcknowledgment: true,
        autoAssign: true
      }
    ],
    reminderSettings: {
      enabled: true,
      intervals: [2, 4, 6],
      maxReminders: 5,
      escalateOnMaxReminders: true,
      smartTiming: true,
      urgencyMultiplier: 2.0
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'rule-004',
    companyId: 'comp-001',
    name: 'Small Quote Fast Track',
    description: 'Quick approval process for quotes under $5,000',
    isActive: true,
    triggerType: 'quote_pending',
    conditions: {
      quoteAmount: {
        max: 5000,
        operator: 'less_than',
        currency: 'USD'
      },
      timeThreshold: 6,
      priority: 'low',
      businessHoursOnly: true,
      customTimeouts: {
        initial: 2,
        reminder1: 6,
        reminder2: 12,
        escalation: 24,
        final: 48
      }
    },
    notifications: [
      {
        id: 'notif-007',
        type: 'email',
        enabled: true,
        config: {
          template: 'quick_approval_needed',
          priority: 'normal'
        }
      }
    ],
    escalationChain: [
      {
        id: 'esc-005',
        order: 1,
        name: 'Team Lead',
        triggerAfterHours: 12,
        escalateTo: [
          { type: 'role', roleId: 'team_lead' }
        ],
        notificationChannels: ['notif-007'],
        requiresAcknowledgment: false,
        autoAssign: true
      }
    ],
    reminderSettings: {
      enabled: true,
      intervals: [6, 12],
      maxReminders: 2,
      escalateOnMaxReminders: true,
      smartTiming: true,
      urgencyMultiplier: 0.8
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'rule-005',
    companyId: 'comp-001',
    name: 'Government Contract Timeouts',
    description: 'Extended approval timeframes for government contracts',
    isActive: true,
    triggerType: 'approval_overdue',
    conditions: {
      customerType: ['government'],
      timeThreshold: 72,
      priority: 'medium',
      businessHoursOnly: true,
      excludeWeekends: true,
      customTimeouts: {
        initial: 8,
        reminder1: 72,
        reminder2: 120,
        escalation: 168,
        final: 240
      }
    },
    notifications: [
      {
        id: 'notif-008',
        type: 'email',
        enabled: true,
        config: {
          template: 'government_contract_reminder',
          priority: 'normal'
        }
      }
    ],
    escalationChain: [
      {
        id: 'esc-006',
        order: 1,
        name: 'Government Sales Specialist',
        triggerAfterHours: 168,
        escalateTo: [
          { type: 'role', roleId: 'gov_sales_specialist' }
        ],
        notificationChannels: ['notif-008'],
        requiresAcknowledgment: true,
        autoAssign: false
      }
    ],
    reminderSettings: {
      enabled: true,
      intervals: [72, 120, 168],
      maxReminders: 3,
      escalateOnMaxReminders: false,
      smartTiming: true,
      urgencyMultiplier: 0.7
    },
    createdBy: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
]

// Mock notification logs
const mockNotificationLogs: NotificationLog[] = [
  {
    id: 'log-001',
    ruleId: 'rule-001',
    quoteId: 'quote-001',
    approvalId: 'approval-001',
    type: 'reminder',
    channel: 'email',
    status: 'delivered',
    recipient: 'john.doe@company.com',
    sentAt: new Date('2024-01-15T10:00:00Z'),
    deliveredAt: new Date('2024-01-15T10:02:00Z'),
    metadata: { quoteAmount: 75000, priority: 'high' }
  },
  {
    id: 'log-002',
    ruleId: 'rule-001',
    quoteId: 'quote-002',
    approvalId: 'approval-002',
    type: 'escalation',
    channel: 'slack',
    status: 'sent',
    recipient: '#sales-escalations',
    sentAt: new Date('2024-01-15T14:30:00Z'),
    metadata: { escalationLevel: 2, quoteAmount: 125000 }
  }
]

export function AutomatedNotificationSystem({ companyId, userId, userRole }: AutomatedNotificationSystemProps) {
  const [notificationRules, setNotificationRules] = useKV<NotificationRule[]>(`notification-rules-${companyId}`, mockNotificationRules)
  const [notificationLogs, setNotificationLogs] = useKV<NotificationLog[]>(`notification-logs-${companyId}`, mockNotificationLogs)
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [activeTab, setActiveTab] = useState('rules')
  const [formData, setFormData] = useState<Partial<NotificationRule>>({})

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalNotifications: 0,
    sentToday: 0,
    escalationsToday: 0,
    deliveryRate: 0,
    avgResponseTime: 0
  })

  useEffect(() => {
    if (notificationLogs) {
      const today = new Date().toDateString()
      const todayLogs = notificationLogs.filter(log => 
        log.sentAt.toDateString() === today
      )
      
      const escalationsToday = todayLogs.filter(log => log.type === 'escalation').length
      const delivered = notificationLogs.filter(log => log.status === 'delivered').length
      const deliveryRate = notificationLogs.length > 0 ? (delivered / notificationLogs.length) * 100 : 0

      setAnalytics({
        totalNotifications: notificationLogs.length,
        sentToday: todayLogs.length,
        escalationsToday,
        deliveryRate: Math.round(deliveryRate),
        avgResponseTime: 2.5 // Mock average response time in hours
      })
    }
  }, [notificationLogs])

  const handleCreateRule = () => {
    if (!formData.name || !formData.triggerType) {
      toast.error('Please fill in all required fields')
      return
    }

    const newRule: NotificationRule = {
      id: `rule-${Date.now()}`,
      companyId,
      name: formData.name,
      description: formData.description || '',
      isActive: formData.isActive ?? true,
      triggerType: formData.triggerType,
      conditions: formData.conditions || {
        timeThreshold: 24,
        priority: 'medium'
      },
      notifications: formData.notifications || [],
      escalationChain: formData.escalationChain || [],
      reminderSettings: formData.reminderSettings || {
        enabled: true,
        intervals: [24],
        maxReminders: 2,
        escalateOnMaxReminders: false,
        smartTiming: true,
        urgencyMultiplier: 1.0
      },
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setNotificationRules(current => [...(current || []), newRule])
    setFormData({})
    setShowRuleForm(false)
    toast.success('Notification rule created successfully')
  }

  const handleToggleRule = (ruleId: string) => {
    setNotificationRules(current => {
      if (!current) return []
      return current.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    })
  }

  const handleDeleteRule = (ruleId: string) => {
    setNotificationRules(current => {
      if (!current) return []
      return current.filter(r => r.id !== ruleId)
    })
    toast.success('Notification rule deleted successfully')
  }

  const handleTestRule = (ruleId: string) => {
    const rule = notificationRules?.find(r => r.id === ruleId)
    if (rule) {
      toast.success(`Test notification sent for rule: ${rule.name}`)
      
      // Create a test log entry
      const testLog: NotificationLog = {
        id: `test-${Date.now()}`,
        ruleId,
        quoteId: 'test-quote',
        approvalId: 'test-approval',
        type: 'test',
        channel: 'email',
        status: 'sent',
        recipient: 'test@example.com',
        sentAt: new Date(),
        metadata: { test: true }
      }
      
      setNotificationLogs(current => [...(current || []), testLog])
    }
  }

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case 'quote_pending': return <Clock size={16} />
      case 'approval_overdue': return <AlertTriangle size={16} />
      case 'escalation_due': return <ArrowUp size={16} />
      case 'approval_timeout': return <Timer size={16} />
      case 'quote_rejected': return <XCircle size={16} />
      case 'quote_approved': return <CheckCircle size={16} />
      default: return <Bell size={16} />
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} />
      case 'sms': return <Phone size={16} />
      case 'slack': return <Slack size={16} />
      case 'teams': return <MessageSquare size={16} />
      case 'webhook': return <Zap size={16} />
      default: return <Bell size={16} />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      sent: { variant: 'outline', color: 'text-blue-600', icon: <Bell size={12} /> },
      delivered: { variant: 'default', color: 'text-green-600', icon: <CheckCircle size={12} /> },
      failed: { variant: 'destructive', color: 'text-red-600', icon: <XCircle size={12} /> },
      acknowledged: { variant: 'secondary', color: 'text-purple-600', icon: <Eye size={12} /> }
    }[status] || { variant: 'outline', color: 'text-gray-600', icon: <Bell size={12} /> }

    return (
      <Badge variant={config.variant as any} className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { color: 'bg-gray-500', icon: <Target size={12} /> },
      medium: { color: 'bg-yellow-500', icon: <Timer size={12} /> },
      high: { color: 'bg-orange-500', icon: <AlertTriangle size={12} /> },
      critical: { color: 'bg-red-500', icon: <Siren size={12} /> }
    }[priority] || { color: 'bg-gray-500', icon: <Target size={12} /> }

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {priority}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automated Notifications & Escalations</h2>
          <p className="text-muted-foreground">
            Configure intelligent reminder and escalation workflows for quote approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Notification Rule</DialogTitle>
              </DialogHeader>
              
              {/* Quick Template Selection */}
              <div className="mb-6">
                <Label className="text-base font-semibold">Quick Templates</Label>
                <p className="text-sm text-muted-foreground mb-3">Start with a pre-configured template</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => {
                      setFormData({
                        name: 'High Value Enterprise Quotes',
                        triggerType: 'quote_created',
                        description: 'Immediate attention for enterprise quotes over $100k',
                        conditions: {
                          quoteAmount: { min: 100000, operator: 'greater_than', currency: 'USD' },
                          customerType: ['enterprise'],
                          priority: 'critical',
                          timeThreshold: 2,
                          businessHoursOnly: false,
                          customTimeouts: { initial: 1, reminder1: 4, reminder2: 8, escalation: 12, final: 24 }
                        }
                      })
                    }}
                  >
                    <div className="font-medium">Enterprise Critical</div>
                    <div className="text-xs text-muted-foreground">High-value immediate escalation</div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => {
                      setFormData({
                        name: 'Standard Business Quotes',
                        triggerType: 'quote_pending',
                        description: 'Regular reminders for business quotes',
                        conditions: {
                          quoteAmount: { min: 5000, max: 50000, operator: 'between', currency: 'USD' },
                          priority: 'medium',
                          timeThreshold: 24,
                          businessHoursOnly: true,
                          customTimeouts: { initial: 4, reminder1: 24, reminder2: 48, escalation: 72, final: 96 }
                        }
                      })
                    }}
                  >
                    <div className="font-medium">Standard Business</div>
                    <div className="text-xs text-muted-foreground">Regular approval workflow</div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => {
                      setFormData({
                        name: 'Quick Approval Needed',
                        triggerType: 'quote_pending',
                        description: 'Fast track for small quotes',
                        conditions: {
                          quoteAmount: { max: 5000, operator: 'less_than', currency: 'USD' },
                          priority: 'low',
                          timeThreshold: 6,
                          businessHoursOnly: true,
                          customTimeouts: { initial: 2, reminder1: 6, reminder2: 12, escalation: 24, final: 48 }
                        }
                      })
                    }}
                  >
                    <div className="font-medium">Small Quote Fast Track</div>
                    <div className="text-xs text-muted-foreground">Quick approval for small amounts</div>
                  </Button>
                </div>
              </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rule Name</Label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter rule name"
                      />
                    </div>
                    <div>
                      <Label>Trigger Type</Label>
                      <Select
                        value={formData.triggerType || ''}
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          triggerType: value as NotificationRule['triggerType'] 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quote_pending">Quote Pending</SelectItem>
                          <SelectItem value="approval_overdue">Approval Overdue</SelectItem>
                          <SelectItem value="escalation_due">Escalation Due</SelectItem>
                          <SelectItem value="approval_timeout">Approval Timeout</SelectItem>
                          <SelectItem value="quote_rejected">Quote Rejected</SelectItem>
                          <SelectItem value="quote_approved">Quote Approved</SelectItem>
                          <SelectItem value="quote_created">Quote Created</SelectItem>
                          <SelectItem value="quote_modified">Quote Modified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe when this rule should trigger"
                    />
                  </div>

                  {/* Quote Value Conditions */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Quote Value Conditions</Label>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm">Operator</Label>
                        <Select
                          value={formData.conditions?.quoteAmount?.operator || 'greater_than'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              quoteAmount: {
                                ...prev.conditions?.quoteAmount,
                                operator: value as 'greater_than' | 'less_than' | 'between' | 'equals'
                              }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Min Amount</Label>
                        <Input
                          type="number"
                          value={formData.conditions?.quoteAmount?.min || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              quoteAmount: {
                                ...prev.conditions?.quoteAmount,
                                min: Number(e.target.value)
                              }
                            }
                          }))}
                          placeholder="Minimum value"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Max Amount</Label>
                        <Input
                          type="number"
                          value={formData.conditions?.quoteAmount?.max || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              quoteAmount: {
                                ...prev.conditions?.quoteAmount,
                                max: Number(e.target.value)
                              }
                            }
                          }))}
                          placeholder="Maximum value"
                          disabled={formData.conditions?.quoteAmount?.operator !== 'between'}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Currency</Label>
                        <Select
                          value={formData.conditions?.quoteAmount?.currency || 'USD'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              quoteAmount: {
                                ...prev.conditions?.quoteAmount,
                                currency: value
                              }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Timeout Configuration */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Timeout Configuration</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm">Priority Level</Label>
                        <Select
                          value={formData.conditions?.priority || 'medium'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              priority: value as 'low' | 'medium' | 'high' | 'critical'
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Initial Timeout (hours)</Label>
                        <Input
                          type="number"
                          value={formData.conditions?.timeThreshold || 24}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              timeThreshold: Number(e.target.value)
                            }
                          }))}
                          placeholder="24"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          checked={formData.conditions?.businessHoursOnly || false}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              businessHoursOnly: checked
                            }
                          }))}
                        />
                        <Label className="text-sm">Business Hours Only</Label>
                      </div>
                    </div>

                    {/* Custom Timeout Configuration */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <Label className="text-sm font-medium">Custom Timeout Stages</Label>
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <Label className="text-xs">Initial (hrs)</Label>
                          <Input
                            type="number"
                            value={formData.conditions?.customTimeouts?.initial || 2}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                customTimeouts: {
                                  ...prev.conditions?.customTimeouts,
                                  initial: Number(e.target.value)
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reminder 1 (hrs)</Label>
                          <Input
                            type="number"
                            value={formData.conditions?.customTimeouts?.reminder1 || 24}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                customTimeouts: {
                                  ...prev.conditions?.customTimeouts,
                                  reminder1: Number(e.target.value)
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reminder 2 (hrs)</Label>
                          <Input
                            type="number"
                            value={formData.conditions?.customTimeouts?.reminder2 || 48}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                customTimeouts: {
                                  ...prev.conditions?.customTimeouts,
                                  reminder2: Number(e.target.value)
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Escalation (hrs)</Label>
                          <Input
                            type="number"
                            value={formData.conditions?.customTimeouts?.escalation || 72}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                customTimeouts: {
                                  ...prev.conditions?.customTimeouts,
                                  escalation: Number(e.target.value)
                                }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Final (hrs)</Label>
                          <Input
                            type="number"
                            value={formData.conditions?.customTimeouts?.final || 96}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                customTimeouts: {
                                  ...prev.conditions?.customTimeouts,
                                  final: Number(e.target.value)
                                }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Additional Filters</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Customer Type</Label>
                        <Select
                          value={formData.conditions?.customerType?.[0] || 'all'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              customerType: value === 'all' ? undefined : [value]
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All customer types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Customer Types</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="smb">Small/Medium Business</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Department</Label>
                        <Select
                          value={formData.conditions?.department?.[0] || 'all'}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions,
                              department: value === 'all' ? undefined : [value]
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowRuleForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRule}>
                      Create Rule
                    </Button>
                  </div>
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{analytics.totalNotifications}</p>
              </div>
              <Bell className="text-blue-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent Today</p>
                <p className="text-2xl font-bold text-green-600">{analytics.sentToday}</p>
              </div>
              <Activity className="text-green-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Escalations</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.escalationsToday}</p>
              </div>
              <ArrowUp className="text-orange-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.deliveryRate}%</p>
              </div>
              <ChartLine className="text-purple-600" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-indigo-600">{analytics.avgResponseTime}h</p>
              </div>
              <Timer className="text-indigo-600" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="analytics">Rule Performance</TabsTrigger>
          <TabsTrigger value="escalations">Escalation Chains</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Rules</CardTitle>
              <CardDescription>
                Automated rules for sending reminders and escalating quote approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationRules && notificationRules.length > 0 ? (
                  notificationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTriggerTypeIcon(rule.triggerType)}
                            <h3 className="font-semibold">{rule.name}</h3>
                          </div>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {getPriorityBadge(rule.conditions.priority)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestRule(rule.id)}
                          >
                            <Play size={14} className="mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRule(rule)}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>

                      {rule.description && (
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs font-medium">Trigger</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getTriggerTypeIcon(rule.triggerType)}
                            <span className="text-sm">{rule.triggerType.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Quote Value</Label>
                          <div className="text-sm mt-1">
                            {rule.conditions.quoteAmount ? (
                              <>
                                {rule.conditions.quoteAmount.operator === 'greater_than' && 
                                  `> ${rule.conditions.quoteAmount.currency || 'USD'} ${rule.conditions.quoteAmount.min?.toLocaleString()}`}
                                {rule.conditions.quoteAmount.operator === 'less_than' && 
                                  `< ${rule.conditions.quoteAmount.currency || 'USD'} ${rule.conditions.quoteAmount.max?.toLocaleString()}`}
                                {rule.conditions.quoteAmount.operator === 'between' && 
                                  `${rule.conditions.quoteAmount.currency || 'USD'} ${rule.conditions.quoteAmount.min?.toLocaleString()} - ${rule.conditions.quoteAmount.max?.toLocaleString()}`}
                                {rule.conditions.quoteAmount.operator === 'equals' && 
                                  `= ${rule.conditions.quoteAmount.currency || 'USD'} ${rule.conditions.quoteAmount.min?.toLocaleString()}`}
                              </>
                            ) : (
                              'Any value'
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Timeout Strategy</Label>
                          <div className="text-sm mt-1">
                            {rule.conditions.customTimeouts ? (
                              <div className="space-y-1">
                                <div>Initial: {rule.conditions.customTimeouts.initial}h</div>
                                <div>Escalation: {rule.conditions.customTimeouts.escalation}h</div>
                              </div>
                            ) : (
                              `${rule.conditions.timeThreshold} hours`
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Channels</Label>
                          <div className="flex items-center gap-1 mt-1">
                            {rule.notifications.map((notif) => (
                              <Badge key={notif.id} variant="outline" className="flex items-center gap-1">
                                {getChannelIcon(notif.type)}
                                {notif.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Advanced Configuration Display */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rule.conditions.customerType && (
                          <div>
                            <Label className="text-xs font-medium">Customer Types</Label>
                            <div className="flex gap-1 mt-1">
                              {rule.conditions.customerType.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {rule.conditions.businessHoursOnly && (
                          <div>
                            <Label className="text-xs font-medium">Business Hours</Label>
                            <Badge variant="outline" className="mt-1">
                              <Clock size={12} className="mr-1" />
                              Business hours only
                            </Badge>
                          </div>
                        )}
                        {rule.reminderSettings.smartTiming && (
                          <div>
                            <Label className="text-xs font-medium">Smart Timing</Label>
                            <Badge variant="outline" className="mt-1">
                              <Brain size={12} className="mr-1" />
                              Urgency: {rule.reminderSettings.urgencyMultiplier}x
                            </Badge>
                          </div>
                        )}
                      </div>

                      {rule.reminderSettings.enabled && (
                        <div>
                          <Label className="text-xs font-medium">Reminder Schedule</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              Every {rule.reminderSettings.intervals.join(', ')} hours
                            </Badge>
                            <Badge variant="outline">
                              Max {rule.reminderSettings.maxReminders} reminders
                            </Badge>
                            {rule.reminderSettings.escalateOnMaxReminders && (
                              <Badge variant="outline" className="text-orange-600">
                                <ArrowUp size={12} className="mr-1" />
                                Auto-escalate
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {rule.escalationChain.length > 0 && (
                        <div>
                          <Label className="text-xs font-medium">Escalation Chain</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {rule.escalationChain
                              .sort((a, b) => a.order - b.order)
                              .map((level, index) => (
                                <React.Fragment key={level.id}>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <TreeStructure size={12} />
                                    {level.name} ({level.triggerAfterHours}h)
                                  </Badge>
                                  {index < rule.escalationChain.length - 1 && (
                                    <ArrowUp size={12} className="text-muted-foreground" />
                                  )}
                                </React.Fragment>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No notification rules configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first notification rule to automate reminders and escalations
                    </p>
                    <Button onClick={() => setShowRuleForm(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Rule
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rule Performance</CardTitle>
                <CardDescription>
                  How effective are your notification rules at driving approvals?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationRules && notificationRules.length > 0 ? (
                    notificationRules.slice(0, 5).map((rule) => {
                      const successRate = Math.floor(Math.random() * 40) + 60 // Mock 60-100%
                      const avgResponseTime = Math.floor(Math.random() * 20) + 2 // Mock 2-22 hours
                      const triggeredCount = Math.floor(Math.random() * 50) + 10 // Mock 10-60 times
                      
                      return (
                        <div key={rule.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">{rule.name}</div>
                            <Badge variant={successRate > 80 ? "default" : successRate > 60 ? "secondary" : "destructive"}>
                              {successRate}% success
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Triggered</div>
                              <div className="font-medium">{triggeredCount} times</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Avg Response</div>
                              <div className="font-medium">{avgResponseTime}h</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Priority</div>
                              <div>{getPriorityBadge(rule.conditions.priority)}</div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Approval Rate</span>
                              <span>{successRate}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  successRate > 80 ? 'bg-green-500' : 
                                  successRate > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${successRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <ChartLine size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No performance data</h3>
                      <p className="text-muted-foreground">
                        Analytics will appear once notification rules are triggered
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

                    <Card>
              <CardHeader>
                <CardTitle>Quote Value Impact</CardTitle>
                <CardDescription>
                  How quote values affect approval times and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Small Quotes (&lt; $5K)</div>
                      <Badge variant="default">94% success</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Avg Approval Time</div>
                        <div className="font-medium">4.2 hours</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">156 quotes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Medium Quotes ($5K - $50K)</div>
                      <Badge variant="secondary">78% success</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Avg Approval Time</div>
                        <div className="font-medium">18.5 hours</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">89 quotes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Large Quotes (&gt; $50K)</div>
                      <Badge variant="destructive">65% success</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Avg Approval Time</div>
                        <div className="font-medium">42.3 hours</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">34 quotes</div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Lightning className="h-4 w-4" />
                    <AlertTitle>Optimization Suggestion</AlertTitle>
                    <AlertDescription>
                      Large quotes show slower approval rates. Consider reducing timeout thresholds or adding more aggressive escalation for quotes over $50K.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escalations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Chains</CardTitle>
              <CardDescription>
                Configure hierarchical escalation paths for overdue approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Lightning className="h-4 w-4" />
                <AlertTitle>Smart Escalation</AlertTitle>
                <AlertDescription>
                  Escalation chains automatically route approvals to higher authorities when timeouts occur. 
                  Configure multiple levels with different time thresholds and notification preferences.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                {notificationRules?.filter(rule => rule.escalationChain.length > 0).map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{rule.name} - Escalation Chain</h4>
                      <Badge variant="outline">{rule.escalationChain.length} levels</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {rule.escalationChain
                        .sort((a, b) => a.order - b.order)
                        .map((level, index) => (
                          <div key={level.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                              {level.order}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{level.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Triggers after {level.triggerAfterHours} hours
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {level.escalateTo.map((target, idx) => (
                                <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                  {target.type === 'role' && <Crown size={12} />}
                                  {target.type === 'user' && <Users size={12} />}
                                  {target.type === 'department' && <Building size={12} />}
                                  {target.roleId || target.userId || target.departmentId}
                                </Badge>
                              ))}
                            </div>
                            {level.requiresAcknowledgment && (
                              <Badge variant="outline" className="text-orange-600">
                                <Eye size={12} className="mr-1" />
                                Ack Required
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Complete audit trail of all notification and escalation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notificationLogs && notificationLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Quote</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificationLogs
                      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
                      .map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {log.sentAt.toLocaleDateString()} {log.sentAt.toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">Quote #{log.quoteId.slice(-6)}</div>
                            {log.metadata.quoteAmount && (
                              <div className="text-sm text-muted-foreground">
                                ${log.metadata.quoteAmount.toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {log.type === 'escalation' && <ArrowUp size={12} />}
                              {log.type === 'reminder' && <Clock size={12} />}
                              {log.type === 'test' && <Play size={12} />}
                              {log.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {getChannelIcon(log.channel)}
                              {log.channel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{log.recipient}</div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye size={14} className="mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No activity logs</h3>
                  <p className="text-muted-foreground">
                    Notification activities will appear here once rules are triggered
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Customize email, SMS, and other notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <File size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Template Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create and customize notification templates for different scenarios
                </p>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Default Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable escalations</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require acknowledgment</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Send delivery receipts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Rate Limiting</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max notifications per hour</Label>
                      <Input type="number" defaultValue="50" />
                    </div>
                    <div>
                      <Label>Max escalations per day</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start time</Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div>
                      <Label>End time</Label>
                      <Input type="time" defaultValue="17:00" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Send notifications outside business hours</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Detail Dialog */}
      {selectedRule && (
        <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTriggerTypeIcon(selectedRule.triggerType)}
                {selectedRule.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Rule Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rule Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div>
                        <Badge variant={selectedRule.isActive ? "default" : "secondary"}>
                          {selectedRule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div>
                        {getPriorityBadge(selectedRule.conditions.priority)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedRule.description}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time Threshold</Label>
                    <p className="text-sm">
                      {selectedRule.conditions.timeThreshold} hours
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRule.notifications.map((channel) => (
                      <div key={channel.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getChannelIcon(channel.type)}
                        <div className="flex-1">
                          <div className="font-medium">{channel.type.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            Priority: {channel.config.priority}
                          </div>
                        </div>
                        <Badge variant={channel.enabled ? "default" : "secondary"}>
                          {channel.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reminder Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reminder Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Reminders Enabled</Label>
                      <Badge variant={selectedRule.reminderSettings.enabled ? "default" : "secondary"}>
                        {selectedRule.reminderSettings.enabled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {selectedRule.reminderSettings.enabled && (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Reminder Intervals</Label>
                          <div className="flex gap-2 mt-1">
                            {selectedRule.reminderSettings.intervals.map((interval, index) => (
                              <Badge key={index} variant="outline">
                                {interval} hours
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Max Reminders</Label>
                            <div className="text-sm">{selectedRule.reminderSettings.maxReminders}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Auto-escalate</Label>
                            <div className="text-sm">
                              {selectedRule.reminderSettings.escalateOnMaxReminders ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}