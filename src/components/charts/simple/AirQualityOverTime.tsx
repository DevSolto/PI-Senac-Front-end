// src/components/charts/simple/AirQualityOverTime.tsx
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

import { fmtData } from '@/lib/formatters';

// formatador simples de AQI
function fmtAQI(v: number) {
  if (v === null || Number.isNaN(v)) return '--';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);
}

type AirRow = {
  t: number;           // timestamp em ms (X numérico)
  aqi: number | null;  // qualidade do ar média
};

export function AirQualityOverTime({
  data,
  height = 260,
}: {
  // Aceita objetos com `timestamp` (Date|string) e o valor médio.
  // Se sua série vier como `averageAirQuality`, basta mapear antes de passar.
  data: Array<{ timestamp: Date | string; average?: number | null; averageAirQuality?: number | null }>;
  height?: number;
}) {
  const rows = useMemo<AirRow[]>(() => {
    const normalized = data.map((p) => {
      const ts = p.timestamp instanceof Date ? p.timestamp : new Date(p.timestamp as any);
      const t = ts.getTime();
      const aqi =
        typeof p.averageAirQuality === 'number'
          ? p.averageAirQuality
          : typeof p.average === 'number'
          ? p.average
          : null;

      return { t, aqi };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((r) => r.aqi !== null);
  }, [data]);

  return (
    <div className='p-[5px]'>

      <figure className="flex h-full w-full flex-col gap-3 ">
      <figcaption className="space-y-1">
        <h3 className="text-lg font-semibold">Qualidade do ar média</h3>
        <p className="text-sm text-muted-foreground">
          Indicador de qualidade do ar (AQI) agregado por período para os silos monitorados.
        </p>
      </figcaption>
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
              domain={['dataMin - 5', 'dataMax + 5']} // folga simples
              tickFormatter={(v: number) => fmtAQI(v)}
              width={56}
            />
            <Tooltip
              labelFormatter={(ms) => fmtData(new Date(ms as number))}
              formatter={(v: number | string, name) => {
                const label = name === 'aqi' ? 'Qualidade do ar (média)' : name;
                return [typeof v === 'number' ? fmtAQI(v) : v, label];
              }}
            />
            <Legend />

            <Line
              type="monotone"
              dataKey="aqi"
              name="Qualidade do ar (média)"
              stroke="#7c3aed"
              strokeWidth={2}
              dot
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
    </div>
  );
}
