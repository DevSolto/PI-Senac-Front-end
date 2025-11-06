import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { DataProcessRecord } from './api';
import { formatDateRange } from './date';

export interface DashboardDateRangeFilter {
  from: Date | null;
  to: Date | null;
}

export interface DashboardFilters {
  dateRange: DashboardDateRangeFilter;
  silos: string[];
}

export interface DashboardKpi {
  id: string;
  title: string;
  unit?: string;
  value: number | null;
  previousValue: number | null;
  change: number | null;
  decimals: number;
  invertTrend?: boolean;
}

export interface TemperatureSeriesPoint {
  timestamp: Date;
  label: string;
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface HumiditySeriesPoint {
  timestamp: Date;
  label: string;
  average: number | null;
  min: number | null;
  max: number | null;
  percentOverLimit: number | null;
}

export interface AlertsBySiloPoint {
  siloKey: string;
  siloName: string;
  total: number;
  critical: number;
}

export interface DistributionPoint {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface DistributionDataset {
  id: string;
  label: string;
  description?: string;
  data: DistributionPoint[];
}

export interface TableRow {
  id: number;
  siloName: string;
  periodStart: Date;
  periodEnd: Date;
  averageTemperature: number | null;
  averageHumidity: number | null;
  environmentScore: number | null;
  alertsCount: number;
  criticalAlertsCount: number;
}

export interface DashboardMetrics {
  kpis: DashboardKpi[];
  temperatureSeries: TemperatureSeriesPoint[];
  humiditySeries: HumiditySeriesPoint[];
  alertsBySilo: AlertsBySiloPoint[];
  distribution: DistributionDataset[];
  tableRows: TableRow[];
}

export const defaultFilters: DashboardFilters = {
  dateRange: { from: null, to: null },
  silos: [],
};

const computeChange = (
  current: number | null,
  previous: number | null,
): { change: number | null; previous: number | null } => {
  if (current === null || previous === null) {
    return { change: null, previous };
  }

  if (previous === 0) {
    return { change: null, previous };
  }

  const delta = ((current - previous) / Math.abs(previous)) * 100;

  return { change: Number.isFinite(delta) ? delta : null, previous };
};

const normalizeNumber = (value: number | null, decimals: number) => {
  if (value === null) {
    return null;
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toSeriesLabel = (date: Date) => format(date, "dd MMM", { locale: ptBR });

const extractKpiValue = (
  data: DataProcessRecord[],
  extractor: (record: DataProcessRecord) => number | null,
) => {
  if (data.length === 0) {
    return { current: null, previous: null };
  }

  const sorted = [...data].sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());
  const current = extractor(sorted[sorted.length - 1]!);
  const previous = sorted.length >= 2 ? extractor(sorted[sorted.length - 2]!) : null;

  return { current, previous };
};

export const applyDashboardFilters = (
  data: DataProcessRecord[],
  filters: DashboardFilters,
): DataProcessRecord[] => {
  const {
    dateRange: { from, to },
    silos,
  } = filters;

  return data.filter((record) => {
    if (from && record.periodStart < from) {
      return false;
    }

    if (to && record.periodEnd > to) {
      return false;
    }

    if (silos.length > 0) {
      const recordKey = record.siloId !== null ? String(record.siloId) : record.siloName;
      if (!silos.includes(recordKey)) {
        return false;
      }
    }

    return true;
  });
};

export const extractSiloOptions = (data: DataProcessRecord[]) => {
  const options = new Map<string, string>();

  for (const item of data) {
    const key = item.siloId !== null ? String(item.siloId) : item.siloName;
    if (!options.has(key)) {
      options.set(key, item.siloName);
    }
  }

  return Array.from(options.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
};

const buildTemperatureSeries = (data: DataProcessRecord[]): TemperatureSeriesPoint[] =>
  data.map((item) => ({
    timestamp: item.periodStart,
    label: toSeriesLabel(item.periodStart),
    average: item.averageTemperature,
    min: item.minTemperature,
    max: item.maxTemperature,
  }));

const buildHumiditySeries = (data: DataProcessRecord[]): HumiditySeriesPoint[] =>
  data.map((item) => ({
    timestamp: item.periodStart,
    label: toSeriesLabel(item.periodStart),
    average: item.averageHumidity,
    min: item.minHumidity,
    max: item.maxHumidity,
    percentOverLimit: item.percentOverHumLimit,
  }));

const buildAlertsSeries = (data: DataProcessRecord[]): AlertsBySiloPoint[] => {
  const grouped = new Map<string, AlertsBySiloPoint>();

  for (const item of data) {
    const key = item.siloId !== null ? String(item.siloId) : item.siloName;
    const existing = grouped.get(key);

    if (existing) {
      existing.total += item.alertsCount;
      existing.critical += item.criticalAlertsCount;
    } else {
      grouped.set(key, {
        siloKey: key,
        siloName: item.siloName,
        total: item.alertsCount,
        critical: item.criticalAlertsCount,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
};

const buildDistribution = (data: DataProcessRecord[]): DistributionDataset[] => {
  let scoreHealthy = 0;
  let scoreWarning = 0;
  let scoreCritical = 0;

  let alertsNone = 0;
  let alertsWarning = 0;
  let alertsCritical = 0;

  let humidityWithin = 0;
  let humidityMild = 0;
  let humiditySevere = 0;

  for (const item of data) {
    const score = item.environmentScore;
    if (score !== null) {
      if (score >= 80) {
        scoreHealthy += 1;
      } else if (score >= 50) {
        scoreWarning += 1;
      } else {
        scoreCritical += 1;
      }
    }

    if (item.criticalAlertsCount > 0) {
      alertsCritical += 1;
    } else if (item.alertsCount > 0) {
      alertsWarning += 1;
    } else {
      alertsNone += 1;
    }

    const percentOver = item.percentOverHumLimit ?? 0;
    if (percentOver <= 0) {
      humidityWithin += 1;
    } else if (percentOver <= 10) {
      humidityMild += 1;
    } else {
      humiditySevere += 1;
    }
  }

  return [
    {
      id: 'environment',
      label: 'Score ambiental',
      description: 'Distribuição dos registros por faixa de score ambiental.',
      data: [
        { id: 'healthy', label: 'Estável (≥ 80)', value: scoreHealthy, color: 'hsl(var(--chart-1))' },
        { id: 'warning', label: 'Atenção (50-79)', value: scoreWarning, color: 'hsl(var(--chart-2))' },
        { id: 'critical', label: 'Crítico (< 50)', value: scoreCritical, color: 'hsl(var(--chart-3))' },
      ],
    },
    {
      id: 'alerts',
      label: 'Situação de alertas',
      description: 'Presença de alertas e criticidade nos períodos monitorados.',
      data: [
        { id: 'none', label: 'Sem alertas', value: alertsNone, color: 'hsl(var(--chart-4))' },
        { id: 'warning', label: 'Com alertas', value: alertsWarning, color: 'hsl(var(--chart-6))' },
        { id: 'critical', label: 'Com críticos', value: alertsCritical, color: 'hsl(var(--chart-7))' },
      ],
    },
    {
      id: 'humidity',
      label: 'Exposição à umidade',
      description: 'Percentual de registros acima do limite de umidade.',
      data: [
        { id: 'within', label: 'Dentro do limite', value: humidityWithin, color: 'hsl(var(--chart-5))' },
        { id: 'mild', label: 'Até 10% acima', value: humidityMild, color: 'hsl(var(--chart-6))' },
        { id: 'severe', label: 'Acima de 10%', value: humiditySevere, color: 'hsl(var(--chart-7))' },
      ],
    },
  ];
};

const buildTableRows = (data: DataProcessRecord[]): TableRow[] =>
  data.map((item) => ({
    id: item.id,
    siloName: item.siloName,
    periodStart: item.periodStart,
    periodEnd: item.periodEnd,
    averageTemperature: item.averageTemperature,
    averageHumidity: item.averageHumidity,
    environmentScore: item.environmentScore,
    alertsCount: item.alertsCount,
    criticalAlertsCount: item.criticalAlertsCount,
  }));

export const createDashboardMetrics = (
  data: DataProcessRecord[],
): DashboardMetrics => {
  const sorted = [...data].sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());

  const temperatureKpi = extractKpiValue(sorted, (item) => item.averageTemperature);
  const humidityKpi = extractKpiValue(sorted, (item) => item.averageHumidity);
  const environmentKpi = extractKpiValue(sorted, (item) => item.environmentScore);
  const alertsKpi = extractKpiValue(sorted, (item) => item.alertsCount);

  const { change: temperatureChange } = computeChange(temperatureKpi.current, temperatureKpi.previous);
  const { change: humidityChange } = computeChange(humidityKpi.current, humidityKpi.previous);
  const { change: environmentChange } = computeChange(environmentKpi.current, environmentKpi.previous);
  const { change: alertsChange } = computeChange(alertsKpi.current, alertsKpi.previous);

  const kpis: DashboardKpi[] = [
    {
      id: 'temperature',
      title: 'Temperatura média',
      unit: '°C',
      value: normalizeNumber(temperatureKpi.current, 1),
      previousValue: normalizeNumber(temperatureKpi.previous, 1),
      change: temperatureChange,
      decimals: 1,
    },
    {
      id: 'humidity',
      title: 'Umidade média',
      unit: '%',
      value: normalizeNumber(humidityKpi.current, 1),
      previousValue: normalizeNumber(humidityKpi.previous, 1),
      change: humidityChange,
      decimals: 1,
    },
    {
      id: 'environment',
      title: 'Índice ambiental',
      unit: 'pts',
      value: normalizeNumber(environmentKpi.current, 0),
      previousValue: normalizeNumber(environmentKpi.previous, 0),
      change: environmentChange,
      decimals: 0,
      invertTrend: true,
    },
    {
      id: 'alerts',
      title: 'Alertas recentes',
      value: normalizeNumber(alertsKpi.current, 0),
      previousValue: normalizeNumber(alertsKpi.previous, 0),
      change: alertsChange,
      decimals: 0,
      invertTrend: true,
    },
  ];

  return {
    kpis,
    temperatureSeries: buildTemperatureSeries(sorted),
    humiditySeries: buildHumiditySeries(sorted),
    alertsBySilo: buildAlertsSeries(sorted),
    distribution: buildDistribution(sorted),
    tableRows: buildTableRows(sorted),
  };
};

export const describeFilters = (filters: DashboardFilters) => {
  const parts: string[] = [];

  const formattedRange = formatDateRange(filters.dateRange);
  if (formattedRange) {
    parts.push(`Período: ${formattedRange}`);
  }

  if (filters.silos.length > 0) {
    parts.push(`${filters.silos.length} silos selecionados`);
  }

  return parts.filter(Boolean).join(' · ');
};
