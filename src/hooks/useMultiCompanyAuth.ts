import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  SessionContext, 
  CompanyAccess, 
  GlobalUser, 
  CompanyUserProfile,
  User
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
}

interface CompanySwitchResult {
  success: boolean
  session?: SessionContext
  error?: AuthError
}

export function useMultiCompanyAuth() {
  const [sessionContext, setSessionContext] = useKV<SessionContext | null>('session-context', null)
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)

  // Check if user is authenticated
  const isAuthenticated = !!sessionContext && !!currentUser

  // Get current company from session context
  const currentCompany = sessionContext?.current_company_id || null

  // Get available companies for switching
  const availableCompanies = sessionContext?.available_companies || []

  // Simulate authentication API call
  const authenticateUser = useCallback(async (credentials: LoginCredentials): Promise<SessionContext | null> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication logic
      if (credentials.email === 'sarah.johnson@example.com' && credentials.password === 'password123') {
        // Simulate MFA check if enabled
        if (credentials.mfa_code && credentials.mfa_code !== '123456') {
          throw new AuthError('INVALID_MFA', 'Invalid MFA code', 'mfa_code')
        }

        // Create mock session context
        const session: SessionContext = {
          global_user_id: 'global-user-1',
          current_company_id: 'acme-corp',
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
          permissions: ['all'],
          role: 'admin'
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
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    const session = await authenticateUser(credentials)
    
    if (session) {
      setSessionContext(session)
      
      // Create user object for UI
      const user: User = {
        id: session.global_user_id,
        email: credentials.email,
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        role: session.role,
        permissions: session.permissions,
        companyId: session.current_company_id,
        employee_id: 'EMP-001',
        department: 'Information Technology',
        job_title: 'System Administrator',
        is_owner: true,
        company_profiles: [], // Would be loaded separately
        global_profile: {} as GlobalUser // Would be loaded separately
      }
      
      setCurrentUser(user)
      toast.success('Login successful')
      return true
    }
    
    return false
  }, [authenticateUser, setSessionContext, setCurrentUser])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simulate API call to invalidate session
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSessionContext(null)
      setCurrentUser(null)
      setAuthError(null)
      
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    } finally {
      setIsLoading(false)
    }
  }, [setSessionContext, setCurrentUser])

  // Switch company function
  const switchCompany = useCallback(async (companyId: string): Promise<CompanySwitchResult> => {
    if (!sessionContext) {
      return { success: false, error: new AuthError('NO_SESSION', 'No active session') }
    }

    setIsLoading(true)
    
    try {
      // Find the target company
      const targetCompany = sessionContext.available_companies.find(c => c.company_id === companyId)
      
      if (!targetCompany) {
        throw new AuthError('COMPANY_NOT_FOUND', 'Company not accessible')
      }

      if (targetCompany.status !== 'active') {
        throw new AuthError('COMPANY_INACTIVE', 'Company access is suspended')
      }

      // Simulate API call to switch company context
      await new Promise(resolve => setTimeout(resolve, 800))

      // Update session context
      const updatedSession: SessionContext = {
        ...sessionContext,
        current_company_id: companyId,
        permissions: targetCompany.permissions,
        role: targetCompany.role,
        available_companies: sessionContext.available_companies.map(c => 
          c.company_id === companyId 
            ? { ...c, last_accessed: new Date().toISOString() }
            : c
        )
      }

      // Update user context
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          companyId: companyId,
          role: targetCompany.role,
          permissions: targetCompany.permissions
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
  }, [sessionContext, currentUser, setSessionContext, setCurrentUser])

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