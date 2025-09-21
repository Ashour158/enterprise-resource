import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  AlertTriangle, 
  TrendDown, 
  Monitor, 
  FileText, 
  Activity,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Target,
  Settings,
  Plus,
  Filter,
  Eye,
  X,
  ArrowRight,
  Brain,
  Lightbulb,
  Warning,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { CustomerEngagementAlert } from '@/types/crm'

interface CustomerEngagementAlertsProps {
  companyId: string
  userId: string
  customerId?: string // Optional - if provided, show alerts for specific customer
}

const CustomerEngagementAlerts: React.FC<CustomerEngagementAlertsProps> = ({
  companyId,
  userId,
  customerId
}) => {
  const [alerts, setAlerts] = useKV<CustomerEngagementAlert[]>('engagement-alerts', [])
  const [selectedAlert, setSelectedAlert] = useState<CustomerEngagementAlert | null>(null)
  const [activeTab, setActiveTab] = useState('active')
  const [filterSeverity, setFilterSeverity] = useState('all')

  // Initialize with comprehensive mock data
  useEffect(() => {
    if (alerts.length === 0) {
      const mockAlerts: CustomerEngagementAlert[] = [
        {
          id: 'alert-001',
          customerId: 'acc-001',
          alertType: 'portal_inactivity',
          severity: 'medium',
          message: 'Portal activity decreased by 40%',
          description: 'Acme Corporation has shown reduced portal engagement over the past week. Previous average of 8 sessions/week dropped to 5 sessions/week.',
          triggeredBy: 'ai_analysis',
          triggerConditions: { 
            portal_sessions: 'decreased', 
            threshold: 40,
            previous_average: 8,
            current_average: 5
          },
          status: 'active',
          acknowledgedBy: undefined,
          acknowledgedAt: undefined,
          resolvedBy: undefined,
          resolvedAt: undefined,
          recommendedActions: [
            'Send personalized engagement email',
            'Schedule check-in call with key stakeholder',
            'Offer training session on new features',
            'Review user access permissions'
          ],
          assignedTo: userId,
          dueDate: '2024-01-17T17:00:00Z',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: 'alert-002',
          customerId: 'acc-001',
          alertType: 'document_interaction',
          severity: 'low',
          message: 'Document downloads increased significantly',
          description: 'Customer has downloaded 8 documents in the past 3 days, indicating high engagement or potential expansion research.',
          triggeredBy: 'system',
          triggerConditions: { 
            document_downloads: 'increased', 
            threshold: 300,
            timeframe: '3_days',
            download_count: 8
          },
          status: 'active',
          recommendedActions: [
            'Reach out to understand information needs',
            'Offer guided demo of related features',
            'Schedule expansion conversation',
            'Provide additional resources'
          ],
          assignedTo: userId,
          dueDate: '2024-01-18T12:00:00Z',
          createdAt: '2024-01-14T16:30:00Z',
          updatedAt: '2024-01-14T16:30:00Z'
        },
        {
          id: 'alert-003',
          customerId: 'acc-002',
          alertType: 'health_score_decline',
          severity: 'high',
          message: 'Customer health score dropped to 73%',
          description: 'TechFlow Solutions health score decreased from 82% to 73% over the past month. Decline attributed to reduced support response satisfaction.',
          triggeredBy: 'ai_analysis',
          triggerConditions: { 
            health_score: 'decreased', 
            previous_score: 82,
            current_score: 73,
            threshold: 10
          },
          status: 'active',
          recommendedActions: [
            'Schedule immediate health check call',
            'Review recent support interactions',
            'Escalate to customer success manager',
            'Implement proactive support plan'
          ],
          assignedTo: userId,
          dueDate: '2024-01-16T14:00:00Z',
          createdAt: '2024-01-15T11:15:00Z',
          updatedAt: '2024-01-15T11:15:00Z'
        },
        {
          id: 'alert-004',
          customerId: 'acc-002',
          alertType: 'churn_risk',
          severity: 'critical',
          message: 'Churn risk elevated to high',
          description: 'AI analysis indicates 78% probability of churn based on reduced engagement, delayed payments, and support ticket escalations.',
          triggeredBy: 'ai_analysis',
          triggerConditions: { 
            churn_probability: 0.78,
            risk_factors: ['engagement_decline', 'payment_delays', 'support_escalations'],
            confidence: 0.92
          },
          status: 'active',
          recommendedActions: [
            'Executive escalation required',
            'Schedule emergency retention call',
            'Prepare retention offer',
            'Assign dedicated success manager',
            'Review contract terms and pricing'
          ],
          assignedTo: userId,
          dueDate: '2024-01-16T09:00:00Z',
          createdAt: '2024-01-15T14:45:00Z',
          updatedAt: '2024-01-15T14:45:00Z'
        },
        {
          id: 'alert-005',
          customerId: 'acc-001',
          alertType: 'engagement_drop',
          severity: 'medium',
          message: 'Email engagement rates declining',
          description: 'Email open rates dropped from 68% to 45% and click-through rates from 12% to 7% over the past two weeks.',
          triggeredBy: 'system',
          triggerConditions: { 
            email_opens: 'decreased',
            open_rate_previous: 0.68,
            open_rate_current: 0.45,
            ctr_previous: 0.12,
            ctr_current: 0.07
          },
          status: 'acknowledged',
          acknowledgedBy: userId,
          acknowledgedAt: '2024-01-15T10:30:00Z',
          recommendedActions: [
            'Refresh email content strategy',
            'A/B test subject lines',
            'Segment email campaigns',
            'Review email frequency'
          ],
          assignedTo: userId,
          dueDate: '2024-01-20T16:00:00Z',
          createdAt: '2024-01-13T13:20:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      ]
      setAlerts(mockAlerts)
    }
  }, [alerts, setAlerts, userId])

  // Filter alerts based on current view and customer
  const filteredAlerts = alerts.filter(alert => {
    if (customerId && alert.customerId !== customerId) return false
    
    const statusMatch = activeTab === 'all' || 
                       (activeTab === 'active' && alert.status === 'active') ||
                       (activeTab === 'acknowledged' && alert.status === 'acknowledged') ||
                       (activeTab === 'resolved' && alert.status === 'resolved')
    
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity
    
    return statusMatch && severityMatch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'high':
        return <Warning className="w-5 h-5 text-orange-600" />
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'portal_inactivity':
        return <Monitor className="w-4 h-4" />
      case 'document_interaction':
        return <FileText className="w-4 h-4" />
      case 'health_score_decline':
        return <TrendDown className="w-4 h-4" />
      case 'churn_risk':
        return <AlertTriangle className="w-4 h-4" />
      case 'engagement_drop':
        return <Activity className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: userId,
            acknowledgedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ))
    toast.success('Alert acknowledged')
  }

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            resolvedBy: userId,
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ))
    toast.success('Alert resolved')
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'dismissed',
            updatedAt: new Date().toISOString()
          }
        : alert
    ))
    toast.success('Alert dismissed')
  }

  const handleTakeAction = (action: string, alertId: string) => {
    toast.info(`Taking action: ${action}`)
    // Here you would implement the actual action logic
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Customer Engagement Alerts
                {filteredAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {filteredAlerts.filter(a => a.status === 'active').length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                AI-powered alerts for customer engagement patterns, portal activity, and churn risk indicators
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">
              Active ({alerts.filter(a => a.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged">
              Acknowledged ({alerts.filter(a => a.status === 'acknowledged').length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({alerts.filter(a => a.status === 'resolved').length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No alerts in this category</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {activeTab === 'active' 
                    ? 'All customer engagement alerts are addressed. Your customers are healthy!'
                    : `No ${activeTab} alerts found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${getSeverityColor(alert.severity)} border-l-4 hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getAlertTypeIcon(alert.alertType)}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${alert.severity === 'critical' ? 'border-red-300' : 
                                        alert.severity === 'high' ? 'border-orange-300' :
                                        alert.severity === 'medium' ? 'border-yellow-300' : 'border-blue-300'}`}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-1">{alert.message}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {alert.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAcknowledgeAlert(alert.id)
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ack
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResolveAlert(alert.id)
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolve
                            </Button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleResolveAlert(alert.id)
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        <span>Customer: {alert.customerId}</span>
                      </div>
                      {alert.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {alert.recommendedActions && alert.recommendedActions.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {alert.recommendedActions.slice(0, 2).map((action, index) => (
                            <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                              {action}
                            </Badge>
                          ))}
                          {alert.recommendedActions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{alert.recommendedActions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Detail Modal/Sidebar */}
      {selectedAlert && (
        <Card className="fixed top-4 right-4 w-96 max-h-[80vh] z-50 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alert Details</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedAlert(null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="max-h-96">
            <CardContent>
              <div className="space-y-4">
                <div className={`p-3 rounded border ${getSeverityColor(selectedAlert.severity)}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getSeverityIcon(selectedAlert.severity)}
                    <span className="font-medium">{selectedAlert.message}</span>
                  </div>
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alert Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{selectedAlert.alertType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Severity:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedAlert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedAlert.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Triggered by:</span>
                      <span className="capitalize">{selectedAlert.triggeredBy.replace('_', ' ')}</span>
                    </div>
                    {selectedAlert.dueDate && (
                      <div className="flex justify-between">
                        <span>Due date:</span>
                        <span>{new Date(selectedAlert.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAlert.recommendedActions && selectedAlert.recommendedActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {selectedAlert.recommendedActions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{action}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTakeAction(action, selectedAlert.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {selectedAlert.status === 'active' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          handleAcknowledgeAlert(selectedAlert.id)
                          setSelectedAlert(null)
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          handleResolveAlert(selectedAlert.id)
                          setSelectedAlert(null)
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                    </>
                  )}
                  {selectedAlert.status === 'acknowledged' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        handleResolveAlert(selectedAlert.id)
                        setSelectedAlert(null)
                      }}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

export default CustomerEngagementAlerts