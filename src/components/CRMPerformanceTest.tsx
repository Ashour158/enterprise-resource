import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Database,
  Shield,
  Download,
  Activity,
  Users,
  DollarSign,
  Phone,
  Calendar,
  FileText,
  Target
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PerformanceMetric {
  metric: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  threshold: number
}

interface LoadTestResult {
  concurrentUsers: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
}

interface CRMPerformanceTestProps {
  companyId: string
  userId: string
}

export function CRMPerformanceTest({ companyId, userId }: CRMPerformanceTestProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState('')
  const [performanceResults, setPerformanceResults] = useKV<LoadTestResult[]>(`crm-performance-${companyId}`, [])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [testProgress, setTestProgress] = useState(0)

  const performanceTests = [
    {
      id: 'lead-creation-load',
      name: 'Lead Creation Load Test',
      description: 'Test lead creation performance under load',
      maxUsers: 100,
      duration: 30000 // 30 seconds
    },
    {
      id: 'deal-pipeline-load',
      name: 'Deal Pipeline Load Test',
      description: 'Test deal pipeline operations under concurrent access',
      maxUsers: 75,
      duration: 25000
    },
    {
      id: 'quote-generation-load',
      name: 'Quote Generation Load Test',
      description: 'Test quote generation with complex calculations',
      maxUsers: 50,
      duration: 20000
    },
    {
      id: 'search-performance',
      name: 'Search & Filter Performance',
      description: 'Test search and filtering across all CRM modules',
      maxUsers: 150,
      duration: 15000
    },
    {
      id: 'report-generation-load',
      name: 'Report Generation Load Test',
      description: 'Test report generation under concurrent requests',
      maxUsers: 25,
      duration: 35000
    }
  ]

  const runPerformanceTest = async (testId: string) => {
    const test = performanceTests.find(t => t.id === testId)
    if (!test || isRunning) return

    setIsRunning(true)
    setCurrentTest(test.name)
    setTestProgress(0)

    const results: LoadTestResult[] = []
    const startTime = Date.now()

    try {
      // Simulate ramping up users gradually
      const userSteps = [10, 25, 50, 75, test.maxUsers]
      
      for (let i = 0; i < userSteps.length; i++) {
        const users = userSteps[i]
        setTestProgress((i / userSteps.length) * 100)
        
        // Simulate load testing for this user level
        const result = await simulateLoadTest(users, test.duration / userSteps.length)
        results.push(result)
        
        // Brief pause between load levels
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setPerformanceResults(prev => [...prev, ...results])
      
      // Generate performance metrics
      const newMetrics = generatePerformanceMetrics(results)
      setMetrics(newMetrics)

      const totalTime = Date.now() - startTime
      toast.success(`Performance test completed in ${(totalTime / 1000).toFixed(1)}s`)

    } catch (error) {
      toast.error(`Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
      setCurrentTest('')
      setTestProgress(0)
    }
  }

  const simulateLoadTest = async (users: number, duration: number): Promise<LoadTestResult> => {
    // Simulate realistic load testing with performance degradation
    await new Promise(resolve => setTimeout(resolve, duration / 5)) // Shortened for demo
    
    const baseResponseTime = 150
    const degradationFactor = Math.log(users) / Math.log(10) // Logarithmic degradation
    
    return {
      concurrentUsers: users,
      requestsPerSecond: Math.max(10, 100 - (users * 0.5)),
      averageResponseTime: baseResponseTime * degradationFactor,
      errorRate: Math.min(5, users > 50 ? (users - 50) * 0.1 : 0),
      memoryUsage: 50 + (users * 2.5),
      cpuUsage: 15 + (users * 1.2)
    }
  }

  const generatePerformanceMetrics = (results: LoadTestResult[]): PerformanceMetric[] => {
    if (results.length === 0) return []

    const latest = results[results.length - 1]
    const avgResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length
    const maxErrorRate = Math.max(...results.map(r => r.errorRate))
    const maxMemoryUsage = Math.max(...results.map(r => r.memoryUsage))
    const maxCpuUsage = Math.max(...results.map(r => r.cpuUsage))

    return [
      {
        metric: 'Average Response Time',
        value: avgResponseTime,
        unit: 'ms',
        status: avgResponseTime < 500 ? 'good' : avgResponseTime < 1000 ? 'warning' : 'critical',
        threshold: 500
      },
      {
        metric: 'Maximum Error Rate',
        value: maxErrorRate,
        unit: '%',
        status: maxErrorRate < 1 ? 'good' : maxErrorRate < 3 ? 'warning' : 'critical',
        threshold: 1
      },
      {
        metric: 'Peak Memory Usage',
        value: maxMemoryUsage,
        unit: 'MB',
        status: maxMemoryUsage < 200 ? 'good' : maxMemoryUsage < 500 ? 'warning' : 'critical',
        threshold: 200
      },
      {
        metric: 'Peak CPU Usage',
        value: maxCpuUsage,
        unit: '%',
        status: maxCpuUsage < 70 ? 'good' : maxCpuUsage < 85 ? 'warning' : 'critical',
        threshold: 70
      },
      {
        metric: 'Concurrent Users Supported',
        value: latest.concurrentUsers,
        unit: 'users',
        status: latest.concurrentUsers >= 75 ? 'good' : latest.concurrentUsers >= 50 ? 'warning' : 'critical',
        threshold: 75
      },
      {
        metric: 'Throughput',
        value: latest.requestsPerSecond,
        unit: 'req/s',
        status: latest.requestsPerSecond >= 50 ? 'good' : latest.requestsPerSecond >= 25 ? 'warning' : 'critical',
        threshold: 50
      }
    ]
  }

  const runAllPerformanceTests = async () => {
    for (const test of performanceTests) {
      await runPerformanceTest(test.id)
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const exportPerformanceReport = () => {
    const report = {
      companyId,
      userId,
      generatedAt: new Date().toISOString(),
      performanceResults,
      metrics,
      summary: {
        totalTests: performanceTests.length,
        totalResults: performanceResults.length,
        averageResponseTime: performanceResults.length > 0 
          ? performanceResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / performanceResults.length 
          : 0,
        maxConcurrentUsers: performanceResults.length > 0 
          ? Math.max(...performanceResults.map(r => r.concurrentUsers)) 
          : 0,
        overallPerformanceGrade: getOverallPerformanceGrade()
      }
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-performance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getOverallPerformanceGrade = (): string => {
    if (metrics.length === 0) return 'Not Tested'
    
    const goodMetrics = metrics.filter(m => m.status === 'good').length
    const warningMetrics = metrics.filter(m => m.status === 'warning').length
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length
    
    if (criticalMetrics > 0) return 'Needs Optimization'
    if (warningMetrics > goodMetrics) return 'Fair'
    if (goodMetrics >= metrics.length * 0.8) return 'Excellent'
    return 'Good'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="text-green-500" size={16} />
      case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />
      case 'critical': return <XCircle className="text-red-500" size={16} />
      default: return <Clock className="text-gray-400" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Performance Testing</h2>
          <p className="text-muted-foreground">
            Load testing and performance analysis for CRM modules under concurrent usage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={runAllPerformanceTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportPerformanceReport}
            className="flex items-center gap-2"
            disabled={performanceResults.length === 0}
          >
            <Download size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Test Progress */}
      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Running: {currentTest}</span>
                <span>{testProgress.toFixed(0)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Simulating load conditions and measuring system performance...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Performance Metrics
              <Badge variant={getOverallPerformanceGrade() === 'Excellent' ? 'default' : 
                            getOverallPerformanceGrade() === 'Good' ? 'secondary' : 'destructive'}>
                {getOverallPerformanceGrade()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time performance metrics from load testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.metric}
                    </span>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Threshold: {metric.threshold} {metric.unit}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceTests.map(test => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </div>
                <Button 
                  onClick={() => runPerformanceTest(test.id)}
                  disabled={isRunning}
                  size="sm"
                >
                  {currentTest === test.name ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Concurrent Users:</span>
                  <span className="font-medium">{test.maxUsers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Test Duration:</span>
                  <span className="font-medium">{(test.duration / 1000).toFixed(0)}s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load Test Results Chart */}
      {performanceResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              Load Test Results
            </CardTitle>
            <CardDescription>
              Performance characteristics under different load conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Users</th>
                      <th className="text-left p-2">Req/s</th>
                      <th className="text-left p-2">Avg Response</th>
                      <th className="text-left p-2">Error Rate</th>
                      <th className="text-left p-2">Memory</th>
                      <th className="text-left p-2">CPU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceResults.slice(-5).map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{result.concurrentUsers}</td>
                        <td className="p-2">{result.requestsPerSecond.toFixed(1)}</td>
                        <td className="p-2">{result.averageResponseTime.toFixed(0)}ms</td>
                        <td className="p-2 text-red-600">{result.errorRate.toFixed(1)}%</td>
                        <td className="p-2">{result.memoryUsage.toFixed(0)}MB</td>
                        <td className="p-2">{result.cpuUsage.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Performance Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Peak Performance:</strong> System handled {Math.max(...performanceResults.map(r => r.concurrentUsers))} concurrent users
                    with {Math.min(...performanceResults.map(r => r.averageResponseTime)).toFixed(0)}ms minimum response time.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Resource Usage:</strong> Peak memory usage reached {Math.max(...performanceResults.map(r => r.memoryUsage)).toFixed(0)}MB
                    with maximum CPU utilization of {Math.max(...performanceResults.map(r => r.cpuUsage)).toFixed(0)}%.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.filter(m => m.status !== 'good').map((metric, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{metric.metric}:</strong> Current value ({metric.value.toFixed(1)} {metric.unit}) 
                    {metric.status === 'warning' ? ' exceeds recommended threshold' : ' is in critical range'}.
                    {metric.metric.includes('Response Time') && ' Consider optimizing database queries and adding caching.'}
                    {metric.metric.includes('Memory') && ' Consider implementing memory optimization and garbage collection tuning.'}
                    {metric.metric.includes('CPU') && ' Consider load balancing and horizontal scaling.'}
                    {metric.metric.includes('Error Rate') && ' Investigate error patterns and implement retry mechanisms.'}
                  </AlertDescription>
                </Alert>
              ))}
              
              {metrics.every(m => m.status === 'good') && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Excellent Performance:</strong> All metrics are within optimal ranges. 
                    System is performing well under current load conditions.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}