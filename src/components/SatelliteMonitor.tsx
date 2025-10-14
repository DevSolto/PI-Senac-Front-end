import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Satellite, Download, Calendar, Layers, Zap, Eye } from 'lucide-react';

const satelliteData = [
  { id: 'SAT001', name: 'Landsat 8', lastUpdate: '2024-08-08 14:30', resolution: '30m', status: 'Active' },
  { id: 'SAT002', name: 'Sentinel-2A', lastUpdate: '2024-08-08 16:45', resolution: '10m', status: 'Active' },
  { id: 'SAT003', name: 'Planet Labs', lastUpdate: '2024-08-08 12:15', resolution: '3m', status: 'Active' },
];

export function SatelliteMonitor() {
  const [selectedSatellite, setSelectedSatellite] = useState('SAT002');
  const [selectedDate, setSelectedDate] = useState('2024-08-08');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Satellite Monitoring</h1>
          <p className="text-muted-foreground">NDVI analysis and satellite imagery for crop health monitoring</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satellite Imagery & NDVI Analysis</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedSatellite} onValueChange={setSelectedSatellite}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {satelliteData.map(sat => (
                        <SelectItem key={sat.id} value={sat.id}>{sat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 rounded border bg-background"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ndvi">
                <TabsList>
                  <TabsTrigger value="ndvi">NDVI</TabsTrigger>
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="infrared">Infrared</TabsTrigger>
                  <TabsTrigger value="change">Change Detection</TabsTrigger>
                </TabsList>

                <TabsContent value="ndvi" className="mt-4">
                  <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded-lg border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Satellite className="w-16 h-16 mx-auto mb-4 text-agro-green opacity-50" />
                        <p className="text-lg font-semibold">NDVI Satellite View</p>
                        <p className="text-sm text-muted-foreground">Sentinel-2A • 10m resolution</p>
                        <p className="text-sm text-muted-foreground mt-2">August 8, 2024 at 16:45 UTC</p>
                      </div>
                    </div>
                    
                    {/* NDVI Color Legend */}
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <h4 className="text-sm font-semibold mb-2">NDVI Values</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-green-600"></div>
                          <span className="text-xs">0.8-1.0 Healthy</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-yellow-500"></div>
                          <span className="text-xs">0.6-0.8 Moderate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-orange-500"></div>
                          <span className="text-xs">0.4-0.6 Stressed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-red-500"></div>
                          <span className="text-xs">0.0-0.4 Poor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rgb" className="mt-4">
                  <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-200 dark:from-blue-900 dark:to-green-800 rounded-lg border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="w-16 h-16 mx-auto mb-4 text-agro-blue opacity-50" />
                        <p className="text-lg font-semibold">True Color RGB</p>
                        <p className="text-sm text-muted-foreground">Natural color satellite imagery</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="infrared" className="mt-4">
                  <div className="relative w-full h-96 bg-gradient-to-br from-red-100 to-pink-200 dark:from-red-900 dark:to-pink-800 rounded-lg border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Zap className="w-16 h-16 mx-auto mb-4 text-agro-red opacity-50" />
                        <p className="text-lg font-semibold">Near Infrared</p>
                        <p className="text-sm text-muted-foreground">Enhanced vegetation analysis</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="change" className="mt-4">
                  <div className="relative w-full h-96 bg-gradient-to-br from-purple-100 to-blue-200 dark:from-purple-900 dark:to-blue-800 rounded-lg border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="w-16 h-16 mx-auto mb-4 text-agro-blue opacity-50" />
                        <p className="text-lg font-semibold">Change Detection</p>
                        <p className="text-sm text-muted-foreground">Temporal analysis and anomaly detection</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Satellite Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {satelliteData.map(sat => (
                <div key={sat.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{sat.name}</p>
                    <p className="text-xs text-muted-foreground">{sat.resolution} resolution</p>
                    <p className="text-xs text-muted-foreground">{sat.lastUpdate}</p>
                  </div>
                  <Badge variant="outline" className="bg-agro-light-green text-agro-green">
                    {sat.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg NDVI:</span>
                <span className="font-semibold text-agro-green">0.74</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Coverage:</span>
                <span className="font-semibold">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cloud Cover:</span>
                <span className="font-semibold">12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quality Score:</span>
                <span className="font-semibold text-agro-green">Excellent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Analysis
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Images
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Layers className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}