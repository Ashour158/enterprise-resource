import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import ClickableContactProfile from '@/components/shared/ClickableContactProfile'
import { 
  User, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  Video,
  Calendar,
  MessageCircle,
  FileText,
  ChartLine,
  Target,
  Star,
  Crown,
  Shield,
  Lightning,
  Heart,
  Eye,
  Brain,
  TrendUp,
  CheckCircle,
  Activity,
  Handshake,
  Network,
  Clock,
  Globe,
  Briefcase
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import ContactInteractionTest from '@/components/ContactInteractionTest'

interface ContactInteractionDemoProps {
  companyId: string
  userId: string
}

function ContactInteractionDemo({ companyId, userId }: ContactInteractionDemoProps) {
  const [selectedDemo, setSelectedDemo] = useState('lead-interaction')
  const [interactionCount, setInteractionCount] = useState(0)

  const handleContactSelect = (contact: any) => {
    setInteractionCount(prev => prev + 1)
    toast.success(`Contact profile opened: ${contact.name} (Interaction #${interactionCount + 1})`)
  }

  // Sample data for different demo scenarios
  const demoScenarios = {
    'lead-interaction': {
      title: 'Lead Management Interactions',
      description: 'Click any contact name to explore their complete relationship profile',
      contacts: [
        { name: 'Michael Chen', role: 'CTO', company: 'TechCorp', type: 'decision-maker' },
        { name: 'Sarah Williams', role: 'CEO', company: 'TechCorp', type: 'executive' },
        { name: 'Alex Rodriguez', role: 'Lead Developer', company: 'TechCorp', type: 'influencer' },
        { name: 'Jennifer Park', role: 'VP Operations', company: 'TechCorp', type: 'stakeholder' }
      ]
    },
    'deal-pipeline': {
      title: 'Deal Pipeline Contacts',
      description: 'Explore contact relationships within active deals',
      contacts: [
        { name: 'David Kim', role: 'Product Manager', company: 'GlobalTech', type: 'champion' },
        { name: 'Lisa Zhang', role: 'Head of Engineering', company: 'InnovateCorp', type: 'technical' },
        { name: 'Robert Johnson', role: 'CFO', company: 'FinanceFirst', type: 'budget-holder' },
        { name: 'Maria Garcia', role: 'VP Sales', company: 'SalesForce Plus', type: 'buyer' }
      ]
    },
    'account-mapping': {
      title: 'Account Relationship Mapping',
      description: 'Navigate complex organizational relationships',
      contacts: [
        { name: 'James Wilson', role: 'Chief Strategy Officer', company: 'Enterprise Corp', type: 'strategic' },
        { name: 'Emma Thompson', role: 'Director of IT', company: 'TechSolutions Ltd', type: 'technical' },
        { name: 'Carlos Rodriguez', role: 'VP Customer Success', company: 'ClientFirst Inc', type: 'advocate' },
        { name: 'Priya Patel', role: 'Head of Procurement', company: 'Global Enterprises', type: 'procurement' }
      ]
    }
  }

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'decision-maker': return <Lightning className="w-4 h-4 text-red-600" />
      case 'executive': return <Crown className="w-4 h-4 text-purple-600" />
      case 'influencer': return <Target className="w-4 h-4 text-orange-600" />
      case 'champion': return <Heart className="w-4 h-4 text-pink-600" />
      case 'technical': return <Brain className="w-4 h-4 text-blue-600" />
      case 'budget-holder': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'stakeholder': return <Users className="w-4 h-4 text-gray-600" />
      case 'strategic': return <Star className="w-4 h-4 text-yellow-600" />
      case 'advocate': return <Shield className="w-4 h-4 text-green-600" />
      case 'procurement': return <Briefcase className="w-4 h-4 text-brown-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decision-maker': return 'border-red-200 bg-red-50'
      case 'executive': return 'border-purple-200 bg-purple-50'
      case 'influencer': return 'border-orange-200 bg-orange-50'
      case 'champion': return 'border-pink-200 bg-pink-50'
      case 'technical': return 'border-blue-200 bg-blue-50'
      case 'budget-holder': return 'border-green-200 bg-green-50'
      case 'stakeholder': return 'border-gray-200 bg-gray-50'
      case 'strategic': return 'border-yellow-200 bg-yellow-50'
      case 'advocate': return 'border-green-200 bg-green-50'
      case 'procurement': return 'border-brown-200 bg-brown-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Network className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Interactive Contact Relationship Explorer</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          Experience comprehensive contact relationship mapping with detailed interaction history, 
          AI insights, and relationship network visualization. Click any contact name to explore 
          their complete profile.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>Interactive Demo</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>{interactionCount} Profiles Viewed</span>
          </Badge>
        </div>
      </div>

      {/* Key Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartLine className="w-5 h-5 mr-2" />
            Enhanced Contact Intelligence Features
          </CardTitle>
          <CardDescription>
            Each clickable contact reveals comprehensive relationship and interaction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Network className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Relationship Mapping</h4>
                <p className="text-xs text-muted-foreground">Complete network visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-medium">Interaction History</h4>
                <p className="text-xs text-muted-foreground">Full communication timeline</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-medium">AI Insights</h4>
                <p className="text-xs text-muted-foreground">Predictive analytics & recommendations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <TrendUp className="w-8 h-8 text-orange-600" />
              <div>
                <h4 className="font-medium">Engagement Metrics</h4>
                <p className="text-xs text-muted-foreground">Performance tracking & scoring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo Scenarios */}
      <Tabs value={selectedDemo} onValueChange={setSelectedDemo}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lead-interaction">Lead Management</TabsTrigger>
          <TabsTrigger value="deal-pipeline">Deal Pipeline</TabsTrigger>
          <TabsTrigger value="account-mapping">Account Mapping</TabsTrigger>
          <TabsTrigger value="testing-suite">Testing Suite</TabsTrigger>
        </TabsList>

        {Object.entries(demoScenarios).map(([key, scenario]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenario.contacts.map((contact, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${getTypeColor(contact.type)}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getContactIcon(contact.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  <ClickableContactProfile
                                    contactName={contact.name}
                                    companyId={companyId}
                                    onContactSelect={handleContactSelect}
                                  />
                                </h4>
                                <p className="text-muted-foreground">{contact.role}</p>
                                <p className="text-sm text-muted-foreground">{contact.company}</p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {contact.type.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-4 h-4" />
                                  <span>Email</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>Phone</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Video className="w-4 h-4" />
                                  <span>Meeting</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Relationship Strength:</span>
                                  <div className="w-16 bg-gray-200 h-2 rounded-full">
                                    <div 
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Last contact: {Math.floor(Math.random() * 7) + 1}d ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="testing-suite">
          <ContactInteractionTest 
            companyId={companyId}
            userId={userId}
          />
        </TabsContent>
      </Tabs>

      {/* Benefits and Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Productivity Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Instant Context</h4>
                  <p className="text-sm text-muted-foreground">
                    Get complete contact context with one click - no need to navigate between pages
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Relationship Intelligence</h4>
                  <p className="text-sm text-muted-foreground">
                    Understand who reports to whom and influence networks within accounts
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Interaction History</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete timeline of emails, calls, meetings, and document sharing
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations for next best actions and communication strategies
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Personality Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-driven personality profiling and communication style recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Engagement Scoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Track relationship strength, responsiveness, and advocacy scores over time
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Network className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Network Mapping</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize organizational hierarchies and influence networks
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Handshake className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Collaboration Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    Share insights with team members and collaborate on relationship building
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartLine className="w-5 h-5 mr-2" />
            Demo Session Statistics
          </CardTitle>
          <CardDescription>
            Track your interaction with the clickable contact system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{interactionCount}</div>
              <div className="text-sm text-muted-foreground">Profiles Explored</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(demoScenarios).length}
              </div>
              <div className="text-sm text-muted-foreground">Demo Scenarios</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(demoScenarios).reduce((total, scenario) => total + scenario.contacts.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Available Contacts</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-muted-foreground">Data Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Experience Interactive Contact Intelligence</h3>
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Click any contact name above to experience the comprehensive relationship mapping system. 
            Explore detailed profiles, interaction histories, and AI-powered insights that drive 
            better business relationships.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" onClick={() => toast.success('Contact intelligence system ready!')}>
              <Network className="w-5 h-5 mr-2" />
              Explore Contact Network
            </Button>
            <Button size="lg" variant="outline" onClick={() => setInteractionCount(0)}>
              <Activity className="w-5 h-5 mr-2" />
              Reset Demo Statistics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactInteractionDemo