import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Key, 
  Globe, 
  Database, 
  Lightning, 
  CheckCircle, 
  Warning, 
  Copy,
  ArrowsCounterClockwise,
  Eye,
  EyeSlash,
  TestTube,
  Activity,
  Clock,
  Users,
  TrendUp
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  category: string
  requiresAuth: boolean
  companyScoped: boolean
  parameters?: string[]
  responseExample?: object
  status: 'active' | 'deprecated' | 'beta'
  version: string
  rateLimit: number
  lastTested?: string
  responseTime?: number
  successRate?: number
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  companyId: string
  createdAt: string
  lastUsed?: string
  usageCount: number
  rateLimit: number
  status: 'active' | 'disabled' | 'expired'
}

interface APIMetrics {
  totalRequests: number
  avgResponseTime: number
  errorRate: number
  topEndpoints: { path: string; count: number }[]
  recentErrors: { endpoint: string; error: string; timestamp: string }[]
}

const mockEndpoints: APIEndpoint[] = [
  // Authentication APIs
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'User authentication with company list',
    category: 'Authentication',
    requiresAuth: false,
    companyScoped: false,
    parameters: ['email', 'password', 'mfa_code?'],
    status: 'active',
    version: 'v1',
    rateLimit: 5,
    responseTime: 245,
    successRate: 99.2
  },
  {
    id: 'auth-select-company',
    method: 'POST',
    path: '/api/v1/auth/select-company',
    description: 'Company selection after login',
    category: 'Authentication',
    requiresAuth: true,
    companyScoped: false,
    parameters: ['company_id'],
    status: 'active',
    version: 'v1',
    rateLimit: 10,
    responseTime: 189,
    successRate: 99.7
  },
  {
    id: 'auth-switch-company',
    method: 'POST',
    path: '/api/v1/auth/switch-company',
    description: 'Switch between accessible companies',
    category: 'Authentication',
    requiresAuth: true,
    companyScoped: false,
    parameters: ['company_id'],
    status: 'active',
    version: 'v1',
    rateLimit: 20,
    responseTime: 167,
    successRate: 99.8
  },
  {
    id: 'auth-refresh',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    description: 'Token refresh with company validation',
    category: 'Authentication',
    requiresAuth: true,
    companyScoped: true,
    parameters: ['refresh_token'],
    status: 'active',
    version: 'v1',
    rateLimit: 100,
    responseTime: 123,
    successRate: 99.9
  },
  {
    id: 'auth-logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    description: 'Secure session termination',
    category: 'Authentication',
    requiresAuth: true,
    companyScoped: false,
    status: 'active',
    version: 'v1',
    rateLimit: 50,
    responseTime: 98,
    successRate: 100
  },
  // User Management APIs
  {
    id: 'users-invite',
    method: 'POST',
    path: '/api/v1/users/invite',
    description: 'Invite user to company with role',
    category: 'User Management',
    requiresAuth: true,
    companyScoped: true,
    parameters: ['email', 'role_id', 'department?', 'message?'],
    status: 'active',
    version: 'v1',
    rateLimit: 10,
    responseTime: 456,
    successRate: 98.5
  },
  {
    id: 'users-profile',
    method: 'GET',
    path: '/api/v1/users/profile',
    description: 'User profile with company context',
    category: 'User Management',
    requiresAuth: true,
    companyScoped: true,
    status: 'active',
    version: 'v1',
    rateLimit: 100,
    responseTime: 234,
    successRate: 99.6
  },
  // Company Management APIs
  {
    id: 'companies-settings',
    method: 'GET',
    path: '/api/v1/companies/settings',
    description: 'Company configuration',
    category: 'Company Management',
    requiresAuth: true,
    companyScoped: true,
    status: 'active',
    version: 'v1',
    rateLimit: 50,
    responseTime: 345,
    successRate: 99.1
  },
  {
    id: 'companies-audit',
    method: 'GET',
    path: '/api/v1/companies/audit',
    description: 'Company access audit logs',
    category: 'Company Management',
    requiresAuth: true,
    companyScoped: true,
    parameters: ['start_date?', 'end_date?', 'user_id?', 'action_type?'],
    status: 'active',
    version: 'v1',
    rateLimit: 20,
    responseTime: 567,
    successRate: 99.3
  },
  // Enhanced Security APIs
  {
    id: 'security-device-register',
    method: 'POST',
    path: '/api/v1/security/devices/register',
    description: 'Register trusted device',
    category: 'Security',
    requiresAuth: true,
    companyScoped: false,
    parameters: ['device_fingerprint', 'device_name', 'device_type'],
    status: 'beta',
    version: 'v1',
    rateLimit: 5,
    responseTime: 234,
    successRate: 97.8
  },
  {
    id: 'security-risk-assessment',
    method: 'GET',
    path: '/api/v1/security/risk-assessment',
    description: 'Real-time security risk scoring',
    category: 'Security',
    requiresAuth: true,
    companyScoped: true,
    status: 'beta',
    version: 'v1',
    rateLimit: 10,
    responseTime: 178,
    successRate: 98.9
  }
]

const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'sk_live_1234567890abcdef',
    permissions: ['read:users', 'write:users', 'read:companies'],
    companyId: 'acme-corp',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-01-20T14:22:00Z',
    usageCount: 15423,
    rateLimit: 1000,
    status: 'active'
  },
  {
    id: 'key-2',
    name: 'Integration Testing',
    key: 'sk_test_abcdef1234567890',
    permissions: ['read:*'],
    companyId: 'acme-corp',
    createdAt: '2024-01-10T09:15:00Z',
    lastUsed: '2024-01-19T16:45:00Z',
    usageCount: 2876,
    rateLimit: 100,
    status: 'active'
  }
]

const mockMetrics: APIMetrics = {
  totalRequests: 1250000,
  avgResponseTime: 245,
  errorRate: 0.8,
  topEndpoints: [
    { path: '/api/v1/auth/refresh', count: 345000 },
    { path: '/api/v1/users/profile', count: 234000 },
    { path: '/api/v1/companies/settings', count: 156000 }
  ],
  recentErrors: [
    { endpoint: '/api/v1/users/invite', error: 'Rate limit exceeded', timestamp: '2024-01-20T14:30:00Z' },
    { endpoint: '/api/v1/auth/login', error: 'Invalid credentials', timestamp: '2024-01-20T14:25:00Z' }
  ]
}

export function APIManagementDashboard({ companyId }: { companyId: string }) {
  const [endpoints] = useKV<APIEndpoint[]>('api-endpoints', mockEndpoints)
  const [apiKeys, setAPIKeys] = useKV<APIKey[]>('api-keys', mockAPIKeys)
  const [metrics] = useKV<APIMetrics>('api-metrics', mockMetrics)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showKeyDetails, setShowKeyDetails] = useState<string | null>(null)
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set((endpoints || []).map(e => e.category)))]
  
  const filteredEndpoints = (endpoints || []).filter(endpoint => {
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTestEndpoint = async (endpointId: string) => {
    setTestingEndpoint(endpointId)
    
    // Simulate API testing
    setTimeout(() => {
      setTestingEndpoint(null)
      toast.success('Endpoint test completed successfully')
    }, 2000)
  }

  const handleGenerateAPIKey = () => {
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2, 18)}`,
      permissions: ['read:users'],
      companyId,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      rateLimit: 100,
      status: 'active'
    }
    
    setAPIKeys((current = []) => [...current, newKey])
    toast.success('New API key generated successfully')
  }

  const handleRevokeKey = (keyId: string) => {
    setAPIKeys((current = []) => 
      current.map(key => 
        key.id === keyId ? { ...key, status: 'disabled' as const } : key
      )
    )
    toast.success('API key revoked successfully')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'beta': return 'bg-yellow-500'
      case 'deprecated': return 'bg-red-500'
      case 'disabled': return 'bg-gray-500'
      case 'expired': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500'
      case 'POST': return 'bg-green-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      case 'PATCH': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* API Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Endpoints</p>
                <p className="text-2xl font-bold">{endpoints?.length || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active API Keys</p>
                <p className="text-2xl font-bold">{apiKeys?.filter(k => k.status === 'active').length || 0}</p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{metrics?.avgResponseTime || 0}ms</p>
              </div>
              <Lightning className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{(100 - (metrics?.errorRate || 0)).toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="metrics">Analytics</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                Manage and monitor your API endpoints with real-time metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search endpoints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredEndpoints.map(endpoint => (
                  <Card key={endpoint.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={`${getMethodColor(endpoint.method)} text-white`}>
                            {endpoint.method}
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono">{endpoint.path}</code>
                              <Badge variant="outline" className={`${getStatusColor(endpoint.status)} text-white`}>
                                {endpoint.status}
                              </Badge>
                              {endpoint.companyScoped && (
                                <Badge variant="secondary">Company Scoped</Badge>
                              )}
                              {endpoint.requiresAuth && (
                                <Badge variant="outline">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {endpoint.responseTime && (
                            <div className="text-right">
                              <div className="text-sm font-medium">{endpoint.responseTime}ms</div>
                              <div className="text-xs text-muted-foreground">
                                {endpoint.successRate}% success
                              </div>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestEndpoint(endpoint.id)}
                            disabled={testingEndpoint === endpoint.id}
                          >
                            {testingEndpoint === endpoint.id ? (
                              <ArrowsCounterClockwise className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {endpoint.parameters && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-muted-foreground">Parameters:</span>
                            {endpoint.parameters.map(param => (
                              <Badge key={param} variant="outline" className="text-xs">
                                {param}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access
                  </CardDescription>
                </div>
                <Button onClick={handleGenerateAPIKey}>
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(apiKeys || []).map(apiKey => (
                <Card key={apiKey.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <Badge 
                            variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                            className={apiKey.status === 'active' ? 'bg-green-500' : ''}
                          >
                            {apiKey.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKeyDetails === apiKey.id ? apiKey.key : '••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKeyDetails(
                              showKeyDetails === apiKey.id ? null : apiKey.id
                            )}
                          >
                            {showKeyDetails === apiKey.id ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {apiKey.permissions.map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                          {apiKey.lastUsed && (
                            <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                          )}
                          <span>Usage: {apiKey.usageCount.toLocaleString()}</span>
                          <span>Rate limit: {apiKey.rateLimit}/min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeKey(apiKey.id)}
                          disabled={apiKey.status !== 'active'}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp className="h-5 w-5" />
                  API Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Requests</span>
                    <span className="font-medium">{metrics?.totalRequests?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Response Time</span>
                    <span className="font-medium">{metrics?.avgResponseTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="font-medium">{metrics?.errorRate || 0}%</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Top Endpoints</h4>
                  <div className="space-y-2">
                    {(metrics?.topEndpoints || []).map((endpoint, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <code className="text-sm">{endpoint.path}</code>
                        <Badge variant="outline">{endpoint.count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warning className="h-5 w-5" />
                  Recent Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(metrics?.recentErrors || []).map((error, index) => (
                    <Alert key={index}>
                      <Warning className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <code className="text-sm">{error.endpoint}</code>
                            <p className="text-sm mt-1">{error.error}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Testing Console
              </CardTitle>
              <CardDescription>
                Test API endpoints and validate responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  API testing console allows you to test endpoints in real-time with proper authentication and company context.
                  Select an endpoint from the list above to begin testing.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">Request Configuration</Label>
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label htmlFor="endpoint">Endpoint</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an endpoint to test" />
                        </SelectTrigger>
                        <SelectContent>
                          {(endpoints || []).map(endpoint => (
                            <SelectItem key={endpoint.id} value={endpoint.id}>
                              {endpoint.method} {endpoint.path}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="headers">Headers</Label>
                      <Textarea
                        id="headers"
                        placeholder="Content-Type: application/json&#10;Authorization: Bearer your-token"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="body">Request Body</Label>
                      <Textarea
                        id="body"
                        placeholder="{ &#10;  &quot;key&quot;: &quot;value&quot;&#10;}"
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button className="w-full">
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Response</Label>
                  <div className="mt-2">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500">200 OK</Badge>
                            <span className="text-sm text-muted-foreground">Response time: 245ms</span>
                          </div>
                          <Separator />
                          <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "data": {
    "message": "API test successful"
  },
  "meta": {
    "timestamp": "2024-01-20T15:30:00Z",
    "request_id": "req_123456789",
    "company_id": "acme-corp"
  }
}`}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}