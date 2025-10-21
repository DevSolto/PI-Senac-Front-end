import { MainLayout } from './layout/MainLayout';
import { MobileProvider } from './providers/MobileProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

const App = () => {
  return (
    <ThemeProvider>
      <MobileProvider>
        <SidebarProvider>
          <MainLayout />
          <Toaster richColors closeButton />
        </SidebarProvider>
      </MobileProvider>
    </ThemeProvider>
  );
};

export default App;
