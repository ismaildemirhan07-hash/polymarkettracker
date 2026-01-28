import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Wallet, Target, Trophy, Activity } from "lucide-react";

// Mock Data
const PNL_DATA = [
  { date: 'Jan 1', value: 1000 },
  { date: 'Jan 5', value: 1200 },
  { date: 'Jan 10', value: 1150 },
  { date: 'Jan 15', value: 1400 },
  { date: 'Jan 20', value: 1800 },
  { date: 'Jan 25', value: 1650 },
  { date: 'Jan 30', value: 2100 },
];

const CATEGORY_DATA = [
  { name: 'Crypto', value: 45, color: '#8b5cf6' }, // Violet
  { name: 'Sports', value: 30, color: '#10b981' }, // Emerald
  { name: 'Weather', value: 15, color: '#3b82f6' }, // Blue
  { name: 'Stocks', value: 10, color: '#f59e0b' }, // Amber
];

const WIN_RATE_DATA = [
  { category: 'Crypto', win: 65, loss: 35 },
  { category: 'Sports', win: 40, loss: 60 },
  { category: 'Weather', win: 80, loss: 20 },
  { category: 'Stocks', win: 55, loss: 45 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your trading metrics and portfolio composition.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Wallet size={18} /></div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              </div>
              <h3 className="text-2xl font-bold">$2,145.50</h3>
              <p className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" /> +15.3% this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-lg text-foreground"><Trophy size={18} /></div>
                <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              </div>
              <h3 className="text-2xl font-bold">62.5%</h3>
              <p className="text-xs text-muted-foreground mt-1">Top 10% of traders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-lg text-foreground"><Target size={18} /></div>
                <p className="text-sm font-medium text-muted-foreground">Avg ROI</p>
              </div>
              <h3 className="text-2xl font-bold">24.2%</h3>
              <p className="text-xs text-muted-foreground mt-1">Per successful bet</p>
            </CardContent>
          </Card>

           <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-lg text-foreground"><Activity size={18} /></div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
              </div>
              <h3 className="text-2xl font-bold">$12.5k</h3>
              <p className="text-xs text-muted-foreground mt-1">Lifetime turnover</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Growth Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio Growth</CardTitle>
              <CardDescription>Cumulative P&L over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PNL_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Allocation by Category</CardTitle>
              <CardDescription>Distribution of active positions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Win Rate by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Category</CardTitle>
              <CardDescription>Performance breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WIN_RATE_DATA} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  <Bar dataKey="win" name="Win %" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="loss" name="Loss %" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
