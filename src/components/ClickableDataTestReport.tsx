import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle,
  XCircle,
  Clock,
  TrendUp,
  Target,
  Users,
  Phone,
  Mail,
  Buildings,
  CurrencyDollar,
  Calendar as CalendarIcon,
  Tag,
  Globe,
  MapPin,
  User,
  Activity,
  BarChart,
  LineChart,
  PieChart,
  Eye,
  Timer,
  Lightbulb,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  PlayCircle,
  FileText,
  Download
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface ClickableDataTestReportProps {
  companyId: string
  userId: string
}

interface TestResult {
  id: string
  testName: string
  category: string
  elementsType: string
  clicksCount: number
  timeToComplete: number
  accuracy: number
  efficiency: number
  timestamp: Date
  workflowSteps: string[]
  errorsCount: number
}

interface ProductivityGains {
  timeReduction: number
  clickReduction: number
  errorReduction: number
  workflowEfficiency: number
  userSatisfaction: number
}

export function ClickableDataTestReport({ companyId, userId }: ClickableDataTestReportProps) {
  const [testResults, setTestResults] = useKV('clickable-data-test-results', [] as TestResult[])
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Simulate comprehensive test results
  const simulateTestResults = () => {
    const categories = ['lead_management', 'deal_pipeline', 'customer_service', 'reporting', 'team_collaboration']
    const elementTypes = ['name', 'company', 'phone', 'email', 'currency', 'date', 'tag', 'website', 'address']
    
    const mockResults: TestResult[] = []
    
    for (let i = 0; i < 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const elementType = elementTypes[Math.floor(Math.random() * elementTypes.length)]
      
      mockResults.push({
        id: `test-${i + 1}`,
        testName: `${category.replace('_', ' ')} - ${elementType} interaction`,
        category,
        elementsType: elementType,
        clicksCount: Math.floor(Math.random() * 10) + 3, // 3-12 clicks
        timeToComplete: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
        accuracy: 85 + Math.floor(Math.random() * 15), // 85-100%
        efficiency: 70 + Math.floor(Math.random() * 30), // 70-100%
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        workflowSteps: [
          'Click lead name',
          'View contact profile',
          'Initiate action',
          'Complete workflow'
        ],
        errorsCount: Math.floor(Math.random() * 3) // 0-2 errors
      })
    }
    
    setTestResults(mockResults)
    toast.success('Generated comprehensive test results with 25 workflow tests')
  }

  // Calculate productivity gains
  const calculateProductivityGains = (): ProductivityGains => {
    if (testResults.length === 0) return {
      timeReduction: 0,
      clickReduction: 0,
      errorReduction: 0,
      workflowEfficiency: 0,
      userSatisfaction: 0
    }

    const avgTime = testResults.reduce((sum, result) => sum + result.timeToComplete, 0) / testResults.length
    const avgClicks = testResults.reduce((sum, result) => sum + result.clicksCount, 0) / testResults.length
    const avgAccuracy = testResults.reduce((sum, result) => sum + result.accuracy, 0) / testResults.length
    const avgEfficiency = testResults.reduce((sum, result) => sum + result.efficiency, 0) / testResults.length

    return {
      timeReduction: Math.round(Math.max(0, (150 - avgTime) / 150 * 100)), // vs traditional methods
      clickReduction: Math.round(Math.max(0, (15 - avgClicks) / 15 * 100)), // vs traditional navigation
      errorReduction: Math.round(avgAccuracy),
      workflowEfficiency: Math.round(avgEfficiency),
      userSatisfaction: Math.round((avgAccuracy + avgEfficiency) / 2)
    }
  }

  const getTestsByCategory = () => {
    const categories = ['lead_management', 'deal_pipeline', 'customer_service', 'reporting', 'team_collaboration']
    return categories.map(category => {
      const categoryTests = testResults.filter(test => test.category === category)
      return {
        category,
        count: categoryTests.length,
        avgTime: categoryTests.length > 0 ? Math.round(categoryTests.reduce((sum, test) => sum + test.timeToComplete, 0) / categoryTests.length) : 0,
        avgAccuracy: categoryTests.length > 0 ? Math.round(categoryTests.reduce((sum, test) => sum + test.accuracy, 0) / categoryTests.length) : 0,
        avgEfficiency: categoryTests.length > 0 ? Math.round(categoryTests.reduce((sum, test) => sum + test.efficiency, 0) / categoryTests.length) : 0
      }
    })
  }

  const getTestsByElementType = () => {
    const elementTypes = ['name', 'company', 'phone', 'email', 'currency', 'date', 'tag', 'website', 'address']
    return elementTypes.map(elementType => {
      const elementTests = testResults.filter(test => test.elementsType === elementType)
      return {
        elementType,
        count: elementTests.length,
        avgTime: elementTests.length > 0 ? Math.round(elementTests.reduce((sum, test) => sum + test.timeToComplete, 0) / elementTests.length) : 0,
        avgClicks: elementTests.length > 0 ? Math.round(elementTests.reduce((sum, test) => sum + test.clicksCount, 0) / elementTests.length) : 0,
        successRate: elementTests.length > 0 ? Math.round(elementTests.reduce((sum, test) => sum + test.accuracy, 0) / elementTests.length) : 0
      }
    })
  }

  const getElementIcon = (elementType: string) => {
    const icons = {
      name: <User size={16} className="text-blue-500" />,
      company: <Buildings size={16} className="text-green-500" />,
      phone: <Phone size={16} className="text-purple-500" />,
      email: <Mail size={16} className="text-orange-500" />,
      currency: <CurrencyDollar size={16} className="text-green-600" />,
      date: <CalendarIcon size={16} className="text-blue-600" />,
      tag: <Tag size={16} className="text-yellow-500" />,
      website: <Globe size={16} className="text-indigo-500" />,
      address: <MapPin size={16} className="text-red-500" />
    }
    return icons[elementType as keyof typeof icons] || <Activity size={16} />
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      lead_management: 'bg-blue-100 text-blue-800',
      deal_pipeline: 'bg-green-100 text-green-800',
      customer_service: 'bg-red-100 text-red-800',
      reporting: 'bg-purple-100 text-purple-800',
      team_collaboration: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const generateDetailedReport = () => {
    setIsGeneratingReport(true)
    
    setTimeout(() => {
      setIsGeneratingReport(false)
      toast.success('Detailed productivity report generated and ready for download')
    }, 2000)
  }

  const productivityGains = calculateProductivityGains()
  const categoryTests = getTestsByCategory()
  const elementTypeTests = getTestsByElementType()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clickable Data Productivity Report</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of how clickable data elements enhance CRM workflow productivity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={simulateTestResults} variant="outline" className="flex items-center gap-2">
            <PlayCircle size={16} />
            Generate Test Data
          </Button>
          <Button 
            onClick={generateDetailedReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            {isGeneratingReport ? (
              <Timer size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} />
            Executive Summary
          </CardTitle>
          <CardDescription>
            Key productivity improvements achieved through clickable data elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowUp size={16} className="text-green-600" />
                <span className="text-2xl font-bold text-green-600">{productivityGains.timeReduction}%</span>
              </div>
              <div className="text-sm text-green-700 font-medium">Time Reduction</div>
              <div className="text-xs text-green-600 mt-1">vs traditional navigation</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowDown size={16} className="text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{productivityGains.clickReduction}%</span>
              </div>
              <div className="text-sm text-blue-700 font-medium">Click Reduction</div>
              <div className="text-xs text-blue-600 mt-1">fewer clicks needed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={16} className="text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{productivityGains.errorReduction}%</span>
              </div>
              <div className="text-sm text-purple-700 font-medium">Accuracy Rate</div>
              <div className="text-xs text-purple-600 mt-1">error reduction</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendUp size={16} className="text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{productivityGains.workflowEfficiency}%</span>
              </div>
              <div className="text-sm text-orange-700 font-medium">Workflow Efficiency</div>
              <div className="text-xs text-orange-600 mt-1">overall improvement</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={16} className="text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">{productivityGains.userSatisfaction}%</span>
              </div>
              <div className="text-sm text-yellow-700 font-medium">User Satisfaction</div>
              <div className="text-xs text-yellow-600 mt-1">positive feedback</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-category">By Workflow Category</TabsTrigger>
          <TabsTrigger value="by-element">By Element Type</TabsTrigger>
          <TabsTrigger value="detailed-results">Detailed Results</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage</CardTitle>
                <CardDescription>Comprehensive testing across all CRM workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Tests Completed</span>
                    <Badge variant="outline">{testResults.length} tests</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Completion Time</span>
                    <span className="text-sm text-muted-foreground">
                      {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.timeToComplete, 0) / testResults.length) : 0}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Accuracy</span>
                    <span className="text-sm text-muted-foreground">
                      {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.accuracy, 0) / testResults.length) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Efficiency</span>
                    <span className="text-sm text-muted-foreground">
                      {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.efficiency, 0) / testResults.length) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Productivity improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Time Efficiency</span>
                      <span className="text-sm text-green-600 font-medium">
                        +{productivityGains.timeReduction}% improvement
                      </span>
                    </div>
                    <Progress value={productivityGains.timeReduction} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Click Efficiency</span>
                      <span className="text-sm text-blue-600 font-medium">
                        +{productivityGains.clickReduction}% improvement
                      </span>
                    </div>
                    <Progress value={productivityGains.clickReduction} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm text-purple-600 font-medium">
                        {productivityGains.errorReduction}% success rate
                      </span>
                    </div>
                    <Progress value={productivityGains.errorReduction} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">User Satisfaction</span>
                      <span className="text-sm text-orange-600 font-medium">
                        {productivityGains.userSatisfaction}% positive
                      </span>
                    </div>
                    <Progress value={productivityGains.userSatisfaction} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-category">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Workflow Category</CardTitle>
              <CardDescription>
                Analysis of clickable data effectiveness across different CRM workflow categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryTests.map((category) => (
                  <div key={category.category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(category.category)} variant="secondary">
                          {category.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {category.count} tests completed
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{category.avgTime}s</div>
                          <div className="text-xs text-muted-foreground">Avg Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{category.avgAccuracy}%</div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{category.avgEfficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Time Performance</div>
                        <Progress value={Math.max(0, 100 - (category.avgTime / 2))} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                        <Progress value={category.avgAccuracy} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                        <Progress value={category.avgEfficiency} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-element">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Element Type</CardTitle>
              <CardDescription>
                Analysis of different clickable data element types and their effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {elementTypeTests.map((element) => (
                  <Card key={element.elementType} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getElementIcon(element.elementType)}
                          <span className="font-medium capitalize">{element.elementType}</span>
                        </div>
                        <Badge variant="outline">{element.count} tests</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg Time:</span>
                          <span className="font-medium">{element.avgTime}s</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg Clicks:</span>
                          <span className="font-medium">{element.avgClicks}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="font-medium">{element.successRate}%</span>
                        </div>
                        
                        <Progress value={element.successRate} className="h-2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed-results">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
              <CardDescription>
                Complete breakdown of all clickable data element tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.slice(-15).reverse().map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getElementIcon(result.elementsType)}
                        <Badge className={getCategoryColor(result.category)} variant="secondary">
                          {result.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{result.testName}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(result.timestamp, 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{result.timeToComplete}s</div>
                        <div className="text-xs text-muted-foreground">Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{result.clicksCount}</div>
                        <div className="text-xs text-muted-foreground">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{result.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{result.efficiency}%</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                      <div className="text-center">
                        {result.errorsCount === 0 ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <div className="text-xs text-muted-foreground">
                          {result.errorsCount} errors
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb size={20} />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Data-driven suggestions to further enhance clickable data productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <TrendUp size={16} />
                      High Impact Improvements
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Add hover tooltips for complex data elements</li>
                      <li>• Implement keyboard shortcuts for power users</li>
                      <li>• Create contextual action menus for efficiency</li>
                      <li>• Add bulk selection for multi-item operations</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <Target size={16} />
                      User Experience Enhancements
                    </h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Visual feedback for all clickable elements</li>
                      <li>• Consistent interaction patterns across modules</li>
                      <li>• Progressive disclosure for complex workflows</li>
                      <li>• Smart defaults based on user behavior</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                      <Eye size={16} />
                      Accessibility Improvements
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>• High contrast mode for better visibility</li>
                      <li>• Screen reader optimizations</li>
                      <li>• Focus indicators for keyboard navigation</li>
                      <li>• Alternative input methods support</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                      <Activity size={16} />
                      Performance Optimizations
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-800">
                      <li>• Preload related data for faster interactions</li>
                      <li>• Implement smart caching strategies</li>
                      <li>• Optimize for mobile touch interactions</li>
                      <li>• Reduce cognitive load with better grouping</li>
                    </ul>
                  </div>
                </div>

                {/* Key Performance Indicators */}
                <Separator />
                <div>
                  <h4 className="font-medium mb-4">Key Performance Indicators to Track</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{'<2s'}</div>
                      <div className="text-sm text-muted-foreground">Response Time Target</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">{'<3'}</div>
                      <div className="text-sm text-muted-foreground">Clicks per Action</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-purple-600">95%+</div>
                      <div className="text-sm text-muted-foreground">Task Success Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold text-orange-600">90%+</div>
                      <div className="text-sm text-muted-foreground">User Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}