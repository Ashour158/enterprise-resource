import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MapPin, 
  Target, 
  Users, 
  TrendUp, 
  DollarSign, 
  Navigation,
  Globe,
  Building,
  Award,
  ChartLine,
  Filter,
  Eye,
  Route,
  Layers
} from '@phosphor-icons/react'

interface GeographicalDeal {
  id: string
  name: string
  value: number
  stage: string
  probability: number
  account_name: string
  rep_name: string
  territory_name: string
  location: {
    country: string
    state: string
    city: string
    latitude: number
    longitude: number
  }
  industry: string
  created_at: string
  expected_close_date: string
}

interface TerritoryBoundary {
  id: string
  name: string
  type: 'state' | 'city' | 'zip' | 'custom'
  coordinates: Array<{lat: number, lng: number}>
  color: string
  performance: 'excellent' | 'good' | 'fair' | 'poor'
  quota: number
  achieved: number
}

interface MapView {
  center: { lat: number; lng: number }
  zoom: number
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

interface Props {
  companyId: string
  userId: string
  territories: any[]
  deals: any[]
  onDealSelect?: (dealId: string) => void
  onTerritorySelect?: (territoryId: string) => void
}

export function GeographicalTerritoryMapping({ 
  companyId, 
  userId, 
  territories, 
  deals,
  onDealSelect,
  onTerritorySelect 
}: Props) {
  const [selectedView, setSelectedView] = useState<'deals' | 'territories' | 'performance'>('deals')
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)
  const [mapFilter, setMapFilter] = useState<string>('all')
  const [heatmapType, setHeatmapType] = useState<'deal_value' | 'deal_count' | 'quota_attainment'>('deal_value')
  const [mapView, setMapView] = useState<MapView>({
    center: { lat: 39.8283, lng: -98.5795 }, // Center of US
    zoom: 4
  })
  const [geographicalDeals, setGeographicalDeals] = useState<GeographicalDeal[]>([])
  const [territoryBoundaries, setTerritoryBoundaries] = useState<TerritoryBoundary[]>([])

  // Initialize geographical data
  useEffect(() => {
    initializeGeographicalData()
  }, [territories, deals])

  const initializeGeographicalData = () => {
    // Convert deals to geographical deals with coordinates
    const geoDeals: GeographicalDeal[] = deals.map(deal => ({
      ...deal,
      location: {
        ...deal.location,
        latitude: deal.location.latitude || getCoordinatesForLocation(deal.location),
        longitude: deal.location.longitude || getCoordinatesForLocation(deal.location, false)
      }
    }))

    // Create territory boundaries from territory data
    const boundaries: TerritoryBoundary[] = territories.map(territory => ({
      id: territory.id,
      name: territory.name,
      type: 'state',
      coordinates: generateTerritoryBoundary(territory),
      color: getTerritoryColor(territory),
      performance: territory.ai_territory_health,
      quota: territory.quota,
      achieved: territory.achieved
    }))

    setGeographicalDeals(geoDeals)
    setTerritoryBoundaries(boundaries)
  }

  // Mock coordinate generation for locations
  const getCoordinatesForLocation = (location: any, isLatitude: boolean = true): number => {
    const locationCoords: Record<string, { lat: number; lng: number }> = {
      'New York City': { lat: 40.7128, lng: -74.0060 },
      'Boston': { lat: 42.3601, lng: -71.0589 },
      'San Francisco': { lat: 37.7749, lng: -122.4194 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Seattle': { lat: 47.6062, lng: -122.3321 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
      'Miami': { lat: 25.7617, lng: -80.1918 },
      'Denver': { lat: 39.7392, lng: -104.9903 },
      'Atlanta': { lat: 33.7490, lng: -84.3880 }
    }

    const coords = locationCoords[location.city] || { lat: 39.8283, lng: -98.5795 }
    return isLatitude ? coords.lat : coords.lng
  }

  const generateTerritoryBoundary = (territory: any): Array<{lat: number, lng: number}> => {
    // Mock boundary generation based on states/regions
    const stateBounds: Record<string, Array<{lat: number, lng: number}>> = {
      'New York': [
        { lat: 45.0153, lng: -79.7624 },
        { lat: 45.0153, lng: -71.7774 },
        { lat: 40.4774, lng: -71.7774 },
        { lat: 40.4774, lng: -79.7624 }
      ],
      'California': [
        { lat: 42.0095, lng: -124.4829 },
        { lat: 42.0095, lng: -114.1315 },
        { lat: 32.5121, lng: -114.1315 },
        { lat: 32.5121, lng: -124.4829 }
      ]
    }

    // Return boundary for first state in territory, or default boundary
    const firstState = territory.states?.[0]
    return stateBounds[firstState] || [
      { lat: mapView.center.lat + 2, lng: mapView.center.lng + 2 },
      { lat: mapView.center.lat + 2, lng: mapView.center.lng - 2 },
      { lat: mapView.center.lat - 2, lng: mapView.center.lng - 2 },
      { lat: mapView.center.lat - 2, lng: mapView.center.lng + 2 }
    ]
  }

  const getTerritoryColor = (territory: any): string => {
    const attainment = (territory.achieved / territory.quota) * 100
    if (attainment >= 90) return '#10B981' // Green
    if (attainment >= 75) return '#3B82F6' // Blue  
    if (attainment >= 60) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const getFilteredDeals = () => {
    let filtered = geographicalDeals

    if (mapFilter !== 'all') {
      if (mapFilter === 'hot') {
        filtered = filtered.filter(deal => deal.probability >= 75)
      } else if (mapFilter === 'closing_soon') {
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        filtered = filtered.filter(deal => new Date(deal.expected_close_date) <= nextMonth)
      } else if (mapFilter === 'high_value') {
        filtered = filtered.filter(deal => deal.value >= 100000)
      }
    }

    if (selectedTerritory) {
      filtered = filtered.filter(deal => deal.territory_name === selectedTerritory)
    }

    return filtered
  }

  const getRegionStatistics = () => {
    const filteredDeals = getFilteredDeals()
    
    const regionStats = filteredDeals.reduce((acc, deal) => {
      const region = `${deal.location.state}, ${deal.location.country}`
      if (!acc[region]) {
        acc[region] = {
          dealCount: 0,
          totalValue: 0,
          avgProbability: 0,
          topRep: '',
          dealCounts: {} as Record<string, number>
        }
      }
      
      acc[region].dealCount++
      acc[region].totalValue += deal.value
      acc[region].avgProbability = (acc[region].avgProbability + deal.probability) / 2
      
      if (!acc[region].dealCounts[deal.rep_name]) {
        acc[region].dealCounts[deal.rep_name] = 0
      }
      acc[region].dealCounts[deal.rep_name]++
      
      // Find top rep
      const topRep = Object.entries(acc[region].dealCounts)
        .sort(([,a], [,b]) => b - a)[0]
      acc[region].topRep = topRep?.[0] || ''
      
      return acc
    }, {} as Record<string, any>)

    return Object.entries(regionStats).map(([region, stats]) => ({
      region,
      ...stats
    }))
  }

  const getDealsByStage = () => {
    const filteredDeals = getFilteredDeals()
    const stageStats = filteredDeals.reduce((acc, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = { count: 0, value: 0 }
      }
      acc[deal.stage].count++
      acc[deal.stage].value += deal.value
      return acc
    }, {} as Record<string, {count: number, value: number}>)

    return Object.entries(stageStats).map(([stage, stats]) => ({
      stage,
      ...stats
    }))
  }

  const handleDealClick = (deal: GeographicalDeal) => {
    onDealSelect?.(deal.id)
    // Focus map on deal location
    setMapView({
      center: { lat: deal.location.latitude, lng: deal.location.longitude },
      zoom: 8
    })
  }

  const handleTerritoryClick = (territoryName: string) => {
    const territory = territories.find(t => t.name === territoryName)
    if (territory) {
      onTerritorySelect?.(territory.id)
      setSelectedTerritory(territoryName)
    }
  }

  const mockMapComponent = (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden">
      {/* Mock geographical visualization */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Mock US map outline */}
          <path 
            d="M50 150 Q100 100 200 120 T350 140 L350 200 Q300 250 200 230 T50 210 Z" 
            fill="rgba(59, 130, 246, 0.1)" 
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="2"
          />
          
          {/* Territory boundaries */}
          {territoryBoundaries.map((boundary, index) => (
            <polygon
              key={boundary.id}
              points={boundary.coordinates.map(coord => 
                `${(coord.lng + 124) * 2},${(45 - coord.lat) * 3}`
              ).join(' ')}
              fill={`${boundary.color}20`}
              stroke={boundary.color}
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleTerritoryClick(boundary.name)}
            />
          ))}
          
          {/* Deal markers */}
          {getFilteredDeals().map((deal, index) => {
            const x = (deal.location.longitude + 124) * 2
            const y = (45 - deal.location.latitude) * 3
            const size = Math.min(Math.max(deal.value / 50000, 4), 12)
            
            return (
              <g key={deal.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={deal.probability >= 75 ? '#10B981' : deal.probability >= 50 ? '#F59E0B' : '#EF4444'}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleDealClick(deal)}
                />
                <text
                  x={x}
                  y={y + size + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="pointer-events-none"
                >
                  ${(deal.value / 1000).toFixed(0)}K
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      
      <div className="z-10 text-center">
        <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Interactive Territory Map</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Geographical visualization of deals and territories with real-time data overlays
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedView} onValueChange={(value) => setSelectedView(value as 'deals' | 'territories' | 'performance')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deals">Deal Distribution</SelectItem>
              <SelectItem value="territories">Territory Boundaries</SelectItem>
              <SelectItem value="performance">Performance Heatmap</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mapFilter} onValueChange={setMapFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deals</SelectItem>
              <SelectItem value="hot">Hot Deals (75%+)</SelectItem>
              <SelectItem value="closing_soon">Closing Soon</SelectItem>
              <SelectItem value="high_value">High Value (100K+)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={heatmapType} onValueChange={(value) => setHeatmapType(value as 'deal_value' | 'deal_count' | 'quota_attainment')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deal_value">Deal Value</SelectItem>
              <SelectItem value="deal_count">Deal Count</SelectItem>
              <SelectItem value="quota_attainment">Quota Attainment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {getFilteredDeals().length} Deals Shown
          </Badge>
          <Badge variant="outline">
            {territoryBoundaries.length} Territories
          </Badge>
        </div>
      </div>

      {/* Map and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Geographical Territory Mapping
                  </CardTitle>
                  <CardDescription>
                    Interactive visualization of deals and territory boundaries
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4 mr-2" />
                    Layers
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mockMapComponent}
              
              {/* Map Legend */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Map Legend</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Hot Deals (75%+ probability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Warm Deals (50-74% probability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Cold Deals (&lt;50% probability)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-green-500"></div>
                      <span>Excellent Territory (90%+ quota)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-blue-500"></div>
                      <span>Good Territory (75-89% quota)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-red-500"></div>
                      <span>Underperforming Territory</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Panel */}
        <div className="space-y-4">
          {/* Regional Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getRegionStatistics().slice(0, 5).map((region, index) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{region.region}</span>
                    <Badge variant="outline" className="text-xs">
                      {region.dealCount} deals
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${(region.totalValue / 1000).toFixed(0)}K total</span>
                    <span>{region.avgProbability.toFixed(0)}% avg probability</span>
                  </div>
                  <Progress value={region.avgProbability} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deal Stage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getDealsByStage().map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <Badge variant="outline" className="text-xs">
                      {stage.count}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(stage.value / 1000).toFixed(0)}K total value
                  </div>
                  <Progress 
                    value={(stage.count / getFilteredDeals().length) * 100} 
                    className="h-1" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Territory Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Territory Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{territories.length}</div>
                  <div className="text-xs text-muted-foreground">Active Territories</div>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold">
                    {territories.filter(t => t.ai_territory_health === 'excellent').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Top Performing</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Average Quota Attainment</span>
                  <span className="font-medium">
                    {(territories.reduce((sum, t) => sum + (t.achieved / t.quota), 0) / territories.length * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Total Pipeline Value</span>
                  <span className="font-medium">
                    ${(geographicalDeals.reduce((sum, d) => sum + d.value, 0) / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Deal Table */}
      <Card>
        <CardHeader>
          <CardTitle>Geographical Deal Distribution</CardTitle>
          <CardDescription>
            Detailed view of deals by location and territory assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredDeals().slice(0, 10).map((deal) => (
                <TableRow key={deal.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.account_name}</TableCell>
                  <TableCell>${(deal.value / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deal.location.city}, {deal.location.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{deal.territory_name}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{deal.rep_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{deal.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={deal.probability >= 75 ? 'default' : 'outline'}>
                      {deal.probability}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(deal.expected_close_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDealClick(deal)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Route className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}