import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LeadManagementSystem } from './LeadManagementSystem'
import { AILeadScoringEngine } from './AILeadScoringEngine'
import { EmailAutomationSystem } from './EmailAutomationSystem'
import { LeadEnrichmentSystem } from './LeadEnrichmentSystem'
import { LeadDuplicateDetection } from './LeadDuplicateDetection'
import { LeadAIInsights } from './LeadAIInsights'
import { 
  Brain, 
  Users, 
  Target, 
  TrendUp, 
  Mail,
  Globe,
  Search,
  Sparkle,
  Activity,
  CheckCircle,
  AlertTriangle,
  Star,
  Clock,
  Phone,
  Calendar,
  BarChart,
  Settings
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
  leadStatus: string
  leadRating: string
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  leadSource: string
  createdAt: string
  enrichmentStatus?: string
  enrichmentScore?: number
}

interface ComprehensiveLeadManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function ComprehensiveLeadManagement({ 
  companyId, 
  userId, 
  userRole 
}: ComprehensiveLeadManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Mock data for demonstration
  React.useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: 'lead-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0123',
        companyName: 'TechCorp Industries',
        jobTitle: 'CTO',
        leadStatus: 'qualified',
        leadRating: 'hot',
        aiLeadScore: 85,
        aiConversionProbability: 0.75,
        aiEstimatedDealValue: 150000,
        leadSource: 'Website',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        enrichmentStatus: 'completed',
        enrichmentScore: 92
      },
      {
        id: 'lead-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@healthcare.com',
        phone: '+1-555-0456',
        companyName: 'Healthcare Solutions Inc',
        jobTitle: 'VP Operations',
        leadStatus: 'contacted',
        leadRating: 'warm',
        aiLeadScore: 62,
        aiConversionProbability: 0.45,
        aiEstimatedDealValue: 75000,
        leadSource: 'LinkedIn',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        enrichmentStatus: 'completed',
        enrichmentScore: 78
      },
      {
        id: 'lead-003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@startup.io',
        companyName: 'InnovateTech Startup',
        jobTitle: 'Founder & CEO',
        leadStatus: 'new',
        leadRating: 'cold',
        aiLeadScore: 35,
        aiConversionProbability: 0.15,
        aiEstimatedDealValue: 25000,
        leadSource: 'Trade Show',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        enrichmentStatus: 'pending',
        enrichmentScore: 45
      }
    ]
    setLeads(mockLeads)
  }, [])

  const handleLeadUpdate = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, ...updates }
        : lead
    ))
  }

  const handleLeadMerge = (primaryLead: Lead, duplicateLeads: Lead[]) => {
    // Remove duplicate leads and update primary
    const duplicateIds = duplicateLeads.map(d => d.id)
    setLeads(prev => prev.filter(lead => !duplicateIds.includes(lead.id)))
    toast.success(`Merged ${duplicateLeads.length} duplicate leads`)
  }

  // Statistics
  const stats = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(l => l.leadStatus === 'qualified').length,
    hotLeads: leads.filter(l => l.leadRating === 'hot').length,
    avgAIScore: Math.round(leads.reduce((sum, l) => sum + l.aiLeadScore, 0) / leads.length) || 0,
    enrichedLeads: leads.filter(l => l.enrichmentStatus === 'completed').length,
    avgEnrichmentScore: Math.round(leads.filter(l => l.enrichmentScore).reduce((sum, l) => sum + (l.enrichmentScore || 0), 0) / leads.filter(l => l.enrichmentScore).length) || 0,
    totalPipelineValue: leads.reduce((sum, l) => sum + l.aiEstimatedDealValue, 0)
  }

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'High-Value Lead Identified',
      description: `${leads.find(l => l.aiLeadScore > 80)?.firstName} ${leads.find(l => l.aiLeadScore > 80)?.lastName} has an 85 AI score and should be prioritized`,
      priority: 'high',
      action: 'Schedule demo call'
    },
    {
      type: 'recommendation',
      title: 'Email Campaign Opportunity',
      description: `${leads.filter(l => l.leadStatus === 'new').length} new leads could benefit from welcome email sequence`,
      priority: 'medium',
      action: 'Start automation'
    },
    {
      type: 'warning',
      title: 'Lead Enrichment Needed',
      description: `${leads.filter(l => l.enrichmentStatus !== 'completed').length} leads need data enrichment for better scoring`,
      priority: 'medium',
      action: 'Enrich data'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Lead Management</h1>
          <p className="text-muted-foreground">
            Comprehensive lead management with AI scoring, automation, and enrichment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain size={12} />
            AI Enhanced
          </Badge>
          <Badge variant="outline">
            {leads.length} Total Leads
          </Badge>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <Users className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualifiedLeads}</p>
              </div>
              <Target className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">{stats.hotLeads}</p>
              </div>
              <Star className="text-red-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgAIScore}</p>
              </div>
              <Brain className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enriched</p>
                <p className="text-2xl font-bold text-orange-600">{stats.enrichedLeads}</p>
              </div>
              <Globe className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrichment</p>
                <p className="text-2xl font-bold text-teal-600">{stats.avgEnrichmentScore}%</p>
              </div>
              <CheckCircle className="text-teal-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-600">${(stats.totalPipelineValue / 1000).toFixed(0)}K</p>
              </div>
              <TrendUp className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle className="text-yellow-500" size={20} />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                  insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge 
                    variant={insight.priority === 'high' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <Button size="sm" variant="outline" className="text-xs">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Brain size={16} />
            AI Scoring
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Mail size={16} />
            Automation
          </TabsTrigger>
          <TabsTrigger value="enrichment" className="flex items-center gap-2">
            <Globe size={16} />
            Enrichment
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2">
            <Search size={16} />
            Duplicates
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkle size={16} />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <LeadManagementSystem
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          {selectedLead ? (
            <AILeadScoringEngine
              lead={selectedLead}
              onScoreUpdate={handleLeadUpdate}
              onInsightAction={(insight, action) => {
                toast.success(`Action executed: ${action}`)
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI Lead Scoring Engine</h3>
                <p className="text-muted-foreground mb-4">
                  Select a lead from the overview to view detailed AI scoring analysis
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  View All Leads
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <EmailAutomationSystem
            companyId={companyId}
            userId={userId}
            userRole={userRole}
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
          />
        </TabsContent>

        <TabsContent value="enrichment" className="space-y-6">
          <LeadEnrichmentSystem
            companyId={companyId}
            userId={userId}
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
          />
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-6">
          <LeadDuplicateDetection
            companyId={companyId}
            userId={userId}
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
            onLeadMerge={handleLeadMerge}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <LeadAIInsights
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}