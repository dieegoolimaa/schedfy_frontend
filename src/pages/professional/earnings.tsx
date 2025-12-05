import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useCurrency } from "../../hooks/useCurrency";
import { useBookings } from "../../hooks/useBookings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatsGrid } from "../../components/ui/stats-grid";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  earnings: number;
}

export default function ProfessionalEarningsPage() {
  const { t } = useTranslation("earnings");
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const professionalId = user?.id || "";
  const entityId = user?.entityId || "";

  // Fetch all bookings for this professional
  const { bookings, loading } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  // Filter bookings for this professional
  const myBookings = useMemo(() => {
    return bookings.filter((b) => {
      const profId =
        typeof b.professional === "string"
          ? b.professional
          : (b.professional as any)?._id || (b.professional as any)?.id;
      return profId === professionalId || b.professionalId === professionalId;
    });
  }, [bookings, professionalId]);

  // Calculate earnings from completed bookings
  const completedBookings = useMemo(() => {
    return myBookings.filter((b) => b.status === "completed");
  }, [myBookings]);

  // Get bookings by period
  const getBookingsByPeriod = (startDate: Date, endDate: Date) => {
    return completedBookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  // This month calculations
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEnd = endOfMonth(new Date());
  const thisMonthBookings = getBookingsByPeriod(thisMonthStart, thisMonthEnd);
  const thisMonthEarnings = thisMonthBookings.reduce((sum, b) => {
    const price =
      typeof b.service === "object" && b.service?.price ? b.service.price : 0;
    return sum + price;
  }, 0);

  // Last month calculations
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonthBookings = getBookingsByPeriod(lastMonthStart, lastMonthEnd);
  const lastMonthEarnings = lastMonthBookings.reduce((sum, b) => {
    const price =
      typeof b.service === "object" && b.service?.price ? b.service.price : 0;
    return sum + price;
  }, 0);

  // Total earnings
  const totalEarnings = completedBookings.reduce((sum, b) => {
    const price =
      typeof b.service === "object" && b.service?.price ? b.service.price : 0;
    return sum + price;
  }, 0);

  // Pending earnings (confirmed but not completed)
  const pendingBookings = myBookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );
  const pendingEarnings = pendingBookings.reduce((sum, b) => {
    const price =
      typeof b.service === "object" && b.service?.price ? b.service.price : 0;
    return sum + price;
  }, 0);

  // Calculate percentage change
  const change =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
        ? 100
        : 0;

  // Generate monthly data for chart
  const monthlyData = useMemo(() => {
    const months =
      selectedPeriod === "3months" ? 3 : selectedPeriod === "6months" ? 6 : 12;
    const data: MonthlyData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthBookings = getBookingsByPeriod(monthStart, monthEnd);
      const earnings = monthBookings.reduce((sum, b) => {
        const price =
          typeof b.service === "object" && b.service?.price
            ? b.service.price
            : 0;
        return sum + price;
      }, 0);

      data.push({
        month: format(monthDate, "MMM"),
        earnings,
      });
    }

    return data;
  }, [selectedPeriod, completedBookings]);

  // Recent activity (last 5 completed bookings)
  const recentActivity = useMemo(() => {
    return [...completedBookings]
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, 5);
  }, [completedBookings]);

  const handleExportStatement = async () => {
    try {
      toast.success("Statement export coming soon");
      // TODO: Implement PDF export
    } catch (error) {
      toast.error("Failed to export statement");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Button onClick={handleExportStatement}>
          <Download className="h-4 w-4 mr-2" />
          {t("exportStatement")}
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsGrid columns={4}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(thisMonthEarnings)}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {change > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{change.toFixed(1)}%</span>
                </>
              ) : change < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{change.toFixed(1)}%</span>
                </>
              ) : (
                <span className="text-muted-foreground">No change</span>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(lastMonthEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(subMonths(new Date(), 1), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingBookings.length} confirmed booking
              {pendingBookings.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Earned
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedBookings.length} completed service
              {completedBookings.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </StatsGrid>

      {/* Monthly Earnings Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>
                Your earnings over the selected period
              </CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="earnings"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity and Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest completed services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No completed services yet
                </p>
              ) : (
                recentActivity.map((booking) => {
                  const client =
                    typeof booking.client === "string"
                      ? booking.client
                      : booking.client?.name ||
                      `${(booking.client as any)?.firstName || ""} ${(booking.client as any)?.lastName || ""
                        }`.trim() ||
                      "Unknown Client";
                  const service =
                    typeof booking.service === "string"
                      ? booking.service
                      : booking.service?.name || "Unknown Service";
                  const price =
                    typeof booking.service === "object" &&
                      booking.service?.price
                      ? booking.service.price
                      : 0;

                  return (
                    <div
                      key={(booking as any)._id || booking.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{service}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{client}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(booking.startTime), "MMM d")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Month Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Month Summary</CardTitle>
            <CardDescription>
              {format(new Date(), "MMMM yyyy")} overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Total Earnings</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(thisMonthEarnings)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Completed Services</span>
                </div>
                <span className="text-sm font-medium">
                  {thisMonthBookings.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm">Pending Earnings</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(pendingEarnings)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Average per Service</span>
                </div>
                <span className="text-sm font-medium">
                  {thisMonthBookings.length > 0
                    ? formatCurrency(
                      thisMonthEarnings / thisMonthBookings.length
                    )
                    : formatCurrency(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
