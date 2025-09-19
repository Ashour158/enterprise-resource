export interface RoleLevel {
  id: number
  name: string
  description: string
  color: string
  capabilities: string[]
}

export interface Permission {
  id: string
  moduleId: string
  moduleName: string
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'admin'
  resourceType: string
  scope: 'global' | 'company' | 'department' | 'team' | 'own'
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  companyId?: string
  name: string
  level: number
  description: string
  isSystemRole: boolean
  permissions: Permission[]
  inheritedPermissions?: Permission[]
  parentRoleId?: string
  childRoleIds?: string[]
  inheritanceChain?: string[]
  effectivePermissions?: Permission[]
  userCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  companyId: string
  assignedBy: string
  assignedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface PermissionCheck {
  moduleId: string
  action: string
  resourceType: string
  resourceId?: string
  scope?: string
}

export interface SecurityAuditLog {
  id: string
  userId: string
  companyId: string
  eventType: 'permission_granted' | 'permission_denied' | 'role_assigned' | 'role_removed' | 'unauthorized_access'
  eventDescription: string
  ipAddress: string
  userAgent: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  additionalData: Record<string, any>
  timestamp: string
}

export interface PermissionMatrix {
  [moduleId: string]: {
    [roleLevel: number]: {
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
      approve: boolean
      admin: boolean
      scope: string[]
    }
  }
}

export interface CompanyPermissionPolicy {
  id: string
  companyId: string
  policyName: string
  moduleId: string
  roleLevel: number
  accessScope: 'all' | 'department' | 'team' | 'own' | 'assigned'
  conditions: Record<string, any>
  isActive: boolean
}

export interface PermissionRequest {
  id: string
  requesterId: string
  targetUserId: string
  companyId: string
  requestedPermissions: Permission[]
  requestReason: string
  status: 'pending' | 'approved' | 'denied' | 'expired'
  reviewerId?: string
  reviewNotes?: string
  createdAt: string
  reviewedAt?: string
  expiresAt: string
}

export interface RoleTemplate {
  id: string
  name: string
  description: string
  level: number
  defaultPermissions: Permission[]
  isGlobal: boolean
  category: string
}

export interface PermissionInheritance {
  roleId: string
  parentRoleId: string
  inheritanceType: 'full' | 'partial' | 'additive' | 'restrictive'
  excludedPermissions?: string[]
  additionalPermissions?: Permission[]
  conditions?: Record<string, any>
  priority: number
  isActive: boolean
  createdAt: string
}

export interface RoleHierarchy {
  id: string
  companyId: string
  name: string
  description: string
  levels: RoleHierarchyLevel[]
  inheritanceRules: InheritanceRule[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RoleHierarchyLevel {
  level: number
  name: string
  description: string
  roles: string[]
  canInheritFrom: number[]
  canDelegateTo: number[]
  defaultPermissions: Permission[]
}

export interface InheritanceRule {
  id: string
  fromLevel: number
  toLevel: number
  inheritanceType: 'full' | 'partial' | 'conditional'
  conditions?: Record<string, any>
  excludedPermissions?: string[]
  priority: number
  isActive: boolean
}

export interface EffectivePermission extends Permission {
  source: 'direct' | 'inherited' | 'role_hierarchy' | 'delegation'
  sourceRoleId?: string
  inheritanceChain?: string[]
  priority: number
  overriddenBy?: string[]
  conflicts?: PermissionConflict[]
}

export interface PermissionConflict {
  id: string
  permissionId: string
  conflictType: 'duplicate' | 'contradiction' | 'escalation'
  conflictingPermissions: string[]
  resolution: 'allow' | 'deny' | 'highest_priority' | 'manual'
  resolvedBy?: string
  resolvedAt?: string
  notes?: string
}

export interface PermissionDelegation {
  id: string
  delegatorRoleId: string
  delegateeRoleId: string
  delegatedPermissions: string[]
  conditions: Record<string, any>
  timeLimit?: string
  maxDelegationDepth: number
  isRevocable: boolean
  status: 'active' | 'expired' | 'revoked'
  createdAt: string
  expiresAt?: string
  revokedAt?: string
  revokedBy?: string
}

export interface PermissionInheritanceTree {
  roleId: string
  roleName: string
  level: number
  directPermissions: Permission[]
  inheritedPermissions: InheritedPermissionNode[]
  effectivePermissions: EffectivePermission[]
  children: PermissionInheritanceTree[]
  conflicts: PermissionConflict[]
}

export interface InheritedPermissionNode {
  permission: Permission
  sourceRoleId: string
  sourceRoleName: string
  inheritancePath: string[]
  inheritanceType: string
  priority: number
}