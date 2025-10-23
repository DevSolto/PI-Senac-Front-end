import { apiClient, getAuthToken } from '../http';

import type {
  CreateDevicePayload,
  Device,
  DeviceCommandPayload,
  DeviceHistoryEntry,
  DeviceOnlineSummary,
  DeviceUpdateEvent,
} from './devices.types';

const DEVICES_ENDPOINT = '/devices';
const DEVICE_UPDATES_RETRY_DELAY = 5000;
const ENV_API_URL = (
  import.meta.env.VITE_API_URL ?? import.meta.env.API_URL ?? 'http://localhost:3000'
) as string;

type DeviceCommandResponse = {
  message: string;
};

type DeviceOnlineSummaryResponse = {
  online_count: number;
  devices: Device[];
};

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!ENV_API_URL) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  const base = ensureTrailingSlash(ENV_API_URL);
  return new URL(path, base).toString();
}

function appendAuthToken(url: string): string {
  const token = getAuthToken();

  if (!token) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    const urlWithToken = new URL(url);
    urlWithToken.searchParams.set('token', token);
    return urlWithToken.toString();
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function buildDeviceUpdatesUrl(deviceId: string): string {
  const path = `${DEVICES_ENDPOINT}/${encodeURIComponent(deviceId)}/updates`;
  const baseUrl = buildApiUrl(path);
  return appendAuthToken(baseUrl);
}

export function createDevice(payload: CreateDevicePayload): Promise<Device> {
  return apiClient.post<Device>(DEVICES_ENDPOINT, payload);
}

export function listDevices(): Promise<Device[]> {
  return apiClient.json<Device[]>({
    path: DEVICES_ENDPOINT,
  });
}

export function getDevice(id: string): Promise<Device> {
  return apiClient.json<Device>({
    path: `${DEVICES_ENDPOINT}/${encodeURIComponent(id)}`,
  });
}

export async function getDevicesOnline(siloId: number): Promise<DeviceOnlineSummary> {
  const response = await apiClient.json<DeviceOnlineSummaryResponse>({
    path: `${DEVICES_ENDPOINT}/silo/${encodeURIComponent(String(siloId))}/online`,
  });

  return {
    onlineCount: response.online_count,
    devices: response.devices,
  };
}

export function sendDeviceCommand(
  deviceId: string,
  payload: DeviceCommandPayload,
): Promise<DeviceCommandResponse> {
  return apiClient.post<DeviceCommandResponse>(
    `${DEVICES_ENDPOINT}/${encodeURIComponent(deviceId)}/commands`,
    payload,
  );
}

export function getDeviceHistory(deviceId: string): Promise<DeviceHistoryEntry[]> {
  return apiClient.json<DeviceHistoryEntry[]>({
    path: `${DEVICES_ENDPOINT}/${encodeURIComponent(deviceId)}/history`,
  });
}

export interface DeviceUpdatesSubscription {
  close(): void;
}

export function subscribeToDeviceUpdates(
  deviceId: string,
  onMessage: (event: DeviceUpdateEvent) => void,
): DeviceUpdatesSubscription {
  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function cleanupTimer(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect(): void {
    cleanupTimer();

    if (closed) {
      return;
    }

    reconnectTimer = setTimeout(() => {
      reconnect();
    }, DEVICE_UPDATES_RETRY_DELAY);
  }

  function reconnect(): void {
    if (closed) {
      return;
    }

    if (eventSource) {
      eventSource.close();
    }

    const url = buildDeviceUpdatesUrl(deviceId);
    eventSource = new EventSource(url);

    eventSource.onmessage = event => {
      if (!event.data) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as DeviceUpdateEvent;
        onMessage(parsed);
      } catch (error) {
        console.warn('[subscribeToDeviceUpdates] Failed to parse event data', error, event.data);
      }
    };

    eventSource.onerror = () => {
      if (closed) {
        return;
      }

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      scheduleReconnect();
    };
  }

  reconnect();

  return {
    close() {
      closed = true;
      cleanupTimer();

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    },
  };
}
