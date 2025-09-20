import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedClickableDataTable, ClickableTableColumn, ClickableTableRow } from '@/components/shared/EnhancedClickableDataTable'
import { ClickableDataElement, ClickableDataGroup } from '@/components/shared/ClickableDataElements'
import { mockContacts } from '@/data/crmMockData'
import { Contact } from '@/types/crm'
import { Plus, Users, Star, TrendUp, Calendar, Phone, EnvelopeSimple as Mail, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EnhancedContactManagementProps {
  companyId: string
  userId: string
  userRole: string
  onContactSelect?: (contactId: string) => void
}

export function EnhancedContactManagement({ companyId, userId, userRole, onContactSelect }: EnhancedContactManagementProps) {
  const [contacts, setContacts] = useKV<Contact[]>(`contacts-${companyId}`, mockContacts)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  const safeContacts = contacts || mockContacts

  // Define table columns with clickable configuration
  const columns: ClickableTableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      clickable: true,
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {row.firstName?.[0]}{row.lastName?.[0]}
            </span>
          </div>
          <div>
            <ClickableDataElement
              type="name"
              value={`${row.firstName} ${row.lastName}`}
              entityId={row.id}
              entityType="contact"
              companyId={companyId}
              userId={userId}
              className="font-medium"
            />
            {row.jobTitle && (
              <div className="text-xs text-muted-foreground">{row.jobTitle}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      clickable: true,
      sortable: true,
      render: (value, row) => (
        <ClickableDataElement
          type="email"
          value={value}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
        />
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      clickable: true,
      render: (value, row) => value ? (
        <ClickableDataElement
          type="phone"
          value={value}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
        />
      ) : (
        <span className="text-muted-foreground text-sm">Not provided</span>
      )
    },
    {
      key: 'company',
      label: 'Company',
      clickable: true,
      sortable: true,
      render: (value, row) => value ? (
        <ClickableDataElement
          type="company"
          value={value}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
        />
      ) : (
        <span className="text-muted-foreground text-sm">No company</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      filterable: true
    },
    {
      key: 'leadScore',
      label: 'Score',
      type: 'number',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${getScoreColor(value)}`}>
            {value}
          </span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(value / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
      )
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
              entityType="contact"
              companyId={companyId}
              userId={userId}
            />
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2} more
            </Badge>
          )}
        </div>
      ) : null
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      type: 'date',
      clickable: true,
      sortable: true,
      render: (value, row) => value ? (
        <ClickableDataElement
          type="date"
          value={value}
          displayValue={new Date(value).toLocaleDateString()}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
          className="text-sm"
        />
      ) : (
        <span className="text-muted-foreground text-sm">No activity</span>
      )
    }
  ]

  // Convert contacts to table rows
  const tableData: ClickableTableRow[] = safeContacts.map(contact => ({
    id: contact.id,
    entityType: 'contact' as const,
    name: `${contact.firstName} ${contact.lastName}`,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    jobTitle: contact.jobTitle,
    status: contact.status,
    leadScore: contact.leadScore,
    tags: contact.tags,
    lastActivity: contact.lastActivity,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  }))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getContactStats = () => {
    const totalContacts = safeContacts.length
    const activeLeads = safeContacts.filter(c => c.status === 'lead').length
    const qualifiedProspects = safeContacts.filter(c => c.status === 'qualified').length
    const customers = safeContacts.filter(c => c.status === 'customer').length
    const avgScore = totalContacts > 0 
      ? Math.round(safeContacts.reduce((sum, c) => sum + c.leadScore, 0) / totalContacts)
      : 0

    return [
      {
        label: 'Total Contacts',
        value: totalContacts.toString(),
        icon: <Users size={20} />,
        color: 'text-blue-600'
      },
      {
        label: 'Active Leads',
        value: activeLeads.toString(),
        icon: <TrendUp size={20} />,
        color: 'text-orange-600'
      },
      {
        label: 'Qualified',
        value: qualifiedProspects.toString(),
        icon: <Star size={20} />,
        color: 'text-green-600'
      },
      {
        label: 'Customers',
        value: customers.toString(),
        icon: <Star size={20} />,
        color: 'text-purple-600'
      },
      {
        label: 'Avg Score',
        value: avgScore.toString(),
        icon: <Star size={20} />,
        color: getScoreColor(avgScore)
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
        toast.info(`Filtering contacts by tag: ${data.tag}`)
        // Apply tag filter
        break
      case 'view_calendar':
        toast.info(`Opening calendar for: ${data.date}`)
        // Open calendar view
        break
      case 'view_map':
        toast.info(`Opening map for: ${data.address}`)
        // Open map view
        break
      default:
        toast.info(`Action: ${action}`)
    }
  }

  const handleBulkAction = (action: string, selectedRows: ClickableTableRow[]) => {
    switch (action) {
      case 'delete':
        toast.success(`Deleted ${selectedRows.length} contacts`)
        // Implement bulk delete
        break
      case 'export':
        toast.success(`Exported ${selectedRows.length} contacts`)
        // Implement bulk export
        break
      case 'assign':
        toast.success(`Assigned ${selectedRows.length} contacts`)
        // Implement bulk assignment
        break
      default:
        toast.info(`Bulk action: ${action} on ${selectedRows.length} contacts`)
    }
  }

  const handleCreateContact = () => {
    toast.info('Opening new contact form')
    // Open contact creation form
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {getContactStats().map((stat, index) => (
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

      {/* Main Contact Table */}
      <EnhancedClickableDataTable
        title="Contact Management"
        description="Manage your customer contacts and leads with interactive data elements"
        columns={columns}
        data={tableData}
        companyId={companyId}
        userId={userId}
        pageSize={15}
        showSearch={true}
        showFilters={true}
        showBulkActions={true}
        onRowClick={(row) => onContactSelect?.(row.id)}
        onAction={handleAction}
        onBulkAction={handleBulkAction}
        className="w-full"
      />

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common contact management actions and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={handleCreateContact} className="h-16 flex-col gap-2">
              <Plus size={20} />
              <span className="text-sm">Add Contact</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Opening import wizard')}>
              <Users size={20} />
              <span className="text-sm">Import Contacts</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Starting export')}>
              <Users size={20} />
              <span className="text-sm">Export Contacts</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => toast.info('Opening merge tool')}>
              <Users size={20} />
              <span className="text-sm">Merge Duplicates</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest contact interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeContacts
                .filter(c => c.lastActivity)
                .sort((a, b) => new Date(b.lastActivity!).getTime() - new Date(a.lastActivity!).getTime())
                .slice(0, 5)
                .map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ClickableDataElement
                          type="name"
                          value={`${contact.firstName} ${contact.lastName}`}
                          entityId={contact.id}
                          entityType="contact"
                          companyId={companyId}
                          userId={userId}
                          className="font-medium"
                        />
                        <Badge variant="outline" className="text-xs">
                          {contact.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <ClickableDataElement
                          type="email"
                          value={contact.email}
                          entityId={contact.id}
                          entityType="contact"
                          companyId={companyId}
                          userId={userId}
                          className="text-sm text-muted-foreground"
                        />
                        {contact.lastActivity && (
                          <ClickableDataElement
                            type="date"
                            value={contact.lastActivity}
                            displayValue={new Date(contact.lastActivity).toLocaleDateString()}
                            entityId={contact.id}
                            entityType="contact"
                            companyId={companyId}
                            userId={userId}
                            className="text-sm text-muted-foreground"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest scoring contacts and leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeContacts
                .sort((a, b) => b.leadScore - a.leadScore)
                .slice(0, 5)
                .map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ClickableDataElement
                          type="name"
                          value={`${contact.firstName} ${contact.lastName}`}
                          entityId={contact.id}
                          entityType="contact"
                          companyId={companyId}
                          userId={userId}
                          className="font-medium"
                        />
                        <span className={`font-semibold ${getScoreColor(contact.leadScore)}`}>
                          {contact.leadScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {contact.company && (
                          <ClickableDataElement
                            type="company"
                            value={contact.company}
                            entityId={contact.id}
                            entityType="contact"
                            companyId={companyId}
                            userId={userId}
                            className="text-sm text-muted-foreground"
                          />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {contact.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}