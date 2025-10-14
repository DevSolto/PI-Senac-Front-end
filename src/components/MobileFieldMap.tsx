import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Map, Layers, MapPin, Satellite, Droplets, Thermometer,
  Wind, AlertTriangle, Eye, Filter, ZoomIn, ZoomOut, Settings
} from 'lucide-react';
import { cn } from './ui/utils';

const fieldData = [
  { id: 'F001', name: 'North Corn Field', area: 125, crop: 'Corn', health: 92, alerts: 0, x: 20, y: 15, width: 30, height: 20, color: '#16a34a' },
  { id: 'F002', name: 'South Soybean', area: 89, crop: 'Soybean', health: 87, alerts: 1, x: 55, y: 25, width: 25, height: 25, color: '#eab308' },
  { id: 'F003', name: 'East Wheat Field', area: 156, crop: 'Wheat', health: 78, alerts: 2, x: 15, y: 50, width: 35, height: 18, color: '#ea580c' },
  { id: 'F004', name: 'West Cotton Field', area: 67, crop: 'Cotton', health: 95, alerts: 0, x: 60, y: 55, width: 22, height: 15, color: '#16a34a' },
];

const layerOptions = [
  { id: 'satellite', label: 'Satellite imagery', icon: Satellite, active: true },
  { id: 'ndvi', label: 'NDVI map', icon: Layers, active: true },
  { id: 'soil-moisture', label: 'Soil moisture', icon: Droplets, active: false },
  { id: 'temperature', label: 'Temperature', icon: Thermometer, active: false },
  { id: 'alerts', label: 'Alert zones', icon: AlertTriangle, active: true },
];

export function MobileFieldMap() {
  const [selectedField, setSelectedField] = useState(null);
  const [layers, setLayers] = useState(layerOptions);
  const [showLayers, setShowLayers] = useState(false);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold">Field Map</h1>
        <p className="text-sm text-muted-foreground">Interactive map with real-time data</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
        >
          <Layers className="w-4 h-4 mr-2" />
          Layers
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Layer Controls */}
      {showLayers && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Map Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full h-80 bg-green-50 dark:bg-green-950 rounded-lg overflow-hidden">
            {/* Background Map */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
              {/* Grid lines for reference */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="mobile-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mobile-grid)" />
              </svg>
            </div>

            {/* Field Polygons */}
            {fieldData.map((field) => (
              <div
                key={field.id}
                className="absolute cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 active:scale-95"
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`,
                  backgroundColor: getHealthColor(field.health),
                  opacity: 0.8,
                  border: '2px solid white',
                  borderRadius: '6px'
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

            {/* Alert indicator */}
            {layers.find(l => l.id === 'alerts')?.active && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900 p-2 rounded text-xs">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>3 alerts</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fields ({fieldData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fieldData.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedField?.id === field.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                )}
                onClick={() => setSelectedField(field)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: getHealthColor(field.health) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{field.name}</p>
                    <p className="text-xs text-muted-foreground">{field.crop} • {field.area} acres</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={field.health >= 90 ? 'default' : field.health >= 80 ? 'secondary' : 'destructive'} className="text-xs">
                    {field.health}%
                  </Badge>
                  {field.alerts > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {field.alerts}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Details */}
      {selectedField && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Field Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold">{selectedField.name}</h3>
              <p className="text-sm text-muted-foreground">ID: {selectedField.id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 p-2 rounded">
                <span className="text-muted-foreground block">Area</span>
                <p className="font-semibold">{selectedField.area} acres</p>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="text-muted-foreground block">Crop</span>
                <p className="font-semibold">{selectedField.crop}</p>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="text-muted-foreground block">Health</span>
                <p className="font-semibold flex items-center">
                  {selectedField.health}%
                  <div 
                    className="w-2 h-2 rounded-full ml-2"
                    style={{ backgroundColor: getHealthColor(selectedField.health) }}
                  ></div>
                </p>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <span className="text-muted-foreground block">Alerts</span>
                <p className="font-semibold">{selectedField.alerts}</p>
              </div>
            </div>

            <Button size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Detailed information
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-lg font-bold">{fieldData.length}</p>
              <p className="text-muted-foreground">Fields</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(fieldData.reduce((sum, field) => sum + field.health, 0) / fieldData.length)}%
              </p>
              <p className="text-muted-foreground">Avg health</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">
                {fieldData.reduce((sum, field) => sum + field.alerts, 0)}
              </p>
              <p className="text-muted-foreground">Alerts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {fieldData.reduce((sum, field) => sum + field.area, 0)}
              </p>
              <p className="text-muted-foreground">Acres</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}