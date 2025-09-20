import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Shield,
  Users,
  Building,
  Calendar,
  Globe,
  Zap,
  WifiHigh,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock
} from '@phosphor-icons/react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  threshold: {
    warning: number
    critical: number
  }
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'degraded'
  responseTime: number
  uptime: number
  lastCheck: string
  endpoint?: string
}

export function SystemStatusDashboard({ companyId }: { companyId: string }) {
  const [systemMetrics, setSystemMetrics] = useKV<SystemMetric[]>('system-metrics', [])
  const [serviceStatuses, setServiceStatuses] = useKV<ServiceStatus[]>('service-statuses', [])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  // Initialize metrics
  useEffect(() => {
    const defaultMetrics: SystemMetric[] = [
      {
        id: 'cpu-usage',
        name: 'CPU Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 70, critical: 90 }
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 80, critical: 95 }
      },
      {
        id: 'disk-usage',
        name: 'Disk Usage',
        value: 0,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 85, critical: 95 }
      },
      {
        id: 'response-time',
        name: 'Avg Response Time',
        value: 0,
        unit: 'ms',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 500, critical: 1000 }
      },
      {
        id: 'active-users',
        name: 'Active Users',
        value: 0,
        unit: 'users',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 1000, critical: 1500 }
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: 0,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        threshold: { warning: 2, critical: 5 }
      }
    ]

    const defaultServices: ServiceStatus[] = [
      {
        id: 'auth-service',
        name: 'Authentication Service',
        status: 'online',
        responseTime: 0,
        uptime: 99.9,
        lastCheck: new Date().toISOString(),
        endpoint: '/api/auth/health'
      },
      {
        id: 'user-service',
        name: 'User Management Service',
        status: 'online',
        responseTime: 0,
        uptime: 99.8,
        lastCheck: new Date().toISOString(),
        endpoint: '/api/users/health'
      },
      {
        id: 'crm-service',
        name: 'CRM Service',
        status: 'online',
        responseTime: 0,
        uptime: 99.7,
        lastCheck: new Date().toISOString(),
        endpoint: '/api/crm/health'
      },
      {
        id: 'calendar-service',
        name: 'Calendar Service',
        status: 'online',
        responseTime: 0,
        uptime: 99.9,
        lastCheck: new Date().toISOString(),
        endpoint: '/api/calendar/health'
      },
      {
        id: 'database',
        name: 'PostgreSQL Database',
        status: 'online',
        responseTime: 0,
        uptime: 99.95,
        lastCheck: new Date().toISOString()
      },
      {
        id: 'redis',
        name: 'Redis Cache',
        status: 'online',
        responseTime: 0,
        uptime: 99.9,
        lastCheck: new Date().toISOString()
      }
    ]

    setSystemMetrics(defaultMetrics)
    setServiceStatuses(defaultServices)
  }, [])

  // Simulate real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      updateMetrics()
      checkServices()
      setLastUpdate(new Date().toISOString())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isMonitoring])

  const updateMetrics = () => {
    setSystemMetrics(prev => prev.map(metric => {
      let newValue: number
      
      switch (metric.id) {
        case 'cpu-usage':
          newValue = Math.random() * 100
          break
        case 'memory-usage':
          newValue = 60 + Math.random() * 30 // 60-90%
          break
        case 'disk-usage':
          newValue = 45 + Math.random() * 20 // 45-65%
          break
        case 'response-time':
          newValue = 100 + Math.random() * 300 // 100-400ms
          break
        case 'active-users':
          newValue = 200 + Math.random() * 600 // 200-800 users
          break
        case 'error-rate':
          newValue = Math.random() * 3 // 0-3%
          break
        default:
          newValue = metric.value
      }

      const status = newValue >= metric.threshold.critical ? 'critical' :
                    newValue >= metric.threshold.warning ? 'warning' : 'healthy'

      const trend = newValue > metric.value ? 'up' : 
                   newValue < metric.value ? 'down' : 'stable'

      return { ...metric, value: newValue, status, trend }
    }))
  }

  const checkServices = () => {
    setServiceStatuses(prev => prev.map(service => {
      // Simulate service health checks
      const isHealthy = Math.random() > 0.05 // 95% uptime simulation
      const responseTime = 50 + Math.random() * 200 // 50-250ms
      
      return {
        ...service,
        status: isHealthy ? 'online' : Math.random() > 0.5 ? 'degraded' : 'offline',
        responseTime,
        uptime: Math.max(service.uptime - (isHealthy ? 0 : 0.1), 95),
        lastCheck: new Date().toISOString()
      }
    }))
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    updateMetrics()
    checkServices()
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="text-green-500" size={16} />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" size={16} />
      case 'critical':
      case 'offline':
        return <XCircle className="text-red-500" size={16} />
      default:
        return <Activity className="text-gray-400" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
      case 'offline':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'cpu-usage': return <Cpu size={16} />
      case 'memory-usage': return <MemoryStick size={16} />
      case 'disk-usage': return <HardDrive size={16} />
      case 'response-time': return <Clock size={16} />
      case 'active-users': return <Users size={16} />
      case 'error-rate': return <AlertTriangle size={16} />
      default: return <Activity size={16} />
    }
  }

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'auth-service': return <Shield size={16} />
      case 'user-service': return <Users size={16} />
      case 'crm-service': return <Building size={16} />
      case 'calendar-service': return <Calendar size={16} />
      case 'database': return <Database size={16} />
      case 'redis': return <Zap size={16} />
      default: return <Globe size={16} />
    }
  }

  const overallHealth = () => {
    const criticalServices = serviceStatuses.filter(s => s.status === 'offline').length
    const degradedServices = serviceStatuses.filter(s => s.status === 'degraded').length
    const criticalMetrics = systemMetrics.filter(m => m.status === 'critical').length
    
    if (criticalServices > 0 || criticalMetrics > 0) return 'critical'
    if (degradedServices > 0) return 'warning'
    return 'healthy'
  }

  const health = overallHealth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                System Status Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of system health and performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isMonitoring ? (
                <Button onClick={startMonitoring} className="flex items-center gap-2">
                  <WifiHigh size={16} />
                  Start Monitoring
                </Button>
              ) : (
                <Button onClick={stopMonitoring} variant="outline" className="flex items-center gap-2">
                  <Activity size={16} className="animate-pulse" />
                  Stop Monitoring
                </Button>
              )}
              <Badge variant={
                health === 'healthy' ? 'default' :
                health === 'warning' ? 'secondary' : 'destructive'
              }>
                {health.charAt(0).toUpperCase() + health.slice(1)}
              </Badge>
            </div>
          </div>
          
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={18} />
            System Metrics
          </CardTitle>
          <CardDescription>
            Real-time performance and resource utilization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map(metric => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.id)}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}{metric.unit}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                    
                    {metric.unit === '%' && (
                      <Progress 
                        value={metric.value} 
                        className={`h-2 ${
                          metric.status === 'critical' ? 'bg-red-100' :
                          metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      />
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Warning: {metric.threshold.warning}{metric.unit} | 
                      Critical: {metric.threshold.critical}{metric.unit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={18} />
            Service Status
          </CardTitle>
          <CardDescription>
            Health status of all system services and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceStatuses.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.id)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {service.uptime.toFixed(2)}% | Response: {service.responseTime.toFixed(0)}ms
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={
                    service.status === 'online' ? 'default' :
                    service.status === 'degraded' ? 'secondary' : 'destructive'
                  }>
                    {service.status}
                  </Badge>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {health !== 'healthy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemMetrics
                .filter(m => m.status !== 'healthy')
                .map(metric => (
                  <Alert key={metric.id}>
                    {getStatusIcon(metric.status)}
                    <AlertDescription>
                      <strong>{metric.name}</strong>: {metric.value.toFixed(1)}{metric.unit} 
                      {metric.status === 'critical' ? ' (Critical threshold exceeded)' : ' (Warning threshold exceeded)'}
                    </AlertDescription>
                  </Alert>
                ))}
              
              {serviceStatuses
                .filter(s => s.status !== 'online')
                .map(service => (
                  <Alert key={service.id}>
                    {getStatusIcon(service.status)}
                    <AlertDescription>
                      <strong>{service.name}</strong>: Service is {service.status}
                      {service.status === 'offline' ? ' and requires immediate attention' : ' with degraded performance'}
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}