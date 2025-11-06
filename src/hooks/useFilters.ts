import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

import type { DashboardFilters } from '@/lib/metrics';

const DATE_FORMAT = 'yyyy-MM-dd';

const parseDateParam = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.warn('Não foi possível interpretar a data fornecida nos filtros.', error);
    return null;
  }
};

const parseFilters = (params: URLSearchParams): DashboardFilters => {
  const from = parseDateParam(params.get('from'));
  const to = parseDateParam(params.get('to'));
  const silosParam = params.get('silos') ?? '';
  const silos = silosParam
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    dateRange: { from, to },
    silos,
  };
};

const buildSearchParams = (filters: DashboardFilters) => {
  const params = new URLSearchParams();

  const { from, to } = filters.dateRange;

  if (from) {
    params.set('from', format(from, DATE_FORMAT));
  }

  if (to) {
    params.set('to', format(to, DATE_FORMAT));
  }

  if (filters.silos.length > 0) {
    params.set('silos', filters.silos.join(','));
  }

  return params;
};

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (updater: DashboardFilters | ((prev: DashboardFilters) => DashboardFilters)) => {
      setSearchParams((current) => {
        const previous = parseFilters(current);
        const next = typeof updater === 'function' ? updater(previous) : updater;
        return buildSearchParams(next);
      }, { replace: true });
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters, reset };
};

export type UseFiltersReturn = ReturnType<typeof useFilters>;
