import { apiClient } from '../http';

import type { CreateSiloDto, Silo, UpdateSiloDto } from './silos.types';

const SILOS_ENDPOINT = '/silos';

type SiloPayload = CreateSiloDto | UpdateSiloDto;

type NumericSiloField =
  | 'maxTemperature'
  | 'minTemperature'
  | 'maxHumidity'
  | 'minHumidity'
  | 'maxAirQuality'
  | 'minAirQuality'
  | 'companyId';

type BooleanSiloField = 'inUse';

const NUMERIC_FIELDS: NumericSiloField[] = [
  'maxTemperature',
  'minTemperature',
  'maxHumidity',
  'minHumidity',
  'maxAirQuality',
  'minAirQuality',
  'companyId',
];

const BOOLEAN_FIELDS: BooleanSiloField[] = ['inUse'];

function serializeSiloPayload(payload: SiloPayload): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) {
      continue;
    }

    if (NUMERIC_FIELDS.includes(key as NumericSiloField)) {
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

    if (BOOLEAN_FIELDS.includes(key as BooleanSiloField)) {
      if (value === null) {
        serialized[key] = null;
      } else if (typeof value === 'string') {
        serialized[key] = value === 'true';
      } else {
        serialized[key] = value;
      }

      continue;
    }

    serialized[key] = value;
  }

  return serialized;
}

export function createSilo(payload: CreateSiloDto): Promise<Silo> {
  return apiClient.post<Silo>(SILOS_ENDPOINT, serializeSiloPayload(payload));
}

export function listSilos(): Promise<Silo[]> {
  return apiClient.json<Silo[]>({
    path: SILOS_ENDPOINT,
  });
}

export function getSilo(id: number): Promise<Silo> {
  return apiClient.json<Silo>({
    path: `${SILOS_ENDPOINT}/${id}`,
  });
}

export function updateSilo(id: number, payload: UpdateSiloDto): Promise<Silo> {
  return apiClient.json<Silo>({
    method: 'PATCH',
    path: `${SILOS_ENDPOINT}/${id}`,
    body: serializeSiloPayload(payload),
  });
}

export async function deleteSilo(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${SILOS_ENDPOINT}/${id}`,
  });
}
