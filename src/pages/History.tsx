import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History as HistoryIcon, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  Calendar,
  DollarSign
} from "lucide-react";

// Mock transaction data
const transactions = [
  {
    id: 1,
    type: "investment",
    amount: 2500,
    description: "Investment in Santorini Sunset Trip",
    date: "2024-09-15",
    status: "completed",
    tripName: "Santorini Sunset",
    category: "trip_investment"
  },
  {
    id: 2,
    type: "deposit",
    amount: 5000,
    description: "Wallet deposit from Chase Bank ****1234",
    date: "2024-09-10",
    status: "completed",
    category: "wallet"
  },
  {
    id: 3,
    type: "profit",
    amount: 450,
    description: "Profit from African Safari Trip",
    date: "2024-09-05",
    status: "completed",
    tripName: "African Safari",
    category: "profit"
  },
  {
    id: 4,
    type: "investment",
    amount: 1200,
    description: "Investment in Berger Paints",
    date: "2024-08-28",
    status: "completed",
    tripName: "Berger Paints",
    category: "trip_investment"
  },
  {
    id: 5,
    type: "withdrawal",
    amount: 1000,
    description: "Withdrawal to Bank of America ****5678",
    date: "2024-08-25",
    status: "completed",
    category: "wallet"
  },
  {
    id: 6,
    type: "profit",
    amount: 800,
    description: "Profit from Asian Paints",
    date: "2024-08-20",
    status: "completed",
    tripName: "Asian Paints",
    category: "profit"
  },
  {
    id: 7,
    type: "investment",
    amount: 3500,
    description: "Investment in Coca Cola",
    date: "2024-08-15",
    status: "pending",
    tripName: "Coca Cola",
    category: "trip_investment"
  }
];

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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
    
    return matchesSearch && matchesType && matchesStatus;
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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalDeposited.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalWithdrawn.toLocaleString()}</div>
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
                      {getAmountPrefix(transaction.type)}${transaction.amount.toLocaleString()}
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

export default History;