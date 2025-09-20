import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  OnboardingWorkflow,
  OnboardingInstance,
  OnboardingStep,
  OnboardingTemplate,
  OnboardingAnalytics,
  OnboardingFilter,
  OnboardingSortOptions
} from '@/types/onboarding'
import {
  UserPlus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Warning as AlertTriangle,
  Play,
  Pause,
  ArrowClockwise as RotateCcw,
  Gear as Settings,
  FileText,
  Video,
  Calendar as CalendarIcon,
  ChatCircle as MessageCircle,
  Trophy as Award,
  TrendUp,
  Funnel as Filter,
  Download,
  Upload,
  Copy,
  PencilSimple as Edit,
  Trash,
  Eye,
  Plus,
  MagnifyingGlass as Search,
  ArrowsDownUp as ArrowUpDown,
  Building,
  Briefcase,
  GraduationCap,
  Handshake,
  Shield,
  Envelope as Mail,
  Phone,
  MapPin,
  Link,
  Star,
  Target,
  BookOpen,
  Coffee,
  Users as Users2,
  Calendar as Calendar2,
  ClipboardText as ClipboardCheck,
  FlowArrow as Workflow,
  Timer,
  ChartBar as BarChart3
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface OnboardingWorkflowManagerProps {
  companyId: string
  departmentId?: string
  currentUserId: string
  userRole: 'super_admin' | 'company_admin' | 'hr_manager' | 'manager' | 'user'
}

export function OnboardingWorkflowManager({
  companyId,
  departmentId,
  currentUserId,
  userRole
}: OnboardingWorkflowManagerProps) {
  // Permission checks
  const canManageWorkflows = ['super_admin', 'company_admin', 'hr_manager'].includes(userRole)
  const canViewAll = ['super_admin', 'company_admin', 'hr_manager'].includes(userRole)
  const canManageInstances = ['super_admin', 'company_admin', 'hr_manager', 'manager'].includes(userRole)

  // State management
  const [workflows, setWorkflows] = useKV<OnboardingWorkflow[]>(`onboarding-workflows-${companyId}`, [])
  const [instances, setInstances] = useKV<OnboardingInstance[]>(`onboarding-instances-${companyId}`, [])
  const [templates, setTemplates] = useKV<OnboardingTemplate[]>(`onboarding-templates`, [])
  const [selectedWorkflow, setSelectedWorkflow] = useState<OnboardingWorkflow | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<OnboardingInstance | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Dialog states
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [showCreateInstanceDialog, setShowCreateInstanceDialog] = useState(false)
  const [showWorkflowBuilderDialog, setShowWorkflowBuilderDialog] = useState(false)
  const [showInstanceDetailDialog, setShowInstanceDetailDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  
  // Filter and search
  const [filters, setFilters] = useState<OnboardingFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOptions, setSortOptions] = useState<OnboardingSortOptions>({
    field: 'startDate',
    direction: 'desc'
  })

  // Ensure we always have arrays
  const safeWorkflows = workflows || []
  const safeInstances = instances || []
  const safeTemplates = templates || []

  // Generate mock data if empty
  useEffect(() => {
    if (safeWorkflows.length === 0) {
      generateMockWorkflows()
    }
    if (safeInstances.length === 0) {
      generateMockInstances()
    }
    if (safeTemplates.length === 0) {
      generateMockTemplates()
    }
  }, [])

  const generateMockWorkflows = () => {
    const mockWorkflows: OnboardingWorkflow[] = [
      {
        id: 'workflow-001',
        name: 'Software Engineer Onboarding',
        description: 'Comprehensive onboarding for technical roles in the IT department',
        version: '2.1',
        companyId,
        departmentId: 'dept-002', // IT Department
        isActive: true,
        isTemplate: false,
        estimatedDuration: 14, // 2 weeks
        steps: [
          {
            id: 'step-001',
            title: 'Welcome & Orientation',
            description: 'Introduction to company culture and values',
            type: 'welcome',
            category: 'orientation',
            order: 1,
            estimatedDuration: 60,
            isRequired: true,
            assignedTo: 'hr',
            content: {
              instructions: 'Welcome to our company! This step introduces you to our mission, values, and culture.',
              videoUrl: 'https://example.com/welcome-video',
              checklistItems: [
                { id: 'c1', text: 'Watch welcome video', required: true, completed: false },
                { id: 'c2', text: 'Read company handbook', required: true, completed: false },
                { id: 'c3', text: 'Complete culture quiz', required: false, completed: false }
              ]
            },
            autoComplete: false
          },
          {
            id: 'step-002',
            title: 'HR Documentation',
            description: 'Complete essential HR paperwork and benefits enrollment',
            type: 'form',
            category: 'hr',
            order: 2,
            estimatedDuration: 90,
            isRequired: true,
            assignedTo: 'hr',
            dependsOn: ['step-001'],
            content: {
              instructions: 'Please complete all required forms and benefit selections.',
              formFields: [
                {
                  id: 'emergency_contact',
                  type: 'text',
                  label: 'Emergency Contact Name',
                  required: true
                },
                {
                  id: 'emergency_phone',
                  type: 'phone',
                  label: 'Emergency Contact Phone',
                  required: true
                },
                {
                  id: 'dietary_restrictions',
                  type: 'textarea',
                  label: 'Dietary Restrictions (Optional)',
                  required: false
                }
              ]
            }
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
            dependsOn: ['step-002'],
            content: {
              instructions: 'IT will provide you with necessary equipment and system access.',
              tasks: [
                {
                  id: 't1',
                  title: 'Issue laptop and peripherals',
                  description: 'Provide MacBook Pro, monitor, keyboard, mouse',
                  type: 'setup',
                  priority: 'high',
                  assignedTo: 'it-admin',
                  completed: false
                },
                {
                  id: 't2',
                  title: 'Create development accounts',
                  description: 'GitHub, Slack, Jira, AWS access',
                  type: 'setup',
                  priority: 'high',
                  assignedTo: 'it-admin',
                  completed: false
                }
              ]
            },
            departmentSettings: {
              moduleAccess: ['inventory', 'project', 'settings'],
              permissions: ['read', 'write']
            }
          },
          {
            id: 'step-004',
            title: 'Security Training',
            description: 'Mandatory security awareness and compliance training',
            type: 'training',
            category: 'compliance',
            order: 4,
            estimatedDuration: 45,
            isRequired: true,
            assignedTo: 'system',
            dependsOn: ['step-003'],
            content: {
              instructions: 'Complete all security training modules.',
              videoUrl: 'https://example.com/security-training',
              checklistItems: [
                { id: 's1', text: 'Password security training', required: true, completed: false },
                { id: 's2', text: 'Phishing awareness', required: true, completed: false },
                { id: 's3', text: 'Data protection policies', required: true, completed: false }
              ]
            }
          },
          {
            id: 'step-005',
            title: 'Team Introduction',
            description: 'Meet your team, manager, and assigned buddy',
            type: 'task',
            category: 'social',
            order: 5,
            estimatedDuration: 60,
            isRequired: true,
            assignedTo: 'manager',
            dependsOn: ['step-003'],
            content: {
              instructions: 'Scheduled meetings with team members and manager.',
              tasks: [
                {
                  id: 'm1',
                  title: '1:1 with Manager',
                  description: 'Initial meeting to discuss role and expectations',
                  type: 'meeting',
                  priority: 'high',
                  assignedTo: 'manager',
                  completed: false
                },
                {
                  id: 'm2',
                  title: 'Team Introduction Meeting',
                  description: 'Meet the development team',
                  type: 'meeting',
                  priority: 'medium',
                  assignedTo: 'manager',
                  completed: false
                }
              ]
            },
            departmentSettings: {
              mentorAssignment: {
                buddyId: 'buddy-user-001',
                meetingSchedule: 'weekly'
              }
            }
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
            dependsOn: ['step-003', 'step-005'],
            content: {
              instructions: 'Your buddy will help you set up the development environment.',
              checklistItems: [
                { id: 'd1', text: 'Install development tools', required: true, completed: false },
                { id: 'd2', text: 'Clone repositories', required: true, completed: false },
                { id: 'd3', text: 'Set up local database', required: true, completed: false },
                { id: 'd4', text: 'Run first application', required: true, completed: false }
              ]
            }
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
            dependsOn: ['step-006'],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            content: {
              instructions: 'Manager will review your progress and address any concerns.',
              formFields: [
                {
                  id: 'week1_feedback',
                  type: 'textarea',
                  label: 'How was your first week? Any concerns or feedback?',
                  required: true
                },
                {
                  id: 'support_needed',
                  type: 'textarea',
                  label: 'What additional support do you need?',
                  required: false
                }
              ]
            }
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
    ]
    setWorkflows(mockWorkflows)
  }

  const generateMockInstances = () => {
    const mockInstances: OnboardingInstance[] = [
      {
        id: 'instance-001',
        workflowId: 'workflow-001',
        workflowVersion: '2.1',
        employeeId: 'emp-001',
        companyId,
        departmentId: 'dept-002',
        managerId: 'manager-001',
        buddyId: 'buddy-001',
        hrContactId: 'hr-001',
        status: 'in_progress',
        currentStepId: 'step-003',
        progress: 35,
        startDate: new Date('2024-01-22'),
        expectedCompletionDate: new Date('2024-02-05'),
        stepProgress: [
          {
            stepId: 'step-001',
            status: 'completed',
            startedAt: new Date('2024-01-22T09:00:00Z'),
            completedAt: new Date('2024-01-22T10:30:00Z'),
            completedBy: 'emp-001',
            timeSpent: 90
          },
          {
            stepId: 'step-002',
            status: 'completed',
            startedAt: new Date('2024-01-22T14:00:00Z'),
            completedAt: new Date('2024-01-23T11:00:00Z'),
            completedBy: 'emp-001',
            approvedBy: 'hr-001',
            timeSpent: 120
          },
          {
            stepId: 'step-003',
            status: 'in_progress',
            startedAt: new Date('2024-01-23T13:00:00Z'),
            assignedTo: 'it-admin',
            timeSpent: 60
          }
        ],
        notifications: [],
        messages: [],
        escalations: [],
        settings: {
          sendReminders: true,
          allowSelfService: true,
          requireManagerApproval: true,
          enableMentoring: true
        },
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-23')
      },
      {
        id: 'instance-002',
        workflowId: 'workflow-001',
        workflowVersion: '2.1',
        employeeId: 'emp-002',
        companyId,
        departmentId: 'dept-002',
        managerId: 'manager-001',
        status: 'completed',
        currentStepId: 'step-007',
        progress: 100,
        startDate: new Date('2024-01-08'),
        expectedCompletionDate: new Date('2024-01-22'),
        actualCompletionDate: new Date('2024-01-20'),
        stepProgress: [
          {
            stepId: 'step-001',
            status: 'completed',
            startedAt: new Date('2024-01-08T09:00:00Z'),
            completedAt: new Date('2024-01-08T10:00:00Z'),
            completedBy: 'emp-002',
            timeSpent: 60
          },
          {
            stepId: 'step-002',
            status: 'completed',
            startedAt: new Date('2024-01-08T14:00:00Z'),
            completedAt: new Date('2024-01-09T10:00:00Z'),
            completedBy: 'emp-002',
            approvedBy: 'hr-001',
            timeSpent: 90
          },
          {
            stepId: 'step-003',
            status: 'completed',
            startedAt: new Date('2024-01-09T13:00:00Z'),
            completedAt: new Date('2024-01-10T11:00:00Z'),
            completedBy: 'it-admin',
            timeSpent: 120
          },
          {
            stepId: 'step-004',
            status: 'completed',
            startedAt: new Date('2024-01-10T14:00:00Z'),
            completedAt: new Date('2024-01-10T15:00:00Z'),
            completedBy: 'emp-002',
            timeSpent: 45
          },
          {
            stepId: 'step-005',
            status: 'completed',
            startedAt: new Date('2024-01-11T09:00:00Z'),
            completedAt: new Date('2024-01-11T10:30:00Z'),
            completedBy: 'manager-001',
            timeSpent: 90
          },
          {
            stepId: 'step-006',
            status: 'completed',
            startedAt: new Date('2024-01-12T09:00:00Z'),
            completedAt: new Date('2024-01-15T17:00:00Z'),
            completedBy: 'buddy-001',
            timeSpent: 180
          },
          {
            stepId: 'step-007',
            status: 'completed',
            startedAt: new Date('2024-01-19T14:00:00Z'),
            completedAt: new Date('2024-01-20T14:30:00Z'),
            completedBy: 'manager-001',
            approvedBy: 'manager-001',
            timeSpent: 30
          }
        ],
        notifications: [],
        messages: [],
        escalations: [],
        settings: {
          sendReminders: true,
          allowSelfService: true,
          requireManagerApproval: true,
          enableMentoring: true
        },
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-20'),
        completedBy: 'emp-002'
      }
    ]
    setInstances(mockInstances)
  }

  const generateMockTemplates = () => {
    const mockTemplates: OnboardingTemplate[] = [
      {
        id: 'template-001',
        name: 'Standard Employee Onboarding',
        description: 'Basic onboarding template for all new employees',
        category: 'general',
        isPublic: true,
        version: '1.0',
        estimatedDuration: 7,
        steps: [
          {
            title: 'Welcome & Company Introduction',
            description: 'Introduction to company culture, mission, and values',
            type: 'welcome',
            category: 'orientation',
            order: 1,
            estimatedDuration: 60,
            isRequired: true,
            assignedTo: 'hr'
          },
          {
            title: 'HR Documentation',
            description: 'Complete essential paperwork and benefits enrollment',
            type: 'form',
            category: 'hr',
            order: 2,
            estimatedDuration: 90,
            isRequired: true,
            assignedTo: 'hr'
          },
          {
            title: 'Basic IT Setup',
            description: 'Computer and email setup',
            type: 'task',
            category: 'it',
            order: 3,
            estimatedDuration: 60,
            isRequired: true,
            assignedTo: 'it'
          },
          {
            title: 'Security & Compliance Training',
            description: 'Mandatory security awareness training',
            type: 'training',
            category: 'compliance',
            order: 4,
            estimatedDuration: 45,
            isRequired: true,
            assignedTo: 'system'
          },
          {
            title: 'Department Introduction',
            description: 'Meet your team and manager',
            type: 'task',
            category: 'department',
            order: 5,
            estimatedDuration: 60,
            isRequired: true,
            assignedTo: 'manager'
          }
        ],
        usageCount: 15,
        rating: 4.3,
        reviews: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
        createdBy: currentUserId,
        tags: ['general', 'standard', 'all-departments']
      },
      {
        id: 'template-002',
        name: 'Executive Onboarding',
        description: 'Comprehensive onboarding for executive and leadership roles',
        category: 'executive',
        isPublic: true,
        version: '1.0',
        estimatedDuration: 30,
        steps: [
          {
            title: 'Leadership Welcome & Vision',
            description: 'Executive briefing on company strategy and vision',
            type: 'welcome',
            category: 'orientation',
            order: 1,
            estimatedDuration: 120,
            isRequired: true,
            assignedTo: 'hr'
          },
          {
            title: 'Board & Stakeholder Introductions',
            description: 'Meetings with key stakeholders and board members',
            type: 'task',
            category: 'social',
            order: 2,
            estimatedDuration: 180,
            isRequired: true,
            assignedTo: 'hr'
          },
          {
            title: 'Financial & Legal Briefing',
            description: 'Review of financial position and legal matters',
            type: 'training',
            category: 'compliance',
            order: 3,
            estimatedDuration: 240,
            isRequired: true,
            assignedTo: 'system'
          },
          {
            title: 'Strategic Planning Session',
            description: 'Initial strategic planning and goal setting',
            type: 'task',
            category: 'department',
            order: 4,
            estimatedDuration: 300,
            isRequired: true,
            assignedTo: 'manager'
          }
        ],
        usageCount: 3,
        rating: 4.8,
        reviews: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
        createdBy: currentUserId,
        tags: ['executive', 'leadership', 'strategic']
      }
    ]
    setTemplates(mockTemplates)
  }

  // Filter and sort instances
  const getFilteredInstances = () => {
    let filtered = safeInstances.filter(instance => {
      // Search filter
      if (searchTerm) {
        const workflow = safeWorkflows.find(w => w.id === instance.workflowId)
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          workflow?.name.toLowerCase().includes(searchLower) ||
          instance.employeeId.toLowerCase().includes(searchLower) ||
          instance.status.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(instance.status)) return false
      }

      // Department filter
      if (filters.department && filters.department.length > 0) {
        if (!filters.department.includes(instance.departmentId)) return false
      }

      // Progress filter
      if (filters.progress) {
        if (instance.progress < filters.progress.min || instance.progress > filters.progress.max) {
          return false
        }
      }

      // Overdue filter
      if (filters.overdue) {
        const isOverdue = new Date() > instance.expectedCompletionDate && instance.status !== 'completed'
        if (!isOverdue) return false
      }

      return true
    })

    // Sort instances
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortOptions.field) {
        case 'startDate':
          aValue = new Date(a.startDate).getTime()
          bValue = new Date(b.startDate).getTime()
          break
        case 'progress':
          aValue = a.progress
          bValue = b.progress
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'employee':
          aValue = a.employeeId
          bValue = b.employeeId
          break
        case 'department':
          aValue = a.departmentId
          bValue = b.departmentId
          break
        case 'completionDate':
          aValue = a.actualCompletionDate ? new Date(a.actualCompletionDate).getTime() : 0
          bValue = b.actualCompletionDate ? new Date(b.actualCompletionDate).getTime() : 0
          break
        default:
          return 0
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }

  // Calculate dashboard statistics
  const getDashboardStats = () => {
    const totalInstances = safeInstances.length
    const completedInstances = safeInstances.filter(i => i.status === 'completed').length
    const inProgressInstances = safeInstances.filter(i => i.status === 'in_progress').length
    const overdueInstances = safeInstances.filter(i => 
      new Date() > i.expectedCompletionDate && i.status !== 'completed'
    ).length
    
    const averageProgress = totalInstances > 0 
      ? Math.round(safeInstances.reduce((sum, i) => sum + i.progress, 0) / totalInstances)
      : 0

    const completionRate = totalInstances > 0 
      ? Math.round((completedInstances / totalInstances) * 100)
      : 0

    return {
      totalInstances,
      completedInstances,
      inProgressInstances,
      overdueInstances,
      averageProgress,
      completionRate
    }
  }

  const handleCreateWorkflow = () => {
    toast.info('Workflow creation dialog would open here')
    setShowCreateWorkflowDialog(true)
  }

  const handleCreateInstance = () => {
    toast.info('Instance creation dialog would open here')
    setShowCreateInstanceDialog(true)
  }

  const handleStartInstance = (instanceId: string) => {
    setInstances(prev => 
      (prev || []).map(instance => 
        instance.id === instanceId 
          ? { ...instance, status: 'in_progress' as const, currentStepId: instance.stepProgress[0]?.stepId }
          : instance
      )
    )
    toast.success('Onboarding instance started successfully')
  }

  const handlePauseInstance = (instanceId: string) => {
    setInstances(prev => 
      (prev || []).map(instance => 
        instance.id === instanceId 
          ? { ...instance, status: 'paused' as const }
          : instance
      )
    )
    toast.success('Onboarding instance paused')
  }

  const stats = getDashboardStats()
  const filteredInstances = getFilteredInstances()

  if (!canViewAll && userRole !== 'manager') {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view onboarding workflows.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Onboardings</p>
                <p className="text-2xl font-bold">{stats.totalInstances}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressInstances}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedInstances}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueInstances}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="instances" className="flex items-center gap-2">
              <UserPlus size={16} />
              Active Onboardings
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow size={16} />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText size={16} />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {canManageWorkflows && (
              <>
                <Button onClick={handleCreateWorkflow} className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Workflow
                </Button>
                <Button onClick={handleCreateInstance} variant="outline" className="flex items-center gap-2">
                  <UserPlus size={16} />
                  Start Onboarding
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Instances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Recent Onboardings
                </CardTitle>
                <CardDescription>
                  Latest onboarding activities and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {safeInstances.slice(0, 5).map((instance) => {
                      const workflow = safeWorkflows.find(w => w.id === instance.workflowId)
                      const isOverdue = new Date() > instance.expectedCompletionDate && instance.status !== 'completed'
                      
                      return (
                        <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              instance.status === 'completed' ? 'bg-green-500' :
                              instance.status === 'in_progress' ? 'bg-blue-500' :
                              instance.status === 'paused' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{workflow?.name || 'Unknown Workflow'}</p>
                              <p className="text-xs text-muted-foreground">
                                Employee: {instance.employeeId} • Started: {format(new Date(instance.startDate), 'MMM dd')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              instance.status === 'completed' ? 'default' :
                              instance.status === 'in_progress' ? 'secondary' :
                              isOverdue ? 'destructive' : 'outline'
                            }>
                              {instance.status}
                            </Badge>
                            <Progress value={instance.progress} className="w-20 h-2 mt-1" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow size={20} />
                  Active Workflows
                </CardTitle>
                <CardDescription>
                  Currently active onboarding workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {safeWorkflows.filter(w => w.isActive).map((workflow) => {
                      const instanceCount = safeInstances.filter(i => i.workflowId === workflow.id).length
                      const activeCount = safeInstances.filter(i => 
                        i.workflowId === workflow.id && i.status === 'in_progress'
                      ).length
                      
                      return (
                        <div key={workflow.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{workflow.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{workflow.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {workflow.steps.length} steps
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ~{workflow.estimatedDuration} days
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {instanceCount} total • {activeCount} active
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary">v{workflow.version}</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common onboarding management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={handleCreateInstance}
                >
                  <UserPlus size={24} />
                  <span className="text-sm">Start New Onboarding</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('workflows')}
                >
                  <Workflow size={24} />
                  <span className="text-sm">Manage Workflows</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('templates')}
                >
                  <FileText size={24} />
                  <span className="text-sm">Browse Templates</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 size={24} />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search onboardings by workflow, employee, or status..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={filters.status?.join(',') || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          status: value ? [value as any] : undefined
                        }))
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOptions(prev => ({ 
                        ...prev, 
                        direction: prev.direction === 'asc' ? 'desc' : 'asc' 
                      }))}
                      className="px-3"
                    >
                      <ArrowUpDown size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Quick Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={!filters.overdue ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, overdue: !prev.overdue }))}
                  >
                    Overdue ({safeInstances.filter(i => 
                      new Date() > i.expectedCompletionDate && i.status !== 'completed'
                    ).length})
                  </Button>
                  <Button
                    variant={filters.status?.[0] !== 'in_progress' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      status: prev.status?.[0] === 'in_progress' ? undefined : ['in_progress'] 
                    }))}
                  >
                    In Progress ({stats.inProgressInstances})
                  </Button>
                  <Button
                    variant={filters.status?.[0] !== 'completed' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      status: prev.status?.[0] === 'completed' ? undefined : ['completed'] 
                    }))}
                  >
                    Completed ({stats.completedInstances})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instances List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredInstances.map((instance) => {
              const workflow = safeWorkflows.find(w => w.id === instance.workflowId)
              const isOverdue = new Date() > instance.expectedCompletionDate && instance.status !== 'completed'
              const currentStep = workflow?.steps.find(s => s.id === instance.currentStepId)
              
              return (
                <Card key={instance.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{workflow?.name || 'Unknown Workflow'}</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              Employee: {instance.employeeId} • Department: {instance.departmentId}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant={
                                instance.status === 'completed' ? 'default' :
                                instance.status === 'in_progress' ? 'secondary' :
                                instance.status === 'paused' ? 'outline' :
                                isOverdue ? 'destructive' : 'outline'
                              }>
                                {instance.status.replace('_', ' ')}
                              </Badge>
                              
                              {isOverdue && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle size={12} />
                                  Overdue
                                </Badge>
                              )}
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarIcon size={14} />
                                <span>Started: {format(new Date(instance.startDate), 'MMM dd, yyyy')}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Timer size={14} />
                                <span>Due: {format(new Date(instance.expectedCompletionDate), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                            
                            {currentStep && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm font-medium">Current Step: {currentStep.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{currentStep.description}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right min-w-[120px]">
                            <div className="text-2xl font-bold">{instance.progress}%</div>
                            <Progress value={instance.progress} className="w-20 h-2 mt-1" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {instance.stepProgress.filter(s => s.status === 'completed').length} / {workflow?.steps.length || 0} steps
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInstance(instance)
                            setShowInstanceDetailDialog(true)
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        
                        {canManageInstances && (
                          <>
                            {instance.status === 'not_started' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartInstance(instance.id)}
                              >
                                <Play size={16} />
                              </Button>
                            )}
                            
                            {instance.status === 'in_progress' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePauseInstance(instance.id)}
                              >
                                <Pause size={16} />
                              </Button>
                            )}
                            
                            {instance.status === 'paused' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartInstance(instance.id)}
                              >
                                <Play size={16} />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredInstances.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No onboardings found</h3>
                <p className="text-muted-foreground mb-4">
                  {safeInstances.length === 0 
                    ? "Get started by creating your first onboarding instance"
                    : "Try adjusting your search criteria"
                  }
                </p>
                {canManageInstances && safeInstances.length === 0 && (
                  <Button onClick={handleCreateInstance}>
                    <UserPlus size={16} className="mr-2" />
                    Start First Onboarding
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {safeWorkflows.map((workflow) => {
              const instanceCount = safeInstances.filter(i => i.workflowId === workflow.id).length
              const activeCount = safeInstances.filter(i => 
                i.workflowId === workflow.id && i.status === 'in_progress'
              ).length
              
              return (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">v{workflow.version}</Badge>
                          <Badge variant={workflow.isActive ? 'default' : 'outline'}>
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardDescription>
                      </div>
                      {canManageWorkflows && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ClipboardCheck size={14} />
                        <span>{workflow.steps.length} steps</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        <span>~{workflow.estimatedDuration} days</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={14} />
                        <span>{instanceCount} total instances</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Play size={14} />
                        <span>{activeCount} active</span>
                      </div>
                    </div>
                    
                    {workflow.departmentId && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building size={14} />
                        <span>Department: {workflow.departmentId}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workflow.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{workflow.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {safeTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge variant="outline">v{template.version}</Badge>
                        {template.isPublic && (
                          <Badge variant="outline" className="text-xs">Public</Badge>
                        )}
                      </CardDescription>
                    </div>
                    {canManageWorkflows && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Copy size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ClipboardCheck size={14} />
                      <span>{template.steps.length} steps</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={14} />
                      <span>~{template.estimatedDuration} days</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download size={14} />
                      <span>{template.usageCount} uses</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star size={14} />
                      <span>{template.rating.toFixed(1)} rating</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button size="sm" className="w-full">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Onboarding Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics and insights for onboarding processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features would be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}