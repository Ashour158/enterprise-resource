import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Building, 
  TrendUp, 
  TrendDown,
  DollarSign, 
  Users, 
  Award,
  Flag,
  Target,
  Shield,
  WarningCircle,
  CheckCircle,
  Star
} from '@phosphor-icons/react'

interface CompetitorAnalysis {
  strengths: string[]
  weaknesses: string[]
  marketShare: number
  pricing: string
  recentWins: number
  threatLevel: 'low' | 'medium' | 'high'
}

interface DealCompetitorAnalysisProps {
  dealId: string
  competitors: string[]
  analysis: Record<string, any>
}

export function DealCompetitorAnalysis({ dealId, competitors, analysis }: DealCompetitorAnalysisProps) {
  
  // Mock competitive data - in real app, this would come from your competitive intelligence system
  const competitiveData = {
    'Salesforce': {
      strengths: ['Market leader', 'Extensive ecosystem', 'Brand recognition', 'Advanced AI features'],
      weaknesses: ['Complex implementation', 'High cost', 'Steep learning curve', 'Over-engineered for SMB'],
      marketShare: 19.5,
      pricing: '15-20% higher than us',
      recentWins: 12,
      threatLevel: 'high' as const,
      winRate: 65,
      avgDealSize: 125000,
      timeToClose: 4.2
    },
    'HubSpot': {
      strengths: ['Easy to use', 'Great for SMB', 'Strong marketing tools', 'Free tier available'],
      weaknesses: ['Limited customization', 'Weaker enterprise features', 'Reporting limitations', 'No offline access'],
      marketShare: 12.8,
      pricing: '10% lower than us',
      recentWins: 8,
      threatLevel: 'medium' as const,
      winRate: 45,
      avgDealSize: 45000,
      timeToClose: 2.8
    },
    'Microsoft Dynamics': {
      strengths: ['Office 365 integration', 'Enterprise focus', 'AI capabilities', 'Strong partner network'],
      weaknesses: ['Complex pricing', 'Implementation challenges', 'UI complexity', 'Limited mobile'],
      marketShare: 8.2,
      pricing: '5% higher than us',
      recentWins: 5,
      threatLevel: 'medium' as const,
      winRate: 38,
      avgDealSize: 95000,
      timeToClose: 5.1
    },
    'Pipedrive': {
      strengths: ['Simple interface', 'Affordable pricing', 'Quick setup', 'Good mobile app'],
      weaknesses: ['Limited features', 'Weak reporting', 'No marketing automation', 'Scalability issues'],
      marketShare: 4.1,
      pricing: '40% lower than us',
      recentWins: 3,
      threatLevel: 'low' as const,
      winRate: 25,
      avgDealSize: 12000,
      timeToClose: 1.5
    }
  }

  const getCompetitorData = (competitor: string) => {
    return competitiveData[competitor as keyof typeof competitiveData] || {
      strengths: ['Unknown strengths'],
      weaknesses: ['Unknown weaknesses'],
      marketShare: 0,
      pricing: 'Unknown',
      recentWins: 0,
      threatLevel: 'low' as const,
      winRate: 0,
      avgDealSize: 0,
      timeToClose: 0
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <WarningCircle className="h-4 w-4 text-red-600" />
      case 'medium': return <Flag className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateCompetitiveAdvantage = () => {
    // Calculate our competitive positioning based on various factors
    const ourData = {
      marketShare: 6.5,
      avgDealSize: 85000,
      winRate: 52,
      timeToClose: 3.2,
      customerSat: 4.3,
      pricing: 'competitive'
    }

    const advantages = []
    const challenges = []

    // Analyze against each competitor
    competitors.forEach(competitor => {
      const compData = getCompetitorData(competitor)
      
      if (ourData.winRate > compData.winRate) {
        advantages.push(`Higher win rate vs ${competitor} (${ourData.winRate}% vs ${compData.winRate}%)`)
      } else {
        challenges.push(`Lower win rate vs ${competitor} (${ourData.winRate}% vs ${compData.winRate}%)`)
      }
      
      if (ourData.timeToClose < compData.timeToClose) {
        advantages.push(`Faster sales cycle vs ${competitor} (${ourData.timeToClose} vs ${compData.timeToClose} months)`)
      } else {
        challenges.push(`Slower sales cycle vs ${competitor} (${ourData.timeToClose} vs ${compData.timeToClose} months)`)
      }
    })

    return { advantages, challenges }
  }

  const competitivePosition = calculateCompetitiveAdvantage()

  const battleCards = {
    'Salesforce': {
      whyWeWin: [
        'More flexible pricing and implementation',
        'Better customer support and faster response times',
        'Simpler user interface with faster adoption',
        'More cost-effective total cost of ownership'
      ],
      whyWeLose: [
        'Smaller brand recognition',
        'Less extensive third-party ecosystem',
        'Fewer advanced AI features',
        'Limited marketing automation capabilities'
      ],
      keyMessages: [
        'Focus on simplicity and ease of use',
        'Emphasize faster time to value',
        'Highlight superior customer support',
        'Position as the cost-effective alternative'
      ]
    },
    'HubSpot': {
      whyWeWin: [
        'More advanced enterprise features',
        'Better customization capabilities',
        'Superior reporting and analytics',
        'Stronger security and compliance features'
      ],
      whyWeLose: [
        'More complex setup process',
        'Higher learning curve',
        'No free tier option',
        'Less marketing automation features'
      ],
      keyMessages: [
        'Position as the enterprise-ready solution',
        'Emphasize advanced customization',
        'Highlight superior analytics capabilities',
        'Focus on scalability and growth'
      ]
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6 text-orange-600" />
        <h3 className="text-lg font-semibold">Competitive Analysis</h3>
      </div>

      {/* Competitive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competitors Identified</p>
                <p className="text-2xl font-bold">{competitors.length}</p>
              </div>
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Threat Level</p>
                <p className="text-2xl font-bold">
                  {competitors.filter(c => getCompetitorData(c).threatLevel === 'high').length}
                </p>
              </div>
              <WarningCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Our Win Rate</p>
                <p className="text-2xl font-bold">52%</p>
              </div>
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-4">
        {competitors.map((competitor) => {
          const data = getCompetitorData(competitor)
          
          return (
            <Card key={competitor}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-lg">{competitor}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.marketShare}% market share • {data.recentWins} recent wins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getThreatLevelIcon(data.threatLevel)}
                      <Badge className={getThreatLevelColor(data.threatLevel)}>
                        {data.threatLevel} threat
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TrendUp className="h-4 w-4 text-green-600" />
                        Strengths
                      </h5>
                      <div className="space-y-1">
                        {data.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Star className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TrendDown className="h-4 w-4 text-red-600" />
                        Weaknesses
                      </h5>
                      <div className="space-y-1">
                        {data.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <WarningCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Award className="h-4 w-4 text-purple-600" />
                        Key Metrics
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Win Rate:</span>
                          <span className="font-medium">{data.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Deal Size:</span>
                          <span className="font-medium">${(data.avgDealSize / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sales Cycle:</span>
                          <span className="font-medium">{data.timeToClose} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pricing vs Us:</span>
                          <span className="font-medium">{data.pricing}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Battle Card */}
                  {battleCards[competitor as keyof typeof battleCards] && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-sm mb-3">Competitive Positioning</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-xs mb-2 text-green-600">Why We Win</h6>
                          <div className="space-y-1">
                            {battleCards[competitor as keyof typeof battleCards].whyWeWin.map((reason, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h6 className="font-medium text-xs mb-2 text-red-600">Potential Challenges</h6>
                          <div className="space-y-1">
                            {battleCards[competitor as keyof typeof battleCards].whyWeLose.map((challenge, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <WarningCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs">{challenge}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h6 className="font-medium text-xs mb-2">Key Messages</h6>
                        <div className="flex flex-wrap gap-1">
                          {battleCards[competitor as keyof typeof battleCards].keyMessages.map((message, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {message}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Competitive Advantage Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Our Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {competitivePosition.advantages.slice(0, 5).map((advantage, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <TrendUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{advantage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarningCircle className="h-5 w-5 text-amber-600" />
              Areas to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {competitivePosition.challenges.slice(0, 5).map((challenge, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <TrendDown className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{challenge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Position Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Market Position Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Our Market Share:</span>
                <span className="ml-2 font-medium">6.5%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Competitive Position:</span>
                <span className="ml-2 font-medium">4th largest</span>
              </div>
              <div>
                <span className="text-muted-foreground">Growth Rate:</span>
                <span className="ml-2 font-medium">+23% YoY</span>
              </div>
              <div>
                <span className="text-muted-foreground">Win Rate vs Competition:</span>
                <span className="ml-2 font-medium">52%</span>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(competitiveData).map(([competitor, data]) => (
                <div key={competitor} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{competitor}</span>
                    <span>{data.marketShare}%</span>
                  </div>
                  <Progress value={data.marketShare} className="h-2" />
                </div>
              ))}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Our Solution</span>
                  <span>6.5%</span>
                </div>
                <Progress value={6.5} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {competitors.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Competitors Identified</h3>
            <p className="text-muted-foreground mb-4">
              No competitive threats have been identified for this deal yet.
            </p>
            <Button variant="outline">
              Add Competitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}