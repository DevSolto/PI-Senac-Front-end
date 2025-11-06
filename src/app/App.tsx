import type { ReactNode } from 'react';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RealtimeMockProvider } from '@/contexts/RealtimeMockProvider';

import { AuthProvider } from './providers/AuthProvider';
import { MobileProvider } from './providers/MobileProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

interface AppProps {
  children: ReactNode;
}

const App = ({ children }: AppProps) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MobileProvider>
          <SidebarProvider>
            <RealtimeMockProvider>
              {children}
            </RealtimeMockProvider>
            <Toaster richColors closeButton />
            {import.meta.env.DEV ? (
              <ReactQueryDevtools buttonPosition="bottom-left" />
            ) : null}
          </SidebarProvider>
        </MobileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
