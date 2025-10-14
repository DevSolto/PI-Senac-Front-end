import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Truck, MapPin, Fuel, Clock, Settings, Activity } from 'lucide-react';

const vehicles = [
  { id: 'TR001', name: 'John Deere 8370R', type: 'Tractor', status: 'Active', location: 'Field F001', fuel: 78, hours: 145, operator: 'Mike Johnson' },
  { id: 'TR002', name: 'Case IH Magnum 340', type: 'Tractor', status: 'Maintenance', location: 'Workshop', fuel: 45, hours: 89, operator: 'Sarah Wilson' },
  { id: 'DR001', name: 'DJI Agras T30', type: 'Drone', status: 'Active', location: 'Field F003', fuel: 92, hours: 23, operator: 'Auto Pilot' },
  { id: 'HV001', name: 'Case IH 8250', type: 'Harvester', status: 'Idle', location: 'Storage', fuel: 67, hours: 234, operator: 'Tom Anderson' },
];

export function FleetManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Monitor and manage agricultural machinery and drone operations</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Fleet Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.id}</p>
                </div>
                <Badge variant={
                  vehicle.status === 'Active' ? 'default' : 
                  vehicle.status === 'Maintenance' ? 'destructive' : 'secondary'
                }>
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{vehicle.type}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{vehicle.location}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fuel Level</span>
                  <span>{vehicle.fuel}%</span>
                </div>
                <Progress value={vehicle.fuel} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>{vehicle.hours}h</span>
                </div>
                <span className="text-muted-foreground">{vehicle.operator}</span>
              </div>

              <Button size="sm" variant="outline" className="w-full">
                <Activity className="w-3 h-3 mr-1" />
                Track Vehicle
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}