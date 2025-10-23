import { useMemo } from 'react';
import { Pause, Play } from 'lucide-react';

import { MainLayout } from '@/app/layout/MainLayout';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { AirQualityChart } from '@/components/charts/AirQualityChart';
import { HumidityChart } from '@/components/charts/HumidityChart';
import { StdDevChart } from '@/components/charts/StdDevChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRealtimeSeries } from '@/hooks/useRealtimeSeries';

const formatPercentage = (value: number) => `${Math.round(value)}%`;

function computeMovingAverages(values: number[], pointsPerDay: number, days: number) {
  const windowSize = Math.max(1, Math.round(pointsPerDay * days));
  const currentSlice = values.slice(-windowSize);
  const previousSlice = values.slice(-windowSize * 2, -windowSize);

  const currentAverage =
    currentSlice.length > 0
      ? currentSlice.reduce((acc, value) => acc + value, 0) / currentSlice.length
      : 0;

  const previousAverage =
    previousSlice.length > 0
      ? previousSlice.reduce((acc, value) => acc + value, 0) / previousSlice.length
      : currentAverage;

  return { currentAverage, previousAverage };
}

export const DashboardPage = () => {
  const { temperature, humidity, aqi, comfort, controls } = useRealtimeSeries();

  const sevenDayTemperature = useMemo(
    () => computeMovingAverages(temperature.points.map((point) => point.value), controls.pointsPerDay, 7),
    [controls.pointsPerDay, temperature.points],
  );

  const sevenDayHumidity = useMemo(
    () => computeMovingAverages(humidity.points.map((point) => point.value), controls.pointsPerDay, 7),
    [controls.pointsPerDay, humidity.points],
  );

  const sevenDayAqi = useMemo(
    () => computeMovingAverages(aqi.points.map((point) => point.value), controls.pointsPerDay, 7),
    [aqi.points, controls.pointsPerDay],
  );

  const sevenDayComfort = useMemo(
    () => computeMovingAverages(comfort.points.map((point) => point.value), controls.pointsPerDay, 7),
    [comfort.points, controls.pointsPerDay],
  );

  const noiseValue = controls.noise;
  const correlationValue = controls.correlation;

  const diagnostics = [
    {
      id: 'temperature-volatility',
      title: 'Oscilações fora do ideal',
      description:
        'Picos de temperatura média semanal sugerem sensores descalibrados, exigindo revisão do plano de manutenção.',
    },
    {
      id: 'humidity-trend',
      title: 'Tendência de umidade ascendente',
      description:
        'Umidade segue em alta mesmo após reduzir o ruído da simulação, indicando possível infiltração em silos críticos.',
    },
    {
      id: 'air-quality-drop',
      title: 'Queda na qualidade do ar',
      description:
        'Índice AQI consistente acima do limiar desejado aponta necessidade de revisar ventilação e filtros.',
    },
  ] as const;

  const summaryCards = [
    {
      id: 'temperature',
      title: 'Temperatura média',
      unit: '°C',
      decimals: 1,
      ...sevenDayTemperature,
    },
    {
      id: 'humidity',
      title: 'Umidade média',
      unit: '%',
      decimals: 1,
      ...sevenDayHumidity,
    },
    {
      id: 'aqi',
      title: 'Qualidade do ar (AQI)',
      unit: 'AQI',
      invertTrend: true,
      decimals: 0,
      ...sevenDayAqi,
    },
    {
      id: 'comfort',
      title: 'Índice de conforto',
      unit: '°C',
      decimals: 1,
      ...sevenDayComfort,
    },
  ] as const;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Painel de monitoramento</h1>
            <p className="text-muted-foreground">Acompanhe a evolução em tempo real dos indicadores ambientais.</p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <Button onClick={controls.toggle} className="flex items-center gap-2">
              {controls.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {controls.isPlaying ? 'Pausar simulação' : 'Iniciar simulação'}
            </Button>

            <div className="flex flex-col gap-2">
              <Label htmlFor="simulation-seed">Seed</Label>
              <Input
                id="simulation-seed"
                value={controls.seed}
                onChange={(event) => controls.setSeed(event.target.value)}
                className="w-32"
              />
            </div>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ruído</CardTitle>
                <CardDescription>Amplitude das oscilações</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Slider
                  value={[noiseValue]}
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => controls.setNoise(value[0] ?? 0)}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {formatPercentage((noiseValue / 5) * 100)}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Correlação</CardTitle>
                <CardDescription>Impacto cruzado entre séries</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Slider
                  value={[correlationValue]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => controls.setCorrelation(value[0] ?? 0)}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {formatPercentage(correlationValue * 100)}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.id} {...card} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {diagnostics.map((item) => (
            <Card key={item.id} className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="secondary" className="w-full md:w-auto">
                  Exibir tarefa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <TemperatureChart series={temperature} />
          <HumidityChart humidity={humidity} temperature={temperature} />
          <AirQualityChart series={aqi} />
          <StdDevChart temperature={temperature} humidity={humidity} aqi={aqi} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
