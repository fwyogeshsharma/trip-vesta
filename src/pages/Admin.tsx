import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Users, 
  TrendingUp,
  Edit,
  Plus,
  Search,
  DollarSign,
  MapPin,
  Calendar,
  UserPlus,
  Target,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for admin panel
const investors = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    totalInvested: 15000,
    walletBalance: 2500,
    profitEarned: 2300,
    joinedDate: "2024-01-15",
    status: "active",
    interestRate: 12
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    totalInvested: 8500,
    walletBalance: 1200,
    profitEarned: 980,
    joinedDate: "2024-02-20",
    status: "active",
    interestRate: 14
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike@example.com",
    totalInvested: 22000,
    walletBalance: 3200,
    profitEarned: 4100,
    joinedDate: "2023-12-10",
    status: "active",
    interestRate: 16
  }
];

const trips = [
  {
    id: 1,
    name: "Berger Paints",
    location: "India",
    status: "active",
    targetAmount: 50000,
    currentAmount: 42500,
    investorCount: 45,
    startDate: "2024-11-01",
    endDate: "2024-12-15",
    expectedReturn: "15%",
    tdsPercentage: 2.5
  },
  {
    id: 2,
    name: "Asian Paints",
    location: "India",
    status: "completed",
    targetAmount: 75000,
    currentAmount: 75000,
    investorCount: 32,
    startDate: "2024-09-15",
    endDate: "2024-10-30",
    expectedReturn: "18%",
    tdsPercentage: 3.0
  },
  {
    id: 3,
    name: "Coca Cola",
    location: "Global",
    status: "active",
    targetAmount: 40000,
    currentAmount: 35200,
    investorCount: 28,
    startDate: "2024-10-20",
    endDate: "2024-11-20",
    expectedReturn: "12%",
    tdsPercentage: 2.0
  },
  {
    id: 4,
    name: "Dynamic Cable",
    location: "India",
    status: "active",
    targetAmount: 60000,
    currentAmount: 48000,
    investorCount: 38,
    startDate: "2024-11-15",
    endDate: "2024-12-30",
    expectedReturn: "16%",
    tdsPercentage: 2.8
  }
];

const Admin = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInterest, setEditingInterest] = useState<number | null>(null);
  const [newInterestRate, setNewInterestRate] = useState("");
  const [editingTDS, setEditingTDS] = useState<number | null>(null);
  const [newTDSRate, setNewTDSRate] = useState("");
  
  // Trip assignment state
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [assignmentAmount, setAssignmentAmount] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredInvestors = investors.filter(investor => 
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateInterest = (investorId: number) => {
    if (!newInterestRate || parseFloat(newInterestRate) <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid interest rate",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Interest Rate Updated",
      description: `Interest rate updated to ${newInterestRate}%`,
    });
    
    setEditingInterest(null);
    setNewInterestRate("");
  };

  const handleAssignTripToInvestor = async () => {
    if (!selectedInvestor || !selectedTrip || !assignmentAmount) {
      toast({
        title: "Missing Information",
        description: "Please select investor, trip, and enter amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(assignmentAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive"
      });
      return;
    }

    const investor = investors.find(inv => inv.id.toString() === selectedInvestor);
    const trip = trips.find(t => t.id.toString() === selectedTrip);

    if (investor && trip) {
      if (amount > investor.walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: `${investor.name} only has $${investor.walletBalance.toLocaleString()} in their wallet`,
          variant: "destructive"
        });
        return;
      }

      setIsAssigning(true);
      
      // Simulate assignment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Trip Assignment Successful",
        description: `Assigned ${trip.name} to ${investor.name} for $${amount.toLocaleString()}`,
      });

      // Reset form
      setSelectedInvestor("");
      setSelectedTrip("");
      setAssignmentAmount("");
      setIsAssigning(false);
    }
  };

  const handleAssignFunds = (investorId: number, investorName: string) => {
    toast({
      title: "Funds Assignment",
      description: `Funds assignment initiated for ${investorName}`,
    });
  };

  const handleCreateTrip = () => {
    toast({
      title: "Create Trip",
      description: "Trip creation dialog would open here",
    });
  };

  const handleEditTrip = (tripId: number, tripName: string) => {
    toast({
      title: "Edit Trip",
      description: `Edit dialog for ${tripName} would open here`,
    });
  };

  const handleUpdateTDS = (tripId: number) => {
    if (!newTDSRate || parseFloat(newTDSRate) < 0 || parseFloat(newTDSRate) > 10) {
      toast({
        title: "Invalid TDS Rate",
        description: "Please enter a valid TDS rate between 0% and 10%",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "TDS Rate Updated",
      description: `TDS rate updated to ${newTDSRate}%`,
    });
    
    setEditingTDS(null);
    setNewTDSRate("");
  };

  const totalStats = {
    totalInvestors: investors.length,
    totalInvested: investors.reduce((sum, inv) => sum + inv.totalInvested, 0),
    totalProfit: investors.reduce((sum, inv) => sum + inv.profitEarned, 0),
    totalWalletBalance: investors.reduce((sum, inv) => sum + inv.walletBalance, 0)
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Management Dashboard</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalInvestors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalStats.totalProfit.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balances</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalWalletBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="trips">Trip Management</TabsTrigger>
          <TabsTrigger value="assignments">Trip Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investor Management</CardTitle>
                  <CardDescription>Manage investor accounts and interest rates</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search investors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInvestors.map((investor) => (
                  <div key={investor.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{investor.name}</h3>
                          {getStatusBadge(investor.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{investor.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {investor.joinedDate}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-right text-sm">
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-semibold">${investor.totalInvested.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Wallet</p>
                          <p className="font-semibold">${investor.walletBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className="font-semibold text-success">${investor.profitEarned.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Interest Rate:</span>
                        {editingInterest === investor.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={newInterestRate}
                              onChange={(e) => setNewInterestRate(e.target.value)}
                              className="w-20 h-8"
                              placeholder={investor.interestRate.toString()}
                            />
                            <span className="text-sm">%</span>
                            <Button size="sm" onClick={() => handleUpdateInterest(investor.id)}>
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setEditingInterest(null);
                                setNewInterestRate("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{investor.interestRate}%</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingInterest(investor.id);
                                setNewInterestRate(investor.interestRate.toString());
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleAssignFunds(investor.id, investor.name)}
                        disabled={investor.walletBalance === 0}
                        variant="outline"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign Funds
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trip Management</CardTitle>
                  <CardDescription>Create and manage investment trips</CardDescription>
                </div>
                <Button onClick={handleCreateTrip}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trip
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{trip.name}</h3>
                          {getStatusBadge(trip.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {trip.startDate} - {trip.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {trip.investorCount} investors
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success">{trip.expectedReturn}</p>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Target Amount</p>
                        <p className="font-semibold">${trip.targetAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Amount</p>
                        <p className="font-semibold">${trip.currentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="font-semibold">
                          {Math.round((trip.currentAmount / trip.targetAmount) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TDS Rate</p>
                        <p className="font-semibold text-warning">{trip.tdsPercentage}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">TDS (Tax Deducted at Source):</span>
                        {editingTDS === trip.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={newTDSRate}
                              onChange={(e) => setNewTDSRate(e.target.value)}
                              className="w-20 h-8"
                              placeholder={trip.tdsPercentage.toString()}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                            <span className="text-sm">%</span>
                            <Button size="sm" onClick={() => handleUpdateTDS(trip.id)}>
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setEditingTDS(null);
                                setNewTDSRate("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-warning">{trip.tdsPercentage}%</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingTDS(trip.id);
                                setNewTDSRate(trip.tdsPercentage.toString());
                              }}
                            >
                              <Percent className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => handleEditTrip(trip.id, trip.name)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Trip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Assign Trips to Investors
              </CardTitle>
              <CardDescription>
                Manually assign investment opportunities to specific investors using their wallet funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignment Form */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="investor-select">Select Investor</Label>
                      <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                        <SelectTrigger className="bg-background border z-50">
                          <SelectValue placeholder="Choose an investor..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50 shadow-lg">
                          {investors.map((investor) => (
                            <SelectItem key={investor.id} value={investor.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{investor.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  ${investor.walletBalance.toLocaleString()}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedInvestor && (
                        <p className="text-xs text-muted-foreground">
                          Available Balance: ${investors.find(inv => inv.id.toString() === selectedInvestor)?.walletBalance.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trip-select">Select Trip</Label>
                      <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                        <SelectTrigger className="bg-background border z-40">
                          <SelectValue placeholder="Choose a trip..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-40 shadow-lg">
                          {trips.filter(trip => trip.status === "active").map((trip) => (
                            <SelectItem key={trip.id} value={trip.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{trip.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {trip.expectedReturn}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTrip && (
                        <p className="text-xs text-muted-foreground">
                          Expected Return: {trips.find(t => t.id.toString() === selectedTrip)?.expectedReturn}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignment-amount">Investment Amount</Label>
                      <Input
                        id="assignment-amount"
                        type="number"
                        placeholder="0.00"
                        value={assignmentAmount}
                        onChange={(e) => setAssignmentAmount(e.target.value)}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount will be deducted from investor's wallet balance
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Assignment Summary */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Assignment Summary
                    </h4>
                    
                    {selectedInvestor && selectedTrip && assignmentAmount ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Investor:</span>
                          <span className="font-medium">
                            {investors.find(inv => inv.id.toString() === selectedInvestor)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trip:</span>
                          <span className="font-medium">
                            {trips.find(t => t.id.toString() === selectedTrip)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Investment Amount:</span>
                          <span className="font-semibold text-lg">
                            ${parseFloat(assignmentAmount || '0').toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expected Return:</span>
                          <span className="font-medium text-success">
                            {trips.find(t => t.id.toString() === selectedTrip)?.expectedReturn}
                          </span>
                        </div>
                        <div className="pt-3 border-t">
                          <Button 
                            onClick={handleAssignTripToInvestor}
                            disabled={isAssigning}
                            className="w-full"
                          >
                            {isAssigning ? "Assigning..." : "Assign Trip to Investor"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select investor, trip, and amount to preview assignment</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Recent Assignments History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Trip Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock recent assignments */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">John Smith → Berger Paints</p>
                          <p className="text-sm text-muted-foreground">Assigned 2 hours ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$2,500</p>
                        <p className="text-xs text-muted-foreground">15% return</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">Sarah Johnson → Coca Cola</p>
                          <p className="text-sm text-muted-foreground">Assigned 1 day ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$1,800</p>
                        <p className="text-xs text-muted-foreground">12% return</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">Mike Davis → Asian Paints</p>
                          <p className="text-sm text-muted-foreground">Assigned 3 days ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$4,200</p>
                        <p className="text-xs text-muted-foreground">18% return</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;