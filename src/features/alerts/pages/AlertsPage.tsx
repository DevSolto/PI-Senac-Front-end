import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Droplets, Loader2, Thermometer, Wind } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSilos } from '@/features/silos/hooks/useSilos';
import { listAlertsBySilo } from '@/shared/api/alerts';
import type { Alert as AlertModel, AlertLevel } from '@/shared/api/alerts.types';

type SeverityBucket = 'Crítico' | 'Alto' | 'Médio' | 'Baixo';

const severityConfig: Record<SeverityBucket, { color: string; badge: 'destructive' | 'secondary' | 'outline'; border: string }> = {
  Crítico: { color: 'text-red-600', badge: 'destructive', border: 'border-l-red-500' },
  Alto: { color: 'text-orange-500', badge: 'secondary', border: 'border-l-orange-500' },
  Médio: { color: 'text-yellow-500', badge: 'secondary', border: 'border-l-yellow-500' },
  Baixo: { color: 'text-muted-foreground', badge: 'outline', border: 'border-l-gray-500' },
};

const alertTypeConfig: Record<AlertModel['type'], { icon: typeof AlertTriangle; label: string }> = {
  temperature: { icon: Thermometer, label: 'Temperatura' },
  humidity: { icon: Droplets, label: 'Umidade' },
  airQuality: { icon: Wind, label: 'Qualidade do ar' },
};

function getSeverityBucket(level: AlertLevel | null | undefined): SeverityBucket {
  switch (level) {
    case 'critical':
      return 'Crítico';
    case 'warning':
      return 'Alto';
    case 'info':
      return 'Baixo';
    default:
      return 'Médio';
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
  const [selectedAlert, setSelectedAlert] = useState<AlertModel | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
      { Crítico: 0, Alto: 0, Médio: 0, Baixo: 0 } as Record<SeverityBucket, number>,
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Alertas e notificações</h1>
          <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
            <p>Alertas em tempo real e notificações do sistema</p>
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
            Marcar tudo como lido
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
          <CardTitle>Alertas recentes</CardTitle>
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
                  <Alert key={alert.id} className={`border-l-4 ${severityConfig[bucket].border} flex items-start gap-3`}>
                    <Icon className="h-5 w-5 mt-1" />
                    <AlertDescription className="w-full space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-base leading-none">{alert.message ?? 'Alerta'}</strong>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Silo: {alert.silo?.name ?? `#${alert.siloId}`} • {formatDateTime(alert.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <Badge variant="outline" className="text-xs">
                            {typeLabel}
                          </Badge>
                          <Badge variant={severityConfig[bucket].badge}>{bucket}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                          Valor atual: {alert.currentValue ?? 'Não informado'} • Status do email:{' '}
                          {alert.emailSent ? 'Enviado' : 'Não enviado'}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedAlert(alert); setIsDetailsOpen(true); }}>
                          Detalhes
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedAlert(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do alerta</DialogTitle>
            <DialogDescription>Informações completas do alerta selecionado.</DialogDescription>
          </DialogHeader>
          {selectedAlert ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Mensagem</p>
                <p className="font-semibold">{selectedAlert.message ?? 'Alerta'}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Silo</p>
                  <p className="font-medium">{selectedAlert.silo?.name ?? `#${selectedAlert.siloId}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{alertTypeConfig[selectedAlert.type]?.label ?? selectedAlert.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severidade</p>
                  <p className="font-medium">{getSeverityBucket(selectedAlert.level)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de criação</p>
                  <p className="font-medium">{formatDateTime(selectedAlert.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor atual</p>
                  <p className="font-medium">{selectedAlert.currentValue ?? 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Envio de email</p>
                  <p className="font-medium">{selectedAlert.emailSent ? 'Enviado' : 'Não enviado'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}