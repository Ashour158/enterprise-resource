import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Database, 
  Server, 
  Users, 
  Shield, 
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  TrendUp,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: { warning: number; critical: number }
  trend: 'up' | 'down' | 'stable'
  history: number[]
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'degraded'
  uptime: number
  responseTime: number
  lastCheck: Date
  dependencies: string[]
}

export function SystemStatusDashboard({ companyId }: { companyId: string }) {
  const [systemMetrics, setSystemMetrics] = useKV<SystemMetric[]>('system-metrics', [])
  const [services, setServices] = useKV<ServiceStatus[]>('service-status', [])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Initialize metrics and services
  useEffect(() => {
    initializeSystemData()
    const interval = setInterval(updateSystemData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const initializeSystemData = () => {
    const initialMetrics: SystemMetric[] = [
      {
        id: 'cpu-usage',
        name: 'CPU Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 70, critical: 90 },
        trend: 'stable',
        history: []
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 80, critical: 95 },
        trend: 'stable',
        history: []
      },
      {
        id: 'disk-usage',
        name: 'Disk Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 85, critical: 95 },
        trend: 'stable',
        history: []
      },
      {
        id: 'response-time',
        name: 'Avg Response Time',
        value: 0,
        unit: 'ms',
        status: 'healthy',
        threshold: { warning: 500, critical: 1000 },
        trend: 'stable',
        history: []
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: 0,
        unit: '%',
        status: 'healthy',
        threshold: { warning: 1, critical: 5 },
        trend: 'stable',
        history: []
      },
      {
        id: 'active-users',
        name: 'Active Users',
        value: 0,
        unit: '',
        status: 'healthy',
        threshold: { warning: 1000, critical: 1500 },
        trend: 'stable',
        history: []
      },
      {
        id: 'database-connections',
        name: 'DB Connections',
        value: 0,
        unit: '',
        status: 'healthy',
        threshold: { warning: 80, critical: 100 },
        trend: 'stable',
        history: []
      },
      {
        id: 'queue-size',
        name: 'Message Queue Size',
        value: 0,
        unit: '',
        status: 'healthy',
        threshold: { warning: 1000, critical: 5000 },
        trend: 'stable',
        history: []
      }
    ]

    const initialServices: ServiceStatus[] = [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        status: 'online',
        uptime: 99.9,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: ['database', 'redis']
      },
      {
        id: 'database',
        name: 'PostgreSQL Database',
        status: 'online',
        uptime: 99.95,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: []
      },
      {
        id: 'redis',
        name: 'Redis Cache',
        status: 'online',
        uptime: 99.8,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: []
      },
      {
        id: 'websocket',
        name: 'WebSocket Server',
        status: 'online',
        uptime: 99.7,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: ['redis']
      },
      {
        id: 'auth-service',
        name: 'Authentication Service',
        status: 'online',
        uptime: 99.9,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: ['database', 'redis']
      },
      {
        id: 'crm-service',
        name: 'CRM Service',
        status: 'online',
        uptime: 99.8,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: ['database', 'api-gateway']
      },
      {
        id: 'webhook-service',
        name: 'Webhook Service',
        status: 'online',
        uptime: 99.6,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: ['redis']
      },
      {
        id: 'file-storage',
        name: 'File Storage Service',
        status: 'online',
        uptime: 99.95,
        responseTime: 0,
        lastCheck: new Date(),
        dependencies: []
      }
    ]

    setSystemMetrics(initialMetrics)
    setServices(initialServices)
    updateSystemData()
  }

  const updateSystemData = async () => {
    setIsRefreshing(true)

    // Simulate realistic system metrics
    const updatedMetrics = systemMetrics.map(metric => {
      let newValue: number
      let trend: 'up' | 'down' | 'stable' = 'stable'

      switch (metric.id) {
        case 'cpu-usage':
          newValue = 20 + Math.random() * 40 + Math.sin(Date.now() / 100000) * 15
          break
        case 'memory-usage':
          newValue = 45 + Math.random() * 25 + Math.sin(Date.now() / 150000) * 10
          break
        case 'disk-usage':
          newValue = Math.min(metric.value + (Math.random() - 0.5) * 0.1, 95)
          break
        case 'response-time':
          newValue = 100 + Math.random() * 200 + Math.sin(Date.now() / 50000) * 50
          break
        case 'error-rate':
          newValue = Math.max(0, Math.random() * 2 + Math.sin(Date.now() / 200000) * 0.5)
          break
        case 'active-users':
          newValue = 200 + Math.random() * 300 + Math.sin(Date.now() / 80000) * 100
          break
        case 'database-connections':
          newValue = 15 + Math.random() * 25 + Math.sin(Date.now() / 120000) * 10
          break
        case 'queue-size':
          newValue = Math.max(0, Math.random() * 100 + Math.sin(Date.now() / 90000) * 50)
          break
        default:
          newValue = metric.value
      }

      // Determine trend
      if (metric.history.length > 0) {
        const lastValue = metric.history[metric.history.length - 1]
        if (newValue > lastValue * 1.05) trend = 'up'
        else if (newValue < lastValue * 0.95) trend = 'down'
      }

      // Determine status based on thresholds
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (newValue >= metric.threshold.critical) status = 'critical'
      else if (newValue >= metric.threshold.warning) status = 'warning'

      // Update history (keep last 50 points)
      const newHistory = [...metric.history, newValue].slice(-50)

      return {
        ...metric,
        value: Math.round(newValue * 100) / 100,
        status,
        trend,
        history: newHistory
      }
    })

    // Update services
    const updatedServices = services.map(service => {
      const responseTime = 10 + Math.random() * 100
      const isHealthy = Math.random() > 0.05 // 95% uptime simulation
      
      let status: 'online' | 'offline' | 'degraded' = 'online'
      if (!isHealthy) {
        status = Math.random() > 0.7 ? 'offline' : 'degraded'
      }

      return {
        ...service,
        status,
        responseTime: Math.round(responseTime),
        lastCheck: new Date(),
        uptime: isHealthy ? Math.min(service.uptime + 0.001, 100) : Math.max(service.uptime - 0.1, 90)
      }
    })

    setSystemMetrics(updatedMetrics)
    setServices(updatedServices)
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-500'
      case 'warning':
      case 'degraded':
        return 'text-yellow-500'
      case 'critical':
      case 'offline':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="text-green-500" size={size} />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" size={size} />
      case 'critical':
      case 'offline':
        return <AlertTriangle className="text-red-500" size={size} />
      default:
        return <Clock className="text-gray-400" size={size} />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendUp className="text-green-500" size={12} />
      case 'down':
        return <TrendUp className="text-red-500 rotate-180" size={12} />
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const getOverallHealth = () => {
    const criticalMetrics = systemMetrics.filter(m => m.status === 'critical').length
    const warningMetrics = systemMetrics.filter(m => m.status === 'warning').length
    const offlineServices = services.filter(s => s.status === 'offline').length
    const degradedServices = services.filter(s => s.status === 'degraded').length

    if (criticalMetrics > 0 || offlineServices > 0) return 'critical'
    if (warningMetrics > 1 || degradedServices > 0) return 'warning'
    return 'healthy'
  }

  const overallHealth = getOverallHealth()

  return (
    <div className="space-y-6">
      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(overallHealth, 20)}
                System Status Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all ERP system components and services
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                {isRefreshing ? 'Refreshing...' : 'Live'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map(metric => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {metric.id.includes('cpu') && <Cpu size={16} />}
                      {metric.id.includes('memory') && <Activity size={16} />}
                      {metric.id.includes('disk') && <HardDrive size={16} />}
                      {metric.id.includes('response') && <Zap size={16} />}
                      {metric.id.includes('error') && <AlertTriangle size={16} />}
                      {metric.id.includes('users') && <Users size={16} />}
                      {metric.id.includes('database') && <Database size={16} />}
                      {metric.id.includes('queue') && <Server size={16} />}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Warning: {metric.threshold.warning}{metric.unit}
                      </div>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>

                  {metric.status !== 'healthy' && (
                    <Progress 
                      value={Math.min((metric.value / metric.threshold.critical) * 100, 100)} 
                      className="h-1 mt-2"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        {service.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uptime: {service.uptime.toFixed(2)}%
                      </div>
                    </div>
                    <Badge variant={
                      service.status === 'online' ? 'default' :
                      service.status === 'degraded' ? 'secondary' : 'destructive'
                    }>
                      {service.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time:</span>
                      <span className={service.responseTime > 500 ? 'text-yellow-500' : 'text-green-500'}>
                        {service.responseTime}ms
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Last Check:</span>
                      <span className="text-muted-foreground">
                        {service.lastCheck.toLocaleTimeString()}
                      </span>
                    </div>

                    {service.dependencies.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Dependencies:</div>
                        <div className="flex flex-wrap gap-1">
                          {service.dependencies.map(dep => (
                            <Badge key={dep} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">requests/minute</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendUp size={12} />
                  +12% from last hour
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847 MB</div>
                <div className="text-sm text-muted-foreground">in last hour</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                  <Activity size={12} />
                  Normal range
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <div className="text-sm text-muted-foreground">cache efficiency</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <CheckCircle size={12} />
                  Excellent
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                System performance metrics over the last 24 hours
              </div>
              <div className="space-y-3">
                {systemMetrics.filter(m => m.history.length > 0).slice(0, 4).map(metric => (
                  <div key={metric.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.name}</span>
                      <span className={getStatusColor(metric.status)}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((metric.value / metric.threshold.critical) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {systemMetrics.filter(m => m.status !== 'healthy').length === 0 && 
           services.filter(s => s.status !== 'online').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                <h3 className="text-lg font-semibold mb-2">All Systems Operational</h3>
                <p className="text-muted-foreground">
                  No alerts or issues detected. All services are running normally.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {systemMetrics.filter(m => m.status !== 'healthy').map(metric => (
                <Alert key={metric.id} variant={metric.status === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{metric.name}</strong>: {metric.value}{metric.unit} 
                    {metric.status === 'critical' ? ' (Critical threshold exceeded)' : ' (Warning threshold exceeded)'}
                  </AlertDescription>
                </Alert>
              ))}

              {services.filter(s => s.status !== 'online').map(service => (
                <Alert key={service.id} variant={service.status === 'offline' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{service.name}</strong>: Service is {service.status}
                    {service.status === 'degraded' && ` (Response time: ${service.responseTime}ms)`}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}