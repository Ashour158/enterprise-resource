import React, { useState } from 'react'
import { RoleManagement } from '@/components/RoleManagement'
import { CompanyAccessControl } from '@/components/CompanyAccessControl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockCompanies, mockUser } from '@/data/mockData'
import { 
  Shield, 
  Users, 
  Key, 
  ShieldCheck, 
  Warning,
  CheckCircle,
  Clock,
  Buildings,
  UserCheck,
  Lock
} from '@phosphor-icons/react'
import { PermissionTest } from '@/components/PermissionTest'

interface PermissionDashboardProps {
  companyId: string
  userId: string
}

export const PermissionDashboard: React.FC<PermissionDashboardProps> = ({
  companyId,
  userId
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock security metrics
  const securityMetrics = {
    totalUsers: 45,
    activeUsers: 42,
    suspendedUsers: 3,
    totalRoles: 8,
    customRoles: 5,
    systemRoles: 3,
    totalPermissions: 156,
    highRiskPermissions: 12,
    pendingApprovals: 3,
    securityScore: 92,
    complianceScore: 88,
    lastAudit: '2024-01-15',
    criticalVulnerabilities: 0,
    mfaAdoption: 95,
    passwordCompliance: 89
  }

  const recentActivity = [
    {
      id: 1,
      action: 'Role Created',
      details: 'Senior Developer role created with 15 permissions',
      user: 'admin@company.com',
      timestamp: '2 hours ago',
      type: 'create',
      risk: 'medium'
    },
    {
      id: 2,
      action: 'Permission Granted',
      details: 'User.delete permission granted to Manager role',
      user: 'hr.manager@company.com',
      timestamp: '4 hours ago',
      type: 'grant',
      risk: 'high'
    },
    {
      id: 3,
      action: 'User Access Revoked',
      details: 'Access revoked for former employee',
      user: 'security@company.com',
      timestamp: '1 day ago',
      type: 'revoke',
      risk: 'low'
    },
    {
      id: 4,
      action: 'MFA Enabled',
      details: 'Multi-factor authentication enabled for Finance team',
      user: 'it.admin@company.com',
      timestamp: '2 days ago',
      type: 'security',
      risk: 'low'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return <UserCheck size={16} className="text-blue-600" />
      case 'grant': return <Key size={16} className="text-orange-600" />
      case 'revoke': return <Lock size={16} className="text-red-600" />
      case 'security': return <ShieldCheck size={16} className="text-green-600" />
      default: return <Shield size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Advanced role-based access control with company isolation and security monitoring
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield size={16} />
          Security Score: {securityMetrics.securityScore}%
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="test">Permission Test</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{securityMetrics.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.suspendedUsers} suspended
                    </p>
                  </div>
                  <Users size={20} className="text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                    <p className="text-2xl font-bold">{securityMetrics.totalRoles}</p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.customRoles} custom
                    </p>
                  </div>
                  <Shield size={20} className="text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                    <p className="text-2xl font-bold">{securityMetrics.totalPermissions}</p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.highRiskPermissions} high-risk
                    </p>
                  </div>
                  <Key size={20} className="text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">MFA Adoption</p>
                    <p className="text-2xl font-bold">{securityMetrics.mfaAdoption}%</p>
                    <p className="text-xs text-muted-foreground">
                      {securityMetrics.pendingApprovals} pending
                    </p>
                  </div>
                  <ShieldCheck size={20} className="text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck size={20} />
                  Security Status
                </CardTitle>
                <CardDescription>
                  Overall security posture and compliance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Score</span>
                    <span className="text-sm text-muted-foreground">{securityMetrics.securityScore}%</span>
                  </div>
                  <Progress value={securityMetrics.securityScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <span className="text-sm text-muted-foreground">{securityMetrics.complianceScore}%</span>
                  </div>
                  <Progress value={securityMetrics.complianceScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password Compliance</span>
                    <span className="text-sm text-muted-foreground">{securityMetrics.passwordCompliance}%</span>
                  </div>
                  <Progress value={securityMetrics.passwordCompliance} className="h-2" />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last Security Audit</span>
                    <span className="text-muted-foreground">{securityMetrics.lastAudit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Critical Vulnerabilities</span>
                    <Badge variant={securityMetrics.criticalVulnerabilities === 0 ? 'default' : 'destructive'}>
                      {securityMetrics.criticalVulnerabilities}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest permission and security changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="mt-1">
                        {getActionIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{activity.action}</p>
                          <Badge 
                            className={`text-xs ${getRiskColor(activity.risk)}`}
                            variant="outline"
                          >
                            {activity.risk}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.details}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement 
            companyId={companyId}
            currentUserId={userId}
          />
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <CompanyAccessControl
            companies={mockCompanies}
            currentUserId={userId}
            currentCompanyId={companyId}
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <PermissionTest
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={20} />
                Compliance & Audit
              </CardTitle>
              <CardDescription>
                Security compliance monitoring and audit trail management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Compliance Standards</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">SOX Compliance</div>
                        <div className="text-sm text-muted-foreground">Financial controls and reporting</div>
                      </div>
                      <Badge variant="default">
                        <CheckCircle size={14} className="mr-1" />
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">GDPR Compliance</div>
                        <div className="text-sm text-muted-foreground">Data protection and privacy</div>
                      </div>
                      <Badge variant="default">
                        <CheckCircle size={14} className="mr-1" />
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">HIPAA Compliance</div>
                        <div className="text-sm text-muted-foreground">Healthcare data protection</div>
                      </div>
                      <Badge variant="secondary">
                        <Warning size={14} className="mr-1" />
                        Review Required
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Audit Configuration</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Permission change logging</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Failed login monitoring</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data access tracking</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Privilege escalation alerts</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Retention period</span>
                      <span className="text-muted-foreground">7 years</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}