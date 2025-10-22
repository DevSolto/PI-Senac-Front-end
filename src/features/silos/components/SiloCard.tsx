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
import { CalendarDays, Factory, History, Leaf, Power, type LucideIcon } from 'lucide-react';

import type { Silo } from '@/shared/api/silos.types';

import { SiloHighlights } from './SiloHighlights';

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

      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5" aria-hidden />
            <span>{silo.grain}</span>
          </Badge>

          <Badge variant={silo.inUse ? 'default' : 'outline'} className="flex items-center gap-1">
            <Power className="h-3.5 w-3.5" aria-hidden />
            <span>{silo.inUse ? 'Em operação' : 'Disponível'}</span>
          </Badge>
        </div>

        <SiloHighlights
          minTemperature={silo.minTemperature}
          maxTemperature={silo.maxTemperature}
          minHumidity={silo.minHumidity}
          maxHumidity={silo.maxHumidity}
          minAirQuality={silo.minAirQuality}
          maxAirQuality={silo.maxAirQuality}
        />

        <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <TimeMeta icon={CalendarDays} label="Criado em" value={silo.createdAt} />
          <TimeMeta icon={History} label="Atualizado em" value={silo.updatedAt} />
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
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`silo-skeleton-threshold-${index}`} className="space-y-2 rounded-lg border border-dashed p-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

interface TimeMetaProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function TimeMeta({ icon: Icon, label, value }: TimeMetaProps) {
  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());

  return (
    <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="font-medium">{label}</span>
      <time dateTime={isValid ? date.toISOString() : undefined}>
        {isValid ? formatDate(date) : 'Data indisponível'}
      </time>
    </span>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
