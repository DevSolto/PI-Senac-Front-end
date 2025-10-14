import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  TrendingUp, TrendingDown, MapPin, Thermometer, 
  Droplets, AlertTriangle, CheckCircle2, Clock,
  DollarSign, Sprout, Tractor, Satellite, Bug,
  Eye, Activity
} from 'lucide-react';
import { Button } from './ui/button';

export function MobileOverview() {
  const criticalAlerts = [
    { id: 1, title: 'Pests detected', field: 'Field 7A', severity: 'Critical', time: '15 min' },
    { id: 2, title: 'Low soil moisture', field: 'Fields 12B, 14C', severity: 'Warning', time: '2 hr' },
  ];

  const quickStats = [
    { label: 'Hectares', value: '12,847', icon: Sprout, color: 'text-agro-green' },
    { label: 'Health', value: '92%', icon: CheckCircle2, color: 'text-agro-green' },
    { label: 'Yield', value: '18.2t', icon: TrendingUp, color: 'text-agro-blue' },
    { label: 'Alerts', value: '7', icon: AlertTriangle, color: 'text-agro-orange' },
  ];

  const fieldStatus = [
    { name: 'Excellent', value: 45, color: 'bg-agro-green' },
    { name: 'Good', value: 32, color: 'bg-agro-yellow' },
    { name: 'Fair', value: 18, color: 'bg-agro-orange' },
    { name: 'Poor', value: 5, color: 'bg-agro-red' },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Overview of your fields</p>
        <div className="flex items-center justify-center mt-2">
          <Badge variant="outline" className="bg-agro-light-green text-agro-green">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All systems operational
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-agro-red" />
              <span>Critical Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map(alert => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <strong className="text-sm">{alert.title}</strong>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.field} • {alert.time} ago
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'Critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View all alerts
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Field Health Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Field Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fieldStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm">{status.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">{status.value}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall health:</span>
              <span className="font-semibold text-agro-green">92%</span>
            </div>
            <Progress value={92} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weather Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-agro-orange" />
            <span>Today's Weather</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Thermometer className="w-6 h-6 mx-auto text-agro-orange mb-1" />
              <p className="text-lg font-semibold">75°F</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
            <div>
              <Droplets className="w-6 h-6 mx-auto text-agro-blue mb-1" />
              <p className="text-lg font-semibold">68%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
            <div>
              <TrendingDown className="w-6 h-6 mx-auto text-agro-green mb-1" />
              <p className="text-lg font-semibold">0.01in</p>
              <p className="text-xs text-muted-foreground">Rainfall</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col space-y-1">
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Field Map</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col space-y-1">
              <Satellite className="w-5 h-5" />
              <span className="text-xs">Satellites</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col space-y-1">
              <Bug className="w-5 h-5" />
              <span className="text-xs">Pest AI</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col space-y-1">
              <Activity className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Tractor className="w-5 h-5 text-agro-orange" />
            <span>Equipment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Active machines</p>
            </div>
            <div>
              <p className="text-xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Drones in flight</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fleet status:</span>
              <span className="font-semibold text-agro-green">Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-agro-green" />
            <span>Revenue Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-2xl font-bold text-agro-green">$2.4M</p>
            <p className="text-sm text-muted-foreground">Expected revenue</p>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-agro-green mr-1" />
              <span className="text-sm text-agro-green">+8.3% to target</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}