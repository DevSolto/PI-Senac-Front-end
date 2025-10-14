import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, AlertTriangle, Eye, Shield } from 'lucide-react';

const pestAlerts = [
  { id: 1, pest: 'Corn Borer', field: 'F001', severity: 'High', detected: '2 hours ago', confidence: 94 },
  { id: 2, pest: 'Aphids', field: 'F003', severity: 'Medium', detected: '5 hours ago', confidence: 87 },
  { id: 3, pest: 'Cutworm', field: 'F002', severity: 'Low', detected: '1 day ago', confidence: 72 },
];

export function AgroPestAI() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AgroPest AI</h1>
        <p className="text-muted-foreground">AI-powered pest detection and monitoring system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-agro-red" />
              <span>Active Threats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-red">3</div>
            <p className="text-sm text-muted-foreground">Pest detections today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-agro-blue" />
              <span>Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Fields under surveillance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-agro-green" />
              <span>Protected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-sm text-muted-foreground">Crop protection rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pest Detections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pestAlerts.map(alert => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{alert.pest}</strong> detected in Field {alert.field}
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {alert.confidence}% • Detected {alert.detected}
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'High' ? 'destructive' : alert.severity === 'Medium' ? 'secondary' : 'outline'}>
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}