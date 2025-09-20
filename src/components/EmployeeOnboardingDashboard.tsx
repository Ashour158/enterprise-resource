import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  OnboardingInstance,
  OnboardingStep,
  OnboardingStepProgress,
  OnboardingWorkflow,
  OnboardingMessage
} from '@/types/onboarding'
import {
  CheckCircle,
  Clock,
  Play,
  User,
  Calendar,
  Target,
  BookOpen,
  ChatCircle as MessageCircle,
  Star,
  Warning,
  Users,
  Building,
  ChartBar,
  Timer,
  Coffee,
  Handshake,
  GraduationCap,
  FileText,
  Video,
  ClipboardText,
  Eye,
  Trophy as Award,
  ArrowRight,
  Envelope as Mail,
  Phone,
  MapPin,
  Briefcase
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, differenceInDays, addDays } from 'date-fns'

interface EmployeeOnboardingDashboardProps {
  companyId: string
  employeeId: string
  currentUserId: string
  userRole: 'super_admin' | 'company_admin' | 'hr_manager' | 'manager' | 'employee'
}

export function EmployeeOnboardingDashboard({
  companyId,
  employeeId,
  currentUserId,
  userRole
}: EmployeeOnboardingDashboardProps) {
  // State management
  const [onboardingInstance, setOnboardingInstance] = useKV<OnboardingInstance | null>(
    `employee-onboarding-${employeeId}`, 
    null
  )
  const [workflow, setWorkflow] = useKV<OnboardingWorkflow | null>(
    `onboarding-workflow-${onboardingInstance?.workflowId}`, 
    null
  )
  const [employeeInfo, setEmployeeInfo] = useKV<any>(`employee-${employeeId}`, null)
  
  const [selectedStep, setSelectedStep] = useState<OnboardingStep | null>(null)
  const [showStepDetail, setShowStepDetail] = useState(false)
  const [showMentorChat, setShowMentorChat] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('progress')
  const [newMessage, setNewMessage] = useState('')
  const [stepFeedback, setStepFeedback] = useState('')
  const [stepRating, setStepRating] = useState(5)
  const [timeTracking, setTimeTracking] = useKV<Record<string, number>>(`time-tracking-${employeeId}`, {})
  const [mentorNotes, setMentorNotes] = useKV<any[]>(`mentor-notes-${employeeId}`, [])
  const [milestones, setMilestones] = useKV<any[]>(`onboarding-milestones-${employeeId}`, [])

  // Initialize mock data if empty
  useEffect(() => {
    if (!onboardingInstance) {
      generateMockOnboardingInstance()
    }
    if (!employeeInfo) {
      generateMockEmployeeInfo()
    }
    if (!milestones || milestones.length === 0) {
      generateMockMilestones()
    }
    if (!mentorNotes || mentorNotes.length === 0) {
      generateMockMentorNotes()
    }
  }, [employeeId])

  const generateMockMilestones = () => {
    const mockMilestones = [
      {
        id: 'milestone-001',
        title: 'First Day Complete',
        description: 'Successfully completed all first-day onboarding activities',
        achievedDate: new Date('2024-01-22'),
        type: 'major',
        badge: 'First Day Champion',
        points: 100
      },
      {
        id: 'milestone-002',
        title: 'Documentation Master',
        description: 'Completed all HR documentation and forms',
        achievedDate: new Date('2024-01-23'),
        type: 'standard',
        badge: 'Documentation Expert',
        points: 50
      },
      {
        id: 'milestone-003',
        title: 'Tech Setup Pro',
        description: 'IT setup and system access configured',
        achievedDate: null,
        type: 'pending',
        badge: 'Tech Savvy',
        points: 75
      }
    ]
    setMilestones(mockMilestones)
  }

  const generateMockMentorNotes = () => {
    const mockNotes = [
      {
        id: 'note-001',
        mentorId: 'buddy-001',
        mentorName: 'John Smith',
        content: 'Sarah is making excellent progress! She\'s very eager to learn and asks great questions.',
        category: 'progress',
        timestamp: new Date('2024-01-22T16:30:00Z'),
        isPrivate: false,
        tags: ['positive', 'engagement']
      },
      {
        id: 'note-002',
        mentorId: 'manager-001',
        mentorName: 'Mike Davis',
        content: 'First week review went well. Sarah shows strong technical foundation and team collaboration skills.',
        category: 'review',
        timestamp: new Date('2024-01-26T14:00:00Z'),
        isPrivate: false,
        tags: ['review', 'technical', 'collaboration']
      }
    ]
    setMentorNotes(mockNotes)
  }

  const generateMockOnboardingInstance = () => {
    const mockInstance: OnboardingInstance = {
      id: `instance-${employeeId}`,
      workflowId: 'workflow-001',
      workflowVersion: '2.1',
      employeeId,
      companyId,
      departmentId: 'dept-002',
      managerId: 'manager-001',
      buddyId: 'buddy-001',
      hrContactId: 'hr-001',
      status: 'in_progress',
      currentStepId: 'step-003',
      progress: 45,
      startDate: new Date('2024-01-22'),
      expectedCompletionDate: addDays(new Date('2024-01-22'), 14),
      stepProgress: [
        {
          stepId: 'step-001',
          status: 'completed',
          startedAt: new Date('2024-01-22T09:00:00Z'),
          completedAt: new Date('2024-01-22T10:30:00Z'),
          completedBy: employeeId,
          timeSpent: 90,
          notes: 'Great introduction to company culture!'
        },
        {
          stepId: 'step-002',
          status: 'completed',
          startedAt: new Date('2024-01-22T14:00:00Z'),
          completedAt: new Date('2024-01-23T11:00:00Z'),
          completedBy: employeeId,
          approvedBy: 'hr-001',
          timeSpent: 120,
          notes: 'All forms completed successfully'
        },
        {
          stepId: 'step-003',
          status: 'in_progress',
          startedAt: new Date('2024-01-23T13:00:00Z'),
          assignedTo: 'it-admin',
          timeSpent: 60
        },
        {
          stepId: 'step-004',
          status: 'not_started'
        },
        {
          stepId: 'step-005',
          status: 'not_started'
        },
        {
          stepId: 'step-006',
          status: 'not_started'
        },
        {
          stepId: 'step-007',
          status: 'not_started'
        }
      ],
      notifications: [
        {
          id: 'notif-001',
          type: 'reminder',
          recipientId: employeeId,
          title: 'IT Setup Pending',
          message: 'Your IT setup is in progress. Please coordinate with the IT team.',
          sentAt: new Date('2024-01-23T08:00:00Z'),
          readAt: new Date('2024-01-23T09:00:00Z')
        }
      ],
      messages: [
        {
          id: 'msg-001',
          fromId: 'buddy-001',
          toId: employeeId,
          subject: 'Welcome to the team!',
          content: 'Hi! I\'m excited to be your onboarding buddy. Feel free to reach out with any questions.',
          type: 'general',
          priority: 'medium',
          sentAt: new Date('2024-01-22T15:00:00Z'),
          readAt: new Date('2024-01-22T16:00:00Z'),
          tags: ['welcome', 'buddy']
        }
      ],
      escalations: [],
      settings: {
        sendReminders: true,
        allowSelfService: true,
        requireManagerApproval: true,
        enableMentoring: true
      },
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-23')
    }
    setOnboardingInstance(mockInstance)

    // Also create mock workflow
    const mockWorkflow: OnboardingWorkflow = {
      id: 'workflow-001',
      name: 'Software Engineer Onboarding',
      description: 'Comprehensive onboarding for technical roles',
      version: '2.1',
      companyId,
      departmentId: 'dept-002',
      isActive: true,
      isTemplate: false,
      estimatedDuration: 14,
      steps: [
        {
          id: 'step-001',
          title: 'Welcome & Orientation',
          description: 'Introduction to company culture and values',
          type: 'welcome',
          category: 'orientation',
          order: 1,
          estimatedDuration: 90,
          isRequired: true,
          assignedTo: 'hr',
          content: {
            instructions: 'Welcome to our company! This step introduces you to our mission, values, and culture.',
            videoUrl: 'https://example.com/welcome-video',
            checklistItems: [
              { id: 'c1', text: 'Watch welcome video', required: true, completed: true },
              { id: 'c2', text: 'Read company handbook', required: true, completed: true },
              { id: 'c3', text: 'Complete culture quiz', required: false, completed: true }
            ]
          }
        },
        {
          id: 'step-002',
          title: 'HR Documentation',
          description: 'Complete essential HR paperwork and benefits enrollment',
          type: 'form',
          category: 'hr',
          order: 2,
          estimatedDuration: 120,
          isRequired: true,
          assignedTo: 'hr',
          dependsOn: ['step-001']
        },
        {
          id: 'step-003',
          title: 'IT Setup & Access',
          description: 'Computer setup, account creation, and system access',
          type: 'task',
          category: 'it',
          order: 3,
          estimatedDuration: 120,
          isRequired: true,
          assignedTo: 'it',
          dependsOn: ['step-002']
        },
        {
          id: 'step-004',
          title: 'Security Training',
          description: 'Mandatory security awareness and compliance training',
          type: 'training',
          category: 'compliance',
          order: 4,
          estimatedDuration: 60,
          isRequired: true,
          assignedTo: 'system',
          dependsOn: ['step-003']
        },
        {
          id: 'step-005',
          title: 'Team Introduction',
          description: 'Meet your team, manager, and assigned buddy',
          type: 'task',
          category: 'social',
          order: 5,
          estimatedDuration: 90,
          isRequired: true,
          assignedTo: 'manager',
          dependsOn: ['step-003']
        },
        {
          id: 'step-006',
          title: 'Development Environment',
          description: 'Set up development tools and environment',
          type: 'training',
          category: 'department',
          order: 6,
          estimatedDuration: 180,
          isRequired: true,
          assignedTo: 'buddy',
          dependsOn: ['step-003', 'step-005']
        },
        {
          id: 'step-007',
          title: 'First Week Review',
          description: 'Manager review of first week progress',
          type: 'review',
          category: 'department',
          order: 7,
          estimatedDuration: 30,
          isRequired: true,
          assignedTo: 'manager',
          dependsOn: ['step-006']
        }
      ],
      flowConfig: {
        allowSkipping: false,
        requireApprovals: true,
        enableReminders: true,
        reminderFrequency: 2
      },
      automation: {
        autoStart: true,
        autoAssignBuddy: true,
        autoScheduleMeetings: true,
        autoProvisionAccess: true,
        autoSendWelcomeEmail: true
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: currentUserId,
      updatedBy: currentUserId,
      tags: ['technical', 'it', 'developer']
    }
    setWorkflow(mockWorkflow)
  }

  const generateMockEmployeeInfo = () => {
    const mockEmployee = {
      id: employeeId,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen',
      position: 'Senior Software Engineer',
      department: 'Information Technology',
      startDate: '2024-01-22',
      manager: 'Mike Davis',
      buddy: 'John Smith',
      phone: '+1-555-0199',
      location: 'San Francisco, CA',
      personalInfo: {
        birthday: '1992-03-15',
        interests: ['Photography', 'Hiking', 'Open Source'],
        education: 'Computer Science, Stanford University',
        previousExperience: '5 years at Meta, 2 years at Google'
      }
    }
    setEmployeeInfo(mockEmployee)
  }

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.type) {
      case 'welcome': return <Handshake size={20} />
      case 'form': return <ClipboardText size={20} />
      case 'training': return <GraduationCap size={20} />
      case 'task': return <Target size={20} />
      case 'review': return <Eye size={20} />
      case 'approval': return <CheckCircle size={20} />
      case 'completion': return <Award size={20} />
      default: return <BookOpen size={20} />
    }
  }

  const getStepStatusColor = (status: OnboardingStepProgress['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'skipped': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-400 bg-gray-50'
    }
  }

  const getStepStatusIcon = (status: OnboardingStepProgress['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />
      case 'in_progress': return <Clock size={16} className="text-blue-600" />
      case 'pending_approval': return <Warning size={16} className="text-yellow-600" />
      case 'failed': return <Warning size={16} className="text-red-600" />
      case 'skipped': return <ArrowRight size={16} className="text-gray-600" />
      default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const calculateDaysRemaining = () => {
    if (!onboardingInstance) return 0
    const today = new Date()
    const endDate = new Date(onboardingInstance.expectedCompletionDate)
    return Math.max(0, differenceInDays(endDate, today))
  }

  const getCompletedStepsCount = () => {
    if (!onboardingInstance) return 0
    return onboardingInstance.stepProgress.filter(s => s.status === 'completed').length
  }

  const getTotalStepsCount = () => {
    return workflow?.steps.length || 0
  }

  const getCurrentStep = () => {
    if (!workflow || !onboardingInstance) return null
    return workflow.steps.find(s => s.id === onboardingInstance.currentStepId) || null
  }

  const getStepProgress = (stepId: string) => {
    if (!onboardingInstance) return null
    return onboardingInstance.stepProgress.find(sp => sp.stepId === stepId) || null
  }

  const sendMentorMessage = () => {
    if (!newMessage.trim()) return
    
    const message: OnboardingMessage = {
      id: `msg-${Date.now()}`,
      fromId: currentUserId,
      toId: onboardingInstance?.buddyId || 'buddy-001',
      subject: 'Question from Onboarding',
      content: newMessage,
      type: 'question' as const,
      priority: 'medium' as const,
      sentAt: new Date(),
      readAt: undefined,
      tags: ['question', 'onboarding']
    }
    
    if (onboardingInstance) {
      const updatedInstance = {
        ...onboardingInstance,
        messages: [...onboardingInstance.messages, message],
        updatedAt: new Date()
      }
      setOnboardingInstance(updatedInstance)
    }
    
    setNewMessage('')
    setShowMentorChat(false)
    toast.success('Message sent to your mentor!')
  }

  const submitStepFeedback = (stepId: string) => {
    if (!stepFeedback.trim()) return
    
    const feedback = {
      stepId,
      rating: stepRating,
      comments: stepFeedback,
      submittedAt: new Date(),
      submittedBy: currentUserId
    }
    
    // Update step progress with feedback
    if (onboardingInstance) {
      const updatedStepProgress = onboardingInstance.stepProgress.map(sp => {
        if (sp.stepId === stepId) {
          return {
            ...sp,
            feedback: feedback
          }
        }
        return sp
      })
      
      const updatedInstance = {
        ...onboardingInstance,
        stepProgress: updatedStepProgress,
        updatedAt: new Date()
      }
      setOnboardingInstance(updatedInstance)
    }
    
    setStepFeedback('')
    setStepRating(5)
    setShowFeedbackDialog(false)
    toast.success('Feedback submitted successfully!')
  }

  const startTimeTracking = (stepId: string) => {
    setTimeTracking(current => ({
      ...current,
      [stepId]: Date.now()
    }))
    toast.info('Time tracking started for this step')
  }

  const stopTimeTracking = (stepId: string) => {
    const currentTracking = timeTracking || {}
    const startTime = currentTracking[stepId]
    if (!startTime) return
    
    const timeSpent = Math.round((Date.now() - startTime) / 60000) // Convert to minutes
    
    if (onboardingInstance) {
      const updatedStepProgress = onboardingInstance.stepProgress.map(sp => {
        if (sp.stepId === stepId) {
          return {
            ...sp,
            timeSpent: (sp.timeSpent || 0) + timeSpent
          }
        }
        return sp
      })
      
      const updatedInstance = {
        ...onboardingInstance,
        stepProgress: updatedStepProgress,
        updatedAt: new Date()
      }
      setOnboardingInstance(updatedInstance)
    }
    
    setTimeTracking(current => {
      const updated = { ...current }
      delete updated[stepId]
      return updated
    })
    
    toast.success(`Time tracked: ${timeSpent} minutes`)
  }

  const calculateOverallScore = () => {
    if (!onboardingInstance) return 0
    
    const completedSteps = onboardingInstance.stepProgress.filter(sp => sp.status === 'completed')
    const totalFeedback = completedSteps.reduce((sum, sp) => {
      return sum + (sp.feedback?.rating || 5)
    }, 0)
    
    return completedSteps.length > 0 ? Math.round(totalFeedback / completedSteps.length * 10) / 10 : 0
  }

  const getProgressInsights = (): Array<{type: string, title: string, message: string}> => {
    if (!onboardingInstance || !workflow) return []
    
    const insights: Array<{type: string, title: string, message: string}> = []
    const completedSteps = onboardingInstance.stepProgress.filter(sp => sp.status === 'completed')
    const progressRate = (completedSteps.length / workflow.steps.length) * 100
    
    if (progressRate > 75) {
      insights.push({
        type: 'success',
        title: 'Excellent Progress!',
        message: 'You\'re ahead of schedule and doing great!'
      })
    } else if (progressRate < 25) {
      insights.push({
        type: 'warning',
        title: 'Need Some Momentum',
        message: 'Consider reaching out to your mentor for support.'
      })
    }
    
    const avgTimePerStep = completedSteps.reduce((sum, sp) => sum + (sp.timeSpent || 0), 0) / completedSteps.length
    if (avgTimePerStep > 120) {
      insights.push({
        type: 'info',
        title: 'Take Your Time',
        message: 'You\'re being thorough, which is great for learning!'
      })
    }
    
    return insights
  }

  const markStepComplete = (stepId: string) => {
    if (!onboardingInstance) return
    
    const updatedStepProgress = onboardingInstance.stepProgress.map(sp => {
      if (sp.stepId === stepId) {
        return {
          ...sp,
          status: 'completed' as const,
          completedAt: new Date(),
          completedBy: currentUserId
        }
      }
      return sp
    })
    
    // Update progress percentage
    const completedCount = updatedStepProgress.filter(sp => sp.status === 'completed').length
    const totalCount = workflow?.steps.length || 1
    const newProgress = Math.round((completedCount / totalCount) * 100)
    
    // Find next step
    const currentIndex = workflow?.steps.findIndex(s => s.id === stepId) || 0
    const nextStep = workflow?.steps[currentIndex + 1]
    
    const updatedInstance: OnboardingInstance = {
      ...onboardingInstance,
      stepProgress: updatedStepProgress,
      progress: newProgress,
      currentStepId: nextStep?.id,
      status: newProgress === 100 ? 'completed' : 'in_progress',
      actualCompletionDate: newProgress === 100 ? new Date() : undefined,
      updatedAt: new Date()
    }
    
    setOnboardingInstance(updatedInstance)
    toast.success('Step marked as complete!')
  }

  const openStepDetail = (step: OnboardingStep) => {
    setSelectedStep(step)
    setShowStepDetail(true)
  }

  if (!onboardingInstance || !workflow || !employeeInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Loading Onboarding Progress</h3>
            <p className="text-muted-foreground">Please wait while we load your onboarding information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStep = getCurrentStep()
  const completedSteps = getCompletedStepsCount()
  const totalSteps = getTotalStepsCount()
  const daysRemaining = calculateDaysRemaining()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={employeeInfo.avatar} alt={employeeInfo.name} />
              <AvatarFallback>{employeeInfo.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{employeeInfo.name}</h1>
                  <p className="text-muted-foreground">{employeeInfo.position}</p>
                  <p className="text-sm text-muted-foreground">{employeeInfo.department}</p>
                </div>
                
                <div className="text-right">
                  <Badge variant={
                    onboardingInstance.status === 'completed' ? 'default' :
                    onboardingInstance.status === 'in_progress' ? 'secondary' :
                    'outline'
                  } className="mb-2">
                    {onboardingInstance.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Started: {format(new Date(onboardingInstance.startDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{onboardingInstance.progress}%</div>
                  <div className="text-sm text-muted-foreground">Overall Progress</div>
                  <Progress value={onboardingInstance.progress} className="mt-2" />
                </div>
                
                <div>
                  <div className="text-2xl font-bold">{completedSteps}/{totalSteps}</div>
                  <div className="text-sm text-muted-foreground">Steps Completed</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-orange-600">{daysRemaining}</div>
                  <div className="text-sm text-muted-foreground">Days Remaining</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((onboardingInstance.stepProgress.reduce((sum, sp) => sum + (sp.timeSpent || 0), 0)) / 60)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Time Invested</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Alert */}
      {currentStep && (
        <Alert>
          <Play className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Step:</strong> {currentStep.title} - {currentStep.description}
            {currentStep.assignedTo !== 'employee' && (
              <span className="ml-2 text-muted-foreground">
                (Assigned to: {currentStep.assignedTo})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="mentor">Mentor Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps Progress */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} />
                    Onboarding Steps
                  </CardTitle>
                  <CardDescription>
                    Track your progress through the onboarding workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {workflow.steps.map((step, index) => {
                        const stepProgress = getStepProgress(step.id)
                        const isCurrentStep = step.id === onboardingInstance.currentStepId
                        const canComplete = step.assignedTo === 'employee' && stepProgress?.status === 'in_progress'
                        
                        return (
                          <div
                            key={step.id}
                            className={`relative p-4 border rounded-lg transition-all ${
                              isCurrentStep ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  stepProgress?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  isCurrentStep ? 'bg-primary text-primary-foreground' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {stepProgress?.status === 'completed' ? (
                                    <CheckCircle size={16} />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                {getStepIcon(step)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{step.title}</h4>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {step.estimatedDuration}min
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {step.assignedTo}
                                      </Badge>
                                      {stepProgress?.status && (
                                        <Badge variant="outline" className={`text-xs ${getStepStatusColor(stepProgress.status)}`}>
                                          {stepProgress.status.replace('_', ' ')}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {getStepStatusIcon(stepProgress?.status || 'not_started')}
                                    {stepProgress?.status === 'in_progress' && (
                                      <>
                                        {(timeTracking || {})[step.id] ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => stopTimeTracking(step.id)}
                                            className="text-red-600"
                                          >
                                            <Timer size={16} className="mr-1" />
                                            Stop
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => startTimeTracking(step.id)}
                                          >
                                            <Timer size={16} className="mr-1" />
                                            Start
                                          </Button>
                                        )}
                                      </>
                                    )}
                                    {canComplete && (
                                      <Button
                                        size="sm"
                                        onClick={() => markStepComplete(step.id)}
                                      >
                                        Complete
                                      </Button>
                                    )}
                                    {stepProgress?.status === 'completed' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedStep(step)
                                          setShowFeedbackDialog(true)
                                        }}
                                      >
                                        <Star size={16} />
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openStepDetail(step)}
                                    >
                                      <Eye size={16} />
                                    </Button>
                                  </div>
                                </div>
                                
                                {stepProgress?.notes && (
                                  <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                                    <strong>Notes:</strong> {stepProgress.notes}
                                  </div>
                                )}
                                
                                {stepProgress?.timeSpent && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Time spent: {stepProgress.timeSpent} minutes
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar size={20} />
                    Progress Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {onboardingInstance.progress}%
                    </div>
                    <Progress value={onboardingInstance.progress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {completedSteps} of {totalSteps} steps completed
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {workflow.steps.filter(s => getStepProgress(s.id)?.status === 'completed').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {workflow.steps.filter(s => getStepProgress(s.id)?.status === 'in_progress').length}
                      </div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Your Support Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>HR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">HR Contact</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>MG</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{employeeInfo.manager}</p>
                      <p className="text-xs text-muted-foreground">Manager</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>BD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{employeeInfo.buddy}</p>
                      <p className="text-xs text-muted-foreground">Onboarding Buddy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageCircle size={16} className="mr-2" />
                    Ask a Question
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Calendar size={16} className="mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <BookOpen size={16} className="mr-2" />
                    View Resources
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mentor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  Chat with Your Mentor
                </CardTitle>
                <CardDescription>
                  Direct communication with your onboarding buddy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{employeeInfo.buddy}</h4>
                    <p className="text-sm text-muted-foreground">Your Onboarding Buddy</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs">Online</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Send a Message</Label>
                  <Textarea
                    placeholder="Ask a question or share your thoughts..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={sendMentorMessage} className="w-full">
                    <MessageCircle size={16} className="mr-2" />
                    Send Message
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Recent Conversations</h4>
                  <div className="space-y-2">
                    {onboardingInstance.messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="p-2 bg-muted/30 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {message.fromId === currentUserId ? 'You' : 'Mentor'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.sentAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Mentor Notes & Progress
                </CardTitle>
                <CardDescription>
                  Your mentor's observations and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(mentorNotes || []).map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{note.mentorName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{note.mentorName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{note.category}</Badge>
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Progress Insights
                </CardTitle>
                <CardDescription>
                  AI-powered insights about your onboarding journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProgressInsights().map((insight, index) => (
                    <Alert key={index} className={
                      insight.type === 'success' ? 'border-green-200 bg-green-50' :
                      insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{insight.title}</strong><br />
                        {insight.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {getProgressInsights().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No insights available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Your onboarding performance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{calculateOverallScore()}</div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((onboardingInstance.stepProgress.reduce((sum, sp) => sum + (sp.timeSpent || 0), 0)) / 60)}h
                    </div>
                    <div className="text-xs text-muted-foreground">Time Invested</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Engagement Level</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Learning Progress</span>
                    <span className="text-sm text-muted-foreground">{onboardingInstance.progress}%</span>
                  </div>
                  <Progress value={onboardingInstance.progress} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Team Integration</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={20} />
                Onboarding Milestones
              </CardTitle>
              <CardDescription>
                Track your achievements and unlock badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(milestones || []).map((milestone) => (
                  <Card key={milestone.id} className={`p-4 ${
                    milestone.achievedDate ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        milestone.achievedDate ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {milestone.achievedDate ? (
                          <Award size={20} />
                        ) : (
                          <div className="w-6 h-6 border-2 border-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={milestone.achievedDate ? 'default' : 'outline'} className="text-xs">
                            {milestone.badge}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {milestone.points} points
                          </span>
                        </div>
                        {milestone.achievedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Achieved: {format(new Date(milestone.achievedDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Onboarding Timeline
              </CardTitle>
              <CardDescription>
                Visual timeline of your onboarding journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {workflow.steps.map((step, index) => {
                    const stepProgress = getStepProgress(step.id)
                    const isCompleted = stepProgress?.status === 'completed'
                    const isCurrentStep = step.id === onboardingInstance.currentStepId
                    
                    return (
                      <div key={step.id} className="relative flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                          isCompleted ? 'bg-green-100 border-green-500' :
                          isCurrentStep ? 'bg-primary border-primary' :
                          'bg-background border-border'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <span className={`text-xs font-medium ${
                              isCurrentStep ? 'text-primary-foreground' : 'text-muted-foreground'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {step.estimatedDuration}min
                                </Badge>
                                {stepProgress?.completedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    Completed: {format(new Date(stepProgress.completedAt), 'MMM dd, HH:mm')}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {stepProgress?.status && (
                                <Badge variant="outline" className={`text-xs ${getStepStatusColor(stepProgress.status)}`}>
                                  {stepProgress.status.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Learning Resources
              </CardTitle>
              <CardDescription>
                Documents, videos, and materials for your onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <h4 className="font-medium">Employee Handbook</h4>
                      <p className="text-sm text-muted-foreground">Company policies and procedures</p>
                      <Badge variant="outline" className="mt-2 text-xs">PDF</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Video size={20} className="text-purple-600" />
                    <div>
                      <h4 className="font-medium">Welcome Video</h4>
                      <p className="text-sm text-muted-foreground">CEO welcome and company overview</p>
                      <Badge variant="outline" className="mt-2 text-xs">15 min</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-green-600" />
                    <div>
                      <h4 className="font-medium">IT Security Guide</h4>
                      <p className="text-sm text-muted-foreground">Best practices and security policies</p>
                      <Badge variant="outline" className="mt-2 text-xs">PDF</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap size={20} className="text-orange-600" />
                    <div>
                      <h4 className="font-medium">Development Standards</h4>
                      <p className="text-sm text-muted-foreground">Coding standards and practices</p>
                      <Badge variant="outline" className="mt-2 text-xs">Guide</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Building size={20} className="text-indigo-600" />
                    <div>
                      <h4 className="font-medium">Office Map</h4>
                      <p className="text-sm text-muted-foreground">Floor plans and room locations</p>
                      <Badge variant="outline" className="mt-2 text-xs">Map</Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Users size={20} className="text-pink-600" />
                    <div>
                      <h4 className="font-medium">Team Directory</h4>
                      <p className="text-sm text-muted-foreground">Contact information and roles</p>
                      <Badge variant="outline" className="mt-2 text-xs">Directory</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Contacts</CardTitle>
                <CardDescription>
                  Important people to know during your onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">HR Manager</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail size={12} />
                        sarah.johnson@company.com
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={12} />
                        +1-555-0102
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{employeeInfo.manager}</h4>
                    <p className="text-sm text-muted-foreground">Engineering Manager</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail size={12} />
                        mike.davis@company.com
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={12} />
                        +1-555-0103
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{employeeInfo.buddy}</h4>
                    <p className="text-sm text-muted-foreground">Senior Developer • Onboarding Buddy</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail size={12} />
                        john.smith@company.com
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={12} />
                        +1-555-0101
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Your contact and employment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{employeeInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">{employeeInfo.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">{employeeInfo.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(employeeInfo.startDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-muted-foreground">{employeeInfo.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Manager</Label>
                    <p className="text-sm text-muted-foreground">{employeeInfo.manager}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={20} />
                Messages & Communication
              </CardTitle>
              <CardDescription>
                Recent messages and communication from your onboarding team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingInstance.messages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{message.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            From: {message.fromId}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.sentAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
                
                {onboardingInstance.messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step Detail Dialog */}
      <Dialog open={showStepDetail} onOpenChange={setShowStepDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStep && getStepIcon(selectedStep)}
              {selectedStep?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedStep?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStep && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedStep.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{selectedStep.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Duration</Label>
                  <p className="text-sm text-muted-foreground">{selectedStep.estimatedDuration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-muted-foreground">{selectedStep.assignedTo}</p>
                </div>
              </div>
              
              {selectedStep.content?.instructions && (
                <div>
                  <Label className="text-sm font-medium">Instructions</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedStep.content.instructions}</p>
                </div>
              )}
              
              {selectedStep.content?.checklistItems && (
                <div>
                  <Label className="text-sm font-medium">Checklist Items</Label>
                  <div className="space-y-2 mt-2">
                    {selectedStep.content.checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <CheckCircle size={16} className={item.completed ? 'text-green-600' : 'text-gray-400'} />
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                        {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedStep.content?.tasks && (
                <div>
                  <Label className="text-sm font-medium">Tasks</Label>
                  <div className="space-y-2 mt-2">
                    {selectedStep.content.tasks.map((task) => (
                      <div key={task.id} className="p-2 border rounded">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-medium">{task.title}</h5>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star size={20} />
              Rate This Step
            </DialogTitle>
            <DialogDescription>
              How was your experience with "{selectedStep?.title}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setStepRating(rating)}
                  >
                    <Star 
                      size={20} 
                      className={rating <= stepRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {stepRating}/5
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium">
                Comments (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about this step..."
                value={stepFeedback}
                onChange={(e) => setStepFeedback(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFeedbackDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => selectedStep && submitStepFeedback(selectedStep.id)}
                className="flex-1"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}