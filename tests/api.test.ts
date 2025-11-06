import { describe, expect, it } from '@jest/globals';

import { deduplicateDataProcessRecords, type DataProcessRecord } from '@/lib/api';

const buildRecord = (overrides: Partial<DataProcessRecord> = {}): DataProcessRecord => ({
  id: overrides.id ?? Math.floor(Math.random() * 10_000),
  periodStart: overrides.periodStart ?? new Date('2025-11-05T01:35:00Z'),
  periodEnd: overrides.periodEnd ?? new Date('2025-11-05T01:40:00Z'),
  averageTemperature: overrides.averageTemperature ?? null,
  averageHumidity: overrides.averageHumidity ?? null,
  averageAirQuality: overrides.averageAirQuality ?? null,
  maxTemperature: overrides.maxTemperature ?? null,
  minTemperature: overrides.minTemperature ?? null,
  maxHumidity: overrides.maxHumidity ?? null,
  minHumidity: overrides.minHumidity ?? null,
  stdTemperature: overrides.stdTemperature ?? null,
  stdHumidity: overrides.stdHumidity ?? null,
  stdAirQuality: overrides.stdAirQuality ?? null,
  alertsCount: overrides.alertsCount ?? 0,
  criticalAlertsCount: overrides.criticalAlertsCount ?? 0,
  percentOverTempLimit: overrides.percentOverTempLimit ?? null,
  percentOverHumLimit: overrides.percentOverHumLimit ?? null,
  environmentScore: overrides.environmentScore ?? null,
  createdAt: overrides.createdAt ?? null,
  siloId: overrides.siloId ?? null,
  siloName: overrides.siloName ?? 'Silo',
});

describe('lib/api', () => {
  it('mantém apenas o registro mais recente por período e silo', () => {
    const data: DataProcessRecord[] = [
      buildRecord({
        id: 1,
        periodStart: new Date('2025-11-05T01:35:00Z'),
        periodEnd: new Date('2025-11-05T01:40:00Z'),
        createdAt: new Date('2025-11-05T04:41:59.830Z'),
      }),
      buildRecord({
        id: 2,
        periodStart: new Date('2025-11-05T01:40:00Z'),
        periodEnd: new Date('2025-11-05T01:45:00Z'),
        createdAt: new Date('2025-11-05T04:42:01.057Z'),
      }),
      buildRecord({
        id: 3,
        periodStart: new Date('2025-11-05T01:45:00Z'),
        periodEnd: new Date('2025-11-05T01:50:00Z'),
        createdAt: new Date('2025-11-05T04:42:02.306Z'),
      }),
      buildRecord({
        id: 4,
        periodStart: new Date('2025-11-05T01:35:00Z'),
        periodEnd: new Date('2025-11-05T01:40:00Z'),
        createdAt: new Date('2025-11-05T05:11:11.807Z'),
      }),
      buildRecord({
        id: 5,
        periodStart: new Date('2025-11-05T01:40:00Z'),
        periodEnd: new Date('2025-11-05T01:45:00Z'),
        createdAt: new Date('2025-11-05T05:11:13.019Z'),
      }),
      buildRecord({
        id: 6,
        periodStart: new Date('2025-11-05T01:45:00Z'),
        periodEnd: new Date('2025-11-05T01:50:00Z'),
        createdAt: new Date('2025-11-05T05:11:14.240Z'),
      }),
    ];

    const deduplicated = deduplicateDataProcessRecords(data);

    expect(deduplicated).toHaveLength(3);
    expect(deduplicated.map((item) => item.id).sort()).toEqual([4, 5, 6]);
  });

  it('desempata registros sem createdAt pelo maior identificador', () => {
    const periodStart = new Date('2025-11-05T02:00:00Z');
    const periodEnd = new Date('2025-11-05T02:05:00Z');

    const data: DataProcessRecord[] = [
      buildRecord({ id: 10, periodStart, periodEnd, createdAt: null, siloName: 'Silo A' }),
      buildRecord({ id: 11, periodStart, periodEnd, createdAt: null, siloName: 'Silo A' }),
    ];

    const deduplicated = deduplicateDataProcessRecords(data);

    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0]?.id).toBe(11);
  });
});

