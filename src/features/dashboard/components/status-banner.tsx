"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, CircleDot } from "lucide-react";
import type { DashboardOverview } from "../types";

export type StatusBannerVariant = "ok" | "warning" | "danger";

export interface StatusBannerProps {
  sensorStatus: DashboardOverview["sensorStatus"];
  variant?: StatusBannerVariant;
  message?: string;
  className?: string;
}

export function StatusBanner({
  sensorStatus,
  variant = "ok",
  message,
  className,
}: StatusBannerProps) {
  const variantStyles: Record<StatusBannerVariant, string> = {
    ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    warning: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-100",
    danger: "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  };

  const defaultMessages: Record<StatusBannerVariant, string> = {
    ok: "Todos os sistemas estão operando dentro dos parâmetros esperados.",
    warning: "Atenção: Verifique os sensores com anomalias detectadas.",
    danger: "Falhas críticas detectadas em sensores monitorados.",
  };

  const Icon = variant === "ok" ? CircleDot : AlertTriangle;
  const liveRegionMode = variant === "danger" ? "assertive" : "polite";

  return (
    <Card
      role="status"
      aria-live={liveRegionMode}
      aria-atomic="true"
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 transition-all sm:flex-row sm:items-center sm:justify-between",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full border border-current/40 bg-background/40 p-1">
          <Icon className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <p className="text-xs font-medium leading-tight">
            {message ?? defaultMessages[variant]}
          </p>
          <p className="text-xs text-current/80">
            Gateway {sensorStatus.gatewayStatus} · Sinal médio {sensorStatus.averageSignalQuality}% · {sensorStatus.online} sensores online
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] uppercase tracking-wide">
            <Badge
              variant="outline"
              className="border-current/40 bg-background/40 font-medium text-current"
            >
              {sensorStatus.offline} offline
            </Badge>
            <Badge
              variant="outline"
              className="border-current/40 bg-background/40 font-medium text-current"
            >
              {sensorStatus.maintenance} manutenção
            </Badge>
            <Badge
              variant="outline"
              className="border-current/40 bg-background/40 font-medium text-current"
            >
              {sensorStatus.batteryCritical} bateria crítica
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
