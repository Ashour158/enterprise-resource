import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Globe, 
  User, 
  MapPin, 
  Building, 
  TrendUp, 
  DollarSign,
  Users,
  Mail,
  Phone,
  LinkedIn,
  Twitter,
  Instagram,
  Facebook,
  Globe as Website,
  Briefcase,
  GraduationCap,
  Calendar,
  Star,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkle,
  Brain,
  Search,
  Target,
  Activity
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  jobTitle?: string
  industry?: string
  companySize?: string
  leadSource: string
  customFields: Record<string, any>
  enrichmentData?: EnrichmentData
  enrichmentStatus?: 'pending' | 'completed' | 'failed' | 'partial'
  enrichmentScore?: number
  createdAt: string
  updatedAt: string
}

interface EnrichmentData {
  personal: {
    fullName?: string
    profilePicture?: string
    location?: {
      city?: string
      state?: string
      country?: string
      timezone?: string
    }
    socialProfiles?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      instagram?: string
    }
    education?: Education[]
    workHistory?: WorkExperience[]
    skills?: string[]
    interests?: string[]
    personalityTraits?: string[]
  }
  company: {
    fullName?: string
    domain?: string
    logo?: string
    description?: string
    industry?: string
    companySize?: string
    foundingYear?: number
    headquarters?: {
      address?: string
      city?: string
      state?: string
      country?: string
    }
    revenue?: {
      amount?: number
      currency?: string
      year?: number
    }
    employees?: {
      count?: number
      range?: string
      growth?: number
    }
    technology?: {
      stack?: string[]
      platforms?: string[]
      tools?: string[]
    }
    socialPresence?: {
      website?: string
      linkedin?: string
      twitter?: string
      facebook?: string
    }
    funding?: {
      stage?: string
      totalRaised?: number
      investors?: string[]
      lastRound?: {
        amount?: number
        date?: string
        type?: string
      }
    }
    news?: NewsItem[]
    competitors?: string[]
    executiveTeam?: Executive[]
  }
  enrichmentMetadata: {
    sources?: string[]
    confidence?: number
    lastUpdated?: string
    dataQuality?: number
    completeness?: number
  }
}

interface Education {
  institution: string
  degree?: string
  field?: string
  startYear?: number
  endYear?: number
}

interface WorkExperience {
  company: string
  title: string
  startDate?: string
  endDate?: string
  description?: string
  current?: boolean
}

interface Executive {
  name: string
  title: string
  linkedinUrl?: string
  image?: string
}

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
}

interface EnrichmentProvider {
  id: string
  name: string
  description: string
  categories: string[]
  confidence: number
  cost: number
  isActive: boolean
}

interface LeadEnrichmentSystemProps {
  companyId: string
  userId: string
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
}

export function LeadEnrichmentSystem({ 
  companyId, 
  userId, 
  leads, 
  onLeadUpdate 
}: LeadEnrichmentSystemProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [enrichmentProviders, setEnrichmentProviders] = useKV(`enrichment-providers-${companyId}`, [] as EnrichmentProvider[])
  const [isEnriching, setIsEnriching] = useState<Set<string>>(new Set())
  const [bulkEnrichmentStatus, setBulkEnrichmentStatus] = useState<{
    inProgress: boolean
    total: number
    completed: number
    failed: number
  }>({
    inProgress: false,
    total: 0,
    completed: 0,
    failed: 0
  })
  const [enrichmentSettings, setEnrichmentSettings] = useKV(`enrichment-settings-${companyId}`, {
    autoEnrichNewLeads: true,
    enrichmentThreshold: 70,
    maxCostPerLead: 2.0,
    preferredProviders: ['clearbit', 'zoominfo', 'apollo'],
    enrichmentCategories: ['personal', 'company', 'social', 'technology']
  })

  // Initialize enrichment providers
  useEffect(() => {
    if (enrichmentProviders.length === 0) {
      const providers: EnrichmentProvider[] = [
        {
          id: 'clearbit',
          name: 'Clearbit',
          description: 'Comprehensive person and company data enrichment',
          categories: ['personal', 'company', 'social'],
          confidence: 0.92,
          cost: 1.50,
          isActive: true
        },
        {
          id: 'zoominfo',
          name: 'ZoomInfo',
          description: 'B2B contact and company intelligence',
          categories: ['personal', 'company', 'professional'],
          confidence: 0.89,
          cost: 2.00,
          isActive: true
        },
        {
          id: 'apollo',
          name: 'Apollo.io',
          description: 'Sales intelligence and lead data',
          categories: ['personal', 'company', 'technology'],
          confidence: 0.85,
          cost: 1.25,
          isActive: true
        },
        {
          id: 'builtwith',
          name: 'BuiltWith',
          description: 'Technology stack and web presence analysis',
          categories: ['technology', 'company'],
          confidence: 0.95,
          cost: 0.75,
          isActive: true
        },
        {
          id: 'linkedin',
          name: 'LinkedIn Sales Navigator',
          description: 'Professional profiles and company insights',
          categories: ['personal', 'professional', 'company'],
          confidence: 0.93,
          cost: 1.00,
          isActive: true
        },
        {
          id: 'crunchbase',
          name: 'Crunchbase',
          description: 'Company funding, news, and executive data',
          categories: ['company', 'funding', 'news'],
          confidence: 0.88,
          cost: 0.50,
          isActive: false
        }
      ]
      setEnrichmentProviders(providers)
    }
  }, [enrichmentProviders.length, setEnrichmentProviders])

  // Enrich single lead
  const enrichLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead || isEnriching.has(leadId)) return

    setIsEnriching(prev => new Set([...prev, leadId]))

    try {
      // Update lead status
      onLeadUpdate(leadId, { enrichmentStatus: 'pending' })

      // Simulate enrichment process
      await new Promise(resolve => setTimeout(resolve, 2000))

      const enrichmentData = await performEnrichment(lead)
      const enrichmentScore = calculateEnrichmentScore(enrichmentData)

      onLeadUpdate(leadId, {
        enrichmentData,
        enrichmentStatus: 'completed',
        enrichmentScore,
        updatedAt: new Date().toISOString()
      })

      toast.success(`Lead enriched successfully (${enrichmentScore}% complete)`)
    } catch (error) {
      console.error('Enrichment failed:', error)
      onLeadUpdate(leadId, { enrichmentStatus: 'failed' })
      toast.error('Failed to enrich lead data')
    } finally {
      setIsEnriching(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }

  // Bulk enrichment
  const bulkEnrichLeads = async (leadIds: string[]) => {
    setBulkEnrichmentStatus({
      inProgress: true,
      total: leadIds.length,
      completed: 0,
      failed: 0
    })

    for (let i = 0; i < leadIds.length; i++) {
      try {
        await enrichLead(leadIds[i])
        setBulkEnrichmentStatus(prev => ({
          ...prev,
          completed: prev.completed + 1
        }))
      } catch (error) {
        setBulkEnrichmentStatus(prev => ({
          ...prev,
          failed: prev.failed + 1
        }))
      }
    }

    setBulkEnrichmentStatus(prev => ({ ...prev, inProgress: false }))
    toast.success('Bulk enrichment completed')
  }

  // Perform enrichment simulation
  const performEnrichment = async (lead: Lead): Promise<EnrichmentData> => {
    const enrichmentData: EnrichmentData = {
      personal: {
        fullName: `${lead.firstName} ${lead.lastName}`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.email}`,
        location: {
          city: generateRandomCity(),
          state: generateRandomState(),
          country: 'United States',
          timezone: 'EST'
        },
        socialProfiles: {
          linkedin: `https://linkedin.com/in/${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}`,
          twitter: Math.random() > 0.5 ? `https://twitter.com/${lead.firstName.toLowerCase()}${lead.lastName.toLowerCase()}` : undefined
        },
        education: [
          {
            institution: generateRandomUniversity(),
            degree: 'Bachelor of Science',
            field: generateRandomField(),
            startYear: 2010,
            endYear: 2014
          }
        ],
        workHistory: [
          {
            company: lead.companyName || 'Previous Company',
            title: lead.jobTitle || 'Senior Role',
            startDate: '2020-01-01',
            current: true
          }
        ],
        skills: generateRandomSkills(),
        interests: generateRandomInterests(),
        personalityTraits: generatePersonalityTraits()
      },
      company: {
        fullName: lead.companyName || 'Unknown Company',
        domain: generateCompanyDomain(lead.companyName),
        logo: `https://logo.clearbit.com/${generateCompanyDomain(lead.companyName)}`,
        description: generateCompanyDescription(lead.industry),
        industry: lead.industry || generateRandomIndustry(),
        companySize: lead.companySize || generateRandomCompanySize(),
        foundingYear: Math.floor(Math.random() * 30) + 1990,
        headquarters: {
          city: generateRandomCity(),
          state: generateRandomState(),
          country: 'United States'
        },
        revenue: {
          amount: Math.floor(Math.random() * 100000000) + 1000000,
          currency: 'USD',
          year: 2023
        },
        employees: {
          count: generateEmployeeCount(lead.companySize),
          range: lead.companySize || '51-200',
          growth: Math.floor(Math.random() * 20) - 5
        },
        technology: {
          stack: generateTechStack(lead.industry),
          platforms: ['AWS', 'Microsoft Azure'],
          tools: ['Salesforce', 'HubSpot', 'Slack']
        },
        socialPresence: {
          website: generateCompanyDomain(lead.companyName),
          linkedin: `https://linkedin.com/company/${lead.companyName?.toLowerCase().replace(/\s+/g, '-')}`,
          twitter: `https://twitter.com/${lead.companyName?.toLowerCase().replace(/\s+/g, '')}`
        },
        funding: generateFundingData(),
        news: generateNewsItems(lead.companyName),
        competitors: generateCompetitors(lead.industry),
        executiveTeam: generateExecutiveTeam()
      },
      enrichmentMetadata: {
        sources: ['clearbit', 'zoominfo', 'apollo'],
        confidence: 0.85 + Math.random() * 0.15,
        lastUpdated: new Date().toISOString(),
        dataQuality: 0.80 + Math.random() * 0.20,
        completeness: 0.75 + Math.random() * 0.25
      }
    }

    return enrichmentData
  }

  // Calculate enrichment score
  const calculateEnrichmentScore = (data: EnrichmentData): number => {
    let score = 0
    let maxScore = 0

    // Personal data scoring
    const personalFields = [
      'profilePicture', 'location', 'socialProfiles', 'education', 'workHistory', 'skills'
    ]
    personalFields.forEach(field => {
      maxScore += 10
      if (data.personal[field as keyof typeof data.personal]) score += 10
    })

    // Company data scoring
    const companyFields = [
      'domain', 'logo', 'description', 'industry', 'revenue', 'employees', 'technology'
    ]
    companyFields.forEach(field => {
      maxScore += 15
      if (data.company[field as keyof typeof data.company]) score += 15
    })

    return Math.round((score / maxScore) * 100)
  }

  // Helper functions for data generation
  const generateRandomCity = () => {
    const cities = ['New York', 'San Francisco', 'Chicago', 'Boston', 'Austin', 'Seattle', 'Denver', 'Atlanta']
    return cities[Math.floor(Math.random() * cities.length)]
  }

  const generateRandomState = () => {
    const states = ['NY', 'CA', 'IL', 'MA', 'TX', 'WA', 'CO', 'GA']
    return states[Math.floor(Math.random() * states.length)]
  }

  const generateRandomUniversity = () => {
    const universities = ['Harvard University', 'MIT', 'Stanford University', 'UC Berkeley', 'NYU', 'Columbia University']
    return universities[Math.floor(Math.random() * universities.length)]
  }

  const generateRandomField = () => {
    const fields = ['Computer Science', 'Business Administration', 'Engineering', 'Marketing', 'Finance', 'Economics']
    return fields[Math.floor(Math.random() * fields.length)]
  }

  const generateRandomSkills = () => {
    const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis', 'Project Management']
    return skills.sort(() => 0.5 - Math.random()).slice(0, 5)
  }

  const generateRandomInterests = () => {
    const interests = ['Technology', 'Innovation', 'Startups', 'AI/ML', 'Cloud Computing', 'Digital Transformation', 'Sustainability', 'Leadership']
    return interests.sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  const generatePersonalityTraits = () => {
    const traits = ['Analytical', 'Strategic', 'Detail-oriented', 'Innovative', 'Results-driven', 'Collaborative', 'Technical', 'Leadership-focused']
    return traits.sort(() => 0.5 - Math.random()).slice(0, 3)
  }

  const generateCompanyDomain = (companyName?: string) => {
    if (!companyName) return 'example.com'
    return `${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`
  }

  const generateCompanyDescription = (industry?: string) => {
    const descriptions = {
      'Technology': 'Leading technology company focused on innovative solutions and digital transformation.',
      'Healthcare': 'Healthcare technology company improving patient outcomes through innovative solutions.',
      'Finance': 'Financial services company providing cutting-edge fintech solutions.',
      'Manufacturing': 'Manufacturing company leveraging automation and smart technologies.',
      'Retail': 'Retail company focused on omnichannel customer experiences.'
    }
    return descriptions[industry as keyof typeof descriptions] || 'Innovative company in their respective industry.'
  }

  const generateRandomIndustry = () => {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Real Estate']
    return industries[Math.floor(Math.random() * industries.length)]
  }

  const generateRandomCompanySize = () => {
    const sizes = ['1-10', '11-50', '51-200', '201-1000', '1000+']
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

  const generateEmployeeCount = (size?: string) => {
    const ranges = {
      '1-10': Math.floor(Math.random() * 10) + 1,
      '11-50': Math.floor(Math.random() * 40) + 11,
      '51-200': Math.floor(Math.random() * 150) + 51,
      '201-1000': Math.floor(Math.random() * 800) + 201,
      '1000+': Math.floor(Math.random() * 5000) + 1000
    }
    return ranges[size as keyof typeof ranges] || 100
  }

  const generateTechStack = (industry?: string) => {
    const techStacks = {
      'Technology': ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      'Healthcare': ['FHIR', 'HL7', 'Epic', 'Cerner', 'AWS Healthcare', 'HIPAA Compliance'],
      'Finance': ['Java', 'Spring', 'Oracle', 'MongoDB', 'Kafka', 'Microservices'],
      'Manufacturing': ['IoT', 'Edge Computing', 'SAP', 'Oracle ERP', 'Industrial IoT'],
      'Retail': ['Shopify', 'Magento', 'Salesforce Commerce', 'Adobe Experience Cloud']
    }
    return techStacks[industry as keyof typeof techStacks] || ['JavaScript', 'Python', 'AWS', 'Docker']
  }

  const generateFundingData = () => {
    const stages = ['Seed', 'Series A', 'Series B', 'Series C', 'Growth']
    const stage = stages[Math.floor(Math.random() * stages.length)]
    
    return {
      stage,
      totalRaised: Math.floor(Math.random() * 50000000) + 1000000,
      investors: ['Accel Partners', 'Sequoia Capital', 'Andreessen Horowitz'].slice(0, Math.floor(Math.random() * 3) + 1),
      lastRound: {
        amount: Math.floor(Math.random() * 20000000) + 1000000,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: stage
      }
    }
  }

  const generateNewsItems = (companyName?: string): NewsItem[] => {
    if (!companyName) return []
    
    return [
      {
        title: `${companyName} Announces New Product Launch`,
        description: `${companyName} unveils innovative solution to revolutionize their industry.`,
        url: `https://news.example.com/${companyName.toLowerCase().replace(/\s+/g, '-')}-product-launch`,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'TechCrunch'
      },
      {
        title: `${companyName} Raises Series B Funding`,
        description: `${companyName} secures significant funding to accelerate growth and expansion.`,
        url: `https://news.example.com/${companyName.toLowerCase().replace(/\s+/g, '-')}-funding`,
        publishedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'VentureBeat'
      }
    ]
  }

  const generateCompetitors = (industry?: string) => {
    const competitors = {
      'Technology': ['Microsoft', 'Google', 'Amazon', 'Apple', 'Meta'],
      'Healthcare': ['Epic Systems', 'Cerner', 'Allscripts', 'athenahealth'],
      'Finance': ['Salesforce Financial Services', 'Fiserv', 'FIS', 'Jack Henry'],
      'Manufacturing': ['Siemens', 'GE Digital', 'Honeywell', 'Rockwell Automation'],
      'Retail': ['Shopify', 'BigCommerce', 'WooCommerce', 'Magento']
    }
    const industryCompetitors = competitors[industry as keyof typeof competitors] || ['Generic Competitor 1', 'Generic Competitor 2']
    return industryCompetitors.slice(0, 3)
  }

  const generateExecutiveTeam = (): Executive[] => {
    return [
      {
        name: 'John Smith',
        title: 'Chief Executive Officer',
        linkedinUrl: 'https://linkedin.com/in/johnsmith-ceo',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnsmith'
      },
      {
        name: 'Sarah Johnson',
        title: 'Chief Technology Officer',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson-cto',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahjohnson'
      },
      {
        name: 'Michael Chen',
        title: 'Chief Marketing Officer',
        linkedinUrl: 'https://linkedin.com/in/michaelchen-cmo',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michaelchen'
      }
    ]
  }

  // Statistics
  const enrichedLeads = leads.filter(l => l.enrichmentStatus === 'completed')
  const avgEnrichmentScore = enrichedLeads.length > 0 
    ? Math.round(enrichedLeads.reduce((sum, l) => sum + (l.enrichmentScore || 0), 0) / enrichedLeads.length)
    : 0
  const pendingEnrichment = leads.filter(l => l.enrichmentStatus === 'pending' || isEnriching.has(l.id)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lead Enrichment</h2>
          <p className="text-muted-foreground">
            AI-powered data enrichment with external sources and social media integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => bulkEnrichLeads(leads.filter(l => !l.enrichmentData).map(l => l.id))}
            disabled={bulkEnrichmentStatus.inProgress}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={bulkEnrichmentStatus.inProgress ? 'animate-spin' : ''} />
            Bulk Enrich
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enriched Leads</p>
                <p className="text-2xl font-bold">{enrichedLeads.length}</p>
              </div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Enrichment</p>
                <p className="text-2xl font-bold text-blue-600">{avgEnrichmentScore}%</p>
              </div>
              <Target className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{pendingEnrichment}</p>
              </div>
              <Activity className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold text-purple-600">{enrichmentProviders.filter(p => p.isActive).length}</p>
              </div>
              <Globe className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Enrichment Progress */}
      {bulkEnrichmentStatus.inProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} />
              Bulk Enrichment in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{bulkEnrichmentStatus.completed} / {bulkEnrichmentStatus.total}</span>
              </div>
              <Progress value={(bulkEnrichmentStatus.completed / bulkEnrichmentStatus.total) * 100} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Completed: {bulkEnrichmentStatus.completed}</span>
                <span>Failed: {bulkEnrichmentStatus.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lead.enrichmentData?.personal?.profilePicture ? (
                    <img 
                      src={lead.enrichmentData.personal.profilePicture} 
                      alt={`${lead.firstName} ${lead.lastName}`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{lead.jobTitle || 'No title'}</p>
                  </div>
                </div>
                <Badge 
                  variant={
                    lead.enrichmentStatus === 'completed' ? 'default' :
                    lead.enrichmentStatus === 'pending' || isEnriching.has(lead.id) ? 'secondary' :
                    lead.enrichmentStatus === 'failed' ? 'destructive' : 'outline'
                  }
                >
                  {isEnriching.has(lead.id) ? 'Enriching...' : 
                   lead.enrichmentStatus === 'completed' ? `${lead.enrichmentScore}%` :
                   lead.enrichmentStatus || 'Not Enriched'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Company Info */}
              <div className="flex items-center gap-2">
                {lead.enrichmentData?.company?.logo ? (
                  <img 
                    src={lead.enrichmentData.company.logo} 
                    alt={lead.companyName || 'Company'}
                    className="w-6 h-6 rounded"
                  />
                ) : (
                  <Building size={16} className="text-muted-foreground" />
                )}
                <span className="text-sm">{lead.companyName || 'Unknown Company'}</span>
              </div>

              {/* Location */}
              {lead.enrichmentData?.personal?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm">
                    {lead.enrichmentData.personal.location.city}, {lead.enrichmentData.personal.location.state}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
              </div>

              {/* Social Profiles */}
              {lead.enrichmentData?.personal?.socialProfiles && (
                <div className="flex items-center gap-2">
                  {lead.enrichmentData.personal.socialProfiles.linkedin && (
                    <LinkedIn size={16} className="text-blue-600" />
                  )}
                  {lead.enrichmentData.personal.socialProfiles.twitter && (
                    <Twitter size={16} className="text-sky-500" />
                  )}
                  {lead.enrichmentData.personal.socialProfiles.facebook && (
                    <Facebook size={16} className="text-blue-700" />
                  )}
                </div>
              )}

              {/* Skills */}
              {lead.enrichmentData?.personal?.skills && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {lead.enrichmentData.personal.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {lead.enrichmentData.personal.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{lead.enrichmentData.personal.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Enrichment Progress */}
              {lead.enrichmentStatus === 'completed' && lead.enrichmentScore && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Data Completeness</span>
                    <span>{lead.enrichmentScore}%</span>
                  </div>
                  <Progress value={lead.enrichmentScore} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLead(lead)}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  View
                </Button>
                {(!lead.enrichmentData || lead.enrichmentStatus !== 'completed') && (
                  <Button
                    size="sm"
                    onClick={() => enrichLead(lead.id)}
                    disabled={isEnriching.has(lead.id)}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw size={14} className={isEnriching.has(lead.id) ? 'animate-spin' : ''} />
                    {isEnriching.has(lead.id) ? 'Enriching...' : 'Enrich'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Enrichment Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Enriched Data - {selectedLead?.firstName} {selectedLead?.lastName}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedLead?.enrichmentData && (
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profile Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedLead.enrichmentData.personal.profilePicture || ''} 
                            alt="Profile"
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold">{selectedLead.enrichmentData.personal.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{selectedLead.jobTitle}</p>
                          </div>
                        </div>
                        {selectedLead.enrichmentData.personal.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>
                              {selectedLead.enrichmentData.personal.location.city}, {selectedLead.enrichmentData.personal.location.state}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Education */}
                    {selectedLead.enrichmentData.personal.education && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap size={20} />
                            Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedLead.enrichmentData.personal.education.map((edu, index) => (
                            <div key={index} className="space-y-1">
                              <h4 className="font-medium">{edu.institution}</h4>
                              <p className="text-sm text-muted-foreground">
                                {edu.degree} in {edu.field}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {edu.startYear} - {edu.endYear}
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Work History */}
                    {selectedLead.enrichmentData.personal.workHistory && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase size={20} />
                            Work History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedLead.enrichmentData.personal.workHistory.map((work, index) => (
                            <div key={index} className="space-y-1">
                              <h4 className="font-medium">{work.title}</h4>
                              <p className="text-sm text-muted-foreground">{work.company}</p>
                              <p className="text-xs text-muted-foreground">
                                {work.startDate} - {work.current ? 'Present' : work.endDate}
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Skills & Interests */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skills & Interests</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedLead.enrichmentData.personal.skills && (
                          <div>
                            <h4 className="font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.enrichmentData.personal.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedLead.enrichmentData.personal.interests && (
                          <div>
                            <h4 className="font-medium mb-2">Interests</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.enrichmentData.personal.interests.map((interest, index) => (
                                <Badge key={index} variant="outline">{interest}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Company Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedLead.enrichmentData.company.logo || ''} 
                            alt="Company Logo"
                            className="w-12 h-12 rounded"
                          />
                          <div>
                            <h3 className="font-semibold">{selectedLead.enrichmentData.company.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{selectedLead.enrichmentData.company.industry}</p>
                          </div>
                        </div>
                        <p className="text-sm">{selectedLead.enrichmentData.company.description}</p>
                      </CardContent>
                    </Card>

                    {/* Financial Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign size={20} />
                          Financial Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedLead.enrichmentData.company.revenue && (
                          <div className="flex justify-between">
                            <span>Revenue ({selectedLead.enrichmentData.company.revenue.year})</span>
                            <span className="font-medium">
                              ${selectedLead.enrichmentData.company.revenue.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedLead.enrichmentData.company.employees && (
                          <div className="flex justify-between">
                            <span>Employees</span>
                            <span className="font-medium">
                              {selectedLead.enrichmentData.company.employees.count.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedLead.enrichmentData.company.foundingYear && (
                          <div className="flex justify-between">
                            <span>Founded</span>
                            <span className="font-medium">{selectedLead.enrichmentData.company.foundingYear}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Technology Stack */}
                    {selectedLead.enrichmentData.company.technology && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Technology Stack</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedLead.enrichmentData.company.technology.stack?.map((tech, index) => (
                              <Badge key={index} variant="secondary">{tech}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Executive Team */}
                    {selectedLead.enrichmentData.company.executiveTeam && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users size={20} />
                            Executive Team
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedLead.enrichmentData.company.executiveTeam.map((exec, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <img 
                                src={exec.image || ''} 
                                alt={exec.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <h4 className="font-medium">{exec.name}</h4>
                                <p className="text-sm text-muted-foreground">{exec.title}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal Social Profiles */}
                    {selectedLead.enrichmentData.personal.socialProfiles && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personal Social Profiles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(selectedLead.enrichmentData.personal.socialProfiles).map(([platform, url]) => {
                            if (!url) return null
                            const Icon = platform === 'linkedin' ? LinkedIn : 
                                      platform === 'twitter' ? Twitter :
                                      platform === 'facebook' ? Facebook :
                                      platform === 'instagram' ? Instagram : Globe
                            return (
                              <div key={platform} className="flex items-center gap-2">
                                <Icon size={20} />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )}

                    {/* Company Social Presence */}
                    {selectedLead.enrichmentData.company.socialPresence && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Company Social Presence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Object.entries(selectedLead.enrichmentData.company.socialPresence).map(([platform, url]) => {
                            if (!url) return null
                            const Icon = platform === 'linkedin' ? LinkedIn : 
                                      platform === 'twitter' ? Twitter :
                                      platform === 'facebook' ? Facebook :
                                      platform === 'website' ? Website : Globe
                            return (
                              <div key={platform} className="flex items-center gap-2">
                                <Icon size={20} />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enrichment Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data Quality</Label>
                          <div className="mt-1">
                            <Progress value={(selectedLead.enrichmentData.enrichmentMetadata.dataQuality || 0) * 100} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((selectedLead.enrichmentData.enrichmentMetadata.dataQuality || 0) * 100)}% quality score
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label>Completeness</Label>
                          <div className="mt-1">
                            <Progress value={(selectedLead.enrichmentData.enrichmentMetadata.completeness || 0) * 100} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((selectedLead.enrichmentData.enrichmentMetadata.completeness || 0) * 100)}% complete
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Data Sources</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedLead.enrichmentData.enrichmentMetadata.sources?.map((source, index) => (
                            <Badge key={index} variant="outline">{source}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Last Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedLead.enrichmentData.enrichmentMetadata.lastUpdated && 
                            new Date(selectedLead.enrichmentData.enrichmentMetadata.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Confidence Score</Label>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((selectedLead.enrichmentData.enrichmentMetadata.confidence || 0) * 100)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}