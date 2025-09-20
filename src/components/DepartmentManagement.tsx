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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Department,
  DepartmentHierarchy,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentUser,
  DepartmentStats,
  DepartmentAuditLog,
  DepartmentFilter,
  DepartmentPermission
} from '@/types/department'
import { ERPModule } from '@/types/erp'
import {
  Building,
  Users,
  Plus,
  PencilSimple as Edit,
  Trash,
  MagnifyingGlass as Search,
  Funnel as Filter,
  TreeStructure,
  UserPlus,
  Gear as Settings,
  Shield,
  ChartBar,
  MapPin,
  CurrencyDollar,
  Clock,
  Warning as AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  DotsThreeVertical as MoreVertical,
  ArrowsDownUp as ArrowUpDown,
  Package,
  DotsNine as GripVertical,
  UserCheck,
  UserMinus,
  Shuffle,
  Target,
  ArrowRight,
  ArrowLeft,
  UserCircle,
  Envelope,
  Phone,
  Briefcase,
  Calendar
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { mockModules } from '@/data/mockData'

interface DepartmentManagementProps {
  companyId: string
  currentUserId: string
  userRole: 'super_admin' | 'company_admin' | 'manager' | 'user' | 'viewer'
}

export function DepartmentManagement({ companyId, currentUserId, userRole }: DepartmentManagementProps) {
  // Permission check - only super admin and company admin can manage departments
  const canManageDepartments = userRole === 'super_admin' || userRole === 'company_admin'
  const canViewDepartments = true // All users can view departments

  // State management
  const [departments, setDepartments] = useKV<Department[]>(`departments-${companyId}`, [])
  const [departmentUsers, setDepartmentUsers] = useKV<DepartmentUser[]>(`department-users-${companyId}`, [])
  const [auditLogs, setAuditLogs] = useKV<DepartmentAuditLog[]>(`department-audit-${companyId}`, [])
  const [availableUsers, setAvailableUsers] = useKV<any[]>(`company-users-${companyId}`, [])
  
  // Ensure we always have arrays, even if useKV returns undefined
  const safeDepartments = departments || []
  const safeAuditLogs = auditLogs || []
  const safeDepartmentUsers = departmentUsers || []
  const safeAvailableUsers = availableUsers || []
  
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showUserAssignDialog, setShowUserAssignDialog] = useState(false)
  const [showUserManagementModal, setShowUserManagementModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState<DepartmentFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'created' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Drag and drop state
  const [draggedUser, setDraggedUser] = useState<any | null>(null)
  const [dropTargetDepartment, setDropTargetDepartment] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'bulk'>('single')

  // Form state
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    code: '',
    description: '',
    parentId: '',
    managerId: '',
    location: '',
    budget: 0,
    moduleAccess: [],
    permissions: [],
    settings: {}
  })

  // Generate mock departments if none exist
  useEffect(() => {
    if (safeDepartments.length === 0) {
      const mockDepartments: Department[] = [
        {
          id: 'dept-001',
          name: 'Human Resources',
          code: 'HR',
          description: 'Manages employee relations, recruitment, and organizational development',
          companyId,
          managerId: 'user-002',
          location: 'Main Office - Floor 2',
          budget: 150000,
          employeeCount: 8,
          status: 'active',
          moduleAccess: ['hr', 'finance', 'settings'],
          permissions: [
            { moduleId: 'hr', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'finance', permissions: ['read'] },
            { moduleId: 'settings', permissions: ['read', 'update'] }
          ],
          settings: { allowCrossCompanyAccess: false, requireApproval: true },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          createdBy: currentUserId,
          updatedBy: currentUserId
        },
        {
          id: 'dept-002',
          name: 'Information Technology',
          code: 'IT',
          description: 'Manages technology infrastructure, software development, and digital solutions',
          companyId,
          managerId: 'user-003',
          location: 'Tech Center - Floor 3',
          budget: 300000,
          employeeCount: 15,
          status: 'active',
          moduleAccess: ['inventory', 'project', 'settings', 'hr'],
          permissions: [
            { moduleId: 'inventory', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'project', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'settings', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'hr', permissions: ['read'] }
          ],
          settings: { allowRemoteAccess: true, requireVPN: true },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20'),
          createdBy: currentUserId,
          updatedBy: currentUserId
        },
        {
          id: 'dept-003',
          name: 'Sales & Marketing',
          code: 'SM',
          description: 'Drives revenue growth through sales activities and marketing campaigns',
          companyId,
          managerId: 'user-004',
          location: 'Main Office - Floor 1',
          budget: 200000,
          employeeCount: 12,
          status: 'active',
          moduleAccess: ['sales', 'marketing', 'customer', 'finance'],
          permissions: [
            { moduleId: 'sales', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'marketing', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'customer', permissions: ['create', 'read', 'update', 'delete'] },
            { moduleId: 'finance', permissions: ['read'] }
          ],
          settings: { enableCommissionTracking: true, autoAssignLeads: true },
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-18'),
          createdBy: currentUserId,
          updatedBy: currentUserId
        },
        {
          id: 'dept-004',
          name: 'Finance & Accounting',
          code: 'FIN',
          description: 'Manages financial operations, budgeting, and regulatory compliance',
          companyId,
          managerId: 'user-005',
          location: 'Main Office - Floor 4',
          budget: 180000,
          employeeCount: 10,
          status: 'active',
          moduleAccess: ['finance', 'procurement', 'hr', 'inventory'],
          permissions: [
            { moduleId: 'finance', permissions: ['create', 'read', 'update', 'delete', 'admin'] },
            { moduleId: 'procurement', permissions: ['create', 'read', 'update', 'approve'] },
            { moduleId: 'hr', permissions: ['read'] },
            { moduleId: 'inventory', permissions: ['read'] }
          ],
          settings: { requireDualApproval: true, auditTrailEnabled: true },
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-22'),
          createdBy: currentUserId,
          updatedBy: currentUserId
        }
      ]
      setDepartments(mockDepartments)
    }
  }, [departments?.length, companyId, currentUserId, setDepartments])

  // Generate mock users if none exist
  useEffect(() => {
    if (safeAvailableUsers.length === 0) {
      const mockUsers = [
        {
          id: 'user-001',
          name: 'John Smith',
          email: 'john.smith@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          position: 'Software Engineer',
          departmentId: 'dept-002',
          phone: '+1-555-0101',
          hireDate: '2023-03-15',
          status: 'active',
          role: 'user'
        },
        {
          id: 'user-002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com', 
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          position: 'HR Manager',
          departmentId: 'dept-001',
          phone: '+1-555-0102',
          hireDate: '2022-06-01',
          status: 'active',
          role: 'manager'
        },
        {
          id: 'user-003',
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          position: 'IT Director',
          departmentId: 'dept-002',
          phone: '+1-555-0103',
          hireDate: '2021-01-10',
          status: 'active',
          role: 'manager'
        },
        {
          id: 'user-004',
          name: 'Emily Wilson',
          email: 'emily.wilson@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
          position: 'Sales Manager',
          departmentId: 'dept-003',
          phone: '+1-555-0104',
          hireDate: '2022-09-20',
          status: 'active',
          role: 'manager'
        },
        {
          id: 'user-005',
          name: 'David Brown',
          email: 'david.brown@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
          position: 'Financial Analyst',
          departmentId: 'dept-004',
          phone: '+1-555-0105',
          hireDate: '2023-02-14',
          status: 'active',
          role: 'user'
        },
        {
          id: 'user-006',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
          position: 'Marketing Specialist',
          departmentId: null, // Unassigned user
          phone: '+1-555-0106',
          hireDate: '2023-11-01',
          status: 'active',
          role: 'user'
        },
        {
          id: 'user-007',
          name: 'Robert Garcia',
          email: 'robert.garcia@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
          position: 'Quality Assurance Engineer',
          departmentId: null, // Unassigned user
          phone: '+1-555-0107',
          hireDate: '2023-12-15',
          status: 'active',
          role: 'user'
        },
        {
          id: 'user-008',
          name: 'Jennifer Martinez',
          email: 'jennifer.martinez@company.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
          position: 'UX Designer',
          departmentId: null, // Unassigned user
          phone: '+1-555-0108',
          hireDate: '2024-01-02',
          status: 'active',
          role: 'user'
        }
      ]
      setAvailableUsers(mockUsers)
    }
  }, [safeAvailableUsers.length, setAvailableUsers])

  // Calculate department statistics
  const getDepartmentStats = (): DepartmentStats => {
    const activeDepartments = safeDepartments.filter(d => d.status === 'active')
    const totalUsers = safeDepartments.reduce((sum, d) => sum + d.employeeCount, 0)
    const departmentsByModule: Record<string, number> = {}
    
    safeDepartments.forEach(dept => {
      dept.moduleAccess.forEach(moduleId => {
        departmentsByModule[moduleId] = (departmentsByModule[moduleId] || 0) + 1
      })
    })

    return {
      totalDepartments: safeDepartments.length,
      activeDepartments: activeDepartments.length,
      totalUsers,
      averageUsersPerDepartment: totalUsers / Math.max(safeDepartments.length, 1),
      departmentsByModule,
      hierarchyDepth: Math.max(...safeDepartments.map(d => d.parentId ? 2 : 1), 1)
    }
  }

  // Build department hierarchy
  const buildDepartmentHierarchy = (): DepartmentHierarchy[] => {
    const hierarchyMap = new Map<string, DepartmentHierarchy>()
    
    safeDepartments.forEach(dept => {
      hierarchyMap.set(dept.id, {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        level: 1,
        parentId: dept.parentId,
        children: [],
        userCount: dept.employeeCount,
        moduleCount: dept.moduleAccess.length,
        status: dept.status
      })
    })

    const rootDepartments: DepartmentHierarchy[] = []
    
    hierarchyMap.forEach(dept => {
      if (dept.parentId && hierarchyMap.has(dept.parentId)) {
        const parent = hierarchyMap.get(dept.parentId)!
        parent.children.push(dept)
        dept.level = parent.level + 1
      } else {
        rootDepartments.push(dept)
      }
    })

    return rootDepartments
  }

  // Filter and sort departments
  const getFilteredDepartments = () => {
    let filtered = safeDepartments.filter(dept => {
      if (filters.search && !dept.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !dept.code.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.status && dept.status !== filters.status) return false
      if (filters.parentId && dept.parentId !== filters.parentId) return false
      if (filters.moduleId && !dept.moduleAccess.includes(filters.moduleId)) return false
      if (filters.hasUsers !== undefined && (dept.employeeCount > 0) !== filters.hasUsers) return false
      return true
    })

    // Sort departments
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'users':
          aValue = a.employeeCount
          bValue = b.employeeCount
          break
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updated':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }

  // Handle department creation
  const handleCreateDepartment = async () => {
    if (!canManageDepartments) {
      toast.error('Access denied: Only Super Admin and Company Admin can create departments')
      return
    }

    if (!formData.name || !formData.code) {
      toast.error('Name and code are required')
      return
    }

    // Check for duplicate code
    if (safeDepartments.some(d => d.code === formData.code)) {
      toast.error('Department code already exists')
      return
    }

    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      ...formData,
      companyId,
      employeeCount: 0,
      status: 'active',
      settings: formData.settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUserId,
      updatedBy: currentUserId
    }

    setDepartments(prev => [...(prev || []), newDepartment])
    
    // Add audit log
    const auditLog: DepartmentAuditLog = {
      id: `audit-${Date.now()}`,
      departmentId: newDepartment.id,
      action: 'created',
      details: { department: newDepartment },
      performedBy: currentUserId,
      performedAt: new Date(),
      companyId
    }
    setAuditLogs(prev => [...(prev || []), auditLog])

    toast.success('Department created successfully')
    setShowCreateDialog(false)
    resetForm()
  }

  // Handle department update
  const handleUpdateDepartment = async () => {
    if (!canManageDepartments || !selectedDepartment) {
      toast.error('Access denied: Only Super Admin and Company Admin can edit departments')
      return
    }

    const updatedDepartment: Department = {
      ...selectedDepartment,
      ...formData,
      updatedAt: new Date(),
      updatedBy: currentUserId
    }

    setDepartments(prev => (prev || []).map(d => d.id === selectedDepartment.id ? updatedDepartment : d))
    
    // Add audit log
    const auditLog: DepartmentAuditLog = {
      id: `audit-${Date.now()}`,
      departmentId: selectedDepartment.id,
      action: 'updated',
      details: { 
        oldData: selectedDepartment,
        newData: updatedDepartment,
        changes: Object.keys(formData).filter(key => 
          JSON.stringify(selectedDepartment[key as keyof Department]) !== 
          JSON.stringify(formData[key as keyof CreateDepartmentRequest])
        )
      },
      performedBy: currentUserId,
      performedAt: new Date(),
      companyId
    }
    setAuditLogs(prev => [...(prev || []), auditLog])

    toast.success('Department updated successfully')
    setShowEditDialog(false)
    setSelectedDepartment(null)
    resetForm()
  }

  // Handle department deletion
  const handleDeleteDepartment = async (departmentId: string) => {
    if (!canManageDepartments) {
      toast.error('Access denied: Only Super Admin and Company Admin can delete departments')
      return
    }

    const department = safeDepartments.find(d => d.id === departmentId)
    if (!department) return

    // Check if department has users
    if (department.employeeCount > 0) {
      toast.error('Cannot delete department with assigned users. Please reassign users first.')
      return
    }

    setDepartments(prev => (prev || []).filter(d => d.id !== departmentId))
    
    // Add audit log
    const auditLog: DepartmentAuditLog = {
      id: `audit-${Date.now()}`,
      departmentId,
      action: 'deleted',
      details: { department },
      performedBy: currentUserId,
      performedAt: new Date(),
      companyId
    }
    setAuditLogs(prev => [...(prev || []), auditLog])

    toast.success('Department deleted successfully')
  }

  // User assignment functions
  const handleAssignUserToDepartment = async (userId: string, departmentId: string | null) => {
    if (!canManageDepartments) {
      toast.error('Access denied: Only Super Admin and Company Admin can assign users')
      return
    }

    const user = safeAvailableUsers.find(u => u.id === userId)
    if (!user) return

    const oldDepartmentId = user.departmentId
    const newDepartment = departmentId ? safeDepartments.find(d => d.id === departmentId) : null

    // Update user's department assignment
    setAvailableUsers(prev => 
      (prev || []).map(u => u.id === userId ? { ...u, departmentId } : u)
    )

    // Update department employee counts
    if (oldDepartmentId) {
      setDepartments(prev => 
        (prev || []).map(d => d.id === oldDepartmentId ? { ...d, employeeCount: d.employeeCount - 1 } : d)
      )
    }
    
    if (departmentId) {
      setDepartments(prev => 
        (prev || []).map(d => d.id === departmentId ? { ...d, employeeCount: d.employeeCount + 1 } : d)
      )
    }

    // Add audit log
    const auditLog: DepartmentAuditLog = {
      id: `audit-${Date.now()}`,
      departmentId: departmentId || oldDepartmentId || '',
      action: 'user_assigned',
      details: { 
        userId,
        userName: user.name,
        oldDepartmentId,
        newDepartmentId: departmentId,
        oldDepartmentName: oldDepartmentId ? safeDepartments.find(d => d.id === oldDepartmentId)?.name : null,
        newDepartmentName: newDepartment?.name || 'Unassigned'
      },
      performedBy: currentUserId,
      performedAt: new Date(),
      companyId
    }
    setAuditLogs(prev => [...(prev || []), auditLog])

    const actionText = departmentId 
      ? `${user.name} assigned to ${newDepartment?.name}`
      : `${user.name} unassigned from department`
    toast.success(actionText)
  }

  const handleBulkUserAssignment = async (userIds: string[], departmentId: string | null) => {
    if (!canManageDepartments) {
      toast.error('Access denied: Only Super Admin and Company Admin can assign users')
      return
    }

    for (const userId of userIds) {
      await handleAssignUserToDepartment(userId, departmentId)
    }
    
    setSelectedUsers([])
    toast.success(`${userIds.length} users assigned successfully`)
  }

  // Drag and drop handlers
  const handleDragStart = (user: any) => {
    setDraggedUser(user)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setDraggedUser(null)
    setIsDragging(false)
    setDropTargetDepartment(null)
  }

  const handleDragOver = (e: React.DragEvent, departmentId: string) => {
    e.preventDefault()
    setDropTargetDepartment(departmentId)
  }

  const handleDragLeave = () => {
    setDropTargetDepartment(null)
  }

  const handleDrop = (e: React.DragEvent, departmentId: string) => {
    e.preventDefault()
    if (draggedUser) {
      handleAssignUserToDepartment(draggedUser.id, departmentId)
    }
    handleDragEnd()
  }

  // Get users by department
  const getUsersByDepartment = (departmentId: string | null) => {
    return safeAvailableUsers.filter(user => user.departmentId === departmentId)
  }

  const getUnassignedUsers = () => {
    return safeAvailableUsers.filter(user => !user.departmentId)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      parentId: '',
      managerId: '',
      location: '',
      budget: 0,
      moduleAccess: [],
      permissions: [],
      settings: {}
    })
  }

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      parentId: department.parentId || '',
      managerId: department.managerId || '',
      location: department.location || '',
      budget: department.budget || 0,
      moduleAccess: department.moduleAccess,
      permissions: department.permissions,
      settings: department.settings || {}
    })
    setShowEditDialog(true)
  }

  const stats = getDepartmentStats()
  const hierarchy = buildDepartmentHierarchy()
  const filteredDepartments = getFilteredDepartments()

  if (!canViewDepartments) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view department information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Departments</p>
                <p className="text-2xl font-bold">{stats.totalDepartments}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Departments</p>
                <p className="text-2xl font-bold">{stats.activeDepartments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Users/Dept</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageUsersPerDepartment)}</p>
              </div>
              <ChartBar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus size={16} />
              User Assignment
            </TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {canManageDepartments && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                    Add a new department to your organization structure
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Department Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter department name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">Department Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., HR, IT, FIN"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Department description and responsibilities"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Department</Label>
                    <Select
                      value={formData.parentId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent department" />
                      </SelectTrigger>
                      <SelectContent>
                        {(departments || []).map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Department location"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label>ERP Module Access</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {mockModules.map(module => (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`module-${module.id}`}
                            checked={formData.moduleAccess.includes(module.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                moduleAccess: checked
                                  ? [...prev.moduleAccess, module.id]
                                  : prev.moduleAccess.filter(id => id !== module.id)
                              }))
                            }}
                          />
                          <Label htmlFor={`module-${module.id}`} className="text-sm">
                            {module.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDepartment}>
                    Create Department
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setFilters(prev => ({ ...prev, search: e.target.value }))
                    }}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="users">User Count</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                    <SelectItem value="updated">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  <ArrowUpDown size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Departments list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDepartments.map(department => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{department.code}</Badge>
                        <Badge variant={department.status === 'active' ? 'default' : 'destructive'}>
                          {department.status}
                        </Badge>
                      </CardDescription>
                    </div>
                    {canManageDepartments && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(department)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {department.description && (
                    <p className="text-sm text-muted-foreground">{department.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users size={14} />
                      <span>{department.employeeCount} employees</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package size={14} />
                      <span>{department.moduleAccess.length} modules</span>
                    </div>
                  </div>
                  
                  {department.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>{department.location}</span>
                    </div>
                  )}
                  
                  {department.budget && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CurrencyDollar size={14} />
                      <span>${department.budget.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {department.moduleAccess.slice(0, 3).map(moduleId => {
                      const module = mockModules.find(m => m.id === moduleId)
                      return (
                        <Badge key={moduleId} variant="outline" className="text-xs">
                          {module?.name || moduleId}
                        </Badge>
                      )
                    })}
                    {department.moduleAccess.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{department.moduleAccess.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No departments found</h3>
                <p className="text-muted-foreground mb-4">
                  {(departments || []).length === 0 
                    ? "Get started by creating your first department"
                    : "Try adjusting your search criteria"
                  }
                </p>
                {canManageDepartments && (departments || []).length === 0 && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Create First Department
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">User Assignment Management</h3>
              <p className="text-muted-foreground">Drag and drop users to assign them to departments</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={assignmentMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentMode('single')}
              >
                Single Mode
              </Button>
              <Button
                variant={assignmentMode === 'bulk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentMode('bulk')}
              >
                Bulk Mode
              </Button>
              {assignmentMode === 'bulk' && selectedUsers.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowUserManagementModal(true)}
                  className="flex items-center gap-2"
                >
                  <Shuffle size={16} />
                  Assign {selectedUsers.length} Users
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Unassigned Users Pool */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle size={20} />
                  Unassigned Users
                  <Badge variant="secondary" className="ml-auto">
                    {getUnassignedUsers().length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Users not assigned to any department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {getUnassignedUsers().map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        canManage={canManageDepartments}
                        isDragging={isDragging}
                        isSelected={selectedUsers.includes(user.id)}
                        assignmentMode={assignmentMode}
                        onDragStart={handleDragStart}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedUsers(prev => [...prev, user.id])
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id))
                          }
                        }}
                        onUnassign={() => handleAssignUserToDepartment(user.id, null)}
                      />
                    ))}
                    {getUnassignedUsers().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <UserCheck size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All users are assigned</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Department Columns */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeDepartments.map((department) => (
                <Card
                  key={department.id}
                  className={`transition-all duration-200 ${
                    dropTargetDepartment === department.id && isDragging
                      ? 'ring-2 ring-primary bg-primary/5'
                      : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, department.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, department.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">{department.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{department.code}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {getUsersByDepartment(department.id).length} users
                          </Badge>
                        </CardDescription>
                      </div>
                      <Target size={16} className="text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {getUsersByDepartment(department.id).map((user) => (
                          <UserCard
                            key={user.id}
                            user={user}
                            canManage={canManageDepartments}
                            isDragging={isDragging}
                            isSelected={selectedUsers.includes(user.id)}
                            assignmentMode={assignmentMode}
                            onDragStart={handleDragStart}
                            onSelect={(selected) => {
                              if (selected) {
                                setSelectedUsers(prev => [...prev, user.id])
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.id))
                              }
                            }}
                            onUnassign={() => handleAssignUserToDepartment(user.id, null)}
                          />
                        ))}
                        {getUsersByDepartment(department.id).length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            <Users size={16} className="mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No users assigned</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Assignment Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} />
                Assignment Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {safeAvailableUsers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {safeAvailableUsers.filter(u => u.departmentId).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {getUnassignedUsers().length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unassigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((safeAvailableUsers.filter(u => u.departmentId).length / Math.max(safeAvailableUsers.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Assignment Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreeStructure size={20} />
                Department Hierarchy
              </CardTitle>
              <CardDescription>
                Organizational structure and reporting relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hierarchy.map(dept => (
                  <DepartmentTreeNode
                    key={dept.id}
                    department={dept}
                    level={0}
                    canManage={canManageDepartments}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteDepartment}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Department Permissions Matrix
              </CardTitle>
              <CardDescription>
                ERP module access and permission levels for each department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Department</th>
                      {mockModules.map(module => (
                        <th key={module.id} className="border border-border p-2 text-center text-xs">
                          {module.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(departments || []).map(dept => (
                      <tr key={dept.id}>
                        <td className="border border-border p-2 font-medium">
                          <div>
                            <div>{dept.name}</div>
                            <div className="text-xs text-muted-foreground">{dept.code}</div>
                          </div>
                        </td>
                        {mockModules.map(module => {
                          const hasAccess = dept.moduleAccess.includes(module.id)
                          const permission = dept.permissions.find(p => p.moduleId === module.id)
                          return (
                            <td key={module.id} className="border border-border p-2 text-center">
                              {hasAccess ? (
                                <div className="space-y-1">
                                  <CheckCircle size={16} className="mx-auto text-green-600" />
                                  <div className="text-xs">
                                    {permission?.permissions.join(', ') || 'Basic'}
                                  </div>
                                </div>
                              ) : (
                                <XCircle size={16} className="mx-auto text-gray-400" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Department management activity log and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {(auditLogs || []).length > 0 ? (
                    (auditLogs || []).map(log => (
                      <div key={log.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                log.action === 'created' ? 'default' :
                                log.action === 'updated' ? 'secondary' :
                                log.action === 'deleted' ? 'destructive' : 'outline'
                              }>
                                {log.action}
                              </Badge>
                              <span className="font-medium">
                                Department {(departments || []).find(d => d.id === log.departmentId)?.name || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Performed by User {log.performedBy} • {new Date(log.performedAt).toLocaleString()}
                            </p>
                            {log.details.changes && (
                              <p className="text-sm">
                                Changed: {log.details.changes.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No audit logs available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Department Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Department Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter department name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-code">Department Code *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., HR, IT, FIN"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Department description and responsibilities"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Department location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Budget</Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="Annual budget"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>ERP Module Access</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mockModules.map(module => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-module-${module.id}`}
                      checked={formData.moduleAccess.includes(module.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          moduleAccess: checked
                            ? [...prev.moduleAccess, module.id]
                            : prev.moduleAccess.filter(id => id !== module.id)
                        }))
                      }}
                    />
                    <Label htmlFor={`edit-module-${module.id}`} className="text-sm">
                      {module.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDepartment}>
              Update Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk User Assignment Modal */}
      <Dialog open={showUserManagementModal} onOpenChange={setShowUserManagementModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk User Assignment</DialogTitle>
            <DialogDescription>
              Assign {selectedUsers.length} selected users to a department
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Users:</Label>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                {selectedUsers.map(userId => {
                  const user = safeAvailableUsers.find(u => u.id === userId)
                  return user ? (
                    <div key={userId} className="text-sm p-1">
                      {user.name} - {user.position}
                    </div>
                  ) : null
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assign to Department:</Label>
              <Select
                onValueChange={(value) => {
                  handleBulkUserAssignment(selectedUsers, value === 'unassigned' ? null : value)
                  setShowUserManagementModal(false)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {safeDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserManagementModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// UserCard component for drag-and-drop interface
interface UserCardProps {
  user: any
  canManage: boolean
  isDragging: boolean
  isSelected: boolean
  assignmentMode: 'single' | 'bulk'
  onDragStart: (user: any) => void
  onSelect: (selected: boolean) => void
  onUnassign: () => void
}

function UserCard({ 
  user, 
  canManage, 
  isDragging, 
  isSelected, 
  assignmentMode, 
  onDragStart, 
  onSelect, 
  onUnassign 
}: UserCardProps) {
  return (
    <div
      className={`
        relative p-3 border rounded-lg cursor-pointer transition-all duration-200 
        ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}
        ${isDragging ? 'opacity-50' : ''}
      `}
      draggable={canManage && assignmentMode === 'single'}
      onDragStart={() => canManage && assignmentMode === 'single' && onDragStart(user)}
      onClick={() => assignmentMode === 'bulk' && onSelect(!isSelected)}
    >
      {assignmentMode === 'bulk' && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="absolute top-2 left-2"
        />
      )}
      
      <div className={`flex items-center gap-3 ${assignmentMode === 'bulk' ? 'ml-6' : ''}`}>
        {assignmentMode === 'single' && canManage && (
          <GripVertical size={16} className="text-muted-foreground" />
        )}
        
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{user.name}</p>
            {canManage && user.departmentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onUnassign()
                }}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <UserMinus size={12} />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.position}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {user.role}
            </Badge>
            <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {user.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Envelope size={10} />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone size={10} />
            <span>{user.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={10} />
          <span>Hired: {new Date(user.hireDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

// Component for rendering department tree nodes
interface DepartmentTreeNodeProps {
  department: DepartmentHierarchy
  level: number
  canManage: boolean
  onEdit: (dept: Department) => void
  onDelete: (deptId: string) => void
}

function DepartmentTreeNode({ department, level, canManage, onEdit, onDelete }: DepartmentTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-3">
          {department.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{department.name}</span>
              <Badge variant="secondary" className="text-xs">{department.code}</Badge>
              <Badge variant={department.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                {department.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{department.userCount} users</span>
              <span>{department.moduleCount} modules</span>
            </div>
          </div>
        </div>
        
        {canManage && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Find the full department object for editing
                // Note: In a real app, you'd have access to the full department data
                // For now, we'll use the hierarchy data
              }}
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(department.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash size={14} />
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && department.children.map(child => (
        <DepartmentTreeNode
          key={child.id}
          department={child}
          level={level + 1}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}