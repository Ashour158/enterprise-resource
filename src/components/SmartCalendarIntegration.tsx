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
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Phone, 
  CheckCircle, 
  Warning, 
  Gear, 
  Plus,
  CalendarPlus,
  UserPlus,
  Briefcase,
  GraduationCap,
  Coffee,
  BookOpen,
  Shield,
  ChartLine
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendees: string[]
  location?: string
  meetingType: 'in-person' | 'video' | 'phone' | 'hybrid'
  meetingUrl?: string
  eventType: 'orientation' | 'training' | 'meeting' | 'deadline' | 'review' | 'social'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  reminders: number[] // minutes before event
  linkedOnboardingTask?: string
  departmentId?: string
  createdBy: string
  createdAt: Date
  autoScheduled: boolean
  conflictResolution?: 'manual' | 'auto-reschedule' | 'priority-override'
}

interface CalendarIntegration {
  id: string
  name: string
  type: 'google' | 'outlook' | 'teams' | 'zoom' | 'slack' | 'custom'
  isConnected: boolean
  lastSync: Date
  syncEnabled: boolean
  defaultCalendarId?: string
  accessToken?: string
  refreshToken?: string
  settings: {
    autoCreateMeetings: boolean
    defaultMeetingDuration: number
    bufferTime: number // minutes between meetings
    workingHours: {
      start: string
      end: string
      timezone: string
    }
    blackoutDates: string[]
    preferredMeetingTypes: string[]
  }
}

interface OnboardingScheduleTemplate {
  id: string
  name: string
  departmentId: string
  isDefault: boolean
  schedule: {
    dayOffset: number // days from start date
    eventType: string
    title: string
    duration: number // minutes
    attendees: string[] // role IDs or specific user IDs
    location?: string
    meetingType: 'in-person' | 'video' | 'phone' | 'hybrid'
    priority: 'low' | 'medium' | 'high' | 'critical'
    description: string
    prerequisites?: string[]
    autoSchedule: boolean
  }[]
}

interface SmartCalendarIntegrationProps {
  companyId: string
  userId: string
  departmentId?: string
  onboardingEmployeeId?: string
}

export function SmartCalendarIntegration({
  companyId,
  userId,
  departmentId,
  onboardingEmployeeId
}: SmartCalendarIntegrationProps) {
  const [events, setEvents] = useKV<CalendarEvent[]>(`calendar-events-${companyId}`, [])
  const [integrations, setIntegrations] = useKV<CalendarIntegration[]>(`calendar-integrations-${companyId}`, [])
  const [scheduleTemplates, setScheduleTemplates] = useKV<OnboardingScheduleTemplate[]>(`onboarding-schedules-${companyId}`, [])
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showIntegrationSetup, setShowIntegrationSetup] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  
  // Mock data for development
  useEffect(() => {
    if (!events || events.length === 0) {
      const mockEvents: CalendarEvent[] = [
        {
          id: 'evt-001',
          title: 'New Employee Orientation',
          description: 'Welcome session for John Smith - overview of company culture, values, and basic procedures',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
          attendees: ['hr-manager', 'john.smith', 'department-head'],
          location: 'Conference Room A',
          meetingType: 'in-person',
          eventType: 'orientation',
          priority: 'high',
          status: 'scheduled',
          reminders: [60, 15],
          linkedOnboardingTask: 'task-orientation-001',
          departmentId: 'dept-002',
          createdBy: userId,
          createdAt: new Date(),
          autoScheduled: true
        },
        {
          id: 'evt-002',
          title: 'IT Setup and Security Training',
          description: 'Account setup, security protocols, and tool configuration',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
          attendees: ['it-admin', 'john.smith'],
          meetingType: 'video',
          meetingUrl: 'https://zoom.us/j/123456789',
          eventType: 'training',
          priority: 'high',
          status: 'scheduled',
          reminders: [30, 5],
          linkedOnboardingTask: 'task-it-setup-001',
          departmentId: 'dept-002',
          createdBy: userId,
          createdAt: new Date(),
          autoScheduled: true
        },
        {
          id: 'evt-003',
          title: '30-Day Review Meeting',
          description: 'Performance review and feedback session',
          startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          attendees: ['direct-manager', 'john.smith', 'hr-representative'],
          location: 'Manager Office',
          meetingType: 'in-person',
          eventType: 'review',
          priority: 'medium',
          status: 'scheduled',
          reminders: [1440, 60], // 1 day and 1 hour
          linkedOnboardingTask: 'task-30-day-review',
          departmentId: 'dept-002',
          createdBy: userId,
          createdAt: new Date(),
          autoScheduled: true
        }
      ]
      setEvents(mockEvents)
    }

    if (!integrations || integrations.length === 0) {
      const mockIntegrations: CalendarIntegration[] = [
        {
          id: 'int-001',
          name: 'Google Calendar',
          type: 'google',
          isConnected: true,
          lastSync: new Date(),
          syncEnabled: true,
          defaultCalendarId: 'primary',
          settings: {
            autoCreateMeetings: true,
            defaultMeetingDuration: 60,
            bufferTime: 15,
            workingHours: {
              start: '09:00',
              end: '17:00',
              timezone: 'America/New_York'
            },
            blackoutDates: [],
            preferredMeetingTypes: ['video', 'in-person']
          }
        },
        {
          id: 'int-002',
          name: 'Microsoft Teams',
          type: 'teams',
          isConnected: false,
          lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          syncEnabled: false,
          settings: {
            autoCreateMeetings: false,
            defaultMeetingDuration: 60,
            bufferTime: 10,
            workingHours: {
              start: '08:30',
              end: '17:30',
              timezone: 'America/New_York'
            },
            blackoutDates: [],
            preferredMeetingTypes: ['video']
          }
        }
      ]
      setIntegrations(mockIntegrations)
    }

    if (!scheduleTemplates || scheduleTemplates.length === 0) {
      const mockTemplates: OnboardingScheduleTemplate[] = [
        {
          id: 'template-001',
          name: 'Engineering Department Onboarding',
          departmentId: 'dept-002',
          isDefault: true,
          schedule: [
            {
              dayOffset: 0,
              eventType: 'orientation',
              title: 'Welcome & Company Overview',
              duration: 120,
              attendees: ['hr-manager', 'department-head'],
              location: 'Conference Room A',
              meetingType: 'in-person',
              priority: 'high',
              description: 'Company culture, values, policies, and team introductions',
              autoSchedule: true
            },
            {
              dayOffset: 1,
              eventType: 'training',
              title: 'IT Setup & Security Training',
              duration: 90,
              attendees: ['it-admin'],
              meetingType: 'video',
              priority: 'high',
              description: 'Account setup, security protocols, development environment',
              autoSchedule: true
            },
            {
              dayOffset: 3,
              eventType: 'training',
              title: 'Technical Architecture Overview',
              duration: 180,
              attendees: ['tech-lead', 'senior-developer'],
              meetingType: 'hybrid',
              priority: 'medium',
              description: 'System architecture, coding standards, development processes',
              prerequisites: ['IT Setup & Security Training'],
              autoSchedule: true
            },
            {
              dayOffset: 7,
              eventType: 'social',
              title: 'Team Lunch',
              duration: 90,
              attendees: ['team-members'],
              location: 'Local Restaurant',
              meetingType: 'in-person',
              priority: 'low',
              description: 'Informal team bonding and relationship building',
              autoSchedule: false
            },
            {
              dayOffset: 30,
              eventType: 'review',
              title: '30-Day Performance Review',
              duration: 60,
              attendees: ['direct-manager', 'hr-representative'],
              meetingType: 'in-person',
              priority: 'medium',
              description: 'Performance feedback, goal setting, and development planning',
              autoSchedule: true
            }
          ]
        }
      ]
      setScheduleTemplates(mockTemplates)
    }
  }, [events, integrations, scheduleTemplates, setEvents, setIntegrations, setScheduleTemplates, userId])

  const safeEvents = events || []
  const safeIntegrations = integrations || []
  const safeScheduleTemplates = scheduleTemplates || []

  const handleAutoScheduleOnboarding = async (employeeId: string, startDate: Date, departmentId: string) => {
    setIsScheduling(true)
    try {
      const template = safeScheduleTemplates.find(t => t.departmentId === departmentId && t.isDefault)
      if (!template) {
        toast.error('No onboarding template found for this department')
        return
      }

      const newEvents: CalendarEvent[] = []
      
      for (const scheduleItem of template.schedule) {
        if (!scheduleItem.autoSchedule) continue

        const eventDate = new Date(startDate)
        eventDate.setDate(eventDate.getDate() + scheduleItem.dayOffset)
        
        // Find optimal time slot
        const optimalTime = await findOptimalTimeSlot(
          eventDate,
          scheduleItem.duration,
          scheduleItem.attendees
        )

        const newEvent: CalendarEvent = {
          id: `evt-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: scheduleItem.title,
          description: scheduleItem.description,
          startTime: optimalTime.start,
          endTime: optimalTime.end,
          attendees: [...scheduleItem.attendees, employeeId],
          location: scheduleItem.location,
          meetingType: scheduleItem.meetingType,
          eventType: scheduleItem.eventType as any,
          priority: scheduleItem.priority as any,
          status: 'scheduled',
          reminders: [60, 15],
          linkedOnboardingTask: `task-${scheduleItem.eventType}-${employeeId}`,
          departmentId,
          createdBy: userId,
          createdAt: new Date(),
          autoScheduled: true
        }

        // Add meeting URL for video meetings
        if (scheduleItem.meetingType === 'video' || scheduleItem.meetingType === 'hybrid') {
          newEvent.meetingUrl = await generateMeetingUrl(newEvent)
        }

        newEvents.push(newEvent)
      }

      setEvents(currentEvents => [...(currentEvents || []), ...newEvents])
      
      // Sync with external calendars
      await syncWithExternalCalendars(newEvents)
      
      toast.success(`Successfully scheduled ${newEvents.length} onboarding events`)
      
    } catch (error) {
      console.error('Error auto-scheduling onboarding:', error)
      toast.error('Failed to auto-schedule onboarding events')
    } finally {
      setIsScheduling(false)
    }
  }

  const findOptimalTimeSlot = async (
    preferredDate: Date,
    durationMinutes: number,
    attendeeIds: string[]
  ): Promise<{ start: Date; end: Date }> => {
    // Simple algorithm - in real implementation, this would check attendee availability
    const workingHours = safeIntegrations[0]?.settings.workingHours || { start: '09:00', end: '17:00' }
    const bufferTime = safeIntegrations[0]?.settings.bufferTime || 15
    
    const startHour = parseInt(workingHours.start.split(':')[0])
    const startMinute = parseInt(workingHours.start.split(':')[1])
    
    const startTime = new Date(preferredDate)
    startTime.setHours(startHour, startMinute, 0, 0)
    
    // Check for conflicts and find next available slot
    const existingEvents = safeEvents.filter(event => 
      event.startTime.toDateString() === preferredDate.toDateString()
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    
    let proposedStart = new Date(startTime)
    
    for (const event of existingEvents) {
      if (proposedStart < event.endTime && 
          new Date(proposedStart.getTime() + durationMinutes * 60000) > event.startTime) {
        // Conflict found, move to after this event
        proposedStart = new Date(event.endTime.getTime() + bufferTime * 60000)
      }
    }
    
    const proposedEnd = new Date(proposedStart.getTime() + durationMinutes * 60000)
    
    return { start: proposedStart, end: proposedEnd }
  }

  const generateMeetingUrl = async (event: CalendarEvent): Promise<string> => {
    // Mock implementation - in real app, this would integrate with Zoom/Teams/etc.
    const meetingId = Math.random().toString(36).substr(2, 11)
    return `https://zoom.us/j/${meetingId}`
  }

  const syncWithExternalCalendars = async (events: CalendarEvent[]) => {
    // Mock implementation - in real app, this would sync with Google Calendar, Outlook, etc.
    const connectedIntegrations = safeIntegrations.filter(i => i.isConnected && i.syncEnabled)
    
    for (const integration of connectedIntegrations) {
      console.log(`Syncing ${events.length} events with ${integration.name}`)
      // API calls to sync events would go here
    }
  }

  const handleConnectIntegration = async (integrationType: string) => {
    // Mock OAuth flow
    toast.info(`Connecting to ${integrationType}...`)
    
    setTimeout(() => {
      setIntegrations(current => 
        (current || []).map(integration => 
          integration.type === integrationType 
            ? { ...integration, isConnected: true, lastSync: new Date() }
            : integration
        )
      )
      toast.success(`Successfully connected to ${integrationType}`)
    }, 2000)
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'orientation': return <UserPlus size={16} />
      case 'training': return <GraduationCap size={16} />
      case 'meeting': return <Users size={16} />
      case 'deadline': return <Warning size={16} />
      case 'review': return <ChartLine size={16} />
      case 'social': return <Coffee size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
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
          <h2 className="text-2xl font-bold tracking-tight">Smart Calendar Integration</h2>
          <p className="text-muted-foreground">
            Automated scheduling for onboarding meetings and deadlines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showIntegrationSetup} onOpenChange={setShowIntegrationSetup}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Gear size={16} className="mr-2" />
                Calendar Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Calendar Integration Settings</DialogTitle>
                <DialogDescription>
                  Connect and configure external calendar services for automatic synchronization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {safeIntegrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${integration.isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {integration.isConnected 
                            ? `Last synced: ${integration.lastSync.toLocaleString()}`
                            : 'Not connected'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.syncEnabled}
                        onCheckedChange={(checked) => {
                          setIntegrations(current =>
                            (current || []).map(i =>
                              i.id === integration.id ? { ...i, syncEnabled: checked } : i
                            )
                          )
                        }}
                        disabled={!integration.isConnected}
                      />
                      {!integration.isConnected ? (
                        <Button
                          size="sm"
                          onClick={() => handleConnectIntegration(integration.type)}
                        >
                          Connect
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {onboardingEmployeeId && (
            <Button
              onClick={() => handleAutoScheduleOnboarding(
                onboardingEmployeeId,
                new Date(),
                departmentId || 'dept-002'
              )}
              disabled={isScheduling}
            >
              <CalendarPlus size={16} className="mr-2" />
              {isScheduling ? 'Scheduling...' : 'Auto-Schedule Onboarding'}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="templates">Schedule Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendar Events</CardTitle>
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
                      <Button size="sm" onClick={() => setShowCreateEvent(true)}>
                        <Plus size={16} className="mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>
                    
                    {/* Simplified calendar grid - would use a proper calendar library in production */}
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
                            className={`min-h-[80px] p-2 border rounded-lg hover:bg-muted/50 cursor-pointer ${
                              date.toDateString() === new Date().toDateString() ? 'bg-primary/10 border-primary' : ''
                            }`}
                          >
                            <div className="text-sm font-medium">{date.getDate()}</div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate ${getPriorityColor(event.priority)} text-white`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayEvents.length - 2} more
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
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getTodaysEvents().length > 0 ? (
                      getTodaysEvents().map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(event.priority)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.eventType)}
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.eventType}
                              </Badge>
                              {event.autoScheduled && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {safeIntegrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${integration.isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">{integration.name}</span>
                        </div>
                        <Badge variant={integration.isConnected ? 'default' : 'secondary'}>
                          {integration.isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Next 5 scheduled events across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className={`w-4 h-4 rounded-full mt-1 ${getPriorityColor(event.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.eventType)}
                          <h3 className="font-semibold">{event.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{event.eventType}</Badge>
                          <Badge variant={event.status === 'scheduled' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          {event.autoScheduled && (
                            <Badge variant="secondary">Auto-Scheduled</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {event.startTime.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {event.attendees.length} attendees
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                        )}
                        {event.meetingUrl && (
                          <div className="flex items-center gap-1">
                            <Video size={14} />
                            Video Meeting
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Schedule Templates</CardTitle>
              <CardDescription>
                Pre-configured schedules for different departments and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeScheduleTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.schedule.length} scheduled events
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Edit Template
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {template.schedule.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="min-w-fit">
                            Day {item.dayOffset}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {getEventIcon(item.eventType)}
                            <span>{item.title}</span>
                          </div>
                          <span className="text-muted-foreground">
                            ({item.duration} min)
                          </span>
                          {item.autoSchedule && (
                            <Badge variant="secondary" className="text-xs">
                              Auto
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
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
                  <Gear className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connected Services</p>
                    <p className="text-2xl font-bold">{safeIntegrations.filter(i => i.isConnected).length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}