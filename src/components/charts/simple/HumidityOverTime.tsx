// src/components/charts/simple/HumidityOverTime.tsx
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

import type { TemperatureSeriesPoint } from '@/lib/metrics'; // mesma forma do pipeline (timestamp + average/min/max)
import { fmtData } from '@/lib/formatters';

// formatador básico de umidade
function fmtHum(v: number) {
  if (v === null || Number.isNaN(v)) return '--';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' %';
}

type HumRow = {
  t: number;             // timestamp em ms (X numérico)
  avg: number | null;    // umidade média
  min: number | null;    // mínima
  max: number | null;    // máxima
};

export function HumidityOverTime({
  data,
  height = 260,
}: {
  data: TemperatureSeriesPoint[];
  height?: number;
}) {
  const rows = useMemo<HumRow[]>(() => {
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
            // umidade geralmente varia menos, dá uma folga de 2pp
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v: number) => fmtHum(v)}
            width={56}
          />
          <Tooltip
            labelFormatter={(ms) => fmtData(new Date(ms as number))}
            formatter={(v: number | string, name) => {
              const label =
                name === 'avg' ? 'Umidade média (%)'
                : name === 'max' ? 'Máxima (%)'
                : name === 'min' ? 'Mínima (%)'
                : name;
              return [typeof v === 'number' ? fmtHum(v) : v, label];
            }}
          />
          <Legend />

          {/* Linhas principais */}
          <Line type="monotone" dataKey="avg" name="Umidade média (%)" stroke="#0ea5e9" strokeWidth={2} dot connectNulls />
          <Line type="monotone" dataKey="max" name="Máxima (%)" stroke="#0369a1" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="min" name="Mínima (%)" stroke="#22d3ee" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
