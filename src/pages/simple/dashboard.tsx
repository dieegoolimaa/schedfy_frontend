import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  CalendarDays,
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const SimpleDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleViewCalendar = () => {
    console.log("Opening calendar view");
  };

  const handleTodayView = () => {
    console.log("Filtering to today's view");
  };

  const stats = [
    {
      title: "Total Bookings",
      value: "8",
      change: "+3",
      trend: "up",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: "Completed Sessions",
      value: "6",
      change: "+2",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      client: "Maria Silva",
      service: "Consultation",
      time: "10:00 AM",
      date: "Today",
      status: "confirmed",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Follow-up",
      time: "2:30 PM",
      date: "Tomorrow",
      status: "confirmed",
    },
  ];

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
          <Button size="sm" onClick={handleViewCalendar}>
            <Calendar className="mr-2 h-4 w-4" />
            {t("dashboard.viewCalendar", "View Calendar")}
          </Button>
        </div>
      </div>

      {/* Stats Grid - Simple 2 column layout */}
      <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  {stat.change} this month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    <div>
                      <p className="font-medium">{booking.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{booking.time}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
