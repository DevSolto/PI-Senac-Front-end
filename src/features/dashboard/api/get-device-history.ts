import { apiClient } from "@/lib/api/client";

import type { DeviceHistory, DeviceHistoryEntry } from "../types";

interface DeviceHistoryApiEntry {
  timestamp?: string;
  recorded_at?: string;
  recordedAt?: string;
  metrics?: Record<string, number | string | null | undefined>;
  values?: Record<string, number | string | null | undefined>;
}

interface DeviceHistoryApiResponse {
  device_id?: string;
  deviceId?: string;
  entries?: DeviceHistoryApiEntry[];
  history?: DeviceHistoryApiEntry[];
  data?: DeviceHistoryApiEntry[];
}

export interface GetDeviceHistoryOptions {
  client?: typeof apiClient;
}

const normalizeMetrics = (
  metrics: Record<string, number | string | null | undefined> | undefined,
): DeviceHistoryEntry["metrics"] => {
  if (!metrics) {
    return {};
  }

  return Object.entries(metrics).reduce<DeviceHistoryEntry["metrics"]>((accumulator, [key, value]) => {
    if (value === null || value === undefined) {
      accumulator[key] = null;
      return accumulator;
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numericValue)) {
      accumulator[key] = numericValue;
    }

    return accumulator;
  }, {});
};

const normalizeDeviceHistoryEntry = (entry: DeviceHistoryApiEntry): DeviceHistoryEntry => {
  const timestamp = entry.timestamp || entry.recorded_at || entry.recordedAt || new Date().toISOString();

  return {
    timestamp,
    metrics: normalizeMetrics(entry.metrics ?? entry.values),
  } satisfies DeviceHistoryEntry;
};

const normalizeDeviceHistoryResponse = (
  response: DeviceHistoryApiResponse | undefined,
  fallbackDeviceId: string,
): DeviceHistory => {
  const entries = Array.isArray(response?.entries)
    ? response?.entries
    : Array.isArray(response?.history)
      ? response?.history
      : Array.isArray(response?.data)
        ? response?.data
        : [];

  return {
    deviceId: response?.device_id || response?.deviceId || fallbackDeviceId,
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
