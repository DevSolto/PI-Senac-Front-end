"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import type { DashboardOverview } from "../types";

export interface DashboardHeaderProps {
  farm: DashboardOverview["farm"];
  sensorStatus: DashboardOverview["sensorStatus"];
  onMenuToggle?: () => void;
  className?: string;
}

export function DashboardHeader({
  farm,
  sensorStatus,
  onMenuToggle,
  className,
}: DashboardHeaderProps) {
  return (
    <Card
      className={cn(
        "border-dashed bg-gradient-to-br from-background via-background to-background/70 backdrop-blur",
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-4 pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMenuToggle}
            aria-label="Abrir menu de navegação"
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {farm.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{farm.location}</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Safra {farm.harvestSeason}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <dl className="space-y-1 rounded-lg border border-border/70 bg-muted/40 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gerente</dt>
          <dd className="text-sm font-semibold text-foreground">{farm.manager}</dd>
        </dl>
        <dl className="space-y-1 rounded-lg border border-border/70 bg-muted/40 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Última sincronização</dt>
          <dd className="text-sm font-semibold text-foreground">{farm.lastSync}</dd>
        </dl>
        <dl className="space-y-1 rounded-lg border border-border/70 bg-muted/40 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fuso horário</dt>
          <dd className="text-sm font-semibold text-foreground">{farm.timezone}</dd>
        </dl>
        <dl className="space-y-1 rounded-lg border border-border/70 bg-muted/40 p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sensores ativos</dt>
          <dd className="text-sm font-semibold text-foreground">
            {sensorStatus.online} / {sensorStatus.totalSensors}
          </dd>
        </dl>
      </CardContent>
    </Card>
  );
}
