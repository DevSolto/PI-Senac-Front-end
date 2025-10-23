import { useMemo } from 'react';
import type { ComponentProps } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AqiSeries } from '@/hooks/useRealtimeSeries';
import { getAqiCategory, getAqiColor } from '@/lib/mock/aqi';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from 'recharts';

type ChartLegendPayload = NonNullable<ComponentProps<typeof ChartLegend>['payload']>;
type AqiCategory = ReturnType<typeof getAqiCategory>;
type ChartDataPoint = AqiSeries['points'][number] & {
  category: AqiCategory;
  fill: string;
};

const LEGEND_ITEMS: ReadonlyArray<{ category: AqiCategory; label: string }> = [
  { category: 'good', label: 'Bom (0-50)' },
  { category: 'moderate', label: 'Moderado (51-100)' },
  { category: 'unhealthy-for-sensitive', label: 'Sensíveis (101-150)' },
  { category: 'unhealthy', label: 'Ruim (151-200)' },
  { category: 'very-unhealthy', label: 'Muito ruim (201-300)' },
  { category: 'hazardous', label: 'Perigoso (300+)' },
];

const aqiChartConfig = {
  value: {
    label: 'Índice de qualidade do ar',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const AQI_BOUNDARIES = [50, 100, 150, 200, 300];

const AQI_CATEGORY_LABEL: Record<AqiCategory, string> = {
  good: 'Bom',
  moderate: 'Moderado',
  'unhealthy-for-sensitive': 'Sensíveis',
  unhealthy: 'Ruim',
  'very-unhealthy': 'Muito ruim',
  hazardous: 'Perigoso',
};

interface AirQualityChartProps {
  series: AqiSeries;
  className?: string;
}

export const AirQualityChart = ({ series, className }: AirQualityChartProps) => {
  const data = useMemo<ChartDataPoint[]>(
    () =>
      series.points.map((point) => {
        const category = getAqiCategory(point.value);
        return {
          ...point,
          category,
          fill: getAqiColor(category),
        };
      }),
    [series.points],
  );

  const legendPayload = useMemo<ChartLegendPayload>(
    () =>
      LEGEND_ITEMS.map((item) => ({
        value: item.label,
        id: item.category,
        color: getAqiColor(item.category),
        type: 'square' as const,
      })),
    [],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Qualidade do ar</CardTitle>
        <CardDescription>
          Última leitura:&nbsp;
          <span className="font-medium text-foreground">
            {series.latest?.formattedValue ?? '—'}
            {series.category ? ` · ${AQI_CATEGORY_LABEL[series.category]}` : ''}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={aqiChartConfig} className="h-[280px]">
          <BarChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" minTickGap={24} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `${value}`}
              width={40}
              axisLine={false}
              tickLine={false}
              domain={[0, 320]}
            />
            <ChartTooltip
              cursor={{ fillOpacity: 0.12 }}
              content={
                <ChartTooltipContent
                  formatter={(
                    value: number,
                    _name: string,
                    item: { payload?: ChartDataPoint } | undefined,
                  ) => {
                    const payload = item?.payload;
                    if (!payload) return value;
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{payload.formattedValue}</span>
                        <span className="text-muted-foreground">{AQI_CATEGORY_LABEL[payload.category]}</span>
                      </div>
                    );
                  }}
                />
              }
            />
            <ChartLegend
              payload={legendPayload}
              content={(props: ComponentProps<typeof ChartLegendContent>) => (
                <ChartLegendContent {...props} />
              )}
            />
            {AQI_BOUNDARIES.map((limit) => (
              <ReferenceLine
                key={limit}
                y={limit}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="6 4"
                strokeOpacity={0.5}
                label={{ value: limit, position: 'insideTopLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
            ))}
            <Bar dataKey="value" name={aqiChartConfig.value.label} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.timestamp}-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AirQualityChart;
