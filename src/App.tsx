import React, { useState, useEffect } from 'react';
import { OverviewDashboard } from './components/OverviewDashboard';
import { FieldMap } from './components/FieldMap';
import { FieldManagement } from './components/FieldManagement';
import { SatelliteMonitor } from './components/SatelliteMonitor';
import { FleetManagement } from './components/FleetManagement';
import { AgriWeatherAI } from './components/AgriWeatherAI';
import { AgroPestAI } from './components/AgroPestAI';
import { EconomicDashboard } from './components/EconomicDashboard';
import { TaskManagement } from './components/TaskManagement';
import { HardwareStatus } from './components/HardwareStatus';
import { AlertsPage } from './components/AlertsPage';
import { Analytics } from './components/Analytics';
import { MessagesReports } from './components/MessagesReports';
import { Integrations } from './components/Integrations';
import { MobileOverview } from './components/MobileOverview';
import { MobileFieldMap } from './components/MobileFieldMap';
import { 
  Home, Map, Layers, Satellite, Truck, CloudRain, Bug, DollarSign, 
  CheckSquare, Cpu, AlertTriangle, BarChart3, MessageSquare, Settings,
  Sun, Moon, Leaf, Menu, X, MoreHorizontal
} from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './components/ui/utils';
import { Badge } from './components/ui/badge';

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Home, component: OverviewDashboard, mobileComponent: MobileOverview, primary: true },
  { id: 'field-map', label: 'Field Map', icon: Map, component: FieldMap, mobileComponent: MobileFieldMap, primary: true },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, component: AlertsPage, primary: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics, primary: true },
  { id: 'field-management', label: 'Field Management', icon: Layers, component: FieldManagement },
  { id: 'satellite', label: 'Satellites', icon: Satellite, component: SatelliteMonitor },
  { id: 'fleet', label: 'Fleet', icon: Truck, component: FleetManagement },
  { id: 'weather', label: 'Weather AI', icon: CloudRain, component: AgriWeatherAI },
  { id: 'pest', label: 'Pest AI', icon: Bug, component: AgroPestAI },
  { id: 'economic', label: 'Economics', icon: DollarSign, component: EconomicDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, component: TaskManagement },
  { id: 'hardware', label: 'Hardware', icon: Cpu, component: HardwareStatus },
  { id: 'messages', label: 'Reports', icon: MessageSquare, component: MessagesReports },
  { id: 'integrations', label: 'Integrations', icon: Settings, component: Integrations },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const primaryTabs = navigationItems.filter(item => item.primary);
  const secondaryTabs = navigationItems.filter(item => !item.primary);
  
  const currentItem = navigationItems.find(item => item.id === activeTab);
  const ActiveComponent = isMobile && currentItem?.mobileComponent 
    ? currentItem.mobileComponent 
    : currentItem?.component || OverviewDashboard;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const criticalAlerts = 3;
  const totalAlerts = 7;

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
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

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border">
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-agro-green rounded-lg flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sidebar-foreground">AgroSense AI</h1>
                    <p className="text-xs text-muted-foreground">Smart Agriculture</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="p-4 space-y-2">
                <div className="mb-4">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Primary</h3>
                  {primaryTabs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          activeTab === item.id 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                            : "text-sidebar-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.id === 'alerts' && totalAlerts > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {totalAlerts}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Additional</h3>
                  {secondaryTabs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          activeTab === item.id 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                            : "text-sidebar-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20">
          <div className="p-4">
            <ActiveComponent />
          </div>
        </main>

        {/* Bottom Navigation */}
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
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors relative",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
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
              onClick={() => setSidebarOpen(true)}
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

  // Desktop layout (existing)
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-agro-green rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">AgroSense AI</h1>
              <p className="text-xs text-muted-foreground">Smart Agriculture</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  activeTab === item.id 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === 'alerts' && totalAlerts > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {totalAlerts}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-3 py-2"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}