import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Network, 
  Buildings, 
  Users, 
  TrendUp, 
  TrendDown, 
  Calendar,
  DollarSign,
  Shield,
  Warning,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  MapPin,
  GraphNetwork,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AccountRelationship {
  id: string
  primaryAccountId: string
  relatedEntityType: 'account' | 'contact' | 'vendor' | 'partner' | 'competitor'
  relatedEntityId: string
  relationshipNature: 'parent' | 'subsidiary' | 'partner' | 'vendor' | 'customer' | 'competitor'
  relationshipStrength: number // 0-100
  influenceLevel: number // 0-100
  collaborationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rarely'
  revenueImpact: number
  strategicImportance: 'critical' | 'high' | 'medium' | 'low'
  aiRelationshipHealth: number
  aiGrowthPotential: number
  aiRiskFactors: string[]
  relationshipStartDate: string
  lastInteractionDate: string
  interactionFrequencyScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EntityNode {
  id: string
  name: string
  type: string
  industry?: string
  size?: string
  revenue?: number
  x: number
  y: number
  connections: number
  totalInfluence: number
  strategicValue: number
}

interface Props {
  companyId: string
  userId: string
  accountId?: string
}

export const AccountEcosystemMap: React.FC<Props> = ({ companyId, userId, accountId }) => {
  const [relationships, setRelationships] = useKV<AccountRelationship[]>(`account-relationships-${companyId}`, [])
  const [selectedAccount, setSelectedAccount] = useState(accountId || '')
  const [selectedRelationship, setSelectedRelationship] = useState<AccountRelationship | null>(null)
  const [viewMode, setViewMode] = useState<'network' | 'list' | 'analytics'>('network')
  const [filterType, setFilterType] = useState<string>('all')
  const [isAddingRelationship, setIsAddingRelationship] = useState(false)
  const [ecosystemNodes, setEcosystemNodes] = useState<EntityNode[]>([])
  const [networkStats, setNetworkStats] = useState({
    totalRelationships: 0,
    averageStrength: 0,
    strategicPartners: 0,
    riskExposure: 0,
    growthOpportunities: 0
  })

  // Mock data for demonstration
  const mockAccounts = [
    { id: 'acc-001', name: 'TechCorp Solutions', industry: 'Technology', revenue: 50000000 },
    { id: 'acc-002', name: 'Global Manufacturing Inc', industry: 'Manufacturing', revenue: 120000000 },
    { id: 'acc-003', name: 'Innovation Partners LLC', industry: 'Consulting', revenue: 25000000 },
    { id: 'acc-004', name: 'Enterprise Software Co', industry: 'Software', revenue: 80000000 },
    { id: 'acc-005', name: 'Strategic Ventures', industry: 'Investment', revenue: 200000000 }
  ]

  const mockContacts = [
    { id: 'cnt-001', name: 'John Smith', title: 'CEO', company: 'TechCorp Solutions' },
    { id: 'cnt-002', name: 'Sarah Johnson', title: 'CTO', company: 'Global Manufacturing Inc' },
    { id: 'cnt-003', name: 'Michael Brown', title: 'VP Sales', company: 'Innovation Partners LLC' }
  ]

  useEffect(() => {
    if (relationships.length === 0) {
      // Initialize with mock data
      const mockRelationships: AccountRelationship[] = [
        {
          id: 'rel-001',
          primaryAccountId: 'acc-001',
          relatedEntityType: 'account',
          relatedEntityId: 'acc-002',
          relationshipNature: 'partner',
          relationshipStrength: 85,
          influenceLevel: 70,
          collaborationFrequency: 'weekly',
          revenueImpact: 5000000,
          strategicImportance: 'high',
          aiRelationshipHealth: 78,
          aiGrowthPotential: 82,
          aiRiskFactors: ['Market volatility', 'Competitive pressure'],
          relationshipStartDate: '2023-01-15',
          lastInteractionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          interactionFrequencyScore: 85,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'rel-002',
          primaryAccountId: 'acc-001',
          relatedEntityType: 'account',
          relatedEntityId: 'acc-003',
          relationshipNature: 'vendor',
          relationshipStrength: 65,
          influenceLevel: 45,
          collaborationFrequency: 'monthly',
          revenueImpact: 1200000,
          strategicImportance: 'medium',
          aiRelationshipHealth: 72,
          aiGrowthPotential: 60,
          aiRiskFactors: ['Contract renewal risk'],
          relationshipStartDate: '2022-08-20',
          lastInteractionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          interactionFrequencyScore: 60,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'rel-003',
          primaryAccountId: 'acc-001',
          relatedEntityType: 'account',
          relatedEntityId: 'acc-004',
          relationshipNature: 'competitor',
          relationshipStrength: 30,
          influenceLevel: 20,
          collaborationFrequency: 'rarely',
          revenueImpact: -500000,
          strategicImportance: 'low',
          aiRelationshipHealth: 45,
          aiGrowthPotential: 25,
          aiRiskFactors: ['Market share competition', 'Price pressure'],
          relationshipStartDate: '2020-03-10',
          lastInteractionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          interactionFrequencyScore: 15,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setRelationships(mockRelationships)
    }
  }, [])

  useEffect(() => {
    generateEcosystemNodes()
    calculateNetworkStats()
  }, [relationships, selectedAccount])

  const generateEcosystemNodes = () => {
    const accountRelationships = relationships.filter(r => 
      selectedAccount ? (r.primaryAccountId === selectedAccount || r.relatedEntityId === selectedAccount) : true
    )

    const nodeMap = new Map<string, EntityNode>()
    
    // Add primary account as center node
    if (selectedAccount) {
      const account = mockAccounts.find(a => a.id === selectedAccount)
      if (account) {
        nodeMap.set(selectedAccount, {
          id: selectedAccount,
          name: account.name,
          type: 'primary',
          industry: account.industry,
          revenue: account.revenue,
          x: 400, // Center position
          y: 300,
          connections: accountRelationships.filter(r => 
            r.primaryAccountId === selectedAccount || r.relatedEntityId === selectedAccount
          ).length,
          totalInfluence: 0,
          strategicValue: 0
        })
      }
    }

    // Add related entities
    accountRelationships.forEach((rel, index) => {
      const angle = (index / accountRelationships.length) * 2 * Math.PI
      const radius = 200
      const x = 400 + Math.cos(angle) * radius
      const y = 300 + Math.sin(angle) * radius

      if (rel.relatedEntityType === 'account') {
        const account = mockAccounts.find(a => a.id === rel.relatedEntityId)
        if (account && !nodeMap.has(rel.relatedEntityId)) {
          nodeMap.set(rel.relatedEntityId, {
            id: rel.relatedEntityId,
            name: account.name,
            type: rel.relationshipNature,
            industry: account.industry,
            revenue: account.revenue,
            x,
            y,
            connections: 1,
            totalInfluence: rel.influenceLevel,
            strategicValue: rel.relationshipStrength
          })
        }
      }
    })

    setEcosystemNodes(Array.from(nodeMap.values()))
  }

  const calculateNetworkStats = () => {
    const accountRelationships = relationships.filter(r => 
      selectedAccount ? (r.primaryAccountId === selectedAccount || r.relatedEntityId === selectedAccount) : true
    )

    const totalRelationships = accountRelationships.length
    const averageStrength = totalRelationships > 0 
      ? accountRelationships.reduce((sum, r) => sum + r.relationshipStrength, 0) / totalRelationships 
      : 0
    const strategicPartners = accountRelationships.filter(r => 
      r.strategicImportance === 'critical' || r.strategicImportance === 'high'
    ).length
    const riskExposure = accountRelationships.filter(r => 
      r.aiRiskFactors.length > 0 || r.aiRelationshipHealth < 50
    ).length
    const growthOpportunities = accountRelationships.filter(r => 
      r.aiGrowthPotential > 70
    ).length

    setNetworkStats({
      totalRelationships,
      averageStrength: Math.round(averageStrength),
      strategicPartners,
      riskExposure,
      growthOpportunities
    })
  }

  const getRelationshipColor = (relationship: AccountRelationship) => {
    if (relationship.strategicImportance === 'critical') return 'border-red-500 bg-red-50'
    if (relationship.strategicImportance === 'high') return 'border-orange-500 bg-orange-50'
    if (relationship.strategicImportance === 'medium') return 'border-yellow-500 bg-yellow-50'
    return 'border-gray-300 bg-gray-50'
  }

  const getInfluenceIcon = (level: number) => {
    if (level >= 80) return <TrendUp className="text-green-600" size={16} />
    if (level >= 60) return <TrendUp className="text-blue-600" size={16} />
    if (level >= 40) return <Calendar className="text-yellow-600" size={16} />
    return <TrendDown className="text-red-600" size={16} />
  }

  const handleAddRelationship = () => {
    setIsAddingRelationship(true)
  }

  const filteredRelationships = relationships.filter(relationship => {
    if (selectedAccount && relationship.primaryAccountId !== selectedAccount && relationship.relatedEntityId !== selectedAccount) {
      return false
    }
    if (filterType !== 'all' && relationship.relatedEntityType !== filterType) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Network size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Account Ecosystem</h2>
          </div>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select primary account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Accounts</SelectItem>
              {mockAccounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode('network')} 
                  className={viewMode === 'network' ? 'bg-primary text-primary-foreground' : ''}>
            <GraphNetwork size={16} />
            Network
          </Button>
          <Button variant="outline" onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}>
            <Users size={16} />
            List
          </Button>
          <Button variant="outline" onClick={() => setViewMode('analytics')}
                  className={viewMode === 'analytics' ? 'bg-primary text-primary-foreground' : ''}>
            <TrendUp size={16} />
            Analytics
          </Button>
          <Button onClick={handleAddRelationship}>
            <Plus size={16} />
            Add Relationship
          </Button>
        </div>
      </div>

      {/* Network Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Relationships</p>
                <p className="text-2xl font-bold">{networkStats.totalRelationships}</p>
              </div>
              <Network size={20} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Strength</p>
                <p className="text-2xl font-bold">{networkStats.averageStrength}%</p>
              </div>
              <TrendUp size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Strategic Partners</p>
                <p className="text-2xl font-bold">{networkStats.strategicPartners}</p>
              </div>
              <Shield size={20} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Exposure</p>
                <p className="text-2xl font-bold">{networkStats.riskExposure}</p>
              </div>
              <Warning size={20} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth Opportunities</p>
                <p className="text-2xl font-bold">{networkStats.growthOpportunities}</p>
              </div>
              <TrendUp size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'network' && (
        <Card>
          <CardHeader>
            <CardTitle>Relationship Network Visualization</CardTitle>
            <CardDescription>
              Interactive network map showing account relationships and influence patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-muted/20 rounded-lg border overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 800 600">
                {/* Connection Lines */}
                {ecosystemNodes.length > 1 && ecosystemNodes.slice(1).map((node, index) => {
                  const primaryNode = ecosystemNodes[0]
                  const relationship = relationships.find(r => 
                    (r.primaryAccountId === primaryNode.id && r.relatedEntityId === node.id) ||
                    (r.relatedEntityId === primaryNode.id && r.primaryAccountId === node.id)
                  )
                  const strength = relationship?.relationshipStrength || 50
                  
                  return (
                    <line
                      key={`connection-${index}`}
                      x1={primaryNode.x}
                      y1={primaryNode.y}
                      x2={node.x}
                      y2={node.y}
                      stroke={strength > 70 ? '#10b981' : strength > 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth={Math.max(1, strength / 25)}
                      strokeOpacity={0.6}
                    />
                  )
                })}
                
                {/* Entity Nodes */}
                {ecosystemNodes.map((node, index) => (
                  <g key={node.id} className="cursor-pointer">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'primary' ? 25 : 15}
                      fill={node.type === 'primary' ? '#3b82f6' : 
                            node.type === 'partner' ? '#10b981' :
                            node.type === 'vendor' ? '#f59e0b' :
                            node.type === 'competitor' ? '#ef4444' : '#6b7280'}
                      className="hover:opacity-80 transition-opacity"
                      onClick={() => {
                        const relationship = relationships.find(r => 
                          r.relatedEntityId === node.id || r.primaryAccountId === node.id
                        )
                        if (relationship) setSelectedRelationship(relationship)
                      }}
                    />
                    <text
                      x={node.x}
                      y={node.y + (node.type === 'primary' ? 35 : 25)}
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill="currentColor"
                    >
                      {node.name.length > 20 ? `${node.name.substring(0, 17)}...` : node.name}
                    </text>
                  </g>
                ))}
              </svg>
              
              {/* Legend */}
              <div className="absolute top-4 right-4 bg-background border rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium">Relationship Types</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  Primary Account
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  Partner
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                  Vendor
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  Competitor
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="account">Accounts</SelectItem>
                <SelectItem value="contact">Contacts</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="partner">Partners</SelectItem>
                <SelectItem value="competitor">Competitors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRelationships.map((relationship) => {
              const relatedEntity = relationship.relatedEntityType === 'account' 
                ? mockAccounts.find(a => a.id === relationship.relatedEntityId)
                : mockContacts.find(c => c.id === relationship.relatedEntityId)
              
              return (
                <Card 
                  key={relationship.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${getRelationshipColor(relationship)}`}
                  onClick={() => setSelectedRelationship(relationship)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{relatedEntity?.name || 'Unknown Entity'}</h3>
                          <Badge variant="outline" className="text-xs">
                            {relationship.relationshipNature}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Relationship Strength</span>
                            <div className="flex items-center gap-2">
                              <Progress value={relationship.relationshipStrength} className="w-16 h-2" />
                              <span className="font-medium">{relationship.relationshipStrength}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Influence Level</span>
                            <div className="flex items-center gap-2">
                              {getInfluenceIcon(relationship.influenceLevel)}
                              <span className="font-medium">{relationship.influenceLevel}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Revenue Impact</span>
                            <span className={`font-medium ${relationship.revenueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {relationship.revenueImpact >= 0 ? '+' : ''}${(relationship.revenueImpact / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Collaboration</span>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {relationship.collaborationFrequency}
                            </Badge>
                          </div>
                        </div>
                        
                        {relationship.aiRiskFactors.length > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-1 text-xs text-yellow-800">
                              <Warning size={12} />
                              <span className="font-medium">Risk Factors:</span>
                            </div>
                            <div className="text-xs text-yellow-700 mt-1">
                              {relationship.aiRiskFactors.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={
                            relationship.strategicImportance === 'critical' ? 'destructive' :
                            relationship.strategicImportance === 'high' ? 'default' :
                            relationship.strategicImportance === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {relationship.strategicImportance}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye size={12} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Health Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRelationships.map((relationship) => {
                  const relatedEntity = relationship.relatedEntityType === 'account' 
                    ? mockAccounts.find(a => a.id === relationship.relatedEntityId)
                    : mockContacts.find(c => c.id === relationship.relatedEntityId)
                  
                  return (
                    <div key={relationship.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{relatedEntity?.name}</h4>
                        <Badge 
                          variant={relationship.aiRelationshipHealth > 70 ? 'default' : 
                                  relationship.aiRelationshipHealth > 40 ? 'secondary' : 'destructive'}
                        >
                          {relationship.aiRelationshipHealth}% Health
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>AI Health Score</span>
                          <Progress value={relationship.aiRelationshipHealth} className="w-24 h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Growth Potential</span>
                          <Progress value={relationship.aiGrowthPotential} className="w-24 h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Interaction Frequency</span>
                          <Progress value={relationship.interactionFrequencyScore} className="w-24 h-2" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strategic Impact Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 bg-muted/20 rounded-lg border">
                <svg width="100%" height="100%" viewBox="0 0 300 200">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Axis labels */}
                  <text x="150" y="195" textAnchor="middle" className="text-xs" fill="currentColor">
                    Influence Level →
                  </text>
                  <text x="10" y="100" textAnchor="middle" className="text-xs" fill="currentColor" transform="rotate(-90, 10, 100)">
                    ← Revenue Impact
                  </text>
                  
                  {/* Data points */}
                  {filteredRelationships.map((relationship, index) => {
                    const x = (relationship.influenceLevel / 100) * 280 + 10
                    const y = 190 - ((Math.abs(relationship.revenueImpact) / 10000000) * 180)
                    
                    return (
                      <circle
                        key={relationship.id}
                        cx={x}
                        cy={Math.max(10, Math.min(190, y))}
                        r="4"
                        fill={
                          relationship.strategicImportance === 'critical' ? '#ef4444' :
                          relationship.strategicImportance === 'high' ? '#f59e0b' :
                          relationship.strategicImportance === 'medium' ? '#10b981' : '#6b7280'
                        }
                        className="cursor-pointer hover:opacity-70"
                        onClick={() => setSelectedRelationship(relationship)}
                      />
                    )
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relationship Detail Modal */}
      {selectedRelationship && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Relationship Details</CardTitle>
            <Button variant="ghost" onClick={() => setSelectedRelationship(null)}>
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="interaction-history">Interaction History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Relationship Nature</Label>
                    <p className="font-medium capitalize">{selectedRelationship.relationshipNature}</p>
                  </div>
                  <div>
                    <Label>Strategic Importance</Label>
                    <Badge className="mt-1 capitalize">{selectedRelationship.strategicImportance}</Badge>
                  </div>
                  <div>
                    <Label>Relationship Strength</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedRelationship.relationshipStrength} className="flex-1" />
                      <span className="text-sm font-medium">{selectedRelationship.relationshipStrength}%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Influence Level</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedRelationship.influenceLevel} className="flex-1" />
                      <span className="text-sm font-medium">{selectedRelationship.influenceLevel}%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Revenue Impact</Label>
                    <p className={`font-medium ${selectedRelationship.revenueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRelationship.revenueImpact >= 0 ? '+' : ''}${(selectedRelationship.revenueImpact / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <Label>Collaboration Frequency</Label>
                    <p className="font-medium capitalize">{selectedRelationship.collaborationFrequency}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai-insights" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedRelationship.aiRelationshipHealth}%</p>
                        <p className="text-sm text-muted-foreground">Relationship Health</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedRelationship.aiGrowthPotential}%</p>
                        <p className="text-sm text-muted-foreground">Growth Potential</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{selectedRelationship.interactionFrequencyScore}%</p>
                        <p className="text-sm text-muted-foreground">Interaction Score</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedRelationship.aiRiskFactors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Warning size={20} className="text-orange-600" />
                        Identified Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedRelationship.aiRiskFactors.map((risk, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                            <Warning size={14} className="text-orange-600" />
                            <span className="text-sm">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="interaction-history">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      <Calendar size={24} className="mx-auto mb-2" />
                      <p>Interaction history would be integrated with CRM timeline data</p>
                      <p className="text-sm mt-1">Last interaction: {new Date(selectedRelationship.lastInteractionDate).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AccountEcosystemMap