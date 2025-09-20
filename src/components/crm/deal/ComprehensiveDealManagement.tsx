import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { VisualDealPipeline } from './VisualDealPipeline'
import { DealAIInsights } from './DealAIInsights'
import { DealConversionWorkflow } from './DealConversionWorkflow'
import { DealIntegrationHub } from './DealIntegrationHub'
import { DealAnalyticsDashboard } from './DealAnalyticsDashboard'
import { DealActivityTimeline } from './DealActivityTimeline'
import { DealCompetitorAnalysis } from './DealCompetitorAnalysis'
import { DealRiskAssessment } from './DealRiskAssessment'
import { DealProductConfigurator } from './DealProductConfigurator'
import { DealRevenueForecast } from './DealRevenueForecast'
import { toast } from 'sonner'
import { 
  TrendUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Target, 
  ChartBar,
  Robot, 
  Workflow, 
  LinkSimple, 
  ChartLine,
  Clock,
  WarningCircle,
  ShoppingCart,
  CurrencyDollar,
  Plus,
  Filter,
  Download,
  Upload,
  MagnifyingGlass,
  CaretDown,
  Eye,
  PencilSimple,
  TrashSimple,
  Copy,
  Share,
  Archive,
  Star,
  Flag,
  Bell,
  CheckCircle,
  XCircle,
  SealCheck
} from '@phosphor-icons/react'

interface Deal {
  id: string
  dealNumber: string
  title: string
  description: string
  accountId: string
  contactId: string
  ownerId: string
  value: number
  currency: string
  stage: string
  probability: number
  closeDate: string
  source: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'won' | 'lost' | 'on_hold'
  
  // AI Insights
  aiScore: number
  aiRecommendations: string[]
  winProbability: number
  riskFactors: string[]
  nextBestActions: string[]
  
  // Integration Data
  leadId?: string
  quoteIds: string[]
  salesOrderIds: string[]
  customFields: Record<string, any>
  tags: string[]
  
  // Tracking
  createdAt: string
  updatedAt: string
  lastActivityDate: string
  daysInStage: number
  stageHistory: DealStageHistory[]
  
  // Competition & Market
  competitors: string[]
  competitorAnalysis: Record<string, any>
  marketConditions: string
  
  // Revenue & Forecasting
  recurringRevenue: number
  oneTimeRevenue: number
  forecastCategory: 'pipeline' | 'best_case' | 'commit' | 'closed'
  revenueRecognitionDate: string
}

interface DealStageHistory {
  id: string
  stage: string
  changedAt: string
  changedBy: string
  duration: number
  notes?: string
}

interface DealPipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  isActive: boolean
  dealCount: number
  dealValue: number
  avgDaysInStage: number
  conversionRate: number
}

interface ComprehensiveDealManagementProps {
  companyId: string
  userId: string
  userRole: string
  onDealSelect?: (dealId: string) => void
}

export function ComprehensiveDealManagement({
  companyId,
  userId,
  userRole,
  onDealSelect
}: ComprehensiveDealManagementProps) {
  const [deals, setDeals] = useKV<Deal[]>(`crm-deals-${companyId}`, [])
  const [pipelineStages, setPipelineStages] = useKV<DealPipelineStage[]>(`deal-pipeline-stages-${companyId}`, [
    {
      id: 'lead',
      name: 'Lead',
      order: 1,
      probability: 10,
      color: '#E5E7EB',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 7,
      conversionRate: 25
    },
    {
      id: 'qualified',
      name: 'Qualified',
      order: 2,
      probability: 25,
      color: '#FEF3C7',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 14,
      conversionRate: 40
    },
    {
      id: 'proposal',
      name: 'Proposal',
      order: 3,
      probability: 50,
      color: '#DBEAFE',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 21,
      conversionRate: 60
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      order: 4,
      probability: 75,
      color: '#E0E7FF',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 10,
      conversionRate: 80
    },
    {
      id: 'closed_won',
      name: 'Closed Won',
      order: 5,
      probability: 100,
      color: '#D1FAE5',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 0,
      conversionRate: 100
    },
    {
      id: 'closed_lost',
      name: 'Closed Lost',
      order: 6,
      probability: 0,
      color: '#FEE2E2',
      isActive: true,
      dealCount: 0,
      dealValue: 0,
      avgDaysInStage: 0,
      conversionRate: 0
    }
  ])
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeView, setActiveView] = useState('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [filterOwner, setFilterOwner] = useState('all')
  const [sortBy, setSortBy] = useState('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Generate mock data on first load
  useEffect(() => {
    if (deals.length === 0) {
      generateMockDeals()
    }
  }, [])

  const generateMockDeals = () => {
    const mockDeals: Deal[] = Array.from({ length: 25 }, (_, i) => ({
      id: `deal-${Date.now()}-${i}`,
      dealNumber: `DEAL-2024-${String(i + 1).padStart(3, '0')}`,
      title: [
        'Enterprise Software License',
        'Cloud Migration Project',
        'Digital Transformation Initiative',
        'Customer Support Platform',
        'Marketing Automation Suite',
        'Data Analytics Solution',
        'Mobile App Development',
        'Security Infrastructure Upgrade',
        'ERP System Implementation',
        'AI Integration Project'
      ][i % 10],
      description: 'Comprehensive business solution with advanced features and integration capabilities.',
      accountId: `account-${i % 5 + 1}`,
      contactId: `contact-${i % 8 + 1}`,
      ownerId: userId,
      value: Math.floor(Math.random() * 500000) + 50000,
      currency: 'USD',
      stage: pipelineStages[Math.floor(Math.random() * 4)].id,
      probability: Math.floor(Math.random() * 100),
      closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media'][Math.floor(Math.random() * 5)],
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      status: 'active' as const,
      
      // AI Insights
      aiScore: Math.floor(Math.random() * 100),
      aiRecommendations: [
        'Schedule follow-up meeting',
        'Send technical documentation',
        'Introduce key stakeholder',
        'Provide pricing proposal'
      ],
      winProbability: Math.floor(Math.random() * 100),
      riskFactors: ['Budget constraints', 'Timeline pressure', 'Competitor presence'],
      nextBestActions: ['Call decision maker', 'Send proposal', 'Schedule demo'],
      
      // Integration Data
      quoteIds: [`quote-${i}-1`, `quote-${i}-2`],
      salesOrderIds: [],
      customFields: {
        industry: ['Technology', 'Healthcare', 'Finance', 'Manufacturing'][Math.floor(Math.random() * 4)],
        companySize: ['Small', 'Medium', 'Large', 'Enterprise'][Math.floor(Math.random() * 4)]
      },
      tags: ['hot-lead', 'qualified', 'enterprise'],
      
      // Tracking
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysInStage: Math.floor(Math.random() * 30),
      stageHistory: [],
      
      // Competition & Market
      competitors: ['Competitor A', 'Competitor B'],
      competitorAnalysis: {},
      marketConditions: 'Favorable',
      
      // Revenue & Forecasting
      recurringRevenue: Math.floor(Math.random() * 100000),
      oneTimeRevenue: Math.floor(Math.random() * 200000),
      forecastCategory: ['pipeline', 'best_case', 'commit'][Math.floor(Math.random() * 3)] as any,
      revenueRecognitionDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
    
    setDeals(mockDeals)
  }

  const filteredAndSortedDeals = () => {
    let filtered = deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.dealNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStage = filterStage === 'all' || deal.stage === filterStage
      const matchesOwner = filterOwner === 'all' || deal.ownerId === filterOwner
      
      return matchesSearch && matchesStage && matchesOwner
    })
    
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Deal]
      let bValue: any = b[sortBy as keyof Deal]
      
      if (sortBy === 'value') {
        aValue = a.value
        bValue = b.value
      } else if (sortBy === 'closeDate') {
        aValue = new Date(a.closeDate).getTime()
        bValue = new Date(b.closeDate).getTime()
      } else if (sortBy === 'probability') {
        aValue = a.probability
        bValue = b.probability
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filtered
  }

  const handleCreateDeal = () => {
    setShowCreateDialog(true)
  }

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
    onDealSelect?.(deal.id)
  }

  const getDealStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getTotalPipelineValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getWinRate = () => {
    const wonDeals = deals.filter(deal => deal.status === 'won').length
    const closedDeals = deals.filter(deal => deal.status === 'won' || deal.status === 'lost').length
    return closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">${getTotalPipelineValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{getWinRate()}%</p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  ${deals.length > 0 ? Math.round(getTotalPipelineValue() / deals.length).toLocaleString() : '0'}
                </p>
              </div>
              <ChartBar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Target size={16} />
              Visual Pipeline
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users size={16} />
              Deal List
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Robot size={16} />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <ChartLine size={16} />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="conversion" className="flex items-center gap-2">
              <Workflow size={16} />
              Conversion
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <LinkSimple size={16} />
              Integrations
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button onClick={handleCreateDeal} className="flex items-center gap-2">
              <Plus size={16} />
              Create Deal
            </Button>
          </div>
        </div>

        <TabsContent value="pipeline" className="space-y-6">
          <VisualDealPipeline
            deals={deals}
            stages={pipelineStages}
            onDealClick={handleDealClick}
            onStageUpdate={(dealId, newStage) => {
              setDeals(currentDeals => 
                currentDeals.map(deal => 
                  deal.id === dealId 
                    ? { ...deal, stage: newStage, updatedAt: new Date().toISOString() }
                    : deal
                )
              )
              toast.success('Deal stage updated successfully')
            }}
            onDealUpdate={(updatedDeal) => {
              setDeals(currentDeals => 
                currentDeals.map(deal => 
                  deal.id === updatedDeal.id ? updatedDeal : deal
                )
              )
            }}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {pipelineStages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    <SelectItem value={userId}>My Deals</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Deal Value</SelectItem>
                    <SelectItem value="closeDate">Close Date</SelectItem>
                    <SelectItem value="probability">Probability</SelectItem>
                    <SelectItem value="title">Deal Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Deals List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedDeals().map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleDealClick(deal)}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{deal.title}</h3>
                        <p className="text-sm text-muted-foreground">{deal.dealNumber}</p>
                      </div>
                      <Badge className={getDealStatusColor(deal.status)}>
                        {deal.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="font-semibold">${deal.value.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stage:</span>
                        <Badge variant="outline">
                          {pipelineStages.find(s => s.id === deal.stage)?.name || deal.stage}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Probability:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={deal.probability} className="w-16 h-2" />
                          <span className="text-sm font-medium">{deal.probability}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Close Date:</span>
                        <span className="text-sm">{new Date(deal.closeDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Priority:</span>
                        <Flag className={`h-4 w-4 ${getPriorityColor(deal.priority)}`} />
                      </div>
                    </div>

                    {/* AI Insights Preview */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Robot className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">AI Score: {deal.aiScore}/100</span>
                      </div>
                      <div className="space-y-1">
                        {deal.aiRecommendations.slice(0, 2).map((rec, index) => (
                          <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <PencilSimple size={14} />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        {deal.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <DealAIInsights 
            deals={deals}
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DealAnalyticsDashboard 
            deals={deals}
            stages={pipelineStages}
            companyId={companyId}
          />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <DealConversionWorkflow 
            deals={deals}
            companyId={companyId}
            userId={userId}
            onConversion={(dealId, conversionType) => {
              toast.success(`Deal ${dealId} converted to ${conversionType}`)
            }}
          />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <DealIntegrationHub 
            deals={deals}
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>
      </Tabs>

      {/* Deal Details Dialog */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedDeal.title}
                <Badge className={getDealStatusColor(selectedDeal.status)}>
                  {selectedDeal.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="competition">Competition</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Deal Number</Label>
                      <p className="text-sm font-medium">{selectedDeal.dealNumber}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm">{selectedDeal.description}</p>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <p className="text-lg font-bold">${selectedDeal.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Close Date</Label>
                      <p className="text-sm">{new Date(selectedDeal.closeDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Probability</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedDeal.probability} className="flex-1" />
                        <span className="text-sm font-medium">{selectedDeal.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <Label>Source</Label>
                      <p className="text-sm">{selectedDeal.source}</p>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <div className="flex items-center gap-2">
                        <Flag className={`h-4 w-4 ${getPriorityColor(selectedDeal.priority)}`} />
                        <span className="text-sm capitalize">{selectedDeal.priority}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Days in Stage</Label>
                      <p className="text-sm">{selectedDeal.daysInStage} days</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <DealActivityTimeline dealId={selectedDeal.id} />
              </TabsContent>

              <TabsContent value="ai-insights">
                <DealAIInsights 
                  deals={[selectedDeal]}
                  companyId={companyId}
                  userId={userId}
                  focusDeal={selectedDeal.id}
                />
              </TabsContent>

              <TabsContent value="products">
                <DealProductConfigurator 
                  dealId={selectedDeal.id}
                  dealValue={selectedDeal.value}
                />
              </TabsContent>

              <TabsContent value="competition">
                <DealCompetitorAnalysis 
                  dealId={selectedDeal.id}
                  competitors={selectedDeal.competitors}
                  analysis={selectedDeal.competitorAnalysis}
                />
              </TabsContent>

              <TabsContent value="risk">
                <DealRiskAssessment 
                  deal={selectedDeal}
                  riskFactors={selectedDeal.riskFactors}
                />
              </TabsContent>

              <TabsContent value="forecast">
                <DealRevenueForecast 
                  deal={selectedDeal}
                  recurringRevenue={selectedDeal.recurringRevenue}
                  oneTimeRevenue={selectedDeal.oneTimeRevenue}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}