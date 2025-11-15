import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartCard } from './ChartCard';

const HEIGHT = 320;

type EnvironmentScorePoint = {
  timestamp: Date | string;
  environmentScore?: number | null;
};

type ChartRow = {
  t: number;
  score: number | null;
};

function fmtScore(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function fmtDate(value: Date) {
  return value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

interface EnvironmentScoreTrendChartProps {
  data: EnvironmentScorePoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function EnvironmentScoreTrendChart({ data, isLoading, isEmpty }: EnvironmentScoreTrendChartProps) {
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => fmtDate(new Date(value as number))}
            minTickGap={24}
          />
          <YAxis domain={[0, 100]} tickFormatter={(value) => fmtScore(value)} width={48} />
          <Tooltip
            labelFormatter={(value) => fmtDate(new Date(value as number))}
            formatter={(value: number) => [`${fmtScore(value)} pts`, 'Environment Score']}
          />
          <ReferenceArea y1={90} y2={100} fill="#22c55e40" stroke="none" />
          <ReferenceArea y1={70} y2={90} fill="#facc1540" stroke="none" />
          <ReferenceArea y1={0} y2={70} fill="#ef444440" stroke="none" />
          <Line type="monotone" dataKey="score" name="Condição do ambiente" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
