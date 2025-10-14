import { useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/components/ui/utils';
import { navigationItems } from '../routes';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useMobile } from '../hooks/useMobile';
import { useSidebar } from '../hooks/useSidebar';

export const MainLayout = () => {
  const { isMobile } = useMobile();
  const { activeTab, setActiveTab, openSidebar } = useSidebar();

  const { primaryTabs, secondaryTabs } = useMemo(() => {
    const primary = navigationItems.filter((item) => item.primary);
    const secondary = navigationItems.filter((item) => !item.primary);

    return { primaryTabs: primary, secondaryTabs: secondary };
  }, []);

  const currentItem = navigationItems.find((item) => item.id === activeTab) ?? navigationItems[0];
  const ActiveComponent = currentItem?.component;

  const criticalAlerts = 3;
  const totalAlerts = 7;

  if (!ActiveComponent) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header totalAlerts={totalAlerts} criticalAlerts={criticalAlerts} />
        <Sidebar primaryTabs={primaryTabs} secondaryTabs={secondaryTabs} totalAlerts={totalAlerts} />

        <main className="flex-1 overflow-auto pb-20">
          <div className="p-4">
            <ActiveComponent />
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="flex items-center justify-around py-2">
            {primaryTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors relative',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.id === 'alerts' && totalAlerts > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-agro-red rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{criticalAlerts}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}

            <button
              onClick={openSidebar}
              className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs">More</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar primaryTabs={primaryTabs} secondaryTabs={secondaryTabs} totalAlerts={totalAlerts} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header totalAlerts={totalAlerts} criticalAlerts={criticalAlerts} />
        <main className="flex-1 overflow-auto p-6">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};
