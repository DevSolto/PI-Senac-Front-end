import { MainLayout } from './layout/MainLayout';
import { AuthProvider } from './providers/AuthProvider';
import { MobileProvider } from './providers/MobileProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MobileProvider>
          <SidebarProvider>
            <MainLayout />
            <Toaster richColors closeButton />
          </SidebarProvider>
        </MobileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
