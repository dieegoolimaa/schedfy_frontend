import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useServices } from "../../hooks/useServices";
import { useGoals } from "../../hooks/useGoals";
import { AddClientDialog } from "../../components/dialogs/add-client-dialog";
import { CreateBookingDialog } from "../../components/dialogs/create-booking-dialog";
import { CalendarView } from "../../components/calendar/CalendarView";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  Calendar,
  Brain,
  Lightbulb,
  Target,
  TrendingDown,
  Loader2,
  CheckCircle,
} from "lucide-react";

const IndividualDashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const {
    bookings,
    loading: bookingsLoading,
    fetchBookings,
    createBooking,
  } = useBookings({
    entityId,
    autoFetch: true,
  });

  const { services, loading: servicesLoading } = useServices({
    entityId,
    autoFetch: true,
  });

  // Dialog states
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [quickBookingDialogOpen, setQuickBookingDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch monthly goals
  const { fetchCurrentMonthGoals, createDefaultMonthlyGoals } = useGoals({
    entityId,
  });

  // Load goals on mount
  useEffect(() => {
    if (entityId) {
      fetchCurrentMonthGoals().then((monthGoals) => {
        if (!monthGoals || monthGoals.length === 0) {
          createDefaultMonthlyGoals();
        }
      });
    }
  }, [entityId, fetchCurrentMonthGoals, createDefaultMonthlyGoals]);

  // Calculate real stats from bookings data
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  // Get unique clients from bookings
  const uniqueClients = new Set(bookings.map((b) => b.clientId)).size;

  // Calculate total revenue from completed bookings
  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, booking) => {
      // Use pricing.basePrice from service
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
    .slice(0, 5);

  // Calculate stats changes (comparing this month vs last month)
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

  const thisMonthBookings = bookings.filter(
    (b) => new Date(b.createdAt) >= thisMonthStart
  );

  const lastMonthBookings = bookings.filter((b) => {
    const date = new Date(b.createdAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const bookingsChange =
    lastMonthBookings.length > 0
      ? (
          ((thisMonthBookings.length - lastMonthBookings.length) /
            lastMonthBookings.length) *
          100
        ).toFixed(1)
      : "0";

  const loading = bookingsLoading || servicesLoading;

  // Handler functions for navigation
  const handleNewBooking = () => {
    setQuickBookingDialogOpen(true);
  };

  const handleAddClient = () => {
    setAddClientDialogOpen(true);
  };

  const handleViewSchedule = () => {
    navigate("/individual/bookings");
  };

  const handleGenerateReport = () => {
    navigate("/individual/reports");
  };

  const handleViewCalendar = () => {
    setCalendarOpen(true);
  };

  const handleTodayView = () => {
    navigate("/individual/bookings?filter=today");
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

  const stats = [
    {
      title: t("stats.totalbookings"),
      value: totalBookings.toString(),
      change: `${bookingsChange >= "0" ? "+" : ""}${bookingsChange}%`,
      trend: Number.parseFloat(bookingsChange) >= 0 ? "up" : "down",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: t("stats.thismonthrevenue"),
      value: `€${totalRevenue.toFixed(0)}`,
      change: "+8.7%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t("stats.activeclients"),
      value: uniqueClients.toString(),
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: t("stats.completedSessions"),
      value: completedBookings.toString(),
      change: `+${completedBookings}`,
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("welcome")}</h1>
          <p className="text-muted-foreground">{t("subtitleIndividual")}</p>
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

      {/* Stats Grid - Mobile-First Responsive Layout */}
      <ResponsiveCardGrid>
        {stats.map((stat) => (
          <MobileStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={`${stat.change} from last month`}
            color={
              stat.title.includes("Bookings")
                ? "blue"
                : stat.title.includes("Revenue") ||
                  stat.title.includes("Earnings")
                ? "green"
                : stat.title.includes("Clients")
                ? "purple"
                : stat.title.includes("Rating")
                ? "yellow"
                : "gray"
            }
          />
        ))}
      </ResponsiveCardGrid>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
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
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Create Booking
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate("/individual/bookings")}
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
            <CardDescription>Common tasks and shortcuts</CardDescription>
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
                onClick={handleAddClient}
              >
                <Users className="mr-3 h-5 w-5" />
                Add New Client
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
                onClick={handleGenerateReport}
              >
                <DollarSign className="mr-3 h-5 w-5" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
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
                <p className="text-sm">
                  Payment received from Maria Silva - €45.00
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">New 5-star review received</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>
            Intelligent recommendations to optimize your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Revenue Opportunity
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Your Tuesday afternoons have 40% availability. Consider
                    offering promotions for off-peak hours to increase bookings.
                  </p>
                  <Badge variant="outline" className="text-xs bg-blue-100">
                    Potential +€180/week
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    Client Retention Tip
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Clients who book follow-up appointments within 24 hours have
                    85% higher retention. Enable automatic follow-up reminders.
                  </p>
                  <Badge variant="outline" className="text-xs bg-green-100">
                    Actionable
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-3">
                <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">
                    Service Performance
                  </h4>
                  <p className="text-sm text-amber-700 mb-2">
                    Your "Hair Styling" service has lower demand this month.
                    Consider bundling it with popular services or adjusting
                    pricing.
                  </p>
                  <Badge variant="outline" className="text-xs bg-amber-100">
                    Monitor
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CalendarView
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        bookings={bookings}
        title="My Calendar"
        description="View and manage your appointments"
      />

      <AddClientDialog
        open={addClientDialogOpen}
        onOpenChange={setAddClientDialogOpen}
        onClientAdded={() => {
          console.log("Client added successfully");
        }}
      />

      <CreateBookingDialog
        open={quickBookingDialogOpen}
        onOpenChange={setQuickBookingDialogOpen}
        entityId={entityId}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration || 60,
          price: s.price,
        }))}
        onSubmit={async (bookingData) => {
          await createBooking(bookingData);
          fetchBookings();
        }}
      />
    </div>
  );
};

export default IndividualDashboard;
