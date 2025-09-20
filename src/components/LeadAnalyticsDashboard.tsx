import React, { useState } from 'react'
import { LeadAnalytics, Lead, LeadSource } from '@/types/lead'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown, 
  Target, 
  Funnel, 
  Calendar,
  Download,
  Users,
  DollarSign,
  Star
} from '@phosphor-icons/react'

interface LeadAnalyticsDashboardProps {
  analytics: LeadAnalytics
  leads: Lead[]
  leadSources: LeadSource[]
  companyId: string
}

export function LeadAnalyticsDashboard({ analytics, leads, leadSources, companyId }: LeadAnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('3m')

  const getConversionFunnelData = () => {
    const totalLeads = leads.length
    const contacted = leads.filter(l => l.lead_status !== 'new').length
    const qualified = leads.filter(l => l.lead_status === 'qualified').length
    const converted = leads.filter(l => l.lead_status === 'converted').length

    return [
      { stage: 'Total Leads', count: totalLeads, percentage: 100 },
      { stage: 'Contacted', count: contacted, percentage: totalLeads > 0 ? (contacted / totalLeads) * 100 : 0 },
      { stage: 'Qualified', count: qualified, percentage: totalLeads > 0 ? (qualified / totalLeads) * 100 : 0 },
      { stage: 'Converted', count: converted, percentage: totalLeads > 0 ? (converted / totalLeads) * 100 : 0 }
    ]
  }

  const getScoreDistribution = () => {
    const ranges = [
      { label: '0-25', min: 0, max: 25, color: 'bg-red-500' },
      { label: '26-50', min: 26, max: 50, color: 'bg-orange-500' },
      { label: '51-75', min: 51, max: 75, color: 'bg-yellow-500' },
      { label: '76-100', min: 76, max: 100, color: 'bg-green-500' }
    ]

    return ranges.map(range => {
      const count = leads.filter(lead => 
        lead.ai_lead_score >= range.min && lead.ai_lead_score <= range.max
      ).length
      const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0
      
      return { ...range, count, percentage }
    })
  }

  const funnelData = getConversionFunnelData()
  const scoreDistribution = getScoreDistribution()

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{analytics.total_leads}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{analytics.new_leads_this_month} this month
                </p>
              </div>
              <div className="text-blue-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{(analytics.conversion_rate * 100).toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendUp size={12} className="text-green-600 mr-1" />
                  <p className="text-xs text-green-600">+2.3% vs last month</p>
                </div>
              </div>
              <div className="text-green-600">
                <Target size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Lead Score</p>
                <p className="text-3xl font-bold">{analytics.average_lead_score.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <TrendUp size={12} className="text-green-600 mr-1" />
                  <p className="text-xs text-green-600">+5.2 pts</p>
                </div>
              </div>
              <div className="text-purple-600">
                <Star size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                <p className="text-3xl font-bold">$2.4M</p>
                <div className="flex items-center mt-1">
                  <TrendUp size={12} className="text-green-600 mr-1" />
                  <p className="text-xs text-green-600">+18.5%</p>
                </div>
              </div>
              <div className="text-yellow-600">
                <DollarSign size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Funnel size={20} />
              Lead Conversion Funnel
            </CardTitle>
            <CardDescription>
              Track leads through the conversion process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{stage.count}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className={`h-6 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400"></div>
                    </div>
                  )}
                </div>
                {index < funnelData.length - 1 && (
                  <div className="text-center text-xs text-muted-foreground">
                    {((funnelData[index + 1].count / stage.count) * 100).toFixed(1)}% conversion
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lead Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={20} />
              Lead Score Distribution
            </CardTitle>
            <CardDescription>
              Distribution of AI lead scores across ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scoreDistribution.map((range, index) => (
              <div key={range.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Score {range.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{range.count}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({range.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${range.color}`}
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Lead Sources</CardTitle>
            <CardDescription>
              Best performing lead generation channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_sources.map((source, index) => (
                <div key={source.source_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{source.source_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.lead_count} leads
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {(source.conversion_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">conversion</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.lead_status_distribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status.status === 'new' ? 'bg-blue-500' :
                      status.status === 'contacted' ? 'bg-yellow-500' :
                      status.status === 'qualified' ? 'bg-green-500' :
                      status.status === 'converted' ? 'bg-purple-500' :
                      status.status === 'unqualified' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="capitalize font-medium">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{status.count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({status.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Lead Generation Trends
              </CardTitle>
              <CardDescription>
                Monthly lead generation and conversion performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTimeRange === '1m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('1m')}
              >
                1M
              </Button>
              <Button
                variant={selectedTimeRange === '3m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('3m')}
              >
                3M
              </Button>
              <Button
                variant={selectedTimeRange === '6m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('6m')}
              >
                6M
              </Button>
              <Button
                variant={selectedTimeRange === '1y' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('1y')}
              >
                1Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.monthly_trends.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-bold text-blue-600">{month.leads}</span>
                      <span className="text-muted-foreground ml-1">leads</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-green-600">{month.conversions}</span>
                      <span className="text-muted-foreground ml-1">conversions</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">
                        {month.leads > 0 ? ((month.conversions / month.leads) * 100).toFixed(1) : 0}%
                      </span>
                      <span className="text-muted-foreground ml-1">rate</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className="flex-1 bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(10, (month.leads / Math.max(...analytics.monthly_trends.map(m => m.leads))) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-green-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(5, (month.conversions / Math.max(...analytics.monthly_trends.map(m => m.conversions))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>
            Download detailed analytics reports for further analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Lead Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Conversion Funnel
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Source Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}