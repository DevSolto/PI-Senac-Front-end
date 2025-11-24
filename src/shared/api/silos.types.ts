export interface CreateSiloDto {
  name: string;
  description?: string | null;
  grain: string;
  inUse?: boolean;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  maxAirQuality?: number | null;
  minAirQuality?: number | null;
  companyId: number;
}

export interface UpdateSiloDto {
  name?: string;
  description?: string | null;
  grain?: string;
  inUse?: boolean;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  maxAirQuality?: number | null;
  minAirQuality?: number | null;
  companyId?: number;
}

export interface Silo {
  id: number;
  name: string;
  description?: string | null;
  grain: string;
  inUse: boolean;
  alertsCount?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  maxAirQuality?: number | null;
  minAirQuality?: number | null;
  companyId: number;
  companyName?: string | null;
  createdAt: string;
  updatedAt: string;
}
