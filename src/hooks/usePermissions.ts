import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Permission, 
  Role, 
  SecurityContext, 
  AccessPolicy, 
  PermissionRequest,
  UserPermissionOverride 
} from '@/types/erp'
import { toast } from 'sonner'

interface PermissionCheckOptions {
  requireMFA?: boolean
  allowOverride?: boolean
  checkExpiry?: boolean
  contextualData?: Record<string, any>
}

interface PermissionState {
  permissions: Permission[]
  roles: Role[]
  userPermissions: string[]
  securityContext: SecurityContext | null
  accessPolicies: AccessPolicy[]
  pendingRequests: PermissionRequest[]
  overrides: UserPermissionOverride[]
  loading: boolean
  error: string | null
}

export const usePermissions = (companyId: string, userId?: string) => {
  // Persistent permission cache
  const [permissionCache, setPermissionCache] = useKV<Record<string, any>>('permission-cache', {})
  const [roleAssignments, setRoleAssignments] = useKV<Record<string, any>>('role-assignments', {})
  const [securityAuditLog, setSecurityAuditLog] = useKV<any[]>('security-audit-log', [])

  // Local state
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    roles: [],
    userPermissions: [],
    securityContext: null,
    accessPolicies: [],
    pendingRequests: [],
    overrides: [],
    loading: true,
    error: null
  })

  // Initialize permissions system
  useEffect(() => {
    if (companyId) {
      initializePermissions()
    }
  }, [companyId, userId])

  const initializePermissions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Load permissions, roles, and policies for the company
      const [permissions, roles, policies] = await Promise.all([
        loadCompanyPermissions(companyId),
        loadCompanyRoles(companyId),
        loadAccessPolicies(companyId)
      ])

      // Load user-specific data if userId provided
      let userPermissions: string[] = []
      let securityContext: SecurityContext | null = null
      let overrides: UserPermissionOverride[] = []

      if (userId) {
        [userPermissions, securityContext, overrides] = await Promise.all([
          getUserPermissions(userId, companyId),
          getSecurityContext(userId, companyId),
          getUserOverrides(userId, companyId)
        ])
      }

      setState(prev => ({
        ...prev,
        permissions,
        roles,
        userPermissions,
        securityContext,
        accessPolicies: policies,
        overrides,
        loading: false
      }))

    } catch (error) {
      console.error('Error initializing permissions:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to load permissions',
        loading: false
      }))
    }
  }

  // Check if user has specific permission
  const hasPermission = useCallback((
    permission: string, 
    options: PermissionCheckOptions = {}
  ): boolean => {
    try {
      if (!state.securityContext || !userId) return false

      // Check if permission exists in user's granted permissions
      const hasDirectPermission = state.userPermissions.includes(permission)
      
      // Check for overrides
      const override = state.overrides.find(o => 
        o.permission_id === permission && 
        (!o.expires_at || new Date(o.expires_at) > new Date())
      )

      if (override) {
        logSecurityEvent('permission_override_used', { permission, override: override.id })
        return override.granted
      }

      // Apply access policies
      const policyResult = evaluateAccessPolicies(permission, state.accessPolicies)
      if (policyResult === 'deny') {
        logSecurityEvent('permission_denied_by_policy', { permission })
        return false
      }

      // Check MFA requirement
      if (options.requireMFA && !state.securityContext.mfa_verified) {
        logSecurityEvent('permission_denied_mfa_required', { permission })
        return false
      }

      // Check permission expiry if enabled
      if (options.checkExpiry) {
        const permissionData = state.permissions.find(p => p.permission_name === permission)
        if (permissionData?.requires_approval) {
          // Check if approval is still valid
          const approvalValid = checkApprovalValidity(permission)
          if (!approvalValid) {
            logSecurityEvent('permission_denied_approval_expired', { permission })
            return false
          }
        }
      }

      if (hasDirectPermission) {
        logSecurityEvent('permission_granted', { permission })
      }

      return hasDirectPermission
    } catch (error) {
      console.error('Error checking permission:', error)
      logSecurityEvent('permission_check_error', { permission, error: error.message })
      return false
    }
  }, [state, userId])

  // Check multiple permissions at once
  const hasAllPermissions = useCallback((
    permissions: string[], 
    options: PermissionCheckOptions = {}
  ): boolean => {
    return permissions.every(permission => hasPermission(permission, options))
  }, [hasPermission])

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((
    permissions: string[], 
    options: PermissionCheckOptions = {}
  ): boolean => {
    return permissions.some(permission => hasPermission(permission, options))
  }, [hasPermission])

  // Request permission approval
  const requestPermission = async (
    permissionId: string, 
    justification: string,
    roleId?: string
  ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    try {
      if (!userId || !companyId) {
        return { success: false, error: 'User or company not specified' }
      }

      const request: PermissionRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requester_id: userId,
        company_id: companyId,
        permission_id: permissionId,
        role_id: roleId,
        justification,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add to pending requests
      setState(prev => ({
        ...prev,
        pendingRequests: [...prev.pendingRequests, request]
      }))

      logSecurityEvent('permission_requested', { 
        permission: permissionId, 
        justification,
        requestId: request.id 
      })

      toast.success('Permission request submitted for approval')
      return { success: true, requestId: request.id }

    } catch (error) {
      console.error('Error requesting permission:', error)
      return { success: false, error: 'Failed to submit permission request' }
    }
  }

  // Grant role to user
  const assignRole = async (
    targetUserId: string, 
    roleId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!hasPermission('user.assign_role')) {
        return { success: false, error: 'Insufficient permissions to assign roles' }
      }

      const role = state.roles.find(r => r.id === roleId)
      if (!role) {
        return { success: false, error: 'Role not found' }
      }

      // Check if user can assign this role (hierarchy check)
      const canAssign = await checkRoleAssignmentPermission(roleId)
      if (!canAssign) {
        return { success: false, error: 'Cannot assign role with higher or equal privileges' }
      }

      // Update role assignments
      setRoleAssignments((current: Record<string, any>) => ({
        ...current,
        [`${companyId}_${targetUserId}`]: {
          ...current[`${companyId}_${targetUserId}`],
          roles: [...(current[`${companyId}_${targetUserId}`]?.roles || []), roleId],
          assigned_by: userId,
          assigned_at: new Date().toISOString()
        }
      }))

      logSecurityEvent('role_assigned', { 
        targetUserId, 
        roleId, 
        roleName: role.role_name 
      })

      toast.success(`Role "${role.role_name}" assigned successfully`)
      return { success: true }

    } catch (error) {
      console.error('Error assigning role:', error)
      return { success: false, error: 'Failed to assign role' }
    }
  }

  // Revoke role from user
  const revokeRole = async (
    targetUserId: string, 
    roleId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!hasPermission('user.revoke_role')) {
        return { success: false, error: 'Insufficient permissions to revoke roles' }
      }

      const role = state.roles.find(r => r.id === roleId)
      if (!role) {
        return { success: false, error: 'Role not found' }
      }

      // Update role assignments
      setRoleAssignments((current: Record<string, any>) => {
        const userKey = `${companyId}_${targetUserId}`
        const userRoles = current[userKey]?.roles || []
        
        return {
          ...current,
          [userKey]: {
            ...current[userKey],
            roles: userRoles.filter((r: string) => r !== roleId),
            revoked_by: userId,
            revoked_at: new Date().toISOString()
          }
        }
      })

      logSecurityEvent('role_revoked', { 
        targetUserId, 
        roleId, 
        roleName: role.role_name 
      })

      toast.success(`Role "${role.role_name}" revoked successfully`)
      return { success: true }

    } catch (error) {
      console.error('Error revoking role:', error)
      return { success: false, error: 'Failed to revoke role' }
    }
  }

  // Create permission override
  const createPermissionOverride = async (
    targetUserId: string,
    permissionId: string,
    granted: boolean,
    reason: string,
    expiresAt?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!hasPermission('permission.override')) {
        return { success: false, error: 'Insufficient permissions to create overrides' }
      }

      const override: UserPermissionOverride = {
        id: `override_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: targetUserId,
        company_id: companyId,
        permission_id: permissionId,
        granted,
        reason,
        granted_by: userId!,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        overrides: [...prev.overrides, override]
      }))

      logSecurityEvent('permission_override_created', { 
        targetUserId, 
        permissionId, 
        granted, 
        reason,
        overrideId: override.id 
      })

      toast.success(`Permission override created for ${granted ? 'granting' : 'denying'} access`)
      return { success: true }

    } catch (error) {
      console.error('Error creating permission override:', error)
      return { success: false, error: 'Failed to create permission override' }
    }
  }

  // Get user's effective permissions (including role-based and overrides)
  const getEffectivePermissions = useCallback((targetUserId: string): string[] => {
    try {
      const assignments = roleAssignments || {}
      const userRoles = assignments[`${companyId}_${targetUserId}`]?.roles || []
      const rolePermissions = state.roles
        .filter(role => userRoles.includes(role.id))
        .flatMap(role => role.permissions)

      const userOverrides = state.overrides
        .filter(override => 
          override.user_id === targetUserId && 
          (!override.expires_at || new Date(override.expires_at) > new Date())
        )

      // Apply overrides
      const effectivePermissions = new Set(rolePermissions)
      
      userOverrides.forEach(override => {
        if (override.granted) {
          effectivePermissions.add(override.permission_id)
        } else {
          effectivePermissions.delete(override.permission_id)
        }
      })

      return Array.from(effectivePermissions)
    } catch (error) {
      console.error('Error calculating effective permissions:', error)
      return []
    }
  }, [roleAssignments, state.roles, state.overrides, companyId])

  // Audit functions
  const logSecurityEvent = useCallback((
    action: string, 
    details: Record<string, any>
  ) => {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user_id: userId,
      company_id: companyId,
      action,
      details,
      ip_address: state.securityContext?.ip_address,
      session_id: state.securityContext?.session_id
    }

    setSecurityAuditLog((current: any[]) => [...current, auditEntry])
  }, [userId, companyId, state.securityContext, setSecurityAuditLog])

  // Helper functions
  const evaluateAccessPolicies = (permission: string, policies: AccessPolicy[]): 'allow' | 'deny' | 'neutral' => {
    const applicablePolicies = policies
      .filter(policy => policy.is_active)
      .sort((a, b) => b.priority - a.priority)

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (rule.resource === permission || rule.resource === '*') {
          if (evaluateRuleConditions(rule.conditions)) {
            return rule.type === 'allow' ? 'allow' : 'deny'
          }
        }
      }
    }

    return 'neutral'
  }

  const evaluateRuleConditions = (conditions: any[]): boolean => {
    // Simplified condition evaluation
    return conditions.every(condition => {
      // Implement condition logic based on your needs
      return true
    })
  }

  const checkApprovalValidity = (permission: string): boolean => {
    // Check if permission approval is still valid
    // This would typically check against an approvals database
    return true
  }

  const checkRoleAssignmentPermission = async (roleId: string): Promise<boolean> => {
    // Check if current user can assign the specified role
    // This would check role hierarchy and permissions
    return true
  }

  // Mock data loaders (replace with actual API calls)
  const loadCompanyPermissions = async (companyId: string): Promise<Permission[]> => {
    // This would be an API call in a real implementation
    return []
  }

  const loadCompanyRoles = async (companyId: string): Promise<Role[]> => {
    // This would be an API call in a real implementation
    return []
  }

  const loadAccessPolicies = async (companyId: string): Promise<AccessPolicy[]> => {
    // This would be an API call in a real implementation
    return []
  }

  const getUserPermissions = async (userId: string, companyId: string): Promise<string[]> => {
    // This would be an API call in a real implementation
    return []
  }

  const getSecurityContext = async (userId: string, companyId: string): Promise<SecurityContext | null> => {
    // This would be an API call in a real implementation
    return null
  }

  const getUserOverrides = async (userId: string, companyId: string): Promise<UserPermissionOverride[]> => {
    // This would be an API call in a real implementation
    return []
  }

  return {
    // State
    ...state,
    
    // Permission checking
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getEffectivePermissions,
    
    // Role management
    assignRole,
    revokeRole,
    
    // Permission management
    requestPermission,
    createPermissionOverride,
    
    // Utility
    refreshPermissions: initializePermissions,
    logSecurityEvent
  }
}