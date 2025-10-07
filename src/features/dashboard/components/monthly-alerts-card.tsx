"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";
import type { MonthlyAlertBreakdown } from "../types";

export interface MonthlyAlertsCardProps {
  alerts: MonthlyAlertBreakdown[];
  className?: string;
}

export function MonthlyAlertsCard({ alerts, className }: MonthlyAlertsCardProps) {
  const totals = alerts.reduce(
    (acc, month) => {
      acc.total += month.total;
      acc.critical += month.critical;
      acc.warning += month.warning;
      acc.resolved += month.resolved;
      return acc;
    },
    { total: 0, critical: 0, warning: 0, resolved: 0 },
  );

  return (
    <Card className={cn("h-full border bg-background backdrop-blur", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold leading-tight">Alertas Mensais</CardTitle>
          <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
            Distribuição por severidade e status
          </CardDescription>
        </div>
        <span className="rounded-full border border-border bg-muted/40 p-2">
          <PieChart className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <Badge variant="secondary" className="bg-muted/40">
            Total {totals.total}
          </Badge>
          <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-300">
            Críticos {totals.critical}
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-300">
            Alertas {totals.warning}
          </Badge>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            Resolvidos {totals.resolved}
          </Badge>
        </div>
        <ul className="space-y-3">
          {alerts.map((month) => {
            const total = Math.max(month.total, 1);
            const segments = [
              { label: "critical", value: month.critical, className: "bg-rose-500/70" },
              { label: "warning", value: month.warning, className: "bg-amber-500/70" },
              { label: "resolved", value: month.resolved, className: "bg-emerald-500/70" },
            ] as const;

            return (
              <li key={month.month} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>{month.month}</span>
                  <span>{month.total} alertas</span>
                </div>
                <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-background/60">
                  {segments.map((segment) => (
                    <span
                      key={segment.label}
                      className={cn("h-full", segment.className)}
                      style={{ width: `${(segment.value / total) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-semibold text-muted-foreground/80">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500/80" /> Críticos {month.critical}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500/80" /> Alertas {month.warning}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500/80" /> Resolvidos {month.resolved}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
