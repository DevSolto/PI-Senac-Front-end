import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import type { DistributionPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

export interface PieDistributionProps {
  data: DistributionPoint[];
  isLoading?: boolean;
}

export const PieDistribution = ({ data, isLoading = false }: PieDistributionProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasValues = data.some((item) => item.value > 0);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribuição do score ambiental</CardTitle>
      </CardHeader>
      <CardContent>
        {hasValues ? (
          <ChartContainer
            config={Object.fromEntries(data.map((item) => [item.id, { label: item.label, color: item.color }]))}
            className="h-[320px]"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Nenhum score disponível para o período selecionado.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
