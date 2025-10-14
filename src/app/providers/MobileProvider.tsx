import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface MobileContextValue {
  isMobile: boolean;
}

export const MobileContext = createContext<MobileContextValue | undefined>(undefined);

const MOBILE_BREAKPOINT = 768;

export const MobileProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = useMemo(
    () => ({
      isMobile,
    }),
    [isMobile],
  );

  return <MobileContext.Provider value={value}>{children}</MobileContext.Provider>;
};
