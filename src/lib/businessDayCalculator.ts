// Business Day Calculator Utility
// Handles complex business day calculations across different regional offices

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
}

export class BusinessDayCalculator {
  private offices: OfficeLocation[]

  constructor(offices: OfficeLocation[]) {
    this.offices = offices
  }

  /**
   * Calculate the number of business days between two dates for a specific office
   */
  calculateBusinessDays(startDate: Date, endDate: Date, officeId: string): number {
    const office = this.getOffice(officeId)
    if (!office) return 0

    let businessDays = 0
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      if (this.isBusinessDay(currentDate, office)) {
        businessDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return businessDays
  }

  /**
   * Check if a given date is a business day for a specific office
   */
  isBusinessDay(date: Date, office: OfficeLocation): boolean {
    const dayOfWeek = date.getDay()
    const businessDay = office.businessHours.standard.find(bd => bd.day === dayOfWeek)
    
    return (businessDay?.isWorkingDay || false) && !this.isHoliday(date, office)
  }

  /**
   * Check if a given date is a holiday for a specific office
   */
  isHoliday(date: Date, office: OfficeLocation): boolean {
    const dateStr = this.formatDate(date)
    
    return office.holidays.some(holiday => {
      if (holiday.isRecurring) {
        const holidayDate = new Date(holiday.date)
        return holidayDate.getMonth() === date.getMonth() && 
               holidayDate.getDate() === date.getDate()
      }
      return holiday.date === dateStr
    })
  }

  /**
   * Get the next business day for a specific office
   */
  getNextBusinessDay(date: Date, officeId: string): Date {
    const office = this.getOffice(officeId)
    if (!office) return date

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    let attempts = 0
    const maxAttempts = 365 // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      if (this.isBusinessDay(nextDay, office)) {
        return nextDay
      }
      nextDay.setDate(nextDay.getDate() + 1)
      attempts++
    }
    
    return date // Fallback if no business day found within a year
  }

  /**
   * Get the previous business day for a specific office
   */
  getPreviousBusinessDay(date: Date, officeId: string): Date {
    const office = this.getOffice(officeId)
    if (!office) return date

    const prevDay = new Date(date)
    prevDay.setDate(prevDay.getDate() - 1)
    
    let attempts = 0
    const maxAttempts = 365
    
    while (attempts < maxAttempts) {
      if (this.isBusinessDay(prevDay, office)) {
        return prevDay
      }
      prevDay.setDate(prevDay.getDate() - 1)
      attempts++
    }
    
    return date
  }

  /**
   * Add business days to a date, respecting office business rules
   */
  addBusinessDays(startDate: Date, businessDays: number, officeId: string): Date {
    const office = this.getOffice(officeId)
    if (!office) return startDate

    let currentDate = new Date(startDate)
    let daysAdded = 0
    
    while (daysAdded < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1)
      if (this.isBusinessDay(currentDate, office)) {
        daysAdded++
      }
    }
    
    return currentDate
  }

  /**
   * Subtract business days from a date, respecting office business rules
   */
  subtractBusinessDays(startDate: Date, businessDays: number, officeId: string): Date {
    const office = this.getOffice(officeId)
    if (!office) return startDate

    let currentDate = new Date(startDate)
    let daysSubtracted = 0
    
    while (daysSubtracted < businessDays) {
      currentDate.setDate(currentDate.getDate() - 1)
      if (this.isBusinessDay(currentDate, office)) {
        daysSubtracted++
      }
    }
    
    return currentDate
  }

  /**
   * Adjust a deadline based on office escalation rules
   */
  adjustDeadlineForBusinessRules(deadline: Date, officeId: string): { 
    adjustedDeadline: Date,
    wasAdjusted: boolean,
    reason?: string,
    originalDeadline: Date
  } {
    const office = this.getOffice(officeId)
    if (!office) {
      return { 
        adjustedDeadline: deadline, 
        wasAdjusted: false, 
        originalDeadline: deadline 
      }
    }

    const originalDeadline = new Date(deadline)
    let adjustedDeadline = new Date(deadline)
    let wasAdjusted = false
    let reason = ''

    // Check if deadline falls on a non-business day
    if (!this.isBusinessDay(adjustedDeadline, office)) {
      const dayOfWeek = adjustedDeadline.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isHoliday = this.isHoliday(adjustedDeadline, office)

      // Check escalation rules
      const shouldExtend = 
        (isWeekend && office.escalationRules.extendDeadlinesOnWeekends) ||
        (isHoliday && office.escalationRules.extendDeadlinesOnHolidays)

      if (shouldExtend) {
        adjustedDeadline = this.getNextBusinessDay(adjustedDeadline, officeId)
        
        // Ensure we don't exceed maximum extension days
        const daysDifference = Math.floor(
          (adjustedDeadline.getTime() - originalDeadline.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysDifference > office.escalationRules.maxExtensionDays) {
          adjustedDeadline = new Date(originalDeadline)
          adjustedDeadline.setDate(
            adjustedDeadline.getDate() + office.escalationRules.maxExtensionDays
          )
        }
        
        wasAdjusted = true
        reason = isWeekend ? 'Extended due to weekend' : 'Extended due to holiday'
      }
    }

    return {
      adjustedDeadline,
      wasAdjusted,
      reason,
      originalDeadline
    }
  }

  /**
   * Get business hours for a specific date and office (handles seasonal variations)
   */
  getBusinessHoursForDate(date: Date, officeId: string): BusinessDay | null {
    const office = this.getOffice(officeId)
    if (!office) return null

    const dayOfWeek = date.getDay()
    
    // Check for seasonal business hours (summer/winter/ramadan)
    const month = date.getMonth()
    let businessHours = office.businessHours.standard

    // Summer hours (June, July, August)
    if ([5, 6, 7].includes(month) && office.businessHours.seasonal?.summer) {
      businessHours = office.businessHours.seasonal.summer
    }
    // Winter hours (December, January, February)
    else if ([11, 0, 1].includes(month) && office.businessHours.seasonal?.winter) {
      businessHours = office.businessHours.seasonal.winter
    }
    // Ramadan hours (would need to be calculated based on Islamic calendar)
    else if (office.businessHours.seasonal?.ramadan && this.isRamadanPeriod(date)) {
      businessHours = office.businessHours.seasonal.ramadan
    }

    return businessHours.find(bh => bh.day === dayOfWeek) || null
  }

  /**
   * Calculate working hours between two dates for a specific office
   */
  calculateWorkingHours(startDate: Date, endDate: Date, officeId: string): number {
    const office = this.getOffice(officeId)
    if (!office) return 0

    let totalHours = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const businessDay = this.getBusinessHoursForDate(currentDate, officeId)
      if (businessDay?.isWorkingDay && !this.isHoliday(currentDate, office)) {
        const startTime = this.parseTime(businessDay.startTime)
        const endTime = this.parseTime(businessDay.endTime)
        let dailyHours = (endTime - startTime) / (1000 * 60 * 60)

        // Subtract lunch break if specified
        if (businessDay.lunchBreakStart && businessDay.lunchBreakEnd) {
          const lunchStart = this.parseTime(businessDay.lunchBreakStart)
          const lunchEnd = this.parseTime(businessDay.lunchBreakEnd)
          const lunchHours = (lunchEnd - lunchStart) / (1000 * 60 * 60)
          dailyHours -= lunchHours
        }

        // If it's a half day, reduce hours by 50%
        if (businessDay.isHalfDay) {
          dailyHours *= 0.5
        }

        totalHours += dailyHours
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return totalHours
  }

  /**
   * Find alternative office for handling overflow based on fallback rules
   */
  findFallbackOffice(primaryOfficeId: string, requiredDate: Date): OfficeLocation | null {
    const primaryOffice = this.getOffice(primaryOfficeId)
    if (!primaryOffice) return null

    // Find offices in fallback list that are open on the required date
    for (const fallbackOfficeId of primaryOffice.escalationRules.fallbackOffices) {
      const fallbackOffice = this.getOffice(fallbackOfficeId)
      if (fallbackOffice && this.isBusinessDay(requiredDate, fallbackOffice)) {
        return fallbackOffice
      }
    }

    return null
  }

  /**
   * Get all upcoming holidays for an office within a date range
   */
  getUpcomingHolidays(officeId: string, startDate: Date, endDate: Date): Holiday[] {
    const office = this.getOffice(officeId)
    if (!office) return []

    return office.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date)
      
      if (holiday.isRecurring) {
        // For recurring holidays, check all years in the range
        const years = this.getYearsInRange(startDate, endDate)
        return years.some(year => {
          const yearlyHoliday = new Date(year, holidayDate.getMonth(), holidayDate.getDate())
          return yearlyHoliday >= startDate && yearlyHoliday <= endDate
        })
      } else {
        return holidayDate >= startDate && holidayDate <= endDate
      }
    })
  }

  /**
   * Generate a business calendar for an office within a date range
   */
  generateBusinessCalendar(officeId: string, startDate: Date, endDate: Date): {
    date: Date
    isBusinessDay: boolean
    isHoliday: boolean
    holidayName?: string
    businessHours?: BusinessDay
  }[] {
    const office = this.getOffice(officeId)
    if (!office) return []

    const calendar = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const isHoliday = this.isHoliday(currentDate, office)
      const businessHours = this.getBusinessHoursForDate(currentDate, officeId)
      const isBusinessDay = this.isBusinessDay(currentDate, office)
      
      const holiday = isHoliday 
        ? office.holidays.find(h => {
            if (h.isRecurring) {
              const holidayDate = new Date(h.date)
              return holidayDate.getMonth() === currentDate.getMonth() &&
                     holidayDate.getDate() === currentDate.getDate()
            }
            return h.date === this.formatDate(currentDate)
          })
        : undefined

      calendar.push({
        date: new Date(currentDate),
        isBusinessDay,
        isHoliday,
        holidayName: holiday?.name,
        businessHours: businessHours || undefined
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return calendar
  }

  // Helper methods
  private getOffice(officeId: string): OfficeLocation | undefined {
    return this.offices.find(office => office.id === officeId)
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.getTime()
  }

  private isRamadanPeriod(date: Date): boolean {
    // This would need to be implemented based on Islamic calendar calculations
    // For now, return false as placeholder
    return false
  }

  private getYearsInRange(startDate: Date, endDate: Date): number[] {
    const years = []
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      years.push(year)
    }
    return years
  }
}

// React hook for using the business day calculator
export function useBusinessDayCalculator(offices: OfficeLocation[]) {
  const calculator = new BusinessDayCalculator(offices)

  return {
    calculateBusinessDays: calculator.calculateBusinessDays.bind(calculator),
    isBusinessDay: calculator.isBusinessDay.bind(calculator),
    isHoliday: calculator.isHoliday.bind(calculator),
    getNextBusinessDay: calculator.getNextBusinessDay.bind(calculator),
    getPreviousBusinessDay: calculator.getPreviousBusinessDay.bind(calculator),
    addBusinessDays: calculator.addBusinessDays.bind(calculator),
    subtractBusinessDays: calculator.subtractBusinessDays.bind(calculator),
    adjustDeadlineForBusinessRules: calculator.adjustDeadlineForBusinessRules.bind(calculator),
    getBusinessHoursForDate: calculator.getBusinessHoursForDate.bind(calculator),
    calculateWorkingHours: calculator.calculateWorkingHours.bind(calculator),
    findFallbackOffice: calculator.findFallbackOffice.bind(calculator),
    getUpcomingHolidays: calculator.getUpcomingHolidays.bind(calculator),
    generateBusinessCalendar: calculator.generateBusinessCalendar.bind(calculator)
  }
}

// Utility functions for common business day operations
export const BusinessDayUtils = {
  /**
   * Format a business day adjustment result for display
   */
  formatDeadlineAdjustment(adjustment: ReturnType<BusinessDayCalculator['adjustDeadlineForBusinessRules']>): string {
    if (!adjustment.wasAdjusted) {
      return 'No adjustment needed'
    }
    
    const days = Math.floor(
      (adjustment.adjustedDeadline.getTime() - adjustment.originalDeadline.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return `Deadline extended by ${days} day${days !== 1 ? 's' : ''} (${adjustment.reason})`
  },

  /**
   * Get timezone-aware business hours display
   */
  formatBusinessHours(businessDay: BusinessDay, timezone: string): string {
    if (!businessDay.isWorkingDay) {
      return 'Closed'
    }
    
    const start = businessDay.startTime
    const end = businessDay.endTime
    const lunchInfo = businessDay.lunchBreakStart && businessDay.lunchBreakEnd
      ? ` (Lunch: ${businessDay.lunchBreakStart}-${businessDay.lunchBreakEnd})`
      : ''
    
    return `${start} - ${end} ${timezone}${lunchInfo}`
  },

  /**
   * Calculate business day overlap between two offices
   */
  calculateOfficeOverlap(office1: OfficeLocation, office2: OfficeLocation): number {
    const office1BusinessDays = office1.businessHours.standard.filter(day => day.isWorkingDay).length
    const office2BusinessDays = office2.businessHours.standard.filter(day => day.isWorkingDay).length
    
    const overlappingDays = office1.businessHours.standard.filter((day1, index) => {
      const day2 = office2.businessHours.standard[index]
      return day1.isWorkingDay && day2.isWorkingDay
    }).length
    
    return Math.round((overlappingDays / Math.max(office1BusinessDays, office2BusinessDays)) * 100)
  }
}