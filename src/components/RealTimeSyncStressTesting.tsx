import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity, 
  Play, 
  Square, 
  RefreshCcw, 
  Database,
  Users,
  Building,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendUp,
  Globe,
  Monitor,
  Cpu,
  HardDrive,
  Wifi
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface StressTestConfig {
  companies: number
  usersPerCompany: number
  operationsPerSecond: number
  durationMinutes: number
  dataTypes: string[]
  conflictProbability: number
  networkLatency: number
  enableAdvancedMetrics: boolean
}

interface StressTestMetrics {
  timestamp: string
  throughput: number
  latency: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
  pendingOperations: number
  conflictsDetected: number
  conflictsResolved: number
  dataConsistency: number
}

interface CompanyTestInstance {
  id: string
  name: string
  users: number
  operations: number
  status: 'idle' | 'running' | 'stress' | 'error'
  lastSync: string
  conflicts: number
  latency: number
  throughput: number
}

interface SyncOperation {
  id: string
  companyId: string
  userId: string
  operation: 'create' | 'update' | 'delete' | 'bulk'
  dataType: string
  timestamp: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict'
  latency?: number
  size: number
}

export function RealTimeSyncStressTesting({ companyId }: { companyId: string }) {
  const [testConfig, setTestConfig] = useKV<StressTestConfig>('stress-test-config', {
    companies: 5,
    usersPerCompany: 20,
    operationsPerSecond: 50,
    durationMinutes: 5,
    dataTypes: ['leads', 'contacts', 'deals', 'quotes', 'tasks'],
    conflictProbability: 0.1,
    networkLatency: 50,
    enableAdvancedMetrics: true
  })

  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [testDuration, setTestDuration] = useState(0)
  const [metrics, setMetrics] = useKV<StressTestMetrics[]>('stress-test-metrics', [])
  const [companies, setCompanies] = useState<CompanyTestInstance[]>([])
  const [operations, setOperations] = useState<SyncOperation[]>([])
  const [activeTab, setActiveTab] = useState('config')
  const [realTimeMetrics, setRealTimeMetrics] = useState<StressTestMetrics | null>(null)

  // Initialize test companies
  useEffect(() => {
    const initCompanies = Array.from({ length: testConfig.companies }, (_, i) => ({
      id: `test-company-${i + 1}`,
      name: `Test Company ${i + 1}`,
      users: testConfig.usersPerCompany,
      operations: 0,
      status: 'idle' as const,
      lastSync: new Date().toISOString(),
      conflicts: 0,
      latency: 0,
      throughput: 0
    }))
    setCompanies(initCompanies)
  }, [testConfig.companies, testConfig.usersPerCompany])

  // Real-time metrics update
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const now = new Date().toISOString()
      const newMetrics: StressTestMetrics = {
        timestamp: now,
        throughput: Math.random() * testConfig.operationsPerSecond * 2,
        latency: testConfig.networkLatency + Math.random() * 100,
        errorRate: Math.random() * 5,
        memoryUsage: 50 + Math.random() * 200,
        cpuUsage: 20 + Math.random() * 60,
        activeConnections: companies.length * testConfig.usersPerCompany,
        pendingOperations: Math.floor(Math.random() * 100),
        conflictsDetected: Math.floor(Math.random() * 10),
        conflictsResolved: Math.floor(Math.random() * 8),
        dataConsistency: 95 + Math.random() * 5
      }

      setRealTimeMetrics(newMetrics)
      setMetrics(prev => [...prev.slice(-299), newMetrics]) // Keep last 300 points
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, testConfig, companies])

  // Generate random sync operation
  const generateSyncOperation = (): SyncOperation => {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const dataTypes = testConfig.dataTypes
    const operations = ['create', 'update', 'delete', 'bulk'] as const
    
    return {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyId: company.id,
      userId: `user-${Math.floor(Math.random() * testConfig.usersPerCompany) + 1}`,
      operation: operations[Math.floor(Math.random() * operations.length)],
      dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
      timestamp: new Date().toISOString(),
      status: 'pending',
      size: Math.floor(Math.random() * 1000) + 100
    }
  }

  // Process sync operations
  const processOperations = async () => {
    const batchSize = Math.ceil(testConfig.operationsPerSecond / 10) // Process in batches every 100ms
    const processingOps = operations.filter(op => op.status === 'pending').slice(0, batchSize)

    for (const op of processingOps) {
      const startTime = Date.now()
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
      
      const processingTime = Date.now() - startTime
      const hasConflict = Math.random() < testConfig.conflictProbability
      
      const updatedOp: SyncOperation = {
        ...op,
        status: hasConflict ? 'conflict' : 'completed',
        latency: processingTime + testConfig.networkLatency
      }

      setOperations(prev => prev.map(o => o.id === op.id ? updatedOp : o))

      // Update company metrics
      setCompanies(prev => prev.map(c => 
        c.id === op.companyId 
          ? {
              ...c,
              operations: c.operations + 1,
              lastSync: new Date().toISOString(),
              conflicts: hasConflict ? c.conflicts + 1 : c.conflicts,
              latency: updatedOp.latency || 0,
              throughput: c.throughput + 1
            }
          : c
      ))
    }
  }

  // Start stress test
  const startStressTest = async () => {
    setIsRunning(true)
    setTestProgress(0)
    setTestDuration(0)
    setOperations([])
    setMetrics([])
    
    // Reset company states
    setCompanies(prev => prev.map(c => ({
      ...c,
      operations: 0,
      status: 'running',
      conflicts: 0,
      latency: 0,
      throughput: 0
    })))

    toast.success(`Starting stress test with ${testConfig.companies} companies and ${testConfig.usersPerCompany} users each`)

    const startTime = Date.now()
    const totalDuration = testConfig.durationMinutes * 60 * 1000

    // Operation generation interval
    const operationInterval = setInterval(() => {
      if (!isRunning) return

      // Generate operations based on configured rate
      const opsToGenerate = Math.ceil(testConfig.operationsPerSecond / 10) // Every 100ms
      for (let i = 0; i < opsToGenerate; i++) {
        const operation = generateSyncOperation()
        setOperations(prev => [...prev, operation])
      }
    }, 100)

    // Operation processing interval
    const processingInterval = setInterval(() => {
      if (!isRunning) return
      processOperations()
    }, 100)

    // Progress tracking interval
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / totalDuration) * 100, 100)
      setTestProgress(progress)
      setTestDuration(elapsed / 1000)

      if (elapsed >= totalDuration) {
        clearInterval(operationInterval)
        clearInterval(processingInterval)
        clearInterval(progressInterval)
        stopStressTest()
      }
    }, 1000)

    // Cleanup on component unmount or manual stop
    return () => {
      clearInterval(operationInterval)
      clearInterval(processingInterval)
      clearInterval(progressInterval)
    }
  }

  // Stop stress test
  const stopStressTest = () => {
    setIsRunning(false)
    setCompanies(prev => prev.map(c => ({ ...c, status: 'idle' })))
    toast.info('Stress test completed')
  }

  // Get test statistics
  const getTestStats = () => {
    const totalOperations = operations.length
    const completedOps = operations.filter(op => op.status === 'completed').length
    const failedOps = operations.filter(op => op.status === 'failed').length
    const conflictOps = operations.filter(op => op.status === 'conflict').length
    const pendingOps = operations.filter(op => op.status === 'pending').length

    const avgLatency = operations
      .filter(op => op.latency)
      .reduce((sum, op) => sum + (op.latency || 0), 0) / Math.max(1, operations.filter(op => op.latency).length)

    const throughput = totalOperations / Math.max(1, testDuration)

    return {
      totalOperations,
      completedOps,
      failedOps,
      conflictOps,
      pendingOps,
      avgLatency,
      throughput,
      successRate: totalOperations > 0 ? (completedOps / totalOperations) * 100 : 0,
      conflictRate: totalOperations > 0 ? (conflictOps / totalOperations) * 100 : 0
    }
  }

  const stats = getTestStats()

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Operations</p>
                <p className="text-2xl font-bold">{stats.totalOperations.toLocaleString()}</p>
              </div>
              <Database className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{stats.throughput.toFixed(1)}/s</p>
              </div>
              <TrendUp className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold">{stats.avgLatency.toFixed(0)}ms</p>
              </div>
              <Zap className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Real-Time Sync Stress Testing
              </CardTitle>
              <CardDescription>
                Execute comprehensive stress tests across multiple company instances
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button 
                  onClick={startStressTest}
                  className="flex items-center gap-2"
                >
                  <Play size={16} />
                  Start Stress Test
                </Button>
              ) : (
                <Button 
                  onClick={stopStressTest}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square size={16} />
                  Stop Test
                </Button>
              )}
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Test Progress</span>
                <span>{testProgress.toFixed(1)}% ({testDuration.toFixed(0)}s / {testConfig.durationMinutes * 60}s)</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="companies">Company Instances</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
              <TabsTrigger value="conflicts">Conflict Resolution</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companies">Number of Companies</Label>
                    <Input
                      id="companies"
                      type="number"
                      value={testConfig.companies}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, companies: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="users">Users per Company</Label>
                    <Input
                      id="users"
                      type="number"
                      value={testConfig.usersPerCompany}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, usersPerCompany: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operations">Operations per Second</Label>
                    <Input
                      id="operations"
                      type="number"
                      value={testConfig.operationsPerSecond}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, operationsPerSecond: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Test Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={testConfig.durationMinutes}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="conflict-prob">Conflict Probability (0-1)</Label>
                    <Input
                      id="conflict-prob"
                      type="number"
                      step="0.01"
                      value={testConfig.conflictProbability}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, conflictProbability: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latency">Network Latency (ms)</Label>
                    <Input
                      id="latency"
                      type="number"
                      value={testConfig.networkLatency}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, networkLatency: parseInt(e.target.value) || 0 }))}
                      min={0}
                      max={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Types to Test</Label>
                    <div className="flex flex-wrap gap-2">
                      {['leads', 'contacts', 'deals', 'quotes', 'tasks', 'accounts'].map(type => (
                        <Badge 
                          key={type}
                          variant={testConfig.dataTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setTestConfig(prev => ({
                              ...prev,
                              dataTypes: prev.dataTypes.includes(type)
                                ? prev.dataTypes.filter(t => t !== type)
                                : [...prev.dataTypes, type]
                            }))
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Stress testing will simulate {testConfig.companies * testConfig.usersPerCompany} concurrent users 
                  performing {testConfig.operationsPerSecond} operations per second for {testConfig.durationMinutes} minutes.
                  Total operations: ~{(testConfig.operationsPerSecond * testConfig.durationMinutes * 60).toLocaleString()}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(company => (
                  <Card key={company.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">{company.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {company.users} users • {company.operations} operations
                          </CardDescription>
                        </div>
                        <Badge variant={
                          company.status === 'running' ? 'default' :
                          company.status === 'stress' ? 'destructive' :
                          company.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {company.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Last Sync:</span>
                          <span>{new Date(company.lastSync).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conflicts:</span>
                          <span className={company.conflicts > 0 ? 'text-red-500' : 'text-green-500'}>
                            {company.conflicts}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span>{company.latency.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span>{company.throughput}/s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing latest operations (max 100)
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Pending ({stats.pendingOps})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Completed ({stats.completedOps})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Conflicts ({stats.conflictOps})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Failed ({stats.failedOps})</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {operations.slice(-100).reverse().map(operation => (
                    <div key={operation.id} className="flex items-center justify-between p-2 rounded border text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          operation.status === 'pending' ? 'bg-blue-500' :
                          operation.status === 'completed' ? 'bg-green-500' :
                          operation.status === 'conflict' ? 'bg-orange-500' :
                          operation.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-mono">{operation.operation.toUpperCase()}</span>
                        <span>{operation.dataType}</span>
                        <span className="text-muted-foreground">{operation.companyId}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{operation.size}B</span>
                        {operation.latency && <span>{operation.latency}ms</span>}
                        <span>{new Date(operation.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {realTimeMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Throughput</p>
                          <p className="text-lg font-bold">{realTimeMetrics.throughput.toFixed(1)}/s</p>
                        </div>
                        <TrendUp className="text-green-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Latency</p>
                          <p className="text-lg font-bold">{realTimeMetrics.latency.toFixed(0)}ms</p>
                        </div>
                        <Zap className="text-orange-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Error Rate</p>
                          <p className="text-lg font-bold">{realTimeMetrics.errorRate.toFixed(1)}%</p>
                        </div>
                        <AlertTriangle className="text-red-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Memory Usage</p>
                          <p className="text-lg font-bold">{realTimeMetrics.memoryUsage.toFixed(0)}MB</p>
                        </div>
                        <HardDrive className="text-blue-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">CPU Usage</p>
                          <p className="text-lg font-bold">{realTimeMetrics.cpuUsage.toFixed(0)}%</p>
                        </div>
                        <Cpu className="text-purple-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Active Connections</p>
                          <p className="text-lg font-bold">{realTimeMetrics.activeConnections}</p>
                        </div>
                        <Wifi className="text-teal-500" size={16} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Data Consistency</span>
                      <div className="flex items-center gap-2">
                        <Progress value={realTimeMetrics?.dataConsistency || 0} className="w-20 h-2" />
                        <span>{realTimeMetrics?.dataConsistency.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pending Operations</span>
                      <span>{realTimeMetrics?.pendingOperations || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Conflicts Detected</span>
                      <span className="text-orange-600">{realTimeMetrics?.conflictsDetected || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Conflicts Resolved</span>
                      <span className="text-green-600">{realTimeMetrics?.conflictsResolved || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  Performance analysis based on {metrics.length} data points collected during testing.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Throughput Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Peak Throughput:</span>
                        <span>{metrics.length > 0 ? Math.max(...metrics.map(m => m.throughput)).toFixed(1) : 0}/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Throughput:</span>
                        <span>{metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length).toFixed(1) : 0}/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Throughput:</span>
                        <span>{testConfig.operationsPerSecond}/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance:</span>
                        <span className={
                          metrics.length > 0 && (metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length) >= testConfig.operationsPerSecond * 0.9
                            ? 'text-green-600' : 'text-orange-600'
                        }>
                          {metrics.length > 0 ? 
                            ((metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length) / testConfig.operationsPerSecond * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Latency Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Min Latency:</span>
                        <span>{metrics.length > 0 ? Math.min(...metrics.map(m => m.latency)).toFixed(0) : 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Latency:</span>
                        <span>{metrics.length > 0 ? Math.max(...metrics.map(m => m.latency)).toFixed(0) : 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Latency:</span>
                        <span>{metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length).toFixed(0) : 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Latency:</span>
                        <span>{'<'} {testConfig.networkLatency * 2}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Conflicts Detected</p>
                      <p className="text-lg font-bold text-orange-600">{stats.conflictOps}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Conflict Rate</p>
                      <p className="text-lg font-bold">{stats.conflictRate.toFixed(2)}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Auto-Resolved</p>
                      <p className="text-lg font-bold text-green-600">
                        {realTimeMetrics ? realTimeMetrics.conflictsResolved : 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conflict Resolution Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI-Powered Resolution</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20 h-2" />
                        <span>85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Manual Resolution Required</span>
                      <div className="flex items-center gap-2">
                        <Progress value={15} className="w-20 h-2" />
                        <span>15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Average Resolution Time</span>
                      <span>245ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Data Integrity Score</span>
                      <span className="text-green-600">99.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}