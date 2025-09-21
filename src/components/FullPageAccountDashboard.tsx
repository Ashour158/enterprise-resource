import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowUp, ArrowDown, TrendUp, TrendDown, Users, DollarSign, 
  Calendar, Mail, Phone, MapPin, Globe, Building, Star,
  AlertTriangle, CheckCircle, Clock, MessageCircle, FileText,
  Target, Brain, Network, Activity, CreditCard, ShoppingBag,
  UserCheck, UserX, Bell, Bookmark, Plus, Send, Filter
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AccountDashboardProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
  onClose?: () => void
}

interface AccountHealth {
  overall: number
  engagement: number
  financial: number
  satisfaction: number
  retention: number
  expansion: number
}

interface RelationshipNode {
  id: string
  name: string
  role: string
  department: string
  influenceLevel: number
  relationshipStrength: number
  lastContact: string
  email: string
  phone: string
  decisionMaker: boolean
  champion: boolean
}

interface ActivityItem {
  id: string
  type: 'email' | 'call' | 'meeting' | 'quote' | 'deal' | 'support' | 'payment' | 'document'
  title: string
  description: string
  timestamp: string
  participant: string
  outcome?: string
  value?: number
  importance: number
  aiInsights?: string[]
}

interface FinancialMetrics {
  totalRevenue: number
  monthlyRecurring: number
  averageOrderValue: number
  paymentTiming: number
  profitMargin: number
  contractValue: number
  expansionRevenue: number
  churnRisk: number
}

interface ExpansionOpportunity {
  id: string
  type: 'upsell' | 'cross-sell' | 'renewal'
  product: string
  confidence: number
  estimatedValue: number
  timeframe: string
  reasoning: string
  nextAction: string
}

interface RiskFactor {
  id: string
  category: 'engagement' | 'financial' | 'satisfaction' | 'competitive'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: number
  mitigation: string
  assignee?: string
}

interface TeamNote {
  id: string
  author: string
  content: string
  timestamp: string
  type: 'note' | 'task' | 'alert'
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  completed?: boolean
}

export function FullPageAccountDashboard({ 
  accountId, 
  companyId, 
  userId, 
  userRole,
  onClose 
}: AccountDashboardProps) {
  const [accountData, setAccountData] = useKV(`account-${accountId}`, {
    id: accountId,
    name: 'TechCorp Solutions',
    industry: 'Technology',
    size: '500-1000',
    website: 'techcorp.com',
    address: '123 Tech Street, San Francisco, CA',
    phone: '+1 (555) 123-4567',
    email: 'contact@techcorp.com',
    accountManager: 'Sarah Johnson',
    contractStart: '2023-01-15',
    contractEnd: '2024-01-15',
    status: 'active'
  })

  const [healthScore, setHealthScore] = useKV(`account-health-${accountId}`, {
    overall: 78,
    engagement: 82,
    financial: 88,
    satisfaction: 75,
    retention: 85,
    expansion: 70
  } as AccountHealth)

  const [relationships, setRelationships] = useKV(`account-relationships-${accountId}`, [
    {
      id: 'rel-001',
      name: 'John Smith',
      role: 'CTO',
      department: 'Technology',
      influenceLevel: 95,
      relationshipStrength: 85,
      lastContact: '2024-01-10',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4568',
      decisionMaker: true,
      champion: true
    },
    {
      id: 'rel-002',
      name: 'Maria Garcia',
      role: 'VP of Operations',
      department: 'Operations',
      influenceLevel: 80,
      relationshipStrength: 72,
      lastContact: '2024-01-08',
      email: 'maria.garcia@techcorp.com',
      phone: '+1 (555) 123-4569',
      decisionMaker: true,
      champion: false
    },
    {
      id: 'rel-003',
      name: 'David Chen',
      role: 'Software Engineer',
      department: 'Technology',
      influenceLevel: 45,
      relationshipStrength: 90,
      lastContact: '2024-01-12',
      email: 'david.chen@techcorp.com',
      phone: '+1 (555) 123-4570',
      decisionMaker: false,
      champion: true
    }
  ] as RelationshipNode[])

  const [activities, setActivities] = useKV(`account-activities-${accountId}`, [
    {
      id: 'act-001',
      type: 'meeting',
      title: 'Quarterly Business Review',
      description: 'Discussed expansion plans and reviewed performance metrics',
      timestamp: '2024-01-12T10:00:00Z',
      participant: 'John Smith',
      outcome: 'positive',
      importance: 95,
      aiInsights: ['Strong interest in new features', 'Budget approved for Q2']
    },
    {
      id: 'act-002',
      type: 'email',
      title: 'Product Update Announcement',
      description: 'Sent information about new AI features',
      timestamp: '2024-01-11T14:30:00Z',
      participant: 'Maria Garcia',
      importance: 60,
      aiInsights: ['High engagement with email content']
    },
    {
      id: 'act-003',
      type: 'quote',
      title: 'Enterprise Package Upgrade',
      description: 'Quote for additional licenses and premium features',
      timestamp: '2024-01-10T16:45:00Z',
      participant: 'John Smith',
      value: 25000,
      importance: 90,
      aiInsights: ['Price sensitivity detected', 'Decision timeline: 2 weeks']
    }
  ] as ActivityItem[])

  const [financialData, setFinancialData] = useKV(`account-financial-${accountId}`, {
    totalRevenue: 150000,
    monthlyRecurring: 12500,
    averageOrderValue: 8500,
    paymentTiming: 92, // percentage on-time
    profitMargin: 45,
    contractValue: 150000,
    expansionRevenue: 35000,
    churnRisk: 15
  } as FinancialMetrics)

  const [opportunities, setOpportunities] = useKV(`account-opportunities-${accountId}`, [
    {
      id: 'opp-001',
      type: 'upsell',
      product: 'Enterprise AI Features',
      confidence: 85,
      estimatedValue: 25000,
      timeframe: '2-4 weeks',
      reasoning: 'Strong interest shown in QBR, budget confirmed',
      nextAction: 'Schedule technical demo with David Chen'
    },
    {
      id: 'opp-002',
      type: 'cross-sell',
      product: 'Analytics Platform',
      confidence: 65,
      estimatedValue: 15000,
      timeframe: '1-2 months',
      reasoning: 'Operations team expressing data visibility needs',
      nextAction: 'Present analytics case study to Maria Garcia'
    }
  ] as ExpansionOpportunity[])

  const [risks, setRisks] = useKV(`account-risks-${accountId}`, [
    {
      id: 'risk-001',
      category: 'competitive',
      severity: 'medium',
      description: 'Competitor approaching with aggressive pricing',
      impact: 70,
      mitigation: 'Schedule value demonstration meeting',
      assignee: 'Sarah Johnson'
    },
    {
      id: 'risk-002',
      category: 'satisfaction',
      severity: 'low',
      description: 'Recent support ticket resolution time exceeded SLA',
      impact: 30,
      mitigation: 'Follow up on support experience and process improvements'
    }
  ] as RiskFactor[])

  const [teamNotes, setTeamNotes] = useKV(`account-notes-${accountId}`, [
    {
      id: 'note-001',
      author: 'Sarah Johnson',
      content: 'John mentioned they are evaluating additional AI tools. Great opportunity for our new features.',
      timestamp: '2024-01-12T15:30:00Z',
      type: 'note'
    },
    {
      id: 'task-001',
      author: 'Mike Wilson',
      content: 'Follow up on technical demo feedback and address integration questions',
      timestamp: '2024-01-11T09:00:00Z',
      type: 'task',
      priority: 'high',
      assignee: 'David Chen',
      completed: false
    }
  ] as TeamNote[])

  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // AI-powered insights
  const generateAIInsights = async () => {
    try {
      const prompt = spark.llmPrompt`
        Analyze this customer account data and provide strategic insights:
        
        Account: ${accountData.name}
        Health Score: ${healthScore.overall}/100
        Recent Activities: ${activities.slice(0, 3).map(a => a.title).join(', ')}
        Financial Performance: $${financialData.totalRevenue} total revenue
        Key Relationships: ${relationships.filter(r => r.decisionMaker).map(r => r.name).join(', ')}
        
        Provide 3 key strategic recommendations for account growth and retention.
      `
      
      const insights = await spark.llm(prompt)
      toast.success('AI insights generated successfully')
      return insights
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights')
    }
  }

  const addTeamNote = () => {
    if (!newNote.trim()) return
    
    const note: TeamNote = {
      id: `note-${Date.now()}`,
      author: 'Current User', // Would be actual user name
      content: newNote,
      timestamp: new Date().toISOString(),
      type: 'note'
    }
    
    setTeamNotes([note, ...teamNotes])
    setNewNote('')
    toast.success('Note added successfully')
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const filteredActivities = activities.filter(activity => 
    filterType === 'all' || activity.type === filterType
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{accountData.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building size={16} />
                  {accountData.industry}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {accountData.size} employees
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={16} />
                  {accountData.website}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getHealthBadgeColor(healthScore.overall)}>
              Health Score: {healthScore.overall}%
            </Badge>
            <Badge variant="outline">
              {accountData.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <Button onClick={generateAIInsights}>
              <Brain size={16} className="mr-2" />
              AI Insights
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="collaboration">Team</TabsTrigger>
          </TabsList>

          {/* Executive Summary */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                  <CardDescription>
                    Key performance indicators and account health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(financialData.totalRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getHealthColor(healthScore.overall)}`}>
                        {healthScore.overall}%
                      </div>
                      <div className="text-sm text-muted-foreground">Health Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {relationships.filter(r => r.decisionMaker).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Key Contacts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {opportunities.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Opportunities</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Health Score Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Health Score Breakdown</h4>
                    {Object.entries(healthScore).filter(([key]) => key !== 'overall').map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={value} className="h-2" />
                          <span className={`text-sm font-medium ${getHealthColor(value)}`}>
                            {value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                            {activity.type === 'email' && <Mail size={14} />}
                            {activity.type === 'call' && <Phone size={14} />}
                            {activity.type === 'meeting' && <Calendar size={14} />}
                            {activity.type === 'quote' && <FileText size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()} • {activity.participant}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Mail size={20} />
                    Send Email
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Calendar size={20} />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText size={20} />
                    Create Quote
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <MessageCircle size={20} />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relationship Map */}
          <TabsContent value="relationships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Relationship Map</CardTitle>
                <CardDescription>
                  Interactive visualization of key contacts and their influence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Relationship Network Visualization */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Relationship Network</h4>
                    <div className="relative h-64 bg-muted/20 rounded-lg p-4">
                      {/* SVG Network Visualization */}
                      <svg className="w-full h-full">
                        {/* Central Account Node */}
                        <circle cx="50%" cy="50%" r="30" fill="hsl(var(--primary))" opacity="0.8" />
                        <text x="50%" y="50%" textAnchor="middle" dy="5" className="text-xs font-medium fill-white">
                          {accountData.name}
                        </text>
                        
                        {/* Relationship Nodes */}
                        {relationships.map((rel, index) => {
                          const angle = (index * 2 * Math.PI) / relationships.length
                          const radius = 80
                          const x = 50 + radius * Math.cos(angle)
                          const y = 50 + radius * Math.sin(angle)
                          
                          return (
                            <g key={rel.id}>
                              {/* Connection Line */}
                              <line 
                                x1="50%" 
                                y1="50%" 
                                x2={`${x}%`} 
                                y2={`${y}%`} 
                                stroke="hsl(var(--border))" 
                                strokeWidth={rel.relationshipStrength / 20}
                                opacity="0.6"
                              />
                              {/* Contact Node */}
                              <circle 
                                cx={`${x}%`} 
                                cy={`${y}%`} 
                                r={rel.influenceLevel / 5} 
                                fill={rel.decisionMaker ? "hsl(var(--accent))" : "hsl(var(--secondary))"}
                                opacity="0.8"
                              />
                              {rel.champion && (
                                <circle 
                                  cx={`${x}%`} 
                                  cy={`${y}%`} 
                                  r={rel.influenceLevel / 5 + 3} 
                                  fill="none"
                                  stroke="hsl(var(--accent))"
                                  strokeWidth="2"
                                />
                              )}
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        Decision Maker
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        Influencer
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full border-2 border-accent bg-transparent" />
                        Champion
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Key Contacts</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {relationships.map((contact) => (
                          <Card key={contact.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium">{contact.name}</h5>
                                  {contact.decisionMaker && (
                                    <Badge variant="secondary" className="text-xs">
                                      Decision Maker
                                    </Badge>
                                  )}
                                  {contact.champion && (
                                    <Badge variant="outline" className="text-xs">
                                      Champion
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {contact.role} • {contact.department}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Mail size={12} />
                                    {contact.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {contact.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs">Influence:</span>
                                    <Progress value={contact.influenceLevel} className="w-16 h-1" />
                                    <span className="text-xs">{contact.influenceLevel}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs">Relationship:</span>
                                    <Progress value={contact.relationshipStrength} className="w-16 h-1" />
                                    <span className="text-xs">{contact.relationshipStrength}%</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MessageCircle size={16} />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Stream */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activity Timeline</CardTitle>
                    <CardDescription>
                      Complete history of customer interactions and touchpoints
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value="all">All Activities</option>
                      <option value="email">Emails</option>
                      <option value="call">Calls</option>
                      <option value="meeting">Meetings</option>
                      <option value="quote">Quotes</option>
                      <option value="deal">Deals</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'email' && <Mail size={16} />}
                          {activity.type === 'call' && <Phone size={16} />}
                          {activity.type === 'meeting' && <Calendar size={16} />}
                          {activity.type === 'quote' && <FileText size={16} />}
                          {activity.type === 'deal' && <DollarSign size={16} />}
                          {activity.type === 'support' && <AlertTriangle size={16} />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.title}</h4>
                            <div className="flex items-center gap-2">
                              {activity.value && (
                                <Badge variant="outline">${activity.value.toLocaleString()}</Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {activity.importance}% important
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>{activity.participant}</span>
                            {activity.outcome && (
                              <>
                                <span>•</span>
                                <Badge variant={activity.outcome === 'positive' ? 'default' : 'secondary'} className="text-xs">
                                  {activity.outcome}
                                </Badge>
                              </>
                            )}
                          </div>
                          {activity.aiInsights && activity.aiInsights.length > 0 && (
                            <div className="mt-2 p-2 bg-accent/10 rounded">
                              <div className="flex items-center gap-1 mb-1">
                                <Brain size={12} />
                                <span className="text-xs font-medium">AI Insights</span>
                              </div>
                              <ul className="text-xs space-y-1">
                                {activity.aiInsights.map((insight, i) => (
                                  <li key={i} className="text-muted-foreground">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Overview */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Financial performance and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(financialData.totalRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${(financialData.monthlyRecurring / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Recurring</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${(financialData.averageOrderValue / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {financialData.profitMargin}%
                      </div>
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Timeliness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={financialData.paymentTiming} className="w-24 h-2" />
                        <span className="text-sm">{financialData.paymentTiming}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Contract Utilization</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-24 h-2" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expansion Revenue</span>
                      <span className="text-sm font-semibold text-green-600">
                        +${(financialData.expansionRevenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Recent transactions and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {[
                        { date: '2024-01-01', amount: 12500, status: 'paid', description: 'Monthly Subscription' },
                        { date: '2023-12-01', amount: 12500, status: 'paid', description: 'Monthly Subscription' },
                        { date: '2023-11-15', amount: 25000, status: 'paid', description: 'One-time Setup' },
                        { date: '2023-11-01', amount: 12500, status: 'paid', description: 'Monthly Subscription' }
                      ].map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">${payment.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{payment.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Success Metrics */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Health Metrics</CardTitle>
                  <CardDescription>Comprehensive health and satisfaction tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(healthScore).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className={`font-bold ${getHealthColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                      <Progress value={value} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        {key === 'overall' && 'Composite score across all metrics'}
                        {key === 'engagement' && 'Email opens, logins, feature usage'}
                        {key === 'financial' && 'Payment history, contract value'}
                        {key === 'satisfaction' && 'Support ratings, NPS scores'}
                        {key === 'retention' && 'Renewal probability, usage trends'}
                        {key === 'expansion' && 'Upsell potential, growth indicators'}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Trends</CardTitle>
                  <CardDescription>Historical satisfaction and engagement data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Satisfaction Trend Chart</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">8.2</div>
                        <div className="text-sm text-muted-foreground">NPS Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">94%</div>
                        <div className="text-sm text-muted-foreground">CSAT</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">2.1</div>
                        <div className="text-sm text-muted-foreground">Avg Support Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">12min</div>
                        <div className="text-sm text-muted-foreground">Avg Response Time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expansion Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>
                  AI-identified upsell, cross-sell, and expansion opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{opportunity.product}</h4>
                            <Badge variant={opportunity.type === 'upsell' ? 'default' : 'secondary'}>
                              {opportunity.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {opportunity.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{opportunity.reasoning}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              ${opportunity.estimatedValue.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {opportunity.timeframe}
                            </span>
                          </div>
                          <Alert>
                            <Target size={16} />
                            <AlertDescription className="text-xs">
                              <strong>Next Action:</strong> {opportunity.nextAction}
                            </AlertDescription>
                          </Alert>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm">
                            Take Action
                          </Button>
                          <Button variant="outline" size="sm">
                            More Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment */}
          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Potential risks and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risks.map((risk) => (
                    <Alert key={risk.id} className="p-4">
                      <AlertTriangle size={16} />
                      <div className="flex items-start justify-between w-full">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertDescription className="font-medium">
                              {risk.description}
                            </AlertDescription>
                            <Badge className={getRiskSeverityColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Impact:</span>
                            <Progress value={risk.impact} className="w-24 h-2" />
                            <span className="text-xs">{risk.impact}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                          {risk.assignee && (
                            <p className="text-xs text-muted-foreground">
                              Assigned to: {risk.assignee}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Address Risk
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Collaboration */}
          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Notes & Tasks</CardTitle>
                  <CardDescription>Collaborative workspace for account team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note or task..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTeamNote()}
                    />
                    <Button onClick={addTeamNote}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {teamNotes.map((note) => (
                        <Card key={note.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{note.author}</span>
                                <Badge variant={note.type === 'task' ? 'default' : 'secondary'} className="text-xs">
                                  {note.type}
                                </Badge>
                                {note.priority && (
                                  <Badge variant="outline" className="text-xs">
                                    {note.priority} priority
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">{note.content}</p>
                              {note.assignee && (
                                <p className="text-xs text-muted-foreground">
                                  Assigned to: {note.assignee}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(note.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {note.type === 'task' && (
                              <Button variant="ghost" size="sm">
                                {note.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Team</CardTitle>
                  <CardDescription>Team members working on this account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Sarah Johnson', role: 'Account Manager', online: true },
                      { name: 'Mike Wilson', role: 'Sales Engineer', online: true },
                      { name: 'Lisa Chen', role: 'Customer Success', online: false },
                      { name: 'John Davis', role: 'Support Specialist', online: true }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <Button variant="ghost" size="sm">
                            <MessageCircle size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}