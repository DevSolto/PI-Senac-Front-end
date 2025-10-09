import { apiClient } from "@/lib/api/client";

import { normalizeCriticalAlert, type ApiCriticalAlert } from "../transformers/alerts";
import type { CriticalAlert } from "../types";

interface GetCriticalAlertsResponse {
  alerts?: ApiCriticalAlert[];
  data?: ApiCriticalAlert[];
  results?: ApiCriticalAlert[];
}

export interface GetCriticalAlertsOptions {
  client?: typeof apiClient;
}

const extractAlertsFromResponse = (payload: unknown): ApiCriticalAlert[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as ApiCriticalAlert[];
  }

  if (typeof payload === "object") {
    const source = payload as GetCriticalAlertsResponse;
    if (Array.isArray(source.alerts)) {
      return source.alerts;
    }
    if (Array.isArray(source.data)) {
      return source.data;
    }
    if (Array.isArray(source.results)) {
      return source.results;
    }
  }

  return [];
};

export const getCriticalAlerts = async (
  deviceId: string,
  { client = apiClient }: GetCriticalAlertsOptions = {},
): Promise<CriticalAlert[]> => {
  const { data } = await client.get<GetCriticalAlertsResponse | ApiCriticalAlert[]>(`/devices/${deviceId}/alerts`);
  const alerts = extractAlertsFromResponse(data);

  return alerts.map((alert) => normalizeCriticalAlert(alert));
};
