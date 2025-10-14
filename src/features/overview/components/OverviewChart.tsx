import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CropHealthData {
  name: string;
  healthy: number;
  moderate: number;
  critical: number;
}

interface FieldStatusData {
  name: string;
  value: number;
  color: string;
}

interface YieldForecastData {
  name: string;
  current: number;
  forecast: number;
  target: number;
}

interface WeatherData {
  name: string;
  temp: number;
  humidity: number;
  precipitation: number;
}

interface OverviewChartProps {
  cropHealthData: CropHealthData[];
  fieldStatusData: FieldStatusData[];
  yieldForecastData: YieldForecastData[];
  weatherData: WeatherData[];
}

export const OverviewChart = ({
  cropHealthData,
  fieldStatusData,
  yieldForecastData,
  weatherData,
}: OverviewChartProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crop Health Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly health assessment across all fields</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cropHealthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="healthy" stackId="1" stroke="#16a34a" fill="#16a34a" />
                <Area type="monotone" dataKey="moderate" stackId="1" stroke="#eab308" fill="#eab308" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Current status across all monitored fields</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fieldStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {fieldStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Yield Forecast by Crop</CardTitle>
            <p className="text-sm text-muted-foreground">Current vs forecasted yield (tons per hectare)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yieldForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#ea580c" name="Current" />
                <Bar dataKey="forecast" fill="#16a34a" name="Forecast" />
                <Bar dataKey="target" fill="#eab308" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-Day Weather Forecast</CardTitle>
            <p className="text-sm text-muted-foreground">Temperature and precipitation outlook</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  stroke="#ea580c"
                  strokeWidth={2}
                  name="Temperature (°F)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Humidity (%)"
                />
                <Bar yAxisId="right" dataKey="precipitation" fill="#16a34a" name="Precipitation (in)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
