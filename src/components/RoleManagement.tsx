import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Role, 
  Permission, 
  User, 
  UserPermissionOverride, 
  PermissionRequest 
} from '@/types/erp'
import { 
  Shield, 
  Users, 
  Plus, 
  PencilSimple, 
  Trash, 
  Eye, 
  UserPlus, 
  Warning,
  CheckCircle,
  Clock,
  XCircle,
  MagnifyingGlass,
  Funnel,
  DotsThreeVertical
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RoleManagementProps {
  companyId: string
  currentUserId: string
}

interface RoleFormData {
  role_name: string
  description: string
  hierarchy_level: number
  parent_role_id?: string
  max_users?: number
  permissions: string[]
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  companyId,
  currentUserId
}) => {
  // Hooks
  const {
    roles,
    permissions,
    hasPermission,
    assignRole,
    revokeRole,
    createPermissionOverride,
    loading
  } = usePermissions(companyId, currentUserId)

  const [roleData, setRoleData] = useKV<Record<string, Role[]>>('company-roles', {})
  const [permissionData, setPermissionData] = useKV<Permission[]>('system-permissions', [])
  const [userData, setUserData] = useKV<Record<string, User[]>>('company-users', {})

  // Local state
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [showAssignUsers, setShowAssignUsers] = useState(false)
  const [showPermissionOverride, setShowPermissionOverride] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('roles')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all')
  
  const [roleForm, setRoleForm] = useState<RoleFormData>({
    role_name: '',
    description: '',
    hierarchy_level: 1,
    parent_role_id: undefined,
    max_users: undefined,
    permissions: []
  })

  // Get current company roles and users
  const companyRoles = (roleData || {})[companyId] || []
  const companyUsers = (userData || {})[companyId] || []
  const systemPermissions = permissionData || []

  // Initialize with mock data if empty
  useEffect(() => {
    if (companyRoles.length === 0) {
      initializeMockData()
    }
  }, [companyId])

  const initializeMockData = () => {
    const mockRoles: Role[] = [
      {
        id: 'role_admin',
        company_id: companyId,
        role_name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: ['*'],
        is_system_role: true,
        is_active: true,
        hierarchy_level: 10,
        current_users: 2,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'role_manager',
        company_id: companyId,
        role_name: 'Manager',
        description: 'Department management and team oversight',
        permissions: ['user.read', 'user.update', 'report.read', 'project.create', 'project.update'],
        is_system_role: false,
        is_active: true,
        hierarchy_level: 7,
        parent_role_id: 'role_admin',
        current_users: 5,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'role_employee',
        company_id: companyId,
        role_name: 'Employee',
        description: 'Standard employee access',
        permissions: ['user.read_own', 'project.read', 'timesheet.create', 'timesheet.update_own'],
        is_system_role: false,
        is_active: true,
        hierarchy_level: 3,
        parent_role_id: 'role_manager',
        current_users: 25,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const mockPermissions: Permission[] = [
      // User management
      { id: 'perm_user_create', permission_name: 'user.create', display_name: 'Create Users', description: 'Create new user accounts', module: 'user', resource: 'user', action: 'create', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'high', dependencies: [], created_at: new Date().toISOString() },
      { id: 'perm_user_read', permission_name: 'user.read', display_name: 'View Users', description: 'View user profiles and information', module: 'user', resource: 'user', action: 'read', scope: 'company', is_system_permission: true, requires_approval: false, risk_level: 'low', dependencies: [], created_at: new Date().toISOString() },
      { id: 'perm_user_update', permission_name: 'user.update', display_name: 'Edit Users', description: 'Modify user profiles and settings', module: 'user', resource: 'user', action: 'update', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'medium', dependencies: ['user.read'], created_at: new Date().toISOString() },
      { id: 'perm_user_delete', permission_name: 'user.delete', display_name: 'Delete Users', description: 'Remove user accounts', module: 'user', resource: 'user', action: 'delete', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'critical', dependencies: ['user.read', 'user.update'], created_at: new Date().toISOString() },
      
      // Role management
      { id: 'perm_role_create', permission_name: 'role.create', display_name: 'Create Roles', description: 'Create new roles', module: 'user', resource: 'role', action: 'create', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'high', dependencies: [], created_at: new Date().toISOString() },
      { id: 'perm_role_assign', permission_name: 'role.assign', display_name: 'Assign Roles', description: 'Assign roles to users', module: 'user', resource: 'role', action: 'update', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'high', dependencies: ['user.read'], created_at: new Date().toISOString() },
      
      // Project management
      { id: 'perm_project_create', permission_name: 'project.create', display_name: 'Create Projects', description: 'Create new projects', module: 'project', resource: 'project', action: 'create', scope: 'company', is_system_permission: false, requires_approval: false, risk_level: 'medium', dependencies: [], created_at: new Date().toISOString() },
      { id: 'perm_project_read', permission_name: 'project.read', display_name: 'View Projects', description: 'View project information', module: 'project', resource: 'project', action: 'read', scope: 'company', is_system_permission: false, requires_approval: false, risk_level: 'low', dependencies: [], created_at: new Date().toISOString() },
      
      // Financial
      { id: 'perm_finance_read', permission_name: 'finance.read', display_name: 'View Financial Data', description: 'Access financial reports and data', module: 'finance', resource: 'financial_data', action: 'read', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'high', dependencies: [], created_at: new Date().toISOString() },
      { id: 'perm_finance_export', permission_name: 'finance.export', display_name: 'Export Financial Data', description: 'Export financial reports', module: 'finance', resource: 'financial_data', action: 'export', scope: 'company', is_system_permission: true, requires_approval: true, risk_level: 'critical', dependencies: ['finance.read'], created_at: new Date().toISOString() }
    ]

    setRoleData(prev => ({
      ...prev,
      [companyId]: mockRoles
    }))

    setPermissionData(mockPermissions)
  }

  // Filter roles based on search and type
  const filteredRoles = companyRoles.filter(role => {
    const matchesSearch = role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'system' && role.is_system_role) ||
                         (filterType === 'custom' && !role.is_system_role)
    
    return matchesSearch && matchesFilter
  })

  // Handle role creation
  const handleCreateRole = async () => {
    try {
      if (!hasPermission('role.create')) {
        toast.error('Insufficient permissions to create roles')
        return
      }

      if (!roleForm.role_name.trim()) {
        toast.error('Role name is required')
        return
      }

      const newRole: Role = {
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        company_id: companyId,
        role_name: roleForm.role_name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        is_system_role: false,
        is_active: true,
        hierarchy_level: roleForm.hierarchy_level,
        parent_role_id: roleForm.parent_role_id,
        max_users: roleForm.max_users,
        current_users: 0,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setRoleData(prev => ({
        ...(prev || {}),
        [companyId]: [...((prev || {})[companyId] || []), newRole]
      }))

      setShowCreateRole(false)
      setRoleForm({
        role_name: '',
        description: '',
        hierarchy_level: 1,
        parent_role_id: undefined,
        max_users: undefined,
        permissions: []
      })

      toast.success(`Role "${newRole.role_name}" created successfully`)
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    }
  }

  // Handle role update
  const handleUpdateRole = async () => {
    try {
      if (!selectedRole || !hasPermission('role.update')) {
        toast.error('Insufficient permissions to update roles')
        return
      }

      const updatedRole: Role = {
        ...selectedRole,
        role_name: roleForm.role_name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        hierarchy_level: roleForm.hierarchy_level,
        parent_role_id: roleForm.parent_role_id,
        max_users: roleForm.max_users,
        updated_at: new Date().toISOString()
      }

      setRoleData(prev => ({
        ...(prev || {}),
        [companyId]: (prev || {})[companyId]?.map(role => 
          role.id === selectedRole.id ? updatedRole : role
        ) || []
      }))

      setShowEditRole(false)
      setSelectedRole(null)
      
      toast.success(`Role "${updatedRole.role_name}" updated successfully`)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  // Handle role deletion
  const handleDeleteRole = async (role: Role) => {
    try {
      if (!hasPermission('role.delete')) {
        toast.error('Insufficient permissions to delete roles')
        return
      }

      if (role.is_system_role) {
        toast.error('Cannot delete system roles')
        return
      }

      if (role.current_users > 0) {
        toast.error('Cannot delete role with assigned users. Remove users first.')
        return
      }

      setRoleData(prev => ({
        ...(prev || {}),
        [companyId]: (prev || {})[companyId]?.filter(r => r.id !== role.id) || []
      }))

      toast.success(`Role "${role.role_name}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role')
    }
  }

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }))
  }

  // Get permissions by module
  const getPermissionsByModule = () => {
    const modules = new Map<string, Permission[]>()
    
    systemPermissions.forEach(permission => {
      if (!modules.has(permission.module)) {
        modules.set(permission.module, [])
      }
      modules.get(permission.module)!.push(permission)
    })
    
    return modules
  }

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role & Permission Management</h2>
          <p className="text-muted-foreground">
            Manage roles, permissions, and user access with company isolation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('role.create') && (
            <Button onClick={() => setShowCreateRole(true)}>
              <Plus size={16} className="mr-2" />
              Create Role
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
          <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="system">System Roles</SelectItem>
                <SelectItem value="custom">Custom Roles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={20} className={role.is_system_role ? 'text-blue-600' : 'text-purple-600'} />
                      <div>
                        <CardTitle className="text-lg">{role.role_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={role.is_system_role ? 'default' : 'secondary'}>
                            {role.is_system_role ? 'System' : 'Custom'}
                          </Badge>
                          <Badge variant="outline">
                            Level {role.hierarchy_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DotsThreeVertical size={14} />
                    </Button>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Users</span>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{role.current_users}</span>
                      {role.max_users && <span className="text-muted-foreground">/{role.max_users}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissions</span>
                    <span>{role.permissions.length}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setRoleForm({
                          role_name: role.role_name,
                          description: role.description || '',
                          hierarchy_level: role.hierarchy_level,
                          parent_role_id: role.parent_role_id,
                          max_users: role.max_users,
                          permissions: role.permissions
                        })
                        setShowEditRole(true)
                      }}
                      disabled={!hasPermission('role.update')}
                    >
                      <PencilSimple size={14} className="mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setShowAssignUsers(true)
                      }}
                      disabled={!hasPermission('role.assign')}
                    >
                      <UserPlus size={14} className="mr-1" />
                      Assign
                    </Button>
                    
                    {!role.is_system_role && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={!hasPermission('role.delete') || role.current_users > 0}
                      >
                        <Trash size={14} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>
                Available permissions organized by module and risk level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {Array.from(getPermissionsByModule().entries()).map(([module, permissions]) => (
                  <div key={module} className="mb-6">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{permission.display_name}</span>
                              <Badge 
                                className={`text-xs ${getRiskLevelColor(permission.risk_level)}`}
                                variant="outline"
                              >
                                {permission.risk_level}
                              </Badge>
                              {permission.requires_approval && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock size={10} className="mr-1" />
                                  Approval
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {permission.scope}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Access Management</CardTitle>
              <CardDescription>
                Manage user role assignments and permission overrides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User access management interface would be implemented here with user listings,
                role assignments, and permission override capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit & Compliance</CardTitle>
              <CardDescription>
                Permission changes, access logs, and compliance reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security audit interface would be implemented here with access logs,
                permission change history, and compliance reports.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions for your organization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Role Name</Label>
                <Input
                  id="role_name"
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, role_name: e.target.value }))}
                  placeholder="e.g., Senior Developer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hierarchy_level">Hierarchy Level</Label>
                <Input
                  id="hierarchy_level"
                  type="number"
                  min="1"
                  max="10"
                  value={roleForm.hierarchy_level}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, hierarchy_level: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's responsibilities and scope..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_role">Parent Role (Optional)</Label>
                <Select value={roleForm.parent_role_id} onValueChange={(value) => setRoleForm(prev => ({ ...prev, parent_role_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.role_name} (Level {role.hierarchy_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_users">Max Users (Optional)</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="1"
                  value={roleForm.max_users || ''}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, max_users: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <ScrollArea className="h-64 border rounded-lg p-4">
                {Array.from(getPermissionsByModule().entries()).map(([module, permissions]) => (
                  <div key={module} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{module.toUpperCase()}</h4>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={permission.id}
                              checked={roleForm.permissions.includes(permission.permission_name)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission.permission_name, checked)}
                            />
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer"
                            >
                              {permission.display_name}
                            </Label>
                            <Badge 
                              className={`text-xs ${getRiskLevelColor(permission.risk_level)}`}
                              variant="outline"
                            >
                              {permission.risk_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.role_name}</DialogTitle>
            <DialogDescription>
              Modify role permissions and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_role_name">Role Name</Label>
                <Input
                  id="edit_role_name"
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, role_name: e.target.value }))}
                  disabled={selectedRole?.is_system_role}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_hierarchy_level">Hierarchy Level</Label>
                <Input
                  id="edit_hierarchy_level"
                  type="number"
                  min="1"
                  max="10"
                  value={roleForm.hierarchy_level}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, hierarchy_level: parseInt(e.target.value) || 1 }))}
                  disabled={selectedRole?.is_system_role}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <ScrollArea className="h-64 border rounded-lg p-4">
                {Array.from(getPermissionsByModule().entries()).map(([module, permissions]) => (
                  <div key={module} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{module.toUpperCase()}</h4>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`edit_${permission.id}`}
                              checked={roleForm.permissions.includes(permission.permission_name)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission.permission_name, checked)}
                              disabled={selectedRole?.is_system_role}
                            />
                            <Label 
                              htmlFor={`edit_${permission.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.display_name}
                            </Label>
                            <Badge 
                              className={`text-xs ${getRiskLevelColor(permission.risk_level)}`}
                              variant="outline"
                            >
                              {permission.risk_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRole(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={selectedRole?.is_system_role}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}