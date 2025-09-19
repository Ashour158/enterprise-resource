import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Globe, 
  Plus, 
  Play, 
  Pause, 
  Trash, 
  Gear, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Shield, 
  Key, 
  ArrowClockwise, 
  PaperPlaneTilt,
  Eye,
  Copy,
  Warning,
  TrendUp,
  Funnel,
  MagnifyingGlass,
  Download,
  Upload,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  secret: string
  isActive: boolean
  events: string[]
  httpMethod: 'POST' | 'PUT' | 'PATCH'
  headers: Record<string, string>
  timeout: number
  retryAttempts: number
  retryInterval: number
  companyId: string
  createdBy: string
  createdAt: string
  lastTriggered?: string
  description?: string
  tags: string[]
}

interface WebhookDelivery {
  id: string
  webhookId: string
  eventType: string
  payload: any
  status: 'pending' | 'success' | 'failed' | 'retrying'
  responseCode?: number
  responseBody?: string
  attemptCount: number
  scheduledAt: string
  deliveredAt?: string
  errorMessage?: string
  duration?: number
}

interface WebhookEvent {
  id: string
  name: string
  description: string
  module: string
  schema: any
  isActive: boolean
}

interface WebhookManagementSystemProps {
  companyId: string
  userId: string
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    id: 'user.created',
    name: 'User Created',
    description: 'Triggered when a new user is added to the company',
    module: 'User Management',
    schema: { user_id: 'string', email: 'string', role: 'string' },
    isActive: true
  },
  {
    id: 'user.updated',
    name: 'User Updated',
    description: 'Triggered when user information is modified',
    module: 'User Management', 
    schema: { user_id: 'string', changes: 'object' },
    isActive: true
  },
  {
    id: 'invoice.created',
    name: 'Invoice Created',
    description: 'Triggered when a new invoice is generated',
    module: 'Finance',
    schema: { invoice_id: 'string', amount: 'number', customer_id: 'string' },
    isActive: true
  },
  {
    id: 'order.completed',
    name: 'Order Completed',
    description: 'Triggered when an order is fulfilled',
    module: 'Sales',
    schema: { order_id: 'string', total: 'number', items: 'array' },
    isActive: true
  },
  {
    id: 'inventory.low_stock',
    name: 'Low Stock Alert',
    description: 'Triggered when inventory falls below threshold',
    module: 'Inventory',
    schema: { product_id: 'string', current_stock: 'number', threshold: 'number' },
    isActive: true
  },
  {
    id: 'employee.attendance',
    name: 'Employee Attendance',
    description: 'Triggered on clock in/out events',
    module: 'HR',
    schema: { employee_id: 'string', action: 'string', timestamp: 'string' },
    isActive: true
  }
]

export function WebhookManagementSystem({ companyId, userId }: WebhookManagementSystemProps) {
  const [webhooks, setWebhooks] = useKV<WebhookEndpoint[]>(`webhooks-${companyId}`, [])
  const [deliveries, setDeliveries] = useKV<WebhookDelivery[]>(`webhook-deliveries-${companyId}`, [])
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('webhooks')
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // New webhook form state
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookEndpoint>>({
    name: '',
    url: '',
    secret: '',
    isActive: true,
    events: [],
    httpMethod: 'POST',
    headers: {},
    timeout: 30,
    retryAttempts: 3,
    retryInterval: 5,
    description: '',
    tags: []
  })

  // Generate sample deliveries for demonstration
  useEffect(() => {
    if (deliveries.length === 0 && webhooks.length > 0) {
      const sampleDeliveries: WebhookDelivery[] = webhooks.slice(0, 2).flatMap((webhook, webhookIndex) => 
        WEBHOOK_EVENTS.slice(0, 3).map((event, index) => ({
          id: `delivery-${webhook.id}-${event.id}-${index}`,
          webhookId: webhook.id,
          eventType: event.id,
          payload: { 
            id: `sample-${index}`, 
            timestamp: new Date().toISOString(),
            company_id: companyId 
          },
          status: (['success', 'failed', 'pending'] as const)[index % 3],
          responseCode: index === 1 ? 500 : 200,
          responseBody: index === 1 ? 'Internal Server Error' : 'OK',
          attemptCount: index === 1 ? 2 : 1,
          scheduledAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          deliveredAt: index !== 2 ? new Date(Date.now() - Math.random() * 86400000).toISOString() : undefined,
          errorMessage: index === 1 ? 'HTTP 500: Internal Server Error' : undefined,
          duration: index !== 2 ? Math.floor(Math.random() * 1000) + 100 : undefined
        }))
      )
      setDeliveries(sampleDeliveries)
    }
  }, [webhooks, deliveries.length, setDeliveries, companyId])

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error('Name and URL are required')
      return
    }

    const webhook: WebhookEndpoint = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      secret: newWebhook.secret || generateSecret(),
      isActive: newWebhook.isActive ?? true,
      events: newWebhook.events || [],
      httpMethod: newWebhook.httpMethod || 'POST',
      headers: newWebhook.headers || {},
      timeout: newWebhook.timeout || 30,
      retryAttempts: newWebhook.retryAttempts || 3,
      retryInterval: newWebhook.retryInterval || 5,
      companyId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      description: newWebhook.description || '',
      tags: newWebhook.tags || []
    }

    setWebhooks(current => [...(current || []), webhook])
    setNewWebhook({
      name: '',
      url: '',
      secret: '',
      isActive: true,
      events: [],
      httpMethod: 'POST',
      headers: {},
      timeout: 30,
      retryAttempts: 3,
      retryInterval: 5,
      description: '',
      tags: []
    })
    setIsCreating(false)
    toast.success('Webhook endpoint created successfully')
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(current => (current || []).filter(w => w.id !== webhookId))
    setDeliveries(current => (current || []).filter(d => d.webhookId !== webhookId))
    toast.success('Webhook endpoint deleted')
  }

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(current =>
      (current || []).map(w =>
        w.id === webhookId ? { ...w, isActive: !w.isActive } : w
      )
    )
    const webhook = (webhooks || []).find(w => w.id === webhookId)
    toast.success(`Webhook ${webhook?.isActive ? 'disabled' : 'enabled'}`)
  }

  const handleTestWebhook = async (webhook: WebhookEndpoint) => {
    const testDelivery: WebhookDelivery = {
      id: `test-${Date.now()}`,
      webhookId: webhook.id,
      eventType: 'test.webhook',
      payload: {
        test: true,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id,
        company_id: companyId
      },
      status: 'pending',
      attemptCount: 1,
      scheduledAt: new Date().toISOString()
    }

    setDeliveries(current => [testDelivery, ...(current || [])])
    toast.info('Test webhook queued for delivery')

    // Simulate delivery after 2 seconds
    setTimeout(() => {
      setDeliveries(current =>
        (current || []).map(d =>
          d.id === testDelivery.id
            ? {
                ...d,
                status: 'success' as const,
                responseCode: 200,
                responseBody: 'Test webhook delivered successfully',
                deliveredAt: new Date().toISOString(),
                duration: 150
              }
            : d
        )
      )
      toast.success('Test webhook delivered successfully')
    }, 2000)
  }

  const handleRetryDelivery = (deliveryId: string) => {
    setDeliveries(current =>
      (current || []).map(d =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'retrying' as const,
              attemptCount: d.attemptCount + 1
            }
          : d
      )
    )
    toast.info('Webhook delivery retry initiated')

    // Simulate retry result
    setTimeout(() => {
      setDeliveries(current =>
        (current || []).map(d =>
          d.id === deliveryId
            ? {
                ...d,
                status: Math.random() > 0.5 ? 'success' as const : 'failed' as const,
                responseCode: Math.random() > 0.5 ? 200 : 500,
                deliveredAt: new Date().toISOString(),
                duration: Math.floor(Math.random() * 1000) + 100
              }
            : d
        )
      )
    }, 1500)
  }

  const generateSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  const filteredWebhooks = (webhooks || []).filter(webhook =>
    webhook.name.toLowerCase().includes(filter.toLowerCase()) ||
    webhook.url.toLowerCase().includes(filter.toLowerCase()) ||
    webhook.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
  )

  const filteredDeliveries = (deliveries || []).filter(delivery => {
    if (statusFilter !== 'all' && delivery.status !== statusFilter) return false
    if (selectedWebhook && delivery.webhookId !== selectedWebhook.id) return false
    return true
  })

  const getDeliveryStats = () => {
    const safeDeliveries = deliveries || []
    const total = safeDeliveries.length
    const successful = safeDeliveries.filter(d => d.status === 'success').length
    const failed = safeDeliveries.filter(d => d.status === 'failed').length
    const pending = safeDeliveries.filter(d => d.status === 'pending' || d.status === 'retrying').length
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0

    return { total, successful, failed, pending, successRate }
  }

  const stats = getDeliveryStats()

  const safeWebhooks = webhooks || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Webhook Management</h2>
          <p className="text-muted-foreground">
            Manage real-time event delivery endpoints for your ERP system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity size={12} />
            {safeWebhooks.filter(w => w.isActive).length} Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <CheckCircle size={12} className="text-green-500" />
            {stats.successRate}% Success Rate
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="text-red-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhooks">Endpoints</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery History</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search webhooks..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a new webhook endpoint for real-time event delivery
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="My Webhook"
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">Endpoint URL</Label>
                      <Input
                        id="url"
                        placeholder="https://api.example.com/webhooks"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Webhook description..."
                      value={newWebhook.description}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Event Types</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                      {WEBHOOK_EVENTS.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={newWebhook.events?.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewWebhook(prev => ({
                                  ...prev,
                                  events: [...(prev.events || []), event.id]
                                }))
                              } else {
                                setNewWebhook(prev => ({
                                  ...prev,
                                  events: (prev.events || []).filter(e => e !== event.id)
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={event.id} className="text-sm">
                            {event.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method">HTTP Method</Label>
                      <Select
                        value={newWebhook.httpMethod}
                        onValueChange={(value: 'POST' | 'PUT' | 'PATCH') =>
                          setNewWebhook(prev => ({ ...prev, httpMethod: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={newWebhook.timeout}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retries">Retry Attempts</Label>
                      <Input
                        id="retries"
                        type="number"
                        value={newWebhook.retryAttempts}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secret">Webhook Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secret"
                        placeholder="Auto-generated if empty"
                        value={newWebhook.secret}
                        onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setNewWebhook(prev => ({ ...prev, secret: generateSecret() }))}
                      >
                        <ArrowClockwise size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newWebhook.isActive}
                        onCheckedChange={(checked) => setNewWebhook(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateWebhook}>
                        Create Webhook
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWebhooks.map((webhook) => (
              <Card key={webhook.id} className={`transition-all hover:shadow-md ${!webhook.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe size={16} />
                      {webhook.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="break-all">
                    {webhook.url}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Events</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.slice(0, 3).map((eventId) => {
                        const event = WEBHOOK_EVENTS.find(e => e.id === eventId)
                        return (
                          <Badge key={eventId} variant="outline" className="text-xs">
                            {event?.name}
                          </Badge>
                        )
                      })}
                      {webhook.events.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Secret</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {webhook.secret.slice(0, 16)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySecret(webhook.secret)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={!webhook.isActive}
                      >
                        <PaperPlaneTilt size={14} />
                        Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWebhook(webhook)}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleWebhook(webhook.id)}
                        className="h-8 w-8 p-0"
                      >
                        {webhook.isActive ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                            <Trash size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{webhook.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWebhooks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Globe size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Webhooks Found</h3>
                <p className="text-muted-foreground mb-4">
                  {filter ? 'No webhooks match your search criteria.' : 'Create your first webhook to start receiving real-time events.'}
                </p>
                {!filter && (
                  <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Webhook
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="retrying">Retrying</SelectItem>
                </SelectContent>
              </Select>
              {selectedWebhook && (
                <Badge variant="outline" className="flex items-center gap-2">
                  <Funnel size={12} />
                  {selectedWebhook.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWebhook(null)}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X size={10} />
                  </Button>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download size={14} />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload size={14} />
                Import
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium">Event</th>
                      <th className="text-left p-4 font-medium">Webhook</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Response</th>
                      <th className="text-left p-4 font-medium">Duration</th>
                      <th className="text-left p-4 font-medium">Attempts</th>
                      <th className="text-left p-4 font-medium">Scheduled</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((delivery) => {
                      const webhook = safeWebhooks.find(w => w.id === delivery.webhookId)
                      const event = WEBHOOK_EVENTS.find(e => e.id === delivery.eventType)
                      
                      return (
                        <tr key={delivery.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{event?.name || delivery.eventType}</div>
                              <div className="text-sm text-muted-foreground">{event?.module}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{webhook?.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-32">
                              {webhook?.url}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                delivery.status === 'success'
                                  ? 'default'
                                  : delivery.status === 'failed'
                                  ? 'destructive'
                                  : delivery.status === 'retrying'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {delivery.status === 'success' && <CheckCircle size={12} />}
                              {delivery.status === 'failed' && <XCircle size={12} />}
                              {delivery.status === 'retrying' && <ArrowClockwise size={12} />}
                              {delivery.status === 'pending' && <Clock size={12} />}
                              {delivery.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {delivery.responseCode && (
                              <div>
                                <div className="font-medium">{delivery.responseCode}</div>
                                {delivery.errorMessage && (
                                  <div className="text-sm text-destructive truncate max-w-32">
                                    {delivery.errorMessage}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {delivery.duration && (
                              <span className="text-sm">{delivery.duration}ms</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{delivery.attemptCount}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {new Date(delivery.scheduledAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {delivery.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRetryDelivery(delivery.id)}
                                >
                                  <ArrowClockwise size={14} />
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye size={14} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Delivery Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Payload</Label>
                                      <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-60">
                                        {JSON.stringify(delivery.payload, null, 2)}
                                      </pre>
                                    </div>
                                    {delivery.responseBody && (
                                      <div>
                                        <Label>Response</Label>
                                        <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
                                          {delivery.responseBody}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredDeliveries.length === 0 && (
                <div className="text-center py-12">
                  <Activity size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Deliveries Found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter !== 'all' 
                      ? `No deliveries with status "${statusFilter}" found.`
                      : 'No webhook deliveries have been made yet.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Event Types</CardTitle>
              <CardDescription>
                Configure which events can trigger webhooks in your ERP system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEBHOOK_EVENTS.map((event) => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{event.name}</h4>
                      <Badge variant="outline">{event.module}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div>
                      <Label className="text-xs text-muted-foreground">Schema</Label>
                      <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                        {JSON.stringify(event.schema, null, 2)}
                      </pre>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Webhook Settings</CardTitle>
              <CardDescription>
                Configure default settings for webhook delivery and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Default Timeout (seconds)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label>Default Retry Attempts</Label>
                    <Input type="number" defaultValue="3" />
                  </div>
                  <div>
                    <Label>Retry Interval (seconds)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require HTTPS</Label>
                      <p className="text-sm text-muted-foreground">Only allow HTTPS webhook URLs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Verify SSL Certificates</Label>
                      <p className="text-sm text-muted-foreground">Validate SSL certificates for webhook URLs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">Limit webhook delivery rate per endpoint</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security measures for webhook delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Restrict webhook delivery to whitelisted IPs</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Signature Verification</Label>
                  <p className="text-sm text-muted-foreground">Require HMAC signature verification</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all webhook activities for compliance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}