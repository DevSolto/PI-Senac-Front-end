import type { LucideIcon } from 'lucide-react';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Field {
  id: string;
  name: string;
  area: number;
  crop: string;
  health: number;
  alerts: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface WeatherMetric {
  label: string;
  temperature: number;
  humidity: number;
  precipitation?: number;
  wind?: number;
}

export interface WeatherStation {
  id: string;
  name: string;
  x: number;
  y: number;
  temperature: number;
  humidity: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: AlertSeverity;
  icon?: LucideIcon;
  location?: string;
  badgeLabel?: string;
}

export interface FinanceData {
  crop: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface CropHealthMetric {
  label: string;
  healthy: number;
  moderate: number;
  critical: number;
}

export interface FieldStatusMetric {
  label: string;
  value: number;
  color: string;
}

export interface YieldForecast {
  label: string;
  current: number;
  forecast: number;
  target: number;
}

export interface TrendInfo {
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface KeyMetricBadge {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export interface KeyMetric {
  title: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: TrendInfo;
  progress?: number;
  description?: string;
  descriptionClassName?: string;
  badges?: KeyMetricBadge[];
}

export interface QuickStat {
  icon: LucideIcon;
  iconClassName?: string;
  value: string;
  label: string;
}
