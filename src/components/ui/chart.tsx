import * as React from 'react';
import { Legend as RechartsLegend, type LegendProps, Tooltip as RechartsTooltip, type TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '@/components/ui/utils';

export type ChartConfig = Record<string, { label?: string; color?: string }>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  return React.useContext(ChartContext);
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({ config, className, style, children, ...props }: ChartContainerProps) {
  const colorStyle = React.useMemo(() => {
    return Object.entries(config).reduce<React.CSSProperties>((acc, [key, value]) => {
      if (value?.color) {
        acc[`--color-${key}` as keyof React.CSSProperties] = value.color;
      }
      return acc;
    }, {});
  }, [config]);

  return (
    <ChartContext.Provider value={config}>
      <div className={cn('flex h-full w-full flex-col', className)} style={{ ...colorStyle, ...style }} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export type ChartTooltipProps = TooltipProps<ValueType, NameType>;

export function ChartTooltip(props: ChartTooltipProps) {
  return <RechartsTooltip {...props} wrapperStyle={{ outline: 'none', ...(props.wrapperStyle ?? {}) }} />;
}

export type ChartLegendProps = LegendProps;

export function ChartLegend(props: ChartLegendProps) {
  return <RechartsLegend {...props} />;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipProps<ValueType, NameType>['payload'];
  label?: TooltipProps<ValueType, NameType>['label'];
  indicator?: 'dot' | 'line' | 'square';
}

export function ChartTooltipContent({ active, payload, label, indicator = 'dot' }: ChartTooltipContentProps) {
  const config = useChartConfig();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="grid gap-2 rounded-lg border bg-background/95 p-2 text-xs shadow-sm">
      {label ? <div className="font-medium text-foreground">{label}</div> : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          if (!item) {
            return null;
          }

          const rawKey = item.dataKey ?? item.name ?? index;
          const key = typeof rawKey === 'string' || typeof rawKey === 'number' ? String(rawKey) : undefined;
          const name = key && config?.[key]?.label ? config[key]!.label : item.name ?? key ?? '';
          const color = key ? `var(--color-${key})` : item.color;

          return (
            <div key={`${key ?? index}-${item.dataKey ?? item.name ?? index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    indicator === 'line' && 'h-0.5 w-3 rounded-none',
                    indicator === 'square' && 'rounded-sm',
                  )}
                  style={{ backgroundColor: color ?? item.color ?? 'currentColor' }}
                />
                <span>{name}</span>
              </div>
              <span className="font-medium text-foreground">{item.value ?? '--'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface ChartLegendContentProps {
  payload?: LegendProps['payload'];
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const config = useChartConfig();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 px-3 text-xs text-muted-foreground">
      {payload.map((item, index) => {
        if (!item) {
          return null;
        }

        const rawKey = item.dataKey ?? item.value ?? index;
        const key = typeof rawKey === 'string' || typeof rawKey === 'number' ? String(rawKey) : undefined;
        const name = key && config?.[key]?.label ? config[key]!.label : item.value ?? key ?? '';
        const color = key ? `var(--color-${key})` : item.color;

        return (
          <div key={`${key ?? index}-${item.type ?? 'legend'}`} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color ?? item.color ?? 'currentColor' }} />
            <span>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
