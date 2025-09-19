import React from 'react'
import { useRBAC } from '@/hooks/useRBAC'
import type { PermissionCheck } from '@/types/rbac'

interface PermissionGuardProps {
  companyId: string
  userId: string
  permission: PermissionCheck
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGuard({ 
  companyId, 
  userId, 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission } = useRBAC(companyId, userId)
  
  if (hasPermission(permission)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

interface PermissionCheckProps {
  companyId: string
  userId: string
  permissions: PermissionCheck[]
  requireAll?: boolean
  children: (hasPermission: boolean) => React.ReactNode
}

/**
 * Render prop component for flexible permission checking
 */
export function PermissionCheck({ 
  companyId, 
  userId, 
  permissions, 
  requireAll = false, 
  children 
}: PermissionCheckProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useRBAC(companyId, userId)
  
  let hasRequiredPermissions = false
  
  if (permissions.length === 1) {
    hasRequiredPermissions = hasPermission(permissions[0])
  } else if (requireAll) {
    hasRequiredPermissions = hasAllPermissions(permissions)
  } else {
    hasRequiredPermissions = hasAnyPermission(permissions)
  }
  
  return <>{children(hasRequiredPermissions)}</>
}

interface RoleGuardProps {
  companyId: string
  userId: string
  allowedRoles: number[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user role level
 */
export function RoleGuard({ 
  companyId, 
  userId, 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleGuardProps) {
  const { getHighestRole } = useRBAC(companyId, userId)
  
  const userRole = getHighestRole(userId, companyId)
  const hasAllowedRole = userRole && allowedRoles.includes(userRole.level)
  
  if (hasAllowedRole) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}