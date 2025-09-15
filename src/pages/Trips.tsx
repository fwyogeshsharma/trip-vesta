import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TripMilestones } from "@/components/TripMilestones";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ShoppingCart,
  MapIcon,
  Plane,
  Luggage,
  Building,
  FileText,
  PlayCircle
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
    maturityDate: "2024-12-01",
    progress: 75,
    daysRemaining: 47,
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-09-20" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-09-25" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-10-01" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "completed" as const, date: "2024-10-05" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "current" as const, date: "2024-10-15" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "pending" as const, date: "2024-11-20" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "pending" as const, date: "2024-11-25" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "pending" as const, date: "2024-12-01" }
    ]
  },
  {
    id: 2,
    tripName: "African Safari",
    amount: 5000,
    investedDate: "2024-08-20",
    expectedReturn: "20%",
    currentValue: 5800,
    status: "completed",
    maturityDate: "2024-10-20",
    progress: 100,
    daysRemaining: 0,
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-08-25" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-08-30" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-09-05" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "completed" as const, date: "2024-09-10" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "completed" as const, date: "2024-09-25" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "completed" as const, date: "2024-10-15" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "completed" as const, date: "2024-10-18" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "completed" as const, date: "2024-10-20" }
    ]
  },
  {
    id: 3,
    tripName: "Bali Adventure",
    amount: 1200,
    investedDate: "2024-08-28",
    expectedReturn: "15%",
    currentValue: 1290,
    status: "active",
    maturityDate: "2024-12-15",
    progress: 60,
    daysRemaining: 61,
    milestones: [
      { id: 1, name: "Trip Started", icon: PlayCircle, status: "completed" as const, date: "2024-09-01" },
      { id: 2, name: "Bookings Confirmed", icon: Calendar, status: "completed" as const, date: "2024-09-08" },
      { id: 3, name: "Travel Arrangements", icon: Plane, status: "completed" as const, date: "2024-09-15" },
      { id: 4, name: "Accommodation Ready", icon: Building, status: "current" as const, date: "2024-10-20" },
      { id: 5, name: "Service Delivery", icon: MapIcon, status: "pending" as const, date: "2024-11-01" },
      { id: 6, name: "Trip Completion", icon: CheckCircle, status: "pending" as const, date: "2024-12-01" },
      { id: 7, name: "Invoice Processing", icon: FileText, status: "pending" as const, date: "2024-12-10" },
      { id: 8, name: "Returns Distributed", icon: DollarSign, status: "pending" as const, date: "2024-12-15" }
    ]
  }
];

const Trips = () => {
  const { toast } = useToast();
  const [selectedTrips, setSelectedTrips] = useState<Set<number>>(new Set());
  const [investmentAmounts, setInvestmentAmounts] = useState<Record<number, string>>({});
  const [isInvesting, setIsInvesting] = useState(false);

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

  const handleTripSelection = (tripId: number, checked: boolean) => {
    const newSelected = new Set(selectedTrips);
    if (checked) {
      newSelected.add(tripId);
    } else {
      newSelected.delete(tripId);
      // Remove investment amount when unchecked
      const newAmounts = { ...investmentAmounts };
      delete newAmounts[tripId];
      setInvestmentAmounts(newAmounts);
    }
    setSelectedTrips(newSelected);
  };

  const handleAmountChange = (tripId: number, amount: string) => {
    setInvestmentAmounts(prev => ({
      ...prev,
      [tripId]: amount
    }));
  };

  const handleInvestInSelected = async () => {
    if (selectedTrips.size === 0) {
      toast({
        title: "No Trips Selected",
        description: "Please select at least one trip to invest in",
        variant: "destructive"
      });
      return;
    }

    // Validate amounts
    const invalidAmounts = Array.from(selectedTrips).filter(tripId => {
      const amount = parseFloat(investmentAmounts[tripId] || "0");
      const trip = availableTrips.find(t => t.id === tripId);
      return !amount || amount < (trip?.minInvestment || 0);
    });

    if (invalidAmounts.length > 0) {
      toast({
        title: "Invalid Investment Amounts",
        description: "Please enter valid amounts for all selected trips",
        variant: "destructive"
      });
      return;
    }

    setIsInvesting(true);
    
    // Simulate investment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const totalAmount = Array.from(selectedTrips).reduce((sum, tripId) => {
      return sum + parseFloat(investmentAmounts[tripId] || "0");
    }, 0);

    toast({
      title: "Investment Successful",
      description: `Successfully invested $${totalAmount.toLocaleString()} across ${selectedTrips.size} trips`,
    });

    // Reset selections
    setSelectedTrips(new Set());
    setInvestmentAmounts({});
    setIsInvesting(false);  
  };

  const getTotalInvestment = () => {
    return Array.from(selectedTrips).reduce((sum, tripId) => {
      return sum + parseFloat(investmentAmounts[tripId] || "0");
    }, 0);
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
          {/* Investment Summary Card */}
          {selectedTrips.size > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Selected Investments ({selectedTrips.size} trips)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Investment Amount</p>
                    <p className="text-2xl font-bold">${getTotalInvestment().toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={handleInvestInSelected}
                    disabled={isInvesting || getTotalInvestment() === 0}
                    size="lg"
                  >
                    {isInvesting ? "Processing..." : `Invest in ${selectedTrips.size} Trips`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {availableTrips.map((trip) => (
              <Card key={trip.id} className={`overflow-hidden transition-all ${
                selectedTrips.has(trip.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTrips.has(trip.id)}
                        onCheckedChange={(checked) => handleTripSelection(trip.id, !!checked)}
                        disabled={trip.status === "completed"}
                        className="mt-1"
                      />
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
                  
                  {/* Investment Amount Input - Show when selected */}
                  {selectedTrips.has(trip.id) && (
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${trip.id}`}>Investment Amount</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`amount-${trip.id}`}
                            type="number"
                            placeholder={`Min: $${trip.minInvestment}`}
                            value={investmentAmounts[trip.id] || ""}
                            onChange={(e) => handleAmountChange(trip.id, e.target.value)}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">USD</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Minimum investment: ${trip.minInvestment.toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  )}
                  
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-investments" className="space-y-4">
          <div className="grid gap-6">
            {myInvestments.map((investment) => (
              <Card key={investment.id} className="overflow-hidden">
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
                <CardContent className="space-y-6">
                  {/* Investment Overview */}
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

                  {/* Overall Progress */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Overall Progress</h4>
                      <span className="text-sm text-muted-foreground">
                        {investment.status === "completed" ? "Completed" : `${investment.daysRemaining} days remaining`}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{investment.status === "completed" ? "Trip Completed" : "Progress"}</span>
                        <span>{investment.progress}%</span>
                      </div>
                      <Progress 
                        value={investment.progress} 
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground">Invested Date</p>
                        <p className="font-medium">{investment.investedDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Gain</p>
                        <p className="font-medium text-success">
                          +${(investment.currentValue - investment.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className="font-medium text-success">
                          +{(((investment.currentValue - investment.amount) / investment.amount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trip Milestones */}
                  <div className="pt-4 border-t">
                    <TripMilestones milestones={investment.milestones} />
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