import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { BusinessDayCalculator, BusinessDayUtils } from '@/lib/businessDayCalculator'
import { Calendar, Clock, Globe, MapPin, Building, CheckCircle, AlertTriangle, Target, ArrowRight, Users, DollarSign } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RegionalBusinessRulesDemoProps {
  companyId: string
  userId: string
}

// Sample quote data
const sampleQuote = {
  id: 'quote-demo-001',
  quoteNumber: 'Q-2024-DEMO-001',
  accountName: 'Global Tech Solutions',
  contactName: 'Sarah Johnson',
  amount: 125000,
  currency: 'USD',
  submittedAt: new Date(),
  approvalRequired: true,
  approvalLevels: [
    { name: 'Sales Manager', timeoutHours: 24, office: 'New York' },
    { name: 'Regional Director', timeoutHours: 48, office: 'London' },
    { name: 'VP Sales', timeoutHours: 72, office: 'Singapore' }
  ]
}

// Sample office data
const sampleOffices = [
  {
    id: 'ny-office',
    name: 'New York Office',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    businessHours: {
      standard: [
        { day: 0, isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
        { day: 1, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 2, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 3, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 4, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 5, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 6, isWorkingDay: false, startTime: '09:00', endTime: '17:00' }
      ]
    },
    holidays: [
      { id: 'h1', name: 'New Year\'s Day', date: '2024-01-01', isRecurring: true, type: 'national', affectedOffices: ['ny-office'] },
      { id: 'h2', name: 'Independence Day', date: '2024-07-04', isRecurring: true, type: 'national', affectedOffices: ['ny-office'] },
      { id: 'h3', name: 'Thanksgiving', date: '2024-11-28', isRecurring: true, type: 'national', affectedOffices: ['ny-office'] }
    ],
    escalationRules: {
      extendDeadlinesOnWeekends: true,
      extendDeadlinesOnHolidays: true,
      maxExtensionDays: 3,
      fallbackOffices: ['london-office']
    }
  },
  {
    id: 'london-office',
    name: 'London Office',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    businessHours: {
      standard: [
        { day: 0, isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
        { day: 1, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 2, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 3, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 4, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 5, isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        { day: 6, isWorkingDay: false, startTime: '09:00', endTime: '17:00' }
      ]
    },
    holidays: [
      { id: 'h4', name: 'New Year\'s Day', date: '2024-01-01', isRecurring: true, type: 'national', affectedOffices: ['london-office'] },
      { id: 'h5', name: 'Christmas Day', date: '2024-12-25', isRecurring: true, type: 'national', affectedOffices: ['london-office'] },
      { id: 'h6', name: 'Boxing Day', date: '2024-12-26', isRecurring: true, type: 'national', affectedOffices: ['london-office'] }
    ],
    escalationRules: {
      extendDeadlinesOnWeekends: true,
      extendDeadlinesOnHolidays: true,
      maxExtensionDays: 5,
      fallbackOffices: ['singapore-office']
    }
  },
  {
    id: 'singapore-office',
    name: 'Singapore Office',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    businessHours: {
      standard: [
        { day: 0, isWorkingDay: false, startTime: '09:00', endTime: '18:00' },
        { day: 1, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { day: 2, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { day: 3, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { day: 4, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { day: 5, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { day: 6, isWorkingDay: false, startTime: '09:00', endTime: '18:00' }
      ]
    },
    holidays: [
      { id: 'h7', name: 'Chinese New Year', date: '2024-02-10', isRecurring: true, type: 'national', affectedOffices: ['singapore-office'] },
      { id: 'h8', name: 'National Day', date: '2024-08-09', isRecurring: true, type: 'national', affectedOffices: ['singapore-office'] },
      { id: 'h9', name: 'Deepavali', date: '2024-10-31', isRecurring: true, type: 'national', affectedOffices: ['singapore-office'] }
    ],
    escalationRules: {
      extendDeadlinesOnWeekends: true,
      extendDeadlinesOnHolidays: true,
      maxExtensionDays: 7,
      fallbackOffices: ['ny-office']
    }
  }
]

export function RegionalBusinessRulesDemo({ companyId, userId }: RegionalBusinessRulesDemoProps) {
  const [offices] = useKV(`business-rules-offices-${companyId}`, sampleOffices)
  const [selectedScenario, setSelectedScenario] = useState<string>('weekend')
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [calculatedDeadlines, setCalculatedDeadlines] = useState<any[]>([])

  const businessCalculator = new BusinessDayCalculator(offices)

  // Predefined scenarios
  const scenarios = {
    weekend: {
      name: 'Weekend Submission',
      description: 'Quote submitted on a Friday afternoon',
      submitDate: (() => {
        const date = new Date()
        // Set to next Friday at 4 PM
        const daysUntilFriday = (5 - date.getDay() + 7) % 7
        date.setDate(date.getDate() + daysUntilFriday)
        date.setHours(16, 0, 0, 0)
        return date
      })()
    },
    holiday: {
      name: 'Holiday Submission',
      description: 'Quote submitted during holiday period',
      submitDate: new Date('2024-12-24T14:00:00') // Christmas Eve
    },
    normal: {
      name: 'Normal Business Day',
      description: 'Quote submitted on a regular Tuesday',
      submitDate: (() => {
        const date = new Date()
        // Set to next Tuesday at 10 AM
        const daysUntilTuesday = (2 - date.getDay() + 7) % 7
        date.setDate(date.getDate() + daysUntilTuesday)
        date.setHours(10, 0, 0, 0)
        return date
      })()
    },
    custom: {
      name: 'Custom Date',
      description: 'Test with a custom submission date',
      submitDate: new Date(customDate + 'T10:00:00')
    }
  }

  useEffect(() => {
    calculateDeadlines()
  }, [selectedScenario, customDate])

  const calculateDeadlines = () => {
    const scenario = scenarios[selectedScenario as keyof typeof scenarios]
    if (!scenario) return

    const results = sampleQuote.approvalLevels.map((level, index) => {
      const officeId = offices.find(o => o.name === level.office)?.id
      if (!officeId) return null

      const submitDate = scenario.submitDate
      const businessDays = Math.ceil(level.timeoutHours / 8)
      
      // Calculate deadline with regional rules
      const baseDeadline = businessCalculator.addBusinessDays(submitDate, businessDays, officeId)
      const adjustment = businessCalculator.adjustDeadlineForBusinessRules(baseDeadline, officeId)
      
      const office = offices.find(o => o.id === officeId)
      const businessHours = businessCalculator.getBusinessHoursForDate(adjustment.adjustedDeadline, officeId)
      
      return {
        level: index + 1,
        name: level.name,
        office: office?.name,
        timezone: office?.timezone,
        timeoutHours: level.timeoutHours,
        originalDeadline: baseDeadline,
        adjustedDeadline: adjustment.adjustedDeadline,
        wasAdjusted: adjustment.wasAdjusted,
        reason: adjustment.reason,
        businessHours: businessHours ? `${businessHours.startTime} - ${businessHours.endTime}` : 'N/A',
        isBusinessDay: businessCalculator.isBusinessDay(adjustment.adjustedDeadline, office),
        isHoliday: businessCalculator.isHoliday(adjustment.adjustedDeadline, office)
      }
    }).filter(Boolean)

    setCalculatedDeadlines(results)
  }

  const formatDeadlineInfo = (deadline: any) => {
    const daysDiff = Math.floor((deadline.adjustedDeadline.getTime() - deadline.originalDeadline.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      extensionDays: daysDiff,
      formattedDate: deadline.adjustedDeadline.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    }
  }

  const currentScenario = scenarios[selectedScenario as keyof typeof scenarios]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Regional Business Rules Demonstration
          </CardTitle>
          <CardDescription>
            See how regional business rules automatically adjust quote approval deadlines based on office locations, holidays, and business hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sample Quote</Label>
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p><strong>{sampleQuote.quoteNumber}</strong></p>
                <p>{sampleQuote.accountName}</p>
                <p className="text-muted-foreground">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: sampleQuote.currency
                  }).format(sampleQuote.amount)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Test Scenario</Label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scenarios).map(([key, scenario]) => (
                    <SelectItem key={key} value={key}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScenario === 'custom' && (
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Submission Time</Label>
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <p>{currentScenario?.submitDate.toLocaleDateString()}</p>
                <p className="text-muted-foreground">
                  {currentScenario?.submitDate.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Global Offices</Label>
              <div className="space-y-1">
                {offices.slice(0, 3).map((office) => (
                  <div key={office.id} className="flex items-center gap-2 text-sm">
                    <Building size={12} />
                    <span>{office.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {office.timezone.split('/')[1]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Approval Timeline with Regional Rules
          </CardTitle>
          <CardDescription>
            {currentScenario?.description} - See how deadlines adjust automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {calculatedDeadlines.map((deadline, index) => {
              const info = formatDeadlineInfo(deadline)
              
              return (
                <div key={deadline.level} className="relative">
                  {index < calculatedDeadlines.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-medium">
                      {deadline.level}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Approval Level Info */}
                      <div className="space-y-2">
                        <h3 className="font-medium">{deadline.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Building size={12} />
                            {deadline.office}
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe size={12} />
                            {deadline.timezone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} />
                            {deadline.timeoutHours}h timeout
                          </div>
                        </div>
                      </div>

                      {/* Original vs Adjusted Deadline */}
                      <div className="space-y-2">
                        <Label className="text-sm">Deadlines</Label>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Original:</span>
                            <span>{deadline.originalDeadline.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Adjusted:</span>
                            <span className={deadline.wasAdjusted ? 'text-amber-600 font-medium' : 'text-green-600'}>
                              {deadline.adjustedDeadline.toLocaleDateString()}
                            </span>
                          </div>
                          {info.extensionDays > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{info.extensionDays} day{info.extensionDays !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Business Rules Impact */}
                      <div className="space-y-2">
                        <Label className="text-sm">Business Rules</Label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${deadline.isBusinessDay ? 'bg-green-500' : 'bg-red-500'}`} />
                            {deadline.isBusinessDay ? 'Business Day' : 'Non-Business Day'}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${deadline.isHoliday ? 'bg-red-500' : 'bg-green-500'}`} />
                            {deadline.isHoliday ? 'Holiday' : 'Regular Day'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Hours: {deadline.businessHours}
                          </div>
                        </div>
                      </div>

                      {/* Adjustment Reason */}
                      <div className="space-y-2">
                        <Label className="text-sm">Status</Label>
                        {deadline.wasAdjusted ? (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 rounded text-xs">
                            <AlertTriangle size={12} className="text-amber-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-700">Extended</p>
                              <p className="text-amber-600">{deadline.reason}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 p-2 bg-green-50 rounded text-xs">
                            <CheckCircle size={12} className="text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-700">On Schedule</p>
                              <p className="text-green-600">No adjustment needed</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator className="my-6" />

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <h4 className="font-medium text-blue-900">Total Process Time</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.max(...calculatedDeadlines.map(d => 
                  Math.floor((d.adjustedDeadline.getTime() - currentScenario.submitDate.getTime()) / (1000 * 60 * 60 * 24))
                ))} days
              </p>
              <p className="text-xs text-blue-700">From submission to final approval</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-600" />
                <h4 className="font-medium text-amber-900">Extensions Applied</h4>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {calculatedDeadlines.filter(d => d.wasAdjusted).length}
              </p>
              <p className="text-xs text-amber-700">Out of {calculatedDeadlines.length} approval levels</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-green-600" />
                <h4 className="font-medium text-green-900">Offices Involved</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {new Set(calculatedDeadlines.map(d => d.office)).size}
              </p>
              <p className="text-xs text-green-700">Across different time zones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Key Benefits of Regional Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Automatic Adjustments</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Deadlines automatically extend for weekends and holidays
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Business hours respected across different time zones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Fallback offices handle overflow during non-business periods
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Cultural and religious holidays automatically considered
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Global Compliance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Meets local labor regulations and business practices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Ensures fair processing times across all regions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Maintains audit trails for compliance reporting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  Supports 24/7 global operations with regional handoffs
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}