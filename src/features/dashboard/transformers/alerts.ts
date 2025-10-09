import type { CriticalAlert, CriticalAlertStatus } from "../types";

export interface ApiCriticalAlert {
  id?: string;
  silo_name?: string;
  siloName?: string;
  alert_type?: string;
  alertType?: string;
  severity?: CriticalAlert["severity"] | string;
  detected_at?: string | number | Date;
  detectedAt?: string | number | Date;
  resolved_at?: string | number | Date | null;
  resolvedAt?: string | number | Date | null;
  duration_minutes?: number | string | null;
  durationMinutes?: number | string | null;
  status?: string | CriticalAlertStatus;
  description?: string | null;
  message?: string | null;
  acknowledged?: boolean;
  recommended_action?: string | null;
  recommendedAction?: string | null;
  acknowledged_at?: string | number | Date | null;
  acknowledgedAt?: string | number | Date | null;
  detectedTimestamp?: string | number | Date;
  silo?: string;
}

export interface DeviceAlertEventPayload {
  id?: string;
  severity?: string;
  message?: string;
  description?: string;
  siloName?: string;
  silo?: string;
  alertType?: string;
  type?: string;
  category?: string;
  detectedAt?: string | number | Date;
  detected_at?: string | number | Date;
  resolvedAt?: string | number | Date | null;
  resolved_at?: string | number | Date | null;
  durationMinutes?: number | string | null;
  duration_minutes?: number | string | null;
  recommendedAction?: string | null;
  recommended_action?: string | null;
  status?: string;
  acknowledged?: boolean;
  silo_id?: string;
  siloId?: string;
}

const generateFallbackId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

const toIsoString = (value: string | number | Date | null | undefined): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
};

const toNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeSeverity = (severity?: string): CriticalAlert["severity"] => {
  if (!severity) {
    return "warning";
  }

  const normalized = severity.toLowerCase();
  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "warning" || normalized === "alert" || normalized === "moderate") {
    return "warning";
  }

  return normalized.includes("crit") ? "critical" : "warning";
};

const normalizeStatus = (status?: string, acknowledged?: boolean): CriticalAlertStatus => {
  if (status) {
    const normalized = status.toLowerCase();
    if (normalized === "resolved" || normalized === "resolve") {
      return "resolved";
    }

    if (normalized === "acknowledged" || normalized === "ack" || normalized === "acknowledge") {
      return "acknowledged";
    }

    if (normalized === "active" || normalized === "open") {
      return "active";
    }
  }

  if (acknowledged) {
    return "acknowledged";
  }

  return "active";
};

const computeDurationMinutes = (
  detectedAt: string | undefined,
  referenceTimestamp: string | undefined,
  fallbackDuration?: number,
): number => {
  if (typeof fallbackDuration === "number" && Number.isFinite(fallbackDuration)) {
    return Math.max(0, Math.round(fallbackDuration));
  }

  if (!detectedAt) {
    return 0;
  }

  const reference = referenceTimestamp ? new Date(referenceTimestamp) : new Date();
  const detected = new Date(detectedAt);

  if (Number.isNaN(reference.getTime()) || Number.isNaN(detected.getTime())) {
    return 0;
  }

  const diffMs = Math.max(0, reference.getTime() - detected.getTime());
  return Math.round(diffMs / 60000);
};

const sanitizeString = (value: string | null | undefined): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const resolveDetectedAt = (
  alert: ApiCriticalAlert | DeviceAlertEventPayload,
  fallbackTimestamp?: string,
): string => {
  return (
    toIsoString((alert as ApiCriticalAlert).detectedAt)
      ?? toIsoString((alert as ApiCriticalAlert).detected_at)
      ?? toIsoString((alert as DeviceAlertEventPayload).detectedAt)
      ?? toIsoString((alert as DeviceAlertEventPayload).detected_at)
      ?? toIsoString((alert as ApiCriticalAlert).detectedTimestamp)
      ?? fallbackTimestamp
      ?? new Date().toISOString()
  );
};

const resolveResolvedAt = (alert: ApiCriticalAlert | DeviceAlertEventPayload): string | undefined => {
  return (
    toIsoString((alert as ApiCriticalAlert).resolvedAt)
      ?? toIsoString((alert as ApiCriticalAlert).resolved_at)
      ?? toIsoString((alert as DeviceAlertEventPayload).resolvedAt)
      ?? toIsoString((alert as DeviceAlertEventPayload).resolved_at)
  );
};

export const normalizeCriticalAlert = (
  alert: ApiCriticalAlert,
  options: { fallbackTimestamp?: string } = {},
): CriticalAlert => {
  const detectedAt = resolveDetectedAt(alert, options.fallbackTimestamp);
  const resolvedAt = resolveResolvedAt(alert);
  const duration = computeDurationMinutes(
    detectedAt,
    resolvedAt ?? options.fallbackTimestamp,
    toNumber(alert.durationMinutes ?? alert.duration_minutes ?? null),
  );
  const description =
    sanitizeString(alert.description)
      ?? sanitizeString(alert.message)
      ?? "Situação detectada pelo monitoramento em tempo real.";
  const recommendedAction =
    sanitizeString(alert.recommendedAction ?? alert.recommended_action)
      ?? "Investigar a causa do alerta e registrar ações corretivas.";
  const siloName = sanitizeString(alert.siloName ?? alert.silo_name ?? alert.silo) ?? "—";
  const alertType =
    sanitizeString(alert.alertType ?? alert.alert_type)
      ?? (description.length > 48 ? `${description.slice(0, 45)}…` : description)
      ?? "Alerta";

  return {
    id: alert.id ?? generateFallbackId(),
    siloName,
    alertType,
    severity: normalizeSeverity(typeof alert.severity === "string" ? alert.severity : undefined),
    detectedAt,
    durationMinutes: duration,
    status: normalizeStatus(typeof alert.status === "string" ? alert.status : undefined, alert.acknowledged),
    description,
    recommendedAction,
  } satisfies CriticalAlert;
};

export const normalizeDeviceAlertEvent = (
  alert: DeviceAlertEventPayload,
  options: { emittedAt?: string } = {},
): CriticalAlert => {
  const detectedAt = resolveDetectedAt(alert, options.emittedAt);
  const resolvedAt = resolveResolvedAt(alert);
  const duration = computeDurationMinutes(
    detectedAt,
    resolvedAt ?? options.emittedAt,
    toNumber(alert.durationMinutes ?? alert.duration_minutes ?? null),
  );

  const description =
    sanitizeString(alert.description)
      ?? sanitizeString(alert.message)
      ?? "Alerta emitido pelo dispositivo.";
  const recommendedAction =
    sanitizeString(alert.recommendedAction ?? alert.recommended_action)
      ?? "Planejar ação operacional para mitigar o risco.";
  const siloName = sanitizeString(alert.siloName ?? alert.silo ?? alert.siloId ?? alert.silo_id) ?? "—";
  const alertType =
    sanitizeString(alert.alertType ?? alert.type ?? alert.category)
      ?? (description.length > 48 ? `${description.slice(0, 45)}…` : description)
      ?? "Alerta";

  return {
    id: alert.id ?? generateFallbackId(),
    siloName,
    alertType,
    severity: normalizeSeverity(alert.severity),
    detectedAt,
    durationMinutes: duration,
    status: normalizeStatus(alert.status, alert.acknowledged),
    description,
    recommendedAction,
  } satisfies CriticalAlert;
};

export const mergeCriticalAlerts = (
  current: CriticalAlert[],
  incoming: CriticalAlert,
): CriticalAlert[] => {
  const index = current.findIndex((alert) => alert.id === incoming.id);

  if (index === -1) {
    return [incoming, ...current];
  }

  const next = current.slice();
  next[index] = {
    ...next[index],
    ...incoming,
    recommendedAction: incoming.recommendedAction || next[index].recommendedAction,
    description: incoming.description || next[index].description,
  } satisfies CriticalAlert;
  return next;
};
