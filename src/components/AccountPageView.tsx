import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import CustomerUnifiedTimeline from './CustomerUnifiedTimeline'
import { 
  Building2, 
  Users, 
  TrendUp, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  Globe, 
  Clock, 
  Eye, 
  MessageSquare, 
  FileText, 
  Heart, 
  Brain, 
  Shield, 
  Lightbulb,
  Activity,
  BarChart3,
  Target,
  Zap,
  Sparkle,
  Radar,
  MousePointer
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Account {
  id: string
  company_name: string
  industry: string
  website: string
  annual_revenue: number
  employee_count: number
  account_status: string
  account_manager_id: string
  created_date: string
  last_contact_date: string
  health_score: number
  satisfaction_score: number
  engagement_score: number
  ai_churn_risk: number
  ai_expansion_potential: number
  total_revenue: number
  total_deals: number
  total_quotes: number
  total_support_tickets: number
  notes: string
  tags: string[]
  custom_fields: any
  contacts: Array<{
    id: string
    name: string
    title: string
    email: string
    phone: string
    is_primary: boolean
  }>
  deals: Array<{
    id: string
    name: string
    value: number
    stage: string
    probability: number
    close_date: string
  }>
  ai_insights: Array<{
    type: string
    insight: string
    confidence: number
    actionable: boolean
  }>
}

interface AccountPageViewProps {
  accountId: string
  companyId: string
  userId: string
  onClose?: () => void
}

const AccountPageView: React.FC<AccountPageViewProps> = ({
  accountId,
  companyId,
  userId,
  onClose
}) => {
  const [account, setAccount] = useKV<Account | null>(`account-${accountId}`, null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [newTag, setNewTag] = useState('')
  const [realTimeActivity, setRealTimeActivity] = useKV<Array<{
    id: string
    type: string
    message: string
    timestamp: string
    user: string
  }>>(`account-activity-${accountId}`, [])

  // Generate comprehensive account data
  useEffect(() => {
    if (!account) {
      const generateAccountData = async () => {
        const prompt = spark.llmPrompt`Generate a comprehensive account profile for account ID ${accountId}. Include complete company information, multiple contacts, deals pipeline, AI insights, health scores, and business intelligence. Return as JSON with realistic data.`
        
        try {
          const response = await spark.llm(prompt, 'gpt-4o', true)
          const data = JSON.parse(response)
          
          const accountData: Account = {
            id: accountId,
            company_name: data.company_name || 'Global Tech Solutions Inc.',
            industry: data.industry || 'Technology',
            website: data.website || 'https://globaltechsolutions.com',
            annual_revenue: data.annual_revenue || 50000000,
            employee_count: data.employee_count || 250,
            account_status: data.account_status || 'active',
            account_manager_id: userId,
            created_date: data.created_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            last_contact_date: data.last_contact_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            health_score: data.health_score || 85,
            satisfaction_score: data.satisfaction_score || 92,
            engagement_score: data.engagement_score || 78,
            ai_churn_risk: data.ai_churn_risk || 15,
            ai_expansion_potential: data.ai_expansion_potential || 82,
            total_revenue: data.total_revenue || 2850000,
            total_deals: data.total_deals || 14,
            total_quotes: data.total_quotes || 28,
            total_support_tickets: data.total_support_tickets || 42,
            notes: data.notes || 'Strategic enterprise client with strong growth potential. Focus on digital transformation initiatives.',
            tags: data.tags || ['enterprise', 'strategic', 'tech-forward', 'expansion-ready'],
            custom_fields: data.custom_fields || {},
            contacts: data.contacts || [
              {
                id: 'contact-1',
                name: 'Sarah Johnson',
                title: 'CTO',
                email: 'sarah.johnson@globaltechsolutions.com',
                phone: '+1 (555) 123-4567',
                is_primary: true
              },
              {
                id: 'contact-2',
                name: 'Michael Chen',
                title: 'VP of Operations',
                email: 'michael.chen@globaltechsolutions.com',
                phone: '+1 (555) 123-4568',
                is_primary: false
              }
            ],
            deals: data.deals || [
              {
                id: 'deal-1',
                name: 'Enterprise Platform Upgrade',
                value: 450000,
                stage: 'proposal',
                probability: 75,
                close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: 'deal-2',
                name: 'AI Integration Services',
                value: 220000,
                stage: 'discovery',
                probability: 40,
                close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
              }
            ],
            ai_insights: data.ai_insights || [
              {
                type: 'opportunity',
                insight: 'Strong indicators for AI/ML platform expansion based on recent technical discussions',
                confidence: 87,
                actionable: true
              },
              {
                type: 'risk',
                insight: 'Budget approval timeline may be delayed due to quarterly review cycle',
                confidence: 65,
                actionable: true
              },
              {
                type: 'relationship',
                insight: 'CTO Sarah Johnson is a key advocate and decision influencer',
                confidence: 92,
                actionable: false
              }
            ]
          }

          setAccount(accountData)
          setEditNotes(accountData.notes)
        } catch (error) {
          console.error('Error generating account data:', error)
          toast.error('Failed to load account data')
        }
      }

      generateAccountData()
    } else {
      setEditNotes(account.notes)
    }
  }, [accountId, userId, account, setAccount])

  // Simulate real-time activity
  useEffect(() => {
    const addActivity = (type: string, message: string) => {
      setRealTimeActivity(current => [{
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toISOString(),
        user: 'System'
      }, ...current.slice(0, 9)])
    }

    const interval = setInterval(() => {
      const activities = [
        { type: 'view', message: 'Account profile viewed' },
        { type: 'email', message: 'Email sent to primary contact' },
        { type: 'meeting', message: 'Meeting scheduled with CTO' },
        { type: 'document', message: 'Proposal document accessed' },
        { type: 'quote', message: 'Quote updated with new pricing' }
      ]
      const activity = activities[Math.floor(Math.random() * activities.length)]
      addActivity(activity.type, activity.message)
    }, 8000)

    return () => clearInterval(interval)
  }, [setRealTimeActivity])

  const handleSaveNotes = () => {
    if (account) {
      setAccount({ ...account, notes: editNotes })
      setIsEditing(false)
      toast.success('Notes updated successfully')
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && account && !account.tags.includes(newTag.trim())) {
      setAccount({ ...account, tags: [...account.tags, newTag.trim()] })
      setNewTag('')
      toast.success('Tag added successfully')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (account) {
      setAccount({ ...account, tags: account.tags.filter(tag => tag !== tagToRemove) })
      toast.success('Tag removed successfully')
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={20} className="text-green-600" />
    if (score >= 60) return <AlertTriangle size={20} className="text-yellow-600" />
    return <AlertTriangle size={20} className="text-red-600" />
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity size={48} className="mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading account data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 size={32} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{account.company_name}</h1>
              {getHealthScoreIcon(account.health_score)}
              <Badge variant={account.account_status === 'active' ? 'default' : 'secondary'}>
                {account.account_status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe size={16} />
                {account.industry}
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {account.employee_count.toLocaleString()} employees
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={16} />
                ${(account.annual_revenue / 1000000).toFixed(1)}M revenue
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(account.website, '_blank')}
            className="flex items-center gap-2"
          >
            <Globe size={16} />
            Visit Website
          </Button>
          
          <Button
            variant="outline"
            onClick={() => toast.info('Email composer opened')}
            className="flex items-center gap-2"
          >
            <Mail size={16} />
            Send Email
          </Button>
          
          <Button
            onClick={() => toast.info('Meeting scheduler opened')}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className={`text-xl font-bold ${getHealthScoreColor(account.health_score)}`}>
                  {account.health_score}%
                </p>
              </div>
              <Activity size={20} className={getHealthScoreColor(account.health_score)} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  ${(account.total_revenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-xl font-bold">{account.deals.length}</p>
              </div>
              <Target size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-xl font-bold text-green-600">{account.satisfaction_score}%</p>
              </div>
              <Heart size={20} className="text-pink-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn Risk</p>
                <p className={`text-xl font-bold ${account.ai_churn_risk > 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {account.ai_churn_risk}%
                </p>
              </div>
              <AlertTriangle size={20} className={account.ai_churn_risk > 30 ? 'text-red-600' : 'text-green-600'} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expansion</p>
                <p className="text-xl font-bold text-blue-600">{account.ai_expansion_potential}%</p>
              </div>
              <TrendUp size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Comprehensive account details and business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Industry</Label>
                    <p className="text-sm text-muted-foreground">{account.industry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Website</Label>
                    <a 
                      href={account.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {account.website}
                    </a>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Annual Revenue</Label>
                    <p className="text-sm text-muted-foreground">
                      ${account.annual_revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Employee Count</Label>
                    <p className="text-sm text-muted-foreground">
                      {account.employee_count.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Account Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {account.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="w-24 h-6 text-xs"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button size="sm" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Notes</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? handleSaveNotes() : setIsEditing(true)}
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this account..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded">
                      {account.notes || 'No notes available'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar size={20} />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Health</span>
                    <span className={`text-sm font-bold ${getHealthScoreColor(account.health_score)}`}>
                      {account.health_score}%
                    </span>
                  </div>
                  <Progress value={account.health_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfaction</span>
                    <span className="text-sm font-bold text-green-600">{account.satisfaction_score}%</span>
                  </div>
                  <Progress value={account.satisfaction_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Engagement</span>
                    <span className="text-sm font-bold text-blue-600">{account.engagement_score}%</span>
                  </div>
                  <Progress value={account.engagement_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Churn Risk</span>
                    <span className={`text-sm font-bold ${account.ai_churn_risk > 30 ? 'text-red-600' : 'text-green-600'}`}>
                      {account.ai_churn_risk}%
                    </span>
                  </div>
                  <Progress value={account.ai_churn_risk} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Expansion Potential</span>
                    <span className="text-sm font-bold text-blue-600">{account.ai_expansion_potential}%</span>
                  </div>
                  <Progress value={account.ai_expansion_potential} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Contacts Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Key Contacts</CardTitle>
              <CardDescription>
                Primary stakeholders and decision makers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {account.contacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className="p-4 border rounded-lg cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                    onClick={() => toast.info(`Opening profile for ${contact.name}`)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{contact.name}</h4>
                          {contact.is_primary && (
                            <Star size={14} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        <div className="mt-2 space-y-1">
                          <div 
                            className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `mailto:${contact.email}`
                            }}
                          >
                            <Mail size={12} />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          <div 
                            className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `tel:${contact.phone}`
                            }}
                          >
                            <Phone size={12} />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <CustomerUnifiedTimeline
            customerId={accountId}
            companyId={companyId}
            userId={userId}
            height="600px"
            showFilters={true}
            showAIInsights={true}
            allowEditing={true}
            onEntryClick={(entry) => {
              toast.success(`Timeline entry clicked: ${entry.title}`)
            }}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Contacts</CardTitle>
              <CardDescription>
                Complete contact directory for this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {account.contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                    onClick={() => toast.info(`Opening detailed contact profile for ${contact.name}`)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{contact.name}</h3>
                          {contact.is_primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">{contact.email}</span>
                          <span className="text-xs text-muted-foreground">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `mailto:${contact.email}`
                        }}
                      >
                        <Mail size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `tel:${contact.phone}`
                        }}
                      >
                        <Phone size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Deals Pipeline</CardTitle>
              <CardDescription>
                Current opportunities and revenue pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {account.deals.map(deal => (
                  <div 
                    key={deal.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                    onClick={() => toast.info(`Opening deal details for ${deal.name}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{deal.name}</h3>
                          <Badge variant="outline">{deal.stage}</Badge>
                          <span className="text-sm font-bold text-green-600">
                            ${deal.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Probability: {deal.probability}%</span>
                          <span>Close: {new Date(deal.close_date).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Probability</span>
                            <span className="text-xs font-medium">{deal.probability}%</span>
                          </div>
                          <Progress value={deal.probability} className="h-1" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Machine learning analysis and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {account.ai_insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={insight.type === 'opportunity' ? 'default' : insight.type === 'risk' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {insight.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {insight.confidence}% confidence
                          </span>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs">
                              <Lightbulb size={10} className="mr-1" />
                              Actionable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{insight.insight}</p>
                      </div>
                      {insight.actionable && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info('Creating action item from AI insight')}
                        >
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-bold text-green-600">
                      ${(account.total_revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Deal Size</span>
                    <span className="font-bold">
                      ${(account.total_revenue / account.total_deals).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Deals</span>
                    <span className="font-bold">{account.total_deals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quote-to-Close Ratio</span>
                    <span className="font-bold">
                      {((account.total_deals / account.total_quotes) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-bold text-blue-600">{account.engagement_score}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Support Tickets</span>
                    <span className="font-bold">{account.total_support_tickets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Contact</span>
                    <span className="font-bold">
                      {new Date(account.last_contact_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relationship Duration</span>
                    <span className="font-bold">
                      {Math.floor((Date.now() - new Date(account.created_date).getTime()) / (365 * 24 * 60 * 60 * 1000))} years
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Real-time Activity Feed
              </CardTitle>
              <CardDescription>
                Live updates and team collaboration on this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded border">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AccountPageView