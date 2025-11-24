import { AlertTriangle, Leaf, Menu, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMobile } from '../hooks/useMobile';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  alertsToday: number;
}

export const Header = ({ alertsToday }: HeaderProps) => {
  const { isMobile } = useMobile();
  const { openSidebar } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={openSidebar} className="p-2">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center space-x-3">
          {isMobile && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-semibold tracking-tight text-foreground">PI Senac</p>
                <span className="text-xs text-muted-foreground">Projeto Integrador</span>
              </div>
            </div>
          )}
          <div className="relative" aria-label={`Alertas de hoje: ${alertsToday}`}>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{Math.max(0, alertsToday)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
};
