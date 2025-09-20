import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendUp, 
  DollarSign, 
  Calendar, 
  Target,
  ChartLine,
  Calculator,
  CurrencyDollar,
  Percent,
  Clock
} from '@phosphor-icons/react'

interface Deal {
  id: string
  title: string
  value: number
  probability: number
  closeDate: string
  recurringRevenue: number
  oneTimeRevenue: number
  forecastCategory: 'pipeline' | 'best_case' | 'commit' | 'closed'
  revenueRecognitionDate: string
}

interface DealRevenueForecastProps {
  deal: Deal
  recurringRevenue: number
  oneTimeRevenue: number
}

export function DealRevenueForecast({ deal, recurringRevenue, oneTimeRevenue }: DealRevenueForecastProps) {
  
  const calculateWeightedRevenue = () => {
    return (deal.value * deal.probability) / 100
  }

  const calculateAnnualRecurringRevenue = () => {
    return recurringRevenue * 12
  }

  const calculateTotalContractValue = (years: number = 3) => {
    return oneTimeRevenue + (recurringRevenue * 12 * years)
  }

  const calculateMonthlyBreakdown = () => {
    const months = []
    const startDate = new Date(deal.revenueRecognitionDate)
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(startDate)
      month.setMonth(month.getMonth() + i)
      
      let monthlyRevenue = 0
      
      // One-time revenue recognized in first month
      if (i === 0) {
        monthlyRevenue += oneTimeRevenue
      }
      
      // Recurring revenue every month
      monthlyRevenue += recurringRevenue
      
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthlyRevenue,
        cumulative: months.reduce((sum, m) => sum + m.revenue, 0) + monthlyRevenue
      })
    }
    
    return months
  }

  const monthlyBreakdown = calculateMonthlyBreakdown()
  const weightedRevenue = calculateWeightedRevenue()
  const annualRecurring = calculateAnnualRecurringRevenue()
  const totalContractValue = calculateTotalContractValue()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getForecastCategoryColor = (category: string) => {
    switch (category) {
      case 'closed': return 'bg-green-100 text-green-800'
      case 'commit': return 'bg-blue-100 text-blue-800'
      case 'best_case': return 'bg-purple-100 text-purple-800'
      case 'pipeline': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRevenueType = (amount: number, total: number) => {
    return {
      percentage: (amount / total) * 100,
      label: amount === recurringRevenue ? 'Recurring' : 'One-time'
    }
  }

  const revenueGrowthScenarios = [
    {
      name: 'Conservative',
      multiplier: 0.8,
      description: 'Conservative estimate with risk factors'
    },
    {
      name: 'Most Likely',
      multiplier: 1.0,
      description: 'Current probability-weighted forecast'
    },
    {
      name: 'Optimistic',
      multiplier: 1.2,
      description: 'Optimistic scenario with expansion'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ChartLine className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold">Revenue Forecast</h3>
        <Badge className={getForecastCategoryColor(deal.forecastCategory)}>
          {deal.forecastCategory}
        </Badge>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-xl font-bold">{formatCurrency(deal.value)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(weightedRevenue)}</p>
                <p className="text-xs text-muted-foreground">{deal.probability}% probability</p>
              </div>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Recurring</p>
                <p className="text-xl font-bold">{formatCurrency(annualRecurring)}</p>
              </div>
              <TrendUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">3-Year TCV</p>
                <p className="text-xl font-bold">{formatCurrency(totalContractValue)}</p>
              </div>
              <Calculator className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">One-time Revenue</span>
                  <span className="font-medium">{formatCurrency(oneTimeRevenue)}</span>
                </div>
                <Progress 
                  value={(oneTimeRevenue / deal.value) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {((oneTimeRevenue / deal.value) * 100).toFixed(1)}% of total deal value
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Recurring</span>
                  <span className="font-medium">{formatCurrency(recurringRevenue)}</span>
                </div>
                <Progress 
                  value={(recurringRevenue / (deal.value / 12)) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(annualRecurring)} annually
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Deal Value</span>
                  <span>{formatCurrency(deal.value)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueGrowthScenarios.map((scenario) => {
                const scenarioValue = weightedRevenue * scenario.multiplier
                
                return (
                  <div key={scenario.name} className="space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm font-medium">{scenario.name}</span>
                        <p className="text-xs text-muted-foreground">{scenario.description}</p>
                      </div>
                      <span className="font-bold">{formatCurrency(scenarioValue)}</span>
                    </div>
                    <Progress 
                      value={(scenarioValue / (weightedRevenue * 1.2)) * 100} 
                      className="h-2"
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Projection */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Revenue Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue Recognition Start:</span>
                  <span className="font-medium">
                    {new Date(deal.revenueRecognitionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>First Year Total:</span>
                  <span className="font-medium">
                    {formatCurrency(monthlyBreakdown[11]?.cumulative || 0)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Recurring:</span>
                  <span className="font-medium">{formatCurrency(recurringRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>One-time (Month 1):</span>
                  <span className="font-medium">{formatCurrency(oneTimeRevenue)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {monthlyBreakdown.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{formatCurrency(month.revenue)}</span>
                    <div className="w-24">
                      <Progress 
                        value={(month.revenue / Math.max(...monthlyBreakdown.map(m => m.revenue))) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {formatCurrency(month.cumulative)}
                    </span>
                  </div>
                </div>
              ))}
              
              {monthlyBreakdown.length > 6 && (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  ... and {monthlyBreakdown.length - 6} more months
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CurrencyDollar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Customer Lifetime Value</span>
              </div>
              <div className="text-xl font-bold">{formatCurrency(totalContractValue)}</div>
              <div className="text-xs text-muted-foreground">
                3-year projection
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Revenue Mix</span>
              </div>
              <div className="text-xl font-bold">
                {((recurringRevenue * 12 / deal.value) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Recurring revenue ratio
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Payback Period</span>
              </div>
              <div className="text-xl font-bold">
                {recurringRevenue > 0 ? Math.ceil(oneTimeRevenue / recurringRevenue) : '∞'} months
              </div>
              <div className="text-xs text-muted-foreground">
                Time to recover one-time costs
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Recognition Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Recognition Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
              <div>
                <div className="font-medium">Initial Recognition</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(deal.revenueRecognitionDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{formatCurrency(oneTimeRevenue)}</div>
                <div className="text-xs text-muted-foreground">One-time revenue</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
              <div>
                <div className="font-medium">Monthly Recurring</div>
                <div className="text-sm text-muted-foreground">
                  Starting {new Date(deal.revenueRecognitionDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{formatCurrency(recurringRevenue)}</div>
                <div className="text-xs text-muted-foreground">Per month</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border">
              <div>
                <div className="font-medium">Annual Projection</div>
                <div className="text-sm text-muted-foreground">
                  Year 1 total revenue
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">
                  {formatCurrency(oneTimeRevenue + annualRecurring)}
                </div>
                <div className="text-xs text-muted-foreground">Total first year</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}