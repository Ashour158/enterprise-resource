import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Header } from '@/components/Header'
import { ModuleCard } from '@/components/ModuleCard'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { SystemHealthMonitor } from '@/components/SystemHealthMonitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { 
  mockCompanies, 
  mockUser, 
  mockModules, 
  mockNotifications, 
  mockAIInsights, 
  mockSystemHealth 
} from '@/data/mockData'
import { Company, ERPModule, AIInsight } from '@/types/erp'
import { TrendUp, Users, Package, CreditCard, Bell, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const [selectedCompany, setSelectedCompany] = useKV('selected-company', mockCompanies[0].id)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const currentCompany = mockCompanies.find(c => c.id === selectedCompany) || mockCompanies[0]
  const activeModules = mockModules.filter(m => m.status === 'active')
  const totalNotifications = mockModules.reduce((sum, m) => sum + m.notifications, 0)

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId)
    const company = mockCompanies.find(c => c.id === companyId)
    toast.success(`Switched to ${company?.name}`)
  }

  const handleModuleSelect = (moduleId: string) => {
    const module = mockModules.find(m => m.id === moduleId)
    toast.info(`Opening ${module?.name} module...`)
  }

  const handleAIActionClick = (insight: AIInsight, action: string) => {
    toast.success(`Executing: ${action} for ${insight.title}`)
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
  }

  const getQuickStats = () => {
    const revenue = mockModules.find(m => m.id === 'finance')?.quickStats[0]?.value || '$0'
    const employees = mockModules.find(m => m.id === 'hr')?.quickStats[0]?.value || '0'
    const inventory = mockModules.find(m => m.id === 'inventory')?.quickStats[0]?.value || '0'
    const leads = mockModules.find(m => m.id === 'sales')?.quickStats[0]?.value || '0'
    
    return [
      { label: 'Revenue YTD', value: revenue, icon: <CreditCard size={20} />, color: 'text-green-600' },
      { label: 'Total Employees', value: employees, icon: <Users size={20} />, color: 'text-blue-600' },
      { label: 'Inventory Items', value: inventory, icon: <Package size={20} />, color: 'text-purple-600' },
      { label: 'Active Leads', value: leads, icon: <TrendUp size={20} />, color: 'text-orange-600' }
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header 
        user={mockUser}
        currentCompany={currentCompany}
        companies={mockCompanies}
        notifications={mockNotifications}
        onCompanyChange={handleCompanyChange}
        onNotificationClick={handleNotificationClick}
      />

      {showNotifications && (
        <div className="fixed top-16 right-6 w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNotifications(false)}
              className="h-6 w-6 p-0"
            >
              <X size={14} />
            </Button>
          </div>
          <div className="p-2">
            {mockNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer border-l-2 border-l-primary/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.module}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {mockUser.name}. Here's what's happening with {currentCompany.name}.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {activeModules.length} Active Modules
            </Badge>
            <Badge variant="outline">
              {totalNotifications} Notifications
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickStats().map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ERP Modules</CardTitle>
                <CardDescription>
                  Access and monitor your integrated business modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockModules.map((module) => (
                    <ModuleCard 
                      key={module.id} 
                      module={module} 
                      onSelect={handleModuleSelect}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <AIInsightsPanel 
              insights={mockAIInsights}
              onActionClick={handleAIActionClick}
            />
            <SystemHealthMonitor health={mockSystemHealth} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App