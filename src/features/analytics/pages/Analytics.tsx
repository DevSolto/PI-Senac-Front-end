import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = [
  { month: 'Jan', yield: 85, efficiency: 78, revenue: 92 },
  { month: 'Feb', yield: 88, efficiency: 82, revenue: 88 },
  { month: 'Mar', yield: 92, efficiency: 85, revenue: 95 },
  { month: 'Apr', yield: 89, efficiency: 88, revenue: 91 },
  { month: 'May', yield: 94, efficiency: 91, revenue: 97 },
  { month: 'Jun', yield: 96, efficiency: 93, revenue: 99 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Performance insights and trend analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-agro-green" />
              <span>Yield Efficiency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-sm text-agro-green flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% vs last season
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-agro-blue" />
              <span>Operational Efficiency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-sm text-muted-foreground">Equipment utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-agro-orange" />
              <span>Cost Optimization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-sm text-agro-green">Cost reduction achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-agro-yellow" />
              <span>Revenue Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-sm text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="yield" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} name="Yield %" />
              <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Efficiency %" />
              <Area type="monotone" dataKey="revenue" stackId="3" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="Revenue %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}