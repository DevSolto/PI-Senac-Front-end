"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Menu, Sparkles } from "lucide-react";
import type { DashboardOverview } from "../types";
import { StatusBanner, type StatusBannerVariant } from "./status-banner";

export interface DashboardHeaderProps {
  farm: DashboardOverview["farm"];
  sensorStatus: DashboardOverview["sensorStatus"];
  realtimeSensorStatus?: DashboardOverview["sensorStatus"];
  statusBannerVariant?: StatusBannerVariant;
  statusBannerMessage?: string;
  onMenuToggle?: () => void;
  className?: string;
}

export function DashboardHeader({
  farm,
  sensorStatus,
  realtimeSensorStatus,
  statusBannerVariant,
  statusBannerMessage,
  className,
}: DashboardHeaderProps) {
  const bannerSensorStatus = realtimeSensorStatus ?? sensorStatus;
  const bannerVariant: StatusBannerVariant = statusBannerVariant
    ? statusBannerVariant
    : (() => {
        if (bannerSensorStatus.gatewayStatus === "offline") {
          return "danger";
        }

        if (bannerSensorStatus.offline > 0 || bannerSensorStatus.batteryCritical > 0) {
          return "warning";
        }

        return "ok";
      })();

  return (
    <Card
      className={cn(
        "border-dashed bg-gradient-to-br from-background via-background to-background/70 backdrop-blur",
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {farm.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{farm.location}</p>
          </div>
        </div>
        <StatusBanner
          sensorStatus={bannerSensorStatus}
          variant={bannerVariant}
          message={statusBannerMessage}
          className="shadow-sm"
        />
      </CardHeader>
    </Card>
  );
}
