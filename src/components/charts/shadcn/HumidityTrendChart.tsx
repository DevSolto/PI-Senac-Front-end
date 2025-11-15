import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartCard } from './ChartCard';

import type { HumiditySeriesPoint } from '@/lib/metrics';
import { fmtData } from '@/lib/formatters';

const HEIGHT = 320;

type HumidityRow = {
  t: number;
  avg: number | null;
  min: number | null;
  max: number | null;
};

function fmtHumidity(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' %';
}

interface HumidityTrendChartProps {
  data: HumiditySeriesPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function HumidityTrendChart({ data, isLoading, isEmpty }: HumidityTrendChartProps) {
  const rows = useMemo<HumidityRow[]>(() => {
    const normalized = data.map((point) => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      const t = timestamp.getTime();

      const avg = typeof point.average === 'number' ? point.average : null;
      const min = typeof point.min === 'number' ? point.min : avg;
      const max = typeof point.max === 'number' ? point.max : avg;

      return { t, avg, min, max };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((row) => row.avg !== null || row.min !== null || row.max !== null);
  }, [data]);

  const shouldShowEmpty = isEmpty || rows.length === 0;

  return (
    <ChartCard
      title="Umidade relativa ao longo do tempo"
      description="Série de umidade média, mínima e máxima observada nas leituras do intervalo escolhido."
      isLoading={isLoading}
      isEmpty={shouldShowEmpty}
      height={HEIGHT}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => fmtData(new Date(value as number))}
            minTickGap={24}
          />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(value) => fmtHumidity(value)} width={56} />
          <Tooltip
            labelFormatter={(value) => fmtData(new Date(value as number))}
            formatter={(v: number | string, name) => {
              const label =
                name === 'avg'
                  ? 'Umidade média (%)'
                  : name === 'max'
                  ? 'Máxima (%)'
                  : name === 'min'
                  ? 'Mínima (%)'
                  : name;
              return [typeof v === 'number' ? fmtHumidity(v) : v, label];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="avg" name="Umidade média (%)" stroke="#0ea5e9" strokeWidth={2} dot connectNulls />
          <Line type="monotone" dataKey="max" name="Máxima (%)" stroke="#0369a1" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="min" name="Mínima (%)" stroke="#22d3ee" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
