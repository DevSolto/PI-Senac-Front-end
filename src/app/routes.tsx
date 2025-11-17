import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { SilosPage } from '@/features/silos/pages/SilosPage';
import { DevicesPage } from '@/features/devices/pages/DevicesPage';
import { DataProcessPage } from '@/features/data-process/pages/DataProcessPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { HealthStatusPage } from '@/features/health/pages/HealthStatusPage';
import { CompaniesPage } from '@/features/companies/pages/CompaniesPage';
import { DashboardPage } from '@/pages/Dashboard';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Building,
  Warehouse,
  Users as UsersIcon,
  LayoutDashboard,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  element: ReactNode;
  primary?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    element: <DashboardPage />,
    primary: true,
  },
  {
    id: 'companies',
    label: 'Companhias',
    icon: Building,
    path: '/companies',
    element: <CompaniesPage />,
    primary: true,
  },
  {
    id: 'silos',
    label: 'Silos',
    icon: Warehouse,
    path: '/silos',
    element: <SilosPage />,
    primary: true,
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: UsersIcon,
    path: '/users',
    element: <UsersPage />,
  },
];
