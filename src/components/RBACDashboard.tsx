import React, { useState, useMemo } from 'react'
import { useRBAC } from '@/hooks/useRBAC'
import { ROLE_LEVELS, PERMISSION_MATRIX } from '@/data/rbacData'
import { Permission, Role, PermissionCheck } from '@/types/rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Users, 
  Plus, 
  PencilSimple as Edit, 
  Trash as Trash2, 
  Eye, 
  EyeSlash, 
  Check, 
  X, 
  Warning as AlertTriangle,
  Lock,
  LockOpen as Unlock,
  Crown,
  Gear as Settings,
  Database,
  ChartBar
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RBACDashboardProps {
  companyId: string
  userId: string
}

export function RBACDashboard({ companyId, userId }: RBACDashboardProps) {
  const {
    roles,
    userRoles,
    hasPermission,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    getHighestRole,
    getEffectivePermissions,
    auditLogs,
    isLoading,
    error
  } = useRBAC(companyId, userId)

  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 4,
    permissions: [] as Permission[]
  })

  // Permission check examples
  const canManageRoles = hasPermission({
    moduleId: 'system',
    action: 'admin',
    resourceType: 'roles'
  })

  const canViewUsers = hasPermission({
    moduleId: 'hr',
    action: 'read',
    resourceType: 'employee'
  })

  // Statistics
  const stats = useMemo(() => {
    const totalRoles = roles.length
    const totalUsers = userRoles.length
    const activeRoles = roles.filter(r => r.isActive).length
    const systemRoles = roles.filter(r => r.isSystemRole).length
    const customRoles = roles.filter(r => !r.isSystemRole).length
    
    return {
      totalRoles,
      totalUsers,
      activeRoles,
      systemRoles,
      customRoles,
      securityScore: Math.round((activeRoles / Math.max(totalRoles, 1)) * 100)
    }
  }, [roles, userRoles])

  const handleCreateRole = async () => {
    try {
      if (!newRole.name || !newRole.description) {
        toast.error('Please fill in all required fields')
        return
      }

      await createRole({
        name: newRole.name,
        description: newRole.description,
        level: newRole.level,
        isSystemRole: false,
        permissions: newRole.permissions,
        userCount: 0,
        isActive: true
      })

      toast.success('Role created successfully')
      setShowCreateRole(false)
      setNewRole({ name: '', description: '', level: 4, permissions: [] })
    } catch (error) {
      toast.error('Failed to create role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId)
      toast.success('Role deleted successfully')
    } catch (error) {
      toast.error('Failed to delete role')
    }
  }

  const getRoleIcon = (level: number) => {
    switch (level) {
      case 1: return <Crown size={16} className="text-red-500" />
      case 2: return <Shield size={16} className="text-purple-500" />
      case 3: return <Users size={16} className="text-blue-500" />
      case 4: return <Settings size={16} className="text-green-500" />
      case 5: return <Eye size={16} className="text-gray-500" />
      default: return <Shield size={16} />
    }
  }

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus size={14} className="text-green-600" />
      case 'read': return <Eye size={14} className="text-blue-600" />
      case 'update': return <Edit size={14} className="text-yellow-600" />
      case 'delete': return <Trash2 size={14} className="text-red-600" />
      case 'approve': return <Check size={14} className="text-purple-600" />
      case 'admin': return <Crown size={14} className="text-orange-600" />
      default: return <Shield size={14} />
    }
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading RBAC system: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role-Based Access Control</h2>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and security policies
          </p>
        </div>
        {canManageRoles && (
          <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions and access levels
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleLevel">Access Level</Label>
                  <Select 
                    value={newRole.level.toString()} 
                    onValueChange={(value) => setNewRole(prev => ({ ...prev, level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_LEVELS.map(level => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(level.id)}
                            {level.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={isLoading}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Security Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRoles}</div>
              <div className="text-sm text-muted-foreground">Total Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Assigned Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.customRoles}</div>
              <div className="text-sm text-muted-foreground">Custom Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.securityScore}%</div>
              <div className="text-sm text-muted-foreground">Security Score</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Security Compliance</span>
              <span className="text-sm text-muted-foreground">{stats.securityScore}%</span>
            </div>
            <Progress value={stats.securityScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle>Role Hierarchy</CardTitle>
                <CardDescription>
                  5-tier role-based access control system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ROLE_LEVELS.map(level => {
                  const roleCount = roles.filter(r => r.level === level.id).length
                  return (
                    <div key={level.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(level.id)}
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{roleCount} roles</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common security and role management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!canManageRoles}
                  onClick={() => setShowCreateRole(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Create New Role
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={!canViewUsers}
                  onClick={() => setActiveTab('assignments')}
                >
                  <Users size={16} className="mr-2" />
                  Manage User Assignments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('permissions')}
                >
                  <Database size={16} className="mr-2" />
                  View Permission Matrix
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('audit')}
                >
                  <ChartBar size={16} className="mr-2" />
                  Security Audit Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map(role => {
              const roleLevel = ROLE_LEVELS.find(l => l.id === role.level)
              return (
                <Card key={role.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(role.level)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{role.name}</h3>
                            {role.isSystemRole && (
                              <Badge variant="secondary">System</Badge>
                            )}
                            {!role.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Level: {roleLevel?.name}</span>
                            <span>Permissions: {role.permissions.length}</span>
                            <span>Users: {role.userCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingRole(role)}>
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        {!role.isSystemRole && canManageRoles && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View permissions for each role level across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Module</th>
                      {ROLE_LEVELS.map(level => (
                        <th key={level.id} className="text-center p-2 min-w-[120px]">
                          <div className="flex items-center justify-center gap-1">
                            {getRoleIcon(level.id)}
                            <span className="text-xs">{level.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_MATRIX).map(([moduleId, modulePermissions]) => (
                      <tr key={moduleId} className="border-b">
                        <td className="p-2 font-medium capitalize">{moduleId}</td>
                        {ROLE_LEVELS.map(level => {
                          const permissions = modulePermissions[level.id]
                          if (!permissions) return <td key={level.id} className="p-2 text-center">-</td>
                          
                          return (
                            <td key={level.id} className="p-2">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {Object.entries(permissions).map(([action, allowed]) => {
                                  if (action === 'scope' || typeof allowed !== 'boolean') return null
                                  return allowed ? (
                                    <div 
                                      key={action}
                                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded"
                                      title={action}
                                    >
                                      {getPermissionIcon(action)}
                                    </div>
                                  ) : null
                                })}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                Current role assignments for all users in this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No user role assignments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRoles.map(userRole => {
                    const role = roles.find(r => r.id === userRole.roleId)
                    const roleLevel = ROLE_LEVELS.find(l => l.id === role?.level)
                    
                    return (
                      <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {role && getRoleIcon(role.level)}
                          <div>
                            <div className="font-medium">User {userRole.userId}</div>
                            <div className="text-sm text-muted-foreground">
                              {role?.name} • Assigned {new Date(userRole.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {roleLevel?.name}
                          </Badge>
                          {canManageRoles && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => revokeRole(userRole.userId, userRole.roleId)}
                            >
                              <X size={14} className="mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>
                Track all security events and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 20).map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {log.eventType === 'permission_granted' && <Check size={16} className="text-green-600" />}
                        {log.eventType === 'permission_denied' && <X size={16} className="text-red-600" />}
                        {log.eventType === 'role_assigned' && <Plus size={16} className="text-blue-600" />}
                        {log.eventType === 'role_removed' && <Trash2 size={16} className="text-orange-600" />}
                        {log.eventType === 'unauthorized_access' && <AlertTriangle size={16} className="text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{log.eventDescription}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()} • Risk: {log.riskLevel}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          log.riskLevel === 'critical' ? 'destructive' :
                          log.riskLevel === 'high' ? 'destructive' :
                          log.riskLevel === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {log.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}