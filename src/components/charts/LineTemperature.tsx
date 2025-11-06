import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TemperatureSeriesPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Temperatura por período</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis width={40} tickLine={false} axisLine={false} unit="°C" />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="average"
              stroke="var(--color-average)"
              strokeWidth={2}
              dot={false}
              name="Média"
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="var(--color-max)"
              strokeWidth={1.5}
              dot={false}
              name="Máxima"
            />
            <Line
              type="monotone"
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
