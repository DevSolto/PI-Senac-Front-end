import { Leaf, Moon, Sun, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import type { NavigationItem } from '../routes';
import { navigationItems } from '../routes';
import { useMobile } from '../hooks/useMobile';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';

interface SidebarProps {
  primaryTabs: NavigationItem[];
  secondaryTabs: NavigationItem[];
  totalAlerts: number;
}

export const Sidebar = ({ primaryTabs, secondaryTabs, totalAlerts }: SidebarProps) => {
  const { isMobile } = useMobile();
  const { activeTab, setActiveTab, sidebarOpen, closeSidebar } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectTab = (tabId: string) => {
    const targetItem = navigationItems.find((item) => item.id === tabId);

    if (!targetItem) {
      return;
    }

    const normalizedPath = targetItem.path.startsWith('/') ? targetItem.path : `/${targetItem.path}`;

    if (location.pathname !== normalizedPath) {
      navigate(normalizedPath);
    }

    setActiveTab(tabId);
    if (isMobile) {
      closeSidebar();
    }
  };

  const renderNavButton = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleSelectTab(item.id)}
        className={cn(
          'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground',
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="truncate text-sm font-medium">{item.label}</span>
        {item.id === 'alerts' && totalAlerts > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {totalAlerts}
          </Badge>
        )}
      </button>
    );
  };

  if (isMobile) {
    if (!sidebarOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={closeSidebar} />
        <div className="absolute left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">PI Senac</p>
                <p className="text-sm leading-snug text-muted-foreground">Projeto Integrador</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeSidebar} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="p-4 space-y-2">
            <div className="mb-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Primary</h3>
              {primaryTabs.map(renderNavButton)}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Additional</h3>
              {secondaryTabs.map(renderNavButton)}
            </div>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-xl font-semibold tracking-tight text-sidebar-foreground">PI Senac</p>
            <p className="text-sm leading-snug text-muted-foreground">Projeto Integrador</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(renderNavButton)}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" onClick={toggleTheme} className="w-full flex items-center space-x-3 px-3 py-2">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
      </div>
    </div>
  );
};
