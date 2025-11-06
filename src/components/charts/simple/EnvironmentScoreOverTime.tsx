// src/components/charts/simple/EnvironmentScoreOverTime.tsx
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from 'recharts';

function fmtScore(v: number) {
  if (v === null || Number.isNaN(v)) return '--';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
}

function fmtDate(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function EnvironmentScoreOverTime({
  data,
  height = 280,
}: {
  data: Array<{ timestamp: Date | string; environmentScore?: number | null }>;
  height?: number;
}) {
  const rows = useMemo(() => {
    const normalized = data.map((p) => {
      const ts = p.timestamp instanceof Date ? p.timestamp : new Date(p.timestamp);
      return { t: ts.getTime(), score: p.environmentScore ?? null };
    });
    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((r) => r.score !== null);
  }, [data]);

  return (
    <figure className="flex h-full w-full flex-col gap-3">
      <figcaption className="space-y-1">
        <h3 className="text-lg font-semibold">Pontuação ambiental ao longo do tempo</h3>
        <p className="text-sm text-muted-foreground">
          Evolução do environment score consolidado para o período analisado.
        </p>
      </figcaption>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart
            data={rows}
            margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="t"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ms) => fmtDate(new Date(ms as number))}
              minTickGap={24}
            />
            <YAxis domain={[0, 100]} tickFormatter={(v) => fmtScore(v)} width={48} />
            <Tooltip
              labelFormatter={(ms) => fmtDate(new Date(ms as number))}
              formatter={(v: number) => [`${fmtScore(v)} pts`, 'Environment Score']}
            />

            {/* zonas de qualidade */}
            <ReferenceArea y1={90} y2={100} fill="#22c55e40" stroke="none" /> {/* verde */}
            <ReferenceArea y1={70} y2={90} fill="#facc1540" stroke="none" /> {/* amarelo */}
            <ReferenceArea y1={0} y2={70} fill="#ef444440" stroke="none" /> {/* vermelho */}

            <Line
              type="monotone"
              dataKey="score"
              name="Condição do ambiente"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
