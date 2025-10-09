"use client";

import { useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeSeriesDataPoint } from "@/lib/charts/types";
import { cn } from "@/lib/utils";

import { TimeSeriesChart } from "./time-series-chart";

const defaultPrecisionByUnit = (unit?: string): number => {
  if (!unit) {
    return 1;
  }

  const normalized = unit.trim().toLowerCase();
  if (normalized === "%" || normalized === "ppm") {
    return 0;
  }

  return 1;
};

const formatValue = (value: number, unit?: string, precision?: number): string => {
  const resolvedPrecision = typeof precision === "number" ? precision : defaultPrecisionByUnit(unit);
  const formatted = value.toFixed(resolvedPrecision);
  return unit ? `${formatted} ${unit}` : formatted;
};

const formatTimestamp = (timestamp: string | undefined): string | null => {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);
  if (!Number.isFinite(date.valueOf())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export interface MetricHistoryChartProps {
  title: string;
  description?: string;
  unit?: string;
  data: TimeSeriesDataPoint[];
  valuePrecision?: number;
  valueFormatter?: (value: number, unit?: string) => string;
  className?: string;
  chartClassName?: string;
  chartWrapperClassName?: string;
  chartHeight?: number;
  showArea?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
  emptyState?: React.ReactNode;
}

export function MetricHistoryChart({
  title,
  description,
  unit,
  data,
  valuePrecision,
  valueFormatter,
  className,
  chartClassName,
  chartWrapperClassName,
  chartHeight = 160,
  showArea,
  showDots,
  strokeWidth,
  emptyState,
}: MetricHistoryChartProps) {
  const latestPoint = useMemo(() => data.at(-1) ?? null, [data]);

  const formattedValue = useMemo(() => {
    if (!latestPoint) {
      return "--";
    }

    if (valueFormatter) {
      return valueFormatter(latestPoint.value, unit);
    }

    return formatValue(latestPoint.value, unit, valuePrecision);
  }, [latestPoint, unit, valueFormatter, valuePrecision]);

  const formattedTimestamp = useMemo(
    () => formatTimestamp(latestPoint?.timestamp),
    [latestPoint?.timestamp],
  );

  return (
    <Card className={cn("h-full border border-border/60 bg-background shadow-sm", className)}>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold text-foreground">{formattedValue}</span>
          <span className="text-xs text-muted-foreground">
            {formattedTimestamp ? `Última leitura em ${formattedTimestamp}` : "Sem leituras recentes"}
          </span>
        </div>
        <div className={cn("relative", chartWrapperClassName)}>
          <TimeSeriesChart
            data={data}
            height={chartHeight}
            showArea={showArea}
            showDots={showDots}
            strokeWidth={strokeWidth}
            emptyState={emptyState}
            ariaLabel={`Histórico de ${title.toLowerCase()}`}
            className={cn("text-primary", chartClassName)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
