import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  Pie
} from "recharts";

// Mock data - replace with real data from your backend
const metrics = [
  {
    title: "Total Investors",
    value: "1,234",
    change: "+12% from last month",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Active Trips",
    value: "23",
    change: "+3 new this month",
    changeType: "positive" as const,
    icon: MapPin,
  },
  {
    title: "Total Profit",
    value: "$45,231",
    change: "+20.1% from last month",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Portfolio Value",
    value: "$234,567",
    change: "+8.5% this month",
    changeType: "positive" as const,
    icon: DollarSign,
  },
];

const recentTrips = [
  {
    id: 1,
    name: "Berger Paints",
    location: "India",
    investors: 45,
    targetAmount: 50000,
    currentAmount: 42500,
    expectedReturn: "15%",
    status: "active",
    endDate: "2025-05-01"
  },
  {
    id: 2,
    name: "Asian Paints",
    location: "India", 
    investors: 32,
    targetAmount: 75000,
    currentAmount: 75000,
    expectedReturn: "18%",
    status: "completed",
    endDate: "2025-05-15"
  },
  {
    id: 3,
    name: "Coca Cola",
    location: "Global",
    investors: 28,
    targetAmount: 40000,
    currentAmount: 35200,
    expectedReturn: "12%",
    status: "active",
    endDate: "2025-10-20"
  }
];

// Analytics data for charts
const investmentGrowthData = [
  { month: 'Jan', totalValue: 45000, profit: 2100 },
  { month: 'Feb', totalValue: 52000, profit: 2800 },
  { month: 'Mar', totalValue: 61000, profit: 3200 },
  { month: 'Apr', totalValue: 68000, profit: 3800 },
  { month: 'May', totalValue: 78000, profit: 4500 },
  { month: 'Jun', totalValue: 85000, profit: 5200 },
  { month: 'Jul', totalValue: 94000, profit: 5900 },
  { month: 'Aug', totalValue: 108000, profit: 6800 },
  { month: 'Sep', totalValue: 125000, profit: 7600 }
];

const portfolioDistribution = [
  { name: 'Berger Paints', value: 35, amount: 87500, color: 'hsl(var(--primary))' },
  { name: 'Asian Paints', value: 28, amount: 70000, color: 'hsl(var(--success))' },
  { name: 'Coca Cola', value: 22, amount: 55000, color: 'hsl(var(--warning))' },
  { name: 'Dynamic Cable', value: 15, amount: 37500, color: 'hsl(var(--destructive))' }
];

const monthlyReturnsData = [
  { month: 'Jan', returns: 8.2 },
  { month: 'Feb', returns: 12.1 },
  { month: 'Mar', returns: 15.3 },
  { month: 'Apr', returns: 9.8 },
  { month: 'May', returns: 18.5 },
  { month: 'Jun', returns: 14.2 },
  { month: 'Jul', returns: 21.1 },
  { month: 'Aug', returns: 16.8 },
  { month: 'Sep', returns: 19.4 }
];

const tripPerformanceData = [
  { trip: 'Berger', expected: 15, actual: 18.2 },
  { trip: 'Asian Paints', expected: 18, actual: 21.5 },
  { trip: 'Coca Cola', expected: 12, actual: 14.8 },
  { trip: 'Dynamic Cable', expected: 14, actual: 16.3 },
  { trip: 'Hindustan Unilever', expected: 20, actual: 23.1 }
];

const Dashboard = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-success" />
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Investment Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={investmentGrowthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`, 
                    name === 'totalValue' ? 'Total Value' : 'Profit'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="totalValue"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--success))"
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% ($${props.payload.amount.toLocaleString()})`,
                    'Share'
                  ]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Returns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Returns (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReturnsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Returns']}
                />
                <Bar 
                  dataKey="returns" 
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trip Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Trip Performance vs Expected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tripPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="trip" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === 'expected' ? 'Expected' : 'Actual'
                  ]}
                />
                <Bar 
                  dataKey="expected" 
                  fill="hsl(var(--muted-foreground))"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="actual" 
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recent Investment Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{trip.name}</h3>
                    {getStatusBadge(trip.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trip.location} • {trip.investors} investors
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Target: ${trip.targetAmount.toLocaleString()}</span>
                    <span>Raised: ${trip.currentAmount.toLocaleString()}</span>
                    <span className="text-success">Return: {trip.expectedReturn}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {getProgress(trip.currentAmount, trip.targetAmount)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Funded</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;