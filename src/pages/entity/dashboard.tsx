import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useServices } from "../../hooks/useServices";
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
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
} from "lucide-react";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Use hooks to fetch data
  const { bookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  useServices({
    entityId,
    autoFetch: true,
  });

  useEffect(() => {
    if (entityId) {
      // Data will be fetched automatically by hooks
    }
  }, [entityId]);

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
    console.log("Filtering to show today's appointments");
  };

  const handleViewCalendar = () => {
    console.log("Opening calendar view");
  };

  const handleViewAllAppointments = () => {
    console.log("Navigating to all appointments");
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `€${totalRevenue.toFixed(0)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: "+8.2%",
      trend: "up",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: "Active Clients",
      value: uniqueClients.toString(),
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Confirmed Today",
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
            {t("dashboard.welcome", "Welcome back")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "dashboard.subtitle",
              "Here's what's happening with your business today"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTodayView}>
            <CalendarDays className="mr-2 h-4 w-4" />
            {t("dashboard.today", "Today")}
          </Button>
          <Button size="sm" onClick={handleViewCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            {t("dashboard.viewCalendar", "View Calendar")}
          </Button>
        </div>
      </div>

      {/* Stats Grid - Mobile-First Responsive Layout */}
      <ResponsiveCardGrid>
        {stats.map((stat) => (
          <MobileStatsCard
            key={stat.title}
            title={t(
              `dashboard.stats.${stat.title.toLowerCase().replace(" ", "")}`,
              stat.title
            )}
            value={stat.value}
            subtitle={`${stat.change} from last month`}
            color={
              stat.title.includes("Revenue") || stat.title.includes("Earnings")
                ? "green"
                : stat.title.includes("Bookings")
                ? "blue"
                : stat.title.includes("Clients") || stat.title.includes("Users")
                ? "purple"
                : stat.title.includes("Rating") ||
                  stat.title.includes("Satisfaction")
                ? "yellow"
                : "gray"
            }
          />
        ))}
      </ResponsiveCardGrid>

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
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                {upcomingBookings.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center space-x-4 rounded-lg border p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {booking.client?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.client?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.service?.name || "Unknown Service"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p
                      className={`text-xs ${
                        booking.status === "confirmed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Revenue Goal</span>
                  <span>€5,400 / €8,000</span>
                </div>
                <Progress value={67.5} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Appointments</span>
                  <span>180 / 250</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>New Clients</span>
                  <span>12 / 20</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
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

      {/* Calendar Modal */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Calendar View</DialogTitle>
            <DialogDescription>
              View and manage your appointments and schedule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <h3 className="text-base sm:text-lg font-medium">March 2024</h3>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 h-8"
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 h-8"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 h-8"
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs h-8"
                >
                  Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs h-8"
                >
                  Week
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs h-8"
                >
                  Month
                </Button>
              </div>
            </div>

            {/* Simple Calendar Grid */}
            <div className="border rounded-lg p-2 sm:p-4">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-1 sm:p-2 text-center font-medium text-[10px] sm:text-sm text-muted-foreground"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 2; // Start from previous month
                  const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                  const isToday = dayNum === 15; // Mock today
                  const hasAppointments = [3, 8, 15, 22, 28].includes(dayNum); // Mock appointments

                  return (
                    <div
                      key={i}
                      className={`
                        p-0.5 sm:p-2 h-10 sm:h-20 border rounded text-[10px] sm:text-sm cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center
                        ${
                          !isCurrentMonth
                            ? "text-muted-foreground bg-muted/20"
                            : ""
                        }
                        ${
                          isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : ""
                        }
                        ${hasAppointments ? "border-primary border-2" : ""}
                      `}
                    >
                      <div className="font-medium">
                        {isCurrentMonth ? dayNum : ""}
                      </div>
                      {hasAppointments && isCurrentMonth && (
                        <div className="mt-1 space-y-0.5 sm:space-y-1">
                          <div className="w-full h-0.5 sm:h-1 bg-primary rounded"></div>
                          <div className="text-[10px] sm:text-xs hidden sm:block">
                            2 appts
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/entity/booking-management")}
              >
                Create New Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/entity/bookings")}
              >
                View All Bookings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
