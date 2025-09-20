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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Target, 
  Calculator, 
  TrendUp, 
  Brain, 
  BarChart, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Award,
  Clock,
  Users,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Activity
} from '@phosphor-icons/react'

interface OptimizationScenario {
  id: string
  name: string
  description: string
  type: 'balanced' | 'aggressive_growth' | 'conservative' | 'performance_based' | 'market_expansion'
  parameters: {
    quota_adjustment_range: { min: number; max: number }
    performance_weight: number
    market_potential_weight: number
    historical_weight: number
    seasonality_factor: boolean
    territory_complexity_factor: boolean
    competition_factor: boolean
  }
  created_at: string
}

interface OptimizationResult {
  scenario_id: string
  territory_id: string
  territory_name: string
  current_quota: number
  recommended_quota: number
  adjustment_percentage: number
  confidence_score: number
  reasoning: string[]
  projected_impact: {
    revenue_increase: number
    attainment_improvement: number
    workload_balance: number
  }
}

interface TerritoryMetrics {
  id: string
  name: string
  manager_name: string
  current_quota: number
  achieved: number
  attainment_percentage: number
  rep_count: number
  avg_deal_size: number
  conversion_rate: number
  market_potential: number
  territory_complexity: number
  seasonality_impact: number
  competition_intensity: number
  historical_performance: number[]
  trends: {
    revenue_trend: 'up' | 'down' | 'stable'
    activity_trend: 'up' | 'down' | 'stable'
    efficiency_trend: 'up' | 'down' | 'stable'
  }
}

interface Props {
  companyId: string
  userId: string
  territories: any[]
  onQuotaUpdate?: (territoryId: string, newQuota: number) => void
}

export function QuotaOptimizationEngine({ companyId, userId, territories, onQuotaUpdate }: Props) {
  const [scenarios, setScenarios] = useKV<OptimizationScenario[]>(`quota-scenarios-${companyId}`, [])
  const [optimizationResults, setOptimizationResults] = useKV<OptimizationResult[]>(`quota-results-${companyId}`, [])
  const [territoryMetrics, setTerritoryMetrics] = useState<TerritoryMetrics[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState('scenarios')
  const [customParameters, setCustomParameters] = useState({
    quota_adjustment_range: { min: -20, max: 30 },
    performance_weight: 40,
    market_potential_weight: 30,
    historical_weight: 20,
    seasonality_factor: true,
    territory_complexity_factor: true,
    competition_factor: false
  })

  // Initialize default scenarios and metrics
  useEffect(() => {
    if (scenarios.length === 0) {
      initializeDefaultScenarios()
    }
    initializeTerritoryMetrics()
  }, [territories])

  const initializeDefaultScenarios = () => {
    const defaultScenarios: OptimizationScenario[] = [
      {
        id: 'balanced',
        name: 'Balanced Growth',
        description: 'Optimizes quotas for balanced growth across all territories',
        type: 'balanced',
        parameters: {
          quota_adjustment_range: { min: -15, max: 25 },
          performance_weight: 35,
          market_potential_weight: 30,
          historical_weight: 25,
          seasonality_factor: true,
          territory_complexity_factor: true,
          competition_factor: true
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'aggressive_growth',
        name: 'Aggressive Growth',
        description: 'Maximizes revenue potential with higher quotas in high-performing territories',
        type: 'aggressive_growth',
        parameters: {
          quota_adjustment_range: { min: -10, max: 40 },
          performance_weight: 50,
          market_potential_weight: 35,
          historical_weight: 15,
          seasonality_factor: false,
          territory_complexity_factor: true,
          competition_factor: false
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'conservative',
        name: 'Conservative Adjustment',
        description: 'Makes minimal adjustments to maintain stability',
        type: 'conservative',
        parameters: {
          quota_adjustment_range: { min: -10, max: 15 },
          performance_weight: 25,
          market_potential_weight: 20,
          historical_weight: 45,
          seasonality_factor: true,
          territory_complexity_factor: true,
          competition_factor: true
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'performance_based',
        name: 'Performance-Based',
        description: 'Heavily weights recent performance in quota adjustments',
        type: 'performance_based',
        parameters: {
          quota_adjustment_range: { min: -25, max: 35 },
          performance_weight: 60,
          market_potential_weight: 25,
          historical_weight: 15,
          seasonality_factor: false,
          territory_complexity_factor: false,
          competition_factor: true
        },
        created_at: new Date().toISOString()
      }
    ]

    setScenarios(defaultScenarios)
  }

  const initializeTerritoryMetrics = () => {
    const metrics: TerritoryMetrics[] = territories.map(territory => ({
      id: territory.id,
      name: territory.name,
      manager_name: territory.manager_name,
      current_quota: territory.quota,
      achieved: territory.achieved,
      attainment_percentage: (territory.achieved / territory.quota) * 100,
      rep_count: territory.sales_reps?.length || 1,
      avg_deal_size: territory.average_deal_size,
      conversion_rate: territory.conversion_rate,
      market_potential: Math.random() * 100 + 50, // Mock market potential score
      territory_complexity: Math.random() * 100 + 30, // Mock complexity score
      seasonality_impact: Math.random() * 20 + 5, // Mock seasonality impact
      competition_intensity: Math.random() * 100 + 20, // Mock competition intensity
      historical_performance: [85, 92, 88, 95, 90], // Mock historical data
      trends: {
        revenue_trend: Math.random() > 0.5 ? 'up' : 'down',
        activity_trend: Math.random() > 0.5 ? 'up' : 'stable',
        efficiency_trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    }))

    setTerritoryMetrics(metrics)
  }

  const runOptimization = async (scenarioId: string) => {
    setIsOptimizing(true)
    
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario) {
      toast.error('Scenario not found')
      setIsOptimizing(false)
      return
    }

    try {
      const prompt = spark.llmPrompt`
        You are an advanced quota optimization AI. Analyze the following territory data and optimization parameters to recommend quota adjustments.

        Scenario: ${scenario.name}
        Parameters: ${JSON.stringify(scenario.parameters)}
        
        Territory Metrics: ${JSON.stringify(territoryMetrics)}
        
        For each territory, provide:
        1. Recommended quota adjustment (within the allowed range)
        2. Confidence score (0-100)
        3. Detailed reasoning for the adjustment
        4. Projected impact on revenue, attainment, and workload balance

        Consider factors like:
        - Current performance vs quota
        - Market potential and growth trends
        - Territory complexity and competition
        - Rep capacity and historical performance
        - Seasonality and market conditions

        Return results in this JSON format:
        {
          "results": [
            {
              "territory_id": "string",
              "territory_name": "string", 
              "current_quota": number,
              "recommended_quota": number,
              "adjustment_percentage": number,
              "confidence_score": number,
              "reasoning": ["reason1", "reason2", "reason3"],
              "projected_impact": {
                "revenue_increase": number,
                "attainment_improvement": number,
                "workload_balance": number
              }
            }
          ]
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const optimizationData = JSON.parse(response)
      
      const results: OptimizationResult[] = optimizationData.results.map((result: any) => ({
        scenario_id: scenarioId,
        ...result
      }))

      setOptimizationResults(results)
      toast.success(`Quota optimization completed for ${results.length} territories`)
    } catch (error) {
      console.error('Optimization error:', error)
      toast.error('Failed to run quota optimization')
    } finally {
      setIsOptimizing(false)
    }
  }

  const applyOptimization = (results: OptimizationResult[]) => {
    results.forEach(result => {
      onQuotaUpdate?.(result.territory_id, result.recommended_quota)
    })
    
    toast.success(`Applied quota adjustments to ${results.length} territories`)
  }

  const createCustomScenario = () => {
    const newScenario: OptimizationScenario = {
      id: `custom-${Date.now()}`,
      name: 'Custom Scenario',
      description: 'User-defined optimization parameters',
      type: 'balanced',
      parameters: customParameters,
      created_at: new Date().toISOString()
    }

    setScenarios(prev => [...prev, newScenario])
    setSelectedScenario(newScenario.id)
    toast.success('Custom scenario created')
  }

  const getImpactSummary = (results: OptimizationResult[]) => {
    if (!results.length) return null

    const totalCurrentQuota = results.reduce((sum, r) => sum + r.current_quota, 0)
    const totalRecommendedQuota = results.reduce((sum, r) => sum + r.recommended_quota, 0)
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence_score, 0) / results.length
    const totalRevenueIncrease = results.reduce((sum, r) => sum + (r.projected_impact.revenue_increase || 0), 0)
    
    return {
      totalQuotaChange: totalRecommendedQuota - totalCurrentQuota,
      quotaChangePercentage: ((totalRecommendedQuota - totalCurrentQuota) / totalCurrentQuota) * 100,
      avgConfidence,
      totalRevenueIncrease,
      territoriesIncreased: results.filter(r => r.adjustment_percentage > 0).length,
      territoriesDecreased: results.filter(r => r.adjustment_percentage < 0).length
    }
  }

  const currentResults = optimizationResults.filter(r => r.scenario_id === selectedScenario)
  const impactSummary = getImpactSummary(currentResults)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quota Optimization Engine</h2>
          <p className="text-muted-foreground">
            AI-powered territory quota optimization with advanced scenario modeling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {territoryMetrics.length} Territories
          </Badge>
          <Badge variant="outline">
            {scenarios.length} Scenarios
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quota</p>
                <p className="text-2xl font-bold">
                  ${(territoryMetrics.reduce((sum, t) => sum + t.current_quota, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attainment</p>
                <p className="text-2xl font-bold">
                  {territoryMetrics.length > 0 
                    ? (territoryMetrics.reduce((sum, t) => sum + t.attainment_percentage, 0) / territoryMetrics.length).toFixed(1)
                    : 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold">
                  {territoryMetrics.filter(t => t.attainment_percentage >= 90).length}
                </p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimization Potential</p>
                <p className="text-2xl font-bold">
                  {impactSummary ? `+${impactSummary.totalRevenueIncrease.toFixed(0)}%` : 'TBD'}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Optimization Scenarios</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Parameters</TabsTrigger>
          <TabsTrigger value="metrics">Territory Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Scenarios</CardTitle>
                <CardDescription>
                  Pre-built and custom optimization scenarios for different business objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scenarios.map(scenario => (
                  <div
                    key={scenario.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedScenario === scenario.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant="outline">{scenario.type.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Adjustment Range:</span>
                        <span className="ml-1 font-medium">
                          {scenario.parameters.quota_adjustment_range.min}% to {scenario.parameters.quota_adjustment_range.max}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Performance Weight:</span>
                        <span className="ml-1 font-medium">{scenario.parameters.performance_weight}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Run Optimization</CardTitle>
                <CardDescription>
                  Execute quota optimization using the selected scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedScenario ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Selected Scenario</h4>
                      <div className="text-sm">
                        <p className="font-medium">{scenarios.find(s => s.id === selectedScenario)?.name}</p>
                        <p className="text-muted-foreground">
                          {scenarios.find(s => s.id === selectedScenario)?.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Optimization Factors</Label>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {scenarios.find(s => s.id === selectedScenario)?.parameters.seasonality_factor && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Seasonality Factor</span>
                          </div>
                        )}
                        {scenarios.find(s => s.id === selectedScenario)?.parameters.territory_complexity_factor && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Territory Complexity</span>
                          </div>
                        )}
                        {scenarios.find(s => s.id === selectedScenario)?.parameters.competition_factor && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Competition Analysis</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={() => runOptimization(selectedScenario)}
                      disabled={isOptimizing}
                      className="w-full"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a scenario to run optimization</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {currentResults.length > 0 ? (
            <>
              {impactSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Impact Summary</CardTitle>
                    <CardDescription>
                      Projected results from the {scenarios.find(s => s.id === selectedScenario)?.name} scenario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          +${(impactSummary.totalQuotaChange / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-muted-foreground">Total Quota Change</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {impactSummary.avgConfidence.toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          +{impactSummary.totalRevenueIncrease.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Revenue Increase</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {impactSummary.territoriesIncreased}/{impactSummary.territoriesDecreased}
                        </div>
                        <div className="text-sm text-muted-foreground">Increased/Decreased</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Territory Quota Recommendations</CardTitle>
                      <CardDescription>
                        Detailed optimization results for each territory
                      </CardDescription>
                    </div>
                    <Button onClick={() => applyOptimization(currentResults)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply All Changes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Territory</TableHead>
                        <TableHead>Current Quota</TableHead>
                        <TableHead>Recommended</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentResults.map(result => (
                        <TableRow key={result.territory_id}>
                          <TableCell className="font-medium">{result.territory_name}</TableCell>
                          <TableCell>${(result.current_quota / 1000).toFixed(0)}K</TableCell>
                          <TableCell>${(result.recommended_quota / 1000).toFixed(0)}K</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {result.adjustment_percentage > 0 ? (
                                <ArrowUp className="h-4 w-4 text-green-500" />
                              ) : result.adjustment_percentage < 0 ? (
                                <ArrowDown className="h-4 w-4 text-red-500" />
                              ) : null}
                              <span className={
                                result.adjustment_percentage > 0 ? 'text-green-600' :
                                result.adjustment_percentage < 0 ? 'text-red-600' : ''
                              }>
                                {result.adjustment_percentage > 0 ? '+' : ''}{result.adjustment_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.confidence_score >= 80 ? 'default' : 'outline'}>
                              {result.confidence_score.toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            +{result.projected_impact.revenue_increase?.toFixed(1) || 0}% revenue
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{result.territory_name} - Optimization Details</DialogTitle>
                                    <DialogDescription>
                                      Detailed reasoning and projected impact analysis
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Reasoning</h4>
                                      <ul className="space-y-1">
                                        {result.reasoning.map((reason, index) => (
                                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                                            {reason}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <Separator />
                                    <div>
                                      <h4 className="font-medium mb-2">Projected Impact</h4>
                                      <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                          <div className="text-lg font-bold text-green-600">
                                            +{result.projected_impact.revenue_increase?.toFixed(1) || 0}%
                                          </div>
                                          <div className="text-xs text-muted-foreground">Revenue</div>
                                        </div>
                                        <div>
                                          <div className="text-lg font-bold text-blue-600">
                                            +{result.projected_impact.attainment_improvement?.toFixed(1) || 0}%
                                          </div>
                                          <div className="text-xs text-muted-foreground">Attainment</div>
                                        </div>
                                        <div>
                                          <div className="text-lg font-bold text-purple-600">
                                            {result.projected_impact.workload_balance?.toFixed(0) || 0}%
                                          </div>
                                          <div className="text-xs text-muted-foreground">Balance</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onQuotaUpdate?.(result.territory_id, result.recommended_quota)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Optimization Results</h3>
                  <p className="text-muted-foreground">
                    Run an optimization scenario to see quota recommendations and impact analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Optimization Parameters</CardTitle>
              <CardDescription>
                Create a custom optimization scenario with your specific parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quota Adjustment Range</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Minimum: {customParameters.quota_adjustment_range.min}%
                        </Label>
                        <Slider
                          value={[customParameters.quota_adjustment_range.min]}
                          onValueChange={([value]) => setCustomParameters(prev => ({
                            ...prev,
                            quota_adjustment_range: { ...prev.quota_adjustment_range, min: value }
                          }))}
                          min={-50}
                          max={0}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Maximum: {customParameters.quota_adjustment_range.max}%
                        </Label>
                        <Slider
                          value={[customParameters.quota_adjustment_range.max]}
                          onValueChange={([value]) => setCustomParameters(prev => ({
                            ...prev,
                            quota_adjustment_range: { ...prev.quota_adjustment_range, max: value }
                          }))}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weight Distribution</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Performance Weight: {customParameters.performance_weight}%
                        </Label>
                        <Slider
                          value={[customParameters.performance_weight]}
                          onValueChange={([value]) => setCustomParameters(prev => ({
                            ...prev,
                            performance_weight: value
                          }))}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Market Potential Weight: {customParameters.market_potential_weight}%
                        </Label>
                        <Slider
                          value={[customParameters.market_potential_weight]}
                          onValueChange={([value]) => setCustomParameters(prev => ({
                            ...prev,
                            market_potential_weight: value
                          }))}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Historical Weight: {customParameters.historical_weight}%
                        </Label>
                        <Slider
                          value={[customParameters.historical_weight]}
                          onValueChange={([value]) => setCustomParameters(prev => ({
                            ...prev,
                            historical_weight: value
                          }))}
                          min={0}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Optimization Factors</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="seasonality"
                          checked={customParameters.seasonality_factor}
                          onCheckedChange={(checked) => setCustomParameters(prev => ({
                            ...prev,
                            seasonality_factor: checked
                          }))}
                        />
                        <Label htmlFor="seasonality">Include Seasonality Factor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="complexity"
                          checked={customParameters.territory_complexity_factor}
                          onCheckedChange={(checked) => setCustomParameters(prev => ({
                            ...prev,
                            territory_complexity_factor: checked
                          }))}
                        />
                        <Label htmlFor="complexity">Territory Complexity Factor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="competition"
                          checked={customParameters.competition_factor}
                          onCheckedChange={(checked) => setCustomParameters(prev => ({
                            ...prev,
                            competition_factor: checked
                          }))}
                        />
                        <Label htmlFor="competition">Competition Analysis</Label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Parameter Validation</h4>
                    <div className="space-y-1 text-sm">
                      {customParameters.performance_weight + customParameters.market_potential_weight + customParameters.historical_weight === 100 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Weight distribution is valid (100%)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            Weight total: {customParameters.performance_weight + customParameters.market_potential_weight + customParameters.historical_weight}% (should be 100%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={createCustomScenario}
                    className="w-full"
                    disabled={customParameters.performance_weight + customParameters.market_potential_weight + customParameters.historical_weight !== 100}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Create Custom Scenario
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Territory Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive metrics used for quota optimization analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Territory</TableHead>
                    <TableHead>Current Quota</TableHead>
                    <TableHead>Attainment</TableHead>
                    <TableHead>Market Potential</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Trends</TableHead>
                    <TableHead>Rep Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {territoryMetrics.map(metric => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium">{metric.name}</TableCell>
                      <TableCell>${(metric.current_quota / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={metric.attainment_percentage} className="h-2 w-16" />
                          <span className="text-sm">{metric.attainment_percentage.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{metric.market_potential.toFixed(0)}/100</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{metric.territory_complexity.toFixed(0)}/100</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{metric.competition_intensity.toFixed(0)}/100</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge 
                            variant={metric.trends.revenue_trend === 'up' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            Rev {metric.trends.revenue_trend === 'up' ? '↑' : metric.trends.revenue_trend === 'down' ? '↓' : '→'}
                          </Badge>
                          <Badge 
                            variant={metric.trends.efficiency_trend === 'up' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            Eff {metric.trends.efficiency_trend === 'up' ? '↑' : metric.trends.efficiency_trend === 'down' ? '↓' : '→'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{metric.rep_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}