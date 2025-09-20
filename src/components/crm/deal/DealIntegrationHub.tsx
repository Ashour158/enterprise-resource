import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  LinkSimple, 
  Gear, 
  CheckCircle, 
  XCircle, 
  WarningCircle,
  Clock,
  Robot,
  Database,
  CloudArrowUp,
  Package,
  CreditCard,
  FileText,
  Users,
  Calendar,
  Mail,
  Bell,
  ChartBar,
  Shield,
  Key,
  Play,
  Pause,
  Refresh,
  Download,
  Upload,
  Eye,
  PencilSimple,
  TrashSimple,
  Plus,
  Activity,
  Workflow,
  Target,
  Building
} from '@phosphor-icons/react'

interface Deal {
  id: string
  dealNumber: string
  title: string
  value: number
  stage: string
  status: 'active' | 'won' | 'lost' | 'on_hold'
  accountId: string
  contactId: string
}

interface Integration {
  id: string
  name: string
  type: 'erp' | 'accounting' | 'inventory' | 'email' | 'calendar' | 'analytics' | 'billing' | 'support'
  provider: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  isEnabled: boolean
  lastSync: string
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly'
  configuration: IntegrationConfig
  features: string[]
  dataMapping: Record<string, string>
  webhookUrl?: string
  apiKey?: string
  credentials: Record<string, any>
  syncStats: SyncStats
}

interface IntegrationConfig {
  autoSync: boolean
  bidirectional: boolean
  conflictResolution: 'source_wins' | 'target_wins' | 'manual_review'
  fieldMappings: FieldMapping[]
  filters: IntegrationFilter[]
  transformations: DataTransformation[]
}

interface FieldMapping {
  sourceField: string
  targetField: string
  transformation?: string
  isRequired: boolean
}

interface IntegrationFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
  isActive: boolean
}

interface DataTransformation {
  field: string
  rule: string
  description: string
}

interface SyncStats {
  totalRecords: number
  successfulSyncs: number
  failedSyncs: number
  lastSyncDuration: number
  avgSyncTime: number
  errorRate: number
}

interface SyncActivity {
  id: string
  integrationId: string
  timestamp: string
  type: 'sync' | 'create' | 'update' | 'delete' | 'error'
  recordType: string
  recordId: string
  status: 'success' | 'failed' | 'warning'
  message: string
  details: Record<string, any>
}

interface DealIntegrationHubProps {
  deals: Deal[]
  companyId: string
  userId: string
}

export function DealIntegrationHub({ deals, companyId, userId }: DealIntegrationHubProps) {
  const [integrations, setIntegrations] = useKV<Integration[]>(`deal-integrations-${companyId}`, [])
  const [syncActivities, setSyncActivities] = useKV<SyncActivity[]>(`sync-activities-${companyId}`, [])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Initialize default integrations
  useEffect(() => {
    if (integrations.length === 0) {
      initializeIntegrations()
    }
  }, [])

  const initializeIntegrations = () => {
    const defaultIntegrations: Integration[] = [
      {
        id: 'salesforce-erp',
        name: 'Salesforce ERP',
        type: 'erp',
        provider: 'Salesforce',
        description: 'Sync deals and opportunities with Salesforce CRM',
        status: 'connected',
        isEnabled: true,
        lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        syncFrequency: 'real_time',
        features: ['Bidirectional sync', 'Real-time updates', 'Conflict resolution', 'Field mapping'],
        dataMapping: {
          'deal.title': 'opportunity.name',
          'deal.value': 'opportunity.amount',
          'deal.stage': 'opportunity.stage',
          'deal.closeDate': 'opportunity.closeDate'
        },
        webhookUrl: 'https://api.salesforce.com/webhooks/deals',
        configuration: {
          autoSync: true,
          bidirectional: true,
          conflictResolution: 'source_wins',
          fieldMappings: [
            { sourceField: 'title', targetField: 'name', isRequired: true },
            { sourceField: 'value', targetField: 'amount', isRequired: true },
            { sourceField: 'stage', targetField: 'stageName', isRequired: true }
          ],
          filters: [
            { field: 'status', operator: 'equals', value: 'active', isActive: true }
          ],
          transformations: [
            { field: 'value', rule: 'multiply(1.1)', description: 'Add 10% markup' }
          ]
        },
        credentials: { apiKey: 'sf_12345', instanceUrl: 'https://company.salesforce.com' },
        syncStats: {
          totalRecords: 1250,
          successfulSyncs: 1198,
          failedSyncs: 52,
          lastSyncDuration: 2.5,
          avgSyncTime: 3.2,
          errorRate: 4.2
        }
      },

      {
        id: 'quickbooks-accounting',
        name: 'QuickBooks Online',
        type: 'accounting',
        provider: 'Intuit',
        description: 'Sync deal revenue and invoicing with QuickBooks',
        status: 'connected',
        isEnabled: true,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        syncFrequency: 'daily',
        features: ['Revenue recognition', 'Invoice generation', 'Payment tracking', 'Tax calculation'],
        dataMapping: {
          'deal.value': 'invoice.amount',
          'deal.accountId': 'customer.id',
          'deal.status': 'invoice.status'
        },
        configuration: {
          autoSync: true,
          bidirectional: false,
          conflictResolution: 'manual_review',
          fieldMappings: [
            { sourceField: 'value', targetField: 'amount', isRequired: true },
            { sourceField: 'accountId', targetField: 'customerId', isRequired: true }
          ],
          filters: [
            { field: 'status', operator: 'equals', value: 'won', isActive: true }
          ],
          transformations: []
        },
        credentials: { companyId: 'qb_123', accessToken: 'qb_token_456' },
        syncStats: {
          totalRecords: 450,
          successfulSyncs: 445,
          failedSyncs: 5,
          lastSyncDuration: 1.8,
          avgSyncTime: 2.1,
          errorRate: 1.1
        }
      },

      {
        id: 'hubspot-marketing',
        name: 'HubSpot Marketing',
        type: 'analytics',
        provider: 'HubSpot',
        description: 'Track deal performance and lead attribution',
        status: 'connected',
        isEnabled: true,
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        syncFrequency: 'hourly',
        features: ['Lead attribution', 'Campaign ROI', 'Deal analytics', 'Revenue reporting'],
        dataMapping: {
          'deal.source': 'contact.originalSource',
          'deal.value': 'deal.amount',
          'deal.stage': 'deal.dealstage'
        },
        configuration: {
          autoSync: true,
          bidirectional: false,
          conflictResolution: 'source_wins',
          fieldMappings: [
            { sourceField: 'source', targetField: 'originalSource', isRequired: false },
            { sourceField: 'value', targetField: 'amount', isRequired: true }
          ],
          filters: [],
          transformations: []
        },
        credentials: { apiKey: 'hs_789', portalId: 'hs_portal_123' },
        syncStats: {
          totalRecords: 2100,
          successfulSyncs: 2085,
          failedSyncs: 15,
          lastSyncDuration: 4.2,
          avgSyncTime: 3.8,
          errorRate: 0.7
        }
      },

      {
        id: 'inventory-system',
        name: 'Inventory Management',
        type: 'inventory',
        provider: 'NetSuite',
        description: 'Check product availability and reserve inventory',
        status: 'syncing',
        isEnabled: true,
        lastSync: new Date().toISOString(),
        syncFrequency: 'real_time',
        features: ['Stock checking', 'Inventory reservation', 'Product catalog sync', 'Pricing updates'],
        dataMapping: {
          'deal.products': 'inventory.items',
          'deal.quantity': 'inventory.reserved',
          'deal.value': 'pricing.total'
        },
        configuration: {
          autoSync: true,
          bidirectional: true,
          conflictResolution: 'target_wins',
          fieldMappings: [
            { sourceField: 'products', targetField: 'items', isRequired: true },
            { sourceField: 'quantity', targetField: 'reservedQuantity', isRequired: true }
          ],
          filters: [
            { field: 'status', operator: 'equals', value: 'active', isActive: true }
          ],
          transformations: []
        },
        credentials: { accountId: 'ns_account', consumerKey: 'ns_key', consumerSecret: 'ns_secret' },
        syncStats: {
          totalRecords: 850,
          successfulSyncs: 830,
          failedSyncs: 20,
          lastSyncDuration: 5.1,
          avgSyncTime: 4.8,
          errorRate: 2.4
        }
      },

      {
        id: 'email-automation',
        name: 'Mailchimp',
        type: 'email',
        provider: 'Mailchimp',
        description: 'Automated email campaigns based on deal stages',
        status: 'connected',
        isEnabled: false,
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        syncFrequency: 'daily',
        features: ['Stage-based campaigns', 'Deal notifications', 'Customer segmentation', 'Email analytics'],
        dataMapping: {
          'deal.stage': 'campaign.trigger',
          'deal.contactId': 'subscriber.id',
          'deal.value': 'subscriber.dealValue'
        },
        configuration: {
          autoSync: false,
          bidirectional: false,
          conflictResolution: 'source_wins',
          fieldMappings: [
            { sourceField: 'contactId', targetField: 'email', isRequired: true },
            { sourceField: 'stage', targetField: 'campaignTrigger', isRequired: true }
          ],
          filters: [
            { field: 'value', operator: 'greater_than', value: '10000', isActive: true }
          ],
          transformations: []
        },
        credentials: { apiKey: 'mc_api_key', dataCenter: 'us19' },
        syncStats: {
          totalRecords: 320,
          successfulSyncs: 315,
          failedSyncs: 5,
          lastSyncDuration: 1.2,
          avgSyncTime: 1.5,
          errorRate: 1.6
        }
      }
    ]

    setIntegrations(defaultIntegrations)
  }

  const triggerSync = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return

    // Update integration status to syncing
    setIntegrations(current =>
      current.map(int =>
        int.id === integrationId
          ? { ...int, status: 'syncing' }
          : int
      )
    )

    toast.info(`Starting sync with ${integration.name}...`)

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Simulate sync results
    const success = Math.random() > 0.1 // 90% success rate
    const syncedRecords = Math.floor(Math.random() * 50) + 10

    // Create sync activity
    const activity: SyncActivity = {
      id: `activity-${Date.now()}`,
      integrationId,
      timestamp: new Date().toISOString(),
      type: 'sync',
      recordType: 'deal',
      recordId: 'batch',
      status: success ? 'success' : 'failed',
      message: success 
        ? `Successfully synced ${syncedRecords} records`
        : 'Sync failed due to authentication error',
      details: {
        recordsProcessed: syncedRecords,
        duration: Math.random() * 5 + 1,
        errors: success ? [] : ['Invalid API credentials']
      }
    }

    setSyncActivities(current => [activity, ...current.slice(0, 99)])

    // Update integration status and stats
    setIntegrations(current =>
      current.map(int =>
        int.id === integrationId
          ? {
              ...int,
              status: success ? 'connected' : 'error',
              lastSync: new Date().toISOString(),
              syncStats: {
                ...int.syncStats,
                totalRecords: int.syncStats.totalRecords + syncedRecords,
                successfulSyncs: success ? int.syncStats.successfulSyncs + 1 : int.syncStats.successfulSyncs,
                failedSyncs: success ? int.syncStats.failedSyncs : int.syncStats.failedSyncs + 1,
                lastSyncDuration: activity.details.duration
              }
            }
          : int
      )
    )

    if (success) {
      toast.success(`${integration.name} sync completed successfully`)
    } else {
      toast.error(`${integration.name} sync failed`)
    }
  }

  const toggleIntegration = (integrationId: string, enabled: boolean) => {
    setIntegrations(current =>
      current.map(int =>
        int.id === integrationId
          ? { ...int, isEnabled: enabled }
          : int
      )
    )

    const integration = integrations.find(i => i.id === integrationId)
    toast.success(`${integration?.name} ${enabled ? 'enabled' : 'disabled'}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'error':
        return <WarningCircle className="h-5 w-5 text-red-600" />
      case 'syncing':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'syncing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'erp': return <Database className="h-5 w-5 text-blue-600" />
      case 'accounting': return <CreditCard className="h-5 w-5 text-green-600" />
      case 'inventory': return <Package className="h-5 w-5 text-purple-600" />
      case 'email': return <Mail className="h-5 w-5 text-orange-600" />
      case 'calendar': return <Calendar className="h-5 w-5 text-pink-600" />
      case 'analytics': return <ChartBar className="h-5 w-5 text-indigo-600" />
      case 'billing': return <FileText className="h-5 w-5 text-yellow-600" />
      case 'support': return <Users className="h-5 w-5 text-teal-600" />
      default: return <LinkSimple className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else if (status === 'warning') {
      return <WarningCircle className="h-4 w-4 text-yellow-600" />
    }

    switch (type) {
      case 'sync': return <Refresh className="h-4 w-4 text-blue-600" />
      case 'create': return <Plus className="h-4 w-4 text-green-600" />
      case 'update': return <PencilSimple className="h-4 w-4 text-yellow-600" />
      case 'delete': return <TrashSimple className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkSimple className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Deal Integration Hub</h2>
            <p className="text-muted-foreground">
              Connect and sync deals with external systems
            </p>
          </div>
        </div>
        <Button onClick={() => setShowConfigDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="activity">Sync Activity</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Integrations</p>
                    <p className="text-2xl font-bold">{integrations.filter(i => i.isEnabled).length}</p>
                  </div>
                  <LinkSimple className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Connected Systems</p>
                    <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sync Success Rate</p>
                    <p className="text-2xl font-bold">
                      {integrations.length > 0 
                        ? Math.round((1 - integrations.reduce((sum, i) => sum + i.syncStats.errorRate, 0) / integrations.length / 100) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Records Synced</p>
                    <p className="text-2xl font-bold">
                      {integrations.reduce((sum, i) => sum + i.syncStats.totalRecords, 0).toLocaleString()}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integration => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(integration.type)}
                        <h3 className="font-semibold">{integration.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{integration.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span>{new Date(integration.lastSync).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Records:</span>
                        <span>{integration.syncStats.totalRecords.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>{(100 - integration.syncStats.errorRate).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => triggerSync(integration.id)}
                        disabled={!integration.isEnabled || integration.status === 'syncing'}
                      >
                        <Refresh className="h-4 w-4 mr-1" />
                        Sync Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Gear className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="space-y-4">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(integration.type)}
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </div>
                      <Switch
                        checked={integration.isEnabled}
                        onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Features</h4>
                      <div className="space-y-1">
                        {integration.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Sync Statistics</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Total Records:</span>
                          <span>{integration.syncStats.totalRecords}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span>{(100 - integration.syncStats.errorRate).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Duration:</span>
                          <span>{integration.syncStats.avgSyncTime.toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Configuration</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Auto Sync:</span>
                          <span>{integration.configuration.autoSync ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bidirectional:</span>
                          <span>{integration.configuration.bidirectional ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="capitalize">{integration.syncFrequency.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => triggerSync(integration.id)}
                      disabled={!integration.isEnabled || integration.status === 'syncing'}
                    >
                      <Refresh className="h-4 w-4 mr-1" />
                      Sync Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Gear className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Activity</CardTitle>
              <CardDescription>
                Monitor integration sync activities and troubleshoot issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncActivities.slice(0, 20).map(activity => {
                  const integration = integrations.find(i => i.id === activity.integrationId)
                  
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type, activity.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {integration?.name} - {activity.type}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={activity.status === 'success' ? 'default' : 
                                 activity.status === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
                
                {syncActivities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(integration.type)}
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Field Mappings</h4>
                    <div className="space-y-2">
                      {Object.entries(integration.dataMapping).map(([source, target]) => (
                        <div key={source} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-mono">{source}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{target}</span>
                        </div>
                      ))}
                    </div>
                    
                    {integration.configuration.transformations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Data Transformations</h4>
                        <div className="space-y-1">
                          {integration.configuration.transformations.map(transform => (
                            <div key={transform.field} className="text-xs">
                              <span className="font-mono">{transform.field}</span>: {transform.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map(integration => (
                    <div key={integration.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{integration.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(100 - integration.syncStats.errorRate).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${100 - integration.syncStats.errorRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map(integration => (
                    <div key={integration.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(integration.type)}
                        <span className="text-sm">{integration.name}</span>
                      </div>
                      <span className="font-medium">
                        {integration.syncStats.totalRecords.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Details Dialog */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedIntegration.type)}
                {selectedIntegration.name} Configuration
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="settings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sync Frequency</Label>
                    <Select value={selectedIntegration.syncFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real_time">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Conflict Resolution</Label>
                    <Select value={selectedIntegration.configuration.conflictResolution}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="source_wins">Source Wins</SelectItem>
                        <SelectItem value="target_wins">Target Wins</SelectItem>
                        <SelectItem value="manual_review">Manual Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto Sync</Label>
                    <Switch checked={selectedIntegration.configuration.autoSync} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Bidirectional Sync</Label>
                    <Switch checked={selectedIntegration.configuration.bidirectional} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mapping" className="space-y-4">
                <div className="space-y-4">
                  {selectedIntegration.configuration.fieldMappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <Input value={mapping.sourceField} placeholder="Source Field" />
                      <Input value={mapping.targetField} placeholder="Target Field" />
                      <Switch checked={mapping.isRequired} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="space-y-4">
                  {selectedIntegration.configuration.filters.map((filter, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center">
                      <Input value={filter.field} placeholder="Field" />
                      <Select value={filter.operator}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={filter.value} placeholder="Value" />
                      <Switch checked={filter.isActive} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>API Key</Label>
                    <Input type="password" value="••••••••••••" />
                  </div>
                  <div>
                    <Label>Endpoint URL</Label>
                    <Input value={selectedIntegration.webhookUrl} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Test Connection</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}