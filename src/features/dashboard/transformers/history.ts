import type { TimeSeriesDataPoint } from "@/lib/charts/types";

import type {
  DeviceHistory,
  DeviceHistoryEntry,
  DeviceHistoryMetrics,
  MonthlyAlertBreakdown,
  MonthlyAlertTotals,
} from "../types";

const TEMPERATURE_KEYS = ["temperature", "temp", "Temperature", "temp_c", "tempC"] as const;
const HUMIDITY_KEYS = ["humidity", "hum", "Humidity", "relativeHumidity", "rh"] as const;
const CO2_KEYS = ["co2", "CO2", "carbon_dioxide", "carbonDioxide", "co2_ppm", "co2ppm"] as const;

type MetricKeyList = readonly string[];

const sanitizeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return fallback;
};

const resolveMetricValue = (metrics: DeviceHistoryMetrics, keys: MetricKeyList): number | null => {
  for (const key of keys) {
    if (!(key in metrics)) {
      continue;
    }

    const value = metrics[key];
    if (value === null || value === undefined) {
      continue;
    }

    const numericValue = sanitizeNumber(value, Number.NaN);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
};

const toTimeSeriesPoint = (
  entry: DeviceHistoryEntry,
  keys: MetricKeyList,
): TimeSeriesDataPoint | null => {
  const timestamp = new Date(entry.timestamp);
  const value = resolveMetricValue(entry.metrics, keys);

  if (!Number.isFinite(timestamp.valueOf()) || value === null) {
    return null;
  }

  return {
    timestamp: timestamp.toISOString(),
    value,
  } satisfies TimeSeriesDataPoint;
};

const sortByTimestamp = <T extends { timestamp: string }>(data: T[]): T[] => {
  return [...data].sort((a, b) => new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf());
};

const createSeries = (history: DeviceHistory, keys: MetricKeyList): TimeSeriesDataPoint[] => {
  const series = history.entries
    .map((entry) => toTimeSeriesPoint(entry, keys))
    .filter((point): point is TimeSeriesDataPoint => point !== null);

  return sortByTimestamp(series);
};

export const buildDeviceHistoryDatasets = (
  history: DeviceHistory,
): {
  temperature: TimeSeriesDataPoint[];
  humidity: TimeSeriesDataPoint[];
  co2: TimeSeriesDataPoint[];
} => ({
  temperature: createSeries(history, TEMPERATURE_KEYS),
  humidity: createSeries(history, HUMIDITY_KEYS),
  co2: createSeries(history, CO2_KEYS),
});

const accumulateAlertTotals = (
  accumulator: MonthlyAlertTotals,
  breakdown: MonthlyAlertBreakdown,
): MonthlyAlertTotals => {
  const critical = sanitizeNumber(breakdown.critical);
  const warning = sanitizeNumber(breakdown.warning);
  const resolved = sanitizeNumber(breakdown.resolved);
  const declaredTotal = sanitizeNumber(breakdown.total, critical + warning + resolved);

  return {
    total: accumulator.total + declaredTotal,
    critical: accumulator.critical + critical,
    warning: accumulator.warning + warning,
    resolved: accumulator.resolved + resolved,
  } satisfies MonthlyAlertTotals;
};

export const computeMonthlyAlertTotals = (
  breakdown: MonthlyAlertBreakdown[],
): MonthlyAlertTotals => {
  return breakdown.reduce<MonthlyAlertTotals>(
    (accumulator, entry) => accumulateAlertTotals(accumulator, entry),
    { total: 0, critical: 0, warning: 0, resolved: 0 },
  );
};

export const createDashboardVisualizations = (
  history: DeviceHistory,
  breakdown: MonthlyAlertBreakdown[],
): {
  datasets: {
    temperature: TimeSeriesDataPoint[];
    humidity: TimeSeriesDataPoint[];
    co2: TimeSeriesDataPoint[];
  };
  totals: MonthlyAlertTotals;
} => {
  const datasets = buildDeviceHistoryDatasets(history);
  const totals = computeMonthlyAlertTotals(breakdown);

  return { datasets, totals };
};
