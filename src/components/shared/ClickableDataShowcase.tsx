import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Phone, 
  EnvelopeSimple as Mail, 
  MapPin, 
  Buildings, 
  Calendar as CalendarIcon,
  Globe,
  LinkedinLogo,
  TwitterLogo,
  InstagramLogo,
  Eye,
  ArrowRight,
  Building,
  TrendUp,
  Star,
  Circle,
  CurrencyDollar,
  Target,
  Brain,
  ChartLine,
  Lightbulb,
  Clock,
  Tag,
  FileText,
  Users,
  VideoCamera,
  HandCoins,
  Package,
  Truck,
  ShoppingCart,
  CreditCard,
  PresentationChart,
  Briefcase,
  GraduationCap,
  Heart,
  Stethoscope,
  Hammer,
  Storefront,
  Bank,
  Scales,
  PaintBrush,
  Airplane,
  TreeEvergreen,
  Newspaper,
  Headphones,
  GameController,
  Car,
  House
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface ClickableDataShowcaseProps {
  companyId: string
  userId: string
}

interface ClickableItem {
  id: string
  type: 'name' | 'company' | 'phone' | 'email' | 'address' | 'tag' | 'date' | 'currency' | 'website' | 'social'
  label: string
  value: string
  subtext?: string
  metadata?: any
  actionType: string
  icon?: React.ReactNode
}

export function ClickableDataShowcase({ companyId, userId }: ClickableDataShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [interactionCount, setInteractionCount] = useKV('interaction-count', 0)

  // Sample clickable data elements
  const clickableData: ClickableItem[] = [
    // Names - People
    {
      id: 'name-001',
      type: 'name',
      label: 'Contact Name',
      value: 'Sarah Johnson',
      subtext: 'VP of Engineering at TechCorp',
      actionType: 'View Contact Profile',
      icon: <User size={16} className="text-blue-500" />,
      metadata: { id: 'contact-001', type: 'contact' }
    },
    {
      id: 'name-002',
      type: 'name',
      label: 'Lead Name',
      value: 'Michael Chen',
      subtext: 'CTO at InnovateTech',
      actionType: 'View Lead Profile',
      icon: <User size={16} className="text-green-500" />,
      metadata: { id: 'lead-001', type: 'lead' }
    },
    {
      id: 'name-003',
      type: 'name',
      label: 'Sales Rep',
      value: 'Emma Davis',
      subtext: 'Account Executive',
      actionType: 'View User Profile',
      icon: <User size={16} className="text-purple-500" />,
      metadata: { id: 'user-001', type: 'user' }
    },

    // Companies - Organizations
    {
      id: 'company-001',
      type: 'company',
      label: 'Account',
      value: 'TechCorp Solutions',
      subtext: 'Software Development • 250 employees',
      actionType: 'View Account Details',
      icon: <Buildings size={16} className="text-blue-600" />,
      metadata: { industry: 'Technology', size: 'Medium' }
    },
    {
      id: 'company-002',
      type: 'company',
      label: 'Lead Company',
      value: 'InnovateTech Industries',
      subtext: 'Manufacturing • 500 employees',
      actionType: 'View Company Profile',
      icon: <Buildings size={16} className="text-green-600" />,
      metadata: { industry: 'Manufacturing', size: 'Large' }
    },
    {
      id: 'company-003',
      type: 'company',
      label: 'Partner',
      value: 'GlobalSoft Inc.',
      subtext: 'Technology Partner • Enterprise',
      actionType: 'View Partnership Details',
      icon: <Buildings size={16} className="text-purple-600" />,
      metadata: { partnership_type: 'Technology', level: 'Gold' }
    },

    // Phone Numbers
    {
      id: 'phone-001',
      type: 'phone',
      label: 'Business Phone',
      value: '+1 (555) 123-4567',
      subtext: 'Primary business line',
      actionType: 'Initiate Call',
      icon: <Phone size={16} className="text-green-500" />,
      metadata: { type: 'business', preferred: true }
    },
    {
      id: 'phone-002',
      type: 'phone',
      label: 'Mobile Phone',
      value: '+1 (555) 987-6543',
      subtext: 'Personal mobile',
      actionType: 'Send SMS',
      icon: <Phone size={16} className="text-blue-500" />,
      metadata: { type: 'mobile', sms_enabled: true }
    },
    {
      id: 'phone-003',
      type: 'phone',
      label: 'International',
      value: '+44 20 7946 0958',
      subtext: 'London office',
      actionType: 'Schedule International Call',
      icon: <Phone size={16} className="text-orange-500" />,
      metadata: { country: 'UK', timezone: 'GMT' }
    },

    // Email Addresses
    {
      id: 'email-001',
      type: 'email',
      label: 'Primary Email',
      value: 'sarah.johnson@techcorp.com',
      subtext: 'Work email • Verified',
      actionType: 'Compose Email',
      icon: <Mail size={16} className="text-blue-500" />,
      metadata: { type: 'work', verified: true }
    },
    {
      id: 'email-002',
      type: 'email',
      label: 'Personal Email',
      value: 'sarah.j.personal@gmail.com',
      subtext: 'Personal email',
      actionType: 'Send Personal Email',
      icon: <Mail size={16} className="text-green-500" />,
      metadata: { type: 'personal', verified: false }
    },
    {
      id: 'email-003',
      type: 'email',
      label: 'Support Email',
      value: 'support@techcorp.com',
      subtext: 'Customer support',
      actionType: 'Create Support Ticket',
      icon: <Mail size={16} className="text-orange-500" />,
      metadata: { type: 'support', auto_reply: true }
    },

    // Addresses
    {
      id: 'address-001',
      type: 'address',
      label: 'Business Address',
      value: '123 Innovation Drive, San Francisco, CA 94107',
      subtext: 'Corporate headquarters',
      actionType: 'View on Map',
      icon: <MapPin size={16} className="text-red-500" />,
      metadata: { type: 'business', coordinates: '37.7749,-122.4194' }
    },
    {
      id: 'address-002',
      type: 'address',
      label: 'Shipping Address',
      value: '456 Warehouse Blvd, Oakland, CA 94621',
      subtext: 'Distribution center',
      actionType: 'Get Directions',
      icon: <MapPin size={16} className="text-blue-500" />,
      metadata: { type: 'shipping', accessible: true }
    },

    // Tags
    {
      id: 'tag-001',
      type: 'tag',
      label: 'Lead Tag',
      value: 'High Value',
      subtext: '47 leads with this tag',
      actionType: 'Filter by Tag',
      icon: <Tag size={16} className="text-yellow-500" />,
      metadata: { count: 47, category: 'priority' }
    },
    {
      id: 'tag-002',
      type: 'tag',
      label: 'Industry Tag',
      value: 'Enterprise Software',
      subtext: '123 contacts in this industry',
      actionType: 'View Industry Analysis',
      icon: <Tag size={16} className="text-purple-500" />,
      metadata: { count: 123, category: 'industry' }
    },

    // Dates
    {
      id: 'date-001',
      type: 'date',
      label: 'Next Follow-up',
      value: '2024-01-20T14:00:00Z',
      subtext: 'Scheduled call',
      actionType: 'View Calendar',
      icon: <CalendarIcon size={16} className="text-blue-500" />,
      metadata: { type: 'follow_up', reminder_set: true }
    },
    {
      id: 'date-002',
      type: 'date',
      label: 'Deal Close Date',
      value: '2024-02-15T00:00:00Z',
      subtext: 'Target close date',
      actionType: 'Update Timeline',
      icon: <CalendarIcon size={16} className="text-green-500" />,
      metadata: { type: 'deal_close', probability: 85 }
    },

    // Currency Amounts
    {
      id: 'currency-001',
      type: 'currency',
      label: 'Deal Value',
      value: '$125,000',
      subtext: 'Enterprise license deal',
      actionType: 'View Financial Breakdown',
      icon: <CurrencyDollar size={16} className="text-green-600" />,
      metadata: { amount: 125000, currency: 'USD', type: 'deal' }
    },
    {
      id: 'currency-002',
      type: 'currency',
      label: 'Monthly Recurring Revenue',
      value: '$12,500',
      subtext: 'Subscription revenue',
      actionType: 'View Revenue Analytics',
      icon: <CurrencyDollar size={16} className="text-blue-600" />,
      metadata: { amount: 12500, currency: 'USD', type: 'mrr' }
    },

    // Websites and Social
    {
      id: 'website-001',
      type: 'website',
      label: 'Company Website',
      value: 'https://techcorp.com',
      subtext: 'Corporate website',
      actionType: 'Visit Website',
      icon: <Globe size={16} className="text-blue-500" />,
      metadata: { domain: 'techcorp.com', verified: true }
    },
    {
      id: 'social-001',
      type: 'social',
      label: 'LinkedIn Profile',
      value: 'linkedin.com/in/sarahjohnson',
      subtext: '500+ connections',
      actionType: 'View LinkedIn Profile',
      icon: <LinkedinLogo size={16} className="text-blue-600" />,
      metadata: { platform: 'linkedin', verified: true }
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Star size={16} /> },
    { value: 'name', label: 'Names & People', icon: <User size={16} /> },
    { value: 'company', label: 'Companies', icon: <Buildings size={16} /> },
    { value: 'phone', label: 'Phone Numbers', icon: <Phone size={16} /> },
    { value: 'email', label: 'Email Addresses', icon: <Mail size={16} /> },
    { value: 'address', label: 'Addresses', icon: <MapPin size={16} /> },
    { value: 'tag', label: 'Tags', icon: <Tag size={16} /> },
    { value: 'date', label: 'Dates', icon: <CalendarIcon size={16} /> },
    { value: 'currency', label: 'Currency', icon: <CurrencyDollar size={16} /> },
    { value: 'website', label: 'Websites', icon: <Globe size={16} /> },
    { value: 'social', label: 'Social Profiles', icon: <LinkedinLogo size={16} /> }
  ]

  const filteredData = clickableData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory
    const matchesSearch = searchTerm === '' || 
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtext && item.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const handleClickAction = (item: ClickableItem) => {
    setInteractionCount(count => count + 1)
    
    // Simulate different actions based on type
    let message = ''
    let duration = 2000

    switch (item.type) {
      case 'name':
        message = `Opening ${item.metadata?.type || 'profile'} for ${item.value}...`
        break
      case 'company':
        message = `Loading ${item.value} account details...`
        break
      case 'phone':
        message = `Initiating call to ${item.value}...`
        duration = 3000
        break
      case 'email':
        message = `Opening email composer for ${item.value}...`
        break
      case 'address':
        message = `Opening map for ${item.value}...`
        break
      case 'tag':
        message = `Filtering by "${item.value}" tag - found ${item.metadata?.count || 0} records`
        break
      case 'date':
        message = `Opening calendar for ${format(new Date(item.value), 'MMM d, yyyy')}...`
        break
      case 'currency':
        message = `Analyzing ${item.value} financial data...`
        break
      case 'website':
        message = `Opening ${item.value} in new tab...`
        break
      case 'social':
        message = `Opening ${item.metadata?.platform || 'social'} profile...`
        break
      default:
        message = `Executing ${item.actionType} for ${item.value}`
    }

    toast.success(message, { duration })

    // Simulate real action with setTimeout for some types
    if (item.type === 'phone') {
      setTimeout(() => {
        toast.info(`Call connected to ${item.value}`, { duration: 2000 })
      }, 1500)
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      name: 'bg-blue-100 text-blue-800',
      company: 'bg-green-100 text-green-800',
      phone: 'bg-purple-100 text-purple-800',
      email: 'bg-orange-100 text-orange-800',
      address: 'bg-red-100 text-red-800',
      tag: 'bg-yellow-100 text-yellow-800',
      date: 'bg-cyan-100 text-cyan-800',
      currency: 'bg-emerald-100 text-emerald-800',
      website: 'bg-indigo-100 text-indigo-800',
      social: 'bg-pink-100 text-pink-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatValue = (item: ClickableItem) => {
    if (item.type === 'date') {
      return format(new Date(item.value), 'MMM d, yyyy at h:mm a')
    }
    return item.value
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clickable Data Elements</h2>
          <p className="text-muted-foreground">
            Interactive data showcase - every piece of information in the CRM is clickable and actionable
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <Badge variant="outline" className="flex items-center gap-2">
              <Eye size={14} />
              {interactionCount} interactions
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Filter by data type or search for specific elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search data elements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Elements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item) => (
          <Card 
            key={item.id} 
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-primary"
            onClick={() => handleClickAction(item)}
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <Badge className={getTypeColor(item.type)} variant="secondary">
                      {item.label}
                    </Badge>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
                
                <div>
                  <button className="text-left w-full group">
                    <div className="font-medium text-primary group-hover:underline transition-colors">
                      {formatValue(item)}
                    </div>
                    {item.subtext && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.subtext}
                      </p>
                    )}
                  </button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Click to {item.actionType.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Circle size={6} className="text-green-500 fill-current" />
                    <span className="text-xs text-muted-foreground">Interactive</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Eye size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Elements Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to see more clickable data elements.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
          <CardDescription>
            Different types of interactions available for each data element type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                <h4 className="font-medium">Names & People</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View complete profile</li>
                <li>• Edit contact information</li>
                <li>• View activity history</li>
                <li>• Assign tasks</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-green-500" />
                <h4 className="font-medium">Phone Numbers</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Initiate call with logging</li>
                <li>• Send SMS messages</li>
                <li>• Schedule callbacks</li>
                <li>• Add to favorites</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-orange-500" />
                <h4 className="font-medium">Email Addresses</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Compose new email</li>
                <li>• View email history</li>
                <li>• Schedule email campaigns</li>
                <li>• Track email metrics</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Buildings size={20} className="text-purple-500" />
                <h4 className="font-medium">Companies</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View account overview</li>
                <li>• See all contacts</li>
                <li>• View deal pipeline</li>
                <li>• Access company insights</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} className="text-green-600" />
                <h4 className="font-medium">Currency Amounts</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View financial breakdown</li>
                <li>• Edit deal values</li>
                <li>• View payment history</li>
                <li>• Generate invoices</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Tag size={20} className="text-yellow-500" />
                <h4 className="font-medium">Tags & Filters</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Filter by tag</li>
                <li>• View tag analytics</li>
                <li>• Manage tag groups</li>
                <li>• Create smart lists</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-world Context Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-world Usage Examples</CardTitle>
          <CardDescription>
            How clickable data elements enhance productivity in daily CRM workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Sales Follow-up Workflow</h4>
                <p className="text-sm text-blue-800 mb-3">
                  During a sales call, you need to quickly access contact information and schedule follow-ups.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-blue-600" />
                    <span>Click phone number → Initiate call with automatic logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-blue-600" />
                    <span>Click contact name → View full profile with deal history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={12} className="text-blue-600" />
                    <span>Click date → Schedule follow-up meeting</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Lead Qualification Process</h4>
                <p className="text-sm text-green-800 mb-3">
                  Quickly gather information about a new lead and their company for qualification.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Buildings size={12} className="text-green-600" />
                    <span>Click company name → View company profile and revenue data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-green-600" />
                    <span>Click website → Research company background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkedinLogo size={12} className="text-green-600" />
                    <span>Click LinkedIn → Verify decision-maker status</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Account Management Efficiency</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Managing multiple accounts requires quick access to critical information and actions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <CurrencyDollar size={12} className="text-yellow-600" />
                  <span>Click deal values → Analyze revenue potential and payment schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-yellow-600" />
                  <span>Click tags → Filter and segment accounts by criteria</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-yellow-600" />
                  <span>Click addresses → Plan route for customer visits</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Analytics</CardTitle>
          <CardDescription>
            Track how clickable data elements improve user productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{interactionCount}</div>
              <div className="text-sm text-muted-foreground">Total Interactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Available Elements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length - 1}</div>
              <div className="text-sm text-muted-foreground">Data Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-muted-foreground">Clickable Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}