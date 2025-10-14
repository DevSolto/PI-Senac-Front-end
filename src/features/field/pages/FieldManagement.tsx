import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Plus, Edit, Trash2, MapPin, Calendar, 
  Sprout, Droplets, Thermometer, Activity
} from 'lucide-react';

const fields = [
  { id: 'F001', name: 'North Corn Field', area: 125, crop: 'Corn', planted: '2024-04-15', health: 92, soilMoisture: 68, lastIrrigation: '2024-08-05' },
  { id: 'F002', name: 'South Soybean', area: 89, crop: 'Soybeans', planted: '2024-05-01', health: 87, soilMoisture: 72, lastIrrigation: '2024-08-06' },
  { id: 'F003', name: 'East Wheat Block', area: 156, crop: 'Wheat', planted: '2024-03-20', health: 78, soilMoisture: 65, lastIrrigation: '2024-08-04' },
  { id: 'F004', name: 'West Cotton', area: 67, crop: 'Cotton', planted: '2024-04-30', health: 95, soilMoisture: 70, lastIrrigation: '2024-08-07' },
];

export function FieldManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Field Management</h1>
          <p className="text-muted-foreground">Manage field operations, crop rotations, and agricultural planning</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Field
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Field Overview</TabsTrigger>
          <TabsTrigger value="planning">Crop Planning</TabsTrigger>
          <TabsTrigger value="operations">Field Operations</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Fields ({fields.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFields.map((field) => (
                  <Card key={field.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{field.name}</h3>
                          <p className="text-sm text-muted-foreground">{field.id}</p>
                        </div>
                        <Badge variant={field.health >= 90 ? 'default' : field.health >= 80 ? 'secondary' : 'destructive'}>
                          {field.health}% Health
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{field.area} ha</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Sprout className="w-3 h-3 text-agro-green" />
                          <span>{field.crop}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{field.planted}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-3 h-3 text-agro-blue" />
                          <span>{field.soilMoisture}%</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Activity className="w-3 h-3 mr-1" />
                          Monitor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crop Rotation Planning</CardTitle>
              <p className="text-sm text-muted-foreground">Plan next season's crop rotations and field assignments</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Crop planning interface would be implemented here</p>
                <p className="text-sm">Features: rotation schedules, soil analysis, market predictions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Operations</CardTitle>
              <p className="text-sm text-muted-foreground">Schedule and track field operations like planting, fertilizing, and harvesting</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Operations management interface would be implemented here</p>
                <p className="text-sm">Features: task scheduling, equipment assignment, progress tracking</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Field Data</CardTitle>
              <p className="text-sm text-muted-foreground">Access historical yield data, weather patterns, and field performance</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Thermometer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Historical data analysis interface would be implemented here</p>
                <p className="text-sm">Features: yield trends, weather correlation, performance analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}