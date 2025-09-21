import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClickableDataElement } from '@/components/shared/ClickableDataElement'
import { 
  EnvelopeSimple as Mail,
  PaperPlaneRight as Send,
  Reply,
  ReplyAll,
  ArrowClockwise as Forward,
  Archive,
  Star,
  StarFill,
  Tag,
  Paperclip,
  Plus,
  MagnifyingGlass as Search
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface EmailThread {
  id: string
  subject: string
  participants: string[]
  messages: EmailMessage[]
  labels: string[]
  isStarred: boolean
  lastActivity: string
  status: 'active' | 'archived'
}

interface EmailMessage {
  id: string
  threadId: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  isHtml: boolean
  sentAt: string
  isRead: boolean
  isOutbound: boolean
  attachments?: EmailAttachment[]
  trackingData?: {
    opened: boolean
    openedAt?: string
    clicked: boolean
    clickedAt?: string
    replied: boolean
    repliedAt?: string
  }
}

interface EmailAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'follow_up' | 'introduction' | 'proposal' | 'thank_you' | 'meeting' | 'custom'
  isActive: boolean
  variables: string[]
}

interface AccountEmailIntegrationProps {
  accountId: string
  companyId: string
  userId: string
  userRole: string
}

export function AccountEmailIntegration({
  accountId,
  companyId,
  userId,
  userRole
}: AccountEmailIntegrationProps) {
  const [emailThreads, setEmailThreads] = useKV<EmailThread[]>(`account-emails-${accountId}`, [])
  const [templates, setTemplates] = useKV<EmailTemplate[]>(`email-templates-${companyId}`, [])
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLabel, setFilterLabel] = useState('all')
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    templateId: '',
    trackOpens: true,
    trackClicks: true
  })

  // Generate mock email data on first load
  useEffect(() => {
    if (emailThreads.length === 0) {
      const mockThreads = generateMockEmailThreads(accountId)
      setEmailThreads(mockThreads)
    }
    if (templates.length === 0) {
      const mockTemplates = generateMockTemplates()
      setTemplates(mockTemplates)
    }
  }, [accountId, emailThreads.length, templates.length, setEmailThreads, setTemplates])

  const generateMockEmailThreads = (accountId: string): EmailThread[] => {
    const subjects = [
      'Project Discussion and Next Steps',
      'Quote Request for Q1 Services',
      'Meeting Follow-up and Action Items',
      'Product Demo Feedback',
      'Contract Renewal Discussion',
      'Technical Implementation Questions',
      'Quarterly Business Review Preparation'
    ]

    return subjects.map((subject, i) => ({
      id: `thread_${accountId}_${i}`,
      subject,
      participants: ['john@example.com', 'sarah@client.com', 'mike@company.com'],
      messages: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
        id: `msg_${i}_${j}`,
        threadId: `thread_${accountId}_${i}`,
        from: j % 2 === 0 ? 'john@example.com' : 'sarah@client.com',
        to: [j % 2 === 0 ? 'sarah@client.com' : 'john@example.com'],
        subject: j === 0 ? subject : `Re: ${subject}`,
        body: `This is email message ${j + 1} in the thread about ${subject.toLowerCase()}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        isHtml: false,
        sentAt: new Date(Date.now() - (5 - j) * 24 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.3,
        isOutbound: j % 2 === 0,
        trackingData: {
          opened: Math.random() > 0.2,
          openedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
          clicked: Math.random() > 0.7,
          replied: j < 3 && Math.random() > 0.6
        }
      })),
      labels: ['Important', 'Client', 'Project'].slice(0, Math.floor(Math.random() * 3) + 1),
      isStarred: Math.random() > 0.7,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }))
  }

  const generateMockTemplates = (): EmailTemplate[] => {
    return [
      {
        id: 'tpl_follow_up',
        name: 'Follow-up After Meeting',
        subject: 'Thank you for your time - Next Steps',
        body: `Hi {{contact_name}},

Thank you for taking the time to meet with us today. I wanted to follow up on our discussion about {{topic}}.

As discussed, here are the next steps:
- {{next_step_1}}
- {{next_step_2}}
- {{next_step_3}}

Please let me know if you have any questions or if there's anything else I can help you with.

Best regards,
{{sender_name}}`,
        category: 'follow_up',
        isActive: true,
        variables: ['contact_name', 'topic', 'next_step_1', 'next_step_2', 'next_step_3', 'sender_name']
      },
      {
        id: 'tpl_introduction',
        name: 'New Contact Introduction',
        subject: 'Introduction - {{company_name}}',
        body: `Hello {{contact_name}},

I hope this email finds you well. My name is {{sender_name}} and I'm reaching out from {{company_name}}.

{{introduction_message}}

I'd love to schedule a brief call to discuss how we might be able to help {{client_company}} achieve {{goal}}.

Would you be available for a 15-minute call next week?

Best regards,
{{sender_name}}`,
        category: 'introduction',
        isActive: true,
        variables: ['contact_name', 'company_name', 'sender_name', 'introduction_message', 'client_company', 'goal']
      },
      {
        id: 'tpl_proposal',
        name: 'Proposal Submission',
        subject: 'Proposal for {{project_name}} - {{company_name}}',
        body: `Dear {{contact_name}},

I'm pleased to attach our proposal for {{project_name}}. 

The proposal includes:
- Detailed scope of work
- Timeline and milestones
- Investment details
- Terms and conditions

We're excited about the opportunity to work with {{client_company}} and help you achieve {{objective}}.

Please review the proposal and let me know if you have any questions. I'm available to discuss any aspects in detail.

Looking forward to your feedback.

Best regards,
{{sender_name}}`,
        category: 'proposal',
        isActive: true,
        variables: ['contact_name', 'project_name', 'company_name', 'client_company', 'objective', 'sender_name']
      }
    ]
  }

  const filteredThreads = emailThreads.filter(thread => {
    const matchesSearch = searchTerm === '' || 
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLabel = filterLabel === 'all' || 
      (filterLabel === 'starred' && thread.isStarred) ||
      thread.labels.includes(filterLabel)

    return matchesSearch && matchesLabel
  })

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
      toast.error('Please fill in all required fields')
      return
    }

    const newMessage: EmailMessage = {
      id: `msg_${Date.now()}`,
      threadId: `thread_${Date.now()}`,
      from: `${userId}@company.com`,
      to: composeData.to.split(',').map(email => email.trim()),
      cc: composeData.cc ? composeData.cc.split(',').map(email => email.trim()) : undefined,
      bcc: composeData.bcc ? composeData.bcc.split(',').map(email => email.trim()) : undefined,
      subject: composeData.subject,
      body: composeData.body,
      isHtml: false,
      sentAt: new Date().toISOString(),
      isRead: true,
      isOutbound: true,
      trackingData: {
        opened: false,
        clicked: false,
        replied: false
      }
    }

    const newThread: EmailThread = {
      id: newMessage.threadId,
      subject: composeData.subject,
      participants: [newMessage.from, ...newMessage.to],
      messages: [newMessage],
      labels: [],
      isStarred: false,
      lastActivity: newMessage.sentAt,
      status: 'active'
    }

    setEmailThreads([newThread, ...emailThreads])
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      templateId: '',
      trackOpens: true,
      trackClicks: true
    })
    setShowCompose(false)
    toast.success('Email sent successfully')
  }

  const handleReply = (thread: EmailThread, message: EmailMessage) => {
    setComposeData({
      ...composeData,
      to: message.from,
      subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${message.from}\nSent: ${format(new Date(message.sentAt), 'PPpp')}\nSubject: ${message.subject}\n\n${message.body}`
    })
    setShowCompose(true)
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setComposeData({
        ...composeData,
        subject: template.subject,
        body: template.body,
        templateId
      })
    }
  }

  const toggleThreadStar = (threadId: string) => {
    setEmailThreads(emailThreads.map(thread =>
      thread.id === threadId
        ? { ...thread, isStarred: !thread.isStarred }
        : thread
    ))
  }

  const getUnreadCount = (thread: EmailThread) => {
    return thread.messages.filter(m => !m.isRead && !m.isOutbound).length
  }

  const formatEmailDate = (date: string) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm')
    } else if (diffInHours < 7 * 24) {
      return format(messageDate, 'EEE')
    } else {
      return format(messageDate, 'MMM dd')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail size={20} />
            Email Integration
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete email history with tracking and template management
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Compose Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLabel} onValueChange={setFilterLabel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="Important">Important</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thread List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredThreads.map((thread) => (
                <Card
                  key={thread.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedThread?.id === thread.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleThreadStar(thread.id)
                            }}
                          >
                            {thread.isStarred ? (
                              <StarFill className="text-yellow-500" size={12} />
                            ) : (
                              <Star size={12} />
                            )}
                          </Button>
                          <ClickableDataElement
                            type="email_thread"
                            value={thread.subject}
                            data={thread}
                            className="font-medium truncate hover:text-primary"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {thread.participants.slice(0, 2).join(', ')}
                          {thread.participants.length > 2 && ` +${thread.participants.length - 2}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {formatEmailDate(thread.lastActivity)}
                        </span>
                        {getUnreadCount(thread) > 0 && (
                          <Badge variant="default" className="text-xs h-4">
                            {getUnreadCount(thread)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {thread.labels.slice(0, 2).map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {thread.labels.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{thread.labels.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedThread.subject}</CardTitle>
                    <CardDescription>
                      {selectedThread.messages.length} messages • {selectedThread.participants.join(', ')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Archive size={16} className="mr-2" />
                      Archive
                    </Button>
                    <Button variant="outline" size="sm">
                      <Tag size={16} className="mr-2" />
                      Label
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {selectedThread.messages.map((message) => (
                      <Card key={message.id} className={message.isOutbound ? 'bg-blue-50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">
                                <ClickableDataElement
                                  type="email"
                                  value={message.from}
                                  data={message}
                                  className="hover:text-primary"
                                />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                To: {message.to.map(email => (
                                  <ClickableDataElement
                                    key={email}
                                    type="email"
                                    value={email}
                                    data={message}
                                    className="hover:text-primary"
                                  />
                                )).reduce((prev, curr) => [prev, ', ', curr])}
                              </div>
                              {message.cc && message.cc.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  CC: {message.cc.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(message.sentAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                              {message.trackingData && (
                                <div className="flex gap-1 mt-1">
                                  {message.trackingData.opened && (
                                    <Badge variant="outline" className="text-xs">
                                      Opened
                                    </Badge>
                                  )}
                                  {message.trackingData.clicked && (
                                    <Badge variant="outline" className="text-xs">
                                      Clicked
                                    </Badge>
                                  )}
                                  {message.trackingData.replied && (
                                    <Badge variant="outline" className="text-xs">
                                      Replied
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="whitespace-pre-wrap text-sm mb-3">
                            {message.body}
                          </div>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="border-t pt-2">
                              <div className="text-sm font-medium mb-2">Attachments:</div>
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 text-sm">
                                  <Paperclip size={14} />
                                  <ClickableDataElement
                                    type="document"
                                    value={attachment.name}
                                    data={attachment}
                                    className="hover:text-primary"
                                  />
                                  <span className="text-muted-foreground">
                                    ({(attachment.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReply(selectedThread, message)}
                            >
                              <Reply size={14} className="mr-2" />
                              Reply
                            </Button>
                            <Button variant="outline" size="sm">
                              <ReplyAll size={14} className="mr-2" />
                              Reply All
                            </Button>
                            <Button variant="outline" size="sm">
                              <Forward size={14} className="mr-2" />
                              Forward
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Select an Email Thread
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose an email thread from the list to view the conversation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Email Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="text-sm font-medium">Email Template (Optional)</label>
              <Select value={composeData.templateId} onValueChange={handleApplyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">To *</label>
                <Input
                  placeholder="recipient@example.com"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">CC</label>
                  <Input
                    placeholder="cc@example.com"
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">BCC</label>
                  <Input
                    placeholder="bcc@example.com"
                    value={composeData.bcc}
                    onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  placeholder="Email subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message *</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={12}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={composeData.trackOpens}
                    onChange={(e) => setComposeData({ ...composeData, trackOpens: e.target.checked })}
                  />
                  Track opens
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={composeData.trackClicks}
                    onChange={(e) => setComposeData({ ...composeData, trackClicks: e.target.checked })}
                  />
                  Track clicks
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>
                  <Send size={16} className="mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}