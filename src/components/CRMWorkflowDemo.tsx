import React, { useState, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Phone, 
  EnvelopeSimple as Mail, 
  MapPin, 
  Buildings, 
  Calendar as CalendarIcon,
  Globe,
  LinkedinLogo,
  CurrencyDollar,
  Tag,
  Clock,
  TrendUp,
  Target,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Eye,
  Activity,
  Timer,
  PencilSimple,
  Copy,
  Download,
  Share,
  PhoneCall,
  VideoCamera,
  Handshake,
  FileText,
  ChartBar,
  Users,
  Briefcase,
  Bank,
  CaretRight,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'

interface CRMWorkflowDemoProps {
  companyId: string
  userId: string
}

interface DemoLead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  value: string
  score: number
  source: string
  lastContact: string
  nextFollowUp: string
  tags: string[]
  address: string
  website: string
  linkedin: string
}

interface DemoDeal {
  id: string
  title: string
  account: string
  contact: string
  value: string
  stage: string
  probability: number
  closeDate: string
  owner: string
}

interface InteractionLog {
  id: string
  action: string
  element: string
  timestamp: Date
  timeToAction: number
  workflowStep: string
}

export function CRMWorkflowDemo({ companyId, userId }: CRMWorkflowDemoProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string>('lead-qualification')
  const [workflowStep, setWorkflowStep] = useState<number>(0)
  const [isRecording, setIsRecording] = useState(false)
  const [workflowStartTime, setWorkflowStartTime] = useState<Date | null>(null)
  const [interactionLogs, setInteractionLogs] = useKV('crm-interaction-logs', [] as InteractionLog[])
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const stepStartTimeRef = useRef<Date | null>(null)

  // Demo data
  const demoLeads: DemoLead[] = [
    {
      id: 'lead-001',
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      value: '$125,000',
      score: 87,
      source: 'Website Form',
      lastContact: '2024-01-15',
      nextFollowUp: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      tags: ['Hot Lead', 'Enterprise', 'Decision Maker'],
      address: '123 Innovation Drive, San Francisco, CA 94107',
      website: 'https://techcorp.com',
      linkedin: 'linkedin.com/in/sarahjohnson'
    },
    {
      id: 'lead-002',
      name: 'Michael Chen',
      company: 'InnovateTech Industries',
      email: 'michael.chen@innovatetech.com',
      phone: '+1 (555) 987-6543',
      value: '$250,000',
      score: 92,
      source: 'Trade Show',
      lastContact: '2024-01-10',
      nextFollowUp: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      tags: ['Qualified', 'Manufacturing', 'Budget Approved'],
      address: '456 Tech Park, Austin, TX 78701',
      website: 'https://innovatetech.com',
      linkedin: 'linkedin.com/in/michaelchen'
    }
  ]

  const demoDeals: DemoDeal[] = [
    {
      id: 'deal-001',
      title: 'Enterprise Software License',
      account: 'TechCorp Solutions',
      contact: 'Sarah Johnson',
      value: '$125,000',
      stage: 'Proposal',
      probability: 75,
      closeDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      owner: 'Alex Rodriguez'
    },
    {
      id: 'deal-002',
      title: 'Manufacturing Integration Platform',
      account: 'InnovateTech Industries',
      contact: 'Michael Chen',
      value: '$250,000',
      stage: 'Negotiation',
      probability: 85,
      closeDate: format(addDays(new Date(), 45), 'yyyy-MM-dd'),
      owner: 'Jennifer Liu'
    }
  ]

  const workflows = [
    {
      id: 'lead-qualification',
      name: 'Lead Qualification Workflow',
      description: 'Quickly qualify a lead using clickable data elements',
      steps: [
        'Click lead name to view profile',
        'Click company to research background',
        'Click phone to initiate qualifying call',
        'Click deal value to analyze potential',
        'Click follow-up date to schedule next action'
      ]
    },
    {
      id: 'deal-management',
      name: 'Deal Pipeline Management',
      description: 'Manage deals efficiently through clickable interactions',
      steps: [
        'Click deal value to prioritize',
        'Click contact name to update relationship',
        'Click company for competitive analysis',
        'Click close date to adjust timeline',
        'Click owner to reassign if needed'
      ]
    },
    {
      id: 'account-research',
      name: 'Account Research Workflow',
      description: 'Research accounts comprehensively using clickable data',
      steps: [
        'Click company name for overview',
        'Click website to analyze business',
        'Click LinkedIn for decision makers',
        'Click address for territory planning',
        'Click tags to understand categorization'
      ]
    }
  ]

  const startWorkflow = (workflowId: string) => {
    setActiveWorkflow(workflowId)
    setWorkflowStep(0)
    setIsRecording(true)
    setWorkflowStartTime(new Date())
    stepStartTimeRef.current = new Date()
    setCompletedActions([])
    toast.success('Workflow started! Follow the steps and click on the highlighted elements.')
  }

  const logInteraction = (action: string, element: string) => {
    if (!isRecording || !stepStartTimeRef.current) return

    const now = new Date()
    const timeToAction = now.getTime() - stepStartTimeRef.current.getTime()
    const currentWorkflow = workflows.find(w => w.id === activeWorkflow)
    
    const interaction: InteractionLog = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      element,
      timestamp: now,
      timeToAction,
      workflowStep: currentWorkflow?.steps[workflowStep] || 'Unknown'
    }

    setInteractionLogs(prev => [...prev, interaction])
    setCompletedActions(prev => [...prev, `${workflowStep}-${element}`])
    
    // Move to next step
    const workflow = workflows.find(w => w.id === activeWorkflow)
    if (workflow && workflowStep < workflow.steps.length - 1) {
      setWorkflowStep(prev => prev + 1)
      stepStartTimeRef.current = new Date()
      toast.success(`Step ${workflowStep + 1} completed! Moving to step ${workflowStep + 2}.`)
    } else {
      completeWorkflow()
    }
  }

  const completeWorkflow = () => {
    setIsRecording(false)
    const totalTime = workflowStartTime ? new Date().getTime() - workflowStartTime.getTime() : 0
    toast.success(`Workflow completed in ${Math.round(totalTime / 1000)} seconds!`)
  }

  const handleClickableAction = (actionType: string, element: string, data: any) => {
    logInteraction(actionType, element)
    
    // Simulate real actions
    switch (actionType) {
      case 'view-profile':
        toast.info(`Opening ${data.name} profile with full contact history...`)
        break
      case 'view-company':
        toast.info(`Loading ${data.company} account details and analytics...`)
        break
      case 'initiate-call':
        toast.info(`Initiating call to ${data.phone} with automatic logging...`)
        break
      case 'analyze-value':
        toast.info(`Analyzing ${data.value} deal potential and revenue forecast...`)
        break
      case 'schedule-followup':
        toast.info(`Opening calendar to schedule follow-up for ${data.nextFollowUp}...`)
        break
      case 'visit-website':
        toast.info(`Opening ${data.website} for business analysis...`)
        break
      case 'view-linkedin':
        toast.info(`Opening LinkedIn profile for relationship mapping...`)
        break
      case 'view-map':
        toast.info(`Opening map view for ${data.address} territory planning...`)
        break
      case 'filter-tags':
        toast.info(`Filtering records by "${element}" tag...`)
        break
      default:
        toast.info(`Executing ${actionType} for ${element}`)
    }
  }

  const getStepProgress = () => {
    const workflow = workflows.find(w => w.id === activeWorkflow)
    if (!workflow) return 0
    return Math.round((workflowStep / workflow.steps.length) * 100)
  }

  const isStepCompleted = (stepIndex: number) => {
    return stepIndex < workflowStep
  }

  const isCurrentStep = (stepIndex: number) => {
    return stepIndex === workflowStep && isRecording
  }

  const ClickableElement = ({ 
    children, 
    actionType, 
    element, 
    data, 
    highlight = false,
    icon 
  }: {
    children: React.ReactNode
    actionType: string
    element: string
    data: any
    highlight?: boolean
    icon?: React.ReactNode
  }) => {
    const isCompleted = completedActions.includes(`${workflowStep}-${element}`)
    
    return (
      <button
        onClick={() => handleClickableAction(actionType, element, data)}
        className={`
          inline-flex items-center gap-1 text-left transition-all duration-200 rounded px-1 py-0.5
          ${highlight && isRecording ? 'bg-primary/20 ring-2 ring-primary animate-pulse' : ''}
          ${isCompleted ? 'bg-green-100 text-green-800' : 'hover:bg-blue-50 text-primary hover:underline'}
          ${!isRecording ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        disabled={!isRecording}
      >
        {icon && <span className="text-xs">{icon}</span>}
        {children}
        {highlight && isRecording && (
          <ArrowSquareOut size={12} className="text-primary animate-bounce" />
        )}
        {isCompleted && (
          <CheckCircle size={12} className="text-green-600" />
        )}
      </button>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Clickable Data Workflow Demo</h2>
          <p className="text-muted-foreground">
            Experience how clickable data elements enhance productivity in real CRM workflows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity size={14} />
            {interactionLogs.length} Interactions Logged
          </Badge>
          {isRecording && (
            <Badge className="flex items-center gap-2 bg-red-100 text-red-800">
              <Timer size={14} />
              Recording...
            </Badge>
          )}
        </div>
      </div>

      {/* Workflow Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle size={20} />
            Workflow Controls
          </CardTitle>
          <CardDescription>
            Choose a workflow to test clickable data productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <Card 
                key={workflow.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  activeWorkflow === workflow.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => !isRecording && startWorkflow(workflow.id)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {workflow.steps.length} Steps
                      </Badge>
                      <Button 
                        size="sm" 
                        disabled={isRecording}
                        className="flex items-center gap-2"
                      >
                        <PlayCircle size={14} />
                        Start
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {isRecording && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">
                  {workflows.find(w => w.id === activeWorkflow)?.name} - Step {workflowStep + 1}
                </h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {getStepProgress()}% Complete
                </Badge>
              </div>
              <Progress value={getStepProgress()} className="h-2 mb-3" />
              <p className="text-sm text-blue-800">
                {workflows.find(w => w.id === activeWorkflow)?.steps[workflowStep]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Data with Clickable Elements */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Click on any data element to see how it enhances your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoLeads.map((lead, index) => (
                  <Card key={lead.id} className="p-4">
                    <div className="space-y-4">
                      {/* Lead Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <ClickableElement
                              actionType="view-profile"
                              element={lead.name}
                              data={lead}
                              highlight={isCurrentStep(0) && activeWorkflow === 'lead-qualification'}
                              icon={<User size={16} />}
                            >
                              <span className="text-lg font-semibold">{lead.name}</span>
                            </ClickableElement>
                            <Badge className="bg-green-100 text-green-800">
                              Score: {lead.score}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClickableElement
                              actionType="view-company"
                              element={lead.company}
                              data={lead}
                              highlight={isCurrentStep(1) && activeWorkflow === 'lead-qualification'}
                              icon={<Buildings size={14} />}
                            >
                              <span className="text-muted-foreground">{lead.company}</span>
                            </ClickableElement>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{lead.source}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <ClickableElement
                            actionType="analyze-value"
                            element={lead.value}
                            data={lead}
                            highlight={isCurrentStep(3) && activeWorkflow === 'lead-qualification'}
                            icon={<CurrencyDollar size={16} />}
                          >
                            <span className="text-xl font-bold text-green-600">{lead.value}</span>
                          </ClickableElement>
                          <p className="text-sm text-muted-foreground">Potential Value</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="initiate-call"
                              element={lead.phone}
                              data={lead}
                              highlight={isCurrentStep(2) && activeWorkflow === 'lead-qualification'}
                              icon={<Phone size={14} />}
                            >
                              {lead.phone}
                            </ClickableElement>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Email</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="compose-email"
                              element={lead.email}
                              data={lead}
                              icon={<Mail size={14} />}
                            >
                              {lead.email}
                            </ClickableElement>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Website</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="visit-website"
                              element={lead.website}
                              data={lead}
                              highlight={isCurrentStep(1) && activeWorkflow === 'account-research'}
                              icon={<Globe size={14} />}
                            >
                              {lead.website.replace('https://', '')}
                            </ClickableElement>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">LinkedIn</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="view-linkedin"
                              element={lead.linkedin}
                              data={lead}
                              highlight={isCurrentStep(2) && activeWorkflow === 'account-research'}
                              icon={<LinkedinLogo size={14} />}
                            >
                              View Profile
                            </ClickableElement>
                          </div>
                        </div>
                      </div>

                      {/* Address and Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Address</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="view-map"
                              element={lead.address}
                              data={lead}
                              highlight={isCurrentStep(3) && activeWorkflow === 'account-research'}
                              icon={<MapPin size={14} />}
                            >
                              {lead.address}
                            </ClickableElement>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {lead.tags.map((tag, tagIndex) => (
                              <ClickableElement
                                key={tagIndex}
                                actionType="filter-tags"
                                element={tag}
                                data={lead}
                                highlight={isCurrentStep(4) && activeWorkflow === 'account-research'}
                                icon={<Tag size={12} />}
                              >
                                <Badge variant="secondary">{tag}</Badge>
                              </ClickableElement>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Last Contact:</span>
                          <span className="text-sm">{format(new Date(lead.lastContact), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={16} className="text-blue-500" />
                          <span className="text-sm text-muted-foreground">Next Follow-up:</span>
                          <ClickableElement
                            actionType="schedule-followup"
                            element={lead.nextFollowUp}
                            data={lead}
                            highlight={isCurrentStep(4) && activeWorkflow === 'lead-qualification'}
                            icon={<CalendarIcon size={14} />}
                          >
                            {format(new Date(lead.nextFollowUp), 'MMM d, yyyy')}
                          </ClickableElement>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline</CardTitle>
              <CardDescription>
                Manage your deals efficiently with clickable data interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoDeals.map((deal) => (
                  <Card key={deal.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{deal.title}</h4>
                          <div className="flex items-center gap-4">
                            <ClickableElement
                              actionType="view-company"
                              element={deal.account}
                              data={deal}
                              highlight={isCurrentStep(2) && activeWorkflow === 'deal-management'}
                              icon={<Buildings size={14} />}
                            >
                              {deal.account}
                            </ClickableElement>
                            <span className="text-muted-foreground">•</span>
                            <ClickableElement
                              actionType="view-profile"
                              element={deal.contact}
                              data={deal}
                              highlight={isCurrentStep(1) && activeWorkflow === 'deal-management'}
                              icon={<User size={14} />}
                            >
                              {deal.contact}
                            </ClickableElement>
                          </div>
                        </div>
                        <div className="text-right">
                          <ClickableElement
                            actionType="analyze-value"
                            element={deal.value}
                            data={deal}
                            highlight={isCurrentStep(0) && activeWorkflow === 'deal-management'}
                            icon={<CurrencyDollar size={16} />}
                          >
                            <span className="text-xl font-bold text-green-600">{deal.value}</span>
                          </ClickableElement>
                          <p className="text-sm text-muted-foreground">{deal.probability}% probability</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Stage</label>
                          <div className="mt-1">
                            <Badge variant="outline">{deal.stage}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Close Date</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="adjust-timeline"
                              element={deal.closeDate}
                              data={deal}
                              highlight={isCurrentStep(3) && activeWorkflow === 'deal-management'}
                              icon={<CalendarIcon size={14} />}
                            >
                              {format(new Date(deal.closeDate), 'MMM d, yyyy')}
                            </ClickableElement>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wide">Owner</label>
                          <div className="mt-1">
                            <ClickableElement
                              actionType="reassign-owner"
                              element={deal.owner}
                              data={deal}
                              highlight={isCurrentStep(4) && activeWorkflow === 'deal-management'}
                              icon={<User size={14} />}
                            >
                              {deal.owner}
                            </ClickableElement>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Progress value={deal.probability} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>{deal.probability}% probability</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Account Research</CardTitle>
              <CardDescription>
                Research accounts comprehensively using clickable data elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Account Data</h3>
                <p className="text-muted-foreground">
                  Account information is integrated within the Leads and Deals tabs above.
                  Click on company names to see account research workflows in action.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interaction Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar size={20} />
            Interaction Analytics
          </CardTitle>
          <CardDescription>
            Track how clickable data elements improve your CRM productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Recent Interactions */}
            <div>
              <h4 className="font-medium mb-4">Recent Interactions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {interactionLogs.slice(-10).reverse().map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {log.action.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{log.element}</span>
                      <span className="text-xs text-muted-foreground">
                        in {log.workflowStep.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {log.timeToAction}ms
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(log.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <Separator />
            <div>
              <h4 className="font-medium mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{interactionLogs.length}</div>
                  <div className="text-sm text-blue-700">Total Interactions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {interactionLogs.length > 0 
                      ? Math.round(interactionLogs.reduce((sum, log) => sum + log.timeToAction, 0) / interactionLogs.length)
                      : 0}ms
                  </div>
                  <div className="text-sm text-green-700">Avg Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((completedActions.length / Math.max(workflowStep + 1, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-purple-700">Workflow Completion</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {workflows.filter(w => 
                      interactionLogs.some(log => log.workflowStep.includes(w.name.split(' ')[0].toLowerCase()))
                    ).length}
                  </div>
                  <div className="text-sm text-orange-700">Workflows Tested</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}