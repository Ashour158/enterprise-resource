import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  Calendar, 
  Clock, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Phone,
  MessageSquare,
  Target,
  TrendUp,
  Users,
  Activity,
  Brain,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Send,
  Eye,
  Filter,
  ChartLine,
  Zap
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, addDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns'

// Types
interface FollowUpRule {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Trigger conditions
  triggerType: 'age_based' | 'contact_gap' | 'status_change' | 'score_change' | 'activity_based'
  conditions: {
    leadAge?: number // days since lead creation
    contactGap?: number // days since last contact
    leadStatuses?: string[] // specific lead statuses
    leadRatings?: string[] // hot, warm, cold
    scoreThreshold?: number // AI score threshold
    activityTypes?: string[] // call, email, meeting, etc.
  }
  
  // Reminder configuration
  reminderConfig: {
    method: 'notification' | 'email' | 'sms' | 'task' | 'all'
    frequency: 'once' | 'daily' | 'weekly' | 'custom'
    customInterval?: number // hours
    escalation: boolean
    escalationDays: number
    escalationUsers: string[]
  }
  
  // AI recommendations
  aiConfig: {
    enabled: boolean
    generateMessage: boolean
    suggestBestTime: boolean
    analyzeSuccess: boolean
    adaptFrequency: boolean
  }
  
  // Templates and content
  templates: {
    subject: string
    emailTemplate: string
    smsTemplate: string
    taskDescription: string
  }
  
  // Analytics
  analytics: {
    triggered: number
    responded: number
    converted: number
    effectiveness: number
  }
  
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface FollowUpReminder {
  id: string
  ruleId: string
  leadId: string
  leadName: string
  leadEmail: string
  assignedTo: string
  
  // Status and timing
  status: 'pending' | 'sent' | 'completed' | 'snoozed' | 'escalated' | 'cancelled'
  scheduledAt: string
  sentAt?: string
  completedAt?: string
  snoozedUntil?: string
  
  // Content
  method: 'notification' | 'email' | 'sms' | 'task'
  subject: string
  message: string
  aiGenerated: boolean
  
  // Interaction tracking
  opened: boolean
  clicked: boolean
  responded: boolean
  responseType?: string
  
  // Escalation
  escalationLevel: number
  escalatedAt?: string
  escalatedTo?: string
  
  // AI insights
  aiInsights: {
    bestContactTime?: string
    successProbability: number
    recommendedAction: string
    personalizedMessage?: string
  }
  
  createdAt: string
  updatedAt: string
}

interface AutomatedFollowUpRemindersProps {
  companyId: string
  userId: string
  userRole: string
}

export function AutomatedFollowUpReminders({ companyId, userId, userRole }: AutomatedFollowUpRemindersProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [rules, setRules] = useKV<FollowUpRule[]>(`followup-rules-${companyId}`, [])
  const [reminders, setReminders] = useKV<FollowUpReminder[]>(`followup-reminders-${companyId}`, [])
  const [selectedRule, setSelectedRule] = useState<FollowUpRule | null>(null)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<FollowUpReminder | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')

  // Initialize with default rules if empty
  useEffect(() => {
    if (rules.length === 0) {
      const defaultRules: FollowUpRule[] = [
        {
          id: 'rule-1',
          name: 'New Lead Follow-up',
          description: 'Follow up with new leads after 24 hours',
          isActive: true,
          priority: 'high',
          triggerType: 'age_based',
          conditions: {
            leadAge: 1,
            leadStatuses: ['new']
          },
          reminderConfig: {
            method: 'all',
            frequency: 'once',
            escalation: true,
            escalationDays: 3,
            escalationUsers: ['manager-1']
          },
          aiConfig: {
            enabled: true,
            generateMessage: true,
            suggestBestTime: true,
            analyzeSuccess: true,
            adaptFrequency: true
          },
          templates: {
            subject: 'Welcome! Let\'s discuss your needs',
            emailTemplate: 'Hi {{firstName}}, thank you for your interest. I\'d love to learn more about your needs.',
            smsTemplate: 'Hi {{firstName}}, thanks for your interest! When would be a good time to chat?',
            taskDescription: 'Follow up with new lead {{leadName}} from {{companyName}}'
          },
          analytics: {
            triggered: 0,
            responded: 0,
            converted: 0,
            effectiveness: 0
          },
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'rule-2',
          name: 'Contact Gap Reminder',
          description: 'Remind when no contact for 7 days',
          isActive: true,
          priority: 'medium',
          triggerType: 'contact_gap',
          conditions: {
            contactGap: 7,
            leadStatuses: ['contacted', 'qualified']
          },
          reminderConfig: {
            method: 'notification',
            frequency: 'weekly',
            escalation: false,
            escalationDays: 0,
            escalationUsers: []
          },
          aiConfig: {
            enabled: true,
            generateMessage: false,
            suggestBestTime: true,
            analyzeSuccess: true,
            adaptFrequency: false
          },
          templates: {
            subject: 'Time for a check-in with {{leadName}}',
            emailTemplate: 'Hi {{firstName}}, just checking in to see how things are progressing.',
            smsTemplate: 'Hi {{firstName}}, hope you\'re well! Any updates on your project?',
            taskDescription: 'Check in with {{leadName}} - no contact for 7 days'
          },
          analytics: {
            triggered: 0,
            responded: 0,
            converted: 0,
            effectiveness: 0
          },
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'rule-3',
          name: 'Hot Lead Urgency',
          description: 'Immediate follow-up for hot leads',
          isActive: true,
          priority: 'critical',
          triggerType: 'status_change',
          conditions: {
            leadRatings: ['hot'],
            contactGap: 1
          },
          reminderConfig: {
            method: 'all',
            frequency: 'daily',
            escalation: true,
            escalationDays: 1,
            escalationUsers: ['manager-1', 'director-1']
          },
          aiConfig: {
            enabled: true,
            generateMessage: true,
            suggestBestTime: true,
            analyzeSuccess: true,
            adaptFrequency: true
          },
          templates: {
            subject: 'URGENT: Hot lead requires immediate attention',
            emailTemplate: 'Hi {{firstName}}, I understand you\'re interested in moving forward quickly. Let\'s connect today!',
            smsTemplate: 'Hi {{firstName}}, I can help expedite your project. Are you free for a quick call?',
            taskDescription: 'URGENT: Contact hot lead {{leadName}} immediately'
          },
          analytics: {
            triggered: 0,
            responded: 0,
            converted: 0,
            effectiveness: 0
          },
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setRules(defaultRules)
    }
  }, [])

  // Generate mock reminders for demo
  useEffect(() => {
    if (reminders.length === 0 && rules.length > 0) {
      const mockReminders: FollowUpReminder[] = Array.from({ length: 20 }, (_, i) => {
        const rule = rules[Math.floor(Math.random() * rules.length)]
        const scheduledDaysAgo = Math.floor(Math.random() * 7)
        const status = ['pending', 'sent', 'completed', 'snoozed'][Math.floor(Math.random() * 4)] as any
        
        return {
          id: `reminder-${i + 1}`,
          ruleId: rule.id,
          leadId: `lead-${i + 1}`,
          leadName: `Lead ${i + 1}`,
          leadEmail: `lead${i + 1}@example.com`,
          assignedTo: userId,
          status,
          scheduledAt: addDays(new Date(), -scheduledDaysAgo).toISOString(),
          sentAt: status !== 'pending' ? addDays(new Date(), -scheduledDaysAgo + 1).toISOString() : undefined,
          method: rule.reminderConfig.method === 'all' ? 'email' : rule.reminderConfig.method as any,
          subject: rule.templates.subject.replace('{{leadName}}', `Lead ${i + 1}`),
          message: rule.templates.emailTemplate.replace('{{firstName}}', `FirstName${i + 1}`),
          aiGenerated: rule.aiConfig.generateMessage,
          opened: Math.random() > 0.5,
          clicked: Math.random() > 0.7,
          responded: Math.random() > 0.8,
          escalationLevel: 0,
          aiInsights: {
            successProbability: Math.random(),
            recommendedAction: ['call', 'email', 'wait'][Math.floor(Math.random() * 3)]
          },
          createdAt: addDays(new Date(), -scheduledDaysAgo).toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
      setReminders(mockReminders)
    }
  }, [rules])

  // Calculate dashboard metrics
  const getDashboardMetrics = () => {
    const totalRules = rules.length
    const activeRules = rules.filter(r => r.isActive).length
    const totalReminders = reminders.length
    const pendingReminders = reminders.filter(r => r.status === 'pending').length
    const sentToday = reminders.filter(r => 
      r.sentAt && differenceInDays(new Date(), parseISO(r.sentAt)) === 0
    ).length
    const overallResponseRate = reminders.length > 0 
      ? (reminders.filter(r => r.responded).length / reminders.length) * 100 
      : 0

    return {
      totalRules,
      activeRules,
      totalReminders,
      pendingReminders,
      sentToday,
      overallResponseRate: Math.round(overallResponseRate)
    }
  }

  // Generate AI insights for optimization
  const generateOptimizationInsights = async () => {
    try {
      const metrics = getDashboardMetrics()
      const ruleAnalytics = rules.map(rule => ({
        name: rule.name,
        triggered: rule.analytics.triggered,
        effectiveness: rule.analytics.effectiveness
      }))

      const prompt = spark.llmPrompt`
        Analyze this follow-up reminder system performance and provide optimization recommendations:
        
        Overall Metrics:
        - Total Rules: ${metrics.totalRules}
        - Active Rules: ${metrics.activeRules}
        - Total Reminders: ${metrics.totalReminders}
        - Pending Reminders: ${metrics.pendingReminders}
        - Sent Today: ${metrics.sentToday}
        - Response Rate: ${metrics.overallResponseRate}%
        
        Rule Performance:
        ${ruleAnalytics.map(rule => `- ${rule.name}: ${rule.triggered} triggered, ${rule.effectiveness}% effective`).join('\n')}
        
        Generate 5 specific optimization recommendations focusing on:
        - Rule effectiveness improvements
        - Timing optimization
        - Message personalization
        - Escalation strategies
        - Overall system performance
        
        Return as JSON with recommendations array containing:
        - category (timing, content, rules, escalation)
        - title
        - description
        - expectedImpact (high, medium, low)
        - implementation
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)
      
      toast.success(`Generated ${result.recommendations?.length || 0} optimization insights`)
      return result.recommendations || []
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate AI insights')
      return []
    }
  }

  // Create new follow-up rule
  const createNewRule = () => {
    const newRule: FollowUpRule = {
      id: `rule-${Date.now()}`,
      name: 'New Follow-up Rule',
      description: 'Description for new rule',
      isActive: true,
      priority: 'medium',
      triggerType: 'age_based',
      conditions: {
        leadAge: 1,
        leadStatuses: ['new']
      },
      reminderConfig: {
        method: 'notification',
        frequency: 'once',
        escalation: false,
        escalationDays: 0,
        escalationUsers: []
      },
      aiConfig: {
        enabled: false,
        generateMessage: false,
        suggestBestTime: false,
        analyzeSuccess: false,
        adaptFrequency: false
      },
      templates: {
        subject: 'Follow-up with {{leadName}}',
        emailTemplate: 'Hi {{firstName}}, following up on your inquiry.',
        smsTemplate: 'Hi {{firstName}}, checking in about your project.',
        taskDescription: 'Follow up with {{leadName}}'
      },
      analytics: {
        triggered: 0,
        responded: 0,
        converted: 0,
        effectiveness: 0
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setSelectedRule(newRule)
    setShowRuleDialog(true)
  }

  // Save rule changes
  const saveRule = (rule: FollowUpRule) => {
    const updatedRule = { ...rule, updatedAt: new Date().toISOString() }
    const existingIndex = rules.findIndex(r => r.id === rule.id)
    
    if (existingIndex >= 0) {
      const newRules = [...rules]
      newRules[existingIndex] = updatedRule
      setRules(newRules)
    } else {
      setRules([...rules, updatedRule])
    }
    
    setShowRuleDialog(false)
    setSelectedRule(null)
    toast.success('Rule saved successfully')
  }

  // Delete rule
  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
    toast.success('Rule deleted successfully')
  }

  // Toggle rule active status
  const toggleRuleStatus = (ruleId: string) => {
    const newRules = rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    )
    setRules(newRules)
    
    const rule = newRules.find(r => r.id === ruleId)
    toast.success(`Rule ${rule?.isActive ? 'activated' : 'deactivated'}`)
  }

  // Mark reminder as completed
  const completeReminder = (reminderId: string) => {
    const newReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, status: 'completed' as const, completedAt: new Date().toISOString() }
        : reminder
    )
    setReminders(newReminders)
    toast.success('Reminder marked as completed')
  }

  // Snooze reminder
  const snoozeReminder = (reminderId: string, days: number) => {
    const newReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { 
            ...reminder, 
            status: 'snoozed' as const, 
            snoozedUntil: addDays(new Date(), days).toISOString()
          }
        : reminder
    )
    setReminders(newReminders)
    toast.success(`Reminder snoozed for ${days} days`)
  }

  // Filter reminders
  const getFilteredReminders = () => {
    let filtered = [...reminders]
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus)
    }
    
    if (filterMethod !== 'all') {
      filtered = filtered.filter(r => r.method === filterMethod)
    }
    
    return filtered.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  }

  const metrics = getDashboardMetrics()
  const filteredReminders = getFilteredReminders()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Automated Follow-up Reminders
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered lead aging rules with automated follow-up scheduling and escalation management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={generateOptimizationInsights}>
                <Brain size={16} className="mr-2" />
                AI Optimization
              </Button>
              <Button onClick={createNewRule}>
                <Plus size={16} className="mr-2" />
                New Rule
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{metrics.activeRules}</p>
                <p className="text-xs text-muted-foreground">of {metrics.totalRules} total</p>
              </div>
              <Settings size={20} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.pendingReminders}</p>
                <p className="text-xs text-muted-foreground">awaiting action</p>
              </div>
              <Clock size={20} className="text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics.sentToday}</p>
                <p className="text-xs text-muted-foreground">reminders</p>
              </div>
              <Send size={20} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.overallResponseRate}%</p>
                <p className="text-xs text-muted-foreground">overall</p>
              </div>
              <TrendUp size={20} className="text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reminders</p>
                <p className="text-2xl font-bold">{metrics.totalReminders}</p>
                <p className="text-xs text-muted-foreground">all time</p>
              </div>
              <Activity size={20} className="text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Powered</p>
                <p className="text-2xl font-bold text-cyan-600">{rules.filter(r => r.aiConfig.enabled).length}</p>
                <p className="text-xs text-muted-foreground">smart rules</p>
              </div>
              <Brain size={20} className="text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules">Follow-up Rules</TabsTrigger>
          <TabsTrigger value="reminders">Active Reminders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={16} />
                  Recent Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredReminders.slice(0, 10).map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{reminder.leadName}</p>
                          <p className="text-xs text-muted-foreground">{reminder.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            reminder.status === 'pending' ? 'default' :
                            reminder.status === 'sent' ? 'secondary' :
                            reminder.status === 'completed' ? 'outline' : 'destructive'
                          }>
                            {reminder.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(reminder.scheduledAt), 'MMM dd')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Rule Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine size={16} />
                  Rule Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {rules.map((rule) => (
                      <div key={rule.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="font-medium text-sm">{rule.name}</span>
                            <Badge variant={
                              rule.priority === 'critical' ? 'destructive' :
                              rule.priority === 'high' ? 'destructive' :
                              rule.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rule.priority}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {rule.analytics.effectiveness}% effective
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Triggered: {rule.analytics.triggered}</span>
                          <span>Responded: {rule.analytics.responded}</span>
                          <span>Converted: {rule.analytics.converted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className={rule.isActive ? '' : 'opacity-60'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        rule.priority === 'critical' ? 'destructive' :
                        rule.priority === 'high' ? 'destructive' :
                        rule.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {rule.priority}
                      </Badge>
                      {rule.aiConfig.enabled && (
                        <Badge variant="outline" className="bg-cyan-50">
                          <Brain size={12} className="mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRuleStatus(rule.id)}
                    />
                  </div>
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Trigger</p>
                      <p className="text-muted-foreground capitalize">{rule.triggerType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="font-medium">Method</p>
                      <p className="text-muted-foreground capitalize">{rule.reminderConfig.method}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1 text-center p-2 bg-muted/30 rounded">
                      <p className="font-medium">{rule.analytics.triggered}</p>
                      <p className="text-muted-foreground">Triggered</p>
                    </div>
                    <div className="flex-1 text-center p-2 bg-muted/30 rounded">
                      <p className="font-medium">{rule.analytics.effectiveness}%</p>
                      <p className="text-muted-foreground">Effective</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedRule(rule)
                        setShowRuleDialog(true)
                      }}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Reminders</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="snoozed">Snoozed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          {reminder.method === 'email' && <Mail size={16} />}
                          {reminder.method === 'sms' && <MessageSquare size={16} />}
                          {reminder.method === 'notification' && <Bell size={16} />}
                          {reminder.method === 'task' && <CheckCircle size={16} />}
                          <Badge variant="outline" className="mt-1 text-xs">
                            {reminder.method}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{reminder.leadName}</p>
                          <p className="text-sm text-muted-foreground">{reminder.subject}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Scheduled: {format(parseISO(reminder.scheduledAt), 'MMM dd, HH:mm')}</span>
                            {reminder.aiGenerated && (
                              <Badge variant="outline" className="text-xs">
                                <Brain size={10} className="mr-1" />
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          reminder.status === 'pending' ? 'default' :
                          reminder.status === 'sent' ? 'secondary' :
                          reminder.status === 'completed' ? 'outline' : 
                          reminder.status === 'snoozed' ? 'secondary' : 'destructive'
                        }>
                          {reminder.status}
                        </Badge>
                        
                        {reminder.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => completeReminder(reminder.id)}>
                              <CheckCircle size={14} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => snoozeReminder(reminder.id, 1)}>
                              <Clock size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedReminder(reminder)
                                setShowReminderDialog(true)
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track the effectiveness of your automated follow-up system
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalReminders}</p>
                    <p className="text-sm text-muted-foreground">Total Reminders Sent</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{metrics.overallResponseRate}%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {reminders.filter(r => r.responded && r.responseType === 'conversion').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round((reminders.filter(r => r.responded).length / Math.max(reminders.length, 1)) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium mb-2">AI Optimization Suggestions</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Increase follow-up frequency for hot leads to improve conversion rates</p>
                    <p>• Optimize email send times based on historical engagement data</p>
                    <p>• Implement personalized messaging for leads with high AI scores</p>
                    <p>• Add escalation rules for leads aging beyond 30 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure global settings for the automated follow-up system
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Default Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Default Reminder Method</Label>
                      <Select defaultValue="email">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Escalation Period (days)</Label>
                      <Input type="number" defaultValue="3" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">AI Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable AI Message Generation</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>AI Timing Optimization</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Adaptive Frequency Learning</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Configuration Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRule?.id.startsWith('rule-new') ? 'Create New Follow-up Rule' : 'Edit Follow-up Rule'}
            </DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input 
                    value={selectedRule.name}
                    onChange={(e) => setSelectedRule({...selectedRule, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={selectedRule.priority} 
                    onValueChange={(value: any) => setSelectedRule({...selectedRule, priority: value})}
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
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={selectedRule.description}
                  onChange={(e) => setSelectedRule({...selectedRule, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Type</Label>
                  <Select 
                    value={selectedRule.triggerType}
                    onValueChange={(value: any) => setSelectedRule({...selectedRule, triggerType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="age_based">Age Based</SelectItem>
                      <SelectItem value="contact_gap">Contact Gap</SelectItem>
                      <SelectItem value="status_change">Status Change</SelectItem>
                      <SelectItem value="score_change">Score Change</SelectItem>
                      <SelectItem value="activity_based">Activity Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reminder Method</Label>
                  <Select 
                    value={selectedRule.reminderConfig.method}
                    onValueChange={(value: any) => setSelectedRule({
                      ...selectedRule, 
                      reminderConfig: {...selectedRule.reminderConfig, method: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="all">All Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">AI Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable AI Features</Label>
                    <Switch 
                      checked={selectedRule.aiConfig.enabled}
                      onCheckedChange={(checked) => setSelectedRule({
                        ...selectedRule,
                        aiConfig: {...selectedRule.aiConfig, enabled: checked}
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>AI Message Generation</Label>
                    <Switch 
                      checked={selectedRule.aiConfig.generateMessage}
                      onCheckedChange={(checked) => setSelectedRule({
                        ...selectedRule,
                        aiConfig: {...selectedRule.aiConfig, generateMessage: checked}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Message Templates</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Email Subject</Label>
                    <Input 
                      value={selectedRule.templates.subject}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        templates: {...selectedRule.templates, subject: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label>Email Template</Label>
                    <Textarea 
                      value={selectedRule.templates.emailTemplate}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        templates: {...selectedRule.templates, emailTemplate: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => saveRule(selectedRule)}>
                  Save Rule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminder Details Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reminder Details</DialogTitle>
          </DialogHeader>
          {selectedReminder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Lead Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedReminder.leadName}</p>
                    <p><span className="font-medium">Email:</span> {selectedReminder.leadEmail}</p>
                    <p><span className="font-medium">Status:</span> {selectedReminder.status}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Reminder Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Method:</span> {selectedReminder.method}</p>
                    <p><span className="font-medium">Scheduled:</span> {format(parseISO(selectedReminder.scheduledAt), 'PPpp')}</p>
                    <p><span className="font-medium">AI Generated:</span> {selectedReminder.aiGenerated ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Message Content</h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium text-sm">{selectedReminder.subject}</p>
                  <p className="text-sm mt-2">{selectedReminder.message}</p>
                </div>
              </div>

              {selectedReminder.aiInsights && (
                <div>
                  <h3 className="font-medium">AI Insights</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Success Probability:</span> {Math.round(selectedReminder.aiInsights.successProbability * 100)}%</p>
                    <p><span className="font-medium">Recommended Action:</span> {selectedReminder.aiInsights.recommendedAction}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                  Close
                </Button>
                {selectedReminder.status === 'pending' && (
                  <Button onClick={() => {
                    completeReminder(selectedReminder.id)
                    setShowReminderDialog(false)
                  }}>
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}