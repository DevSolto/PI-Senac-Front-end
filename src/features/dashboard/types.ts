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
}
