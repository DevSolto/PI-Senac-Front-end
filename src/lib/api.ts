import { z } from 'zod';

import { parseToZonedTime } from './date';

const SiloSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .partial({ name: true });

export const ReadDataProcessSchema = z.object({
  id: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  averageTemperature: z.number().nullable().optional(),
  averageHumidity: z.number().nullable().optional(),
  averageAirQuality: z.number().nullable().optional(),
  maxTemperature: z.number().nullable().optional(),
  minTemperature: z.number().nullable().optional(),
  maxHumidity: z.number().nullable().optional(),
  minHumidity: z.number().nullable().optional(),
  stdTemperature: z.number().nullable().optional(),
  stdHumidity: z.number().nullable().optional(),
  stdAirQuality: z.number().nullable().optional(),
  alertsCount: z.number().nullable().optional(),
  criticalAlertsCount: z.number().nullable().optional(),
  percentOverTempLimit: z.number().nullable().optional(),
  percentOverHumLimit: z.number().nullable().optional(),
  environmentScore: z.number().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  siloId: z.number().nullable().optional(),
  siloName: z.string().nullable().optional(),
  silo: SiloSchema.nullable().optional(),
});

export type ReadDataProcess = z.infer<typeof ReadDataProcessSchema>;

export interface DataProcessRecord {
  id: number;
  periodStart: Date;
  periodEnd: Date;
  averageTemperature: number | null;
  averageHumidity: number | null;
  averageAirQuality: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  maxHumidity: number | null;
  minHumidity: number | null;
  stdTemperature: number | null;
  stdHumidity: number | null;
  stdAirQuality: number | null;
  alertsCount: number;
  criticalAlertsCount: number;
  percentOverTempLimit: number | null;
  percentOverHumLimit: number | null;
  environmentScore: number | null;
  createdAt: Date | null;
  siloId: number | null;
  siloName: string;
}

const normalizeRecord = (record: ReadDataProcess): DataProcessRecord | null => {
  const periodStart = parseToZonedTime(record.periodStart);
  const periodEnd = parseToZonedTime(record.periodEnd);

  if (!periodStart || !periodEnd) {
    return null;
  }

  const createdAt = parseToZonedTime(record.createdAt ?? undefined);
  const siloId = record.silo?.id ?? record.siloId ?? null;
  const siloName =
    record.silo?.name ?? record.siloName ?? (siloId !== null ? `Silo ${siloId}` : 'Silo não informado');

  return {
    id: record.id,
    periodStart,
    periodEnd,
    averageTemperature: record.averageTemperature ?? null,
    averageHumidity: record.averageHumidity ?? null,
    averageAirQuality: record.averageAirQuality ?? null,
    maxTemperature: record.maxTemperature ?? null,
    minTemperature: record.minTemperature ?? null,
    maxHumidity: record.maxHumidity ?? null,
    minHumidity: record.minHumidity ?? null,
    stdTemperature: record.stdTemperature ?? null,
    stdHumidity: record.stdHumidity ?? null,
    stdAirQuality: record.stdAirQuality ?? null,
    alertsCount: record.alertsCount ?? 0,
    criticalAlertsCount: record.criticalAlertsCount ?? 0,
    percentOverTempLimit: record.percentOverTempLimit ?? null,
    percentOverHumLimit: record.percentOverHumLimit ?? null,
    environmentScore: record.environmentScore ?? null,
    createdAt,
    siloId,
    siloName,
  };
};

export const fetchDataProcess = async (): Promise<DataProcessRecord[]> => {
  const response = await fetch('/data-process');

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados de processamento.');
  }

  const payload = await response.json();
  const parsed = z.array(ReadDataProcessSchema).safeParse(payload);

  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data
    .map(normalizeRecord)
    .filter((item): item is DataProcessRecord => Boolean(item))
    .sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime());
};
