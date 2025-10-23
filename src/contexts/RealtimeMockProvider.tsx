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
import { advanceEnvironmentSeries, generateEnvironmentSeries, type SeriesCollection } from '@/lib/mock/timeSeries';

const WINDOW_DAYS = 30;
const POINTS_PER_DAY = 24;
const DEFAULT_SEED = 'environment-seed';
const DEFAULT_NOISE = 0.4;
const DEFAULT_CORRELATION = 0.3;
const DEFAULT_INTERVAL = 5000;

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
  series: SeriesCollection;
}

const RealtimeSeriesContext = createContext<RealtimeSeriesContextValue | undefined>(undefined);

function createInitialSeries(
  prng: Prng,
  noise: number,
  correlation: number,
): SeriesCollection {
  return generateEnvironmentSeries({
    prng,
    windowDays: WINDOW_DAYS,
    pointsPerDay: POINTS_PER_DAY,
    noise,
    correlation,
    startTimestamp: Date.now(),
  });
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

  const [series, setSeries] = useState<SeriesCollection>(() =>
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
      setSeries((current) =>
        advanceEnvironmentSeries(current, prngRef.current, {
          windowDays: WINDOW_DAYS,
          pointsPerDay: POINTS_PER_DAY,
          noise: optionsRef.current.noise,
          correlation: optionsRef.current.correlation,
        }),
      );
    }, validatePositive(updateInterval, DEFAULT_INTERVAL));

    return () => {
      window.clearInterval(interval);
    };
  }, [isPlaying, updateInterval]);

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
