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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
  Globe,
  Link,
  LinkBreak,
  Sync,
  SyncArrows,
  GoogleLogo,
  MicrosoftOutlookLogo,
  CalendarCheck,
  CalendarX,
  Shield,
  Key,
  CloudArrowUp,
  CloudArrowDown,
  WifiHigh,
  WifiSlash,
  Gear,
  WarningCircle,
  Info,
  Export,
  Import
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
  
  // External Calendar Integration
  externalCalendarIntegrations: {
    google?: {
      eventId: string
      calendarId: string
      syncStatus: 'synced' | 'pending' | 'failed' | 'conflict'
      lastSyncTime: Date
      conflictDetails?: string
    }
    outlook?: {
      eventId: string
      calendarId: string
      syncStatus: 'synced' | 'pending' | 'failed' | 'conflict'
      lastSyncTime: Date
      conflictDetails?: string
    }
    apple?: {
      eventId: string
      calendarId: string
      syncStatus: 'synced' | 'pending' | 'failed' | 'conflict'
      lastSyncTime: Date
      conflictDetails?: string
    }
  }
  
  // Legacy field for backwards compatibility
  externalCalendarId?: string
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced'
  
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface ExternalCalendarProvider {
  id: string
  type: 'google' | 'outlook' | 'apple' | 'exchange'
  name: string
  isConnected: boolean
  isActive: boolean
  
  // OAuth credentials
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: Date
  
  // Provider-specific settings
  settings: {
    primaryCalendarId?: string
    availableCalendars: {
      id: string
      name: string
      description?: string
      isSelected: boolean
      isPrimary: boolean
      accessRole: 'owner' | 'writer' | 'reader'
      backgroundColor?: string
    }[]
    syncDirection: 'bidirectional' | 'crm_to_external' | 'external_to_crm'
    conflictResolution: 'manual' | 'crm_wins' | 'external_wins' | 'latest_wins'
    autoCreateMeetings: boolean
    includePrivateEvents: boolean
    eventPrefix?: string // Prefix for CRM-created events
  }
  
  // Sync status
  lastSyncTime?: Date
  nextSyncTime?: Date
  syncInProgress: boolean
  syncErrors: {
    timestamp: Date
    error: string
    eventId?: string
    resolution?: string
  }[]
  
  // Statistics
  stats: {
    totalEventsSynced: number
    lastMonthSync: number
    conflictsResolved: number
    failedSyncs: number
  }
  
  companyId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface CalendarSyncConflict {
  id: string
  eventId: string
  provider: 'google' | 'outlook' | 'apple'
  conflictType: 'time_overlap' | 'duplicate_event' | 'field_mismatch' | 'deletion_conflict'
  
  // Conflict details
  crmEvent: Partial<CRMEvent>
  externalEvent: {
    id: string
    title: string
    startTime: Date
    endTime: Date
    description?: string
    location?: string
    attendees?: string[]
    lastModified: Date
  }
  
  // Difference details
  differences: {
    field: string
    crmValue: any
    externalValue: any
    severity: 'low' | 'medium' | 'high'
  }[]
  
  // Resolution options
  resolutionOptions: {
    id: string
    action: 'keep_crm' | 'keep_external' | 'merge' | 'create_both' | 'manual_edit'
    description: string
    consequences: string[]
  }[]
  
  status: 'pending' | 'resolved' | 'ignored'
  resolution?: {
    action: string
    appliedAt: Date
    appliedBy: string
    notes?: string
  }
  
  createdAt: Date
  updatedAt: Date
}

interface CalendarSyncActivity {
  id: string
  providerId: string
  activityType: 'sync_started' | 'sync_completed' | 'sync_failed' | 'event_created' | 'event_updated' | 'event_deleted' | 'conflict_detected' | 'conflict_resolved'
  
  details: {
    eventId?: string
    eventTitle?: string
    direction: 'crm_to_external' | 'external_to_crm'
    changes?: string[]
    errorMessage?: string
    duration?: number // milliseconds
  }
  
  timestamp: Date
  userId: string
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
  const [externalProviders, setExternalProviders] = useKV<ExternalCalendarProvider[]>(`crm-external-providers-${companyId}`, [])
  const [syncConflicts, setSyncConflicts] = useKV<CalendarSyncConflict[]>(`crm-sync-conflicts-${companyId}`, [])
  const [syncActivities, setSyncActivities] = useKV<CalendarSyncActivity[]>(`crm-sync-activities-${companyId}`, [])
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showProviderDialog, setShowProviderDialog] = useState(false)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedConflict, setSelectedConflict] = useState<CalendarSyncConflict | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)
  
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
    ],
    externalCalendarIntegrations: {}
  })

  // Mock data initialization
  useEffect(() => {
    // Initialize external providers if empty
    if (!externalProviders || externalProviders.length === 0) {
      const mockProviders: ExternalCalendarProvider[] = [
        {
          id: 'google-001',
          type: 'google',
          name: 'Google Calendar (john@company.com)',
          isConnected: true,
          isActive: true,
          accessToken: 'mock_google_token',
          refreshToken: 'mock_google_refresh',
          tokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            primaryCalendarId: 'primary',
            availableCalendars: [
              {
                id: 'primary',
                name: 'Primary Calendar',
                description: 'Main calendar',
                isSelected: true,
                isPrimary: true,
                accessRole: 'owner',
                backgroundColor: '#1976d2'
              },
              {
                id: 'work-meetings',
                name: 'Work Meetings',
                description: 'Business meetings calendar',
                isSelected: true,
                isPrimary: false,
                accessRole: 'owner',
                backgroundColor: '#388e3c'
              }
            ],
            syncDirection: 'bidirectional',
            conflictResolution: 'manual',
            autoCreateMeetings: true,
            includePrivateEvents: false,
            eventPrefix: '[CRM]'
          },
          lastSyncTime: new Date(Date.now() - 15 * 60 * 1000),
          nextSyncTime: new Date(Date.now() + 15 * 60 * 1000),
          syncInProgress: false,
          syncErrors: [],
          stats: {
            totalEventsSynced: 127,
            lastMonthSync: 23,
            conflictsResolved: 3,
            failedSyncs: 1
          },
          companyId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'outlook-001',
          type: 'outlook',
          name: 'Outlook Calendar (john@company.com)',
          isConnected: false,
          isActive: false,
          settings: {
            availableCalendars: [],
            syncDirection: 'bidirectional',
            conflictResolution: 'crm_wins',
            autoCreateMeetings: true,
            includePrivateEvents: false,
            eventPrefix: '[CRM]'
          },
          syncInProgress: false,
          syncErrors: [],
          stats: {
            totalEventsSynced: 0,
            lastMonthSync: 0,
            conflictsResolved: 0,
            failedSyncs: 0
          },
          companyId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setExternalProviders(mockProviders)
    }

    // Initialize sync conflicts if empty
    if (!syncConflicts || syncConflicts.length === 0) {
      const mockConflicts: CalendarSyncConflict[] = [
        {
          id: 'conflict-001',
          eventId: 'crm-evt-001',
          provider: 'google',
          conflictType: 'time_overlap',
          crmEvent: {
            id: 'crm-evt-001',
            title: 'Sales Discovery Call - TechCorp Inc.',
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 3 * 60 * 60 * 1000)
          },
          externalEvent: {
            id: 'google-evt-123',
            title: 'Team Standup',
            startTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000),
            lastModified: new Date()
          },
          differences: [
            {
              field: 'startTime',
              crmValue: new Date(Date.now() + 2 * 60 * 60 * 1000),
              externalValue: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
              severity: 'high'
            }
          ],
          resolutionOptions: [
            {
              id: 'reschedule-crm',
              action: 'keep_external',
              description: 'Reschedule CRM meeting to avoid conflict',
              consequences: ['CRM event will be moved to next available slot', 'Attendees will be notified']
            },
            {
              id: 'reschedule-external',
              action: 'keep_crm',
              description: 'Keep CRM meeting, suggest new time for external event',
              consequences: ['External event may need to be rescheduled', 'Manual coordination required']
            }
          ],
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setSyncConflicts(mockConflicts)
    }

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
          externalCalendarIntegrations: {
            google: {
              eventId: 'google-evt-001',
              calendarId: 'primary',
              syncStatus: 'synced',
              lastSyncTime: new Date()
            }
          },
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
          externalCalendarIntegrations: {
            google: {
              eventId: 'google-evt-002',
              calendarId: 'work-meetings',
              syncStatus: 'pending',
              lastSyncTime: new Date(Date.now() - 5 * 60 * 1000)
            }
          },
          syncStatus: 'pending',
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
  }, [events, templates, reminderConfigs, schedulingRules, externalProviders, syncConflicts, setEvents, setTemplates, setReminderConfigs, setSchedulingRules, setExternalProviders, setSyncConflicts, companyId, userId])

  const safeEvents = events || []
  const safeTemplates = templates || []
  const safeReminderConfigs = reminderConfigs || []
  const safeSchedulingRules = schedulingRules || []
  const safeExternalProviders = externalProviders || []
  const safeSyncConflicts = syncConflicts || []
  const safeSyncActivities = syncActivities || []

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
          externalCalendarIntegrations: {},
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
      externalCalendarIntegrations: {},
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
      reminders: [],
      externalCalendarIntegrations: {}
    })
    
    toast.success(`Meeting "${event.title}" scheduled successfully`)
    
    // Sync to external calendars if connected
    await syncEventToExternalCalendars(event)
  }

  // External Calendar Integration Functions
  const connectExternalProvider = async (providerType: 'google' | 'outlook' | 'apple') => {
    try {
      setSyncInProgress(true)
      
      // Mock OAuth flow - in production, this would open OAuth popup/redirect
      const mockAuthFlow = () => {
        return new Promise<{accessToken: string, refreshToken: string}>((resolve) => {
          setTimeout(() => {
            resolve({
              accessToken: `mock_${providerType}_token_${Date.now()}`,
              refreshToken: `mock_${providerType}_refresh_${Date.now()}`
            })
          }, 2000)
        })
      }

      toast.info(`Connecting to ${providerType} Calendar...`, {
        description: 'Opening authentication window'
      })

      const authResult = await mockAuthFlow()
      
      // Mock fetching available calendars
      const mockCalendars = [
        {
          id: 'primary',
          name: 'Primary Calendar',
          description: 'Main calendar',
          isSelected: true,
          isPrimary: true,
          accessRole: 'owner' as const,
          backgroundColor: providerType === 'google' ? '#1976d2' : '#0078d4'
        },
        {
          id: 'work',
          name: 'Work Calendar',
          description: 'Business meetings',
          isSelected: false,
          isPrimary: false,
          accessRole: 'owner' as const,
          backgroundColor: '#388e3c'
        }
      ]

      const newProvider: ExternalCalendarProvider = {
        id: `${providerType}-${Date.now()}`,
        type: providerType,
        name: `${providerType.charAt(0).toUpperCase() + providerType.slice(1)} Calendar (${userId}@company.com)`,
        isConnected: true,
        isActive: true,
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        tokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        settings: {
          primaryCalendarId: 'primary',
          availableCalendars: mockCalendars,
          syncDirection: 'bidirectional',
          conflictResolution: 'manual',
          autoCreateMeetings: true,
          includePrivateEvents: false,
          eventPrefix: '[CRM]'
        },
        lastSyncTime: new Date(),
        syncInProgress: false,
        syncErrors: [],
        stats: {
          totalEventsSynced: 0,
          lastMonthSync: 0,
          conflictsResolved: 0,
          failedSyncs: 0
        },
        companyId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setExternalProviders(current => [...(current || []), newProvider])
      
      toast.success(`${providerType.charAt(0).toUpperCase() + providerType.slice(1)} Calendar connected successfully`)
      
      // Trigger initial sync
      await performFullSync(newProvider.id)
      
    } catch (error) {
      console.error('Error connecting external provider:', error)
      toast.error(`Failed to connect ${providerType} Calendar`)
    } finally {
      setSyncInProgress(false)
    }
  }

  const disconnectExternalProvider = async (providerId: string) => {
    try {
      setExternalProviders(current => 
        (current || []).map(provider => 
          provider.id === providerId 
            ? { ...provider, isConnected: false, isActive: false }
            : provider
        )
      )
      
      // Remove external calendar data from events
      setEvents(current =>
        (current || []).map(event => ({
          ...event,
          externalCalendarIntegrations: Object.fromEntries(
            Object.entries(event.externalCalendarIntegrations || {})
              .filter(([key]) => !key.startsWith(providerId.split('-')[0]))
          )
        }))
      )
      
      toast.success('Calendar provider disconnected')
    } catch (error) {
      console.error('Error disconnecting provider:', error)
      toast.error('Failed to disconnect provider')
    }
  }

  const syncEventToExternalCalendars = async (event: CRMEvent) => {
    const activeProviders = (externalProviders || []).filter(p => p.isConnected && p.isActive)
    
    for (const provider of activeProviders) {
      try {
        if (provider.settings.syncDirection === 'external_to_crm') continue
        
        // Mock API call to create event in external calendar
        const mockCreateEvent = () => {
          return new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve(`${provider.type}-evt-${Date.now()}`)
            }, 500)
          })
        }

        const externalEventId = await mockCreateEvent()
        
        // Update event with external calendar info
        const updatedIntegrations = {
          ...event.externalCalendarIntegrations,
          [provider.type]: {
            eventId: externalEventId,
            calendarId: provider.settings.primaryCalendarId || 'primary',
            syncStatus: 'synced' as const,
            lastSyncTime: new Date()
          }
        }

        setEvents(current =>
          (current || []).map(e =>
            e.id === event.id
              ? { ...e, externalCalendarIntegrations: updatedIntegrations, syncStatus: 'synced' }
              : e
          )
        )

        // Log sync activity
        const activity: CalendarSyncActivity = {
          id: `activity-${Date.now()}`,
          providerId: provider.id,
          activityType: 'event_created',
          details: {
            eventId: event.id,
            eventTitle: event.title,
            direction: 'crm_to_external',
            changes: ['Event created in external calendar'],
            duration: 500
          },
          timestamp: new Date(),
          userId
        }

        setSyncActivities(current => [...(current || []), activity])

      } catch (error) {
        console.error(`Error syncing to ${provider.type}:`, error)
        
        // Mark as failed
        setEvents(current =>
          (current || []).map(e =>
            e.id === event.id
              ? {
                  ...e,
                  externalCalendarIntegrations: {
                    ...e.externalCalendarIntegrations,
                    [provider.type]: {
                      eventId: '',
                      calendarId: provider.settings.primaryCalendarId || 'primary',
                      syncStatus: 'failed',
                      lastSyncTime: new Date(),
                      conflictDetails: 'Failed to create event'
                    }
                  },
                  syncStatus: 'failed'
                }
              : e
          )
        )
      }
    }
  }

  const performFullSync = async (providerId?: string) => {
    try {
      setSyncInProgress(true)
      const providersToSync = providerId 
        ? (externalProviders || []).filter(p => p.id === providerId)
        : (externalProviders || []).filter(p => p.isConnected && p.isActive)

      for (const provider of providersToSync) {
        // Update provider sync status
        setExternalProviders(current =>
          (current || []).map(p =>
            p.id === provider.id ? { ...p, syncInProgress: true } : p
          )
        )

        // Mock fetching events from external calendar
        const mockFetchExternalEvents = () => {
          return new Promise<any[]>((resolve) => {
            setTimeout(() => {
              resolve([
                {
                  id: `${provider.type}-external-001`,
                  title: 'Team Meeting',
                  startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
                  endTime: new Date(Date.now() + 7 * 60 * 60 * 1000),
                  description: 'Weekly team sync',
                  attendees: ['user1@company.com', 'user2@company.com']
                }
              ])
            }, 1000)
          })
        }

        const externalEvents = await mockFetchExternalEvents()
        
        // Process external events
        for (const extEvent of externalEvents) {
          // Check if event already exists in CRM
          const existingEvent = (events || []).find(e => 
            e.externalCalendarIntegrations?.[provider.type]?.eventId === extEvent.id
          )

          if (!existingEvent && provider.settings.syncDirection !== 'crm_to_external') {
            // Create new CRM event from external event
            const newCRMEvent: CRMEvent = {
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: `${provider.settings.eventPrefix || ''} ${extEvent.title}`.trim(),
              description: extEvent.description || 'Imported from external calendar',
              startTime: extEvent.startTime,
              endTime: extEvent.endTime,
              eventType: 'customer_meeting',
              priority: 'medium',
              status: 'scheduled',
              assignedTo: [userId],
              meetingType: 'video',
              agenda: [],
              reminders: [
                { time: 15, type: 'push', sent: false }
              ],
              autoScheduled: false,
              externalCalendarIntegrations: {
                [provider.type]: {
                  eventId: extEvent.id,
                  calendarId: provider.settings.primaryCalendarId || 'primary',
                  syncStatus: 'synced',
                  lastSyncTime: new Date()
                }
              },
              syncStatus: 'synced',
              createdBy: 'external-sync',
              createdAt: new Date(),
              updatedAt: new Date()
            }

            setEvents(current => [...(current || []), newCRMEvent])
          }
        }

        // Update provider stats and status
        setExternalProviders(current =>
          (current || []).map(p =>
            p.id === provider.id 
              ? {
                  ...p,
                  syncInProgress: false,
                  lastSyncTime: new Date(),
                  stats: {
                    ...p.stats,
                    totalEventsSynced: p.stats.totalEventsSynced + externalEvents.length,
                    lastMonthSync: p.stats.lastMonthSync + externalEvents.length
                  }
                }
              : p
          )
        )

        // Log sync activity
        const activity: CalendarSyncActivity = {
          id: `sync-${Date.now()}`,
          providerId: provider.id,
          activityType: 'sync_completed',
          details: {
            direction: 'external_to_crm',
            changes: [`Imported ${externalEvents.length} events`],
            duration: 1000
          },
          timestamp: new Date(),
          userId
        }

        setSyncActivities(current => [...(current || []), activity])
      }

      toast.success('Calendar sync completed successfully')
      
    } catch (error) {
      console.error('Error during full sync:', error)
      toast.error('Calendar sync failed')
    } finally {
      setSyncInProgress(false)
    }
  }

  const resolveConflict = async (conflictId: string, resolution: string) => {
    try {
      const conflict = (syncConflicts || []).find(c => c.id === conflictId)
      if (!conflict) return

      setSyncConflicts(current =>
        (current || []).map(c =>
          c.id === conflictId
            ? {
                ...c,
                status: 'resolved',
                resolution: {
                  action: resolution,
                  appliedAt: new Date(),
                  appliedBy: userId
                }
              }
            : c
        )
      )

      toast.success('Conflict resolved successfully')
    } catch (error) {
      console.error('Error resolving conflict:', error)
      toast.error('Failed to resolve conflict')
    }
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
          <Button variant="outline" size="sm" onClick={() => setShowProviderDialog(true)}>
            <Link size={16} className="mr-2" />
            Connect Calendar
          </Button>
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
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe size={16} />
            External Calendars
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <WarningCircle size={16} />
            Sync Conflicts
          </TabsTrigger>
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
                              {dayEvents.slice(0, 3).map((event) => {
                                const hasExternalSync = Object.keys(event.externalCalendarIntegrations || {}).length > 0
                                const syncFailed = Object.values(event.externalCalendarIntegrations || {}).some(sync => sync.syncStatus === 'failed')
                                
                                return (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded truncate flex items-center gap-1 ${getPriorityColor(event.priority)} text-white`}
                                    title={`${event.title} - ${event.startTime.toLocaleTimeString()}${hasExternalSync ? ` • Synced to ${Object.keys(event.externalCalendarIntegrations || {}).join(', ')}` : ''}`}
                                  >
                                    {getEventTypeIcon(event.eventType)}
                                    <span className="truncate">{event.title}</span>
                                    {event.autoScheduled && <Lightning size={10} />}
                                    {hasExternalSync && (
                                      syncFailed ? (
                                        <WifiSlash size={10} className="text-red-300" />
                                      ) : (
                                        <WifiHigh size={10} className="text-green-300" />
                                      )
                                    )}
                                  </div>
                                )
                              })}
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
                              {Object.keys(event.externalCalendarIntegrations || {}).length > 0 && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  {Object.values(event.externalCalendarIntegrations || {}).some(sync => sync.syncStatus === 'failed') ? (
                                    <WifiSlash size={10} className="text-red-500" />
                                  ) : (
                                    <WifiHigh size={10} className="text-green-500" />
                                  )}
                                  {Object.keys(event.externalCalendarIntegrations || {}).join(', ')}
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

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={18} />
                  External Calendar Providers
                </CardTitle>
                <CardDescription>
                  Connect and manage external calendar integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeExternalProviders.length > 0 ? (
                    safeExternalProviders.map((provider) => (
                      <div key={provider.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {provider.type === 'google' && <GoogleLogo size={24} className="text-blue-600" />}
                            {provider.type === 'outlook' && <MicrosoftOutlookLogo size={24} className="text-blue-700" />}
                            <div>
                              <h4 className="font-medium">{provider.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={provider.isConnected ? 'default' : 'secondary'}>
                                  {provider.isConnected ? (
                                    <><CheckCircle size={12} className="mr-1" /> Connected</>
                                  ) : (
                                    <><X size={12} className="mr-1" /> Disconnected</>
                                  )}
                                </Badge>
                                {provider.syncInProgress && (
                                  <Badge variant="outline" className="animate-pulse">
                                    <Sync size={12} className="mr-1" />
                                    Syncing...
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {provider.isConnected ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => performFullSync(provider.id)}
                                  disabled={syncInProgress}
                                >
                                  <Sync size={14} className="mr-2" />
                                  Sync Now
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => disconnectExternalProvider(provider.id)}
                                >
                                  <LinkBreak size={14} className="mr-2" />
                                  Disconnect
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => connectExternalProvider(provider.type)}
                                disabled={syncInProgress}
                              >
                                <Link size={14} className="mr-2" />
                                Reconnect
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {provider.isConnected && (
                          <div className="space-y-3">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Sync:</span>
                                <span>{provider.lastSyncTime?.toLocaleString() || 'Never'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Events Synced:</span>
                                <span>{provider.stats.totalEventsSynced}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Sync Direction:</span>
                                <Badge variant="outline" className="text-xs">
                                  {provider.settings.syncDirection.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Connected Calendars:</h5>
                              <div className="space-y-1">
                                {provider.settings.availableCalendars
                                  .filter(cal => cal.isSelected)
                                  .map((calendar) => (
                                    <div key={calendar.id} className="flex items-center gap-2 text-sm">
                                      <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: calendar.backgroundColor }}
                                      />
                                      <span>{calendar.name}</span>
                                      {calendar.isPrimary && (
                                        <Badge variant="outline" className="text-xs">Primary</Badge>
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            </div>

                            {provider.syncErrors.length > 0 && (
                              <Alert>
                                <WarningCircle size={16} />
                                <AlertDescription>
                                  {provider.syncErrors.length} sync error(s) detected. 
                                  <Button variant="link" className="p-0 h-auto ml-2" size="sm">
                                    View Details
                                  </Button>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Globe size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-medium mb-2">No External Calendars Connected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your Google, Outlook, or other calendars to sync events automatically
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => connectExternalProvider('google')} disabled={syncInProgress}>
                          <GoogleLogo size={16} className="mr-2" />
                          Connect Google
                        </Button>
                        <Button onClick={() => connectExternalProvider('outlook')} disabled={syncInProgress}>
                          <MicrosoftOutlookLogo size={16} className="mr-2" />
                          Connect Outlook
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SyncArrows size={18} />
                  Sync Activity
                </CardTitle>
                <CardDescription>
                  Recent synchronization activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {safeSyncActivities.length > 0 ? (
                    safeSyncActivities
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .slice(0, 20)
                      .map((activity) => {
                        const provider = safeExternalProviders.find(p => p.id === activity.providerId)
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                            <div className="flex-shrink-0 mt-1">
                              {activity.activityType === 'sync_completed' && <CheckCircle size={16} className="text-green-500" />}
                              {activity.activityType === 'sync_failed' && <X size={16} className="text-red-500" />}
                              {activity.activityType === 'event_created' && <CalendarPlus size={16} className="text-blue-500" />}
                              {activity.activityType === 'event_updated' && <Calendar size={16} className="text-orange-500" />}
                              {activity.activityType === 'conflict_detected' && <WarningCircle size={16} className="text-yellow-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {activity.activityType.replace('_', ' ')}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {provider?.type || 'Unknown'}
                                </Badge>
                              </div>
                              {activity.details.eventTitle && (
                                <p className="text-muted-foreground truncate">
                                  {activity.details.eventTitle}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {activity.details.direction?.replace('_', ' ') || 'System'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {activity.timestamp.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <SyncArrows size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sync activity yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WarningCircle size={18} />
                Calendar Sync Conflicts
              </CardTitle>
              <CardDescription>
                Resolve conflicts between CRM and external calendar events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeSyncConflicts.length > 0 ? (
                  safeSyncConflicts
                    .filter(conflict => conflict.status === 'pending')
                    .map((conflict) => (
                      <div key={conflict.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-lg flex items-center gap-2">
                              <WarningCircle size={18} className="text-yellow-600" />
                              {conflict.conflictType.replace('_', ' ')} Conflict
                            </h4>
                            <Badge variant="outline" className="mt-1">
                              {conflict.provider} Calendar
                            </Badge>
                          </div>
                          <Badge variant="destructive">
                            Requires Resolution
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                            <h5 className="font-medium mb-2 text-blue-700 dark:text-blue-300">CRM Event</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong>Title:</strong> {conflict.crmEvent.title}</div>
                              <div><strong>Time:</strong> {conflict.crmEvent.startTime?.toLocaleString()}</div>
                              {conflict.crmEvent.description && (
                                <div><strong>Description:</strong> {conflict.crmEvent.description}</div>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                            <h5 className="font-medium mb-2 text-green-700 dark:text-green-300">External Event</h5>
                            <div className="space-y-1 text-sm">
                              <div><strong>Title:</strong> {conflict.externalEvent.title}</div>
                              <div><strong>Time:</strong> {conflict.externalEvent.startTime.toLocaleString()}</div>
                              {conflict.externalEvent.description && (
                                <div><strong>Description:</strong> {conflict.externalEvent.description}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium">Resolution Options:</h5>
                          <div className="grid gap-2">
                            {conflict.resolutionOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant="outline"
                                className="justify-start h-auto p-3"
                                onClick={() => resolveConflict(conflict.id, option.action)}
                              >
                                <div className="text-left">
                                  <div className="font-medium">{option.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {option.consequences.join(', ')}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500/50" />
                    <h3 className="font-medium mb-2">No Conflicts Detected</h3>
                    <p className="text-sm text-muted-foreground">
                      All calendar events are synchronized successfully
                    </p>
                  </div>
                )}

                {safeSyncConflicts.filter(c => c.status === 'resolved').length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Recently Resolved Conflicts</h4>
                    <div className="space-y-2">
                      {safeSyncConflicts
                        .filter(c => c.status === 'resolved')
                        .slice(0, 5)
                        .map((conflict) => (
                          <div key={conflict.id} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <CheckCircle size={16} className="text-green-500" />
                            <div className="flex-1">
                              <span className="text-sm">{conflict.conflictType.replace('_', ' ')} conflict resolved</span>
                              <div className="text-xs text-muted-foreground">
                                {conflict.resolution?.appliedAt.toLocaleString()} • Action: {conflict.resolution?.action}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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

      {/* External Calendar Provider Dialog */}
      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe size={20} />
              Connect External Calendar
            </DialogTitle>
            <DialogDescription>
              Integrate with your external calendars for seamless event synchronization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => connectExternalProvider('google')}>
                <CardContent className="p-6 text-center">
                  <GoogleLogo size={48} className="mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync with Gmail and Google Workspace calendars
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Bidirectional sync</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Multiple calendars</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Real-time updates</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" disabled={syncInProgress}>
                    {syncInProgress ? (
                      <>
                        <Sync size={16} className="mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link size={16} className="mr-2" />
                        Connect Google Calendar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => connectExternalProvider('outlook')}>
                <CardContent className="p-6 text-center">
                  <MicrosoftOutlookLogo size={48} className="mx-auto mb-4 text-blue-700" />
                  <h3 className="font-semibold mb-2">Microsoft Outlook</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync with Outlook and Microsoft 365 calendars
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Enterprise integration</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Teams meeting links</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Exchange support</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" disabled={syncInProgress}>
                    {syncInProgress ? (
                      <>
                        <Sync size={16} className="mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link size={16} className="mr-2" />
                        Connect Outlook Calendar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Integration Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <SyncArrows size={16} className="text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Bidirectional Sync</h5>
                      <p className="text-muted-foreground">Events sync both ways automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Bell size={16} className="text-orange-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Smart Reminders</h5>
                      <p className="text-muted-foreground">Unified notifications across platforms</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Brain size={16} className="text-purple-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Conflict Resolution</h5>
                      <p className="text-muted-foreground">AI-powered conflict detection and resolution</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Secure OAuth</h5>
                      <p className="text-muted-foreground">Enterprise-grade security and privacy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {safeExternalProviders.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Connected Providers</h4>
                  <div className="space-y-3">
                    {safeExternalProviders.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {provider.type === 'google' && <GoogleLogo size={20} className="text-blue-600" />}
                          {provider.type === 'outlook' && <MicrosoftOutlookLogo size={20} className="text-blue-700" />}
                          <div>
                            <h5 className="font-medium">{provider.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={provider.isConnected ? 'default' : 'secondary'} className="text-xs">
                                {provider.isConnected ? 'Connected' : 'Disconnected'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {provider.stats.totalEventsSynced} events synced
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={provider.isConnected ? 'destructive' : 'default'}
                          onClick={() => provider.isConnected 
                            ? disconnectExternalProvider(provider.id)
                            : connectExternalProvider(provider.type)
                          }
                        >
                          {provider.isConnected ? 'Disconnect' : 'Reconnect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProviderDialog(false)}>
              Close
            </Button>
            {safeExternalProviders.some(p => p.isConnected) && (
              <Button onClick={() => {
                performFullSync()
                setShowProviderDialog(false)
              }}>
                <Sync size={16} className="mr-2" />
                Sync All Calendars
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CRMCalendarIntegration