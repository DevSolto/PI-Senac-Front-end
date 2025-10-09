"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  acknowledgeCriticalAlert,
  getCriticalAlerts,
  resolveCriticalAlert,
} from "../api";
import { mergeCriticalAlerts, normalizeDeviceAlertEvent } from "../transformers/alerts";
import type { CriticalAlert } from "../types";
import { useDeviceUpdatesContext } from "./use-device-updates";

interface AlertActionFeedback {
  status: "success" | "error";
  message: string;
}

export interface AlertActionState {
  acknowledging: boolean;
  resolving: boolean;
  feedback?: AlertActionFeedback;
}

export interface UseCriticalAlertsOptions {
  deviceId: string | null | undefined;
  initialAlerts?: CriticalAlert[];
  autoRefresh?: boolean;
}

export interface UseCriticalAlertsResult {
  alerts: CriticalAlert[];
  actionState: Record<string, AlertActionState | undefined>;
  isLoading: boolean;
  error: Error | null;
  acknowledgeAlert: (alert: CriticalAlert) => Promise<void>;
  resolveAlert: (alert: CriticalAlert) => Promise<void>;
  refetch: () => Promise<CriticalAlert[]>;
}

const normalizeError = (error: unknown, fallbackMessage: string): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

export const useCriticalAlerts = ({
  deviceId,
  initialAlerts = [],
  autoRefresh = true,
}: UseCriticalAlertsOptions): UseCriticalAlertsResult => {
  const { latestAlert, deviceId: streamingDeviceId } = useDeviceUpdatesContext();
  const [alerts, setAlerts] = useState<CriticalAlert[]>(initialAlerts);
  const [actionStateMap, setActionStateMap] = useState<Record<string, AlertActionState | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const lastProcessedAlertRef = useRef<string | null>(null);
  const feedbackTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Object.values(feedbackTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      feedbackTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  const updateActionState = useCallback((alertId: string, updater: (state: AlertActionState) => AlertActionState) => {
    setActionStateMap((previous) => {
      const current = previous[alertId] ?? { acknowledging: false, resolving: false };
      const next = updater(current);

      if (!next.acknowledging && !next.resolving && !next.feedback) {
        const { [alertId]: _removed, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [alertId]: next,
      };
    });
  }, []);

  const scheduleFeedbackClear = useCallback((alertId: string) => {
    const existingTimeout = feedbackTimeoutsRef.current[alertId];
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(() => {
      setActionStateMap((previous) => {
        const current = previous[alertId];
        if (!current) {
          return previous;
        }

        const next: AlertActionState = {
          ...current,
          feedback: undefined,
        };

        if (!next.acknowledging && !next.resolving && !next.feedback) {
          const { [alertId]: _removed, ...rest } = previous;
          return rest;
        }

        return {
          ...previous,
          [alertId]: next,
        };
      });
      delete feedbackTimeoutsRef.current[alertId];
    }, 5000);

    feedbackTimeoutsRef.current[alertId] = timeoutId;
  }, []);

  const refetch = useCallback(async () => {
    if (!deviceId) {
      const missingDeviceError = new Error("Nenhum dispositivo selecionado");
      setError(missingDeviceError);
      setAlerts([]);
      throw missingDeviceError;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedAlerts = await getCriticalAlerts(deviceId);
      if (isMountedRef.current) {
        setAlerts(fetchedAlerts);
      }
      return fetchedAlerts;
    } catch (caughtError) {
      const normalized = normalizeError(caughtError, "Não foi possível carregar os alertas críticos.");
      if (isMountedRef.current) {
        setError(normalized);
      }
      throw normalized;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [deviceId]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    if (!deviceId) {
      setAlerts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    refetch().catch(() => {});
  }, [autoRefresh, deviceId, refetch]);

  useEffect(() => {
    if (!deviceId || !latestAlert || streamingDeviceId !== deviceId) {
      return;
    }

    const uniqueKey = `${latestAlert.id ?? "unknown"}-${latestAlert.timestamp}`;
    if (lastProcessedAlertRef.current === uniqueKey) {
      return;
    }

    lastProcessedAlertRef.current = uniqueKey;
    const normalized = normalizeDeviceAlertEvent(latestAlert, { emittedAt: latestAlert.timestamp });

    setAlerts((previous) => mergeCriticalAlerts(previous, normalized));
  }, [deviceId, latestAlert, streamingDeviceId]);

  useEffect(() => {
    setActionStateMap({});
  }, [deviceId]);

  const handleMissingDevice = useCallback(
    (alertId: string) => {
      updateActionState(alertId, (state) => ({
        ...state,
        feedback: {
          status: "error",
          message: "Nenhum dispositivo selecionado para aplicar a ação.",
        },
      }));
      scheduleFeedbackClear(alertId);
    },
    [scheduleFeedbackClear, updateActionState],
  );

  const acknowledgeAlert = useCallback(
    async (alert: CriticalAlert) => {
      if (!deviceId) {
        handleMissingDevice(alert.id);
        return;
      }

      updateActionState(alert.id, (state) => ({
        ...state,
        acknowledging: true,
        feedback: undefined,
      }));

      try {
        const updated = await acknowledgeCriticalAlert(deviceId, alert.id);

        if (!isMountedRef.current) {
          return;
        }

        setAlerts((previous) => mergeCriticalAlerts(previous, updated));
        updateActionState(alert.id, (state) => ({
          ...state,
          acknowledging: false,
          feedback: {
            status: "success",
            message: "Reconhecimento registrado com sucesso.",
          },
        }));
        scheduleFeedbackClear(alert.id);
      } catch (caughtError) {
        const normalized = normalizeError(caughtError, "Não foi possível registrar o reconhecimento.");
        console.error("Falha ao reconhecer alerta crítico", normalized);

        if (!isMountedRef.current) {
          return;
        }

        updateActionState(alert.id, (state) => ({
          ...state,
          acknowledging: false,
          feedback: {
            status: "error",
            message: normalized.message,
          },
        }));
        scheduleFeedbackClear(alert.id);
      }
    },
    [deviceId, handleMissingDevice, scheduleFeedbackClear, updateActionState],
  );

  const resolveAlert = useCallback(
    async (alert: CriticalAlert) => {
      if (!deviceId) {
        handleMissingDevice(alert.id);
        return;
      }

      updateActionState(alert.id, (state) => ({
        ...state,
        resolving: true,
        feedback: undefined,
      }));

      try {
        const updated = await resolveCriticalAlert(deviceId, alert.id);

        if (!isMountedRef.current) {
          return;
        }

        setAlerts((previous) => mergeCriticalAlerts(previous, updated));
        updateActionState(alert.id, (state) => ({
          ...state,
          resolving: false,
          feedback: {
            status: "success",
            message: "Alerta marcado como resolvido.",
          },
        }));
        scheduleFeedbackClear(alert.id);
      } catch (caughtError) {
        const normalized = normalizeError(caughtError, "Não foi possível marcar o alerta como resolvido.");
        console.error("Falha ao resolver alerta crítico", normalized);

        if (!isMountedRef.current) {
          return;
        }

        updateActionState(alert.id, (state) => ({
          ...state,
          resolving: false,
          feedback: {
            status: "error",
            message: normalized.message,
          },
        }));
        scheduleFeedbackClear(alert.id);
      }
    },
    [deviceId, handleMissingDevice, scheduleFeedbackClear, updateActionState],
  );

  const actionState = useMemo(() => actionStateMap, [actionStateMap]);

  return {
    alerts,
    actionState,
    isLoading,
    error,
    acknowledgeAlert,
    resolveAlert,
    refetch,
  };
};
