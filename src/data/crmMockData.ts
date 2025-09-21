import { Contact, Account, Deal, Activity, CRMTask, CRMTicket, CRMAnalytics, CRMSettings, Lead, LeadActivity, CRMFile } from '@/types/crm'

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    companyId: 'comp-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    accountId: 'acc-001',
    accountName: 'TechCorp Industries',
    company: 'TechCorp Industries', // Deprecated but kept for compatibility
    jobTitle: 'VP of Sales',
    title: 'VP of Sales', // Deprecated but kept for compatibility
    source: 'Website',
    status: 'qualified',
    score: 85,
    leadScore: 85,
    priority: 'high',
    estimatedValue: 250000,
    assignedTo: 'user-002',
    tags: ['enterprise', 'hot-lead', 'decision-maker'],
    notes: 'Very interested in our enterprise solution. Has budget approved for Q2.',
    customFields: {
      budget: 250000,
      timeline: 'Q2 2024',
      authority: 'High'
    },
    activities: [],
    files: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lastContactDate: '2024-01-18T09:15:00Z',
    nextFollowUpDate: '2024-01-25T10:00:00Z',
    nextFollowUp: '2024-01-25T10:00:00Z',
    leadAge: 8,
    lastActivityDate: '2024-01-18T09:15:00Z',
    overdueDays: 0
  },
  {
    id: 'lead-002',
    companyId: 'comp-001',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@innovate.io',
    phone: '+1-555-0234',
    accountId: 'acc-002',
    accountName: 'Innovate Solutions',
    company: 'Innovate Solutions', // Deprecated but kept for compatibility
    jobTitle: 'CTO',
    title: 'CTO', // Deprecated but kept for compatibility
    source: 'Referral',
    status: 'converted',
    score: 92,
    leadScore: 92,
    priority: 'high',
    estimatedValue: 120000,
    assignedTo: 'user-003',
    tags: ['technical', 'early-adopter', 'customer'],
    notes: 'Excellent customer, considering expansion to other departments.',
    customFields: {
      techStack: 'React, Node.js, PostgreSQL',
      integration: 'API-first',
      scalability: 'High Priority'
    },
    activities: [],
    files: [],
    createdAt: '2023-12-10T08:20:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    lastContactDate: '2024-01-19T11:00:00Z',
    nextFollowUpDate: '2024-02-01T14:00:00Z',
    nextFollowUp: '2024-02-01T14:00:00Z',
    leadAge: 45,
    lastActivityDate: '2024-01-19T11:00:00Z',
    overdueDays: 0
  },
  {
    id: 'lead-003',
    companyId: 'comp-001',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@startupxyz.com',
    phone: '+1-555-0345',
    accountId: 'acc-003',
    accountName: 'StartupXYZ',
    company: 'StartupXYZ', // Deprecated but kept for compatibility
    jobTitle: 'Founder & CEO',
    title: 'Founder & CEO', // Deprecated but kept for compatibility
    source: 'Cold Call',
    status: 'new',
    score: 67,
    leadScore: 67,
    priority: 'medium',
    estimatedValue: 45000,
    assignedTo: 'user-002',
    tags: ['startup', 'price-sensitive', 'growth-potential'],
    notes: 'New startup, very interested but needs to see ROI data.',
    customFields: {
      funding: 'Series A',
      employees: 25,
      growth: 'Rapid'
    },
    activities: [],
    files: [],
    createdAt: '2024-01-22T13:45:00Z',
    updatedAt: '2024-01-22T13:45:00Z',
    lastContactDate: '2024-01-22T13:45:00Z',
    nextFollowUpDate: '2024-01-26T10:00:00Z',
    nextFollowUp: '2024-01-26T10:00:00Z',
    leadAge: 1,
    lastActivityDate: '2024-01-22T13:45:00Z',
    overdueDays: 0
  },
  {
    id: 'lead-004',
    companyId: 'comp-001',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@midcorp.com',
    phone: '+1-555-0456',
    accountId: 'acc-004',
    accountName: 'MidCorp Industries',
    company: 'MidCorp Industries', // Deprecated but kept for compatibility
    jobTitle: 'IT Director',
    title: 'IT Director', // Deprecated but kept for compatibility
    source: 'Email Campaign',
    status: 'contacted',
    score: 78,
    leadScore: 78,
    priority: 'medium',
    estimatedValue: 85000,
    assignedTo: 'user-002',
    tags: ['enterprise', 'technical', 'decision-maker'],
    notes: 'Technical decision maker, interested in scalability and integration capabilities.',
    customFields: {
      techFocus: 'Enterprise Architecture',
      teamSize: 150,
      budget: 'Approved'
    },
    activities: [],
    files: [],
    createdAt: new Date('2024-01-20T08:00:00Z'),
    updatedAt: new Date('2024-01-22T10:30:00Z'),
    lastContactDate: new Date('2024-01-22T10:30:00Z'),
    nextFollowUpDate: new Date('2024-01-26T15:00:00Z')
  },
  {
    id: 'lead-005',
    companyId: 'comp-001',
    firstName: 'Rachel',
    lastName: 'Martinez',
    email: 'rachel.martinez@startupflow.io',
    phone: '+1-555-0567',
    company: 'StartupFlow Inc',
    title: 'VP Operations',
    source: 'LinkedIn',
    status: 'qualified',
    score: 89,
    estimatedValue: 35000,
    assignedTo: 'user-003',
    tags: ['startup', 'operations', 'growth'],
    notes: 'Very motivated to move off spreadsheets. Ready to demo and move quickly.',
    customFields: {
      previousCRM: 'Spreadsheets',
      urgency: 'High',
      teamGrowth: '3x in 6 months'
    },
    activities: [],
    files: [],
    createdAt: new Date('2024-01-18T11:20:00Z'),
    updatedAt: new Date('2024-01-23T09:45:00Z'),
    lastContactDate: new Date('2024-01-23T09:45:00Z'),
    nextFollowUpDate: new Date('2024-01-25T14:00:00Z')
  },
  {
    id: 'lead-006',
    companyId: 'comp-001',
    firstName: 'Jennifer',
    lastName: 'Banks',
    email: 'jennifer.banks@regionalbank.com',
    phone: '+1-555-0789',
    company: 'RegionalBank Corp',
    title: 'VP Technology',
    source: 'Trade Show',
    status: 'lost',
    score: 25,
    estimatedValue: 500000,
    assignedTo: 'user-004',
    tags: ['banking', 'compliance', 'lost-deal'],
    notes: 'Lost deal due to compliance requirements. Chose Salesforce Financial Services.',
    customFields: {
      complianceNeeds: 'SOX, Basel III',
      decisionProcess: 'Committee',
      competitorChosen: 'Salesforce Financial Services'
    },
    activities: [],
    files: [],
    createdAt: new Date('2023-11-15T09:00:00Z'),
    updatedAt: new Date('2024-01-10T17:00:00Z'),
    lastContactDate: new Date('2024-01-10T17:00:00Z'),
    nextFollowUpDate: new Date('2024-06-01T10:00:00Z')
  }
]

// Enhanced mock accounts that integrate with leads
export const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    companyId: 'comp-001',
    name: 'TechCorp Industries',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 'large',
    revenue: 50000000,
    employees: 500,
    address: {
      street: '123 Tech Boulevard',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    phone: '+1-555-0100',
    description: 'Leading enterprise technology solutions provider specializing in cloud infrastructure and data analytics.',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-002',
    tags: ['enterprise', 'technology', 'high-value'],
    customFields: {
      vertical: 'Enterprise Software',
      priority: 'high',
      decisionMakers: 3,
      budgetCycle: 'Q2'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    totalRevenue: 250000,
    lastActivityDate: '2024-01-18T14:20:00Z',
    nextReviewDate: '2024-02-15T10:00:00Z'
  },
  {
    id: 'acc-002',
    companyId: 'comp-001',
    name: 'Innovate Solutions',
    website: 'https://innovatesolutions.io',
    industry: 'Software Development',
    size: 'medium',
    revenue: 8000000,
    employees: 120,
    address: {
      street: '456 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      zipCode: '78701'
    },
    phone: '+1-555-0200',
    description: 'Mid-size software development company focused on fintech and healthcare solutions.',
    accountType: 'customer',
    status: 'active',
    owner: 'user-003',
    tags: ['customer', 'fintech', 'reference-customer'],
    customFields: {
      vertical: 'Fintech',
      priority: 'high',
      contractValue: 120000,
      renewalDate: '2024-12-01'
    },
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    totalRevenue: 480000,
    lastActivityDate: '2024-01-19T11:00:00Z',
    nextReviewDate: '2024-03-01T09:00:00Z'
  },
  {
    id: 'acc-003',
    companyId: 'comp-001',
    name: 'StartupXYZ',
    website: 'https://startupxyz.com',
    industry: 'E-commerce',
    size: 'small',
    revenue: 2500000,
    employees: 25,
    address: {
      street: '789 Startup Lane',
      city: 'Boulder',
      state: 'CO',
      country: 'USA',
      zipCode: '80301'
    },
    phone: '+1-555-0300',
    description: 'Fast-growing e-commerce startup with innovative product recommendation engine.',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-002',
    tags: ['startup', 'e-commerce', 'growth-potential'],
    customFields: {
      vertical: 'E-commerce',
      priority: 'medium',
      fundingStage: 'Series A',
      growthRate: '150%'
    },
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-22T13:45:00Z',
    totalRevenue: 0,
    lastActivityDate: '2024-01-22T13:45:00Z',
    nextReviewDate: '2024-02-20T11:00:00Z'
  },
  {
    id: 'acc-004',
    companyId: 'comp-001',
    name: 'MidCorp Industries',
    website: 'https://midcorp.com',
    industry: 'Manufacturing',
    size: 'large',
    revenue: 75000000,
    employees: 850,
    address: {
      street: '321 Industrial Way',
      city: 'Detroit',
      state: 'MI',
      country: 'USA',
      zipCode: '48201'
    },
    phone: '+1-555-0400',
    description: 'Traditional manufacturing company modernizing their operations with digital transformation.',
    accountType: 'prospect',
    status: 'active',
    owner: 'user-001',
    tags: ['manufacturing', 'digital-transformation', 'enterprise'],
    customFields: {
      vertical: 'Manufacturing',
      priority: 'medium',
      digitalMaturity: 'Low',
      transformationBudget: 1000000
    },
    createdAt: '2024-01-05T09:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    totalRevenue: 85000,
    lastActivityDate: '2024-01-15T14:20:00Z',
    nextReviewDate: '2024-02-05T10:00:00Z'
  },
  {
    id: 'acc-005',
    companyId: 'comp-001',
    name: 'Global Enterprises Ltd',
    website: 'https://globalenterprises.com',
    industry: 'Consulting',
    size: 'enterprise',
    revenue: 150000000,
    employees: 2500,
    address: {
      street: '100 Corporate Plaza',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    phone: '+1-555-0500',
    description: 'Large multinational consulting firm serving Fortune 500 companies across various industries.',
    accountType: 'customer',
    status: 'active',
    owner: 'user-001',
    tags: ['enterprise', 'consulting', 'multinational', 'strategic-partner'],
    customFields: {
      vertical: 'Management Consulting',
      priority: 'high',
      partnerLevel: 'Strategic',
      globalPresence: true
    },
    createdAt: '2023-10-01T08:00:00Z',
    updatedAt: '2024-01-10T17:00:00Z',
    totalRevenue: 2500000,
    lastActivityDate: '2024-01-10T17:00:00Z',
    nextReviewDate: '2024-04-01T10:00:00Z'
  }
]

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
  },
  {
    id: 'contact-004',
    companyId: 'comp-001',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@globaltech.com',
    phone: '+1-555-0456',
    jobTitle: 'CTO',
    department: 'Technology',
    accountId: 'account-004',
    leadSource: 'cold_call',
    leadScore: 45,
    status: 'prospect',
    tags: ['enterprise', 'technical', 'decision-maker'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/michaelchen-cto'
    },
    customFields: {
      techFocus: 'Enterprise Architecture',
      teamSize: 150,
      budget: 'TBD'
    },
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-22T10:30:00Z',
    createdBy: 'user-002',
    assignedTo: 'user-002',
    lastContactDate: '2024-01-22T10:30:00Z',
    nextFollowUpDate: '2024-01-26T15:00:00Z',
    notes: 'Technical decision maker, interested in scalability and integration capabilities.'
  },
  {
    id: 'contact-005',
    companyId: 'comp-001',
    firstName: 'Rachel',
    lastName: 'Martinez',
    email: 'rachel.martinez@startupflow.io',
    phone: '+1-555-0567',
    jobTitle: 'VP Operations',
    department: 'Operations',
    accountId: 'account-005',
    leadSource: 'website',
    leadScore: 78,
    status: 'qualified',
    tags: ['startup', 'operations', 'growth'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/rachelmartinez-ops',
      twitter: '@rachel_ops'
    },
    customFields: {
      previousCRM: 'Spreadsheets',
      urgency: 'High',
      teamGrowth: '3x in 6 months'
    },
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-23T09:45:00Z',
    createdBy: 'user-003',
    assignedTo: 'user-003',
    lastContactDate: '2024-01-23T09:45:00Z',
    nextFollowUpDate: '2024-01-25T14:00:00Z',
    notes: 'Very motivated to move off spreadsheets. Ready to demo and move quickly.'
  },
  {
    id: 'contact-006',
    companyId: 'comp-001',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@midcorp.com',
    phone: '+1-555-0678',
    jobTitle: 'IT Director',
    department: 'Information Technology',
    accountId: 'account-006',
    leadSource: 'referral',
    leadScore: 92,
    status: 'customer',
    tags: ['customer', 'upgrade', 'expansion'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/davidthompson-it'
    },
    customFields: {
      currentPackage: 'Professional',
      satisfactionScore: 8.5,
      renewalDate: '2024-12-01'
    },
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    createdBy: 'user-002',
    assignedTo: 'user-002',
    lastContactDate: '2024-01-14T16:30:00Z',
    nextFollowUpDate: '2024-02-01T09:00:00Z',
    notes: 'Existing customer looking to upgrade due to team growth. Very satisfied with current service.'
  },
  {
    id: 'contact-007',
    companyId: 'comp-001',
    firstName: 'Jennifer',
    lastName: 'Banks',
    email: 'jennifer.banks@regionalbank.com',
    phone: '+1-555-0789',
    jobTitle: 'VP Technology',
    department: 'Technology',
    accountId: 'account-007',
    leadSource: 'referral',
    leadScore: 25,
    status: 'churned',
    tags: ['banking', 'compliance', 'lost-deal'],
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/jenniferbanks-vp'
    },
    customFields: {
      complianceNeeds: 'SOX, Basel III',
      decisionProcess: 'Committee',
      competitorChosen: 'Salesforce Financial Services'
    },
    createdAt: '2023-11-15T09:00:00Z',
    updatedAt: '2024-01-10T17:00:00Z',
    createdBy: 'user-004',
    assignedTo: 'user-004',
    lastContactDate: '2024-01-10T17:00:00Z',
    nextFollowUpDate: '2024-06-01T10:00:00Z',
    notes: 'Lost deal due to compliance requirements. Chose Salesforce Financial Services. Keep for future opportunities.'
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
    nextActionDate: '2024-01-25T10:00:00Z',
    stageChangedAt: '2024-01-18T09:15:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2024-01-15T10:30:00Z',
        changedBy: 'user-002',
        reason: 'Initial qualification'
      },
      {
        stage: 'qualification',
        changedAt: '2024-01-16T14:20:00Z',
        changedBy: 'user-002',
        reason: 'Budget confirmed'
      },
      {
        stage: 'proposal',
        changedAt: '2024-01-18T09:15:00Z',
        changedBy: 'user-002',
        reason: 'Proposal submitted'
      }
    ],
    temperature: 'hot',
    forecast: true,
    estimatedRevenue: 250000,
    weightedValue: 187500
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
    nextActionDate: '2024-01-24T14:00:00Z',
    stageChangedAt: '2024-01-19T11:00:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2024-01-05T14:20:00Z',
        changedBy: 'user-003',
        reason: 'Upsell opportunity identified'
      },
      {
        stage: 'qualification',
        changedAt: '2024-01-10T09:30:00Z',
        changedBy: 'user-003',
        reason: 'Requirements confirmed'
      },
      {
        stage: 'proposal',
        changedAt: '2024-01-15T16:45:00Z',
        changedBy: 'user-003',
        reason: 'Proposal accepted'
      },
      {
        stage: 'negotiation',
        changedAt: '2024-01-19T11:00:00Z',
        changedBy: 'user-003',
        reason: 'Contract negotiations started'
      }
    ],
    temperature: 'hot',
    forecast: true,
    estimatedRevenue: 85000,
    weightedValue: 76500
  },
  {
    id: 'deal-003',
    companyId: 'comp-001',
    accountId: 'account-003',
    contactId: 'contact-003',
    name: 'GlobalTech CRM Implementation',
    description: 'Full CRM system implementation with data migration',
    value: 450000,
    currency: 'USD',
    stage: 'prospecting',
    probability: 15,
    source: 'Cold Outreach',
    type: 'new_business',
    closeDate: '2024-04-30T00:00:00Z',
    owner: 'user-002',
    team: ['user-002', 'user-004'],
    competitors: ['Microsoft Dynamics', 'Zoho'],
    products: [
      {
        id: 'prod-004',
        name: 'Enterprise CRM Suite',
        quantity: 1000,
        unitPrice: 350,
        discount: 0.1
      },
      {
        id: 'prod-005',
        name: 'Data Migration Service',
        quantity: 1,
        unitPrice: 100000,
        discount: 0
      }
    ],
    tags: ['enterprise', 'implementation', 'migration'],
    customFields: {
      currentProvider: 'Legacy System',
      migrationComplexity: 'High',
      decisionTimeframe: 'Q2 2024'
    },
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-22T10:30:00Z',
    lastActivityDate: '2024-01-22T10:30:00Z',
    nextAction: 'Discovery call with IT team',
    nextActionDate: '2024-01-26T15:00:00Z',
    stageChangedAt: '2024-01-20T08:00:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2024-01-20T08:00:00Z',
        changedBy: 'user-002',
        reason: 'Initial contact made'
      }
    ],
    temperature: 'warm',
    forecast: false,
    estimatedRevenue: 450000,
    weightedValue: 67500
  },
  {
    id: 'deal-004',
    companyId: 'comp-001',
    accountId: 'account-004',
    contactId: 'contact-004',
    name: 'StartupFlow CRM License',
    description: 'Small business CRM package for growing startup',
    value: 25000,
    currency: 'USD',
    stage: 'qualification',
    probability: 30,
    source: 'Website',
    type: 'new_business',
    closeDate: '2024-03-01T00:00:00Z',
    owner: 'user-003',
    team: ['user-003'],
    competitors: ['HubSpot', 'Pipedrive'],
    products: [
      {
        id: 'prod-006',
        name: 'Startup CRM Package',
        quantity: 50,
        unitPrice: 500,
        discount: 0
      }
    ],
    tags: ['startup', 'small-business', 'growth'],
    customFields: {
      companyStage: 'Series A',
      growthRate: '200% YoY',
      teamSize: '45'
    },
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-23T09:45:00Z',
    lastActivityDate: '2024-01-23T09:45:00Z',
    nextAction: 'Product demo presentation',
    nextActionDate: '2024-01-25T14:00:00Z',
    stageChangedAt: '2024-01-23T09:45:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2024-01-18T11:20:00Z',
        changedBy: 'user-003',
        reason: 'Inbound lead from website'
      },
      {
        stage: 'qualification',
        changedAt: '2024-01-23T09:45:00Z',
        changedBy: 'user-003',
        reason: 'Budget and timeline confirmed'
      }
    ],
    temperature: 'hot',
    forecast: true,
    estimatedRevenue: 25000,
    weightedValue: 7500
  },
  {
    id: 'deal-005',
    companyId: 'comp-001',
    accountId: 'account-005',
    contactId: 'contact-005',
    name: 'MidCorp System Upgrade',
    description: 'Upgrade from basic to enterprise package',
    value: 150000,
    currency: 'USD',
    stage: 'closed_won',
    probability: 100,
    source: 'Existing Customer',
    type: 'upsell',
    closeDate: '2024-01-15T00:00:00Z',
    actualCloseDate: '2024-01-14T00:00:00Z',
    owner: 'user-002',
    team: ['user-002', 'user-003'],
    competitors: [],
    products: [
      {
        id: 'prod-007',
        name: 'Enterprise Upgrade Package',
        quantity: 200,
        unitPrice: 750,
        discount: 0
      }
    ],
    tags: ['upsell', 'existing-customer', 'closed-won'],
    customFields: {
      previousPackage: 'Professional',
      upgradeReason: 'Team Growth',
      satisfactionScore: 9
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    lastActivityDate: '2024-01-14T16:30:00Z',
    nextAction: 'Implementation kickoff',
    nextActionDate: '2024-01-20T10:00:00Z',
    stageChangedAt: '2024-01-14T16:30:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2024-01-01T10:00:00Z',
        changedBy: 'user-002',
        reason: 'Upsell opportunity identified'
      },
      {
        stage: 'qualification',
        changedAt: '2024-01-03T14:00:00Z',
        changedBy: 'user-002',
        reason: 'Requirements confirmed'
      },
      {
        stage: 'proposal',
        changedAt: '2024-01-08T11:00:00Z',
        changedBy: 'user-002',
        reason: 'Proposal submitted'
      },
      {
        stage: 'negotiation',
        changedAt: '2024-01-12T15:30:00Z',
        changedBy: 'user-002',
        reason: 'Contract negotiations'
      },
      {
        stage: 'closed_won',
        changedAt: '2024-01-14T16:30:00Z',
        changedBy: 'user-002',
        reason: 'Contract signed'
      }
    ],
    temperature: 'hot',
    forecast: true,
    estimatedRevenue: 150000,
    weightedValue: 150000
  },
  {
    id: 'deal-006',
    companyId: 'comp-001',
    accountId: 'account-006',
    contactId: 'contact-006',
    name: 'RegionalBank Integration',
    description: 'Banking sector CRM with compliance features',
    value: 750000,
    currency: 'USD',
    stage: 'closed_lost',
    probability: 0,
    source: 'Referral',
    type: 'new_business',
    closeDate: '2024-01-10T00:00:00Z',
    actualCloseDate: '2024-01-10T00:00:00Z',
    owner: 'user-004',
    team: ['user-004', 'user-002'],
    competitors: ['Salesforce Financial Services'],
    products: [
      {
        id: 'prod-008',
        name: 'Banking CRM Suite',
        quantity: 1,
        unitPrice: 750000,
        discount: 0
      }
    ],
    lossReason: 'Compliance requirements not met',
    tags: ['banking', 'compliance', 'closed-lost'],
    customFields: {
      complianceLevel: 'SOX, Basel III',
      integrationComplexity: 'Very High',
      competitorChosen: 'Salesforce'
    },
    createdAt: '2023-11-15T09:00:00Z',
    updatedAt: '2024-01-10T17:00:00Z',
    lastActivityDate: '2024-01-10T17:00:00Z',
    nextAction: 'Post-mortem analysis',
    nextActionDate: '2024-01-15T10:00:00Z',
    stageChangedAt: '2024-01-10T17:00:00Z',
    stageHistory: [
      {
        stage: 'prospecting',
        changedAt: '2023-11-15T09:00:00Z',
        changedBy: 'user-004',
        reason: 'Referral from partner'
      },
      {
        stage: 'qualification',
        changedAt: '2023-11-20T14:00:00Z',
        changedBy: 'user-004',
        reason: 'Initial requirements gathered'
      },
      {
        stage: 'proposal',
        changedAt: '2023-12-10T11:00:00Z',
        changedBy: 'user-004',
        reason: 'Detailed proposal submitted'
      },
      {
        stage: 'negotiation',
        changedAt: '2023-12-20T15:30:00Z',
        changedBy: 'user-004',
        reason: 'Compliance discussions ongoing'
      },
      {
        stage: 'closed_lost',
        changedAt: '2024-01-10T17:00:00Z',
        changedBy: 'user-004',
        reason: 'Unable to meet compliance requirements'
      }
    ],
    temperature: 'cold',
    forecast: false,
    estimatedRevenue: 0,
    weightedValue: 0
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
  pipelineSettings: {
    stages: [
      { id: 'prospecting', name: 'Prospecting', order: 1, probability: 10, isActive: true, color: '#94A3B8', isWon: false, isLost: false },
      { id: 'qualification', name: 'Qualification', order: 2, probability: 25, isActive: true, color: '#3B82F6', isWon: false, isLost: false },
      { id: 'proposal', name: 'Proposal', order: 3, probability: 50, isActive: true, color: '#F59E0B', isWon: false, isLost: false },
      { id: 'negotiation', name: 'Negotiation', order: 4, probability: 75, isActive: true, color: '#F97316', isWon: false, isLost: false },
      { id: 'closed_won', name: 'Closed Won', order: 5, probability: 100, isActive: true, color: '#10B981', isWon: true, isLost: false },
      { id: 'closed_lost', name: 'Closed Lost', order: 6, probability: 0, isActive: true, color: '#EF4444', isWon: false, isLost: true }
    ],
    autoMove: false,
    requireReason: true,
    forecastInclude: ['qualification', 'proposal', 'negotiation']
  },
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