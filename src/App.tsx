import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useRealTimeDataSync } from '@/hooks/useRealTimeDataSync'
import { useMultiCompanyAuth } from '@/hooks/useMultiCompanyAuth'
import { EnhancedErrorBoundary, setupGlobalErrorHandlers } from '@/components/ErrorBoundary'
import { Header } from '@/components/Header'
import { ModuleCard } from '@/components/ModuleCard'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { SystemHealthMonitor } from '@/components/SystemHealthMonitor'
import { RealTimeSyncPanel } from '@/components/RealTimeSyncPanel'
import { ModuleSyncStatus } from '@/components/ModuleSyncStatus'
import { RealTimeDataFeed } from '@/components/RealTimeDataFeed'
import { ConflictResolutionManager } from '@/components/ConflictResolutionManager'
import { PermissionDashboard } from '@/components/PermissionDashboard'
import { UserProfileManager } from '@/components/UserProfileManager'
import { CompanyDashboard } from '@/components/CompanyDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { TrendUp, Users, Package, CreditCard, Bell, X, WifiHigh, Brain, Buildings, Shield, User } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  // Setup global error handlers
  useEffect(() => {
    setupGlobalErrorHandlers()
  }, [])

  const [selectedCompany, setSelectedCompany] = useKV('selected-company', mockCompanies[0].id)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  
  const currentCompany = mockCompanies.find(c => c.id === selectedCompany) || mockCompanies[0]
  const activeModules = mockModules.filter(m => m.status === 'active')
  const totalNotifications = mockModules.reduce((sum, m) => sum + m.notifications, 0)

  // Multi-company authentication with null safety
  const { 
    isAuthenticated, 
    currentUser, 
    availableCompanies,
    switchCompany
  } = useMultiCompanyAuth()

  // Ensure availableCompanies is always an array
  const safeAvailableCompanies = Array.isArray(availableCompanies) ? availableCompanies : []

  // Real-time data synchronization with null safety
  const {
    isConnected,
    connectionQuality,
    syncInProgress,
    conflicts,
    pendingChanges,
    syncProgress,
    lastSyncTime,
    syncMetrics,
    triggerManualSync,
    resolveConflict,
    updateSyncConfig,
    getSyncStatus
  } = useRealTimeDataSync(currentCompany.id)

  // Ensure conflicts is always an array
  const safeConflicts = Array.isArray(conflicts) ? conflicts : []
  const safePendingChanges = pendingChanges || {}

  const handleCompanyChange = async (companyId: string) => {
    try {
      const result = await switchCompany(companyId)
      if (result.success) {
        setSelectedCompany(companyId)
        const company = mockCompanies.find(c => c.id === companyId)
        toast.success(`Switched to ${company?.name || 'Unknown Company'}`)
      } else {
        toast.error(result.error?.message || 'Failed to switch company')
      }
    } catch (error) {
      console.error('Error switching company:', error)
      toast.error('Failed to switch company')
    }
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
    const safeModules = Array.isArray(mockModules) ? mockModules : []
    const revenue = safeModules.find(m => m.id === 'finance')?.quickStats?.[0]?.value || '$0'
    const employees = safeModules.find(m => m.id === 'hr')?.quickStats?.[0]?.value || '0'
    const inventory = safeModules.find(m => m.id === 'inventory')?.quickStats?.[0]?.value || '0'
    const leads = safeModules.find(m => m.id === 'sales')?.quickStats?.[0]?.value || '0'
    
    return [
      { label: 'Revenue YTD', value: revenue, icon: <CreditCard size={20} />, color: 'text-green-600' },
      { label: 'Total Employees', value: employees, icon: <Users size={20} />, color: 'text-blue-600' },
      { label: 'Inventory Items', value: inventory, icon: <Package size={20} />, color: 'text-purple-600' },
      { label: 'Active Leads', value: leads, icon: <TrendUp size={20} />, color: 'text-orange-600' }
    ]
  }

  return (
    <EnhancedErrorBoundary>
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
            {Array.isArray(mockNotifications) && mockNotifications.length > 0 ? (
              mockNotifications.map((notification) => (
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
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="container mx-auto p-6 space-y-6">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {activeView === 'dashboard' ? 'Dashboard' : 
                 activeView === 'conflicts' ? 'Advanced Conflict Resolution' :
                 activeView === 'permissions' ? 'Permission Management' :
                 activeView === 'profile' ? 'User Profile' :
                 'Multi-Company Management'}
              </h1>
              <p className="text-muted-foreground">
                {activeView === 'dashboard' 
                  ? `Welcome back, ${mockUser.name}. Here's what's happening with ${currentCompany.name}.`
                  : activeView === 'conflicts'
                  ? 'Intelligent workflows and AI-powered resolution for data synchronization conflicts'
                  : activeView === 'permissions'
                  ? 'Advanced role-based access control with company isolation and security monitoring'
                  : activeView === 'profile'
                  ? 'Manage your personal information, preferences, and security settings'
                  : 'Manage access and switch between multiple companies'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="conflicts" className="flex items-center gap-2">
                  <Brain size={16} />
                  Conflict Resolution
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield size={16} />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User size={16} />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Buildings size={16} />
                  Companies
                </TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="flex items-center gap-2">
                <WifiHigh size={12} className={isConnected ? 'text-green-500' : 'text-red-500'} />
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {activeModules.length} Active Modules
              </Badge>
              <Badge variant="outline">
                {totalNotifications} Notifications
              </Badge>
              {safeConflicts.length > 0 && (
                <Badge variant="destructive">
                  {safeConflicts.length} Conflicts
                </Badge>
              )}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
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
                      {Array.isArray(mockModules) && mockModules.length > 0 ? (
                        mockModules.map((module) => (
                          <ModuleCard 
                            key={module.id} 
                            module={module} 
                            onSelect={handleModuleSelect}
                          />
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-muted-foreground py-8">
                          <Package size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No modules available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Module Sync Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Module Sync Status</CardTitle>
                    <CardDescription>
                      Real-time synchronization status for each module
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.isArray(mockModules) && mockModules.length > 0 ? (
                      mockModules.map((module) => (
                        <ModuleSyncStatus
                          key={module.id}
                          module={module}
                          isOnline={isConnected}
                          lastSyncTime={lastSyncTime}
                          pendingChanges={safePendingChanges[module.id] || 0}
                          onSync={() => triggerManualSync(module.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Package size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No modules to sync</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <RealTimeSyncPanel
                  syncStatus={getSyncStatus()}
                  syncProgress={syncProgress}
                  conflicts={safeConflicts}
                  modules={mockModules}
                  onTriggerSync={() => triggerManualSync()}
                  onResolveConflict={(conflictId: string, resolution: "client" | "server") => {
                    const strategy = {
                      strategy: resolution === 'client' ? 'client_wins' as const : 'server_wins' as const,
                      confidence: 90,
                      reasoning: `Manual resolution: ${resolution} wins`
                    }
                    resolveConflict(conflictId, strategy)
                  }}
                  onUpdateSyncConfig={(config) => {
                    // Convert single config to array for the hook
                    updateSyncConfig([config])
                  }}
                />
                <RealTimeDataFeed companyId={currentCompany.id} />
                <AIInsightsPanel 
                  insights={mockAIInsights}
                  onActionClick={handleAIActionClick}
                />
                <SystemHealthMonitor health={mockSystemHealth} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            <ConflictResolutionManager companyId={currentCompany.id} />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionDashboard 
              companyId={currentCompany.id}
              userId={mockUser.id}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <UserProfileManager userId={mockUser.id} />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <CompanyDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </EnhancedErrorBoundary>
  )
}

export default App