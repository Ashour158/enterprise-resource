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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  OnboardingStep,
  OnboardingFormField,
  OnboardingTask,
  OnboardingChecklistItem,
  OnboardingResource
} from '@/types/onboarding'
import { Department } from '@/types/department'
import { ERPModule } from '@/types/erp'
import {
  Building,
  Users,
  Plus,
  PencilSimple as Edit,
  Trash,
  MagnifyingGlass as Search,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Link,
  Target,
  BookOpen,
  GraduationCap,
  Handshake,
  Shield,
  Gear,
  User,
  Calendar,
  Briefcase,
  Coffee,
  ChartBar,
  Warning,
  ArrowUp,
  ArrowDown,
  Copy,
  Play,
  Eye,
  Star,
  FlowArrow,
  ClipboardText,
  Envelope,
  Phone,
  MapPin,
  TreeStructure
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DepartmentOnboardingBuilderProps {
  companyId: string
  departmentId: string
  currentUserId: string
  userRole: 'super_admin' | 'company_admin' | 'hr_manager' | 'manager'
  onClose: () => void
}

export function DepartmentOnboardingBuilder({
  companyId,
  departmentId,
  currentUserId,
  userRole,
  onClose
}: DepartmentOnboardingBuilderProps) {
  // Permission checks
  const canManage = ['super_admin', 'company_admin', 'hr_manager'].includes(userRole)

  // State management
  const [departments, setDepartments] = useKV<Department[]>(`departments-${companyId}`, [])
  const [modules, setModules] = useKV<ERPModule[]>(`erp-modules-${companyId}`, [])
  const [workflowSteps, setWorkflowSteps] = useState<OnboardingStep[]>([])
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Form states
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(14)
  
  // Step builder states
  const [stepFormData, setStepFormData] = useState<Partial<OnboardingStep>>({})
  const [showStepEditor, setShowStepEditor] = useState(false)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)

  // Template steps for different department types
  const departmentTemplates = {
    'IT': [
      {
        title: 'Development Environment Setup',
        description: 'Configure development tools and access',
        type: 'task' as const,
        category: 'it' as const,
        estimatedDuration: 180,
        tasks: [
          { title: 'Install development tools', description: 'IDE, Git, Docker, etc.' },
          { title: 'Set up VPN access', description: 'Configure secure remote access' },
          { title: 'Repository access', description: 'Clone projects and repositories' }
        ]
      },
      {
        title: 'Code Review Standards',
        description: 'Learn coding standards and review processes',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 90
      },
      {
        title: 'Security Protocols',
        description: 'Cybersecurity training and best practices',
        type: 'training' as const,
        category: 'compliance' as const,
        estimatedDuration: 60
      }
    ],
    'HR': [
      {
        title: 'HRIS System Training',
        description: 'Learn to use HR information systems',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 120
      },
      {
        title: 'Employment Law Compliance',
        description: 'Legal requirements and compliance training',
        type: 'training' as const,
        category: 'compliance' as const,
        estimatedDuration: 90
      },
      {
        title: 'Recruitment Process',
        description: 'Learn hiring procedures and best practices',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 150
      }
    ],
    'Sales': [
      {
        title: 'Sales Methodology Training',
        description: 'Learn company sales process and techniques',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 240
      },
      {
        title: 'CRM System Setup',
        description: 'Configure and learn customer management system',
        type: 'task' as const,
        category: 'it' as const,
        estimatedDuration: 90
      },
      {
        title: 'Product Knowledge',
        description: 'Deep dive into company products and services',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 300
      }
    ],
    'Finance': [
      {
        title: 'Financial Systems Access',
        description: 'Set up access to accounting and financial systems',
        type: 'task' as const,
        category: 'it' as const,
        estimatedDuration: 90
      },
      {
        title: 'Compliance Training',
        description: 'Financial regulations and audit procedures',
        type: 'training' as const,
        category: 'compliance' as const,
        estimatedDuration: 120
      },
      {
        title: 'Budget Process Training',
        description: 'Learn budgeting and financial planning processes',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 180
      }
    ],
    'Marketing': [
      {
        title: 'Brand Guidelines Training',
        description: 'Learn company brand standards and guidelines',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 90
      },
      {
        title: 'Marketing Tools Setup',
        description: 'Configure marketing automation and analytics tools',
        type: 'task' as const,
        category: 'it' as const,
        estimatedDuration: 120
      },
      {
        title: 'Market Research Methods',
        description: 'Learn research methodologies and tools',
        type: 'training' as const,
        category: 'department' as const,
        estimatedDuration: 150
      }
    ]
  }

  // Initialize data
  useEffect(() => {
    const dept = (departments || []).find(d => d.id === departmentId)
    setCurrentDepartment(dept || null)
    
    if (dept) {
      setWorkflowName(`${dept.name} Onboarding`)
      setWorkflowDescription(`Comprehensive onboarding workflow for ${dept.name} department`)
      
      // Load template steps based on department type
      const deptType = getDepartmentType(dept.name)
      const templateSteps = departmentTemplates[deptType] || []
      
      const baseSteps: OnboardingStep[] = [
        {
          id: 'step-welcome',
          title: 'Welcome & Orientation',
          description: 'Introduction to company culture and department overview',
          type: 'welcome',
          category: 'orientation',
          order: 1,
          estimatedDuration: 60,
          isRequired: true,
          assignedTo: 'hr',
          content: {
            instructions: `Welcome to ${dept.name}! This orientation will introduce you to our company culture and your specific department role.`,
            checklistItems: [
              { id: 'c1', text: 'Watch company welcome video', required: true, completed: false },
              { id: 'c2', text: 'Read department overview', required: true, completed: false },
              { id: 'c3', text: 'Complete culture assessment', required: false, completed: false }
            ]
          }
        },
        {
          id: 'step-hr-docs',
          title: 'HR Documentation',
          description: 'Complete essential paperwork and benefits',
          type: 'form',
          category: 'hr',
          order: 2,
          estimatedDuration: 90,
          isRequired: true,
          assignedTo: 'hr',
          dependsOn: ['step-welcome'],
          content: {
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
                id: 'bank_details',
                type: 'text',
                label: 'Bank Account Details',
                required: true
              }
            ]
          }
        },
        {
          id: 'step-it-setup',
          title: 'IT Setup & Access',
          description: 'Configure computer, email, and system access',
          type: 'task',
          category: 'it',
          order: 3,
          estimatedDuration: 120,
          isRequired: true,
          assignedTo: 'it',
          dependsOn: ['step-hr-docs'],
          content: {
            tasks: [
              {
                id: 't1',
                title: 'Issue equipment',
                description: 'Provide laptop, phone, and accessories',
                type: 'setup',
                priority: 'high',
                assignedTo: 'it-admin',
                completed: false
              },
              {
                id: 't2',
                title: 'Create accounts',
                description: 'Email, system access, and permissions',
                type: 'setup',
                priority: 'high',
                assignedTo: 'it-admin',
                completed: false
              }
            ]
          },
          departmentSettings: {
            moduleAccess: dept.moduleAccess,
            permissions: dept.permissions.map(p => p.permissions).flat()
          }
        }
      ]

      // Add department-specific steps
      const departmentSpecificSteps = templateSteps.map((template, index) => ({
        id: `step-dept-${index + 1}`,
        title: template.title,
        description: template.description,
        type: template.type,
        category: template.category,
        order: baseSteps.length + index + 1,
        estimatedDuration: template.estimatedDuration,
        isRequired: true,
        assignedTo: 'manager' as const,
        dependsOn: index === 0 ? ['step-it-setup'] : [`step-dept-${index}`],
        content: {
          instructions: template.description,
          tasks: template.tasks?.map((task, i) => ({
            id: `task-${i}`,
            title: task.title,
            description: task.description,
            type: 'training' as const,
            priority: 'medium' as const,
            assignedTo: 'manager',
            completed: false
          }))
        },
        departmentSettings: {
          moduleAccess: dept.moduleAccess,
          permissions: dept.permissions.map(p => p.permissions).flat()
        }
      }))

      const finalStep: OnboardingStep = {
        id: 'step-review',
        title: 'First Week Review',
        description: 'Manager review and feedback session',
        type: 'review',
        category: 'department',
        order: baseSteps.length + departmentSpecificSteps.length + 1,
        estimatedDuration: 30,
        isRequired: true,
        assignedTo: 'manager',
        dependsOn: departmentSpecificSteps.length > 0 ? [`step-dept-${departmentSpecificSteps.length}`] : ['step-it-setup'],
        content: {
          formFields: [
            {
              id: 'feedback',
              type: 'textarea',
              label: 'How has your first week been?',
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

      setWorkflowSteps([...baseSteps, ...departmentSpecificSteps, finalStep])
    }
  }, [departmentId, departments])

  const getDepartmentType = (deptName: string): keyof typeof departmentTemplates => {
    const name = deptName.toLowerCase()
    if (name.includes('it') || name.includes('technology') || name.includes('software')) return 'IT'
    if (name.includes('hr') || name.includes('human')) return 'HR'
    if (name.includes('sales')) return 'Sales'
    if (name.includes('finance') || name.includes('accounting')) return 'Finance'
    if (name.includes('marketing')) return 'Marketing'
    return 'IT' // Default
  }

  const addNewStep = () => {
    const newStep: OnboardingStep = {
      id: `step-${Date.now()}`,
      title: 'New Step',
      description: '',
      type: 'task',
      category: 'department',
      order: workflowSteps.length + 1,
      estimatedDuration: 60,
      isRequired: true,
      assignedTo: 'manager',
      content: {}
    }
    setWorkflowSteps([...workflowSteps, newStep])
    setEditingStepIndex(workflowSteps.length)
    setShowStepEditor(true)
  }

  const editStep = (index: number) => {
    setEditingStepIndex(index)
    setStepFormData(workflowSteps[index])
    setShowStepEditor(true)
  }

  const saveStep = () => {
    if (editingStepIndex !== null && stepFormData) {
      const updatedSteps = [...workflowSteps]
      updatedSteps[editingStepIndex] = { ...updatedSteps[editingStepIndex], ...stepFormData }
      setWorkflowSteps(updatedSteps)
      setShowStepEditor(false)
      setEditingStepIndex(null)
      setStepFormData({})
      toast.success('Step updated successfully')
    }
  }

  const deleteStep = (index: number) => {
    const updatedSteps = workflowSteps.filter((_, i) => i !== index)
    // Update order numbers
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, order: i + 1 }))
    setWorkflowSteps(reorderedSteps)
    toast.success('Step deleted successfully')
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updatedSteps = [...workflowSteps]
    const temp = updatedSteps[index]
    updatedSteps[index] = updatedSteps[newIndex]
    updatedSteps[newIndex] = temp

    // Update order numbers
    updatedSteps[index].order = index + 1
    updatedSteps[newIndex].order = newIndex + 1

    setWorkflowSteps(updatedSteps)
  }

  const duplicateStep = (index: number) => {
    const stepToDuplicate = workflowSteps[index]
    const duplicatedStep: OnboardingStep = {
      ...stepToDuplicate,
      id: `step-${Date.now()}`,
      title: `${stepToDuplicate.title} (Copy)`,
      order: workflowSteps.length + 1
    }
    setWorkflowSteps([...workflowSteps, duplicatedStep])
    toast.success('Step duplicated successfully')
  }

  const saveWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name')
      return
    }

    if (workflowSteps.length === 0) {
      toast.error('Please add at least one step to the workflow')
      return
    }

    // Here you would typically save to your backend
    toast.success('Onboarding workflow saved successfully!')
    onClose()
  }

  const calculateTotalDuration = () => {
    return workflowSteps.reduce((total, step) => total + step.estimatedDuration, 0)
  }

  const getStepIcon = (type: OnboardingStep['type']) => {
    switch (type) {
      case 'welcome': return <Handshake size={16} />
      case 'form': return <ClipboardText size={16} />
      case 'training': return <GraduationCap size={16} />
      case 'task': return <Target size={16} />
      case 'review': return <Eye size={16} />
      case 'approval': return <CheckCircle size={16} />
      case 'completion': return <Star size={16} />
      default: return <BookOpen size={16} />
    }
  }

  const getCategoryColor = (category: OnboardingStep['category']) => {
    switch (category) {
      case 'orientation': return 'bg-blue-100 text-blue-700'
      case 'hr': return 'bg-green-100 text-green-700'
      case 'it': return 'bg-purple-100 text-purple-700'
      case 'department': return 'bg-orange-100 text-orange-700'
      case 'compliance': return 'bg-red-100 text-red-700'
      case 'social': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Warning className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to build onboarding workflows.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlowArrow size={24} />
                Department Onboarding Builder
              </CardTitle>
              <CardDescription>
                Create a customized onboarding workflow for {currentDepartment?.name || 'your department'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveWorkflow}>
                Save Workflow
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-duration">Estimated Duration (days)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[estimatedDuration]}
                  onValueChange={(value) => setEstimatedDuration(value[0])}
                  max={60}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{estimatedDuration}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe the purpose and goals of this onboarding workflow"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Steps ({workflowSteps.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workflow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  Workflow Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Steps</span>
                  <span className="font-medium">{workflowSteps.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Duration</span>
                  <span className="font-medium">{Math.round(calculateTotalDuration() / 60)} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Required Steps</span>
                  <span className="font-medium">{workflowSteps.filter(s => s.isRequired).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="font-medium">{currentDepartment?.name}</span>
                </div>
              </CardContent>
            </Card>

            {/* Step Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreeStructure size={20} />
                  Step Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['orientation', 'hr', 'it', 'department', 'compliance', 'social'].map(category => {
                    const count = workflowSteps.filter(s => s.category === category).length
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <Badge variant="outline" className={getCategoryColor(category as any)}>
                          {category}
                        </Badge>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Department Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  Department Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentDepartment && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">{currentDepartment.name}</p>
                      <p className="text-xs text-muted-foreground">{currentDepartment.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Module Access</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentDepartment.moduleAccess.slice(0, 3).map(moduleId => (
                          <Badge key={moduleId} variant="outline" className="text-xs">
                            {moduleId}
                          </Badge>
                        ))}
                        {currentDepartment.moduleAccess.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{currentDepartment.moduleAccess.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p className="text-sm font-medium">{currentDepartment.employeeCount}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common workflow building tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={addNewStep}
                >
                  <Plus size={24} />
                  <span className="text-sm">Add Step</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('steps')}
                >
                  <Edit size={24} />
                  <span className="text-sm">Edit Steps</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye size={24} />
                  <span className="text-sm">Preview</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center gap-2"
                  onClick={saveWorkflow}
                >
                  <CheckCircle size={24} />
                  <span className="text-sm">Save</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <p className="text-muted-foreground">
                Drag and drop to reorder, or use the controls to manage steps
              </p>
            </div>
            <Button onClick={addNewStep} className="flex items-center gap-2">
              <Plus size={16} />
              Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <Card key={step.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      {getStepIcon(step.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getCategoryColor(step.category)}>
                              {step.category}
                            </Badge>
                            <Badge variant="secondary">{step.type}</Badge>
                            <Badge variant="outline">{step.estimatedDuration}min</Badge>
                            <Badge variant="outline">
                              {step.assignedTo}
                            </Badge>
                            {step.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === workflowSteps.length - 1}
                          >
                            <ArrowDown size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateStep(index)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editStep(index)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                          <span className="text-muted-foreground">Depends on: </span>
                          {step.dependsOn.map(depId => {
                            const depStep = workflowSteps.find(s => s.id === depId)
                            return depStep?.title || depId
                          }).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {workflowSteps.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No steps added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your onboarding workflow by adding the first step
                </p>
                <Button onClick={addNewStep}>
                  <Plus size={16} className="mr-2" />
                  Add First Step
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configure automation and flow settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Flow Control</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-skipping">Allow Step Skipping</Label>
                      <Switch id="allow-skipping" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-approvals">Require Approvals</Label>
                      <Switch id="require-approvals" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-reminders">Enable Reminders</Label>
                      <Switch id="enable-reminders" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Automation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-start">Auto Start</Label>
                      <Switch id="auto-start" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-assign-buddy">Auto Assign Buddy</Label>
                      <Switch id="auto-assign-buddy" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-provision">Auto Provision Access</Label>
                      <Switch id="auto-provision" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Preview</CardTitle>
              <CardDescription>
                Preview how this workflow will look to new employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-lg">{workflowName}</h3>
                  <p className="text-muted-foreground mt-1">{workflowDescription}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span><strong>{workflowSteps.length}</strong> steps</span>
                    <span><strong>~{estimatedDuration}</strong> days</span>
                    <span><strong>{Math.round(calculateTotalDuration() / 60)}</strong> hours total</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
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
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step Editor Dialog */}
      <Dialog open={showStepEditor} onOpenChange={setShowStepEditor}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingStepIndex !== null ? 'Edit Step' : 'Add New Step'}
            </DialogTitle>
            <DialogDescription>
              Configure the step details and content
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="step-title">Step Title</Label>
              <Input
                id="step-title"
                value={stepFormData.title || ''}
                onChange={(e) => setStepFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter step title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="step-type">Step Type</Label>
              <Select
                value={stepFormData.type || 'task'}
                onValueChange={(value) => setStepFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="step-category">Category</Label>
              <Select
                value={stepFormData.category || 'department'}
                onValueChange={(value) => setStepFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orientation">Orientation</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="step-duration">Duration (minutes)</Label>
              <Input
                id="step-duration"
                type="number"
                value={stepFormData.estimatedDuration || 60}
                onChange={(e) => setStepFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                min="1"
                max="480"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="step-assigned">Assigned To</Label>
              <Select
                value={stepFormData.assignedTo || 'manager'}
                onValueChange={(value) => setStepFormData(prev => ({ ...prev, assignedTo: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="buddy">Buddy</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="step-required"
                  checked={stepFormData.isRequired !== false}
                  onCheckedChange={(checked) => setStepFormData(prev => ({ ...prev, isRequired: checked === true }))}
                />
                <Label htmlFor="step-required">Required Step</Label>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="step-description">Description</Label>
              <Textarea
                id="step-description"
                value={stepFormData.description || ''}
                onChange={(e) => setStepFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this step involves"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepEditor(false)}>
              Cancel
            </Button>
            <Button onClick={saveStep}>
              Save Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}