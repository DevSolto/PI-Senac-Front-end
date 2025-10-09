import { apiClient } from "@/lib/api/client";

import { normalizeCriticalAlert, type ApiCriticalAlert } from "../transformers/alerts";
import type { CriticalAlert } from "../types";

export interface UpdateCriticalAlertOptions {
  client?: typeof apiClient;
}

export interface AcknowledgeCriticalAlertPayload {
  note?: string;
  acknowledgedBy?: string;
}

export interface ResolveCriticalAlertPayload {
  note?: string;
  resolvedBy?: string;
  resolutionCode?: string;
}

const extractAlertFromResponse = (payload: unknown): ApiCriticalAlert => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if ("alert" in (payload as Record<string, unknown>)) {
    const alert = (payload as Record<string, unknown>).alert;
    if (alert && typeof alert === "object") {
      return alert as ApiCriticalAlert;
    }
  }

  if ("data" in (payload as Record<string, unknown>)) {
    const data = (payload as Record<string, unknown>).data;
    if (data && typeof data === "object") {
      return data as ApiCriticalAlert;
    }
  }

  return payload as ApiCriticalAlert;
};

export const acknowledgeCriticalAlert = async (
  deviceId: string,
  alertId: string,
  payload?: AcknowledgeCriticalAlertPayload,
  { client = apiClient }: UpdateCriticalAlertOptions = {},
): Promise<CriticalAlert> => {
  const { data } = await client.patch<ApiCriticalAlert | { alert?: ApiCriticalAlert } | { data?: ApiCriticalAlert }>(
    `/devices/${deviceId}/alerts/${alertId}`,
    { status: "acknowledged", ...payload },
  );

  const alert = extractAlertFromResponse(data);
  return normalizeCriticalAlert(alert);
};

export const resolveCriticalAlert = async (
  deviceId: string,
  alertId: string,
  payload?: ResolveCriticalAlertPayload,
  { client = apiClient }: UpdateCriticalAlertOptions = {},
): Promise<CriticalAlert> => {
  const { data } = await client.post<ApiCriticalAlert | { alert?: ApiCriticalAlert } | { data?: ApiCriticalAlert }>(
    `/devices/${deviceId}/alerts/${alertId}/resolve`,
    { ...payload },
  );

  const alert = extractAlertFromResponse(data);
  const fallbackTimestamp =
    typeof alert.detectedAt === "string"
      ? alert.detectedAt
      : typeof alert.detected_at === "string"
        ? alert.detected_at
        : undefined;

  return normalizeCriticalAlert(alert, { fallbackTimestamp });
};
