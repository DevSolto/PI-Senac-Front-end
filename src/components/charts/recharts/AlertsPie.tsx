import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { fmtPerc } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

export interface AlertsPieDatum {
  name: string;
  key: 'critical' | 'warning' | 'ok';
  value: number;
}

interface AlertsPieProps {
  data: AlertsPieDatum[];
  totalRecords: number;
  isLoading?: boolean;
  onAdjustFilters?: () => void;
}

export function AlertsPie({ data, totalRecords, isLoading = false, onAdjustFilters }: AlertsPieProps) {
  const hasValues = data.some((item) => item.value > 0);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasValues) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Status de alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Sem alertas registrados.</span>
            <Button variant="outline" size="sm" onClick={onAdjustFilters}>
              Ajustar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60" aria-label="Distribuição de alertas">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Status de alertas</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              cx="50%"
              cy="50%"
            >
              {data.map((entry, index) => (
                <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number | string, name) => {
                if (typeof value !== 'number' || totalRecords === 0) {
                  return [value, name];
                }

                const percentage = fmtPerc((value / totalRecords) * 100);
                return [`${value} (${percentage})`, name];
              }}
            />
            <Legend verticalAlign="bottom" height={24} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
