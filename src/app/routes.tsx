import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import { OverviewPage } from '@/features/overview/pages/OverviewPage';
import { FieldMap } from '@/features/field/pages/FieldMap';
import { FieldManagement } from '@/features/field/pages/FieldManagement';
import { SatelliteMonitor } from '@/features/satellite/pages/SatelliteMonitor';
import { FleetManagement } from '@/features/fleet/pages/FleetManagement';
import { AgriWeatherAI } from '@/features/weather/pages/AgriWeatherAI';
import { AgroPestAI } from '@/features/pest/pages/AgroPestAI';
import { EconomicDashboard } from '@/features/finance/pages/EconomicDashboard';
import { TaskManagement } from '@/features/operations/pages/TaskManagement';
import { HardwareStatus } from '@/features/hardware/pages/HardwareStatus';
import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { Analytics } from '@/features/analytics/pages/Analytics';
import { MessagesReports } from '@/features/reports/pages/MessagesReports';
import { Integrations } from '@/features/integrations/pages/Integrations';
import {
  Home,
  Map,
  Layers,
  Satellite,
  Truck,
  CloudRain,
  Bug,
  DollarSign,
  CheckSquare,
  Cpu,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
  primary?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    component: OverviewPage,
    primary: true,
  },
  {
    id: 'field-map',
    label: 'Field Map',
    icon: Map,
    component: FieldMap,
    primary: true,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: AlertTriangle,
    component: AlertsPage,
    primary: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: Analytics,
    primary: true,
  },
  {
    id: 'field-management',
    label: 'Field Management',
    icon: Layers,
    component: FieldManagement,
  },
  {
    id: 'satellite',
    label: 'Satellites',
    icon: Satellite,
    component: SatelliteMonitor,
  },
  {
    id: 'fleet',
    label: 'Fleet',
    icon: Truck,
    component: FleetManagement,
  },
  {
    id: 'weather',
    label: 'Weather AI',
    icon: CloudRain,
    component: AgriWeatherAI,
  },
  {
    id: 'pest',
    label: 'Pest AI',
    icon: Bug,
    component: AgroPestAI,
  },
  {
    id: 'economic',
    label: 'Economics',
    icon: DollarSign,
    component: EconomicDashboard,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    component: TaskManagement,
  },
  {
    id: 'hardware',
    label: 'Hardware',
    icon: Cpu,
    component: HardwareStatus,
  },
  {
    id: 'messages',
    label: 'Reports',
    icon: MessageSquare,
    component: MessagesReports,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Settings,
    component: Integrations,
  },
];
