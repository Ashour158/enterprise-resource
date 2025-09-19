import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  GridFour, 
  Shield, 
  Key, 
  MagnifyingGlass,
  CheckCircle,
  Copy,
  Gear,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Permission {
  id: string
  module: string
  resource: string
  action: string
  level: 'basic' | 'advanced' | 'critical'
  description: string
  riskLevel: 'low' | 'medium' | 'high'
  compliance?: string[]
}

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

interface PermissionMatrixProps {
  companyId: string
  userId: string
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  companyId,
  userId
}) => {
  const [permissions, setPermissions] = useKV<Permission[]>(`permissions-${companyId}`, [])
  const [roles, setRoles] = useKV<Role[]>(`roles-${companyId}`, [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [showInheritance, setShowInheritance] = useState(true)

  // Initialize with mock data if empty
  useEffect(() => {
    if (!permissions || permissions.length === 0) {
      const mockPermissions: Permission[] = [
        // Finance Module
        { id: 'fin_view', module: 'Finance', resource: 'Financial Reports', action: 'View', level: 'basic', description: 'View financial reports and statements', riskLevel: 'low', compliance: ['SOX'] },
        { id: 'fin_edit', module: 'Finance', resource: 'Financial Records', action: 'Edit', level: 'advanced', description: 'Edit financial records and transactions', riskLevel: 'high', compliance: ['SOX', 'GAAP'] },
        { id: 'fin_approve', module: 'Finance', resource: 'Transactions', action: 'Approve', level: 'critical', description: 'Approve financial transactions above threshold', riskLevel: 'high', compliance: ['SOX'] },
        
        // HR Module
        { id: 'hr_view', module: 'HR', resource: 'Employee Records', action: 'View', level: 'basic', description: 'View employee basic information', riskLevel: 'medium', compliance: ['GDPR'] },
        { id: 'hr_edit', module: 'HR', resource: 'Employee Records', action: 'Edit', level: 'advanced', description: 'Edit employee information and records', riskLevel: 'medium', compliance: ['GDPR', 'HIPAA'] },
        { id: 'hr_salary', module: 'HR', resource: 'Salary Information', action: 'View', level: 'critical', description: 'Access salary and compensation data', riskLevel: 'high', compliance: ['SOX'] },
        
        // Sales Module
        { id: 'sal_view', module: 'Sales', resource: 'Leads', action: 'View', level: 'basic', description: 'View sales leads and opportunities', riskLevel: 'low' },
        { id: 'sal_edit', module: 'Sales', resource: 'Opportunities', action: 'Edit', level: 'basic', description: 'Edit sales opportunities and pipeline', riskLevel: 'low' },
        { id: 'sal_contract', module: 'Sales', resource: 'Contracts', action: 'Sign', level: 'critical', description: 'Sign and approve sales contracts', riskLevel: 'high', compliance: ['SOX'] },
        
        // System Administration
        { id: 'sys_users', module: 'System', resource: 'User Management', action: 'Manage', level: 'critical', description: 'Create, edit, and deactivate users', riskLevel: 'high' },
        { id: 'sys_roles', module: 'System', resource: 'Role Management', action: 'Manage', level: 'critical', description: 'Create and modify user roles', riskLevel: 'high' },
        { id: 'sys_audit', module: 'System', resource: 'Audit Logs', action: 'View', level: 'critical', description: 'Access system audit logs and reports', riskLevel: 'medium', compliance: ['SOX', 'GDPR'] }
      ]
      setPermissions(mockPermissions)
    }

    if (!roles || roles.length === 0) {
      const mockRoles: Role[] = [
        { id: 'admin', name: 'Administrator', level: 1, description: 'Administrative access', isSystem: true, permissions: ['sys_users', 'sys_audit'], userCount: 3, inheritanceEnabled: false },
        { id: 'finance_manager', name: 'Finance Manager', level: 2, description: 'Financial management access', department: 'Finance', isSystem: false, permissions: ['fin_view', 'fin_edit', 'fin_approve'], userCount: 2, inheritanceEnabled: true },
        { id: 'hr_manager', name: 'HR Manager', level: 2, description: 'Human resources management', department: 'HR', isSystem: false, permissions: ['hr_view', 'hr_edit', 'hr_salary'], userCount: 3, inheritanceEnabled: true },
        { id: 'sales_manager', name: 'Sales Manager', level: 2, description: 'Sales team management', department: 'Sales', isSystem: false, permissions: ['sal_view', 'sal_edit', 'sal_contract'], userCount: 4, inheritanceEnabled: true },
        { id: 'accountant', name: 'Accountant', level: 3, description: 'Financial record keeping', department: 'Finance', isSystem: false, permissions: ['fin_view', 'fin_edit'], userCount: 5, inheritanceEnabled: true, parentRoleId: 'finance_manager' },
        { id: 'sales_rep', name: 'Sales Representative', level: 3, description: 'Sales execution', department: 'Sales', isSystem: false, permissions: ['sal_view', 'sal_edit'], userCount: 12, inheritanceEnabled: true, parentRoleId: 'sales_manager' },
        { id: 'employee', name: 'Employee', level: 4, description: 'Basic employee access', isSystem: true, permissions: ['hr_view'], userCount: 45, inheritanceEnabled: false }
      ]
      setRoles(mockRoles)
    }
  }, [permissions?.length, roles?.length, setPermissions, setRoles])

  const safePermissions = permissions || []
  const safeRoles = roles || []
  const modules = Array.from(new Set(safePermissions.map(p => p.module)))
  
  const filteredPermissions = safePermissions.filter(permission => {
    const matchesSearch = permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = selectedModule === 'all' || permission.module === selectedModule
    const matchesRisk = selectedRiskLevel === 'all' || permission.riskLevel === selectedRiskLevel
    
    return matchesSearch && matchesModule && matchesRisk
  })

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setRoles(currentRoles => {
      const roles = currentRoles || []
      return roles.map(role => {
        if (role.id === roleId) {
          const updatedPermissions = role.permissions.includes(permissionId)
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
          
          return { ...role, permissions: updatedPermissions }
        }
        return role
      })
    })
    
    const permission = safePermissions.find(p => p.id === permissionId)
    const role = safeRoles.find(r => r.id === roleId)
    toast.success(
      `${permission?.action} ${permission?.resource} ${
        safeRoles.find(r => r.id === roleId)?.permissions.includes(permissionId) ? 'removed from' : 'granted to'
      } ${role?.name}`
    )
  }

  const getRolePermissions = (role: Role): Set<string> => {
    const directPermissions = new Set(role.permissions)
    
    if (role.inheritanceEnabled && role.parentRoleId && showInheritance) {
      const parentRole = safeRoles.find(r => r.id === role.parentRoleId)
      if (parentRole) {
        const parentPermissions = getRolePermissions(parentRole)
        parentPermissions.forEach(p => directPermissions.add(p))
      }
    }
    
    return directPermissions
  }

  const isPermissionInherited = (roleId: string, permissionId: string): boolean => {
    const role = safeRoles.find(r => r.id === roleId)
    if (!role || !role.inheritanceEnabled || !role.parentRoleId) return false
    
    return !role.permissions.includes(permissionId) && 
           getRolePermissions(role).has(permissionId)
  }

  const handleBulkPermissionChange = (action: 'grant' | 'revoke') => {
    if (selectedPermissions.size === 0 || !selectedRole) {
      toast.error('Please select permissions and a role')
      return
    }

    setRoles(currentRoles => {
      const roles = currentRoles || []
      return roles.map(role => {
        if (role.id === selectedRole) {
          let updatedPermissions = [...role.permissions]
          
          selectedPermissions.forEach(permissionId => {
            if (action === 'grant' && !updatedPermissions.includes(permissionId)) {
              updatedPermissions.push(permissionId)
            } else if (action === 'revoke') {
              updatedPermissions = updatedPermissions.filter(p => p !== permissionId)
            }
          })
          
          return { ...role, permissions: updatedPermissions }
        }
        return role
      })
    })
    
    toast.success(`${action === 'grant' ? 'Granted' : 'Revoked'} ${selectedPermissions.size} permissions`)
    setSelectedPermissions(new Set())
    setBulkEditMode(false)
  }

  const exportPermissionMatrix = () => {
    const matrixData = {
      roles: safeRoles.map(role => ({
        name: role.name,
        level: role.level,
        department: role.department,
        permissions: safePermissions.filter(p => getRolePermissions(role).has(p.id)).map(p => ({
          module: p.module,
          resource: p.resource,
          action: p.action,
          inherited: isPermissionInherited(role.id, p.id)
        }))
      })),
      exportedAt: new Date().toISOString(),
      companyId
    }
    
    const blob = new Blob([JSON.stringify(matrixData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `permission-matrix-${companyId}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Permission matrix exported successfully')
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'advanced': return 'text-orange-600 bg-orange-50'
      case 'basic': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GridFour size={24} />
              Permission Matrix
            </h2>
            <p className="text-muted-foreground">
              Advanced role-permission mapping with inheritance and compliance tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className="flex items-center gap-2"
            >
              <Gear size={16} />
              {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPermissionMatrix}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export Matrix
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MagnifyingGlass size={16} className="text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label htmlFor="inheritance-toggle" className="text-sm">Show Inheritance</Label>
                <Switch
                  id="inheritance-toggle"
                  checked={showInheritance}
                  onCheckedChange={setShowInheritance}
                />
              </div>
            </div>

            {bulkEditMode && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeRoles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Badge variant="outline">
                    {selectedPermissions.size} permissions selected
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => handleBulkPermissionChange('grant')}
                    disabled={selectedPermissions.size === 0 || !selectedRole}
                  >
                    Grant Selected
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkPermissionChange('revoke')}
                    disabled={selectedPermissions.size === 0 || !selectedRole}
                  >
                    Revoke Selected
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-max">
                <div className="grid grid-cols-1" style={{ gridTemplateColumns: `300px repeat(${safeRoles.length}, 120px)` }}>
                  {/* Header Row */}
                  <div className="sticky top-0 bg-background border-b p-4 font-medium">
                    Permissions ({filteredPermissions.length})
                  </div>
                  {safeRoles.map(role => (
                    <div key={role.id} className="sticky top-0 bg-background border-b border-l p-2 text-center">
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate" title={role.name}>
                          {role.name}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            L{role.level}
                          </Badge>
                          {role.inheritanceEnabled && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-xs p-1">
                                  <Copy size={10} />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Inherits from parent role</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.userCount} users
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Permission Rows */}
                  {filteredPermissions.map(permission => (
                    <React.Fragment key={permission.id}>
                      <div className="p-4 border-b border-r">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {bulkEditMode && (
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedPermissions)
                                  if (checked) {
                                    newSelected.add(permission.id)
                                  } else {
                                    newSelected.delete(permission.id)
                                  }
                                  setSelectedPermissions(newSelected)
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {permission.action} {permission.resource}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {permission.module}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <p className="text-muted-foreground">{permission.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getRiskColor(permission.riskLevel)}`}>
                                {permission.riskLevel} risk
                              </Badge>
                              <Badge className={`text-xs ${getLevelColor(permission.level)}`}>
                                {permission.level}
                              </Badge>
                              {permission.compliance && permission.compliance.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {permission.compliance.join(', ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {safeRoles.map(role => {
                        const hasPermission = getRolePermissions(role).has(permission.id)
                        const isInherited = isPermissionInherited(role.id, permission.id)
                        
                        return (
                          <div key={`${role.id}-${permission.id}`} className="p-2 border-b border-l flex items-center justify-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handlePermissionToggle(role.id, permission.id)}
                                  disabled={isInherited && hasPermission}
                                >
                                  {hasPermission ? (
                                    isInherited ? (
                                      <Copy size={16} className="text-blue-500" />
                                    ) : (
                                      <CheckCircle size={16} className="text-green-500" />
                                    )
                                  ) : (
                                    <div className="w-4 h-4 border border-gray-300 rounded" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {hasPermission ? (
                                    isInherited ? 
                                      `Inherited from ${safeRoles.find(r => r.id === role.parentRoleId)?.name || 'parent role'}` :
                                      'Directly assigned'
                                  ) : 'Not assigned'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Matrix Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Permissions</p>
                  <p className="text-2xl font-bold">{safePermissions.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {safePermissions.filter(p => p.riskLevel === 'high').length} high risk
                  </p>
                </div>
                <Key size={20} className="text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                  <p className="text-2xl font-bold">{safeRoles.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {safeRoles.filter(r => r.inheritanceEnabled).length} with inheritance
                  </p>
                </div>
                <Shield size={20} className="text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Permission Assignments</p>
                  <p className="text-2xl font-bold">
                    {safeRoles.reduce((sum, role) => sum + getRolePermissions(role).size, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    across all roles
                  </p>
                </div>
                <GridFour size={20} className="text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}