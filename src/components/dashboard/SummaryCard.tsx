import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';

interface SummaryCardProps {
  title: string;
  unit?: string;
  currentAverage: number;
  previousAverage: number;
  decimals?: number;
  invertTrend?: boolean;
  description?: string;
}

export const SummaryCard = ({
  title,
  unit,
  currentAverage,
  previousAverage,
  decimals = 1,
  invertTrend = false,
  description = 'Média móvel (7 dias)',
}: SummaryCardProps) => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const variation = previousAverage === 0 ? 0 : ((currentAverage - previousAverage) / Math.abs(previousAverage)) * 100;
  const adjustedVariation = invertTrend ? -variation : variation;

  const status = adjustedVariation > 0 ? 'melhorou' : adjustedVariation < 0 ? 'piorou' : 'estável';
  const Icon = adjustedVariation > 0 ? ArrowUpRight : adjustedVariation < 0 ? ArrowDownRight : Minus;
  const variationText = `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
  const valueText = `${formatter.format(currentAverage)}${unit ? ` ${unit}` : ''}`.trim();

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-semibold text-foreground">{valueText}</div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-muted-foreground">Variação</span>
            <span className={cn(adjustedVariation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
              {variationText}
            </span>
            <span className="text-muted-foreground">vs. período anterior</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span className="font-medium text-foreground capitalize">{status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
