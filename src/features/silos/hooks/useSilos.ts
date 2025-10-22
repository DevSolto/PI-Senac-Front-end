import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
      if (!isMounted.current) {
        return;
      }

      setSilos(response);
      setStatus('ready');
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      console.error('Erro ao carregar silos', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os silos.');
    }
  }, []);

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
