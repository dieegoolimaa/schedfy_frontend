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
import { Badge } from "../../components/ui/badge";
import {
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Star,
  Calendar,
  Brain,
  Lightbulb,
  Target,
  TrendingDown,
} from "lucide-react";

const IndividualDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handler functions for navigation
  const handleNewBooking = () => {
    navigate("/individual/bookings");
  };

  const handleAddClient = () => {
    console.log("Opening add client dialog");
  };

  const handleViewSchedule = () => {
    navigate("/individual/bookings");
  };

  const handleGenerateReport = () => {
    navigate("/individual/reports");
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
      value: "28",
      change: "+15.3%",
      trend: "up",
      icon: CalendarDays,
      color: "text-blue-600",
    },
    {
      title: "This Month Revenue",
      value: "€1,240",
      change: "+8.7%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Clients",
      value: "12",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: "4.9",
      change: "+0.1",
      trend: "up",
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      client: "Maria Silva",
      service: "Haircut & Style",
      time: "10:00 AM",
      date: "Today",
      status: "confirmed",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Color Treatment",
      time: "2:30 PM",
      date: "Today",
      status: "confirmed",
    },
    {
      id: 3,
      client: "Ana Costa",
      service: "Manicure",
      time: "11:00 AM",
      date: "Tomorrow",
      status: "pending",
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
            Manage your individual practice and appointments
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

      {/* Stats Grid - 2 column layout */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
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
                  {stat.change}{" "}
                  {t("dashboard.fromLastMonth", "from last month")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings
                .filter((booking) => booking.date === "Today")
                .map((booking) => (
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
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
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
    </div>
  );
};

export default IndividualDashboard;
