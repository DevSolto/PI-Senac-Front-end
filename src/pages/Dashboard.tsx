import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Droplets, Gauge, Loader2, RotateCw, ThermometerSun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DateRange as DayPickerRange } from 'react-day-picker';
import { toast } from 'sonner';
import { ptBR } from 'date-fns/locale';

import { DateRange } from '@/components/filters/DateRange';
import { SiloMultiSelect } from '@/components/filters/SiloMultiSelect';
import { KpiCard } from '@/components/kpi/KpiCard';
import type { KpiTrend } from '@/components/kpi/KpiCard';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFilters } from '@/hooks/useFilters';
import type { DataProcessRecord } from '@/lib/api';
import { fetchDataProcess } from '@/lib/api';
import {
  applyDashboardFilters,
  createDashboardMetrics,
  describeFilters,
  extractSiloOptions,
  type DashboardKpi,
} from '@/lib/metrics';
import { TemperatureOverTime } from '@/components/charts/simple/TemperatureOverTime';
import { HumidityOverTime } from '@/components/charts/simple/HumidityOverTime';
import { AirQualityOverTime } from '@/components/charts/simple/AirQualityOverTime';
import { EnvironmentScoreOverTime } from '@/components/charts/simple/EnvironmentScoreOverTime';

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
};

export const DashboardPage = () => {
  const { filters, setFilters } = useFilters();
  const previousDataRef = useRef<DataProcessRecord[] | null>(null);
  const filtersContainerRef = useRef<HTMLDivElement | null>(null);

  const query = useQuery({
    queryKey: ['data-process'],
    queryFn: fetchDataProcess,
    refetchInterval: REFRESH_INTERVAL,
  });

  useEffect(() => {
    if (query.status === 'success') {
      previousDataRef.current = query.data ?? [];
    }
  }, [query.data, query.status]);

  useEffect(() => {
    console.info('[Dashboard] Estado da consulta atualizado.', {
      status: query.status,
      isFetching: query.isFetching,
      isLoading: query.isLoading,
      isError: query.isError,
    });
  }, [query.isError, query.isFetching, query.isLoading, query.status]);

  useEffect(() => {
    if (query.data) {
      console.debug('[Dashboard] Dados recebidos do backend.', {
        totalRegistros: query.data.length,
        primeiroPeriodo: query.data[0]?.periodStart?.toISOString() ?? null,
        ultimoPeriodo: query.data[query.data.length - 1]?.periodEnd?.toISOString() ?? null,
      });
    } else if (!query.isLoading) {
      console.debug('[Dashboard] Nenhum dado retornado para o dashboard.');
    }
  }, [query.data, query.isLoading]);

  const dataset = query.data ?? previousDataRef.current ?? [];

  const [minDate, maxDate] = useMemo(() => {
    if (dataset.length === 0) {
      return [undefined, undefined] as const;
    }

    let min = dataset[0]!.periodStart;
    let max = dataset[0]!.periodEnd;

    for (const item of dataset) {
      if (item.periodStart < min) {
        min = item.periodStart;
      }

      if (item.periodEnd > max) {
        max = item.periodEnd;
      }
    }

    return [min, max] as const;
  }, [dataset]);

  const filteredData = useMemo(() => applyDashboardFilters(dataset, filters), [dataset, filters]);

  const metrics = useMemo(() => createDashboardMetrics(filteredData), [filteredData]);
  const siloOptions = useMemo(() => (dataset.length > 0 ? extractSiloOptions(dataset) : []), [dataset]);
  const filtersDescription = useMemo(() => describeFilters(filters), [filters]);
  useEffect(() => {
    console.info('[Dashboard] Filtros atualizados.', filters);
  }, [filters]);

  useEffect(() => {
    console.debug('[Dashboard] Resultado dos filtros aplicado.', {
      totalOriginal: dataset.length,
      totalFiltrado: filteredData.length,
    });
  }, [dataset, filteredData]);

  useEffect(() => {
    console.debug('[Dashboard] Opções de silos recalculadas.', {
      totalSilos: siloOptions.length,
    });
  }, [siloOptions]);

  useEffect(() => {
    console.debug('[Dashboard] Métricas consolidadas atualizadas.', {
      totalKpis: metrics.kpis.length,
      temperaturaSeries: metrics.temperatureSeries.length,
      umidadeSeries: metrics.humiditySeries.length,
      alertas: metrics.alertsBySilo.length,
      distribuicoes: metrics.distribution.length,
      linhasTabela: metrics.tableRows.length,
    });
  }, [metrics]);

  useEffect(() => {
    const possuiDadosAntigos = (previousDataRef.current?.length ?? 0) > 0;
    console.info('[Dashboard] Estado de dados vazios atualizado.', {
      exibindoEstadoVazio: filteredData.length === 0,
      carregandoSkeleton: query.isLoading && !possuiDadosAntigos,
      possuiDadosAntigos,
    });
  }, [filteredData.length, query.isLoading, query.status]);

  useEffect(() => {
    if (query.isError) {
      const message = query.error instanceof Error ? query.error.message : 'Erro ao carregar dados.';
      console.error('Erro ao carregar agregações do dashboard:', query.error);
      toast.error(message);
    }
  }, [query.error, query.isError]);

  const handleDateChange = (range: DayPickerRange | undefined) => {
    console.info('[Dashboard] Intervalo de datas alterado.', {
      de: range?.from?.toISOString() ?? null,
      ate: range?.to?.toISOString() ?? null,
    });
    setFilters((previous) => ({
      ...previous,
      dateRange: {
        from: range?.from ?? null,
        to: range?.to ?? null,
      },
    }));
  };

  const handleSiloChange = (next: string[]) => {
    console.info('[Dashboard] Seleção de silos alterada.', { totalSelecionados: next.length, selecionados: next });
    setFilters((previous) => ({
      ...previous,
      silos: next,
    }));
  };

  const handleRefetch = async () => {
    console.info('[Dashboard] Atualização manual iniciada pelo usuário.');
    const result = await query.refetch({ cancelRefetch: false });
    console.info('[Dashboard] Atualização manual finalizada.', { status: result.status });
    if (result.status === 'success') {
      toast.success('Dados atualizados com sucesso.');
    } else {
      const message = result.error instanceof Error ? result.error.message : 'Não foi possível atualizar agora.';
      toast.error(message);
    }
  };

  const handleAdjustFilters = useCallback(() => {
    filtersContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const isLoading = query.isLoading;
  const hasPreviousData = (previousDataRef.current?.length ?? 0) > 0;
  const showSkeletons = isLoading && !hasPreviousData;
  const isRefreshing = query.isFetching && !query.isLoading;
  const showEmptyState = !showSkeletons && filteredData.length === 0;
  const showErrorAlert = query.isError;

  return (
    <div className="space-y-10 xl:space-y-12">
      <div
        ref={filtersContainerRef}
        className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between"
      >
        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel operacional</h1>
            <p className="text-muted-foreground">
              Acompanhe indicadores ambientais consolidados dos silos monitorados.
            </p>
          </div>
          {filtersDescription ? <p className="text-sm text-muted-foreground">{filtersDescription}</p> : null}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
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

      {showErrorAlert ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Não foi possível carregar as métricas neste momento. Tente novamente.</span>
            <Button variant="secondary" size="sm" onClick={handleRefetch}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-4 xl:grid-cols-4">
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
          <div className="flex flex-col items-center justify-center gap-3">
            <span>Nenhum dado encontrado para os filtros selecionados.</span>
            <Button variant="outline" size="sm" onClick={handleAdjustFilters}>
              Ajustar filtros
            </Button>
          </div>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <TemperatureOverTime data={metrics.temperatureSeries} height={300} />
        <HumidityOverTime data={metrics.humiditySeries} height={300} />
        <AirQualityOverTime
          data={metrics.airQualitySeries.map((point) => ({
            timestamp: point.timestamp,
            average: point.average,
          }))}
          height={300}
        />
        <EnvironmentScoreOverTime
          data={metrics.tableRows.map((r) => ({
            timestamp: r.periodStart,
            environmentScore: r.environmentScore ?? null,
          }))}
        />
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
