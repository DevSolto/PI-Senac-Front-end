import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { DashboardFilters } from '@/lib/metrics';

const parseDateParam = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const parseFilters = (params: URLSearchParams): DashboardFilters => {
  const from = parseDateParam(params.get('from'));
  const to = parseDateParam(params.get('to'));
  const silosParam = params.get('silos') ?? '';
  const silos = silosParam
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return { from, to, silos };
};

const buildSearchParams = (filters: DashboardFilters) => {
  const params = new URLSearchParams();

  if (filters.from) {
    params.set('from', filters.from.toISOString());
  }

  if (filters.to) {
    params.set('to', filters.to.toISOString());
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

  return { filters, setFilters };
};

export type UseFiltersReturn = ReturnType<typeof useFilters>;
