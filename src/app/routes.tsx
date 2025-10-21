import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { SilosPage } from '@/features/silos/pages/SilosPage';
import { DevicesPage } from '@/features/devices/pages/DevicesPage';
import { DataProcessPage } from '@/features/data-process/pages/DataProcessPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { HealthStatusPage } from '@/features/health/pages/HealthStatusPage';
import { CompaniesPage } from '@/features/companies/pages/CompaniesPage';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Building,
  Warehouse,
  Users as UsersIcon,
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
    id: 'alerts',
    label: 'Alertas',
    icon: AlertTriangle,
    component: AlertsPage,
    primary: true,
  },
  {
    id: 'silos',
    label: 'Silos',
    icon: Warehouse,
    component: SilosPage,
    primary: true,
  },
  {
    id: 'devices',
    label: 'Dispositivos',
    icon: Cpu,
    component: DevicesPage,
    primary: true,
  },
  {
    id: 'companies',
    label: 'Companhias',
    icon: Building,
    component: CompaniesPage,
    primary: true,
  },
  {
    id: 'data-process',
    label: 'Processamentos',
    icon: BarChart3,
    component: DataProcessPage,
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: UsersIcon,
    component: UsersPage,
  },
  {
    id: 'health',
    label: 'Status',
    icon: Activity,
    component: HealthStatusPage,
  },
];
