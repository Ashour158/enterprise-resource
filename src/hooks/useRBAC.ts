import { useState, useCallback, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Permission, Role, PermissionCheck, SecurityAuditLog, UserRole } from '@/types/rbac'
import { ROLE_LEVELS, PERMISSION_MATRIX, DEFAULT_ROLES } from '@/data/rbacData'

interface UseRBACReturn {
  // Permission checking
  hasPermission: (check: PermissionCheck) => boolean
  hasAnyPermission: (checks: PermissionCheck[]) => boolean
  hasAllPermissions: (checks: PermissionCheck[]) => boolean
  getEffectivePermissions: (userId: string, companyId: string) => Permission[]
  
  // Role management
  roles: Role[]
  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateRole: (roleId: string, updates: Partial<Role>) => Promise<boolean>
  deleteRole: (roleId: string) => Promise<boolean>
  assignRole: (userId: string, roleId: string, assignedBy: string) => Promise<boolean>
  revokeRole: (userId: string, roleId: string) => Promise<boolean>
  
  // User role management
  userRoles: UserRole[]
  getUserRoles: (userId: string, companyId?: string) => UserRole[]
  getHighestRole: (userId: string, companyId: string) => Role | null
  
  // Audit and security
  auditLogs: SecurityAuditLog[]
  logSecurityEvent: (event: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => void
  
  // Utilities
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useRBAC(companyId: string, userId?: string): UseRBACReturn {
  const [roles, setRoles] = useKV<Role[]>(`rbac-roles-${companyId}`, [])
  const [userRoles, setUserRoles] = useKV<UserRole[]>(`rbac-user-roles-${companyId}`, [])
  const [auditLogs, setAuditLogs] = useKV<SecurityAuditLog[]>(`rbac-audit-${companyId}`, [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure arrays are never undefined
  const safeRoles = roles || []
  const safeUserRoles = userRoles || []
  const safeAuditLogs = auditLogs || []

  // Initialize default roles if none exist
  const initializeRoles = useCallback(async () => {
    if (safeRoles.length === 0) {
      const defaultRoles = DEFAULT_ROLES.map((role, index) => ({
        ...role,
        id: `role-${index + 1}`,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      setRoles(defaultRoles)
    }
  }, [safeRoles.length, companyId, setRoles])

  // Permission checking functions
  const hasPermission = useCallback((check: PermissionCheck): boolean => {
    if (!userId) return false
    
    const userRoleList = getUserRoles(userId, companyId)
    if (userRoleList.length === 0) return false

    // Get the highest role level (lowest number = highest privilege)
    const highestRole = getHighestRole(userId, companyId)
    if (!highestRole) return false

    // Check permission matrix
    const modulePermissions = PERMISSION_MATRIX[check.moduleId]
    if (!modulePermissions) return false

    const rolePermissions = modulePermissions[highestRole.level]
    if (!rolePermissions) return false

    // Check if the action is allowed for this role level
    const actionKey = check.action as keyof typeof rolePermissions
    if (typeof rolePermissions[actionKey] !== 'boolean') return false

    const hasAction = rolePermissions[actionKey] as boolean
    if (!hasAction) return false

    // Check scope restrictions
    if (check.scope && !rolePermissions.scope.includes(check.scope)) {
      return false
    }

    return true
  }, [userId, companyId, userRoles, roles])

  const hasAnyPermission = useCallback((checks: PermissionCheck[]): boolean => {
    return checks.some(check => hasPermission(check))
  }, [hasPermission])

  const hasAllPermissions = useCallback((checks: PermissionCheck[]): boolean => {
    return checks.every(check => hasPermission(check))
  }, [hasPermission])

  const getUserRoles = useCallback((targetUserId: string, targetCompanyId?: string): UserRole[] => {
    return safeUserRoles.filter(ur => 
      ur.userId === targetUserId && 
      ur.isActive && 
      (!targetCompanyId || ur.companyId === targetCompanyId)
    )
  }, [safeUserRoles])

  const getHighestRole = useCallback((targetUserId: string, targetCompanyId: string): Role | null => {
    const userRoleList = getUserRoles(targetUserId, targetCompanyId)
    if (userRoleList.length === 0) return null

    const userRoleIds = userRoleList.map(ur => ur.roleId)
    const userRoleObjects = safeRoles.filter(role => userRoleIds.includes(role.id))
    
    if (userRoleObjects.length === 0) return null

    // Return the role with the lowest level number (highest privilege)
    return userRoleObjects.reduce((highest, current) => 
      current.level < highest.level ? current : highest
    )
  }, [getUserRoles, safeRoles])

  const getEffectivePermissions = useCallback((targetUserId: string, targetCompanyId: string): Permission[] => {
    const userRoleList = getUserRoles(targetUserId, targetCompanyId)
    if (userRoleList.length === 0) return []

    const userRoleIds = userRoleList.map(ur => ur.roleId)
    const userRoleObjects = safeRoles.filter(role => userRoleIds.includes(role.id))
    
    // Merge all permissions from all roles
    const allPermissions: Permission[] = []
    userRoleObjects.forEach(role => {
      allPermissions.push(...role.permissions)
    })

    // Remove duplicates
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    )

    return uniquePermissions
  }, [getUserRoles, safeRoles])

  // Role management functions
  const createRole = useCallback(async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setIsLoading(true)
      const newRole: Role = {
        ...roleData,
        id: `role-${Date.now()}`,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setRoles(current => [...(current || []), newRole])
      
      logSecurityEvent({
        userId: userId || 'system',
        companyId,
        eventType: 'role_assigned',
        eventDescription: `Created new role: ${newRole.name}`,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        riskLevel: 'medium',
        additionalData: { roleId: newRole.id, roleName: newRole.name }
      })
      
      return newRole.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [companyId, userId, setRoles])

  const updateRole = useCallback(async (roleId: string, updates: Partial<Role>): Promise<boolean> => {
    try {
      setIsLoading(true)
      setRoles(current => 
        (current || []).map(role => 
          role.id === roleId 
            ? { ...role, ...updates, updatedAt: new Date().toISOString() }
            : role
        )
      )
      
      logSecurityEvent({
        userId: userId || 'system',
        companyId,
        eventType: 'permission_granted',
        eventDescription: `Updated role: ${roleId}`,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        riskLevel: 'medium',
        additionalData: { roleId, updates }
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [companyId, userId, setRoles])

  const deleteRole = useCallback(async (roleId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if role is in use
      const roleInUse = safeUserRoles.some(ur => ur.roleId === roleId)
      if (roleInUse) {
        throw new Error('Cannot delete role that is assigned to users')
      }
      
      setRoles(current => (current || []).filter(role => role.id !== roleId))
      
      logSecurityEvent({
        userId: userId || 'system',
        companyId,
        eventType: 'role_removed',
        eventDescription: `Deleted role: ${roleId}`,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        riskLevel: 'high',
        additionalData: { roleId }
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [safeUserRoles, companyId, userId, setRoles])

  const assignRole = useCallback(async (targetUserId: string, roleId: string, assignedBy: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if user already has this role
      const existingAssignment = safeUserRoles.find(ur => 
        ur.userId === targetUserId && ur.roleId === roleId && ur.companyId === companyId
      )
      
      if (existingAssignment) {
        setError('User already has this role')
        return false
      }
      
      const newUserRole: UserRole = {
        id: `user-role-${Date.now()}`,
        userId: targetUserId,
        roleId,
        companyId,
        assignedBy,
        assignedAt: new Date().toISOString(),
        isActive: true
      }
      
      setUserRoles(current => [...(current || []), newUserRole])
      
      logSecurityEvent({
        userId: assignedBy,
        companyId,
        eventType: 'role_assigned',
        eventDescription: `Assigned role ${roleId} to user ${targetUserId}`,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        riskLevel: 'medium',
        additionalData: { targetUserId, roleId, userRoleId: newUserRole.id }
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [safeUserRoles, companyId, setUserRoles])

  const revokeRole = useCallback(async (targetUserId: string, roleId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      setUserRoles(current => 
        (current || []).filter(ur => 
          !(ur.userId === targetUserId && ur.roleId === roleId && ur.companyId === companyId)
        )
      )
      
      logSecurityEvent({
        userId: userId || 'system',
        companyId,
        eventType: 'role_removed',
        eventDescription: `Revoked role ${roleId} from user ${targetUserId}`,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        riskLevel: 'medium',
        additionalData: { targetUserId, roleId }
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke role')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [companyId, userId, setUserRoles])

  // Audit and security functions
  const logSecurityEvent = useCallback((event: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => {
    const auditLog: SecurityAuditLog = {
      ...event,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    
    setAuditLogs(current => [auditLog, ...(current || [])].slice(0, 1000)) // Keep last 1000 logs
  }, [setAuditLogs])

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await initializeRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }, [initializeRoles])

  // Initialize roles on mount
  useState(() => {
    initializeRoles()
  })

  const memoizedReturn = useMemo(() => ({
    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getEffectivePermissions,
    
    // Role management
    roles: safeRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    
    // User role management
    userRoles: safeUserRoles,
    getUserRoles,
    getHighestRole,
    
    // Audit and security
    auditLogs: safeAuditLogs,
    logSecurityEvent,
    
    // Utilities
    isLoading,
    error,
    refreshData
  }), [
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getEffectivePermissions,
    safeRoles,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    safeUserRoles,
    getUserRoles,
    getHighestRole,
    safeAuditLogs,
    logSecurityEvent,
    isLoading,
    error,
    refreshData
  ])

  return memoizedReturn
}