import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedClickableDataTable, ClickableTableColumn, ClickableTableRow } from '@/components/shared/EnhancedClickableDataTable'
import { ClickableDataElement, ClickableDataGroup } from '@/components/shared/ClickableDataElements'
import { LeadAgingDashboard } from '@/components/lead-management/LeadAgingDashboard'
import { LeadTimelineManager } from '@/components/lead-management/LeadTimelineManager'
import { AutomatedFollowUpReminders } from '@/components/lead-management/AutomatedFollowUpReminders'
import { mockLeads } from '@/data/crmMockData'
import { Lead } from '@/types/crm'
import { 
  Plus, 
  UserPlus, 
  TrendUp, 
  Star, 
  Target, 
  Brain, 
  Clock,
  Phone,
  EnvelopeSimple as Mail,
  Calendar,
  MapPin,
  Buildings,
  ChartLine,
  Warning,
  CheckCircle,
  Activity,
  Bell
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EnhancedLeadManagementProps {
  companyId: string
  userId: string
  userRole: string
  onLeadSelect?: (leadId: string) => void
}

export function EnhancedLeadManagement({ companyId, userId, userRole, onLeadSelect }: EnhancedLeadManagementProps) {
  const [leads, setLeads] = useKV<Lead[]>(`leads-${companyId}`, mockLeads)
  const [activeTab, setActiveTab] = useState('overview')
  
  const safeLeads = leads || mockLeads

  // Define table columns with clickable configuration
  const columns: ClickableTableColumn[] = [
    {
      key: 'name',
      label: 'Lead Name',
      clickable: true,
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {row.firstName?.[0]}{row.lastName?.[0]}
            </span>
          </div>
          <div>
            <ClickableDataElement
              type="name"
              value={`${row.firstName} ${row.lastName}`}
              entityId={row.id}
              entityType="lead"
              companyId={companyId}
              userId={userId}
              className="font-medium hover:text-primary"
            />
            {row.jobTitle && (
              <div className="text-xs text-muted-foreground">{row.jobTitle}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      clickable: true,
      sortable: true,
      render: (value, row) => value ? (
        <div className="flex items-center gap-2">
          <Buildings size={14} className="text-muted-foreground" />
          <ClickableDataElement
            type="company"
            value={value}
            entityId={row.id}
            entityType="lead"
            companyId={companyId}
            userId={userId}
            className="text-sm"
          />
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">No company</span>
      )
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (value, row) => (
        <div className="space-y-1">
          {row.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} className="text-muted-foreground" />
              <ClickableDataElement
                type="email"
                value={row.email}
                entityId={row.id}
                entityType="lead"
                companyId={companyId}
                userId={userId}
                className="text-xs"
              />
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} className="text-muted-foreground" />
              <ClickableDataElement
                type="phone"
                value={row.phone}
                entityId={row.id}
                entityType="lead"
                companyId={companyId}
                userId={userId}
                className="text-xs"
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="flex items-center gap-1">
          {getPriorityIcon(value)}
          <span className="text-sm capitalize">{value}</span>
        </div>
      )
    },
    {
      key: 'leadScore',
      label: 'AI Score',
      type: 'number',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-primary" />
          <span className={`font-semibold ${getScoreColor(value)}`}>
            {value}
          </span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.floor(value / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'estimatedValue',
      label: 'Est. Value',
      type: 'currency',
      clickable: true,
      sortable: true,
      render: (value, row) => value ? (
        <ClickableDataElement
          type="currency"
          value={value.toString()}
          displayValue={`$${value.toLocaleString()}`}
          entityId={row.id}
          entityType="lead"
          companyId={companyId}
          userId={userId}
          className="font-medium text-green-600"
        />
      ) : (
        <span className="text-muted-foreground text-sm">Not set</span>
      )
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'nextFollowUp',
      label: 'Next Follow-up',
      type: 'date',
      clickable: true,
      sortable: true,
      render: (value, row) => {
        if (!value) return <span className="text-muted-foreground text-sm">Not scheduled</span>
        
        const followUpDate = new Date(value)
        const isOverdue = followUpDate < new Date()
        const isToday = followUpDate.toDateString() === new Date().toDateString()
        
        return (
          <div className="flex items-center gap-1">
            <Calendar size={12} className={isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : 'text-muted-foreground'} />
            <ClickableDataElement
              type="date"
              value={value}
              displayValue={followUpDate.toLocaleDateString()}
              entityId={row.id}
              entityType="lead"
              companyId={companyId}
              userId={userId}
              className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : ''}`}
            />
            {isOverdue && <Warning size={12} className="text-red-500" />}
            {isToday && <Clock size={12} className="text-orange-500" />}
          </div>
        )
      }
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value, row) => value && value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tag: string, index: number) => (
            <ClickableDataElement
              key={index}
              type="tag"
              value={tag}
              entityId={row.id}
              entityType="lead"
              companyId={companyId}
              userId={userId}
            />
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ) : null
    }
  ]

  // Convert leads to table rows
  const tableData: ClickableTableRow[] = safeLeads.map(lead => ({
    id: lead.id,
    entityType: 'lead' as const,
    name: `${lead.firstName} ${lead.lastName}`,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    jobTitle: lead.jobTitle,
    status: lead.status,
    priority: lead.priority,
    leadScore: lead.leadScore,
    estimatedValue: lead.estimatedValue,
    source: lead.source,
    nextFollowUp: lead.nextFollowUp,
    tags: lead.tags,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  }))

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'qualified':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unqualified':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'converted':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Star className="text-red-500 fill-current" size={14} />
      case 'medium':
        return <Star className="text-yellow-500 fill-current" size={14} />
      case 'low':
        return <Star className="text-green-500" size={14} />
      default:
        return <Star className="text-gray-400" size={14} />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLeadStats = () => {
    const totalLeads = safeLeads.length
    const newLeads = safeLeads.filter(l => l.status === 'new').length
    const qualifiedLeads = safeLeads.filter(l => l.status === 'qualified').length
    const convertedLeads = safeLeads.filter(l => l.status === 'converted').length
    const avgScore = totalLeads > 0 
      ? Math.round(safeLeads.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads)
      : 0
    const totalValue = safeLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

    return [
      {
        label: 'Total Leads',
        value: totalLeads.toString(),
        icon: <UserPlus size={20} />,
        color: 'text-blue-600'
      },
      {
        label: 'New Leads',
        value: newLeads.toString(),
        icon: <Star size={20} />,
        color: 'text-orange-600'
      },
      {
        label: 'Qualified',
        value: qualifiedLeads.toString(),
        icon: <CheckCircle size={20} />,
        color: 'text-green-600'
      },
      {
        label: 'Converted',
        value: convertedLeads.toString(),
        icon: <Target size={20} />,
        color: 'text-purple-600'
      },
      {
        label: 'Avg Score',
        value: avgScore.toString(),
        icon: <Brain size={20} />,
        color: getScoreColor(avgScore)
      },
      {
        label: 'Pipeline Value',
        value: `$${(totalValue / 1000).toFixed(0)}K`,
        icon: <ChartLine size={20} />,
        color: 'text-green-600'
      }
    ]
  }

  const handleAction = (action: string, data: any) => {
    switch (action) {
      case 'call':
        toast.success(`Initiating call to ${data.phone}`)
        // Integrate with phone system
        break
      case 'email':
        toast.success(`Opening email composer for ${data.email}`)
        // Integrate with email system
        break
      case 'meeting':
        toast.success(`Scheduling meeting with ${data.name}`)
        // Integrate with calendar
        break
      case 'view_company':
        toast.info(`Opening company profile: ${data.company}`)
        // Navigate to company view
        break
      case 'filter_by_tag':
        toast.info(`Filtering leads by tag: ${data.tag}`)
        // Apply tag filter
        break
      case 'view_calendar':
        toast.info(`Opening calendar for: ${data.date}`)
        // Open calendar view
        break
      case 'financial':
        toast.info(`Opening financial details for $${data.amount}`)
        // Open financial breakdown
        break
      default:
        toast.info(`Action: ${action}`)
    }
  }

  const handleBulkAction = (action: string, selectedRows: ClickableTableRow[]) => {
    switch (action) {
      case 'delete':
        toast.success(`Deleted ${selectedRows.length} leads`)
        // Implement bulk delete
        break
      case 'export':
        toast.success(`Exported ${selectedRows.length} leads`)
        // Implement bulk export
        break
      case 'qualify':
        toast.success(`Qualified ${selectedRows.length} leads`)
        // Implement bulk qualification
        break
      case 'assign':
        toast.success(`Assigned ${selectedRows.length} leads`)
        // Implement bulk assignment
        break
      default:
        toast.info(`Bulk action: ${action} on ${selectedRows.length} leads`)
    }
  }

  const handleCreateLead = () => {
    toast.info('Opening new lead form')
    // Open lead creation form
  }

  return (
    <div className="space-y-6">
      {/* Header with integrated tab navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus size={20} />
                Lead Management & Aging Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive lead management with aging analysis, follow-up tracking, and AI-powered insights
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <UserPlus size={16} />
              Lead Overview
            </TabsTrigger>
            <TabsTrigger value="aging" className="flex items-center gap-2">
              <Clock size={16} />
              Aging & Follow-ups
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Activity size={16} />
              Timeline Management
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell size={16} />
              Automated Reminders
            </TabsTrigger>
          </TabsList>
          <Badge variant="outline">
            {safeLeads.length} Total Leads
          </Badge>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {getLeadStats().map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} className="text-primary" />
                  AI Lead Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 text-sm">High-Quality Leads</h4>
                  <p className="text-green-700 text-sm mt-1">
                    {safeLeads.filter(l => l.leadScore >= 80).length} leads with score ≥80 ready for immediate follow-up
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 text-sm">Overdue Follow-ups</h4>
                  <p className="text-orange-700 text-sm mt-1">
                    {safeLeads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) < new Date()).length} leads have overdue follow-up activities
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Today's Priority</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    {safeLeads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp).toDateString() === new Date().toDateString()).length} leads scheduled for today
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('aging')}
                >
                  <Clock size={16} className="mr-2" />
                  View Aging Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions & Tools</CardTitle>
                <CardDescription>
                  Common lead management actions and automation tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button onClick={handleCreateLead} className="h-16 flex-col gap-2">
                    <Plus size={20} />
                    <span className="text-sm">Add Lead</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Opening import wizard')}>
                    <UserPlus size={20} />
                    <span className="text-sm">Import Leads</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Starting bulk qualification')}>
                    <CheckCircle size={20} />
                    <span className="text-sm">Bulk Qualify</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Opening assignment tool')}>
                    <Target size={20} />
                    <span className="text-sm">Auto Assign</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Lead Table */}
          <EnhancedClickableDataTable
            title="Lead Management"
            description="Interactive lead management with AI-powered insights and clickable data elements"
            columns={columns}
            data={tableData}
            companyId={companyId}
            userId={userId}
            pageSize={20}
            showSearch={true}
            showFilters={true}
            showBulkActions={true}
            onRowClick={(row) => onLeadSelect?.(row.id)}
            onAction={handleAction}
            onBulkAction={handleBulkAction}
            className="w-full"
          />

          {/* Recent High-Priority Leads */}
          <Card>
            <CardHeader>
              <CardTitle>High-Priority Leads Requiring Attention</CardTitle>
              <CardDescription>
                Leads with high scores or overdue follow-ups that need immediate action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeLeads
                  .filter(lead => 
                    lead.leadScore >= 75 || 
                    (lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date()) ||
                    lead.priority === 'high'
                  )
                  .sort((a, b) => b.leadScore - a.leadScore)
                  .slice(0, 6)
                  .map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onLeadSelect?.(lead.id)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ClickableDataElement
                            type="name"
                            value={`${lead.firstName} ${lead.lastName}`}
                            entityId={lead.id}
                            entityType="lead"
                            companyId={companyId}
                            userId={userId}
                            className="font-medium"
                          />
                          {getPriorityIcon(lead.priority)}
                          <Badge className={getStatusColor(lead.status)} variant="outline">
                            {lead.status}
                          </Badge>
                          <span className={`font-semibold ${getScoreColor(lead.leadScore)}`}>
                            Score: {lead.leadScore}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {lead.company && (
                            <ClickableDataElement
                              type="company"
                              value={lead.company}
                              entityId={lead.id}
                              entityType="lead"
                              companyId={companyId}
                              userId={userId}
                              className="text-muted-foreground"
                            />
                          )}
                          
                          <ClickableDataElement
                            type="email"
                            value={lead.email}
                            entityId={lead.id}
                            entityType="lead"
                            companyId={companyId}
                            userId={userId}
                            className="text-muted-foreground"
                          />
                          
                          {lead.estimatedValue && (
                            <ClickableDataElement
                              type="currency"
                              value={lead.estimatedValue.toString()}
                              displayValue={`$${lead.estimatedValue.toLocaleString()}`}
                              entityId={lead.id}
                              entityType="lead"
                              companyId={companyId}
                              userId={userId}
                              className="text-green-600 font-medium"
                            />
                          )}
                          
                          {lead.nextFollowUp && (
                            <ClickableDataElement
                              type="date"
                              value={lead.nextFollowUp}
                              displayValue={new Date(lead.nextFollowUp).toLocaleDateString()}
                              entityId={lead.id}
                              entityType="lead"
                              companyId={companyId}
                              userId={userId}
                              className={new Date(lead.nextFollowUp) < new Date() ? 'text-red-600 font-medium' : 'text-muted-foreground'}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleAction('call', { phone: lead.phone, name: `${lead.firstName} ${lead.lastName}` })}>
                          <Phone size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction('email', { email: lead.email, name: `${lead.firstName} ${lead.lastName}` })}>
                          <Mail size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction('meeting', { name: `${lead.firstName} ${lead.lastName}`, entityId: lead.id })}>
                          <Calendar size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <LeadAgingDashboard 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            assignedOnly={false}
            onLeadSelect={onLeadSelect}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Lead Timeline Management
              </CardTitle>
              <CardDescription>
                Manage lead activity timelines, schedule follow-ups, and track interaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-medium mb-2">Select a Lead for Timeline Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose a lead from the list below or navigate to a specific lead profile to manage their timeline and schedule follow-up activities.
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {safeLeads.slice(0, 10).map((lead) => (
                          <div 
                            key={lead.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-background cursor-pointer"
                            onClick={() => onLeadSelect?.(lead.id)}
                          >
                            <div>
                              <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                              <p className="text-xs text-muted-foreground">{lead.company} • {lead.email}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Timeline
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Timeline Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">Activity Tracking</h4>
                        <p className="text-muted-foreground text-xs">Complete history of all lead interactions</p>
                      </div>
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">Follow-up Scheduling</h4>
                        <p className="text-muted-foreground text-xs">Set reminders and schedule future activities</p>
                      </div>
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">Quote Attachments</h4>
                        <p className="text-muted-foreground text-xs">Attach and track quotes throughout the lead lifecycle</p>
                      </div>
                      <div className="p-2 border rounded">
                        <h4 className="font-medium">AI Recommendations</h4>
                        <p className="text-muted-foreground text-xs">Smart suggestions for next best actions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <AutomatedFollowUpReminders 
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}