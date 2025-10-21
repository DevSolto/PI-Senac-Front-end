import { apiClient } from '../http';

import type { Alert, AlertLevel, AlertType, CreateAlertDto, UpdateAlertDto } from './alerts.types';

const ALERTS_ENDPOINT = '/alerts';

const ALERT_TYPE_LOOKUP: Record<string, AlertType> = {
  temperature: 'temperature',
  humidity: 'humidity',
  airquality: 'airQuality',
};

const ALERT_LEVEL_LOOKUP: Record<string, AlertLevel> = {
  info: 'info',
  warning: 'warning',
  critical: 'critical',
};

type AlertResponse = Omit<Alert, 'type' | 'level' | 'emailSent'> & {
  type: string;
  level?: string | null;
  emailSent?: boolean | null;
};

function normalizeEnumValue<T extends string>(
  value: unknown,
  lookup: Record<string, T>,
  fallback: T,
): T {
  if (typeof value === 'string') {
    const normalizedKey = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const match = lookup[normalizedKey];

    if (match) {
      return match;
    }
  }

  console.warn('[alerts] Received unexpected enum value', value);
  return fallback;
}

function normalizeAlertType(value: unknown): Alert['type'] {
  return normalizeEnumValue(value, ALERT_TYPE_LOOKUP, 'temperature');
}

function normalizeAlertLevel(value: unknown): Alert['level'] {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeEnumValue(value, ALERT_LEVEL_LOOKUP, 'info');
}

function normalizeEmailSent(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  return Boolean(value);
}

function normalizeAlert(alert: AlertResponse): Alert {
  return {
    ...alert,
    type: normalizeAlertType(alert.type),
    level: normalizeAlertLevel(alert.level),
    emailSent: normalizeEmailSent(alert.emailSent),
  };
}

export async function createAlert(payload: CreateAlertDto): Promise<Alert> {
  const response = await apiClient.post<AlertResponse>(ALERTS_ENDPOINT, payload);
  return normalizeAlert(response);
}

export async function listAlerts(): Promise<Alert[]> {
  const response = await apiClient.json<AlertResponse[]>({
    path: ALERTS_ENDPOINT,
  });

  return response.map(normalizeAlert);
}

export async function getAlert(id: number): Promise<Alert> {
  const response = await apiClient.json<AlertResponse>({
    path: `${ALERTS_ENDPOINT}/${id}`,
  });

  return normalizeAlert(response);
}

export async function updateAlert(id: number, payload: UpdateAlertDto): Promise<Alert> {
  const response = await apiClient.json<AlertResponse>({
    method: 'PATCH',
    path: `${ALERTS_ENDPOINT}/${id}`,
    body: payload,
  });

  return normalizeAlert(response);
}

export async function deleteAlert(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${ALERTS_ENDPOINT}/${id}`,
  });
}
