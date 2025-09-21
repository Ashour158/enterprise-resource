import React, { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  DollarSign, 
  TrendUp, 
  MessageSquare, 
  MapPin, 
  Globe, 
  Eye, 
  Pin, 
  PinOff, 
  Filter, 
  Search, 
  Play, 
  Pause, 
  Users, 
  Heart, 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Paperclip,
  Download,
  ExternalLink,
  MousePointer,
  Sparkle
} from '@phosphor-icons/react'
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, startOfDay } from 'date-fns'
import { toast } from 'sonner'

interface TimelineEntry {
  id: string
  customer_id: string
  timeline_type: string
  timeline_subtype: string
  title: string
  description: string
  summary?: string
  related_contact_id?: string
  related_deal_id?: string
  related_quote_id?: string
  related_support_ticket_id?: string
  related_document_id?: string
  external_system?: string
  external_id?: string
  external_url?: string
  timeline_date: string
  duration_minutes?: number
  participants: Array<{
    id: string
    name: string
    type: 'internal' | 'external'
    role?: string
    avatar?: string
  }>
  attachments: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  ai_importance_score: number
  ai_sentiment_score: number
  ai_impact_on_relationship: number
  ai_extracted_insights: Array<{
    type: string
    insight: string
    confidence: number
  }>
  is_public: boolean
  visible_to_roles: string[]
  created_by: string
  is_pinned: boolean
  view_count: number
  last_viewed?: string
  created_at: string
  updated_at: string
}

interface CustomerUnifiedTimelineProps {
  customerId: string
  companyId: string
  userId: string
  onEntryClick?: (entry: TimelineEntry) => void
  height?: string
  showFilters?: boolean
  showAIInsights?: boolean
  allowEditing?: boolean
}

interface TimelineFilter {
  types: string[]
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter'
  participants: string[]
  importance: 'all' | 'high' | 'medium' | 'low'
  sentiment: 'all' | 'positive' | 'neutral' | 'negative'
  searchQuery: string
  pinnedOnly: boolean
}

const CustomerUnifiedTimeline: React.FC<CustomerUnifiedTimelineProps> = ({
  customerId,
  companyId,
  userId,
  onEntryClick,
  height = '600px',
  showFilters = true,
  showAIInsights = true,
  allowEditing = true
}) => {
  const [timelineEntries, setTimelineEntries] = useKV<TimelineEntry[]>(`timeline-entries-${customerId}`, [])
  const [filteredEntries, setFilteredEntries] = useState<TimelineEntry[]>([])
  const [filters, setFilters] = useState<TimelineFilter>({
    types: [],
    dateRange: 'all',
    participants: [],
    importance: 'all',
    sentiment: 'all',
    searchQuery: '',
    pinnedOnly: false
  })
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [realTimeUsers, setRealTimeUsers] = useKV<Array<{id: string, name: string, avatar?: string, cursor?: {x: number, y: number}}>>(`timeline-viewers-${customerId}`, [])
  
  const timelineRef = useRef<HTMLDivElement>(null)
  const playbackTimer = useRef<NodeJS.Timeout | null>(null)

  // Simulate real-time user presence
  useEffect(() => {
    const updatePresence = () => {
      setRealTimeUsers(current => {
        const updated = current.filter(u => u.id !== userId)
        updated.push({
          id: userId,
          name: 'Current User',
          avatar: undefined,
          cursor: { x: Math.random() * 100, y: Math.random() * 100 }
        })
        return updated
      })
    }

    const interval = setInterval(updatePresence, 3000)
    updatePresence()

    return () => clearInterval(interval)
  }, [userId, setRealTimeUsers])

  // Generate comprehensive timeline data
  useEffect(() => {
    if (timelineEntries.length === 0) {
      const generateTimelineData = async () => {
        const prompt = spark.llmPrompt`Generate 25 diverse customer timeline entries for customer ID ${customerId}. Include various interaction types like emails, calls, meetings, quotes, deals, support tickets, documents, and social media interactions. Each entry should have realistic AI scores and insights. Return as JSON array with the exact structure needed.`
        
        try {
          const response = await spark.llm(prompt, 'gpt-4o', true)
          const data = JSON.parse(response)
          const entries = data.entries || data
          
          const processedEntries: TimelineEntry[] = entries.map((entry: any, index: number) => ({
            id: `timeline-${Date.now()}-${index}`,
            customer_id: customerId,
            timeline_type: entry.timeline_type || ['email', 'call', 'meeting', 'quote', 'deal', 'support', 'document'][index % 7],
            timeline_subtype: entry.timeline_subtype || 'interaction',
            title: entry.title || `Customer Interaction ${index + 1}`,
            description: entry.description || 'Customer interaction details',
            summary: entry.summary,
            timeline_date: entry.timeline_date || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            duration_minutes: entry.duration_minutes || Math.floor(Math.random() * 120) + 15,
            participants: entry.participants || [
              { id: 'user-1', name: 'John Smith', type: 'internal', role: 'Sales Rep' },
              { id: 'contact-1', name: 'Jane Doe', type: 'external', role: 'Decision Maker' }
            ],
            attachments: entry.attachments || [],
            ai_importance_score: entry.ai_importance_score || Math.floor(Math.random() * 100),
            ai_sentiment_score: entry.ai_sentiment_score || (Math.random() * 2 - 1),
            ai_impact_on_relationship: entry.ai_impact_on_relationship || Math.random(),
            ai_extracted_insights: entry.ai_extracted_insights || [
              { type: 'opportunity', insight: 'Customer showed interest in premium features', confidence: 85 },
              { type: 'risk', insight: 'Mentioned budget constraints', confidence: 70 }
            ],
            is_public: entry.is_public !== false,
            visible_to_roles: entry.visible_to_roles || [],
            created_by: entry.created_by || userId,
            is_pinned: entry.is_pinned || false,
            view_count: entry.view_count || Math.floor(Math.random() * 50),
            last_viewed: entry.last_viewed,
            created_at: entry.created_at || new Date().toISOString(),
            updated_at: entry.updated_at || new Date().toISOString()
          }))

          setTimelineEntries(processedEntries)
        } catch (error) {
          console.error('Error generating timeline data:', error)
          toast.error('Failed to generate timeline data')
        }
      }

      generateTimelineData()
    }
  }, [customerId, userId, timelineEntries.length, setTimelineEntries])

  // Filter and sort timeline entries
  useEffect(() => {
    let filtered = [...timelineEntries]

    // Apply filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(entry => filters.types.includes(entry.timeline_type))
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.participants.some(p => p.name.toLowerCase().includes(query))
      )
    }

    if (filters.pinnedOnly) {
      filtered = filtered.filter(entry => entry.is_pinned)
    }

    if (filters.importance !== 'all') {
      const threshold = filters.importance === 'high' ? 70 : filters.importance === 'medium' ? 40 : 0
      filtered = filtered.filter(entry => entry.ai_importance_score >= threshold)
    }

    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(entry => {
        if (filters.sentiment === 'positive') return entry.ai_sentiment_score > 0.2
        if (filters.sentiment === 'negative') return entry.ai_sentiment_score < -0.2
        return Math.abs(entry.ai_sentiment_score) <= 0.2
      })
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timeline_date)
        switch (filters.dateRange) {
          case 'today':
            return isToday(entryDate)
          case 'week':
            return isThisWeek(entryDate)
          case 'month':
            return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            const entryQuarter = Math.floor(entryDate.getMonth() / 3)
            return entryQuarter === quarter && entryDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    // Sort by date (newest first) and pinned status
    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.timeline_date).getTime() - new Date(a.timeline_date).getTime()
    })

    setFilteredEntries(filtered)
  }, [timelineEntries, filters])

  // Timeline playback functionality
  useEffect(() => {
    if (isPlaying && filteredEntries.length > 0) {
      playbackTimer.current = setTimeout(() => {
        setCurrentPlayIndex(prev => {
          if (prev < filteredEntries.length - 1) {
            return prev + 1
          } else {
            setIsPlaying(false)
            return 0
          }
        })
      }, 2000 / playbackSpeed)
    }

    return () => {
      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current)
      }
    }
  }, [isPlaying, currentPlayIndex, filteredEntries.length, playbackSpeed])

  const getTimelineTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} />
      case 'call': return <Phone size={16} />
      case 'meeting': return <Calendar size={16} />
      case 'quote': return <FileText size={16} />
      case 'deal': return <DollarSign size={16} />
      case 'support': return <MessageSquare size={16} />
      case 'document': return <FileText size={16} />
      case 'social': return <Globe size={16} />
      case 'website': return <Globe size={16} />
      default: return <MessageSquare size={16} />
    }
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <Heart size={16} className="text-green-500" />
    if (score < -0.2) return <XCircle size={16} className="text-red-500" />
    return <Minus size={16} className="text-yellow-500" />
  }

  const getImportanceIcon = (score: number) => {
    if (score >= 70) return <ArrowUp size={16} className="text-red-500" />
    if (score >= 40) return <ArrowUp size={16} className="text-yellow-500" />
    return <ArrowDown size={16} className="text-gray-500" />
  }

  const handleEntryClick = (entry: TimelineEntry) => {
    // Update view count and last viewed
    setTimelineEntries(current => current.map(e => 
      e.id === entry.id 
        ? { ...e, view_count: e.view_count + 1, last_viewed: new Date().toISOString() }
        : e
    ))

    setSelectedEntry(entry)
    onEntryClick?.(entry)
    toast.success(`Opened ${entry.title}`)
  }

  const togglePin = (entryId: string) => {
    setTimelineEntries(current => current.map(entry => 
      entry.id === entryId 
        ? { ...entry, is_pinned: !entry.is_pinned }
        : entry
    ))
  }

  const formatTimelineDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`
    if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`
    return format(date, 'MMM dd, yyyy HH:mm')
  }

  const groupEntriesByDate = (entries: TimelineEntry[]) => {
    const groups: { [key: string]: TimelineEntry[] } = {}
    
    entries.forEach(entry => {
      const date = startOfDay(new Date(entry.timeline_date)).toISOString()
      if (!groups[date]) groups[date] = []
      groups[date].push(entry)
    })

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'} Timeline
          </Button>
          
          <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(Number(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="4">4x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search timeline..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 w-64"
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Timeline Filters</SheetTitle>
                  <SheetDescription>
                    Customize your timeline view with advanced filtering options
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <Label>Interaction Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['email', 'call', 'meeting', 'quote', 'deal', 'support', 'document', 'social'].map(type => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, types: [...prev.types, type] }))
                              } else {
                                setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }))
                              }
                            }}
                          />
                          <span className="capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <Select 
                      value={filters.dateRange} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Importance Level</Label>
                    <Select 
                      value={filters.importance} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, importance: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="high">High (70+)</SelectItem>
                        <SelectItem value="medium">Medium (40-69)</SelectItem>
                        <SelectItem value="low">Low (0-39)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sentiment</Label>
                    <Select 
                      value={filters.sentiment} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sentiment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiments</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pinnedOnly"
                      checked={filters.pinnedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, pinnedOnly: e.target.checked }))}
                    />
                    <Label htmlFor="pinnedOnly">Show pinned only</Label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>

      {/* Real-time User Presence */}
      {realTimeUsers.length > 1 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {realTimeUsers.length - 1} other{realTimeUsers.length > 2 ? 's' : ''} viewing this timeline
          </span>
          <div className="flex -space-x-2">
            {realTimeUsers.slice(0, 3).map(user => (
              <Avatar key={user.id} className="w-6 h-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interactions</p>
                <p className="text-2xl font-bold">{filteredEntries.length}</p>
              </div>
              <MessageSquare size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Importance</p>
                <p className="text-2xl font-bold">
                  {filteredEntries.length > 0 
                    ? Math.round(filteredEntries.reduce((sum, e) => sum + e.ai_importance_score, 0) / filteredEntries.length)
                    : 0
                  }
                </p>
              </div>
              <TrendUp size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pinned Items</p>
                <p className="text-2xl font-bold">{filteredEntries.filter(e => e.is_pinned).length}</p>
              </div>
              <Pin size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {filteredEntries.reduce((sum, e) => sum + e.view_count, 0)}
                </p>
              </div>
              <Eye size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Customer Timeline
            {isPlaying && (
              <Badge variant="outline" className="ml-2">
                Playing: {currentPlayIndex + 1} / {filteredEntries.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Complete interaction history with AI insights and collaboration features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            ref={timelineRef}
            className="space-y-6 overflow-y-auto pr-4"
            style={{ maxHeight: height }}
          >
            {groupEntriesByDate(filteredEntries).map(([dateKey, entries]) => (
              <div key={dateKey} className="space-y-4">
                <div className="sticky top-0 bg-background/90 backdrop-blur-sm py-2 border-b">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {format(new Date(dateKey), 'EEEE, MMMM dd, yyyy')}
                  </h3>
                </div>
                
                <div className="space-y-3 pl-4">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isPlaying && currentPlayIndex === filteredEntries.findIndex(e => e.id === entry.id)
                          ? 'ring-2 ring-primary shadow-lg'
                          : ''
                      } ${entry.is_pinned ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'}`}
                      onClick={() => handleEntryClick(entry)}
                    >
                      {/* Timeline Line */}
                      <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-primary to-primary/30" />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {getTimelineTypeIcon(entry.timeline_type)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium hover:text-primary transition-colors">
                                {entry.title}
                              </h4>
                              {entry.is_pinned && (
                                <Pin size={14} className="text-primary" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {entry.timeline_type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.description}
                            </p>
                            
                            {entry.summary && (
                              <div className="p-2 bg-muted/50 rounded text-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <Brain size={12} />
                                  <span className="font-medium">AI Summary</span>
                                </div>
                                <p>{entry.summary}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatTimelineDate(entry.timeline_date)}
                              </span>
                              
                              {entry.duration_minutes && (
                                <span className="flex items-center gap-1">
                                  <Play size={12} />
                                  {entry.duration_minutes}m
                                </span>
                              )}
                              
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {entry.view_count} views
                              </span>
                              
                              {entry.participants.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {entry.participants.length} participants
                                </span>
                              )}
                              
                              {entry.attachments.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip size={12} />
                                  {entry.attachments.length} files
                                </span>
                              )}
                            </div>
                            
                            {showAIInsights && (
                              <div className="flex items-center gap-3 pt-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1">
                                        {getImportanceIcon(entry.ai_importance_score)}
                                        <span className="text-xs">{entry.ai_importance_score}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Importance Score: {entry.ai_importance_score}/100</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1">
                                        {getSentimentIcon(entry.ai_sentiment_score)}
                                        <span className="text-xs">
                                          {entry.ai_sentiment_score > 0 ? '+' : ''}{(entry.ai_sentiment_score * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Sentiment Score: {(entry.ai_sentiment_score * 100).toFixed(1)}%</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                {entry.ai_extracted_insights.length > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-primary">
                                          <Lightbulb size={12} />
                                          <span className="text-xs">{entry.ai_extracted_insights.length}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="space-y-1">
                                          {entry.ai_extracted_insights.map((insight, i) => (
                                            <p key={i} className="text-xs">
                                              <span className="font-medium capitalize">{insight.type}:</span> {insight.insight}
                                            </p>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePin(entry.id)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {entry.is_pinned ? (
                              <PinOff size={14} className="text-primary" />
                            ) : (
                              <Pin size={14} className="text-muted-foreground" />
                            )}
                          </Button>
                          
                          {entry.external_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(entry.external_url, '_blank')
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-2">No timeline entries found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filters.searchQuery || filters.types.length > 0
                    ? 'Try adjusting your filters to see more results'
                    : 'Timeline entries will appear here as customer interactions occur'
                  }
                </p>
                {allowEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2"
                  >
                    <MousePointer size={16} />
                    Add Timeline Entry
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Entry Detail Sheet */}
      {selectedEntry && (
        <Sheet open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <SheetContent className="w-full max-w-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {getTimelineTypeIcon(selectedEntry.timeline_type)}
                {selectedEntry.title}
              </SheetTitle>
              <SheetDescription>
                {formatTimelineDate(selectedEntry.timeline_date)} • {selectedEntry.duration_minutes}m
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedEntry.description}</p>
              </div>
              
              {selectedEntry.summary && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkle size={16} />
                    AI Summary
                  </h4>
                  <p className="text-sm">{selectedEntry.summary}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Participants</h4>
                <div className="space-y-2">
                  {selectedEntry.participants.map(participant => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded border">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.role} • {participant.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedEntry.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedEntry.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <div>
                            <p className="font-medium text-sm">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.type.toUpperCase()} • {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEntry.ai_extracted_insights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Brain size={16} />
                    AI Insights
                  </h4>
                  <div className="space-y-2">
                    {selectedEntry.ai_extracted_insights.map((insight, index) => (
                      <div key={index} className="p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {insight.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm">{insight.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export default CustomerUnifiedTimeline