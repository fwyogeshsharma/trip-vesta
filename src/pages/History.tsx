import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Calendar,
  DollarSign,
  CalendarRange
} from "lucide-react";

// Mock transaction data with actual company and trip names
const transactions = [
  {
    id: 1,
    type: "investment",
    amount: 207500,
    description: "Investment in Berger Paints Transportation (Delhi to Mumbai)",
    date: "2024-09-15",
    status: "completed",
    tripName: "Berger Paints Transportation",
    category: "trip_investment"
  },
  {
    id: 2,
    type: "deposit",
    amount: 415000,
    description: "Wallet deposit from HDFC Bank ****1234",
    date: "2024-09-10",
    status: "completed",
    category: "wallet"
  },
  {
    id: 3,
    type: "profit",
    amount: 37350,
    description: "Profit from Dynamic Cables Transportation (Mumbai to Bangalore)",
    date: "2024-09-05",
    status: "completed",
    tripName: "Dynamic Cables Transportation",
    category: "profit"
  },
  {
    id: 4,
    type: "investment",
    amount: 99600,
    description: "Investment in Varun Beverages Transportation (Chennai to Kolkata)",
    date: "2024-08-28",
    status: "completed",
    tripName: "Varun Beverages Transportation",
    category: "trip_investment"
  },
  {
    id: 5,
    type: "withdrawal",
    amount: 83000,
    description: "Withdrawal to State Bank of India ****5678",
    date: "2024-08-25",
    status: "completed",
    category: "wallet"
  },
  {
    id: 6,
    type: "profit",
    amount: 66400,
    description: "Profit from Emami Transportation (Pune to Hyderabad)",
    date: "2024-08-20",
    status: "completed",
    tripName: "Emami Transportation",
    category: "profit"
  },
  {
    id: 7,
    type: "investment",
    amount: 290500,
    description: "Investment in Greenply Transportation (Delhi to Chennai)",
    date: "2024-08-15",
    status: "pending",
    tripName: "Greenply Transportation",
    category: "trip_investment"
  },
  {
    id: 8,
    type: "profit",
    amount: 45200,
    description: "Profit from Balaji Transportation (Mumbai to Pune)",
    date: "2024-08-10",
    status: "completed",
    tripName: "Balaji Transportation",
    category: "profit"
  },
  {
    id: 9,
    type: "investment",
    amount: 156000,
    description: "Investment in Manishankar Oils Transportation (Bangalore to Chennai)",
    date: "2024-08-05",
    status: "completed",
    tripName: "Manishankar Oils Transportation",
    category: "trip_investment"
  },
  {
    id: 10,
    type: "deposit",
    amount: 250000,
    description: "Wallet deposit from ICICI Bank ****9876",
    date: "2024-08-01",
    status: "completed",
    category: "wallet"
  }
];

const AccountLedger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <TrendingDown className="h-4 w-4 text-primary" />;
      case "profit":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "withdrawal":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "profit":
      case "deposit":
        return "text-success";
      case "investment":
      case "withdrawal":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "profit":
      case "deposit":
        return "+";
      case "investment":
      case "withdrawal":
        return "-";
      default:
        return "";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.tripName && transaction.tripName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;

    // Date range filtering
    const transactionDate = new Date(transaction.date);
    const matchesStartDate = !startDate || transactionDate >= new Date(startDate);
    const matchesEndDate = !endDate || transactionDate <= new Date(endDate);

    return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const totalStats = {
    totalInvested: transactions
      .filter(t => t.type === "investment" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    totalProfit: transactions
      .filter(t => t.type === "profit" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawn: transactions
      .filter(t => t.type === "withdrawal" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    totalDeposited: transactions
      .filter(t => t.type === "deposit" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Account Ledger</h1>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{filteredTransactions.length} transactions</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStats.totalDeposited.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStats.totalWithdrawn.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Range:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">From:</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">To:</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs"
                >
                  Clear Dates
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A detailed history of all your financial activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{transaction.date}</span>
                      {transaction.tripName && (
                        <>
                          <span>•</span>
                          <span>{transaction.tripName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                      {getAmountPrefix(transaction.type)}₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                  setStartDate("");
                  setEndDate("");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountLedger;