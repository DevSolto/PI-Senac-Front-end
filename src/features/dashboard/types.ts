import type { TimeSeriesDataPoint } from "@/lib/charts/types";

export type MetricTrendDirection = "up" | "down" | "stable";

export interface MetricTrend {
  direction: MetricTrendDirection;
  value: number;
  valueType: "percentage" | "absolute";
  comparedTo: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
  unit?: string;
  trend: MetricTrend;
  description?: string;
}

export interface DashboardMetrics {
  activeAlerts: DashboardMetric;
  silosOkPercentage: DashboardMetric;
  averageTemperature: DashboardMetric;
}

export type CriticalAlertStatus = "active" | "acknowledged" | "resolved";

export interface CriticalAlert {
  id: string;
  siloName: string;
  alertType: string;
  severity: "critical" | "warning";
  detectedAt: string;
  durationMinutes: number;
  status: CriticalAlertStatus;
  description: string;
  recommendedAction: string;
}

export interface MonthlyAlertBreakdown {
  month: string;
  total: number;
  critical: number;
  warning: number;
  resolved: number;
}

export interface MonthlyAlertTotals {
  total: number;
  critical: number;
  warning: number;
  resolved: number;
}

export interface DeviceHistoryDatasets {
  temperature: TimeSeriesDataPoint[];
  humidity: TimeSeriesDataPoint[];
  co2: TimeSeriesDataPoint[];
}

export type GatewayStatus = "online" | "degraded" | "offline";

export type SensorsStatus = "OK" | "ISSUE";

export interface DashboardOverview {
  farm: {
    id: string;
    name: string;
    location: string;
    harvestSeason: string;
    manager: string;
    lastSync: string;
    timezone: string;
  };
  sensorsStatus: SensorsStatus;
  sensorStatus: {
    totalSensors: number;
    online: number;
    offline: number;
    maintenance: number;
    batteryCritical: number;
    averageSignalQuality: number;
    gatewayStatus: GatewayStatus;
  };
  metrics: DashboardMetrics;
  criticalAlerts: CriticalAlert[];
  monthlyAlertBreakdown: MonthlyAlertBreakdown[];
  monthlyAlertTotals: MonthlyAlertTotals;
  historyDatasets: DeviceHistoryDatasets;
}

export type DeviceHistoryMetrics = Record<string, number | null>;

export interface DeviceHistoryEntry {
  timestamp: string;
  metrics: DeviceHistoryMetrics;
}

export interface DeviceHistory {
  deviceId: string;
  entries: DeviceHistoryEntry[];
}

export interface DashboardOverviewService {
  getOverview(deviceId: string): Promise<DashboardOverview>;
}
