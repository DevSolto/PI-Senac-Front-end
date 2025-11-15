import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/components/ui/utils';

interface ChartCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  className?: string;
  children: ReactNode;
}

const DEFAULT_HEIGHT = 300;

export function ChartCard({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  height = DEFAULT_HEIGHT,
  className,
  children,
}: ChartCardProps) {
  let content: ReactNode;

  if (isLoading) {
    content = <Skeleton className="w-full" style={{ height }} />;
  } else if (isEmpty) {
    content = (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-muted/30 text-center"
        style={{ minHeight: height }}
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-foreground">Sem dados para o período selecionado.</p>
        <p className="text-xs text-muted-foreground">Ajuste os filtros acima para visualizar novas leituras.</p>
      </div>
    );
  } else {
    content = (
      <div className="w-full" style={{ height }}>
        {children}
      </div>
    );
  }

  return (
    <Card className={cn('h-full border-border/60', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold leading-tight text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
}
