import { render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes } from 'react';

import { AlertsBySiloBar } from '../recharts/AlertsBySiloBar';
import type { AlertsPieDatum } from '../recharts/AlertsPie';
import { AlertsPie } from '../recharts/AlertsPie';
import { HumidityArea } from '../recharts/HumidityArea';
import { TemperatureLine } from '../recharts/TemperatureLine';
import type {
  AlertsBySiloPoint,
  HumiditySeriesPoint,
  TemperatureSeriesPoint,
} from '@/lib/metrics';

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

describe('componentes Recharts do dashboard', () => {
  const baseDate = new Date('2024-01-01T00:00:00Z');

  const temperatureSeries: TemperatureSeriesPoint[] = [
    {
      timestamp: baseDate,
      label: '01 Jan',
      average: 21.5,
      min: 19.8,
      max: 24.3,
    },
    {
      timestamp: new Date(baseDate.getTime() + 60 * 60 * 1000),
      label: '01 Jan',
      average: 22.1,
      min: 20.5,
      max: 25.4,
    },
  ];

  const humiditySeries: HumiditySeriesPoint[] = [
    {
      timestamp: baseDate,
      label: '01 Jan',
      average: 48.2,
      min: 42.1,
      max: 55.3,
      percentOverLimit: 5,
    },
    {
      timestamp: new Date(baseDate.getTime() + 60 * 60 * 1000),
      label: '01 Jan',
      average: 52.1,
      min: 45.2,
      max: 58.7,
      percentOverLimit: 12,
    },
  ];

  const alertsBySilo: AlertsBySiloPoint[] = [
    { siloKey: '1', siloName: 'Silo Norte', total: 5, critical: 2 },
    { siloKey: '2', siloName: 'Silo Sul', total: 2, critical: 0 },
  ];

  const alertsStatus: AlertsPieDatum[] = [
    { key: 'critical', name: 'Crítico', value: 3 },
    { key: 'warning', name: 'Alerta', value: 4 },
    { key: 'ok', name: 'OK', value: 10 },
  ];

  it('renderiza TemperatureLine com dados válidos', () => {
    render(<TemperatureLine data={temperatureSeries} />);
    expect(screen.getByText('Temperatura média')).toBeInTheDocument();
  });

  it('renderiza HumidityArea com dados válidos', () => {
    render(<HumidityArea data={humiditySeries} />);
    expect(screen.getByText('Umidade média')).toBeInTheDocument();
  });

  it('renderiza AlertsBySiloBar com legendas', () => {
    render(<AlertsBySiloBar data={alertsBySilo} />);
    expect(screen.getByText('Alertas por silo')).toBeInTheDocument();
    expect(screen.getByText('Críticos')).toBeInTheDocument();
  });

  it('renderiza AlertsPie com distribuição de estados', () => {
    render(<AlertsPie data={alertsStatus} totalRecords={17} />);
    expect(screen.getByText('Status de alertas')).toBeInTheDocument();
    expect(screen.getByText('Crítico')).toBeInTheDocument();
  });
});
