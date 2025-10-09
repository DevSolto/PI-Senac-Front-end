"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { AlertActionState } from "../hooks/use-critical-alerts";
import type { CriticalAlert } from "../types";

export interface CriticalAlertCardProps {
  alert: CriticalAlert;
  onAcknowledge?: (alert: CriticalAlert) => void;
  onResolve?: (alert: CriticalAlert) => void;
  className?: string;
  actionState?: AlertActionState;
}

export function CriticalAlertCard({
  alert,
  onAcknowledge,
  onResolve,
  className,
  actionState,
}: CriticalAlertCardProps) {
  const severityClasses: Record<CriticalAlert["severity"], string> = {
    critical: "border-rose-500/50 bg-rose-500/10",
    warning: "border-amber-500/50 bg-amber-500/10",
  };

  const statusLabels: Record<CriticalAlert["status"], string> = {
    active: "Ativo",
    acknowledged: "Reconhecido",
    resolved: "Resolvido",
  };

  const isAcknowledged = alert.status === "acknowledged" || alert.status === "resolved";
  const isResolved = alert.status === "resolved";
  const isAcknowledging = Boolean(actionState?.acknowledging);
  const isResolving = Boolean(actionState?.resolving);

  return (
    <Card className={cn("h-full border backdrop-blur", severityClasses[alert.severity], className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-current/40 bg-background/60 p-2 text-foreground">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-lg font-semibold leading-tight">{alert.alertType}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide">{alert.siloName}</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="bg-background/50 text-current">
          {statusLabels[alert.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoItem label="Detectado em" value={alert.detectedAt} />
          <InfoItem label="Duração" value={`${alert.durationMinutes} min`} />
          <InfoItem label="Severidade" value={alert.severity === "critical" ? "Crítico" : "Aviso"} />
          <InfoItem label="Recomendação" value={alert.recommendedAction} />
        </div>
        <p className="rounded-lg border border-border/60 bg-background/60 p-3 text-foreground">
          {alert.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {onAcknowledge && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(alert)}
              aria-label={`Registrar reconhecimento para ${alert.siloName}`}
              disabled={isAcknowledging || isAcknowledged}
              aria-busy={isAcknowledging}
            >
              {isAcknowledging ? "Registrando..." : isAcknowledged ? "Reconhecido" : "Registrar reconhecimento"}
            </Button>
          )}
          {onResolve && (
            <Button
              size="sm"
              onClick={() => onResolve(alert)}
              aria-label={`Marcar como resolvido o alerta de ${alert.siloName}`}
              disabled={isResolving || isResolved}
              aria-busy={isResolving}
            >
              {isResolving ? "Marcando..." : isResolved ? "Resolvido" : "Marcar como resolvido"}
            </Button>
          )}
        </div>
        {actionState?.feedback && (
          <p
            role="status"
            aria-live="polite"
            className={cn(
              "text-xs font-medium",
              actionState.feedback.status === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {actionState.feedback.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-background/60 p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
