import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useServices } from "../../hooks/useServices";
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
  CalendarDays,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

const SimpleDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const { bookings, loading: bookingsLoading } = useBookings({
    entityId,
    autoFetch: true,
  });

  const { loading: servicesLoading } = useServices({
    entityId,
    autoFetch: true,
  });

  // Calculate real stats from bookings data
  const totalBookings = bookings.length;
  const completedSessions = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  // Get upcoming bookings (confirmed, future bookings)
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
    .slice(0, 5);

  // Get last month's bookings for comparison
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);

  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  const lastMonthBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    return bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd;
  });

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const thisMonthBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    return bookingDate >= thisMonthStart;
  });

  const bookingsChange = thisMonthBookings.length - lastMonthBookings.length;
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

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change:
        bookingsChange > 0 ? `+${bookingsChange}` : bookingsChange.toString(),
      trend: bookingsChange >= 0 ? "up" : "down",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: "Completed Sessions",
      value: completedSessions.toString(),
      change:
        completedChange > 0
          ? `+${completedChange}`
          : completedChange.toString(),
      trend: completedChange >= 0 ? "up" : "down",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const loading = bookingsLoading || servicesLoading;

  // Handler functions for navigation
  const handleNewBooking = () => {
    navigate("/simple/bookings");
  };

  const handleViewSchedule = () => {
    navigate("/simple/bookings");
  };

  const handleViewReports = () => {
    navigate("/simple/reports");
  };

  const handleUpgradePlan = () => {
    navigate("/upgrade");
  };

  const handleTodayView = () => {
    // Filter to today's bookings - in a real implementation, you'd pass this as state
    navigate("/simple/bookings");
  };

  // Format date/time helpers
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

    // Reset time parts for comparison
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    const tomorrowOnly = new Date(tomorrow);
    tomorrowOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.welcome", "Welcome back")}
          </h1>
          <p className="text-muted-foreground">
            Manage your appointments and services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTodayView}>
            <CalendarDays className="mr-2 h-4 w-4" />
            {t("dashboard.today", "Today")}
          </Button>
        </div>
      </div>

      {/* Stats Grid - Mobile-First Responsive Layout */}
      <ResponsiveCardGrid>
        {loading ? (
          <>
            <MobileStatsCard
              title="Loading..."
              value="--"
              color="gray"
              subtitle="Fetching data..."
            />
            <MobileStatsCard
              title="Loading..."
              value="--"
              color="gray"
              subtitle="Fetching data..."
            />
          </>
        ) : (
          stats.map((stat) => (
            <MobileStatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={`${stat.change} this month`}
              color={
                stat.title.includes("Bookings")
                  ? "blue"
                  : stat.title.includes("Completed")
                  ? "green"
                  : "gray"
              }
            />
          ))
        )}
      </ResponsiveCardGrid>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your next appointments</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
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
                <p>No upcoming bookings</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleNewBooking}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Create Booking
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate("/simple/bookings")}
                  >
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
                          {booking.client?.name || "Unknown Client"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.service?.name || "Unknown Service"}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Essential features for your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button
                className="w-full justify-start h-12"
                onClick={handleNewBooking}
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                New Booking
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                onClick={handleViewSchedule}
              >
                <Clock className="mr-3 h-5 w-5" />
                View Schedule
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                onClick={handleViewReports}
              >
                <DollarSign className="mr-3 h-5 w-5" />
                View Reports
              </Button>

              {/* Upgrade Banner */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Unlock More Features
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Upgrade to Individual or Business plan for advanced analytics,
                  team management, and more.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleUpgradePlan}
                >
                  Upgrade Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">New booking confirmed for tomorrow</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">Session completed successfully</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDashboard;
