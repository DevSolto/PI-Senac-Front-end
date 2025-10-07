import { DashboardOverview } from "./types";

export const dashboardOverviewMock: DashboardOverview = {
  farm: {
    id: "fazenda-santa-helena",
    name: "Fazenda Santa Helena",
    location: "Sertãozinho · SP",
    harvestSeason: "Safra 2023/2024",
    manager: "Ana Souza",
    lastSync: "2024-05-27T14:30:00-03:00",
    timezone: "America/Sao_Paulo",
  },
  sensorStatus: {
    totalSensors: 152,
    online: 140,
    offline: 6,
    maintenance: 6,
    batteryCritical: 4,
    averageSignalQuality: 93,
    gatewayStatus: "online",
  },
  metrics: {
    monitoredSilos: {
      label: "Silos monitorados",
      value: 32,
      trend: {
        direction: "up",
        value: 2,
        valueType: "absolute",
        comparedTo: "última semana",
      },
      description: "22 com status OK e 10 em atenção",
    },
    activeAlerts: {
      label: "Alertas ativos",
      value: 7,
      trend: {
        direction: "down",
        value: 18,
        valueType: "percentage",
        comparedTo: "últimas 24h",
      },
      description: "Queda após ações corretivas nos silos 04 e 07",
    },
    silosOkPercentage: {
      label: "% Silos OK",
      value: 68,
      unit: "%",
      trend: {
        direction: "up",
        value: 5,
        valueType: "percentage",
        comparedTo: "última inspeção",
      },
      description: "Meta de estabilidade é 75%",
    },
    averageTemperature: {
      label: "Temperatura média (24h)",
      value: 27.6,
      unit: "°C",
      trend: {
        direction: "down",
        value: 0.8,
        valueType: "absolute",
        comparedTo: "período anterior",
      },
      description: "Monitorar silo 12 devido à variação brusca",
    },
  },
  criticalAlerts: [
    {
      id: "alert-001",
      siloName: "Silo 04",
      alertType: "Temperatura crítica",
      severity: "critical",
      detectedAt: "2024-05-27T11:05:00-03:00",
      durationMinutes: 185,
      status: "active",
      description:
        "Temperatura acima do limite superior (34°C). Risco de hotspots no terço superior.",
      recommendedAction:
        "Inspecionar ventiladores e considerar transferência parcial do lote.",
    },
    {
      id: "alert-002",
      siloName: "Silo 07",
      alertType: "Umidade elevada",
      severity: "critical",
      detectedAt: "2024-05-27T08:42:00-03:00",
      durationMinutes: 320,
      status: "acknowledged",
      description:
        "Umidade relativa interna acima de 75%. Possível condensação próxima à base.",
      recommendedAction:
        "Acionar secagem localizada e registrar checklist de inspeção.",
    },
    {
      id: "alert-003",
      siloName: "Silo 15",
      alertType: "CO₂ elevado",
      severity: "warning",
      detectedAt: "2024-05-26T22:18:00-03:00",
      durationMinutes: 640,
      status: "active",
      description:
        "Acúmulo de CO₂ acima do patamar de segurança. Tendência de fermentação nas camadas centrais.",
      recommendedAction:
        "Programar aeração forçada e reavaliar em 6 horas.",
    },
  ],
  monthlyAlertBreakdown: [
    {
      month: "Jan/24",
      total: 42,
      critical: 12,
      warning: 20,
      resolved: 38,
    },
    {
      month: "Fev/24",
      total: 37,
      critical: 9,
      warning: 18,
      resolved: 33,
    },
    {
      month: "Mar/24",
      total: 55,
      critical: 16,
      warning: 24,
      resolved: 48,
    },
    {
      month: "Abr/24",
      total: 61,
      critical: 18,
      warning: 26,
      resolved: 53,
    },
    {
      month: "Mai/24",
      total: 49,
      critical: 14,
      warning: 22,
      resolved: 44,
    },
  ],
};
