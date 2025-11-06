import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Droplets, Gauge, Loader2, RotateCw, ThermometerSun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DateRange as DayPickerRange } from 'react-day-picker';
import { toast } from 'sonner';
import { ptBR } from 'date-fns/locale';

import { BarAlerts } from '@/components/charts/BarAlerts';
import { LineHumidity } from '@/components/charts/LineHumidity';
import { LineTemperature } from '@/components/charts/LineTemperature';
import { PieDistribution } from '@/components/charts/PieDistribution';
import { DateRange } from '@/components/filters/DateRange';
import { SiloMultiSelect } from '@/components/filters/SiloMultiSelect';
import { KpiCard } from '@/components/kpi/KpiCard';
import type { KpiTrend } from '@/components/kpi/KpiCard';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFilters } from '@/hooks/useFilters';
import { fetchDataProcess } from '@/lib/api';
import {
  applyDashboardFilters,
  createDashboardMetrics,
  describeFilters,
  extractSiloOptions,
  type DashboardKpi,
} from '@/lib/metrics';

const REFRESH_INTERVAL = 300_000;

const formatMetricValue = (metric: DashboardKpi) => {
  if (metric.value === null) {
    return '--';
  }

  const formatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: metric.decimals,
    minimumFractionDigits: metric.decimals,
  });

  const formatted = formatter.format(metric.value);
  return metric.unit ? `${formatted} ${metric.unit}` : formatted;
};

const resolveTrendDirection = (metric: DashboardKpi): KpiTrend['direction'] => {
  if (metric.change === null) {
    return 'neutral';
  }

  if (Math.abs(metric.change) < 0.01) {
    return 'neutral';
  }

  const isPositive = metric.change > 0;
  if (isPositive) {
    return metric.invertTrend ? 'down' : 'up';
  }

  return metric.invertTrend ? 'up' : 'down';
};

const buildTrend = (metric: DashboardKpi): KpiTrend | undefined => {
  if (metric.change === null) {
    return undefined;
  }

  const formatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
  const value = `${metric.change > 0 ? '+' : ''}${formatter.format(metric.change)}%`;

  return {
    direction: resolveTrendDirection(metric),
    label: `${value} vs período anterior`,
  };
};

const kpiIcons: Record<string, ReactNode> = {
  temperature: <ThermometerSun className="h-5 w-5" />,
  humidity: <Droplets className="h-5 w-5" />,
  environment: <Gauge className="h-5 w-5" />,
  alerts: <AlertTriangle className="h-5 w-5" />,
};

export const DashboardPage = () => {
  const { filters, setFilters } = useFilters();

  const query = useQuery({
    queryKey: ['data-process'],
    queryFn: fetchDataProcess,
    refetchInterval: REFRESH_INTERVAL,
  });

  const [minDate, maxDate] = useMemo(() => {
    if (!query.data || query.data.length === 0) {
      return [undefined, undefined] as const;
    }

    let min = query.data[0]!.periodStart;
    let max = query.data[0]!.periodEnd;

    for (const item of query.data) {
      if (item.periodStart < min) {
        min = item.periodStart;
      }

      if (item.periodEnd > max) {
        max = item.periodEnd;
      }
    }

    return [min, max] as const;
  }, [query.data]);

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
      dateRange: {
        from: range?.from ?? null,
        to: range?.to ?? null,
      },
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
  const showSkeletons = isLoading && !query.data;
  const isRefreshing = query.isFetching && !query.isLoading;
  const showEmptyState = !showSkeletons && filteredData.length === 0;

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
          <DateRange
            value={{
              from: filters.dateRange.from ?? undefined,
              to: filters.dateRange.to ?? undefined,
            }}
            onChange={handleDateChange}
            disabled={isLoading}
            minDate={minDate}
            maxDate={maxDate}
            locale={ptBR}
          />
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
          <KpiCard
            key={metric.id}
            label={metric.title}
            value={formatMetricValue(metric)}
            trend={buildTrend(metric)}
            icon={kpiIcons[metric.id] ?? null}
            isLoading={showSkeletons}
          />
        ))}
      </div>

      {showEmptyState ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Nenhum dado encontrado para os filtros selecionados.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <LineTemperature data={metrics.temperatureSeries} isLoading={showSkeletons} />
        <LineHumidity data={metrics.humiditySeries} isLoading={showSkeletons} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarAlerts data={metrics.alertsBySilo} isLoading={showSkeletons} />
        <PieDistribution data={metrics.distribution} isLoading={showSkeletons} />
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold">Histórico de agregações</CardTitle>
          {isRefreshing ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground"
                  aria-label="Atualizando dados em segundo plano"
                  role="status"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">Atualizando dados em segundo plano…</TooltipContent>
            </Tooltip>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable rows={metrics.tableRows} isLoading={showSkeletons} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
