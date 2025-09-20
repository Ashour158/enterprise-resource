import React, { useState, useEffect } from 'react'
import { Lead } from '@/types/lead'
import { mockLeadActivities, mockLeadSources } from '@/data/mockLeadData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  TrendUp, 
  Brain,
  Target,
  Clock,
  FileText,
  Plus,
  Edit,
  Save,
  Activity,
  Zap,
  Globe,
  LinkedinLogo
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadDetailViewProps {
  lead: Lead
  onLeadUpdate: (lead: Lead) => void
  onClose: () => void
  companyId: string
  userId: string
  userRole: string
}

export function LeadDetailView({ 
  lead, 
  onLeadUpdate, 
  onClose, 
  companyId, 
  userId, 
  userRole 
}: LeadDetailViewProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedLead, setEditedLead] = useState<Lead>(lead)
  const [newActivity, setNewActivity] = useState({
    type: 'note',
    subject: '',
    description: '',
    outcome: '',
    nextAction: '',
    nextActionDate: ''
  })
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  useEffect(() => {
    setEditedLead(lead)
  }, [lead])

  // Generate AI insights for the lead
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      const prompt = spark.llmPrompt`
        Analyze this lead profile and provide actionable insights:
        
        Lead Information:
        - Name: ${lead.full_name}
        - Job Title: ${lead.job_title}
        - Company: ${lead.company_name} (${lead.industry})
        - Company Size: ${lead.company_size}
        - Email Engagement: ${lead.email_opens} opens, ${lead.email_clicks} clicks
        - Website Visits: ${lead.website_visits}
        - Lead Score: ${lead.ai_lead_score}
        - Status: ${lead.lead_status}
        - Rating: ${lead.lead_rating}
        - Notes: ${lead.notes}
        
        Current AI Analysis:
        - Conversion Probability: ${lead.ai_conversion_probability}
        - Estimated Deal Value: $${lead.ai_estimated_deal_value}
        - Buying Signals: ${lead.ai_buying_signals?.join(', ')}
        - Next Best Action: ${lead.ai_next_best_action}
        
        Please provide insights in the following JSON format:
        {
          "insights": [
            {
              "category": "behavioral_analysis|engagement_pattern|buying_intent|competitive_analysis|timing",
              "title": "Brief insight title",
              "description": "Detailed explanation of the insight",
              "confidence": 0.85,
              "recommended_actions": ["action1", "action2"],
              "priority": "high|medium|low"
            }
          ]
        }
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      setAiInsights(insights.insights || [])
    } catch (error) {
      console.error('Error generating AI insights:', error)
      toast.error('Failed to generate AI insights')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  useEffect(() => {
    generateAIInsights()
  }, [lead.id])

  const handleSave = () => {
    onLeadUpdate({
      ...editedLead,
      updated_at: new Date().toISOString()
    })
    setEditMode(false)
    toast.success('Lead updated successfully')
  }

  const handleFieldChange = (field: keyof Lead, value: any) => {
    setEditedLead(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddActivity = () => {
    if (!newActivity.subject.trim()) {
      toast.error('Activity subject is required')
      return
    }

    // Here you would save the activity to your backend
    toast.success('Activity added successfully')
    
    // Reset form
    setNewActivity({
      type: 'note',
      subject: '',
      description: '',
      outcome: '',
      nextAction: '',
      nextActionDate: ''
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'unqualified': return 'bg-red-100 text-red-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      case 'lost': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'hot': return <Star size={16} className="text-red-500 fill-current" />
      case 'warm': return <Star size={16} className="text-yellow-500 fill-current" />
      case 'cold': return <Star size={16} className="text-blue-500" />
      default: return <Star size={16} className="text-gray-400" />
    }
  }

  const leadSource = mockLeadSources.find(s => s.id === lead.lead_source_id)
  const leadActivities = mockLeadActivities.filter(a => a.lead_id === lead.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {lead.first_name[0]}{lead.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{lead.full_name}</h2>
            <p className="text-muted-foreground">{lead.job_title} at {lead.company_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} className="flex items-center gap-2">
              <Edit size={16} />
              Edit Lead
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {editMode ? (
                    <Input
                      id="firstName"
                      value={editedLead.first_name}
                      onChange={(e) => handleFieldChange('first_name', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.first_name}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {editMode ? (
                    <Input
                      id="lastName"
                      value={editedLead.last_name}
                      onChange={(e) => handleFieldChange('last_name', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.last_name}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {editMode ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedLead.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1 flex items-center gap-2">
                      <Mail size={14} />
                      {lead.email}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {editMode ? (
                    <Input
                      id="phone"
                      value={editedLead.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1 flex items-center gap-2">
                      <Phone size={14} />
                      {lead.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  {editMode ? (
                    <Input
                      id="jobTitle"
                      value={editedLead.job_title || ''}
                      onChange={(e) => handleFieldChange('job_title', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.job_title || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedIn">LinkedIn</Label>
                  {editMode ? (
                    <Input
                      id="linkedIn"
                      value={editedLead.linkedin_url || ''}
                      onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">
                      {lead.linkedin_url ? (
                        <a 
                          href={lead.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <LinkedinLogo size={14} />
                          LinkedIn Profile
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  {editMode ? (
                    <Input
                      id="companyName"
                      value={editedLead.company_name || ''}
                      onChange={(e) => handleFieldChange('company_name', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.company_name || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  {editMode ? (
                    <Input
                      id="industry"
                      value={editedLead.industry || ''}
                      onChange={(e) => handleFieldChange('industry', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.industry || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  {editMode ? (
                    <Select 
                      value={editedLead.company_size || ''} 
                      onValueChange={(value) => handleFieldChange('company_size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1,000 employees</SelectItem>
                        <SelectItem value="1000+">1,000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm mt-1">{lead.company_size || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="employees">Number of Employees</Label>
                  {editMode ? (
                    <Input
                      id="employees"
                      type="number"
                      value={editedLead.number_of_employees || ''}
                      onChange={(e) => handleFieldChange('number_of_employees', parseInt(e.target.value))}
                    />
                  ) : (
                    <div className="text-sm mt-1">{lead.number_of_employees?.toLocaleString() || 'Not provided'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  {editMode ? (
                    <Input
                      id="website"
                      value={editedLead.company_website || ''}
                      onChange={(e) => handleFieldChange('company_website', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm mt-1">
                      {lead.company_website ? (
                        <a 
                          href={lead.company_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Globe size={14} />
                          {lead.company_website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  {editMode ? (
                    <Input
                      id="revenue"
                      type="number"
                      value={editedLead.annual_revenue || ''}
                      onChange={(e) => handleFieldChange('annual_revenue', parseInt(e.target.value))}
                    />
                  ) : (
                    <div className="text-sm mt-1">
                      {lead.annual_revenue ? `$${lead.annual_revenue.toLocaleString()}` : 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} />
                Activities & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activities" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="activities">Recent Activities</TabsTrigger>
                  <TabsTrigger value="add-activity">Add Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="activities" className="space-y-4">
                  {leadActivities.length > 0 ? (
                    <div className="space-y-4">
                      {leadActivities.map((activity) => (
                        <div key={activity.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{activity.activity_subject}</h4>
                            <Badge variant="outline">
                              {activity.activity_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.activity_description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(activity.activity_date).toLocaleString()}</span>
                            {activity.outcome && <span>Outcome: {activity.outcome}</span>}
                            {activity.duration_minutes && <span>{activity.duration_minutes} mins</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                      <p className="text-muted-foreground">
                        Start engaging with this lead by adding your first activity
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="add-activity" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activityType">Activity Type</Label>
                      <Select 
                        value={newActivity.type} 
                        onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="activitySubject">Subject</Label>
                      <Input
                        id="activitySubject"
                        value={newActivity.subject}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Activity subject"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="activityDescription">Description</Label>
                    <Textarea
                      id="activityDescription"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the activity..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outcome">Outcome</Label>
                      <Select 
                        value={newActivity.outcome} 
                        onValueChange={(value) => setNewActivity(prev => ({ ...prev, outcome: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="successful">Successful</SelectItem>
                          <SelectItem value="no_answer">No Answer</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nextActionDate">Next Action Date</Label>
                      <Input
                        id="nextActionDate"
                        type="datetime-local"
                        value={newActivity.nextActionDate}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, nextActionDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddActivity} className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Activity
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Lead Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI Lead Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getScoreBgColor(lead.ai_lead_score)}`}>
                  <span className={getScoreColor(lead.ai_lead_score)}>
                    {Math.round(lead.ai_lead_score)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion Probability</span>
                  <span>{((lead.ai_conversion_probability || 0) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(lead.ai_conversion_probability || 0) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Deal Value</span>
                  <span>${(lead.ai_estimated_deal_value || 0).toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Buying Signals</h4>
                <div className="space-y-1">
                  {(lead.ai_buying_signals || []).map((signal, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1">
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Next Best Action</h4>
                <div className="text-sm bg-muted/50 p-3 rounded-lg">
                  {lead.ai_next_best_action || 'No recommendation available'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Status & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Lead Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="leadStatus">Status</Label>
                {editMode ? (
                  <Select 
                    value={editedLead.lead_status} 
                    onValueChange={(value) => handleFieldChange('lead_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(lead.lead_status)}>
                    {lead.lead_status}
                  </Badge>
                )}
              </div>

              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getRatingIcon(lead.lead_rating)}
                  <span className="capitalize text-sm">{lead.lead_rating}</span>
                </div>
              </div>

              <div>
                <Label>Lead Source</Label>
                <div className="text-sm mt-1">
                  {leadSource?.source_name || 'Unknown'}
                </div>
              </div>

              <div>
                <Label>Engagement Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={lead.engagement_score} className="flex-1" />
                  <span className="text-sm font-medium">{lead.engagement_score.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={20} />
                AI Insights
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={generateAIInsights}
                  disabled={isGeneratingInsights}
                  className="ml-auto"
                >
                  {isGeneratingInsights ? 'Generating...' : 'Refresh'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGeneratingInsights ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Generating AI insights...</p>
                </div>
              ) : aiInsights.length > 0 ? (
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge 
                          variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Recommended Actions:</div>
                          {insight.recommended_actions.map((action: string, actionIndex: number) => (
                            <div key={actionIndex} className="text-xs text-muted-foreground">
                              • {action}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No AI insights available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full flex items-center gap-2" variant="outline">
                <Phone size={16} />
                Call Lead
              </Button>
              <Button className="w-full flex items-center gap-2" variant="outline">
                <Mail size={16} />
                Send Email
              </Button>
              <Button className="w-full flex items-center gap-2" variant="outline">
                <Calendar size={16} />
                Schedule Meeting
              </Button>
              <Button className="w-full flex items-center gap-2">
                <TrendUp size={16} />
                Convert to Deal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}