import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Code2, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Zap,
  Globe,
  Database,
  Shield,
  Copy,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ApiEndpointTester {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  description: string
  headers: Record<string, string>
  parameters: Record<string, any>
  body?: any
  expectedResponse?: any
}

interface TestResult {
  id: string
  endpoint: string
  method: string
  status: 'success' | 'error' | 'warning'
  statusCode: number
  responseTime: number
  response: any
  timestamp: Date
  size: number
}

const predefinedTests: ApiEndpointTester[] = [
  {
    id: 'get-lead-full-view',
    name: 'Get Lead Full View',
    method: 'GET',
    url: '/api/crm/leads/{id}/full-view',
    description: 'Retrieve complete lead profile with AI insights',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': 'company-123',
      'Content-Type': 'application/json'
    },
    parameters: {
      id: 'lead-001',
      include_timeline: true,
      include_ai_insights: true
    }
  },
  {
    id: 'send-email',
    name: 'Send Email to Lead',
    method: 'POST',
    url: '/api/crm/leads/{id}/email',
    description: 'Send tracked email with personalization',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': 'company-123',
      'Content-Type': 'application/json'
    },
    parameters: {
      id: 'lead-001'
    },
    body: {
      template_id: 'template-001',
      subject: 'Following up on your demo request',
      body: 'Hi {{lead.first_name}}, thanks for your interest in our solution...',
      track_opens: true,
      track_clicks: true
    }
  },
  {
    id: 'schedule-meeting',
    name: 'Schedule Meeting',
    method: 'POST',
    url: '/api/crm/leads/{id}/schedule',
    description: 'Schedule meeting with calendar integration',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': 'company-123',
      'Content-Type': 'application/json'
    },
    parameters: {
      id: 'lead-001'
    },
    body: {
      meeting_type: 'demo',
      duration_minutes: 60,
      preferred_times: [
        '2024-01-25T14:00:00Z',
        '2024-01-25T15:00:00Z'
      ],
      attendees: [
        {
          email: 'john@techcorp.com',
          name: 'John Smith',
          role: 'lead'
        }
      ]
    }
  },
  {
    id: 'global-search',
    name: 'Global Search',
    method: 'POST',
    url: '/api/crm/search/global',
    description: 'AI-powered global search across CRM data',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': 'company-123',
      'Content-Type': 'application/json'
    },
    parameters: {},
    body: {
      query: 'John Smith Tech Corp',
      modules: ['leads', 'contacts', 'deals'],
      limit: 50,
      include_ai_ranking: true
    }
  },
  {
    id: 'check-availability',
    name: 'Check Team Availability',
    method: 'GET',
    url: '/api/crm/calendar/availability',
    description: 'Check team availability for scheduling',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': 'company-123',
      'Content-Type': 'application/json'
    },
    parameters: {
      'user_ids[]': ['user-001', 'user-002'],
      date_from: '2024-01-25T09:00:00Z',
      date_to: '2024-01-25T17:00:00Z',
      duration_minutes: 60,
      timezone: 'America/New_York'
    }
  }
]

interface ApiEndpointTesterProps {
  companyId: string
  userId: string
}

export function ApiEndpointTester({ companyId, userId }: ApiEndpointTesterProps) {
  const [selectedTest, setSelectedTest] = useState<ApiEndpointTester>(predefinedTests[0])
  const [customTest, setCustomTest] = useState<ApiEndpointTester>({
    id: 'custom',
    name: 'Custom Test',
    method: 'GET',
    url: '',
    description: '',
    headers: {
      'Authorization': 'Bearer your-jwt-token',
      'X-Company-ID': companyId,
      'Content-Type': 'application/json'
    },
    parameters: {}
  })
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResponse, setShowResponse] = useState<string | null>(null)

  const executeTest = async (test: ApiEndpointTester) => {
    setIsLoading(true)
    const startTime = Date.now()

    try {
      // Simulate API call with realistic response
      await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200))
      
      const responseTime = Date.now() - startTime
      const shouldSucceed = Math.random() > 0.15 // 85% success rate
      
      let mockResponse: any
      let statusCode: number
      
      if (shouldSucceed) {
        statusCode = test.method === 'POST' ? 201 : 200
        
        // Generate realistic mock responses based on endpoint
        switch (test.id) {
          case 'get-lead-full-view':
            mockResponse = {
              lead: {
                id: 'lead-001',
                full_name: 'John Smith',
                email: 'john@techcorp.com',
                company_name: 'Tech Corp',
                ai_lead_score: 85.5,
                conversion_probability: 0.72,
                timeline: [],
                ai_insights: {
                  next_best_action: 'schedule_demo',
                  buying_signals: ['visited_pricing_page']
                }
              }
            }
            break
          case 'send-email':
            mockResponse = {
              email_id: 'email-001',
              tracking_id: 'track-001',
              sent_at: new Date().toISOString(),
              status: 'sent'
            }
            break
          case 'schedule-meeting':
            mockResponse = {
              meeting_id: 'meet-001',
              scheduled_time: '2024-01-25T14:00:00Z',
              calendar_link: 'https://calendar.google.com/...',
              meeting_link: 'https://zoom.us/j/...'
            }
            break
          default:
            mockResponse = {
              success: true,
              data: 'Mock response data',
              timestamp: new Date().toISOString()
            }
        }
      } else {
        statusCode = [400, 401, 404, 500][Math.floor(Math.random() * 4)]
        mockResponse = {
          error: {
            code: 'API_ERROR',
            message: 'Simulated API error for testing',
            request_id: `req-${Date.now()}`
          }
        }
      }

      const result: TestResult = {
        id: `test-${Date.now()}`,
        endpoint: test.url,
        method: test.method,
        status: statusCode >= 400 ? 'error' : responseTime > 500 ? 'warning' : 'success',
        statusCode,
        responseTime,
        response: mockResponse,
        timestamp: new Date(),
        size: JSON.stringify(mockResponse).length
      }

      setTestResults(prev => [result, ...prev.slice(0, 19)]) // Keep last 20 results
      
      if (statusCode < 400) {
        toast.success(`${test.method} ${test.url} - ${statusCode} (${responseTime}ms)`)
      } else {
        toast.error(`${test.method} ${test.url} - ${statusCode} (${responseTime}ms)`)
      }
      
    } catch (error) {
      toast.error('Failed to execute test')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const downloadResults = () => {
    const data = JSON.stringify(testResults, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-test-results-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            API Endpoint Tester
          </CardTitle>
          <CardDescription>
            Interactive testing interface for CRM API endpoints with real-time validation 
            and comprehensive response analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Environment</p>
                <p className="text-xs text-muted-foreground">Development</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">JWT + Company Context</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Rate Limiting</p>
                <p className="text-xs text-muted-foreground">1000/min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-xs text-muted-foreground">Target &lt; 200ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Configuration */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="predefined" className="space-y-4">
            <TabsList>
              <TabsTrigger value="predefined">Predefined Tests</TabsTrigger>
              <TabsTrigger value="custom">Custom Test</TabsTrigger>
            </TabsList>

            <TabsContent value="predefined" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Test Endpoint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {predefinedTests.map(test => (
                      <Card 
                        key={test.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTest.id === test.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTest(test)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{test.method}</Badge>
                                <span className="font-medium">{test.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {test.description}
                              </p>
                              <code className="text-xs font-mono">{test.url}</code>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                executeTest(test)
                              }}
                              disabled={isLoading}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom API Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select 
                        value={customTest.method}
                        onValueChange={(value) => 
                          setCustomTest(prev => ({ ...prev, method: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={customTest.url}
                        onChange={(e) => 
                          setCustomTest(prev => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="/api/crm/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Headers (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(customTest.headers, null, 2)}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value)
                          setCustomTest(prev => ({ ...prev, headers }))
                        } catch {}
                      }}
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>

                  {(customTest.method === 'POST' || customTest.method === 'PUT' || customTest.method === 'PATCH') && (
                    <div className="space-y-2">
                      <Label>Request Body (JSON)</Label>
                      <Textarea
                        value={JSON.stringify(customTest.body || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const body = JSON.parse(e.target.value)
                            setCustomTest(prev => ({ ...prev, body }))
                          } catch {}
                        }}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={() => executeTest(customTest)}
                    disabled={isLoading || !customTest.url}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Custom Test
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Test Results */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Results</CardTitle>
                {testResults.length > 0 && (
                  <Button size="sm" variant="outline" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {testResults.length > 0 ? (
                  <div className="space-y-2">
                    {testResults.map(result => (
                      <Card 
                        key={result.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setShowResponse(result.id)}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <Badge variant="outline" className="text-xs">
                                  {result.method}
                                </Badge>
                                <Badge className={getStatusColor(result.status)}>
                                  {result.statusCode}
                                </Badge>
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
                            <div>
                              <code className="text-xs font-mono text-muted-foreground">
                                {result.endpoint}
                              </code>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Size: {result.size} bytes
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(JSON.stringify(result.response, null, 2))
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Code2 size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No test results yet</p>
                    <p className="text-xs">Execute a test to see results</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response Detail Modal */}
      {showResponse && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response Details</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowResponse(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              {(() => {
                const result = testResults.find(r => r.id === showResponse)
                if (!result) return null

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Status Code</Label>
                        <Badge className={getStatusColor(result.status)}>
                          {result.statusCode}
                        </Badge>
                      </div>
                      <div>
                        <Label>Response Time</Label>
                        <p className="font-mono">{result.responseTime}ms</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label>Response Body</Label>
                      <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )
              })()}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}