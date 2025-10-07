"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  Droplet,
  Sparkles,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { DashboardMetric } from "../types";

export type MetricCardTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface MetricCardProps {
  metric: DashboardMetric;
  tone?: MetricCardTone;
  icon?: LucideIcon;
  className?: string;
}

const toneClasses: Record<MetricCardTone, string> = {
  neutral: "border-border bg-background",
  info: "border-sky-500/40 bg-sky-500/5",
  success: "border-emerald-500/40 bg-emerald-500/5",
  warning: "border-amber-500/40 bg-amber-500/5",
  danger: "border-rose-500/40 bg-rose-500/5",
};

export function MetricCard({ metric, tone = "neutral", icon, className }: MetricCardProps) {
  const Icon = icon ?? inferIcon(metric);
  const TrendIcon = trendIcon(metric.trend.direction);

  return (
    <Card className={cn("h-full overflow-hidden border backdrop-blur", toneClasses[tone], className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
            {metric.label}
          </CardDescription>
          <CardTitle className="mt-2 text-2xl font-semibold">
            {formatMetricValue(metric.value, metric.unit)}
            {metric.unit && <span className="ml-1 text-base font-medium text-muted-foreground">{metric.unit}</span>}
          </CardTitle>
        </div>
        <span className="rounded-full border border-border bg-background/70 p-2">
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {metric.description && <p>{metric.description}</p>}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-dashed text-xs">
            <TrendIcon className="h-3.5 w-3.5" />
            {formatTrendValue(metric.trend.value, metric.trend.valueType)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {metric.trend.direction === "stable"
              ? `Estável versus ${metric.trend.comparedTo}`
              : `Comparado a ${metric.trend.comparedTo}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function inferIcon(metric: DashboardMetric): LucideIcon {
  if (metric.unit?.includes("°")) {
    return Thermometer;
  }

  if (metric.unit?.includes("%")) {
    return Droplet;
  }

  if (metric.label.toLowerCase().includes("alerta")) {
    return CircleDot;
  }

  return Sparkles;
}

function trendIcon(direction: DashboardMetric["trend"]["direction"]): LucideIcon {
  switch (direction) {
    case "up":
      return ArrowUpRight;
    case "down":
      return ArrowDownRight;
    default:
      return ArrowRight;
  }
}

function formatMetricValue(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: unit && unit.includes("°") ? 1 : 0,
  }).format(value);

  return formatted;
}

function formatTrendValue(value: number, valueType: DashboardMetric["trend"]["valueType"]) {
  if (valueType === "percentage") {
    return `${value > 0 ? "+" : value < 0 ? "" : "±"}${value}%`;
  }

  return `${value > 0 ? "+" : value < 0 ? "" : "±"}${value}`;
}
