import { Contact, Account, Deal, Activity, CRMTask, CRMTicket, CRMAnalytics, CRMSettings } from '@/types/crm'

export const mockContacts: Contact[] = [
  {
    id: 'contact-001',
    companyId: 'comp-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    jobTitle: 'VP of Sales',
    department: 'Sales',
    accountId: 'account-001',
    leadSource: 'website',
    leadScore: 85,
    status: 'qualified',
    tags: ['enterprise', 'hot-lead', 'decision-maker'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: '@sarahj_sales'
    },
    customFields: {
      budget: 250000,
      timeline: 'Q2 2024',
      authority: 'High'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    createdBy: 'user-001',
    assignedTo: 'user-002',
    lastContactDate: '2024-01-18T09:15:00Z',
    nextFollowUpDate: '2024-01-25T10:00:00Z',
    notes: 'Very interested in our enterprise solution. Has budget approved for Q2.'
  },
  {
    id: 'contact-002',
    companyId: 'comp-001',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@innovate.io',
    phone: '+1-555-0234',
    jobTitle: 'CTO',
    department: 'Engineering',
    accountId: 'account-002',
    leadSource: 'referral',
    leadScore: 92,
    status: 'customer',
    tags: ['technical', 'early-adopter', 'reference'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/michaelchen-cto',
      twitter: '@mchen_tech'
    },
    customFields: {
      techStack: 'React, Node.js, PostgreSQL',
      integration: 'API-first',
      scalability: 'High Priority'
    },
    createdAt: '2023-12-10T08:20:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    createdBy: 'user-001',
    assignedTo: 'user-003',
    lastContactDate: '2024-01-19T11:00:00Z',
    nextFollowUpDate: '2024-02-01T14:00:00Z',
    notes: 'Excellent customer, considering expansion to other departments.'
  },
  {
    id: 'contact-003',
    companyId: 'comp-001',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@startupxyz.com',
    phone: '+1-555-0345',
    jobTitle: 'Founder & CEO',
    department: 'Executive',
    accountId: 'account-003',
    leadSource: 'cold_call',
    leadScore: 67,
    status: 'prospect',
    tags: ['startup', 'price-sensitive', 'growth-potential'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/emilyrodriguez-ceo',
      twitter: '@emily_startup'
    },
    customFields: {
      funding: 'Series A',
      employees: 25,
      growth: 'Rapid'
    },
    createdAt: '2024-01-22T13:45:00Z',
    updatedAt: '2024-01-22T13:45:00Z',
    createdBy: 'user-002',
    assignedTo: 'user-002',
    lastContactDate: '2024-01-22T13:45:00Z',
    nextFollowUpDate: '2024-01-26T10:00:00Z',
    notes: 'New startup, very interested but needs to see ROI data.'
  }
]

export const mockAccounts: Account[] = [
  {
    id: 'account-001',
    companyId: 'comp-001',
    name: 'TechCorp Industries',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 'enterprise',
    revenue: 50000000,
    employees: 1200,
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    phone: '+1-555-0100',
    description: 'Leading technology company specializing in enterprise software solutions.',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-002',
    tags: ['enterprise', 'technology', 'high-value'],
    customFields: {
      parentCompany: 'TechCorp Global',
      fiscalYearEnd: 'December',
      preferredVendor: true
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    totalRevenue: 0,
    lastActivityDate: '2024-01-18T09:15:00Z',
    nextReviewDate: '2024-02-15T10:00:00Z'
  },
  {
    id: 'account-002',
    companyId: 'comp-001',
    name: 'Innovate Solutions',
    website: 'https://innovate.io',
    industry: 'Software',
    size: 'medium',
    revenue: 15000000,
    employees: 350,
    address: {
      street: '456 Tech Boulevard',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      zipCode: '78701'
    },
    phone: '+1-555-0200',
    description: 'Innovative software company building next-generation business tools.',
    accountType: 'customer',
    status: 'active',
    owner: 'user-003',
    tags: ['customer', 'software', 'innovation'],
    customFields: {
      contractValue: 120000,
      renewalDate: '2024-12-01',
      satisfactionScore: 9.2
    },
    createdAt: '2023-12-10T08:20:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    totalRevenue: 120000,
    lastActivityDate: '2024-01-19T11:00:00Z',
    nextReviewDate: '2024-06-01T14:00:00Z'
  },
  {
    id: 'account-003',
    companyId: 'comp-001',
    name: 'StartupXYZ',
    website: 'https://startupxyz.com',
    industry: 'FinTech',
    size: 'small',
    revenue: 2000000,
    employees: 25,
    address: {
      street: '789 Startup Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    phone: '+1-555-0300',
    description: 'Fast-growing fintech startup revolutionizing digital payments.',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-002',
    tags: ['startup', 'fintech', 'growth'],
    customFields: {
      fundingStage: 'Series A',
      investors: 'Top Tier VC',
      growthRate: '300%'
    },
    createdAt: '2024-01-22T13:45:00Z',
    updatedAt: '2024-01-22T13:45:00Z',
    totalRevenue: 0,
    lastActivityDate: '2024-01-22T13:45:00Z',
    nextReviewDate: '2024-02-22T10:00:00Z'
  }
]

export const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    companyId: 'comp-001',
    accountId: 'account-001',
    contactId: 'contact-001',
    name: 'TechCorp Enterprise License',
    description: 'Enterprise license for 500 users with premium support',
    value: 250000,
    currency: 'USD',
    stage: 'proposal',
    probability: 75,
    source: 'Inbound Marketing',
    type: 'new_business',
    closeDate: '2024-03-15T00:00:00Z',
    owner: 'user-002',
    team: ['user-002', 'user-003'],
    competitors: ['Salesforce', 'HubSpot'],
    products: [
      {
        id: 'prod-001',
        name: 'Enterprise CRM License',
        quantity: 500,
        unitPrice: 400,
        discount: 0.2
      },
      {
        id: 'prod-002',
        name: 'Premium Support',
        quantity: 1,
        unitPrice: 50000,
        discount: 0
      }
    ],
    tags: ['enterprise', 'high-value', 'q1-target'],
    customFields: {
      decisionDate: '2024-02-28',
      budgetApproved: true,
      technicalFit: 'Excellent'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lastActivityDate: '2024-01-18T09:15:00Z',
    nextAction: 'Send updated proposal with security addendum',
    nextActionDate: '2024-01-25T10:00:00Z'
  },
  {
    id: 'deal-002',
    companyId: 'comp-001',
    accountId: 'account-002',
    contactId: 'contact-002',
    name: 'Innovate Solutions Expansion',
    description: 'Additional licenses and advanced features',
    value: 85000,
    currency: 'USD',
    stage: 'negotiation',
    probability: 90,
    source: 'Existing Customer',
    type: 'upsell',
    closeDate: '2024-02-29T00:00:00Z',
    owner: 'user-003',
    team: ['user-003'],
    competitors: [],
    products: [
      {
        id: 'prod-003',
        name: 'Advanced Analytics Module',
        quantity: 1,
        unitPrice: 50000,
        discount: 0.1
      },
      {
        id: 'prod-001',
        name: 'Additional User Licenses',
        quantity: 100,
        unitPrice: 400,
        discount: 0.15
      }
    ],
    tags: ['upsell', 'existing-customer', 'q1-target'],
    customFields: {
      contractExpiry: '2024-12-01',
      relationshipStrength: 'Strong',
      implementationTime: '2 weeks'
    },
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-20T11:15:00Z',
    lastActivityDate: '2024-01-19T11:00:00Z',
    nextAction: 'Finalize contract terms',
    nextActionDate: '2024-01-24T14:00:00Z'
  }
]

export const mockActivities: Activity[] = [
  {
    id: 'activity-001',
    companyId: 'comp-001',
    type: 'call',
    subject: 'Discovery call with Sarah Johnson',
    description: 'Initial discovery call to understand requirements and pain points',
    startDate: '2024-01-18T09:00:00Z',
    endDate: '2024-01-18T10:00:00Z',
    duration: 60,
    status: 'completed',
    priority: 'high',
    outcome: 'positive',
    contactId: 'contact-001',
    accountId: 'account-001',
    dealId: 'deal-001',
    assignedTo: 'user-002',
    participants: ['user-002', 'contact-001'],
    location: 'Video Conference',
    isRecurring: false,
    reminders: [
      { minutes: 15, sent: true },
      { minutes: 5, sent: true }
    ],
    attachments: [
      {
        id: 'att-001',
        name: 'Meeting Notes.pdf',
        url: '/attachments/meeting-notes-001.pdf',
        size: 156789,
        type: 'application/pdf'
      }
    ],
    tags: ['discovery', 'enterprise', 'qualified'],
    createdAt: '2024-01-17T15:30:00Z',
    updatedAt: '2024-01-18T10:30:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'activity-002',
    companyId: 'comp-001',
    type: 'email',
    subject: 'Proposal follow-up',
    description: 'Sent detailed proposal with pricing and implementation timeline',
    startDate: '2024-01-20T14:30:00Z',
    status: 'completed',
    priority: 'medium',
    outcome: 'neutral',
    contactId: 'contact-001',
    accountId: 'account-001',
    dealId: 'deal-001',
    assignedTo: 'user-002',
    participants: ['user-002'],
    isRecurring: false,
    reminders: [],
    attachments: [
      {
        id: 'att-002',
        name: 'TechCorp Proposal.pdf',
        url: '/attachments/techcorp-proposal.pdf',
        size: 2456789,
        type: 'application/pdf'
      }
    ],
    tags: ['proposal', 'follow-up'],
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    createdBy: 'user-002'
  }
]

export const mockTasks: CRMTask[] = [
  {
    id: 'task-001',
    companyId: 'comp-001',
    title: 'Prepare security addendum for TechCorp',
    description: 'Create detailed security documentation addressing TechCorp\'s compliance requirements',
    type: 'proposal',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-25T17:00:00Z',
    assignedTo: 'user-002',
    createdBy: 'user-002',
    contactId: 'contact-001',
    accountId: 'account-001',
    dealId: 'deal-001',
    estimatedHours: 8,
    actualHours: 5,
    tags: ['security', 'proposal', 'enterprise'],
    dependencies: [],
    attachments: [],
    comments: [
      {
        id: 'comment-001',
        content: 'Started working on the security framework section',
        createdAt: '2024-01-23T10:00:00Z',
        createdBy: 'user-002'
      }
    ],
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z'
  },
  {
    id: 'task-002',
    companyId: 'comp-001',
    title: 'Schedule demo for StartupXYZ',
    description: 'Coordinate product demo with Emily Rodriguez and her technical team',
    type: 'demo',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-01-26T15:00:00Z',
    assignedTo: 'user-002',
    createdBy: 'user-002',
    contactId: 'contact-003',
    accountId: 'account-003',
    estimatedHours: 2,
    tags: ['demo', 'startup', 'scheduling'],
    dependencies: [],
    attachments: [],
    comments: [],
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z'
  }
]

export const mockTickets: CRMTicket[] = [
  {
    id: 'ticket-001',
    companyId: 'comp-001',
    ticketNumber: 'SUP-2024-001',
    subject: 'Integration API timeout issues',
    description: 'Customer experiencing timeout errors when using our REST API for bulk data imports',
    type: 'bug',
    severity: 'high',
    status: 'in_progress',
    priority: 'high',
    contactId: 'contact-002',
    accountId: 'account-002',
    assignedTo: 'user-003',
    assignedTeam: 'Technical Support',
    source: 'email',
    category: 'API',
    subcategory: 'Performance',
    firstResponseTime: 45,
    tags: ['api', 'performance', 'customer'],
    attachments: [
      {
        id: 'att-003',
        name: 'error-logs.txt',
        url: '/attachments/error-logs-001.txt',
        size: 15678,
        type: 'text/plain'
      }
    ],
    timeline: [
      {
        id: 'timeline-001',
        action: 'Ticket Created',
        details: 'Customer reported API timeout issues via email',
        createdAt: '2024-01-19T08:30:00Z',
        createdBy: 'contact-002'
      },
      {
        id: 'timeline-002',
        action: 'First Response',
        details: 'Acknowledged issue and requested additional information',
        createdAt: '2024-01-19T09:15:00Z',
        createdBy: 'user-003'
      },
      {
        id: 'timeline-003',
        action: 'Investigation Started',
        details: 'Technical team investigating API performance issues',
        createdAt: '2024-01-19T10:00:00Z',
        createdBy: 'user-003'
      }
    ],
    createdAt: '2024-01-19T08:30:00Z',
    updatedAt: '2024-01-19T10:00:00Z'
  }
]

export const mockCRMAnalytics: CRMAnalytics = {
  totalContacts: 1247,
  totalAccounts: 186,
  totalDeals: 34,
  totalRevenue: 2450000,
  conversionRate: 23.5,
  averageDealSize: 72059,
  salesCycleLength: 45,
  winRate: 68.2,
  pipelineValue: 1850000,
  forecastRevenue: 3200000,
  topPerformers: [
    {
      userId: 'user-002',
      name: 'Alex Thompson',
      deals: 12,
      revenue: 890000
    },
    {
      userId: 'user-003',
      name: 'Jessica Chen',
      deals: 9,
      revenue: 650000
    },
    {
      userId: 'user-004',
      name: 'David Rodriguez',
      deals: 8,
      revenue: 520000
    }
  ],
  revenueByMonth: [
    { month: '2023-10', revenue: 180000, deals: 3 },
    { month: '2023-11', revenue: 250000, deals: 4 },
    { month: '2023-12', revenue: 320000, deals: 5 },
    { month: '2024-01', revenue: 285000, deals: 4 }
  ],
  leadsBySource: [
    { source: 'Website', count: 342, conversionRate: 28.1 },
    { source: 'Referral', count: 189, conversionRate: 35.4 },
    { source: 'Cold Call', count: 156, conversionRate: 18.6 },
    { source: 'Email', count: 234, conversionRate: 22.3 },
    { source: 'Social Media', count: 98, conversionRate: 15.2 }
  ],
  dealsByStage: [
    { stage: 'Prospecting', count: 8, value: 420000 },
    { stage: 'Qualification', count: 6, value: 350000 },
    { stage: 'Proposal', count: 4, value: 280000 },
    { stage: 'Negotiation', count: 3, value: 185000 },
    { stage: 'Closed Won', count: 13, value: 615000 }
  ]
}

export const mockCRMSettings: CRMSettings = {
  companyId: 'comp-001',
  dealStages: [
    { id: 'prospecting', name: 'Prospecting', order: 1, probability: 10, isActive: true },
    { id: 'qualification', name: 'Qualification', order: 2, probability: 25, isActive: true },
    { id: 'proposal', name: 'Proposal', order: 3, probability: 50, isActive: true },
    { id: 'negotiation', name: 'Negotiation', order: 4, probability: 75, isActive: true },
    { id: 'closed_won', name: 'Closed Won', order: 5, probability: 100, isActive: true },
    { id: 'closed_lost', name: 'Closed Lost', order: 6, probability: 0, isActive: true }
  ],
  leadSources: ['Website', 'Referral', 'Cold Call', 'Email', 'Social Media', 'Event', 'Partner', 'Other'],
  industries: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Government', 'Other'],
  accountTypes: ['Prospect', 'Customer', 'Partner', 'Vendor', 'Competitor'],
  currencies: [
    { code: 'USD', symbol: '$', isDefault: true },
    { code: 'EUR', symbol: '€', isDefault: false },
    { code: 'GBP', symbol: '£', isDefault: false }
  ],
  customFields: [
    {
      entity: 'contact',
      fields: [
        { id: 'budget', name: 'Budget', type: 'number', required: false },
        { id: 'timeline', name: 'Timeline', type: 'text', required: false },
        { id: 'authority', name: 'Decision Authority', type: 'select', required: false, options: ['Low', 'Medium', 'High'] }
      ]
    },
    {
      entity: 'account',
      fields: [
        { id: 'parentCompany', name: 'Parent Company', type: 'text', required: false },
        { id: 'fiscalYearEnd', name: 'Fiscal Year End', type: 'text', required: false },
        { id: 'preferredVendor', name: 'Preferred Vendor Status', type: 'boolean', required: false }
      ]
    }
  ],
  automationRules: [
    {
      id: 'rule-001',
      name: 'High Value Deal Alert',
      trigger: 'deal_created',
      conditions: [{ field: 'value', operator: 'greater_than', value: 100000 }],
      actions: [{ type: 'notification', recipients: ['sales_manager'], message: 'High value deal created' }],
      isActive: true
    }
  ],
  integrations: {
    email: {
      provider: 'outlook',
      enabled: true,
      settings: { syncCalendar: true, trackEmails: true }
    },
    calendar: {
      provider: 'google',
      enabled: true,
      settings: { autoCreateMeetings: true, syncTasks: false }
    },
    telephony: {
      provider: 'twilio',
      enabled: false,
      settings: {}
    }
  },
  permissions: [
    {
      role: 'sales_rep',
      permissions: {
        contacts: ['create', 'read', 'update'],
        accounts: ['create', 'read', 'update'],
        deals: ['create', 'read', 'update'],
        activities: ['create', 'read', 'update'],
        reports: ['read']
      }
    },
    {
      role: 'sales_manager',
      permissions: {
        contacts: ['create', 'read', 'update', 'delete'],
        accounts: ['create', 'read', 'update', 'delete'],
        deals: ['create', 'read', 'update', 'delete'],
        activities: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete']
      }
    }
  ],
  updatedAt: '2024-01-20T10:00:00Z',
  updatedBy: 'user-001'
}