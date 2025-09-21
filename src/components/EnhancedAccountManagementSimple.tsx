import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import RealTimeAccountCollaboration from '@/components/RealTimeAccountCollaboration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building, 
  Users, 
  TrendUp, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Star,
  Clock,
  MessageCircle,
  Video,
  PaperPlaneTilt,
  Download,
  Eye,
  CaretDown,
  CaretUp,
  Filter,
  Search,
  Plus,
  Edit,
  MoreHorizontal,
  ChartBar,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Lightbulb,
  Handshake,
  TrendDown,
  Warning,
  ArrowsClockwise,
  PlayCircle,
  Microphone,
  CreditCard,
  Receipt,
  UserCircle,
  Globe
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Account {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  website: string
  industry: string
  employees: number
  annualRevenue: number
  accountType: string
  accountStatus: string
  healthScore: number
  engagementScore: number
  createdAt: string
  lastContact: string
  accountOwner: string
  totalEmailCount: number
  totalMeetingCount: number
  totalCallCount: number
  totalQuoteCount: number
  totalDealCount: number
  aiEngagementTrend: string
  aiExpansionReadiness: number
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
}

interface EnhancedAccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

const EnhancedAccountManagement: React.FC<EnhancedAccountManagementProps> = ({
  companyId,
  userId,
  userRole
}) => {
  const [accounts, setAccounts] = useKV<Account[]>(`accounts-${companyId}`, [])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Initialize with sample data
    const sampleAccounts: Account[] = [
      {
        id: 'acc-001',
        companyName: 'TechCorp Solutions Inc.',
        contactName: 'Sarah Williams',
        email: 'sarah.williams@techcorp.example.com',
        phone: '+1 (555) 123-4567',
        website: 'https://techcorp.example.com',
        industry: 'Technology',
        employees: 2500,
        annualRevenue: 25000000,
        accountType: 'Enterprise',
        accountStatus: 'active',
        healthScore: 87,
        engagementScore: 82,
        createdAt: '2023-09-20T10:00:00Z',
        lastContact: '2024-01-15T14:30:00Z',
        accountOwner: 'John Smith',
        totalEmailCount: 67,
        totalMeetingCount: 12,
        totalCallCount: 28,
        totalQuoteCount: 3,
        totalDealCount: 2,
        aiEngagementTrend: 'increasing',
        aiExpansionReadiness: 85,
        address: {
          street: '123 Innovation Drive',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          zipCode: '94105'
        }
      },
      {
        id: 'acc-002',
        companyName: 'Global Industries Ltd.',
        contactName: 'Michael Chen',
        email: 'michael.chen@global.example.com',
        phone: '+1 (555) 234-5678',
        website: 'https://global.example.com',
        industry: 'Manufacturing',
        employees: 5000,
        annualRevenue: 50000000,
        accountType: 'Enterprise',
        accountStatus: 'active',
        healthScore: 72,
        engagementScore: 68,
        createdAt: '2023-08-15T09:00:00Z',
        lastContact: '2024-01-14T16:45:00Z',
        accountOwner: 'Jane Davis',
        totalEmailCount: 45,
        totalMeetingCount: 8,
        totalCallCount: 18,
        totalQuoteCount: 2,
        totalDealCount: 1,
        aiEngagementTrend: 'stable',
        aiExpansionReadiness: 62,
        address: {
          street: '456 Industry Blvd',
          city: 'Chicago',
          state: 'IL',
          country: 'United States',
          zipCode: '60601'
        }
      }
    ]
    setAccounts(sampleAccounts)
  }, [setAccounts])

  const filteredAccounts = accounts.filter(account =>
    account.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    toast.success(`Opened ${account.companyName}`)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendUp className="w-4 h-4 text-green-600" />
      case 'decreasing':
        return <TrendDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (selectedAccount) {
    return (
      <div className="space-y-6">
        {/* Account Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedAccount.companyName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{selectedAccount.companyName}</h1>
                  <p className="text-muted-foreground flex items-center">
                    <UserCircle className="w-4 h-4 mr-2" />
                    {selectedAccount.contactName} • {selectedAccount.accountOwner}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={
                      selectedAccount.accountStatus === 'active' ? 'default' :
                      selectedAccount.accountStatus === 'pending' ? 'secondary' :
                      selectedAccount.accountStatus === 'suspended' ? 'destructive' : 'outline'
                    }>
                      {selectedAccount.accountStatus}
                    </Badge>
                    <Badge>{selectedAccount.accountType}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-muted-foreground">Health Score:</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                    {selectedAccount.healthScore}%
                  </span>
                  {getTrendIcon(selectedAccount.aiEngagementTrend)}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedAccount(null)}>
                    ← Back
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collaboration">Live Collaboration</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="text-primary cursor-pointer hover:underline">{selectedAccount.website}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Industry</label>
                      <p>{selectedAccount.industry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Employees</label>
                      <p>{selectedAccount.employees.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Annual Revenue</label>
                      <p className="text-green-600 font-medium">${selectedAccount.annualRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="text-sm">
                      {selectedAccount.address.street}<br />
                      {selectedAccount.address.city}, {selectedAccount.address.state} {selectedAccount.address.zipCode}<br />
                      {selectedAccount.address.country}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Score</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                        {selectedAccount.healthScore}%
                      </span>
                      {getTrendIcon(selectedAccount.aiEngagementTrend)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-bold">{selectedAccount.engagementScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expansion Readiness</span>
                    <span className="font-bold text-blue-600">{selectedAccount.aiExpansionReadiness}%</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg">{selectedAccount.totalEmailCount}</p>
                      <p className="text-muted-foreground">Emails</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{selectedAccount.totalMeetingCount}</p>
                      <p className="text-muted-foreground">Meetings</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{selectedAccount.totalQuoteCount}</p>
                      <p className="text-muted-foreground">Quotes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{selectedAccount.totalDealCount}</p>
                      <p className="text-muted-foreground">Deals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <RealTimeAccountCollaboration
              accountId={selectedAccount.id}
              companyId={companyId}
              userId={userId}
              userName="John Smith"
              userAvatar="/api/placeholder/32/32"
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email sent to {selectedAccount.contactName}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meeting scheduled for next week</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quote generated and sent</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">${selectedAccount.annualRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">Annual Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">+15%</p>
                    <p className="text-sm text-blue-600">Growth Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{selectedAccount.aiExpansionReadiness}%</p>
                    <p className="text-sm text-purple-600">Expansion Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Expansion Opportunity</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Based on usage patterns and engagement metrics, this account shows {selectedAccount.aiExpansionReadiness}% 
                      readiness for upselling to premium features.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Health Status</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Account health is {selectedAccount.healthScore >= 80 ? 'excellent' : selectedAccount.healthScore >= 60 ? 'good' : 'concerning'} 
                      with {selectedAccount.aiEngagementTrend} engagement trends.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Recommended Actions</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Schedule quarterly business review</li>
                      <li>• Present new feature roadmap</li>
                      <li>• Explore additional use cases</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Notification Preferences</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Health score changes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">New activities</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span className="text-sm">Weekly summary reports</span>
                      </label>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Data Sync</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Last synced: {new Date().toLocaleString()}
                    </p>
                    <Button variant="outline" size="sm">
                      <ArrowsClockwise className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Account Management</h2>
          <p className="text-muted-foreground">
            Complete 360-degree customer views with AI insights and real-time collaboration
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search accounts by name, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => handleAccountClick(account)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {account.companyName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{account.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{account.contactName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getHealthScoreBadge(account.healthScore)}
                  <p className="text-xs text-muted-foreground mt-1">Health Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{account.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{account.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{account.industry}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-green-600 font-medium">${(account.annualRevenue / 1000000).toFixed(1)}M</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {account.totalEmailCount}
                  </span>
                  <span className="flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    {account.totalMeetingCount}
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {account.totalQuoteCount}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Eye size={12} className="mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create a new account.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedAccountManagement