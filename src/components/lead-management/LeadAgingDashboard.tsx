import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutomatedFollowUpReminders } from './AutomatedFollowUpReminders'
import { 
  Clock, 
  TrendDown, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Calendar,
  Target,
  Brain,
  Filter,
  Activity,
  Phone,
  Mail,
  Eye,
  ArrowRight,
  Bell,
  Zap
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, differenceInDays, isAfter, subDays } from 'date-fns'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  jobTitle?: string
  leadStatus: string
  leadRating: string
  aiLeadScore: number
  createdAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
  assignedTo?: string
}

interface AgingBucket {
  name: string
  minDays: number
  maxDays: number
  color: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

interface AgingMetrics {
  totalLeads: number
  avgAge: number
  avgDaysSinceContact: number
  overdueFollowUps: number
  staleLeads: number
  actionRequired: number
}

interface AIAgingInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity'
  title: string
  description: string
  affectedLeads: number
  priority: 'high' | 'medium' | 'low'
  actionSuggestion: string
}

interface LeadAgingDashboardProps {
  companyId: string
  userId: string
  userRole?: string
  assignedOnly?: boolean
  onLeadSelect?: (leadId: string) => void
}

export function LeadAgingDashboard({ companyId, userId, userRole = 'user', assignedOnly = false, onLeadSelect }: LeadAgingDashboardProps) {
  const [leads, setLeads] = useKV<Lead[]>(`company-leads-${companyId}`, [])
  const [activeTab, setActiveTab] = useState('aging')
  const [selectedBucket, setSelectedBucket] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Aging buckets configuration
  const agingBuckets: AgingBucket[] = [
    { name: 'Fresh', minDays: 0, maxDays: 7, color: 'bg-green-500', urgency: 'low' },
    { name: 'Active', minDays: 8, maxDays: 30, color: 'bg-blue-500', urgency: 'low' },
    { name: 'Aging', minDays: 31, maxDays: 60, color: 'bg-yellow-500', urgency: 'medium' },
    { name: 'Stale', minDays: 61, maxDays: 90, color: 'bg-orange-500', urgency: 'high' },
    { name: 'Cold', minDays: 91, maxDays: 999, color: 'bg-red-500', urgency: 'critical' }
  ]

  // Calculate lead age
  const getLeadAge = (lead: Lead) => {
    return differenceInDays(new Date(), new Date(lead.createdAt))
  }

  // Calculate days since last contact
  const getDaysSinceLastContact = (lead: Lead) => {
    if (!lead.lastContactDate) return getLeadAge(lead)
    return differenceInDays(new Date(), new Date(lead.lastContactDate))
  }

  // Check if follow-up is overdue
  const isFollowUpOverdue = (lead: Lead) => {
    if (!lead.nextFollowUpDate) return false
    return isAfter(new Date(), new Date(lead.nextFollowUpDate))
  }

  // Get aging bucket for a lead
  const getAgingBucket = (lead: Lead) => {
    const daysSinceContact = getDaysSinceLastContact(lead)
    return agingBuckets.find(bucket => 
      daysSinceContact >= bucket.minDays && daysSinceContact <= bucket.maxDays
    ) || agingBuckets[agingBuckets.length - 1]
  }

  // Filter leads based on criteria
  const getFilteredLeads = () => {
    let filtered = [...leads]

    if (assignedOnly) {
      filtered = filtered.filter(lead => lead.assignedTo === userId)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.leadStatus === filterStatus)
    }

    if (selectedBucket !== 'all') {
      filtered = filtered.filter(lead => {
        const bucket = getAgingBucket(lead)
        return bucket.name.toLowerCase() === selectedBucket
      })
    }

    return filtered
  }

  // Calculate metrics
  const calculateMetrics = (): AgingMetrics => {
    const filteredLeads = getFilteredLeads()
    
    const totalLeads = filteredLeads.length
    const avgAge = totalLeads > 0 
      ? filteredLeads.reduce((sum, lead) => sum + getLeadAge(lead), 0) / totalLeads
      : 0
    
    const avgDaysSinceContact = totalLeads > 0
      ? filteredLeads.reduce((sum, lead) => sum + getDaysSinceLastContact(lead), 0) / totalLeads
      : 0

    const overdueFollowUps = filteredLeads.filter(lead => isFollowUpOverdue(lead)).length
    const staleLeads = filteredLeads.filter(lead => getDaysSinceLastContact(lead) > 60).length
    const actionRequired = filteredLeads.filter(lead => 
      isFollowUpOverdue(lead) || getDaysSinceLastContact(lead) > 30
    ).length

    return {
      totalLeads,
      avgAge: Math.round(avgAge),
      avgDaysSinceContact: Math.round(avgDaysSinceContact),
      overdueFollowUps,
      staleLeads,
      actionRequired
    }
  }

  // Group leads by aging bucket
  const getLeadsByBucket = () => {
    const filtered = getFilteredLeads()
    const buckets = new Map()

    agingBuckets.forEach(bucket => {
      buckets.set(bucket.name, [])
    })

    filtered.forEach(lead => {
      const bucket = getAgingBucket(lead)
      const existing = buckets.get(bucket.name) || []
      buckets.set(bucket.name, [...existing, lead])
    })

    return buckets
  }

  // Generate AI insights
  const generateAIInsights = async (): Promise<AIAgingInsight[]> => {
    try {
      const metrics = calculateMetrics()
      const leadsByBucket = getLeadsByBucket()

      const prompt = spark.llmPrompt`
        Analyze this lead aging data and provide actionable insights:
        
        Metrics:
        - Total Leads: ${metrics.totalLeads}
        - Average Age: ${metrics.avgAge} days
        - Average Days Since Contact: ${metrics.avgDaysSinceContact} days
        - Overdue Follow-ups: ${metrics.overdueFollowUps}
        - Stale Leads: ${metrics.staleLeads}
        - Action Required: ${metrics.actionRequired}
        
        Lead Distribution:
        ${Array.from(leadsByBucket.entries()).map(([bucket, leads]) => 
          `- ${bucket}: ${(leads as Lead[]).length} leads`
        ).join('\n')}
        
        Generate 3-5 AI insights focusing on:
        - Lead aging patterns and risks
        - Recommended actions for different buckets
        - Opportunities to improve conversion
        - Process optimization suggestions
        
        Return as JSON with insights array containing:
        - type (recommendation, warning, opportunity)
        - title
        - description
        - affectedLeads (number)
        - priority (high, medium, low)
        - actionSuggestion
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      return result.insights || []
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return []
    }
  }

  // Load mock data if empty
  useEffect(() => {
    if (leads.length === 0) {
      const mockLeads: Lead[] = Array.from({ length: 50 }, (_, i) => {
        const createdDaysAgo = Math.floor(Math.random() * 120)
        const lastContactDaysAgo = Math.floor(Math.random() * createdDaysAgo)
        
        return {
          id: `lead-${i + 1}`,
          firstName: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'][Math.floor(Math.random() * 6)],
          lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis'][Math.floor(Math.random() * 6)],
          email: `lead${i + 1}@example.com`,
          phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          companyName: ['TechCorp', 'InnoSoft', 'DataSys', 'CloudTech', 'WebSolutions'][Math.floor(Math.random() * 5)],
          jobTitle: ['CEO', 'CTO', 'IT Director', 'Manager', 'Developer'][Math.floor(Math.random() * 5)],
          leadStatus: ['new', 'contacted', 'qualified', 'unqualified'][Math.floor(Math.random() * 4)],
          leadRating: ['hot', 'warm', 'cold'][Math.floor(Math.random() * 3)],
          aiLeadScore: Math.floor(Math.random() * 100),
          createdAt: subDays(new Date(), createdDaysAgo).toISOString(),
          lastContactDate: lastContactDaysAgo < createdDaysAgo ? subDays(new Date(), lastContactDaysAgo).toISOString() : undefined,
          nextFollowUpDate: Math.random() > 0.5 ? subDays(new Date(), Math.floor(Math.random() * 7) - 3).toISOString() : undefined,
          assignedTo: Math.random() > 0.3 ? userId : `user-${Math.floor(Math.random() * 5) + 1}`
        }
      })
      setLeads(mockLeads)
    }
  }, [])

  const metrics = calculateMetrics()
  const leadsByBucket = getLeadsByBucket()
  const filteredLeads = getFilteredLeads()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Lead Aging & Follow-up Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track lead aging patterns, automated follow-up reminders, and identify opportunities for immediate action
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  const insights = await generateAIInsights()
                  toast.success(`Generated ${insights.length} AI insights`)
                }}
              >
                <Brain size={16} className="mr-2" />
                AI Analysis
              </Button>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interface with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="aging" className="flex items-center gap-2">
              <Clock size={16} />
              Lead Aging
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell size={16} />
              Automated Reminders
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap size={16} />
              AI Insights
            </TabsTrigger>
          </TabsList>
          <Badge variant="outline">
            {metrics.totalLeads} Total Leads
          </Badge>
        </div>

        <TabsContent value="aging" className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold">{metrics.totalLeads}</p>
                  </div>
                  <Users size={20} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Age</p>
                    <p className="text-2xl font-bold">{metrics.avgAge}d</p>
                  </div>
                  <Calendar size={20} className="text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Contact Gap</p>
                    <p className="text-2xl font-bold">{metrics.avgDaysSinceContact}d</p>
                  </div>
                  <Activity size={20} className="text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={metrics.overdueFollowUps > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.overdueFollowUps}</p>
                  </div>
                  <AlertTriangle size={20} className="text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={metrics.staleLeads > 0 ? 'border-red-200 bg-red-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stale Leads</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.staleLeads}</p>
                  </div>
                  <TrendDown size={20} className="text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={metrics.actionRequired > 0 ? 'border-yellow-200 bg-yellow-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action Needed</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.actionRequired}</p>
                  </div>
                  <Target size={20} className="text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aging Buckets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} />
                Lead Distribution by Age
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {agingBuckets.map((bucket) => {
                  const bucketLeads = leadsByBucket.get(bucket.name) || []
                  const percentage = metrics.totalLeads > 0 ? (bucketLeads.length / metrics.totalLeads) * 100 : 0
                  
                  return (
                    <Card 
                      key={bucket.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedBucket === bucket.name.toLowerCase() ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedBucket(
                        selectedBucket === bucket.name.toLowerCase() ? 'all' : bucket.name.toLowerCase()
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{bucket.name}</h3>
                          <div className={`w-3 h-3 rounded-full ${bucket.color}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{bucketLeads.length}</span>
                            <Badge variant={
                              bucket.urgency === 'critical' ? 'destructive' :
                              bucket.urgency === 'high' ? 'destructive' :
                              bucket.urgency === 'medium' ? 'secondary' : 'outline'
                            }>
                              {bucket.urgency}
                            </Badge>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {bucket.minDays}-{bucket.maxDays === 999 ? '∞' : bucket.maxDays} days
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lead List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedBucket === 'all' ? 'All Leads' : `${selectedBucket.charAt(0).toUpperCase() + selectedBucket.slice(1)} Leads`}
                  <Badge variant="outline" className="ml-2">
                    {filteredLeads.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedBucket('all')}
                    disabled={selectedBucket === 'all'}
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLeads.length > 0 ? (
                    filteredLeads
                      .sort((a, b) => getDaysSinceLastContact(b) - getDaysSinceLastContact(a))
                      .map((lead) => {
                        const age = getLeadAge(lead)
                        const daysSinceContact = getDaysSinceLastContact(lead)
                        const bucket = getAgingBucket(lead)
                        const isOverdue = isFollowUpOverdue(lead)
                        
                        return (
                          <div 
                            key={lead.id} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              if (onLeadSelect) {
                                onLeadSelect(lead.id)
                              } else {
                                setSelectedLead(lead)
                                setShowDetails(true)
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${bucket.color}`} />
                              <div>
                                <h4 className="font-medium">
                                  {lead.firstName} {lead.lastName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {lead.companyName} • {lead.jobTitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <p className="font-medium">Age: {age}d</p>
                                <p className="text-muted-foreground">
                                  Contact: {daysSinceContact}d ago
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  lead.leadRating === 'hot' ? 'destructive' :
                                  lead.leadRating === 'warm' ? 'default' : 'secondary'
                                }>
                                  {lead.leadRating}
                                </Badge>

                                {isOverdue && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    Overdue
                                  </Badge>
                                )}

                                <Badge variant="outline">
                                  Score: {lead.aiLeadScore}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Phone size={14} />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Mail size={14} />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Eye size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No leads found matching the current filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <AutomatedFollowUpReminders 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI-Powered Lead Aging Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced analytics and recommendations for optimizing your lead follow-up strategy
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Performance Insights</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm text-green-600">Opportunity Identified</h4>
                      <p className="text-sm mt-1">
                        {metrics.staleLeads} leads haven't been contacted in over 60 days. 
                        Re-engaging these leads could increase conversion by 15-20%.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm text-orange-600">Action Required</h4>
                      <p className="text-sm mt-1">
                        {metrics.overdueFollowUps} follow-ups are overdue. 
                        Prompt action on these leads is critical to maintain momentum.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm text-blue-600">Optimization Tip</h4>
                      <p className="text-sm mt-1">
                        Consider implementing automated follow-up sequences for leads that remain 
                        uncontacted for more than 7 days.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Recommended Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('reminders')}>
                      <Bell size={16} className="mr-2" />
                      Set up automated follow-up reminders
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Target size={16} className="mr-2" />
                      Prioritize hot leads with contact gaps
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail size={16} className="mr-2" />
                      Launch re-engagement campaign for stale leads
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity size={16} className="mr-2" />
                      Review and update lead scoring criteria
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLead && `${selectedLead.firstName} ${selectedLead.lastName} - Aging Details`}
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Lead Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Company:</span> {selectedLead.companyName}</p>
                    <p><span className="font-medium">Title:</span> {selectedLead.jobTitle}</p>
                    <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedLead.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Aging Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Lead Age:</span> {getLeadAge(selectedLead)} days</p>
                    <p><span className="font-medium">Since Last Contact:</span> {getDaysSinceLastContact(selectedLead)} days</p>
                    <p><span className="font-medium">Created:</span> {format(new Date(selectedLead.createdAt), 'MMM dd, yyyy')}</p>
                    <p><span className="font-medium">AI Score:</span> {selectedLead.aiLeadScore}/100</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getAgingBucket(selectedLead).color}`} />
                  <span className="font-medium">{getAgingBucket(selectedLead).name} Bucket</span>
                  {isFollowUpOverdue(selectedLead) && (
                    <Badge variant="destructive">Follow-up Overdue</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                  <Button size="sm">
                    <ArrowRight size={16} className="mr-2" />
                    View Timeline
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}