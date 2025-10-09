import { apiClient } from "@/lib/api/client";

import { getDeviceHistory } from "./get-device-history";
import type { GetDeviceHistoryOptions } from "./get-device-history";
import { normalizeCriticalAlert, type ApiCriticalAlert } from "../transformers/alerts";
import { buildDeviceHistoryDatasets, computeMonthlyAlertTotals } from "../transformers/history";
import type {
  DashboardMetric,
  DashboardMetrics,
  DashboardOverview,
  GatewayStatus,
  MetricTrend,
  MetricTrendDirection,
  MonthlyAlertBreakdown,
  SensorsStatus,
} from "../types";

interface ApiMetricTrend {
  direction?: string;
  value?: number;
  value_type?: string;
  valueType?: string;
  compared_to?: string;
  comparedTo?: string;
}

interface ApiMetric {
  label?: string;
  value?: number | string;
  unit?: string | null;
  trend?: ApiMetricTrend;
  description?: string | null;
}

interface ApiFarm {
  id?: string;
  name?: string;
  location?: string;
  harvest_season?: string;
  harvestSeason?: string;
  manager?: string;
  last_sync?: string;
  lastSync?: string;
  timezone?: string;
}

interface ApiSensorStatus {
  total_sensors?: number;
  totalSensors?: number;
  online?: number;
  offline?: number;
  maintenance?: number;
  battery_critical?: number;
  batteryCritical?: number;
  average_signal_quality?: number;
  averageSignalQuality?: number;
  gateway_status?: GatewayStatus;
  gatewayStatus?: GatewayStatus;
}

interface ApiMonthlyAlertBreakdown {
  month?: string;
  total?: number;
  critical?: number;
  warning?: number;
  resolved?: number;
}

interface ApiDashboardOverviewResponse {
  farm?: ApiFarm;
  sensors_status?: SensorsStatus;
  sensorsStatus?: SensorsStatus;
  sensor_status?: ApiSensorStatus;
  sensorStatus?: ApiSensorStatus;
  metrics?: {
    active_alerts?: ApiMetric;
    activeAlerts?: ApiMetric;
    silos_ok_percentage?: ApiMetric;
    silosOkPercentage?: ApiMetric;
    average_temperature?: ApiMetric;
    averageTemperature?: ApiMetric;
  };
  critical_alerts?: ApiCriticalAlert[];
  criticalAlerts?: ApiCriticalAlert[];
  monthly_alert_breakdown?: ApiMonthlyAlertBreakdown[];
  monthlyAlertBreakdown?: ApiMonthlyAlertBreakdown[];
}

export interface GetDashboardOverviewOptions extends GetDeviceHistoryOptions {
  client?: typeof apiClient;
}

const mapMetricTrendDirection = (direction?: string): MetricTrendDirection => {
  if (direction === "up" || direction === "down" || direction === "stable") {
    return direction;
  }

  return "stable";
};

const normalizeMetricTrend = (trend: ApiMetricTrend | undefined): MetricTrend => {
  return {
    direction: mapMetricTrendDirection(trend?.direction),
    value: typeof trend?.value === "number" ? trend.value : Number(trend?.value ?? 0),
    valueType: (trend?.value_type ?? trend?.valueType) === "percentage" ? "percentage" : "absolute",
    comparedTo: trend?.compared_to ?? trend?.comparedTo ?? "período anterior",
  } satisfies MetricTrend;
};

const normalizeMetric = (metric: ApiMetric | undefined, fallback: DashboardMetric): DashboardMetric => {
  return {
    ...fallback,
    label: metric?.label ?? fallback.label,
    value: metric?.value !== undefined ? Number(metric.value) : fallback.value,
    unit: metric?.unit ?? fallback.unit,
    trend: normalizeMetricTrend(metric?.trend ?? fallback.trend),
    description: metric?.description ?? fallback.description,
  } satisfies DashboardMetric;
};

const normalizeMonthlyAlertBreakdown = (entry: ApiMonthlyAlertBreakdown): MonthlyAlertBreakdown => {
  return {
    month: entry.month ?? "",
    total: entry.total ?? 0,
    critical: entry.critical ?? 0,
    warning: entry.warning ?? 0,
    resolved: entry.resolved ?? 0,
  } satisfies MonthlyAlertBreakdown;
};

const defaultMetrics: DashboardMetrics = {
  activeAlerts: {
    label: "Alertas ativos",
    value: 0,
    trend: {
      direction: "stable",
      value: 0,
      valueType: "absolute",
      comparedTo: "período anterior",
    },
  },
  silosOkPercentage: {
    label: "% Silos OK",
    value: 0,
    unit: "%",
    trend: {
      direction: "stable",
      value: 0,
      valueType: "absolute",
      comparedTo: "período anterior",
    },
  },
  averageTemperature: {
    label: "Temperatura média (24h)",
    value: 0,
    unit: "°C",
    trend: {
      direction: "stable",
      value: 0,
      valueType: "absolute",
      comparedTo: "período anterior",
    },
  },
};

const computeAverageTemperatureFromHistory = (historyAverage?: number): DashboardMetric => {
  const value = historyAverage ?? 0;

  return {
    ...defaultMetrics.averageTemperature,
    value: Number.isFinite(value) ? Number(value.toFixed(1)) : 0,
  } satisfies DashboardMetric;
};

const computeAverageFromHistory = (history: Awaited<ReturnType<typeof getDeviceHistory>>): number | undefined => {
  if (!history.entries.length) {
    return undefined;
  }

  const temperatures = history.entries
    .map((entry) => entry.metrics.temperature ?? entry.metrics.temp ?? entry.metrics.Temperature)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (!temperatures.length) {
    return undefined;
  }

  const sum = temperatures.reduce((total, value) => total + value, 0);
  return sum / temperatures.length;
};

const normalizeDashboardOverview = (
  response: ApiDashboardOverviewResponse | undefined,
  history: Awaited<ReturnType<typeof getDeviceHistory>>,
): DashboardOverview => {
  const metricsResponse = response?.metrics ?? {};
  const historyAverageTemperature = computeAverageFromHistory(history);
  const averageTemperatureMetric = metricsResponse.average_temperature ?? metricsResponse.averageTemperature;

  const farm = response?.farm ?? {};
  const sensorStatus = response?.sensor_status ?? response?.sensorStatus ?? {};
  const criticalAlerts = response?.critical_alerts ?? response?.criticalAlerts ?? [];
  const monthlyAlertBreakdown = response?.monthly_alert_breakdown ?? response?.monthlyAlertBreakdown ?? [];
  const normalizedMonthlyAlertBreakdown = monthlyAlertBreakdown.map(normalizeMonthlyAlertBreakdown);
  const historyDatasets = buildDeviceHistoryDatasets(history);
  const monthlyAlertTotals = computeMonthlyAlertTotals(normalizedMonthlyAlertBreakdown);

  return {
    farm: {
      id: farm.id ?? "",
      name: farm.name ?? "",
      location: farm.location ?? "",
      harvestSeason: farm.harvestSeason ?? farm.harvest_season ?? "",
      manager: farm.manager ?? "",
      lastSync: farm.lastSync ?? farm.last_sync ?? new Date().toISOString(),
      timezone: farm.timezone ?? "UTC",
    },
    sensorsStatus: response?.sensorsStatus ?? response?.sensors_status ?? "OK",
    sensorStatus: {
      totalSensors: sensorStatus.totalSensors ?? sensorStatus.total_sensors ?? 0,
      online: sensorStatus.online ?? 0,
      offline: sensorStatus.offline ?? 0,
      maintenance: sensorStatus.maintenance ?? 0,
      batteryCritical: sensorStatus.batteryCritical ?? sensorStatus.battery_critical ?? 0,
      averageSignalQuality: sensorStatus.averageSignalQuality ?? sensorStatus.average_signal_quality ?? 0,
      gatewayStatus: sensorStatus.gatewayStatus ?? sensorStatus.gateway_status ?? "online",
    },
    metrics: {
      activeAlerts: normalizeMetric(metricsResponse.activeAlerts ?? metricsResponse.active_alerts, defaultMetrics.activeAlerts),
      silosOkPercentage: normalizeMetric(
        metricsResponse.silosOkPercentage ?? metricsResponse.silos_ok_percentage,
        defaultMetrics.silosOkPercentage,
      ),
      averageTemperature: averageTemperatureMetric
        ? normalizeMetric(averageTemperatureMetric, defaultMetrics.averageTemperature)
        : computeAverageTemperatureFromHistory(historyAverageTemperature),
    },
    criticalAlerts: criticalAlerts.map(normalizeCriticalAlert),
    monthlyAlertBreakdown: normalizedMonthlyAlertBreakdown,
    monthlyAlertTotals,
    historyDatasets,
  } satisfies DashboardOverview;
};

export const getDashboardOverview = async (
  deviceId: string,
  { client = apiClient, ...historyOptions }: GetDashboardOverviewOptions = {},
): Promise<DashboardOverview> => {
  const [{ data }, history] = await Promise.all([
    client.get<ApiDashboardOverviewResponse>(`/devices/${deviceId}/overview`),
    getDeviceHistory(deviceId, { client, ...historyOptions }),
  ]);

  return normalizeDashboardOverview(data, history);
};
