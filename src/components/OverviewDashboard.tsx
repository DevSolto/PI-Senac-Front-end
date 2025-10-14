import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  TrendingUp, TrendingDown, MapPin, Thermometer, 
  Droplets, AlertTriangle, CheckCircle2, Clock,
  DollarSign, Sprout, Tractor, Satellite
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const cropHealthData = [
  { name: 'Week 1', healthy: 85, moderate: 12, critical: 3 },
  { name: 'Week 2', healthy: 88, moderate: 10, critical: 2 },
  { name: 'Week 3', healthy: 82, moderate: 15, critical: 3 },
  { name: 'Week 4', healthy: 90, moderate: 8, critical: 2 },
  { name: 'Week 5', healthy: 87, moderate: 11, critical: 2 },
  { name: 'Week 6', healthy: 92, moderate: 6, critical: 2 },
];

const yieldForecastData = [
  { name: 'Corn', current: 8500, forecast: 9200, target: 9000 },
  { name: 'Soybeans', current: 3200, forecast: 3450, target: 3300 },
  { name: 'Wheat', current: 4800, forecast: 5100, target: 5000 },
  { name: 'Cotton', current: 1200, forecast: 1350, target: 1300 },
];

const fieldStatusData = [
  { name: 'Excellent', value: 45, color: '#16a34a' },
  { name: 'Good', value: 32, color: '#eab308' },
  { name: 'Fair', value: 18, color: '#ea580c' },
  { name: 'Poor', value: 5, color: '#dc2626' },
];

const weatherData = [
  { name: 'Mon', temp: 72, humidity: 65, precipitation: 0 },
  { name: 'Tue', temp: 75, humidity: 70, precipitation: 0.2 },
  { name: 'Wed', temp: 73, humidity: 68, precipitation: 0 },
  { name: 'Thu', temp: 78, humidity: 72, precipitation: 0.1 },
  { name: 'Fri', temp: 76, humidity: 69, precipitation: 0 },
  { name: 'Sat', temp: 74, humidity: 66, precipitation: 0.3 },
  { name: 'Sun', temp: 77, humidity: 71, precipitation: 0 },
];

export function OverviewDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agricultural Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring and insights for your agricultural operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-agro-light-green text-agro-green">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated: 2 min ago
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hectares</CardTitle>
            <Sprout className="h-4 w-4 text-agro-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-agro-green flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1% from last season
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crop Health Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-agro-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <Progress value={92} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-agro-green">Excellent conditions</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecasted Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-agro-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,200</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-agro-blue">tons estimated</span>
            </p>
            <p className="text-xs text-agro-green mt-1">+8.3% vs target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-agro-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">3 Critical</Badge>
              <Badge variant="secondary" className="text-xs">4 Warning</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Health Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Health Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly health assessment across all fields</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cropHealthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="healthy" stackId="1" stroke="#16a34a" fill="#16a34a" />
                <Area type="monotone" dataKey="moderate" stackId="1" stroke="#eab308" fill="#eab308" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Field Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Field Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Current status across all monitored fields</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fieldStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {fieldStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yield Forecast and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Yield Forecast by Crop</CardTitle>
            <p className="text-sm text-muted-foreground">Current vs forecasted yield (tons per hectare)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yieldForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#ea580c" name="Current" />
                <Bar dataKey="forecast" fill="#16a34a" name="Forecast" />
                <Bar dataKey="target" fill="#eab308" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weather Overview */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Weather Forecast</CardTitle>
            <p className="text-sm text-muted-foreground">Temperature and precipitation outlook</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={2} name="Temperature (°F)" />
                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
                <Bar yAxisId="right" dataKey="precipitation" fill="#16a34a" name="Precipitation (in)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts & Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">Latest system alerts and recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-l-4 border-l-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>Pest Detection Alert</strong> - Field Sector 7A
                    <p className="text-sm text-muted-foreground mt-1">
                      Corn borer larvae detected. Immediate intervention recommended.
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Critical</Badge>
                    <p className="text-xs text-muted-foreground mt-1">15 min ago</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-l-4 border-l-yellow-500">
              <Droplets className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>Irrigation Recommendation</strong> - Fields 12B, 14C
                    <p className="text-sm text-muted-foreground mt-1">
                      Soil moisture below optimal levels. Schedule irrigation within 24 hours.
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Warning</Badge>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-l-4 border-l-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>Harvest Window Optimal</strong> - Soybean Fields 8A-8D
                    <p className="text-sm text-muted-foreground mt-1">
                      Weather conditions ideal for harvest. Begin operations within 3-day window.
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-agro-green">Info</Badge>
                    <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tractor className="h-8 w-8 text-agro-orange" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Active Machines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-8 w-8 text-agro-blue" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Drones Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-8 w-8 text-agro-red" />
              <div>
                <p className="text-2xl font-bold">74°F</p>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-agro-green" />
              <div>
                <p className="text-2xl font-bold">$2.4M</p>
                <p className="text-sm text-muted-foreground">Projected Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}