import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  CompanyInvitation, 
  SystemRole, 
  UserCompanyAccessLog,
  SecurityAuditLog,
  CompanyUserProfile,
  GlobalUser
} from '@/types/erp'
import { 
  PaperPlaneTilt as Send, 
  Copy, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Eye, 
  DotsThree as MoreHorizontal, 
  UserPlus, 
  EnvelopeSimple as Mail, 
  Shield, 
  Warning as AlertTriangle,
  ClockCounterClockwise as History,
  Funnel as Filter,
  Download,
  MagnifyingGlass as Search,
  Trash as Trash2,
  ArrowCounterClockwise as RotateCcw
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, addDays, isAfter, isBefore } from 'date-fns'

interface CompanyInvitationManagerProps {
  companyId: string
  currentUserId: string
}

interface InvitationForm {
  email: string
  role_id: string
  department: string
  position: string
  message: string
  expires_in_days: number
}

export function CompanyInvitationManager({ companyId, currentUserId }: CompanyInvitationManagerProps) {
  const [activeTab, setActiveTab] = useState('send')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<CompanyInvitation | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Form state
  const [invitationForm, setInvitationForm] = useState<InvitationForm>({
    email: '',
    role_id: '',
    department: '',
    position: '',
    message: '',
    expires_in_days: 7
  })

  // Data storage
  const [invitations, setInvitations] = useKV<CompanyInvitation[]>(`company-invitations-${companyId}`, [])
  const [systemRoles, setSystemRoles] = useKV<SystemRole[]>(`system-roles-${companyId}`, [])
  const [accessLogs, setAccessLogs] = useKV<UserCompanyAccessLog[]>(`access-logs-${companyId}`, [])
  const [auditLogs, setAuditLogs] = useKV<SecurityAuditLog[]>(`audit-logs-${companyId}`, [])
  const [userProfiles, setUserProfiles] = useKV<CompanyUserProfile[]>(`user-profiles-${companyId}`, [])

  // Initialize sample data
  useEffect(() => {
    if (!systemRoles || systemRoles.length === 0) {
      const defaultRoles: SystemRole[] = [
        {
          id: 'role-1',
          company_id: companyId,
          role_name: 'Super Admin',
          role_level: 1,
          description: 'Full system access with all permissions',
          is_system_role: true,
          permissions: { all: true },
          created_at: new Date().toISOString()
        },
        {
          id: 'role-2',
          company_id: companyId,
          role_name: 'Admin',
          role_level: 2,
          description: 'Administrative access with most permissions',
          is_system_role: true,
          permissions: { admin: true, manage_users: true },
          created_at: new Date().toISOString()
        },
        {
          id: 'role-3',
          company_id: companyId,
          role_name: 'Manager',
          role_level: 3,
          description: 'Management level access',
          is_system_role: true,
          permissions: { manage_team: true, view_reports: true },
          created_at: new Date().toISOString()
        },
        {
          id: 'role-4',
          company_id: companyId,
          role_name: 'User',
          role_level: 4,
          description: 'Standard user access',
          is_system_role: true,
          permissions: { basic_access: true },
          created_at: new Date().toISOString()
        },
        {
          id: 'role-5',
          company_id: companyId,
          role_name: 'Viewer',
          role_level: 5,
          description: 'Read-only access',
          is_system_role: true,
          permissions: { view_only: true },
          created_at: new Date().toISOString()
        }
      ]
      setSystemRoles(defaultRoles)
    }

    if (!invitations || invitations.length === 0) {
      const sampleInvitations: CompanyInvitation[] = [
        {
          id: 'inv-1',
          company_id: companyId,
          email: 'john.doe@example.com',
          invited_by: currentUserId,
          role_id: 'role-4',
          department: 'Engineering',
          position: 'Software Developer',
          invitation_token: 'token-123',
          status: 'pending',
          expires_at: addDays(new Date(), 7).toISOString(),
          message: 'Welcome to our team! Please accept this invitation to join our company.',
          created_at: new Date().toISOString()
        },
        {
          id: 'inv-2',
          company_id: companyId,
          email: 'sarah.wilson@example.com',
          invited_by: currentUserId,
          role_id: 'role-3',
          department: 'Marketing',
          position: 'Marketing Manager',
          invitation_token: 'token-456',
          status: 'accepted',
          expires_at: addDays(new Date(), 7).toISOString(),
          accepted_at: new Date().toISOString(),
          message: 'Excited to have you lead our marketing initiatives.',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setInvitations(sampleInvitations)
    }
  }, [companyId, currentUserId, systemRoles, invitations, setSystemRoles, setInvitations])

  const handleSendInvitation = async () => {
    if (!invitationForm.email || !invitationForm.role_id) {
      toast.error('Email and role are required')
      return
    }

    // Check if email is already invited or is a user
    const currentInvitations = invitations || []
    const existingInvitation = currentInvitations.find(inv => 
      inv.email === invitationForm.email && 
      inv.status === 'pending'
    )

    if (existingInvitation) {
      toast.error('An active invitation already exists for this email')
      return
    }

    const newInvitation: CompanyInvitation = {
      id: `inv-${Date.now()}`,
      company_id: companyId,
      email: invitationForm.email,
      invited_by: currentUserId,
      role_id: invitationForm.role_id,
      department: invitationForm.department || undefined,
      position: invitationForm.position || undefined,
      invitation_token: `token-${Math.random().toString(36).substr(2, 15)}`,
      status: 'pending',
      expires_at: addDays(new Date(), invitationForm.expires_in_days).toISOString(),
      message: invitationForm.message || undefined,
      created_at: new Date().toISOString()
    }

    setInvitations(current => [...(current || []), newInvitation])

    // Log the invitation event
    const accessLog: UserCompanyAccessLog = {
      id: `log-${Date.now()}`,
      global_user_id: currentUserId,
      company_id: companyId,
      access_type: 'invitation_accepted',
      success: true,
      additional_data: { 
        invited_email: invitationForm.email,
        role_id: invitationForm.role_id 
      },
      created_at: new Date().toISOString()
    }
    setAccessLogs(current => [...(current || []), accessLog])

    // Reset form
    setInvitationForm({
      email: '',
      role_id: '',
      department: '',
      position: '',
      message: '',
      expires_in_days: 7
    })

    setShowInviteDialog(false)
    toast.success('Invitation sent successfully!')
  }

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(current => 
      (current || []).map(inv => 
        inv.id === invitationId 
          ? { ...inv, status: 'cancelled' as const }
          : inv
      )
    )

    // Log the cancellation
    const auditLog: SecurityAuditLog = {
      id: `audit-${Date.now()}`,
      global_user_id: currentUserId,
      company_id: companyId,
      event_type: 'invitation_cancelled',
      event_description: `Cancelled invitation for ${selectedInvitation?.email}`,
      risk_level: 'low',
      additional_data: { invitation_id: invitationId },
      created_at: new Date().toISOString()
    }
    setAuditLogs(current => [...(current || []), auditLog])

    setShowCancelDialog(false)
    setSelectedInvitation(null)
    toast.success('Invitation cancelled')
  }

  const handleResendInvitation = (invitation: CompanyInvitation) => {
    const updatedInvitation = {
      ...invitation,
      expires_at: addDays(new Date(), 7).toISOString(),
      invitation_token: `token-${Math.random().toString(36).substr(2, 15)}`
    }

    setInvitations(current => 
      (current || []).map(inv => 
        inv.id === invitation.id ? updatedInvitation : inv
      )
    )

    toast.success('Invitation resent successfully!')
  }

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation?token=${token}`
    navigator.clipboard.writeText(link)
    toast.success('Invitation link copied to clipboard!')
  }

  const getRoleName = (roleId: string) => {
    return (systemRoles || []).find(role => role.id === roleId)?.role_name || 'Unknown Role'
  }

  const getStatusBadge = (status: CompanyInvitation['status'], expiresAt: string) => {
    const isExpired = isAfter(new Date(), new Date(expiresAt))
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }

    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredInvitations = (invitations || []).filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesRole = roleFilter === 'all' || invitation.role_id === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const getInvitationStats = () => {
    const currentInvitations = invitations || []
    const pending = currentInvitations.filter(inv => inv.status === 'pending').length
    const accepted = currentInvitations.filter(inv => inv.status === 'accepted').length
    const expired = currentInvitations.filter(inv => 
      inv.status === 'pending' && isAfter(new Date(), new Date(inv.expires_at))
    ).length
    
    return { pending, accepted, expired, total: currentInvitations.length }
  }

  const stats = getInvitationStats()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <Check className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="send">Send Invitations</TabsTrigger>
            <TabsTrigger value="manage">Manage Invitations</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
            <TabsTrigger value="audit">Security Audit</TabsTrigger>
          </TabsList>
          
          {activeTab === 'send' && (
            <Button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-2">
              <UserPlus size={16} />
              Send Invitation
            </Button>
          )}
        </div>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Invitation System</CardTitle>
              <CardDescription>
                Invite new users to join your company with specific roles and permissions.
                Invitations are secure, token-based, and automatically expire.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserPlus size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Invite Team Members</h3>
                <p className="text-muted-foreground mb-4">
                  Send secure invitations with role-based access control
                </p>
                <Button onClick={() => setShowInviteDialog(true)} size="lg">
                  Send Your First Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, department, or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {(systemRoles || []).map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invitations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invitation Management</CardTitle>
              <CardDescription>
                View and manage all company invitations. Track status, resend, or cancel as needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getRoleName(invitation.role_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>{invitation.department || '-'}</TableCell>
                      <TableCell>{invitation.position || '-'}</TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status, invitation.expires_at)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedInvitation(invitation)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                          
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInvitationLink(invitation.invitation_token)}
                              >
                                <Copy size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendInvitation(invitation)}
                              >
                                <RotateCcw size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvitation(invitation)
                                  setShowCancelDialog(true)
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredInvitations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No invitations found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Company Access Logs</CardTitle>
              <CardDescription>
                Complete audit trail of user access events including logins, company switches, and invitation acceptances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Access Type</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(accessLogs || []).slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.global_user_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.access_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {log.additional_data && Object.keys(log.additional_data).length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>
                Security events, permission changes, and risk assessments for compliance and monitoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(auditLogs || []).slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {log.event_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.event_description || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.risk_level === 'critical' ? 'destructive' :
                            log.risk_level === 'high' ? 'destructive' :
                            log.risk_level === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {log.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.global_user_id}</TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Invitation Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Company Invitation</DialogTitle>
            <DialogDescription>
              Invite a new user to join your company with specific role and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={invitationForm.role_id} 
                onValueChange={(value) => setInvitationForm(prev => ({ ...prev, role_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {(systemRoles || []).map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{role.role_name}</span>
                        <Badge variant="outline" className="ml-2">
                          Level {role.role_level}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering, Marketing"
                value={invitationForm.department}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="e.g., Software Developer, Manager"
                value={invitationForm.position}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expires">Expires In (Days)</Label>
              <Select 
                value={invitationForm.expires_in_days.toString()} 
                onValueChange={(value) => setInvitationForm(prev => ({ ...prev, expires_in_days: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Welcome Message</Label>
              <Textarea
                id="message"
                placeholder="Optional welcome message for the invitee..."
                value={invitationForm.message}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitation} className="flex items-center gap-2">
              <Send size={16} />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invitation Details</DialogTitle>
          </DialogHeader>
          
          {selectedInvitation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedInvitation.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">
                    {getRoleName(selectedInvitation.role_id)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvitation.department || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Position</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvitation.position || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {getStatusBadge(selectedInvitation.status, selectedInvitation.expires_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expires</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedInvitation.expires_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {selectedInvitation.message && (
                <div>
                  <Label className="text-sm font-medium">Welcome Message</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedInvitation.message}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Invitation Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={`${window.location.origin}/accept-invitation?token=${selectedInvitation.invitation_token}`}
                    readOnly 
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInvitationLink(selectedInvitation.invitation_token)}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation for {selectedInvitation?.email}? 
              This action cannot be undone and the invitation link will become invalid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedInvitation && handleCancelInvitation(selectedInvitation.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}