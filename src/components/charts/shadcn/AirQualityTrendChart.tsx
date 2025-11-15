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

import type { AirQualitySeriesPoint } from '@/lib/metrics';
import { fmtData } from '@/lib/formatters';

const HEIGHT = 320;

type AirQualityRow = {
  t: number;
  aqi: number | null;
};

function fmtAQI(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

interface AirQualityTrendChartProps {
  data: AirQualitySeriesPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function AirQualityTrendChart({ data, isLoading, isEmpty }: AirQualityTrendChartProps) {
  const rows = useMemo<AirQualityRow[]>(() => {
    const normalized = data.map((point) => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      const t = timestamp.getTime();
      const aqi = typeof point.average === 'number' ? point.average : null;

      return { t, aqi };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((row) => row.aqi !== null);
  }, [data]);

  const shouldShowEmpty = isEmpty || rows.length === 0;

  return (
    <ChartCard
      title="Qualidade do ar média"
      description="Indicador agregado de AQI para os silos monitorados em cada período."
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
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => fmtAQI(value)} width={56} />
          <Tooltip
            labelFormatter={(value) => fmtData(new Date(value as number))}
            formatter={(v: number | string, name) => {
              const label = name === 'aqi' ? 'Qualidade do ar (média)' : name;
              return [typeof v === 'number' ? fmtAQI(v) : v, label];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="aqi" name="Qualidade do ar (média)" stroke="#7c3aed" strokeWidth={2} dot connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
