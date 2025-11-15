import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

import { ChartCard } from './ChartCard';

interface EnvironmentScorePoint {
  timestamp: Date | string;
  environmentScore?: number | null;
}

interface EnvironmentScoreChartProps {
  data: EnvironmentScorePoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

type ChartRow = {
  t: number;
  score: number | null;
};

const chartConfig = {
  score: {
    label: 'Condição do ambiente',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const HEIGHT = 320;

function fmtScore(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function fmtDate(value: Date) {
  return value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function EnvironmentScoreChart({ data, isLoading, isEmpty }: EnvironmentScoreChartProps) {
  const rows = useMemo<ChartRow[]>(() => {
    const normalized = data.map((point) => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      return { t: timestamp.getTime(), score: point.environmentScore ?? null };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((row) => row.score !== null);
  }, [data]);

  const shouldShowEmpty = isEmpty || rows.length === 0;

  return (
    <ChartCard
      title="Pontuação ambiental ao longo do tempo"
      description="Evolução do environment score consolidado para o período analisado."
      isLoading={isLoading}
      isEmpty={shouldShowEmpty}
      height={HEIGHT}
    >
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="t"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => fmtDate(new Date(value as number))}
              minTickGap={24}
            />
            <YAxis domain={[0, 100]} tickFormatter={(value) => fmtScore(value)} width={48} />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => fmtDate(new Date(value as number))}
              formatter={(value: number | string) =>
                typeof value === 'number' ? `${fmtScore(value)} pts` : value
              }
            />
            <ReferenceArea y1={90} y2={100} fill="#22c55e40" stroke="none" />
            <ReferenceArea y1={70} y2={90} fill="#facc1540" stroke="none" />
            <ReferenceArea y1={0} y2={70} fill="#ef444440" stroke="none" />
            <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} className="stroke-[--color-score]" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
