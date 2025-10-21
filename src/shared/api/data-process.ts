import { apiClient } from '../http';

import type {
  CreateDataProcessDto,
  DataProcess,
  UpdateDataProcessDto,
} from './data-process.types';

const DATA_PROCESS_ENDPOINT = '/data-process';

type DataProcessPayload = CreateDataProcessDto | UpdateDataProcessDto;

type NumericDataProcessField =
  | 'siloId'
  | 'averageTemperature'
  | 'averageHumidity'
  | 'averageAirQuality'
  | 'maxTemperature'
  | 'minTemperature'
  | 'maxHumidity'
  | 'minHumidity'
  | 'stdTemperature'
  | 'stdHumidity'
  | 'stdAirQuality'
  | 'alertsCount'
  | 'criticalAlertsCount'
  | 'percentOverTempLimit'
  | 'percentOverHumLimit'
  | 'environmentScore';

type DateDataProcessField = 'periodStart' | 'periodEnd';

const NUMERIC_FIELDS: NumericDataProcessField[] = [
  'siloId',
  'averageTemperature',
  'averageHumidity',
  'averageAirQuality',
  'maxTemperature',
  'minTemperature',
  'maxHumidity',
  'minHumidity',
  'stdTemperature',
  'stdHumidity',
  'stdAirQuality',
  'alertsCount',
  'criticalAlertsCount',
  'percentOverTempLimit',
  'percentOverHumLimit',
  'environmentScore',
];

const DATE_FIELDS: DateDataProcessField[] = ['periodStart', 'periodEnd'];

function serializeDataProcessPayload(
  payload: DataProcessPayload,
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) {
      continue;
    }

    if (DATE_FIELDS.includes(key as DateDataProcessField)) {
      if (value === null) {
        serialized[key] = null;
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString();
      } else if (typeof value === 'string') {
        serialized[key] = value;
      } else {
        serialized[key] = value;
      }

      continue;
    }

    if (NUMERIC_FIELDS.includes(key as NumericDataProcessField)) {
      if (value === null) {
        serialized[key] = null;
      } else if (typeof value === 'string') {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue)) {
          serialized[key] = numericValue;
        }
      } else {
        serialized[key] = value;
      }

      continue;
    }

    serialized[key] = value;
  }

  return serialized;
}

export function createDataProcess(payload: CreateDataProcessDto): Promise<DataProcess> {
  return apiClient.post<DataProcess>(
    DATA_PROCESS_ENDPOINT,
    serializeDataProcessPayload(payload),
  );
}

export function listDataProcess(): Promise<DataProcess[]> {
  return apiClient.json<DataProcess[]>({
    path: DATA_PROCESS_ENDPOINT,
  });
}

export function getDataProcess(id: number): Promise<DataProcess> {
  return apiClient.json<DataProcess>({
    path: `${DATA_PROCESS_ENDPOINT}/${id}`,
  });
}

export function updateDataProcess(
  id: number,
  payload: UpdateDataProcessDto,
): Promise<DataProcess> {
  return apiClient.json<DataProcess>({
    method: 'PATCH',
    path: `${DATA_PROCESS_ENDPOINT}/${id}`,
    body: serializeDataProcessPayload(payload),
  });
}

export async function deleteDataProcess(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${DATA_PROCESS_ENDPOINT}/${id}`,
  });
}
