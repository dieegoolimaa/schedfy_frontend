import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useServices } from "../../hooks/useServices";
import { useGoals } from "../../hooks/useGoals";
import { useCurrency } from "../../hooks/useCurrency";
import { BookingCreator } from "../../components/booking";
import { CalendarView } from "../../components/calendar/CalendarView";
import { AddClientDialog } from "../../components/dialogs/add-client-dialog";
import { QuickBookingWidget } from "../../components/bookings/quick-booking-widget";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";
import {
  dashboardService,
  EntityStats,
} from "../../services/dashboard.service";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
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
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  Calendar,
  Brain,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  ChevronRight,
  Loader2,
  TrendingDown,
  Plus,
  Edit,
  BarChart3,
  UserPlus,
  CreditCard,
  Settings,
  TrendingUp,
} from "lucide-react";

const ConsolidatedDashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const entityId = user?.entityId || user?.id || "";

  // Detect plan
  const plan = user?.plan || "simple";

  // State management
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [quickBookingDialogOpen, setQuickBookingDialogOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [entityStats, setEntityStats] = useState<EntityStats | null>(null);

  // Fetch data
  const {
    bookings,
    loading: bookingsLoading,
    fetchBookings,
  } = useBookings({
    entityId,
    autoFetch: true,
  });

  const { services, loading: servicesLoading } = useServices({
    entityId,
    autoFetch: true,
  });

  // Goals hook (Individual & Business)
  const { goals, fetchCurrentMonthGoals, createDefaultMonthlyGoals } = useGoals(
    {
      entityId,
    }
  );

  // Load goals for Individual & Business
  useEffect(() => {
    if (entityId && (plan === "individual" || plan === "business")) {
      fetchCurrentMonthGoals().then((monthGoals) => {
        if (!monthGoals || monthGoals.length === 0) {
          createDefaultMonthlyGoals();
        }
      });
    }
  }, [entityId, plan, fetchCurrentMonthGoals, createDefaultMonthlyGoals]);

  // Fetch entity stats
  useEffect(() => {
    const fetchEntityStats = async () => {
      if (!entityId) return;
      try {
        const stats = await dashboardService.getEntityStats(entityId);
        setEntityStats(stats);
      } catch (error) {
        console.error("Error fetching entity stats:", error);
      }
    };

    fetchEntityStats();
  }, [entityId]);

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const uniqueClients = new Set(bookings.map((b) => b.clientId)).size;

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce(
      (sum, booking) => sum + (booking.service?.pricing?.basePrice || 0),
      0
    );

  // Get upcoming bookings
  const now = new Date();
  const upcomingBookings = bookings
    .filter(
      (b) =>
        (b.status === "confirmed" || b.status === "pending") &&
        new Date(b.startTime) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, plan === "business" ? 4 : 5);

  // Calculate monthly changes
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);

  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  const completedChange =
    bookings.filter(
      (b) => b.status === "completed" && new Date(b.updatedAt) >= thisMonthStart
    ).length -
    bookings.filter(
      (b) =>
        b.status === "completed" &&
        new Date(b.updatedAt) >= lastMonthStart &&
        new Date(b.updatedAt) <= lastMonthEnd
    ).length;

  // Business plan: Calculate chart data
  const monthlyData: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }> = [];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const appointmentData = weekDays.map((day, index) => {
    const dayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate.getDay() === (index + 1) % 7;
    });

    return {
      day,
      scheduled: dayBookings.length,
      completed: dayBookings.filter((b) => b.status === "completed").length,
      cancelled: dayBookings.filter((b) => b.status === "cancelled").length,
    };
  });

  if (plan === "business") {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push({
        month: date.toLocaleDateString("en", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    last6Months.forEach((month) => {
      const monthBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        return (
          bookingDate.getMonth() === month.monthIndex &&
          bookingDate.getFullYear() === month.year
        );
      });

      const monthRevenue = monthBookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (b.service?.pricing?.basePrice || 0), 0);

      monthlyData.push({
        month: month.month,
        revenue: monthRevenue,
        appointments: monthBookings.length,
      });
    });
  }

  // Service distribution (Business)
  const serviceDistribution = new Map();
  bookings.forEach((booking) => {
    const serviceName = booking.service?.name || "Other";
    serviceDistribution.set(
      serviceName,
      (serviceDistribution.get(serviceName) || 0) + 1
    );
  });

  // Recent activity (Business)
  const recentActivity = bookings
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      type:
        booking.status === "completed"
          ? "completion"
          : booking.status === "confirmed"
          ? "booking"
          : "cancellation",
      message:
        booking.status === "completed"
          ? `Session completed with ${booking.client?.name || "client"}`
          : booking.status === "confirmed"
          ? `New booking: ${booking.service?.name || "service"}`
          : `Booking cancelled`,
      time: new Date(booking.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  const loading = bookingsLoading || servicesLoading;

  // Handlers
  const handleNewBooking = () => setQuickBookingDialogOpen(true);
  const handleAddClient = () => setAddClientDialogOpen(true);
  const handleViewSchedule = () => {
    const route =
      plan === "business" ? "/entity/bookings" : `/${plan}/bookings`;
    navigate(route);
  };
  const handleGenerateReport = () => {
    const route = plan === "business" ? "/entity/reports" : `/${plan}/reports`;
    navigate(route);
  };
  const handleViewCalendar = () => setCalendarOpen(true);
  const handleTodayView = () => {
    const route =
      plan === "business"
        ? "/entity/bookings?filter=today"
        : `/${plan}/bookings?filter=today`;
    navigate(route);
  };
  const handleUpgradePlan = () => navigate("/upgrade");
  const handleViewAllAppointments = () => {
    const route =
      plan === "business" ? "/entity/bookings" : `/${plan}/bookings`;
    navigate(route);
  };
  const handleBookingCreated = () => fetchBookings();

  const handleViewDetails = (booking: any) => {
    setSelectedBookingDetails(booking);
    setIsDetailsDialogOpen(true);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await apiClient.patch(`/api/bookings/${bookingId}/confirm`);
      toast.success("Booking confirmed successfully!");
      fetchBookings();
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      toast.error("Failed to confirm booking");
    }
  };

  // Format helpers
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    const tomorrowOnly = new Date(tomorrow);
    tomorrowOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return t("time.today");
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return t("time.tomorrow");
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Render stats based on plan
  const renderStats = () => {
    const baseStats = [
      {
        title: t("stats.totalbookings"),
        value:
          entityStats?.bookings.thisMonth?.toString() ||
          totalBookings.toString(),
        subtitle:
          entityStats?.bookings.change !== undefined
            ? `${
                entityStats.bookings.change > 0 ? "+" : ""
              }${entityStats.bookings.change.toFixed(1)}% vs last month`
            : undefined,
        icon: CalendarDays,
        variant: "info" as const,
        trend:
          entityStats?.bookings.change !== undefined
            ? {
                value: `${Math.abs(entityStats.bookings.change).toFixed(1)}%`,
                isPositive: entityStats.bookings.change > 0,
              }
            : undefined,
      },
      {
        title: t("stats.completedSessions"),
        value: completedBookings.toString(),
        subtitle:
          completedChange > 0
            ? `+${completedChange} vs last month`
            : completedChange < 0
            ? `${completedChange} vs last month`
            : "This month",
        icon: CheckCircle,
        variant: "success" as const,
        trend:
          completedChange !== 0
            ? {
                value: `${Math.abs(completedChange)}`,
                isPositive: completedChange > 0,
              }
            : undefined,
      },
    ];

    if (plan === "simple") {
      return (
        <StatsGrid columns={3}>
          {baseStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
          <StatCard
            title="Upcoming"
            value={upcomingBookings.length}
            subtitle="Next appointments"
            icon={CalendarDays}
            variant="default"
          />
        </StatsGrid>
      );
    }

    if (plan === "individual") {
      return (
        <StatsGrid columns={4}>
          <StatCard
            title={t("stats.thismonthrevenue")}
            value={
              entityStats?.revenue.thisMonth
                ? formatCurrency(entityStats.revenue.thisMonth)
                : formatCurrency(totalRevenue)
            }
            subtitle={
              entityStats?.revenue.change !== undefined
                ? `${
                    entityStats.revenue.change > 0 ? "+" : ""
                  }${entityStats.revenue.change.toFixed(1)}% vs last month`
                : undefined
            }
            icon={DollarSign}
            variant="success"
            trend={
              entityStats?.revenue.change !== undefined
                ? {
                    value: `${Math.abs(entityStats.revenue.change).toFixed(
                      1
                    )}%`,
                    isPositive: entityStats.revenue.change > 0,
                  }
                : undefined
            }
          />
          {baseStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
          <StatCard
            title={t("stats.activeclients")}
            value={
              entityStats?.clients.newThisMonth?.toString() ||
              uniqueClients.toString()
            }
            subtitle={
              entityStats?.clients.change !== undefined
                ? `${
                    entityStats.clients.change > 0 ? "+" : ""
                  }${entityStats.clients.change.toFixed(1)}% vs last month`
                : undefined
            }
            icon={Users}
            variant="default"
            trend={
              entityStats?.clients.change !== undefined
                ? {
                    value: `${Math.abs(entityStats.clients.change).toFixed(
                      1
                    )}%`,
                    isPositive: entityStats.clients.change > 0,
                  }
                : undefined
            }
          />
        </StatsGrid>
      );
    }

    // Business plan
    return (
      <StatsGrid columns={4}>
        <StatCard
          title={t("stats.revenueThisMonth", "Revenue This Month")}
          value={formatCurrency(entityStats?.revenue.thisMonth || totalRevenue)}
          subtitle={
            entityStats?.revenue.change !== undefined
              ? `${
                  entityStats.revenue.change > 0 ? "+" : ""
                }${entityStats.revenue.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={DollarSign}
          variant="success"
          trend={
            entityStats?.revenue.change !== undefined
              ? {
                  value: `${Math.abs(entityStats.revenue.change).toFixed(1)}%`,
                  isPositive: entityStats.revenue.change > 0,
                }
              : undefined
          }
        />
        <StatCard
          title={t("stats.bookingsThisMonth", "Bookings This Month")}
          value={entityStats?.bookings.thisMonth || totalBookings}
          subtitle={
            entityStats?.bookings.change !== undefined
              ? `${
                  entityStats.bookings.change > 0 ? "+" : ""
                }${entityStats.bookings.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={CalendarDays}
          variant="info"
          trend={
            entityStats?.bookings.change !== undefined
              ? {
                  value: `${Math.abs(entityStats.bookings.change).toFixed(1)}%`,
                  isPositive: entityStats.bookings.change > 0,
                }
              : undefined
          }
        />
        <StatCard
          title={t("stats.newClients", "New Clients")}
          value={entityStats?.clients.newThisMonth || uniqueClients}
          subtitle={
            entityStats?.clients.change !== undefined
              ? `${
                  entityStats.clients.change > 0 ? "+" : ""
                }${entityStats.clients.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={Users}
          variant="default"
          trend={
            entityStats?.clients.change !== undefined
              ? {
                  value: `${Math.abs(entityStats.clients.change).toFixed(1)}%`,
                  isPositive: entityStats.clients.change > 0,
                }
              : undefined
          }
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entityStats?.users.total || uniqueClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {entityStats?.users.active || uniqueClients} active users
            </p>
          </CardContent>
        </Card>
      </StatsGrid>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("welcome")}
            </h1>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span>{confirmedBookings} confirmed bookings</span>
            {(plan === "individual" || plan === "business") && (
              <>
                <span>•</span>
                <span>{formatCurrency(totalRevenue)} revenue</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTodayView}>
            <Clock className="mr-2 h-4 w-4" />
            Today
          </Button>
          {(plan === "individual" || plan === "business") && (
            <Button variant="outline" size="sm" onClick={handleViewCalendar}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          )}
          <Button size="sm" onClick={handleNewBooking}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Main Content */}
      <div
        className={
          plan === "business"
            ? "grid gap-6 lg:grid-cols-[1fr_380px]"
            : "grid gap-6 lg:grid-cols-2"
        }
      >
        {/* Business: Main Column */}
        {plan === "business" && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("dashboard.revenueOverview", "Revenue Overview")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "dashboard.monthlyRevenue",
                    "Monthly revenue and appointment trends"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="revenue" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="revenue" className="space-y-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="appointments" className="space-y-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={appointmentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="completed"
                            fill="#22c55e"
                            name="Completed"
                          />
                          <Bar
                            dataKey="cancelled"
                            fill="#ef4444"
                            name="Cancelled"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Today's Schedule - Business */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>
                      {upcomingBookings.length} appointments scheduled
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllAppointments}
                  >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments scheduled for today</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleNewBooking}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Booking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-sm font-medium">
                            {booking.client?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-none truncate">
                                {booking.client?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {booking.service?.name || "Unknown Service"}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Clock className="h-3 w-3" />
                                {formatTime(booking.startTime)}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  booking.status === "confirmed"
                                    ? "text-xs bg-green-50 text-green-700 border-green-200"
                                    : "text-xs bg-amber-50 text-amber-700 border-amber-200"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(booking);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {booking.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmBooking(booking.id);
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sidebar Column - Business or Main Column - Simple/Individual */}
        {plan !== "business" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {(user?.plan || "simple") === "individual"
                      ? "Today's Schedule"
                      : t("upcomingBookings.title")}
                  </CardTitle>
                  <CardDescription>
                    {(user?.plan || "simple") === "individual"
                      ? "Your appointments for today"
                      : t("upcomingBookings.description")}
                  </CardDescription>
                </div>
                {plan === "simple" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewSchedule}
                  >
                    {t("viewAll")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>
                    {plan === "simple"
                      ? t("upcomingBookings.noBookings")
                      : "No appointments scheduled for today"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleNewBooking}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {plan === "simple"
                      ? t("upcomingBookings.createBooking")
                      : "Create Booking"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const currentPlan = user?.plan || "simple";
                    return (
                      <div
                        key={booking.id}
                        className={`flex items-center ${
                          currentPlan === "business"
                            ? "items-start gap-3"
                            : "justify-between"
                        } p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer`}
                        onClick={() =>
                          currentPlan === "business"
                            ? null
                            : navigate(`/${plan}/bookings`)
                        }
                      >
                        {currentPlan === "business" ? (
                          <>
                            <Avatar className="h-10 w-10 mt-1">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-sm font-medium">
                                {booking.client?.name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold leading-none truncate">
                                    {booking.client?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {booking.service?.name || "Unknown Service"}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-center gap-1 text-sm font-medium">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(booking.startTime)}
                                  </div>
                                  <p
                                    className={`text-xs mt-0.5 ${
                                      booking.status === "confirmed"
                                        ? "text-green-600"
                                        : "text-amber-600"
                                    }`}
                                  >
                                    {booking.status === "pending"
                                      ? "pending"
                                      : booking.status}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(booking);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  <span className="text-xs">View</span>
                                </Button>
                                {booking.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConfirmBooking(booking.id);
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span className="text-xs">Confirm</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-2 h-8 rounded-full ${
                                  booking.status === "confirmed"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                              <div>
                                <p className="font-medium">
                                  {booking.client?.name ||
                                    (plan === "simple"
                                      ? t("upcomingBookings.unknownClient")
                                      : "Unknown Client")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.service?.name ||
                                    (plan === "simple"
                                      ? t("upcomingBookings.unknownService")
                                      : "Unknown Service")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatTime(booking.startTime)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(booking.startTime)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {(user?.plan || "simple") === "business" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={handleViewAllAppointments}
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View All Appointments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Business: Sidebar */}
        {plan === "business" ? (
          <div className="space-y-6">
            {/* Quick Actions - Business */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription className="text-xs">
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={handleNewBooking}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={() => navigate("/entity/professionals")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={() => navigate("/entity/financial-reports")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Financial Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={() => navigate("/entity/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Goals - Business */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Monthly Goals</CardTitle>
                    <CardDescription className="text-xs">
                      Track your progress
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/entity/financial-reports")}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(goals) && goals.length > 0 ? (
                  goals.slice(0, 3).map((goal) => {
                    const progress =
                      goal.targetValue > 0
                        ? (goal.currentValue / goal.targetValue) * 100
                        : 0;
                    const displayValue =
                      goal.type === "revenue"
                        ? `${formatCurrency(
                            goal.currentValue
                          )} / ${formatCurrency(goal.targetValue)}`
                        : `${goal.currentValue} / ${goal.targetValue}`;

                    return (
                      <div key={goal._id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate flex-1">
                            {goal.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {displayValue}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    <p>No goals set for this month</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={() => navigate("/entity/financial-reports")}
                    >
                      Set Your Goals
                    </Button>
                  </div>
                )}
                {Array.isArray(goals) && goals.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate("/entity/financial-reports")}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Update Goals
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity - Business */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">
                  Latest updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className="text-xs leading-snug truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Simple & Individual: Original Layout */
          <>
            <QuickBookingWidget entityId={entityId} />

            {/* Quick Actions - Simple & Individual */}
            <Card>
              <CardHeader>
                <CardTitle>{t("quickActions.title")}</CardTitle>
                <CardDescription>
                  {plan === "individual"
                    ? "Common tasks and shortcuts"
                    : "Quick access to key features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10"
                    onClick={handleNewBooking}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                  </Button>
                  {plan === "individual" && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10"
                        onClick={handleAddClient}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Client
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10"
                        onClick={() => navigate("/individual/services")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        My Services
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10"
                    onClick={handleViewSchedule}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {plan === "individual" ? "View Calendar" : "View Schedule"}
                  </Button>
                  {plan === "simple" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10"
                      onClick={() => navigate("/simple/services")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      My Services
                    </Button>
                  )}
                  {plan === "individual" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10"
                      onClick={() => navigate("/individual/payment-management")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Tracking
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10"
                    onClick={handleGenerateReport}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {plan === "individual" ? "View Reports" : "Reports"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Simple: Upgrade Banner */}
        {plan === "simple" && (
          <Card className="border-2 border-dashed border-primary/50">
            <CardContent className="p-3 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Unlock More Features
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Upgrade to Individual for AI insights, advanced reports, and
                    unlimited bookings.
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleUpgradePlan}
                  >
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity - Simple & Individual */}
      {(plan === "simple" || plan === "individual") && (
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity.title")}</CardTitle>
            <CardDescription>
              {plan === "individual"
                ? "Latest updates and notifications"
                : t("recentActivity.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan === "simple" ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">
                        {t("recentActivity.newBookingConfirmed")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("recentActivity.minutesAgo", { count: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">
                        {t("recentActivity.sessionCompleted")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("recentActivity.hourAgo")}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">
                        New booking confirmed for tomorrow
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Payment received from Maria Silva - €45.00
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">New 5-star review received</p>
                      <p className="text-xs text-muted-foreground">
                        3 hours ago
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights - Individual & Business */}
      {(plan === "individual" || plan === "business") && (
        <Card className={plan === "business" ? "col-span-full" : ""}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <CardTitle>
                {plan === "business" ? "Business Intelligence" : "AI Insights"}
              </CardTitle>
            </div>
            <CardDescription>
              {plan === "business"
                ? "AI-powered insights to optimize your business operations"
                : "Intelligent recommendations to optimize your practice"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`space-y-4 ${
                plan === "business"
                  ? "md:grid md:grid-cols-2 lg:grid-cols-3 md:space-y-0 md:gap-4"
                  : ""
              }`}
            >
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      {plan === "business"
                        ? "Peak Hours Optimization"
                        : "Revenue Opportunity"}
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      {plan === "business"
                        ? "Add 2 more professionals during 2-5 PM to reduce wait times and increase revenue by 23%."
                        : "Your Tuesday afternoons have 40% availability. Consider offering promotions for off-peak hours to increase bookings."}
                    </p>
                    {(user?.plan || "simple") === "business" ? (
                      <div className="text-xs text-blue-600 font-medium">
                        Potential +€1,200/month
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-blue-100">
                        Potential +€180/week
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      {plan === "business"
                        ? "Service Bundling"
                        : "Client Retention Tip"}
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      {plan === "business"
                        ? "70% of hair color clients also book styling. Create a combo package to increase average booking value."
                        : "Clients who book follow-up appointments within 24 hours have 85% higher retention. Enable automatic follow-up reminders."}
                    </p>
                    {(user?.plan || "simple") === "business" ? (
                      <div className="text-xs text-green-600 font-medium">
                        Implement now
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-100">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-3">
                  {plan === "business" ? (
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      {plan === "business"
                        ? "Client Retention Alert"
                        : "Service Performance"}
                    </h4>
                    <p className="text-sm text-amber-700 mb-2">
                      {plan === "business"
                        ? "15 clients haven't returned in 45+ days. Send personalized re-engagement campaigns to win them back."
                        : 'Your "Hair Styling" service has lower demand this month. Consider bundling it with popular services or adjusting pricing.'}
                    </p>
                    {(user?.plan || "simple") === "business" ? (
                      <div className="text-xs text-amber-600 font-medium">
                        Action required
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-amber-100">
                        Monitor
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {(plan === "individual" || plan === "business") && (
        <CalendarView
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          bookings={bookings}
          title={
            plan === "business"
              ? t("calendar.title", "Business Calendar")
              : "My Calendar"
          }
          description={
            plan === "business"
              ? t("calendar.description", "View and manage all appointments")
              : "View and manage your appointments"
          }
        />
      )}

      {plan === "individual" && (
        <AddClientDialog
          open={addClientDialogOpen}
          onOpenChange={setAddClientDialogOpen}
          onClientAdded={() => console.log("Client added successfully")}
        />
      )}

      <BookingCreator
        open={quickBookingDialogOpen}
        onOpenChange={setQuickBookingDialogOpen}
        services={services}
        planType={plan}
        showPricing={plan !== "simple"}
        onSuccess={handleBookingCreated}
      />

      {/* Booking Details Dialog - Business only */}
      {plan === "business" && (
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete information about this booking
              </DialogDescription>
            </DialogHeader>
            {selectedBookingDetails && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Client
                    </Label>
                    <p className="text-base font-semibold mt-1">
                      {selectedBookingDetails.client?.name || "N/A"}
                    </p>
                    {selectedBookingDetails.client?.email && (
                      <p className="text-xs text-muted-foreground">
                        {selectedBookingDetails.client.email}
                      </p>
                    )}
                    {selectedBookingDetails.client?.phone && (
                      <p className="text-xs text-muted-foreground">
                        {selectedBookingDetails.client.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          selectedBookingDetails.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : selectedBookingDetails.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : selectedBookingDetails.status === "completed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {selectedBookingDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Service
                    </Label>
                    <p className="text-sm font-semibold mt-1">
                      {selectedBookingDetails.service?.name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBookingDetails.service?.duration || 0} min • €
                      {selectedBookingDetails.service?.pricing?.basePrice ||
                        selectedBookingDetails.service?.price ||
                        0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Professional
                    </Label>
                    <p className="text-sm font-semibold mt-1">
                      {selectedBookingDetails.professional?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </Label>
                    <p className="text-sm font-semibold mt-1">
                      {selectedBookingDetails.startTime
                        ? new Date(
                            selectedBookingDetails.startTime
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedBookingDetails.startTime
                        ? new Date(
                            selectedBookingDetails.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          selectedBookingDetails.paymentStatus === "paid"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      >
                        {selectedBookingDetails.paymentStatus || "pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedBookingDetails.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                      {selectedBookingDetails.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedBookingDetails.status === "pending" && (
                    <Button
                      onClick={() =>
                        handleConfirmBooking(selectedBookingDetails.id)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ConsolidatedDashboard;
