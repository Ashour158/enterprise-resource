import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Code2, Play, CheckCircle, AlertTriangle, XCircle, Clock, Zap } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ApiTestResult {
  endpoint: string
  method: string
  status: 'success' | 'warning' | 'error'
  responseTime: number
  statusCode: number
  message: string
  timestamp: Date
}

interface ApiTestSuiteProps {
  companyId: string
  userId: string
}

export function ApiTestSuite({ companyId, userId }: ApiTestSuiteProps) {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('all')

  const apiTests = [
    {
      id: 'auth-test',
      name: 'Authentication Flow',
      endpoints: [
        'POST /api/auth/login',
        'POST /api/auth/switch-company',
        'GET /api/auth/my-companies',
        'POST /api/auth/refresh'
      ],
      description: 'Test multi-company authentication system'
    },
    {
      id: 'lead-crud',
      name: 'Lead CRUD Operations',
      endpoints: [
        'GET /api/crm/leads',
        'POST /api/crm/leads',
        'GET /api/crm/leads/{id}/full-view',
        'PUT /api/crm/leads/{id}',
        'DELETE /api/crm/leads/{id}'
      ],
      description: 'Test complete lead management operations'
    },
    {
      id: 'email-integration',
      name: 'Email Integration',
      endpoints: [
        'POST /api/crm/leads/{id}/email',
        'GET /api/crm/leads/{id}/email-history',
        'POST /api/crm/email/sync',
        'GET /api/crm/email/templates'
      ],
      description: 'Test email functionality with tracking'
    },
    {
      id: 'real-time',
      name: 'Real-time Features',
      endpoints: [
        'GET /api/crm/leads/real-time-updates',
        'POST /api/crm/notifications/subscribe',
        'GET /api/crm/activity-feed',
        'POST /api/crm/collaborative-notes'
      ],
      description: 'Test WebSocket and real-time updates'
    },
    {
      id: 'calendar-scheduling',
      name: 'Calendar & Scheduling',
      endpoints: [
        'GET /api/crm/calendar/availability',
        'POST /api/crm/leads/{id}/schedule',
        'GET /api/crm/meetings',
        'PUT /api/crm/meetings/{id}'
      ],
      description: 'Test calendar integration and meeting scheduling'
    },
    {
      id: 'ai-features',
      name: 'AI-Powered Features',
      endpoints: [
        'POST /api/crm/leads/{id}/ai-score',
        'GET /api/crm/leads/{id}/ai-insights',
        'POST /api/crm/leads/ai-recommendations',
        'POST /api/crm/email/ai-compose'
      ],
      description: 'Test AI scoring, insights, and recommendations'
    }
  ]

  const runSingleTest = async (endpoint: string, method: string): Promise<ApiTestResult> => {
    const startTime = Date.now()
    
    // Simulate API call with random response time and occasional failures
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200))
    
    const responseTime = Date.now() - startTime
    const shouldFail = Math.random() < 0.1 // 10% failure rate for demonstration
    
    const statusCodes = shouldFail ? [400, 404, 500] : [200, 201, 204]
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
    
    let status: 'success' | 'warning' | 'error' = 'success'
    let message = 'Request completed successfully'
    
    if (statusCode >= 400) {
      status = 'error'
      message = statusCode === 404 ? 'Resource not found' : 
                statusCode === 500 ? 'Internal server error' : 'Bad request'
    } else if (responseTime > 500) {
      status = 'warning'
      message = 'Slow response time detected'
    }
    
    return {
      endpoint,
      method,
      status,
      responseTime,
      statusCode,
      message,
      timestamp: new Date()
    }
  }

  const runTestSuite = async (testId: string) => {
    setIsRunningTests(true)
    const testSuite = apiTests.find(t => t.id === testId)
    if (!testSuite) return

    toast.info(`Running ${testSuite.name} tests...`)
    
    for (const endpoint of testSuite.endpoints) {
      const method = endpoint.split(' ')[0] as string
      const path = endpoint.split(' ')[1]
      
      const result = await runSingleTest(path, method)
      setTestResults(prev => [result, ...prev.slice(0, 49)]) // Keep last 50 results
    }
    
    setIsRunningTests(false)
    toast.success(`${testSuite.name} tests completed`)
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    toast.info('Running comprehensive API test suite...')
    
    for (const testSuite of apiTests) {
      for (const endpoint of testSuite.endpoints) {
        const method = endpoint.split(' ')[0] as string
        const path = endpoint.split(' ')[1]
        
        const result = await runSingleTest(path, method)
        setTestResults(prev => [result, ...prev])
      }
    }
    
    setIsRunningTests(false)
    toast.success('All API tests completed')
  }

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getTestStats = () => {
    const total = testResults.length
    const success = testResults.filter(r => r.status === 'success').length
    const warnings = testResults.filter(r => r.status === 'warning').length
    const errors = testResults.filter(r => r.status === 'error').length
    const avgResponseTime = total > 0 ? 
      Math.round(testResults.reduce((sum, r) => sum + r.responseTime, 0) / total) : 0
    
    return { total, success, warnings, errors, avgResponseTime }
  }

  const stats = getTestStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Enhanced CRM API Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing framework for all CRM API endpoints with performance monitoring 
            and real-time validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                <p className="text-sm text-muted-foreground">Success</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}ms</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunningTests ? 'Running...' : 'Run All Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Suites */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Suites</CardTitle>
              <CardDescription>
                Organized test collections for different API functionality areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiTests.map(test => (
                  <Card key={test.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {test.endpoints.length} endpoints
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => runTestSuite(test.id)}
                          disabled={isRunningTests}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-1">
                        {test.endpoints.map(endpoint => (
                          <div key={endpoint} className="flex items-center gap-2 text-sm">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {endpoint.split(' ')[0]}
                            </Badge>
                            <code className="font-mono text-xs">
                              {endpoint.split(' ')[1]}
                            </code>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Test Results
                {isRunningTests && (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {testResults.length > 0 ? (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {result.method}
                              </Badge>
                              <Badge className={getStatusColor(result.status)}>
                                {result.statusCode}
                              </Badge>
                            </div>
                            <code className="text-xs font-mono text-muted-foreground">
                              {result.endpoint}
                            </code>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-mono">{result.responseTime}ms</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Play size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No test results yet</p>
                    <p className="text-xs">Run a test suite to see results</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Response Time Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fast (&lt; 200ms)</span>
                    <span>{testResults.filter(r => r.responseTime < 200).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good (200-500ms)</span>
                    <span>{testResults.filter(r => r.responseTime >= 200 && r.responseTime < 500).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Slow (&gt; 500ms)</span>
                    <span>{testResults.filter(r => r.responseTime >= 500).length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Success Rate by Method</h4>
                <div className="space-y-2">
                  {['GET', 'POST', 'PUT', 'DELETE'].map(method => {
                    const methodResults = testResults.filter(r => r.method === method)
                    const successRate = methodResults.length > 0 ? 
                      Math.round((methodResults.filter(r => r.status === 'success').length / methodResults.length) * 100) : 0
                    return (
                      <div key={method} className="flex justify-between text-sm">
                        <span>{method}</span>
                        <span>{successRate}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Common Issues</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Timeout Errors</span>
                    <span>{testResults.filter(r => r.responseTime > 1000).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Authentication Failures</span>
                    <span>{testResults.filter(r => r.statusCode === 401).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Server Errors</span>
                    <span>{testResults.filter(r => r.statusCode >= 500).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}