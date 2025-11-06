import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { HumiditySeriesPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  average: {
    label: 'Umidade',
    color: 'hsl(var(--chart-4))',
  },
  percentOverLimit: {
    label: 'Acima do limite',
    color: 'hsl(var(--chart-5))',
  },
};

export interface LineHumidityProps {
  data: HumiditySeriesPoint[];
  isLoading?: boolean;
}

const mapChartData = (data: HumiditySeriesPoint[]) =>
  data.map((item) => ({
    ...item,
    percentOverLimit: item.percentOverLimit ?? 0,
  }));

export const LineHumidity = ({ data, isLoading = false }: LineHumidityProps) => {
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
          <CardTitle className="text-lg font-semibold">Umidade e violações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado encontrado.
          </div>
        </CardContent>
      </Card>
    );
  }

  const labelFormatter: TooltipProps['labelFormatter'] = (_, payload) => {
    const rawTimestamp = payload?.[0]?.payload?.timestamp as Date | string | undefined;

    if (!rawTimestamp) {
      return '';
    }

    const timestamp = rawTimestamp instanceof Date ? rawTimestamp : new Date(rawTimestamp);
    if (Number.isNaN(timestamp.getTime())) {
      return '';
    }

    return format(timestamp, 'dd/MM HH:mm', { locale: ptBR });
  };

  const valueFormatter: TooltipProps['formatter'] = (value, name) => {
    if (typeof value !== 'number') {
      return [value, name];
    }

    return [
      `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 })} %`,
      name,
    ];
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Umidade e violações</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <AreaChart data={mapChartData(data)} margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis width={40} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              content={
                <ChartTooltipContent labelFormatter={labelFormatter} formatter={valueFormatter} />
              }
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="var(--color-average)"
              fill="var(--color-average)"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Umidade média"
            />
            <Area
              type="monotone"
              dataKey="percentOverLimit"
              stroke="var(--color-percentOverLimit)"
              fill="var(--color-percentOverLimit)"
              fillOpacity={0.15}
              strokeWidth={2}
              name="% acima do limite"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
