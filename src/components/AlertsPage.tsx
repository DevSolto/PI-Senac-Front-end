import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Bug, Droplets, Thermometer, Clock, CheckCircle2 } from 'lucide-react';

const alerts = [
  { id: 1, type: 'Pest', title: 'Corn Borer Detection', field: 'F001', severity: 'Critical', time: '15 min ago', icon: Bug },
  { id: 2, type: 'Irrigation', title: 'Low Soil Moisture', field: 'F003', severity: 'High', time: '2 hours ago', icon: Droplets },
  { id: 3, type: 'Weather', title: 'Frost Warning', field: 'All Fields', severity: 'Medium', time: '4 hours ago', icon: Thermometer },
  { id: 4, type: 'Equipment', title: 'Tractor Maintenance Due', field: 'TR001', severity: 'Low', time: '6 hours ago', icon: AlertTriangle },
];

export function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Real-time alerts and system notifications</p>
        </div>
        <Button variant="outline">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-agro-red">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-red">2</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-agro-orange">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-orange">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-agro-yellow">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-yellow">5</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map(alert => {
              const Icon = alert.icon;
              return (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.severity === 'Critical' ? 'border-l-red-500' :
                  alert.severity === 'High' ? 'border-l-orange-500' :
                  alert.severity === 'Medium' ? 'border-l-yellow-500' : 'border-l-gray-500'
                }`}>
                  <Icon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <strong>{alert.title}</strong>
                          <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Location: {alert.field} • {alert.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          alert.severity === 'Critical' ? 'destructive' :
                          alert.severity === 'High' ? 'secondary' : 'outline'
                        }>
                          {alert.severity}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}