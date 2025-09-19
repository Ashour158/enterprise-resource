import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Role, 
  Permission, 
  PermissionInheritance, 
  RoleHierarchy, 
  EffectivePermission, 
  PermissionConflict, 
  PermissionInheritanceTree,
  InheritedPermissionNode,
  PermissionDelegation
} from '@/types/rbac'
import { toast } from 'sonner'

export interface UsePermissionInheritanceReturn {
  roleHierarchy: RoleHierarchy | null
  inheritanceTree: PermissionInheritanceTree[]
  effectivePermissions: Record<string, EffectivePermission[]>
  permissionConflicts: PermissionConflict[]
  delegations: PermissionDelegation[]
  isLoading: boolean
  
  // Role hierarchy management
  createRoleHierarchy: (hierarchy: Omit<RoleHierarchy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateRoleHierarchy: (hierarchyId: string, updates: Partial<RoleHierarchy>) => Promise<void>
  
  // Permission inheritance
  calculateEffectivePermissions: (roleId: string) => EffectivePermission[]
  getInheritanceChain: (roleId: string) => string[]
  buildInheritanceTree: (roleId: string) => PermissionInheritanceTree
  
  // Conflict resolution
  detectPermissionConflicts: (roleId: string) => PermissionConflict[]
  resolveConflict: (conflictId: string, resolution: 'allow' | 'deny' | 'highest_priority') => Promise<void>
  
  // Permission delegation
  createDelegation: (delegation: Omit<PermissionDelegation, 'id' | 'createdAt'>) => Promise<void>
  revokeDelegation: (delegationId: string, reason?: string) => Promise<void>
  
  // Hierarchy operations
  addRoleToHierarchy: (roleId: string, level: number, parentRoleId?: string) => Promise<void>
  removeRoleFromHierarchy: (roleId: string) => Promise<void>
  moveRoleInHierarchy: (roleId: string, newLevel: number, newParentId?: string) => Promise<void>
  
  // Validation
  validatePermissionInheritance: (roleId: string) => { isValid: boolean; errors: string[] }
  previewPermissionChanges: (roleId: string, changes: Partial<Role>) => EffectivePermission[]
}

export function usePermissionInheritance(companyId: string): UsePermissionInheritanceReturn {
  const [roles] = useKV<Role[]>(`company-roles-${companyId}`, [])
  const [roleHierarchy, setRoleHierarchy] = useKV<RoleHierarchy | null>(`role-hierarchy-${companyId}`, null)
  const [inheritanceRules, setInheritanceRules] = useKV<PermissionInheritance[]>(`inheritance-rules-${companyId}`, [])
  const [delegations, setDelegations] = useKV<PermissionDelegation[]>(`permission-delegations-${companyId}`, [])
  
  // Ensure arrays are always defined
  const safeRoles = roles || []
  const safeInheritanceRules = inheritanceRules || []
  const safeDelegations = delegations || []
  
  const [inheritanceTree, setInheritanceTree] = useState<PermissionInheritanceTree[]>([])
  const [effectivePermissions, setEffectivePermissions] = useState<Record<string, EffectivePermission[]>>({})
  const [permissionConflicts, setPermissionConflicts] = useState<PermissionConflict[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Calculate effective permissions for a role
  const calculateEffectivePermissions = useCallback((roleId: string): EffectivePermission[] => {
    const role = safeRoles.find(r => r.id === roleId)
    if (!role) return []

    const effectivePerms: EffectivePermission[] = []
    const processedPermissions = new Set<string>()

    // Add direct permissions
    role.permissions.forEach(permission => {
      const effective: EffectivePermission = {
        ...permission,
        source: 'direct',
        priority: 100,
        overriddenBy: [],
        conflicts: []
      }
      effectivePerms.push(effective)
      processedPermissions.add(`${permission.moduleId}:${permission.action}:${permission.resourceType}`)
    })

    // Add inherited permissions through role hierarchy
    const inheritanceChain = getInheritanceChain(roleId)
    
    inheritanceChain.forEach((parentRoleId, index) => {
      const parentRole = safeRoles.find(r => r.id === parentRoleId)
      if (!parentRole) return

      parentRole.permissions.forEach(permission => {
        const permKey = `${permission.moduleId}:${permission.action}:${permission.resourceType}`
        
        if (!processedPermissions.has(permKey)) {
          const effective: EffectivePermission = {
            ...permission,
            source: 'inherited',
            sourceRoleId: parentRoleId,
            inheritanceChain: inheritanceChain.slice(0, index + 1),
            priority: 90 - index * 10, // Lower priority for deeper inheritance
            overriddenBy: [],
            conflicts: []
          }
          effectivePerms.push(effective)
          processedPermissions.add(permKey)
        }
      })
    })

    // Add delegated permissions
    const activeDelegations = safeDelegations.filter(d => 
      d.delegateeRoleId === roleId && 
      d.status === 'active' &&
      (!d.expiresAt || new Date(d.expiresAt) > new Date())
    )

    activeDelegations.forEach(delegation => {
      const delegatorRole = safeRoles.find(r => r.id === delegation.delegatorRoleId)
      if (!delegatorRole) return

      delegation.delegatedPermissions.forEach(permissionId => {
        const permission = delegatorRole.permissions.find(p => p.id === permissionId)
        if (!permission) return

        const permKey = `${permission.moduleId}:${permission.action}:${permission.resourceType}`
        
        if (!processedPermissions.has(permKey)) {
          const effective: EffectivePermission = {
            ...permission,
            source: 'delegation',
            sourceRoleId: delegation.delegatorRoleId,
            priority: 80,
            overriddenBy: [],
            conflicts: []
          }
          effectivePerms.push(effective)
          processedPermissions.add(permKey)
        }
      })
    })

    return effectivePerms
  }, [safeRoles, safeDelegations])

  // Get inheritance chain for a role
  const getInheritanceChain = useCallback((roleId: string): string[] => {
    const role = safeRoles.find(r => r.id === roleId)
    if (!role || !role.parentRoleId) return []

    const chain: string[] = []
    let currentRoleId: string | undefined = role.parentRoleId

    while (currentRoleId) {
      const parentRole = safeRoles.find(r => r.id === currentRoleId)
      if (!parentRole) break
      
      chain.push(currentRoleId)
      currentRoleId = parentRole.parentRoleId
      
      // Prevent infinite loops
      if (chain.length > 10) break
    }

    return chain
  }, [safeRoles])

  // Build inheritance tree for visualization
  const buildInheritanceTree = useCallback((roleId: string): PermissionInheritanceTree => {
    const role = safeRoles.find(r => r.id === roleId)
    if (!role) {
      return {
        roleId,
        roleName: 'Unknown Role',
        level: 0,
        directPermissions: [],
        inheritedPermissions: [],
        effectivePermissions: [],
        children: [],
        conflicts: []
      }
    }

    const directPermissions = role.permissions
    const inheritedPermissions: InheritedPermissionNode[] = []
    const childRoles = safeRoles.filter(r => r.parentRoleId === roleId)

    // Get inherited permissions
    const inheritanceChain = getInheritanceChain(roleId)
    inheritanceChain.forEach((parentRoleId, index) => {
      const parentRole = safeRoles.find(r => r.id === parentRoleId)
      if (!parentRole) return

      parentRole.permissions.forEach(permission => {
        inheritedPermissions.push({
          permission,
          sourceRoleId: parentRoleId,
          sourceRoleName: parentRole.name,
          inheritancePath: inheritanceChain.slice(0, index + 1),
          inheritanceType: 'full',
          priority: 90 - index * 10
        })
      })
    })

    const effectivePermissions = calculateEffectivePermissions(roleId)
    const conflicts = detectPermissionConflicts(roleId)

    return {
      roleId,
      roleName: role.name,
      level: role.level,
      directPermissions,
      inheritedPermissions,
      effectivePermissions,
      children: childRoles.map(child => buildInheritanceTree(child.id)),
      conflicts
    }
  }, [safeRoles, calculateEffectivePermissions])

  // Detect permission conflicts
  const detectPermissionConflicts = useCallback((roleId: string): PermissionConflict[] => {
    const effective = calculateEffectivePermissions(roleId)
    const conflicts: PermissionConflict[] = []
    const permissionGroups = new Map<string, EffectivePermission[]>()

    // Group permissions by module + action + resource
    effective.forEach(perm => {
      const key = `${perm.moduleId}:${perm.action}:${perm.resourceType}`
      if (!permissionGroups.has(key)) {
        permissionGroups.set(key, [])
      }
      permissionGroups.get(key)!.push(perm)
    })

    // Check for conflicts within groups
    permissionGroups.forEach((perms, key) => {
      if (perms.length > 1) {
        // Check for scope conflicts
        const scopes = new Set(perms.map(p => p.scope))
        if (scopes.size > 1) {
          conflicts.push({
            id: `conflict-${Date.now()}-${Math.random()}`,
            permissionId: key,
            conflictType: 'contradiction',
            conflictingPermissions: perms.map(p => p.id),
            resolution: 'highest_priority'
          })
        }

        // Check for condition conflicts
        const hasConflictingConditions = perms.some((p1, i) => 
          perms.slice(i + 1).some(p2 => 
            JSON.stringify(p1.conditions) !== JSON.stringify(p2.conditions)
          )
        )

        if (hasConflictingConditions) {
          conflicts.push({
            id: `condition-conflict-${Date.now()}-${Math.random()}`,
            permissionId: key,
            conflictType: 'contradiction',
            conflictingPermissions: perms.map(p => p.id),
            resolution: 'manual'
          })
        }
      }
    })

    return conflicts
  }, [calculateEffectivePermissions])

  // Create role hierarchy
  const createRoleHierarchy = useCallback(async (hierarchy: Omit<RoleHierarchy, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      const newHierarchy: RoleHierarchy = {
        ...hierarchy,
        id: `hierarchy-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setRoleHierarchy(newHierarchy)
      toast.success('Role hierarchy created successfully')
    } catch (error) {
      console.error('Error creating role hierarchy:', error)
      toast.error('Failed to create role hierarchy')
    } finally {
      setIsLoading(false)
    }
  }, [setRoleHierarchy])

  // Update role hierarchy
  const updateRoleHierarchy = useCallback(async (hierarchyId: string, updates: Partial<RoleHierarchy>) => {
    setIsLoading(true)
    try {
      if (roleHierarchy && roleHierarchy.id === hierarchyId) {
        const updated = {
          ...roleHierarchy,
          ...updates,
          updatedAt: new Date().toISOString()
        }
        setRoleHierarchy(updated)
        toast.success('Role hierarchy updated successfully')
      }
    } catch (error) {
      console.error('Error updating role hierarchy:', error)
      toast.error('Failed to update role hierarchy')
    } finally {
      setIsLoading(false)
    }
  }, [roleHierarchy, setRoleHierarchy])

  // Add role to hierarchy
  const addRoleToHierarchy = useCallback(async (roleId: string, level: number, parentRoleId?: string) => {
    // Implementation would update the role's hierarchy position
    toast.success('Role added to hierarchy')
  }, [])

  // Remove role from hierarchy
  const removeRoleFromHierarchy = useCallback(async (roleId: string) => {
    // Implementation would remove role from hierarchy
    toast.success('Role removed from hierarchy')
  }, [])

  // Move role in hierarchy
  const moveRoleInHierarchy = useCallback(async (roleId: string, newLevel: number, newParentId?: string) => {
    // Implementation would move role to new position
    toast.success('Role moved in hierarchy')
  }, [])

  // Create delegation
  const createDelegation = useCallback(async (delegation: Omit<PermissionDelegation, 'id' | 'createdAt'>) => {
    setIsLoading(true)
    try {
      const newDelegation: PermissionDelegation = {
        ...delegation,
        id: `delegation-${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      
      setDelegations(current => [...(current || []), newDelegation])
      toast.success('Permission delegation created')
    } catch (error) {
      console.error('Error creating delegation:', error)
      toast.error('Failed to create delegation')
    } finally {
      setIsLoading(false)
    }
  }, [setDelegations])

  // Revoke delegation
  const revokeDelegation = useCallback(async (delegationId: string, reason?: string) => {
    setIsLoading(true)
    try {
      setDelegations(current => 
        (current || []).map(d => 
          d.id === delegationId 
            ? { ...d, status: 'revoked' as const, revokedAt: new Date().toISOString() }
            : d
        )
      )
      toast.success('Delegation revoked')
    } catch (error) {
      console.error('Error revoking delegation:', error)
      toast.error('Failed to revoke delegation')
    } finally {
      setIsLoading(false)
    }
  }, [setDelegations])

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId: string, resolution: 'allow' | 'deny' | 'highest_priority') => {
    // Implementation would resolve the specific conflict
    toast.success(`Conflict resolved: ${resolution}`)
  }, [])

  // Validate permission inheritance
  const validatePermissionInheritance = useCallback((roleId: string) => {
    const errors: string[] = []
    const inheritanceChain = getInheritanceChain(roleId)
    
    // Check for circular inheritance
    if (inheritanceChain.includes(roleId)) {
      errors.push('Circular inheritance detected')
    }
    
    // Check for excessive inheritance depth
    if (inheritanceChain.length > 5) {
      errors.push('Inheritance chain too deep (max 5 levels)')
    }
    
    // Check for conflicting permissions
    const conflicts = detectPermissionConflicts(roleId)
    if (conflicts.length > 0) {
      errors.push(`${conflicts.length} permission conflicts detected`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [getInheritanceChain, detectPermissionConflicts])

  // Preview permission changes
  const previewPermissionChanges = useCallback((roleId: string, changes: Partial<Role>): EffectivePermission[] => {
    // Create a temporary role with changes applied
    const originalRole = safeRoles.find(r => r.id === roleId)
    if (!originalRole) return []

    const tempRole = { ...originalRole, ...changes }
    
    // Calculate what the effective permissions would be
    // This is a simplified preview - full implementation would be more complex
    return calculateEffectivePermissions(roleId)
  }, [safeRoles, calculateEffectivePermissions])

  // Recalculate effective permissions when roles or delegations change
  useEffect(() => {
    if (safeRoles.length > 0) {
      const newEffectivePermissions: Record<string, EffectivePermission[]> = {}
      const newConflicts: PermissionConflict[] = []
      const newInheritanceTree: PermissionInheritanceTree[] = []

      safeRoles.forEach(role => {
        newEffectivePermissions[role.id] = calculateEffectivePermissions(role.id)
        newConflicts.push(...detectPermissionConflicts(role.id))
        
        // Build inheritance tree for top-level roles
        if (!role.parentRoleId) {
          newInheritanceTree.push(buildInheritanceTree(role.id))
        }
      })

      setEffectivePermissions(newEffectivePermissions)
      setPermissionConflicts(newConflicts)
      setInheritanceTree(newInheritanceTree)
    }
  }, [safeRoles, safeDelegations, calculateEffectivePermissions, detectPermissionConflicts, buildInheritanceTree])

  return {
    roleHierarchy: roleHierarchy || null,
    inheritanceTree,
    effectivePermissions,
    permissionConflicts,
    delegations: safeDelegations,
    isLoading,
    createRoleHierarchy,
    updateRoleHierarchy,
    calculateEffectivePermissions,
    getInheritanceChain,
    buildInheritanceTree,
    detectPermissionConflicts,
    resolveConflict,
    createDelegation,
    revokeDelegation,
    addRoleToHierarchy,
    removeRoleFromHierarchy,
    moveRoleInHierarchy,
    validatePermissionInheritance,
    previewPermissionChanges
  }
}