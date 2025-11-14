import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useGoals } from "../../hooks/useGoals";
import { useClients } from "../../hooks/useClients";
import { PlanGate, UpgradePrompt } from "../../hooks/use-plan-restrictions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
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
  Target,
  Users,
  Calendar,
  Save,
} from "lucide-react";

export function FinancialReportsPage() {
  const { t } = useTranslation("financial");
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  // Fetch bookings data from API
  const { bookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  // Fetch clients data
  const { clients } = useClients({
    entityId,
    autoFetch: true,
  });

  // Goals management
  const { goals, fetchCurrentMonthGoals, createGoal } = useGoals({ entityId });

  const [dateRange, setDateRange] = useState("30days");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Goals form state
  const [goalFormData, setGoalFormData] = useState({
    revenueTarget: "",
    bookingsTarget: "",
    newClientsTarget: "",
    period: "monthly" as "monthly" | "quarterly" | "yearly",
  });

  // Load goals on mount
  useEffect(() => {
    if (entityId) {
      fetchCurrentMonthGoals();
    }
  }, [entityId, fetchCurrentMonthGoals]);

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
                <SelectItem value="7days">
                  {t("common:time.last7Days", "Last 7 days")}
                </SelectItem>
                <SelectItem value="30days">
                  {t("common:time.last30Days", "Last 30 days")}
                </SelectItem>
                <SelectItem value="90days">
                  {t("common:time.last90Days", "Last 90 days")}
                </SelectItem>
                <SelectItem value="1year">
                  {t("common:time.lastYear", "Last year")}
                </SelectItem>
                <SelectItem value="custom">
                  {t("common:time.customRange", "Custom range")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("export.button", "Export")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("summary.totalRevenue", "Total Revenue")}
            value={formatCurrency(financialSummary.totalRevenue)}
            icon={Euro}
            trend={{
              value: `+${financialSummary.growth.revenue}%`,
              isPositive: true,
            }}
            subtitle={t("summary.vsLastPeriod", "vs last period")}
          />

          <StatCard
            title={t("summary.totalCommissions", "Total Commissions")}
            value={formatCurrency(financialSummary.totalCommissions)}
            subtitle={t("summary.ofRevenue", "10% of revenue")}
            icon={ArrowDownRight}
            variant="danger"
          />

          <StatCard
            title={t("summary.vouchersUsed", "Vouchers Used")}
            value={formatCurrency(financialSummary.totalVouchers)}
            subtitle={`${(
              (financialSummary.totalVouchers / financialSummary.totalRevenue) *
              100
            ).toFixed(1)}% ${t("summary.ofRevenue", "of revenue")}`}
            icon={Gift}
            variant="warning"
          />

          <StatCard
            title={t("summary.netRevenue", "Net Revenue")}
            value={formatCurrency(financialSummary.netRevenue)}
            subtitle={t("summary.afterDeductions", "After all deductions")}
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Financial Breakdown */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="border-b">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="whitespace-nowrap">
                {t("tabs.overview", "Overview")}
              </TabsTrigger>
              <TabsTrigger value="goals" className="whitespace-nowrap">
                {t("tabs.goals", "Goals & Targets")}
              </TabsTrigger>
              <TabsTrigger value="commissions" className="whitespace-nowrap">
                {t("tabs.commissions", "Commissions")}
              </TabsTrigger>
              <TabsTrigger value="vouchers" className="whitespace-nowrap">
                {t("tabs.vouchers", "Vouchers")}
              </TabsTrigger>
              <TabsTrigger value="transactions" className="whitespace-nowrap">
                {t("tabs.transactions", "Transactions")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("breakdown.revenueByService", "Revenue by Service")}</CardTitle>
                  <CardDescription>
                    {t("breakdown.revenueByServiceDesc", "Breakdown of revenue by service category")}
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
                              {formatCurrency(item.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.transactions} {t("breakdown.transactions", "transactions")}
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
                  <CardTitle>{t("breakdown.transactionSummary", "Transaction Summary")}</CardTitle>
                  <CardDescription>
                    {t("breakdown.transactionSummaryDesc", "Key transaction metrics for the selected period")}
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
                      {formatCurrency(financialSummary.averageTransaction)}
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

          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Set Goals Form */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <CardTitle>{t("goals.setMonthlyGoals", "Set Monthly Goals")}</CardTitle>
                  </div>
                  <CardDescription>
                    Define your business targets for revenue, bookings, and new
                    clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenueTarget">Revenue Target (€)</Label>
                    <Input
                      id="revenueTarget"
                      type="number"
                      placeholder="e.g., 5000"
                      value={goalFormData.revenueTarget}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          revenueTarget: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bookingsTarget">Bookings Target</Label>
                    <Input
                      id="bookingsTarget"
                      type="number"
                      placeholder="e.g., 100"
                      value={goalFormData.bookingsTarget}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          bookingsTarget: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newClientsTarget">New Clients Target</Label>
                    <Input
                      id="newClientsTarget"
                      type="number"
                      placeholder="e.g., 20"
                      value={goalFormData.newClientsTarget}
                      onChange={(e) =>
                        setGoalFormData({
                          ...goalFormData,
                          newClientsTarget: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <Select
                      value={goalFormData.period}
                      onValueChange={(value: any) =>
                        setGoalFormData({ ...goalFormData, period: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!entityId) return;

                      const now = new Date();
                      const startDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                      );
                      const endDate = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        0
                      );

                      // Create revenue goal
                      if (goalFormData.revenueTarget) {
                        await createGoal({
                          entityId,
                          name: "Monthly Revenue",
                          type: "revenue",
                          targetValue: parseFloat(goalFormData.revenueTarget),
                          period: goalFormData.period,
                          startDate,
                          endDate,
                          metadata: { currency: "EUR" },
                        });
                      }

                      // Create bookings goal
                      if (goalFormData.bookingsTarget) {
                        await createGoal({
                          entityId,
                          name: "Monthly Bookings",
                          type: "bookings",
                          targetValue: parseFloat(goalFormData.bookingsTarget),
                          period: goalFormData.period,
                          startDate,
                          endDate,
                        });
                      }

                      // Create new clients goal
                      if (goalFormData.newClientsTarget) {
                        await createGoal({
                          entityId,
                          name: "New Clients",
                          type: "new_clients",
                          targetValue: parseFloat(
                            goalFormData.newClientsTarget
                          ),
                          period: goalFormData.period,
                          startDate,
                          endDate,
                        });
                      }

                      // Refresh goals
                      await fetchCurrentMonthGoals();

                      // Reset form
                      setGoalFormData({
                        revenueTarget: "",
                        bookingsTarget: "",
                        newClientsTarget: "",
                        period: "monthly",
                      });
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Goals
                  </Button>
                </CardContent>
              </Card>

              {/* Current Goals Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("goals.goalsProgress", "Goals Progress")}</CardTitle>
                  <CardDescription>
                    Track your current performance vs. targets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Revenue Goal */}
                  {(() => {
                    const completedBookings = bookings.filter(
                      (b) => b.status === "completed"
                    );
                    const currentRevenue = completedBookings.reduce(
                      (sum, b) =>
                        sum +
                        (b.service?.pricing?.basePrice ||
                          b.service?.price ||
                          0),
                      0
                    );
                    const revenueGoal = Array.isArray(goals)
                      ? goals.find((g) => g.type === "revenue")
                      : undefined;
                    const revenueTarget = revenueGoal?.targetValue || 0;
                    const revenueProgress =
                      revenueTarget > 0
                        ? (currentRevenue / revenueTarget) * 100
                        : 0;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Revenue</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(currentRevenue)} /{" "}
                            {formatCurrency(revenueTarget)}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                            <div
                              style={{
                                width: `${Math.min(revenueProgress, 100)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {revenueProgress.toFixed(0)}% of target
                          {revenueProgress >= 100 && " 🎉 Goal achieved!"}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Bookings Goal */}
                  {(() => {
                    const currentBookings = bookings.length;
                    const bookingsGoal = Array.isArray(goals)
                      ? goals.find((g) => g.type === "bookings")
                      : undefined;
                    const bookingsTarget = bookingsGoal?.targetValue || 0;
                    const bookingsProgress =
                      bookingsTarget > 0
                        ? (currentBookings / bookingsTarget) * 100
                        : 0;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Bookings</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {currentBookings} / {bookingsTarget}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                            <div
                              style={{
                                width: `${Math.min(bookingsProgress, 100)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {bookingsProgress.toFixed(0)}% of target
                          {bookingsProgress >= 100 && " 🎉 Goal achieved!"}
                        </p>
                      </div>
                    );
                  })()}

                  {/* New Clients Goal */}
                  {(() => {
                    const currentClients = clients.length;
                    const clientsGoal = Array.isArray(goals)
                      ? goals.find((g) => g.type === "new_clients")
                      : undefined;
                    const clientsTarget = clientsGoal?.targetValue || 0;
                    const clientsProgress =
                      clientsTarget > 0
                        ? (currentClients / clientsTarget) * 100
                        : 0;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">New Clients</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {currentClients} / {clientsTarget}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                            <div
                              style={{
                                width: `${Math.min(clientsProgress, 100)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {clientsProgress.toFixed(0)}% of target
                          {clientsProgress >= 100 && " 🎉 Goal achieved!"}
                        </p>
                      </div>
                    );
                  })()}

                  {(!Array.isArray(goals) || goals.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No goals set yet</p>
                      <p className="text-xs">
                        Set your targets to track progress
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("commissions.breakdown", "Commission Breakdown")}</CardTitle>
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
                              {formatCurrency(commission.amount)}
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
                        {formatCurrency(financialSummary.totalCommissions)}
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
                <CardTitle>{t("vouchers.usage", "Voucher Usage")}</CardTitle>
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
                              {formatCurrency(voucher.amount)}
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
                        {formatCurrency(financialSummary.totalVouchers)}
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
                <CardTitle>{t("transactions.history", "Transaction History")}</CardTitle>
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
                          {formatCurrency(transaction.gross)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatCurrency(transaction.commission)}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {transaction.voucher > 0
                            ? `-${formatCurrency(transaction.voucher)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(transaction.net)}
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
                                        {formatCurrency(transaction.gross)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>Commission:</span>
                                      <span>
                                        -
                                        {formatCurrency(transaction.commission)}
                                      </span>
                                    </div>
                                    {transaction.voucher > 0 && (
                                      <div className="flex justify-between text-orange-600">
                                        <span>Voucher Discount:</span>
                                        <span>
                                          -{formatCurrency(transaction.voucher)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                                      <span>Net Amount:</span>
                                      <span>
                                        {formatCurrency(transaction.net)}
                                      </span>
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
