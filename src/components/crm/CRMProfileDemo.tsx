import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadProfilePage } from './profiles/LeadProfilePage'
import { ContactProfilePage } from './profiles/ContactProfilePage'
import { 
  User, 
  Users, 
  TrendUp, 
  Brain, 
  MessageCircle, 
  Activity,
  Star,
  Target,
  Eye,
  ArrowRight
} from '@phosphor-icons/react'

interface ProfileDemoProps {
  companyId: string
  userId: string
}

export function CRMProfileDemo({ companyId, userId }: ProfileDemoProps) {
  const [selectedLeadProfile, setSelectedLeadProfile] = useState<string | null>(null)
  const [selectedContactProfile, setSelectedContactProfile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Demo data for leads and contacts
  const demoLeads = [
    {
      id: 'lead-001',
      name: 'John Smith',
      company: 'TechCorp Solutions',
      title: 'VP of Technology',
      score: 85,
      rating: 'hot',
      status: 'qualified',
      value: '$125,000',
      insights: 4
    },
    {
      id: 'lead-002', 
      name: 'Sarah Wilson',
      company: 'Global Industries',
      title: 'Chief Marketing Officer',
      score: 92,
      rating: 'hot',
      status: 'contacted',
      value: '$250,000',
      insights: 6
    },
    {
      id: 'lead-003',
      name: 'Michael Chen',
      company: 'Startup Dynamics',
      title: 'Founder & CEO',
      score: 78,
      rating: 'warm',
      status: 'new',
      value: '$75,000',
      insights: 3
    }
  ]

  const demoContacts = [
    {
      id: 'contact-001',
      name: 'Emily Rodriguez',
      company: 'GlobalTech Corporation',
      title: 'Chief Technology Officer',
      relationship: 85,
      influence: 'High',
      responsiveness: 92,
      deals: 2,
      activities: 12
    },
    {
      id: 'contact-002',
      name: 'David Thompson',
      company: 'Enterprise Solutions Inc',
      title: 'VP of Operations',
      relationship: 78,
      influence: 'Medium',
      responsiveness: 88,
      deals: 1,
      activities: 8
    },
    {
      id: 'contact-003',
      name: 'Lisa Martinez',
      company: 'Innovation Labs',
      title: 'Head of Procurement',
      relationship: 91,
      influence: 'High',
      responsiveness: 95,
      deals: 3,
      activities: 15
    }
  ]

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'hot': return 'destructive'
      case 'warm': return 'default'
      case 'cold': return 'secondary'
      default: return 'outline'
    }
  }

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'High': return 'destructive'
      case 'Medium': return 'default'
      case 'Low': return 'secondary'
      default: return 'outline'
    }
  }

  // Check for profile views first
  if (selectedLeadProfile) {
    return (
      <LeadProfilePage
        leadId={selectedLeadProfile}
        companyId={companyId}
        userId={userId}
        onBack={() => setSelectedLeadProfile(null)}
      />
    )
  }
  
  if (selectedContactProfile) {
    return (
      <ContactProfilePage
        contactId={selectedContactProfile}
        companyId={companyId}
        userId={userId}
        onBack={() => setSelectedContactProfile(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">CRM Profile Experience</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Experience comprehensive full-page lead and contact profiles with AI insights, 
          activity timelines, and collaborative team notes. Click on any lead or contact 
          to view their detailed profile.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Brain size={32} className="mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI analysis including lead scoring, personality profiling, and next best actions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Activity size={32} className="mx-auto text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Activity Timeline</h3>
            <p className="text-sm text-muted-foreground">
              Complete interaction history with sentiment analysis and visual timeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle size={32} className="mx-auto text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Collaborative Notes</h3>
            <p className="text-sm text-muted-foreground">
              Real-time team collaboration with reactions, mentions, and shared insights
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Lead Profiles</TabsTrigger>
          <TabsTrigger value="contacts">Contact Profiles</TabsTrigger>
        </TabsList>

        {/* Lead Profiles */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                High-Priority Lead Profiles
              </CardTitle>
              <CardDescription>
                Click on any lead to experience their comprehensive profile with AI insights and activity timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {demoLeads.map((lead) => (
                  <Card 
                    key={lead.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-primary/30"
                    onClick={() => setSelectedLeadProfile(lead.id)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{lead.name}</h3>
                              <p className="text-sm text-muted-foreground">{lead.title}</p>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-muted-foreground" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Company</span>
                            <span className="text-sm text-muted-foreground">{lead.company}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary">{lead.score}/100</span>
                              <Badge variant={getRatingColor(lead.rating)} className="text-xs">
                                {lead.rating.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Est. Value</span>
                            <span className="text-sm font-bold text-green-600">{lead.value}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Insights</span>
                            <div className="flex items-center gap-1">
                              <Brain size={12} className="text-primary" />
                              <span className="text-sm">{lead.insights} insights</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLeadProfile(lead.id)
                            }}
                          >
                            <Eye size={16} className="mr-2" />
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Profiles */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Key Contact Profiles
              </CardTitle>
              <CardDescription>
                Click on any contact to experience their detailed profile with relationship insights and collaboration tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {demoContacts.map((contact) => (
                  <Card 
                    key={contact.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-400/30"
                    onClick={() => setSelectedContactProfile(contact.id)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {contact.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{contact.name}</h3>
                              <p className="text-sm text-muted-foreground">{contact.title}</p>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-muted-foreground" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Company</span>
                            <span className="text-sm text-muted-foreground">{contact.company}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Relationship</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary">{contact.relationship}/100</span>
                              <Badge variant={getInfluenceColor(contact.influence)} className="text-xs">
                                {contact.influence}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Responsiveness</span>
                            <span className="text-sm font-bold text-green-600">{contact.responsiveness}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Active Deals</span>
                            <span className="text-sm">{contact.deals} deals</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Interactions</span>
                            <div className="flex items-center gap-1">
                              <Activity size={12} className="text-blue-600" />
                              <span className="text-sm">{contact.activities} activities</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedContactProfile(contact.id)
                            }}
                          >
                            <Eye size={16} className="mr-2" />
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-8 text-center">
          <Brain size={48} className="mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Experience the Future of CRM</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Our AI-powered profiles provide deep insights into your leads and contacts, 
            helping you build stronger relationships and close more deals. Click any profile above to explore the comprehensive views.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setSelectedLeadProfile('lead-001')}>
              <Target size={16} className="mr-2" />
              View Sample Lead Profile
            </Button>
            <Button variant="outline" onClick={() => setSelectedContactProfile('contact-001')}>
              <Users size={16} className="mr-2" />
              View Sample Contact Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}