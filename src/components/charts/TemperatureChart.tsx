import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { FormattedSeries } from '@/hooks/useRealtimeSeries';
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const temperatureChartConfig = {
  value: {
    label: 'Temperatura',
    color: 'hsl(var(--chart-1))',
  },
  average: {
    label: 'Média móvel',
    color: 'hsl(var(--chart-2))',
  },
  bandRange: {
    label: 'Faixa 2σ',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface TemperatureChartProps {
  series: FormattedSeries;
  title?: string;
  className?: string;
}

export const TemperatureChart = ({ series, title = 'Temperatura ambiente', className }: TemperatureChartProps) => {
  const data = series.points.map((point) => ({
    ...point,
    bandLower: point.lowerBand,
    bandRange: point.upperBand - point.lowerBand,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Última leitura:&nbsp;
          <span className="font-medium text-foreground">{series.latest?.formattedValue ?? '—'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={temperatureChartConfig} className="h-[280px]">
          <LineChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" minTickGap={24} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `${value.toFixed(0)}°C`}
              width={48}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    if (!item) return value as number;
                    const payload = item.payload as (typeof data)[number];

                    if (item.dataKey === 'value') {
                      return (
                        <span className="font-medium text-foreground">{payload.formattedValue}</span>
                      );
                    }

                    if (item.dataKey === 'average') {
                      return (
                        <span className="text-muted-foreground">{`${payload.average.toFixed(1)} °C`}</span>
                      );
                    }

                    return value as number;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="bandLower"
              stackId="band"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="bandRange"
              stackId="band"
              stroke="none"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
              name={temperatureChartConfig.bandRange.label}
              isAnimationActive={false}
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke={temperatureChartConfig.average.color}
              strokeWidth={2}
              dot={false}
              name={temperatureChartConfig.average.label}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={temperatureChartConfig.value.color}
              strokeWidth={2}
              dot={false}
              name={temperatureChartConfig.value.label}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TemperatureChart;
