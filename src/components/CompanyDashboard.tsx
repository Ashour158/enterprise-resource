import { useState } from 'react'
import { useMultiCompanyAuth } from '@/hooks/useMultiCompanyAuth'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { mockCompanies, mockGlobalUser } from '@/data/mockData'
import { CompanyAccess, Company } from '@/types/erp'
import { 
  Buildings, 
  Users, 
  Shield, 
  Clock, 
  Plus, 
  Gear as Settings, 
  UserCircle,
  CheckCircle,
  Warning as AlertTriangle,
  Crown,
  Gear
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CompanyDashboardProps {
  className?: string
}

export function CompanyDashboard({ className }: CompanyDashboardProps) {
  const {
    currentUser,
    sessionContext,
    availableCompanies,
    switchCompany,
    isLoading
  } = useMultiCompanyAuth()

  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<string | null>(null)
  const [showCompanySettings, setShowCompanySettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)

  // Get current company details
  const currentCompanyId = sessionContext?.current_company_id
  const currentCompany = mockCompanies.find(c => c.id === currentCompanyId)

  // User's company access summary
  const getAccessSummary = () => {
    const total = availableCompanies.length
    const active = availableCompanies.filter(c => c.status === 'active').length
    const pending = availableCompanies.filter(c => c.status === 'pending').length
    const roles = [...new Set(availableCompanies.map(c => c.role))]

    return { total, active, pending, roles }
  }

  const accessSummary = getAccessSummary()

  const handleCompanySwitch = async (companyId: string) => {
    if (isLoading) return
    
    const result = await switchCompany(companyId)
    if (!result.success && result.error) {
      toast.error(result.error.message)
    }
  }

  const handleCompanySettings = (companyId: string) => {
    setSelectedCompanyForEdit(companyId)
    setShowCompanySettings(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'suspended': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-purple-500" />
      case 'manager': return <Shield size={16} className="text-blue-500" />
      case 'user': return <UserCircle size={16} className="text-green-500" />
      default: return <Users size={16} className="text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Multi-Company Dashboard</h2>
          <p className="text-muted-foreground">
            Manage access across {accessSummary.total} companies with {accessSummary.roles.join(', ')} privileges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCircle size={16} className="mr-2" />
                Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  Your global user profile and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mockGlobalUser.profile_picture_url} />
                    <AvatarFallback>
                      {mockGlobalUser.first_name[0]}{mockGlobalUser.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{mockGlobalUser.first_name} {mockGlobalUser.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{mockGlobalUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {mockGlobalUser.mfa_enabled && (
                        <Badge variant="outline" className="text-xs">
                          <Shield size={12} className="mr-1" />
                          MFA Enabled
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {accessSummary.total} Companies
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">{mockGlobalUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Login</Label>
                    <p className="text-sm text-muted-foreground">
                      {mockGlobalUser.last_login ? new Date(mockGlobalUser.last_login).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(mockGlobalUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Company Info */}
      {currentCompany && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Buildings size={24} className="text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentCompany.name}
                    <Badge variant="default">Current</Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentCompany.company_code} • {currentCompany.domain}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCompanySettings(currentCompany.id)}
              >
                <Gear size={16} className="mr-2" />
                Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                <p className="text-lg font-semibold capitalize">{currentCompany.subscription_plan}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                <p className="text-lg font-semibold">{currentCompany.timezone}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p className="text-lg font-semibold">{currentCompany.currency}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentCompany.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <p className="text-lg font-semibold">{currentCompany.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableCompanies.map((companyAccess) => {
          const company = mockCompanies.find(c => c.id === companyAccess.company_id)
          if (!company) return null

          const isCurrent = companyAccess.company_id === currentCompanyId

          return (
            <Card 
              key={companyAccess.company_id} 
              className={`transition-all hover:shadow-md ${isCurrent ? 'ring-2 ring-primary' : ''} ${
                isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
              }`}
              onClick={() => !isCurrent && handleCompanySwitch(companyAccess.company_id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <Buildings size={20} className="text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.company_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(companyAccess.status)}`} />
                    {getRoleIcon(companyAccess.role)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {companyAccess.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={companyAccess.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {companyAccess.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Subscription</span>
                    <span className="capitalize">{company.subscription_plan}</span>
                  </div>
                  {companyAccess.last_accessed && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last Accessed</span>
                      <span>{new Date(companyAccess.last_accessed).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <div className="mt-3 flex items-center justify-center text-xs text-primary font-medium">
                    <CheckCircle size={14} className="mr-1" />
                    Current Company
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Access Summary</CardTitle>
          <CardDescription>
            Overview of your company access and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Buildings size={24} className="mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{accessSummary.total}</p>
              <p className="text-sm text-muted-foreground">Total Companies</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{accessSummary.active}</p>
              <p className="text-sm text-muted-foreground">Active Access</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock size={24} className="mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{accessSummary.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Invites</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Shield size={24} className="mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{accessSummary.roles.length}</p>
              <p className="text-sm text-muted-foreground">Different Roles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}