import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
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
  MagnifyingGlass as Search,
  Plus,
  PencilSimple as Edit,
  DotsThree as MoreHorizontal,
  ChartBar,
  Target,
  CheckCircle,
  XCircle,
  Warning as AlertTriangle,
  Brain,
  Lightbulb,
  Handshake,
  TrendDown,
  Warning,
  ArrowsClockwise,
  PlayCircle,
  Bell
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
  annualRevenue: number
  employeeCount: number
  accountType: string
  status: string
  healthScore: number
  lastContactDate: string
  nextFollowUp: string
  aiLeadScore: number
  tags: string[]
  customFields: Record<string, any>
  aiEngagementTrend: string
  aiSatisfactionTrend: string
  aiExpansionReadiness: number
  aiRetentionProbability: number
  aiAdvocacyPotential: number
  totalEmailCount: number
  totalMeetingCount: number
  totalCallCount: number
  totalQuoteCount: number
  totalDealCount: number
  lastEmailDate: string
  lastMeetingDate: string
  lastCallDate: string
  totalRevenue: number
  averageDealSize: number
  conversionRate: number
  customerLifetimeValue: number
  timeToClose: number
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
  const [accounts, setAccounts] = useKV<Account[]>('enhanced-accounts', [])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [activeTab, setActiveTab] = useState('executive')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  useEffect(() => {
    if (accounts.length === 0) {
      const mockAccounts: Account[] = [
        {
          id: '1',
          companyName: 'Acme Corporation',
          contactName: 'John Smith',
          email: 'john.smith@acme.com',
          phone: '+1 (555) 123-4567',
          website: 'https://acme.com',
          industry: 'Technology',
          annualRevenue: 5000000,
          employeeCount: 250,
          accountType: 'Enterprise',
          status: 'Active',
          healthScore: 87,
          lastContactDate: '2024-01-15',
          nextFollowUp: '2024-01-20',
          aiLeadScore: 92,
          tags: ['High Value', 'Strategic', 'Expansion Ready'],
          customFields: {},
          aiEngagementTrend: 'increasing',
          aiSatisfactionTrend: 'stable',
          aiExpansionReadiness: 85,
          aiRetentionProbability: 0.92,
          aiAdvocacyPotential: 78,
          totalEmailCount: 124,
          totalMeetingCount: 18,
          totalCallCount: 32,
          totalQuoteCount: 8,
          totalDealCount: 12,
          lastEmailDate: '2024-01-14',
          lastMeetingDate: '2024-01-10',
          lastCallDate: '2024-01-12',
          totalRevenue: 750000,
          averageDealSize: 62500,
          conversionRate: 0.75,
          customerLifetimeValue: 1250000,
          timeToClose: 45
        },
        {
          id: '2',
          companyName: 'TechFlow Solutions',
          contactName: 'Sarah Johnson',
          email: 'sarah.johnson@techflow.com',
          phone: '+1 (555) 987-6543',
          website: 'https://techflow.com',
          industry: 'Software',
          annualRevenue: 2500000,
          employeeCount: 120,
          accountType: 'Mid-Market',
          status: 'Active',
          healthScore: 73,
          lastContactDate: '2024-01-12',
          nextFollowUp: '2024-01-18',
          aiLeadScore: 78,
          tags: ['Growth Potential', 'Tech Savvy'],
          customFields: {},
          aiEngagementTrend: 'stable',
          aiSatisfactionTrend: 'improving',
          aiExpansionReadiness: 68,
          aiRetentionProbability: 0.84,
          aiAdvocacyPotential: 65,
          totalEmailCount: 89,
          totalMeetingCount: 12,
          totalCallCount: 24,
          totalQuoteCount: 5,
          totalDealCount: 8,
          lastEmailDate: '2024-01-11',
          lastMeetingDate: '2024-01-08',
          lastCallDate: '2024-01-09',
          totalRevenue: 320000,
          averageDealSize: 40000,
          conversionRate: 0.62,
          customerLifetimeValue: 680000,
          timeToClose: 32
        }
      ]
      setAccounts(mockAccounts)
      setSelectedAccount(mockAccounts[0])
    }
  }, [accounts, setAccounts])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || account.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    toast.success(`Viewing ${account.companyName} details`)
  }

  const handleEmailClick = (email: string) => {
    toast.info(`Opening email composer for ${email}`)
  }

  const handlePhoneClick = (phone: string) => {
    toast.info(`Initiating call to ${phone}`)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendUp className="w-4 h-4 text-green-600" />
      case 'decreasing':
        return <TrendDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  const renderAccountsList = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enhanced Account Management</span>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </CardTitle>
        <CardDescription>
          Comprehensive account intelligence with AI insights and real-time collaboration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search accounts by name, contact, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="space-y-3">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleAccountClick(account)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`/api/placeholder/40/40`} />
                    <AvatarFallback>{account.companyName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{account.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{account.contactName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                    {account.status}
                  </Badge>
                  <div className={`text-sm font-medium ${getHealthScoreColor(account.healthScore)}`}>
                    {account.healthScore}% Health
                  </div>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEmailClick(account.email)
                    }}
                  >
                    {account.email}
                  </button>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePhoneClick(account.phone)
                    }}
                  >
                    {account.phone}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderAccountDetails = () => {
    if (!selectedAccount) return null

    return (
      <div className="space-y-6">
        {/* Account Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`/api/placeholder/64/64`} />
                  <AvatarFallback className="text-lg">
                    {selectedAccount.companyName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAccount.companyName}</h2>
                  <p className="text-muted-foreground">{selectedAccount.industry}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>${(selectedAccount.annualRevenue / 1000000).toFixed(1)}M revenue</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{selectedAccount.employeeCount} employees</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{selectedAccount.accountType}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive">Executive</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleEmailClick(selectedAccount.email)}
                            >
                              {selectedAccount.email}
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handlePhoneClick(selectedAccount.phone)}
                            >
                              {selectedAccount.phone}
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedAccount.website}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Health Score:</span>
                            <span className={getHealthScoreColor(selectedAccount.healthScore)}>
                              {selectedAccount.healthScore}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>AI Lead Score:</span>
                            <span>{selectedAccount.aiLeadScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span>${selectedAccount.totalRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Meeting
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Quote
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button variant="outline" size="sm">
                    <ArrowsClockwise className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Health Score Improved</p>
                        <p className="text-xs text-green-700">Account health increased to {selectedAccount.healthScore}%</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600">2 min ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Email Opened</p>
                        <p className="text-xs text-blue-700">Latest proposal email opened by {selectedAccount.contactName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600">5 min ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Follow-up Scheduled</p>
                        <p className="text-xs text-yellow-700">Next meeting scheduled for {selectedAccount.nextFollowUp}</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-600">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${selectedAccount.totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                      <p className="text-2xl font-bold">${selectedAccount.averageDealSize.toLocaleString()}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">{(selectedAccount.conversionRate * 100).toFixed(1)}%</p>
                    </div>
                    <TrendUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="success" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-lg font-bold">{selectedAccount.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(selectedAccount.aiEngagementTrend)}
                    </div>
                    <p className="text-lg font-bold capitalize">{selectedAccount.aiEngagementTrend}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(selectedAccount.aiSatisfactionTrend)}
                    </div>
                    <p className="text-lg font-bold capitalize">{selectedAccount.aiSatisfactionTrend}</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold">{selectedAccount.aiExpansionReadiness}%</p>
                    <p className="text-xs text-muted-foreground">Expansion Ready</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Expansion Opportunity Detected</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          AI analysis shows {selectedAccount.aiExpansionReadiness}% readiness for upselling. 
                          Consider presenting our Enterprise package based on their growth trajectory.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">High Retention Probability</h4>
                        <p className="text-sm text-green-700 mt-1">
                          {(selectedAccount.aiRetentionProbability * 100).toFixed(0)}% probability of renewal based on engagement patterns and satisfaction metrics.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                    <div className="flex items-start space-x-3">
                      <Handshake className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Advocacy Potential</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          {selectedAccount.aiAdvocacyPotential}% advocacy potential. This account could become a reference customer.
                        </p>
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

  return (
    <div className="space-y-6">
      {renderAccountsList()}
      {selectedAccount && renderAccountDetails()}
    </div>
  )
}

export default EnhancedAccountManagement