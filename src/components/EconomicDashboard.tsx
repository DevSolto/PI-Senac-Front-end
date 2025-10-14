import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { crop: 'Corn', revenue: 850000, cost: 520000, profit: 330000 },
  { crop: 'Soybeans', revenue: 620000, cost: 380000, profit: 240000 },
  { crop: 'Wheat', revenue: 420000, cost: 290000, profit: 130000 },
  { crop: 'Cotton', revenue: 380000, cost: 250000, profit: 130000 },
];

export function EconomicDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Economic Dashboard</h1>
        <p className="text-muted-foreground">Financial analysis and profitability insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-agro-green" />
              <span>Total Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.27M</div>
            <p className="text-sm text-agro-green flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.3% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-agro-orange" />
              <span>Total Costs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.44M</div>
            <p className="text-sm text-agro-green flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -5.8% optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-agro-green" />
              <span>Net Profit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$830K</div>
            <p className="text-sm text-muted-foreground">36.5% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-agro-blue" />
              <span>ROI</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57.6%</div>
            <p className="text-sm text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profitability by Crop</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
              <Bar dataKey="cost" fill="#ea580c" name="Costs" />
              <Bar dataKey="profit" fill="#eab308" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}