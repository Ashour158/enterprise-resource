import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CRMDashboard } from '@/components/crm/CRMDashboard'
import { ContactManagement } from '@/components/crm/ContactManagement'
import { DealPipeline } from '@/components/crm/DealPipeline'
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
  Video,
  Target,
  CurrencyDollar as DollarSign,
  Activity,
  UserCheck,
  Clock,
  Warning as AlertTriangle
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
        toast.success('Call logging interface opened')
        // Would open call logging modal
      }
    },
    {
      icon: <Mail size={16} />,
      label: 'Send Email',
      action: () => {
        toast.success('Email composer opened')
        // Would open email composer
      }
    },
    {
      icon: <Video size={16} />,
      label: 'Schedule Meeting',
      action: () => {
        toast.success('Meeting scheduler opened')
        // Would open calendar integration
      }
    },
    {
      icon: <Target size={16} />,
      label: 'Create Deal',
      action: () => {
        setActiveTab('pipeline')
        toast.info('Switched to deal pipeline')
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
        label: 'Avg Deal Size',
        value: `$${safeAnalytics.averageDealSize.toLocaleString()}`,
        icon: <ChartLine size={20} />,
        color: 'text-orange-600',
        change: '+5.8%'
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
      action: () => setActiveTab('contacts')
    },
    {
      type: 'warning',
      icon: <Clock size={16} />,
      message: `${quickStats.hotDeals} deals closing this week`,
      action: () => setActiveTab('pipeline')
    }
  ]

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
          <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ChartLine size={16} />
              <span className="hidden sm:inline">Dashboard</span>
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
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare size={16} />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Headset size={16} />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Gear size={16} />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
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

        <TabsContent value="contacts" className="space-y-6">
          <ContactManagement 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage customer accounts and organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <DealPipeline 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Center</CardTitle>
              <CardDescription>Track calls, meetings, and customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity center interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Manage follow-ups and action items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Service</CardTitle>
              <CardDescription>Handle support tickets and customer issues</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customer service interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Reports</CardTitle>
              <CardDescription>Analytics and performance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CRM reports interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Settings</CardTitle>
              <CardDescription>Configure CRM preferences and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CRM settings interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}