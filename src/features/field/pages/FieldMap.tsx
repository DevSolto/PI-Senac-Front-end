import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Map, Layers, MapPin, Satellite, Droplets, Thermometer,
  Wind, AlertTriangle, Eye, EyeOff, Filter, ZoomIn, ZoomOut
} from 'lucide-react';
import type { Field } from '@/shared/types';
import { fieldData, weatherStations } from '@/shared/utils/mocks';

const layerOptions = [
  { id: 'satellite', label: 'Satellite Imagery', icon: Satellite, active: true },
  { id: 'ndvi', label: 'NDVI Health Map', icon: Layers, active: true },
  { id: 'soil-moisture', label: 'Soil Moisture', icon: Droplets, active: false },
  { id: 'temperature', label: 'Temperature', icon: Thermometer, active: false },
  { id: 'wind', label: 'Wind Patterns', icon: Wind, active: false },
  { id: 'alerts', label: 'Alert Zones', icon: AlertTriangle, active: true },
];

export function FieldMap() {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [layers, setLayers] = useState(layerOptions);
  const [mapView, setMapView] = useState('satellite'); // satellite, ndvi, thermal

  const toggleLayer = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, active: !layer.active } : layer
    ));
  };

  const getHealthColor = (health) => {
    if (health >= 90) return '#16a34a';
    if (health >= 80) return '#eab308';
    if (health >= 70) return '#ea580c';
    return '#dc2626';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Field Management Map</h1>
          <p className="text-muted-foreground">Interactive field monitoring with real-time data overlays</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label>Map View:</Label>
            <select 
              value={mapView} 
              onChange={(e) => setMapView(e.target.value)}
              className="px-3 py-1 rounded border bg-background"
            >
              <option value="satellite">Satellite</option>
              <option value="ndvi">NDVI</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Field Overview Map</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-green-50 dark:bg-green-950 rounded-lg border overflow-hidden">
                {/* Background Map */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                  {/* Grid lines for reference */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Field Polygons */}
                {fieldData.map((field) => (
                  <div
                    key={field.id}
                    className="absolute cursor-pointer transition-all hover:ring-2 hover:ring-blue-400"
                    style={{
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      width: `${field.width}%`,
                      height: `${field.height}%`,
                      backgroundColor: mapView === 'ndvi' ? getHealthColor(field.health) : field.color,
                      opacity: 0.7,
                      border: '2px solid white',
                      borderRadius: '4px'
                    }}
                    onClick={() => setSelectedField(field)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                      {field.id}
                    </div>
                    {field.alerts > 0 && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{field.alerts}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Weather Stations */}
                {layers.find(l => l.id === 'temperature')?.active && weatherStations.map((station) => (
                  <div
                    key={station.id}
                    className="absolute"
                    style={{ left: `${station.x}%`, top: `${station.y}%` }}
                  >
                    <div className="relative">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-1 rounded shadow text-xs whitespace-nowrap">
                        {station.temperature}°F
                      </div>
                    </div>
                  </div>
                ))}

                {/* Alert Zones */}
                {layers.find(l => l.id === 'alerts')?.active && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900 p-2 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">3 Active Alerts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Legend */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-agro-green rounded"></div>
                    <span className="text-sm">Excellent (90-100%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-agro-yellow rounded"></div>
                    <span className="text-sm">Good (80-89%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-agro-orange rounded"></div>
                    <span className="text-sm">Fair (70-79%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-agro-red rounded"></div>
                    <span className="text-sm">Poor (&lt;70%)</span>
                  </div>
                </div>
                <Badge variant="outline">
                  Total Area: {fieldData.reduce((sum, field) => sum + field.area, 0)} hectares
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Layer Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Map Layers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <Label className="text-sm">{layer.label}</Label>
                    </div>
                    <Switch
                      checked={layer.active}
                      onCheckedChange={() => toggleLayer(layer.id)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Field Details */}
          {selectedField && (
            <Card>
              <CardHeader>
                <CardTitle>Field Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{selectedField.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedField.id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Area:</span>
                    <p>{selectedField.area} ha</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crop:</span>
                    <p>{selectedField.crop}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Health:</span>
                    <p className="flex items-center">
                      {selectedField.health}%
                      <div 
                        className="w-2 h-2 rounded-full ml-2"
                        style={{ backgroundColor: getHealthColor(selectedField.health) }}
                      ></div>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alerts:</span>
                    <p>{selectedField.alerts}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button size="sm" className="w-full">
                    View Field Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Fields:</span>
                <span className="font-semibold">{fieldData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Health:</span>
                <span className="font-semibold">
                  {Math.round(fieldData.reduce((sum, field) => sum + field.health, 0) / fieldData.length)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Alerts:</span>
                <span className="font-semibold text-red-600">
                  {fieldData.reduce((sum, field) => sum + field.alerts, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Weather Stations:</span>
                <span className="font-semibold">{weatherStations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}