import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar, CalendarCheck, Globe, MapPin, Clock, Trash2, Plus, Download, Upload, Flag } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Holiday {
  id: string
  name: string
  date: string
  type: 'public' | 'religious' | 'cultural' | 'company'
  description?: string
  recurring: boolean
  countries: string[]
  regions: string[]
  isActive: boolean
}

interface BusinessDayRules {
  id: string
  locationId: string
  locationName: string
  country: string
  region: string
  timezone: string
  workingDays: number[] // 0-6 (Sunday-Saturday)
  startTime: string
  endTime: string
  lunchBreakStart?: string
  lunchBreakEnd?: string
  overtimeRules: {
    enabled: boolean
    maxHoursPerDay: number
    maxHoursPerWeek: number
    weekendMultiplier: number
    holidayMultiplier: number
  }
  holidays: string[] // Holiday IDs
  customRules: {
    halfDays: string[] // Specific dates
    extraWorkDays: string[] // Weekend work days
  }
  isActive: boolean
}

interface HolidayCalendarManagerProps {
  companyId: string
  onHolidayUpdate?: (holidays: Holiday[]) => void
  onRulesUpdate?: (rules: BusinessDayRules[]) => void
}

const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Africa', 'UAE'
]

const TIMEZONE_OPTIONS = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
]

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function HolidayCalendarManager({ companyId, onHolidayUpdate, onRulesUpdate }: HolidayCalendarManagerProps) {
  const [holidays, setHolidays] = useKV(`holidays-${companyId}`, [] as Holiday[])
  const [businessRules, setBusinessRules] = useKV(`business-rules-${companyId}`, [] as BusinessDayRules[])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [showHolidayDialog, setShowHolidayDialog] = useState(false)
  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [editingRules, setEditingRules] = useState<BusinessDayRules | null>(null)

  // Holiday form state
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'public' as Holiday['type'],
    description: '',
    recurring: true,
    countries: [] as string[],
    regions: [] as string[],
    isActive: true
  })

  // Business rules form state
  const [rulesForm, setRulesForm] = useState({
    locationName: '',
    country: '',
    region: '',
    timezone: 'UTC+00:00',
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: '09:00',
    endTime: '17:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    overtimeRules: {
      enabled: true,
      maxHoursPerDay: 10,
      maxHoursPerWeek: 50,
      weekendMultiplier: 1.5,
      holidayMultiplier: 2.0
    },
    holidays: [] as string[],
    customRules: {
      halfDays: [] as string[],
      extraWorkDays: [] as string[]
    },
    isActive: true
  })

  // Preset holiday templates
  const holidayTemplates = {
    'United States': [
      { name: 'New Year\'s Day', date: '2024-01-01', type: 'public' as const },
      { name: 'Martin Luther King Jr. Day', date: '2024-01-15', type: 'public' as const },
      { name: 'Presidents\' Day', date: '2024-02-19', type: 'public' as const },
      { name: 'Memorial Day', date: '2024-05-27', type: 'public' as const },
      { name: 'Independence Day', date: '2024-07-04', type: 'public' as const },
      { name: 'Labor Day', date: '2024-09-02', type: 'public' as const },
      { name: 'Columbus Day', date: '2024-10-14', type: 'public' as const },
      { name: 'Veterans Day', date: '2024-11-11', type: 'public' as const },
      { name: 'Thanksgiving Day', date: '2024-11-28', type: 'public' as const },
      { name: 'Christmas Day', date: '2024-12-25', type: 'public' as const }
    ],
    'United Kingdom': [
      { name: 'New Year\'s Day', date: '2024-01-01', type: 'public' as const },
      { name: 'Good Friday', date: '2024-03-29', type: 'religious' as const },
      { name: 'Easter Monday', date: '2024-04-01', type: 'religious' as const },
      { name: 'Early May Bank Holiday', date: '2024-05-06', type: 'public' as const },
      { name: 'Spring Bank Holiday', date: '2024-05-27', type: 'public' as const },
      { name: 'Summer Bank Holiday', date: '2024-08-26', type: 'public' as const },
      { name: 'Christmas Day', date: '2024-12-25', type: 'public' as const },
      { name: 'Boxing Day', date: '2024-12-26', type: 'public' as const }
    ]
  }

  useEffect(() => {
    onHolidayUpdate?.(holidays)
    onRulesUpdate?.(businessRules)
  }, [holidays, businessRules, onHolidayUpdate, onRulesUpdate])

  const handleAddHoliday = () => {
    const newHoliday: Holiday = {
      id: `holiday-${Date.now()}`,
      ...holidayForm
    }
    setHolidays([...holidays, newHoliday])
    setShowHolidayDialog(false)
    resetHolidayForm()
    toast.success('Holiday added successfully')
  }

  const handleUpdateHoliday = () => {
    if (!editingHoliday) return
    
    setHolidays(holidays.map(h => h.id === editingHoliday.id ? { ...editingHoliday, ...holidayForm } : h))
    setShowHolidayDialog(false)
    setEditingHoliday(null)
    resetHolidayForm()
    toast.success('Holiday updated successfully')
  }

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays(holidays.filter(h => h.id !== holidayId))
    toast.success('Holiday deleted successfully')
  }

  const handleAddBusinessRules = () => {
    const newRules: BusinessDayRules = {
      id: `rules-${Date.now()}`,
      locationId: `location-${Date.now()}`,
      ...rulesForm
    }
    setBusinessRules([...businessRules, newRules])
    setShowRulesDialog(false)
    resetRulesForm()
    toast.success('Business day rules added successfully')
  }

  const handleUpdateBusinessRules = () => {
    if (!editingRules) return
    
    setBusinessRules(businessRules.map(r => r.id === editingRules.id ? { ...editingRules, ...rulesForm } : r))
    setShowRulesDialog(false)
    setEditingRules(null)
    resetRulesForm()
    toast.success('Business day rules updated successfully')
  }

  const handleDeleteBusinessRules = (rulesId: string) => {
    setBusinessRules(businessRules.filter(r => r.id !== rulesId))
    toast.success('Business day rules deleted successfully')
  }

  const resetHolidayForm = () => {
    setHolidayForm({
      name: '',
      date: '',
      type: 'public',
      description: '',
      recurring: true,
      countries: [],
      regions: [],
      isActive: true
    })
  }

  const resetRulesForm = () => {
    setRulesForm({
      locationName: '',
      country: '',
      region: '',
      timezone: 'UTC+00:00',
      workingDays: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      overtimeRules: {
        enabled: true,
        maxHoursPerDay: 10,
        maxHoursPerWeek: 50,
        weekendMultiplier: 1.5,
        holidayMultiplier: 2.0
      },
      holidays: [],
      customRules: {
        halfDays: [],
        extraWorkDays: []
      },
      isActive: true
    })
  }

  const loadHolidayTemplate = (country: string) => {
    const template = holidayTemplates[country as keyof typeof holidayTemplates]
    if (template) {
      const newHolidays = template.map(holiday => ({
        id: `holiday-${Date.now()}-${Math.random()}`,
        ...holiday,
        description: `Public holiday in ${country}`,
        recurring: true,
        countries: [country],
        regions: [],
        isActive: true
      }))
      setHolidays([...holidays, ...newHolidays])
      toast.success(`Loaded ${newHolidays.length} holidays for ${country}`)
    }
  }

  const editHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description || '',
      recurring: holiday.recurring,
      countries: holiday.countries,
      regions: holiday.regions,
      isActive: holiday.isActive
    })
    setShowHolidayDialog(true)
  }

  const editBusinessRules = (rules: BusinessDayRules) => {
    setEditingRules(rules)
    setRulesForm({
      locationName: rules.locationName,
      country: rules.country,
      region: rules.region,
      timezone: rules.timezone,
      workingDays: rules.workingDays,
      startTime: rules.startTime,
      endTime: rules.endTime,
      lunchBreakStart: rules.lunchBreakStart || '',
      lunchBreakEnd: rules.lunchBreakEnd || '',
      overtimeRules: rules.overtimeRules,
      holidays: rules.holidays,
      customRules: rules.customRules,
      isActive: rules.isActive
    })
    setShowRulesDialog(true)
  }

  const exportCalendarData = () => {
    const data = {
      holidays,
      businessRules,
      exportDate: new Date().toISOString(),
      companyId
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `holiday-calendar-${companyId}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Calendar data exported successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Holiday Calendar & Business Rules</h2>
          <p className="text-muted-foreground">
            Configure company holidays and regional business day rules for different locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportCalendarData} variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Dialog open={showHolidayDialog} onOpenChange={setShowHolidayDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetHolidayForm(); setEditingHoliday(null) }}>
                <Plus size={16} className="mr-2" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
                <DialogDescription>
                  {editingHoliday ? 'Update holiday information' : 'Create a new holiday for your company calendar'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="holiday-name">Holiday Name</Label>
                  <Input
                    id="holiday-name"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    placeholder="e.g., New Year's Day"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-date">Date</Label>
                  <Input
                    id="holiday-date"
                    type="date"
                    value={holidayForm.date}
                    onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-type">Type</Label>
                  <Select value={holidayForm.type} onValueChange={(value: Holiday['type']) => setHolidayForm({ ...holidayForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public Holiday</SelectItem>
                      <SelectItem value="religious">Religious Holiday</SelectItem>
                      <SelectItem value="cultural">Cultural Holiday</SelectItem>
                      <SelectItem value="company">Company Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holiday-description">Description (Optional)</Label>
                  <Textarea
                    id="holiday-description"
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                    placeholder="Additional notes about this holiday"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={holidayForm.recurring}
                    onCheckedChange={(checked) => setHolidayForm({ ...holidayForm, recurring: checked })}
                  />
                  <Label>Recurring annually</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={holidayForm.isActive}
                    onCheckedChange={(checked) => setHolidayForm({ ...holidayForm, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingHoliday ? handleUpdateHoliday : handleAddHoliday}
                    className="flex-1"
                    disabled={!holidayForm.name || !holidayForm.date}
                  >
                    {editingHoliday ? 'Update' : 'Add'} Holiday
                  </Button>
                  <Button variant="outline" onClick={() => setShowHolidayDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="holidays" className="space-y-6">
        <TabsList>
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <Calendar size={16} />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="business-rules" className="flex items-center gap-2">
            <Clock size={16} />
            Business Rules
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Flag size={16} />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holidays" className="space-y-4">
          {holidays.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No holidays configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start by adding holidays for your company or load a country template
                </p>
                <Button onClick={() => setShowHolidayDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Add First Holiday
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {holidays.map((holiday) => (
                <Card key={holiday.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarCheck size={20} className="text-primary" />
                        <div>
                          <h4 className="font-semibold">{holiday.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(holiday.date).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {holiday.type}
                            </Badge>
                            {holiday.recurring && (
                              <Badge variant="secondary" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                            {!holiday.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {holiday.description && (
                            <p className="text-sm text-muted-foreground mt-1">{holiday.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editHoliday(holiday)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="business-rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Location-Based Business Rules</h3>
            <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetRulesForm(); setEditingRules(null) }}>
                  <Plus size={16} className="mr-2" />
                  Add Location Rules
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRules ? 'Edit Business Rules' : 'Add Business Day Rules'}</DialogTitle>
                  <DialogDescription>
                    Configure working hours, days, and policies for a specific location
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location-name">Location Name</Label>
                      <Input
                        id="location-name"
                        value={rulesForm.locationName}
                        onChange={(e) => setRulesForm({ ...rulesForm, locationName: e.target.value })}
                        placeholder="e.g., New York Office"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={rulesForm.country} onValueChange={(value) => setRulesForm({ ...rulesForm, country: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region/State</Label>
                      <Input
                        id="region"
                        value={rulesForm.region}
                        onChange={(e) => setRulesForm({ ...rulesForm, region: e.target.value })}
                        placeholder="e.g., New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={rulesForm.timezone} onValueChange={(value) => setRulesForm({ ...rulesForm, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map(tz => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex gap-2">
                      {WEEKDAY_NAMES.map((day, index) => (
                        <Button
                          key={day}
                          variant={rulesForm.workingDays.includes(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newDays = rulesForm.workingDays.includes(index)
                              ? rulesForm.workingDays.filter(d => d !== index)
                              : [...rulesForm.workingDays, index]
                            setRulesForm({ ...rulesForm, workingDays: newDays })
                          }}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={rulesForm.startTime}
                        onChange={(e) => setRulesForm({ ...rulesForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={rulesForm.endTime}
                        onChange={(e) => setRulesForm({ ...rulesForm, endTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lunch-start">Lunch Break Start</Label>
                      <Input
                        id="lunch-start"
                        type="time"
                        value={rulesForm.lunchBreakStart}
                        onChange={(e) => setRulesForm({ ...rulesForm, lunchBreakStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lunch-end">Lunch Break End</Label>
                      <Input
                        id="lunch-end"
                        type="time"
                        value={rulesForm.lunchBreakEnd}
                        onChange={(e) => setRulesForm({ ...rulesForm, lunchBreakEnd: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rulesForm.overtimeRules.enabled}
                        onCheckedChange={(checked) => setRulesForm({
                          ...rulesForm,
                          overtimeRules: { ...rulesForm.overtimeRules, enabled: checked }
                        })}
                      />
                      <Label>Enable Overtime Rules</Label>
                    </div>
                    {rulesForm.overtimeRules.enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label>Max Hours Per Day</Label>
                          <Input
                            type="number"
                            value={rulesForm.overtimeRules.maxHoursPerDay}
                            onChange={(e) => setRulesForm({
                              ...rulesForm,
                              overtimeRules: { ...rulesForm.overtimeRules, maxHoursPerDay: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Hours Per Week</Label>
                          <Input
                            type="number"
                            value={rulesForm.overtimeRules.maxHoursPerWeek}
                            onChange={(e) => setRulesForm({
                              ...rulesForm,
                              overtimeRules: { ...rulesForm.overtimeRules, maxHoursPerWeek: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Weekend Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rulesForm.overtimeRules.weekendMultiplier}
                            onChange={(e) => setRulesForm({
                              ...rulesForm,
                              overtimeRules: { ...rulesForm.overtimeRules, weekendMultiplier: Number(e.target.value) }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Holiday Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rulesForm.overtimeRules.holidayMultiplier}
                            onChange={(e) => setRulesForm({
                              ...rulesForm,
                              overtimeRules: { ...rulesForm.overtimeRules, holidayMultiplier: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={rulesForm.isActive}
                      onCheckedChange={(checked) => setRulesForm({ ...rulesForm, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={editingRules ? handleUpdateBusinessRules : handleAddBusinessRules}
                      className="flex-1"
                      disabled={!rulesForm.locationName || !rulesForm.country}
                    >
                      {editingRules ? 'Update' : 'Add'} Rules
                    </Button>
                    <Button variant="outline" onClick={() => setShowRulesDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {businessRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No business rules configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Set up working hours and policies for different company locations
                </p>
                <Button onClick={() => setShowRulesDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Business Rules
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {businessRules.map((rules) => (
                <Card key={rules.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold">{rules.locationName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Globe size={14} />
                            <span>{rules.country}, {rules.region}</span>
                            <Badge variant="outline" className="text-xs">{rules.timezone}</Badge>
                            {!rules.isActive && (
                              <Badge variant="destructive" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Working Days:</strong> {rules.workingDays.map(d => WEEKDAY_NAMES[d].slice(0, 3)).join(', ')}</p>
                              <p><strong>Hours:</strong> {rules.startTime} - {rules.endTime}</p>
                            </div>
                            <div>
                              {rules.lunchBreakStart && rules.lunchBreakEnd && (
                                <p><strong>Lunch:</strong> {rules.lunchBreakStart} - {rules.lunchBreakEnd}</p>
                              )}
                              <p><strong>Overtime:</strong> {rules.overtimeRules.enabled ? 'Enabled' : 'Disabled'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editBusinessRules(rules)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBusinessRules(rules.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Templates by Country</CardTitle>
              <CardDescription>
                Load pre-configured holiday calendars for different countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(holidayTemplates).map((country) => (
                  <Card key={country}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{country}</h4>
                          <p className="text-sm text-muted-foreground">
                            {holidayTemplates[country as keyof typeof holidayTemplates].length} holidays
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadHolidayTemplate(country)}
                        >
                          Load Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}