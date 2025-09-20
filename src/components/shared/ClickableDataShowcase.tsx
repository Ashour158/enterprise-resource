import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClickableDataElement, ClickableDataGroup, QuickActions } from '@/components/shared/ClickableDataElements'
import { EnhancedClickableDataTable, ClickableTableColumn, ClickableTableRow } from '@/components/shared/EnhancedClickableDataTable'
import { 
  User, 
  Building, 
  EnvelopeSimple as Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Tag, 
  CurrencyDollar, 
  Globe,
  ChartLine,
  Users,
  TrendUp,
  Star
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ClickableDataShowcaseProps {
  companyId: string
  userId: string
}

export function ClickableDataShowcase({ companyId, userId }: ClickableDataShowcaseProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')

  // Sample data for demonstration
  const sampleContacts = [
    {
      id: 'contact-1',
      entityType: 'contact' as const,
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@acmecorp.com',
      phone: '+1 (555) 123-4567',
      company: 'ACME Corporation',
      jobTitle: 'VP of Sales',
      website: 'https://acmecorp.com',
      address: '123 Business Ave, New York, NY 10001',
      status: 'qualified',
      value: 45000,
      priority: 'high',
      tags: ['Enterprise', 'Hot Lead', 'Decision Maker'],
      lastActivity: '2024-01-15',
      nextMeeting: '2024-01-20T14:00:00Z'
    },
    {
      id: 'contact-2',
      entityType: 'contact' as const,
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@techstart.io',
      phone: '+1 (555) 987-6543',
      company: 'TechStart Inc',
      jobTitle: 'CTO',
      website: 'https://techstart.io',
      address: '456 Innovation Dr, San Francisco, CA 94105',
      status: 'new',
      value: 25000,
      priority: 'medium',
      tags: ['Startup', 'Tech', 'Warm Lead'],
      lastActivity: '2024-01-18',
      nextMeeting: '2024-01-22T10:00:00Z'
    },
    {
      id: 'contact-3',
      entityType: 'contact' as const,
      name: 'Michael Chen',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'm.chen@globalventures.com',
      phone: '+1 (555) 456-7890',
      company: 'Global Ventures LLC',
      jobTitle: 'Investment Director',
      website: 'https://globalventures.com',
      address: '789 Finance Blvd, Chicago, IL 60601',
      status: 'customer',
      value: 125000,
      priority: 'high',
      tags: ['Investor', 'VIP', 'Repeat Customer'],
      lastActivity: '2024-01-10',
      nextMeeting: '2024-01-25T16:00:00Z'
    }
  ]

  const handleAction = (action: string, data: any) => {
    setSelectedAction(`${action}: ${JSON.stringify(data)}`)
    toast.success(`Action triggered: ${action}`)
  }

  const demoColumns: ClickableTableColumn[] = [
    {
      key: 'name',
      label: 'Contact Name',
      clickable: true,
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <ClickableDataElement
              type="name"
              value={value}
              entityId={row.id}
              entityType="contact"
              companyId={companyId}
              userId={userId}
              className="font-medium"
            />
            <div className="text-xs text-muted-foreground">{row.jobTitle}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      clickable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <ClickableDataElement
            type="company"
            value={value}
            entityId={row.id}
            entityType="contact"
            companyId={companyId}
            userId={userId}
          />
          {row.website && (
            <ClickableDataElement
              type="website"
              value={row.website}
              displayValue="Visit Website"
              entityId={row.id}
              entityType="contact"
              companyId={companyId}
              userId={userId}
              className="text-xs"
            />
          )}
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (value, row) => (
        <div className="space-y-1">
          <ClickableDataElement
            type="email"
            value={row.email}
            entityId={row.id}
            entityType="contact"
            companyId={companyId}
            userId={userId}
            className="text-sm"
          />
          <ClickableDataElement
            type="phone"
            value={row.phone}
            entityId={row.id}
            entityType="contact"
            companyId={companyId}
            userId={userId}
            className="text-sm"
          />
        </div>
      )
    },
    {
      key: 'value',
      label: 'Deal Value',
      clickable: true,
      render: (value, row) => (
        <ClickableDataElement
          type="currency"
          value={value.toString()}
          displayValue={`$${value.toLocaleString()}`}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
          className="font-semibold text-green-600"
        />
      )
    },
    {
      key: 'address',
      label: 'Location',
      clickable: true,
      render: (value, row) => (
        <ClickableDataElement
          type="address"
          value={value}
          displayValue={value.split(',').slice(1).join(',').trim()}
          entityId={row.id}
          entityType="contact"
          companyId={companyId}
          userId={userId}
          className="text-sm"
        />
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value, row) => (
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
            <Badge variant="outline" className="text-xs">+{value.length - 2}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'nextMeeting',
      label: 'Next Meeting',
      clickable: true,
      render: (value, row) => (
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
      )
    }
  ]

  const getQuickStats = () => [
    {
      label: 'Interactive Elements',
      value: '8',
      description: 'Types of clickable data',
      icon: <Star size={20} />,
      color: 'text-blue-600'
    },
    {
      label: 'Actions Triggered',
      value: '15',
      description: 'Total interactions',
      icon: <TrendUp size={20} />,
      color: 'text-green-600'
    },
    {
      label: 'Data Points',
      value: '24',
      description: 'Clickable elements',
      icon: <ChartLine size={20} />,
      color: 'text-purple-600'
    },
    {
      label: 'Contacts',
      value: sampleContacts.length.toString(),
      description: 'Sample records',
      icon: <Users size={20} />,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clickable Data Elements Showcase</h1>
        <p className="text-muted-foreground mt-2">
          Interactive demonstration of all clickable data types and full-page detail views
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getQuickStats().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="elements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="elements">Individual Elements</TabsTrigger>
          <TabsTrigger value="table">Interactive Table</TabsTrigger>
          <TabsTrigger value="groups">Data Groups</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        {/* Individual Elements */}
        <TabsContent value="elements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Click any element to trigger an action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (opens profile)</label>
                  <ClickableDataElement
                    type="name"
                    value="John Smith"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onProfileView={(id, type) => handleAction('profile_view', { id, type })}
                    className="text-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (compose email)</label>
                  <ClickableDataElement
                    type="email"
                    value="john.smith@acmecorp.com"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onEmailCompose={(email, data) => handleAction('email_compose', { email, data })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone (initiate call)</label>
                  <ClickableDataElement
                    type="phone"
                    value="+1 (555) 123-4567"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onPhoneCall={(phone, data) => handleAction('phone_call', { phone, data })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company (view company)</label>
                  <ClickableDataElement
                    type="company"
                    value="ACME Corporation"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onProfileView={(id, type) => handleAction('company_view', { id, type })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Additional clickable data types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address (view map)</label>
                  <ClickableDataElement
                    type="address"
                    value="123 Business Ave, New York, NY 10001"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onMapView={(address) => handleAction('map_view', { address })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Value (financial details)</label>
                  <ClickableDataElement
                    type="currency"
                    value="45000"
                    displayValue="$45,000"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onFinancialView={(amount, data) => handleAction('financial_view', { amount, data })}
                    className="text-lg font-semibold text-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Next Meeting (calendar view)</label>
                  <ClickableDataElement
                    type="date"
                    value="2024-01-20T14:00:00Z"
                    displayValue="January 20, 2024"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                    onCalendarView={(date) => handleAction('calendar_view', { date })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website (external link)</label>
                  <ClickableDataElement
                    type="website"
                    value="https://acmecorp.com"
                    displayValue="Visit ACME Corp"
                    entityId="demo-contact-1"
                    entityType="contact"
                    companyId={companyId}
                    userId={userId}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (filter data)</label>
                  <div className="flex gap-2">
                    <ClickableDataElement
                      type="tag"
                      value="Enterprise"
                      entityId="demo-contact-1"
                      entityType="contact"
                      companyId={companyId}
                      userId={userId}
                      onTagFilter={(tag) => handleAction('tag_filter', { tag })}
                    />
                    <ClickableDataElement
                      type="tag"
                      value="Hot Lead"
                      entityId="demo-contact-1"
                      entityType="contact"
                      companyId={companyId}
                      userId={userId}
                      onTagFilter={(tag) => handleAction('tag_filter', { tag })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Log */}
          {selectedAction && (
            <Card>
              <CardHeader>
                <CardTitle>Last Action Triggered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">{selectedAction}</code>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interactive Table */}
        <TabsContent value="table" className="space-y-6">
          <EnhancedClickableDataTable
            title="Interactive Contact Table"
            description="Every data element is clickable and opens appropriate actions or views"
            columns={demoColumns}
            data={sampleContacts}
            companyId={companyId}
            userId={userId}
            pageSize={10}
            showSearch={true}
            showFilters={true}
            showBulkActions={true}
            onAction={handleAction}
            onBulkAction={(action, rows) => handleAction('bulk_action', { action, count: rows.length })}
          />
        </TabsContent>

        {/* Data Groups */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grouped Clickable Data</CardTitle>
              <CardDescription>Multiple related data elements grouped together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sampleContacts.map((contact) => (
                <div key={contact.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">{contact.name}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Contact Methods</label>
                      <ClickableDataGroup
                        data={[
                          { type: 'email', value: contact.email, entityId: contact.id, entityType: 'contact' },
                          { type: 'phone', value: contact.phone, entityId: contact.id, entityType: 'contact' }
                        ]}
                        companyId={companyId}
                        userId={userId}
                        separator=" | "
                        onEmailCompose={(email, data) => handleAction('email_compose', { email, data })}
                        onPhoneCall={(phone, data) => handleAction('phone_call', { phone, data })}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Business Info</label>
                      <ClickableDataGroup
                        data={[
                          { type: 'company', value: contact.company, entityId: contact.id, entityType: 'contact' },
                          { type: 'currency', value: contact.value.toString(), displayValue: `$${contact.value.toLocaleString()}`, entityId: contact.id, entityType: 'contact' }
                        ]}
                        companyId={companyId}
                        userId={userId}
                        separator=" • "
                        onProfileView={(id, type) => handleAction('company_view', { id, type })}
                        onFinancialView={(amount, data) => handleAction('financial_view', { amount, data })}
                      />
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Tags</label>
                      <ClickableDataGroup
                        data={contact.tags.map(tag => ({ type: 'tag' as const, value: tag, entityId: contact.id, entityType: 'contact' as const }))}
                        companyId={companyId}
                        userId={userId}
                        separator=""
                        className="flex flex-wrap gap-1"
                        onTagFilter={(tag) => handleAction('tag_filter', { tag })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Action Buttons</CardTitle>
              <CardDescription>Hover over contacts to see quick action buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                  </div>
                  
                  <QuickActions
                    entityType="contact"
                    entityId={contact.id}
                    entityData={{
                      name: contact.name,
                      email: contact.email,
                      phone: contact.phone,
                      company: contact.company
                    }}
                    companyId={companyId}
                    userId={userId}
                    onAction={handleAction}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}