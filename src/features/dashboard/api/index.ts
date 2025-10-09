export { getDashboardOverview } from "./get-dashboard-overview";
export type { GetDashboardOverviewOptions } from "./get-dashboard-overview";
export { getDeviceHistory } from "./get-device-history";
export type { GetDeviceHistoryOptions } from "./get-device-history";
export { getCriticalAlerts } from "./get-critical-alerts";
export type { GetCriticalAlertsOptions } from "./get-critical-alerts";
export {
  acknowledgeCriticalAlert,
  resolveCriticalAlert,
  type UpdateCriticalAlertOptions,
  type AcknowledgeCriticalAlertPayload,
  type ResolveCriticalAlertPayload,
} from "./update-critical-alert";
