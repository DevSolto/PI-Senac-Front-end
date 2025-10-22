import { Droplets, ThermometerSun, Wind, type LucideIcon } from 'lucide-react';

interface SiloHighlightsProps {
  minTemperature?: number | null;
  maxTemperature?: number | null;
  minHumidity?: number | null;
  maxHumidity?: number | null;
  minAirQuality?: number | null;
  maxAirQuality?: number | null;
}

interface HighlightDescriptor {
  key: string;
  label: string;
  icon: LucideIcon;
  unit?: string;
  min?: number | null;
  max?: number | null;
}

export function SiloHighlights({
  minTemperature,
  maxTemperature,
  minHumidity,
  maxHumidity,
  minAirQuality,
  maxAirQuality,
}: SiloHighlightsProps) {
  const descriptors: HighlightDescriptor[] = [
    {
      key: 'temperature',
      label: 'Temperatura',
      icon: ThermometerSun,
      unit: '°C',
      min: minTemperature,
      max: maxTemperature,
    },
    {
      key: 'humidity',
      label: 'Umidade',
      icon: Droplets,
      unit: '%',
      min: minHumidity,
      max: maxHumidity,
    },
    {
      key: 'air-quality',
      label: 'Qualidade do ar',
      icon: Wind,
      min: minAirQuality,
      max: maxAirQuality,
    },
  ];

  const hasThresholds = descriptors.some(({ min, max }) =>
    typeof min === 'number' || typeof max === 'number',
  );

  return (
    <section className="space-y-3" aria-label="Limites cadastrados do silo">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight">Limites cadastrados</h4>
        {!hasThresholds ? null : (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Faixa ideal informada
          </span>
        )}
      </header>

      {hasThresholds ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {descriptors.map((descriptor) => (
            <ThresholdHighlight key={descriptor.key} {...descriptor} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum limite foi cadastrado para este silo até o momento.
        </p>
      )}
    </section>
  );
}

function ThresholdHighlight({
  icon: Icon,
  label,
  min,
  max,
  unit,
}: HighlightDescriptor) {
  const hasMin = typeof min === 'number';
  const hasMax = typeof max === 'number';

  return (
    <article className="rounded-lg border border-dashed p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <p className="text-sm font-semibold">
        {hasMin || hasMax ? formatRange(min, max, unit) : 'Não informado'}
      </p>
    </article>
  );
}

function formatRange(min?: number | null, max?: number | null, unit?: string) {
  const hasMin = typeof min === 'number';
  const hasMax = typeof max === 'number';

  if (hasMin && hasMax) {
    return `${formatNumber(min as number)} - ${formatNumber(max as number)}${unit ? ` ${unit}` : ''}`;
  }

  if (hasMin) {
    return `≥ ${formatNumber(min as number)}${unit ? ` ${unit}` : ''}`;
  }

  if (hasMax) {
    return `≤ ${formatNumber(max as number)}${unit ? ` ${unit}` : ''}`;
  }

  return 'Não informado';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
}
