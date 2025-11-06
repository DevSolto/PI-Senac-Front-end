import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import type { AlertsBySiloPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  total: {
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

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Alertas por silo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="siloName" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
            <YAxis width={40} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} name="Alertas" />
            <Bar dataKey="critical" fill="var(--color-critical)" radius={[4, 4, 0, 0]} name="Críticos" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
