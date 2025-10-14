import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Wifi, Database, Cloud, Smartphone } from 'lucide-react';

const integrations = [
  { id: 1, name: 'Weather API', type: 'External API', status: 'Connected', description: 'Real-time weather data', icon: Cloud },
  { id: 2, name: 'Drone Fleet', type: 'Hardware', status: 'Connected', description: '8 drones active', icon: Smartphone },
  { id: 3, name: 'Soil Sensors', type: 'IoT Network', status: 'Connected', description: '24 sensors online', icon: Wifi },
  { id: 4, name: 'ERP System', type: 'Software', status: 'Disconnected', description: 'Financial integration', icon: Database },
];

export function Integrations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Integrations</h1>
          <p className="text-muted-foreground">Manage connections to external systems and devices</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Integration Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-agro-green" />
              <span>Connected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-green">18</div>
            <p className="text-sm text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-agro-red" />
              <span>Disconnected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-red">3</div>
            <p className="text-sm text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-agro-blue" />
              <span>API Calls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-agro-orange" />
              <span>Devices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">Total connected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map(integration => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Icon className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{integration.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={integration.status === 'Connected' ? 'default' : 'destructive'}>
                      {integration.status}
                    </Badge>
                    <Switch checked={integration.status === 'Connected'} />
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}