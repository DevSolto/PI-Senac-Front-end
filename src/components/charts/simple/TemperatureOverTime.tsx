// src/components/charts/simple/TemperatureOverTime.tsx
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

import type { TemperatureSeriesPoint } from '@/lib/metrics';
import { fmtData, fmtTemp } from '@/lib/formatters';

type ChartRow = {
  t: number;             // timestamp em ms (X numérico)
  avg: number | null;    // temperatura média
  min: number | null;    // mínima
  max: number | null;    // máxima
};

export function TemperatureOverTime({
  data,
  height = 260,
}: {
  data: TemperatureSeriesPoint[];
  height?: number;
}) {
  const rows = useMemo<ChartRow[]>(() => {
    const normalized = data.map((p) => {
      const ts = p.timestamp instanceof Date ? p.timestamp : new Date((p as any).timestamp);
      const t = ts.getTime();

      const avg = typeof (p as any).average === 'number' ? (p as any).average : null;
      const min = typeof (p as any).min === 'number' ? (p as any).min : avg;
      const max = typeof (p as any).max === 'number' ? (p as any).max : avg;

      return { t, avg, min, max };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((r) => r.avg !== null || r.min !== null || r.max !== null);
  }, [data]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            minTickGap={24}
            tickFormatter={(ms) => fmtData(new Date(ms as number))}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}       // folga para evitar linha “colada”
            tickFormatter={(v: number) => fmtTemp(v)}
            width={56}
          />
          <Tooltip
            labelFormatter={(ms) => fmtData(new Date(ms as number))}
            formatter={(v: number | string, name) => {
              const label =
                name === 'avg' ? 'Temperatura média (°C)'
                : name === 'max' ? 'Máxima (°C)'
                : name === 'min' ? 'Mínima (°C)'
                : name;
              return [typeof v === 'number' ? fmtTemp(v) : v, label];
            }}
          />
          <Legend />

          {/* Linhas principais */}
          <Line type="monotone" dataKey="avg" name="Temperatura média (°C)" stroke="#2563eb" strokeWidth={2} dot connectNulls />
          <Line type="monotone" dataKey="max" name="Máxima (°C)" stroke="#dc2626" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="min" name="Mínima (°C)" stroke="#16a34a" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
