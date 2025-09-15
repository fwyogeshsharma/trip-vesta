import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Activity,
  Target
} from "lucide-react";

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
    name: "Bali Adventure",
    location: "Indonesia",
    investors: 45,
    targetAmount: 50000,
    currentAmount: 42500,
    expectedReturn: "15%",
    status: "active",
    endDate: "2024-12-15"
  },
  {
    id: 2,
    name: "Swiss Alps Trek",
    location: "Switzerland", 
    investors: 32,
    targetAmount: 75000,
    currentAmount: 75000,
    expectedReturn: "18%",
    status: "completed",
    endDate: "2024-10-30"
  },
  {
    id: 3,
    name: "Tokyo Cultural Tour",
    location: "Japan",
    investors: 28,
    targetAmount: 40000,
    currentAmount: 35200,
    expectedReturn: "12%",
    status: "active",
    endDate: "2024-11-20"
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