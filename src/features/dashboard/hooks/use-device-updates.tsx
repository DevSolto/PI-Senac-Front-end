"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CriticalAlertStatus, GatewayStatus } from "../types";

export type DeviceUpdateType = "reading" | "alert" | "gateway" | "unknown";

export interface DeviceSensorStatusSnapshot {
  totalSensors?: number;
  online?: number;
  offline?: number;
  maintenance?: number;
  batteryCritical?: number;
}

export interface DeviceReadingSnapshot {
  sensorStatus?: DeviceSensorStatusSnapshot;
  averageSignalQuality?: number;
  gatewayStatus?: GatewayStatus;
}

export interface DeviceGatewaySnapshot {
  status?: GatewayStatus;
  signalQuality?: number;
}

export interface DeviceAlertSnapshot {
  id?: string;
  severity?: string;
  message?: string;
  siloName?: string;
  acknowledged?: boolean;
  status?: CriticalAlertStatus;
  alertType?: string;
  detectedAt?: string;
  resolvedAt?: string;
  durationMinutes?: number;
  recommendedAction?: string;
  description?: string;
}

export interface NormalizedDeviceUpdate {
  id: string;
  deviceId: string;
  timestamp: string;
  type: DeviceUpdateType;
  reading?: DeviceReadingSnapshot;
  gateway?: DeviceGatewaySnapshot;
  alert?: DeviceAlertSnapshot;
  raw?: unknown;
}

interface DeviceReadingState extends DeviceReadingSnapshot {
  timestamp: string;
}

interface DeviceGatewayState extends DeviceGatewaySnapshot {
  timestamp: string;
}

interface DeviceAlertState extends DeviceAlertSnapshot {
  timestamp: string;
}

interface DeviceUpdatesState {
  updates: NormalizedDeviceUpdate[];
  latestReading?: DeviceReadingState;
  latestGateway?: DeviceGatewayState;
  latestAlert?: DeviceAlertState;
  lastEventTimestamp?: string;
}

interface UseDeviceUpdatesResult extends DeviceUpdatesState {
  isStreaming: boolean;
  error: Error | null;
}

const MAX_UPDATES_BUFFER = 50;

const createEmptyState = (): DeviceUpdatesState => ({
  updates: [],
});

const parseJSON = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toIsoString = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
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

const toCriticalAlertStatus = (value: unknown, acknowledged?: boolean): CriticalAlertStatus | undefined => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();

    if (normalized === "resolved" || normalized === "resolve" || normalized === "closed") {
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

  return undefined;
};

const normalizeSensorStatus = (value: unknown): DeviceSensorStatusSnapshot | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;

  const normalized: DeviceSensorStatusSnapshot = {
    totalSensors:
      toNumber(source.totalSensors) ??
      toNumber(source.total) ??
      toNumber(source.count) ??
      toNumber(source?.sensorsTotal),
    online:
      toNumber(source.online) ??
      toNumber(source.onlineSensors) ??
      toNumber(source.active) ??
      toNumber(source.connected),
    offline:
      toNumber(source.offline) ??
      toNumber(source.disconnected) ??
      toNumber(source.sensorsOffline),
    maintenance:
      toNumber(source.maintenance) ??
      toNumber(source.maintenanceSensors) ??
      toNumber(source.scheduled),
    batteryCritical:
      toNumber(source.batteryCritical) ??
      toNumber(source.criticalBattery) ??
      toNumber(source.lowBattery),
  };

  const hasAnyValue = Object.values(normalized).some((entry) => entry !== undefined);
  return hasAnyValue ? normalized : undefined;
};

const toGatewayStatus = (value: string): GatewayStatus | undefined => {
  const normalized = value.toLowerCase();

  if (normalized === "online" || normalized === "degraded" || normalized === "offline") {
    return normalized;
  }

  return undefined;
};

const normalizeGatewayStatus = (value: unknown): GatewayStatus | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return toGatewayStatus(value);
  }

  if (typeof value === "object" && "status" in (value as Record<string, unknown>)) {
    const status = (value as Record<string, unknown>).status;
    return typeof status === "string" ? toGatewayStatus(status) : undefined;
  }

  return undefined;
};

const normalizeDeviceUpdateMessage = (
  rawData: string,
  fallbackDeviceId: string | null | undefined,
  fallbackEventId?: string,
): NormalizedDeviceUpdate => {
  const parsed = parseJSON(rawData);
  const payload =
    parsed && typeof parsed === "object" && "data" in (parsed as Record<string, unknown>)
      ? (parsed as Record<string, unknown>).data
      : parsed;

  const source = (payload as Record<string, unknown>) ?? {};
  const typeValue =
    source.eventType ??
    source.event ??
    source.type ??
    source.kind ??
    source.updateType ??
    source.category ??
    "reading";
  const normalizedType =
    typeof typeValue === "string"
      ? (typeValue.toLowerCase() as DeviceUpdateType)
      : "unknown";

  const timestampValue =
    source.timestamp ?? source.time ?? source.createdAt ?? source.emittedAt ?? Date.now();
  const timestamp = (() => {
    if (typeof timestampValue === "string") {
      const parsedDate = new Date(timestampValue);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }

    if (typeof timestampValue === "number") {
      return new Date(timestampValue).toISOString();
    }

    return new Date().toISOString();
  })();

  const deviceIdValue =
    source.deviceId ?? source.device_id ?? source.id_device ?? fallbackDeviceId ?? "unknown-device";

  const eventId =
    source.id ??
    source.eventId ??
    source.messageId ??
    source.updateId ??
    fallbackEventId ??
    `${deviceIdValue}-${timestamp}-${normalizedType}`;

  const sensorStatus =
    normalizeSensorStatus(source.sensorStatus) ??
    normalizeSensorStatus(source.sensor_status) ??
    normalizeSensorStatus((source.reading as Record<string, unknown> | undefined)?.sensorStatus) ??
    normalizeSensorStatus((source.reading as Record<string, unknown> | undefined)?.sensor_status) ??
    normalizeSensorStatus(source.sensors) ??
    normalizeSensorStatus((source.payload as Record<string, unknown> | undefined)?.sensorStatus) ??
    normalizeSensorStatus((source.payload as Record<string, unknown> | undefined)?.sensor_status) ??
    normalizeSensorStatus(source.payload);

  const averageSignalQuality =
    toNumber(source.averageSignalQuality) ??
    toNumber(source.average_signal_quality) ??
    toNumber(source.signalQuality) ??
    toNumber(source.signal) ??
    toNumber(source.signal_strength) ??
    toNumber((source.gateway as Record<string, unknown> | undefined)?.signalQuality) ??
    toNumber((source.reading as Record<string, unknown> | undefined)?.signalQuality);

  const gatewayStatus =
    normalizeGatewayStatus(source.gatewayStatus) ??
    normalizeGatewayStatus(source.gateway_status) ??
    normalizeGatewayStatus(source.gateway);

  const reading: DeviceReadingSnapshot | undefined = (() => {
    if (sensorStatus || averageSignalQuality !== undefined || gatewayStatus) {
      return {
        sensorStatus,
        averageSignalQuality,
        gatewayStatus,
      } satisfies DeviceReadingSnapshot;
    }

    return undefined;
  })();

  const gatewaySnapshot: DeviceGatewaySnapshot | undefined = (() => {
    const status =
      gatewayStatus ??
      normalizeGatewayStatus(source.status) ??
      normalizeGatewayStatus((source.gateway as Record<string, unknown> | undefined)?.status);

    const signalQuality =
      averageSignalQuality ??
      toNumber((source.gateway as Record<string, unknown> | undefined)?.signalQuality);

    if (status || signalQuality !== undefined) {
      return {
        status,
        signalQuality,
      } satisfies DeviceGatewaySnapshot;
    }

    return undefined;
  })();

  const alertSource =
    (source.alert as Record<string, unknown> | undefined) ??
    (source.payload as Record<string, unknown> | undefined)?.alert ??
    (source.notification as Record<string, unknown> | undefined);

  const alert: DeviceAlertSnapshot | undefined = (() => {
    if (!alertSource) {
      return undefined;
    }

    const message = alertSource.message ?? alertSource.description ?? source.message;
    const severity = alertSource.severity ?? alertSource.level ?? source.severity;
    const status =
      toCriticalAlertStatus(alertSource.status, Boolean(alertSource.acknowledged ?? source.acknowledged)) ??
      toCriticalAlertStatus(source.status, Boolean(alertSource.acknowledged ?? source.acknowledged));
    const detectedAt =
      toIsoString(alertSource.detectedAt)
        ?? toIsoString(alertSource.detected_at)
        ?? toIsoString(source.detectedAt)
        ?? toIsoString(source.detected_at);
    const resolvedAt =
      toIsoString(alertSource.resolvedAt)
        ?? toIsoString(alertSource.resolved_at)
        ?? toIsoString(source.resolvedAt)
        ?? toIsoString(source.resolved_at);
    const durationMinutes =
      toNumber(alertSource.durationMinutes)
        ?? toNumber(alertSource.duration_minutes)
        ?? toNumber(source.durationMinutes)
        ?? toNumber(source.duration_minutes);
    const recommendedAction =
      typeof alertSource.recommendedAction === "string"
        ? alertSource.recommendedAction
        : typeof alertSource.recommended_action === "string"
          ? alertSource.recommended_action
          : typeof source.recommendedAction === "string"
            ? source.recommendedAction
            : undefined;
    const description =
      typeof alertSource.description === "string"
        ? alertSource.description
        : typeof source.description === "string"
          ? source.description
          : typeof message === "string"
            ? message
            : undefined;
    const alertType =
      typeof alertSource.alertType === "string"
        ? alertSource.alertType
        : typeof alertSource.type === "string"
          ? alertSource.type
          : typeof source.alertType === "string"
            ? source.alertType
            : typeof source.eventType === "string"
              ? source.eventType
              : undefined;

    if (!message && !severity && !alertSource.id) {
      return undefined;
    }

    return {
      id: (alertSource.id ?? alertSource.alertId ?? source.alertId ?? eventId) as string | undefined,
      severity: typeof severity === "string" ? severity : undefined,
      message: typeof message === "string" ? message : undefined,
      siloName:
        typeof alertSource.siloName === "string"
          ? alertSource.siloName
          : typeof alertSource.asset === "string"
            ? alertSource.asset
            : typeof source.siloName === "string"
              ? source.siloName
              : undefined,
      acknowledged: Boolean(alertSource.acknowledged ?? alertSource.isAcknowledged ?? source.acknowledged),
      status,
      alertType: typeof alertType === "string" ? alertType : undefined,
      detectedAt,
      resolvedAt,
      durationMinutes: durationMinutes ?? undefined,
      recommendedAction,
      description,
    } satisfies DeviceAlertSnapshot;
  })();

  let normalizedTypeWithFallback = normalizedType;
  if (normalizedTypeWithFallback === "unknown") {
    if (reading) {
      normalizedTypeWithFallback = "reading";
    } else if (alert) {
      normalizedTypeWithFallback = "alert";
    } else if (gatewaySnapshot) {
      normalizedTypeWithFallback = "gateway";
    }
  }

  return {
    id: String(eventId),
    deviceId: String(deviceIdValue),
    timestamp,
    type: normalizedTypeWithFallback,
    reading,
    gateway: gatewaySnapshot,
    alert,
    raw: source,
  } satisfies NormalizedDeviceUpdate;
};

const mergeSensorStatus = (
  previous: DeviceSensorStatusSnapshot | undefined,
  incoming: DeviceSensorStatusSnapshot | undefined,
): DeviceSensorStatusSnapshot | undefined => {
  if (!previous) {
    return incoming;
  }

  if (!incoming) {
    return previous;
  }

  const merged: DeviceSensorStatusSnapshot = {
    totalSensors: incoming.totalSensors ?? previous.totalSensors,
    online: incoming.online ?? previous.online,
    offline: incoming.offline ?? previous.offline,
    maintenance: incoming.maintenance ?? previous.maintenance,
    batteryCritical: incoming.batteryCritical ?? previous.batteryCritical,
  };

  const hasAnyValue = Object.values(merged).some((value) => value !== undefined);
  return hasAnyValue ? merged : undefined;
};

const mergeReadingSnapshot = (
  previous: DeviceReadingState | undefined,
  incoming: DeviceReadingSnapshot | undefined,
  timestamp: string,
): DeviceReadingState | undefined => {
  if (!incoming) {
    return previous;
  }

  return {
    sensorStatus: mergeSensorStatus(previous?.sensorStatus, incoming.sensorStatus) ?? incoming.sensorStatus,
    averageSignalQuality: incoming.averageSignalQuality ?? previous?.averageSignalQuality,
    gatewayStatus: incoming.gatewayStatus ?? previous?.gatewayStatus,
    timestamp,
  } satisfies DeviceReadingState;
};

const mergeGatewaySnapshot = (
  previous: DeviceGatewayState | undefined,
  incoming: DeviceGatewaySnapshot | undefined,
  timestamp: string,
): DeviceGatewayState | undefined => {
  if (!incoming) {
    return previous;
  }

  return {
    status: incoming.status ?? previous?.status,
    signalQuality: incoming.signalQuality ?? previous?.signalQuality,
    timestamp,
  } satisfies DeviceGatewayState;
};

const mergeAlertSnapshot = (
  _previous: DeviceAlertState | undefined,
  incoming: DeviceAlertSnapshot | undefined,
  timestamp: string,
): DeviceAlertState | undefined => {
  if (!incoming) {
    return _previous;
  }

  return {
    ...incoming,
    timestamp,
  } satisfies DeviceAlertState;
};

const updateStateWith = (
  previousState: DeviceUpdatesState,
  update: NormalizedDeviceUpdate,
): DeviceUpdatesState => {
  const updates = [update, ...previousState.updates].slice(0, MAX_UPDATES_BUFFER);

  return {
    updates,
    latestReading: mergeReadingSnapshot(previousState.latestReading, update.reading, update.timestamp),
    latestGateway: mergeGatewaySnapshot(previousState.latestGateway, update.gateway, update.timestamp),
    latestAlert: mergeAlertSnapshot(previousState.latestAlert, update.alert, update.timestamp),
    lastEventTimestamp: update.timestamp,
  } satisfies DeviceUpdatesState;
};

export const useDeviceUpdates = (deviceId: string | null | undefined): UseDeviceUpdatesResult => {
  const [state, setState] = useState<DeviceUpdatesState>(() => createEmptyState());
  const [error, setError] = useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionStatsRef = useRef({
    attempts: 0,
    successes: 0,
    failures: 0,
    messages: 0,
    lastMessageAt: null as string | null,
  });

  useEffect(() => {
    setState(createEmptyState());
    setError(null);

    connectionStatsRef.current = {
      attempts: 0,
      successes: 0,
      failures: 0,
      messages: 0,
      lastMessageAt: null,
    };

    if (!deviceId || typeof window === "undefined" || typeof EventSource === "undefined") {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      return;
    }

    let isDisposed = false;

    const closeEventSource = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

    const scheduleReconnect = (reason: string, delayMs: number) => {
      if (isDisposed) {
        return;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        openConnection(reason);
      }, delayMs);

      console.info("[SSE] Nova tentativa de conexão agendada", {
        deviceId,
        reason,
        delayMs,
        nextAttempt: connectionStatsRef.current.attempts + 1,
      });
    };

    const openConnection = (reason: string) => {
      if (isDisposed) {
        return;
      }

      closeEventSource();
      connectionStatsRef.current.attempts += 1;
      console.info("[SSE] Iniciando conexão com atualizações em tempo real", {
        deviceId,
        attempt: connectionStatsRef.current.attempts,
        reason,
      });

      const eventSource = new EventSource(`/devices/${deviceId}/updates`);
      eventSourceRef.current = eventSource;
      setIsStreaming(false);

      eventSource.onopen = () => {
        connectionStatsRef.current.successes += 1;
        setIsStreaming(true);
        setError(null);
        console.info("[SSE] Conexão estabelecida", {
          deviceId,
          attempt: connectionStatsRef.current.attempts,
          successes: connectionStatsRef.current.successes,
        });
      };

      eventSource.onmessage = (event) => {
        connectionStatsRef.current.messages += 1;
        connectionStatsRef.current.lastMessageAt = new Date().toISOString();

        try {
          const normalized = normalizeDeviceUpdateMessage(event.data, deviceId, event.lastEventId ?? undefined);
          setState((previous) => updateStateWith(previous, normalized));
        } catch (streamError) {
          console.error("Falha ao processar atualização em tempo real", streamError);
        }
      };

      eventSource.onerror = (event) => {
        connectionStatsRef.current.failures += 1;
        console.error("[SSE] Falha na conexão de atualizações em tempo real", {
          deviceId,
          event,
          attempt: connectionStatsRef.current.attempts,
          failures: connectionStatsRef.current.failures,
          readyState: eventSource.readyState,
          messages: connectionStatsRef.current.messages,
          lastMessageAt: connectionStatsRef.current.lastMessageAt,
        });

        if (!isDisposed) {
          setError(new Error("Falha na conexão de atualizações em tempo real."));
          setIsStreaming(false);
        }

        closeEventSource();

        const backoffMs = Math.min(30_000, 2_000 * connectionStatsRef.current.failures);
        scheduleReconnect("erro", backoffMs || 2_000);
      };
    };

    openConnection("inicial");

    return () => {
      isDisposed = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      console.info("[SSE] Encerrando conexão de atualizações", {
        deviceId,
        ...connectionStatsRef.current,
      });

      closeEventSource();
      setIsStreaming(false);
    };
  }, [deviceId]);

  return useMemo(
    () => ({
      ...state,
      isStreaming,
      error,
    }),
    [state, isStreaming, error],
  );
};

interface DeviceUpdatesContextValue extends UseDeviceUpdatesResult {
  deviceId: string | null;
  setActiveDevice: (deviceId: string | null) => void;
}

const DeviceUpdatesContext = createContext<DeviceUpdatesContextValue | undefined>(undefined);

export const DeviceUpdatesProvider = ({ children }: { children: ReactNode }) => {
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const updatesState = useDeviceUpdates(activeDeviceId);

  const setActiveDevice = useCallback((nextDeviceId: string | null) => {
    setActiveDeviceId((previousDeviceId) => {
      if (previousDeviceId === nextDeviceId) {
        return previousDeviceId;
      }

      return nextDeviceId;
    });
  }, []);

  const contextValue = useMemo<DeviceUpdatesContextValue>(
    () => ({
      ...updatesState,
      deviceId: activeDeviceId,
      setActiveDevice,
    }),
    [updatesState, activeDeviceId, setActiveDevice],
  );

  return <DeviceUpdatesContext.Provider value={contextValue}>{children}</DeviceUpdatesContext.Provider>;
};

export const useDeviceUpdatesContext = (): DeviceUpdatesContextValue => {
  const context = useContext(DeviceUpdatesContext);

  if (!context) {
    throw new Error("useDeviceUpdatesContext deve ser utilizado dentro de um DeviceUpdatesProvider.");
  }

  return context;
};

