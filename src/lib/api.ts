import { z } from 'zod';

import { apiClient, HttpError } from '@/shared/http';

import { toZonedDate } from './date';

const DATA_PROCESS_ENDPOINT = '/api/data-process';

const SiloSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .partial({ name: true });

const RawReadDataProcessSchema = z.object({
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

export const ReadDataProcessSchema = RawReadDataProcessSchema.transform<DataProcessRecord>((record) => {
  const periodStart = toZonedDate(record.periodStart);
  const periodEnd = toZonedDate(record.periodEnd);
  const createdAt = record.createdAt ? toZonedDate(record.createdAt) : null;

  const siloId = record.silo?.id ?? record.siloId ?? null;
  const siloName =
    record.silo?.name ??
    record.siloName ??
    (siloId !== null ? `Silo ${siloId}` : 'Silo não informado');

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
  } satisfies DataProcessRecord;
});

const resolveSiloKey = (record: DataProcessRecord) =>
  record.siloId !== null ? String(record.siloId) : record.siloName;

const buildRecordKey = (record: DataProcessRecord) =>
  `${resolveSiloKey(record)}::${record.periodStart.getTime()}::${record.periodEnd.getTime()}`;

const isCandidateNewer = (current: DataProcessRecord, candidate: DataProcessRecord) => {
  const currentTimestamp = current.createdAt?.getTime() ?? Number.NEGATIVE_INFINITY;
  const candidateTimestamp = candidate.createdAt?.getTime() ?? Number.NEGATIVE_INFINITY;

  if (candidateTimestamp !== currentTimestamp) {
    return candidateTimestamp > currentTimestamp;
  }

  if (candidate.id !== current.id) {
    return candidate.id > current.id;
  }

  return false;
};

export const deduplicateDataProcessRecords = (
  data: DataProcessRecord[],
): DataProcessRecord[] => {
  const unique = new Map<string, DataProcessRecord>();

  for (const record of data) {
    const key = buildRecordKey(record);
    const existing = unique.get(key);

    if (!existing || isCandidateNewer(existing, record)) {
      unique.set(key, record);
    }
  }

  return Array.from(unique.values());
};

export const fetchDataProcess = async (): Promise<DataProcessRecord[]> => {
  console.info('[Dashboard] Iniciando carregamento de dados agregados.');
  let payload: unknown;

  try {
    payload = await apiClient.json<unknown>({
      path: DATA_PROCESS_ENDPOINT,
    });
    console.debug('[Dashboard] Resposta recebida do endpoint /data-process.', {
      endpoint: DATA_PROCESS_ENDPOINT,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      console.error('[Dashboard] Falha na resposta de /data-process.', {
        mensagem: error.message,
        status: error.status,
        statusText: error.statusText,
        corpo: error.data,
      });
      throw error;
    }

    console.error('[Dashboard] Falha ao consultar /data-process.', { erro: error });
    throw error instanceof Error
      ? error
      : new Error('Erro ao consultar o endpoint /data-process.');
  }

  let data: DataProcessRecord[];
  try {
    data = ReadDataProcessSchema.array().parse(payload);
  } catch (error) {
    console.error('[Dashboard] Erro ao interpretar o JSON do endpoint /data-process.', {
      erro: error,
      corpo: payload,
    });

    throw error instanceof Error ? error : new Error('Erro ao interpretar resposta de /data-process.');
  }

  console.debug('[Dashboard] Dados agregados validados com sucesso.', {
    totalRegistros: data.length,
  });

  const deduplicated = deduplicateDataProcessRecords(data);

  if (deduplicated.length !== data.length) {
    console.info('[Dashboard] Registros agregados deduplicados para consumo.', {
      antes: data.length,
      depois: deduplicated.length,
    });
  }

  const ordered = deduplicated.sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );
  console.info('[Dashboard] Dados agregados ordenados para consumo.', {
    totalRegistros: ordered.length,
  });

  return ordered;
};
