export const ALERT_TYPES = ['temperature', 'humidity', 'airQuality'] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_LEVELS = ['info', 'warning', 'critical'] as const;

export type AlertLevel = (typeof ALERT_LEVELS)[number];

export interface AlertSiloSummary {
  id: number;
  name: string;
}

export interface CreateAlertDto {
  type: AlertType;
  level?: AlertLevel | null;
  currentValue?: number | null;
  emailSent?: boolean | null;
  message?: string | null;
  siloId: number;
}

export interface UpdateAlertDto {
  type?: AlertType;
  level?: AlertLevel | null;
  currentValue?: number | null;
  emailSent?: boolean | null;
  message?: string | null;
  siloId?: number;
}

export interface Alert {
  id: number;
  type: AlertType;
  level?: AlertLevel | null;
  currentValue?: number | null;
  emailSent: boolean;
  message?: string | null;
  siloId: number;
  silo?: AlertSiloSummary | null;
  createdAt: string;
  updatedAt: string;
}
