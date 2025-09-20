import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  GoogleLogo, 
  MicrosoftOutlookLogo,
  EnvelopeSimple as Mail,
  EnvelopeOpen,
  Eye,
  Mouse,
  Clock,
  Lightning,
  Robot,
  Link,
  Check,
  Warning,
  ArrowRight,
  Play,
  Pause,
  Plus,
  Trash,
  Gear,
  ChartLine,
  UserPlus,
  Template,
  FileText,
  PaperPlaneTilt as Send
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EmailProvider {
  id: string
  name: string
  type: 'gmail' | 'outlook' | 'imap'
  icon: React.ReactNode
  connected: boolean
  lastSync?: Date
  settings: {
    serverUrl?: string
    port?: number
    username?: string
    useSSL?: boolean
    accessToken?: string
  }
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  type: 'lead_followup' | 'deal_update' | 'meeting_invite' | 'custom'
  aiOptimized: boolean
  openRate?: number
  clickRate?: number
}

interface EmailActivity {
  id: string
  threadId: string
  messageId: string
  subject: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  content: string
  contentType: 'text' | 'html'
  timestamp: Date
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  leadId?: string
  contactId?: string
  dealId?: string
  attachments: Array<{
    name: string
    size: number
    type: string
    url: string
  }>
  tracking: {
    opens: number
    clicks: number
    lastOpened?: Date
    lastClicked?: Date
    userAgent?: string
    location?: string
  }
}

interface EmailComposerProps {
  companyId: string
  userId: string
  leadId?: string
  contactId?: string
  dealId?: string
  templateId?: string
  onSent?: (emailId: string) => void
  onClose?: () => void
}

interface EmailIntegrationSystemProps {
  companyId: string
  userId: string
  userRole: string
}

export function EmailIntegrationSystem({ companyId, userId, userRole }: EmailIntegrationSystemProps) {
  const [providers, setProviders] = useKV<EmailProvider[]>(`email-providers-${companyId}`, [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>(`email-templates-${companyId}`, [])
  const [activities, setActivities] = useKV<EmailActivity[]>(`email-activities-${companyId}`, [])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

  // Initialize default providers
  useEffect(() => {
    if (providers.length === 0) {
      const defaultProviders: EmailProvider[] = [
        {
          id: 'gmail',
          name: 'Gmail',
          type: 'gmail',
          icon: <GoogleLogo size={20} />,
          connected: false,
          settings: {}
        },
        {
          id: 'outlook',
          name: 'Microsoft Outlook',
          type: 'outlook',
          icon: <MicrosoftOutlookLogo size={20} />,
          connected: false,
          settings: {}
        },
        {
          id: 'imap',
          name: 'IMAP/SMTP',
          type: 'imap',
          icon: <Mail size={20} />,
          connected: false,
          settings: {
            serverUrl: '',
            port: 993,
            useSSL: true
          }
        }
      ]
      setProviders(defaultProviders)
    }
  }, [providers, setProviders])

  // Initialize default templates
  useEffect(() => {
    if (templates.length === 0) {
      const defaultTemplates: EmailTemplate[] = [
        {
          id: 'lead-welcome',
          name: 'Lead Welcome',
          subject: 'Welcome {{firstName}}, let\'s connect!',
          content: `Hi {{firstName}},

Thank you for your interest in {{companyName}}. I'm excited to learn more about your needs and see how we can help.

I'll be reaching out soon to schedule a brief call to discuss your requirements.

Best regards,
{{senderName}}
{{senderTitle}}
{{companyName}}`,
          variables: ['firstName', 'companyName', 'senderName', 'senderTitle'],
          type: 'lead_followup',
          aiOptimized: false,
          openRate: 75,
          clickRate: 12
        },
        {
          id: 'meeting-follow-up',
          name: 'Meeting Follow-up',
          subject: 'Great meeting you, {{firstName}}',
          content: `Hi {{firstName}},

It was great meeting with you today. As discussed, I'm attaching the proposal for your review.

Next steps:
- Review the attached proposal
- Schedule a follow-up call for next week
- Connect with your technical team

Please let me know if you have any questions.

Best regards,
{{senderName}}`,
          variables: ['firstName', 'senderName'],
          type: 'deal_update',
          aiOptimized: true,
          openRate: 82,
          clickRate: 24
        }
      ]
      setTemplates(defaultTemplates)
    }
  }, [templates, setTemplates])

  const handleProviderConnect = async (providerId: string) => {
    setSyncInProgress(true)
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, connected: true, lastSync: new Date() }
          : p
      ))
      
      toast.success(`Connected to ${providers.find(p => p.id === providerId)?.name}`)
      
      // Start initial sync
      await handleEmailSync(providerId)
    } catch (error) {
      toast.error('Failed to connect email provider')
    } finally {
      setSyncInProgress(false)
    }
  }

  const handleEmailSync = async (providerId: string) => {
    setSyncInProgress(true)
    
    try {
      // Simulate email sync
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock email activities
      const mockEmails: EmailActivity[] = [
        {
          id: `email-${Date.now()}-1`,
          threadId: `thread-${Date.now()}`,
          messageId: `msg-${Date.now()}`,
          subject: 'Re: Follow-up on our discussion',
          from: 'customer@example.com',
          to: ['sales@company.com'],
          content: 'Thank you for the proposal. I have a few questions...',
          contentType: 'text',
          timestamp: new Date(),
          direction: 'inbound',
          status: 'delivered',
          leadId: 'lead-001',
          attachments: [],
          tracking: {
            opens: 1,
            clicks: 0
          }
        },
        {
          id: `email-${Date.now()}-2`,
          threadId: `thread-${Date.now()}`,
          messageId: `msg-${Date.now()}`,
          subject: 'Proposal for your review',
          from: 'sales@company.com',
          to: ['customer@example.com'],
          content: 'Please find attached our proposal for your consideration.',
          contentType: 'html',
          timestamp: new Date(Date.now() - 3600000),
          direction: 'outbound',
          status: 'opened',
          leadId: 'lead-001',
          attachments: [
            {
              name: 'proposal.pdf',
              size: 2048000,
              type: 'application/pdf',
              url: '/attachments/proposal.pdf'
            }
          ],
          tracking: {
            opens: 3,
            clicks: 1,
            lastOpened: new Date(Date.now() - 1800000)
          }
        }
      ]
      
      setActivities(prev => [...mockEmails, ...prev])
      
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, lastSync: new Date() }
          : p
      ))
      
      toast.success(`Synced ${mockEmails.length} emails`)
    } catch (error) {
      toast.error('Email sync failed')
    } finally {
      setSyncInProgress(false)
    }
  }

  const handleAITemplateOptimization = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    try {
      // Simulate AI optimization
      const prompt = spark.llmPrompt`Optimize this email template for better open rates and click-through rates:
      
Subject: ${template.subject}
Content: ${template.content}

Please provide an improved version that:
1. Has a more compelling subject line
2. Uses better copywriting techniques
3. Includes a clear call-to-action
4. Maintains professionalism

Return the result as JSON with "subject" and "content" fields.`
      
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const optimized = JSON.parse(result)
      
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { 
              ...t, 
              subject: optimized.subject,
              content: optimized.content,
              aiOptimized: true 
            }
          : t
      ))
      
      toast.success('Template optimized with AI suggestions')
    } catch (error) {
      toast.error('Failed to optimize template')
    }
  }

  const getEmailStats = () => {
    const totalSent = activities.filter(a => a.direction === 'outbound').length
    const totalReceived = activities.filter(a => a.direction === 'inbound').length
    const totalOpens = activities.reduce((sum, a) => sum + a.tracking.opens, 0)
    const totalClicks = activities.reduce((sum, a) => sum + a.tracking.clicks, 0)
    
    return {
      sent: totalSent,
      received: totalReceived,
      openRate: totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0',
      clickRate: totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0'
    }
  }

  const stats = getEmailStats()
  const connectedProviders = providers.filter(p => p.connected)

  return (
    <div className="space-y-6">
      {/* Email Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
              <Send size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Received</p>
                <p className="text-2xl font-bold">{stats.received}</p>
              </div>
              <Mail size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{stats.openRate}%</p>
              </div>
              <EnvelopeOpen size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{stats.clickRate}%</p>
              </div>
              <Mouse size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Email Providers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activities">Email Activity</TabsTrigger>
          <TabsTrigger value="composer">Compose Email</TabsTrigger>
          <TabsTrigger value="tracking">Tracking & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Provider Connections</CardTitle>
                <CardDescription>
                  Connect your email accounts for seamless CRM integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {provider.icon}
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {provider.connected 
                            ? `Last synced: ${provider.lastSync?.toLocaleString() || 'Never'}`
                            : 'Not connected'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.connected && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEmailSync(provider.id)}
                            disabled={syncInProgress}
                          >
                            {syncInProgress ? <Lightning className="animate-spin" size={14} /> : 'Sync'}
                          </Button>
                          <Badge variant="outline" className="text-green-600">
                            Connected
                          </Badge>
                        </>
                      )}
                      {!provider.connected && (
                        <Button
                          size="sm"
                          onClick={() => handleProviderConnect(provider.id)}
                          disabled={syncInProgress}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-sync Settings</CardTitle>
                <CardDescription>
                  Configure automatic email synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-sync">Enable Auto-sync</Label>
                  <Switch id="auto-sync" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Sync Interval</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smart-matching">AI Smart Matching</Label>
                  <Switch id="smart-matching" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="track-opens">Track Email Opens</Label>
                  <Switch id="track-opens" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="track-clicks">Track Link Clicks</Label>
                  <Switch id="track-clicks" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <p className="text-sm text-muted-foreground">
                Manage reusable email templates with AI optimization
              </p>
            </div>
            <Button onClick={() => {
              setSelectedTemplate(null)
              setShowTemplateEditor(true)
            }}>
              <Plus size={16} className="mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.aiOptimized && (
                        <Badge variant="outline" className="text-purple-600">
                          <Robot size={12} className="mr-1" />
                          AI Optimized
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {template.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {template.openRate && (
                        <div>
                          <span className="text-muted-foreground">Open Rate:</span>
                          <span className="ml-1 font-medium">{template.openRate}%</span>
                        </div>
                      )}
                      {template.clickRate && (
                        <div>
                          <span className="text-muted-foreground">Click Rate:</span>
                          <span className="ml-1 font-medium">{template.clickRate}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Variables:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowTemplateEditor(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAITemplateOptimization(template.id)}
                        disabled={template.aiOptimized}
                      >
                        <Robot size={14} className="mr-1" />
                        AI Optimize
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowComposer(true)
                          // Set template in composer
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>
                Monitor all email interactions with leads and contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No email activity yet</p>
                    <p className="text-sm">Connect an email provider to start tracking</p>
                  </div>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.direction === 'inbound' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.direction === 'inbound' ? <Mail size={16} /> : <Send size={16} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{activity.subject}</h4>
                          <Badge variant="outline" className={
                            activity.status === 'opened' ? 'text-green-600' :
                            activity.status === 'clicked' ? 'text-purple-600' :
                            activity.status === 'bounced' ? 'text-red-600' : ''
                          }>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.direction === 'inbound' ? 'From' : 'To'}: {
                            activity.direction === 'inbound' ? activity.from : activity.to.join(', ')
                          }
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{activity.timestamp.toLocaleString()}</span>
                          {activity.tracking.opens > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {activity.tracking.opens} opens
                            </span>
                          )}
                          {activity.tracking.clicks > 0 && (
                            <span className="flex items-center gap-1">
                              <Mouse size={12} />
                              {activity.tracking.clicks} clicks
                            </span>
                          )}
                          {activity.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {activity.attachments.length} attachments
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        View Thread
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composer" className="space-y-6">
          <EmailComposer
            companyId={companyId}
            userId={userId}
            onSent={(emailId) => {
              toast.success('Email sent successfully')
              // Refresh activities
            }}
          />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance Analytics</CardTitle>
                <CardDescription>
                  Track email engagement and optimize your communication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Open Rate</span>
                    <span>{stats.openRate}%</span>
                  </div>
                  <Progress value={parseFloat(stats.openRate)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Click Rate</span>
                    <span>{stats.clickRate}%</span>
                  </div>
                  <Progress value={parseFloat(stats.clickRate)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Rate</span>
                    <span>18.5%</span>
                  </div>
                  <Progress value={18.5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  AI-powered recommendations for better email performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Robot size={16} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Best Send Time</h4>
                      <p className="text-xs text-muted-foreground">
                        Tuesday 10:00 AM shows 23% higher open rates
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Robot size={16} className="text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Subject Line Optimization</h4>
                      <p className="text-xs text-muted-foreground">
                        Questions in subject lines increase opens by 15%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Robot size={16} className="text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Personalization Impact</h4>
                      <p className="text-xs text-muted-foreground">
                        Adding company name increases click rates by 31%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <TemplateEditor
            template={selectedTemplate}
            onSave={(template) => {
              if (selectedTemplate) {
                setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
              } else {
                setTemplates(prev => [...prev, { ...template, id: `template-${Date.now()}` }])
              }
              setShowTemplateEditor(false)
              toast.success('Template saved successfully')
            }}
            onCancel={() => setShowTemplateEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Email Composer Component
function EmailComposer({ companyId, userId, leadId, contactId, dealId, templateId, onSent, onClose }: EmailComposerProps) {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [trackOpens, setTrackOpens] = useState(true)
  const [trackClicks, setTrackClicks] = useState(true)
  const [scheduleSend, setScheduleSend] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')

  const handleSend = async () => {
    if (!to || !subject || !content) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const emailId = `email-${Date.now()}`
      
      toast.success('Email sent successfully')
      onSent?.(emailId)
    } catch (error) {
      toast.error('Failed to send email')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
        <CardDescription>
          Create and send personalized emails with tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                <SelectItem value="lead-welcome">Lead Welcome</SelectItem>
                <SelectItem value="meeting-follow-up">Meeting Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bcc">BCC</Label>
            <Input
              id="bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Email content..."
            rows={8}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="track-opens"
              checked={trackOpens}
              onCheckedChange={setTrackOpens}
            />
            <Label htmlFor="track-opens">Track Opens</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="track-clicks"
              checked={trackClicks}
              onCheckedChange={setTrackClicks}
            />
            <Label htmlFor="track-clicks">Track Clicks</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="schedule-send"
              checked={scheduleSend}
              onCheckedChange={setScheduleSend}
            />
            <Label htmlFor="schedule-send">Schedule Send</Label>
          </div>
        </div>

        {scheduleSend && (
          <div className="space-y-2">
            <Label htmlFor="schedule-time">Send Time</Label>
            <Input
              id="schedule-time"
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSend} className="flex-1">
            <Send size={16} className="mr-2" />
            {scheduleSend ? 'Schedule Email' : 'Send Email'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Template Editor Component
function TemplateEditor({ template, onSave, onCancel }: {
  template: EmailTemplate | null
  onSave: (template: EmailTemplate) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(template?.name || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [content, setContent] = useState(template?.content || '')
  const [type, setType] = useState<EmailTemplate['type']>(template?.type || 'custom')

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g)
    return matches ? matches.map(match => match.slice(2, -2)) : []
  }

  const variables = [...new Set([
    ...extractVariables(subject),
    ...extractVariables(content)
  ])]

  const handleSave = () => {
    if (!name || !subject || !content) {
      toast.error('Please fill in all required fields')
      return
    }

    const newTemplate: EmailTemplate = {
      id: template?.id || '',
      name,
      subject,
      content,
      variables,
      type,
      aiOptimized: false
    }

    onSave(newTemplate)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name *</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-type">Type</Label>
          <Select value={type} onValueChange={(value: EmailTemplate['type']) => setType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead_followup">Lead Follow-up</SelectItem>
              <SelectItem value="deal_update">Deal Update</SelectItem>
              <SelectItem value="meeting_invite">Meeting Invite</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-subject">Subject Line *</Label>
        <Input
          id="template-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject with {{variables}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-content">Content *</Label>
        <Textarea
          id="template-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Email content with {{variables}}..."
          rows={10}
        />
      </div>

      {variables.length > 0 && (
        <div className="space-y-2">
          <Label>Detected Variables</Label>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <Badge key={variable} variant="secondary">
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          Save Template
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}