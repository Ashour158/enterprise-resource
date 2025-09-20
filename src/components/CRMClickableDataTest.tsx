import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
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
  Brain,
  ChartLine,
  PlayCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Timer,
  Lightbulb,
  Eye,
  Activity,
  BarChart,
  PieChart,
  LineChart,
  HandCoins,
  Users,
  Briefcase,
  FileText,
  VideoCamera,
  ChatCircle,
  Warning,
  Info,
  Star,
  Heart,
  ThumbsUp,
  Share,
  Download,
  Upload,
  Copy,
  Edit,
  Trash,
  Plus,
  Minus
} from '@phosphor-icons/react'
import { format, addDays, subDays } from 'date-fns'
import { toast } from 'sonner'

interface CRMClickableDataTestProps {
  companyId: string
  userId: string
}

interface TestWorkflow {
  id: string
  name: string
  description: string
  steps: TestStep[]
  expectedOutcome: string
  priority: 'high' | 'medium' | 'low'
  category: 'lead_management' | 'deal_pipeline' | 'customer_service' | 'reporting' | 'team_collaboration'
}

interface TestStep {
  id: string
  description: string
  action: string
  clickableElement: ClickableElement
  expectedResult: string
  isCompleted?: boolean
  timeTaken?: number
}

interface ClickableElement {
  type: 'name' | 'company' | 'phone' | 'email' | 'currency' | 'date' | 'tag' | 'website' | 'address'
  value: string
  context: string
  icon: React.ReactNode
  actionType: string
}

interface ProductivityMetrics {
  clicksPerMinute: number
  timeToCompletion: number
  errorRate: number
  workflowEfficiency: number
  userSatisfaction: number
}

export function CRMClickableDataTest({ companyId, userId }: CRMClickableDataTestProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [completedWorkflows, setCompletedWorkflows] = useKV('completed-workflows', [] as string[])
  const [productivityMetrics, setProductivityMetrics] = useKV('productivity-metrics', {
    clicksPerMinute: 0,
    timeToCompletion: 0,
    errorRate: 0,
    workflowEfficiency: 0,
    userSatisfaction: 0
  } as ProductivityMetrics)
  const [stepTimes, setStepTimes] = useState<number[]>([])
  const [totalClicks, setTotalClicks] = useState(0)

  // Comprehensive CRM workflow tests
  const testWorkflows: TestWorkflow[] = [
    {
      id: 'lead-qualification-speed-test',
      name: 'Lead Qualification Speed Test',
      description: 'Test how quickly you can qualify a new lead using clickable data elements',
      priority: 'high',
      category: 'lead_management',
      expectedOutcome: 'Complete lead qualification in under 2 minutes with 100% data accuracy',
      steps: [
        {
          id: 'step-1',
          description: 'Click on the lead\'s name to open their profile',
          action: 'Open lead profile',
          clickableElement: {
            type: 'name',
            value: 'Michael Chen',
            context: 'Lead from InnovateTech',
            icon: <User size={16} className="text-blue-500" />,
            actionType: 'View Lead Profile'
          },
          expectedResult: 'Lead profile opens with full contact information and AI scoring'
        },
        {
          id: 'step-2',
          description: 'Click on the company name to research the organization',
          action: 'Research company',
          clickableElement: {
            type: 'company',
            value: 'InnovateTech Industries',
            context: 'Lead\'s company - Manufacturing sector',
            icon: <Buildings size={16} className="text-green-600" />,
            actionType: 'View Company Profile'
          },
          expectedResult: 'Company profile shows industry, size, revenue, and decision makers'
        },
        {
          id: 'step-3',
          description: 'Click on the phone number to initiate qualifying call',
          action: 'Start qualification call',
          clickableElement: {
            type: 'phone',
            value: '+1 (555) 987-6543',
            context: 'Direct line to decision maker',
            icon: <Phone size={16} className="text-green-500" />,
            actionType: 'Initiate Call'
          },
          expectedResult: 'Call initiated with automatic activity logging and call script'
        },
        {
          id: 'step-4',
          description: 'Click on the deal value to estimate potential revenue',
          action: 'Analyze revenue potential',
          clickableElement: {
            type: 'currency',
            value: '$250,000',
            context: 'Estimated annual contract value',
            icon: <CurrencyDollar size={16} className="text-green-600" />,
            actionType: 'View Revenue Analysis'
          },
          expectedResult: 'Revenue breakdown with pricing tiers and payment schedule options'
        },
        {
          id: 'step-5',
          description: 'Click on follow-up date to schedule next interaction',
          action: 'Schedule follow-up',
          clickableElement: {
            type: 'date',
            value: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
            context: 'Optimal follow-up timing based on AI analysis',
            icon: <CalendarIcon size={16} className="text-blue-500" />,
            actionType: 'Schedule Meeting'
          },
          expectedResult: 'Calendar opens with suggested meeting times and automated reminders'
        }
      ]
    },
    {
      id: 'deal-pipeline-management',
      name: 'Deal Pipeline Management Test',
      description: 'Test efficiency in managing multiple deals through clickable interactions',
      priority: 'high',
      category: 'deal_pipeline',
      expectedOutcome: 'Update 5 deals and move through pipeline stages in under 3 minutes',
      steps: [
        {
          id: 'step-1',
          description: 'Click on high-value deal to prioritize',
          action: 'Prioritize high-value deal',
          clickableElement: {
            type: 'currency',
            value: '$500,000',
            context: 'Enterprise software deal - 90% probability',
            icon: <CurrencyDollar size={16} className="text-green-600" />,
            actionType: 'Analyze Deal'
          },
          expectedResult: 'Deal details with probability analysis and next actions'
        },
        {
          id: 'step-2',
          description: 'Click on contact name to update relationship status',
          action: 'Update contact engagement',
          clickableElement: {
            type: 'name',
            value: 'Sarah Johnson',
            context: 'VP of Engineering - Primary decision maker',
            icon: <User size={16} className="text-blue-500" />,
            actionType: 'Update Contact'
          },
          expectedResult: 'Contact profile with interaction history and engagement score'
        },
        {
          id: 'step-3',
          description: 'Click on company to check competitive landscape',
          action: 'Analyze competition',
          clickableElement: {
            type: 'company',
            value: 'TechCorp Solutions',
            context: 'Fortune 500 software company',
            icon: <Buildings size={16} className="text-purple-600" />,
            actionType: 'Competitive Analysis'
          },
          expectedResult: 'Competitive analysis with SWOT and positioning insights'
        },
        {
          id: 'step-4',
          description: 'Click on close date to adjust timeline',
          action: 'Update deal timeline',
          clickableElement: {
            type: 'date',
            value: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            context: 'Projected close date - Q1 target',
            icon: <CalendarIcon size={16} className="text-orange-500" />,
            actionType: 'Adjust Timeline'
          },
          expectedResult: 'Timeline view with milestones and critical path analysis'
        }
      ]
    },
    {
      id: 'customer-service-response',
      name: 'Customer Service Response Test',
      description: 'Test rapid response to customer inquiries using clickable data',
      priority: 'medium',
      category: 'customer_service',
      expectedOutcome: 'Resolve customer inquiry with full context in under 90 seconds',
      steps: [
        {
          id: 'step-1',
          description: 'Click on customer name to view complete history',
          action: 'Access customer history',
          clickableElement: {
            type: 'name',
            value: 'Emma Davis',
            context: 'Premium customer - 3 years tenure',
            icon: <User size={16} className="text-gold-500" />,
            actionType: 'View Customer Profile'
          },
          expectedResult: 'Complete customer journey with purchase history and preferences'
        },
        {
          id: 'step-2',
          description: 'Click on support ticket value to understand issue severity',
          action: 'Assess issue priority',
          clickableElement: {
            type: 'currency',
            value: '$15,000',
            context: 'Revenue at risk - Critical issue',
            icon: <CurrencyDollar size={16} className="text-red-600" />,
            actionType: 'Risk Assessment'
          },
          expectedResult: 'Issue severity analysis with escalation recommendations'
        },
        {
          id: 'step-3',
          description: 'Click on phone number for immediate escalation',
          action: 'Escalate to manager',
          clickableElement: {
            type: 'phone',
            value: '+1 (555) 123-4567',
            context: 'Customer success manager direct line',
            icon: <Phone size={16} className="text-red-500" />,
            actionType: 'Emergency Escalation'
          },
          expectedResult: 'Manager notified with full context and recommended actions'
        }
      ]
    },
    {
      id: 'sales-reporting-efficiency',
      name: 'Sales Reporting Efficiency Test',
      description: 'Test how quickly sales data can be analyzed using clickable elements',
      priority: 'medium',
      category: 'reporting',
      expectedOutcome: 'Generate comprehensive sales report in under 60 seconds',
      steps: [
        {
          id: 'step-1',
          description: 'Click on revenue tag to filter high-value deals',
          action: 'Filter by revenue',
          clickableElement: {
            type: 'tag',
            value: 'High Value',
            context: '47 deals worth $2.3M total',
            icon: <Tag size={16} className="text-yellow-500" />,
            actionType: 'Apply Revenue Filter'
          },
          expectedResult: 'Filtered view showing only high-value opportunities'
        },
        {
          id: 'step-2',
          description: 'Click on date range to set quarterly analysis',
          action: 'Set analysis period',
          clickableElement: {
            type: 'date',
            value: 'Q1 2024',
            context: 'Quarterly performance analysis',
            icon: <CalendarIcon size={16} className="text-blue-500" />,
            actionType: 'Set Date Range'
          },
          expectedResult: 'Quarterly view with trend analysis and projections'
        },
        {
          id: 'step-3',
          description: 'Click on team member to analyze individual performance',
          action: 'Individual performance review',
          clickableElement: {
            type: 'name',
            value: 'Alex Rodriguez',
            context: 'Top performer - 125% of quota',
            icon: <User size={16} className="text-green-500" />,
            actionType: 'Performance Analysis'
          },
          expectedResult: 'Individual metrics with comparison to team averages'
        }
      ]
    },
    {
      id: 'team-collaboration-speed',
      name: 'Team Collaboration Speed Test',
      description: 'Test efficiency of team coordination using clickable data sharing',
      priority: 'low',
      category: 'team_collaboration',
      expectedOutcome: 'Share deal information and coordinate team response in under 45 seconds',
      steps: [
        {
          id: 'step-1',
          description: 'Click on deal owner to reassign for better coverage',
          action: 'Reassign deal ownership',
          clickableElement: {
            type: 'name',
            value: 'Jennifer Liu',
            context: 'Account executive - Enterprise specialist',
            icon: <User size={16} className="text-purple-500" />,
            actionType: 'Transfer Ownership'
          },
          expectedResult: 'Ownership transfer with full context and handoff notes'
        },
        {
          id: 'step-2',
          description: 'Click on email to notify team of critical update',
          action: 'Team notification',
          clickableElement: {
            type: 'email',
            value: 'team-sales@company.com',
            context: 'Sales team distribution list',
            icon: <Mail size={16} className="text-blue-500" />,
            actionType: 'Broadcast Update'
          },
          expectedResult: 'Team notification sent with deal context and action items'
        }
      ]
    }
  ]

  const getCurrentWorkflowData = () => {
    return testWorkflows.find(w => w.id === currentWorkflow)
  }

  const getCurrentStep = () => {
    const workflow = getCurrentWorkflowData()
    return workflow?.steps[currentStep]
  }

  const startWorkflowTest = (workflowId: string) => {
    setCurrentWorkflow(workflowId)
    setCurrentStep(0)
    setIsTestRunning(true)
    setTestStartTime(new Date())
    setStepTimes([])
    setTotalClicks(0)
    toast.success('Workflow test started! Follow the instructions to test clickable data efficiency.')
  }

  const completeStep = () => {
    const stepStartTime = testStartTime || new Date()
    const stepEndTime = new Date()
    const stepDuration = stepEndTime.getTime() - stepStartTime.getTime()
    
    setStepTimes(prev => [...prev, stepDuration])
    setTotalClicks(prev => prev + 1)
    
    const workflow = getCurrentWorkflowData()
    if (workflow && currentStep < workflow.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
      setTestStartTime(new Date()) // Reset timer for next step
      toast.success('Step completed! Moving to next step.')
    } else {
      completeWorkflow()
    }
  }

  const completeWorkflow = () => {
    if (!currentWorkflow) return
    
    const totalTime = stepTimes.reduce((sum, time) => sum + time, 0)
    const avgClicksPerMinute = (totalClicks / (totalTime / 60000))
    
    setCompletedWorkflows(prev => [...prev, currentWorkflow])
    setProductivityMetrics(prev => ({
      ...prev,
      clicksPerMinute: Math.round(avgClicksPerMinute),
      timeToCompletion: Math.round(totalTime / 1000),
      workflowEfficiency: Math.min(100, Math.round((totalClicks / stepTimes.length) * 20)) // Efficiency score
    }))
    
    setIsTestRunning(false)
    setCurrentWorkflow(null)
    setCurrentStep(0)
    
    toast.success('Workflow test completed! Check your productivity metrics.')
  }

  const handleClickableElementClick = (element: ClickableElement) => {
    // Simulate the actual action
    let message = ''
    
    switch (element.type) {
      case 'name':
        message = `Opening profile for ${element.value}...`
        break
      case 'company':
        message = `Loading ${element.value} company details...`
        break
      case 'phone':
        message = `Initiating call to ${element.value}...`
        break
      case 'email':
        message = `Composing email to ${element.value}...`
        break
      case 'currency':
        message = `Analyzing ${element.value} financial data...`
        break
      case 'date':
        message = `Opening calendar for ${element.value}...`
        break
      case 'tag':
        message = `Filtering by "${element.value}" tag...`
        break
      case 'website':
        message = `Opening ${element.value}...`
        break
      case 'address':
        message = `Opening map for ${element.value}...`
        break
    }
    
    toast.success(message)
    
    // Auto-complete step after a brief delay to simulate real action
    setTimeout(() => {
      completeStep()
    }, 1000)
  }

  const getWorkflowProgress = () => {
    const workflow = getCurrentWorkflowData()
    if (!workflow) return 0
    return Math.round((currentStep / workflow.steps.length) * 100)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      lead_management: 'bg-blue-100 text-blue-800',
      deal_pipeline: 'bg-green-100 text-green-800',
      customer_service: 'bg-red-100 text-red-800',
      reporting: 'bg-purple-100 text-purple-800',
      team_collaboration: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM Clickable Data Productivity Test</h2>
          <p className="text-muted-foreground">
            Test and optimize your productivity using clickable data elements in real CRM workflows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity size={14} />
            {completedWorkflows.length} Tests Completed
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Timer size={14} />
            {productivityMetrics.clicksPerMinute} Clicks/min
          </Badge>
        </div>
      </div>

      {/* Current Test Runner */}
      {isTestRunning && currentWorkflow && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle size={20} className="text-primary" />
                  {getCurrentWorkflowData()?.name}
                </CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {getCurrentWorkflowData()?.steps.length}
                </CardDescription>
              </div>
              <Badge className="flex items-center gap-2">
                <Clock size={14} />
                {Math.round((new Date().getTime() - (testStartTime?.getTime() || 0)) / 1000)}s
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={getWorkflowProgress()} className="h-2" />
            
            {getCurrentStep() && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Current Step:</h4>
                  <p className="text-blue-800 mb-4">{getCurrentStep()?.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        {getCurrentStep()?.clickableElement.icon}
                        <span className="font-medium">Click:</span>
                        <code className="bg-white px-2 py-1 rounded">
                          {getCurrentStep()?.clickableElement.value}
                        </code>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleClickableElementClick(getCurrentStep()!.clickableElement)}
                      className="flex items-center gap-2"
                    >
                      {getCurrentStep()?.clickableElement.icon}
                      {getCurrentStep()?.clickableElement.actionType}
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-900 mb-1">Expected Result:</h5>
                  <p className="text-sm text-green-800">{getCurrentStep()?.expectedResult}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Productivity Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} />
            Productivity Metrics
          </CardTitle>
          <CardDescription>
            Real-time analysis of your CRM data interaction efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{productivityMetrics.clicksPerMinute}</div>
              <div className="text-sm text-blue-700">Clicks per Minute</div>
              <div className="text-xs text-muted-foreground mt-1">Target: 15+</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{productivityMetrics.timeToCompletion}s</div>
              <div className="text-sm text-green-700">Avg Completion Time</div>
              <div className="text-xs text-muted-foreground mt-1">Target: {'<120s'}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{productivityMetrics.workflowEfficiency}%</div>
              <div className="text-sm text-purple-700">Workflow Efficiency</div>
              <div className="text-xs text-muted-foreground mt-1">Target: 85%+</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{productivityMetrics.errorRate}%</div>
              <div className="text-sm text-orange-700">Error Rate</div>
              <div className="text-xs text-muted-foreground mt-1">Target: {'<5%'}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{completedWorkflows.length}</div>
              <div className="text-sm text-yellow-700">Tests Completed</div>
              <div className="text-xs text-muted-foreground mt-1">Total Available: {testWorkflows.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Workflow Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Available Workflow Tests
          </CardTitle>
          <CardDescription>
            Choose a workflow to test your clickable data interaction efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testWorkflows.map((workflow) => (
              <Card 
                key={workflow.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  completedWorkflows.includes(workflow.id) ? 'border-green-200 bg-green-50' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{workflow.name}</h4>
                          {completedWorkflows.includes(workflow.id) && (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getPriorityColor(workflow.priority)} variant="secondary">
                          {workflow.priority}
                        </Badge>
                        <Badge className={getCategoryColor(workflow.category)} variant="secondary">
                          {workflow.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Steps:</span> {workflow.steps.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Expected Outcome:</span>
                        <p className="text-muted-foreground mt-1">{workflow.expectedOutcome}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Est. Time: {Math.round(workflow.steps.length * 0.5)}-{workflow.steps.length} minutes
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => startWorkflowTest(workflow.id)}
                        disabled={isTestRunning}
                        className="flex items-center gap-2"
                      >
                        <PlayCircle size={14} />
                        {completedWorkflows.includes(workflow.id) ? 'Retry Test' : 'Start Test'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="workflow-analysis">Workflow Analysis</TabsTrigger>
          <TabsTrigger value="improvement-tips">Improvement Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your clickable data interaction performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance by Category */}
                <div>
                  <h4 className="font-medium mb-4">Performance by Workflow Category</h4>
                  <div className="space-y-3">
                    {['lead_management', 'deal_pipeline', 'customer_service', 'reporting', 'team_collaboration'].map((category) => {
                      const categoryWorkflows = testWorkflows.filter(w => w.category === category)
                      const completedInCategory = completedWorkflows.filter(id => 
                        testWorkflows.find(w => w.id === id)?.category === category
                      ).length
                      const completion = Math.round((completedInCategory / categoryWorkflows.length) * 100)
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getCategoryColor(category)} variant="secondary">
                              {category.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm">{completedInCategory}/{categoryWorkflows.length} completed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={completion} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">{completion}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Speed Insights */}
                <Separator />
                <div>
                  <h4 className="font-medium mb-4">Speed Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer size={16} className="text-blue-500" />
                        <span className="font-medium">Fastest Workflow</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Team Collaboration: avg 45s
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendUp size={16} className="text-green-500" />
                        <span className="font-medium">Most Efficient</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lead Qualification: 95% efficiency
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-purple-500" />
                        <span className="font-medium">Best Practice</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        15+ clicks per minute target
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of each workflow's clickable data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {testWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">{workflow.name}</h4>
                      <div className="flex items-center gap-2">
                        {completedWorkflows.includes(workflow.id) ? (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">
                            <CheckCircle size={12} className="mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Tested</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Clickable Elements:</span>
                        <ul className="mt-1 space-y-1">
                          {workflow.steps.map((step, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              {step.clickableElement.icon}
                              <span>{step.clickableElement.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Actions:</span>
                        <ul className="mt-1 space-y-1">
                          {workflow.steps.map((step, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              {step.action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Expected Time:</span>
                        <p className="text-muted-foreground mt-1">
                          {Math.round(workflow.steps.length * 0.5)}-{workflow.steps.length} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement-tips">
          <Card>
            <CardHeader>
              <CardTitle>Performance Improvement Tips</CardTitle>
              <CardDescription>
                Optimize your use of clickable data elements for maximum productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} />
                      Speed Optimization
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Use keyboard shortcuts when clicking elements</li>
                      <li>• Learn common clickable data patterns</li>
                      <li>• Practice muscle memory for frequent actions</li>
                      <li>• Use context menus for quick actions</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <Target size={16} />
                      Accuracy Improvement
                    </h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Read context information before clicking</li>
                      <li>• Verify data before taking actions</li>
                      <li>• Use hover tooltips for confirmation</li>
                      <li>• Double-check critical operations</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                      <Brain size={16} />
                      Workflow Efficiency
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>• Plan your click sequence in advance</li>
                      <li>• Group related actions together</li>
                      <li>• Use bulk operations when possible</li>
                      <li>• Leverage AI suggestions and automation</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                      <ChartLine size={16} />
                      Data Navigation
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-800">
                      <li>• Use filters to reduce data noise</li>
                      <li>• Bookmark frequently accessed views</li>
                      <li>• Learn search shortcuts and operators</li>
                      <li>• Organize data with meaningful tags</li>
                    </ul>
                  </div>
                </div>

                {/* Performance Benchmarks */}
                <Separator />
                <div>
                  <h4 className="font-medium mb-4">Performance Benchmarks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">15+</div>
                      <div className="text-sm text-muted-foreground">Clicks per Minute</div>
                      <div className="text-xs text-muted-foreground mt-1">Expert Level</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{'<90s'}</div>
                      <div className="text-sm text-muted-foreground">Workflow Completion</div>
                      <div className="text-xs text-muted-foreground mt-1">Target Time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-purple-600">95%+</div>
                      <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                      <div className="text-xs text-muted-foreground mt-1">Quality Target</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{'<3'}</div>
                      <div className="text-sm text-muted-foreground">Clicks per Action</div>
                      <div className="text-xs text-muted-foreground mt-1">Efficiency Goal</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}