import { render, screen } from '@testing-library/react';

import { AirQualityChart } from '../AirQualityChart';
import { HumidityChart } from '../HumidityChart';
import { StdDevChart } from '../StdDevChart';
import { TemperatureChart } from '../TemperatureChart';
import type { AqiSeries, FormattedSeries, SeriesPointWithBands } from '@/hooks/useRealtimeSeries';

type PartialSeries = Pick<FormattedSeries, 'points' | 'latest' | 'average' | 'stdDev' | 'unit'>;

const baseTimestamp = new Date('2024-01-01T00:00:00Z').getTime();

function createPoint(index: number, value: number): SeriesPointWithBands {
  return {
    timestamp: baseTimestamp + index * 60 * 60 * 1000,
    value,
    label: `Ponto ${index}`,
    formattedValue: value.toFixed(1),
    average: value,
    upperBand: value + 2,
    lowerBand: value - 2,
  };
}

function createSeries(values: number[], unit: string): PartialSeries {
  const points = values.map((value, index) => createPoint(index, value));
  const latest = points[points.length - 1] ?? null;

  return {
    points,
    latest,
    average: latest?.average ?? 0,
    stdDev: 0.5,
    unit,
  };
}

function createAqiSeries(values: number[]): AqiSeries {
  const formatted = createSeries(values, 'AQI');
  const latestValue = formatted.latest?.value ?? 0;
  return {
    ...formatted,
    category: latestValue > 150 ? 'unhealthy' : 'moderate',
    color: latestValue > 150 ? '#e74c3c' : '#f1c40f',
  };
}

describe('smoke tests dos componentes de gráficos', () => {
  const temperature = createSeries([21.3, 22.1, 23.4], '°C');
  const humidity = createSeries([45.2, 47.9, 52.1], '%');
  const airQuality = createAqiSeries([80, 95, 110]);

  it('renderiza TemperatureChart sem lançar erros', () => {
    render(<TemperatureChart series={temperature} />);
    expect(screen.getByText('Temperatura ambiente')).toBeInTheDocument();
    expect(screen.getByText('Última leitura:')).toBeInTheDocument();
  });

  it('renderiza HumidityChart com dados combinados', () => {
    render(<HumidityChart humidity={humidity} temperature={temperature} />);
    expect(screen.getByText('Umidade relativa & temperatura média')).toBeInTheDocument();
  });

  it('renderiza AirQualityChart com séries de AQI', () => {
    render(<AirQualityChart series={airQuality} />);
    expect(screen.getByText('Qualidade do ar')).toBeInTheDocument();
  });

  it('renderiza StdDevChart com séries agregadas', () => {
    render(<StdDevChart temperature={temperature} humidity={humidity} aqi={airQuality} />);
    expect(screen.getByText('Desvios diários')).toBeInTheDocument();
  });
});
