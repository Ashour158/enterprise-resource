import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Phone, 
  EnvelopeSimple as Mail, 
  Eye,
  ArrowRight,
  Building,
  MapPin,
  Globe,
  Users,
  TrendUp,
  Star,
  Circle
} from '@phosphor-icons/react'
import { LeadProfilePage } from './lead/LeadProfilePage'
import { ContactProfilePage } from './contact/ContactProfilePage'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface CRMProfileDemoProps {
  companyId: string
  userId: string
}

export function CRMProfileDemo({ companyId, userId }: CRMProfileDemoProps) {
  const [selectedProfile, setSelectedProfile] = useState<{ type: 'lead' | 'contact' | 'account', id: string } | null>(null)

  // Sample data for demonstration
  const sampleLeads = [
    {
      id: 'lead-001',
      lead_number: 'LEAD-2024-001',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@techcorp.com',
      company_name: 'TechCorp Solutions',
      job_title: 'VP of Engineering',
      lead_status: 'qualified',
      lead_rating: 'hot',
      ai_lead_score: 85,
      ai_conversion_probability: 0.78,
      ai_estimated_deal_value: 125000,
      last_contact_date: '2024-01-15T10:30:00Z',
      engagement_score: 92
    },
    {
      id: 'lead-002',
      lead_number: 'LEAD-2024-002',
      first_name: 'David',
      last_name: 'Martinez',
      email: 'david.martinez@innovate.com',
      company_name: 'Innovate Systems',
      job_title: 'CTO',
      lead_status: 'new',
      lead_rating: 'warm',
      ai_lead_score: 72,
      ai_conversion_probability: 0.45,
      ai_estimated_deal_value: 85000,
      last_contact_date: '2024-01-12T14:20:00Z',
      engagement_score: 68
    }
  ]

  const sampleContacts = [
    {
      id: 'contact-001',
      contact_number: 'CON-2024-001',
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'michael.chen@innovatetech.com',
      account_name: 'InnovateTech Solutions',
      job_title: 'CTO',
      contact_type: 'customer',
      contact_status: 'active',
      primary_contact: true,
      decision_maker: true,
      ai_influence_score: 92,
      ai_engagement_level: 'highly_engaged',
      last_contact_date: '2024-01-16T14:30:00Z'
    },
    {
      id: 'contact-002',
      contact_number: 'CON-2024-002',
      first_name: 'Lisa',
      last_name: 'Thompson',
      email: 'lisa.thompson@globaltech.com',
      account_name: 'GlobalTech Industries',
      job_title: 'Operations Manager',
      contact_type: 'customer',
      contact_status: 'active',
      primary_contact: false,
      decision_maker: false,
      ai_influence_score: 75,
      ai_engagement_level: 'moderately_engaged',
      last_contact_date: '2024-01-14T11:15:00Z'
    }
  ]

  const sampleAccounts = [
    {
      id: 'account-001',
      account_name: 'InnovateTech Solutions',
      account_type: 'customer',
      industry: 'Technology',
      annual_revenue: 50000000,
      employee_count: 250,
      account_status: 'active',
      primary_contact: 'Michael Chen',
      total_deals_value: 325000,
      last_activity_date: '2024-01-16T14:30:00Z',
      account_score: 88
    },
    {
      id: 'account-002',
      account_name: 'GlobalTech Industries',
      account_type: 'prospect',
      industry: 'Manufacturing',
      annual_revenue: 120000000,
      employee_count: 500,
      account_status: 'active',
      primary_contact: 'Lisa Thompson',
      total_deals_value: 450000,
      last_activity_date: '2024-01-14T11:15:00Z',
      account_score: 94
    }
  ]

  const getStatusColor = (status: string, type: 'lead' | 'contact' | 'account') => {
    if (type === 'lead') {
      switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800'
        case 'contacted': return 'bg-yellow-100 text-yellow-800'
        case 'qualified': return 'bg-green-100 text-green-800'
        case 'unqualified': return 'bg-red-100 text-red-800'
        case 'converted': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800'
        case 'inactive': return 'bg-gray-100 text-gray-800'
        case 'prospect': return 'bg-blue-100 text-blue-800'
        case 'customer': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'hot': return 'bg-red-100 text-red-800'
      case 'warm': return 'bg-orange-100 text-orange-800'
      case 'cold': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewProfile = (type: 'lead' | 'contact' | 'account', id: string) => {
    setSelectedProfile({ type, id })
  }

  const handleCloseProfile = () => {
    setSelectedProfile(null)
  }

  const handleClickableAction = (action: string, item: any) => {
    toast.success(`${action}: ${item.first_name || item.account_name}`)
  }

  // If a profile is selected, show the full-page view
  if (selectedProfile) {
    if (selectedProfile.type === 'lead') {
      return (
        <LeadProfilePage
          leadId={selectedProfile.id}
          companyId={companyId}
          userId={userId}
          onClose={handleCloseProfile}
        />
      )
    } else if (selectedProfile.type === 'contact') {
      return (
        <ContactProfilePage
          contactId={selectedProfile.id}
          companyId={companyId}
          userId={userId}
          onClose={handleCloseProfile}
        />
      )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Profile Experience</h2>
          <p className="text-muted-foreground">
            Experience comprehensive full-page lead and contact profiles with AI insights, activity timelines, and collaborative team notes
          </p>
        </div>
      </div>

      {/* Clickable Data Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} />
            Clickable Data Elements
          </CardTitle>
          <CardDescription>
            All data elements in the CRM are clickable and interactive. Click on any name, company, phone number, or email to see actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Names</h4>
              <button 
                onClick={() => handleClickableAction('View Profile', { first_name: 'Sarah Johnson' })}
                className="text-primary hover:underline text-sm"
              >
                Sarah Johnson
              </button>
              <p className="text-xs text-muted-foreground">Click to open full profile</p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Companies</h4>
              <button 
                onClick={() => handleClickableAction('View Account', { account_name: 'TechCorp Solutions' })}
                className="text-primary hover:underline text-sm"
              >
                TechCorp Solutions
              </button>
              <p className="text-xs text-muted-foreground">Click to view account details</p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Phone Numbers</h4>
              <button 
                onClick={() => handleClickableAction('Initiate Call', { phone: '+1 (555) 123-4567' })}
                className="text-primary hover:underline text-sm"
              >
                +1 (555) 123-4567
              </button>
              <p className="text-xs text-muted-foreground">Click to initiate call</p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Email Addresses</h4>
              <button 
                onClick={() => handleClickableAction('Compose Email', { email: 'sarah@techcorp.com' })}
                className="text-primary hover:underline text-sm"
              >
                sarah@techcorp.com
              </button>
              <p className="text-xs text-muted-foreground">Click to compose email</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Lead Profiles
          </CardTitle>
          <CardDescription>
            Click on any lead to experience the comprehensive full-page profile view with AI insights and collaboration features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sampleLeads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {lead.first_name[0]}{lead.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <button 
                            onClick={() => handleViewProfile('lead', lead.id)}
                            className="font-medium text-lg hover:text-primary transition-colors"
                          >
                            {lead.first_name} {lead.last_name}
                          </button>
                          <p className="text-sm text-muted-foreground">{lead.job_title}</p>
                          <button 
                            onClick={() => handleClickableAction('View Account', { account_name: lead.company_name })}
                            className="text-sm text-primary hover:underline"
                          >
                            {lead.company_name}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(lead.lead_status, 'lead')}>
                          {lead.lead_status}
                        </Badge>
                        <Badge className={getRatingColor(lead.lead_rating)}>
                          {lead.lead_rating}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-primary">{lead.ai_lead_score}</div>
                        <div className="text-muted-foreground">AI Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{Math.round(lead.ai_conversion_probability * 100)}%</div>
                        <div className="text-muted-foreground">Conversion</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">${lead.ai_estimated_deal_value.toLocaleString()}</div>
                        <div className="text-muted-foreground">Est. Value</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button 
                          onClick={() => handleClickableAction('Compose Email', { email: lead.email })}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <Mail size={14} />
                          {lead.email}
                        </button>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-yellow-500" />
                          Engagement: {lead.engagement_score}%
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewProfile('lead', lead.id)}
                        className="flex items-center gap-2"
                      >
                        View Profile
                        <ArrowRight size={14} />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last contact: {format(new Date(lead.last_contact_date), 'MMM d, yyyy at h:mm a')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Contact Profiles
          </CardTitle>
          <CardDescription>
            Customer and prospect contacts with detailed interaction history and relationship insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sampleContacts.map((contact) => (
              <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500/20 hover:border-l-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {contact.first_name[0]}{contact.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <button 
                            onClick={() => handleViewProfile('contact', contact.id)}
                            className="font-medium text-lg hover:text-primary transition-colors"
                          >
                            {contact.first_name} {contact.last_name}
                          </button>
                          <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                          <button 
                            onClick={() => handleClickableAction('View Account', { account_name: contact.account_name })}
                            className="text-sm text-primary hover:underline"
                          >
                            {contact.account_name}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(contact.contact_status, 'contact')}>
                          {contact.contact_status}
                        </Badge>
                        {contact.primary_contact && (
                          <Badge variant="outline" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {contact.decision_maker && (
                          <Badge variant="outline" className="text-xs">
                            Decision Maker
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-primary">{contact.ai_influence_score}</div>
                        <div className="text-muted-foreground">Influence Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">
                          {contact.ai_engagement_level.replace('_', ' ')}
                        </div>
                        <div className="text-muted-foreground">Engagement</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button 
                          onClick={() => handleClickableAction('Compose Email', { email: contact.email })}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <Mail size={14} />
                          {contact.email}
                        </button>
                        <div className="flex items-center gap-1">
                          <Circle size={8} className="text-green-500 fill-current" />
                          <span>Online</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewProfile('contact', contact.id)}
                        className="flex items-center gap-2"
                      >
                        View Profile
                        <ArrowRight size={14} />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last contact: {format(new Date(contact.last_contact_date), 'MMM d, yyyy at h:mm a')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            Account Profiles
          </CardTitle>
          <CardDescription>
            Company accounts with comprehensive business information and relationship overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sampleAccounts.map((account) => (
              <Card key={account.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500/20 hover:border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <button 
                          onClick={() => handleClickableAction('View Account Details', account)}
                          className="font-medium text-lg hover:text-primary transition-colors"
                        >
                          {account.account_name}
                        </button>
                        <p className="text-sm text-muted-foreground">{account.industry}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(account.account_type, 'account')}>
                            {account.account_type}
                          </Badge>
                          <Badge className={getStatusColor(account.account_status, 'account')}>
                            {account.account_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{account.account_score}</div>
                        <div className="text-xs text-muted-foreground">Account Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">${(account.annual_revenue / 1000000).toFixed(0)}M</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">{account.employee_count}</div>
                        <div className="text-muted-foreground">Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600">${account.total_deals_value.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Deals</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          Primary: 
                          <button 
                            onClick={() => handleClickableAction('View Contact', { name: account.primary_contact })}
                            className="text-primary hover:underline"
                          >
                            {account.primary_contact}
                          </button>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleClickableAction('View Account Details', account)}
                        className="flex items-center gap-2"
                      >
                        View Account
                        <ArrowRight size={14} />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last activity: {format(new Date(account.last_activity_date), 'MMM d, yyyy at h:mm a')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Collaboration Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Real-time Collaboration Features
          </CardTitle>
          <CardDescription>
            Enhanced collaboration features available in full-page profile views
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Circle size={24} className="mx-auto text-green-500" />
              <h4 className="font-medium">Live Presence</h4>
              <p className="text-xs text-muted-foreground">See who's viewing each record in real-time</p>
            </div>
            <div className="p-4 border rounded-lg text-center space-y-2">
              <PencilSimple size={24} className="mx-auto text-blue-500" />
              <h4 className="font-medium">Collaborative Editing</h4>
              <p className="text-xs text-muted-foreground">Multiple users can edit notes simultaneously</p>
            </div>
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Circle size={24} className="mx-auto text-orange-500" />
              <h4 className="font-medium">Live Cursors</h4>
              <p className="text-xs text-muted-foreground">See other users' cursors and selections</p>
            </div>
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Mail size={24} className="mx-auto text-purple-500" />
              <h4 className="font-medium">Activity Notifications</h4>
              <p className="text-xs text-muted-foreground">Real-time notifications for new activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}