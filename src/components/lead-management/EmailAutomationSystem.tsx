import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Clock, 
  Send, 
  Settings, 
  Plus,
  Play,
  Pause,
  Stop,
  Edit,
  Trash,
  Eye,
  Target,
  Activity,
  BarChart,
  Calendar,
  User,
  Users,
  TrendUp,
  Bell,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkle,
  Lightbulb
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  leadStatus: string
  leadRating: string
  industry?: string
  companySize?: string
  engagementScore: number
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  lastContactDate?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  templateType: 'welcome' | 'follow_up' | 'nurture' | 'promotional' | 'custom'
  variables: string[]
  aiOptimized: boolean
  openRate?: number
  clickRate?: number
  replyRate?: number
}

interface EmailCampaign {
  id: string
  name: string
  description: string
  campaignType: 'drip' | 'behavioral' | 'welcome' | 'nurture' | 'reengagement'
  status: 'draft' | 'active' | 'paused' | 'completed'
  targetCriteria: Record<string, any>
  emailSequence: EmailStep[]
  aiOptimization: {
    enabled: boolean
    optimizeSubjects: boolean
    optimizeContent: boolean
    optimizeTiming: boolean
    optimizeFrequency: boolean
  }
  performance: {
    totalSent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    unsubscribed: number
    bounced: number
  }
  createdAt: string
  updatedAt: string
}

interface EmailStep {
  id: string
  order: number
  templateId: string
  delayDays: number
  delayHours: number
  sendTime?: string // HH:MM format
  condition?: {
    type: 'engagement' | 'reply' | 'click' | 'open' | 'custom'
    value: any
  }
  aiTiming?: {
    enabled: boolean
    bestTimeToSend?: string
    timezone?: string
  }
}

interface AutomationRule {
  id: string
  name: string
  description: string
  triggerType: 'lead_created' | 'status_change' | 'engagement' | 'website_visit' | 'email_interaction' | 'time_based'
  triggerConditions: Record<string, any>
  actions: AutomationAction[]
  isActive: boolean
  createdAt: string
}

interface AutomationAction {
  id: string
  type: 'send_email' | 'assign_lead' | 'update_status' | 'add_tag' | 'create_task' | 'trigger_campaign'
  configuration: Record<string, any>
  delayMinutes?: number
}

interface EmailAutomationSystemProps {
  companyId: string
  userId: string
  userRole: string
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
}

export function EmailAutomationSystem({ 
  companyId, 
  userId, 
  userRole, 
  leads, 
  onLeadUpdate 
}: EmailAutomationSystemProps) {
  // State management
  const [emailTemplates, setEmailTemplates] = useKV(`email-templates-${companyId}`, [] as EmailTemplate[])
  const [emailCampaigns, setEmailCampaigns] = useKV(`email-campaigns-${companyId}`, [] as EmailCampaign[])
  const [automationRules, setAutomationRules] = useKV(`automation-rules-${companyId}`, [] as AutomationRule[])
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false)
  const [campaignPerformance, setCampaignPerformance] = useKV(`campaign-performance-${companyId}`, {} as Record<string, any>)

  // Initialize with mock data
  useEffect(() => {
    if (emailTemplates.length === 0) {
      const mockTemplates: EmailTemplate[] = [
        {
          id: 'template-001',
          name: 'Welcome Sequence - Step 1',
          subject: 'Welcome to our community, {{firstName}}!',
          content: `Hi {{firstName}},

Thank you for your interest in our solutions! We're excited to help {{companyName}} achieve its goals.

Based on your profile, I believe our {{industry}} solutions could be a perfect fit for your needs.

Would you be available for a quick 15-minute call this week to discuss how we can help?

Best regards,
{{senderName}}`,
          templateType: 'welcome',
          variables: ['firstName', 'companyName', 'industry', 'senderName'],
          aiOptimized: true,
          openRate: 0.68,
          clickRate: 0.15,
          replyRate: 0.08
        },
        {
          id: 'template-002',
          name: 'Follow-up - Case Study Share',
          subject: 'How {{similarCompany}} increased efficiency by 40%',
          content: `Hi {{firstName}},

I thought you'd be interested in this case study about how {{similarCompany}}, a {{industry}} company similar to {{companyName}}, achieved remarkable results with our solution.

Key results:
• 40% increase in operational efficiency
• 25% reduction in costs
• 60% faster time-to-market

Would you like to see how we could deliver similar results for {{companyName}}?

I'd be happy to schedule a brief demo tailored to your specific needs.

Best regards,
{{senderName}}`,
          templateType: 'follow_up',
          variables: ['firstName', 'similarCompany', 'industry', 'companyName', 'senderName'],
          aiOptimized: true,
          openRate: 0.72,
          clickRate: 0.22,
          replyRate: 0.12
        },
        {
          id: 'template-003',
          name: 'Re-engagement Campaign',
          subject: 'We miss you, {{firstName}} - Special offer inside',
          content: `Hi {{firstName}},

It's been a while since we last connected about {{companyName}}'s needs.

I understand priorities can shift, but I wanted to reach out one more time because I truly believe our solution could make a significant impact on your {{specificNeed}}.

As a token of our continued interest in working with {{companyName}}, I'd like to offer you an exclusive 20% discount on our premium package.

This offer is valid until {{expiryDate}}. Would you be interested in a quick call to discuss this opportunity?

Best regards,
{{senderName}}

P.S. If you're no longer the right person for this conversation, please let me know who I should connect with.`,
          templateType: 'nurture',
          variables: ['firstName', 'companyName', 'specificNeed', 'expiryDate', 'senderName'],
          aiOptimized: false,
          openRate: 0.45,
          clickRate: 0.08,
          replyRate: 0.05
        }
      ]
      setEmailTemplates(mockTemplates)
    }

    if (emailCampaigns.length === 0) {
      const mockCampaigns: EmailCampaign[] = [
        {
          id: 'campaign-001',
          name: 'New Lead Welcome Series',
          description: 'Automated welcome sequence for new leads with personalized content',
          campaignType: 'welcome',
          status: 'active',
          targetCriteria: {
            leadStatus: ['new'],
            leadRating: ['hot', 'warm'],
            daysOld: { max: 7 }
          },
          emailSequence: [
            {
              id: 'step-001',
              order: 1,
              templateId: 'template-001',
              delayDays: 0,
              delayHours: 1,
              sendTime: '09:00',
              aiTiming: { enabled: true }
            },
            {
              id: 'step-002',
              order: 2,
              templateId: 'template-002',
              delayDays: 3,
              delayHours: 0,
              sendTime: '10:30',
              condition: {
                type: 'engagement',
                value: { opened: true, notReplied: true }
              },
              aiTiming: { enabled: true }
            }
          ],
          aiOptimization: {
            enabled: true,
            optimizeSubjects: true,
            optimizeContent: true,
            optimizeTiming: true,
            optimizeFrequency: true
          },
          performance: {
            totalSent: 1250,
            delivered: 1225,
            opened: 833,
            clicked: 187,
            replied: 94,
            unsubscribed: 12,
            bounced: 25
          },
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'campaign-002',
          name: 'Industry-Specific Nurture Campaign',
          description: 'Tailored nurturing for technology industry leads',
          campaignType: 'nurture',
          status: 'active',
          targetCriteria: {
            industry: ['Technology'],
            leadStatus: ['contacted', 'qualified'],
            engagementScore: { min: 30 }
          },
          emailSequence: [
            {
              id: 'step-003',
              order: 1,
              templateId: 'template-002',
              delayDays: 7,
              delayHours: 0,
              sendTime: '14:00',
              aiTiming: { enabled: true }
            }
          ],
          aiOptimization: {
            enabled: true,
            optimizeSubjects: true,
            optimizeContent: false,
            optimizeTiming: true,
            optimizeFrequency: false
          },
          performance: {
            totalSent: 450,
            delivered: 441,
            opened: 317,
            clicked: 89,
            replied: 32,
            unsubscribed: 8,
            bounced: 9
          },
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ]
      setEmailCampaigns(mockCampaigns)
    }

    if (automationRules.length === 0) {
      const mockRules: AutomationRule[] = [
        {
          id: 'rule-001',
          name: 'Hot Lead Immediate Response',
          description: 'Automatically send welcome email and assign to senior rep when hot lead is created',
          triggerType: 'lead_created',
          triggerConditions: {
            leadRating: 'hot',
            aiLeadScore: { min: 80 }
          },
          actions: [
            {
              id: 'action-001',
              type: 'send_email',
              configuration: {
                templateId: 'template-001',
                fromName: 'Senior Sales Representative',
                priority: 'high'
              },
              delayMinutes: 5
            },
            {
              id: 'action-002',
              type: 'assign_lead',
              configuration: {
                assignTo: 'senior-rep-001',
                reason: 'High-value lead - immediate attention required'
              },
              delayMinutes: 10
            },
            {
              id: 'action-003',
              type: 'add_tag',
              configuration: {
                tags: ['hot-lead-auto', 'priority-response']
              }
            }
          ],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
        },
        {
          id: 'rule-002',
          name: 'Email Engagement Follow-up',
          description: 'Send follow-up email when lead opens but doesn\'t reply within 48 hours',
          triggerType: 'email_interaction',
          triggerConditions: {
            interactionType: 'opened',
            noReplyHours: 48,
            campaignType: 'welcome'
          },
          actions: [
            {
              id: 'action-004',
              type: 'send_email',
              configuration: {
                templateId: 'template-002',
                subject: 'Following up on our previous conversation',
                personalizedContent: true
              },
              delayMinutes: 60
            }
          ],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        }
      ]
      setAutomationRules(mockRules)
    }
  }, [emailTemplates.length, emailCampaigns.length, automationRules.length, setEmailTemplates, setEmailCampaigns, setAutomationRules])

  // Campaign management functions
  const handleCreateCampaign = async (campaignData: Partial<EmailCampaign>) => {
    const newCampaign: EmailCampaign = {
      id: `campaign-${Date.now()}`,
      name: campaignData.name || 'New Campaign',
      description: campaignData.description || '',
      campaignType: campaignData.campaignType || 'nurture',
      status: 'draft',
      targetCriteria: campaignData.targetCriteria || {},
      emailSequence: [],
      aiOptimization: {
        enabled: true,
        optimizeSubjects: true,
        optimizeContent: true,
        optimizeTiming: true,
        optimizeFrequency: true
      },
      performance: {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        unsubscribed: 0,
        bounced: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setEmailCampaigns(prev => [...prev, newCampaign])
    toast.success('Campaign created successfully')
    setShowCampaignBuilder(false)
  }

  const handleUpdateCampaign = async (campaignId: string, updates: Partial<EmailCampaign>) => {
    setEmailCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
        : campaign
    ))
    toast.success('Campaign updated successfully')
  }

  const handleToggleCampaignStatus = async (campaignId: string) => {
    const campaign = emailCampaigns.find(c => c.id === campaignId)
    if (!campaign) return

    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    await handleUpdateCampaign(campaignId, { status: newStatus })
    toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
  }

  // Template management functions
  const handleCreateTemplate = async (templateData: Partial<EmailTemplate>) => {
    const newTemplate: EmailTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name || 'New Template',
      subject: templateData.subject || '',
      content: templateData.content || '',
      templateType: templateData.templateType || 'custom',
      variables: templateData.variables || [],
      aiOptimized: false,
      ...templateData
    }

    setEmailTemplates(prev => [...prev, newTemplate])
    toast.success('Template created successfully')
    setShowTemplateEditor(false)
  }

  const handleUpdateTemplate = async (templateId: string, updates: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates }
        : template
    ))
    toast.success('Template updated successfully')
  }

  // AI optimization functions
  const handleOptimizeTemplate = async (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (!template) return

    // Simulate AI optimization
    const optimizedSubject = await optimizeEmailSubject(template.subject)
    const optimizedContent = await optimizeEmailContent(template.content)

    await handleUpdateTemplate(templateId, {
      subject: optimizedSubject,
      content: optimizedContent,
      aiOptimized: true
    })
    
    toast.success('Template optimized with AI recommendations')
  }

  const handleOptimizeCampaignTiming = async (campaignId: string) => {
    const campaign = emailCampaigns.find(c => c.id === campaignId)
    if (!campaign) return

    // Simulate AI timing optimization
    const optimizedSequence = campaign.emailSequence.map(step => ({
      ...step,
      aiTiming: {
        enabled: true,
        bestTimeToSend: getBestSendTime(step.order),
        timezone: 'recipient'
      }
    }))

    await handleUpdateCampaign(campaignId, {
      emailSequence: optimizedSequence,
      aiOptimization: { ...campaign.aiOptimization, optimizeTiming: true }
    })

    toast.success('Campaign timing optimized using AI')
  }

  // Automation rule functions
  const handleCreateAutomationRule = async (ruleData: Partial<AutomationRule>) => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: ruleData.name || 'New Automation Rule',
      description: ruleData.description || '',
      triggerType: ruleData.triggerType || 'lead_created',
      triggerConditions: ruleData.triggerConditions || {},
      actions: ruleData.actions || [],
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setAutomationRules(prev => [...prev, newRule])
    toast.success('Automation rule created successfully')
    setShowAutomationBuilder(false)
  }

  const handleToggleAutomationRule = async (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ))
    toast.success('Automation rule toggled')
  }

  // Helper functions
  const optimizeEmailSubject = async (subject: string): Promise<string> => {
    // Simulate AI subject optimization
    const optimizations = [
      'Add personalization token',
      'Include urgency indicator',
      'Use action-oriented language',
      'Optimize for mobile preview'
    ]
    
    const selectedOptimization = optimizations[Math.floor(Math.random() * optimizations.length)]
    
    if (selectedOptimization === 'Add personalization token' && !subject.includes('{{')) {
      return `${subject} {{firstName}}`
    }
    if (selectedOptimization === 'Include urgency indicator') {
      return `⚡ ${subject}`
    }
    if (selectedOptimization === 'Use action-oriented language') {
      return subject.replace(/interested/g, 'ready to see results')
    }
    
    return subject
  }

  const optimizeEmailContent = async (content: string): Promise<string> => {
    // Simulate AI content optimization
    let optimized = content
    
    // Add social proof
    if (!optimized.includes('clients') && !optimized.includes('customers')) {
      optimized = optimized.replace(
        'Best regards,',
        'Join over 1,000+ satisfied customers who have transformed their business with our solution.\n\nBest regards,'
      )
    }
    
    // Improve call-to-action
    optimized = optimized.replace(
      'call to discuss',
      'quick 15-minute strategy session to explore how we can help'
    )
    
    return optimized
  }

  const getBestSendTime = (stepOrder: number): string => {
    // Simulate AI-determined best send times
    const times = ['09:00', '10:30', '14:00', '15:30']
    return times[stepOrder % times.length]
  }

  const calculateCampaignROI = (campaign: EmailCampaign): number => {
    const { performance } = campaign
    if (performance.totalSent === 0) return 0
    
    // Simulate ROI calculation
    const estimatedValuePerReply = 5000 // Average deal value
    const totalValue = performance.replied * estimatedValuePerReply
    const estimatedCost = performance.totalSent * 0.02 // $0.02 per email
    
    return totalValue > 0 ? ((totalValue - estimatedCost) / estimatedCost) * 100 : 0
  }

  // Statistics
  const totalCampaigns = emailCampaigns.length
  const activeCampaigns = emailCampaigns.filter(c => c.status === 'active').length
  const totalEmailsSent = emailCampaigns.reduce((sum, c) => sum + c.performance.totalSent, 0)
  const avgOpenRate = emailCampaigns.length > 0 
    ? emailCampaigns.reduce((sum, c) => sum + (c.performance.opened / Math.max(c.performance.delivered, 1)), 0) / emailCampaigns.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Automation</h2>
          <p className="text-muted-foreground">
            AI-powered email campaigns and automated nurturing workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateEditor(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            New Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAutomationBuilder(true)}
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            New Automation
          </Button>
          <Button
            onClick={() => setShowCampaignBuilder(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
              </div>
              <Mail className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
              </div>
              <Activity className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{totalEmailsSent.toLocaleString()}</p>
              </div>
              <Send className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(avgOpenRate * 100)}%</p>
              </div>
              <Eye className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailCampaigns.map((campaign) => (
              <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 
                                campaign.status === 'paused' ? 'secondary' : 'outline'}
                      >
                        {campaign.status}
                      </Badge>
                      {campaign.aiOptimization.enabled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Brain size={12} />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-semibold">{campaign.performance.totalSent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open Rate</p>
                      <p className="font-semibold">
                        {campaign.performance.delivered > 0 
                          ? Math.round((campaign.performance.opened / campaign.performance.delivered) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Click Rate</p>
                      <p className="font-semibold">
                        {campaign.performance.delivered > 0 
                          ? Math.round((campaign.performance.clicked / campaign.performance.delivered) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Replies</p>
                      <p className="font-semibold">{campaign.performance.replied}</p>
                    </div>
                  </div>

                  {/* ROI */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated ROI</span>
                      <span className="font-semibold text-green-600">
                        {calculateCampaignROI(campaign).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={campaign.status === 'active' ? 'outline' : 'default'}
                      onClick={() => handleToggleCampaignStatus(campaign.id)}
                      className="flex items-center gap-1"
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause size={14} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCampaign(campaign)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </Button>
                    {campaign.aiOptimization.enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOptimizeCampaignTiming(campaign.id)}
                        className="flex items-center gap-1"
                      >
                        <Sparkle size={14} />
                        Optimize
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{template.templateType}</Badge>
                      {template.aiOptimized && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Brain size={12} />
                          AI Optimized
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.subject}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  {template.openRate && (
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Open Rate</p>
                        <p className="font-semibold">{Math.round(template.openRate * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Click Rate</p>
                        <p className="font-semibold">{Math.round((template.clickRate || 0) * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reply Rate</p>
                        <p className="font-semibold">{Math.round((template.replyRate || 0) * 100)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Variables */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    {!template.aiOptimized && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOptimizeTemplate(template.id)}
                        className="flex items-center gap-1"
                      >
                        <Lightbulb size={14} />
                        Optimize
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggleAutomationRule(rule.id)}
                        />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div>
                      <Label className="text-sm font-medium">Trigger</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          When <Badge variant="outline">{rule.triggerType.replace('_', ' ')}</Badge>
                          {Object.entries(rule.triggerConditions).map(([key, value], index) => (
                            <span key={index} className="ml-2">
                              {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <Label className="text-sm font-medium">Actions</Label>
                      <div className="mt-1 space-y-2">
                        {rule.actions.map((action, index) => (
                          <div key={action.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {index + 1}. {action.type.replace('_', ' ')}
                              </span>
                              {action.delayMinutes && (
                                <Badge variant="outline" className="text-xs">
                                  Delay: {action.delayMinutes}m
                                </Badge>
                              )}
                            </div>
                            {Object.keys(action.configuration).length > 0 && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {Object.entries(action.configuration).map(([key, value]) => (
                                  <div key={key}>{key}: {String(value)}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailCampaigns.map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{campaign.name}</span>
                        <span>{Math.round((campaign.performance.opened / Math.max(campaign.performance.delivered, 1)) * 100)}%</span>
                      </div>
                      <Progress value={(campaign.performance.opened / Math.max(campaign.performance.delivered, 1)) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Optimization Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-purple-500" size={20} />
                  AI Optimization Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendUp className="text-blue-600" size={16} />
                      <span className="font-medium text-blue-800">Subject Line Optimization</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Templates with personalized subject lines show 23% higher open rates
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-green-600" size={16} />
                      <span className="font-medium text-green-800">Optimal Send Times</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Best engagement occurs at 10:30 AM and 2:00 PM in recipient timezone
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="text-yellow-600" size={16} />
                      <span className="font-medium text-yellow-800">Audience Segmentation</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Technology industry leads respond 40% better to technical content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Builder Modal */}
      <Dialog open={showCampaignBuilder} onOpenChange={setShowCampaignBuilder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input id="campaign-name" placeholder="Enter campaign name" />
            </div>
            <div>
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea id="campaign-description" placeholder="Describe the campaign purpose" />
            </div>
            <div>
              <Label htmlFor="campaign-type">Campaign Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Series</SelectItem>
                  <SelectItem value="nurture">Nurture Campaign</SelectItem>
                  <SelectItem value="drip">Drip Campaign</SelectItem>
                  <SelectItem value="behavioral">Behavioral Triggers</SelectItem>
                  <SelectItem value="reengagement">Re-engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCampaignBuilder(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateCampaign({ name: 'New Campaign' })}>
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Editor Modal */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" placeholder="Enter template name" />
            </div>
            <div>
              <Label htmlFor="template-subject">Subject Line</Label>
              <Input id="template-subject" placeholder="Enter email subject" />
            </div>
            <div>
              <Label htmlFor="template-content">Email Content</Label>
              <Textarea 
                id="template-content" 
                placeholder="Enter email content with {{variables}}" 
                rows={8}
              />
            </div>
            <div>
              <Label htmlFor="template-type">Template Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateEditor(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateTemplate({ name: 'New Template' })}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}