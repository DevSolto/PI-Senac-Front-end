import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { listCompanies } from '@/shared/api/companies';
import type { Company } from '@/shared/api/companies.types';

type CompaniesStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseCompaniesResult {
  companies: Company[];
  status: CompaniesStatus;
  error: string | null;
  refresh: () => Promise<void>;
  append: (company: Company) => void;
}

export function useCompanies(): UseCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<CompaniesStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCompanies = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listCompanies();
      if (!isMounted.current) {
        return;
      }

      setCompanies(response);
      setStatus('ready');
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      console.error('Erro ao carregar companhias', err);
      setStatus('error');
      setError(
        err instanceof Error ? err.message : 'Não foi possível carregar as companhias.',
      );
    }
  }, []);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const append = useCallback((company: Company) => {
    if (!isMounted.current) {
      return;
    }

    setCompanies(previous => [company, ...previous]);
    setError(null);
    setStatus('ready');
  }, []);

  const refresh = useCallback(async () => {
    await fetchCompanies();
  }, [fetchCompanies]);

  const normalizedStatus = useMemo<CompaniesStatus>(() => {
    if (status === 'ready' && companies.length === 0) {
      return 'ready';
    }

    return status;
  }, [companies.length, status]);

  return {
    companies,
    status: normalizedStatus,
    error,
    refresh,
    append,
  };
}
