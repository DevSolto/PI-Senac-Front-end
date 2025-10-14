import { Badge } from '@/components/ui/badge';

import { AlertsSummary } from '../components/AlertsSummary';
import { OverviewChart } from '../components/OverviewChart';
import { OverviewStats } from '../components/OverviewStats';
import { CheckCircle2, Clock } from 'lucide-react';

import {
  cropHealthData,
  fieldStatusData,
  keyMetrics,
  overviewWeatherData,
  quickStats,
  recentAlerts,
  yieldForecastData,
} from '@/shared/utils/mocks';

export const OverviewPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agricultural Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring and insights for your agricultural operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-agro-light-green text-agro-green">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated: 2 min ago
          </Badge>
        </div>
      </div>

      <OverviewStats keyMetrics={keyMetrics} quickStats={quickStats} />
      <OverviewChart
        cropHealthData={cropHealthData}
        fieldStatusData={fieldStatusData}
        yieldForecastData={yieldForecastData}
        weatherData={overviewWeatherData}
      />
      <AlertsSummary alerts={recentAlerts} />
    </div>
  );
};
