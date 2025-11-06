import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipProps } from 'recharts';

import type { AlertsBySiloPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type AlertsTooltipProps = TooltipProps<number | string, string>;

const chartConfig = {
  nonCritical: {
    label: 'Alertas',
    color: 'hsl(var(--chart-6))',
  },
  critical: {
    label: 'Críticos',
    color: 'hsl(var(--chart-7))',
  },
};

export interface BarAlertsProps {
  data: AlertsBySiloPoint[];
  isLoading?: boolean;
}

export const BarAlerts = ({ data, isLoading = false }: BarAlertsProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Alertas por silo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado encontrado.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    nonCritical: Math.max(item.total - item.critical, 0),
  }));

  const tooltipFormatter: AlertsTooltipProps['formatter'] = (value, _name, entry) => {
    if (typeof value !== 'number') {
      return [value, entry?.dataKey ?? ''];
    }

    return [
      value.toLocaleString('pt-BR'),
      entry?.dataKey === 'nonCritical' ? 'Alertas' : 'Críticos',
    ];
  };

  const tooltipLabelFormatter: AlertsTooltipProps['labelFormatter'] = (value) => String(value);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Alertas por silo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="siloName" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
            <YAxis width={40} tickLine={false} axisLine={false} />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, entry) => tooltipFormatter(value, name, entry)}
                  labelFormatter={tooltipLabelFormatter}
                />
              }
            />
            <Legend />
            <Bar
              dataKey="nonCritical"
              stackId="alerts"
              fill="var(--color-nonCritical)"
              radius={[4, 4, 0, 0]}
              name="Alertas"
            />
            <Bar
              dataKey="critical"
              stackId="alerts"
              fill="var(--color-critical)"
              radius={[4, 4, 0, 0]}
              name="Críticos"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
