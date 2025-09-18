import { ERPModule, Company, User, Notification, AIInsight, SystemHealth } from '@/types/erp'

export const mockCompanies: Company[] = [
  {
    id: 'acme-corp',
    name: 'Acme Corporation',
    domain: 'acme.com',
    isActive: true
  },
  {
    id: 'tech-solutions',
    name: 'Tech Solutions Ltd',
    domain: 'techsolutions.com',
    isActive: true
  },
  {
    id: 'global-ventures',
    name: 'Global Ventures Inc',
    domain: 'globalventures.com',
    isActive: false
  }
]

export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@acme.com',
  avatar: '',
  role: 'System Administrator',
  permissions: ['all'],
  companyId: 'acme-corp'
}

export const mockModules: ERPModule[] = [
  {
    id: 'finance',
    name: 'Financial Management',
    description: 'Comprehensive accounting, budgeting, and financial reporting',
    icon: 'CreditCard',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    notifications: 3,
    quickStats: [
      { label: 'Revenue YTD', value: '$2.4M', trend: 'up' },
      { label: 'Outstanding AR', value: '$180K', trend: 'down' },
      { label: 'Cash Flow', value: 'Positive', trend: 'stable' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Real-time stock tracking, warehouse management, and optimization',
    icon: 'Package',
    status: 'active',
    lastUpdated: '2024-01-15T09:45:00Z',
    notifications: 7,
    quickStats: [
      { label: 'Total Items', value: '12,450', trend: 'up' },
      { label: 'Low Stock Alerts', value: '23', trend: 'down' },
      { label: 'Turnover Rate', value: '4.2x', trend: 'up' }
    ]
  },
  {
    id: 'sales',
    name: 'Sales & CRM',
    description: 'Customer relationship management and sales pipeline tracking',
    icon: 'TrendUp',
    status: 'active',
    lastUpdated: '2024-01-15T11:15:00Z',
    notifications: 12,
    quickStats: [
      { label: 'Active Leads', value: '156', trend: 'up' },
      { label: 'Conversion Rate', value: '24%', trend: 'up' },
      { label: 'Pipeline Value', value: '$890K', trend: 'stable' }
    ]
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Vendor management, purchase orders, and procurement analytics',
    icon: 'ShoppingCart',
    status: 'active',
    lastUpdated: '2024-01-15T08:20:00Z',
    notifications: 5,
    quickStats: [
      { label: 'Active POs', value: '89', trend: 'stable' },
      { label: 'Vendor Rating', value: '4.7/5', trend: 'up' },
      { label: 'Cost Savings', value: '12%', trend: 'up' }
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee management, payroll, performance, and recruitment',
    icon: 'Users',
    status: 'active',
    lastUpdated: '2024-01-15T07:30:00Z',
    notifications: 2,
    quickStats: [
      { label: 'Total Employees', value: '248', trend: 'up' },
      { label: 'Open Positions', value: '12', trend: 'down' },
      { label: 'Retention Rate', value: '94%', trend: 'stable' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production planning, quality control, and shop floor management',
    icon: 'Gear',
    status: 'active',
    lastUpdated: '2024-01-15T09:00:00Z',
    notifications: 8,
    quickStats: [
      { label: 'Production Rate', value: '98.5%', trend: 'up' },
      { label: 'Quality Score', value: '99.2%', trend: 'stable' },
      { label: 'Downtime', value: '1.3%', trend: 'down' }
    ]
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Project planning, resource allocation, and delivery tracking',
    icon: 'Calendar',
    status: 'active',
    lastUpdated: '2024-01-15T10:45:00Z',
    notifications: 15,
    quickStats: [
      { label: 'Active Projects', value: '34', trend: 'stable' },
      { label: 'On-Time Delivery', value: '87%', trend: 'up' },
      { label: 'Resource Utilization', value: '82%', trend: 'stable' }
    ]
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    description: 'End-to-end supply chain visibility and optimization',
    icon: 'Truck',
    status: 'maintenance',
    lastUpdated: '2024-01-14T16:00:00Z',
    notifications: 1,
    quickStats: [
      { label: 'Shipments Today', value: '67', trend: 'stable' },
      { label: 'On-Time Rate', value: '96%', trend: 'up' },
      { label: 'Transit Time', value: '2.3 days', trend: 'down' }
    ]
  },
  {
    id: 'quality',
    name: 'Quality Management',
    description: 'Quality assurance, compliance, and continuous improvement',
    icon: 'Shield',
    status: 'active',
    lastUpdated: '2024-01-15T11:00:00Z',
    notifications: 4,
    quickStats: [
      { label: 'Quality Score', value: '99.1%', trend: 'stable' },
      { label: 'Defect Rate', value: '0.02%', trend: 'down' },
      { label: 'Compliance', value: '100%', trend: 'stable' }
    ]
  },
  {
    id: 'assets',
    name: 'Asset Management',
    description: 'Equipment tracking, maintenance scheduling, and lifecycle management',
    icon: 'Buildings',
    status: 'active',
    lastUpdated: '2024-01-15T08:45:00Z',
    notifications: 6,
    quickStats: [
      { label: 'Total Assets', value: '1,247', trend: 'up' },
      { label: 'Maintenance Due', value: '18', trend: 'stable' },
      { label: 'Asset Utilization', value: '87%', trend: 'up' }
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    description: 'Advanced analytics, reporting, and data visualization',
    icon: 'ChartBar',
    status: 'active',
    lastUpdated: '2024-01-15T11:30:00Z',
    notifications: 2,
    quickStats: [
      { label: 'Active Reports', value: '127', trend: 'up' },
      { label: 'Data Accuracy', value: '99.8%', trend: 'stable' },
      { label: 'Query Performance', value: '0.3s', trend: 'down' }
    ]
  },
  {
    id: 'document',
    name: 'Document Management',
    description: 'Document storage, version control, and collaboration tools',
    icon: 'FileText',
    status: 'active',
    lastUpdated: '2024-01-15T09:30:00Z',
    notifications: 9,
    quickStats: [
      { label: 'Total Documents', value: '24,567', trend: 'up' },
      { label: 'Storage Used', value: '2.1TB', trend: 'up' },
      { label: 'Collaboration Score', value: '92%', trend: 'stable' }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Risk',
    description: 'Regulatory compliance, risk assessment, and audit management',
    icon: 'UserCheck',
    status: 'active',
    lastUpdated: '2024-01-15T10:15:00Z',
    notifications: 3,
    quickStats: [
      { label: 'Compliance Score', value: '98.5%', trend: 'stable' },
      { label: 'Open Risks', value: '7', trend: 'down' },
      { label: 'Audit Readiness', value: '95%', trend: 'up' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication Hub',
    description: 'Internal messaging, notifications, and collaboration platform',
    icon: 'ChatCircle',
    status: 'active',
    lastUpdated: '2024-01-15T11:45:00Z',
    notifications: 24,
    quickStats: [
      { label: 'Active Users', value: '234', trend: 'stable' },
      { label: 'Messages Today', value: '1,456', trend: 'up' },
      { label: 'Response Time', value: '4 min', trend: 'down' }
    ]
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Inventory Alert',
    message: 'Low stock detected for Product SKU-1234',
    type: 'warning',
    timestamp: '2024-01-15T11:30:00Z',
    isRead: false,
    module: 'inventory'
  },
  {
    id: 'notif-2',
    title: 'New Sales Lead',
    message: 'High-value lead from Enterprise Corp',
    type: 'success',
    timestamp: '2024-01-15T11:15:00Z',
    isRead: false,
    module: 'sales'
  },
  {
    id: 'notif-3',
    title: 'System Maintenance',
    message: 'Supply Chain module scheduled for maintenance',
    type: 'info',
    timestamp: '2024-01-15T10:00:00Z',
    isRead: true,
    module: 'supply-chain'
  }
]

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai-1',
    title: 'Demand Forecast',
    description: 'Product ABC123 demand will increase 30% next month based on seasonal trends',
    type: 'prediction',
    confidence: 87,
    impact: 'high',
    module: 'inventory',
    actionable: true,
    actions: [
      { label: 'Increase Stock Order', action: 'adjust-inventory' },
      { label: 'View Details', action: 'view-forecast' }
    ]
  },
  {
    id: 'ai-2',
    title: 'Cash Flow Optimization',
    description: 'Adjusting payment terms could improve cash flow by $50K',
    type: 'recommendation',
    confidence: 92,
    impact: 'medium',
    module: 'finance',
    actionable: true,
    actions: [
      { label: 'Review Terms', action: 'review-terms' },
      { label: 'Schedule Meeting', action: 'schedule-meeting' }
    ]
  },
  {
    id: 'ai-3',
    title: 'Quality Risk',
    description: 'Supplier XYZ showing quality degradation patterns',
    type: 'alert',
    confidence: 78,
    impact: 'high',
    module: 'quality',
    actionable: true,
    actions: [
      { label: 'Contact Supplier', action: 'contact-supplier' },
      { label: 'Find Alternative', action: 'find-alternative' }
    ]
  }
]

export const mockSystemHealth: SystemHealth = {
  overall: 'healthy',
  services: [
    { name: 'Database', status: 'online', responseTime: 12, uptime: 99.9 },
    { name: 'API Gateway', status: 'online', responseTime: 45, uptime: 99.8 },
    { name: 'Authentication', status: 'online', responseTime: 23, uptime: 100 },
    { name: 'File Storage', status: 'degraded', responseTime: 156, uptime: 98.2 },
    { name: 'Email Service', status: 'online', responseTime: 89, uptime: 99.5 }
  ],
  apiCalls: {
    total: 125430,
    successful: 124891,
    failed: 539
  }
}