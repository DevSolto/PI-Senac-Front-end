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

import type { TemperatureSeriesPoint } from '@/lib/metrics';
import { fmtData, fmtTemp } from '@/lib/formatters';

type ChartRow = {
  t: number;
  avg: number | null;
  min: number | null;
  max: number | null;
};

interface TemperatureTrendChartProps {
  data: TemperatureSeriesPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

const HEIGHT = 320;

export function TemperatureTrendChart({ data, isLoading, isEmpty }: TemperatureTrendChartProps) {
  const rows = useMemo<ChartRow[]>(() => {
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
      title="Temperatura ao longo do tempo"
      description="Evolução das temperaturas média, mínima e máxima registradas para o intervalo selecionado."
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
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(value) => fmtTemp(value)} width={56} />
          <Tooltip
            labelFormatter={(value) => fmtData(new Date(value as number))}
            formatter={(v: number | string, name) => {
              const label =
                name === 'avg'
                  ? 'Temperatura média (°C)'
                  : name === 'max'
                  ? 'Máxima (°C)'
                  : name === 'min'
                  ? 'Mínima (°C)'
                  : name;
              return [typeof v === 'number' ? fmtTemp(v) : v, label];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="avg" name="Temperatura média (°C)" stroke="#2563eb" strokeWidth={2} dot connectNulls />
          <Line type="monotone" dataKey="max" name="Máxima (°C)" stroke="#dc2626" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="min" name="Mínima (°C)" stroke="#16a34a" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
