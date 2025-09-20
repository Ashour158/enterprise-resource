import { useKV } from '@github/spark/hooks'

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

export function useBusinessDayCalculator(companyId: string, locationId?: string) {
  const [holidays] = useKV<Holiday[]>(`holidays-${companyId}`, [])
  const [businessRules] = useKV<BusinessDayRules[]>(`business-rules-${companyId}`, [])

  const getLocationRules = (targetLocationId?: string) => {
    if (!targetLocationId) {
      // Return default rules if no location specified
      return businessRules.find(rule => rule.isActive) || null
    }
    return businessRules.find(rule => rule.locationId === targetLocationId && rule.isActive) || null
  }

  const isHoliday = (date: Date, targetLocationId?: string): Holiday | null => {
    const rules = getLocationRules(targetLocationId)
    const dateString = date.toISOString().split('T')[0]
    
    for (const holiday of holidays) {
      if (!holiday.isActive) continue
      
      // Check if holiday applies to this location
      if (rules) {
        const holidayAppliesToLocation = 
          holiday.countries.includes(rules.country) ||
          holiday.regions.includes(rules.region) ||
          rules.holidays.includes(holiday.id)
        
        if (!holidayAppliesToLocation) continue
      }
      
      if (holiday.recurring) {
        // For recurring holidays, compare month and day
        const holidayDate = new Date(holiday.date)
        if (date.getMonth() === holidayDate.getMonth() && 
            date.getDate() === holidayDate.getDate()) {
          return holiday
        }
      } else {
        // For non-recurring holidays, exact date match
        if (holiday.date === dateString) {
          return holiday
        }
      }
    }
    
    return null
  }

  const isBusinessDay = (date: Date, targetLocationId?: string): boolean => {
    const rules = getLocationRules(targetLocationId)
    
    if (!rules) {
      // Default business days: Monday to Friday
      const dayOfWeek = date.getDay()
      return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday(date, targetLocationId)
    }
    
    const dayOfWeek = date.getDay()
    const dateString = date.toISOString().split('T')[0]
    
    // Check if it's a working day according to rules
    if (!rules.workingDays.includes(dayOfWeek)) {
      // Check if it's an extra work day
      if (!rules.customRules.extraWorkDays.includes(dateString)) {
        return false
      }
    }
    
    // Check if it's a holiday
    if (isHoliday(date, targetLocationId)) {
      return false
    }
    
    // Check if it's a half day
    const isHalfDay = rules.customRules.halfDays.includes(dateString)
    
    return !isHalfDay // Return false for half days, true for full business days
  }

  const getNextBusinessDay = (startDate: Date, targetLocationId?: string): Date => {
    const nextDay = new Date(startDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    let attempts = 0
    while (!isBusinessDay(nextDay, targetLocationId) && attempts < 365) {
      nextDay.setDate(nextDay.getDate() + 1)
      attempts++
    }
    
    return nextDay
  }

  const addBusinessDays = (startDate: Date, businessDays: number, targetLocationId?: string): Date => {
    const result = new Date(startDate)
    let daysAdded = 0
    let attempts = 0
    
    while (daysAdded < businessDays && attempts < 1000) {
      result.setDate(result.getDate() + 1)
      if (isBusinessDay(result, targetLocationId)) {
        daysAdded++
      }
      attempts++
    }
    
    return result
  }

  const calculateBusinessDaysBetween = (startDate: Date, endDate: Date, targetLocationId?: string): number => {
    let businessDays = 0
    const current = new Date(startDate)
    
    while (current < endDate) {
      current.setDate(current.getDate() + 1)
      if (isBusinessDay(current, targetLocationId)) {
        businessDays++
      }
    }
    
    return businessDays
  }

  const isWithinBusinessHours = (date: Date, targetLocationId?: string): boolean => {
    const rules = getLocationRules(targetLocationId)
    
    if (!rules) {
      // Default business hours: 9 AM to 5 PM
      const hour = date.getHours()
      return hour >= 9 && hour < 17
    }
    
    const startHour = parseInt(rules.startTime.split(':')[0])
    const startMinute = parseInt(rules.startTime.split(':')[1])
    const endHour = parseInt(rules.endTime.split(':')[0])
    const endMinute = parseInt(rules.endTime.split(':')[1])
    
    const currentHour = date.getHours()
    const currentMinute = date.getMinutes()
    
    const currentTime = currentHour * 60 + currentMinute
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    // Check if within lunch break
    if (rules.lunchBreakStart && rules.lunchBreakEnd) {
      const lunchStartHour = parseInt(rules.lunchBreakStart.split(':')[0])
      const lunchStartMinute = parseInt(rules.lunchBreakStart.split(':')[1])
      const lunchEndHour = parseInt(rules.lunchBreakEnd.split(':')[0])
      const lunchEndMinute = parseInt(rules.lunchBreakEnd.split(':')[1])
      
      const lunchStartTime = lunchStartHour * 60 + lunchStartMinute
      const lunchEndTime = lunchEndHour * 60 + lunchEndMinute
      
      if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
        return false
      }
    }
    
    return currentTime >= startTime && currentTime < endTime
  }

  const getBusinessHoursInfo = (targetLocationId?: string) => {
    const rules = getLocationRules(targetLocationId)
    
    if (!rules) {
      return {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC+00:00',
        lunchBreak: null
      }
    }
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return {
      workingDays: rules.workingDays.map(day => weekdays[day]),
      startTime: rules.startTime,
      endTime: rules.endTime,
      timezone: rules.timezone,
      lunchBreak: rules.lunchBreakStart && rules.lunchBreakEnd ? {
        start: rules.lunchBreakStart,
        end: rules.lunchBreakEnd
      } : null,
      overtimeRules: rules.overtimeRules
    }
  }

  const getUpcomingHolidays = (days: number = 30, targetLocationId?: string): Holiday[] => {
    const rules = getLocationRules(targetLocationId)
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + days)
    
    const upcomingHolidays: Holiday[] = []
    
    for (const holiday of holidays) {
      if (!holiday.isActive) continue
      
      // Check if holiday applies to this location
      if (rules) {
        const holidayAppliesToLocation = 
          holiday.countries.includes(rules.country) ||
          holiday.regions.includes(rules.region) ||
          rules.holidays.includes(holiday.id)
        
        if (!holidayAppliesToLocation) continue
      }
      
      let holidayDate: Date
      
      if (holiday.recurring) {
        // For recurring holidays, use current year
        const originalDate = new Date(holiday.date)
        holidayDate = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate())
        
        // If the holiday has already passed this year, check next year
        if (holidayDate < today) {
          holidayDate = new Date(today.getFullYear() + 1, originalDate.getMonth(), originalDate.getDate())
        }
      } else {
        holidayDate = new Date(holiday.date)
      }
      
      if (holidayDate >= today && holidayDate <= endDate) {
        upcomingHolidays.push({
          ...holiday,
          date: holidayDate.toISOString().split('T')[0]
        })
      }
    }
    
    return upcomingHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  return {
    isHoliday,
    isBusinessDay,
    getNextBusinessDay,
    addBusinessDays,
    calculateBusinessDaysBetween,
    isWithinBusinessHours,
    getBusinessHoursInfo,
    getUpcomingHolidays,
    holidays,
    businessRules: businessRules.filter(rule => rule.isActive)
  }
}