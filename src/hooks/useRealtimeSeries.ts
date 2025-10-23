import { useMemo } from 'react';

import { useRealtimeSeriesContext } from '@/contexts/RealtimeMockProvider';
import { getAqiCategory, getAqiColor } from '@/lib/mock/aqi';
import {
  calculateMovingStats,
  clamp,
  getWindowSize,
  type TimeSeries,
  type TimeSeriesPoint,
} from '@/lib/mock/timeSeries';

export interface SeriesPointWithBands extends TimeSeriesPoint {
  label: string;
  formattedValue: string;
  average: number;
  upperBand: number;
  lowerBand: number;
}

export interface FormattedSeries {
  points: SeriesPointWithBands[];
  latest: SeriesPointWithBands | null;
  average: number;
  stdDev: number;
  unit: string;
}

export interface AqiSeries extends FormattedSeries {
  category: ReturnType<typeof getAqiCategory> | null;
  color: string | null;
}

interface FormatterConfig {
  unit: string;
  decimals: number;
  min?: number;
  max?: number;
}

function formatValue(value: number, decimals: number, unit: string): string {
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`.trim();
}

function formatSeries(
  series: TimeSeries,
  windowSize: number,
  config: FormatterConfig,
  dateFormatter: Intl.DateTimeFormat,
): FormattedSeries {
  const { average, stdDev } = calculateMovingStats(series, windowSize);
  const points: SeriesPointWithBands[] = series.map((point, index) => {
    const mean = average[index] ?? point.value;
    const deviation = stdDev[index] ?? 0;
    const upper = mean + deviation * 2;
    const lower = mean - deviation * 2;
    const minBound = typeof config.min === 'number' ? config.min : -Infinity;
    const maxBound = typeof config.max === 'number' ? config.max : Infinity;
    const clampedUpper = clamp(upper, minBound, maxBound);
    const clampedLower = clamp(lower, minBound, maxBound);

    return {
      ...point,
      label: dateFormatter.format(new Date(point.timestamp)),
      formattedValue: formatValue(point.value, config.decimals, config.unit),
      average: mean,
      upperBand: clampedUpper,
      lowerBand: clampedLower,
    };
  });

  const latest = points[points.length - 1] ?? null;
  const latestIndex = Math.max(points.length - 1, 0);

  return {
    points,
    latest,
    average: average[latestIndex] ?? 0,
    stdDev: stdDev[latestIndex] ?? 0,
    unit: config.unit,
  };
}

export const useRealtimeSeries = () => {
  const context = useRealtimeSeriesContext();
  const { series, windowDays, pointsPerDay } = context;

  const windowSize = getWindowSize(windowDays, pointsPerDay);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  const temperature = useMemo(
    () =>
      formatSeries(series.temperature, windowSize, { unit: '°C', decimals: 1, min: -20, max: 50 }, dateFormatter),
    [dateFormatter, series.temperature, windowSize],
  );

  const humidity = useMemo(
    () => formatSeries(series.humidity, windowSize, { unit: '%', decimals: 1, min: 0, max: 100 }, dateFormatter),
    [dateFormatter, series.humidity, windowSize],
  );

  const aqi = useMemo<AqiSeries>(() => {
    const formatted = formatSeries(series.aqi, windowSize, { unit: 'AQI', decimals: 0, min: 0 }, dateFormatter);
    const latestValue = formatted.latest?.value ?? null;
    const category = latestValue !== null ? getAqiCategory(latestValue) : null;
    const color = latestValue !== null ? getAqiColor(category) : null;
    return {
      ...formatted,
      category,
      color,
    };
  }, [dateFormatter, series.aqi, windowSize]);

  return {
    temperature,
    humidity,
    aqi,
    controls: {
      isPlaying: context.isPlaying,
      play: context.play,
      pause: context.pause,
      toggle: context.toggle,
      seed: context.seed,
      setSeed: context.setSeed,
      noise: context.noise,
      setNoise: context.setNoise,
      correlation: context.correlation,
      setCorrelation: context.setCorrelation,
      updateInterval: context.updateInterval,
      setUpdateInterval: context.setUpdateInterval,
      windowDays: context.windowDays,
      pointsPerDay: context.pointsPerDay,
    },
  };
};
