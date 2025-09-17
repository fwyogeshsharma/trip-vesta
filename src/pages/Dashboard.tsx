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
  PieChart,
  Shield,
  Award,
  Star,
  Clock
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
    title: "Total Investor Profit",
    value: "₹3,754,173",
    change: "+20.1% from last month",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Portfolio Value",
    value: "₹19,469,061",
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
    targetAmount: 4150000,
    currentAmount: 3527500,
    expectedReturn: "15%",
    status: "active",
    endDate: "2025-05-01"
  },
  {
    id: 2,
    name: "Asian Paints",
    location: "India", 
    investors: 32,
    targetAmount: 6225000,
    currentAmount: 6225000,
    expectedReturn: "18%",
    status: "completed",
    endDate: "2025-05-15"
  },
  {
    id: 3,
    name: "Coca Cola",
    location: "Global",
    investors: 28,
    targetAmount: 3320000,
    currentAmount: 2921600,
    expectedReturn: "12%",
    status: "active",
    endDate: "2025-10-20"
  }
];

// Analytics data for charts
const investmentGrowthData = [
  { month: 'Jan', totalValue: 3735000, profit: 174300 },
  { month: 'Feb', totalValue: 4316000, profit: 232400 },
  { month: 'Mar', totalValue: 5063000, profit: 265600 },
  { month: 'Apr', totalValue: 5644000, profit: 315400 },
  { month: 'May', totalValue: 6474000, profit: 373500 },
  { month: 'Jun', totalValue: 7055000, profit: 431600 },
  { month: 'Jul', totalValue: 7802000, profit: 489700 },
  { month: 'Aug', totalValue: 8964000, profit: 564400 },
  { month: 'Sep', totalValue: 10375000, profit: 630800 }
];

const portfolioDistribution = [
  { name: 'Berger Paints', value: 35, amount: 7262500, color: 'hsl(var(--primary))' },
  { name: 'Asian Paints', value: 28, amount: 5810000, color: 'hsl(var(--success))' },
  { name: 'Coca Cola', value: 22, amount: 4565000, color: 'hsl(var(--warning))' },
  { name: 'Dynamic Cable', value: 15, amount: 3112500, color: 'hsl(var(--destructive))' }
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

// Top Investors for credibility
const topInvestors = [
  {
    id: 1,
    name: "Kiran Tata",
    title: "Executive Director, Tata Group",
    location: "Mumbai, India",
    totalInvestment: 5500000,
    activeTrips: 8,
    returns: 24.5,
    joinedDate: "2023-06-15",
    verified: true
  },
  {
    id: 2,
    name: "Aditya Birla",
    title: "Managing Director, Birla Corporation",
    location: "Kolkata, India",
    totalInvestment: 4200000,
    activeTrips: 6,
    returns: 21.8,
    joinedDate: "2023-07-22",
    verified: true
  },
  {
    id: 3,
    name: "Deepak Parekh",
    title: "Chairman, HDFC Group",
    location: "Mumbai, India",
    totalInvestment: 3800000,
    activeTrips: 5,
    returns: 19.6,
    joinedDate: "2023-08-10",
    verified: true
  },
  {
    id: 4,
    name: "Kishore Hiranandani",
    title: "Co-Founder, Hiranandani Group",
    location: "Mumbai, India",
    totalInvestment: 2900000,
    activeTrips: 4,
    returns: 22.3,
    joinedDate: "2023-09-05",
    verified: true
  },
  {
    id: 5,
    name: "Ravi Ruia",
    title: "Chairman, Essar Group",
    location: "Mumbai, India",
    totalInvestment: 2100000,
    activeTrips: 3,
    returns: 18.7,
    joinedDate: "2023-10-18",
    verified: true
  },
  {
    id: 6,
    name: "Ashwin Dani",
    title: "Vice Chairman, Asian Paints",
    location: "Mumbai, India",
    totalInvestment: 1800000,
    activeTrips: 4,
    returns: 20.4,
    joinedDate: "2023-11-12",
    verified: true
  },
  {
    id: 7,
    name: "Ramesh Damani",
    title: "Stock Market Investor",
    location: "Mumbai, India",
    totalInvestment: 1500000,
    activeTrips: 3,
    returns: 25.1,
    joinedDate: "2024-01-08",
    verified: true
  },
  {
    id: 8,
    name: "Sunil Vaswani",
    title: "Chairman, Stallion Group",
    location: "Dubai, UAE",
    totalInvestment: 1200000,
    activeTrips: 2,
    returns: 17.9,
    joinedDate: "2024-02-15",
    verified: true
  }
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
                    `₹${Number(value).toLocaleString()}`, 
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
                    `${value}% (₹${props.payload.amount.toLocaleString()})`,

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

      {/* Recent Trips and Top Investors Grid */}
      <div className="grid gap-6 md:grid-cols-2">
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
                      <span>Target: ₹{trip.targetAmount.toLocaleString()}</span>
                      <span>Raised: ₹{trip.currentAmount.toLocaleString()}</span>
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

        {/* Top Investors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Investors
              <Badge variant="outline" className="ml-auto">
                Verified
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInvestors.slice(0, 3).map((investor, index) => (
                <div key={investor.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                        {investor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {investor.verified && (
                        <Shield className="absolute -top-1 -right-1 h-4 w-4 text-success bg-white rounded-full" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{investor.name}</h3>
                        {index < 3 && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{investor.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {investor.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">
                      {investor.returns}%
                    </div>
                    <p className="text-xs text-muted-foreground">Returns</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{(investor.totalInvestment / 100000).toFixed(1)}L invested
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Verified Investors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Our Verified Investor Community
            <Badge variant="outline" className="ml-2">
              <Shield className="h-3 w-3 mr-1" />
              All Verified
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topInvestors.map((investor) => (
              <div key={investor.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-semibold">
                    {investor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <Shield className="absolute -top-0.5 -right-0.5 h-3 w-3 text-success bg-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{investor.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{investor.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{investor.activeTrips} trips</span>
                    <span>•</span>
                    <span className="text-success font-medium">{investor.returns}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Since {new Date(investor.joinedDate).getFullYear()}
                  </div>
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