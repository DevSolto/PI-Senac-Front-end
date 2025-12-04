import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { fmtMinuteSecond, fmtPerc, fmtTemp } from '@/lib/formatters';
import type { DeviceHistoryEntry } from '@/shared/api/devices.types';
import { buildApiUrl, getAuthToken } from '@/shared/http';

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

function appendAuthToken(url: string): string {
  const token = getAuthToken();

  if (!token) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    const urlWithToken = new URL(url);
    urlWithToken.searchParams.set('token', token);
    return urlWithToken.toString();
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

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

function parseTimestampMs(timestamp: unknown): number | null {
  if (typeof timestamp === 'number') {
    const milliseconds = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
    const parsed = new Date(milliseconds).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function parseSensorPoint(entry: DeviceHistoryEntry | null | undefined): SensorPoint | null {
  if (!entry) {
    return null;
  }

  const timestamp = parseTimestampMs(entry.timestamp ?? null) ?? Date.now();
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const nestedValue = entry.value && typeof entry.value === 'object' ? entry.value : null;
  const nestedTemperature =
    nestedValue && typeof nestedValue.temperature === 'number' ? nestedValue.temperature : null;
  const nestedHumidity =
    nestedValue && typeof nestedValue.humidity === 'number' ? nestedValue.humidity : null;

  const temperature =
    nestedTemperature ?? (typeof entry.temperature === 'number' ? entry.temperature : null);
  const humidity = nestedHumidity ?? (typeof entry.humidity === 'number' ? entry.humidity : null);

  if (temperature === null && humidity === null) {
    return null;
  }

  return {
    timestamp,
    temperature,
    humidity,
  };
}

function normalizeHistoryPayload(raw: unknown): DeviceHistoryEntry[] {
  if (Array.isArray(raw)) {
    return raw as DeviceHistoryEntry[];
  }

  if (raw && typeof raw === 'object' && 'payload' in raw) {
    const payload = (raw as { payload?: unknown }).payload;
    if (Array.isArray(payload)) {
      return payload as DeviceHistoryEntry[];
    }
  }

  throw new Error('Resposta inesperada ao carregar histórico.');
}

function normalizeEventPayload(raw: unknown): DeviceHistoryEntry[] {
  if (Array.isArray(raw)) {
    return raw as DeviceHistoryEntry[];
  }

  if (raw && typeof raw === 'object') {
    if ('payload' in raw) {
      const payload = (raw as { payload?: unknown }).payload;

      if (Array.isArray(payload)) {
        return payload as DeviceHistoryEntry[];
      }

      if (payload && typeof payload === 'object') {
        return [payload as DeviceHistoryEntry];
      }
    }

    return [raw as DeviceHistoryEntry];
  }

  return [];
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
  const isActiveRef = useRef(true);
  const hasLoadedHistoryRef = useRef(false);
  const isFetchingHistoryRef = useRef(false);

  useEffect(() => {
    console.info('[RealtimeSensorChart] Status atualizado.', { status });
  }, [status]);

  const normalizedBaseUrl = useMemo(() => apiBaseUrl.trim() || undefined, [apiBaseUrl]);
  const buildEndpointUrl = useCallback(
    (path: string) => buildApiUrl(path, { baseUrlOverride: normalizedBaseUrl, skipApiPrefix: false }),
    [normalizedBaseUrl],
  );

  const loadHistory = useCallback(
    async ({ background = false } = {}) => {
      if (!isActiveRef.current) {
        console.debug('[RealtimeSensorChart] Componente inativo. Ignorando carregamento.');
        return;
      }

      if (isFetchingHistoryRef.current) {
        console.debug('[RealtimeSensorChart] Carregamento de histórico já em andamento. Ignorando.');
        return;
      }

      isFetchingHistoryRef.current = true;
      console.info('[RealtimeSensorChart] Iniciando carregamento do histórico.', {
        deviceId,
        maxPoints,
        background,
      });
      if (!background) {
        setStatus('loading-history');
      }
      try {
        const historyUrl = appendAuthToken(
          buildEndpointUrl(`/devices/${encodeURIComponent(deviceId)}/history`),
        );
        const authToken = getAuthToken();
        console.info('[RealtimeSensorChart] Disparando requisição de histórico.', { historyUrl });
        const response = await fetch(historyUrl, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });

        console.info('[RealtimeSensorChart] Resposta de histórico recebida.', {
          historyUrl,
          status: response.status,
          ok: response.ok,
        });

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
              { historyUrl },
            );
          }

          console.error('[RealtimeSensorChart] Histórico indisponível.', {
            historyUrl,
            status: response.status,
            apiMessage,
          });
          throw new Error(
            `Não foi possível carregar o histórico (${response.status}). ` +
              'Verifique se o dispositivo existe ou se a API está disponível.',
          );
        }

        const rawPayload = await response.json();
        if (
          rawPayload &&
          typeof rawPayload === 'object' &&
          'message' in rawPayload &&
          typeof (rawPayload as { message?: unknown }).message === 'string'
        ) {
          console.info('[RealtimeSensorChart] Mensagem retornada pela API.', {
            message: (rawPayload as { message: string }).message,
            historyUrl,
          });
        }

        const payload = normalizeHistoryPayload(rawPayload);

        const parsed = payload
          .map(parseSensorPoint)
          .filter((point): point is SensorPoint => point !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        console.info('[RealtimeSensorChart] Histórico carregado com sucesso.', {
          total: parsed.length,
          historyUrl,
          payload,
        });

        if (!isActiveRef.current) {
          return;
        }

        if (!hasLoadedHistoryRef.current && background) {
          console.debug('[RealtimeSensorChart] Ignorando atualização em segundo plano sem histórico inicial.');
          return;
        }

        setPoints(parsed.slice(-maxPoints));
        hasLoadedHistoryRef.current = true;
        setStatus((previous) => (previous === 'connected' ? 'connected' : 'history-loaded'));
        setError(null);
      } catch (historyError) {
        console.error('[RealtimeSensorChart] Erro ao carregar histórico', historyError);
        setError(
          historyError instanceof Error
            ? historyError.message
            : 'Não foi possível carregar o histórico deste dispositivo. Tente novamente.',
        );
        setStatus('error');
      } finally {
        isFetchingHistoryRef.current = false;
      }
    },
    [buildEndpointUrl, deviceId, maxPoints],
  );

  useEffect(() => {
    isActiveRef.current = true;
    let isActive = true;
    const intervalId = window.setInterval(() => {
      if (!isActive) {
        return;
      }
      loadHistory({ background: true });
    }, 5000);

    void loadHistory();

    return () => {
      isActive = false;
      isActiveRef.current = false;
      console.info('[RealtimeSensorChart] Descartando carregamento de histórico pendente.');
      window.clearInterval(intervalId);
    };
  }, [loadHistory]);

  useEffect(() => {
    if (!deviceId) {
      console.warn('[RealtimeSensorChart] ID do dispositivo ausente. SSE não iniciado.');
      return undefined;
    }

    const eventSourceUrl = appendAuthToken(
      buildEndpointUrl(`/devices/${encodeURIComponent(deviceId)}/updates`),
    );
    let source: EventSource | null = null;

    try {
      console.info('[RealtimeSensorChart] Iniciando SSE.', { eventSourceUrl });
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
      console.info('[RealtimeSensorChart] Conexão SSE aberta.', {
        eventSourceUrl,
        readyState: source?.readyState,
      });
      setStatus((previous) => (previous === 'history-loaded' ? 'connected' : 'connecting'));
      setError(null);
    };

    source.onmessage = (event) => {
      console.debug('[RealtimeSensorChart] Evento SSE recebido.', {
        raw: event.data,
        eventSourceUrl,
      });
      if (!event.data) {
        console.warn('[RealtimeSensorChart] Evento SSE sem dados ignorado.');
        return;
      }

      try {
        const parsedEvent = JSON.parse(event.data) as unknown;

        if (
          parsedEvent &&
          typeof parsedEvent === 'object' &&
          'message' in parsedEvent &&
          typeof (parsedEvent as { message?: unknown }).message === 'string'
        ) {
          console.info('[RealtimeSensorChart] Mensagem retornada pela API.', {
            message: (parsedEvent as { message: string }).message,
          });
        }

        const entries = normalizeEventPayload(parsedEvent);
        const parsedPoints = entries
          .map(parseSensorPoint)
          .filter((point): point is SensorPoint => point !== null)
          .sort((a, b) => a.timestamp - b.timestamp);

        if (parsedPoints.length === 0) {
          return;
        }

        setPoints((previous) => {
          const next = [...previous, ...parsedPoints];
          next.sort((a, b) => a.timestamp - b.timestamp);

          if (next.length > maxPoints) {
            const trimmed = next.slice(-maxPoints);
            console.debug('[RealtimeSensorChart] Máximo de pontos atingido. Aplicando trim.', {
              maxPoints,
              anterior: next.length,
              novoTotal: trimmed.length,
            });
            return trimmed;
          }

          console.debug('[RealtimeSensorChart] Novos pontos incluídos.', {
            total: parsedPoints.length,
            ultimoTimestamp: parsedPoints[parsedPoints.length - 1]?.timestamp,
            totalAcumulado: next.length,
          });
          return next;
        });
        setStatus('connected');
      } catch (parseError) {
        console.warn('[RealtimeSensorChart] Não foi possível interpretar o evento SSE', parseError);
      }
    };

    source.onerror = () => {
      console.error('[RealtimeSensorChart] Erro na conexão SSE.', {
        eventSourceUrl,
        readyState: source?.readyState,
      });
      setStatus('disconnected');
      setError(
        'Conexão SSE perdida ou rota de updates indisponível. Verifique o backend e tente novamente.',
      );
    };

    return () => {
      console.info('[RealtimeSensorChart] Encerrando SSE.', { eventSourceUrl });
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
                  tickFormatter={(value) => fmtMinuteSecond(new Date(value as number))}
                  minTickGap={24}
                />
                <YAxis yAxisId="shared" domain={[0, 100]} tickFormatter={(value) => `${value}`} width={48} />
                <RechartsTooltip
                  labelFormatter={(value) => fmtMinuteSecond(new Date(value as number))}
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
                  yAxisId="shared"
                  type="monotone"
                  dataKey="temperature"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  connectNulls
                  className="stroke-[--color-temperature]"
                />
                <Line
                  yAxisId="shared"
                  type="monotone"
                  dataKey="humidity"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
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
