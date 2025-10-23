import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createPrng, type Prng } from '@/lib/mock/prng';
import {
  advanceEnvironmentSeries,
  generateEnvironmentSeries,
  getWindowSize,
  type TimeSeries,
} from '@/lib/mock/timeSeries';

const WINDOW_DAYS = 30;
const POINTS_PER_DAY = 24;
const DEFAULT_SEED = 'environment-seed';
const DEFAULT_NOISE = 0.4;
const DEFAULT_CORRELATION = 0.3;
const DEFAULT_INTERVAL = 5000;

interface ComfortSeriesState {
  temperature: TimeSeries;
  humidity: TimeSeries;
  aqi: TimeSeries;
  comfort: TimeSeries;
}

export interface RealtimeSeriesControls {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seed: string;
  setSeed: (seed: string) => void;
  noise: number;
  setNoise: (value: number) => void;
  correlation: number;
  setCorrelation: (value: number) => void;
  updateInterval: number;
  setUpdateInterval: (value: number) => void;
  windowDays: number;
  pointsPerDay: number;
}

export interface RealtimeSeriesContextValue extends RealtimeSeriesControls {
  series: ComfortSeriesState;
}

const RealtimeSeriesContext = createContext<RealtimeSeriesContextValue | undefined>(undefined);

function computeComfortIndex(temperature: number, humidity: number): number {
  const relativeHumidity = Math.min(Math.max(humidity, 0), 100) / 100;
  const comfort = temperature - 0.55 * (1 - relativeHumidity) * (temperature - 14.5);
  return Number(comfort.toFixed(2));
}

function buildComfortSeries(temperature: TimeSeries, humidity: TimeSeries): TimeSeries {
  if (temperature.length === 0) {
    return [];
  }

  return temperature.map((point, index) => {
    const humidityPoint = humidity[Math.min(index, humidity.length - 1)] ?? humidity[humidity.length - 1];
    return {
      timestamp: point.timestamp,
      value: computeComfortIndex(point.value, humidityPoint?.value ?? 60),
    };
  });
}

function appendComfortSeries(
  current: TimeSeries,
  timestamp: number,
  temperature: number,
  humidity: number,
  windowSize: number,
): TimeSeries {
  const nextValue = computeComfortIndex(temperature, humidity);
  const next = current.length >= windowSize ? current.slice(1) : current.slice();
  next.push({ timestamp, value: nextValue });
  return next;
}

function createInitialSeries(
  prng: Prng,
  noise: number,
  correlation: number,
): ComfortSeriesState {
  const base = generateEnvironmentSeries({
    prng,
    windowDays: WINDOW_DAYS,
    pointsPerDay: POINTS_PER_DAY,
    noise,
    correlation,
    startTimestamp: Date.now(),
  });

  return {
    ...base,
    comfort: buildComfortSeries(base.temperature, base.humidity),
  };
}

function validatePositive(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export function useRealtimeSeriesContext(): RealtimeSeriesContextValue {
  const context = useContext(RealtimeSeriesContext);
  if (!context) {
    throw new Error('useRealtimeSeriesContext must be used within a RealtimeMockProvider');
  }
  return context;
}

interface RealtimeMockProviderProps {
  children: ReactNode;
}

export const RealtimeMockProvider = ({ children }: RealtimeMockProviderProps) => {
  const [seed, setSeed] = useState<string>(DEFAULT_SEED);
  const [noise, setNoise] = useState<number>(DEFAULT_NOISE);
  const [correlation, setCorrelation] = useState<number>(DEFAULT_CORRELATION);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [updateInterval, setUpdateInterval] = useState<number>(DEFAULT_INTERVAL);

  const prngRef = useRef<Prng>(createPrng(seed));
  const optionsRef = useRef({ noise: DEFAULT_NOISE, correlation: DEFAULT_CORRELATION });

  const windowSize = useMemo(
    () => getWindowSize(WINDOW_DAYS, POINTS_PER_DAY),
    [],
  );

  const [series, setSeries] = useState<ComfortSeriesState>(() =>
    createInitialSeries(prngRef.current, noise, correlation),
  );

  useEffect(() => {
    optionsRef.current = { noise, correlation };
  }, [noise, correlation]);

  const regenerateSeries = useCallback(() => {
    const generator = createPrng(seed);
    prngRef.current = generator;
    setSeries(createInitialSeries(generator, optionsRef.current.noise, optionsRef.current.correlation));
  }, [seed]);

  useEffect(() => {
    regenerateSeries();
  }, [regenerateSeries]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeries((current) => {
        const nextBase = advanceEnvironmentSeries(
          {
            temperature: current.temperature,
            humidity: current.humidity,
            aqi: current.aqi,
          },
          prngRef.current,
          {
            windowDays: WINDOW_DAYS,
            pointsPerDay: POINTS_PER_DAY,
            noise: optionsRef.current.noise,
            correlation: optionsRef.current.correlation,
          },
        );

        const lastTemperature = nextBase.temperature[nextBase.temperature.length - 1];
        const lastHumidity = nextBase.humidity[nextBase.humidity.length - 1];

        return {
          ...nextBase,
          comfort: appendComfortSeries(
            current.comfort,
            lastTemperature.timestamp,
            lastTemperature.value,
            lastHumidity.value,
            windowSize,
          ),
        };
      });
    }, validatePositive(updateInterval, DEFAULT_INTERVAL));

    return () => {
      window.clearInterval(interval);
    };
  }, [isPlaying, updateInterval, windowSize]);

  const controls = useMemo<RealtimeSeriesControls>(
    () => ({
      isPlaying,
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      toggle: () => setIsPlaying((value) => !value),
      seed,
      setSeed: (value: string) => setSeed(value.trim() || DEFAULT_SEED),
      noise,
      setNoise: (value: number) => setNoise(Math.max(0, Math.min(value, 5))),
      correlation,
      setCorrelation: (value: number) => setCorrelation(Math.max(0, Math.min(value, 1))),
      updateInterval,
      setUpdateInterval: (value: number) => setUpdateInterval(validatePositive(value, DEFAULT_INTERVAL)),
      windowDays: WINDOW_DAYS,
      pointsPerDay: POINTS_PER_DAY,
    }),
    [correlation, isPlaying, noise, seed, updateInterval],
  );

  const value = useMemo<RealtimeSeriesContextValue>(
    () => ({
      series,
      ...controls,
    }),
    [controls, series],
  );

  return <RealtimeSeriesContext.Provider value={value}>{children}</RealtimeSeriesContext.Provider>;
};

export const useRealtimeMock = useRealtimeSeriesContext;
