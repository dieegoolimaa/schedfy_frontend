import { useState, useMemo } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { PlanGate, UpgradePrompt } from "../../hooks/use-plan-restrictions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  TrendingUp,
  Euro,
  Download,
  Search,
  CreditCard,
  Receipt,
  Percent,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";

export function FinancialReportsPage() {
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  // Fetch bookings data from API
  const { bookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [dateRange, setDateRange] = useState("30days");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate date range
  const getDateRangeFilter = () => {
    const now = new Date();
    const daysMap: Record<string, number> = {
      "7days": 7,
      "30days": 30,
      "90days": 90,
      "365days": 365,
    };
    const days = daysMap[dateRange] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate;
  };

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    const startDate = getDateRangeFilter();
    return bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= startDate;
    });
  }, [bookings, dateRange]);

  // Calculate financial summary from real data
  const financialSummary = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    );

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.service?.pricing?.basePrice || 0),
      0
    );

    // Platform commission (5% of revenue)
    const totalCommissions = totalRevenue * 0.05;

    // Mock vouchers for now (would come from voucher system)
    const totalVouchers = 0;

    const netRevenue = totalRevenue - totalCommissions - totalVouchers;

    const totalTransactions = completedBookings.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate growth (comparing with previous period)
    // For now, using mock growth percentages
    return {
      totalRevenue,
      totalCommissions,
      totalVouchers,
      netRevenue,
      totalTransactions,
      averageTransaction,
      growth: {
        revenue: 12.5,
        transactions: 8.3,
        average: 3.8,
      },
    };
  }, [filteredBookings]);

  // Revenue breakdown by service category
  const revenueBreakdown = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    );

    const categoryMap = new Map<
      string,
      { amount: number; transactions: number }
    >();

    completedBookings.forEach((booking) => {
      const category = booking.service?.category || "Other";
      const price = booking.service?.pricing?.basePrice || 0;

      const current = categoryMap.get(category) || {
        amount: 0,
        transactions: 0,
      };
      categoryMap.set(category, {
        amount: current.amount + price,
        transactions: current.transactions + 1,
      });
    });

    const total = financialSummary.totalRevenue;

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        transactions: data.transactions,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredBookings, financialSummary.totalRevenue]);

  // Commission details calculated from revenue
  const commissionDetails = useMemo(() => {
    const totalRevenue = financialSummary.totalRevenue;
    return [
      {
        type: "Platform Commission",
        rate: 5,
        amount: totalRevenue * 0.05,
        description: "Standard platform fee",
      },
      {
        type: "Payment Processing",
        rate: 2.9,
        amount: totalRevenue * 0.029,
        description: "Card processing fees",
      },
      {
        type: "Premium Features",
        rate: 2.1,
        amount: totalRevenue * 0.021,
        description: "Advanced booking features",
      },
    ];
  }, [financialSummary.totalRevenue]);

  // Voucher breakdown (keeping as placeholder for future voucher system)
  const voucherBreakdown = [
    {
      type: "New Client Discount",
      amount: 0,
      usage: 0,
      description: "First-time client offers",
    },
    {
      type: "Loyalty Rewards",
      amount: 0,
      usage: 0,
      description: "Repeat customer discounts",
    },
    {
      type: "Promotional Codes",
      amount: 0,
      usage: 0,
      description: "Marketing campaign vouchers",
    },
  ];

  // Transform bookings into transaction format
  const transactions = useMemo(() => {
    return filteredBookings
      .filter((b) => b.status === "completed")
      .map((booking) => {
        const gross = booking.service?.pricing?.basePrice || 0;
        const commission = gross * 0.05; // 5% platform commission
        const voucher = 0; // Future: get from booking.voucher
        const net = gross - commission - voucher;

        return {
          id: booking.id,
          date: new Date(booking.startTime).toLocaleDateString(),
          time: new Date(booking.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          client: booking.client?.name || "Unknown",
          service: booking.service?.name || "Unknown Service",
          gross,
          commission,
          voucher,
          net,
          status: booking.status,
          paymentMethod: "card", // Default to card for now
          professional: booking.professional?.name || "N/A",
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredBookings]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      paymentFilter === "all" || transaction.paymentMethod === paymentFilter;
    const matchesService =
      serviceFilter === "all" ||
      transaction.service.toLowerCase().includes(serviceFilter.toLowerCase());

    return matchesSearch && matchesPayment && matchesService;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Euro className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <PlanGate
      feature="financial"
      fallback={
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Financial Reports</h1>
            <UpgradePrompt feature="financial" className="max-w-md mx-auto" />
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">
              Track your revenue, commissions, and payment analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    €{financialSummary.totalRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {financialSummary.growth.revenue}% vs last period
                  </div>
                </div>
                <Euro className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Commissions
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    €{financialSummary.totalCommissions.toFixed(2)}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Percent className="h-4 w-4 mr-1" />
                    10% of revenue
                  </div>
                </div>
                <ArrowDownRight className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vouchers Used
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    €{financialSummary.totalVouchers.toFixed(2)}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Gift className="h-4 w-4 mr-1" />
                    {(
                      (financialSummary.totalVouchers /
                        financialSummary.totalRevenue) *
                      100
                    ).toFixed(1)}
                    % of revenue
                  </div>
                </div>
                <Gift className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Net Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    €{financialSummary.netRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    After all deductions
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Breakdown */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>
                    Breakdown of revenue by service category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueBreakdown.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {item.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              €{item.amount.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.transactions} transactions
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                  <CardDescription>
                    Key transaction metrics for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      Total Transactions
                    </span>
                    <span className="text-lg font-bold">
                      {financialSummary.totalTransactions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      Average Transaction
                    </span>
                    <span className="text-lg font-bold">
                      €{financialSummary.averageTransaction.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      Transaction Growth
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      +{financialSummary.growth.transactions}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown of all commission charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissionDetails.map((commission) => (
                    <div
                      key={commission.type}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{commission.type}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{commission.rate}%</Badge>
                            <span className="font-bold text-red-600">
                              €{commission.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {commission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Commissions</span>
                      <span className="font-bold text-lg text-red-600">
                        €{financialSummary.totalCommissions.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Usage</CardTitle>
                <CardDescription>
                  Detailed breakdown of vouchers and discounts applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voucherBreakdown.map((voucher) => (
                    <div
                      key={voucher.type}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{voucher.type}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {voucher.usage} used
                            </Badge>
                            <span className="font-bold text-orange-600">
                              €{voucher.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {voucher.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Vouchers</span>
                      <span className="font-bold text-lg text-orange-600">
                        €{financialSummary.totalVouchers.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={paymentFilter}
                    onValueChange={setPaymentFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="hair">Hair Services</SelectItem>
                      <SelectItem value="nail">Nail Care</SelectItem>
                      <SelectItem value="massage">Massage</SelectItem>
                      <SelectItem value="facial">Facial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Detailed list of all financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Client & Service</TableHead>
                      <TableHead>Professional</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Voucher</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {transaction.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.date} at {transaction.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.client}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.service}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.professional}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span className="text-sm capitalize">
                              {transaction.paymentMethod}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{transaction.gross.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -€{transaction.commission.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {transaction.voucher > 0
                            ? `-€${transaction.voucher.toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          €{transaction.net.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for transaction{" "}
                                  {transaction.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Transaction ID
                                    </Label>
                                    <p className="text-sm">{transaction.id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Date & Time
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.date} at {transaction.time}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Client
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.client}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Professional
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.professional}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Service
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.service}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Payment Method
                                    </Label>
                                    <p className="text-sm capitalize">
                                      {transaction.paymentMethod}
                                    </p>
                                  </div>
                                </div>
                                <div className="border-t pt-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Gross Amount:</span>
                                      <span className="font-medium">
                                        €{transaction.gross.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>Commission:</span>
                                      <span>
                                        -€{transaction.commission.toFixed(2)}
                                      </span>
                                    </div>
                                    {transaction.voucher > 0 && (
                                      <div className="flex justify-between text-orange-600">
                                        <span>Voucher Discount:</span>
                                        <span>
                                          -€{transaction.voucher.toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                                      <span>Net Amount:</span>
                                      <span>€{transaction.net.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PlanGate>
  );
}
