import { describe, expect, it } from '@jest/globals';

import type { DataProcessRecord } from '@/lib/api';
import {
  applyDashboardFilters,
  average,
  buildAlertsStack,
  buildLineSeries,
  buildPieDistributions,
  computeKpis,
  createDashboardMetrics,
  extractSiloOptions,
  groupBySilo,
  sum,
  type DashboardFilters,
} from '@/lib/metrics';

const buildRecord = (overrides: Partial<DataProcessRecord> = {}): DataProcessRecord => ({
  id: overrides.id ?? Math.floor(Math.random() * 1000),
  periodStart: overrides.periodStart ?? new Date('2024-01-01T00:00:00Z'),
  periodEnd: overrides.periodEnd ?? new Date('2024-01-01T01:00:00Z'),
  averageTemperature: overrides.averageTemperature ?? 25,
  averageHumidity: overrides.averageHumidity ?? 60,
  averageAirQuality: overrides.averageAirQuality ?? 30,
  maxTemperature: overrides.maxTemperature ?? 28,
  minTemperature: overrides.minTemperature ?? 22,
  maxHumidity: overrides.maxHumidity ?? 70,
  minHumidity: overrides.minHumidity ?? 55,
  stdTemperature: overrides.stdTemperature ?? 1.2,
  stdHumidity: overrides.stdHumidity ?? 2.1,
  stdAirQuality: overrides.stdAirQuality ?? 3.4,
  alertsCount: overrides.alertsCount ?? 2,
  criticalAlertsCount: overrides.criticalAlertsCount ?? 1,
  percentOverTempLimit: overrides.percentOverTempLimit ?? 5,
  percentOverHumLimit: overrides.percentOverHumLimit ?? 3,
  environmentScore: overrides.environmentScore ?? 82,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T02:00:00Z'),
  siloId: overrides.siloId ?? 1,
  siloName: overrides.siloName ?? 'Silo Central',
});

describe('metrics helpers', () => {
  const baseData: DataProcessRecord[] = [
    buildRecord({
      id: 1,
      periodStart: new Date('2024-01-01T00:00:00Z'),
      periodEnd: new Date('2024-01-01T01:00:00Z'),
      averageTemperature: 24,
      averageHumidity: 58,
      alertsCount: 3,
      criticalAlertsCount: 1,
      environmentScore: 78,
      siloId: 1,
      siloName: 'Silo Norte',
    }),
    buildRecord({
      id: 2,
      periodStart: new Date('2024-01-02T00:00:00Z'),
      periodEnd: new Date('2024-01-02T01:00:00Z'),
      averageTemperature: 26,
      averageHumidity: 65,
      alertsCount: 1,
      criticalAlertsCount: 0,
      environmentScore: 85,
      siloId: 2,
      siloName: 'Silo Sul',
    }),
    buildRecord({
      id: 3,
      periodStart: new Date('2024-01-03T00:00:00Z'),
      periodEnd: new Date('2024-01-03T01:00:00Z'),
      averageTemperature: 27,
      averageHumidity: 66,
      alertsCount: 4,
      criticalAlertsCount: 2,
      environmentScore: 42,
      percentOverHumLimit: 12,
      siloId: 1,
      siloName: 'Silo Norte',
    }),
  ];

  it('computes averages and sums ignoring undefined values', () => {
    expect(average([10, undefined, 20, 30])).toBeCloseTo(20, 5);
    expect(average([undefined, undefined])).toBeNull();
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it('groups records by silo and keeps them sorted', () => {
    const grouped = groupBySilo([
      baseData[1]!,
      baseData[0]!,
      baseData[2]!,
    ]);

    expect(Object.keys(grouped).sort()).toEqual(['1', '2']);
    expect(grouped['1']).toHaveLength(2);
    expect(grouped['1']?.map((item) => item.id)).toEqual([1, 3]);
  });

  it('filters data using date range and silo selection', () => {
    const filters: DashboardFilters = {
      dateRange: {
        from: new Date('2024-01-02T00:00:00Z'),
        to: new Date('2024-01-03T23:59:59Z'),
      },
      silos: ['1'],
      rangePreset: null,
    };

    const filtered = applyDashboardFilters(baseData, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(3);
  });

  it('extracts unique silo options sorted alphabetically', () => {
    const options = extractSiloOptions(baseData);
    expect(options).toEqual([
      { value: '1', label: 'Silo Norte' },
      { value: '2', label: 'Silo Sul' },
    ]);
  });

  it('computes KPI summaries based on the most recent records', () => {
    const kpis = computeKpis(baseData);

    expect(kpis).toHaveLength(3);
    const temperature = kpis.find((item) => item.id === 'temperature');
    expect(temperature?.value).toBe(27);
    expect(temperature?.previousValue).toBe(26);
  });

  it('builds ordered line series for temperature and humidity', () => {
    const shuffled = [baseData[2]!, baseData[0]!, baseData[1]!];
    const temperatureSeries = buildLineSeries(shuffled, 'averageTemperature');
    const humiditySeries = buildLineSeries(shuffled, 'averageHumidity');

    expect(temperatureSeries.map((item) => item.average)).toEqual([24, 26, 27]);
    expect(humiditySeries[2]?.percentOverLimit).toBe(12);
  });

  it('aggregates alerts by silo and sorts by total', () => {
    const alerts = buildAlertsStack(baseData);

    expect(alerts[0]?.siloKey).toBe('1');
    expect(alerts[0]?.total).toBe(7);
    expect(alerts[0]?.critical).toBe(3);
  });

  it('builds pie datasets with categorized counts', () => {
    const dataset = buildPieDistributions(baseData);

    const environment = dataset.find((item) => item.id === 'environment');
    expect(environment?.data.find((item) => item.id === 'critical')?.value).toBe(1);
  });

  it('generates dashboard metrics with series and kpis', () => {
    const metrics = createDashboardMetrics(baseData);

    expect(metrics.kpis).toHaveLength(3);
    expect(metrics.temperatureSeries).toHaveLength(3);
    expect(metrics.tableRows[0]?.siloName).toBe('Silo Norte');
  });
});
