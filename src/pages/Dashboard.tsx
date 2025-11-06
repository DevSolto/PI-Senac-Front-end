import { useEffect, useMemo } from 'react';
import { Loader2, RotateCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DateRange as DayPickerRange } from 'react-day-picker';
import { toast } from 'sonner';

import { BarAlerts } from '@/components/charts/BarAlerts';
import { LineHumidity } from '@/components/charts/LineHumidity';
import { LineTemperature } from '@/components/charts/LineTemperature';
import { PieDistribution } from '@/components/charts/PieDistribution';
import { DateRange } from '@/components/filters/DateRange';
import { SiloMultiSelect } from '@/components/filters/SiloMultiSelect';
import { KpiCard } from '@/components/kpi/KpiCard';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/hooks/useFilters';
import { fetchDataProcess } from '@/lib/api';
import {
  applyDashboardFilters,
  createDashboardMetrics,
  describeFilters,
  extractSiloOptions,
} from '@/lib/metrics';

const REFRESH_INTERVAL = 300_000;

export const DashboardPage = () => {
  const { filters, setFilters } = useFilters();

  const query = useQuery({
    queryKey: ['data-process'],
    queryFn: fetchDataProcess,
    refetchInterval: REFRESH_INTERVAL,
  });

  const filteredData = useMemo(() => {
    if (!query.data) {
      return [];
    }

    return applyDashboardFilters(query.data, filters);
  }, [filters, query.data]);

  const metrics = useMemo(() => createDashboardMetrics(filteredData), [filteredData]);
  const siloOptions = useMemo(() => (query.data ? extractSiloOptions(query.data) : []), [query.data]);
  const filtersDescription = useMemo(() => describeFilters(filters), [filters]);

  useEffect(() => {
    if (query.isError) {
      const message = query.error instanceof Error ? query.error.message : 'Erro ao carregar dados.';
      toast.error(message);
    }
  }, [query.error, query.isError]);

  const handleDateChange = (range: DayPickerRange | undefined) => {
    setFilters((previous) => ({
      ...previous,
      from: range?.from ?? undefined,
      to: range?.to ?? undefined,
    }));
  };

  const handleSiloChange = (next: string[]) => {
    setFilters((previous) => ({
      ...previous,
      silos: next,
    }));
  };

  const handleRefetch = async () => {
    const result = await query.refetch();
    if (result.status === 'success') {
      toast.success('Dados atualizados com sucesso.');
    } else {
      const message = result.error instanceof Error ? result.error.message : 'Não foi possível atualizar agora.';
      toast.error(message);
    }
  };

  const isLoading = query.isLoading;
  const isRefreshing = query.isFetching && !query.isLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel operacional</h1>
            <p className="text-muted-foreground">
              Acompanhe indicadores ambientais consolidados dos silos monitorados.
            </p>
          </div>
          {filtersDescription ? <p className="text-sm text-muted-foreground">{filtersDescription}</p> : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <DateRange value={{ from: filters.from, to: filters.to }} onChange={handleDateChange} disabled={isLoading} />
          <SiloMultiSelect
            options={siloOptions}
            value={filters.silos}
            onChange={handleSiloChange}
            disabled={isLoading || siloOptions.length === 0}
          />
          <Button onClick={handleRefetch} disabled={query.isFetching} className="md:ml-2">
            {query.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
            Atualizar agora
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} isLoading={isLoading && !query.data} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LineTemperature data={metrics.temperatureSeries} isLoading={isLoading && !query.data} />
        <LineHumidity data={metrics.humiditySeries} isLoading={isLoading && !query.data} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarAlerts data={metrics.alertsBySilo} isLoading={isLoading && !query.data} />
        <PieDistribution data={metrics.distribution} isLoading={isLoading && !query.data} />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Histórico de agregações</CardTitle>
          {isRefreshing ? (
            <span className="text-xs text-muted-foreground">Atualizando dados em segundo plano…</span>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable rows={metrics.tableRows} isLoading={isLoading && !query.data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
