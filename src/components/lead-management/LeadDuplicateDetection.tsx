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
  Search, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  X,
  Merge,
  Eye,
  Brain,
  Target,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Sparkle,
  TrendUp,
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
  leadSource: string
  aiLeadScore: number
  createdAt: string
  customFields: Record<string, any>
  duplicateLeads?: string[]
  duplicateStatus?: 'pending' | 'merged' | 'ignored'
}

interface DuplicateGroup {
  id: string
  leads: Lead[]
  similarityScore: number
  matchingFields: string[]
  status: 'pending' | 'reviewed' | 'merged' | 'ignored'
  aiConfidence: number
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  mergeDecision?: {
    primaryLeadId: string
    mergedFields: Record<string, any>
    reason: string
  }
}

interface SimilarityAnalysis {
  overall: number
  email: number
  name: number
  company: number
  phone: number
  address: number
}

interface LeadDuplicateDetectionProps {
  companyId: string
  userId: string
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
  onLeadMerge: (primaryLead: Lead, duplicateLeads: Lead[]) => void
}

export function LeadDuplicateDetection({ 
  companyId, 
  userId, 
  leads, 
  onLeadUpdate, 
  onLeadMerge 
}: LeadDuplicateDetectionProps) {
  const [duplicateGroups, setDuplicateGroups] = useKV(`duplicate-groups-${companyId}`, [] as DuplicateGroup[])
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [detectionSettings, setDetectionSettings] = useKV(`duplicate-detection-settings-${companyId}`, {
    emailThreshold: 100, // Exact match required
    nameThreshold: 85,
    companyThreshold: 80,
    phoneThreshold: 100, // Exact match required
    overallThreshold: 75,
    autoMergeThreshold: 95,
    enableAIDetection: true,
    checkFields: ['email', 'name', 'company', 'phone', 'address']
  })

  // Initialize with existing duplicates
  useEffect(() => {
    if (duplicateGroups.length === 0 && leads.length > 1) {
      detectDuplicates()
    }
  }, [leads.length, duplicateGroups.length])

  // Detect duplicates using AI-powered similarity analysis
  const detectDuplicates = async () => {
    setIsScanning(true)
    setScanProgress(0)

    try {
      const groups: DuplicateGroup[] = []
      const processedLeads = new Set<string>()

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i]
        if (processedLeads.has(lead.id)) continue

        const duplicates: Lead[] = []
        
        for (let j = i + 1; j < leads.length; j++) {
          const otherLead = leads[j]
          if (processedLeads.has(otherLead.id)) continue

          const similarity = calculateSimilarity(lead, otherLead)
          
          if (similarity.overall >= detectionSettings.overallThreshold / 100) {
            duplicates.push(otherLead)
            processedLeads.add(otherLead.id)
          }
        }

        if (duplicates.length > 0) {
          const allLeads = [lead, ...duplicates]
          const groupSimilarity = calculateGroupSimilarity(allLeads)
          
          const group: DuplicateGroup = {
            id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            leads: allLeads,
            similarityScore: groupSimilarity.overall,
            matchingFields: getMatchingFields(allLeads),
            status: groupSimilarity.overall >= detectionSettings.autoMergeThreshold / 100 ? 'reviewed' : 'pending',
            aiConfidence: calculateAIConfidence(allLeads, groupSimilarity),
            createdAt: new Date().toISOString()
          }

          groups.push(group)
          allLeads.forEach(l => processedLeads.add(l.id))
        } else {
          processedLeads.add(lead.id)
        }

        setScanProgress(((i + 1) / leads.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate processing time
      }

      setDuplicateGroups(groups)
      toast.success(`Found ${groups.length} potential duplicate groups`)
    } catch (error) {
      console.error('Duplicate detection failed:', error)
      toast.error('Failed to detect duplicates')
    } finally {
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  // Calculate similarity between two leads
  const calculateSimilarity = (lead1: Lead, lead2: Lead): SimilarityAnalysis => {
    const similarity: SimilarityAnalysis = {
      overall: 0,
      email: 0,
      name: 0,
      company: 0,
      phone: 0,
      address: 0
    }

    // Email similarity (exact match or normalized)
    if (lead1.email && lead2.email) {
      const email1 = lead1.email.toLowerCase().trim()
      const email2 = lead2.email.toLowerCase().trim()
      similarity.email = email1 === email2 ? 100 : 0
    }

    // Name similarity (fuzzy matching)
    const name1 = `${lead1.firstName} ${lead1.lastName}`.toLowerCase().trim()
    const name2 = `${lead2.firstName} ${lead2.lastName}`.toLowerCase().trim()
    similarity.name = calculateFuzzyMatch(name1, name2) * 100

    // Company similarity
    if (lead1.companyName && lead2.companyName) {
      const company1 = lead1.companyName.toLowerCase().trim()
      const company2 = lead2.companyName.toLowerCase().trim()
      similarity.company = calculateFuzzyMatch(company1, company2) * 100
    }

    // Phone similarity (normalized)
    if (lead1.phone && lead2.phone) {
      const phone1 = normalizePhone(lead1.phone)
      const phone2 = normalizePhone(lead2.phone)
      similarity.phone = phone1 === phone2 ? 100 : 0
    }

    // Calculate overall similarity
    const weights = {
      email: 0.4,
      name: 0.3,
      company: 0.15,
      phone: 0.15
    }

    similarity.overall = 
      similarity.email * weights.email +
      similarity.name * weights.name +
      similarity.company * weights.company +
      similarity.phone * weights.phone

    return similarity
  }

  // Calculate fuzzy string matching using Levenshtein distance
  const calculateFuzzyMatch = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0
    if (str1 === str2) return 1

    const matrix = []
    const len1 = str1.length
    const len2 = str2.length

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    const maxLen = Math.max(len1, len2)
    return (maxLen - matrix[len2][len1]) / maxLen
  }

  // Normalize phone numbers for comparison
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '').replace(/^1/, '') // Remove non-digits and leading 1
  }

  // Calculate group similarity
  const calculateGroupSimilarity = (leads: Lead[]): SimilarityAnalysis => {
    if (leads.length < 2) return { overall: 0, email: 0, name: 0, company: 0, phone: 0, address: 0 }

    let totalSimilarity = { overall: 0, email: 0, name: 0, company: 0, phone: 0, address: 0 }
    let comparisons = 0

    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        const similarity = calculateSimilarity(leads[i], leads[j])
        totalSimilarity.overall += similarity.overall
        totalSimilarity.email += similarity.email
        totalSimilarity.name += similarity.name
        totalSimilarity.company += similarity.company
        totalSimilarity.phone += similarity.phone
        totalSimilarity.address += similarity.address
        comparisons++
      }
    }

    return {
      overall: totalSimilarity.overall / comparisons,
      email: totalSimilarity.email / comparisons,
      name: totalSimilarity.name / comparisons,
      company: totalSimilarity.company / comparisons,
      phone: totalSimilarity.phone / comparisons,
      address: totalSimilarity.address / comparisons
    }
  }

  // Get matching fields for a group
  const getMatchingFields = (leads: Lead[]): string[] => {
    const fields: string[] = []
    
    // Check email matches
    const emails = leads.map(l => l.email?.toLowerCase()).filter(Boolean)
    if (emails.length > 1 && new Set(emails).size === 1) {
      fields.push('email')
    }

    // Check name matches
    const names = leads.map(l => `${l.firstName} ${l.lastName}`.toLowerCase())
    if (names.length > 1 && new Set(names).size === 1) {
      fields.push('name')
    }

    // Check company matches
    const companies = leads.map(l => l.companyName?.toLowerCase()).filter(Boolean)
    if (companies.length > 1 && new Set(companies).size === 1) {
      fields.push('company')
    }

    // Check phone matches
    const phones = leads.map(l => l.phone ? normalizePhone(l.phone) : null).filter(Boolean)
    if (phones.length > 1 && new Set(phones).size === 1) {
      fields.push('phone')
    }

    return fields
  }

  // Calculate AI confidence score
  const calculateAIConfidence = (leads: Lead[], similarity: SimilarityAnalysis): number => {
    let confidence = similarity.overall / 100

    // Boost confidence for exact matches
    if (similarity.email === 100) confidence += 0.2
    if (similarity.phone === 100) confidence += 0.15
    if (similarity.name > 90) confidence += 0.1

    // Reduce confidence for edge cases
    if (leads.length > 3) confidence -= 0.1 // Too many in group
    if (similarity.overall < 80) confidence -= 0.15

    return Math.min(0.99, Math.max(0.1, confidence))
  }

  // Handle merge action
  const handleMergeLeads = async (groupId: string, primaryLeadId: string) => {
    const group = duplicateGroups.find(g => g.id === groupId)
    if (!group) return

    const primaryLead = group.leads.find(l => l.id === primaryLeadId)
    const duplicateLeads = group.leads.filter(l => l.id !== primaryLeadId)
    
    if (!primaryLead) return

    // Merge lead data
    const mergedData = mergeLeadData(primaryLead, duplicateLeads)
    
    // Update the group status
    const updatedGroup = {
      ...group,
      status: 'merged' as const,
      reviewedAt: new Date().toISOString(),
      reviewedBy: userId,
      mergeDecision: {
        primaryLeadId,
        mergedFields: mergedData,
        reason: 'Manual merge decision'
      }
    }

    setDuplicateGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g))
    
    // Update the primary lead with merged data
    onLeadUpdate(primaryLeadId, mergedData)
    
    // Call the merge callback
    onLeadMerge(primaryLead, duplicateLeads)
    
    toast.success(`Merged ${duplicateLeads.length} duplicate leads into ${primaryLead.firstName} ${primaryLead.lastName}`)
  }

  // Merge lead data intelligently
  const mergeLeadData = (primaryLead: Lead, duplicateLeads: Lead[]): Partial<Lead> => {
    const merged: Partial<Lead> = { ...primaryLead }

    duplicateLeads.forEach(duplicate => {
      // Merge custom fields
      merged.customFields = {
        ...merged.customFields,
        ...duplicate.customFields
      }

      // Fill in missing contact information
      if (!merged.phone && duplicate.phone) merged.phone = duplicate.phone
      if (!merged.jobTitle && duplicate.jobTitle) merged.jobTitle = duplicate.jobTitle
      
      // Combine tags
      if (duplicate.customFields?.tags) {
        const existingTags = merged.customFields?.tags || []
        const newTags = duplicate.customFields.tags
        merged.customFields = {
          ...merged.customFields,
          tags: [...new Set([...existingTags, ...newTags])]
        }
      }

      // Use highest AI score
      if (duplicate.aiLeadScore > (merged.aiLeadScore || 0)) {
        merged.aiLeadScore = duplicate.aiLeadScore
      }
    })

    return merged
  }

  // Handle ignore action
  const handleIgnoreGroup = async (groupId: string) => {
    setDuplicateGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            status: 'ignored' as const, 
            reviewedAt: new Date().toISOString(),
            reviewedBy: userId 
          }
        : g
    ))
    toast.success('Duplicate group marked as ignored')
  }

  // Statistics
  const pendingGroups = duplicateGroups.filter(g => g.status === 'pending').length
  const highConfidenceGroups = duplicateGroups.filter(g => g.aiConfidence > 0.8).length
  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + g.leads.length - 1, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Duplicate Detection</h2>
          <p className="text-muted-foreground">
            AI-powered duplicate lead detection with similarity scoring and smart merging
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={detectDuplicates}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Search size={16} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duplicate Groups</p>
                <p className="text-2xl font-bold">{duplicateGroups.length}</p>
              </div>
              <Users className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{pendingGroups}</p>
              </div>
              <AlertTriangle className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold text-green-600">{highConfidenceGroups}</p>
              </div>
              <Brain className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duplicates</p>
                <p className="text-2xl font-bold text-purple-600">{totalDuplicates}</p>
              </div>
              <Target className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="animate-spin" size={20} />
              Scanning for Duplicates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} />
              <p className="text-xs text-muted-foreground">
                Analyzing {leads.length} leads using AI-powered similarity detection
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {duplicateGroups.length > 0 ? (
          duplicateGroups.map((group) => (
            <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">
                        Duplicate Group ({group.leads.length} leads)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(group.similarityScore)}% similarity • {group.matchingFields.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        group.status === 'pending' ? 'destructive' :
                        group.status === 'merged' ? 'default' : 'secondary'
                      }
                    >
                      {group.status}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Brain size={12} />
                      {Math.round(group.aiConfidence * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Similarity Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Overall</p>
                    <div className="flex items-center gap-2">
                      <Progress value={group.similarityScore} className="h-2 flex-1" />
                      <span className="font-medium">{Math.round(group.similarityScore)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AI Confidence</p>
                    <div className="flex items-center gap-2">
                      <Progress value={group.aiConfidence * 100} className="h-2 flex-1" />
                      <span className="font-medium">{Math.round(group.aiConfidence * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Leads</p>
                    <p className="font-medium">{group.leads.length}</p>
                  </div>
                </div>

                {/* Lead Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Leads in this group:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.leads.map((lead) => (
                      <div key={lead.id} className="p-3 bg-muted rounded-lg">
                        <div className="font-medium text-sm">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            {lead.email}
                          </div>
                          {lead.companyName && (
                            <div className="flex items-center gap-1">
                              <Building size={12} />
                              {lead.companyName}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              {lead.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Sparkle size={12} />
                            AI Score: {lead.aiLeadScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {group.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Review & Merge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIgnoreGroup(group.id)}
                      className="flex items-center gap-1"
                    >
                      <X size={14} />
                      Ignore
                    </Button>
                  </div>
                )}

                {group.status === 'merged' && group.mergeDecision && (
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <p>
                      Merged into lead {group.mergeDecision.primaryLeadId} on{' '}
                      {group.reviewedAt && new Date(group.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
              <p className="text-muted-foreground mb-4">
                {isScanning 
                  ? 'Scanning in progress...'
                  : 'Your lead database appears to be clean of duplicates'
                }
              </p>
              {!isScanning && (
                <Button onClick={detectDuplicates}>
                  Scan Again
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Merge Review Modal */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Review Duplicate Group</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedGroup && (
              <div className="space-y-6">
                {/* Group Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Group Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Overall Similarity</Label>
                      <div className="mt-1">
                        <Progress value={selectedGroup.similarityScore} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(selectedGroup.similarityScore)}% match
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>AI Confidence</Label>
                      <div className="mt-1">
                        <Progress value={selectedGroup.aiConfidence * 100} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(selectedGroup.aiConfidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Matching Fields</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedGroup.matchingFields.map((field, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Group Size</Label>
                      <p className="text-lg font-semibold">{selectedGroup.leads.length} leads</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lead Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedGroup.leads.map((lead, index) => (
                        <div key={lead.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">
                              {lead.firstName} {lead.lastName}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">AI Score: {lead.aiLeadScore}</Badge>
                              <Button
                                size="sm"
                                onClick={() => handleMergeLeads(selectedGroup.id, lead.id)}
                                className="flex items-center gap-1"
                              >
                                <Merge size={14} />
                                Use as Primary
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label>Email</Label>
                              <p>{lead.email}</p>
                            </div>
                            <div>
                              <Label>Company</Label>
                              <p>{lead.companyName || 'N/A'}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p>{lead.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <Label>Source</Label>
                              <p>{lead.leadSource}</p>
                            </div>
                            <div>
                              <Label>Job Title</Label>
                              <p>{lead.jobTitle || 'N/A'}</p>
                            </div>
                            <div>
                              <Label>Created</Label>
                              <p>{new Date(lead.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedGroup(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleIgnoreGroup(selectedGroup.id)
                      setSelectedGroup(null)
                    }}
                  >
                    Ignore Group
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}