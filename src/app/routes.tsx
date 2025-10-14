import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import { OverviewDashboard } from '../components/OverviewDashboard';
import { FieldMap } from '../components/FieldMap';
import { FieldManagement } from '../components/FieldManagement';
import { SatelliteMonitor } from '../components/SatelliteMonitor';
import { FleetManagement } from '../components/FleetManagement';
import { AgriWeatherAI } from '../components/AgriWeatherAI';
import { AgroPestAI } from '../components/AgroPestAI';
import { EconomicDashboard } from '../components/EconomicDashboard';
import { TaskManagement } from '../components/TaskManagement';
import { HardwareStatus } from '../components/HardwareStatus';
import { AlertsPage } from '../components/AlertsPage';
import { Analytics } from '../components/Analytics';
import { MessagesReports } from '../components/MessagesReports';
import { Integrations } from '../components/Integrations';
import { MobileOverview } from '../components/MobileOverview';
import { MobileFieldMap } from '../components/MobileFieldMap';
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
  mobileComponent?: ComponentType;
  primary?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    component: OverviewDashboard,
    mobileComponent: MobileOverview,
    primary: true,
  },
  {
    id: 'field-map',
    label: 'Field Map',
    icon: Map,
    component: FieldMap,
    mobileComponent: MobileFieldMap,
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
