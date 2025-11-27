import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, RadioTower, RefreshCw, WifiOff } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/components/ui/utils';
import { fmtData, fmtPerc, fmtTemp } from '@/lib/formatters';
import type { DeviceHistoryEntry } from '@/shared/api/devices.types';
import { buildApiUrl } from '@/shared/http';

interface RealtimeSensorChartProps {
  deviceId: string;
  apiBaseUrl: string;
  maxPoints?: number;
  className?: string;
}

interface SensorPoint {
  timestamp: number;
  temperature: number | null;
  humidity: number | null;
}

type ConnectionStatus =
  | 'connecting'
  | 'loading-history'
  | 'history-loaded'
  | 'connected'
  | 'disconnected'
  | 'error';

const chartConfig = {
  temperature: {
    label: 'Temperatura (°C)',
    color: 'hsl(var(--chart-1))',
  },
  humidity: {
    label: 'Umidade relativa (%)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const MAX_POINTS_DEFAULT = 60;

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Conectando…',
  'loading-history': 'Carregando histórico…',
  'history-loaded': 'Histórico carregado',
  connected: 'Transmitindo em tempo real',
  disconnected: 'Conexão SSE perdida',
  error: 'Erro ao receber dados',
};

const statusIcon: Record<ConnectionStatus, JSX.Element> = {
  connecting: <RefreshCw className="h-3.5 w-3.5" aria-hidden />,
  'loading-history': <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />,
  'history-loaded': <RadioTower className="h-3.5 w-3.5" aria-hidden />,
  connected: <RadioTower className="h-3.5 w-3.5" aria-hidden />,
  disconnected: <WifiOff className="h-3.5 w-3.5" aria-hidden />,
  error: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
};

function parseSensorPoint(entry: DeviceHistoryEntry | null | undefined): SensorPoint | null {
  if (!entry) {
    return null;
  }

  const timestamp = entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now();
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const temperature = typeof entry.temperature === 'number' ? entry.temperature : null;
  const humidity = typeof entry.humidity === 'number' ? entry.humidity : null;

  if (temperature === null && humidity === null) {
    return null;
  }

  return {
    timestamp,
    temperature,
    humidity,
  };
}

export function RealtimeSensorChart({
  deviceId,
  apiBaseUrl,
  maxPoints = MAX_POINTS_DEFAULT,
  className,
}: RealtimeSensorChartProps) {
  const [points, setPoints] = useState<SensorPoint[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const normalizedBaseUrl = useMemo(() => apiBaseUrl.trim() || undefined, [apiBaseUrl]);
  const buildEndpointUrl = useCallback(
    (path: string) => buildApiUrl(path, normalizedBaseUrl),
    [normalizedBaseUrl],
  );

  useEffect(() => {
    let isActive = true;
    const loadHistory = async () => {
      setStatus('loading-history');
      try {
        const historyUrl = buildEndpointUrl(`/devices/${encodeURIComponent(deviceId)}/history`);
        const response = await fetch(historyUrl);

        if (!response.ok) {
          let apiMessage: string | null = null;
          try {
            const errorPayload = (await response.json()) as { message?: unknown };
            if (
              errorPayload &&
              typeof errorPayload === 'object' &&
              'message' in errorPayload &&
              typeof errorPayload.message === 'string'
            ) {
              apiMessage = errorPayload.message;
            }
          } catch (parseError) {
            console.warn(
              '[RealtimeSensorChart] Não foi possível interpretar a mensagem de erro da API.',
              parseError,
            );
          }

          console.error('[RealtimeSensorChart] Histórico indisponível.', {
            status: response.status,
            apiMessage,
          });
          throw new Error(
            `Não foi possível carregar o histórico (${response.status}). ` +
              'Verifique se o dispositivo existe ou se a API está disponível.',
          );
        }

        const payload = (await response.json()) as DeviceHistoryEntry[];
        if (
          payload &&
          !Array.isArray(payload) &&
          typeof payload === 'object' &&
          'message' in payload &&
          typeof (payload as { message?: unknown }).message === 'string'
        ) {
          console.info('[RealtimeSensorChart] Mensagem retornada pela API.', {
            message: (payload as { message: string }).message,
          });
        }

        if (!Array.isArray(payload)) {
          throw new Error('Resposta inesperada ao carregar histórico.');
        }

        const parsed = payload
          .map(parseSensorPoint)
          .filter((point): point is SensorPoint => point !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        if (!isActive) {
          return;
        }

        setPoints(parsed.slice(-maxPoints));
        setStatus('history-loaded');
        setError(null);
      } catch (historyError) {
        console.error('[RealtimeSensorChart] Erro ao carregar histórico', historyError);
        if (!isActive) {
          return;
        }

        setError(
          historyError instanceof Error
            ? historyError.message
            : 'Não foi possível carregar o histórico deste dispositivo. Tente novamente.',
        );
        setStatus('error');
      }
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [buildEndpointUrl, deviceId, maxPoints]);

  useEffect(() => {
    if (!deviceId) {
      return undefined;
    }

    const eventSourceUrl = buildEndpointUrl(`/devices/${encodeURIComponent(deviceId)}/updates`);
    let source: EventSource | null = null;

    try {
      source = new EventSource(eventSourceUrl);
    } catch (eventSourceError) {
      console.error('[RealtimeSensorChart] Erro ao iniciar SSE', eventSourceError);
      setStatus('error');
      setError(
        'Não foi possível iniciar a conexão em tempo real. Verifique se a URL da API está correta.',
      );
      return undefined;
    }

    source.onopen = () => {
      setStatus((previous) => (previous === 'history-loaded' ? 'connected' : 'connecting'));
      setError(null);
    };

    source.onmessage = (event) => {
      if (!event.data) {
        return;
      }

      try {
        const parsedEvent = JSON.parse(event.data) as DeviceHistoryEntry & { message?: string };

        if (parsedEvent && typeof parsedEvent.message === 'string') {
          console.info('[RealtimeSensorChart] Mensagem retornada pela API.', {
            message: parsedEvent.message,
          });
        }
        const point = parseSensorPoint(parsedEvent);

        if (!point) {
          return;
        }

        setPoints((previous) => {
          const next = [...previous, point];
          next.sort((a, b) => a.timestamp - b.timestamp);

          if (next.length > maxPoints) {
            return next.slice(-maxPoints);
          }

          return next;
        });
        setStatus('connected');
      } catch (parseError) {
        console.warn('[RealtimeSensorChart] Não foi possível interpretar o evento SSE', parseError);
      }
    };

    source.onerror = () => {
      setStatus('disconnected');
      setError(
        'Conexão SSE perdida ou rota de updates indisponível. Verifique o backend e tente novamente.',
      );
    };

    return () => {
      source?.close();
    };
  }, [buildEndpointUrl, deviceId, maxPoints]);

  const latest = useMemo(() => {
    if (points.length === 0) {
      return null;
    }

    return points[points.length - 1]!;
  }, [points]);

  const statusVariant: Parameters<typeof Badge>[0]['variant'] = (() => {
    if (status === 'connected' || status === 'history-loaded') {
      return 'default';
    }

    if (status === 'disconnected' || status === 'error') {
      return 'destructive';
    }

    return 'secondary';
  })();

  const chartRows = useMemo(
    () =>
      points.map((point) => ({
        t: point.timestamp,
        temperature: point.temperature,
        humidity: point.humidity,
      })),
    [points],
  );

  const shouldShowEmptyState =
    status !== 'loading-history' && status !== 'connecting' && chartRows.length === 0;

  return (
    <Card className={cn('h-full border-border/60', className)}>
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight text-foreground">
            Sensores em tempo real
          </CardTitle>
          <CardDescription>
            Leituras instantâneas de temperatura e umidade do dispositivo selecionado.
          </CardDescription>
        </div>
        <Badge variant={statusVariant} className="shrink-0" aria-live="polite">
          {statusIcon[status]}
          <span>{statusLabels[status]}</span>
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide">Temperatura</p>
            <p className="text-lg font-semibold text-foreground">
              {latest ? fmtTemp(latest.temperature) : 'Aguardando leituras…'}
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide">Umidade</p>
            <p className="text-lg font-semibold text-foreground">
              {latest ? fmtPerc(latest.humidity) : 'Aguardando leituras…'}
            </p>
          </div>
        </div>

        {shouldShowEmptyState ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/30 text-center text-sm">
            <p className="font-medium text-foreground">Nenhum ponto recebido até o momento.</p>
            <p className="text-muted-foreground">
              Aguarde novas leituras ou verifique se o dispositivo está online.
            </p>
          </div>
        ) : null}

        {status === 'loading-history' ? <Skeleton className="h-[300px] w-full" /> : null}

        {chartRows.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartRows}
                margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                accessibilityLayer
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="t"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => fmtData(new Date(value as number))}
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="left"
                  dataKey="temperature"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => fmtTemp(value as number)}
                  width={56}
                  allowDataOverflow
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  dataKey="humidity"
                  domain={[0, 100]}
                  tickFormatter={(value) => fmtPerc(value as number)}
                  width={48}
                />
                <RechartsTooltip
                  labelFormatter={(value) => fmtData(new Date(value as number))}
                  formatter={(value: number | string, name) => {
                    if (name === 'temperature' && typeof value === 'number') {
                      return fmtTemp(value);
                    }
                    if (name === 'humidity' && typeof value === 'number') {
                      return fmtPerc(value);
                    }
                    return value;
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  className="stroke-[--color-temperature]"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  className="stroke-[--color-humidity]"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}
