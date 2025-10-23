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
import { Area, CartesianGrid, ComposedChart, ErrorBar, Line, XAxis, YAxis } from 'recharts';

const humidityChartConfig = {
  humidity: {
    label: 'Umidade',
    color: 'hsl(var(--chart-4))',
  },
  humidityAverage: {
    label: 'Umidade média',
    color: 'hsl(var(--chart-4))',
  },
  temperatureAverage: {
    label: 'Temperatura média',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface HumidityChartProps {
  humidity: FormattedSeries;
  temperature: FormattedSeries;
  className?: string;
}

export const HumidityChart = ({ humidity, temperature, className }: HumidityChartProps) => {
  const data = humidity.points.map((point, index) => {
    const reference = temperature.points[index] ?? temperature.points[temperature.points.length - 1];
    const errorTop = point.upperBand - point.value;
    const errorBottom = point.value - point.lowerBand;

    return {
      ...point,
      temperatureAverage: reference?.average ?? reference?.value ?? 0,
      humidityError: [errorTop, errorBottom] as [number, number],
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Umidade relativa & temperatura média</CardTitle>
        <CardDescription>
          Média atual: <span className="font-medium text-foreground">{humidity.latest?.formattedValue ?? '—'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={humidityChartConfig} className="h-[280px]">
          <ComposedChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" minTickGap={24} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="humidity"
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              width={48}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="temperature"
              orientation="right"
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

                    if (item.dataKey === 'humidity') {
                      return (
                        <span className="font-medium text-foreground">{payload.formattedValue}</span>
                      );
                    }

                    if (item.dataKey === 'humidityAverage') {
                      return (
                        <span className="text-muted-foreground">{`${payload.average.toFixed(1)} %`}</span>
                      );
                    }

                    if (item.dataKey === 'temperatureAverage') {
                      return (
                        <span className="text-muted-foreground">{`${payload.temperatureAverage.toFixed(1)} °C`}</span>
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
              yAxisId="humidity"
              dataKey="humidity"
              stroke={humidityChartConfig.humidity.color}
              fill="hsl(var(--chart-4))"
              fillOpacity={0.16}
              name={humidityChartConfig.humidity.label}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              yAxisId="humidity"
              dataKey="humidityAverage"
              stroke={humidityChartConfig.humidityAverage.color}
              strokeWidth={2}
              dot={false}
              name={humidityChartConfig.humidityAverage.label}
            >
              <ErrorBar
                dataKey="humidityError"
                stroke={humidityChartConfig.humidityAverage.color}
                strokeWidth={1.5}
                width={6}
              />
            </Line>
            <Line
              type="monotone"
              yAxisId="temperature"
              dataKey="temperatureAverage"
              stroke={humidityChartConfig.temperatureAverage.color}
              strokeDasharray="6 3"
              strokeWidth={2}
              dot={false}
              name={humidityChartConfig.temperatureAverage.label}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HumidityChart;
