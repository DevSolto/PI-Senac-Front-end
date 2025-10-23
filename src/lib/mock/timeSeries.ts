import { createPrng, type Prng } from './prng';

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export type TimeSeries = TimeSeriesPoint[];

export interface SeriesCollection {
  temperature: TimeSeries;
  humidity: TimeSeries;
  aqi: TimeSeries;
}

export interface SeriesGenerationOptions {
  windowDays?: number;
  pointsPerDay?: number;
  noise?: number;
  correlation?: number;
  startTimestamp?: number;
  seed?: string | number;
  prng?: Prng;
}

export interface SeriesAdvanceOptions {
  windowDays?: number;
  pointsPerDay?: number;
  noise?: number;
  correlation?: number;
}

interface SeriesConfig {
  min: number;
  max: number;
  baseline: number;
  volatility: number;
  meanReversion: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_POINTS_PER_DAY = 24;

const TEMPERATURE_CONFIG: SeriesConfig = {
  min: 15,
  max: 40,
  baseline: 27,
  volatility: 2.2,
  meanReversion: 0.08,
};

const HUMIDITY_CONFIG: SeriesConfig = {
  min: 30,
  max: 95,
  baseline: 65,
  volatility: 3.4,
  meanReversion: 0.12,
};

const AQI_CONFIG: SeriesConfig = {
  min: 10,
  max: 220,
  baseline: 70,
  volatility: 18,
  meanReversion: 0.1,
};

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export function getWindowSize(windowDays = DEFAULT_WINDOW_DAYS, pointsPerDay = DEFAULT_POINTS_PER_DAY): number {
  const clampedWindow = Math.max(1, windowDays);
  const clampedPoints = Math.max(1, pointsPerDay);
  return clampedWindow * clampedPoints;
}

function getStepMs(pointsPerDay = DEFAULT_POINTS_PER_DAY): number {
  const clampedPoints = Math.max(1, pointsPerDay);
  return Math.round(DAY_IN_MS / clampedPoints);
}

function createSeriesPoint(timestamp: number, value: number): TimeSeriesPoint {
  return { timestamp, value };
}

function createInitialValue(config: SeriesConfig, prng: Prng): number {
  const deviation = (prng.next() - 0.5) * config.volatility * 2;
  return clamp(config.baseline + deviation, config.min, config.max);
}

function computeNextValue(
  previous: number,
  config: SeriesConfig,
  prng: Prng,
  noise: number,
  target: number,
  correlationStrength: number,
  reference?: number,
): number {
  const randomSwing = (prng.next() - 0.5) * config.volatility;
  const stochasticNoise = (prng.next() - 0.5) * config.volatility * noise;
  const meanReversion = (target - previous) * config.meanReversion;
  const correlationDelta =
    typeof reference === 'number' ? (reference - previous) * correlationStrength : 0;

  const next = previous + randomSwing + stochasticNoise + meanReversion + correlationDelta;
  return clamp(next, config.min, config.max);
}

function humidityTargetFromTemperature(temperature: number): number {
  const target = HUMIDITY_CONFIG.baseline - (temperature - TEMPERATURE_CONFIG.baseline) * 1.6;
  return clamp(target, HUMIDITY_CONFIG.min + 5, HUMIDITY_CONFIG.max - 5);
}

function aqiTargetFromEnvironment(temperature: number, humidity: number): number {
  const thermalStress = Math.max(0, temperature - 25) * 1.8;
  const humidityPenalty = Math.max(0, humidity - 65) * 0.9;
  const drynessPenalty = Math.max(0, 55 - humidity) * 0.6;
  const combined = AQI_CONFIG.baseline + thermalStress + humidityPenalty + drynessPenalty;
  return clamp(combined, AQI_CONFIG.min, AQI_CONFIG.max);
}

function appendPoint(series: TimeSeries, point: TimeSeriesPoint, windowSize: number): TimeSeries {
  const nextSeries = series.length >= windowSize ? series.slice(1) : series.slice();
  nextSeries.push(point);
  return nextSeries;
}

function generateSeries(
  prng: Prng,
  options: Required<Omit<SeriesGenerationOptions, 'seed' | 'prng'>>,
  stepMs: number,
): SeriesCollection {
  const { windowDays, pointsPerDay, noise, correlation, startTimestamp } = options;
  const windowSize = getWindowSize(windowDays, pointsPerDay);

  const temperatureSeries: TimeSeries = [];
  const humiditySeries: TimeSeries = [];
  const aqiSeries: TimeSeries = [];

  let temperatureValue = createInitialValue(TEMPERATURE_CONFIG, prng);
  let humidityValue = createInitialValue(HUMIDITY_CONFIG, prng);
  let aqiValue = createInitialValue(AQI_CONFIG, prng);

  for (let index = windowSize - 1; index >= 0; index -= 1) {
    const timestamp = startTimestamp - index * stepMs;

    temperatureValue = computeNextValue(
      temperatureValue,
      TEMPERATURE_CONFIG,
      prng,
      noise,
      TEMPERATURE_CONFIG.baseline,
      0,
    );

    const humidityTarget = humidityTargetFromTemperature(temperatureValue);
    humidityValue = computeNextValue(
      humidityValue,
      HUMIDITY_CONFIG,
      prng,
      noise,
      humidityTarget,
      correlation,
      temperatureValue,
    );

    const aqiTarget = aqiTargetFromEnvironment(temperatureValue, humidityValue);
    const localCorrelation = correlation * 0.5;
    aqiValue = computeNextValue(
      aqiValue,
      AQI_CONFIG,
      prng,
      noise,
      aqiTarget,
      localCorrelation,
      (temperatureValue + humidityValue) / 2,
    );

    temperatureSeries.push(createSeriesPoint(timestamp, temperatureValue));
    humiditySeries.push(createSeriesPoint(timestamp, humidityValue));
    aqiSeries.push(createSeriesPoint(timestamp, aqiValue));
  }

  return {
    temperature: temperatureSeries,
    humidity: humiditySeries,
    aqi: aqiSeries,
  };
}

export function generateEnvironmentSeries(options: SeriesGenerationOptions = {}): SeriesCollection {
  const {
    seed = 'environment-seed',
    windowDays = DEFAULT_WINDOW_DAYS,
    pointsPerDay = DEFAULT_POINTS_PER_DAY,
    noise = 0.4,
    correlation = 0.3,
    startTimestamp = Date.now(),
    prng,
  } = options;

  const generator = prng ?? createPrng(seed);
  const stepMs = getStepMs(pointsPerDay);

  return generateSeries(
    generator,
    { windowDays, pointsPerDay, noise, correlation, startTimestamp },
    stepMs,
  );
}

export function advanceEnvironmentSeries(
  previous: SeriesCollection,
  prng: Prng,
  options: SeriesAdvanceOptions = {},
): SeriesCollection {
  const {
    windowDays = DEFAULT_WINDOW_DAYS,
    pointsPerDay = DEFAULT_POINTS_PER_DAY,
    noise = 0.4,
    correlation = 0.3,
  } = options;

  const windowSize = getWindowSize(windowDays, pointsPerDay);
  const stepMs = getStepMs(pointsPerDay);

  const lastTimestamp =
    previous.temperature.length > 0
      ? previous.temperature[previous.temperature.length - 1].timestamp
      : Date.now();

  const nextTimestamp = lastTimestamp + stepMs;

  const previousTemperature =
    previous.temperature.length > 0
      ? previous.temperature[previous.temperature.length - 1].value
      : TEMPERATURE_CONFIG.baseline;

  const previousHumidity =
    previous.humidity.length > 0
      ? previous.humidity[previous.humidity.length - 1].value
      : HUMIDITY_CONFIG.baseline;

  const previousAqi =
    previous.aqi.length > 0 ? previous.aqi[previous.aqi.length - 1].value : AQI_CONFIG.baseline;

  const nextTemperature = computeNextValue(
    previousTemperature,
    TEMPERATURE_CONFIG,
    prng,
    noise,
    TEMPERATURE_CONFIG.baseline,
    0,
  );

  const humidityTarget = humidityTargetFromTemperature(nextTemperature);
  const nextHumidity = computeNextValue(
    previousHumidity,
    HUMIDITY_CONFIG,
    prng,
    noise,
    humidityTarget,
    correlation,
    nextTemperature,
  );

  const aqiTarget = aqiTargetFromEnvironment(nextTemperature, nextHumidity);
  const localCorrelation = correlation * 0.5;
  const nextAqi = computeNextValue(
    previousAqi,
    AQI_CONFIG,
    prng,
    noise,
    aqiTarget,
    localCorrelation,
    (nextTemperature + nextHumidity) / 2,
  );

  return {
    temperature: appendPoint(
      previous.temperature,
      createSeriesPoint(nextTimestamp, nextTemperature),
      windowSize,
    ),
    humidity: appendPoint(previous.humidity, createSeriesPoint(nextTimestamp, nextHumidity), windowSize),
    aqi: appendPoint(previous.aqi, createSeriesPoint(nextTimestamp, nextAqi), windowSize),
  };
}

export function calculateMean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

export function calculateStandardDeviation(values: readonly number[], mean?: number): number {
  if (values.length < 2) {
    return 0;
  }
  const reference = mean ?? calculateMean(values);
  const variance =
    values.reduce((acc, value) => acc + (value - reference) ** 2, 0) / (values.length - 1);
  return Math.sqrt(Math.max(variance, 0));
}

export function calculateMovingStats(
  series: TimeSeries,
  windowSize: number,
): { average: number[]; stdDev: number[] } {
  if (series.length === 0) {
    return { average: [], stdDev: [] };
  }

  const cappedWindow = Math.max(1, windowSize);
  const averages: number[] = [];
  const stdDevs: number[] = [];
  const buffer = new Array<number>(cappedWindow).fill(0);
  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let index = 0; index < series.length; index += 1) {
    const value = series[index].value;
    const bufferIndex = index % cappedWindow;

    if (count >= cappedWindow) {
      const removed = buffer[bufferIndex];
      sum -= removed;
      sumSquares -= removed * removed;
    } else {
      count += 1;
    }

    buffer[bufferIndex] = value;
    sum += value;
    sumSquares += value * value;

    const mean = sum / count;
    averages.push(mean);

    if (count < 2) {
      stdDevs.push(0);
    } else {
      const variance = Math.max(sumSquares / count - mean * mean, 0);
      stdDevs.push(Math.sqrt(variance));
    }
  }

  return { average: averages, stdDev: stdDevs };
}
