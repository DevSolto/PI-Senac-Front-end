import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { listAlertsBySilo } from '@/shared/api/alerts';
import { listSilos } from '@/shared/api/silos';
import type { Silo } from '@/shared/api/silos.types';

type SilosStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseSilosResult {
  silos: Silo[];
  status: SilosStatus;
  error: string | null;
  refresh: () => Promise<void>;
  append: (silo: Silo) => void;
}

export function useSilos(): UseSilosResult {
  const [silos, setSilos] = useState<Silo[]>([]);
  const [status, setStatus] = useState<SilosStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchAlertsCount = useCallback(async (siloId: number) => {
    try {
      const alerts = await listAlertsBySilo(siloId);
      return alerts.length;
    } catch (err) {
      console.error('Erro ao carregar alertas do silo', siloId, err);
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSilos = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listSilos();
      const silosWithAlerts = await Promise.all(
        response.map(async silo => {
          const alertsCount = await fetchAlertsCount(silo.id);
          return {
            ...silo,
            alertsCount: alertsCount ?? silo.alertsCount ?? 0,
          };
        }),
      );

      if (isMounted.current) {
        setSilos(silosWithAlerts);
        setStatus('ready');
      }
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      console.error('Erro ao carregar silos', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os silos.');
    }
  }, [fetchAlertsCount]);

  useEffect(() => {
    void fetchSilos();
  }, [fetchSilos]);

  const append = useCallback((silo: Silo) => {
    if (!isMounted.current) {
      return;
    }

    setSilos(previous => [silo, ...previous]);
    setError(null);
    setStatus('ready');
  }, []);

  const refresh = useCallback(async () => {
    await fetchSilos();
  }, [fetchSilos]);

  const normalizedStatus = useMemo<SilosStatus>(() => {
    if (status === 'ready' && silos.length === 0) {
      return 'ready';
    }

    return status;
  }, [silos.length, status]);

  return {
    silos,
    status: normalizedStatus,
    error,
    refresh,
    append,
  };
}
