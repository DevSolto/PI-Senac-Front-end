"use client";

import { useId, useMemo } from "react";

import { cn } from "@/lib/utils";
import type { TimeSeriesDataPoint } from "@/lib/charts/types";

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 40;

const formatCoordinate = (value: number): string => value.toFixed(2);

const isValidValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeData = (data: TimeSeriesDataPoint[]) => {
  return data
    .map((point) => {
      const timestamp = new Date(point.timestamp);
      if (!Number.isFinite(timestamp.valueOf()) || !isValidValue(point.value)) {
        return null;
      }

      return {
        timestamp,
        value: point.value,
      };
    })
    .filter((point): point is { timestamp: Date; value: number } => point !== null)
    .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
};

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  timestamp: Date;
}

const computeChartPoints = (data: ReturnType<typeof normalizeData>): ChartPoint[] => {
  if (!data.length) {
    return [];
  }

  const minValue = data.reduce((min, point) => Math.min(min, point.value), data[0]!.value);
  const maxValue = data.reduce((max, point) => Math.max(max, point.value), data[0]!.value);
  const minTime = data[0]!.timestamp.valueOf();
  const maxTime = data[data.length - 1]!.timestamp.valueOf();

  const timeRange = maxTime - minTime;
  const valueRange = maxValue - minValue;

  return data.map((point, index) => {
    const x =
      timeRange === 0
        ? data.length === 1
          ? VIEWBOX_WIDTH / 2
          : (index / (data.length - 1)) * VIEWBOX_WIDTH
        : ((point.timestamp.valueOf() - minTime) / timeRange) * VIEWBOX_WIDTH;

    const y =
      valueRange === 0
        ? VIEWBOX_HEIGHT / 2
        : VIEWBOX_HEIGHT - ((point.value - minValue) / valueRange) * VIEWBOX_HEIGHT;

    return {
      x,
      y,
      value: point.value,
      timestamp: point.timestamp,
    } satisfies ChartPoint;
  });
};

const buildLinePath = (points: ChartPoint[]): string => {
  if (!points.length) {
    return "";
  }

  const segments = points.map((point, index) => {
    const coordinate = `${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`;
    return index === 0 ? `M ${coordinate}` : `L ${coordinate}`;
  });

  return segments.join(" ");
};

const buildAreaPath = (points: ChartPoint[]): string => {
  if (!points.length) {
    return "";
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const baseLine = `L ${formatCoordinate(last.x)} ${formatCoordinate(VIEWBOX_HEIGHT)} L ${formatCoordinate(
    first.x,
  )} ${formatCoordinate(VIEWBOX_HEIGHT)} Z`;

  const path = `${buildLinePath(points)} ${baseLine}`;
  return path;
};

export interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  className?: string;
  height?: number;
  showArea?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
  emptyState?: React.ReactNode;
  ariaLabel?: string;
}

export function TimeSeriesChart({
  data,
  className,
  height = 160,
  showArea = true,
  showDots = true,
  strokeWidth = 2,
  emptyState,
  ariaLabel,
}: TimeSeriesChartProps) {
  const gradientId = useId();

  const chartPoints = useMemo(() => computeChartPoints(normalizeData(data)), [data]);

  if (!chartPoints.length) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground",
          className,
        )}
      >
        {emptyState ?? "Sem dados suficientes para gerar o gráfico."}
      </div>
    );
  }

  const linePath = buildLinePath(chartPoints);
  const areaPath = showArea ? buildAreaPath(chartPoints) : "";

  return (
    <svg
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full text-primary", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width={VIEWBOX_WIDTH}
        height={VIEWBOX_HEIGHT}
        fill="var(--chart-background, transparent)"
        className="fill-background/10"
      />

      {showArea && areaPath ? (
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      ) : null}

      <path d={linePath} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />

      {showDots
        ? chartPoints.map((point, index) => (
            <circle
              key={`${point.timestamp.valueOf()}-${index}`}
              cx={formatCoordinate(point.x)}
              cy={formatCoordinate(point.y)}
              r={1.2}
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth={strokeWidth / 2}
            />
          ))
        : null}
    </svg>
  );
}
