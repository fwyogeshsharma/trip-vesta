import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO, pageSEO } from "@/hooks/useSEO";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Percent,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Real lender data - 28 small company CEOs and founders
const investors = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@techflow.com",
    totalInvested: 1850000,
    walletBalance: 275000,
    profitEarned: 305250,
    joinedDate: "2023-06-15",
    status: "active",
    interestRate: 16.5
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@digitalhub.com",
    totalInvested: 1450000,
    walletBalance: 220000,
    profitEarned: 263900,
    joinedDate: "2023-07-22",
    status: "active",
    interestRate: 18.2
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit.patel@datavision.com",
    totalInvested: 2120000,
    walletBalance: 320000,
    profitEarned: 313760,
    joinedDate: "2023-08-10",
    status: "active",
    interestRate: 14.8
  },
  {
    id: 4,
    name: "Sneha Reddy",
    email: "sneha.reddy@hrconnect.com",
    totalInvested: 950000,
    walletBalance: 145000,
    profitEarned: 167200,
    joinedDate: "2023-09-05",
    status: "active",
    interestRate: 17.6
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@salesforce.in",
    totalInvested: 1680000,
    walletBalance: 255000,
    profitEarned: 265440,
    joinedDate: "2023-10-18",
    status: "active",
    interestRate: 15.8
  },
  {
    id: 6,
    name: "Kavya Nair",
    email: "kavya.nair@fintech.in",
    totalInvested: 2400000,
    walletBalance: 360000,
    profitEarned: 465600,
    joinedDate: "2023-11-12",
    status: "active",
    interestRate: 19.4
  },
  {
    id: 7,
    name: "Arjun Mehta",
    email: "arjun.mehta@projectworks.com",
    totalInvested: 1150000,
    walletBalance: 175000,
    profitEarned: 150650,
    joinedDate: "2024-01-08",
    status: "active",
    interestRate: 13.1
  },
  {
    id: 8,
    name: "Deepika Joshi",
    email: "deepika.joshi@aidatalabs.com",
    totalInvested: 1590000,
    walletBalance: 240000,
    profitEarned: 332310,
    joinedDate: "2024-02-15",
    status: "active",
    interestRate: 20.9
  },
  {
    id: 9,
    name: "Rahul Gupta",
    email: "rahul.gupta@operationsplus.com",
    totalInvested: 1720000,
    walletBalance: 260000,
    profitEarned: 278640,
    joinedDate: "2024-03-01",
    status: "active",
    interestRate: 16.2
  },
  {
    id: 10,
    name: "Anita Desai",
    email: "anita.desai@bizconpro.com",
    totalInvested: 880000,
    walletBalance: 135000,
    profitEarned: 130240,
    joinedDate: "2024-03-15",
    status: "active",
    interestRate: 14.8
  },
  {
    id: 11,
    name: "Manoj Agarwal",
    email: "manoj.agarwal@teamsync.com",
    totalInvested: 1650000,
    walletBalance: 250000,
    profitEarned: 290400,
    joinedDate: "2024-04-02",
    status: "active",
    interestRate: 17.6
  },
  {
    id: 12,
    name: "Swati Kulkarni",
    email: "swati.kulkarni@productlaunch.com",
    totalInvested: 1980000,
    walletBalance: 300000,
    profitEarned: 304920,
    joinedDate: "2024-04-18",
    status: "active",
    interestRate: 15.4
  },
  {
    id: 13,
    name: "Rohit Verma",
    email: "rohit.verma@creativedesign.com",
    totalInvested: 920000,
    walletBalance: 140000,
    profitEarned: 167440,
    joinedDate: "2024-05-05",
    status: "active",
    interestRate: 18.2
  },
  {
    id: 14,
    name: "Neha Kapoor",
    email: "neha.kapoor@contentkings.com",
    totalInvested: 750000,
    walletBalance: 115000,
    profitEarned: 117750,
    joinedDate: "2024-05-20",
    status: "active",
    interestRate: 15.7
  },
  {
    id: 15,
    name: "Sanjay Rao",
    email: "sanjay.rao@archdesigns.com",
    totalInvested: 2300000,
    walletBalance: 345000,
    profitEarned: 489900,
    joinedDate: "2024-06-08",
    status: "active",
    interestRate: 21.3
  },
  {
    id: 16,
    name: "Pooja Malhotra",
    email: "pooja.malhotra@accubooks.com",
    totalInvested: 1280000,
    walletBalance: 195000,
    profitEarned: 216320,
    joinedDate: "2024-06-25",
    status: "active",
    interestRate: 16.9
  },
  {
    id: 17,
    name: "Kiran Pandey",
    email: "kiran.pandey@qualityfirst.com",
    totalInvested: 1060000,
    walletBalance: 160000,
    profitEarned: 160060,
    joinedDate: "2024-07-10",
    status: "active",
    interestRate: 15.1
  },
  {
    id: 18,
    name: "Varun Shetty",
    email: "varun.shetty@cloudops.com",
    totalInvested: 1620000,
    walletBalance: 245000,
    profitEarned: 281880,
    joinedDate: "2024-07-28",
    status: "active",
    interestRate: 17.4
  },
  {
    id: 19,
    name: "Ritu Saxena",
    email: "ritu.saxena@trainingpro.com",
    totalInvested: 890000,
    walletBalance: 135000,
    profitEarned: 121040,
    joinedDate: "2024-08-12",
    status: "active",
    interestRate: 13.6
  },
  {
    id: 20,
    name: "Ashish Bansal",
    email: "ashish.bansal@researchhub.com",
    totalInvested: 1470000,
    walletBalance: 225000,
    profitEarned: 291060,
    joinedDate: "2024-08-30",
    status: "active",
    interestRate: 19.8
  },
  {
    id: 21,
    name: "Sunita Jain",
    email: "sunita.jain@adminworks.com",
    totalInvested: 720000,
    walletBalance: 110000,
    profitEarned: 92880,
    joinedDate: "2024-09-15",
    status: "active",
    interestRate: 12.9
  },
  {
    id: 22,
    name: "Naveen Kumar",
    email: "naveen.kumar@techsupport.com",
    totalInvested: 1110000,
    walletBalance: 170000,
    profitEarned: 174270,
    joinedDate: "2024-10-02",
    status: "active",
    interestRate: 15.7
  },
  {
    id: 23,
    name: "Meera Iyer",
    email: "meera.iyer@legalease.com",
    totalInvested: 1890000,
    walletBalance: 285000,
    profitEarned: 362880,
    joinedDate: "2024-10-18",
    status: "active",
    interestRate: 19.2
  },
  {
    id: 24,
    name: "Gaurav Mishra",
    email: "gaurav.mishra@businessgrow.com",
    totalInvested: 1440000,
    walletBalance: 220000,
    profitEarned: 237600,
    joinedDate: "2024-11-05",
    status: "active",
    interestRate: 16.5
  },
  {
    id: 25,
    name: "Divya Bhat",
    email: "divya.bhat@designcraft.com",
    totalInvested: 930000,
    walletBalance: 140000,
    profitEarned: 133020,
    joinedDate: "2024-11-20",
    status: "active",
    interestRate: 14.3
  },
  {
    id: 26,
    name: "Harsh Agrawal",
    email: "harsh.agrawal@networktech.com",
    totalInvested: 1260000,
    walletBalance: 190000,
    profitEarned: 215460,
    joinedDate: "2024-12-08",
    status: "active",
    interestRate: 17.1
  },
  {
    id: 27,
    name: "Shruti Tripathi",
    email: "shruti.tripathi@eventmasters.com",
    totalInvested: 870000,
    walletBalance: 130000,
    profitEarned: 116580,
    joinedDate: "2024-12-22",
    status: "active",
    interestRate: 13.4
  },
  {
    id: 28,
    name: "Vishal Khanna",
    email: "vishal.khanna@writeright.com",
    totalInvested: 1080000,
    walletBalance: 165000,
    profitEarned: 171720,
    joinedDate: "2025-01-10",
    status: "active",
    interestRate: 15.9
  }
];

const trips = [
  {
    id: 1,
    name: "Berger Paints",
    location: "India",
    status: "active",
    targetAmount: 4150000,
    currentAmount: 3527500,
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
    targetAmount: 6225000,
    currentAmount: 6225000,
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
    targetAmount: 3320000,
    currentAmount: 2921600,
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
    targetAmount: 4980000,
    currentAmount: 3984000,
    investorCount: 38,
    startDate: "2024-11-15",
    endDate: "2024-12-30",
    expectedReturn: "16%",
    tdsPercentage: 2.8
  },
  {
    id: 5,
    name: "Tesla Motors",
    location: "Global",
    status: "completed",
    targetAmount: 8500000,
    currentAmount: 8500000,
    investorCount: 42,
    startDate: "2024-08-01",
    endDate: "2024-09-15",
    expectedReturn: "20%",
    tdsPercentage: 3.5
  },
  {
    id: 6,
    name: "Apple Inc",
    location: "Global",
    status: "completed",
    targetAmount: 12000000,
    currentAmount: 12000000,
    investorCount: 55,
    startDate: "2024-07-10",
    endDate: "2024-08-25",
    expectedReturn: "22%",
    tdsPercentage: 4.0
  },
  {
    id: 7,
    name: "Microsoft Corp",
    location: "Global",
    status: "completed",
    targetAmount: 9750000,
    currentAmount: 9750000,
    investorCount: 48,
    startDate: "2024-06-15",
    endDate: "2024-07-30",
    expectedReturn: "19%",
    tdsPercentage: 3.2
  }
];

const Admin = () => {
  // SEO Implementation - Admin pages should not be indexed
  useSEO({
    ...pageSEO.admin,
    ogUrl: typeof window !== 'undefined' ? window.location.href : 'https://tripvesta.com/admin',
    canonical: 'https://tripvesta.com/admin'
  });

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInterest, setEditingInterest] = useState<number | null>(null);
  const [newInterestRate, setNewInterestRate] = useState("");
  const [editingTDS, setEditingTDS] = useState<number | null>(null);
  const [newTDSRate, setNewTDSRate] = useState("");
  const [collapsedDistributions, setCollapsedDistributions] = useState<{[key: number]: boolean}>({});

  // Trip assignment state
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [assignmentAmount, setAssignmentAmount] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Percent allocation calculator state
  const [totalAmount, setTotalAmount] = useState("");
  const [tripType, setTripType] = useState<"rr" | "other" | "">("");
  const [companyName, setCompanyName] = useState("");

  // Calculate percentage allocation based on trip type
  const calculateAllocation = () => {
    const amount = parseFloat(totalAmount || "0");
    if (amount <= 0 || !tripType) return null;

    const investorAmount = amount * 0.6; // 60% always goes to investors
    const remainingAmount = amount * 0.4; // 40% remaining

    if (tripType === "rr") {
      return {
        investorAmount,
        rrAmount: remainingAmount, // 40% to RR
        companyAmount: 0,
        total: amount
      };
    } else {
      return {
        investorAmount,
        rrAmount: remainingAmount * 0.1, // 10% of remaining (4% of total)
        companyAmount: remainingAmount * 0.9, // 90% of remaining (36% of total)
        total: amount
      };
    }
  };

  const allocation = calculateAllocation();

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
          description: `${investor.name} only has ₹${investor.walletBalance.toLocaleString()} in their wallet`,
          variant: "destructive"
        });
        return;
      }

      setIsAssigning(true);
      
      // Simulate assignment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Trip Assignment Successful",
        description: `Assigned ${trip.name} to ${investor.name} for ₹${amount.toLocaleString()}`,
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
    <div className="flex-1 space-y-6 p-6 bg-background text-foreground">
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
            <CardTitle className="text-sm font-medium">Total Lenders</CardTitle>
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
            <div className="text-2xl font-bold">₹{totalStats.totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{totalStats.totalProfit.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balances</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStats.totalWalletBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investors">Lenders</TabsTrigger>
          <TabsTrigger value="assignments">Trip Assignments</TabsTrigger>
          <TabsTrigger value="trips">Trips History</TabsTrigger>
          <TabsTrigger value="calculations">Percent Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lender Management</CardTitle>
                  <CardDescription>Manage lender accounts and interest rates</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lenders..."
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
                          <p className="font-semibold">₹{investor.totalInvested.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Wallet</p>
                          <p className="font-semibold">₹{investor.walletBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className="font-semibold text-success">₹{investor.profitEarned.toLocaleString()}</p>
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
                  <CardTitle>Trips History</CardTitle>
                  <CardDescription>View and manage investment trips history</CardDescription>
                </div>
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
                            {trip.investorCount} lenders
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
                        <p className="font-semibold">₹{trip.targetAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Amount</p>
                        <p className="font-semibold">₹{trip.currentAmount.toLocaleString()}</p>
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

                    </div>

                    {/* Profit Distribution Row - Only for completed trips */}
                    {trip.status === "completed" && (() => {
                      // Generate consistent profit amounts based on trip ID for demo
                      const seed = trip.id * 1000;
                      const totalProfit = (seed % 7000) + 5000; // 5k-12k range

                      // Determine if this is RR trip or other company trip based on trip ID
                      const isRRTrip = trip.id % 2 === 0; // Even IDs are RR trips, odd IDs are other company

                      const isCollapsed = collapsedDistributions[trip.id] !== false; // Default collapsed

                      if (isRRTrip) {
                        // 2 columns: Investor (60%) + RR (40%)
                        const investorProfit = Math.floor(totalProfit * 0.60);
                        const rrProfit = Math.floor(totalProfit * 0.40);

                        return (
                          <div className="mt-4 pt-4 border-t">
                            <Collapsible
                              open={!isCollapsed}
                              onOpenChange={(open) => {
                                setCollapsedDistributions(prev => ({
                                  ...prev,
                                  [trip.id]: !open
                                }));
                              }}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center justify-between w-full p-2 text-sm font-medium text-success hover:bg-success/5"
                                >
                                  <span>Profit Distribution (RR Trip)</span>
                                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-success/5 p-3 rounded-lg mt-2">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center p-2 bg-primary/10 rounded">
                                      <div className="font-medium text-primary">Lender Profit</div>
                                      <div className="text-lg font-bold">₹{investorProfit.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">60% of ₹{totalProfit.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue/10 rounded">
                                      <div className="font-medium text-blue-600">RR Profit</div>
                                      <div className="text-lg font-bold">₹{rrProfit.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">40% of ₹{totalProfit.toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      } else {
                        // 3 columns: Investor (60%) + Company (36%) + RR (4%)
                        const investorProfit = Math.floor(totalProfit * 0.60);
                        const companyProfit = Math.floor(totalProfit * 0.36);
                        const rrProfit = Math.floor(totalProfit * 0.04);

                        return (
                          <div className="mt-4 pt-4 border-t">
                            <Collapsible
                              open={!isCollapsed}
                              onOpenChange={(open) => {
                                setCollapsedDistributions(prev => ({
                                  ...prev,
                                  [trip.id]: !open
                                }));
                              }}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center justify-between w-full p-2 text-sm font-medium text-warning hover:bg-warning/5"
                                >
                                  <span>Profit Distribution (Other Company Trip)</span>
                                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-warning/5 p-3 rounded-lg mt-2">
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="text-center p-2 bg-primary/10 rounded">
                                      <div className="font-medium text-primary">Lender Profit</div>
                                      <div className="text-lg font-bold">₹{investorProfit.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">60% of ₹{totalProfit.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center p-2 bg-warning/10 rounded">
                                      <div className="font-medium text-warning">Intermediate Company(Darsal pvt. ltd.) Profit</div>
                                      <div className="text-lg font-bold">₹{companyProfit.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">36% of ₹{totalProfit.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue/10 rounded">
                                      <div className="font-medium text-blue-600">RR Profit</div>
                                      <div className="text-lg font-bold">₹{rrProfit.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">4% of ₹{totalProfit.toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      }
                    })()}
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
                Assign Trips to Lenders
              </CardTitle>
              <CardDescription>
                Manually assign investment opportunities to specific lenders using their wallet funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignment Form */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="investor-select">Select Lender</Label>
                      <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                        <SelectTrigger className="bg-background border z-50">
                          <SelectValue placeholder="Choose a lender..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50 shadow-lg">
                          {investors.map((investor) => (
                            <SelectItem key={investor.id} value={investor.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{investor.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  ₹{investor.walletBalance.toLocaleString()}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedInvestor && (
                        <p className="text-xs text-muted-foreground">
                          Available Balance: ₹{investors.find(inv => inv.id.toString() === selectedInvestor)?.walletBalance.toLocaleString()}
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
                        Amount will be deducted from lender's wallet balance
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
                          <span className="text-muted-foreground">Lender:</span>
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
                            ₹{parseFloat(assignmentAmount || '0').toLocaleString()}
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
                            {isAssigning ? "Assigning..." : "Assign Trip to Lender"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select lender, trip, and amount to preview assignment</p>
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
                        <p className="font-semibold">₹207,500</p>
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
                        <p className="font-semibold">₹149,400</p>
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
                        <p className="font-semibold">₹348,600</p>
                        <p className="text-xs text-muted-foreground">18% return</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Percent Allocation Calculator
              </CardTitle>
              <CardDescription>
                Calculate percentage distribution when receiving amounts from lenders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allocation</CardTitle>
                  <CardDescription>
                    Configure percentage distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4 border-2 border-primary/30">
                      <div className="space-y-4">
                        <h5 className="font-medium text-primary">RR Trip Allocation</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Lenders:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue="60"
                                className="w-16 h-8 text-success font-medium"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">RR Platform:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue="40"
                                className="w-16 h-8 text-primary font-medium"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border-2 border-warning/30">
                      <div className="space-y-4">
                        <h5 className="font-medium text-warning">Other Company Trip Allocation</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Lenders:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue="60"
                                className="w-16 h-8 text-success font-medium"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Company:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue="36"
                                className="w-16 h-8 text-warning font-medium"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">RR Platform:</span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                defaultValue="4"
                                className="w-16 h-8 text-primary font-medium"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => {
                        toast({
                          title: "Allocation Settings Saved",
                          description: "Percentage allocation settings have been updated successfully.",
                        });
                      }}
                      className="px-8"
                    >
                      Save Allocation Settings
                    </Button>
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