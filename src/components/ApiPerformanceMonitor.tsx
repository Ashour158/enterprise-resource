import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendUp, 
  TrendDown, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Database,
  Globe
} from '@phosphor-icons/react'

interface ApiMetrics {
  endpoint: string
  method: string
  avgResponseTime: number
  requestCount: number
  successRate: number
  errorRate: number
  p95ResponseTime: number
  throughput: number
}

interface SystemHealth {
  overall: number
  api: number
  database: number
  cache: number
  realtime: number
}

const mockMetrics: ApiMetrics[] = [
  {
    endpoint: '/api/crm/leads/{id}/full-view',
    method: 'GET',
    avgResponseTime: 145,
    requestCount: 12450,
    successRate: 99.2,
    errorRate: 0.8,
    p95ResponseTime: 280,
    throughput: 152.5
  },
  {
    endpoint: '/api/crm/leads/{id}/email',
    method: 'POST',
    avgResponseTime: 320,
    requestCount: 8920,
    successRate: 97.8,
    errorRate: 2.2,
    p95ResponseTime: 650,
    throughput: 89.2
  },
  {
    endpoint: '/api/crm/search/global',
    method: 'POST',
    avgResponseTime: 95,
    requestCount: 5680,
    successRate: 99.8,
    errorRate: 0.2,
    p95ResponseTime: 185,
    throughput: 68.3
  },
  {
    endpoint: '/api/crm/calendar/availability',
    method: 'GET',
    avgResponseTime: 75,
    requestCount: 3420,
    successRate: 99.5,
    errorRate: 0.5,
    p95ResponseTime: 145,
    throughput: 41.2
  },
  {
    endpoint: '/api/crm/leads/{id}/schedule',
    method: 'POST',
    avgResponseTime: 420,
    requestCount: 2150,
    successRate: 96.5,
    errorRate: 3.5,
    p95ResponseTime: 850,
    throughput: 25.8
  }
]

const responseTimeData = [
  { time: '00:00', value: 145 },
  { time: '04:00', value: 132 },
  { time: '08:00', value: 178 },
  { time: '12:00', value: 210 },
  { time: '16:00', value: 195 },
  { time: '20:00', value: 165 }
]

const statusCodeDistribution = [
  { name: '2xx Success', value: 94.2, color: '#22c55e' },
  { name: '4xx Client Error', value: 4.8, color: '#f59e0b' },
  { name: '5xx Server Error', value: 1.0, color: '#ef4444' }
]

interface ApiPerformanceMonitorProps {
  companyId: string
  userId: string
}

export function ApiPerformanceMonitor({ companyId, userId }: ApiPerformanceMonitorProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 98.5,
    api: 99.2,
    database: 97.8,
    cache: 99.9,
    realtime: 98.1
  })
  const [selectedMetric, setSelectedMetric] = useState<string>('responseTime')
  const [timeRange, setTimeRange] = useState<string>('24h')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        overall: Math.max(95, Math.min(100, prev.overall + (Math.random() - 0.5) * 2)),
        api: Math.max(95, Math.min(100, prev.api + (Math.random() - 0.5) * 2)),
        database: Math.max(90, Math.min(100, prev.database + (Math.random() - 0.5) * 3)),
        cache: Math.max(98, Math.min(100, prev.cache + (Math.random() - 0.5) * 1)),
        realtime: Math.max(95, Math.min(100, prev.realtime + (Math.random() - 0.5) * 2))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (value: number) => {
    if (value >= 99) return 'text-green-600'
    if (value >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthIcon = (value: number) => {
    if (value >= 99) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (value >= 95) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.overall)}`}>
                  {systemHealth.overall.toFixed(1)}%
                </p>
              </div>
              {getHealthIcon(systemHealth.overall)}
            </div>
            <Progress value={systemHealth.overall} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Performance</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.api)}`}>
                  {systemHealth.api.toFixed(1)}%
                </p>
              </div>
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <Progress value={systemHealth.api} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.database)}`}>
                  {systemHealth.database.toFixed(1)}%
                </p>
              </div>
              <Database className="h-4 w-4 text-purple-600" />
            </div>
            <Progress value={systemHealth.database} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.cache)}`}>
                  {systemHealth.cache.toFixed(1)}%
                </p>
              </div>
              <Zap className="h-4 w-4 text-orange-600" />
            </div>
            <Progress value={systemHealth.cache} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Real-time</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.realtime)}`}>
                  {systemHealth.realtime.toFixed(1)}%
                </p>
              </div>
              <Activity className="h-4 w-4 text-green-600" />
            </div>
            <Progress value={systemHealth.realtime} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Time Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Response Times</CardTitle>
                  <CardDescription>Average response times over the last 24 hours</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={timeRange === '1h' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('1h')}
                  >
                    1H
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '24h' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('24h')}
                  >
                    24H
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '7d' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('7d')}
                  >
                    7D
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => [`${value}ms`, 'Avg Response Time']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Code Distribution */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Response Status Distribution</CardTitle>
              <CardDescription>HTTP status code breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusCodeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statusCodeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusCodeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Endpoint Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance Metrics</CardTitle>
          <CardDescription>
            Detailed performance statistics for each API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Endpoint</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-right p-2">Avg Response</th>
                  <th className="text-right p-2">P95 Response</th>
                  <th className="text-right p-2">Requests</th>
                  <th className="text-right p-2">Success Rate</th>
                  <th className="text-right p-2">Throughput</th>
                </tr>
              </thead>
              <tbody>
                {mockMetrics.map((metric, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <code className="text-xs font-mono">{metric.endpoint}</code>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{metric.method}</Badge>
                    </td>
                    <td className="text-right p-2">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono text-sm">{metric.avgResponseTime}ms</span>
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <span className="font-mono text-sm">{metric.p95ResponseTime}ms</span>
                    </td>
                    <td className="text-right p-2">
                      <span className="font-mono text-sm">
                        {metric.requestCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <div className="flex items-center justify-end gap-1">
                        {metric.successRate >= 99 ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : metric.successRate >= 95 ? (
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span className="font-mono text-sm">{metric.successRate}%</span>
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <div className="flex items-center justify-end gap-1">
                        <TrendUp className="h-3 w-3 text-green-600" />
                        <span className="font-mono text-sm">{metric.throughput}/s</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Performance Alerts</CardTitle>
          <CardDescription>
            Active monitoring alerts and performance notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">All Systems Operational</p>
                  <p className="text-sm text-green-600">API performance is within normal parameters</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Elevated Response Times</p>
                  <p className="text-sm text-yellow-600">
                    /api/crm/leads/{'{id}'}/schedule showing higher than normal latency
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Warning
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Traffic Spike Detected</p>
                  <p className="text-sm text-blue-600">
                    30% increase in API requests over the last hour
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Info
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}