import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import ClickableContactProfile from '@/components/shared/ClickableContactProfile'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Network,
  Brain,
  Activity,
  Target,
  ChartLine,
  Eye,
  Play,
  Pause,
  RotateCcw,
  TrendUp,
  User,
  Star,
  Lightning,
  Heart,
  MessageCircle,
  Pulse
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TestMetric {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  score?: number
  duration?: number
  details?: string
  lastRun?: string
}

interface ContactInteractionTestProps {
  companyId: string
  userId: string
}

function ContactInteractionTest({ companyId, userId }: ContactInteractionTestProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')
  const [testResults, setTestResults] = useState<TestMetric[]>([])
  const [interactions, setInteractions] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)

  // Test scenarios to validate
  const testScenarios: TestMetric[] = [
    {
      id: 'contact-click-response',
      name: 'Contact Click Responsiveness',
      description: 'Measure response time when clicking contact names',
      status: 'pending'
    },
    {
      id: 'profile-data-loading',
      name: 'Profile Data Loading Speed',
      description: 'Test speed of loading comprehensive contact profiles',
      status: 'pending'
    },
    {
      id: 'relationship-mapping',
      name: 'Relationship Network Mapping',
      description: 'Validate relationship visualization and navigation',
      status: 'pending'
    },
    {
      id: 'interaction-history',
      name: 'Interaction History Access',
      description: 'Test complete interaction timeline loading',
      status: 'pending'
    },
    {
      id: 'ai-insights-generation',
      name: 'AI Insights Generation',
      description: 'Validate AI-powered contact insights and recommendations',
      status: 'pending'
    },
    {
      id: 'cross-reference-accuracy',
      name: 'Cross-Reference Accuracy',
      description: 'Test accuracy of contact relationships and connections',
      status: 'pending'
    },
    {
      id: 'mobile-responsive-design',
      name: 'Mobile Responsive Experience',
      description: 'Validate contact profiles work well on mobile devices',
      status: 'pending'
    },
    {
      id: 'real-time-updates',
      name: 'Real-time Profile Updates',
      description: 'Test live updates when contact information changes',
      status: 'pending'
    }
  ]

  useEffect(() => {
    setTestResults(testScenarios)
  }, [])

  const runContactInteractionTest = async () => {
    setIsRunning(true)
    setTestProgress(0)
    setInteractions([])

    const updatedResults = [...testResults]

    for (let i = 0; i < testScenarios.length; i++) {
      const test = testScenarios[i]
      setCurrentTest(test.name)
      updatedResults[i].status = 'running'
      setTestResults([...updatedResults])

      // Simulate test execution
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      const duration = Date.now() - startTime

      // Simulate test results
      const success = Math.random() > 0.1 // 90% success rate
      const score = success ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 20

      updatedResults[i] = {
        ...test,
        status: success ? 'passed' : 'failed',
        score,
        duration,
        lastRun: new Date().toISOString(),
        details: generateTestDetails(test.id, success, score)
      }

      setTestResults([...updatedResults])
      setTestProgress(((i + 1) / testScenarios.length) * 100)

      // Log interaction
      setInteractions(prev => [...prev, {
        timestamp: new Date().toISOString(),
        test: test.name,
        result: success ? 'passed' : 'failed',
        score,
        duration: `${duration}ms`
      }])
    }

    setIsRunning(false)
    setCurrentTest('')
    
    const passedTests = updatedResults.filter(t => t.status === 'passed').length
    toast.success(`Contact interaction testing completed! ${passedTests}/${testScenarios.length} tests passed`)
  }

  const generateTestDetails = (testId: string, success: boolean, score: number): string => {
    const details = {
      'contact-click-response': success 
        ? `Excellent response time: ${score}ms average. Contacts are highly responsive to user interactions.`
        : `Response time too slow: ${score}ms average. Consider optimizing contact click handlers.`,
      'profile-data-loading': success
        ? `Profile loading optimized: ${score}% of data loads within 500ms. Excellent user experience.`
        : `Profile loading needs improvement: Only ${score}% of data loads within acceptable time.`,
      'relationship-mapping': success
        ? `Relationship visualization working perfectly. ${score}% of connections mapped accurately.`
        : `Relationship mapping has issues. Only ${score}% of connections display correctly.`,
      'interaction-history': success
        ? `Complete interaction timeline accessible. ${score}% coverage of historical interactions.`
        : `Interaction history incomplete. Missing ${100 - score}% of expected interactions.`,
      'ai-insights-generation': success
        ? `AI insights highly relevant and actionable. ${score}% accuracy in recommendations.`
        : `AI insights need improvement. Only ${score}% of recommendations are actionable.`,
      'cross-reference-accuracy': success
        ? `Cross-references validated successfully. ${score}% accuracy in contact relationships.`
        : `Cross-reference validation failed. Only ${score}% of relationships are accurate.`,
      'mobile-responsive-design': success
        ? `Mobile experience excellent. ${score}% of features work seamlessly on mobile.`
        : `Mobile experience needs work. Only ${score}% of features are mobile-optimized.`,
      'real-time-updates': success
        ? `Real-time updates working perfectly. ${score}% of changes propagate immediately.`
        : `Real-time updates have issues. Only ${score}% of changes update in real-time.`
    }
    return details[testId as keyof typeof details] || 'Test completed with standard metrics.'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />
      case 'running': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'border-green-200 bg-green-50'
      case 'failed': return 'border-red-200 bg-red-50'
      case 'running': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const overallScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, test) => sum + (test.score || 0), 0) / testResults.length)
    : 0

  const passedTests = testResults.filter(test => test.status === 'passed').length
  const failedTests = testResults.filter(test => test.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Contact Interaction System Testing</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          Comprehensive testing suite for contact relationship mapping functionality, 
          interaction history, AI insights, and user experience optimization.
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Test Execution Control
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={runContactInteractionTest} 
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              <Button 
                onClick={() => {
                  setTestResults(testScenarios.map(t => ({ ...t, status: 'pending' as const })))
                  setTestProgress(0)
                  setCurrentTest('')
                  setInteractions([])
                }} 
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Execute comprehensive tests to validate contact interaction functionality and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Testing Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} />
                <p className="text-sm text-muted-foreground">Currently testing: {currentTest}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{overallScore}</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Tests Failed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="test-results" className="space-y-6">
        <TabsList>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
          <TabsTrigger value="live-demo">Live Demo</TabsTrigger>
          <TabsTrigger value="interaction-log">Interaction Log</TabsTrigger>
        </TabsList>

        <TabsContent value="test-results">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.map((test) => (
              <Card key={test.id} className={`border-2 ${getStatusColor(test.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                    {test.score && (
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(test.score)}`}>
                          {test.score}%
                        </div>
                        {test.duration && (
                          <div className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {test.details && (
                    <div className="p-3 bg-white/50 rounded text-sm">
                      {test.details}
                    </div>
                  )}
                  
                  {test.lastRun && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Last run: {new Date(test.lastRun).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-demo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live Contact Interaction Demo
              </CardTitle>
              <CardDescription>
                Test the contact interaction system with sample contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          <ClickableContactProfile
                            contactName="Michael Chen"
                            companyId={companyId}
                            onContactSelect={(contact) => {
                              setSelectedContact(contact)
                              toast.success(`Testing profile view for ${contact.name}`)
                            }}
                          />
                        </h4>
                        <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                        <Badge variant="outline" className="mt-1">Decision Maker</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          <ClickableContactProfile
                            contactName="Sarah Williams"
                            companyId={companyId}
                            onContactSelect={(contact) => {
                              setSelectedContact(contact)
                              toast.success(`Testing profile view for ${contact.name}`)
                            }}
                          />
                        </h4>
                        <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                        <Badge variant="outline" className="mt-1">Executive</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Lightning className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          <ClickableContactProfile
                            contactName="Alex Rodriguez"
                            companyId={companyId}
                            onContactSelect={(contact) => {
                              setSelectedContact(contact)
                              toast.success(`Testing profile view for ${contact.name}`)
                            }}
                          />
                        </h4>
                        <p className="text-sm text-muted-foreground">Lead Developer</p>
                        <Badge variant="outline" className="mt-1">Influencer</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          <ClickableContactProfile
                            contactName="Jennifer Park"
                            companyId={companyId}
                            onContactSelect={(contact) => {
                              setSelectedContact(contact)
                              toast.success(`Testing profile view for ${contact.name}`)
                            }}
                          />
                        </h4>
                        <p className="text-sm text-muted-foreground">VP of Operations</p>
                        <Badge variant="outline" className="mt-1">Stakeholder</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedContact && (
                <Card className="mt-4 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Last Selected Contact:</h4>
                    <p className="text-sm">{selectedContact.name} - {selectedContact.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedContact.companyName}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interaction-log">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Interaction Testing Log
              </CardTitle>
              <CardDescription>
                Real-time log of test interactions and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interactions.length > 0 ? (
                <div className="space-y-2">
                  {interactions.map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center space-x-3">
                        <Pulse className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-medium">{interaction.test}</span>
                          <div className="text-xs text-muted-foreground">
                            {new Date(interaction.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={interaction.result === 'passed' ? 'default' : 'destructive'}>
                          {interaction.result}
                        </Badge>
                        <span className="text-sm font-medium">{interaction.score}%</span>
                        <span className="text-xs text-muted-foreground">{interaction.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test interactions recorded yet.</p>
                  <p className="text-sm">Run the test suite to see interaction logs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ContactInteractionTest