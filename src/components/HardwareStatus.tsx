import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Cpu, Wifi, Battery, Thermometer, Droplets } from 'lucide-react';

const devices = [
  { id: 'SNS001', name: 'Soil Moisture Sensor', type: 'Sensor', status: 'Online', battery: 78, signal: 95, location: 'Field F001' },
  { id: 'WS001', name: 'Weather Station Alpha', type: 'Weather', status: 'Online', battery: 65, signal: 88, location: 'Central' },
  { id: 'CAM001', name: 'Security Camera 1', type: 'Camera', status: 'Offline', battery: 23, signal: 0, location: 'Gate' },
  { id: 'DRN001', name: 'Monitoring Drone', type: 'Drone', status: 'Charging', battery: 45, signal: 92, location: 'Hangar' },
];

export function HardwareStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hardware Status</h1>
        <p className="text-muted-foreground">Monitor connected devices and IoT sensors across your farm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-agro-green" />
              <span>Total Devices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-agro-green">21 online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-agro-blue" />
              <span>Network Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-sm text-muted-foreground">Signal strength</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-agro-yellow" />
              <span>Avg Battery</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-sm text-muted-foreground">All devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-agro-red" />
              <span>Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-red">3</div>
            <p className="text-sm text-muted-foreground">Low battery</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.id} • {device.location}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">Battery: {device.battery}%</p>
                    <Progress value={device.battery} className="w-20" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Signal: {device.signal}%</p>
                    <Progress value={device.signal} className="w-20" />
                  </div>
                  <Badge variant={
                    device.status === 'Online' ? 'default' :
                    device.status === 'Charging' ? 'secondary' : 'destructive'
                  }>
                    {device.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}