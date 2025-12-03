export interface CreateDataProcessDto {
  siloId: number;
  periodStart: string | Date;
  periodEnd: string | Date;
  averageTemperature?: number | null;
  averageHumidity?: number | null;
  averageAirQuality?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  stdTemperature?: number | null;
  stdHumidity?: number | null;
  stdAirQuality?: number | null;
  alertsCount?: number | null;
  criticalAlertsCount?: number | null;
  percentOverTempLimit?: number | null;
  percentOverHumLimit?: number | null;
  environmentScore?: number | null;
  spoilageRiskProbability?: number | null;
  spoilageRiskCategory?: string | null;
}

export interface UpdateDataProcessDto {
  siloId?: number;
  periodStart?: string | Date;
  periodEnd?: string | Date;
  averageTemperature?: number | null;
  averageHumidity?: number | null;
  averageAirQuality?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  stdTemperature?: number | null;
  stdHumidity?: number | null;
  stdAirQuality?: number | null;
  alertsCount?: number | null;
  criticalAlertsCount?: number | null;
  percentOverTempLimit?: number | null;
  percentOverHumLimit?: number | null;
  environmentScore?: number | null;
  spoilageRiskProbability?: number | null;
  spoilageRiskCategory?: string | null;
}

export interface DataProcess {
  id: number;
  siloId: number;
  siloName?: string | null;
  periodStart: string;
  periodEnd: string;
  averageTemperature?: number | null;
  averageHumidity?: number | null;
  averageAirQuality?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  stdTemperature?: number | null;
  stdHumidity?: number | null;
  stdAirQuality?: number | null;
  alertsCount: number;
  criticalAlertsCount: number;
  percentOverTempLimit?: number | null;
  percentOverHumLimit?: number | null;
  environmentScore?: number | null;
  spoilageRiskProbability?: number | null;
  spoilageRiskCategory?: string | null;
  createdAt: string;
}
