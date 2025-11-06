import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import type { DistributionDataset } from '@/lib/metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface PieDistributionProps {
  data: DistributionDataset[];
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

  if (data.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribuições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado encontrado.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribuições</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue={data[0]!.id} className="space-y-4">
          <TabsList className="grid h-auto grid-cols-1 gap-2 sm:grid-cols-3">
            {data.map((dataset) => (
              <TabsTrigger key={dataset.id} value={dataset.id} className="text-sm">
                {dataset.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {data.map((dataset) => {
            const hasValues = dataset.data.some((item) => item.value > 0);
            const chartConfig = Object.fromEntries(
              dataset.data.map((item) => [item.id, { label: item.label, color: item.color }]),
            );

            return (
              <TabsContent key={dataset.id} value={dataset.id} className="space-y-2">
                {dataset.description ? (
                  <CardDescription>{dataset.description}</CardDescription>
                ) : null}
                {hasValues ? (
                  <ChartContainer config={chartConfig} className="h-[320px]">
                    <PieChart>
                      <Pie
                        data={dataset.data}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label
                      >
                        {dataset.data.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
                    Nenhum dado encontrado.
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
