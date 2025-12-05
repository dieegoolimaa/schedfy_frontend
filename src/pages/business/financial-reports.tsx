import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { StatsGrid } from "../../components/ui/stats-grid";
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
  Gift,
  ArrowDownRight,
  Eye,
  Target,
  Users,
  Calendar,
  Save,
} from "lucide-react";
import { usePromotions } from "../../hooks/usePromotions";
import { PromotionImpactCard } from "../../components/reports/promotion-impact-card";
import { AIFinancialInsights } from "../../components/reports/ai-financial-insights";
import { Commission } from "../../types/models/promotions.interface";
import { professionalsService, Professional } from "../../services/professionals.service";
import { useAIFeatures } from "../../hooks/useAIFeatures";

export function FinancialReportsPage() {
  const { t } = useTranslation(["financial", "common"]);
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const entityId = user?.entityId || user?.id || "";
  const { isEnabled: isAIEnabled } = useAIFeatures();

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

  // Promotions data
  const { getActiveCommissions } = usePromotions();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (entityId) {
      Promise.all([
        getActiveCommissions(entityId),
        professionalsService.getAll({ entityId })
      ]).then(([c, p]) => {
        setCommissions(c);
        setProfessionals(Array.isArray(p.data) ? p.data : []);
      });
    }
  }, [entityId]);

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

  // Helper to calculate commission for a single booking
  const calculateCommission = (booking: any, commissionsList: Commission[]) => {
    const price =
      booking.pricing?.totalPrice || booking.service?.pricing?.basePrice || 0;

    const getId = (id: any): string | undefined => {
      if (!id) return undefined;
      if (typeof id === 'string') return id;
      return id._id;
    };

    const professionalId = getId(booking.professionalId);
    const serviceId = getId(booking.serviceId);

    // 0. Professional Override (Highest Priority)
    // Check if the professional has specific commission settings enabled
    if (professionalId) {
      const professional = professionals.find(p => p.id === professionalId);
      if (professional?.commission?.enabled) {
        if (professional.commission.fixedAmount) {
          return professional.commission.fixedAmount;
        }
        if (professional.commission.percentage) {
          return (price * professional.commission.percentage) / 100;
        }
      }
    }

    // 1. Service Specific
    const serviceCommission = commissionsList.find(
      (c) =>
        c.appliesTo === "service" && serviceId && c.serviceIds?.includes(serviceId)
    );
    if (serviceCommission) {
      return serviceCommission.type === "percentage"
        ? (price * serviceCommission.value) / 100
        : serviceCommission.value;
    }

    // 2. Professional Specific (Rule-based)
    const profCommission = commissionsList.find(
      (c) =>
        c.appliesTo === "professional" &&
        professionalId &&
        c.professionalIds?.includes(professionalId)
    );
    if (profCommission) {
      return profCommission.type === "percentage"
        ? (price * profCommission.value) / 100
        : profCommission.value;
    }

    // 3. Category Specific
    const categoryCommission = commissionsList.find(
      (c) =>
        c.appliesTo === "service_category" &&
        c.serviceCategoryIds?.includes(booking.service?.category)
    );
    if (categoryCommission) {
      return categoryCommission.type === "percentage"
        ? (price * categoryCommission.value) / 100
        : categoryCommission.value;
    }

    return 0;
  };

  // Calculate financial summary from real data
  const financialSummary = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    );

    const totalRevenue = completedBookings.reduce(
      (sum, b) =>
        sum + (b.pricing?.totalPrice || b.service?.pricing?.basePrice || 0),
      0
    );

    // Calculate total commissions based on active rules
    const totalCommissions = completedBookings.reduce((sum, b) => {
      return sum + calculateCommission(b, commissions);
    }, 0);

    // Calculate total vouchers/discounts
    const totalVouchers = completedBookings.reduce((sum, b) => {
      return sum + (b.pricing?.discountAmount || 0);
    }, 0);

    const netRevenue = totalRevenue - totalCommissions - totalVouchers;

    const totalTransactions = completedBookings.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate growth (comparing with previous period)
    const now = new Date();
    const currentPeriodStart = getDateRangeFilter();
    const periodDuration = now.getTime() - currentPeriodStart.getTime();
    const previousPeriodStart = new Date(
      currentPeriodStart.getTime() - periodDuration
    );

    const previousPeriodBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.createdAt);
      return (
        bookingDate >= previousPeriodStart &&
        bookingDate < currentPeriodStart &&
        b.status === "completed"
      );
    });

    const previousRevenue = previousPeriodBookings.reduce(
      (sum, b) =>
        sum + (b.pricing?.totalPrice || b.service?.pricing?.basePrice || 0),
      0
    );
    const previousTransactions = previousPeriodBookings.length;
    const previousAverage =
      previousTransactions > 0 ? previousRevenue / previousTransactions : 0;

    const revenueGrowth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0
          ? 100
          : 0;

    const transactionsGrowth =
      previousTransactions > 0
        ? ((totalTransactions - previousTransactions) / previousTransactions) *
        100
        : totalTransactions > 0
          ? 100
          : 0;

    const averageGrowth =
      previousAverage > 0
        ? ((averageTransaction - previousAverage) / previousAverage) * 100
        : averageTransaction > 0
          ? 100
          : 0;

    return {
      totalRevenue,
      totalCommissions,
      totalVouchers,
      netRevenue,
      totalTransactions,
      averageTransaction,
      growth: {
        revenue: Math.round(revenueGrowth * 10) / 10,
        transactions: Math.round(transactionsGrowth * 10) / 10,
        average: Math.round(averageGrowth * 10) / 10,
      },
    };
  }, [filteredBookings, bookings, getDateRangeFilter, commissions]);

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
      const price = booking.pricing?.totalPrice || booking.service?.pricing?.basePrice || 0;

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

  // Revenue by Professional
  const revenueByProfessional = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    );

    const map = new Map<string, { revenue: number; bookings: number }>();

    completedBookings.forEach((b) => {
      const name = b.professional?.name || "Unassigned";
      const revenue = b.pricing?.totalPrice || b.service?.pricing?.basePrice || 0;

      const current = map.get(name) || { revenue: 0, bookings: 0 };
      map.set(name, {
        revenue: current.revenue + revenue,
        bookings: current.bookings + 1,
      });
    });

    const totalRevenue = financialSummary.totalRevenue;

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        bookings: data.bookings,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        averageTicket: data.bookings > 0 ? data.revenue / data.bookings : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings, financialSummary.totalRevenue]);

  // Commission details calculated from revenue
  // Commission details calculated from revenue
  const commissionDetails = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    );

    const commissionMap = new Map<
      string,
      { amount: number; rate: number; description: string; type: string }
    >();

    completedBookings.forEach((booking) => {
      const price =
        booking.pricing?.totalPrice || booking.service?.pricing?.basePrice || 0;

      // Find applicable commission
      let appliedCommission: Commission | undefined;
      let commissionAmount = 0;
      let overrideApplied = false;

      const getId = (id: any): string | undefined => {
        if (!id) return undefined;
        if (typeof id === 'string') return id;
        return id._id;
      };

      const professionalId = getId(booking.professionalId);
      const serviceId = getId(booking.serviceId);

      // 0. Professional Override
      if (professionalId) {
        const professional = professionals.find(p => p.id === professionalId);
        if (professional?.commission?.enabled) {
          overrideApplied = true;
          if (professional.commission.fixedAmount) {
            commissionAmount = professional.commission.fixedAmount;
          } else if (professional.commission.percentage) {
            commissionAmount = (price * professional.commission.percentage) / 100;
          }
        }
      }

      if (overrideApplied) {
        const current = commissionMap.get("Professional Override") || {
          amount: 0,
          rate: 0,
          description: "Direct professional commission settings",
          type: "mixed",
        };

        commissionMap.set("Professional Override", {
          amount: current.amount + commissionAmount,
          rate: 0,
          description: current.description,
          type: current.type,
        });
      } else {
        // 1. Service Specific
        const serviceCommission = commissions.find(
          (c) =>
            c.appliesTo === "service" && serviceId && c.serviceIds?.includes(serviceId)
        );
        if (serviceCommission) {
          appliedCommission = serviceCommission;
        } else {
          // 2. Professional Specific
          const profCommission = commissions.find(
            (c) =>
              c.appliesTo === "professional" &&
              professionalId &&
              c.professionalIds?.includes(professionalId)
          );
          if (profCommission) {
            appliedCommission = profCommission;
          } else {
            // 3. Category Specific
            const categoryCommission = commissions.find(
              (c) =>
                c.appliesTo === "service_category" &&
                c.serviceCategoryIds?.includes(booking.service?.category || "")
            );
            if (categoryCommission) {
              appliedCommission = categoryCommission;
            }
          }
        }

        if (appliedCommission) {
          commissionAmount =
            appliedCommission.type === "percentage"
              ? (price * appliedCommission.value) / 100
              : appliedCommission.value;

          const current = commissionMap.get(appliedCommission.name) || {
            amount: 0,
            rate: appliedCommission.value,
            description:
              appliedCommission.description ||
              `${appliedCommission.type} commission`,
            type: appliedCommission.type,
          };

          commissionMap.set(appliedCommission.name, {
            amount: current.amount + commissionAmount,
            rate: appliedCommission.value,
            description: current.description,
            type: appliedCommission.type,
          });
        }
      }
    });

    return Array.from(commissionMap.entries()).map(([name, data]) => ({
      type: name,
      rate: data.type === "percentage" ? `${data.rate}%` : `€${data.rate}`,
      amount: data.amount,
      description: data.description,
    }));
  }, [filteredBookings, commissions]);

  // Voucher breakdown
  const voucherBreakdown = useMemo(() => {
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed" && (b.pricing?.discountAmount || 0) > 0
    );

    const breakdownMap = new Map<
      string,
      { amount: number; usage: number; description: string }
    >();

    completedBookings.forEach((booking) => {
      const amount = booking.pricing?.discountAmount || 0;
      const reason = booking.pricing?.discountReason || "General Discount";

      const current = breakdownMap.get(reason) || {
        amount: 0,
        usage: 0,
        description: "Applied discount",
      };
      breakdownMap.set(reason, {
        amount: current.amount + amount,
        usage: current.usage + 1,
        description: current.description,
      });
    });

    if (breakdownMap.size === 0) return [];

    return Array.from(breakdownMap.entries()).map(([type, data]) => ({
      type,
      amount: data.amount,
      usage: data.usage,
      description: data.description,
    }));
  }, [filteredBookings]);

  // Transform bookings into transaction format
  const transactions = useMemo(() => {
    return filteredBookings
      .filter((b) => b.status === "completed")
      .map((booking) => {
        const gross =
          booking.pricing?.totalPrice || booking.service?.pricing?.basePrice || 0;
        const commission = calculateCommission(booking, commissions);
        const voucher = booking.pricing?.discountAmount || 0;
        const net = gross - commission - voucher;

        return {
          id: booking.id,
          date: new Date(booking.createdAt).toLocaleDateString(),
          time: new Date(booking.createdAt).toLocaleTimeString([], {
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
          paymentMethod: booking.payment?.method || "card",
          professional: booking.professional?.name || "N/A",
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredBookings, commissions]);

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
            {t("status.completed")}
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">{t("status.pending")}</Badge>;
      case "refunded":
        return <Badge variant="destructive">{t("status.refunded")}</Badge>;
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
            <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
            <UpgradePrompt feature="financial" className="max-w-md mx-auto" />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
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
        <StatsGrid columns={4}>
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
        </StatsGrid>

        {/* Financial Breakdown */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="border-b">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="whitespace-nowrap">
                {t("tabs.overview", "Overview")}
              </TabsTrigger>
              <TabsTrigger value="professionals" className="whitespace-nowrap">
                {t("tabs.professionals", "Professionals")}
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
              <TabsTrigger value="promotions-impact" className="whitespace-nowrap">
                {t("tabs.impact")}
              </TabsTrigger>
              <TabsTrigger value="transactions" className="whitespace-nowrap">
                {t("tabs.transactions", "Transactions")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            {/* AI Financial Insights */}
            {isAIEnabled && (
              <AIFinancialInsights
                revenue={financialSummary.totalRevenue}
                bookings={filteredBookings}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("breakdown.revenueByService", "Revenue by Service")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "breakdown.revenueByServiceDesc",
                      "Breakdown of revenue by service category"
                    )}
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
                              {item.transactions}{" "}
                              {t("breakdown.transactions", "transactions")}
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
                  <CardTitle>
                    {t("breakdown.transactionSummary")}
                  </CardTitle>
                  <CardDescription>
                    {t("breakdown.transactionSummaryDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {t("metrics.totalTransactions")}
                    </span>
                    <span className="text-lg font-bold">
                      {financialSummary.totalTransactions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {t("metrics.averageTransaction")}
                    </span>
                    <span className="text-lg font-bold">
                      {formatCurrency(financialSummary.averageTransaction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      {t("metrics.transactionGrowth")}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      +{financialSummary.growth.transactions}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professionals" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("professionals.title")}</CardTitle>
                  <CardDescription>
                    {t("professionals.description")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/operational-reports")}
                >
                  {t("professionals.viewOperational")}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("professionals.table.professional")}</TableHead>
                      <TableHead className="text-right">{t("professionals.table.revenue")}</TableHead>
                      <TableHead className="text-right">{t("professionals.table.percentOfTotal")}</TableHead>
                      <TableHead className="text-right">{t("professionals.table.bookings")}</TableHead>
                      <TableHead className="text-right">{t("professionals.table.avgTicket")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByProfessional.map((prof) => (
                      <TableRow key={prof.name}>
                        <TableCell className="font-medium">
                          {prof.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(prof.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm text-muted-foreground">
                              {prof.percentage.toFixed(1)}%
                            </span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${prof.percentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {prof.bookings}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(prof.averageTicket)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Set Goals Form */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <CardTitle>
                      {t("goals.setMonthlyGoals")}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {t("goals.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenueTarget">{t("goals.form.revenueTarget")}</Label>
                    <Input
                      id="revenueTarget"
                      type="number"
                      placeholder={t("goals.form.placeholders.revenue")}
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
                    <Label htmlFor="bookingsTarget">{t("goals.form.bookingsTarget")}</Label>
                    <Input
                      id="bookingsTarget"
                      type="number"
                      placeholder={t("goals.form.placeholders.bookings")}
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
                    <Label htmlFor="newClientsTarget">{t("goals.form.newClientsTarget")}</Label>
                    <Input
                      id="newClientsTarget"
                      type="number"
                      placeholder={t("goals.form.placeholders.newClients")}
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
                    <Label htmlFor="period">{t("goals.form.period")}</Label>
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
                        <SelectItem value="monthly">{t("goals.form.periods.monthly")}</SelectItem>
                        <SelectItem value="quarterly">{t("goals.form.periods.quarterly")}</SelectItem>
                        <SelectItem value="yearly">{t("goals.form.periods.yearly")}</SelectItem>
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
                          type: "revenue" as any,
                          targetValue: parseFloat(goalFormData.revenueTarget),
                          period: goalFormData.period as any,
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
                          type: "bookings" as any,
                          targetValue: parseFloat(goalFormData.bookingsTarget),
                          period: goalFormData.period as any,
                          startDate,
                          endDate,
                        });
                      }

                      // Create new clients goal
                      if (goalFormData.newClientsTarget) {
                        await createGoal({
                          entityId,
                          name: "New Clients",
                          type: "new_clients" as any,
                          targetValue: parseFloat(
                            goalFormData.newClientsTarget
                          ),
                          period: goalFormData.period as any,
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
                    {t("goals.form.save")}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Goals Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("goals.goalsProgress")}
                  </CardTitle>
                  <CardDescription>
                    {t("goals.trackPerformance")}
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
                            <span className="font-medium">{t("goals.metrics.revenue")}</span>
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
                          {revenueProgress.toFixed(0)}% {t("goals.status.ofTarget")}
                          {revenueProgress >= 100 && ` ${t("goals.status.achieved")}`}
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
                            <span className="font-medium">{t("goals.metrics.bookings")}</span>
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
                          {bookingsProgress.toFixed(0)}% {t("goals.status.ofTarget")}
                          {bookingsProgress >= 100 && ` ${t("goals.status.achieved")}`}
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
                            <span className="font-medium">{t("goals.metrics.newClients")}</span>
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
                          {clientsProgress.toFixed(0)}% {t("goals.status.ofTarget")}
                          {clientsProgress >= 100 && ` ${t("goals.status.achieved")}`}
                        </p>
                      </div>
                    );
                  })()}

                  {(!Array.isArray(goals) || goals.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t("goals.status.noGoals")}</p>
                      <p className="text-xs">
                        {t("goals.status.setTargets")}
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
                <CardTitle>
                  {t("commissions.breakdown")}
                </CardTitle>
                <CardDescription>
                  {t("commissions.description")}
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
                      <span className="font-semibold">{t("summary.totalCommissions")}</span>
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
                <CardTitle>{t("vouchers.usage")}</CardTitle>
                <CardDescription>
                  {t("vouchers.description")}
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
                      <span className="font-semibold">{t("summary.totalVouchers")}</span>
                      <span className="font-bold text-lg text-orange-600">
                        {formatCurrency(financialSummary.totalVouchers)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions-impact" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{t("breakdown.promotionsTitle")}</h2>
              </div>
              <PromotionImpactCard
                bookings={filteredBookings}
                commissions={commissions}
              />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("filters.search")}
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
                      <SelectValue
                        placeholder={t("filters.paymentMethod")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("filters.allMethods")}
                      </SelectItem>
                      <SelectItem value="card">
                        {t("filters.card")}
                      </SelectItem>
                      <SelectItem value="cash">
                        {t("filters.cash")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue
                        placeholder={t("filters.serviceType", "Service type")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("filters.allServices")}
                      </SelectItem>
                      <SelectItem value="hair">
                        {t("filters.hairServices", "Hair Services")}
                      </SelectItem>
                      <SelectItem value="nail">
                        {t("filters.nailCare", "Nail Care")}
                      </SelectItem>
                      <SelectItem value="massage">
                        {t("filters.massage", "Massage")}
                      </SelectItem>
                      <SelectItem value="facial">
                        {t("filters.facial", "Facial")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("transactions.history")}
                </CardTitle>
                <CardDescription>
                  {t("transactions.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("transactions.table.transaction")}</TableHead>
                      <TableHead>{t("transactions.table.clientService")}</TableHead>
                      <TableHead>{t("transactions.table.professional")}</TableHead>
                      <TableHead>{t("transactions.table.payment")}</TableHead>
                      <TableHead className="text-right">{t("transactions.table.gross")}</TableHead>
                      <TableHead className="text-right">{t("transactions.table.commission")}</TableHead>
                      <TableHead className="text-right">{t("transactions.table.voucher")}</TableHead>
                      <TableHead className="text-right">{t("transactions.table.net")}</TableHead>
                      <TableHead>{t("transactions.table.status")}</TableHead>
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
                              {transaction.paymentMethod === "card"
                                ? t("filters.card")
                                : transaction.paymentMethod === "cash"
                                  ? t("filters.cash")
                                  : transaction.paymentMethod}
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
                                      {t("transactions.dialog.id")}
                                    </Label>
                                    <p className="text-sm">{transaction.id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("transactions.dialog.dateTime")}
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.date} at {transaction.time}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("transactions.dialog.client")}
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.client}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("transactions.dialog.professional")}
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.professional}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("transactions.dialog.service")}
                                    </Label>
                                    <p className="text-sm">
                                      {transaction.service}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {t("transactions.dialog.paymentMethod")}
                                    </Label>
                                    <p className="text-sm capitalize">
                                      {transaction.paymentMethod === "card"
                                        ? t("filters.card")
                                        : transaction.paymentMethod === "cash"
                                          ? t("filters.cash")
                                          : transaction.paymentMethod}
                                    </p>
                                  </div>
                                </div>
                                <div className="border-t pt-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>{t("transactions.dialog.grossAmount")}</span>
                                      <span className="font-medium">
                                        {formatCurrency(transaction.gross)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                      <span>{t("transactions.dialog.commission")}</span>
                                      <span>
                                        -
                                        {formatCurrency(transaction.commission)}
                                      </span>
                                    </div>
                                    {transaction.voucher > 0 && (
                                      <div className="flex justify-between text-orange-600">
                                        <span>{t("transactions.dialog.voucherDiscount")}</span>
                                        <span>
                                          -{formatCurrency(transaction.voucher)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                                      <span>{t("transactions.dialog.netAmount")}</span>
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
