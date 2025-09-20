import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, Clock, Globe, MapPin, Plus, Settings, Calendar, Building, AlertTriangle, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

// Types for regional business rules
interface BusinessDay {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 6 = Saturday
  isWorkingDay: boolean
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isHalfDay?: boolean
  lunchBreakStart?: string
  lunchBreakEnd?: string
}

interface Holiday {
  id: string
  name: string
  date: string // YYYY-MM-DD format
  isRecurring: boolean
  type: 'national' | 'regional' | 'company' | 'religious'
  description?: string
  affectedOffices: string[]
}

interface BusinessHours {
  standard: BusinessDay[]
  seasonal?: {
    summer?: BusinessDay[]
    winter?: BusinessDay[]
    ramadan?: BusinessDay[]
  }
}

interface OfficeLocation {
  id: string
  name: string
  country: string
  region: string
  city: string
  timezone: string
  businessHours: BusinessHours
  holidays: Holiday[]
  culturalConsiderations: {
    prayerTimes?: boolean
    sabbathObservance?: string[]
    culturalEvents?: string[]
  }
  escalationRules: {
    extendDeadlinesOnWeekends: boolean
    extendDeadlinesOnHolidays: boolean
    maxExtensionDays: number
    fallbackOffices: string[]
  }
  contactInfo: {
    address: string
    phone: string
    email: string
    manager: string
  }
}

interface RegionalBusinessRulesManagerProps {
  companyId: string
  userId: string
  userRole: string
}

// Timezone data
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland'
]

// Default business days template
const DEFAULT_BUSINESS_DAYS: BusinessDay[] = [
  { day: 0, isWorkingDay: false, startTime: '09:00', endTime: '17:00' }, // Sunday
  { day: 1, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },  // Monday
  { day: 2, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },  // Tuesday
  { day: 3, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },  // Wednesday
  { day: 4, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },  // Thursday
  { day: 5, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },  // Friday
  { day: 6, isWorkingDay: false, startTime: '09:00', endTime: '17:00' }  // Saturday
]

export function RegionalBusinessRulesManager({ companyId, userId, userRole }: RegionalBusinessRulesManagerProps) {
  const [offices, setOffices] = useKV<OfficeLocation[]>(`business-rules-offices-${companyId}`, [])
  const [selectedOffice, setSelectedOffice] = useState<string>('')
  const [activeTab, setActiveTab] = useState('offices')
  const [showAddOffice, setShowAddOffice] = useState(false)
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  
  // Form states
  const [newOffice, setNewOffice] = useState<Partial<OfficeLocation>>({
    name: '',
    country: '',
    region: '',
    city: '',
    timezone: 'UTC',
    businessHours: { standard: [...DEFAULT_BUSINESS_DAYS] },
    holidays: [],
    culturalConsiderations: {},
    escalationRules: {
      extendDeadlinesOnWeekends: true,
      extendDeadlinesOnHolidays: true,
      maxExtensionDays: 5,
      fallbackOffices: []
    },
    contactInfo: {
      address: '',
      phone: '',
      email: '',
      manager: ''
    }
  })

  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    isRecurring: false,
    type: 'company',
    description: '',
    affectedOffices: []
  })

  // Business rules calculation functions
  const calculateBusinessDays = (startDate: Date, endDate: Date, officeId: string): number => {
    const office = offices.find(o => o.id === officeId)
    if (!office) return 0

    let businessDays = 0
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      const businessDay = office.businessHours.standard.find(bd => bd.day === dayOfWeek)
      
      if (businessDay?.isWorkingDay && !isHoliday(currentDate, office)) {
        businessDays++
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return businessDays
  }

  const isHoliday = (date: Date, office: OfficeLocation): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    return office.holidays.some(holiday => {
      if (holiday.isRecurring) {
        const holidayDate = new Date(holiday.date)
        return holidayDate.getMonth() === date.getMonth() && 
               holidayDate.getDate() === date.getDate()
      }
      return holiday.date === dateStr
    })
  }

  const getNextBusinessDay = (date: Date, officeId: string): Date => {
    const office = offices.find(o => o.id === officeId)
    if (!office) return date

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    while (true) {
      const dayOfWeek = nextDay.getDay()
      const businessDay = office.businessHours.standard.find(bd => bd.day === dayOfWeek)
      
      if (businessDay?.isWorkingDay && !isHoliday(nextDay, office)) {
        return nextDay
      }
      
      nextDay.setDate(nextDay.getDate() + 1)
    }
  }

  const adjustDeadlineForBusinessRules = (deadline: Date, officeId: string): Date => {
    const office = offices.find(o => o.id === officeId)
    if (!office) return deadline

    let adjustedDeadline = new Date(deadline)
    const dayOfWeek = adjustedDeadline.getDay()
    const businessDay = office.businessHours.standard.find(bd => bd.day === dayOfWeek)
    
    // If deadline falls on non-business day or holiday
    if (!businessDay?.isWorkingDay || isHoliday(adjustedDeadline, office)) {
      if (office.escalationRules.extendDeadlinesOnWeekends || 
          office.escalationRules.extendDeadlinesOnHolidays) {
        adjustedDeadline = getNextBusinessDay(adjustedDeadline, officeId)
      }
    }
    
    return adjustedDeadline
  }

  const handleAddOffice = () => {
    if (!newOffice.name || !newOffice.country || !newOffice.timezone) {
      toast.error('Please fill in all required fields')
      return
    }

    const office: OfficeLocation = {
      id: `office-${Date.now()}`,
      name: newOffice.name!,
      country: newOffice.country!,
      region: newOffice.region || '',
      city: newOffice.city || '',
      timezone: newOffice.timezone!,
      businessHours: newOffice.businessHours!,
      holidays: [],
      culturalConsiderations: newOffice.culturalConsiderations || {},
      escalationRules: newOffice.escalationRules!,
      contactInfo: newOffice.contactInfo!
    }

    setOffices(current => [...current, office])
    setNewOffice({
      name: '',
      country: '',
      region: '',
      city: '',
      timezone: 'UTC',
      businessHours: { standard: [...DEFAULT_BUSINESS_DAYS] },
      holidays: [],
      culturalConsiderations: {},
      escalationRules: {
        extendDeadlinesOnWeekends: true,
        extendDeadlinesOnHolidays: true,
        maxExtensionDays: 5,
        fallbackOffices: []
      },
      contactInfo: {
        address: '',
        phone: '',
        email: '',
        manager: ''
      }
    })
    setShowAddOffice(false)
    toast.success('Office location added successfully')
  }

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date || !selectedOffice) {
      toast.error('Please fill in all required fields')
      return
    }

    const holiday: Holiday = {
      id: `holiday-${Date.now()}`,
      name: newHoliday.name!,
      date: newHoliday.date!,
      isRecurring: newHoliday.isRecurring || false,
      type: newHoliday.type || 'company',
      description: newHoliday.description || '',
      affectedOffices: [selectedOffice]
    }

    setOffices(current => 
      current.map(office => 
        office.id === selectedOffice 
          ? { ...office, holidays: [...office.holidays, holiday] }
          : office
      )
    )

    setNewHoliday({
      name: '',
      date: '',
      isRecurring: false,
      type: 'company',
      description: '',
      affectedOffices: []
    })
    setShowAddHoliday(false)
    toast.success('Holiday added successfully')
  }

  const updateBusinessHours = (officeId: string, businessHours: BusinessHours) => {
    setOffices(current =>
      current.map(office =>
        office.id === officeId
          ? { ...office, businessHours }
          : office
      )
    )
    toast.success('Business hours updated')
  }

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  const getHolidayTypeColor = (type: string): string => {
    switch (type) {
      case 'national': return 'bg-red-100 text-red-800'
      case 'regional': return 'bg-blue-100 text-blue-800'
      case 'company': return 'bg-green-100 text-green-800'
      case 'religious': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate business rule insights
  const getBusinessRuleInsights = () => {
    const totalOffices = offices.length
    const totalHolidays = offices.reduce((sum, office) => sum + office.holidays.length, 0)
    const averageBusinessDays = offices.length > 0 
      ? offices.reduce((sum, office) => 
          sum + office.businessHours.standard.filter(day => day.isWorkingDay).length, 0
        ) / offices.length
      : 0

    return {
      totalOffices,
      totalHolidays,
      averageBusinessDays: Math.round(averageBusinessDays * 10) / 10,
      timezones: [...new Set(offices.map(office => office.timezone))].length
    }
  }

  const insights = getBusinessRuleInsights()

  return (
    <div className="space-y-6">
      {/* Header with Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Offices</p>
                <p className="text-2xl font-bold">{insights.totalOffices}</p>
              </div>
              <Building size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Holidays</p>
                <p className="text-2xl font-bold">{insights.totalHolidays}</p>
              </div>
              <CalendarDays size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Business Days</p>
                <p className="text-2xl font-bold">{insights.averageBusinessDays}</p>
              </div>
              <Clock size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Zones</p>
                <p className="text-2xl font-bold">{insights.timezones}</p>
              </div>
              <Globe size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="offices">Office Locations</TabsTrigger>
          <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="rules">Escalation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="offices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Office Locations</CardTitle>
                  <CardDescription>
                    Manage regional office locations and their business rules
                  </CardDescription>
                </div>
                <Dialog open={showAddOffice} onOpenChange={setShowAddOffice}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus size={16} className="mr-2" />
                      Add Office
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Office Location</DialogTitle>
                      <DialogDescription>
                        Configure a new office location with regional business rules
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="office-name">Office Name *</Label>
                        <Input
                          id="office-name"
                          value={newOffice.name || ''}
                          onChange={(e) => setNewOffice(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="New York Office"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={newOffice.country || ''}
                          onChange={(e) => setNewOffice(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="United States"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={newOffice.region || ''}
                          onChange={(e) => setNewOffice(prev => ({ ...prev, region: e.target.value }))}
                          placeholder="New York State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newOffice.city || ''}
                          onChange={(e) => setNewOffice(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="timezone">Time Zone *</Label>
                        <Select
                          value={newOffice.timezone}
                          onValueChange={(value) => setNewOffice(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map(tz => (
                              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={newOffice.contactInfo?.address || ''}
                          onChange={(e) => setNewOffice(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo!, address: e.target.value }
                          }))}
                          placeholder="Office address"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddOffice(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddOffice}>
                        Add Office
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offices.map((office) => (
                  <Card key={office.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{office.name}</h3>
                          <Badge variant="outline">{office.timezone}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            {office.city && `${office.city}, `}{office.country}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} />
                            {office.holidays.length} holidays configured
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {office.businessHours.standard.filter(day => day.isWorkingDay).length} working days
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOffice(office.id)}
                          >
                            Manage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOffice(office.id)
                              setActiveTab('business-hours')
                            }}
                          >
                            <Settings size={14} className="mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {offices.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Building size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No Office Locations</h3>
                    <p className="text-sm mb-4">Add your first office location to set up regional business rules</p>
                    <Button onClick={() => setShowAddOffice(true)}>
                      <Plus size={16} className="mr-2" />
                      Add Office Location
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-hours" className="space-y-6">
          {selectedOffice ? (
            <Card>
              <CardHeader>
                <CardTitle>Business Hours Configuration</CardTitle>
                <CardDescription>
                  Configure working days and hours for {offices.find(o => o.id === selectedOffice)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offices.find(o => o.id === selectedOffice)?.businessHours.standard.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-20">
                          <Label>{getDayName(day.day)}</Label>
                        </div>
                        <Switch
                          checked={day.isWorkingDay}
                          onCheckedChange={(checked) => {
                            const office = offices.find(o => o.id === selectedOffice)!
                            const updatedDays = [...office.businessHours.standard]
                            updatedDays[index] = { ...day, isWorkingDay: checked }
                            updateBusinessHours(selectedOffice, { ...office.businessHours, standard: updatedDays })
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {day.isWorkingDay ? 'Working Day' : 'Non-Working Day'}
                        </span>
                      </div>
                      {day.isWorkingDay && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => {
                              const office = offices.find(o => o.id === selectedOffice)!
                              const updatedDays = [...office.businessHours.standard]
                              updatedDays[index] = { ...day, startTime: e.target.value }
                              updateBusinessHours(selectedOffice, { ...office.businessHours, standard: updatedDays })
                            }}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => {
                              const office = offices.find(o => o.id === selectedOffice)!
                              const updatedDays = [...office.businessHours.standard]
                              updatedDays[index] = { ...day, endTime: e.target.value }
                              updateBusinessHours(selectedOffice, { ...office.businessHours, standard: updatedDays })
                            }}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select an Office</h3>
                <p className="text-sm text-muted-foreground">Choose an office location to configure business hours</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          {selectedOffice ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Holiday Calendar</CardTitle>
                    <CardDescription>
                      Manage holidays for {offices.find(o => o.id === selectedOffice)?.name}
                    </CardDescription>
                  </div>
                  <Dialog open={showAddHoliday} onOpenChange={setShowAddHoliday}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus size={16} className="mr-2" />
                        Add Holiday
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Holiday</DialogTitle>
                        <DialogDescription>
                          Add a new holiday to the calendar
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="holiday-name">Holiday Name *</Label>
                          <Input
                            id="holiday-name"
                            value={newHoliday.name || ''}
                            onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Christmas Day"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holiday-date">Date *</Label>
                          <Input
                            id="holiday-date"
                            type="date"
                            value={newHoliday.date || ''}
                            onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holiday-type">Type</Label>
                          <Select
                            value={newHoliday.type}
                            onValueChange={(value: any) => setNewHoliday(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="national">National Holiday</SelectItem>
                              <SelectItem value="regional">Regional Holiday</SelectItem>
                              <SelectItem value="company">Company Holiday</SelectItem>
                              <SelectItem value="religious">Religious Holiday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="recurring"
                            checked={newHoliday.isRecurring || false}
                            onCheckedChange={(checked) => setNewHoliday(prev => ({ ...prev, isRecurring: checked }))}
                          />
                          <Label htmlFor="recurring">Recurring yearly</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holiday-description">Description</Label>
                          <Textarea
                            id="holiday-description"
                            value={newHoliday.description || ''}
                            onChange={(e) => setNewHoliday(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional description"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddHoliday(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddHoliday}>
                          Add Holiday
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offices.find(o => o.id === selectedOffice)?.holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{holiday.name}</h3>
                          <Badge className={getHolidayTypeColor(holiday.type)} variant="secondary">
                            {holiday.type}
                          </Badge>
                          {holiday.isRecurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(holiday.date).toLocaleDateString()}
                        </p>
                        {holiday.description && (
                          <p className="text-sm text-muted-foreground">{holiday.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOffices(current =>
                            current.map(office =>
                              office.id === selectedOffice
                                ? { ...office, holidays: office.holidays.filter(h => h.id !== holiday.id) }
                                : office
                            )
                          )
                          toast.success('Holiday removed')
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  {offices.find(o => o.id === selectedOffice)?.holidays.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No Holidays Configured</h3>
                      <p className="text-sm">Add holidays to ensure accurate business day calculations</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select an Office</h3>
                <p className="text-sm text-muted-foreground">Choose an office location to manage holidays</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {selectedOffice ? (
            <Card>
              <CardHeader>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>
                  Configure automatic deadline extensions and fallback procedures for {offices.find(o => o.id === selectedOffice)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Deadline Extension Rules</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="extend-weekends">Extend deadlines on weekends</Label>
                        <Switch
                          id="extend-weekends"
                          checked={offices.find(o => o.id === selectedOffice)?.escalationRules.extendDeadlinesOnWeekends || false}
                          onCheckedChange={(checked) => {
                            setOffices(current =>
                              current.map(office =>
                                office.id === selectedOffice
                                  ? { ...office, escalationRules: { ...office.escalationRules, extendDeadlinesOnWeekends: checked } }
                                  : office
                              )
                            )
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="extend-holidays">Extend deadlines on holidays</Label>
                        <Switch
                          id="extend-holidays"
                          checked={offices.find(o => o.id === selectedOffice)?.escalationRules.extendDeadlinesOnHolidays || false}
                          onCheckedChange={(checked) => {
                            setOffices(current =>
                              current.map(office =>
                                office.id === selectedOffice
                                  ? { ...office, escalationRules: { ...office.escalationRules, extendDeadlinesOnHolidays: checked } }
                                  : office
                              )
                            )
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-extension">Maximum extension days</Label>
                        <Input
                          id="max-extension"
                          type="number"
                          min="1"
                          max="30"
                          value={offices.find(o => o.id === selectedOffice)?.escalationRules.maxExtensionDays || 5}
                          onChange={(e) => {
                            setOffices(current =>
                              current.map(office =>
                                office.id === selectedOffice
                                  ? { ...office, escalationRules: { ...office.escalationRules, maxExtensionDays: parseInt(e.target.value) } }
                                  : office
                              )
                            )
                          }}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Fallback Offices</h3>
                    <div className="space-y-2">
                      <Label>Select fallback offices for overflow handling</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {offices.filter(office => office.id !== selectedOffice).map((office) => (
                          <div key={office.id} className="flex items-center space-x-2">
                            <Switch
                              id={`fallback-${office.id}`}
                              checked={offices.find(o => o.id === selectedOffice)?.escalationRules.fallbackOffices.includes(office.id) || false}
                              onCheckedChange={(checked) => {
                                setOffices(current =>
                                  current.map(currentOffice =>
                                    currentOffice.id === selectedOffice
                                      ? {
                                          ...currentOffice,
                                          escalationRules: {
                                            ...currentOffice.escalationRules,
                                            fallbackOffices: checked
                                              ? [...currentOffice.escalationRules.fallbackOffices, office.id]
                                              : currentOffice.escalationRules.fallbackOffices.filter(id => id !== office.id)
                                          }
                                        }
                                      : currentOffice
                                  )
                                )
                              }}
                            />
                            <Label htmlFor={`fallback-${office.id}`} className="text-sm">
                              {office.name} ({office.timezone})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">Business Rule Preview</h4>
                        <p className="text-sm text-muted-foreground">
                          With current settings, deadlines will be automatically extended to the next business day
                          when they fall on weekends or holidays, with a maximum extension of{' '}
                          {offices.find(o => o.id === selectedOffice)?.escalationRules.maxExtensionDays || 5} days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select an Office</h3>
                <p className="text-sm text-muted-foreground">Choose an office location to configure escalation rules</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}