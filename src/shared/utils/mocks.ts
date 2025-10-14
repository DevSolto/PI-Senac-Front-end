import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Droplets,
  Sprout,
  Thermometer,
  Tractor,
  TrendingUp,
  Satellite,
} from 'lucide-react';

import type {
  Alert,
  CropHealthMetric,
  Field,
  FieldStatusMetric,
  FinanceData,
  KeyMetric,
  QuickStat,
  WeatherMetric,
  WeatherStation,
  YieldForecast,
} from '@/shared/types';

export const fieldData: Field[] = [
  { id: 'F001', name: 'North Corn Field', area: 125, crop: 'Corn', health: 92, alerts: 0, x: 20, y: 15, width: 30, height: 20, color: '#16a34a' },
  { id: 'F002', name: 'South Soybean', area: 89, crop: 'Soybeans', health: 87, alerts: 1, x: 55, y: 25, width: 25, height: 25, color: '#eab308' },
  { id: 'F003', name: 'East Wheat Block', area: 156, crop: 'Wheat', health: 78, alerts: 2, x: 15, y: 50, width: 35, height: 18, color: '#ea580c' },
  { id: 'F004', name: 'West Cotton', area: 67, crop: 'Cotton', health: 95, alerts: 0, x: 60, y: 55, width: 22, height: 15, color: '#16a34a' },
  { id: 'F005', name: 'Central Research', area: 43, crop: 'Mixed', health: 89, alerts: 1, x: 40, y: 35, width: 15, height: 12, color: '#3b82f6' },
];

export const weatherStations: WeatherStation[] = [
  { id: 'WS001', name: 'North Station', x: 25, y: 20, temperature: 74, humidity: 68 },
  { id: 'WS002', name: 'South Station', x: 70, y: 65, temperature: 76, humidity: 72 },
  { id: 'WS003', name: 'Central Station', x: 45, y: 40, temperature: 75, humidity: 70 },
];

export const cropHealthData: CropHealthMetric[] = [
  { label: 'Week 1', healthy: 85, moderate: 12, critical: 3 },
  { label: 'Week 2', healthy: 88, moderate: 10, critical: 2 },
  { label: 'Week 3', healthy: 82, moderate: 15, critical: 3 },
  { label: 'Week 4', healthy: 90, moderate: 8, critical: 2 },
  { label: 'Week 5', healthy: 87, moderate: 11, critical: 2 },
  { label: 'Week 6', healthy: 92, moderate: 6, critical: 2 },
];

export const yieldForecastData: YieldForecast[] = [
  { label: 'Corn', current: 8500, forecast: 9200, target: 9000 },
  { label: 'Soybeans', current: 3200, forecast: 3450, target: 3300 },
  { label: 'Wheat', current: 4800, forecast: 5100, target: 5000 },
  { label: 'Cotton', current: 1200, forecast: 1350, target: 1300 },
];

export const fieldStatusData: FieldStatusMetric[] = [
  { label: 'Excellent', value: 45, color: '#16a34a' },
  { label: 'Good', value: 32, color: '#eab308' },
  { label: 'Fair', value: 18, color: '#ea580c' },
  { label: 'Poor', value: 5, color: '#dc2626' },
];

export const overviewWeatherData: WeatherMetric[] = [
  { label: 'Mon', temperature: 72, humidity: 65, precipitation: 0 },
  { label: 'Tue', temperature: 75, humidity: 70, precipitation: 0.2 },
  { label: 'Wed', temperature: 73, humidity: 68, precipitation: 0 },
  { label: 'Thu', temperature: 78, humidity: 72, precipitation: 0.1 },
  { label: 'Fri', temperature: 76, humidity: 69, precipitation: 0 },
  { label: 'Sat', temperature: 74, humidity: 66, precipitation: 0.3 },
  { label: 'Sun', temperature: 77, humidity: 71, precipitation: 0 },
];

export const weatherForecastData: WeatherMetric[] = [
  { label: 'Mon', temperature: 74, precipitation: 0, humidity: 65, wind: 8 },
  { label: 'Tue', temperature: 76, precipitation: 0.2, humidity: 70, wind: 12 },
  { label: 'Wed', temperature: 73, precipitation: 0, humidity: 68, wind: 6 },
  { label: 'Thu', temperature: 78, precipitation: 0.1, humidity: 72, wind: 10 },
  { label: 'Fri', temperature: 77, precipitation: 0, humidity: 69, wind: 8 },
  { label: 'Sat', temperature: 75, precipitation: 0.3, humidity: 74, wind: 14 },
  { label: 'Sun', temperature: 79, precipitation: 0, humidity: 66, wind: 7 },
];

export const keyMetrics: KeyMetric[] = [
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

export const quickStats: QuickStat[] = [
  { icon: Tractor, iconClassName: 'text-agro-orange', value: '24', label: 'Active Machines' },
  { icon: Satellite, iconClassName: 'text-agro-blue', value: '8', label: 'Drones Deployed' },
  { icon: Thermometer, iconClassName: 'text-agro-red', value: '74°F', label: 'Avg Temperature' },
  { icon: DollarSign, iconClassName: 'text-agro-green', value: '$2.4M', label: 'Projected Revenue' },
];

export const recentAlerts: Alert[] = [
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

export const revenueData: FinanceData[] = [
  { crop: 'Corn', revenue: 850000, cost: 520000, profit: 330000 },
  { crop: 'Soybeans', revenue: 620000, cost: 380000, profit: 240000 },
  { crop: 'Wheat', revenue: 420000, cost: 290000, profit: 130000 },
  { crop: 'Cotton', revenue: 380000, cost: 250000, profit: 130000 },
];
