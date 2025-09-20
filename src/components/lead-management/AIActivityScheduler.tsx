import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Clock, 
  Target, 
  TrendUp, 
  Phone, 
  Mail, 
  Users, 
  Calendar as CalendarIcon,
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Activity,
  ArrowRight,
  Refresh,
  Play
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, addDays, addHours, isAfter, differenceInDays } from 'date-fns'

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
  createdAt: string
  lastContactDate?: string
  nextFollowUpDate?: string
}

interface AIActivityRecommendation {
  id: string
  leadId: string
  activityType: 'call' | 'email' | 'meeting' | 'task' | 'follow_up'
  title: string
  description: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  confidence: number
  reasoning: string[]
  suggestedDateTime: string
  estimatedDuration: number
  successProbability: number
  expectedOutcome: string
  preparationNotes: string[]
  alternativeActions: string[]
  createdAt: string
}

interface ActivitySchedulerProps {
  leadId: string
  companyId: string
  userId: string
  onScheduleActivity: (activity: any) => void
}

export function AIActivityScheduler({ leadId, companyId, userId, onScheduleActivity }: ActivitySchedulerProps) {
  const [lead, setLead] = useKV<Lead>(`lead-${leadId}`, null)
  const [recommendations, setRecommendations] = useKV<AIActivityRecommendation[]>(`ai-activity-recommendations-${leadId}`, [])
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIActivityRecommendation | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')

  // Generate AI activity recommendations
  const generateRecommendations = async () => {
    if (!lead) return

    setIsGenerating(true)
    try {
      const leadAge = differenceInDays(new Date(), new Date(lead.createdAt))
      const daysSinceContact = lead.lastContactDate 
        ? differenceInDays(new Date(), new Date(lead.lastContactDate))
        : leadAge

      const prompt = spark.llmPrompt`
        Generate intelligent activity recommendations for this lead:
        
        Lead Details:
        - Name: ${lead.firstName} ${lead.lastName}
        - Company: ${lead.companyName || 'Unknown'}
        - Title: ${lead.jobTitle || 'Unknown'}
        - Status: ${lead.leadStatus}
        - Rating: ${lead.leadRating}
        - AI Score: ${lead.aiLeadScore}/100
        - Lead Age: ${leadAge} days
        - Days Since Last Contact: ${daysSinceContact}
        - Email: ${lead.email}
        - Phone: ${lead.phone || 'Not provided'}
        
        Current Context:
        - Time: ${new Date().toISOString()}
        - Business Hours: 9 AM - 6 PM EST
        - Current Day: ${format(new Date(), 'EEEE')}
        
        Generate 4-6 strategic activity recommendations that:
        1. Consider optimal timing for contact
        2. Match the lead's profile and status
        3. Progress the sales process effectively
        4. Account for urgency and follow-up needs
        5. Provide specific preparation guidance
        
        Return as JSON with recommendations array containing:
        - activityType (call, email, meeting, task, follow_up)
        - title (specific action title)
        - description (detailed description)
        - priority (urgent, high, medium, low)
        - confidence (0-100)
        - reasoning (array of 3-4 strategic reasons)
        - suggestedDateTime (optimal time, ISO string)
        - estimatedDuration (minutes)
        - successProbability (0-100)
        - expectedOutcome (specific expected result)
        - preparationNotes (array of 3-5 preparation points)
        - alternativeActions (array of 2-3 backup options)
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      if (result.recommendations) {
        const newRecommendations: AIActivityRecommendation[] = result.recommendations.map((rec: any, index: number) => ({
          id: `ai-activity-${Date.now()}-${index}`,
          leadId,
          activityType: rec.activityType,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          confidence: rec.confidence,
          reasoning: rec.reasoning || [],
          suggestedDateTime: rec.suggestedDateTime,
          estimatedDuration: rec.estimatedDuration || 30,
          successProbability: rec.successProbability || 70,
          expectedOutcome: rec.expectedOutcome,
          preparationNotes: rec.preparationNotes || [],
          alternativeActions: rec.alternativeActions || [],
          createdAt: new Date().toISOString()
        }))

        setRecommendations(newRecommendations)
        toast.success(`Generated ${newRecommendations.length} AI activity recommendations`)
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate activity recommendations')
    } finally {
      setIsGenerating(false)
    }
  }

  // Schedule recommended activity
  const scheduleActivity = (recommendation: AIActivityRecommendation) => {
    const activity = {
      activityType: recommendation.activityType,
      activitySubject: recommendation.title,
      activityDescription: recommendation.description,
      activityDate: recommendation.suggestedDateTime,
      duration: recommendation.estimatedDuration,
      nextAction: recommendation.expectedOutcome,
      nextActionDate: addDays(new Date(recommendation.suggestedDateTime), 1).toISOString(),
      aiGenerated: true,
      aiConfidence: recommendation.confidence,
      preparationNotes: recommendation.preparationNotes.join('\n'),
      expectedOutcome: recommendation.expectedOutcome
    }

    onScheduleActivity(activity)
    toast.success(`${recommendation.title} scheduled successfully`)
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={16} />
      case 'email': return <Mail size={16} />
      case 'meeting': return <Users size={16} />
      case 'task': return <CheckCircle size={16} />
      case 'follow_up': return <Clock size={16} />
      default: return <Activity size={16} />
    }
  }

  // Load initial data
  useEffect(() => {
    if (leadId && !lead) {
      // Mock lead data - in real app, this would come from API
      setLead({
        id: leadId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1 (555) 123-4567',
        companyName: 'TechCorp Solutions',
        jobTitle: 'IT Director',
        leadStatus: 'qualified',
        leadRating: 'warm',
        aiLeadScore: 78,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    if (recommendations.length === 0 && lead) {
      generateRecommendations()
    }
  }, [leadId, lead])

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading AI activity scheduler...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI Activity Scheduler
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Intelligent recommendations for optimal lead engagement timing and strategy
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={generateRecommendations}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin mr-2">
                    <Refresh size={16} />
                  </div>
                ) : (
                  <Brain size={16} className="mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Refresh Recommendations'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb size={16} />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <CalendarIcon size={16} />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendUp size={16} />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations List */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target size={16} />
                AI Recommendations ({recommendations.length})
              </h3>
              
              {recommendations.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {recommendations
                      .sort((a, b) => {
                        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
                      })
                      .map((rec) => (
                        <Card 
                          key={rec.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedRecommendation?.id === rec.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getActivityIcon(rec.activityType)}
                                <h4 className="font-medium text-sm">{rec.title}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                                  {rec.priority}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Progress value={rec.confidence} className="w-12 h-2" />
                                  <span className="text-xs text-muted-foreground">{rec.confidence}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {rec.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon size={12} />
                                  {format(new Date(rec.suggestedDateTime), 'MMM dd, HH:mm')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {rec.estimatedDuration}m
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star size={12} />
                                  {rec.successProbability}% success
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  scheduleActivity(rec)
                                }}
                              >
                                <Play size={14} className="mr-1" />
                                Schedule
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                    <h4 className="font-medium mb-2">No recommendations yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Refresh Recommendations" to generate AI-powered activity suggestions
                    </p>
                    <Button onClick={generateRecommendations} disabled={isGenerating}>
                      <Brain size={16} className="mr-2" />
                      Generate Recommendations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Selected Recommendation Details */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity size={16} />
                Recommendation Details
              </h3>
              
              {selectedRecommendation ? (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityIcon(selectedRecommendation.activityType)}
                        <h4 className="font-semibold">{selectedRecommendation.title}</h4>
                        <Badge variant={getPriorityColor(selectedRecommendation.priority)}>
                          {selectedRecommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedRecommendation.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-1">
                        <Lightbulb size={14} />
                        AI Reasoning
                      </h5>
                      <ul className="space-y-1">
                        {selectedRecommendation.reasoning.map((reason, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Preparation Notes</h5>
                      <ul className="space-y-1">
                        {selectedRecommendation.preparationNotes.map((note, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle size={12} className="text-green-500 mt-1" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Expected Outcome</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedRecommendation.expectedOutcome}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Alternative Actions</h5>
                      <ul className="space-y-1">
                        {selectedRecommendation.alternativeActions.map((action, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ArrowRight size={12} className="text-blue-500 mt-1" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Modify
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => scheduleActivity(selectedRecommendation)}
                      >
                        <Play size={14} className="mr-1" />
                        Schedule Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Activity size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Select a recommendation to view detailed guidance and preparation notes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Scheduled activities will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendUp size={32} className="mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Activity performance analytics will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}