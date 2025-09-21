import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Monitor,
  DeviceMobile,
  DeviceTablet,
  User,
  Eye,
  Download,
  FileText,
  CreditCard,
  Phone,
  EnvelopeSimple as Mail,
  ChatCircle,
  ClockClockwise as Clock,
  MapPin,
  ChartLine,
  TrendUp,
  Brain,
  Warning,
  CheckCircle,
  XCircle,
  Calendar,
  Timer,
  Globe,
  ShieldCheck,
  Activity,
  Heart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CustomerPortalActivity {
  id: string
  customerId: string
  contactId?: string
  activityType: 'login' | 'document_view' | 'document_download' | 'support_ticket' | 'payment' | 'profile_update' | 'communication' | 'logout'
  activityDescription: string
  sessionId: string
  ipAddress: string
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  pageVisited: string
  timeSpentSeconds: number
  actionsTaken: string[]
  aiEngagementScore: number
  aiIntentAnalysis: string
  aiSatisfactionIndicators: string[]
  activityTimestamp: string
  createdAt: string
}

interface CustomerSession {
  id: string
  customerId: string
  contactId?: string
  sessionStart: string
  sessionEnd?: string
  totalDuration: number
  pagesVisited: number
  documentsViewed: number
  documentsDownloaded: number
  actionsCompleted: number
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    screenResolution: string
  }
  location: {
    ipAddress: string
    country: string
    city: string
    timezone: string
  }
  engagementMetrics: {
    totalTimeSpent: number
    averagePageTime: number
    bounceRate: number
    conversionEvents: number
  }
  aiAnalysis: {
    intentScore: number
    satisfactionScore: number
    engagementLevel: 'low' | 'medium' | 'high'
    predictedNextAction: string
    riskIndicators: string[]
  }
}

interface CustomerPortalActivityTrackerProps {
  customerId: string
  companyId: string
  userId: string
}

export function CustomerPortalActivityTracker({ customerId, companyId, userId }: CustomerPortalActivityTrackerProps) {
  const [activities, setActivities] = useKV(`customer-portal-activities-${customerId}`, [] as CustomerPortalActivity[])
  const [sessions, setSessions] = useKV(`customer-portal-sessions-${customerId}`, [] as CustomerSession[])
  const [selectedActivity, setSelectedActivity] = useState<CustomerPortalActivity | null>(null)
  const [selectedSession, setSelectedSession] = useState<CustomerSession | null>(null)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [activityFilter, setActivityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [realTimeTracking, setRealTimeTracking] = useState(true)

  // Mock data generator for demo purposes
  useEffect(() => {
    if (activities.length === 0) {
      generateMockData()
    }
  }, [])

  const generateMockData = () => {
    const mockActivities: CustomerPortalActivity[] = Array.from({ length: 50 }, (_, i) => ({
      id: `activity-${i + 1}`,
      customerId,
      contactId: i % 3 === 0 ? `contact-${Math.floor(i / 3) + 1}` : undefined,
      activityType: ['login', 'document_view', 'document_download', 'support_ticket', 'payment', 'profile_update'][Math.floor(Math.random() * 6)] as any,
      activityDescription: getActivityDescription(i),
      sessionId: `session-${Math.floor(i / 5) + 1}`,
      ipAddress: `192.168.1.${100 + (i % 50)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
      browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
      pageVisited: `/portal/${['dashboard', 'documents', 'support', 'billing', 'profile'][Math.floor(Math.random() * 5)]}`,
      timeSpentSeconds: Math.floor(Math.random() * 300) + 30,
      actionsTaken: getRandomActions(),
      aiEngagementScore: Math.floor(Math.random() * 100),
      aiIntentAnalysis: ['purchasing', 'research', 'support', 'administration'][Math.floor(Math.random() * 4)],
      aiSatisfactionIndicators: getRandomSatisfactionIndicators(),
      activityTimestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))

    const mockSessions: CustomerSession[] = Array.from({ length: 15 }, (_, i) => ({
      id: `session-${i + 1}`,
      customerId,
      contactId: i % 3 === 0 ? `contact-${Math.floor(i / 3) + 1}` : undefined,
      sessionStart: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      sessionEnd: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      totalDuration: Math.floor(Math.random() * 3600) + 300,
      pagesVisited: Math.floor(Math.random() * 20) + 1,
      documentsViewed: Math.floor(Math.random() * 10),
      documentsDownloaded: Math.floor(Math.random() * 5),
      actionsCompleted: Math.floor(Math.random() * 15) + 1,
      deviceInfo: {
        type: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
        os: ['Windows 10', 'macOS', 'iOS', 'Android'][Math.floor(Math.random() * 4)],
        screenResolution: ['1920x1080', '1366x768', '414x896', '1440x900'][Math.floor(Math.random() * 4)]
      },
      location: {
        ipAddress: `192.168.1.${100 + (i % 50)}`,
        country: ['United States', 'Canada', 'United Kingdom', 'Germany'][Math.floor(Math.random() * 4)],
        city: ['New York', 'Toronto', 'London', 'Berlin'][Math.floor(Math.random() * 4)],
        timezone: ['America/New_York', 'America/Toronto', 'Europe/London', 'Europe/Berlin'][Math.floor(Math.random() * 4)]
      },
      engagementMetrics: {
        totalTimeSpent: Math.floor(Math.random() * 3600) + 300,
        averagePageTime: Math.floor(Math.random() * 120) + 30,
        bounceRate: Math.random(),
        conversionEvents: Math.floor(Math.random() * 5)
      },
      aiAnalysis: {
        intentScore: Math.floor(Math.random() * 100),
        satisfactionScore: Math.floor(Math.random() * 100),
        engagementLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        predictedNextAction: ['view_documents', 'contact_support', 'make_payment', 'update_profile'][Math.floor(Math.random() * 4)],
        riskIndicators: getRandomRiskIndicators()
      }
    }))

    setActivities(mockActivities)
    setSessions(mockSessions)
  }

  const getActivityDescription = (index: number): string => {
    const descriptions = [
      'Logged into customer portal',
      'Viewed contract document',
      'Downloaded invoice PDF',
      'Created support ticket for billing inquiry',
      'Updated payment method',
      'Modified profile information',
      'Viewed product documentation',
      'Downloaded user manual',
      'Submitted payment for invoice #1234',
      'Updated contact preferences'
    ]
    return descriptions[index % descriptions.length]
  }

  const getRandomActions = (): string[] => {
    const allActions = ['click', 'scroll', 'download', 'view', 'submit', 'update', 'navigate', 'search']
    return allActions.slice(0, Math.floor(Math.random() * 4) + 1)
  }

  const getRandomSatisfactionIndicators = (): string[] => {
    const indicators = ['quick_completion', 'repeat_visit', 'extended_session', 'positive_feedback', 'feature_usage']
    return indicators.slice(0, Math.floor(Math.random() * 3) + 1)
  }

  const getRandomRiskIndicators = (): string[] => {
    const risks = ['short_sessions', 'error_encounters', 'support_tickets', 'payment_delays']
    return Math.random() > 0.7 ? risks.slice(0, Math.floor(Math.random() * 2) + 1) : []
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User size={16} />
      case 'document_view': return <Eye size={16} />
      case 'document_download': return <Download size={16} />
      case 'support_ticket': return <ChatCircle size={16} />
      case 'payment': return <CreditCard size={16} />
      case 'profile_update': return <User size={16} />
      default: return <Activity size={16} />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor size={16} />
      case 'mobile': return <DeviceMobile size={16} />
      case 'tablet': return <DeviceTablet size={16} />
      default: return <Monitor size={16} />
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const calculateEngagementTrend = () => {
    const recentActivities = activities.slice(0, 10)
    const averageEngagement = recentActivities.reduce((sum, activity) => sum + activity.aiEngagementScore, 0) / recentActivities.length
    return {
      score: Math.round(averageEngagement),
      trend: averageEngagement > 70 ? 'increasing' : averageEngagement > 40 ? 'stable' : 'decreasing'
    }
  }

  const getActivityTypeStats = () => {
    const stats = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(stats).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / activities.length) * 100)
    }))
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = activityFilter === 'all' || activity.activityType === activityFilter
    const matchesSearch = searchTerm === '' || 
      activity.activityDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.pageVisited.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const activeSessions = sessions.filter(session => !session.sessionEnd)
  const engagementTrend = calculateEngagementTrend()
  const activityStats = getActivityTypeStats()

  return (
    <div className="space-y-6">
      {/* Real-time Tracking Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Customer Portal Activity Tracker
              </CardTitle>
              <CardDescription>
                Monitor customer portal usage, engagement patterns, and collaboration activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={realTimeTracking} 
                  onCheckedChange={setRealTimeTracking}
                />
                <Label>Real-time Tracking</Label>
              </div>
              {realTimeTracking && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{activeSessions.length}</p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                  <p className="text-2xl font-bold">{engagementTrend.score}%</p>
                </div>
                <Heart className={`h-8 w-8 ${engagementTrend.trend === 'increasing' ? 'text-green-500' : engagementTrend.trend === 'stable' ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                  <p className="text-2xl font-bold">
                    {formatDuration(Math.floor(sessions.reduce((sum, s) => sum + s.totalDuration, 0) / sessions.length))}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activities">Activity Stream</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Activity Stream</CardTitle>
                  <CardDescription>Real-time portal activity and engagement tracking</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="login">Logins</SelectItem>
                      <SelectItem value="document_view">Document Views</SelectItem>
                      <SelectItem value="document_download">Downloads</SelectItem>
                      <SelectItem value="support_ticket">Support</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                      <SelectItem value="profile_update">Profile Updates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredActivities.slice(0, 20).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedActivity(activity)
                      setShowActivityDialog(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.activityType)}
                        {getDeviceIcon(activity.deviceType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.activityDescription}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <ClickableDataElement
                            type="page"
                            value={activity.pageVisited}
                            onClick={() => toast.info(`Navigate to: ${activity.pageVisited}`)}
                          />
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {activity.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(activity.timeSpentSeconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.aiEngagementScore > 70 ? 'default' : activity.aiEngagementScore > 40 ? 'secondary' : 'destructive'}>
                        {activity.aiEngagementScore}% engagement
                      </Badge>
                      <Badge variant="outline">
                        {activity.aiIntentAnalysis}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.activityTimestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Portal Sessions</CardTitle>
              <CardDescription>Detailed session tracking and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedSession(session)
                      setShowSessionDialog(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.deviceInfo.type)}
                        <div>
                          <p className="font-medium">Session {session.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.deviceInfo.browser} on {session.deviceInfo.os}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={session.sessionEnd ? 'secondary' : 'default'}>
                          {session.sessionEnd ? 'Completed' : 'Active'}
                        </Badge>
                        <Badge variant="outline">
                          {session.aiAnalysis.engagementLevel} engagement
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{formatDuration(session.totalDuration)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pages Visited</p>
                        <p className="font-medium">{session.pagesVisited}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Documents</p>
                        <p className="font-medium">{session.documentsViewed}/{session.documentsDownloaded}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{session.location.city}, {session.location.country}</p>
                      </div>
                    </div>
                    {session.aiAnalysis.riskIndicators.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Warning size={16} className="text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          Risk indicators: {session.aiAnalysis.riskIndicators.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Type Distribution</CardTitle>
                <CardDescription>Breakdown of customer portal activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityStats.map((stat) => (
                    <div key={stat.type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{stat.type.replace('_', ' ')}</span>
                        <span>{stat.count} ({stat.percentage}%)</span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>AI-powered engagement analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Engagement</span>
                      <span>{engagementTrend.score}%</span>
                    </div>
                    <Progress value={engagementTrend.score} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Trend: {engagementTrend.trend}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Session Time</p>
                      <p className="font-medium text-lg">
                        {formatDuration(Math.floor(sessions.reduce((sum, s) => sum + s.totalDuration, 0) / sessions.length))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Document Engagement</p>
                      <p className="font-medium text-lg">
                        {Math.round((sessions.reduce((sum, s) => sum + s.documentsViewed, 0) / sessions.length) * 10) / 10}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Support Tickets</p>
                      <p className="font-medium text-lg">
                        {activities.filter(a => a.activityType === 'support_ticket').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Activities</p>
                      <p className="font-medium text-lg">
                        {activities.filter(a => a.activityType === 'payment').length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Collaboration</CardTitle>
                <CardDescription>Customer document viewing and sharing activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities
                    .filter(a => a.activityType === 'document_view' || a.activityType === 'document_download')
                    .slice(0, 10)
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {activity.activityType === 'document_view' ? <Eye size={16} /> : <Download size={16} />}
                          <span className="text-sm">{activity.activityDescription}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.activityTimestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Tracking</CardTitle>
                <CardDescription>Customer support and communication activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities
                    .filter(a => a.activityType === 'support_ticket')
                    .slice(0, 10)
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <ChatCircle size={16} />
                          <span className="text-sm">{activity.activityDescription}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.aiIntentAnalysis}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity Detail Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityIcon(selectedActivity.activityType)}
              Activity Details
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Activity Type</Label>
                  <p className="capitalize">{selectedActivity.activityType.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p>{new Date(selectedActivity.activityTimestamp).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Device</Label>
                  <p className="flex items-center gap-2">
                    {getDeviceIcon(selectedActivity.deviceType)}
                    {selectedActivity.deviceType}
                  </p>
                </div>
                <div>
                  <Label>Browser</Label>
                  <p>{selectedActivity.browser}</p>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <ClickableDataElement
                    type="ip"
                    value={selectedActivity.ipAddress}
                    onClick={() => toast.info(`Location lookup for ${selectedActivity.ipAddress}`)}
                  />
                </div>
                <div>
                  <Label>Time Spent</Label>
                  <p>{formatDuration(selectedActivity.timeSpentSeconds)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Description</Label>
                <p>{selectedActivity.activityDescription}</p>
              </div>

              <div>
                <Label>Page Visited</Label>
                <ClickableDataElement
                  type="page"
                  value={selectedActivity.pageVisited}
                  onClick={() => toast.info(`Navigate to: ${selectedActivity.pageVisited}`)}
                />
              </div>

              <div>
                <Label>Actions Taken</Label>
                <div className="flex gap-2 flex-wrap">
                  {selectedActivity.actionsTaken.map((action, index) => (
                    <Badge key={index} variant="outline">{action}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Engagement Score</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedActivity.aiEngagementScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedActivity.aiEngagementScore}%</span>
                  </div>
                </div>
                <div>
                  <Label>Intent Analysis</Label>
                  <Badge variant="outline">{selectedActivity.aiIntentAnalysis}</Badge>
                </div>
              </div>

              <div>
                <Label>Satisfaction Indicators</Label>
                <div className="flex gap-2 flex-wrap">
                  {selectedActivity.aiSatisfactionIndicators.map((indicator, index) => (
                    <Badge key={index} variant="secondary">{indicator}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>User Agent</Label>
                <p className="text-xs text-muted-foreground break-all">{selectedActivity.userAgent}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User size={20} />
              Session Details
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Session ID</Label>
                  <p className="font-mono text-sm">{selectedSession.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedSession.sessionEnd ? 'secondary' : 'default'}>
                    {selectedSession.sessionEnd ? 'Completed' : 'Active'}
                  </Badge>
                </div>
                <div>
                  <Label>Total Duration</Label>
                  <p>{formatDuration(selectedSession.totalDuration)}</p>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <p>{new Date(selectedSession.sessionStart).toLocaleString()}</p>
                </div>
                <div>
                  <Label>End Time</Label>
                  <p>{selectedSession.sessionEnd ? new Date(selectedSession.sessionEnd).toLocaleString() : 'Active'}</p>
                </div>
                <div>
                  <Label>Pages Visited</Label>
                  <p>{selectedSession.pagesVisited}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Device Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Device Type</p>
                    <p className="flex items-center gap-2">
                      {getDeviceIcon(selectedSession.deviceInfo.type)}
                      {selectedSession.deviceInfo.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Browser</p>
                    <p>{selectedSession.deviceInfo.browser}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating System</p>
                    <p>{selectedSession.deviceInfo.os}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Screen Resolution</p>
                    <p>{selectedSession.deviceInfo.screenResolution}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Location Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                    <ClickableDataElement
                      type="ip"
                      value={selectedSession.location.ipAddress}
                      onClick={() => toast.info(`Location lookup for ${selectedSession.location.ipAddress}`)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{selectedSession.location.city}, {selectedSession.location.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timezone</p>
                    <p>{selectedSession.location.timezone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Engagement Metrics</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="font-medium">{formatDuration(selectedSession.engagementMetrics.totalTimeSpent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Page Time</p>
                    <p className="font-medium">{formatDuration(selectedSession.engagementMetrics.averagePageTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bounce Rate</p>
                    <p className="font-medium">{Math.round(selectedSession.engagementMetrics.bounceRate * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="font-medium">{selectedSession.engagementMetrics.conversionEvents}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>AI Analysis</Label>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Intent Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedSession.aiAnalysis.intentScore} className="flex-1" />
                        <span className="text-sm font-medium">{selectedSession.aiAnalysis.intentScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedSession.aiAnalysis.satisfactionScore} className="flex-1" />
                        <span className="text-sm font-medium">{selectedSession.aiAnalysis.satisfactionScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Level</p>
                    <Badge variant={
                      selectedSession.aiAnalysis.engagementLevel === 'high' ? 'default' :
                      selectedSession.aiAnalysis.engagementLevel === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {selectedSession.aiAnalysis.engagementLevel}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Next Action</p>
                    <Badge variant="outline">{selectedSession.aiAnalysis.predictedNextAction.replace('_', ' ')}</Badge>
                  </div>
                  
                  {selectedSession.aiAnalysis.riskIndicators.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Indicators</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedSession.aiAnalysis.riskIndicators.map((risk, index) => (
                          <Badge key={index} variant="destructive">{risk.replace('_', ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Document Activity</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents Viewed</p>
                    <p className="font-medium">{selectedSession.documentsViewed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documents Downloaded</p>
                    <p className="font-medium">{selectedSession.documentsDownloaded}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}