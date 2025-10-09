import { apiClient } from "@/lib/api/client";

import type { DeviceHistory, DeviceHistoryEntry } from "../types";

interface DeviceHistoryApiEntry {
  timestamp?: number | string;
  recorded_at?: number | string;
  recordedAt?: number | string;
  time?: number | string;
  createdAt?: number | string;
  metrics?: Record<string, unknown>;
  values?: Record<string, unknown>;
  value?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  data?: Record<string, unknown>;
  reading?: Record<string, unknown>;
}

type DeviceHistoryApiResponse =
  | DeviceHistoryApiEntry[]
  | {
      device_id?: string;
      deviceId?: string;
      entries?: DeviceHistoryApiEntry[];
      history?: DeviceHistoryApiEntry[];
      data?: DeviceHistoryApiEntry[];
    };

export interface GetDeviceHistoryOptions {
  client?: typeof apiClient;
}

const toIsoTimestamp = (value: unknown): string => {
  const ensureDate = (input: number): Date => {
    const milliseconds = input > 1_000_000_000_000 ? input : input * 1000;
    return new Date(milliseconds);
  };

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = ensureDate(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed !== "") {
      const numericValue = Number(trimmed);
      if (Number.isFinite(numericValue)) {
        const date = ensureDate(numericValue);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  return new Date().toISOString();
};

const normalizeMetrics = (metrics: Record<string, unknown> | undefined): DeviceHistoryEntry["metrics"] => {
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
    return {};
  }

  return Object.entries(metrics).reduce<DeviceHistoryEntry["metrics"]>((accumulator, [key, value]) => {
    if (value === null || value === undefined) {
      accumulator[key] = null;
      return accumulator;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      accumulator[key] = value;
      return accumulator;
    }

    if (typeof value === "string") {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        accumulator[key] = numericValue;
      }

      return accumulator;
    }

    return accumulator;
  }, {});
};

const normalizeDeviceHistoryEntry = (entry: DeviceHistoryApiEntry): DeviceHistoryEntry => {
  const timestampSource =
    entry.timestamp ??
    entry.recorded_at ??
    entry.recordedAt ??
    entry.time ??
    entry.createdAt ??
    new Date().toISOString();

  return {
    timestamp: toIsoTimestamp(timestampSource),
    metrics: normalizeMetrics(
      entry.metrics ?? entry.values ?? entry.value ?? entry.payload ?? entry.data ?? entry.reading,
    ),
  } satisfies DeviceHistoryEntry;
};

const normalizeDeviceHistoryResponse = (
  response: DeviceHistoryApiResponse | undefined,
  fallbackDeviceId: string,
): DeviceHistory => {
  const entries = Array.isArray(response)
    ? response
    : Array.isArray(response?.entries)
      ? response.entries
      : Array.isArray(response?.history)
        ? response.history
        : Array.isArray(response?.data)
          ? response.data
          : [];

  const deviceId = Array.isArray(response)
    ? fallbackDeviceId
    : response?.device_id || response?.deviceId || fallbackDeviceId;

  return {
    deviceId,
    entries: entries.map(normalizeDeviceHistoryEntry),
  } satisfies DeviceHistory;
};

export const getDeviceHistory = async (
  deviceId: string,
  { client = apiClient }: GetDeviceHistoryOptions = {},
): Promise<DeviceHistory> => {
  const { data } = await client.get<DeviceHistoryApiResponse>(`/devices/${deviceId}/history`);

  return normalizeDeviceHistoryResponse(data, deviceId);
};
