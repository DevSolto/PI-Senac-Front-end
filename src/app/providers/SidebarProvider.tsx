import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useMobile } from '../hooks/useMobile';

interface SidebarContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useMobile();

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen((previous) => !previous),
    }),
    [activeTab, sidebarOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};
