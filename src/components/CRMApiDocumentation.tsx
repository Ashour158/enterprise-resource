import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Code2, Globe, Clock, Shield, Zap, Database, Link, CheckCircle, Play, TestTube, Activity } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiTestSuite } from '@/components/ApiTestSuite'
import { ApiEndpointTester } from '@/components/ApiEndpointTester'
import { ApiPerformanceMonitor } from '@/components/ApiPerformanceMonitor'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  category: string
  authentication: boolean
  rateLimit: string
  responseTime: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  responses: Array<{
    code: number
    description: string
    example?: any
  }>
  features: string[]
}

const apiEndpoints: ApiEndpoint[] = [
  // Lead Management APIs
  {
    id: 'get-lead-full-view',
    method: 'GET',
    path: '/api/crm/leads/{id}/full-view',
    description: 'Complete lead profile with all related data, activity timeline, and AI insights',
    category: 'Lead Management',
    authentication: true,
    rateLimit: '100/minute',
    responseTime: '< 150ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'include_timeline', type: 'boolean', required: false, description: 'Include activity timeline' },
      { name: 'include_ai_insights', type: 'boolean', required: false, description: 'Include AI recommendations' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Lead profile retrieved successfully',
        example: {
          lead: {
            id: 'lead-001',
            full_name: 'John Smith',
            company_name: 'Tech Corp',
            ai_lead_score: 85.5,
            conversion_probability: 0.72,
            timeline: [],
            ai_insights: []
          }
        }
      },
      { code: 404, description: 'Lead not found' },
      { code: 403, description: 'Access denied - company isolation' }
    ],
    features: ['Company Isolation', 'AI Insights', 'Activity Timeline', 'Real-time Data']
  },
  {
    id: 'send-lead-email',
    method: 'POST',
    path: '/api/crm/leads/{id}/email',
    description: 'Send email with tracking, templates, and AI personalization',
    category: 'Email Integration',
    authentication: true,
    rateLimit: '50/minute',
    responseTime: '< 200ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'template_id', type: 'string', required: false, description: 'Email template ID' },
      { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
      { name: 'body', type: 'string', required: true, description: 'Email body content' },
      { name: 'track_opens', type: 'boolean', required: false, description: 'Enable open tracking' },
      { name: 'track_clicks', type: 'boolean', required: false, description: 'Enable click tracking' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Email sent successfully',
        example: {
          email_id: 'email-001',
          tracking_id: 'track-001',
          sent_at: '2024-01-15T10:30:00Z',
          status: 'sent'
        }
      },
      { code: 400, description: 'Invalid email data' },
      { code: 429, description: 'Rate limit exceeded' }
    ],
    features: ['Email Tracking', 'Template System', 'AI Personalization', 'Delivery Status']
  },
  {
    id: 'get-email-history',
    method: 'GET',
    path: '/api/crm/leads/{id}/email-history',
    description: 'Complete email thread history with tracking data and engagement metrics',
    category: 'Email Integration',
    authentication: true,
    rateLimit: '200/minute',
    responseTime: '< 100ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
      { name: 'limit', type: 'integer', required: false, description: 'Items per page (max 100)' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Email history retrieved successfully',
        example: {
          emails: [],
          pagination: { page: 1, total: 25, has_more: true },
          engagement_summary: { total_opens: 15, total_clicks: 8 }
        }
      }
    ],
    features: ['Thread Management', 'Engagement Analytics', 'Pagination', 'Search & Filter']
  },
  {
    id: 'schedule-meeting',
    method: 'POST',
    path: '/api/crm/leads/{id}/schedule',
    description: 'Schedule meeting with calendar integration and automatic conflict detection',
    category: 'Calendar & Scheduling',
    authentication: true,
    rateLimit: '30/minute',
    responseTime: '< 300ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'meeting_type', type: 'string', required: true, description: 'Type of meeting (call, demo, consultation)' },
      { name: 'duration_minutes', type: 'integer', required: true, description: 'Meeting duration in minutes' },
      { name: 'preferred_times', type: 'array', required: true, description: 'Array of preferred time slots' },
      { name: 'attendees', type: 'array', required: false, description: 'Additional attendees' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Meeting scheduled successfully',
        example: {
          meeting_id: 'meet-001',
          scheduled_time: '2024-01-20T14:00:00Z',
          calendar_link: 'https://calendar.google.com/...',
          meeting_link: 'https://zoom.us/j/...'
        }
      },
      { code: 409, description: 'Scheduling conflict detected' }
    ],
    features: ['Smart Scheduling', 'Conflict Detection', 'Calendar Sync', 'Video Conference Links']
  },
  {
    id: 'get-activity-timeline',
    method: 'GET',
    path: '/api/crm/leads/{id}/timeline',
    description: 'Interactive timeline with all activities, emails, calls, and system events',
    category: 'Activity Management',
    authentication: true,
    rateLimit: '150/minute',
    responseTime: '< 120ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'activity_types', type: 'array', required: false, description: 'Filter by activity types' },
      { name: 'date_from', type: 'string', required: false, description: 'Start date for timeline' },
      { name: 'date_to', type: 'string', required: false, description: 'End date for timeline' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Timeline retrieved successfully',
        example: {
          activities: [],
          summary: { total_activities: 45, last_activity: '2024-01-15T09:30:00Z' },
          ai_insights: { engagement_trend: 'increasing', next_best_action: 'schedule_demo' }
        }
      }
    ],
    features: ['Activity Filtering', 'AI Insights', 'Real-time Updates', 'Interactive Timeline']
  },
  {
    id: 'initiate-call',
    method: 'POST',
    path: '/api/crm/leads/{id}/call',
    description: 'Initiate call with automatic activity logging and outcome tracking',
    category: 'Communication',
    authentication: true,
    rateLimit: '20/minute',
    responseTime: '< 250ms',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Lead unique identifier' },
      { name: 'call_type', type: 'string', required: true, description: 'Type of call (cold, follow_up, demo)' },
      { name: 'phone_number', type: 'string', required: false, description: 'Override default phone number' },
      { name: 'caller_id', type: 'string', required: true, description: 'User making the call' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Call initiated successfully',
        example: {
          call_id: 'call-001',
          call_session_id: 'session-001',
          started_at: '2024-01-15T10:30:00Z',
          recording_enabled: true
        }
      }
    ],
    features: ['Call Logging', 'Outcome Tracking', 'Recording', 'Integration with Phone Systems']
  },
  {
    id: 'real-time-updates',
    method: 'GET',
    path: '/api/crm/leads/real-time-updates',
    description: 'WebSocket endpoint for live updates across all CRM data',
    category: 'Real-time Communication',
    authentication: true,
    rateLimit: 'Connection-based',
    responseTime: 'Real-time',
    parameters: [
      { name: 'company_id', type: 'string', required: true, description: 'Company context for isolation' },
      { name: 'modules', type: 'array', required: false, description: 'Subscribe to specific modules' },
      { name: 'user_id', type: 'string', required: true, description: 'User identifier for personalization' }
    ],
    responses: [
      { 
        code: 101, 
        description: 'WebSocket connection established',
        example: {
          connection_id: 'ws-001',
          subscribed_events: ['lead_updated', 'email_received', 'meeting_scheduled'],
          heartbeat_interval: 30
        }
      }
    ],
    features: ['Live Updates', 'Multi-user Collaboration', 'Event Filtering', 'Connection Management']
  },
  {
    id: 'sync-emails',
    method: 'POST',
    path: '/api/crm/email/sync',
    description: 'Trigger email synchronization with external providers',
    category: 'Email Integration',
    authentication: true,
    rateLimit: '10/minute',
    responseTime: '< 500ms',
    parameters: [
      { name: 'provider', type: 'string', required: true, description: 'Email provider (gmail, outlook, imap)' },
      { name: 'full_sync', type: 'boolean', required: false, description: 'Perform full synchronization' },
      { name: 'sync_from_date', type: 'string', required: false, description: 'Sync emails from specific date' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Sync initiated successfully',
        example: {
          sync_job_id: 'sync-001',
          estimated_duration: '2-5 minutes',
          status: 'in_progress',
          progress_url: '/api/crm/email/sync/sync-001/status'
        }
      }
    ],
    features: ['Multi-provider Support', 'Incremental Sync', 'Progress Tracking', 'Error Handling']
  },
  {
    id: 'check-availability',
    method: 'GET',
    path: '/api/crm/calendar/availability',
    description: 'Check team availability for scheduling with smart conflict detection',
    category: 'Calendar & Scheduling',
    authentication: true,
    rateLimit: '100/minute',
    responseTime: '< 100ms',
    parameters: [
      { name: 'user_ids', type: 'array', required: true, description: 'Users to check availability for' },
      { name: 'date_from', type: 'string', required: true, description: 'Start date/time' },
      { name: 'date_to', type: 'string', required: true, description: 'End date/time' },
      { name: 'duration_minutes', type: 'integer', required: true, description: 'Required meeting duration' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Availability checked successfully',
        example: {
          available_slots: [],
          timezone: 'America/New_York',
          business_hours: { start: '09:00', end: '17:00' },
          suggestions: []
        }
      }
    ],
    features: ['Smart Scheduling', 'Time Zone Handling', 'Business Hours', 'Conflict Resolution']
  },
  {
    id: 'global-search',
    method: 'POST',
    path: '/api/crm/search/global',
    description: 'Global search across all CRM data with AI-powered relevance ranking',
    category: 'Search & Discovery',
    authentication: true,
    rateLimit: '200/minute',
    responseTime: '< 200ms',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
      { name: 'modules', type: 'array', required: false, description: 'Limit search to specific modules' },
      { name: 'filters', type: 'object', required: false, description: 'Additional search filters' },
      { name: 'limit', type: 'integer', required: false, description: 'Maximum results (default 50)' }
    ],
    responses: [
      { 
        code: 200, 
        description: 'Search completed successfully',
        example: {
          results: [],
          total_matches: 125,
          search_time_ms: 45,
          suggestions: [],
          facets: {}
        }
      }
    ],
    features: ['Full-text Search', 'AI Relevance Ranking', 'Faceted Search', 'Auto-complete']
  }
]

interface CRMApiDocumentationProps {
  companyId: string
  userId: string
}

export function CRMApiDocumentation({ companyId, userId }: CRMApiDocumentationProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)))]
  
  const filteredEndpoints = selectedCategory === 'all' 
    ? apiEndpoints 
    : apiEndpoints.filter(endpoint => endpoint.category === selectedCategory)

  const handleTestEndpoint = (endpoint: ApiEndpoint) => {
    toast.success(`Testing ${endpoint.method} ${endpoint.path}`)
    // Simulate API test
    setTimeout(() => {
      toast.success(`✓ ${endpoint.method} ${endpoint.path} - Response: 200 OK (${endpoint.responseTime})`)
    }, 1000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200'
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200'
      case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documentation">API Documentation</TabsTrigger>
          <TabsTrigger value="testing">
            <Play className="h-4 w-4 mr-2" />
            API Testing Suite
          </TabsTrigger>
          <TabsTrigger value="endpoint-tester">
            <TestTube className="h-4 w-4 mr-2" />
            Endpoint Tester
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="space-y-6">
          {/* Header */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Enhanced CRM API Documentation
          </CardTitle>
          <CardDescription>
            Comprehensive REST API endpoints for advanced CRM functionality with real-time updates, 
            email integration, and AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-xs text-muted-foreground">JWT + Company Isolation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Performance</p>
                <p className="text-xs text-muted-foreground">Sub-200ms Response</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Real-time</p>
                <p className="text-xs text-muted-foreground">WebSocket Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Integration</p>
                <p className="text-xs text-muted-foreground">Multi-provider APIs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredEndpoints.map(endpoint => (
                    <Card 
                      key={endpoint.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedEndpoint === endpoint.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono">{endpoint.path}</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {endpoint.responseTime}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTestEndpoint(endpoint)
                                }}
                              >
                                Test
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {endpoint.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {endpoint.features.map(feature => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Endpoint Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEndpoint ? (
                <ScrollArea className="h-[600px]">
                  {(() => {
                    const endpoint = apiEndpoints.find(e => e.id === selectedEndpoint)
                    if (!endpoint) return null

                    return (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {endpoint.description}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-2">Authentication & Limits</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Authentication:</span>
                              <Badge variant={endpoint.authentication ? "default" : "secondary"}>
                                {endpoint.authentication ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Rate Limit:</span>
                              <span className="font-mono">{endpoint.rateLimit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Time:</span>
                              <span className="font-mono">{endpoint.responseTime}</span>
                            </div>
                          </div>
                        </div>

                        {endpoint.parameters && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-semibold mb-2">Parameters</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map(param => (
                                  <div key={param.name} className="border rounded p-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm font-mono">{param.name}</code>
                                      <Badge variant="outline" className="text-xs">
                                        {param.type}
                                      </Badge>
                                      {param.required && (
                                        <Badge variant="destructive" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {param.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-2">Responses</h4>
                          <div className="space-y-2">
                            {endpoint.responses.map(response => (
                              <div key={response.code} className="border rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant={response.code === 200 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {response.code}
                                  </Badge>
                                  <span className="text-sm">{response.description}</span>
                                </div>
                                {response.example && (
                                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                    {JSON.stringify(response.example, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-2">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {endpoint.features.map(feature => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          onClick={() => handleTestEndpoint(endpoint)}
                        >
                          <Code2 className="h-4 w-4 mr-2" />
                          Test This Endpoint
                        </Button>
                      </div>
                    )
                  })()}
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Globe size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an endpoint to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>API Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{apiEndpoints.length}</p>
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {apiEndpoints.filter(e => e.method === 'GET').length}
              </p>
              <p className="text-sm text-muted-foreground">GET Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {apiEndpoints.filter(e => e.method === 'POST').length}
              </p>
              <p className="text-sm text-muted-foreground">POST Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{categories.length - 1}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <ApiTestSuite 
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="endpoint-tester" className="space-y-6">
          <ApiEndpointTester 
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <ApiPerformanceMonitor 
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}