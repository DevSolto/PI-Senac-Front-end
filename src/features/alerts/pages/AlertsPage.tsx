import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Droplets, Loader2, Thermometer, Wind } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSilos } from '@/features/silos/hooks/useSilos';
import { listAlertsBySilo } from '@/shared/api/alerts';
import type { Alert as AlertModel, AlertLevel } from '@/shared/api/alerts.types';

type SeverityBucket = 'Critical' | 'High' | 'Medium' | 'Low';

const severityConfig: Record<SeverityBucket, { color: string; badge: 'destructive' | 'secondary' | 'outline'; border: string }> = {
  Critical: { color: 'text-red-600', badge: 'destructive', border: 'border-l-red-500' },
  High: { color: 'text-orange-500', badge: 'secondary', border: 'border-l-orange-500' },
  Medium: { color: 'text-yellow-500', badge: 'secondary', border: 'border-l-yellow-500' },
  Low: { color: 'text-muted-foreground', badge: 'outline', border: 'border-l-gray-500' },
};

const alertTypeConfig: Record<AlertModel['type'], { icon: typeof AlertTriangle; label: string }> = {
  temperature: { icon: Thermometer, label: 'Temperatura' },
  humidity: { icon: Droplets, label: 'Umidade' },
  airQuality: { icon: Wind, label: 'Qualidade do ar' },
};

function getSeverityBucket(level: AlertLevel | null | undefined): SeverityBucket {
  switch (level) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'High';
    case 'info':
      return 'Low';
    default:
      return 'Medium';
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
}

export function AlertsPage() {
  const { silos, status: silosStatus, error: silosError } = useSilos();
  const [selectedSiloId, setSelectedSiloId] = useState<string>('');
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (silosStatus === 'ready' && silos.length > 0 && !selectedSiloId) {
      setSelectedSiloId(String(silos[0].id));
    }
  }, [selectedSiloId, silos, silosStatus]);

  useEffect(() => {
    if (!selectedSiloId) {
      return;
    }

    const fetchAlerts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listAlertsBySilo(Number(selectedSiloId));
        setAlerts(response);
      } catch (err) {
        console.error('Erro ao carregar alertas', err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os alertas.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAlerts();
  }, [selectedSiloId]);

  const severityStats = useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        const bucket = getSeverityBucket(alert.level);
        acc[bucket] += 1;
        return acc;
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<SeverityBucket, number>,
    );
  }, [alerts]);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [alerts]);

  const hasSiloSelectionError = silosStatus === 'error' && silosError;

  return (
    <div className="space-y-6">
      <div className="space-y-4 lg:flex lg:items-end lg:justify-between">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Alerts & Notifications</h1>
          <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
            <p>Real-time alerts and system notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedSiloId} onValueChange={setSelectedSiloId} disabled={silosStatus === 'loading'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um silo" />
              </SelectTrigger>
              <SelectContent>
                {silos.map((silo) => (
                  <SelectItem key={silo.id} value={String(silo.id)}>
                    {silo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mark All Read
          </Button>
        </div>
      </div>

      {hasSiloSelectionError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{silosError}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(severityConfig).map(([label, config]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className={config.color}>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${config.color}`}>{severityStats[label as SeverityBucket]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando alertas...</span>
            </div>
          ) : sortedAlerts.length === 0 ? (
            <p className="text-muted-foreground">Nenhum alerta encontrado para o silo selecionado.</p>
          ) : (
            <div className="space-y-4">
              {sortedAlerts.map((alert) => {
                const bucket = getSeverityBucket(alert.level);
                const Icon = alertTypeConfig[alert.type]?.icon ?? AlertTriangle;
                const typeLabel = alertTypeConfig[alert.type]?.label ?? alert.type;

                return (
                  <Alert key={alert.id} className={`border-l-4 ${severityConfig[bucket].border}`}>
                    <Icon className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <strong>{alert.message ?? 'Alerta'}</strong>
                            <Badge variant="outline" className="text-xs">
                              {typeLabel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Silo: {alert.silo?.name ?? `#${alert.siloId}`} • {formatDateTime(alert.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={severityConfig[bucket].badge}>{bucket}</Badge>
                          <Button size="sm" variant="outline">
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}