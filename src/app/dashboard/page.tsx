"use client";

import { useCallback, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { MetricCard, type MetricCardTone } from "@/features/dashboard/components/metric-card";
import { MonthlyAlertsCard } from "@/features/dashboard/components/monthly-alerts-card";
import { StatusBanner } from "@/features/dashboard/components/status-banner";
import { CriticalAlertCard } from "@/features/dashboard/components/critical-alert-card";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import type { DashboardMetrics } from "@/features/dashboard/types";
import { Header } from "@/components/header";

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, refresh } = useDashboardOverview();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refresh().catch((error) => {
        console.error("Falha ao atualizar a visão geral do dashboard", error);
      });
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const handleMetricSelect = useCallback((metricKey: keyof DashboardMetrics) => {
    console.info("Selecionar métrica para detalhamento futuro:", metricKey);
  }, []);

  const handleViewAllAlerts = useCallback(() => {
    console.info("Navegar para a lista completa de alertas críticos");
  }, []);

  if (!data) {
    return null;
  }

  const { farm, sensorStatus, sensorsStatus, metrics, criticalAlerts, monthlyAlertBreakdown } =
    data;

  const { bannerVariant, bannerMessage } = useMemo(() => {
    const hasSensorFailures = sensorsStatus !== "OK";
    const hasOperationalWarnings = sensorStatus.offline > 0 || sensorStatus.batteryCritical > 0;

    if (hasSensorFailures) {
      return {
        bannerVariant: "danger" as const,
        bannerMessage: "Alguns sensores apresentam falhas",
      };
    }

    if (hasOperationalWarnings) {
      return {
        bannerVariant: "warning" as const,
        bannerMessage: undefined,
      };
    }

    return {
      bannerVariant: "ok" as const,
      bannerMessage: undefined,
    };
  }, [sensorStatus.batteryCritical, sensorStatus.offline, sensorsStatus]);

  const metricToneMap: Partial<Record<keyof DashboardMetrics, MetricCardTone>> = {
    monitoredSilos: "info",
    activeAlerts: "danger",
    silosOkPercentage: "success",
    averageTemperature: "warning",
  };

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <Header />
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader farm={farm} sensorStatus={sensorStatus} />
        <StatusBanner
          sensorStatus={sensorStatus}
          variant={bannerVariant}
          message={bannerMessage}
          className="shadow-sm"
        />

        <section aria-label="Indicadores principais" className="space-y-4">
          <header className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Indicadores monitorados
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
          {criticalAlerts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {criticalAlerts.map((alert) => (
                <CriticalAlertCard key={alert.id} alert={alert} />
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
            <MonthlyAlertsCard alerts={monthlyAlertBreakdown} />
          </div>
        </section>
      </div>
    </main>
  );
}
