import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDashboardOverview } from "../api";
import type { GetDashboardOverviewOptions } from "../api";
import type { DashboardOverview, DashboardOverviewService } from "../types";

export interface DashboardOverviewFetcher extends DashboardOverviewService {}

export interface UseDashboardOverviewOptions {
  deviceId: string | null | undefined;
  service?: DashboardOverviewFetcher;
  autoFetch?: boolean;
  initialData?: DashboardOverview | null;
}

interface FetchOptions {
  silent?: boolean;
}

interface UseDashboardOverviewResult {
  data: DashboardOverview | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<DashboardOverview>;
  refresh: () => Promise<DashboardOverview>;
}

export const createDashboardOverviewService = (
  options?: GetDashboardOverviewOptions,
): DashboardOverviewFetcher => ({
  async getOverview(deviceId: string) {
    return getDashboardOverview(deviceId, options);
  },
});

const defaultService = createDashboardOverviewService();

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Falha ao carregar a visão geral do dashboard");
};

export const useDashboardOverview = ({
  deviceId,
  service,
  autoFetch = true,
  initialData = null,
}: UseDashboardOverviewOptions): UseDashboardOverviewResult => {
  const resolvedService = service ?? defaultService;
  const [data, setData] = useState<DashboardOverview | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const fetchOverview = useCallback(
    async ({ silent = false }: FetchOptions = {}) => {
      if (!deviceId) {
        const missingDeviceError = new Error("Nenhum dispositivo selecionado");
        if (isMountedRef.current && !silent) {
          setIsLoading(false);
        }
        if (isMountedRef.current) {
          setError(missingDeviceError);
        }
        throw missingDeviceError;
      }

      if (isMountedRef.current && !silent) {
        setIsLoading(true);
      }

      if (isMountedRef.current) {
        setError(null);
      }

      try {
        const overview = await resolvedService.getOverview(deviceId);
        if (isMountedRef.current) {
          setData(overview);
        }
        return overview;
      } catch (caughtError) {
        const normalized = normalizeError(caughtError);
        if (isMountedRef.current) {
          setError(normalized);
        }
        throw normalized;
      } finally {
        if (isMountedRef.current && !silent) {
          setIsLoading(false);
        }
      }
    },
    [deviceId, resolvedService],
  );

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (!deviceId) {
      if (isMountedRef.current) {
        setData(initialData);
        setIsLoading(false);
        setError(null);
      }
      return;
    }

    fetchOverview().catch(() => {});
  }, [autoFetch, deviceId, fetchOverview, initialData]);

  const refetch = useCallback(() => fetchOverview({ silent: false }), [fetchOverview]);

  const refresh = useCallback(() => fetchOverview({ silent: true }), [fetchOverview]);

  const isError = useMemo(() => error !== null, [error]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    refresh,
  };
};
