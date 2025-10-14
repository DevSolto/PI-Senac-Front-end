import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Droplets,
  Satellite,
  Sprout,
  Thermometer,
  Tractor,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { AlertsSummary } from '../components/AlertsSummary';
import type { OverviewAlert } from '../components/AlertsSummary';
import { OverviewChart } from '../components/OverviewChart';
import { OverviewStats } from '../components/OverviewStats';
import type { KeyMetric, QuickStat } from '../components/OverviewStats';

const cropHealthData = [
  { name: 'Week 1', healthy: 85, moderate: 12, critical: 3 },
  { name: 'Week 2', healthy: 88, moderate: 10, critical: 2 },
  { name: 'Week 3', healthy: 82, moderate: 15, critical: 3 },
  { name: 'Week 4', healthy: 90, moderate: 8, critical: 2 },
  { name: 'Week 5', healthy: 87, moderate: 11, critical: 2 },
  { name: 'Week 6', healthy: 92, moderate: 6, critical: 2 },
];

const yieldForecastData = [
  { name: 'Corn', current: 8500, forecast: 9200, target: 9000 },
  { name: 'Soybeans', current: 3200, forecast: 3450, target: 3300 },
  { name: 'Wheat', current: 4800, forecast: 5100, target: 5000 },
  { name: 'Cotton', current: 1200, forecast: 1350, target: 1300 },
];

const fieldStatusData = [
  { name: 'Excellent', value: 45, color: '#16a34a' },
  { name: 'Good', value: 32, color: '#eab308' },
  { name: 'Fair', value: 18, color: '#ea580c' },
  { name: 'Poor', value: 5, color: '#dc2626' },
];

const weatherData = [
  { name: 'Mon', temp: 72, humidity: 65, precipitation: 0 },
  { name: 'Tue', temp: 75, humidity: 70, precipitation: 0.2 },
  { name: 'Wed', temp: 73, humidity: 68, precipitation: 0 },
  { name: 'Thu', temp: 78, humidity: 72, precipitation: 0.1 },
  { name: 'Fri', temp: 76, humidity: 69, precipitation: 0 },
  { name: 'Sat', temp: 74, humidity: 66, precipitation: 0.3 },
  { name: 'Sun', temp: 77, humidity: 71, precipitation: 0 },
];

const keyMetrics: KeyMetric[] = [
  {
    title: 'Total Hectares',
    value: '12,847',
    icon: Sprout,
    iconClassName: 'text-agro-green',
    trend: {
      icon: TrendingUp,
      label: '+2.1% from last season',
      className: 'text-agro-green',
    },
  },
  {
    title: 'Crop Health Score',
    value: '92%',
    icon: CheckCircle2,
    iconClassName: 'text-agro-green',
    progress: 92,
    description: 'Excellent conditions',
    descriptionClassName: 'text-agro-green',
  },
  {
    title: 'Forecasted Yield',
    value: '18,200',
    icon: TrendingUp,
    iconClassName: 'text-agro-blue',
    description: 'tons estimated',
    descriptionClassName: 'text-agro-blue',
    trend: {
      label: '+8.3% vs target',
      className: 'text-agro-green',
    },
  },
  {
    title: 'Active Alerts',
    value: '7',
    icon: AlertTriangle,
    iconClassName: 'text-agro-orange',
    badges: [
      { label: '3 Critical', variant: 'destructive', className: 'text-xs' },
      { label: '4 Warning', variant: 'secondary', className: 'text-xs' },
    ],
  },
];

const quickStats: QuickStat[] = [
  { icon: Tractor, iconClassName: 'text-agro-orange', value: '24', label: 'Active Machines' },
  { icon: Satellite, iconClassName: 'text-agro-blue', value: '8', label: 'Drones Deployed' },
  { icon: Thermometer, iconClassName: 'text-agro-red', value: '74°F', label: 'Avg Temperature' },
  { icon: DollarSign, iconClassName: 'text-agro-green', value: '$2.4M', label: 'Projected Revenue' },
];

const recentAlerts: OverviewAlert[] = [
  {
    id: 'alert-1',
    icon: AlertTriangle,
    title: 'Pest Detection Alert',
    location: 'Field Sector 7A',
    description: 'Corn borer larvae detected. Immediate intervention recommended.',
    timestamp: '15 min ago',
    severity: 'critical',
    badgeLabel: 'Critical',
  },
  {
    id: 'alert-2',
    icon: Droplets,
    title: 'Irrigation Recommendation',
    location: 'Fields 12B, 14C',
    description: 'Soil moisture below optimal levels. Schedule irrigation within 24 hours.',
    timestamp: '2 hours ago',
    severity: 'warning',
    badgeLabel: 'Warning',
  },
  {
    id: 'alert-3',
    icon: CheckCircle2,
    title: 'Harvest Window Optimal',
    location: 'Soybean Fields 8A-8D',
    description: 'Weather conditions ideal for harvest. Begin operations within 3-day window.',
    timestamp: '4 hours ago',
    severity: 'info',
    badgeLabel: 'Info',
  },
];

export const OverviewPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agricultural Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring and insights for your agricultural operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-agro-light-green text-agro-green">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated: 2 min ago
          </Badge>
        </div>
      </div>

      <OverviewStats keyMetrics={keyMetrics} quickStats={quickStats} />
      <OverviewChart
        cropHealthData={cropHealthData}
        fieldStatusData={fieldStatusData}
        yieldForecastData={yieldForecastData}
        weatherData={weatherData}
      />
      <AlertsSummary alerts={recentAlerts} />
    </div>
  );
};
