import { AlertTriangle, Leaf, Menu, Moon, Sun } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { useMobile } from '../hooks/useMobile';
import { useSidebar } from '../hooks/useSidebar';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  totalAlerts: number;
  criticalAlerts: number;
}

export const Header = ({ totalAlerts, criticalAlerts }: HeaderProps) => {
  const { isMobile } = useMobile();
  const { openSidebar } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();

  if (!isMobile) {
    return null;
  }

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={openSidebar} className="p-2">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-agro-green rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">AgroSense AI</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {totalAlerts > 0 && (
          <div className="relative">
            <AlertTriangle className="w-5 h-5 text-agro-orange" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-agro-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs">{criticalAlerts}</span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
};
