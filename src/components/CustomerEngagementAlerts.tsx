import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  TrendDown, 
  TrendUp, 
  Clock, 
  Eye, 
  Download, 
  Users, 
  FileText, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Brain,
  BarChart3,
  Activity,
  UserCheck,
  Timer,
  Target,
  Mail,
  Zap
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EngagementAlert {
  id: string
  customerId: string
  customerName: string
  alertType: 'low_activity' | 'document_stagnation' | 'login_decline' | 'usage_drop' | 'risk_churn' | 'expansion_opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  metrics: {
    current: number
    previous: number
    change: number
    threshold: number
  }
  recommendations: string[]
  triggerDate: Date
  isRead: boolean
  isResolved: boolean
  assignedTo?: string
  dueDate?: Date
}

interface AlertRule {
  id: string
  name: string
  type: 'portal_activity' | 'document_interaction' | 'login_frequency' | 'feature_usage'
  isActive: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  conditions: {
    metric: string
    operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals'
    value: number
    timeframe: number // days
  }[]
  actions: {
    sendEmail: boolean
    createTask: boolean
    assignTo?: string
    customMessage?: string
  }
  createdAt: Date
  lastTriggered?: Date
}

interface EngagementMetrics {
  customerId: string
  customerName: string
  portalLogins: {
    thisWeek: number
    lastWeek: number
    thisMonth: number
    lastMonth: number
  }
  documentInteractions: {
    views: number
    downloads: number
    timeSpent: number // minutes
    uniqueDocuments: number
  }
  featureUsage: {
    [feature: string]: {
      uses: number
      lastUsed: Date
    }
  }
  engagementScore: number
  churnRisk: number
  lastActivity: Date
}

interface CustomerEngagementAlertsProps {
  companyId: string
  userId: string
}

export function CustomerEngagementAlerts({ companyId, userId }: CustomerEngagementAlertsProps) {
  const [alerts, setAlerts] = useKV<EngagementAlert[]>(`engagement-alerts-${companyId}`, [])
  const [alertRules, setAlertRules] = useKV<AlertRule[]>(`alert-rules-${companyId}`, [])
  const [engagementMetrics, setEngagementMetrics] = useKV<EngagementMetrics[]>(`engagement-metrics-${companyId}`, [])
  
  const [selectedAlert, setSelectedAlert] = useState<EngagementAlert | null>(null)
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [activeView, setActiveView] = useState('alerts')

  // Initialize with sample data
  useEffect(() => {
    if (alerts.length === 0) {
      generateSampleAlerts()
    }
    if (alertRules.length === 0) {
      initializeDefaultRules()
    }
    if (engagementMetrics.length === 0) {
      generateSampleMetrics()
    }
  }, [])

  const generateSampleAlerts = () => {
    const sampleAlerts: EngagementAlert[] = [
      {
        id: 'alert-001',
        customerId: 'cust-001',
        customerName: 'Acme Corporation',
        alertType: 'low_activity',
        severity: 'high',
        title: 'Significant Drop in Portal Activity',
        description: 'Portal logins decreased by 75% over the past 2 weeks',
        metrics: {
          current: 3,
          previous: 12,
          change: -75,
          threshold: 8
        },
        recommendations: [
          'Schedule a check-in call with the customer',
          'Send personalized engagement email with product updates',
          'Offer training session or product demo'
        ],
        triggerDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: false,
        isResolved: false,
        assignedTo: 'John Smith',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'alert-002',
        customerId: 'cust-002',
        customerName: 'Tech Solutions Inc',
        alertType: 'document_stagnation',
        severity: 'medium',
        title: 'Key Documents Not Accessed',
        description: 'Important implementation guides haven\'t been viewed in 10 days',
        metrics: {
          current: 0,
          previous: 5,
          change: -100,
          threshold: 2
        },
        recommendations: [
          'Send reminder about important documentation',
          'Create guided tour of key resources',
          'Schedule implementation review meeting'
        ],
        triggerDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: true,
        isResolved: false,
        assignedTo: 'Sarah Johnson'
      },
      {
        id: 'alert-003',
        customerId: 'cust-003',
        customerName: 'Global Enterprises',
        alertType: 'expansion_opportunity',
        severity: 'low',
        title: 'High Engagement Indicates Expansion Readiness',
        description: 'Customer showing increased usage patterns and exploring advanced features',
        metrics: {
          current: 95,
          previous: 70,
          change: 36,
          threshold: 85
        },
        recommendations: [
          'Present additional module options',
          'Schedule expansion discussion',
          'Prepare custom pricing proposal'
        ],
        triggerDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isRead: false,
        isResolved: false
      }
    ]
    setAlerts(sampleAlerts)
  }

  const initializeDefaultRules = () => {
    const defaultRules: AlertRule[] = [
      {
        id: 'rule-001',
        name: 'Low Portal Activity',
        type: 'portal_activity',
        isActive: true,
        severity: 'high',
        conditions: [
          {
            metric: 'weekly_logins',
            operator: 'less_than',
            value: 3,
            timeframe: 7
          }
        ],
        actions: {
          sendEmail: true,
          createTask: true,
          assignTo: 'Account Manager',
          customMessage: 'Customer showing decreased portal engagement'
        },
        createdAt: new Date()
      },
      {
        id: 'rule-002',
        name: 'Document Stagnation',
        type: 'document_interaction',
        isActive: true,
        severity: 'medium',
        conditions: [
          {
            metric: 'document_views',
            operator: 'less_than',
            value: 1,
            timeframe: 7
          }
        ],
        actions: {
          sendEmail: true,
          createTask: false,
          customMessage: 'Important documents not being accessed'
        },
        createdAt: new Date()
      },
      {
        id: 'rule-003',
        name: 'High Engagement - Expansion Opportunity',
        type: 'feature_usage',
        isActive: true,
        severity: 'low',
        conditions: [
          {
            metric: 'engagement_score',
            operator: 'greater_than',
            value: 85,
            timeframe: 14
          }
        ],
        actions: {
          sendEmail: false,
          createTask: true,
          assignTo: 'Sales Team',
          customMessage: 'Customer showing high engagement - potential expansion opportunity'
        },
        createdAt: new Date()
      }
    ]
    setAlertRules(defaultRules)
  }

  const generateSampleMetrics = () => {
    const sampleMetrics: EngagementMetrics[] = [
      {
        customerId: 'cust-001',
        customerName: 'Acme Corporation',
        portalLogins: {
          thisWeek: 3,
          lastWeek: 12,
          thisMonth: 15,
          lastMonth: 45
        },
        documentInteractions: {
          views: 8,
          downloads: 2,
          timeSpent: 45,
          uniqueDocuments: 4
        },
        featureUsage: {
          'dashboard': { uses: 15, lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          'reports': { uses: 3, lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          'settings': { uses: 1, lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
        },
        engagementScore: 35,
        churnRisk: 75,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        customerId: 'cust-002',
        customerName: 'Tech Solutions Inc',
        portalLogins: {
          thisWeek: 8,
          lastWeek: 9,
          thisMonth: 32,
          lastMonth: 35
        },
        documentInteractions: {
          views: 25,
          downloads: 8,
          timeSpent: 120,
          uniqueDocuments: 12
        },
        featureUsage: {
          'dashboard': { uses: 32, lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          'reports': { uses: 15, lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          'settings': { uses: 5, lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        },
        engagementScore: 78,
        churnRisk: 15,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        customerId: 'cust-003',
        customerName: 'Global Enterprises',
        portalLogins: {
          thisWeek: 15,
          lastWeek: 12,
          thisMonth: 58,
          lastMonth: 42
        },
        documentInteractions: {
          views: 45,
          downloads: 18,
          timeSpent: 320,
          uniqueDocuments: 25
        },
        featureUsage: {
          'dashboard': { uses: 58, lastUsed: new Date(Date.now() - 30 * 60 * 1000) },
          'reports': { uses: 28, lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          'settings': { uses: 12, lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000) },
          'advanced_analytics': { uses: 8, lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) }
        },
        engagementScore: 95,
        churnRisk: 5,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
    setEngagementMetrics(sampleMetrics)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle size={16} className="text-red-500" />
      case 'high': return <AlertTriangle size={16} className="text-orange-500" />
      case 'medium': return <Clock size={16} className="text-yellow-500" />
      case 'low': return <CheckCircle size={16} className="text-blue-500" />
      default: return <Bell size={16} />
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'low_activity': return <TrendDown size={16} />
      case 'document_stagnation': return <FileText size={16} />
      case 'login_decline': return <UserCheck size={16} />
      case 'usage_drop': return <BarChart3 size={16} />
      case 'risk_churn': return <AlertTriangle size={16} />
      case 'expansion_opportunity': return <TrendUp size={16} />
      default: return <Bell size={16} />
    }
  }

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true } : alert
    ))
    toast.success('Alert marked as resolved')
  }

  const snoozeAlert = (alertId: string, hours: number) => {
    // In a real implementation, this would hide the alert for the specified time
    toast.success(`Alert snoozed for ${hours} hours`)
  }

  const createNewRule = () => {
    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: 'New Alert Rule',
      type: 'portal_activity',
      isActive: true,
      severity: 'medium',
      conditions: [{
        metric: 'weekly_logins',
        operator: 'less_than',
        value: 5,
        timeframe: 7
      }],
      actions: {
        sendEmail: true,
        createTask: false
      },
      createdAt: new Date()
    }
    setEditingRule(newRule)
    setShowRuleEditor(true)
  }

  const saveRule = () => {
    if (!editingRule) return
    
    setAlertRules(prev => {
      const existing = prev.find(r => r.id === editingRule.id)
      if (existing) {
        return prev.map(r => r.id === editingRule.id ? editingRule : r)
      } else {
        return [...prev, editingRule]
      }
    })
    
    setShowRuleEditor(false)
    setEditingRule(null)
    toast.success('Alert rule saved successfully')
  }

  const deleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== ruleId))
    toast.success('Alert rule deleted')
  }

  const unreadCount = alerts.filter(a => !a.isRead && !a.isResolved).length
  const highPriorityCount = alerts.filter(a => !a.isResolved && (a.severity === 'high' || a.severity === 'critical')).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Engagement Alerts</h2>
          <p className="text-muted-foreground">
            Automated monitoring of customer portal activity and document interaction patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell size={12} />
            {unreadCount} Unread
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle size={12} />
            {highPriorityCount} High Priority
          </Badge>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell size={16} />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Engagement Metrics
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings size={16} />
            Alert Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} />
                    Active Engagement Alerts
                  </CardTitle>
                  <CardDescription>
                    Real-time alerts based on customer portal activity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.filter(a => !a.isResolved).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        !alert.isRead ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'
                      } ${selectedAlert?.id === alert.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => {
                        setSelectedAlert(alert)
                        if (!alert.isRead) markAlertAsRead(alert.id)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            {getAlertTypeIcon(alert.alertType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {!alert.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.customerName} • {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(alert.triggerDate).toLocaleDateString()}
                              </span>
                              {alert.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {alert.assignedTo}
                                </span>
                              )}
                              {alert.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Timer size={12} />
                                  Due {new Date(alert.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${
                            alert.metrics.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {alert.metrics.change > 0 ? '+' : ''}{alert.metrics.change}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {selectedAlert && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} />
                      Alert Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Customer</span>
                        <span className="text-sm">{selectedAlert.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Severity</span>
                        <Badge variant={getSeverityColor(selectedAlert.severity)}>
                          {selectedAlert.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Value</span>
                        <span className="text-sm">{selectedAlert.metrics.current}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Previous Value</span>
                        <span className="text-sm">{selectedAlert.metrics.previous}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Threshold</span>
                        <span className="text-sm">{selectedAlert.metrics.threshold}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">AI Recommendations</h4>
                      <ul className="space-y-1">
                        {selectedAlert.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Brain size={12} className="mt-0.5 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => resolveAlert(selectedAlert.id)}
                        className="w-full"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Mark as Resolved
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => snoozeAlert(selectedAlert.id, 24)}
                        >
                          <Timer size={16} className="mr-2" />
                          Snooze 24h
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => snoozeAlert(selectedAlert.id, 72)}
                        >
                          <Timer size={16} className="mr-2" />
                          Snooze 3d
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap size={20} />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail size={16} className="mr-2" />
                    Send Engagement Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar size={16} className="mr-2" />
                    Schedule Check-in Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText size={16} className="mr-2" />
                    Create Follow-up Task
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {engagementMetrics.map((metric) => (
              <Card key={metric.customerId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users size={20} />
                      {metric.customerName}
                    </span>
                    <Badge 
                      variant={metric.engagementScore > 70 ? 'default' : metric.engagementScore > 40 ? 'secondary' : 'destructive'}
                    >
                      {metric.engagementScore}% Engaged
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Portal Logins</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.portalLogins.thisWeek}</span>
                        <span className="text-xs text-muted-foreground">this week</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Document Views</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.documentInteractions.views}</span>
                        <span className="text-xs text-muted-foreground">total</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Time Spent</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.documentInteractions.timeSpent}m</span>
                        <span className="text-xs text-muted-foreground">reading</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Churn Risk</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          metric.churnRisk > 70 ? 'text-red-600' : 
                          metric.churnRisk > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {metric.churnRisk}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Feature Usage</span>
                    <div className="space-y-1">
                      {Object.entries(metric.featureUsage).map(([feature, usage]) => (
                        <div key={feature} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{feature}</span>
                          <span className="font-medium">{usage.uses} uses</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last activity: {new Date(metric.lastActivity).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Alert Rules</h3>
              <p className="text-sm text-muted-foreground">
                Configure automated alerts based on customer engagement patterns
              </p>
            </div>
            <Button onClick={createNewRule}>
              <Bell size={16} className="mr-2" />
              Create New Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings size={20} />
                      {rule.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.isActive}
                        onCheckedChange={(checked) => {
                          setAlertRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, isActive: checked } : r
                          ))
                        }}
                      />
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Conditions</span>
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {condition.metric} {condition.operator.replace('_', ' ')} {condition.value} 
                        (over {condition.timeframe} days)
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Actions</span>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {rule.actions.sendEmail && <div>• Send email notification</div>}
                      {rule.actions.createTask && <div>• Create follow-up task</div>}
                      {rule.actions.assignTo && <div>• Assign to: {rule.actions.assignTo}</div>}
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground">
                      Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingRule(rule)
                        setShowRuleEditor(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showRuleEditor && editingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {alertRules.find(r => r.id === editingRule.id) ? 'Edit Alert Rule' : 'Create New Alert Rule'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-type">Type</Label>
                  <Select 
                    value={editingRule.type}
                    onValueChange={(value: any) => setEditingRule(prev => prev ? { ...prev, type: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portal_activity">Portal Activity</SelectItem>
                      <SelectItem value="document_interaction">Document Interaction</SelectItem>
                      <SelectItem value="login_frequency">Login Frequency</SelectItem>
                      <SelectItem value="feature_usage">Feature Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-severity">Severity</Label>
                  <Select 
                    value={editingRule.severity}
                    onValueChange={(value: any) => setEditingRule(prev => prev ? { ...prev, severity: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingRule.actions.sendEmail}
                      onCheckedChange={(checked) => 
                        setEditingRule(prev => prev ? {
                          ...prev,
                          actions: { ...prev.actions, sendEmail: checked }
                        } : null)
                      }
                    />
                    <Label>Send email notification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingRule.actions.createTask}
                      onCheckedChange={(checked) => 
                        setEditingRule(prev => prev ? {
                          ...prev,
                          actions: { ...prev.actions, createTask: checked }
                        } : null)
                      }
                    />
                    <Label>Create follow-up task</Label>
                  </div>
                </div>
              </div>

              {editingRule.actions.customMessage !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Custom Message</Label>
                  <Textarea
                    id="custom-message"
                    value={editingRule.actions.customMessage}
                    onChange={(e) => setEditingRule(prev => prev ? {
                      ...prev,
                      actions: { ...prev.actions, customMessage: e.target.value }
                    } : null)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowRuleEditor(false)
                    setEditingRule(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveRule}>
                  Save Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}