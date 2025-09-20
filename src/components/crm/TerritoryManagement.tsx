import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  MapPin, 
  Users, 
  TrendUp, 
  Target, 
  DollarSign, 
  Calendar,
  Settings,
  Plus,
  Edit,
  Eye,
  UserCheck,
  Globe,
  ChartLine,
  BarChart,
  Navigation,
  Calculator,
  Award,
  Clock,
  Percent,
  Building,
  Route,
  Shuffle
} from '@phosphor-icons/react'

interface Territory {
  id: string
  name: string
  description: string
  type: 'geographic' | 'vertical' | 'account_based' | 'product_line'
  manager_id: string
  manager_name: string
  
  // Geographic boundaries
  countries: string[]
  states: string[]
  cities: string[]
  zip_codes: string[]
  latitude_bounds?: { north: number; south: number }
  longitude_bounds?: { east: number; west: number }
  
  // Account/Industry criteria
  industries: string[]
  company_sizes: string[]
  annual_revenue_range?: { min: number; max: number }
  
  // Performance metrics
  quota: number
  achieved: number
  quota_period: 'monthly' | 'quarterly' | 'yearly'
  target_deals: number
  active_deals: number
  conversion_rate: number
  average_deal_size: number
  
  // AI optimization
  ai_performance_score: number
  ai_optimization_suggestions: string[]
  ai_territory_health: 'excellent' | 'good' | 'fair' | 'poor'
  ai_workload_balance: number // 0-100 scale
  
  // Team assignment
  sales_reps: SalesRep[]
  support_staff: string[]
  
  // Automation rules
  auto_assignment_rules: AssignmentRule[]
  escalation_rules: EscalationRule[]
  
  created_at: string
  updated_at: string
  is_active: boolean
}

interface SalesRep {
  id: string
  name: string
  email: string
  role: 'senior' | 'junior' | 'specialist'
  quota: number
  achieved: number
  performance_rating: number
  territories: string[]
  specializations: string[]
  workload_capacity: number
  current_workload: number
}

interface AssignmentRule {
  id: string
  name: string
  priority: number
  conditions: any[]
  actions: any[]
  is_active: boolean
}

interface EscalationRule {
  id: string
  name: string
  trigger_conditions: any[]
  escalation_actions: any[]
  timeout_hours: number
  is_active: boolean
}

interface Deal {
  id: string
  name: string
  account_name: string
  value: number
  stage: string
  territory_id: string
  assigned_rep_id: string
  location: {
    country: string
    state: string
    city: string
    zip_code: string
    latitude?: number
    longitude?: number
  }
  industry: string
  company_size: string
  probability: number
  expected_close_date: string
  created_at: string
}

interface Props {
  companyId: string
  userId: string
  userRole: string
}

export function TerritoryManagement({ companyId, userId, userRole }: Props) {
  const [territories, setTerritories] = useKV<Territory[]>(`territories-${companyId}`, [])
  const [salesReps, setSalesReps] = useKV<SalesRep[]>(`sales-reps-${companyId}`, [])
  const [deals, setDeals] = useKV<Deal[]>(`territory-deals-${companyId}`, [])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Initialize mock data
  useEffect(() => {
    if (territories.length === 0) {
      initializeMockData()
    }
  }, [])

  const initializeMockData = () => {
    const mockSalesReps: SalesRep[] = [
      {
        id: 'rep-001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'senior',
        quota: 500000,
        achieved: 420000,
        performance_rating: 92,
        territories: ['territory-001', 'territory-002'],
        specializations: ['enterprise', 'technology'],
        workload_capacity: 100,
        current_workload: 85
      },
      {
        id: 'rep-002',
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        role: 'junior',
        quota: 300000,
        achieved: 195000,
        performance_rating: 78,
        territories: ['territory-003'],
        specializations: ['smb', 'healthcare'],
        workload_capacity: 80,
        current_workload: 65
      },
      {
        id: 'rep-003',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        role: 'specialist',
        quota: 400000,
        achieved: 380000,
        performance_rating: 95,
        territories: ['territory-004'],
        specializations: ['manufacturing', 'logistics'],
        workload_capacity: 90,
        current_workload: 88
      }
    ]

    const mockTerritories: Territory[] = [
      {
        id: 'territory-001',
        name: 'North East Enterprise',
        description: 'Enterprise accounts in northeastern United States',
        type: 'geographic',
        manager_id: 'rep-001',
        manager_name: 'Sarah Johnson',
        countries: ['United States'],
        states: ['New York', 'Massachusetts', 'Connecticut', 'New Jersey'],
        cities: ['New York City', 'Boston', 'Hartford', 'Newark'],
        zip_codes: ['10001-10299', '02101-02299', '06101-06199'],
        industries: ['Technology', 'Financial Services', 'Healthcare'],
        company_sizes: ['Enterprise (1000+ employees)'],
        annual_revenue_range: { min: 100000000, max: 10000000000 },
        quota: 2000000,
        achieved: 1650000,
        quota_period: 'quarterly',
        target_deals: 50,
        active_deals: 42,
        conversion_rate: 28.5,
        average_deal_size: 85000,
        ai_performance_score: 87,
        ai_optimization_suggestions: [
          'Focus on technology sector - 34% higher conversion rate',
          'Increase activity in Boston area - underperforming by 15%',
          'Consider territory expansion to Maine and Vermont'
        ],
        ai_territory_health: 'good',
        ai_workload_balance: 85,
        sales_reps: [mockSalesReps[0]],
        support_staff: ['support-001', 'support-002'],
        auto_assignment_rules: [],
        escalation_rules: [],
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-03-15T14:30:00Z',
        is_active: true
      },
      {
        id: 'territory-002',
        name: 'West Coast SMB',
        description: 'Small to medium business accounts on west coast',
        type: 'geographic',
        manager_id: 'rep-002',
        manager_name: 'Michael Chen',
        countries: ['United States'],
        states: ['California', 'Oregon', 'Washington'],
        cities: ['San Francisco', 'Los Angeles', 'Seattle', 'Portland'],
        zip_codes: ['90001-90299', '94101-94199', '98101-98199'],
        industries: ['Technology', 'Retail', 'Manufacturing'],
        company_sizes: ['Small (10-50 employees)', 'Medium (51-500 employees)'],
        annual_revenue_range: { min: 1000000, max: 50000000 },
        quota: 1200000,
        achieved: 890000,
        quota_period: 'quarterly',
        target_deals: 80,
        active_deals: 65,
        conversion_rate: 22.3,
        average_deal_size: 35000,
        ai_performance_score: 72,
        ai_optimization_suggestions: [
          'Increase focus on Seattle market - growing tech sector',
          'Partner with local resellers in Oregon',
          'Implement automated nurturing for sub-$10k deals'
        ],
        ai_territory_health: 'fair',
        ai_workload_balance: 78,
        sales_reps: [mockSalesReps[1]],
        support_staff: ['support-003'],
        auto_assignment_rules: [],
        escalation_rules: [],
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-03-10T16:45:00Z',
        is_active: true
      },
      {
        id: 'territory-003',
        name: 'Manufacturing Vertical',
        description: 'Manufacturing and industrial companies nationwide',
        type: 'vertical',
        manager_id: 'rep-003',
        manager_name: 'Emily Rodriguez',
        countries: ['United States', 'Canada'],
        states: [],
        cities: [],
        zip_codes: [],
        industries: ['Manufacturing', 'Industrial', 'Automotive', 'Aerospace'],
        company_sizes: ['Medium (51-500 employees)', 'Enterprise (1000+ employees)'],
        annual_revenue_range: { min: 25000000, max: 5000000000 },
        quota: 1800000,
        achieved: 1520000,
        quota_period: 'quarterly',
        target_deals: 35,
        active_deals: 28,
        conversion_rate: 31.8,
        average_deal_size: 125000,
        ai_performance_score: 91,
        ai_optimization_suggestions: [
          'Expand into aerospace vertical - high deal values',
          'Leverage success stories from automotive sector',
          'Consider specialized pricing for manufacturing ERP'
        ],
        ai_territory_health: 'excellent',
        ai_workload_balance: 92,
        sales_reps: [mockSalesReps[2]],
        support_staff: ['support-004', 'support-005'],
        auto_assignment_rules: [],
        escalation_rules: [],
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-03-12T11:20:00Z',
        is_active: true
      }
    ]

    const mockDeals: Deal[] = [
      {
        id: 'deal-001',
        name: 'TechCorp ERP Implementation',
        account_name: 'TechCorp Industries',
        value: 150000,
        stage: 'Proposal',
        territory_id: 'territory-001',
        assigned_rep_id: 'rep-001',
        location: {
          country: 'United States',
          state: 'New York',
          city: 'New York City',
          zip_code: '10001',
          latitude: 40.7128,
          longitude: -74.0060
        },
        industry: 'Technology',
        company_size: 'Enterprise (1000+ employees)',
        probability: 75,
        expected_close_date: '2024-04-15',
        created_at: '2024-03-01T09:00:00Z'
      },
      {
        id: 'deal-002',
        name: 'StartupCo CRM Setup',
        account_name: 'StartupCo',
        value: 25000,
        stage: 'Negotiation',
        territory_id: 'territory-002',
        assigned_rep_id: 'rep-002',
        location: {
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          zip_code: '94105',
          latitude: 37.7749,
          longitude: -122.4194
        },
        industry: 'Technology',
        company_size: 'Small (10-50 employees)',
        probability: 60,
        expected_close_date: '2024-03-30',
        created_at: '2024-02-15T14:30:00Z'
      }
    ]

    setSalesReps(mockSalesReps)
    setTerritories(mockTerritories)
    setDeals(mockDeals)
  }

  const handleCreateTerritory = () => {
    const newTerritory: Territory = {
      id: `territory-${Date.now()}`,
      name: 'New Territory',
      description: '',
      type: 'geographic',
      manager_id: '',
      manager_name: '',
      countries: [],
      states: [],
      cities: [],
      zip_codes: [],
      industries: [],
      company_sizes: [],
      quota: 0,
      achieved: 0,
      quota_period: 'quarterly',
      target_deals: 0,
      active_deals: 0,
      conversion_rate: 0,
      average_deal_size: 0,
      ai_performance_score: 0,
      ai_optimization_suggestions: [],
      ai_territory_health: 'fair',
      ai_workload_balance: 0,
      sales_reps: [],
      support_staff: [],
      auto_assignment_rules: [],
      escalation_rules: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    }

    setTerritories(prev => [...prev, newTerritory])
    setSelectedTerritory(newTerritory)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(true)
    toast.success('Territory created successfully')
  }

  const handleOptimizeQuotas = async () => {
    setIsOptimizing(true)
    
    // Simulate AI-powered quota optimization
    const prompt = spark.llmPrompt`
      Analyze the following territory performance data and provide quota optimization recommendations:
      
      Territories: ${JSON.stringify(territories.map(t => ({
        name: t.name,
        quota: t.quota,
        achieved: t.achieved,
        conversion_rate: t.conversion_rate,
        average_deal_size: t.average_deal_size,
        active_deals: t.active_deals,
        ai_performance_score: t.ai_performance_score
      })))}
      
      Sales Reps: ${JSON.stringify(salesReps.map(r => ({
        name: r.name,
        quota: r.quota,
        achieved: r.achieved,
        performance_rating: r.performance_rating,
        current_workload: r.current_workload,
        workload_capacity: r.workload_capacity
      })))}
      
      Provide specific quota adjustments and territory rebalancing recommendations in JSON format.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const optimizations = JSON.parse(response)
      
      // Apply optimizations
      const optimizedTerritories = territories.map(territory => {
        const optimization = optimizations.territories?.find((opt: any) => opt.name === territory.name)
        if (optimization) {
          return {
            ...territory,
            quota: optimization.recommended_quota || territory.quota,
            ai_optimization_suggestions: [
              ...territory.ai_optimization_suggestions,
              ...optimization.suggestions || []
            ]
          }
        }
        return territory
      })

      setTerritories(optimizedTerritories)
      toast.success('Quota optimization completed successfully')
    } catch (error) {
      console.error('Optimization error:', error)
      toast.error('Failed to optimize quotas')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleReassignDeals = async () => {
    // Simulate AI-powered deal reassignment based on geographic and workload optimization
    const prompt = spark.llmPrompt`
      Based on the territory configuration and current deal distribution, recommend optimal deal assignments:
      
      Territories: ${JSON.stringify(territories)}
      Deals: ${JSON.stringify(deals)}
      Sales Reps: ${JSON.stringify(salesReps)}
      
      Consider geographic proximity, rep workload, specialization match, and territory boundaries.
      Provide reassignment recommendations in JSON format.
    `

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const reassignments = JSON.parse(response)
      
      // Apply reassignments
      const updatedDeals = deals.map(deal => {
        const reassignment = reassignments.reassignments?.find((r: any) => r.deal_id === deal.id)
        if (reassignment) {
          return {
            ...deal,
            territory_id: reassignment.new_territory_id || deal.territory_id,
            assigned_rep_id: reassignment.new_rep_id || deal.assigned_rep_id
          }
        }
        return deal
      })

      setDeals(updatedDeals)
      toast.success(`Reassigned ${reassignments.reassignments?.length || 0} deals for optimal distribution`)
    } catch (error) {
      console.error('Reassignment error:', error)
      toast.error('Failed to reassign deals')
    }
  }

  const getTerritoryHealth = (territory: Territory) => {
    const quotaAttainment = (territory.achieved / territory.quota) * 100
    if (quotaAttainment >= 90) return 'excellent'
    if (quotaAttainment >= 75) return 'good'
    if (quotaAttainment >= 60) return 'fair'
    return 'poor'
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const totalQuota = territories.reduce((sum, t) => sum + t.quota, 0)
  const totalAchieved = territories.reduce((sum, t) => sum + t.achieved, 0)
  const overallAttainment = totalQuota > 0 ? (totalAchieved / totalQuota) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Territory Management</h2>
          <p className="text-muted-foreground">
            Advanced geographical deal assignment and quota optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReassignDeals}>
            <Shuffle className="h-4 w-4 mr-2" />
            Reassign Deals
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOptimizeQuotas}
            disabled={isOptimizing}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Quotas'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Territory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Territory</DialogTitle>
                <DialogDescription>
                  Create a new sales territory with geographical boundaries and quota assignments.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTerritory}>
                  Create Territory
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quota</p>
                <p className="text-2xl font-bold">${(totalQuota / 1000000).toFixed(1)}M</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achieved</p>
                <p className="text-2xl font-bold">${(totalAchieved / 1000000).toFixed(1)}M</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attainment</p>
                <p className="text-2xl font-bold">{overallAttainment.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Territories</p>
                <p className="text-2xl font-bold">{territories.filter(t => t.is_active).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="territories">Territories</TabsTrigger>
          <TabsTrigger value="assignments">Deal Assignments</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Territory Performance</CardTitle>
                <CardDescription>Quota attainment by territory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {territories.map(territory => {
                  const attainment = (territory.achieved / territory.quota) * 100
                  const health = getTerritoryHealth(territory)
                  return (
                    <div key={territory.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{territory.name}</h4>
                          <Badge variant="outline" className={getHealthColor(health)}>
                            {health}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{attainment.toFixed(1)}%</span>
                      </div>
                      <Progress value={attainment} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${(territory.achieved / 1000).toFixed(0)}K achieved</span>
                        <span>${(territory.quota / 1000).toFixed(0)}K quota</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Rep Workload</CardTitle>
                <CardDescription>Current workload vs capacity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {salesReps.map(rep => {
                  const workloadPercentage = (rep.current_workload / rep.workload_capacity) * 100
                  const isOverloaded = workloadPercentage > 90
                  return (
                    <div key={rep.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rep.name}</h4>
                          <Badge variant={rep.role === 'senior' ? 'default' : 'secondary'}>
                            {rep.role}
                          </Badge>
                          {isOverloaded && (
                            <Badge variant="destructive">Overloaded</Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{workloadPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={workloadPercentage} 
                        className={`h-2 ${isOverloaded ? 'bg-red-100' : ''}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Performance: {rep.performance_rating}/100</span>
                        <span>Quota: ${(rep.quota / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="territories" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {territories.map(territory => (
              <Card key={territory.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {territory.type === 'geographic' ? <MapPin className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                        {territory.name}
                      </CardTitle>
                      <CardDescription>{territory.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getHealthColor(territory.ai_territory_health)}>
                        {territory.ai_territory_health}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTerritory(territory)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Manager</p>
                      <p className="text-sm">{territory.manager_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quota Attainment</p>
                      <p className="text-sm font-bold">
                        {((territory.achieved / territory.quota) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                      <p className="text-sm">{territory.active_deals} / {territory.target_deals}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                      <p className="text-sm">${(territory.average_deal_size / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  
                  {territory.type === 'geographic' && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Geographic Coverage</p>
                        <div className="space-y-1">
                          {territory.countries.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {territory.countries.map(country => (
                                <Badge key={country} variant="outline" className="text-xs">
                                  {country}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {territory.states.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {territory.states.map(state => (
                                <Badge key={state} variant="outline" className="text-xs">
                                  {state}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Industries</p>
                        <div className="flex flex-wrap gap-1">
                          {territory.industries.map(industry => (
                            <Badge key={industry} variant="secondary" className="text-xs">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {territory.ai_optimization_suggestions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">AI Optimization Suggestions</p>
                      <ul className="space-y-1">
                        {territory.ai_optimization_suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Brain className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Assignments by Territory</CardTitle>
              <CardDescription>
                Current deal distribution and assignment optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Assigned Rep</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map(deal => {
                    const territory = territories.find(t => t.id === deal.territory_id)
                    const rep = salesReps.find(r => r.id === deal.assigned_rep_id)
                    return (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>{deal.account_name}</TableCell>
                        <TableCell>${(deal.value / 1000).toFixed(0)}K</TableCell>
                        <TableCell>
                          <Badge variant="outline">{territory?.name || 'Unassigned'}</Badge>
                        </TableCell>
                        <TableCell>{rep?.name || 'Unassigned'}</TableCell>
                        <TableCell className="text-sm">
                          {deal.location.city}, {deal.location.state}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{deal.stage}</Badge>
                        </TableCell>
                        <TableCell>{deal.probability}%</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Route className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Territory Optimization</CardTitle>
                <CardDescription>
                  Machine learning powered territory and quota optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Optimization Goals</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Performance</SelectItem>
                      <SelectItem value="revenue">Maximize Revenue</SelectItem>
                      <SelectItem value="growth">Accelerate Growth</SelectItem>
                      <SelectItem value="efficiency">Improve Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Optimization Factors</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="geographic" defaultChecked />
                      <Label htmlFor="geographic">Geographic proximity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="workload" defaultChecked />
                      <Label htmlFor="workload">Workload balancing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="specialization" defaultChecked />
                      <Label htmlFor="specialization">Rep specialization</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="performance" defaultChecked />
                      <Label htmlFor="performance">Historical performance</Label>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleOptimizeQuotas} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isOptimizing ? 'Optimizing...' : 'Run AI Optimization'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
                <CardDescription>
                  Recent optimization recommendations and impacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Revenue Impact</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Projected 12% increase in quarterly revenue through optimized territory assignments
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Workload Balance</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Improved workload distribution reduces average rep utilization from 85% to 78%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Geographic Efficiency</span>
                    </div>
                    <p className="text-xs text-purple-700">
                      Reduced average travel time by 23% through better geographic clustering
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Territory Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed performance analysis by territory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Territory</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Achieved</TableHead>
                      <TableHead>Attainment</TableHead>
                      <TableHead>Deals</TableHead>
                      <TableHead>Conversion</TableHead>
                      <TableHead>Avg Deal</TableHead>
                      <TableHead>AI Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {territories.map(territory => (
                      <TableRow key={territory.id}>
                        <TableCell className="font-medium">{territory.name}</TableCell>
                        <TableCell>${(territory.quota / 1000).toFixed(0)}K</TableCell>
                        <TableCell>${(territory.achieved / 1000).toFixed(0)}K</TableCell>
                        <TableCell>
                          <Badge variant={((territory.achieved / territory.quota) * 100) >= 75 ? 'default' : 'secondary'}>
                            {((territory.achieved / territory.quota) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{territory.active_deals}/{territory.target_deals}</TableCell>
                        <TableCell>{territory.conversion_rate.toFixed(1)}%</TableCell>
                        <TableCell>${(territory.average_deal_size / 1000).toFixed(0)}K</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={territory.ai_performance_score >= 80 ? 'text-green-600' : 'text-yellow-600'}>
                            {territory.ai_performance_score}/100
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  AI-powered performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Top Performer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manufacturing Vertical leads with 95% AI performance score
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Growth Opportunity</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      West Coast SMB shows 15% upside potential with proper optimization
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Attention Needed</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      North East Enterprise requires immediate quota rebalancing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Territory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Territory: {selectedTerritory?.name}</DialogTitle>
            <DialogDescription>
              Configure territory boundaries, quotas, and assignment rules
            </DialogDescription>
          </DialogHeader>
          {selectedTerritory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="territory-name">Territory Name</Label>
                  <Input
                    id="territory-name"
                    value={selectedTerritory.name}
                    onChange={(e) => setSelectedTerritory({
                      ...selectedTerritory,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territory-type">Territory Type</Label>
                  <Select 
                    value={selectedTerritory.type}
                    onValueChange={(value: 'geographic' | 'vertical' | 'account_based' | 'product_line') => 
                      setSelectedTerritory({
                        ...selectedTerritory,
                        type: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geographic">Geographic</SelectItem>
                      <SelectItem value="vertical">Industry Vertical</SelectItem>
                      <SelectItem value="account_based">Account-Based</SelectItem>
                      <SelectItem value="product_line">Product Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="territory-description">Description</Label>
                <Textarea
                  id="territory-description"
                  value={selectedTerritory.description}
                  onChange={(e) => setSelectedTerritory({
                    ...selectedTerritory,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quota">Quota</Label>
                  <Input
                    id="quota"
                    type="number"
                    value={selectedTerritory.quota}
                    onChange={(e) => setSelectedTerritory({
                      ...selectedTerritory,
                      quota: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota-period">Quota Period</Label>
                  <Select 
                    value={selectedTerritory.quota_period}
                    onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => 
                      setSelectedTerritory({
                        ...selectedTerritory,
                        quota_period: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Update territory in state
                  setTerritories(prev => prev.map(t => 
                    t.id === selectedTerritory.id ? selectedTerritory : t
                  ))
                  setIsEditDialogOpen(false)
                  toast.success('Territory updated successfully')
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}