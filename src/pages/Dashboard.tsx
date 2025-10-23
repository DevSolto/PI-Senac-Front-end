import { useMemo, useState } from 'react';
import { Pause, Play, TrendingUp, Waves, Activity, BarChart3 } from 'lucide-react';

import { MainLayout } from '@/app/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const formatPercentage = (value: number) => `${value.toFixed(0)}%`;

export const DashboardPage = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [seed, setSeed] = useState('2024');
  const [noiseLevel, setNoiseLevel] = useState(25);
  const [correlation, setCorrelation] = useState(62);

  const cards = useMemo(
    () => [
      {
        id: 'production',
        title: 'Produtividade Simulada',
        value: '24,7 t/ha',
        description: 'Baseado em 120 hectares monitorados',
        icon: BarChart3,
      },
      {
        id: 'health',
        title: 'Saúde das Culturas',
        value: formatPercentage(86),
        description: 'Índice agregado a partir dos sensores',
        icon: Activity,
      },
      {
        id: 'anomalies',
        title: 'Anomalias Detectadas',
        value: '12 eventos',
        description: 'Atualizado a cada 15 minutos',
        icon: Waves,
      },
      {
        id: 'forecast',
        title: 'Tendência de Safra',
        value: formatPercentage(18),
        description: 'Perspectiva das próximas 12 semanas',
        icon: TrendingUp,
      },
    ],
    [],
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Simulações</h1>
            <p className="text-muted-foreground">
              Acompanhe a execução das simulações e ajuste os parâmetros em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <Button onClick={() => setIsPlaying((state) => !state)} className="flex items-center gap-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pausar execução' : 'Iniciar execução'}
            </Button>

            <div className="flex flex-col gap-2">
              <Label htmlFor="simulation-seed">Seed</Label>
              <Input
                id="simulation-seed"
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                inputMode="numeric"
                className="w-28"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label id="noise-label">Ruído</Label>
              <div className="flex items-center gap-3">
                <div className="w-40">
                  <Slider
                    aria-labelledby="noise-label"
                    value={[noiseLevel]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setNoiseLevel(value[0] ?? 0)}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{formatPercentage(noiseLevel)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label id="correlation-label">Correlação</Label>
              <div className="flex items-center gap-3">
                <div className="w-40">
                  <Slider
                    aria-labelledby="correlation-label"
                    value={[correlation]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setCorrelation(value[0] ?? 0)}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{formatPercentage(correlation)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.id} className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{card.title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
