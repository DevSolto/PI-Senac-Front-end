import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  Droplets,
  Factory,
  History,
  Leaf,
  LucideIcon,
  Power,
  ThermometerSun,
  Wind,
} from 'lucide-react';

import type { Silo } from '@/shared/api/silos.types';

interface SiloCardProps {
  silo: Silo;
}

export function SiloCard({ silo }: SiloCardProps) {
  return (
    <Card data-silo-id={silo.id}>
      <CardHeader className="gap-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold leading-tight">{silo.name}</CardTitle>

          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="font-mono">ID {silo.id}</span>
            {silo.companyName ? (
              <span className="inline-flex items-center gap-1">
                <Factory className="h-3.5 w-3.5" aria-hidden />
                {silo.companyName}
              </span>
            ) : null}
          </div>

          {silo.description ? (
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {silo.description}
            </CardDescription>
          ) : null}
        </div>

        <CardAction className="self-start">
          {/* TODO: Substituir por navegação para a página de detalhes do silo */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            aria-disabled={true}
            title="Visualização detalhada disponível em breve"
          >
            Ver detalhes
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5" aria-hidden />
            <span>{silo.grain}</span>
          </Badge>

          <Badge
            variant={silo.inUse ? 'default' : 'outline'}
            className="flex items-center gap-1"
          >
            <Power className="h-3.5 w-3.5" aria-hidden />
            <span>{silo.inUse ? 'Em operação' : 'Disponível'}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <MetricRange
            icon={ThermometerSun}
            label="Temperatura"
            min={silo.minTemperature}
            max={silo.maxTemperature}
            unit="°C"
          />
          <MetricRange
            icon={Droplets}
            label="Umidade"
            min={silo.minHumidity}
            max={silo.maxHumidity}
            unit="%"
          />
          <MetricRange
            icon={Wind}
            label="Qualidade do ar"
            min={silo.minAirQuality}
            max={silo.maxAirQuality}
          />
          <MetricValue icon={History} label="Atualizado em" value={silo.updatedAt} />
          <MetricValue icon={CalendarDays} label="Criado em" value={silo.createdAt} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SiloCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`silo-skeleton-metric-${index}`} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricRangeProps {
  icon: LucideIcon;
  label: string;
  min?: number | null;
  max?: number | null;
  unit?: string;
}

function MetricRange({ icon: Icon, label, min, max, unit }: MetricRangeProps) {
  return (
    <div className="rounded-lg border border-dashed p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <p className="text-sm font-semibold">
        {formatRange(min, max, unit)}
      </p>
    </div>
  );
}

interface MetricValueProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function MetricValue({ icon: Icon, label, value }: MetricValueProps) {
  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());

  return (
    <div className="rounded-lg border border-dashed p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <p className="text-sm font-semibold">
        {isValid ? formatDate(date) : 'Data indisponível'}
      </p>
    </div>
  );
}

function formatRange(min?: number | null, max?: number | null, unit?: string) {
  const hasMin = typeof min === 'number';
  const hasMax = typeof max === 'number';

  if (!hasMin && !hasMax) {
    return 'Não informado';
  }

  if (hasMin && hasMax) {
    return `${formatNumber(min)} - ${formatNumber(max)}${unit ? ` ${unit}` : ''}`;
  }

  if (hasMin) {
    return `≥ ${formatNumber(min)}${unit ? ` ${unit}` : ''}`;
  }

  return `≤ ${formatNumber(max as number)}${unit ? ` ${unit}` : ''}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
