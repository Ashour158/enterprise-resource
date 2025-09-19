import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  UserProfileUpdate, 
  UserPreferences, 
  AvatarUpload, 
  ProfileChangeLog,
  ProfileSecuritySettings,
  GlobalUser,
  NotificationType
} from '@/types/erp'
import { toast } from 'sonner'

interface UseUserProfileReturn {
  // Profile Data
  profile: GlobalUser | null
  preferences: UserPreferences | null
  securitySettings: ProfileSecuritySettings | null
  changeLog: ProfileChangeLog[]
  isLoading: boolean
  
  // Profile Management
  updateProfile: (updates: UserProfileUpdate) => Promise<boolean>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>
  updateSecuritySettings: (settings: Partial<ProfileSecuritySettings>) => Promise<boolean>
  
  // Avatar Management
  uploadAvatar: (file: File) => Promise<boolean>
  removeAvatar: () => Promise<boolean>
  avatarUpload: AvatarUpload | null
  
  // Security
  enableMFA: (method: 'totp' | 'sms' | 'email') => Promise<{ secret?: string; qrCode?: string; success: boolean }>
  disableMFA: () => Promise<boolean>
  generateBackupCodes: () => Promise<string[]>
  revokeAllSessions: () => Promise<boolean>
  removeTrustedDevice: (deviceId: string) => Promise<boolean>
  
  // Utilities
  exportProfile: (format: 'json' | 'csv') => Promise<void>
  validateProfileData: (data: UserProfileUpdate) => ValidationResult
  resetPreferences: () => Promise<boolean>
}

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const [profile, setProfile] = useKV<GlobalUser | null>('user-profile', null)
  const [preferences, setPreferences] = useKV<UserPreferences | null>('user-preferences', null)
  const [securitySettings, setSecuritySettings] = useKV<ProfileSecuritySettings | null>('user-security', null)
  const [changeLog, setChangeLog] = useKV<ProfileChangeLog[]>('profile-change-log', [])
  const [avatarUpload, setAvatarUpload] = useState<AvatarUpload | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize profile with mock data if not exists
  useEffect(() => {
    if (!profile) {
      // Import mock data
      import('@/data/mockData').then(({ mockGlobalUser }) => {
        setProfile(mockGlobalUser)
      })
    }
  }, [profile, setProfile])

  // Initialize default preferences
  useEffect(() => {
    if (!preferences) {
      const defaultPreferences: UserPreferences = {
        // Appearance
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        currency_display: 'symbol',
        number_format: 'US',
        
        // Dashboard & Layout
        dashboard_layout: 'grid',
        sidebar_collapsed: false,
        default_page: 'dashboard',
        widgets_config: {},
        quick_access_modules: ['finance', 'hr', 'inventory', 'sales'],
        
        // Notifications
        email_notifications: true,
        push_notifications: true,
        desktop_notifications: false,
        notification_frequency: 'immediate',
        notification_types: [
          { category: 'system', enabled: true, channels: ['email', 'push'], priority: 'high' },
          { category: 'security', enabled: true, channels: ['email', 'push', 'sms'], priority: 'high' },
          { category: 'workflow', enabled: true, channels: ['email', 'push'], priority: 'medium' },
          { category: 'financial', enabled: true, channels: ['email'], priority: 'medium' },
          { category: 'inventory', enabled: false, channels: ['email'], priority: 'low' },
          { category: 'hr', enabled: true, channels: ['email'], priority: 'medium' },
          { category: 'social', enabled: false, channels: ['push'], priority: 'low' }
        ] as NotificationType[],
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        
        // Accessibility
        high_contrast: false,
        large_text: false,
        reduce_motion: false,
        screen_reader: false,
        keyboard_shortcuts: true,
        
        // Privacy & Security
        session_timeout: 480, // 8 hours in minutes
        two_factor_required: false,
        login_notifications: true,
        security_alerts: true,
        data_export_format: 'json',
        
        // Advanced
        developer_mode: false,
        beta_features: false,
        analytics_opt_in: true,
        auto_save_interval: 300, // 5 minutes in seconds
        backup_frequency: 'weekly'
      }
      setPreferences(defaultPreferences)
    }
  }, [preferences, setPreferences])

  const validateProfileData = useCallback((data: UserProfileUpdate): ValidationResult => {
    const errors: Record<string, string> = {}

    if (data.first_name && data.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters'
    }

    if (data.last_name && data.last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters'
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (data.emergency_contact?.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.emergency_contact.phone)) {
      errors.emergency_phone = 'Please enter a valid emergency contact phone'
    }

    if (data.social_links) {
      data.social_links.forEach((link, index) => {
        try {
          new URL(link.url)
        } catch {
          errors[`social_link_${index}`] = 'Please enter a valid URL'
        }
      })
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [])

  const logProfileChange = useCallback((field: string, oldValue: any, newValue: any, reason?: string) => {
    const logEntry: ProfileChangeLog = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId || 'current-user',
      field,
      old_value: oldValue,
      new_value: newValue,
      changed_by: userId || 'current-user',
      change_reason: reason,
      timestamp: new Date().toISOString()
    }

    setChangeLog(currentLog => [logEntry, ...(currentLog || []).slice(0, 99)]) // Keep last 100 entries
  }, [userId, setChangeLog])

  const updateProfile = useCallback(async (updates: UserProfileUpdate): Promise<boolean> => {
    try {
      setIsLoading(true)

      const validation = validateProfileData(updates)
      if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => toast.error(error))
        return false
      }

      const currentProfile = profile
      if (!currentProfile) {
        toast.error('Profile not found')
        return false
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedProfile = { ...currentProfile, ...updates, updated_at: new Date().toISOString() }
      setProfile(updatedProfile)

      // Log changes
      Object.entries(updates).forEach(([key, value]) => {
        if (currentProfile[key as keyof GlobalUser] !== value) {
          logProfileChange(key, currentProfile[key as keyof GlobalUser], value)
        }
      })

      toast.success('Profile updated successfully')
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [profile, setProfile, validateProfileData, logProfileChange])

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const currentPrefs = preferences || {} as UserPreferences
      const updatedPreferences = { ...currentPrefs, ...newPreferences }
      setPreferences(updatedPreferences)

      // Log preference changes
      Object.entries(newPreferences).forEach(([key, value]) => {
        if (currentPrefs[key as keyof UserPreferences] !== value) {
          logProfileChange(`preferences.${key}`, currentPrefs[key as keyof UserPreferences], value)
        }
      })

      toast.success('Preferences updated successfully')
      return true
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [preferences, setPreferences, logProfileChange])

  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return false
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return false
      }

      const preview_url = URL.createObjectURL(file)
      
      setAvatarUpload({
        file,
        preview_url,
        upload_progress: 0,
        upload_status: 'uploading'
      })

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setAvatarUpload(prev => prev ? { ...prev, upload_progress: progress } : null)
      }

      // Simulate successful upload - in real app, this would be a cloud storage URL
      const avatarUrl = `https://api.example.com/avatars/${userId || 'current-user'}-${Date.now()}.jpg`

      const success = await updateProfile({ profile_picture_url: avatarUrl })
      
      setAvatarUpload(prev => prev ? { 
        ...prev, 
        upload_status: success ? 'completed' : 'failed',
        error_message: success ? undefined : 'Upload failed'
      } : null)

      if (success) {
        // Clean up preview URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(preview_url)
          setAvatarUpload(null)
        }, 2000)
      }

      return success
    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAvatarUpload(prev => prev ? { 
        ...prev, 
        upload_status: 'failed', 
        error_message: 'Upload failed'
      } : null)
      toast.error('Failed to upload avatar')
      return false
    }
  }, [updateProfile, userId])

  const removeAvatar = useCallback(async (): Promise<boolean> => {
    try {
      const success = await updateProfile({ profile_picture_url: undefined })
      if (success) {
        toast.success('Avatar removed successfully')
      }
      return success
    } catch (error) {
      console.error('Failed to remove avatar:', error)
      toast.error('Failed to remove avatar')
      return false
    }
  }, [updateProfile])

  const enableMFA = useCallback(async (method: 'totp' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string; success: boolean }> => {
    try {
      setIsLoading(true)
      
      // Simulate API call to enable MFA
      await new Promise(resolve => setTimeout(resolve, 1000))

      let secret: string | undefined
      let qrCode: string | undefined

      if (method === 'totp') {
        secret = 'JBSWY3DPEHPK3PXP' // In real app, generate random secret
        qrCode = `otpauth://totp/ERP%20System:${profile?.email}?secret=${secret}&issuer=ERP%20System`
      }

      const currentSecurity = securitySettings || {} as ProfileSecuritySettings
      const updatedSecurity = {
        ...currentSecurity,
        mfa_enabled: true,
        mfa_methods: [...(currentSecurity.mfa_methods || []), method]
      }

      setSecuritySettings(updatedSecurity)
      logProfileChange('mfa_enabled', false, true, `Enabled ${method.toUpperCase()} MFA`)
      
      toast.success(`${method.toUpperCase()} authentication enabled`)
      return { secret, qrCode, success: true }
    } catch (error) {
      console.error('Failed to enable MFA:', error)
      toast.error('Failed to enable MFA')
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [securitySettings, setSecuritySettings, profile?.email, logProfileChange])

  const disableMFA = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const currentSecurity = securitySettings || {} as ProfileSecuritySettings
      const updatedSecurity = {
        ...currentSecurity,
        mfa_enabled: false,
        mfa_methods: []
      }

      setSecuritySettings(updatedSecurity)
      logProfileChange('mfa_enabled', true, false, 'Disabled MFA')
      
      toast.success('Multi-factor authentication disabled')
      return true
    } catch (error) {
      console.error('Failed to disable MFA:', error)
      toast.error('Failed to disable MFA')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [securitySettings, setSecuritySettings, logProfileChange])

  const generateBackupCodes = useCallback(async (): Promise<string[]> => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substr(2, 6).toUpperCase()
      )

      const currentSecurity = securitySettings || {} as ProfileSecuritySettings
      const updatedSecurity = {
        ...currentSecurity,
        backup_codes: backupCodes
      }

      setSecuritySettings(updatedSecurity)
      logProfileChange('backup_codes', 'generated', backupCodes.length, 'Generated new backup codes')
      
      toast.success('New backup codes generated')
      return backupCodes
    } catch (error) {
      console.error('Failed to generate backup codes:', error)
      toast.error('Failed to generate backup codes')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [securitySettings, setSecuritySettings, logProfileChange])

  const revokeAllSessions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      logProfileChange('sessions', 'revoked_all', new Date().toISOString(), 'Revoked all active sessions')
      toast.success('All sessions have been revoked')
      return true
    } catch (error) {
      console.error('Failed to revoke sessions:', error)
      toast.error('Failed to revoke sessions')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [logProfileChange])

  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      logProfileChange('trusted_device', 'removed', deviceId, 'Removed trusted device')
      toast.success('Trusted device removed')
      return true
    } catch (error) {
      console.error('Failed to remove trusted device:', error)
      toast.error('Failed to remove trusted device')
      return false
    }
  }, [logProfileChange])

  const updateSecuritySettings = useCallback(async (settings: Partial<ProfileSecuritySettings>): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const currentSecurity = securitySettings || {} as ProfileSecuritySettings
      const updatedSecurity = { ...currentSecurity, ...settings }
      setSecuritySettings(updatedSecurity)

      Object.entries(settings).forEach(([key, value]) => {
        logProfileChange(`security.${key}`, currentSecurity[key as keyof ProfileSecuritySettings], value)
      })

      toast.success('Security settings updated')
      return true
    } catch (error) {
      console.error('Failed to update security settings:', error)
      toast.error('Failed to update security settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [securitySettings, setSecuritySettings, logProfileChange])

  const exportProfile = useCallback(async (format: 'json' | 'csv'): Promise<void> => {
    try {
      const data = {
        profile,
        preferences,
        securitySettings: securitySettings ? { ...securitySettings, backup_codes: ['***'], mfa_secret: '***' } : null,
        changeLog: (changeLog || []).slice(0, 50) // Last 50 changes
      }

      let content: string
      let filename: string
      let mimeType: string

      if (format === 'json') {
        content = JSON.stringify(data, null, 2)
        filename = `profile-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        // Simple CSV export for profile data
        const csvLines = [
          'Field,Value',
          `Name,"${profile?.first_name} ${profile?.last_name}"`,
          `Email,"${profile?.email}"`,
          `Phone,"${profile?.phone || ''}"`,
          `Language,"${preferences?.language || ''}"`,
          `Timezone,"${preferences?.timezone || ''}"`,
          `Theme,"${preferences?.theme || ''}"`,
          `MFA Enabled,"${securitySettings?.mfa_enabled ? 'Yes' : 'No'}"`
        ]
        content = csvLines.join('\n')
        filename = `profile-export-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Profile exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to export profile:', error)
      toast.error('Failed to export profile')
    }
  }, [profile, preferences, securitySettings, changeLog])

  const resetPreferences = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Reset to default preferences
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        currency_display: 'symbol',
        number_format: 'US',
        dashboard_layout: 'grid',
        sidebar_collapsed: false,
        default_page: 'dashboard',
        widgets_config: {},
        quick_access_modules: ['finance', 'hr', 'inventory', 'sales'],
        email_notifications: true,
        push_notifications: true,
        desktop_notifications: false,
        notification_frequency: 'immediate',
        notification_types: [
          { category: 'system', enabled: true, channels: ['email', 'push'], priority: 'high' },
          { category: 'security', enabled: true, channels: ['email', 'push', 'sms'], priority: 'high' },
          { category: 'workflow', enabled: true, channels: ['email', 'push'], priority: 'medium' },
          { category: 'financial', enabled: true, channels: ['email'], priority: 'medium' },
          { category: 'inventory', enabled: false, channels: ['email'], priority: 'low' },
          { category: 'hr', enabled: true, channels: ['email'], priority: 'medium' },
          { category: 'social', enabled: false, channels: ['push'], priority: 'low' }
        ] as NotificationType[],
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        high_contrast: false,
        large_text: false,
        reduce_motion: false,
        screen_reader: false,
        keyboard_shortcuts: true,
        session_timeout: 480,
        two_factor_required: false,
        login_notifications: true,
        security_alerts: true,
        data_export_format: 'json',
        developer_mode: false,
        beta_features: false,
        analytics_opt_in: true,
        auto_save_interval: 300,
        backup_frequency: 'weekly'
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      setPreferences(defaultPreferences)
      logProfileChange('preferences', 'reset', 'default', 'Reset all preferences to default')
      
      toast.success('Preferences reset to default')
      return true
    } catch (error) {
      console.error('Failed to reset preferences:', error)
      toast.error('Failed to reset preferences')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setPreferences, logProfileChange])

  return {
    // Profile Data
    profile: profile || null,
    preferences: preferences || null,
    securitySettings: securitySettings || null,
    changeLog: changeLog || [],
    isLoading,
    
    // Profile Management
    updateProfile,
    updatePreferences,
    updateSecuritySettings,
    
    // Avatar Management
    uploadAvatar,
    removeAvatar,
    avatarUpload,
    
    // Security
    enableMFA,
    disableMFA,
    generateBackupCodes,
    revokeAllSessions,
    removeTrustedDevice,
    
    // Utilities
    exportProfile,
    validateProfileData,
    resetPreferences
  }
}