"use client";

import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { MetricHistoryChart } from "@/components/charts/metric-history-chart";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { MetricCard, type MetricCardTone } from "@/features/dashboard/components/metric-card";
import { MonthlyAlertsCard } from "@/features/dashboard/components/monthly-alerts-card";
import { StatusBanner } from "@/features/dashboard/components/status-banner";
import { CriticalAlertCard } from "@/features/dashboard/components/critical-alert-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { useCriticalAlerts } from "@/features/dashboard/hooks/use-critical-alerts";
import { useDeviceUpdatesContext } from "@/features/dashboard/hooks/use-device-updates";
import type { DashboardMetrics } from "@/features/dashboard/types";

interface DashboardPageProps {
  deviceId?: string | null;
}

function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {children ? <div className="mt-4 flex justify-center">{children}</div> : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-10" aria-busy="true">
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div
          role="status"
          aria-live="polite"
          aria-label="Carregando visão geral do dashboard"
          className="space-y-6"
        >
          <span className="sr-only">Carregando visão geral do dashboard</span>
          <Skeleton className="h-24 w-full rounded-2xl" data-testid="dashboard-loading-banner" aria-hidden />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`metric-${index}`}
                className="h-32 w-full rounded-xl"
                data-testid="dashboard-loading-metric"
                aria-hidden
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`history-${index}`}
                className="h-56 w-full rounded-2xl"
                data-testid="dashboard-loading-history"
                aria-hidden
              />
            ))}
          </div>
          <Skeleton className="h-52 w-full rounded-2xl" data-testid="dashboard-loading-alerts" aria-hidden />
          <Skeleton className="h-64 w-full rounded-2xl" data-testid="dashboard-loading-monthly" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ deviceId: deviceIdProp }: DashboardPageProps = {}) {
  const searchParams = useSearchParams();
  const deviceId = deviceIdProp ?? searchParams.get("deviceId");
  const { data, isLoading, isError, error, refresh, refetch } = useDashboardOverview({
    deviceId,
    autoFetch: Boolean(deviceId),
  });
  const { setActiveDevice, latestReading, latestGateway } = useDeviceUpdatesContext();

  useEffect(() => {
    setActiveDevice(deviceId ?? null);

    return () => {
      setActiveDevice(null);
    };
  }, [deviceId, setActiveDevice]);

  useEffect(() => {
    if (!deviceId) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refresh().catch((refreshError) => {
        console.error("Falha ao atualizar a visão geral do dashboard", refreshError);
      });
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [deviceId, refresh]);

  const handleMetricSelect = useCallback((metricKey: keyof DashboardMetrics) => {
    console.info("Selecionar métrica para detalhamento futuro:", metricKey);
  }, []);

  const handleViewAllAlerts = useCallback(() => {
    console.info("Navegar para a lista completa de alertas críticos");
  }, []);

  const handleRetryOverview = useCallback(() => {
    refetch().catch((refetchError) => {
      console.error("Falha ao tentar carregar novamente a visão geral", refetchError);
    });
  }, [refetch]);

  if (!deviceId) {
    return (
      <div className="py-10">
        <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Selecione um dispositivo"
            description="Escolha um silo para visualizar a visão geral de operação."
          />
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (isError && !data) {
    return (
      <div className="py-10">
        <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Não foi possível carregar o dashboard"
            description={error?.message ?? "Tente novamente em instantes."}
            >
              <Button type="button" variant="outline" onClick={handleRetryOverview}>
                Tentar novamente
              </Button>
            </EmptyState>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-10">
        <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Dados indisponíveis no momento"
            description="Não encontramos métricas recentes para este dispositivo. Aguarde alguns instantes e tente atualizar novamente."
          >
            <Button type="button" variant="outline" onClick={handleRetryOverview}>
              Atualizar dados
            </Button>
          </EmptyState>
        </div>
      </div>
    );
  }

  const {
    farm,
    sensorStatus,
    sensorsStatus,
    metrics,
    criticalAlerts: initialCriticalAlerts,
    monthlyAlertBreakdown,
    monthlyAlertTotals,
    historyDatasets,
  } = data;

  const {
    alerts: criticalAlerts,
    actionState: criticalAlertActionState,
    isLoading: isLoadingCriticalAlerts,
    acknowledgeAlert,
    resolveAlert,
  } = useCriticalAlerts({
    deviceId,
    initialAlerts: initialCriticalAlerts,
  });

  const streamSensorStatus = latestReading?.sensorStatus;
  const gatewayStatus = latestReading?.gatewayStatus ?? latestGateway?.status ?? sensorStatus.gatewayStatus;
  const averageSignalQuality =
    latestReading?.averageSignalQuality ?? latestGateway?.signalQuality ?? sensorStatus.averageSignalQuality;

  const liveSensorStatus = {
    totalSensors: streamSensorStatus?.totalSensors ?? sensorStatus.totalSensors,
    online: streamSensorStatus?.online ?? sensorStatus.online,
    offline: streamSensorStatus?.offline ?? sensorStatus.offline,
    maintenance: streamSensorStatus?.maintenance ?? sensorStatus.maintenance,
    batteryCritical: streamSensorStatus?.batteryCritical ?? sensorStatus.batteryCritical,
    averageSignalQuality,
    gatewayStatus,
  } satisfies typeof sensorStatus;

  const offlineSensors = liveSensorStatus.offline ?? 0;
  const criticalBatteries = liveSensorStatus.batteryCritical ?? 0;

  const bannerVariant = (() => {
    if (liveSensorStatus.gatewayStatus === "offline" || sensorsStatus !== "OK") {
      return "danger" as const;
    }

    if (liveSensorStatus.gatewayStatus === "degraded" || offlineSensors > 0 || criticalBatteries > 0) {
      return "warning" as const;
    }

    return "ok" as const;
  })();

  const bannerMessage = useMemo(() => {
    if (liveSensorStatus.gatewayStatus === "offline") {
      return "Gateway desconectado. Telemetria em tempo real indisponível.";
    }

    if (sensorsStatus !== "OK") {
      return "Alguns sensores apresentam falhas.";
    }

    if (liveSensorStatus.gatewayStatus === "degraded") {
      return "Gateway em modo degradado. Monitorar estabilidade do sinal.";
    }

    if (offlineSensors > 0) {
      return `${offlineSensors} ${offlineSensors === 1 ? "sensor offline" : "sensores offline"}.`;
    }

    if (criticalBatteries > 0) {
      return `${criticalBatteries} ${
        criticalBatteries === 1 ? "sensor com bateria crítica" : "sensores com bateria crítica"
      }.`;
    }

    return undefined;
  }, [criticalBatteries, liveSensorStatus.gatewayStatus, offlineSensors, sensorsStatus]);

  const metricToneMap: Partial<Record<keyof DashboardMetrics, MetricCardTone>> = {
    activeAlerts: "danger",
    silosOkPercentage: "success",
    averageTemperature: "warning",
  };

  return (
    <div className="py-10">
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader
          farm={farm}
          sensorStatus={sensorStatus}
          realtimeSensorStatus={liveSensorStatus}
          statusBannerVariant={bannerVariant}
          statusBannerMessage={bannerMessage}
        />


        <section aria-label="Indicadores principais" className="space-y-4">
          <header className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Indicadores principais
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Visão geral da operação</h2>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(Object.entries(metrics) as [keyof DashboardMetrics, DashboardMetrics[keyof DashboardMetrics]][]).map(
              ([metricKey, metric]) => (
                <div
                  key={metricKey}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalhes da métrica ${metric.label}`}
                  onClick={() => handleMetricSelect(metricKey)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleMetricSelect(metricKey);
                    }
                  }}
                  className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MetricCard
                    metric={metric}
                    tone={metricToneMap[metricKey]}
                    className="transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lg"
                  />
                </div>
              ),
            )}
          </div>
        </section>

        <section aria-label="Histórico de leituras" className="space-y-4">
          <header className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Histórico de leituras
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Tendências dos sensores ambientais</h2>
          </header>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <MetricHistoryChart
              title="Temperatura"
              description="Série temporal com base nas leituras históricas."
              unit="°C"
              data={historyDatasets.temperature}
              chartHeight={170}
              chartClassName="text-amber-500 dark:text-amber-400"
              chartWrapperClassName="h-44"
              emptyState="Ainda não há leituras suficientes de temperatura."
            />
            <MetricHistoryChart
              title="Umidade"
              description="Evolução recente da umidade relativa registrada."
              unit="%"
              data={historyDatasets.humidity}
              chartHeight={170}
              chartClassName="text-sky-500 dark:text-sky-400"
              chartWrapperClassName="h-44"
              emptyState="Ainda não há leituras suficientes de umidade."
            />
            <MetricHistoryChart
              title="CO₂"
              description="Concentração em partes por milhão ao longo do tempo."
              unit="ppm"
              data={historyDatasets.co2}
              chartHeight={170}
              chartClassName="text-emerald-500 dark:text-emerald-400"
              chartWrapperClassName="h-44"
              emptyState="Ainda não há leituras suficientes de CO₂."
            />
          </div>
        </section>

        <section
          aria-labelledby="critical-alerts-heading"
          className="space-y-4 rounded-2xl border border-border/60 bg-background p-6 shadow-sm"
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Alertas críticos
              </p>
              <h2 id="critical-alerts-heading" className="text-2xl font-semibold text-foreground">
                Atividades que exigem atenção imediata
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleViewAllAlerts}
              aria-label="Ver todos os alertas críticos"
            >
              Ver todos
            </Button>
          </div>
          {isLoadingCriticalAlerts && criticalAlerts.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[0, 1].map((index) => (
                <Skeleton key={index} className="h-48 w-full rounded-xl" aria-hidden />
              ))}
            </div>
          ) : criticalAlerts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {criticalAlerts.map((alert) => (
                <CriticalAlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onResolve={resolveAlert}
                  actionState={criticalAlertActionState[alert.id]}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum alerta crítico ativo"
              description="Os sensores não registraram alertas críticos recentemente. Continue monitorando para reagir rapidamente a novas ocorrências."
            />
          )}
        </section>

        <section
          aria-labelledby="monthly-alerts-heading"
          className="rounded-2xl border border-border/60 bg-background p-6 shadow-sm"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Alertas mensais
            </p>
            <h2 id="monthly-alerts-heading" className="text-2xl font-semibold text-foreground">
              Tendências e distribuição de alertas no ano
            </h2>
          </div>
          <div className="mt-6">
            <MonthlyAlertsCard alerts={monthlyAlertBreakdown} totals={monthlyAlertTotals} />
          </div>
        </section>
      </div>
    </div>
  );
}
