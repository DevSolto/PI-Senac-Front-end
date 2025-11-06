import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { TemperatureSeriesPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type TemperatureTooltipProps = TooltipProps<number | string, string>;

const chartConfig = {
  average: {
    label: 'Média',
    color: 'hsl(var(--chart-1))',
  },
  max: {
    label: 'Máxima',
    color: 'hsl(var(--chart-2))',
  },
  min: {
    label: 'Mínima',
    color: 'hsl(var(--chart-3))',
  },
};

export interface LineTemperatureProps {
  data: TemperatureSeriesPoint[];
  isLoading?: boolean;
}

export const LineTemperature = ({ data, isLoading = false }: LineTemperatureProps) => {
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
          <CardTitle className="text-lg font-semibold">Temperatura por período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado encontrado.
          </div>
        </CardContent>
      </Card>
    );
  }

  const labelFormatter: TemperatureTooltipProps['labelFormatter'] = (_, payload) => {
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

  const valueFormatter: TemperatureTooltipProps['formatter'] = (value, name) => {
    if (typeof value !== 'number') {
      return [value, name];
    }

    return [
      `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 })} °C`,
      name,
    ];
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Temperatura por período</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} className="stroke-muted" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis width={40} tickLine={false} axisLine={false} unit="°C" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent labelFormatter={labelFormatter} formatter={valueFormatter} />
              }
            />
            <Legend />
            <Line
              type="step"
              dataKey="average"
              stroke="var(--color-average)"
              strokeWidth={2}
              dot={false}
              name="Média"
            />
            <Line
              type="step"
              dataKey="max"
              stroke="var(--color-max)"
              strokeWidth={1.5}
              dot={false}
              name="Máxima"
            />
            <Line
              type="step"
              dataKey="min"
              stroke="var(--color-min)"
              strokeWidth={1.5}
              dot={false}
              name="Mínima"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
