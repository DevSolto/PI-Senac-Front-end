import type { ReactNode } from 'react';

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
            {children}
            <Toaster richColors closeButton />
          </SidebarProvider>
        </MobileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
