import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  GoogleLogo,
  MicrosoftOutlookLogo,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  VideoCamera,
  Bell,
  Globe,
  Link as LinkIcon,
  Check,
  Warning,
  Info,
  ArrowRight,
  Plus,
  Pencil,
  Trash,
  Copy,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Phone,
  UserPlus,
  Gear,
  Lightning,
  Robot
} from '@phosphor-icons/react'
import { format, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { toast } from 'sonner'

interface CalendarProvider {
  id: string
  name: string
  type: 'google' | 'outlook' | 'exchange'
  icon: React.ReactNode
  connected: boolean
  lastSync?: Date
  settings: {
    calendarId?: string
    accessToken?: string
    refreshToken?: string
    timezone?: string
  }
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  attendees: Array<{
    email: string
    name: string
    status: 'pending' | 'accepted' | 'declined' | 'tentative'
  }>
  eventType: 'call' | 'meeting' | 'demo' | 'follow_up' | 'internal'
  relatedTo?: {
    type: 'lead' | 'contact' | 'deal' | 'account'
    id: string
    name: string
  }
  reminders: Array<{
    type: 'email' | 'popup' | 'sms'
    minutes: number
  }>
  isRecurring: boolean
  recurrenceRule?: string
  createdBy: string
  timezone: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  timezone: string
  workingHours: {
    start: string // "09:00"
    end: string   // "17:00"
    days: number[] // [1,2,3,4,5] for Mon-Fri
  }
  availability: Array<{
    date: Date
    available: boolean
    busySlots: Array<{
      start: Date
      end: Date
      title: string
    }>
  }>
}

interface SchedulingSettings {
  defaultMeetingDuration: number
  defaultReminders: number[]
  allowedMeetingTypes: string[]
  autoAcceptMeetings: boolean
  requireApprovalFor: string[]
  timezone: string
  workingHours: {
    start: string
    end: string
    days: number[]
  }
  bufferTime: number // minutes between meetings
}

interface CalendarSchedulingSystemProps {
  companyId: string
  userId: string
  userRole: string
  leadId?: string
  contactId?: string
  dealId?: string
}

export function CalendarSchedulingSystem({ 
  companyId, 
  userId, 
  userRole, 
  leadId, 
  contactId, 
  dealId 
}: CalendarSchedulingSystemProps) {
  const [providers, setProviders] = useKV<CalendarProvider[]>(`calendar-providers-${companyId}`, [])
  const [events, setEvents] = useKV<CalendarEvent[]>(`calendar-events-${companyId}`, [])
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>(`team-members-${companyId}`, [])
  const [settings, setSettings] = useKV<SchedulingSettings>(`scheduling-settings-${companyId}`, {
    defaultMeetingDuration: 30,
    defaultReminders: [15, 60],
    allowedMeetingTypes: ['call', 'meeting', 'demo'],
    autoAcceptMeetings: false,
    requireApprovalFor: ['demo'],
    timezone: 'America/New_York',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5]
    },
    bufferTime: 15
  })
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false)

  // Initialize default providers
  useEffect(() => {
    if (providers.length === 0) {
      const defaultProviders: CalendarProvider[] = [
        {
          id: 'google',
          name: 'Google Calendar',
          type: 'google',
          icon: <GoogleLogo size={20} />,
          connected: false,
          settings: {
            timezone: 'America/New_York'
          }
        },
        {
          id: 'outlook',
          name: 'Microsoft Outlook',
          type: 'outlook',
          icon: <MicrosoftOutlookLogo size={20} />,
          connected: false,
          settings: {
            timezone: 'America/New_York'
          }
        }
      ]
      setProviders(defaultProviders)
    }
  }, [providers, setProviders])

  // Initialize mock team members
  useEffect(() => {
    if (teamMembers.length === 0) {
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'user-001',
          name: 'John Smith',
          email: 'john@company.com',
          timezone: 'America/New_York',
          workingHours: {
            start: '09:00',
            end: '17:00',
            days: [1, 2, 3, 4, 5]
          },
          availability: []
        },
        {
          id: 'user-002',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          timezone: 'America/Los_Angeles',
          workingHours: {
            start: '08:00',
            end: '16:00',
            days: [1, 2, 3, 4, 5]
          },
          availability: []
        }
      ]
      setTeamMembers(mockTeamMembers)
    }
  }, [teamMembers, setTeamMembers])

  const handleProviderConnect = async (providerId: string) => {
    setSyncInProgress(true)
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, connected: true, lastSync: new Date() }
          : p
      ))
      
      toast.success(`Connected to ${providers.find(p => p.id === providerId)?.name}`)
      
      // Start initial sync
      await handleCalendarSync(providerId)
    } catch (error) {
      toast.error('Failed to connect calendar provider')
    } finally {
      setSyncInProgress(false)
    }
  }

  const handleCalendarSync = async (providerId: string) => {
    setSyncInProgress(true)
    
    try {
      // Simulate calendar sync
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock events
      const mockEvents: CalendarEvent[] = [
        {
          id: `event-${Date.now()}-1`,
          title: 'Sales Demo with Acme Corp',
          description: 'Product demonstration and Q&A session',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
          location: 'Zoom Meeting',
          meetingLink: 'https://zoom.us/j/123456789',
          attendees: [
            { email: 'john@acme.com', name: 'John Doe', status: 'accepted' },
            { email: 'sales@company.com', name: 'Sales Team', status: 'accepted' }
          ],
          eventType: 'demo',
          relatedTo: {
            type: 'lead',
            id: 'lead-001',
            name: 'Acme Corp Lead'
          },
          reminders: [
            { type: 'email', minutes: 60 },
            { type: 'popup', minutes: 15 }
          ],
          isRecurring: false,
          createdBy: userId,
          timezone: 'America/New_York'
        },
        {
          id: `event-${Date.now()}-2`,
          title: 'Follow-up Call with TechStart',
          description: 'Quarterly business review and contract renewal discussion',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30 min
          eventType: 'call',
          relatedTo: {
            type: 'account',
            id: 'account-001',
            name: 'TechStart Inc'
          },
          attendees: [
            { email: 'ceo@techstart.com', name: 'Tech CEO', status: 'pending' }
          ],
          reminders: [
            { type: 'email', minutes: 120 },
            { type: 'popup', minutes: 15 }
          ],
          isRecurring: false,
          createdBy: userId,
          timezone: 'America/New_York'
        }
      ]
      
      setEvents(prev => [...mockEvents, ...prev.filter(e => !mockEvents.find(m => m.id === e.id))])
      
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, lastSync: new Date() }
          : p
      ))
      
      toast.success(`Synced ${mockEvents.length} calendar events`)
    } catch (error) {
      toast.error('Calendar sync failed')
    } finally {
      setSyncInProgress(false)
    }
  }

  const handleScheduleMeeting = async (eventData: Partial<CalendarEvent>) => {
    try {
      // Validate required fields
      if (!eventData.title || !eventData.startTime || !eventData.endTime) {
        toast.error('Please fill in all required fields')
        return
      }

      // Generate meeting link if needed
      const meetingLink = eventData.eventType === 'meeting' ? await generateMeetingLink() : undefined

      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: eventData.title!,
        description: eventData.description || '',
        startTime: eventData.startTime!,
        endTime: eventData.endTime!,
        location: eventData.location,
        meetingLink,
        attendees: eventData.attendees || [],
        eventType: eventData.eventType || 'meeting',
        relatedTo: eventData.relatedTo,
        reminders: eventData.reminders || settings.defaultReminders.map(minutes => ({ type: 'email' as const, minutes })),
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule,
        createdBy: userId,
        timezone: settings.timezone
      }

      setEvents(prev => [...prev, newEvent])
      setShowEventDialog(false)
      setSelectedEvent(null)
      
      toast.success('Meeting scheduled successfully')
      
      // Send calendar invitations
      await sendCalendarInvitations(newEvent)
    } catch (error) {
      toast.error('Failed to schedule meeting')
    }
  }

  const generateMeetingLink = async (): Promise<string> => {
    // Simulate API call to generate meeting link
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const meetingId = Math.random().toString(36).substring(7)
    return `https://zoom.us/j/${meetingId}`
  }

  const sendCalendarInvitations = async (event: CalendarEvent) => {
    // Simulate sending calendar invitations
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.info(`Calendar invitations sent to ${event.attendees.length} attendees`)
  }

  const checkTeamAvailability = async (startTime: Date, endTime: Date, members: string[]) => {
    try {
      // Simulate availability check
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const availability = members.map(memberId => {
        const member = teamMembers.find(m => m.id === memberId)
        if (!member) return { memberId, available: false, conflicts: [] }
        
        // Check working hours
        const startHour = parseInt(member.workingHours.start.split(':')[0])
        const endHour = parseInt(member.workingHours.end.split(':')[0])
        const meetingStartHour = startTime.getHours()
        const meetingEndHour = endTime.getHours()
        
        const inWorkingHours = meetingStartHour >= startHour && meetingEndHour <= endHour
        const isWorkingDay = member.workingHours.days.includes(startTime.getDay())
        
        // Check for conflicts (simplified)
        const conflicts = events.filter(event => 
          event.attendees.some(a => a.email === member.email) &&
          ((startTime >= event.startTime && startTime < event.endTime) ||
           (endTime > event.startTime && endTime <= event.endTime))
        )
        
        return {
          memberId,
          memberName: member.name,
          available: inWorkingHours && isWorkingDay && conflicts.length === 0,
          conflicts: conflicts.map(c => ({
            title: c.title,
            startTime: c.startTime,
            endTime: c.endTime
          }))
        }
      })
      
      return availability
    } catch (error) {
      toast.error('Failed to check availability')
      return []
    }
  }

  const suggestMeetingTimes = async (duration: number, attendees: string[], date: Date) => {
    try {
      const suggestions = []
      const workStart = parseInt(settings.workingHours.start.split(':')[0])
      const workEnd = parseInt(settings.workingHours.end.split(':')[0])
      
      // Generate time slots
      for (let hour = workStart; hour < workEnd; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = new Date(date)
          startTime.setHours(hour, minute, 0, 0)
          const endTime = addMinutes(startTime, duration)
          
          if (endTime.getHours() > workEnd) break
          
          const availability = await checkTeamAvailability(startTime, endTime, attendees)
          const allAvailable = availability.every(a => a.available)
          
          if (allAvailable) {
            suggestions.push({
              startTime,
              endTime,
              confidence: 1.0,
              reason: 'All attendees available'
            })
          }
        }
      }
      
      return suggestions.slice(0, 5) // Return top 5 suggestions
    } catch (error) {
      toast.error('Failed to generate suggestions')
      return []
    }
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => isAfter(event.startTime, now))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5)
  }

  const getTodaysEvents = () => {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)
    
    return events
      .filter(event => 
        isAfter(event.startTime, startOfToday) && 
        isBefore(event.startTime, endOfToday)
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const connectedProviders = providers.filter(p => p.connected)
  const upcomingEvents = getUpcomingEvents()
  const todaysEvents = getTodaysEvents()

  return (
    <div className="space-y-6">
      {/* Calendar Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Meetings</p>
                <p className="text-2xl font-bold">{todaysEvents.length}</p>
              </div>
              <CalendarCheck size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{events.filter(e => {
                  const weekStart = startOfDay(new Date())
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekEnd.getDate() + 7)
                  return isAfter(e.startTime, weekStart) && isBefore(e.startTime, weekEnd)
                }).length}</p>
              </div>
              <CalendarIcon size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending RSVPs</p>
                <p className="text-2xl font-bold">{events.reduce((sum, e) => 
                  sum + e.attendees.filter(a => a.status === 'pending').length, 0
                )}</p>
              </div>
              <Clock size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Calendars</p>
                <p className="text-2xl font-bold">{connectedProviders.length}</p>
              </div>
              <LinkIcon size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
          <TabsTrigger value="availability">Team Availability</TabsTrigger>
          <TabsTrigger value="providers">Calendar Providers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calendar Events</CardTitle>
                <CardDescription>
                  View and manage your scheduled meetings and calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Events for {format(selectedDate, 'MMMM d, yyyy')}
                    </h4>
                    {events
                      .filter(event => 
                        format(event.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      )
                      .map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">{event.title}</h5>
                              <p className="text-sm text-muted-foreground">
                                {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                              </p>
                              {event.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin size={12} />
                                  {event.location}
                                </p>
                              )}
                              {event.meetingLink && (
                                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                  <VideoCamera size={12} />
                                  Meeting Link
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {event.eventType}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventDialog(true)
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    {events.filter(event => 
                      format(event.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No events scheduled for this day</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Your next scheduled meetings and calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        <p className="text-xs text-muted-foreground">
                          {format(event.startTime, 'MMM d, h:mm a')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.eventType}
                          </Badge>
                          {event.attendees.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users size={10} />
                              {event.attendees.length}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <MeetingScheduler
            companyId={companyId}
            userId={userId}
            teamMembers={teamMembers}
            settings={settings}
            onSchedule={handleScheduleMeeting}
            leadId={leadId}
            contactId={contactId}
            dealId={dealId}
          />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <AvailabilityChecker
            teamMembers={teamMembers}
            events={events}
            settings={settings}
            onCheckAvailability={checkTeamAvailability}
            onSuggestTimes={suggestMeetingTimes}
          />
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Provider Connections</CardTitle>
              <CardDescription>
                Connect your calendar accounts for seamless scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {provider.connected 
                          ? `Last synced: ${provider.lastSync?.toLocaleString() || 'Never'}`
                          : 'Not connected'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.connected && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCalendarSync(provider.id)}
                          disabled={syncInProgress}
                        >
                          {syncInProgress ? <Lightning className="animate-spin" size={14} /> : 'Sync'}
                        </Button>
                        <Badge variant="outline" className="text-green-600">
                          Connected
                        </Badge>
                      </>
                    )}
                    {!provider.connected && (
                      <Button
                        size="sm"
                        onClick={() => handleProviderConnect(provider.id)}
                        disabled={syncInProgress}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SchedulingSettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
          />
        </TabsContent>
      </Tabs>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Schedule New Meeting'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent}
            settings={settings}
            teamMembers={teamMembers}
            onSave={handleScheduleMeeting}
            onCancel={() => {
              setShowEventDialog(false)
              setSelectedEvent(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Meeting Scheduler Component
function MeetingScheduler({ 
  companyId, 
  userId, 
  teamMembers, 
  settings, 
  onSchedule, 
  leadId, 
  contactId, 
  dealId 
}: {
  companyId: string
  userId: string
  teamMembers: TeamMember[]
  settings: SchedulingSettings
  onSchedule: (event: Partial<CalendarEvent>) => void
  leadId?: string
  contactId?: string
  dealId?: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<CalendarEvent['eventType']>('meeting')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(settings.defaultMeetingDuration)
  const [attendees, setAttendees] = useState<string>('')
  const [location, setLocation] = useState('')
  const [generateMeetingLink, setGenerateMeetingLink] = useState(false)

  const handleSchedule = () => {
    if (!title || !startTime) {
      toast.error('Please fill in required fields')
      return
    }

    const start = new Date(startTime)
    const end = addMinutes(start, duration)

    const attendeeList = attendees.split(',').map(email => ({
      email: email.trim(),
      name: email.trim(),
      status: 'pending' as const
    })).filter(a => a.email)

    const relatedTo = leadId ? { type: 'lead' as const, id: leadId, name: 'Lead' } :
                     contactId ? { type: 'contact' as const, id: contactId, name: 'Contact' } :
                     dealId ? { type: 'deal' as const, id: dealId, name: 'Deal' } : undefined

    onSchedule({
      title,
      description,
      eventType,
      startTime: start,
      endTime: end,
      location,
      attendees: attendeeList,
      relatedTo
    })

    // Reset form
    setTitle('')
    setDescription('')
    setStartTime('')
    setAttendees('')
    setLocation('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule New Meeting</CardTitle>
        <CardDescription>
          Create and schedule meetings with automatic calendar integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Meeting Type</Label>
            <Select value={eventType} onValueChange={(value: CalendarEvent['eventType']) => setEventType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="meeting">Video Meeting</SelectItem>
                <SelectItem value="demo">Product Demo</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Meeting agenda and details..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time *</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
          <Input
            id="attendees"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="email1@company.com, email2@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location/Meeting Link</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Conference room or meeting link"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="generate-link"
            checked={generateMeetingLink}
            onCheckedChange={setGenerateMeetingLink}
          />
          <Label htmlFor="generate-link">Auto-generate video meeting link</Label>
        </div>

        <Button onClick={handleSchedule} className="w-full">
          <CalendarPlus size={16} className="mr-2" />
          Schedule Meeting
        </Button>
      </CardContent>
    </Card>
  )
}

// Availability Checker Component
function AvailabilityChecker({ 
  teamMembers, 
  events, 
  settings,
  onCheckAvailability,
  onSuggestTimes
}: {
  teamMembers: TeamMember[]
  events: CalendarEvent[]
  settings: SchedulingSettings
  onCheckAvailability: (start: Date, end: Date, members: string[]) => Promise<any[]>
  onSuggestTimes: (duration: number, attendees: string[], date: Date) => Promise<any[]>
}) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [checkDate, setCheckDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState(30)
  const [availability, setAvailability] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleCheckAvailability = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select team members')
      return
    }

    setLoading(true)
    try {
      const suggestions = await onSuggestTimes(duration, selectedMembers, checkDate)
      setSuggestions(suggestions)
    } catch (error) {
      toast.error('Failed to check availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Availability Checker</CardTitle>
          <CardDescription>
            Find the best time for team meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Team Members</Label>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers(prev => [...prev, member.id])
                      } else {
                        setSelectedMembers(prev => prev.filter(id => id !== member.id))
                      }
                    }}
                  />
                  <Label htmlFor={member.id} className="text-sm">
                    {member.name} ({member.timezone})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon size={16} className="mr-2" />
                    {format(checkDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkDate}
                    onSelect={(date) => date && setCheckDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCheckAvailability} 
            disabled={loading || selectedMembers.length === 0}
            className="w-full"
          >
            {loading ? <Lightning className="animate-spin mr-2" size={16} /> : <Robot size={16} className="mr-2" />}
            Find Available Times
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Meeting Times</CardTitle>
          <CardDescription>
            AI-powered time suggestions based on team availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No suggestions yet</p>
              <p className="text-sm">Select team members and check availability</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {format(suggestion.startTime, 'h:mm a')} - {format(suggestion.endTime, 'h:mm a')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence * 100)}% match
                      </Badge>
                      <Button size="sm">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Event Form Component
function EventForm({ 
  event, 
  settings, 
  teamMembers, 
  onSave, 
  onCancel 
}: {
  event: CalendarEvent | null
  settings: SchedulingSettings
  teamMembers: TeamMember[]
  onSave: (event: Partial<CalendarEvent>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [eventType, setEventType] = useState<CalendarEvent['eventType']>(event?.eventType || 'meeting')
  const [startTime, setStartTime] = useState(
    event ? format(event.startTime, "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [endTime, setEndTime] = useState(
    event ? format(event.endTime, "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [location, setLocation] = useState(event?.location || '')

  const handleSave = () => {
    if (!title || !startTime || !endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    onSave({
      id: event?.id,
      title,
      description,
      eventType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-title">Title *</Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-type">Type</Label>
          <Select value={eventType} onValueChange={(value: CalendarEvent['eventType']) => setEventType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="meeting">Video Meeting</SelectItem>
              <SelectItem value="demo">Product Demo</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="internal">Internal Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Meeting agenda and details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-start">Start Time *</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">End Time *</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Meeting location or video link"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          Save Event
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Scheduling Settings Panel
function SchedulingSettingsPanel({ 
  settings, 
  onSettingsChange 
}: {
  settings: SchedulingSettings
  onSettingsChange: (settings: SchedulingSettings) => void
}) {
  const updateSetting = (key: keyof SchedulingSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Meeting Settings</CardTitle>
          <CardDescription>
            Configure default values for new meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Duration (minutes)</Label>
              <Select 
                value={settings.defaultMeetingDuration.toString()} 
                onValueChange={(value) => updateSetting('defaultMeetingDuration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buffer Time (minutes)</Label>
              <Select 
                value={settings.bufferTime.toString()} 
                onValueChange={(value) => updateSetting('bufferTime', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your default working hours for scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => updateSetting('workingHours', {
                  ...settings.workingHours,
                  start: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => updateSetting('workingHours', {
                  ...settings.workingHours,
                  end: e.target.value
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
          <CardDescription>
            Configure automatic behaviors and approvals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-accept">Auto-accept meetings</Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept meeting invitations
              </p>
            </div>
            <Switch
              id="auto-accept"
              checked={settings.autoAcceptMeetings}
              onCheckedChange={(checked) => updateSetting('autoAcceptMeetings', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}