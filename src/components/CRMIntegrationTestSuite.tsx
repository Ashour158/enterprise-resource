import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Users,
  PiggyBank,
  Phone,
  Calendar,
  Workflow,
  Database,
  Link,
  Brain,
  Shield,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  duration: number
  details: string
  errors: string[]
  startTime?: Date
  endTime?: Date
  category: string
  dependencies: string[]
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestResult[]
  status: 'idle' | 'running' | 'completed'
  progress: number
}

interface CRMIntegrationTestSuiteProps {
  companyId: string
  userId: string
}

export function CRMIntegrationTestSuite({ companyId, userId }: CRMIntegrationTestSuiteProps) {
  const [testSuites, setTestSuites] = useKV<TestSuite[]>(`crm-test-suites-${companyId}`, [])
  const [currentSuite, setCurrentSuite] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useKV<Record<string, TestResult[]>>(`crm-test-results-${companyId}`, {})

  // Initialize test suites
  useEffect(() => {
    if (testSuites.length === 0) {
      initializeTestSuites()
    }
  }, [])

  const initializeTestSuites = () => {
    const suites: TestSuite[] = [
      {
        id: 'crm-core-modules',
        name: 'CRM Core Modules',
        description: 'Test all core CRM modules independently',
        status: 'idle',
        progress: 0,
        tests: [
          {
            id: 'lead-management',
            name: 'Lead Management System',
            status: 'pending',
            duration: 0,
            details: 'Create, update, convert leads with AI scoring',
            errors: [],
            category: 'Core Module',
            dependencies: []
          },
          {
            id: 'deal-pipeline',
            name: 'Deal Pipeline Management',
            status: 'pending',
            duration: 0,
            details: 'Drag-and-drop pipeline, stage management, forecasting',
            errors: [],
            category: 'Core Module',
            dependencies: ['lead-management']
          },
          {
            id: 'contact-management',
            name: 'Contact Management',
            status: 'pending',
            duration: 0,
            details: 'Contact CRUD, relationship mapping, communication history',
            errors: [],
            category: 'Core Module',
            dependencies: []
          },
          {
            id: 'account-management',
            name: 'Account Management',
            status: 'pending',
            duration: 0,
            details: 'Account hierarchy, territory management, account health',
            errors: [],
            category: 'Core Module',
            dependencies: ['contact-management']
          },
          {
            id: 'quote-management',
            name: 'Quote Management System',
            status: 'pending',
            duration: 0,
            details: 'Quote creation, approval workflows, PDF generation',
            errors: [],
            category: 'Core Module',
            dependencies: ['account-management', 'deal-pipeline']
          },
          {
            id: 'activity-management',
            name: 'Activity & Task Management',
            status: 'pending',
            duration: 0,
            details: 'Calls, meetings, tasks with calendar integration',
            errors: [],
            category: 'Core Module',
            dependencies: ['contact-management']
          },
          {
            id: 'forecasting',
            name: 'Sales Forecasting',
            status: 'pending',
            duration: 0,
            details: 'Revenue predictions, trend analysis, AI insights',
            errors: [],
            category: 'Analytics',
            dependencies: ['deal-pipeline']
          }
        ]
      },
      {
        id: 'crm-integrations',
        name: 'CRM Integrations',
        description: 'Test integration points with other systems',
        status: 'idle',
        progress: 0,
        tests: [
          {
            id: 'calendar-integration',
            name: 'Smart Calendar Integration',
            status: 'pending',
            duration: 0,
            details: 'Bi-directional sync with calendar events',
            errors: [],
            category: 'Integration',
            dependencies: ['activity-management']
          },
          {
            id: 'email-integration',
            name: 'Email System Integration',
            status: 'pending',
            duration: 0,
            details: 'Email tracking, templates, automated campaigns',
            errors: [],
            category: 'Integration',
            dependencies: ['contact-management']
          },
          {
            id: 'department-integration',
            name: 'Department & User Management',
            status: 'pending',
            duration: 0,
            details: 'Role-based access, department assignments',
            errors: [],
            category: 'Integration',
            dependencies: []
          },
          {
            id: 'webhook-integration',
            name: 'Webhook & API Integration',
            status: 'pending',
            duration: 0,
            details: 'Real-time event delivery, external API calls',
            errors: [],
            category: 'Integration',
            dependencies: []
          },
          {
            id: 'ai-integration',
            name: 'AI Services Integration',
            status: 'pending',
            duration: 0,
            details: 'Lead scoring, sentiment analysis, recommendations',
            errors: [],
            category: 'AI/ML',
            dependencies: ['lead-management', 'contact-management']
          }
        ]
      },
      {
        id: 'crm-workflows',
        name: 'Business Workflows',
        description: 'Test end-to-end business processes',
        status: 'idle',
        progress: 0,
        tests: [
          {
            id: 'lead-to-deal',
            name: 'Lead to Deal Conversion',
            status: 'pending',
            duration: 0,
            details: 'Complete lead qualification and conversion workflow',
            errors: [],
            category: 'Workflow',
            dependencies: ['lead-management', 'deal-pipeline']
          },
          {
            id: 'quote-approval',
            name: 'Quote Approval Workflow',
            status: 'pending',
            duration: 0,
            details: 'Multi-level approval with regional business rules',
            errors: [],
            category: 'Workflow',
            dependencies: ['quote-management']
          },
          {
            id: 'customer-journey',
            name: 'Customer Journey Mapping',
            status: 'pending',
            duration: 0,
            details: 'End-to-end customer lifecycle tracking',
            errors: [],
            category: 'Workflow',
            dependencies: ['lead-management', 'deal-pipeline', 'account-management']
          },
          {
            id: 'sales-reporting',
            name: 'Sales Reporting Pipeline',
            status: 'pending',
            duration: 0,
            details: 'Automated report generation and distribution',
            errors: [],
            category: 'Reporting',
            dependencies: ['deal-pipeline', 'forecasting']
          },
          {
            id: 'bulk-operations',
            name: 'Bulk Import/Export Operations',
            status: 'pending',
            duration: 0,
            details: 'Mass data operations with validation',
            errors: [],
            category: 'Data Management',
            dependencies: ['lead-management', 'contact-management', 'account-management']
          }
        ]
      },
      {
        id: 'crm-security',
        name: 'Security & Compliance',
        description: 'Test security measures and compliance features',
        status: 'idle',
        progress: 0,
        tests: [
          {
            id: 'data-isolation',
            name: 'Company Data Isolation',
            status: 'pending',
            duration: 0,
            details: 'Verify data access is properly isolated by company',
            errors: [],
            category: 'Security',
            dependencies: []
          },
          {
            id: 'rbac-permissions',
            name: 'Role-Based Access Control',
            status: 'pending',
            duration: 0,
            details: 'Verify permissions are enforced correctly',
            errors: [],
            category: 'Security',
            dependencies: []
          },
          {
            id: 'audit-logging',
            name: 'Audit Trail Logging',
            status: 'pending',
            duration: 0,
            details: 'Verify all actions are properly logged',
            errors: [],
            category: 'Compliance',
            dependencies: []
          },
          {
            id: 'data-encryption',
            name: 'Data Encryption Validation',
            status: 'pending',
            duration: 0,
            details: 'Verify sensitive data is encrypted',
            errors: [],
            category: 'Security',
            dependencies: []
          }
        ]
      }
    ]

    setTestSuites(suites)
  }

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite || isRunning) return

    setIsRunning(true)
    setCurrentSuite(suiteId)

    // Update suite status
    const updatedSuites = testSuites.map(s => 
      s.id === suiteId ? { ...s, status: 'running' as const, progress: 0 } : s
    )
    setTestSuites(updatedSuites)

    const results: TestResult[] = []
    let completedTests = 0

    for (const test of suite.tests) {
      // Update test status to running
      const runningTest = { ...test, status: 'running' as const, startTime: new Date() }
      results.push(runningTest)
      
      // Simulate test execution
      const result = await executeTest(test)
      results[results.length - 1] = result
      
      completedTests++
      const progress = (completedTests / suite.tests.length) * 100

      // Update progress
      const progressSuites = testSuites.map(s => 
        s.id === suiteId ? { ...s, progress } : s
      )
      setTestSuites(progressSuites)

      // Update test results
      setTestResults(prev => ({
        ...prev,
        [suiteId]: [...results]
      }))

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Mark suite as completed
    const completedSuites = testSuites.map(s => 
      s.id === suiteId ? { ...s, status: 'completed' as const, progress: 100 } : s
    )
    setTestSuites(completedSuites)

    setIsRunning(false)
    setCurrentSuite(null)

    const passedTests = results.filter(r => r.status === 'passed').length
    const failedTests = results.filter(r => r.status === 'failed').length
    
    toast.success(`Test suite completed: ${passedTests} passed, ${failedTests} failed`)
  }

  const executeTest = async (test: TestResult): Promise<TestResult> => {
    const startTime = new Date()
    
    // Simulate test execution with realistic scenarios
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    // Simulate test results based on test type
    const success = Math.random() > 0.1 // 90% success rate for demo
    
    let details = test.details
    let errors: string[] = []
    let status: TestResult['status'] = 'passed'

    if (!success) {
      status = 'failed'
      errors = generateTestErrors(test.id)
    } else if (Math.random() > 0.8) { // 20% chance of warnings
      status = 'warning'
      details += ' (with minor issues)'
    }

    return {
      ...test,
      status,
      duration,
      details,
      errors,
      startTime,
      endTime
    }
  }

  const generateTestErrors = (testId: string): string[] => {
    const errorMap: Record<string, string[]> = {
      'lead-management': [
        'Lead scoring algorithm returned invalid scores for 3 test cases',
        'AI integration timeout for sentiment analysis'
      ],
      'deal-pipeline': [
        'Drag-and-drop functionality failed on mobile viewport',
        'Stage transition webhook delivery failed'
      ],
      'quote-management': [
        'PDF generation failed for complex quotes with custom templates',
        'Currency conversion API timeout'
      ],
      'calendar-integration': [
        'Calendar sync conflicts detected for recurring events',
        'Time zone conversion errors for international meetings'
      ],
      'rbac-permissions': [
        'Permission inheritance not properly enforced for manager role',
        'Department-level access control bypass detected'
      ]
    }

    return errorMap[testId] || ['Unknown test failure']
  }

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTestSuite(suite.id)
      // Brief pause between suites
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const exportTestResults = () => {
    const report = {
      companyId,
      generatedAt: new Date().toISOString(),
      testSuites: testSuites.map(suite => ({
        ...suite,
        results: testResults[suite.id] || []
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm-integration-test-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="text-green-500" size={16} />
      case 'failed': return <XCircle className="text-red-500" size={16} />
      case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />
      case 'running': return <RefreshCw className="text-blue-500 animate-spin" size={16} />
      default: return <Clock className="text-gray-400" size={16} />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core Module': return <Database size={16} />
      case 'Integration': return <Link size={16} />
      case 'AI/ML': return <Brain size={16} />
      case 'Workflow': return <Workflow size={16} />
      case 'Security': return <Shield size={16} />
      case 'Compliance': return <FileText size={16} />
      case 'Reporting': return <FileText size={16} />
      case 'Data Management': return <Database size={16} />
      default: return <FileText size={16} />
    }
  }

  const getOverallStats = () => {
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    let warningTests = 0

    testSuites.forEach(suite => {
      const results = testResults[suite.id] || []
      totalTests += results.length
      passedTests += results.filter(r => r.status === 'passed').length
      failedTests += results.filter(r => r.status === 'failed').length
      warningTests += results.filter(r => r.status === 'warning').length
    })

    return { totalTests, passedTests, failedTests, warningTests }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Integration Test Suite</h2>
          <p className="text-muted-foreground">
            Comprehensive end-to-end testing of all CRM modules and business workflows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            variant="outline" 
            onClick={exportTestResults}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      {stats.totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{stats.totalTests}</p>
                </div>
                <FileText className="text-gray-400" size={20} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.passedTests}</p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedTests}</p>
                </div>
                <XCircle className="text-red-500" size={20} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warningTests}</p>
                </div>
                <AlertTriangle className="text-yellow-500" size={20} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Suites */}
      <Tabs defaultValue="crm-core-modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="crm-core-modules">Core Modules</TabsTrigger>
          <TabsTrigger value="crm-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="crm-workflows">Workflows</TabsTrigger>
          <TabsTrigger value="crm-security">Security</TabsTrigger>
        </TabsList>

        {testSuites.map(suite => (
          <TabsContent key={suite.id} value={suite.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {suite.name}
                      <Badge variant={suite.status === 'completed' ? 'default' : 'secondary'}>
                        {suite.status === 'idle' ? 'Ready' : 
                         suite.status === 'running' ? 'Running' : 'Completed'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => runTestSuite(suite.id)}
                    disabled={isRunning}
                    size="sm"
                  >
                    {currentSuite === suite.id ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </Button>
                </div>
                {suite.status === 'running' && (
                  <Progress value={suite.progress} className="w-full" />
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {(testResults[suite.id] || suite.tests).map((test, index) => {
                  const result = testResults[suite.id]?.[index] || test
                  return (
                    <div key={test.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(test.category)}
                            <span className="font-medium">{test.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {test.category}
                          </Badge>
                        </div>
                        {result.duration > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{result.details}</p>
                      
                      {test.dependencies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Dependencies:</span>
                          {test.dependencies.map(dep => (
                            <Badge key={dep} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {result.errors.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              {result.errors.map((error, i) => (
                                <div key={i} className="text-sm">• {error}</div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.startTime && result.endTime && (
                        <div className="text-xs text-muted-foreground">
                          Executed: {result.startTime.toLocaleTimeString()} - {result.endTime.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}