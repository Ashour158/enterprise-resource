import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CRMDashboard } from '@/components/crm/CRMDashboard'
import { SalesReportingDashboard } from '@/components/crm/SalesReportingDashboard'
import { ContactManagement } from '@/components/crm/ContactManagement'
import { DealPipeline } from '@/components/crm/DealPipeline'
import { AIEnhancedLeadManagement } from '@/components/crm/enhanced/AIEnhancedLeadManagement'
import { AIEnhancedDealPipeline } from '@/components/crm/enhanced/AIEnhancedDealPipeline'
import { AccountManagement } from '@/components/crm/AccountManagement'
import { QuoteManagement } from '@/components/crm/QuoteManagement'
import { ActivityManagement } from '@/components/crm/ActivityManagement'
import { ForecastManagement } from '@/components/crm/ForecastManagement'
import { FileAttachmentSystem } from '@/components/shared/FileAttachmentSystem'
import { CRMImportExportSystem } from '@/components/shared/CRMImportExportSystem'
import { CRMHistoryTracker, useCRMHistory } from '@/components/shared/CRMHistoryTracker'
import { SmartCalendarIntegration } from '@/components/SmartCalendarIntegration'
import { mockCRMAnalytics, mockCRMSettings } from '@/data/crmMockData'
import { CRMAnalytics as CRMAnalyticsType, CRMSettings } from '@/types/crm'
import { 
  ChartLine, 
  Users, 
  Buildings, 
  TrendUp, 
  Calendar, 
  CheckSquare, 
  Headset, 
  FileText, 
  Gear,
  Phone,
  EnvelopeSimple as Mail,
  VideoCamera as Video,
  Target,
  CurrencyDollar as DollarSign,
  Activity,
  UserCheck,
  Clock,
  Warning as AlertTriangle,
  UserPlus,
  Handshake,
  Receipt,
  PresentationChart,
  Export,
  Download as Import,
  Database,
  ClockCounterClockwise as History,
  File as FileIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CRMModuleProps {
  companyId: string
  userId: string
  userRole: string
}

export function CRMModule({ companyId, userId, userRole }: CRMModuleProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analytics, setAnalytics] = useKV<CRMAnalyticsType>(`crm-analytics-${companyId}`, mockCRMAnalytics)
  const [settings, setSettings] = useKV<CRMSettings>(`crm-settings-${companyId}`, mockCRMSettings)
  const [quickStats, setQuickStats] = useState({
    newLeads: 0,
    hotDeals: 0,
    overdueActivities: 0,
    openTickets: 0
  })
  const [showImportExport, setShowImportExport] = useState(false)
  const [selectedEntityForHistory, setSelectedEntityForHistory] = useState<{type?: string, id?: string}>({})

  // Initialize CRM history tracking
  const { addEntry: addHistoryEntry } = useCRMHistory(companyId, userId, 'Current User')

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats(prev => ({
        newLeads: Math.floor(Math.random() * 5) + prev.newLeads,
        hotDeals: Math.floor(Math.random() * 3) + 2,
        overdueActivities: Math.floor(Math.random() * 8) + 1,
        openTickets: Math.floor(Math.random() * 6) + 3
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getQuickActions = () => [
    {
      icon: <Phone size={16} />,
      label: 'Log Call',
      action: () => {
        setActiveTab('activities')
        toast.success('Call logging interface opened')
      }
    },
    {
      icon: <Mail size={16} />,
      label: 'Send Email',
      action: () => {
        toast.success('Email composer opened')
        // Would integrate with email system
      }
    },
    {
      icon: <Video size={16} />,
      label: 'Schedule Meeting',
      action: () => {
        setActiveTab('activities')
        toast.success('Meeting scheduler opened')
      }
    },
    {
      icon: <Target size={16} />,
      label: 'Create Deal',
      action: () => {
        setActiveTab('pipeline')
        toast.info('Switched to deal pipeline')
      }
    },
    {
      icon: <UserPlus size={16} />,
      label: 'Add Lead',
      action: () => {
        setActiveTab('leads')
        toast.info('Switched to lead management')
      }
    },
    {
      icon: <Receipt size={16} />,
      label: 'Create Quote',
      action: () => {
        setActiveTab('quotes')
        toast.info('Switched to quote management')
      }
    }
  ]

  const getModuleStats = () => {
    const safeAnalytics = analytics || mockCRMAnalytics
    return [
      {
        label: 'Total Revenue',
        value: `$${safeAnalytics.totalRevenue.toLocaleString()}`,
        icon: <DollarSign size={20} />,
        color: 'text-green-600',
        change: '+12.5%'
      },
      {
        label: 'Active Deals',
        value: safeAnalytics.totalDeals.toString(),
        icon: <Target size={20} />,
        color: 'text-blue-600',
        change: '+8.2%'
      },
      {
        label: 'Win Rate',
        value: `${safeAnalytics.winRate}%`,
        icon: <TrendUp size={20} />,
        color: 'text-purple-600',
        change: '+3.1%'
      },
      {
        label: 'Total Contacts',
        value: safeAnalytics.totalContacts.toString(),
        icon: <Users size={20} />,
        color: 'text-orange-600',
        change: '+15.8%'
      }
    ]
  }

  const getAlerts = () => [
    {
      type: 'urgent',
      icon: <AlertTriangle size={16} />,
      message: `${quickStats.overdueActivities} overdue activities require attention`,
      action: () => setActiveTab('activities')
    },
    {
      type: 'info',
      icon: <UserCheck size={16} />,
      message: `${quickStats.newLeads} new leads awaiting qualification`,
      action: () => setActiveTab('leads')
    },
    {
      type: 'warning',
      icon: <Clock size={16} />,
      message: `${quickStats.hotDeals} deals closing this week`,
      action: () => setActiveTab('pipeline')
    }
  ]

  const handleScheduleMeeting = (entityId: string) => {
    // Integration with smart calendar
    addHistoryEntry({
      entityType: 'activity',
      entityId: `meeting-${Date.now()}`,
      entityName: 'Meeting Scheduled',
      action: 'created',
      description: `Meeting scheduled for entity ${entityId}`,
      metadata: {
        companyId,
        relatedEntities: [{ type: 'lead', id: entityId, name: 'Related Entity' }]
      }
    })
    toast.success('Meeting scheduled and added to calendar')
  }

  const handleCreateDeal = (leadId: string) => {
    addHistoryEntry({
      entityType: 'deal',
      entityId: `deal-${Date.now()}`,
      entityName: 'New Deal from Lead',
      action: 'created',
      description: `Deal created from lead conversion`,
      metadata: {
        companyId,
        relatedEntities: [{ type: 'lead', id: leadId, name: 'Converted Lead' }]
      }
    })
    setActiveTab('pipeline')
    toast.success('Lead converted to deal opportunity')
  }

  const handleBulkExport = () => {
    toast.success('Exporting all CRM data...')
    // Would export all CRM components data
  }

  const handleBulkImport = () => {
    toast.success('Bulk import dialog opened')
    // Would open comprehensive import dialog
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getModuleStats().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={action.action}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getAlerts().map((alert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={alert.action}
              >
                <div className={`${alert.type === 'urgent' ? 'text-red-500' : alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'}`}>
                  {alert.icon}
                </div>
                <p className="text-sm flex-1">{alert.message}</p>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main CRM Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-10 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ChartLine size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <UserPlus size={16} />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users size={16} />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Buildings size={16} />
              <span className="hidden sm:inline">Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <TrendUp size={16} />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <Receipt size={16} />
              <span className="hidden sm:inline">Quotes</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <PresentationChart size={16} />
              <span className="hidden sm:inline">Forecasting</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Headset size={16} />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileIcon size={16} />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="calendar-integration" className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowImportExport(true)}>
              <Export size={16} className="mr-2" />
              Export All
            </Button>
            <Button variant="outline" onClick={() => setShowImportExport(true)}>
              <Import size={16} className="mr-2" />
              Import Data
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <History size={16} className="mr-2" />
                  View History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>CRM Activity History</DialogTitle>
                </DialogHeader>
                <CRMHistoryTracker
                  companyId={companyId}
                  userId={userId}
                  entityType={selectedEntityForHistory.type as any}
                  entityId={selectedEntityForHistory.id}
                />
              </DialogContent>
            </Dialog>
            <Badge variant="outline" className="hidden sm:flex">
              Company: {companyId}
            </Badge>
            <Badge variant="outline">
              {(analytics || mockCRMAnalytics).totalContacts} Contacts
            </Badge>
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <CRMDashboard 
            companyId={companyId}
            userId={userId}
            analytics={analytics || mockCRMAnalytics}
            onNavigate={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <AIEnhancedLeadManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            onScheduleMeeting={handleScheduleMeeting}
            onCreateDeal={handleCreateDeal}
          />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <ContactManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <AccountManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <AIEnhancedDealPipeline 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <QuoteManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <ActivityManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            onScheduleMeeting={handleScheduleMeeting}
          />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <ForecastManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Service</CardTitle>
              <CardDescription>Handle support tickets and customer issues</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customer service interface with ticket management, knowledge base, and customer support tools will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <SalesReportingDashboard 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CRM File Management</CardTitle>
                <CardDescription>
                  Centralized file storage for all CRM entities with smart categorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileAttachmentSystem
                  entityId="crm-global"
                  entityType="account"
                  companyId={companyId}
                  userId={userId}
                  allowedTypes={['*']}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  maxFiles={100}
                  showPreview={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent CRM Activity</CardTitle>
                <CardDescription>
                  Track all changes and interactions across CRM entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CRMHistoryTracker
                  companyId={companyId}
                  userId={userId}
                  showFilters={false}
                  maxEntries={20}
                  compact={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar-integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SmartCalendarIntegration
                companyId={companyId}
                userId={userId}
                departmentId="sales"
                onboardingEmployeeId={userId}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>
                    Seamlessly sync CRM activities with your calendar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Automatic Scheduling</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Meetings, calls, and follow-ups are automatically scheduled based on CRM activities
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Smart Reminders</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get intelligent reminders for important customer interactions
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Team Coordination</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Coordinate team activities and avoid scheduling conflicts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Import/Export Modal */}
      {showImportExport && (
        <Dialog open={showImportExport} onOpenChange={setShowImportExport}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>CRM Data Import/Export System</DialogTitle>
            </DialogHeader>
            <CRMImportExportSystem
              companyId={companyId}
              userId={userId}
              userRole={userRole}
              onClose={() => setShowImportExport(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}