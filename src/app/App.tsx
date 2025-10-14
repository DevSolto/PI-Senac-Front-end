import { MainLayout } from './layout/MainLayout';
import { MobileProvider } from './providers/MobileProvider';
import { SidebarProvider } from './providers/SidebarProvider';
import { ThemeProvider } from './providers/ThemeProvider';

const App = () => {
  return (
    <ThemeProvider>
      <MobileProvider>
        <SidebarProvider>
          <MainLayout />
        </SidebarProvider>
      </MobileProvider>
    </ThemeProvider>
  );
};

export default App;
