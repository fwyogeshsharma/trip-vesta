import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real data
const availableTrips = [
  {
    id: 1,
    name: "Bali Adventure",
    location: "Indonesia",
    duration: "14 days",
    targetAmount: 50000,
    currentAmount: 42500,
    expectedReturn: "15%",
    investorCount: 45,
    status: "active",
    endDate: "2024-12-15",
    minInvestment: 500,
    description: "Explore the beautiful beaches and cultural heritage of Bali with our premium adventure package.",
    highlights: ["Premium accommodation", "Cultural tours", "Adventure activities", "Professional guides"]
  },
  {
    id: 2,
    name: "Swiss Alps Trek",
    location: "Switzerland", 
    duration: "10 days",
    targetAmount: 75000,
    currentAmount: 75000,
    expectedReturn: "18%",
    investorCount: 32,
    status: "completed",
    endDate: "2024-10-30",
    minInvestment: 1000,
    description: "Experience the breathtaking Swiss Alps with hiking, luxury lodges, and scenic railways.",
    highlights: ["Luxury mountain lodges", "Scenic train rides", "Professional hiking guides", "Gourmet meals"]
  },
  {
    id: 3,
    name: "Tokyo Cultural Tour",
    location: "Japan",
    duration: "12 days",
    targetAmount: 40000,
    currentAmount: 35200,
    expectedReturn: "12%",
    investorCount: 28,
    status: "active",
    endDate: "2024-11-20",
    minInvestment: 300,
    description: "Immerse yourself in Japanese culture with traditional experiences and modern attractions.",
    highlights: ["Traditional ryokan stays", "Cultural workshops", "Food experiences", "Local guides"]
  }
];

const myInvestments = [
  {
    id: 1,
    tripName: "Santorini Sunset",
    amount: 2500,
    investedDate: "2024-09-15",
    expectedReturn: "14%",
    currentValue: 2650,
    status: "active",
    maturityDate: "2024-12-01"
  },
  {
    id: 2,
    tripName: "African Safari",
    amount: 5000,
    investedDate: "2024-08-20",
    expectedReturn: "20%",
    currentValue: 5800,
    status: "completed",
    maturityDate: "2024-10-20"
  }
];

const Trips = () => {
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);

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

  const handleInvest = (tripId: number, tripName: string) => {
    toast({
      title: "Investment Initiated",
      description: `Investment process started for ${tripName}`,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trip Investments</h1>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-muted-foreground">{availableTrips.length} opportunities</span>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Trips</TabsTrigger>
          <TabsTrigger value="my-investments">My Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-6">
            {availableTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {trip.name}
                        {getStatusBadge(trip.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trip.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {trip.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {trip.investorCount} investors
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        {trip.expectedReturn}
                      </div>
                      <p className="text-xs text-muted-foreground">Expected Return</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{trip.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{getProgress(trip.currentAmount, trip.targetAmount)}%</span>
                      </div>
                      <Progress 
                        value={getProgress(trip.currentAmount, trip.targetAmount)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${trip.currentAmount.toLocaleString()} raised</span>
                        <span>${trip.targetAmount.toLocaleString()} target</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Min Investment:</span>
                          <p className="font-medium">${trip.minInvestment}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End Date:</span>
                          <p className="font-medium">{trip.endDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Trip Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleInvest(trip.id, trip.name)}
                      disabled={trip.status === "completed"}
                      className="flex-1"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {trip.status === "completed" ? "Completed" : "Invest Now"}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedTrip(trip.id)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-investments" className="space-y-4">
          <div className="grid gap-4">
            {myInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {investment.tripName}
                      {investment.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                    </CardTitle>
                    {getStatusBadge(investment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Invested Amount</p>
                      <p className="text-lg font-semibold">${investment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-lg font-semibold text-success">
                        ${investment.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Return</p>
                      <p className="text-lg font-semibold">{investment.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {investment.status === "completed" ? "Completed" : "Maturity Date"}
                      </p>
                      <p className="text-lg font-semibold">{investment.maturityDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trips;