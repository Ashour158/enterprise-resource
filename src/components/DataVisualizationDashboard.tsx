import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRealtimeCharts } from '@/hooks/useRealtimeCharts'
import { BarChart, LineChart, PieChart, MetricCard } from '@/components/charts/SimpleCharts'
import { ChartConfig, ChartType, ChartData, TimeSeriesData } from '@/types/dashboard'
import { 
  ChartLine, 
  ChartBar, 
  ChartPie, 
  Plus, 
  ArrowClockwise, 
  Gear, 
  Download,
  Eye,
  Brain,
  TrendUp,
  Activity,
  Clock,
  Database
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DataVisualizationDashboardProps {
  companyId: string
  userId: string
}

export function DataVisualizationDashboard({ companyId, userId }: DataVisualizationDashboardProps) {
  const [activeView, setActiveView] = useState('overview')
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar')
  const [isAddingChart, setIsAddingChart] = useState(false)
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([
    {
      id: 'revenue-chart',
      title: 'Quarterly Revenue',
      type: 'bar',
      dataSource: 'finance',
      moduleId: 'finance',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      settings: { showLegend: true, showGrid: true, animation: true },
      isRealTime: true,
      refreshInterval: 30000
    },
    {
      id: 'sales-timeseries',
      title: 'Sales Trend (30 Days)',
      type: 'line',
      dataSource: 'sales',
      moduleId: 'sales',
      position: { x: 1, y: 0 },
      size: { width: 400, height: 300 },
      settings: { showLegend: true, showGrid: true, animation: true },
      isRealTime: true,
      refreshInterval: 30000
    },
    {
      id: 'inventory-distribution',
      title: 'Inventory Distribution',
      type: 'pie',
      dataSource: 'inventory',
      moduleId: 'inventory',
      position: { x: 0, y: 1 },
      size: { width: 400, height: 300 },
      settings: { showLegend: true, animation: true },
      isRealTime: true,
      refreshInterval: 60000
    },
    {
      id: 'employee-metric',
      title: 'Total Employees',
      type: 'metric',
      dataSource: 'hr',
      moduleId: 'hr',
      position: { x: 1, y: 1 },
      size: { width: 200, height: 150 },
      settings: { animation: true },
      isRealTime: true,
      refreshInterval: 120000
    }
  ])

  const {
    chartData,
    metrics,
    isLoading,
    error,
    lastUpdate,
    refreshData,
    subscribeToChart,
    unsubscribeFromChart
  } = useRealtimeCharts({
    companyId,
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Subscribe to all charts on mount
  useEffect(() => {
    chartConfigs.forEach(config => {
      if (config.isRealTime) {
        subscribeToChart(config.id)
      }
    })

    return () => {
      chartConfigs.forEach(config => {
        unsubscribeFromChart(config.id)
      })
    }
  }, [chartConfigs, subscribeToChart, unsubscribeFromChart])

  const handleChartClick = (chartId: string, dataPoint: ChartData | TimeSeriesData) => {
    const displayName = 'name' in dataPoint ? dataPoint.name : `Data point at ${dataPoint.timestamp}`
    toast.info(`Clicked ${chartId}: ${displayName}`)
  }

  const handleAddChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title: 'New Chart',
      type: selectedChartType,
      dataSource: 'custom',
      moduleId: 'dashboard',
      position: { x: 0, y: chartConfigs.length },
      size: { width: 400, height: 300 },
      settings: { showLegend: true, showGrid: true, animation: true },
      isRealTime: true,
      refreshInterval: 30000
    }

    setChartConfigs(prev => [...prev, newChart])
    subscribeToChart(newChart.id)
    setIsAddingChart(false)
    toast.success('Chart added successfully')
  }

  const handleRemoveChart = (chartId: string) => {
    setChartConfigs(prev => prev.filter(c => c.id !== chartId))
    unsubscribeFromChart(chartId)
    toast.success('Chart removed')
  }

  const handleRefreshAll = () => {
    refreshData()
    toast.success('All charts refreshed')
  }

  const renderChart = (config: ChartConfig) => {
    const data = chartData[config.id] || []
    const commonProps = {
      title: config.title,
      data,
      isLoading: isLoading,
      error: error,
      onDataPointClick: (dataPoint: ChartData | TimeSeriesData) => handleChartClick(config.id, dataPoint),
      className: "w-full"
    }

    switch (config.type) {
      case 'bar':
        return <BarChart {...commonProps} />
      case 'line':
        return <LineChart {...commonProps} />
      case 'pie':
      case 'donut':
        return <PieChart {...commonProps} />
      case 'metric':
        return <MetricCard {...commonProps} />
      default:
        return <BarChart {...commonProps} />
    }
  }

  const generateAIInsights = () => {
    toast.success('AI insights generated! Check the insights panel.')
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Visualization Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time analytics and insights for {companyId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity size={12} className={metrics.syncStatus === 'synced' ? 'text-green-500' : 'text-orange-500'} />
            {metrics.syncStatus === 'synced' ? 'Live' : 'Updating'}
          </Badge>
          <Badge variant="outline">
            {metrics.totalCharts} Charts
          </Badge>
          <Badge variant="outline">
            {metrics.dataPoints.toLocaleString()} Data Points
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <ArrowClockwise size={14} className="mr-2" />
            Refresh All
          </Button>
          <Dialog open={isAddingChart} onOpenChange={setIsAddingChart}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={14} className="mr-2" />
                Add Chart
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Chart</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Chart Type</label>
                  <Select value={selectedChartType} onValueChange={(value: ChartType) => setSelectedChartType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="metric">Metric Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddChart} className="w-full">
                  Create Chart
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$2.4M</p>
                <p className="text-xs text-green-600">+12% from last quarter</p>
              </div>
              <TrendUp size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">1,429</p>
                <p className="text-xs text-blue-600">+5% this month</p>
              </div>
              <Eye size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{metrics.dataPoints.toLocaleString()}</p>
                <p className="text-xs text-purple-600">Real-time sync</p>
              </div>
              <Database size={24} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                <p className="text-2xl font-bold">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                </p>
                <p className="text-xs text-orange-600">Auto-refresh active</p>
              </div>
              <Clock size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain size={16} />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartConfigs.map((config) => (
              <div key={config.id} className="relative group">
                {renderChart(config)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveChart(config.id)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.avgLoadTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.realTimeCharts}</div>
                  <div className="text-sm text-muted-foreground">Real-time Charts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateAIInsights} className="w-full">
                <Brain size={16} className="mr-2" />
                Generate New Insights
              </Button>
              
              <div className="space-y-3">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendUp size={20} className="text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium">Revenue Growth Trend</h4>
                      <p className="text-sm text-muted-foreground">
                        Revenue is trending upward with a 12% increase this quarter. 
                        Consider expanding marketing in Q4.
                      </p>
                      <Badge variant="secondary" className="mt-2">Confidence: 87%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Activity size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium">User Engagement Pattern</h4>
                      <p className="text-sm text-muted-foreground">
                        Peak activity occurs between 2-4 PM. Optimize system resources 
                        during these hours.
                      </p>
                      <Badge variant="secondary" className="mt-2">Confidence: 92%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Auto-refresh Interval</label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <Select defaultValue="png">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG Image</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Export Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}