import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Company, 
  User, 
  CompanyUserProfile, 
  SecurityContext,
  AccessPolicy,
  CompanyAccess 
} from '@/types/erp'
import { 
  Buildings, 
  Shield, 
  Users, 
  Plus, 
  Eye, 
  ShieldCheck,
  UserMinus,
  UserSwitch,
  Warning,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  Envelope,
  Key,
  LockKey
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CompanyAccessControlProps {
  companies: Company[]
  currentUserId: string
  currentCompanyId: string
}

interface InvitationData {
  email: string
  role_id: string
  department_id?: string
  message?: string
  expires_in_days: number
}

interface AccessControlRule {
  id: string
  name: string
  type: 'ip_whitelist' | 'time_restriction' | 'mfa_required' | 'device_limit'
  config: Record<string, any>
  enabled: boolean
}

export const CompanyAccessControl: React.FC<CompanyAccessControlProps> = ({
  companies,
  currentUserId,
  currentCompanyId
}) => {
  // Permission hooks for each company
  const permissions = usePermissions(currentCompanyId, currentUserId)

  // Persistent data
  const [userProfiles, setUserProfiles] = useKV<Record<string, CompanyUserProfile[]>>('company-user-profiles', {})
  const [companyInvitations, setCompanyInvitations] = useKV<Record<string, any[]>>('company-invitations', {})
  const [accessPolicies, setAccessPolicies] = useKV<Record<string, AccessPolicy[]>>('company-access-policies', {})
  const [securitySettings, setSecuritySettings] = useKV<Record<string, any>>('company-security-settings', {})

  // Local state
  const [selectedCompany, setSelectedCompany] = useState<Company>(companies[0])
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [showSecuritySettings, setShowSecuritySettings] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CompanyUserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [invitationForm, setInvitationForm] = useState<InvitationData>({
    email: '',
    role_id: '',
    department_id: undefined,
    message: '',
    expires_in_days: 7
  })

  // Get data for selected company
  const companyUsers = (userProfiles || {})[selectedCompany.id] || []
  const companyPolicies = (accessPolicies || {})[selectedCompany.id] || []
  const pendingInvitations = (companyInvitations || {})[selectedCompany.id] || []
  const companySecurityConfig = (securitySettings || {})[selectedCompany.id] || {}

  // Initialize mock data
  useEffect(() => {
    if (companyUsers.length === 0) {
      initializeMockData()
    }
  }, [selectedCompany.id])

  const initializeMockData = () => {
    const mockUsers: CompanyUserProfile[] = [
      {
        id: 'user_1',
        global_user_id: 'global_1',
        company_id: selectedCompany.id,
        employee_id: 'EMP001',
        department: 'dept_it',
        job_title: 'System Administrator',
        role: 'role_admin',
        status: 'active',
        permissions: ['*'],
        settings: {},
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user_2',
        global_user_id: 'global_2',
        company_id: selectedCompany.id,
        employee_id: 'EMP002',
        department: 'dept_sales',
        job_title: 'Sales Manager',
        role: 'role_manager',
        status: 'active',
        permissions: ['user.read', 'user.update', 'sales.read', 'sales.create'],
        settings: {},
        last_activity: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const mockPolicies: AccessPolicy[] = [
      {
        id: 'policy_mfa',
        company_id: selectedCompany.id,
        name: 'MFA Required for Admin Actions',
        description: 'Require multi-factor authentication for administrative operations',
        rules: [
          {
            id: 'rule_1',
            type: 'require_approval',
            resource: 'user',
            action: 'delete',
            conditions: [],
            effect_priority: 1
          }
        ],
        priority: 1,
        is_active: true,
        applies_to: 'roles',
        target_ids: ['role_admin'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    setUserProfiles(prev => ({
      ...(prev || {}),
      [selectedCompany.id]: mockUsers
    }))

    setAccessPolicies(prev => ({
      ...(prev || {}),
      [selectedCompany.id]: mockPolicies
    }))

    setSecuritySettings(prev => ({
      ...(prev || {}),
      [selectedCompany.id]: {
        mfa_required: true,
        session_timeout: 480, // 8 hours
        max_concurrent_sessions: 3,
        ip_whitelist_enabled: false,
        allowed_ip_ranges: [],
        password_policy: {
          min_length: 12,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_symbols: true,
          history_count: 5
        }
      }
    }))
  }

  // Filter users based on search
  const filteredUsers = companyUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.employee_id?.toLowerCase().includes(searchLower) ||
      user.job_title?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  })

  // Handle user invitation
  const handleInviteUser = async () => {
    try {
      if (!permissions.hasPermission('user.invite')) {
        toast.error('Insufficient permissions to invite users')
        return
      }

      if (!invitationForm.email || !invitationForm.role_id) {
        toast.error('Email and role are required')
        return
      }

      const invitation = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        company_id: selectedCompany.id,
        inviter_user_id: currentUserId,
        email: invitationForm.email,
        role_id: invitationForm.role_id,
        department_id: invitationForm.department_id,
        message: invitationForm.message,
        expires_at: new Date(Date.now() + invitationForm.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setCompanyInvitations(prev => ({
        ...(prev || {}),
        [selectedCompany.id]: [...((prev || {})[selectedCompany.id] || []), invitation]
      }))

      setShowInviteUser(false)
      setInvitationForm({
        email: '',
        role_id: '',
        department_id: undefined,
        message: '',
        expires_in_days: 7
      })

      toast.success(`Invitation sent to ${invitationForm.email}`)
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    }
  }

  // Handle user access revocation
  const handleRevokeAccess = async (user: CompanyUserProfile) => {
    try {
      if (!permissions.hasPermission('user.revoke_access')) {
        toast.error('Insufficient permissions to revoke access')
        return
      }

      const updatedUser = { ...user, status: 'suspended' as const }

      setUserProfiles(prev => ({
        ...(prev || {}),
        [selectedCompany.id]: (prev || {})[selectedCompany.id]?.map(u => 
          u.id === user.id ? updatedUser : u
        ) || []
      }))

      toast.success(`Access revoked for ${user.employee_id}`)
    } catch (error) {
      console.error('Error revoking access:', error)
      toast.error('Failed to revoke access')
    }
  }

  // Handle company switching for user
  const handleSwitchUserCompany = async (user: CompanyUserProfile, targetCompanyId: string) => {
    try {
      if (!permissions.hasPermission('user.transfer')) {
        toast.error('Insufficient permissions to transfer users')
        return
      }

      // Remove from current company
      setUserProfiles(prev => ({
        ...(prev || {}),
        [selectedCompany.id]: (prev || {})[selectedCompany.id]?.filter(u => u.id !== user.id) || []
      }))

      // Add to target company
      const transferredUser = { ...user, company_id: targetCompanyId }
      setUserProfiles(prev => ({
        ...(prev || {}),
        [targetCompanyId]: [...((prev || {})[targetCompanyId] || []), transferredUser]
      }))

      toast.success(`User transferred to ${companies.find(c => c.id === targetCompanyId)?.name}`)
    } catch (error) {
      console.error('Error transferring user:', error)
      toast.error('Failed to transfer user')
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Company Access Control</h2>
          <p className="text-muted-foreground">
            Manage user access, invitations, and security policies across companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCompany.id} onValueChange={(id) => setSelectedCompany(companies.find(c => c.id === id)!)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2">
                    <Buildings size={16} />
                    {company.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {permissions.hasPermission('user.invite') && (
            <Button onClick={() => setShowInviteUser(true)}>
              <Plus size={16} className="mr-2" />
              Invite User
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="security">Security Policies</TabsTrigger>
          <TabsTrigger value="audit">Access Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by ID, role, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Company Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Manage user access and permissions for {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.employee_id}</div>
                          <div className="text-sm text-muted-foreground">{user.job_title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.department || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserDetails(true)
                            }}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          
                          {permissions.hasPermission('user.revoke_access') && user.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeAccess(user)}
                            >
                              <UserMinus size={14} className="mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Envelope size={20} />
                Pending Invitations ({pendingInvitations.length})
              </CardTitle>
              <CardDescription>
                Manage user invitations for {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invitation.role_id}</Badge>
                        </TableCell>
                        <TableCell>{invitation.inviter_user_id}</TableCell>
                        <TableCell>
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Resend
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Envelope size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={20} />
                Security Policies
              </CardTitle>
              <CardDescription>
                Configure security settings and access policies for {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Authentication Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mfa-required">Require MFA for all users</Label>
                      <Switch id="mfa-required" checked={companySecurityConfig.mfa_required} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={companySecurityConfig.session_timeout || 480}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
                      <Input
                        id="max-sessions"
                        type="number"
                        value={companySecurityConfig.max_concurrent_sessions || 3}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Access Control</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ip-whitelist">Enable IP Whitelist</Label>
                      <Switch id="ip-whitelist" checked={companySecurityConfig.ip_whitelist_enabled} />
                    </div>
                    <div className="space-y-2">
                      <Label>Password Policy</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Minimum {companySecurityConfig.password_policy?.min_length || 12} characters</p>
                        <p>• Require uppercase, lowercase, numbers, symbols</p>
                        <p>• Remember last {companySecurityConfig.password_policy?.history_count || 5} passwords</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Access Policies ({companyPolicies.length})</h4>
                {companyPolicies.length > 0 ? (
                  <div className="space-y-2">
                    {companyPolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-muted-foreground">{policy.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                            {policy.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Shield size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No access policies configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Audit Trail</CardTitle>
              <CardDescription>
                Review access logs and security events for {selectedCompany.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access audit interface would be implemented here with detailed logs of
                user access, permission changes, and security events.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User to {selectedCompany.name}</DialogTitle>
            <DialogDescription>
              Send an invitation to join the company with specified role and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={invitationForm.role_id} onValueChange={(value) => setInvitationForm(prev => ({ ...prev, role_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role_employee">Employee</SelectItem>
                  <SelectItem value="role_manager">Manager</SelectItem>
                  <SelectItem value="role_admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-expires">Expires in (days)</Label>
              <Input
                id="invite-expires"
                type="number"
                min="1"
                max="30"
                value={invitationForm.expires_in_days}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) || 7 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteUser(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details: {selectedUser?.employee_id}</DialogTitle>
            <DialogDescription>
              Comprehensive user information and access details
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                  <p>{selectedUser.employee_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                  <p>{selectedUser.job_title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedUser.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="justify-start">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}