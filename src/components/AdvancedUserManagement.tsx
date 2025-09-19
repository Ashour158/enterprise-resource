import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Shield, 
  UserPlus, 
  Crown, 
  Key, 
  Calendar, 
  MapPin,
  Phone,
  Envelope,
  Building,
  Briefcase,
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  PencilSimple,
  Trash,
  Funnel,
  MagnifyingGlass,
  Eye,
  Plus
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  Company, 
  GlobalUser, 
  CompanyUserProfile, 
  SystemRole, 
  CompanyUserRole,
  UserSession 
} from '@/types/erp'
import { 
  mockCompanies, 
  mockGlobalUser, 
  mockCompanyProfiles, 
  mockSystemRoles, 
  mockCompanyUserRoles,
  mockUserSessions 
} from '@/data/mockData'

interface AdvancedUserManagementProps {
  companyId: string
}

export function AdvancedUserManagement({ companyId }: AdvancedUserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<GlobalUser | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<CompanyUserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('profiles')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  
  // Get data for current company
  const currentCompany = mockCompanies.find(c => c.id === companyId) || mockCompanies[0]
  const companyRoles = mockSystemRoles.filter(r => r.company_id === companyId)
  const companyProfiles = mockCompanyProfiles.filter(p => p.company_id === companyId)
  const companySessions = mockUserSessions.filter(s => s.company_id === companyId)
  
  // Get users with role information
  const getUsersWithRoles = () => {
    return companyProfiles.map(profile => {
      const userRoles = mockCompanyUserRoles.filter(ur => ur.company_user_profile_id === profile.id)
      const roles = userRoles.map(ur => companyRoles.find(r => r.id === ur.role_id)).filter(Boolean)
      const session = companySessions.find(s => s.company_user_profile_id === profile.id)
      
      return {
        profile,
        globalUser: mockGlobalUser, // In real app, fetch by profile.global_user_id
        roles,
        session,
        isOnline: session?.is_active && new Date(session.expires_at) > new Date()
      }
    })
  }

  const usersWithRoles = getUsersWithRoles()

  // Filter users based on search and filters
  const filteredUsers = usersWithRoles.filter(user => {
    const matchesSearch = !searchTerm || 
      user.globalUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.globalUser.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.globalUser.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile.employee_id && user.profile.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || user.roles.some(role => role?.id === roleFilter)
    const matchesStatus = statusFilter === 'all' || user.profile.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateProfile = () => {
    toast.success('Profile creation initiated - This would open user invite flow')
    setShowCreateDialog(false)
  }

  const handleEditProfile = (profile: CompanyUserProfile) => {
    setSelectedProfile(profile)
    toast.info(`Editing profile for ${profile.employee_id}`)
  }

  const handleAssignRole = (profileId: string, roleId: string) => {
    toast.success('Role assignment updated')
    setShowRoleDialog(false)
  }

  const handleRevokeAccess = (profileId: string) => {
    toast.warning('Access revoked')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'suspended': return 'bg-yellow-500'
      case 'terminated': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLevel = (roles: (SystemRole | undefined)[]) => {
    const validRoles = roles.filter(Boolean) as SystemRole[]
    if (validRoles.length === 0) return 5
    return Math.min(...validRoles.map(r => r.role_level))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced User Management</h2>
          <p className="text-muted-foreground">
            Manage user profiles, roles, and permissions for {currentCompany.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            Invite User
          </Button>
          <Button variant="outline" onClick={() => setShowRoleDialog(true)} className="flex items-center gap-2">
            <Shield size={16} />
            Manage Roles
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{companyProfiles.length}</p>
              </div>
              <Users size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{companySessions.filter(s => s.is_active).length}</p>
              </div>
              <Shield size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{companyRoles.length}</p>
              </div>
              <Crown size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role Assignments</p>
                <p className="text-2xl font-bold">{mockCompanyUserRoles.length}</p>
              </div>
              <Key size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">User Profiles</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <MagnifyingGlass size={16} className="text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {companyRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.role_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* User Profiles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Company User Profiles</CardTitle>
              <CardDescription>
                Manage user profiles and role assignments for {currentCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users size={16} className="text-primary" />
                            </div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.globalUser.first_name} {user.globalUser.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.globalUser.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.profile.employee_id}</Badge>
                      </TableCell>
                      <TableCell>{user.profile.department}</TableCell>
                      <TableCell>{user.profile.position}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => role && (
                            <Badge key={role.id} variant="secondary" className="text-xs">
                              {role.role_name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(user.profile.status)}`} />
                          <span className="capitalize">{user.profile.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.profile.last_company_login ? (
                          <span className="text-sm">
                            {new Date(user.profile.last_company_login).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProfile(user.profile)}
                          >
                            <PencilSimple size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user.globalUser)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeAccess(user.profile.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                Manage role definitions and hierarchy for {currentCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyRoles.map((role) => (
                  <Card key={role.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{role.role_name}</h3>
                        <Badge variant="outline">Level {role.role_level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Modules:</span>{' '}
                          {Array.isArray(role.permissions.modules) 
                            ? role.permissions.modules.join(', ')
                            : 'Custom'
                          }
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Scope:</span>{' '}
                          {role.permissions.scope}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <PencilSimple size={12} className="mr-1" />
                            Edit
                          </Button>
                          {!role.is_system_role && (
                            <Button variant="ghost" size="sm">
                              <Trash size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Monitor and manage active user sessions for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companySessions.map((session) => {
                    const profile = companyProfiles.find(p => p.id === session.company_user_profile_id)
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users size={12} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{profile?.employee_id}</p>
                              <p className="text-xs text-muted-foreground">{profile?.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{session.device_fingerprint}</p>
                            <p className="text-muted-foreground text-xs">{session.user_agent?.substring(0, 30)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {session.location_data.city}, {session.location_data.country}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {session.ip_address}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(session.created_at).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(session.expires_at).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm">
                            Terminate
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Comprehensive view of role permissions across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Warning size={16} />
                  <AlertTitle>Permission Overview</AlertTitle>
                  <AlertDescription>
                    This matrix shows the effective permissions for each role in {currentCompany.name}.
                    System roles cannot be modified.
                  </AlertDescription>
                </Alert>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Finance</TableHead>
                        <TableHead>HR</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Reporting</TableHead>
                        <TableHead>Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.role_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">L{role.role_level}</Badge>
                          </TableCell>
                          <TableCell>
                            {role.permissions.modules?.includes('finance') || role.permissions.modules?.includes('*') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {role.permissions.modules?.includes('hr') || role.permissions.modules?.includes('*') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {role.permissions.modules?.includes('inventory') || role.permissions.modules?.includes('*') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {role.permissions.modules?.includes('sales') || role.permissions.modules?.includes('*') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {role.permissions.modules?.includes('reporting') || role.permissions.modules?.includes('*') ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {role.role_level <= 2 ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation to join {currentCompany.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Engineering" />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Software Engineer" />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Initial Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {companyRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.role_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}