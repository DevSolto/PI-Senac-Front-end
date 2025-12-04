export interface Device {
  id: string;
  name: string;
  siloId?: number | null;
  siloName?: string | null;
  isOnline: boolean;
  lastSeenAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDevicePayload {
  id: string;
  name: string;
  siloId?: number | null;
}

export interface DeviceCommandPayload {
  command: string;
}

export interface DeviceHistoryEntryValue {
  temperature?: number | null;
  humidity?: number | null;
  airQuality?: number | null;
  [key: string]: unknown;
}

export interface DeviceHistoryEntry {
  timestamp: string | number;
  temperature?: number | null;
  humidity?: number | null;
  value?: DeviceHistoryEntryValue | null;
  airQuality?: number | null;
  [key: string]: unknown;
}

export interface DeviceUpdateEvent extends DeviceHistoryEntry {
  deviceId: string;
}

export interface DeviceOnlineSummary {
  onlineCount: number;
  devices: Device[];
}
