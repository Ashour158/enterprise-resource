import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tree, User, Users, Shield, Plus, PencilSimple, Trash, Copy, Share } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
  level: number
  description: string
  department?: string
  isSystem: boolean
  parentRoleId?: string
  permissions: string[]
  userCount: number
  inheritanceEnabled: boolean
}

interface Permission {
  id: string
  module: string
  resource: string
  action: string
  level: 'basic' | 'advanced' | 'critical'
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface RoleHierarchyProps {
  companyId: string
  userId: string
}

interface RoleNode extends Role {
  children: RoleNode[]
  depth: number
}

export const RoleHierarchy: React.FC<RoleHierarchyProps> = ({
  companyId,
  userId
}) => {
  const [roles, setRoles] = useKV<Role[]>(`roles-${companyId}`, [])
  const [permissions] = useKV<Permission[]>(`permissions-${companyId}`, [])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    department: '',
    parentRoleId: '',
    inheritanceEnabled: true
  })

  const safeRoles = roles || []
  const safePermissions = permissions || []

  // Build role hierarchy tree
  const buildRoleTree = (): RoleNode[] => {
    const roleMap = new Map<string, RoleNode>()
    
    // Create role nodes
    safeRoles.forEach(role => {
      roleMap.set(role.id, { ...role, children: [], depth: 0 })
    })
    
    // Build tree structure
    const rootRoles: RoleNode[] = []
    
    roleMap.forEach(role => {
      if (role.parentRoleId && roleMap.has(role.parentRoleId)) {
        const parent = roleMap.get(role.parentRoleId)!
        parent.children.push(role)
        role.depth = parent.depth + 1
      } else {
        rootRoles.push(role)
      }
    })
    
    // Sort by level then name
    const sortRoles = (roles: RoleNode[]) => {
      roles.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level
        return a.name.localeCompare(b.name)
      })
      roles.forEach(role => sortRoles(role.children))
    }
    
    sortRoles(rootRoles)
    return rootRoles
  }

  const roleTree = buildRoleTree()

  const createRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required')
      return
    }

    const role: Role = {
      id: `role_${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      department: newRole.department || undefined,
      isSystem: false,
      parentRoleId: newRole.parentRoleId || undefined,
      permissions: [],
      userCount: 0,
      level: newRole.parentRoleId ? 
        (safeRoles.find(r => r.id === newRole.parentRoleId)?.level || 0) + 1 : 
        Math.max(...safeRoles.map(r => r.level), 0) + 1,
      inheritanceEnabled: newRole.inheritanceEnabled
    }

    setRoles(currentRoles => [...(currentRoles || []), role])
    setNewRole({ name: '', description: '', department: '', parentRoleId: '', inheritanceEnabled: true })
    setShowCreateDialog(false)
    toast.success(`Role "${role.name}" created successfully`)
  }

  const deleteRole = (roleId: string) => {
    const role = safeRoles.find(r => r.id === roleId)
    if (!role) return

    if (role.isSystem) {
      toast.error('Cannot delete system roles')
      return
    }

    if (role.userCount > 0) {
      toast.error('Cannot delete role with assigned users')
      return
    }

    // Check if any roles depend on this one
    const dependentRoles = safeRoles.filter(r => r.parentRoleId === roleId)
    if (dependentRoles.length > 0) {
      toast.error(`Cannot delete role. ${dependentRoles.length} roles inherit from it.`)
      return
    }

    setRoles(currentRoles => (currentRoles || []).filter(r => r.id !== roleId))
    toast.success(`Role "${role.name}" deleted successfully`)
  }

  const duplicateRole = (sourceRole: Role) => {
    const newRole: Role = {
      ...sourceRole,
      id: `role_${Date.now()}`,
      name: `${sourceRole.name} (Copy)`,
      userCount: 0,
      isSystem: false
    }

    setRoles(currentRoles => [...(currentRoles || []), newRole])
    toast.success(`Role "${newRole.name}" created as copy`)
  }

  const getInheritedPermissions = (role: Role): string[] => {
    if (!role.inheritanceEnabled || !role.parentRoleId) return []
    
    const parent = safeRoles.find(r => r.id === role.parentRoleId)
    if (!parent) return []
    
    return [...parent.permissions, ...getInheritedPermissions(parent)]
  }

  const getAllPermissions = (role: Role): string[] => {
    const direct = role.permissions
    const inherited = getInheritedPermissions(role)
    return Array.from(new Set([...direct, ...inherited]))
  }

  const getRoleStats = (role: Role) => {
    const allPermissions = getAllPermissions(role)
    const directPermissions = role.permissions
    const inheritedPermissions = getInheritedPermissions(role)
    
    return {
      totalPermissions: allPermissions.length,
      directPermissions: directPermissions.length,
      inheritedPermissions: inheritedPermissions.length,
      highRiskPermissions: allPermissions.filter(permId => 
        safePermissions.find(p => p.id === permId)?.riskLevel === 'high'
      ).length
    }
  }

  const renderRoleNode = (role: RoleNode, isLast: boolean = false, prefix: string = '') => {
    const stats = getRoleStats(role)
    const hasChildren = role.children.length > 0
    
    return (
      <div key={role.id} className="relative">
        {/* Role Item */}
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedRole?.id === role.id ? 'bg-primary/10 border-primary' : 'bg-background'
          }`}
          onClick={() => setSelectedRole(role)}
        >
          {/* Hierarchy Lines */}
          <div className="flex items-center">
            {prefix && (
              <span className="text-muted-foreground text-sm font-mono">
                {prefix}
              </span>
            )}
            {role.depth > 0 && (
              <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 mr-2" />
            )}
          </div>

          {/* Role Icon */}
          <div className={`p-2 rounded-lg ${
            role.isSystem ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            {role.isSystem ? <Shield size={16} /> : <User size={16} />}
          </div>

          {/* Role Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{role.name}</h4>
              <Badge variant="outline" className="text-xs">
                Level {role.level}
              </Badge>
              {role.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
              {role.inheritanceEnabled && (
                <Badge variant="outline" className="text-xs">
                  <Copy size={10} className="mr-1" />
                  Inherits
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span>{role.userCount} users</span>
              <span>{stats.totalPermissions} permissions</span>
              {stats.highRiskPermissions > 0 && (
                <span className="text-red-600">{stats.highRiskPermissions} high-risk</span>
              )}
              {role.department && <span>{role.department}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                duplicateRole(role)
              }}
              className="h-8 w-8 p-0"
            >
              <Copy size={14} />
            </Button>
            {!role.isSystem && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRole(role)
                    setShowEditDialog(true)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <PencilSimple size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteRole(role.id)
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  disabled={role.userCount > 0}
                >
                  <Trash size={14} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="ml-8 mt-2 space-y-2">
            {role.children.map((child, index) => 
              renderRoleNode(
                child, 
                index === role.children.length - 1,
                `${prefix}${isLast ? '    ' : '│   '}`
              )
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tree size={24} />
            Role Hierarchy
          </h2>
          <p className="text-muted-foreground">
            Hierarchical role management with inheritance and dependency visualization
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with optional inheritance from a parent role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the role's purpose"
                />
              </div>
              <div>
                <Label htmlFor="role-department">Department (Optional)</Label>
                <Input
                  id="role-department"
                  value={newRole.department}
                  onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                  placeholder="Department name"
                />
              </div>
              <div>
                <Label htmlFor="parent-role">Parent Role (Optional)</Label>
                <Select value={newRole.parentRoleId} onValueChange={(value) => setNewRole({ ...newRole, parentRoleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (root role)</SelectItem>
                    {safeRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} (Level {role.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createRole}>
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tree size={20} />
                Role Structure
              </CardTitle>
              <CardDescription>
                Hierarchical view of all roles with inheritance relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {roleTree.length > 0 ? (
                roleTree.map((role, index) => 
                  renderRoleNode(role, index === roleTree.length - 1)
                )
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Tree size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No roles defined</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role Details */}
        <div>
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedRole.isSystem ? <Shield size={20} /> : <User size={20} />}
                  {selectedRole.name}
                </CardTitle>
                <CardDescription>{selectedRole.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Level:</span>
                    <p className="font-medium">{selectedRole.level}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Users:</span>
                    <p className="font-medium">{selectedRole.userCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{selectedRole.isSystem ? 'System' : 'Custom'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedRole.department || 'N/A'}</p>
                  </div>
                </div>

                {selectedRole.parentRoleId && (
                  <div>
                    <span className="text-muted-foreground text-sm">Inherits from:</span>
                    <p className="font-medium">
                      {safeRoles.find(r => r.id === selectedRole.parentRoleId)?.name || 'Unknown'}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Permission Summary</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const stats = getRoleStats(selectedRole)
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Total Permissions:</span>
                            <span className="font-medium">{stats.totalPermissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Direct:</span>
                            <span className="font-medium">{stats.directPermissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Inherited:</span>
                            <span className="font-medium">{stats.inheritedPermissions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>High Risk:</span>
                            <span className="font-medium text-red-600">{stats.highRiskPermissions}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {(() => {
                  const childRoles = safeRoles.filter(r => r.parentRoleId === selectedRole.id)
                  return childRoles.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-2">Child Roles</h4>
                      <div className="space-y-1">
                        {childRoles.map(child => (
                          <div key={child.id} className="text-sm p-2 border rounded">
                            <div className="font-medium">{child.name}</div>
                            <div className="text-muted-foreground">{child.userCount} users</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <User size={24} className="mx-auto mb-2 opacity-50" />
                <p>Select a role to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{safeRoles.length}</p>
              </div>
              <Shield size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{safeRoles.filter(r => r.isSystem).length}</p>
              </div>
              <Shield size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Roles</p>
                <p className="text-2xl font-bold">{safeRoles.filter(r => !r.isSystem).length}</p>
              </div>
              <User size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Inheritance</p>
                <p className="text-2xl font-bold">{safeRoles.filter(r => r.inheritanceEnabled).length}</p>
              </div>
              <Share size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}