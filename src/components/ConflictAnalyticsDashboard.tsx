import { useMemo } from 'react'
import { SyncConflict } from '@/types/erp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendUp, 
  TrendDown, 
  Clock, 
  Shield, 
  Warning, 
  CheckCircle,
  XCircle,
  Lightning,
  ChartBar,
  Calendar
} from '@phosphor-icons/react'

interface ConflictAnalyticsDashboardProps {
  conflicts: SyncConflict[]
  resolutionHistory: any[]
}

interface ConflictAnalytics {
  totalConflicts: number
  resolvedConflicts: number
  averageResolutionTime: number
  conflictsByModule: Record<string, number>
  conflictsByType: Record<string, number>
  businessImpactDistribution: Record<string, number>
  resolutionMethods: Record<string, number>
  priorityDistribution: Record<string, number>
  trendsOverTime: Array<{ date: string; conflicts: number; resolved: number }>
}

export function ConflictAnalyticsDashboard({ conflicts, resolutionHistory }: ConflictAnalyticsDashboardProps) {
  const analytics = useMemo((): ConflictAnalytics => {
    const totalConflicts = conflicts.length
    const resolvedConflicts = conflicts.filter(c => c.resolved).length
    
    const conflictsByModule = conflicts.reduce((acc, c) => {
      acc[c.module] = (acc[c.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const conflictsByType = conflicts.reduce((acc, c) => {
      acc[c.conflictType] = (acc[c.conflictType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const businessImpactDistribution = conflicts.reduce((acc, c) => {
      acc[c.businessImpact] = (acc[c.businessImpact] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const priorityDistribution = conflicts.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const resolutionMethods = resolutionHistory.reduce((acc, r) => {
      acc[r.strategy] = (acc[r.strategy] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageResolutionTime = resolutionHistory.length > 0 
      ? resolutionHistory.reduce((sum, r) => sum + r.processingTime, 0) / resolutionHistory.length
      : 0

    // Generate mock trends data for the last 7 days
    const trendsOverTime = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        conflicts: Math.floor(Math.random() * 10) + 1,
        resolved: Math.floor(Math.random() * 8) + 1
      }
    })

    return {
      totalConflicts,
      resolvedConflicts,
      averageResolutionTime,
      conflictsByModule,
      conflictsByType,
      businessImpactDistribution,
      resolutionMethods,
      priorityDistribution,
      trendsOverTime
    }
  }, [conflicts, resolutionHistory])

  const resolutionRate = analytics.totalConflicts > 0 
    ? (analytics.resolvedConflicts / analytics.totalConflicts) * 100 
    : 0

  const getBusinessImpactIcon = (impact: string) => {
    switch (impact) {
      case 'revenue': return <TrendUp size={16} className="text-green-600" />
      case 'compliance': return <Shield size={16} className="text-blue-600" />
      case 'operations': return <Lightning size={16} className="text-orange-600" />
      case 'reporting': return <Clock size={16} className="text-purple-600" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conflicts</p>
                <p className="text-3xl font-bold">{analytics.totalConflicts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.totalConflicts - analytics.resolvedConflicts} pending
                </p>
              </div>
              <Warning size={24} className="text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-3xl font-bold text-green-600">{resolutionRate.toFixed(1)}%</p>
                <Progress value={resolutionRate} className="mt-2" />
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-3xl font-bold">{(analytics.averageResolutionTime / 1000).toFixed(1)}s</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendDown size={12} className="mr-1" />
                  15% faster than last week
                </p>
              </div>
              <Clock size={24} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Conflicts</p>
                <p className="text-3xl font-bold text-red-600">
                  {analytics.priorityDistribution.critical || 0}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Requires immediate attention
                </p>
              </div>
              <XCircle size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">By Module</TabsTrigger>
          <TabsTrigger value="types">By Type</TabsTrigger>
          <TabsTrigger value="business-impact">Business Impact</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Conflicts by Priority</CardTitle>
              <CardDescription>Distribution of conflicts across priority levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
                const percentage = analytics.totalConflicts > 0 
                  ? (count / analytics.totalConflicts) * 100 
                  : 0
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          priority === 'critical' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="font-medium capitalize">{priority}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Resolution Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Methods</CardTitle>
              <CardDescription>How conflicts are being resolved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.resolutionMethods).map(([method, count]) => {
                const percentage = resolutionHistory.length > 0 
                  ? (count / resolutionHistory.length) * 100 
                  : 0
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{method.replace('_', ' ')}</span>
                      <div className="text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
              {Object.keys(analytics.resolutionMethods).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <ChartBar size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No resolutions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflicts by Module</CardTitle>
              <CardDescription>Which modules are experiencing the most conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analytics.conflictsByModule).map(([module, count]) => {
                  const percentage = analytics.totalConflicts > 0 
                    ? (count / analytics.totalConflicts) * 100 
                    : 0
                  return (
                    <div key={module} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {module}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{count}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} />
                      <div className="text-xs text-muted-foreground">
                        {count} conflicts in {module} module
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflicts by Type</CardTitle>
              <CardDescription>Most common types of data conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.conflictsByType).map(([type, count]) => {
                  const percentage = analytics.totalConflicts > 0 
                    ? (count / analytics.totalConflicts) * 100 
                    : 0
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{count}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} />
                      <div className="text-xs text-muted-foreground">
                        {type === 'data_mismatch' && 'Values differ between server and client'}
                        {type === 'concurrent_edit' && 'Multiple users edited the same data'}
                        {type === 'version_conflict' && 'Different versions of the same data'}
                        {type === 'permission_conflict' && 'Permission changes caused conflicts'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Impact Analysis</CardTitle>
              <CardDescription>Understanding how conflicts affect different business areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analytics.businessImpactDistribution).map(([impact, count]) => {
                  const percentage = analytics.totalConflicts > 0 
                    ? (count / analytics.totalConflicts) * 100 
                    : 0
                  return (
                    <div key={impact} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getBusinessImpactIcon(impact)}
                          <span className="font-medium capitalize">{impact}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xl">{count}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} />
                      <div className="text-xs text-muted-foreground">
                        {impact === 'revenue' && 'Directly affects financial performance'}
                        {impact === 'compliance' && 'May impact regulatory compliance'}
                        {impact === 'operations' && 'Affects day-to-day operations'}
                        {impact === 'reporting' && 'Impacts business intelligence and reporting'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Trends</CardTitle>
              <CardDescription>Conflict and resolution patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trendsOverTime.map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-orange-600">
                          {day.conflicts} conflicts
                        </span>
                        <span className="text-green-600">
                          {day.resolved} resolved
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Conflicts</div>
                        <Progress value={(day.conflicts / 10) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Resolved</div>
                        <Progress value={(day.resolved / 10) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}