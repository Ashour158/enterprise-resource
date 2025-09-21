import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import CRMQuickActions from '@/components/CRMQuickActions'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Phone, 
  Bell, 
  Plus,
  CalendarPlus,
  UserPlus,
  Briefcase,
  Mail,
  PhoneCall,
  VideoCamera,
  MapTrifold,
  Warning,
  CheckCircle,
  X,
  ArrowRight,
  Brain,
  Lightning,
  Target,
  Timer,
  Repeat,
  Globe
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CRMEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  eventType: 'lead_follow_up' | 'sales_call' | 'demo_meeting' | 'proposal_presentation' | 'contract_negotiation' | 'customer_meeting' | 'quote_review' | 'deal_closing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  
  // CRM-specific fields
  leadId?: string
  contactId?: string
  accountId?: string
  dealId?: string
  quoteId?: string
  assignedTo: string[]
  
  // Meeting details
  meetingType: 'in-person' | 'video' | 'phone' | 'hybrid'
  location?: string
  meetingUrl?: string
  dialInNumber?: string
  agenda: string[]
  
  // Notification settings
  reminders: {
    time: number // minutes before
    type: 'email' | 'sms' | 'push' | 'in-app'
    sent: boolean
  }[]
  
  // AI-powered features
  aiSuggestions?: {
    optimalTiming: {
      suggestedTime: Date
      confidence: number
      reasoning: string
    }
    preparationTasks: string[]
    discussionPoints: string[]
    followUpActions: string[]
  }
  
  // Automation
  autoScheduled: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    interval: number
    endDate?: Date
    maxOccurrences?: number
    customDays?: number[] // for weekly patterns
  }
  
  // Integration data
  externalCalendarId?: string
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced'
  
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface CRMCalendarTemplate {
  id: string
  name: string
  eventType: string
  duration: number // minutes
  defaultAgenda: string[]
  defaultReminders: {
    time: number
    type: 'email' | 'sms' | 'push' | 'in-app'
  }[]
  meetingType: 'in-person' | 'video' | 'phone' | 'hybrid'
  autoSchedulingRules: {
    leadScoreThreshold?: number
    dealValueThreshold?: number
    timeWindow: {
      start: string // HH:MM
      end: string // HH:MM
    }
    preferredDays: number[]
    bufferTime: number // minutes between meetings
  }
  isActive: boolean
  companyId: string
}

interface ReminderConfiguration {
  id: string
  name: string
  eventTypes: string[]
  reminderSchedule: {
    time: number // minutes before
    type: 'email' | 'sms' | 'push' | 'in-app'
    template: string
    isActive: boolean
  }[]
  escalationRules?: {
    noResponseTime: number // minutes
    escalateTo: string[]
    escalationMessage: string
  }
  companyId: string
}

interface SchedulingRule {
  id: string
  name: string
  triggerCondition: {
    type: 'lead_score_change' | 'deal_stage_change' | 'quote_sent' | 'contact_form_submission' | 'email_response' | 'phone_call_completed'
    threshold?: number
    value?: string
  }
  action: {
    eventType: string
    timeOffset: number // minutes from trigger
    duration: number
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignToSalesRep: boolean
    autoConfirm: boolean
  }
  isActive: boolean
  companyId: string
}

interface CRMCalendarIntegrationProps {
  companyId: string
  userId: string
  userRole: string
}

export function CRMCalendarIntegration({
  companyId,
  userId,
  userRole
}: CRMCalendarIntegrationProps) {
  const [events, setEvents] = useKV<CRMEvent[]>(`crm-calendar-events-${companyId}`, [])
  const [templates, setTemplates] = useKV<CRMCalendarTemplate[]>(`crm-calendar-templates-${companyId}`, [])
  const [reminderConfigs, setReminderConfigs] = useKV<ReminderConfiguration[]>(`crm-reminder-configs-${companyId}`, [])
  const [schedulingRules, setSchedulingRules] = useKV<SchedulingRule[]>(`crm-scheduling-rules-${companyId}`, [])
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Form states
  const [newEvent, setNewEvent] = useState<Partial<CRMEvent>>({
    title: '',
    description: '',
    eventType: 'sales_call',
    priority: 'medium',
    meetingType: 'video',
    agenda: [],
    assignedTo: [userId],
    reminders: [
      { time: 60, type: 'email', sent: false },
      { time: 15, type: 'push', sent: false }
    ]
  })

  // Mock data initialization
  useEffect(() => {
    if (!events || events.length === 0) {
      const mockEvents: CRMEvent[] = [
        {
          id: 'crm-evt-001',
          title: 'Sales Discovery Call - TechCorp Inc.',
          description: 'Initial discovery call to understand TechCorp\'s requirements for our ERP solution',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
          eventType: 'sales_call',
          priority: 'high',
          status: 'scheduled',
          leadId: 'lead-001',
          contactId: 'contact-001',
          accountId: 'account-001',
          assignedTo: [userId, 'sales-rep-001'],
          meetingType: 'video',
          meetingUrl: 'https://zoom.us/j/1234567890',
          agenda: [
            'Company introduction and background',
            'Current pain points and challenges',
            'Budget and timeline discussion',
            'Next steps and proposal timeline'
          ],
          reminders: [
            { time: 60, type: 'email', sent: false },
            { time: 15, type: 'push', sent: false },
            { time: 5, type: 'in-app', sent: false }
          ],
          aiSuggestions: {
            optimalTiming: {
              suggestedTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
              confidence: 85,
              reasoning: 'Based on prospect\'s time zone and historical meeting acceptance rates'
            },
            preparationTasks: [
              'Review TechCorp\'s website and recent news',
              'Prepare industry-specific case studies',
              'Update lead scoring based on recent interactions'
            ],
            discussionPoints: [
              'Integration with existing SAP system',
              'Multi-location deployment requirements',
              'Training and support needs'
            ],
            followUpActions: [
              'Send technical proposal within 48 hours',
              'Schedule technical demo with IT team',
              'Connect with procurement department'
            ]
          },
          autoScheduled: false,
          syncStatus: 'synced',
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'crm-evt-002',
          title: 'Product Demo - RetailPlus Solutions',
          description: 'Comprehensive product demonstration focusing on inventory management and POS integration',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 min duration
          eventType: 'demo_meeting',
          priority: 'high',
          status: 'confirmed',
          leadId: 'lead-002',
          contactId: 'contact-002',
          dealId: 'deal-001',
          assignedTo: [userId, 'sales-engineer-001'],
          meetingType: 'hybrid',
          location: 'Client Office - 123 Main St, New York, NY',
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...',
          agenda: [
            'Welcome and introductions',
            'Live demo of inventory management module',
            'POS integration walkthrough',
            'Q&A session',
            'Pricing discussion and next steps'
          ],
          reminders: [
            { time: 1440, type: 'email', sent: true }, // 24 hours
            { time: 60, type: 'email', sent: false },
            { time: 30, type: 'sms', sent: false },
            { time: 10, type: 'push', sent: false }
          ],
          autoScheduled: true,
          syncStatus: 'synced',
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'crm-evt-003',
          title: 'Contract Negotiation - Global Manufacturing',
          description: 'Final contract terms discussion and signing ceremony',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
          eventType: 'contract_negotiation',
          priority: 'urgent',
          status: 'scheduled',
          accountId: 'account-003',
          dealId: 'deal-002',
          quoteId: 'quote-001',
          assignedTo: [userId, 'sales-director-001', 'legal-001'],
          meetingType: 'in-person',
          location: 'Conference Room A - HQ Building',
          agenda: [
            'Contract terms review',
            'Pricing and payment schedule finalization',
            'Implementation timeline discussion',
            'Support and maintenance agreement',
            'Contract signing and celebration'
          ],
          reminders: [
            { time: 2880, type: 'email', sent: true }, // 48 hours
            { time: 1440, type: 'email', sent: false }, // 24 hours
            { time: 240, type: 'sms', sent: false }, // 4 hours
            { time: 60, type: 'push', sent: false },
            { time: 15, type: 'in-app', sent: false }
          ],
          autoScheduled: false,
          recurringPattern: {
            frequency: 'weekly',
            interval: 1,
            maxOccurrences: 4,
            customDays: [2, 4] // Tuesday and Thursday
          },
          syncStatus: 'synced',
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setEvents(mockEvents)
    }

    if (!templates || templates.length === 0) {
      const mockTemplates: CRMCalendarTemplate[] = [
        {
          id: 'template-001',
          name: 'Sales Discovery Call',
          eventType: 'sales_call',
          duration: 60,
          defaultAgenda: [
            'Introduction and rapport building',
            'Current situation analysis',
            'Pain points identification',
            'Budget and timeline discussion',
            'Next steps planning'
          ],
          defaultReminders: [
            { time: 60, type: 'email' },
            { time: 15, type: 'push' }
          ],
          meetingType: 'video',
          autoSchedulingRules: {
            leadScoreThreshold: 75,
            timeWindow: { start: '09:00', end: '17:00' },
            preferredDays: [1, 2, 3, 4, 5], // Monday to Friday
            bufferTime: 15
          },
          isActive: true,
          companyId
        },
        {
          id: 'template-002',
          name: 'Product Demo Session',
          eventType: 'demo_meeting',
          duration: 90,
          defaultAgenda: [
            'Welcome and objectives',
            'Live product demonstration',
            'Feature deep-dive based on requirements',
            'Q&A session',
            'Pricing and implementation discussion'
          ],
          defaultReminders: [
            { time: 1440, type: 'email' },
            { time: 60, type: 'email' },
            { time: 30, type: 'sms' }
          ],
          meetingType: 'hybrid',
          autoSchedulingRules: {
            dealValueThreshold: 50000,
            timeWindow: { start: '10:00', end: '16:00' },
            preferredDays: [2, 3, 4], // Tuesday to Thursday
            bufferTime: 30
          },
          isActive: true,
          companyId
        }
      ]
      setTemplates(mockTemplates)
    }

    if (!reminderConfigs || reminderConfigs.length === 0) {
      const mockReminderConfigs: ReminderConfiguration[] = [
        {
          id: 'reminder-001',
          name: 'High-Priority Meeting Reminders',
          eventTypes: ['contract_negotiation', 'proposal_presentation'],
          reminderSchedule: [
            { time: 2880, type: 'email', template: 'high_priority_48h', isActive: true }, // 48 hours
            { time: 1440, type: 'email', template: 'high_priority_24h', isActive: true }, // 24 hours
            { time: 240, type: 'sms', template: 'high_priority_4h', isActive: true }, // 4 hours
            { time: 60, type: 'push', template: 'high_priority_1h', isActive: true },
            { time: 15, type: 'in-app', template: 'high_priority_15m', isActive: true }
          ],
          escalationRules: {
            noResponseTime: 60, // minutes
            escalateTo: ['sales-manager-001', 'sales-director-001'],
            escalationMessage: 'High-priority meeting confirmation needed'
          },
          companyId
        },
        {
          id: 'reminder-002',
          name: 'Standard Sales Meeting Reminders',
          eventTypes: ['sales_call', 'demo_meeting', 'customer_meeting'],
          reminderSchedule: [
            { time: 1440, type: 'email', template: 'standard_24h', isActive: true },
            { time: 60, type: 'email', template: 'standard_1h', isActive: true },
            { time: 15, type: 'push', template: 'standard_15m', isActive: true }
          ],
          companyId
        }
      ]
      setReminderConfigs(mockReminderConfigs)
    }

    if (!schedulingRules || schedulingRules.length === 0) {
      const mockSchedulingRules: SchedulingRule[] = [
        {
          id: 'rule-001',
          name: 'High-Score Lead Auto-Schedule',
          triggerCondition: {
            type: 'lead_score_change',
            threshold: 80
          },
          action: {
            eventType: 'sales_call',
            timeOffset: 60, // 1 hour after trigger
            duration: 60,
            priority: 'high',
            assignToSalesRep: true,
            autoConfirm: false
          },
          isActive: true,
          companyId
        },
        {
          id: 'rule-002',
          name: 'Quote Follow-up Auto-Schedule',
          triggerCondition: {
            type: 'quote_sent'
          },
          action: {
            eventType: 'quote_review',
            timeOffset: 2880, // 48 hours after quote sent
            duration: 45,
            priority: 'medium',
            assignToSalesRep: true,
            autoConfirm: false
          },
          isActive: true,
          companyId
        }
      ]
      setSchedulingRules(mockSchedulingRules)
    }
  }, [events, templates, reminderConfigs, schedulingRules, setEvents, setTemplates, setReminderConfigs, setSchedulingRules, companyId, userId])

  const safeEvents = events || []
  const safeTemplates = templates || []
  const safeReminderConfigs = reminderConfigs || []
  const safeSchedulingRules = schedulingRules || []

  // AI-powered scheduling logic
  const generateAISchedulingSuggestions = async (leadId: string, contactId: string): Promise<CRMEvent['aiSuggestions']> => {
    // Mock AI analysis - in real implementation, this would call AI service
    const suggestions = {
      optimalTiming: {
        suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        confidence: 78,
        reasoning: 'Based on contact\'s timezone, past meeting preferences, and industry patterns'
      },
      preparationTasks: [
        'Review contact\'s recent email interactions',
        'Analyze company\'s recent financial reports',
        'Prepare industry-specific value propositions',
        'Update CRM with latest contact information'
      ],
      discussionPoints: [
        'Current system limitations and pain points',
        'ROI expectations and budget considerations',
        'Implementation timeline and resource requirements',
        'Integration with existing systems'
      ],
      followUpActions: [
        'Send meeting summary within 2 hours',
        'Prepare detailed proposal based on discussion',
        'Schedule technical deep-dive with IT team',
        'Connect with decision-making stakeholders'
      ]
    }

    return suggestions
  }

  // Automated scheduling based on triggers
  const triggerAutomaticScheduling = async (triggerType: string, entityId: string, metadata?: any) => {
    const applicableRules = safeSchedulingRules.filter(rule => 
      rule.isActive && rule.triggerCondition.type === triggerType
    )

    for (const rule of applicableRules) {
      try {
        const template = safeTemplates.find(t => t.eventType === rule.action.eventType)
        if (!template) continue

        const eventTime = new Date(Date.now() + rule.action.timeOffset * 60 * 1000)
        const aiSuggestions = await generateAISchedulingSuggestions(entityId, entityId)

        const newEvent: CRMEvent = {
          id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${template.name} - Auto-scheduled`,
          description: `Automatically scheduled based on ${triggerType} trigger`,
          startTime: eventTime,
          endTime: new Date(eventTime.getTime() + rule.action.duration * 60 * 1000),
          eventType: rule.action.eventType as any,
          priority: rule.action.priority,
          status: rule.action.autoConfirm ? 'confirmed' : 'scheduled',
          leadId: triggerType.includes('lead') ? entityId : undefined,
          contactId: triggerType.includes('contact') ? entityId : undefined,
          dealId: triggerType.includes('deal') ? entityId : undefined,
          quoteId: triggerType.includes('quote') ? entityId : undefined,
          assignedTo: rule.action.assignToSalesRep ? [userId] : [],
          meetingType: template.meetingType,
          agenda: template.defaultAgenda,
          reminders: template.defaultReminders.map(r => ({ ...r, sent: false })),
          aiSuggestions,
          autoScheduled: true,
          syncStatus: 'pending',
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        setEvents(current => [...(current || []), newEvent])
        
        // Send notification about auto-scheduled meeting
        toast.info(`Meeting auto-scheduled: ${newEvent.title}`, {
          description: `Scheduled for ${eventTime.toLocaleString()}`,
          action: {
            label: 'View',
            onClick: () => console.log('View meeting:', newEvent.id)
          }
        })

        // Trigger reminder notifications
        await scheduleReminderNotifications(newEvent)

      } catch (error) {
        console.error('Error in automatic scheduling:', error)
        toast.error(`Failed to auto-schedule meeting for ${rule.name}`)
      }
    }
  }

  // Reminder notification system
  const scheduleReminderNotifications = async (event: CRMEvent) => {
    const config = safeReminderConfigs.find(c => 
      c.eventTypes.includes(event.eventType)
    )

    if (!config) return

    for (const reminder of config.reminderSchedule) {
      if (!reminder.isActive) continue

      const reminderTime = new Date(event.startTime.getTime() - reminder.time * 60 * 1000)
      
      // In production, this would schedule actual notifications
      console.log(`Scheduling ${reminder.type} reminder for ${event.title} at ${reminderTime.toLocaleString()}`)
      
      // Mock notification scheduling
      setTimeout(() => {
        sendReminderNotification(event, reminder)
      }, Math.max(0, reminderTime.getTime() - Date.now()))
    }
  }

  const sendReminderNotification = (event: CRMEvent, reminder: any) => {
    const message = `Reminder: ${event.title} starts in ${reminder.time} minutes`
    
    switch (reminder.type) {
      case 'email':
        // Send email reminder
        console.log('Sending email reminder:', message)
        break
      case 'sms':
        // Send SMS reminder
        console.log('Sending SMS reminder:', message)
        break
      case 'push':
        // Send push notification
        console.log('Sending push notification:', message)
        break
      case 'in-app':
        // Show in-app notification
        toast.info(message, {
          duration: 10000,
          action: {
            label: 'Join Meeting',
            onClick: () => {
              if (event.meetingUrl) {
                window.open(event.meetingUrl, '_blank')
              }
            }
          }
        })
        break
    }

    // Mark reminder as sent
    setEvents(current => 
      (current || []).map(e => 
        e.id === event.id 
          ? {
              ...e,
              reminders: e.reminders.map(r => 
                r.time === reminder.time && r.type === reminder.type 
                  ? { ...r, sent: true }
                  : r
              )
            }
          : e
      )
    )
  }

  // Event management functions
  const createEvent = async () => {
    if (!newEvent.title || !newEvent.startTime) {
      toast.error('Please fill in required fields')
      return
    }

    const template = safeTemplates.find(t => t.eventType === newEvent.eventType)
    
    const event: CRMEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newEvent,
      startTime: newEvent.startTime!,
      endTime: newEvent.endTime || new Date(newEvent.startTime!.getTime() + (template?.duration || 60) * 60 * 1000),
      agenda: newEvent.agenda || template?.defaultAgenda || [],
      reminders: newEvent.reminders || template?.defaultReminders.map(r => ({ ...r, sent: false })) || [],
      autoScheduled: false,
      syncStatus: 'pending',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'scheduled'
    } as CRMEvent

    // Generate AI suggestions
    if (event.leadId || event.contactId) {
      event.aiSuggestions = await generateAISchedulingSuggestions(
        event.leadId || event.contactId!,
        event.contactId || event.leadId!
      )
    }

    setEvents(current => [...(current || []), event])
    await scheduleReminderNotifications(event)
    
    setShowCreateEvent(false)
    setNewEvent({
      title: '',
      description: '',
      eventType: 'sales_call',
      priority: 'medium',
      meetingType: 'video',
      agenda: [],
      assignedTo: [userId],
      reminders: []
    })
    
    toast.success(`Meeting "${event.title}" scheduled successfully`)
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'sales_call': return <PhoneCall size={16} />
      case 'demo_meeting': return <VideoCamera size={16} />
      case 'proposal_presentation': return <Briefcase size={16} />
      case 'contract_negotiation': return <Target size={16} />
      case 'customer_meeting': return <Users size={16} />
      case 'quote_review': return <Mail size={16} />
      case 'deal_closing': return <CheckCircle size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUpcomingEvents = () => {
    return safeEvents
      .filter(event => event.startTime > new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5)
  }

  const getTodaysEvents = () => {
    const today = new Date()
    return safeEvents.filter(event => 
      event.startTime.toDateString() === today.toDateString()
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Calendar Integration</h2>
          <p className="text-muted-foreground">
            Automated meeting scheduling and intelligent reminder notifications for CRM activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
            <Lightning size={16} className="mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowReminderDialog(true)}>
            <Bell size={16} className="mr-2" />
            Reminders
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowRuleDialog(true)}>
            <Brain size={16} className="mr-2" />
            Auto Rules
          </Button>
          <Button onClick={() => setShowCreateEvent(true)}>
            <CalendarPlus size={16} className="mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="analytics">Meeting Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation Center</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>CRM Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => triggerAutomaticScheduling('lead_score_change', 'lead-001')}
                      >
                        <Brain size={16} className="mr-2" />
                        Trigger AI
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simplified calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - date.getDay() + i)
                        const dayEvents = safeEvents.filter(event =>
                          event.startTime.toDateString() === date.toDateString()
                        )
                        
                        return (
                          <div
                            key={i}
                            className={`min-h-[100px] p-2 border rounded-lg hover:bg-muted/50 cursor-pointer ${
                              date.toDateString() === new Date().toDateString() ? 'bg-primary/10 border-primary' : ''
                            }`}
                          >
                            <div className="text-sm font-medium">{date.getDate()}</div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate flex items-center gap-1 ${getPriorityColor(event.priority)} text-white`}
                                  title={`${event.title} - ${event.startTime.toLocaleTimeString()}`}
                                >
                                  {getEventTypeIcon(event.eventType)}
                                  <span className="truncate">{event.title}</span>
                                  {event.autoScheduled && <Lightning size={10} />}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={18} />
                    Today's Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTodaysEvents().length > 0 ? (
                      getTodaysEvents().map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                          <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(event.priority)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.eventType)}
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                              {event.autoScheduled && <Lightning size={12} className="text-yellow-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                              {event.status === 'confirmed' && (
                                <Badge variant="default" className="text-xs">
                                  Confirmed
                                </Badge>
                              )}
                            </div>
                            {event.meetingUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 h-7 text-xs"
                                onClick={() => window.open(event.meetingUrl, '_blank')}
                              >
                                <Video size={12} className="mr-1" />
                                Join Meeting
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No meetings scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell size={18} />
                    Active Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {safeEvents
                      .filter(event => event.reminders.some(r => !r.sent && new Date(event.startTime.getTime() - r.time * 60 * 1000) > new Date()))
                      .slice(0, 3)
                      .map((event) => (
                        <div key={event.id} className="text-sm p-2 border rounded">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {event.reminders.filter(r => !r.sent).length} pending reminders
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              <CRMQuickActions
                companyId={companyId}
                userId={userId}
                onScheduleMeeting={(type: string, entityId: string, entityType: string) => {
                  setNewEvent({
                    ...newEvent,
                    title: `${type.replace('_', ' ')} with ${entityType} ${entityId}`,
                    eventType: type.includes('call') ? 'sales_call' : type.includes('demo') ? 'demo_meeting' : 'customer_meeting',
                    leadId: entityType === 'lead' ? entityId : undefined,
                    contactId: entityType === 'contact' ? entityId : undefined,
                    accountId: entityType === 'account' ? entityId : undefined,
                    dealId: entityType === 'deal' ? entityId : undefined,
                    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to tomorrow
                  })
                  setShowCreateEvent(true)
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming CRM Meetings</CardTitle>
              <CardDescription>
                Next scheduled meetings with AI insights and preparation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full ${getPriorityColor(event.priority)}`} />
                          {getEventTypeIcon(event.eventType)}
                          <h3 className="font-semibold">{event.title}</h3>
                          {event.autoScheduled && (
                            <Badge variant="secondary" className="text-xs">
                              <Lightning size={10} className="mr-1" />
                              Auto-scheduled
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} />
                              {event.startTime.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} />
                              {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={14} />
                              {event.assignedTo.length} attendees
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {event.meetingType === 'video' && event.meetingUrl && (
                              <div className="flex items-center gap-2 text-sm">
                                <Video size={14} />
                                <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  Join Video Call
                                </a>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin size={14} />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {event.eventType.replace('_', ' ')}
                              </Badge>
                              <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {event.aiSuggestions && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Brain size={14} />
                              AI Insights & Preparation
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <h5 className="font-medium mb-1">Preparation Tasks:</h5>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {event.aiSuggestions.preparationTasks.slice(0, 3).map((task, idx) => (
                                    <li key={idx}>{task}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-1">Discussion Points:</h5>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {event.aiSuggestions.discussionPoints.slice(0, 3).map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="default">
                            <CheckCircle size={14} className="mr-2" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline">
                            <Timer size={14} className="mr-2" />
                            Reschedule
                          </Button>
                          {event.meetingUrl && (
                            <Button size="sm" variant="outline" onClick={() => window.open(event.meetingUrl, '_blank')}>
                              <Video size={14} className="mr-2" />
                              Join Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Meetings</p>
                    <p className="text-2xl font-bold">{safeEvents.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Auto-Scheduled</p>
                    <p className="text-2xl font-bold">{safeEvents.filter(e => e.autoScheduled).length}</p>
                  </div>
                  <Lightning className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">
                      {safeEvents.filter(e => {
                        const now = new Date()
                        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                        return e.startTime >= now && e.startTime <= weekFromNow
                      }).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                    <p className="text-2xl font-bold">{safeEvents.filter(e => e.status === 'confirmed').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Rules</CardTitle>
                <CardDescription>
                  Automated meeting scheduling based on CRM triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeSchedulingRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Trigger: {rule.triggerCondition.type} → Schedule: {rule.action.eventType}
                        </p>
                      </div>
                      <Switch checked={rule.isActive} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reminder Templates</CardTitle>
                <CardDescription>
                  Automated reminder notifications for different meeting types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeReminderConfigs.map((config) => (
                    <div key={config.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {config.eventTypes.join(', ')} • {config.reminderSchedule.length} reminders
                      </p>
                      <div className="flex gap-1">
                        {config.reminderSchedule.map((reminder, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {reminder.time}m - {reminder.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule CRM Meeting</DialogTitle>
            <DialogDescription>
              Create a new meeting with automated reminders and AI-powered insights
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Meeting Type *</Label>
                <Select value={newEvent.eventType} onValueChange={(value: any) => setNewEvent({ ...newEvent, eventType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_call">Sales Call</SelectItem>
                    <SelectItem value="demo_meeting">Product Demo</SelectItem>
                    <SelectItem value="proposal_presentation">Proposal Presentation</SelectItem>
                    <SelectItem value="contract_negotiation">Contract Negotiation</SelectItem>
                    <SelectItem value="customer_meeting">Customer Meeting</SelectItem>
                    <SelectItem value="quote_review">Quote Review</SelectItem>
                    <SelectItem value="deal_closing">Deal Closing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newEvent.priority} onValueChange={(value: any) => setNewEvent({ ...newEvent, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meetingType">Meeting Format</Label>
                <Select value={newEvent.meetingType} onValueChange={(value: any) => setNewEvent({ ...newEvent, meetingType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newEvent.startTime ? new Date(newEvent.startTime.getTime() - newEvent.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: new Date(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Meeting description and objectives"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location / Meeting URL</Label>
                <Input
                  id="location"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Conference room or video link"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              Cancel
            </Button>
            <Button onClick={createEvent}>
              <CalendarPlus size={16} className="mr-2" />
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CRMCalendarIntegration