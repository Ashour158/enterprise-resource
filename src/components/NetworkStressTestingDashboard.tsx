import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Monitor,
  Globe,
  Wifi,
  HardDrive,
  Cpu,
  Network,
  Eye
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NetworkCondition {
  name: string
  latency: number
  bandwidth: number
  packetLoss: number
  jitter: number
}

interface StressTestSession {
  id: string
  name: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  config: {
    companies: number
    usersPerCompany: number
    operationsPerSecond: number
    durationMinutes: number
    networkCondition: NetworkCondition
    dataTypes: string[]
    enableConflicts: boolean
  }
  results?: {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    conflictsDetected: number
    conflictsResolved: number
    averageLatency: number
    peakThroughput: number
    dataConsistency: number
    resourceUsage: {
      peakMemory: number
      peakCpu: number
      networkUtilization: number
    }
  }
}

interface RealTimeStats {
  timestamp: string
  operationsPerSecond: number
  latency: number
  memoryUsage: number
  cpuUsage: number
  networkThroughput: number
  activeConnections: number
  errorRate: number
  conflictRate: number
}

const networkConditions: NetworkCondition[] = [
  { name: 'Optimal', latency: 10, bandwidth: 1000, packetLoss: 0, jitter: 1 },
  { name: 'Good', latency: 50, bandwidth: 500, packetLoss: 0.1, jitter: 5 },
  { name: 'Average', latency: 100, bandwidth: 100, packetLoss: 0.5, jitter: 10 },
  { name: 'Poor', latency: 300, bandwidth: 50, packetLoss: 1, jitter: 20 },
  { name: 'Extreme', latency: 1000, bandwidth: 10, packetLoss: 5, jitter: 50 }
]

export function NetworkStressTestingDashboard({ companyId }: { companyId: string }) {
  const [testSessions, setTestSessions] = useKV<StressTestSession[]>('network-stress-sessions', [])
  const [currentSession, setCurrentSession] = useState<StressTestSession | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats[]>([])
  const [activeTab, setActiveTab] = useState('configure')

  // Default test configuration
  const [testConfig, setTestConfig] = useState({
    companies: 10,
    usersPerCompany: 100,
    operationsPerSecond: 200,
    durationMinutes: 15,
    networkCondition: networkConditions[1], // Good
    dataTypes: ['leads', 'contacts', 'deals', 'quotes', 'tasks', 'accounts'],
    enableConflicts: true
  })

  // Real-time statistics update
  useEffect(() => {
    if (!isRunning || !currentSession) return

    const interval = setInterval(() => {
      const now = new Date().toISOString()
      const baseLatency = testConfig.networkCondition.latency
      const jitter = testConfig.networkCondition.jitter
      
      const newStats: RealTimeStats = {
        timestamp: now,
        operationsPerSecond: testConfig.operationsPerSecond * (0.8 + Math.random() * 0.4),
        latency: baseLatency + (Math.random() - 0.5) * jitter * 2,
        memoryUsage: 100 + (testConfig.companies * testConfig.usersPerCompany * 0.1) + Math.random() * 50,
        cpuUsage: 15 + (testConfig.operationsPerSecond * 0.1) + Math.random() * 25,
        networkThroughput: Math.min(testConfig.networkCondition.bandwidth * (0.7 + Math.random() * 0.3), testConfig.networkCondition.bandwidth),
        activeConnections: testConfig.companies * testConfig.usersPerCompany,
        errorRate: testConfig.networkCondition.packetLoss + Math.random() * 2,
        conflictRate: testConfig.enableConflicts ? Math.random() * 8 : 0
      }

      setRealTimeStats(prev => [...prev.slice(-299), newStats]) // Keep last 300 points
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, currentSession, testConfig])

  // Create new test session
  const createTestSession = () => {
    const sessionId = `stress-${Date.now()}`
    const newSession: StressTestSession = {
      id: sessionId,
      name: `Stress Test ${new Date().toLocaleString()}`,
      status: 'idle',
      config: { ...testConfig }
    }

    setTestSessions(prev => [...prev, newSession])
    setCurrentSession(newSession)
    return newSession
  }

  // Start stress test
  const startStressTest = async () => {
    if (!currentSession) {
      const session = createTestSession()
      setCurrentSession(session)
    }

    setIsRunning(true)
    setTestProgress(0)
    setRealTimeStats([])

    const startTime = new Date().toISOString()
    const updatedSession = {
      ...currentSession!,
      status: 'running' as const,
      startTime
    }

    setCurrentSession(updatedSession)
    setTestSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))

    toast.success(`Starting network stress test with ${testConfig.companies} companies under ${testConfig.networkCondition.name} conditions`)

    // Simulate test progress
    const testDuration = testConfig.durationMinutes * 60 * 1000
    const startTimeMs = Date.now()

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeMs
      const progress = Math.min((elapsed / testDuration) * 100, 100)
      setTestProgress(progress)

      if (progress >= 100) {
        clearInterval(progressInterval)
        completeStressTest()
      }
    }, 1000)
  }

  // Complete stress test
  const completeStressTest = () => {
    if (!currentSession) return

    setIsRunning(false)
    const endTime = new Date().toISOString()

    // Calculate test results
    const avgLatency = realTimeStats.length > 0 ? 
      realTimeStats.reduce((sum, stat) => sum + stat.latency, 0) / realTimeStats.length : 0

    const peakThroughput = realTimeStats.length > 0 ?
      Math.max(...realTimeStats.map(stat => stat.operationsPerSecond)) : 0

    const avgErrorRate = realTimeStats.length > 0 ?
      realTimeStats.reduce((sum, stat) => sum + stat.errorRate, 0) / realTimeStats.length : 0

    const avgConflictRate = realTimeStats.length > 0 ?
      realTimeStats.reduce((sum, stat) => sum + stat.conflictRate, 0) / realTimeStats.length : 0

    const totalOperations = Math.floor(testConfig.operationsPerSecond * testConfig.durationMinutes * 60)
    const successfulOperations = Math.floor(totalOperations * (1 - avgErrorRate / 100))
    const failedOperations = totalOperations - successfulOperations
    const conflictsDetected = Math.floor(totalOperations * (avgConflictRate / 100))

    const results = {
      totalOperations,
      successfulOperations,
      failedOperations,
      conflictsDetected,
      conflictsResolved: Math.floor(conflictsDetected * 0.85), // 85% auto-resolution rate
      averageLatency: avgLatency,
      peakThroughput,
      dataConsistency: 95 + Math.random() * 5,
      resourceUsage: {
        peakMemory: realTimeStats.length > 0 ? Math.max(...realTimeStats.map(s => s.memoryUsage)) : 0,
        peakCpu: realTimeStats.length > 0 ? Math.max(...realTimeStats.map(s => s.cpuUsage)) : 0,
        networkUtilization: realTimeStats.length > 0 ? 
          (realTimeStats.reduce((sum, s) => sum + s.networkThroughput, 0) / realTimeStats.length) / testConfig.networkCondition.bandwidth * 100 : 0
      }
    }

    const completedSession = {
      ...currentSession,
      status: 'completed' as const,
      endTime,
      results
    }

    setCurrentSession(completedSession)
    setTestSessions(prev => prev.map(s => s.id === completedSession.id ? completedSession : s))

    toast.success('Network stress test completed successfully!')
  }

  // Stop running test
  const stopStressTest = () => {
    setIsRunning(false)
    if (currentSession) {
      const stoppedSession = {
        ...currentSession,
        status: 'failed' as const,
        endTime: new Date().toISOString()
      }
      setCurrentSession(stoppedSession)
      setTestSessions(prev => prev.map(s => s.id === stoppedSession.id ? stoppedSession : s))
    }
    toast.info('Stress test stopped by user')
  }

  const getCurrentStats = () => {
    if (realTimeStats.length === 0) return null
    return realTimeStats[realTimeStats.length - 1]
  }

  const currentStats = getCurrentStats()

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network size={20} />
                Network Stress Testing Dashboard
              </CardTitle>
              <CardDescription>
                Execute comprehensive network stress tests with real-time monitoring and analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <>
                  <Button onClick={createTestSession} variant="outline">
                    New Session
                  </Button>
                  <Button onClick={startStressTest} disabled={!currentSession}>
                    <Play size={16} className="mr-2" />
                    Start Test
                  </Button>
                </>
              ) : (
                <Button onClick={stopStressTest} variant="destructive">
                  <Square size={16} className="mr-2" />
                  Stop Test
                </Button>
              )}
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Test Progress</span>
                <span>{testProgress.toFixed(1)}% ({Math.floor(testProgress * testConfig.durationMinutes / 100)} min elapsed)</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="configure">Configuration</TabsTrigger>
              <TabsTrigger value="monitor">Real-time Monitor</TabsTrigger>
              <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Parameters</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companies">Number of Companies</Label>
                    <Input
                      id="companies"
                      type="number"
                      value={testConfig.companies}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, companies: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={100}
                      disabled={isRunning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="users-per-company">Users per Company</Label>
                    <Input
                      id="users-per-company"
                      type="number"
                      value={testConfig.usersPerCompany}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, usersPerCompany: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={1000}
                      disabled={isRunning}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operations-per-second">Operations per Second</Label>
                    <Input
                      id="operations-per-second"
                      type="number"
                      value={testConfig.operationsPerSecond}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, operationsPerSecond: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={10000}
                      disabled={isRunning}
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
                      max={180}
                      disabled={isRunning}
                    />
                  </div>
                </div>

                {/* Network Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Network Conditions</h3>
                  
                  <div className="space-y-2">
                    <Label>Network Condition Preset</Label>
                    <Select
                      value={testConfig.networkCondition.name}
                      onValueChange={(value) => {
                        const condition = networkConditions.find(c => c.name === value)
                        if (condition) {
                          setTestConfig(prev => ({ ...prev, networkCondition: condition }))
                        }
                      }}
                      disabled={isRunning}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {networkConditions.map(condition => (
                          <SelectItem key={condition.name} value={condition.name}>
                            {condition.name} ({condition.latency}ms, {condition.bandwidth}Mbps)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latency</Label>
                      <div className="text-sm text-muted-foreground">
                        {testConfig.networkCondition.latency}ms
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bandwidth</Label>
                      <div className="text-sm text-muted-foreground">
                        {testConfig.networkCondition.bandwidth}Mbps
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Packet Loss</Label>
                      <div className="text-sm text-muted-foreground">
                        {testConfig.networkCondition.packetLoss}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Jitter</Label>
                      <div className="text-sm text-muted-foreground">
                        {testConfig.networkCondition.jitter}ms
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['leads', 'contacts', 'deals', 'quotes', 'tasks', 'accounts'].map(type => (
                        <Badge 
                          key={type}
                          variant={testConfig.dataTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            if (isRunning) return
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
                  This test will simulate {testConfig.companies * testConfig.usersPerCompany} concurrent users 
                  performing {testConfig.operationsPerSecond} operations per second for {testConfig.durationMinutes} minutes 
                  under {testConfig.networkCondition.name} network conditions.
                  Total operations: ~{(testConfig.operationsPerSecond * testConfig.durationMinutes * 60).toLocaleString()}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              {/* Real-time Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Operations/sec</p>
                        <p className="text-2xl font-bold">{currentStats?.operationsPerSecond.toFixed(1) || '0'}</p>
                      </div>
                      <TrendUp className="text-green-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Latency</p>
                        <p className="text-2xl font-bold">{currentStats?.latency.toFixed(0) || '0'}ms</p>
                      </div>
                      <Clock className="text-orange-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Memory</p>
                        <p className="text-2xl font-bold">{currentStats?.memoryUsage.toFixed(0) || '0'}MB</p>
                      </div>
                      <HardDrive className="text-blue-500" size={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">CPU</p>
                        <p className="text-2xl font-bold">{currentStats?.cpuUsage.toFixed(0) || '0'}%</p>
                      </div>
                      <Cpu className="text-purple-500" size={20} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Health Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor size={20} />
                    System Health Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Network Throughput</span>
                          <span>{currentStats?.networkThroughput.toFixed(1) || '0'} Mbps</span>
                        </div>
                        <Progress 
                          value={currentStats ? (currentStats.networkThroughput / testConfig.networkCondition.bandwidth) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Active Connections</span>
                          <span>{currentStats?.activeConnections || 0}</span>
                        </div>
                        <Progress 
                          value={currentStats ? (currentStats.activeConnections / (testConfig.companies * testConfig.usersPerCompany)) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Error Rate</span>
                          <span className={currentStats && currentStats.errorRate > 5 ? 'text-red-500' : 'text-green-500'}>
                            {currentStats?.errorRate.toFixed(2) || '0'}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(currentStats?.errorRate || 0, 10) * 10} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Conflict Rate</span>
                          <span className={currentStats && currentStats.conflictRate > 10 ? 'text-orange-500' : 'text-green-500'}>
                            {currentStats?.conflictRate.toFixed(2) || '0'}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(currentStats?.conflictRate || 0, 20) * 5} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>{currentStats?.memoryUsage.toFixed(0) || '0'}MB</span>
                        </div>
                        <Progress 
                          value={Math.min((currentStats?.memoryUsage || 0) / 2000 * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>{currentStats?.cpuUsage.toFixed(0) || '0'}%</span>
                        </div>
                        <Progress 
                          value={currentStats?.cpuUsage || 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Test Info */}
              {currentSession && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={20} />
                      Current Test Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Session ID:</span>
                          <span className="font-mono">{currentSession.id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={
                            currentSession.status === 'running' ? 'default' :
                            currentSession.status === 'completed' ? 'outline' :
                            currentSession.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {currentSession.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Companies:</span>
                          <span>{currentSession.config.companies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <span>{currentSession.config.companies * currentSession.config.usersPerCompany}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Network Condition:</span>
                          <span>{currentSession.config.networkCondition.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target OPS:</span>
                          <span>{currentSession.config.operationsPerSecond}/sec</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{currentSession.config.durationMinutes} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data Types:</span>
                          <span>{currentSession.config.dataTypes.length} types</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Sessions History</h3>
                <Button 
                  onClick={() => setTestSessions([])}
                  variant="outline"
                  size="sm"
                  disabled={isRunning}
                >
                  Clear History
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {testSessions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Database size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No test sessions found</p>
                    </div>
                  ) : (
                    testSessions.slice().reverse().map(session => (
                      <Card key={session.id} className="cursor-pointer hover:border-primary/50" onClick={() => setCurrentSession(session)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                session.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                session.status === 'completed' ? 'bg-green-500' :
                                session.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                              }`} />
                              <div>
                                <p className="font-medium">{session.name}</p>
                                <p className="text-sm text-muted-foreground">{session.id}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p>{session.config.companies} companies</p>
                              <p className="text-muted-foreground">{session.config.networkCondition.name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {currentSession?.results ? (
                <div className="space-y-6">
                  {/* Results Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-2xl font-bold text-green-600">
                            {((currentSession.results.successfulOperations / currentSession.results.totalOperations) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Avg Latency</p>
                          <p className="text-2xl font-bold">
                            {currentSession.results.averageLatency.toFixed(0)}ms
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Peak Throughput</p>
                          <p className="text-2xl font-bold">
                            {currentSession.results.peakThroughput.toFixed(1)}/s
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Operation Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Operations:</span>
                              <span className="font-mono">{currentSession.results.totalOperations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Successful:</span>
                              <span className="font-mono text-green-600">{currentSession.results.successfulOperations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Failed:</span>
                              <span className="font-mono text-red-600">{currentSession.results.failedOperations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conflicts Detected:</span>
                              <span className="font-mono text-orange-600">{currentSession.results.conflictsDetected}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conflicts Resolved:</span>
                              <span className="font-mono text-green-600">{currentSession.results.conflictsResolved}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Resource Usage</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Peak Memory:</span>
                              <span className="font-mono">{currentSession.results.resourceUsage.peakMemory.toFixed(0)}MB</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Peak CPU:</span>
                              <span className="font-mono">{currentSession.results.resourceUsage.peakCpu.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Network Utilization:</span>
                              <span className="font-mono">{currentSession.results.resourceUsage.networkUtilization.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Data Consistency:</span>
                              <span className="font-mono text-green-600">{currentSession.results.dataConsistency.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No analytics data available. Complete a stress test to view performance analysis.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}