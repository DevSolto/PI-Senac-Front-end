import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeatherMetric } from '@/shared/types';
import { weatherForecastData } from '@/shared/utils/mocks';

export function AgriWeatherAI() {
  const forecastData: WeatherMetric[] = weatherForecastData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AgriWeather AI</h1>
        <p className="text-muted-foreground">AI-powered weather forecasting and agricultural recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-agro-orange" />
              <span>Temperature</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74°F</div>
            <p className="text-sm text-muted-foreground">High: 78°F | Low: 69°F</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudRain className="w-5 h-5 text-agro-blue" />
              <span>Precipitation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.3"</div>
            <p className="text-sm text-muted-foreground">Expected today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-agro-blue" />
              <span>Humidity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-sm text-muted-foreground">Optimal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-muted-foreground" />
              <span>Wind Speed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 mph</div>
            <p className="text-sm text-muted-foreground">SW direction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ea580c" name="Temperature (°F)" />
              <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}