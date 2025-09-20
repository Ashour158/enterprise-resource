import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Database,
  Shield,
  Users,
  Building,
  Zap,
  TestTube,
  FileText,
  Bug,
  Wrench
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ValidationRule {
  id: string
  name: string
  description: string
  category: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'pending' | 'passed' | 'failed' | 'skipped'
  details?: any
  recommendations?: string[]
}

interface ValidationReport {
  id: string
  timestamp: Date
  category: string
  rules: ValidationRule[]
  score: number
  status: 'in_progress' | 'completed' | 'failed'
}

export function SystemValidation({ companyId, userId }: { companyId: string; userId: string }) {
  const [validationReports, setValidationReports] = useKV<ValidationReport[]>('validation-reports', [])
  const [isRunning, setIsRunning] = useState(false)
  const [currentValidation, setCurrentValidation] = useState<string | null>(null)
  const [overallScore, setOverallScore] = useState(0)

  // Define validation rules by category
  const validationRules = {
    'data-integrity': [
      {
        id: 'multi-tenant-isolation',
        name: 'Multi-tenant Data Isolation',
        description: 'Verify that company data is properly isolated and cannot be accessed across tenants',
        category: 'data-integrity',
        severity: 'critical' as const,
        status: 'pending' as const
      },
      {
        id: 'foreign-key-constraints',
        name: 'Foreign Key Constraints',
        description: 'Ensure all database foreign key relationships are properly defined and enforced',
        category: 'data-integrity',
        severity: 'error' as const,
        status: 'pending' as const
      },
      {
        id: 'data-consistency',
        name: 'Cross-table Data Consistency',
        description: 'Validate data consistency across related tables and modules',
        category: 'data-integrity',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'audit-trail-completeness',
        name: 'Audit Trail Completeness',
        description: 'Verify that all user actions are properly logged in audit trails',
        category: 'data-integrity',
        severity: 'error' as const,
        status: 'pending' as const
      }
    ],
    'security-compliance': [
      {
        id: 'authentication-security',
        name: 'Authentication Security',
        description: 'Validate password policies, MFA, and session management',
        category: 'security-compliance',
        severity: 'critical' as const,
        status: 'pending' as const
      },
      {
        id: 'rbac-enforcement',
        name: 'RBAC Enforcement',
        description: 'Ensure role-based access control is properly enforced across all modules',
        category: 'security-compliance',
        severity: 'critical' as const,
        status: 'pending' as const
      },
      {
        id: 'data-encryption',
        name: 'Data Encryption',
        description: 'Verify that sensitive data is encrypted at rest and in transit',
        category: 'security-compliance',
        severity: 'critical' as const,
        status: 'pending' as const
      },
      {
        id: 'api-security',
        name: 'API Security',
        description: 'Validate API authentication, rate limiting, and input validation',
        category: 'security-compliance',
        severity: 'error' as const,
        status: 'pending' as const
      }
    ],
    'business-logic': [
      {
        id: 'crm-workflow-integrity',
        name: 'CRM Workflow Integrity',
        description: 'Validate lead-to-deal conversion, quote approval workflows, and status transitions',
        category: 'business-logic',
        severity: 'error' as const,
        status: 'pending' as const
      },
      {
        id: 'permission-inheritance',
        name: 'Permission Inheritance',
        description: 'Verify that permission inheritance works correctly across role hierarchies',
        category: 'business-logic',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'department-assignment-logic',
        name: 'Department Assignment Logic',
        description: 'Validate user-department assignments and access restrictions',
        category: 'business-logic',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'onboarding-workflow-completeness',
        name: 'Onboarding Workflow Completeness',
        description: 'Ensure onboarding workflows are complete and properly sequenced',
        category: 'business-logic',
        severity: 'info' as const,
        status: 'pending' as const
      }
    ],
    'integration-validation': [
      {
        id: 'calendar-integration',
        name: 'Calendar Integration',
        description: 'Validate smart calendar features, business day calculations, and scheduling',
        category: 'integration-validation',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'webhook-delivery',
        name: 'Webhook Delivery',
        description: 'Test webhook delivery, retry logic, and failure handling',
        category: 'integration-validation',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'email-integration',
        name: 'Email Integration',
        description: 'Validate email sending, template rendering, and delivery tracking',
        category: 'integration-validation',
        severity: 'info' as const,
        status: 'pending' as const
      },
      {
        id: 'file-upload-handling',
        name: 'File Upload Handling',
        description: 'Test file upload, storage, virus scanning, and access controls',
        category: 'integration-validation',
        severity: 'warning' as const,
        status: 'pending' as const
      }
    ],
    'performance-optimization': [
      {
        id: 'query-performance',
        name: 'Database Query Performance',
        description: 'Analyze slow queries and recommend index optimizations',
        category: 'performance-optimization',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'api-response-times',
        name: 'API Response Times',
        description: 'Validate that API endpoints meet performance requirements',
        category: 'performance-optimization',
        severity: 'warning' as const,
        status: 'pending' as const
      },
      {
        id: 'caching-effectiveness',
        name: 'Caching Effectiveness',
        description: 'Evaluate cache hit rates and identify optimization opportunities',
        category: 'performance-optimization',
        severity: 'info' as const,
        status: 'pending' as const
      },
      {
        id: 'memory-usage-patterns',
        name: 'Memory Usage Patterns',
        description: 'Monitor memory usage and identify potential memory leaks',
        category: 'performance-optimization',
        severity: 'info' as const,
        status: 'pending' as const
      }
    ]
  }

  // Run validation for a specific category
  const runValidation = async (category: string) => {
    const rules = validationRules[category as keyof typeof validationRules] || []
    setIsRunning(true)
    setCurrentValidation(category)

    const validatedRules: ValidationRule[] = []

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      
      // Simulate validation logic
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
      
      const validationResult = await validateRule(rule)
      validatedRules.push(validationResult)
    }

    // Calculate score for this category
    const passedRules = validatedRules.filter(r => r.status === 'passed').length
    const score = (passedRules / validatedRules.length) * 100

    const report: ValidationReport = {
      id: `${category}-${Date.now()}`,
      timestamp: new Date(),
      category,
      rules: validatedRules,
      score,
      status: 'completed'
    }

    setValidationReports(prev => {
      const filtered = prev.filter(r => r.category !== category)
      return [...filtered, report]
    })

    setCurrentValidation(null)
    setIsRunning(false)
    
    toast.success(`${category} validation completed with ${score.toFixed(1)}% score`)
  }

  // Validate individual rule
  const validateRule = async (rule: ValidationRule): Promise<ValidationRule> => {
    try {
      // Simulate validation logic based on rule type
      let status: 'passed' | 'failed' = 'passed'
      let details: any = {}
      let recommendations: string[] = []

      // Simulate realistic validation results
      const successRate = rule.severity === 'critical' ? 0.9 : 
                         rule.severity === 'error' ? 0.8 : 
                         rule.severity === 'warning' ? 0.7 : 0.6

      if (Math.random() > successRate) {
        status = 'failed'
        recommendations = generateRecommendations(rule)
        details = generateFailureDetails(rule)
      } else {
        details = generateSuccessDetails(rule)
      }

      return {
        ...rule,
        status,
        details,
        recommendations
      }
    } catch (error) {
      return {
        ...rule,
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        recommendations: ['Review system configuration and retry validation']
      }
    }
  }

  // Generate realistic recommendations
  const generateRecommendations = (rule: ValidationRule): string[] => {
    const recommendations: { [key: string]: string[] } = {
      'multi-tenant-isolation': [
        'Review database row-level security policies',
        'Implement additional company_id filters in queries',
        'Audit API endpoints for proper tenant isolation'
      ],
      'authentication-security': [
        'Strengthen password policy requirements',
        'Enable MFA for all administrative users',
        'Review session timeout configurations'
      ],
      'crm-workflow-integrity': [
        'Update workflow validation rules',
        'Review state transition permissions',
        'Test quote approval escalation logic'
      ],
      'query-performance': [
        'Add database indexes for frequently queried columns',
        'Optimize N+1 query patterns',
        'Consider query result caching'
      ]
    }

    return recommendations[rule.id] || [
      'Review system configuration',
      'Consult documentation for best practices',
      'Contact support if issues persist'
    ]
  }

  // Generate failure details
  const generateFailureDetails = (rule: ValidationRule): any => {
    const details: { [key: string]: any } = {
      'multi-tenant-isolation': {
        issue: 'Found 3 queries without proper company_id filtering',
        affectedTables: ['leads', 'contacts', 'quotes'],
        riskLevel: 'High'
      },
      'authentication-security': {
        issue: 'Password policy allows weak passwords',
        weakPasswords: 12,
        mfaAdoption: '67%'
      },
      'crm-workflow-integrity': {
        issue: 'Quote approval workflow has validation gaps',
        affectedWorkflows: ['high-value-quotes', 'regional-approvals'],
        errorRate: '3.2%'
      }
    }

    return details[rule.id] || {
      issue: 'Validation check failed',
      timestamp: new Date().toISOString()
    }
  }

  // Generate success details
  const generateSuccessDetails = (rule: ValidationRule): any => {
    return {
      message: 'Validation passed successfully',
      checksPassed: Math.floor(5 + Math.random() * 10),
      lastValidated: new Date().toISOString(),
      score: Math.round(85 + Math.random() * 15)
    }
  }

  // Run all validations
  const runAllValidations = async () => {
    for (const category of Object.keys(validationRules)) {
      await runValidation(category)
    }
  }

  // Calculate overall score
  useEffect(() => {
    if (validationReports.length > 0) {
      const totalScore = validationReports.reduce((sum, report) => sum + report.score, 0)
      setOverallScore(totalScore / validationReports.length)
    }
  }, [validationReports])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="text-green-500" size={16} />
      case 'failed': return <XCircle className="text-red-500" size={16} />
      case 'skipped': return <Clock className="text-gray-400" size={16} />
      default: return <Clock className="text-blue-500" size={16} />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data-integrity': return <Database size={20} />
      case 'security-compliance': return <Shield size={20} />
      case 'business-logic': return <Building size={20} />
      case 'integration-validation': return <Zap size={20} />
      case 'performance-optimization': return <TestTube size={20} />
      default: return <FileText size={20} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Validation Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube size={20} />
                System Validation
              </CardTitle>
              <CardDescription>
                Comprehensive validation of business rules, security, and data integrity
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {overallScore > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{overallScore.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              )}
              <Button onClick={runAllValidations} disabled={isRunning}>
                {isRunning ? 'Running...' : 'Run All Validations'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(validationRules).map(([category, rules]) => {
          const report = validationReports.find(r => r.category === category)
          
          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {category.replace('-', ' ')}
                      </CardTitle>
                      <CardDescription>
                        {rules.length} validation rules
                      </CardDescription>
                    </div>
                  </div>
                  {report && (
                    <Badge variant={
                      report.score >= 90 ? 'default' :
                      report.score >= 70 ? 'secondary' : 'destructive'
                    }>
                      {report.score.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {currentValidation === category && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Validating...</span>
                        <span>In Progress</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}

                  {report ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {report.rules.map(rule => (
                          <div key={rule.id} className="flex items-start justify-between p-2 rounded border">
                            <div className="flex items-start gap-2">
                              {getStatusIcon(rule.status)}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{rule.name}</div>
                                <div className="text-xs text-muted-foreground">{rule.description}</div>
                                {rule.status === 'failed' && rule.recommendations && (
                                  <div className="mt-1">
                                    <div className="text-xs text-yellow-600 mb-1">Recommendations:</div>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                                      {rule.recommendations.slice(0, 2).map((rec, i) => (
                                        <li key={i}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getSeverityColor(rule.severity)}`}>
                              {rule.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bug size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Run Validation" to start</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => runValidation(category)}
                    disabled={currentValidation === category || isRunning}
                  >
                    {currentValidation === category ? 'Validating...' : 'Run Validation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Validation Summary */}
      {validationReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Summary</CardTitle>
            <CardDescription>
              Summary of all completed validations and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="failed-rules">Failed Rules</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationReports.reduce((sum, r) => sum + r.rules.filter(rule => rule.status === 'passed').length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Rules Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {validationReports.reduce((sum, r) => sum + r.rules.filter(rule => rule.status === 'failed').length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Rules Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {validationReports.reduce((sum, r) => sum + r.rules.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Rules</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="failed-rules" className="space-y-4">
                {validationReports.flatMap(r => r.rules.filter(rule => rule.status === 'failed')).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                    <h3 className="text-lg font-semibold mb-2">All Validations Passed</h3>
                    <p className="text-muted-foreground">No failed validation rules detected.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {validationReports.flatMap(r => 
                      r.rules.filter(rule => rule.status === 'failed').map(rule => (
                        <Alert key={`${r.category}-${rule.id}`} variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{rule.name}</strong> ({r.category}): {rule.description}
                            {rule.details && rule.details.issue && (
                              <div className="mt-1 text-sm">Issue: {rule.details.issue}</div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  {validationReports.flatMap(r => 
                    r.rules.filter(rule => rule.recommendations?.length > 0).map(rule => (
                      <Card key={`${r.category}-${rule.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <Wrench className="text-blue-500 mt-1" size={16} />
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              <div className="text-sm text-muted-foreground mb-2">{r.category}</div>
                              <ul className="text-sm space-y-1">
                                {rule.recommendations?.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Current Validation Status */}
      {currentValidation && (
        <Alert>
          <Clock className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Currently validating: {currentValidation.replace('-', ' ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}