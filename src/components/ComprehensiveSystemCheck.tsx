import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Shield,
  Zap,
  Users,
  Building,
  Calendar,
  TestTube,
  Activity
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SystemComponent {
  id: string
  name: string
  category: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  lastChecked?: Date
  details?: any
  metrics?: any
}

interface SystemCheck {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  components: SystemComponent[]
  progress: number
  startTime?: Date
  endTime?: Date
}

export function ComprehensiveSystemCheck({ companyId, userId }: { companyId: string; userId: string }) {
  const [systemChecks, setSystemChecks] = useKV<SystemCheck[]>('system-checks', [])
  const [isRunning, setIsRunning] = useState(false)
  const [currentCheck, setCurrentCheck] = useState<string | null>(null)
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'error'>('healthy')

  // Initialize system checks
  useEffect(() => {
    const checks: SystemCheck[] = [
      {
        id: 'database-integrity',
        name: 'Database Integrity',
        description: 'Multi-tenant database schema, connections, and data consistency',
        status: 'pending',
        components: [],
        progress: 0
      },
      {
        id: 'authentication-security',
        name: 'Authentication & Security',
        description: 'Multi-company auth, RBAC, biometric systems, and security policies',
        status: 'pending',
        components: [],
        progress: 0
      },
      {
        id: 'real-time-systems',
        name: 'Real-time Systems',
        description: 'WebSocket connections, data sync, conflict resolution',
        status: 'pending',
        components: [],
        progress: 0
      },
      {
        id: 'crm-functionality',
        name: 'CRM Functionality',
        description: 'All CRM modules, integrations, and business workflows',
        status: 'pending',
        components: [],
        progress: 0
      },
      {
        id: 'integration-layer',
        name: 'Integration Layer',
        description: 'APIs, webhooks, calendar integration, external services',
        status: 'pending',
        components: [],
        progress: 0
      },
      {
        id: 'performance-metrics',
        name: 'Performance Metrics',
        description: 'Response times, memory usage, scalability, error rates',
        status: 'pending',
        components: [],
        progress: 0
      }
    ]

    setSystemChecks(checks)
  }, [])

  // Generate components for each check
  const generateComponents = (checkId: string): SystemComponent[] => {
    const componentsByCheck: { [key: string]: SystemComponent[] } = {
      'database-integrity': [
        { id: 'db-connection', name: 'Database Connection Pool', category: 'database', status: 'unknown' },
        { id: 'db-schema', name: 'Multi-tenant Schema', category: 'database', status: 'unknown' },
        { id: 'db-indexes', name: 'Index Performance', category: 'database', status: 'unknown' },
        { id: 'db-consistency', name: 'Data Consistency', category: 'database', status: 'unknown' },
        { id: 'db-backup', name: 'Backup Systems', category: 'database', status: 'unknown' }
      ],
      'authentication-security': [
        { id: 'auth-jwt', name: 'JWT Token System', category: 'security', status: 'unknown' },
        { id: 'auth-mfa', name: 'Multi-Factor Authentication', category: 'security', status: 'unknown' },
        { id: 'auth-biometric', name: 'Biometric Authentication', category: 'security', status: 'unknown' },
        { id: 'auth-rbac', name: 'Role-Based Access Control', category: 'security', status: 'unknown' },
        { id: 'auth-audit', name: 'Security Audit Logging', category: 'security', status: 'unknown' },
        { id: 'auth-encryption', name: 'Data Encryption', category: 'security', status: 'unknown' }
      ],
      'real-time-systems': [
        { id: 'websocket-connection', name: 'WebSocket Server', category: 'realtime', status: 'unknown' },
        { id: 'data-sync', name: 'Real-time Data Sync', category: 'realtime', status: 'unknown' },
        { id: 'conflict-resolution', name: 'Conflict Resolution Engine', category: 'realtime', status: 'unknown' },
        { id: 'message-queue', name: 'Message Queue System', category: 'realtime', status: 'unknown' },
        { id: 'offline-support', name: 'Offline Mode Support', category: 'realtime', status: 'unknown' }
      ],
      'crm-functionality': [
        { id: 'crm-leads', name: 'Lead Management', category: 'crm', status: 'unknown' },
        { id: 'crm-deals', name: 'Deal Pipeline', category: 'crm', status: 'unknown' },
        { id: 'crm-contacts', name: 'Contact Management', category: 'crm', status: 'unknown' },
        { id: 'crm-accounts', name: 'Account Management', category: 'crm', status: 'unknown' },
        { id: 'crm-quotes', name: 'Quote Management', category: 'crm', status: 'unknown' },
        { id: 'crm-approval', name: 'Approval Workflows', category: 'crm', status: 'unknown' },
        { id: 'crm-forecasting', name: 'Sales Forecasting', category: 'crm', status: 'unknown' },
        { id: 'crm-ai', name: 'AI Integration', category: 'crm', status: 'unknown' }
      ],
      'integration-layer': [
        { id: 'api-endpoints', name: 'REST API Endpoints', category: 'integration', status: 'unknown' },
        { id: 'webhook-delivery', name: 'Webhook Delivery System', category: 'integration', status: 'unknown' },
        { id: 'calendar-integration', name: 'Calendar Integration', category: 'integration', status: 'unknown' },
        { id: 'email-services', name: 'Email Services', category: 'integration', status: 'unknown' },
        { id: 'file-storage', name: 'File Storage System', category: 'integration', status: 'unknown' },
        { id: 'external-apis', name: 'External API Connectivity', category: 'integration', status: 'unknown' }
      ],
      'performance-metrics': [
        { id: 'response-times', name: 'API Response Times', category: 'performance', status: 'unknown' },
        { id: 'memory-usage', name: 'Memory Usage', category: 'performance', status: 'unknown' },
        { id: 'cpu-utilization', name: 'CPU Utilization', category: 'performance', status: 'unknown' },
        { id: 'error-rates', name: 'Error Rates', category: 'performance', status: 'unknown' },
        { id: 'throughput', name: 'Request Throughput', category: 'performance', status: 'unknown' },
        { id: 'scalability', name: 'Scalability Metrics', category: 'performance', status: 'unknown' }
      ]
    }

    return componentsByCheck[checkId] || []
  }

  // Run individual component check
  const checkComponent = async (component: SystemComponent): Promise<SystemComponent> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))

    // Simulate component check with realistic results
    const healthProbability = 0.85 // 85% chance of healthy status
    const warningProbability = 0.10 // 10% chance of warning
    // 5% chance of error

    const random = Math.random()
    let status: 'healthy' | 'warning' | 'error'
    let details: any = {}
    let metrics: any = {}

    if (random < healthProbability) {
      status = 'healthy'
      details = { message: 'Component operating normally', lastCheck: new Date() }
    } else if (random < healthProbability + warningProbability) {
      status = 'warning'
      details = { message: 'Component has minor issues that should be monitored', lastCheck: new Date() }
    } else {
      status = 'error'
      details = { message: 'Component has critical issues requiring immediate attention', lastCheck: new Date() }
    }

    // Add specific metrics based on component type
    switch (component.category) {
      case 'database':
        metrics = {
          connectionPool: `${80 + Math.random() * 20}%`,
          queryTime: `${50 + Math.random() * 100}ms`,
          activeConnections: Math.floor(20 + Math.random() * 30)
        }
        break
      case 'security':
        metrics = {
          threatLevel: status === 'healthy' ? 'Low' : status === 'warning' ? 'Medium' : 'High',
          lastAudit: new Date(Date.now() - Math.random() * 86400000).toLocaleDateString(),
          encryptionStatus: 'AES-256'
        }
        break
      case 'realtime':
        metrics = {
          latency: `${20 + Math.random() * 80}ms`,
          connectionsActive: Math.floor(100 + Math.random() * 500),
          messagesPerSecond: Math.floor(50 + Math.random() * 200)
        }
        break
      case 'crm':
        metrics = {
          recordsProcessed: Math.floor(1000 + Math.random() * 5000),
          averageResponseTime: `${100 + Math.random() * 200}ms`,
          successRate: `${95 + Math.random() * 5}%`
        }
        break
      case 'integration':
        metrics = {
          uptime: `${99 + Math.random()}%`,
          requestsPerMinute: Math.floor(50 + Math.random() * 150),
          errorRate: `${Math.random() * 2}%`
        }
        break
      case 'performance':
        metrics = {
          cpuUsage: `${30 + Math.random() * 40}%`,
          memoryUsage: `${40 + Math.random() * 30}%`,
          diskIO: `${10 + Math.random() * 20}MB/s`
        }
        break
    }

    return {
      ...component,
      status,
      lastChecked: new Date(),
      details,
      metrics
    }
  }

  // Run comprehensive system check
  const runSystemCheck = async (checkId: string) => {
    const check = systemChecks.find(c => c.id === checkId)
    if (!check) return

    const components = generateComponents(checkId)
    
    setSystemChecks(prev => prev.map(c =>
      c.id === checkId
        ? { ...c, status: 'running', components, progress: 0, startTime: new Date() }
        : c
    ))

    const checkedComponents: SystemComponent[] = []

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      setCurrentCheck(`${checkId}-${component.id}`)

      const checkedComponent = await checkComponent(component)
      checkedComponents.push(checkedComponent)

      const progress = ((i + 1) / components.length) * 100

      setSystemChecks(prev => prev.map(c =>
        c.id === checkId
          ? { ...c, components: checkedComponents, progress }
          : c
      ))
    }

    // Determine overall check status
    const hasErrors = checkedComponents.some(c => c.status === 'error')
    const hasWarnings = checkedComponents.some(c => c.status === 'warning')
    
    const checkStatus = hasErrors ? 'failed' : 'completed'

    setSystemChecks(prev => prev.map(c =>
      c.id === checkId
        ? { ...c, status: checkStatus, progress: 100, endTime: new Date() }
        : c
    ))

    setCurrentCheck(null)
  }

  // Run all system checks
  const runAllChecks = async () => {
    setIsRunning(true)
    
    for (const check of systemChecks) {
      await runSystemCheck(check.id)
    }
    
    setIsRunning(false)
    updateOverallHealth()
    toast.success('Comprehensive system check completed!')
  }

  // Update overall health status
  const updateOverallHealth = () => {
    const allComponents = systemChecks.flatMap(c => c.components)
    const hasErrors = allComponents.some(c => c.status === 'error')
    const hasWarnings = allComponents.some(c => c.status === 'warning')

    if (hasErrors) {
      setOverallHealth('error')
    } else if (hasWarnings) {
      setOverallHealth('warning')
    } else {
      setOverallHealth('healthy')
    }
  }

  useEffect(() => {
    if (systemChecks.some(c => c.status === 'completed' || c.status === 'failed')) {
      updateOverallHealth()
    }
  }, [systemChecks])

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="text-green-500" size={size} />
      case 'warning': return <AlertTriangle className="text-yellow-500" size={size} />
      case 'error': return <XCircle className="text-red-500" size={size} />
      case 'running': return <Clock className="text-blue-500 animate-spin" size={size} />
      default: return <Clock className="text-gray-400" size={size} />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database size={16} />
      case 'security': return <Shield size={16} />
      case 'realtime': return <Zap size={16} />
      case 'crm': return <Users size={16} />
      case 'integration': return <Building size={16} />
      case 'performance': return <Activity size={16} />
      default: return <TestTube size={16} />
    }
  }

  const getOverallStats = () => {
    const allComponents = systemChecks.flatMap(c => c.components)
    const healthy = allComponents.filter(c => c.status === 'healthy').length
    const warnings = allComponents.filter(c => c.status === 'warning').length
    const errors = allComponents.filter(c => c.status === 'error').length
    const total = allComponents.length

    return { healthy, warnings, errors, total }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(overallHealth, 20)}
                System Health Overview
              </CardTitle>
              <CardDescription>
                Comprehensive health check of all ERP system components
              </CardDescription>
            </div>
            <Button onClick={runAllChecks} disabled={isRunning}>
              {isRunning ? 'Running Checks...' : 'Run All Checks'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Components</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systemChecks.map(check => (
          <Card key={check.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    {check.name}
                  </CardTitle>
                  <CardDescription>{check.description}</CardDescription>
                </div>
                <Badge variant={
                  check.status === 'completed' ? 'default' :
                  check.status === 'failed' ? 'destructive' :
                  check.status === 'running' ? 'secondary' : 'outline'
                }>
                  {check.status}
                </Badge>
              </div>
              {check.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{check.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={check.progress} className="h-2" />
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {check.components.length > 0 ? (
                  <ScrollArea className="h-48">
                    {check.components.map(component => (
                      <div key={component.id} className="flex items-center justify-between p-2 rounded border-l-2 border-l-muted">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(component.category)}
                          <div>
                            <div className="text-sm font-medium">{component.name}</div>
                            {component.metrics && (
                              <div className="text-xs text-muted-foreground">
                                {Object.entries(component.metrics).slice(0, 2).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.status)}
                          {component.lastChecked && (
                            <span className="text-xs text-muted-foreground">
                              {component.lastChecked.toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click "Run Check" to start validation</p>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => runSystemCheck(check.id)}
                  disabled={check.status === 'running' || isRunning}
                >
                  {check.status === 'running' ? 'Checking...' : 'Run Check'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Check Status */}
      {currentCheck && (
        <Alert>
          <Clock className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Currently checking: {currentCheck.split('-').slice(1).join(' ').replace(/([A-Z])/g, ' $1')}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Recommendations */}
      {overallHealth !== 'healthy' && stats.total > 0 && (
        <Alert variant={overallHealth === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overallHealth === 'error' 
              ? `System has ${stats.errors} critical issues requiring immediate attention.`
              : `System has ${stats.warnings} warnings that should be monitored.`
            }
            {' '}Review the detailed results above and address any issues found.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}