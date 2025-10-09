"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, Loader2 } from "lucide-react";

import { MetricHistoryChart } from "@/components/charts/metric-history-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDeviceHistory } from "@/features/dashboard/api";
import { buildDeviceHistoryDatasets } from "@/features/dashboard/transformers/history";
import { useDeviceUpdatesContext } from "@/features/dashboard/hooks/use-device-updates";
import type { TimeSeriesDataPoint } from "@/lib/charts/types";
import { appConfig } from "@/lib/config";

const MAX_DATA_POINTS = 60;

const TEMPERATURE_KEYS = ["temperature", "temp", "Temperature", "temp_c", "tempC"] as const;
const HUMIDITY_KEYS = ["humidity", "hum", "Humidity", "relativeHumidity", "rh"] as const;

const CONNECTION_LABELS: Record<ConnectionState["status"], string> = {
  idle: "Aguardando dispositivo",
  connecting: "Conectando...",
  connected: "Conectado",
  reconnecting: "Reconectando...",
  error: "Conexão instável",
};

interface ConnectionState {
  status: "idle" | "connecting" | "connected" | "reconnecting" | "error";
  message: string;
}

interface SensorUpdate {
  timestamp: string;
  temperature?: number;
  humidity?: number;
}

const sanitizeNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toIsoString = (value: unknown): string => {
  const ensureDate = (input: number): Date => {
    const milliseconds = input > 1_000_000_000_000 ? input : input * 1000;
    return new Date(milliseconds);
  };

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = ensureDate(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      const date = ensureDate(numericValue);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
};

const resolveMetricValue = (
  metrics: Record<string, unknown> | undefined,
  keys: readonly string[],
): number | undefined => {
  if (!metrics || typeof metrics !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (!(key in metrics)) {
      continue;
    }

    const numericValue = sanitizeNumber((metrics as Record<string, unknown>)[key]);
    if (numericValue !== undefined) {
      return numericValue;
    }
  }

  return undefined;
};

const extractPayload = (source: Record<string, unknown>): Record<string, unknown> | undefined => {
  const candidates = ["payload", "value", "values", "metrics", "data", "reading"] as const;

  for (const key of candidates) {
    const candidate = source[key];
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate as Record<string, unknown>;
    }
  }

  return source;
};

const parseSensorUpdate = (value: unknown): SensorUpdate | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const payload = extractPayload(source);

  const temperature = resolveMetricValue(payload, TEMPERATURE_KEYS);
  const humidity = resolveMetricValue(payload, HUMIDITY_KEYS);

  if (temperature === undefined && humidity === undefined) {
    return null;
  }

  const timestamp = toIsoString(
    source.timestamp ?? source.time ?? source.recordedAt ?? source.createdAt ?? source.emittedAt ?? Date.now(),
  );

  return {
    timestamp,
    temperature,
    humidity,
  } satisfies SensorUpdate;
};

const insertDataPoint = (
  previous: TimeSeriesDataPoint[],
  nextPoint: TimeSeriesDataPoint,
): TimeSeriesDataPoint[] => {
  const existingIndex = previous.findIndex((entry) => entry.timestamp === nextPoint.timestamp);
  let updated =
    existingIndex >= 0
      ? [...previous.slice(0, existingIndex), nextPoint, ...previous.slice(existingIndex + 1)]
      : [...previous, nextPoint];

  updated = updated.sort(
    (a, b) => new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf(),
  );

  if (updated.length > MAX_DATA_POINTS) {
    updated = updated.slice(updated.length - MAX_DATA_POINTS);
  }

  return updated;
};

export default function MonitoramentoPage() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("deviceId");
  const { setActiveDevice } = useDeviceUpdatesContext();

  const [temperatureData, setTemperatureData] = useState<TimeSeriesDataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<TimeSeriesDataPoint[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: deviceId ? "connecting" : "idle",
    message: deviceId ? "Conectando ao dispositivo selecionado..." : "Selecione um dispositivo para iniciar.",
  });
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    setActiveDevice(deviceId);

    return () => {
      setActiveDevice(null);
    };
  }, [deviceId, setActiveDevice]);

  useEffect(() => {
    setTemperatureData([]);
    setHumidityData([]);
    setLastUpdate(null);
    setConnectionState({
      status: deviceId ? "connecting" : "idle",
      message: deviceId
        ? "Conectando ao dispositivo selecionado..."
        : "Selecione um dispositivo para iniciar.",
    });
  }, [deviceId]);

  const loadHistory = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const history = await getDeviceHistory(deviceId);
      const datasets = buildDeviceHistoryDatasets(history);

      setTemperatureData(datasets.temperature.slice(-MAX_DATA_POINTS));
      setHumidityData(datasets.humidity.slice(-MAX_DATA_POINTS));

      const latestTimestamp =
        datasets.temperature.at(-1)?.timestamp ?? datasets.humidity.at(-1)?.timestamp ?? null;
      setLastUpdate(latestTimestamp ?? null);

      setConnectionState({
        status: "connecting",
        message: "Histórico carregado. Aguardando atualizações em tempo real...",
      });
    } catch (error) {
      console.error("Falha ao carregar dados históricos", error);
      setHistoryError("Não foi possível carregar o histórico do dispositivo.");
      setConnectionState({
        status: "error",
        message: "Erro ao carregar histórico. Verifique a conexão com a API.",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    loadHistory().catch((error) => {
      console.error("Erro inesperado ao carregar histórico", error);
    });
  }, [deviceId, loadHistory]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      setConnectionState({
        status: "error",
        message: "O navegador não suporta conexões SSE.",
      });
      return;
    }

    const baseUrl = (appConfig.apiSseUrl ?? appConfig.apiBaseUrl).replace(/\/$/, "");
    const url = `${baseUrl}/devices/${deviceId}/updates`;

    setConnectionState({ status: "connecting", message: "Conectando ao stream em tempo real..." });

    let isActive = true;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      if (!isActive) {
        return;
      }

      setConnectionState({
        status: "connected",
        message: `Conectado! Ouvindo atualizações para o dispositivo ${deviceId}.`,
      });
    };

    eventSource.onmessage = (event) => {
      if (!isActive) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as unknown;
        const update = parseSensorUpdate(parsed);

        if (!update) {
          return;
        }

        if (update.temperature !== undefined) {
          setTemperatureData((previous) =>
            insertDataPoint(previous, { timestamp: update.timestamp, value: update.temperature! }),
          );
        }

        if (update.humidity !== undefined) {
          setHumidityData((previous) =>
            insertDataPoint(previous, { timestamp: update.timestamp, value: update.humidity! }),
          );
        }

        if (update.temperature !== undefined || update.humidity !== undefined) {
          setLastUpdate(update.timestamp);
        }
      } catch (error) {
        console.error("Falha ao processar atualização em tempo real", error);
      }
    };

    eventSource.onerror = (error) => {
      if (!isActive) {
        return;
      }

      console.error("Conexão SSE interrompida", error);
      setConnectionState({
        status: "reconnecting",
        message: "Conexão interrompida. Tentando reconectar...",
      });
    };

    return () => {
      isActive = false;
      eventSource.close();
    };
  }, [deviceId]);

  const formattedLastUpdate = useMemo(() => {
    if (!lastUpdate) {
      return "--";
    }

    const date = new Date(lastUpdate);

    if (!Number.isFinite(date.valueOf())) {
      return "--";
    }

    try {
      return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(date);
    } catch {
      return date.toLocaleString("pt-BR");
    }
  }, [lastUpdate]);

  if (!deviceId) {
    return (
      <div className="py-10">
        <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <Card className="border border-dashed border-border/60 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Selecione um dispositivo</CardTitle>
              <CardDescription>
                Informe o identificador de um dispositivo via parâmetro <code>deviceId</code> para acompanhar o monitoramento em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Exemplo: <span className="font-mono">/monitoramento?deviceId=SEU_DISPOSITIVO</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden />
            <h1 className="text-2xl font-semibold text-foreground">Monitoramento em tempo real</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Acompanhe as últimas leituras do dispositivo <span className="font-medium">{deviceId}</span> com atualização contínua via SSE.
          </p>
        </div>

        <Card className="border border-border/60 bg-background shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Status da conexão</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {connectionState.message}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-border/80 bg-muted/40 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {CONNECTION_LABELS[connectionState.status]}
              </Badge>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                Última atualização: {formattedLastUpdate}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                O histórico inicial é carregado via REST e novos pontos são adicionados automaticamente assim que chegam.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadHistory()}
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                    Recarregando
                  </>
                ) : (
                  "Recarregar histórico"
                )}
              </Button>
            </div>
            {historyError ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {historyError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {isLoadingHistory && !temperatureData.length && !humidityData.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-2xl" aria-hidden />
            <Skeleton className="h-64 w-full rounded-2xl" aria-hidden />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MetricHistoryChart
              title="Temperatura"
              description="Últimas leituras recebidas"
              unit="°C"
              data={temperatureData}
              chartHeight={260}
              emptyState="Sem leituras de temperatura disponíveis."
            />
            <MetricHistoryChart
              title="Umidade relativa"
              description="Últimas leituras recebidas"
              unit="%"
              valuePrecision={0}
              data={humidityData}
              chartHeight={260}
              emptyState="Sem leituras de umidade disponíveis."
            />
          </div>
        )}
      </div>
    </div>
  );
}
