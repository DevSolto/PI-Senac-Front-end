// src/lib/types.ts
export type ApiRecord = {
  id: number;
  siloName: string;
  periodStart: string;      // ISO
  periodEnd: string;        // ISO
  averageTemperature?: number;
  averageHumidity?: number;
  averageAirQuality?: number;
  maxTemperature?: number;
  minTemperature?: number;
  maxHumidity?: number;
  minHumidity?: number;
  stdTemperature?: number;
  stdHumidity?: number;
  stdAirQuality?: number;
  alertsCount?: number;
  criticalAlertsCount?: number;
  percentOverTempLimit?: number;
  percentOverHumLimit?: number;
  environmentScore?: number;
  createdAt?: string;       // ISO
};
