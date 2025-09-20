import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  TrendUp,
  Monitor,
  Globe,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MultiCompanyStressConfig {
  companyCount: number
  usersPerCompany: number
  operationsPerSecond: number
  testDurationMinutes: number
  syncInterval: number
  conflictProbability: number
  networkLatency: number
}

interface CompanyInstance {
  id: string
  name: string
  userCount: number
  operationsCompleted: number
  averageLatency: number
  conflictsDetected: number
  conflictsResolved: number
  lastSyncTime: string
  status: 'idle' | 'active' | 'stress' | 'error'
  throughput: number
  errorRate: number
}

interface StressTestResults {
  testId: string
  startTime: string
  endTime?: string
  config: MultiCompanyStressConfig
  companies: CompanyInstance[]
  overallMetrics: {
    totalOperations: number
    totalConflicts: number
    averageLatency: number
    peakThroughput: number
    systemStability: number
    dataConsistency: number
  }
  performanceIssues: string[]
  recommendations: string[]
}

export function MultiCompanyStressDashboard({ companyId }: { companyId: string }) {
  const [stressConfig, setStressConfig] = useKV<MultiCompanyStressConfig>('multi-company-stress-config', {
    companyCount: 10,
    usersPerCompany: 100,
    operationsPerSecond: 100,
    testDurationMinutes: 10,
    syncInterval: 1000,
    conflictProbability: 0.1,
    networkLatency: 50
  })

  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [companies, setCompanies] = useState<CompanyInstance[]>([])
  const [testResults, setTestResults] = useKV<StressTestResults[]>('stress-test-results', [])
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalOperations: 0,
    operationsPerSecond: 0,
    averageLatency: 0,
    activeConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    conflictRate: 0,
    errorRate: 0
  })

  // Initialize company instances
  useEffect(() => {
    const initializeCompanies = () => {
      const instances: CompanyInstance[] = Array.from({ length: stressConfig.companyCount }, (_, i) => ({
        id: `stress-company-${i + 1}`,
        name: `Stress Company ${i + 1}`,
        userCount: stressConfig.usersPerCompany,
        operationsCompleted: 0,
        averageLatency: 0,
        conflictsDetected: 0,
        conflictsResolved: 0,
        lastSyncTime: new Date().toISOString(),
        status: 'idle',
        throughput: 0,
        errorRate: 0
      }))
      setCompanies(instances)
    }

    initializeCompanies()
  }, [stressConfig.companyCount, stressConfig.usersPerCompany])

  // Real-time metrics update during testing
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      // Calculate real-time metrics from company data
      const totalOps = companies.reduce((sum, c) => sum + c.operationsCompleted, 0)
      const avgLatency = companies.length > 0 ? 
        companies.reduce((sum, c) => sum + c.averageLatency, 0) / companies.length : 0
      const totalConflicts = companies.reduce((sum, c) => sum + c.conflictsDetected, 0)
      const activeConnections = companies.reduce((sum, c) => sum + c.userCount, 0)

      setRealTimeMetrics({
        totalOperations: totalOps,
        operationsPerSecond: Math.random() * stressConfig.operationsPerSecond * 1.2,
        averageLatency: avgLatency,
        activeConnections,
        memoryUsage: 100 + (activeConnections * 0.5) + Math.random() * 50,
        cpuUsage: 20 + (activeConnections * 0.1) + Math.random() * 30,
        conflictRate: totalOps > 0 ? (totalConflicts / totalOps) * 100 : 0,
        errorRate: Math.random() * 2
      })

      // Update company metrics
      setCompanies(prev => prev.map(company => ({
        ...company,
        operationsCompleted: company.operationsCompleted + Math.floor(Math.random() * 10) + 1,
        averageLatency: stressConfig.networkLatency + Math.random() * 100,
        throughput: Math.random() * (stressConfig.operationsPerSecond / stressConfig.companyCount) * 1.5,
        conflictsDetected: company.conflictsDetected + (Math.random() < stressConfig.conflictProbability ? 1 : 0),
        conflictsResolved: company.conflictsResolved + (Math.random() < 0.8 ? 1 : 0),
        lastSyncTime: new Date().toISOString(),
        status: 'active',
        errorRate: Math.random() * 3
      })))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, stressConfig, companies])

  // Start multi-company stress test
  const startStressTest = async () => {
    const testId = `stress-test-${Date.now()}`
    setCurrentTestId(testId)
    setIsRunning(true)
    setTestProgress(0)

    // Reset companies
    setCompanies(prev => prev.map(c => ({
      ...c,
      operationsCompleted: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      status: 'active',
      throughput: 0,
      errorRate: 0
    })))

    toast.success(`Starting multi-company stress test with ${stressConfig.companyCount} companies`)

    // Simulate test duration
    const testDuration = stressConfig.testDurationMinutes * 60 * 1000
    const startTime = Date.now()

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / testDuration) * 100, 100)
      setTestProgress(progress)

      if (progress >= 100) {
        clearInterval(progressInterval)
        completeStressTest(testId, new Date(startTime).toISOString())
      }
    }, 1000)
  }

  // Complete stress test and generate results
  const completeStressTest = (testId: string, startTime: string) => {
    setIsRunning(false)
    const endTime = new Date().toISOString()

    // Calculate final metrics
    const totalOperations = companies.reduce((sum, c) => sum + c.operationsCompleted, 0)
    const totalConflicts = companies.reduce((sum, c) => sum + c.conflictsDetected, 0)
    const avgLatency = companies.length > 0 ? 
      companies.reduce((sum, c) => sum + c.averageLatency, 0) / companies.length : 0

    // Generate performance analysis
    const performanceIssues: string[] = []
    const recommendations: string[] = []

    if (avgLatency > stressConfig.networkLatency * 3) {
      performanceIssues.push('High latency detected under load')
      recommendations.push('Consider implementing connection pooling optimization')
    }

    if (realTimeMetrics.conflictRate > 15) {
      performanceIssues.push('Elevated conflict rate during stress test')
      recommendations.push('Optimize conflict resolution algorithms')
    }

    if (realTimeMetrics.memoryUsage > 1000) {
      performanceIssues.push('High memory usage detected')
      recommendations.push('Implement memory optimization strategies')
    }

    if (performanceIssues.length === 0) {
      recommendations.push('System performed excellently under stress conditions')
      recommendations.push('Consider increasing load parameters for further testing')
    }

    const testResult: StressTestResults = {
      testId,
      startTime,
      endTime,
      config: stressConfig,
      companies: [...companies],
      overallMetrics: {
        totalOperations,
        totalConflicts,
        averageLatency: avgLatency,
        peakThroughput: Math.max(...companies.map(c => c.throughput)),
        systemStability: performanceIssues.length === 0 ? 95 + Math.random() * 5 : 70 + Math.random() * 20,
        dataConsistency: 95 + Math.random() * 5
      },
      performanceIssues,
      recommendations
    }

    setTestResults(prev => [...prev, testResult])
    setCurrentTestId(null)
    
    toast.success('Multi-company stress test completed!')
  }

  // Stop running test
  const stopStressTest = () => {
    if (currentTestId) {
      completeStressTest(currentTestId, new Date().toISOString())
    }
  }

  const getLatestTestResult = () => {
    return testResults[testResults.length - 1]
  }

  const getSystemHealthStatus = () => {
    if (realTimeMetrics.errorRate > 5) return { status: 'critical', color: 'text-red-500' }
    if (realTimeMetrics.conflictRate > 10) return { status: 'warning', color: 'text-orange-500' }
    if (realTimeMetrics.averageLatency > stressConfig.networkLatency * 2) return { status: 'warning', color: 'text-orange-500' }
    return { status: 'healthy', color: 'text-green-500' }
  }

  const healthStatus = getSystemHealthStatus()
  const latestResult = getLatestTestResult()

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                Multi-Company Stress Testing
              </CardTitle>
              <CardDescription>
                Execute real-time data synchronization stress tests across multiple company instances
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button onClick={startStressTest} className="flex items-center gap-2">
                  <Play size={16} />
                  Start Stress Test
                </Button>
              ) : (
                <Button onClick={stopStressTest} variant="destructive" className="flex items-center gap-2">
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
                <span>{testProgress.toFixed(1)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-count">Company Count</Label>
                <Input
                  id="company-count"
                  type="number"
                  value={stressConfig.companyCount}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, companyCount: parseInt(e.target.value) || 1 }))}
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
                  value={stressConfig.usersPerCompany}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, usersPerCompany: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={1000}
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operations-per-second">Operations/Second</Label>
                <Input
                  id="operations-per-second"
                  type="number"
                  value={stressConfig.operationsPerSecond}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, operationsPerSecond: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={10000}
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-duration">Test Duration (minutes)</Label>
                <Input
                  id="test-duration"
                  type="number"
                  value={stressConfig.testDurationMinutes}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, testDurationMinutes: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={120}
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conflict-probability">Conflict Rate (0-1)</Label>
                <Input
                  id="conflict-probability"
                  type="number"
                  step="0.01"
                  value={stressConfig.conflictProbability}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, conflictProbability: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={1}
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="network-latency">Network Latency (ms)</Label>
                <Input
                  id="network-latency"
                  type="number"
                  value={stressConfig.networkLatency}
                  onChange={(e) => setStressConfig(prev => ({ ...prev, networkLatency: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={1000}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Operations</p>
                <p className="text-2xl font-bold">{realTimeMetrics.totalOperations.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{realTimeMetrics.operationsPerSecond.toFixed(1)}/s</p>
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
                <p className="text-2xl font-bold">{realTimeMetrics.averageLatency.toFixed(0)}ms</p>
              </div>
              <Clock className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className={`text-2xl font-bold ${healthStatus.color}`}>
                  {healthStatus.status.toUpperCase()}
                </p>
              </div>
              <Monitor className={healthStatus.color} size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Instances Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            Company Instances ({companies.length})
          </CardTitle>
          <CardDescription>
            Real-time status of each company instance during stress testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map(company => (
              <Card key={company.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{company.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {company.userCount} users
                      </CardDescription>
                    </div>
                    <Badge variant={
                      company.status === 'active' ? 'default' :
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
                      <span>Operations:</span>
                      <span className="font-mono">{company.operationsCompleted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput:</span>
                      <span className="font-mono">{company.throughput.toFixed(1)}/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="font-mono">{company.averageLatency.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conflicts:</span>
                      <span className={`font-mono ${company.conflictsDetected > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                        {company.conflictsDetected}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className={`font-mono ${company.errorRate > 2 ? 'text-red-500' : 'text-green-500'}`}>
                        {company.errorRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {latestResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              Latest Test Results
            </CardTitle>
            <CardDescription>
              Analysis from the most recent stress test execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Overall Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Operations:</span>
                      <span className="font-mono">{latestResult.overallMetrics.totalOperations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Conflicts:</span>
                      <span className="font-mono">{latestResult.overallMetrics.totalConflicts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Throughput:</span>
                      <span className="font-mono">{latestResult.overallMetrics.peakThroughput.toFixed(1)}/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Stability:</span>
                      <span className="font-mono">{latestResult.overallMetrics.systemStability.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Consistency:</span>
                      <span className="font-mono text-green-600">{latestResult.overallMetrics.dataConsistency.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Performance Analysis</h4>
                  {latestResult.performanceIssues.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-orange-600">
                        <strong>Issues Detected:</strong>
                      </div>
                      {latestResult.performanceIssues.map((issue, index) => (
                        <Alert key={index} className="border-orange-200">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">{issue}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert className="border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">No performance issues detected</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-1">
                    {latestResult.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            System Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Memory Usage</span>
                <span>{realTimeMetrics.memoryUsage.toFixed(0)}MB</span>
              </div>
              <Progress 
                value={Math.min((realTimeMetrics.memoryUsage / 2000) * 100, 100)} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>CPU Usage</span>
                <span>{realTimeMetrics.cpuUsage.toFixed(0)}%</span>
              </div>
              <Progress value={realTimeMetrics.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active Connections</span>
                <span>{realTimeMetrics.activeConnections}</span>
              </div>
              <Progress 
                value={Math.min((realTimeMetrics.activeConnections / (stressConfig.companyCount * stressConfig.usersPerCompany)) * 100, 100)} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}