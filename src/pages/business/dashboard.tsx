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
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";
import {
  dashboardService,
  EntityStats,
} from "../../services/dashboard.service";
import { StatCard } from "../../components/ui/stat-card";
import { QuickBookingWidget } from "../../components/bookings/quick-booking-widget";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
import { Button } from "../../components/ui/button";
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
import { Badge } from "../../components/ui/badge";
import {
  CalendarDays,
  Users,
  DollarSign,
  ChevronRight,
  Calendar,
  Brain,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  Clock,
} from "lucide-react";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const entityId = user?.entityId || user?.id || "";

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [quickBookingDialogOpen, setQuickBookingDialogOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [entityStats, setEntityStats] = useState<EntityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Use hooks to fetch data
  const { bookings, fetchBookings, createBooking } = useBookings({
    entityId,
    autoFetch: true,
  });

  const { services } = useServices({
    entityId,
    autoFetch: true,
  });

  // Fetch monthly goals
  const { goals, fetchCurrentMonthGoals } = useGoals({ entityId });

  useEffect(() => {
    if (entityId) {
      fetchCurrentMonthGoals();
      fetchEntityStats();
    }
  }, [entityId, fetchCurrentMonthGoals]);

  const fetchEntityStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await dashboardService.getEntityStats(entityId);
      setEntityStats(stats);
    } catch (error) {
      console.error("Failed to fetch entity stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Calculate real stats from bookings data
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;

  // Get unique clients
  const uniqueClients = new Set(bookings.map((b) => b.clientId)).size;

  // Calculate revenue from completed bookings
  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => {
      return sum + (booking.service?.pricing?.basePrice || 0);
    }, 0);

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
    .slice(0, 4);

  // Calculate monthly data for charts
  const monthlyData: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }> = [];
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

  // Weekly appointment data
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

  // Service distribution data
  const serviceDistribution = new Map();
  bookings.forEach((booking) => {
    const serviceName = booking.service?.name || "Other";
    serviceDistribution.set(
      serviceName,
      (serviceDistribution.get(serviceName) || 0) + 1
    );
  });

  const serviceData = Array.from(serviceDistribution.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"][index % 5],
    }))
    .slice(0, 5);

  // Recent activity from bookings
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

  // Handler functions for buttons
  const handleTodayView = () => {
    navigate("/entity/bookings?filter=today");
  };

  const handleViewCalendar = () => {
    setCalendarOpen(true);
  };

  const handleViewAllAppointments = () => {
    navigate("/entity/bookings");
  };

  const handleCreateBooking = () => {
    setQuickBookingDialogOpen(true);
  };

  const handleBookingCreated = () => {
    fetchBookings();
  };

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

  const stats = [
    {
      title: t("stats.totalrevenue"),
      value: `€${totalRevenue.toFixed(0)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t("stats.totalbookings"),
      value: totalBookings.toString(),
      change: "+8.2%",
      trend: "up",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: t("stats.activeclients"),
      value: uniqueClients.toString(),
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: t("stats.confirmedtoday"),
      value: confirmedBookings.toString(),
      change: "+5.1%",
      trend: "up",
      icon: CheckCircle,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("welcome")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTodayView}>
            <CalendarDays className="mr-2 h-4 w-4" />
            {t("today")}
          </Button>
          <Button size="sm" onClick={handleViewCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            {t("viewCalendar")}
          </Button>
        </div>
      </div>

      {/* Stats with Period Comparison */}
      {entityStats && !statsLoading && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(entityStats.revenue.thisMonth)}
            subtitle={
              entityStats.revenue.change !== undefined
                ? `${
                    entityStats.revenue.change > 0 ? "+" : ""
                  }${entityStats.revenue.change.toFixed(1)}% vs last month`
                : undefined
            }
            icon={DollarSign}
            variant="success"
            trend={
              entityStats.revenue.change !== undefined
                ? {
                    value: `${Math.abs(entityStats.revenue.change).toFixed(
                      1
                    )}%`,
                    isPositive: entityStats.revenue.change > 0,
                  }
                : undefined
            }
          />
          <StatCard
            title="Bookings This Month"
            value={entityStats.bookings.thisMonth}
            subtitle={
              entityStats.bookings.change !== undefined
                ? `${
                    entityStats.bookings.change > 0 ? "+" : ""
                  }${entityStats.bookings.change.toFixed(1)}% vs last month`
                : undefined
            }
            icon={CalendarDays}
            variant="info"
            trend={
              entityStats.bookings.change !== undefined
                ? {
                    value: `${Math.abs(entityStats.bookings.change).toFixed(
                      1
                    )}%`,
                    isPositive: entityStats.bookings.change > 0,
                  }
                : undefined
            }
          />
          <StatCard
            title="New Clients"
            value={entityStats.clients.newThisMonth}
            subtitle={
              entityStats.clients.change !== undefined
                ? `${
                    entityStats.clients.change > 0 ? "+" : ""
                  }${entityStats.clients.change.toFixed(1)}% vs last month`
                : undefined
            }
            icon={Users}
            variant="default"
            trend={
              entityStats.clients.change !== undefined
                ? {
                    value: `${Math.abs(entityStats.clients.change).toFixed(
                      1
                    )}%`,
                    isPositive: entityStats.clients.change > 0,
                  }
                : undefined
            }
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {entityStats.users.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {entityStats.users.active} active users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Grid - Mobile-First Responsive Layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t(
                  `dashboard.stats.${stat.title
                    .toLowerCase()
                    .replace(" ", "")}`,
                  stat.title
                )}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span
                  className={
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "down"
                      ? "text-red-600"
                      : ""
                  }
                >
                  {stat.trend === "up"
                    ? "↗"
                    : stat.trend === "down"
                    ? "↘"
                    : "→"}{" "}
                  {stat.change}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>Popular services this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Booking Widget */}
          <QuickBookingWidget entityId={entityId} />

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                {upcomingBookings.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No appointments scheduled for today</p>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
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
                            {new Date(booking.startTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="text-xs">View</span>
                        </Button>

                        {booking.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleConfirmBooking(booking.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Confirm</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={handleViewAllAppointments}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => {
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Performance Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Goals</CardTitle>
              <CardDescription>Track your progress this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(goals) && goals.length > 0 ? (
                goals.map((goal) => {
                  const progress =
                    goal.targetValue > 0
                      ? (goal.currentValue / goal.targetValue) * 100
                      : 0;
                  const displayValue =
                    goal.type === "revenue"
                      ? `€${goal.currentValue.toFixed(
                          0
                        )} / €${goal.targetValue.toFixed(0)}`
                      : `${goal.currentValue} / ${goal.targetValue}`;

                  return (
                    <div key={goal._id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{goal.name}</span>
                        <span>{displayValue}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No goals set for this month</p>
                  <p className="text-xs mt-1">
                    Set your goals in Financial Reports
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <CardTitle>Business Intelligence</CardTitle>
            </div>
            <CardDescription>
              AI-powered insights to optimize your business operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Peak Hours Optimization
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Add 2 more professionals during 2-5 PM to reduce wait
                      times and increase revenue by 23%.
                    </p>
                    <div className="text-xs text-blue-600 font-medium">
                      Potential +€1,200/month
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      Service Bundling
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      70% of hair color clients also book styling. Create a
                      combo package to increase average booking value.
                    </p>
                    <div className="text-xs text-green-600 font-medium">
                      Implement now
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Client Retention Alert
                    </h4>
                    <p className="text-sm text-amber-700 mb-2">
                      15 clients haven't returned in 45+ days. Send personalized
                      re-engagement campaigns to win them back.
                    </p>
                    <div className="text-xs text-amber-600 font-medium">
                      Action required
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBookingDetails && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

      {/* Dialogs */}
      <CalendarView
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        bookings={bookings}
        title="Business Calendar"
        description="View and manage all appointments"
      />
      <BookingCreator
        open={quickBookingDialogOpen}
        onOpenChange={setQuickBookingDialogOpen}
        services={services}
        planType="business"
        onSuccess={handleBookingCreated}
      />
    </div>
  );
};

export default Dashboard;
