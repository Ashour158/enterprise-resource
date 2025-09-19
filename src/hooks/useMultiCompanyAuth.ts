import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  SessionContext, 
  CompanyAccess, 
  GlobalUser, 
  CompanyUserProfile,
  User,
  UserSession,
  Role,
  Permission
} from '@/types/erp'

interface AuthError {
  code: string
  message: string
  field?: string
}

interface LoginCredentials {
  email: string
  password: string
  mfa_code?: string
  remember_me?: boolean
  company_context?: string // Optional company selection during login
}

interface CompanySwitchResult {
  success: boolean
  session?: SessionContext
  error?: AuthError
}

interface MultiCompanyUser {
  global_user: GlobalUser
  company_profiles: CompanyUserProfile[]
  current_session?: UserSession
  available_companies: CompanyAccess[]
}

export function useMultiCompanyAuth() {
  const [sessionContext, setSessionContext] = useKV<SessionContext | null>('session-context', null)
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [globalUser, setGlobalUser] = useKV<GlobalUser | null>('global-user', null)
  const [companyProfiles, setCompanyProfiles] = useKV<CompanyUserProfile[]>('company-profiles', [])
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)

  // Check if user is authenticated with valid session
  const isAuthenticated = !!sessionContext && !!currentUser && !!globalUser

  // Get current company from session context
  const currentCompany = sessionContext?.current_company_id || null

  // Get available companies for switching
  const availableCompanies = sessionContext?.available_companies || []

  // Get current company profile
  const currentCompanyProfile = (companyProfiles || []).find(
    profile => profile.company_id === currentCompany
  )

  // Simulate authentication API call with multi-company support
  const authenticateUser = useCallback(async (credentials: LoginCredentials): Promise<SessionContext | null> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication logic for multi-company architecture
      if (credentials.email === 'sarah.johnson@example.com' && credentials.password === 'password123') {
        // Simulate MFA check if enabled
        if (credentials.mfa_code && credentials.mfa_code !== '123456') {
          throw new AuthError('INVALID_MFA', 'Invalid MFA code', 'mfa_code')
        }

        // Mock global user data
        const mockGlobalUser: GlobalUser = {
          id: 'global-user-1',
          email: credentials.email,
          first_name: 'Sarah',
          last_name: 'Johnson',
          phone: '+1 (555) 123-4567',
          profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          mfa_enabled: true,
          backup_codes: ['123456789', '987654321'],
          failed_login_attempts: 0,
          is_active: true,
          preferences: {
            theme: 'light',
            notifications: true,
            timezone: 'America/New_York'
          },
          security_settings: {
            login_notifications: true,
            device_tracking: true
          },
          password_changed_at: '2024-01-15T10:00:00Z',
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        }

        // Mock company profiles for the user
        const mockCompanyProfiles: CompanyUserProfile[] = [
          {
            id: 'profile-1',
            global_user_id: 'global-user-1',
            company_id: 'acme-corp',
            employee_id: 'EMP-001',
            department: 'Information Technology',
            job_title: 'System Administrator',
            role: 'admin',
            permissions: ['all'],
            status: 'active',
            hire_date: '2023-01-15',
            settings: {
              dashboard_layout: 'grid',
              notification_preferences: ['email', 'in_app']
            },
            created_at: '2023-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 'profile-2',
            global_user_id: 'global-user-1',
            company_id: 'tech-solutions',
            employee_id: 'TS-101',
            department: 'Operations',
            job_title: 'Operations Manager',
            role: 'manager',
            permissions: ['finance', 'inventory', 'hr', 'reporting'],
            status: 'active',
            hire_date: '2023-06-01',
            settings: {
              dashboard_layout: 'list',
              notification_preferences: ['email']
            },
            created_at: '2023-06-01T09:00:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          }
        ]

        // Set global user and company profiles
        setGlobalUser(mockGlobalUser)
        setCompanyProfiles(mockCompanyProfiles)

        // Determine initial company context
        const initialCompanyId = credentials.company_context || 'acme-corp'
        const initialProfile = mockCompanyProfiles.find(p => p.company_id === initialCompanyId)

        if (!initialProfile) {
          throw new AuthError('COMPANY_ACCESS_DENIED', 'No access to requested company')
        }

        // Create session context
        const session: SessionContext = {
          global_user_id: 'global-user-1',
          current_company_id: initialCompanyId,
          available_companies: [
            {
              company_id: 'acme-corp',
              company_name: 'Acme Corporation',
              company_code: 'ACME',
              role: 'admin',
              permissions: ['all'],
              status: 'active',
              last_accessed: new Date().toISOString()
            },
            {
              company_id: 'tech-solutions',
              company_name: 'Tech Solutions Ltd',
              company_code: 'TECH',
              role: 'manager',
              permissions: ['finance', 'inventory', 'hr', 'reporting'],
              status: 'active'
            }
          ],
          jwt_token: 'mock-jwt-token-' + Date.now(),
          expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
          permissions: initialProfile.permissions,
          role: initialProfile.role
        }

        return session
      } else {
        throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setAuthError(error)
      } else {
        setAuthError(new AuthError('NETWORK_ERROR', 'Connection failed. Please try again.'))
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [setGlobalUser, setCompanyProfiles])

  // Login function with multi-company support
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    const session = await authenticateUser(credentials)
    
    if (session && globalUser && companyProfiles) {
      setSessionContext(session)
      
      // Get current company profile for the session
      const currentProfile = companyProfiles.find(p => p.company_id === session.current_company_id)
      
      if (!currentProfile) {
        setAuthError(new AuthError('COMPANY_PROFILE_ERROR', 'Unable to load company profile'))
        return false
      }
      
      // Create user object for UI with current company context
      const user: User = {
        id: session.global_user_id,
        email: globalUser.email,
        name: `${globalUser.first_name} ${globalUser.last_name}`,
        avatar: globalUser.profile_picture_url,
        role: currentProfile.role,
        permissions: currentProfile.permissions,
        companyId: session.current_company_id,
        employee_id: currentProfile.employee_id,
        department: currentProfile.department,
        job_title: currentProfile.job_title,
        is_owner: currentProfile.role === 'admin',
        company_profiles: companyProfiles,
        global_profile: globalUser
      }
      
      setCurrentUser(user)
      toast.success(`Welcome back, ${globalUser.first_name}!`)
      return true
    }
    
    return false
  }, [authenticateUser, globalUser, companyProfiles, setSessionContext, setCurrentUser])

  // Logout function with proper cleanup
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simulate API call to invalidate session
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear all authentication state
      setSessionContext(null)
      setCurrentUser(null)
      setGlobalUser(null)
      setCompanyProfiles([])
      setAuthError(null)
      
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    } finally {
      setIsLoading(false)
    }
  }, [setSessionContext, setCurrentUser, setGlobalUser, setCompanyProfiles])

  // Switch company function with proper permission handling
  const switchCompany = useCallback(async (companyId: string): Promise<CompanySwitchResult> => {
    if (!sessionContext || !globalUser || !companyProfiles) {
      return { success: false, error: new AuthError('NO_SESSION', 'No active session') }
    }

    setIsLoading(true)
    
    try {
      // Find the target company and user profile
      const targetCompany = sessionContext.available_companies.find(c => c.company_id === companyId)
      const targetProfile = companyProfiles.find(p => p.company_id === companyId)
      
      if (!targetCompany) {
        throw new AuthError('COMPANY_NOT_FOUND', 'Company not accessible')
      }

      if (!targetProfile) {
        throw new AuthError('PROFILE_NOT_FOUND', 'User profile not found for company')
      }

      if (targetCompany.status !== 'active' || targetProfile.status !== 'active') {
        throw new AuthError('COMPANY_INACTIVE', 'Company access is suspended')
      }

      // Simulate API call to switch company context
      await new Promise(resolve => setTimeout(resolve, 800))

      // Update session context with new company
      const updatedSession: SessionContext = {
        ...sessionContext,
        current_company_id: companyId,
        permissions: targetProfile.permissions,
        role: targetProfile.role,
        available_companies: sessionContext.available_companies.map(c => 
          c.company_id === companyId 
            ? { ...c, last_accessed: new Date().toISOString() }
            : c
        )
      }

      // Update user context with new company profile
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          companyId: companyId,
          role: targetProfile.role,
          permissions: targetProfile.permissions,
          employee_id: targetProfile.employee_id,
          department: targetProfile.department,
          job_title: targetProfile.job_title,
          is_owner: targetProfile.role === 'admin'
        }
        setCurrentUser(updatedUser)
      }

      setSessionContext(updatedSession)

      toast.success(`Switched to ${targetCompany.company_name}`)
      
      return { success: true, session: updatedSession }
    } catch (error) {
      const authError = error instanceof AuthError 
        ? error 
        : new AuthError('SWITCH_ERROR', 'Failed to switch company')
      
      setAuthError(authError)
      toast.error(authError.message)
      
      return { success: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [sessionContext, globalUser, companyProfiles, currentUser, setSessionContext, setCurrentUser])

  // Refresh session function
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!sessionContext) return false

    setIsLoading(true)
    
    try {
      // Simulate API call to refresh session
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if session is still valid
      const now = new Date()
      const expiresAt = new Date(sessionContext.expires_at)
      
      if (now >= expiresAt) {
        await logout()
        return false
      }

      // Extend session
      const updatedSession: SessionContext = {
        ...sessionContext,
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      }
      
      setSessionContext(updatedSession)
      return true
    } catch (error) {
      await logout()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [sessionContext, logout, setSessionContext])

  // Check session validity on load
  useEffect(() => {
    if (sessionContext) {
      const checkSession = async () => {
        const isValid = await refreshSession()
        if (!isValid) {
          toast.error('Session expired. Please log in again.')
        }
      }
      
      checkSession()
    }
  }, []) // Only run on mount

  // Clear auth error
  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  return {
    // State
    isAuthenticated,
    isLoading,
    currentUser,
    globalUser,
    companyProfiles,
    currentCompanyProfile,
    sessionContext,
    currentCompany,
    availableCompanies,
    authError,
    
    // Actions
    login,
    logout,
    switchCompany,
    refreshSession,
    clearError
  }
}

// Custom Error class for authentication
class AuthError extends Error {
  constructor(
    public code: string, 
    message: string, 
    public field?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}