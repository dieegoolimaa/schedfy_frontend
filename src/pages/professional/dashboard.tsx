import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { toast } from "sonner";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
import { Label } from "../../components/ui/label";
import { CalendarView } from "../../components/calendar/CalendarView";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  Activity,
} from "lucide-react";

export function ProfessionalDashboard() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("week");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Debug: Log user data
  useEffect(() => {
    console.log("[Professional Dashboard] User data:", user);
  }, [user]);

  const entityId = user?.entityId || "";
  const professionalId = user?.id || "";

  // Fetch bookings for this professional
  const {
    bookings,
    loading: bookingsLoading,
    fetchBookings,
    confirmBooking,
    completeBooking,
  } = useBookings({ entityId });

  useEffect(() => {
    if (entityId) {
      fetchBookings();
    }
  }, [entityId]);

  // Filter bookings for this professional only
  const myBookings = bookings.filter(
    (b) =>
      b.professionalId === professionalId ||
      b.professional?.id === professionalId
  );

  // Today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySchedule = myBookings
    .filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= today && bookingDate < tomorrow;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  // Professional data from user context
  const professionalData = {
    id: user?.id || "",
    name: user?.name || "Professional",
    role: "Professional",
    avatar: user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "PR",
    email: user?.email || "",
    phone: "",
    businessName: "Business Name",
    startDate: user?.createdAt || new Date().toISOString(),
    specialities: [],
    rating: 4.8,
    totalReviews: 0,
  };

  // Calculate stats from real data
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthBookings = myBookings.filter((booking) => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate >= thisMonth;
  });

  // Calculate weekly/monthly data for charts
  const calculateWeeklyData = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return daysOfWeek.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const dayBookings = myBookings.filter((b) => {
        const bookingDate = new Date(b.startTime);
        return bookingDate >= dayDate && bookingDate < nextDay;
      });

      const revenue = dayBookings.reduce(
        (sum, b) => sum + (b.service?.price || 0),
        0
      );

      return {
        day,
        bookings: dayBookings.length,
        revenue,
      };
    });
  };

  const calculateMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = new Date().getMonth();

    return months
      .map((month, index) => {
        const monthBookings = myBookings.filter((b) => {
          const bookingDate = new Date(b.startTime);
          return (
            bookingDate.getMonth() === index &&
            bookingDate.getFullYear() === new Date().getFullYear()
          );
        });

        const revenue = monthBookings.reduce(
          (sum, b) => sum + (b.service?.price || 0),
          0
        );

        return {
          month,
          bookings: monthBookings.length,
          revenue,
        };
      })
      .filter((_, index) => index <= currentMonth);
  };

  const weeklyData = calculateWeeklyData();
  const monthlyData = calculateMonthlyData();
  const currentData = timeFilter === "week" ? weeklyData : monthlyData;

  // Stats
  const stats = {
    today: {
      bookings: todaySchedule.length,
      confirmed: todaySchedule.filter((b) => b.status === "confirmed").length,
      pending: todaySchedule.filter((b) => b.status === "pending").length,
      revenue: todaySchedule.reduce(
        (sum, b) => sum + (b.service?.price || 0),
        0
      ),
    },
    thisMonth: {
      bookings: thisMonthBookings.length,
      revenue: thisMonthBookings.reduce(
        (sum, b) => sum + (b.service?.price || 0),
        0
      ),
      commission:
        thisMonthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0) *
        0.6, // 60% commission
      rating: 4.8,
      newClients: new Set(thisMonthBookings.map((b) => b.clientId)).size,
    },
    overall: {
      totalBookings: myBookings.length,
      totalRevenue: myBookings.reduce(
        (sum, b) => sum + (b.service?.price || 0),
        0
      ),
      totalCommission:
        myBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0) * 0.6,
      averageRating: 4.8,
      totalClients: new Set(myBookings.map((b) => b.clientId)).size,
    },
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      toast.success("Booking confirmed successfully");
      fetchBookings();
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      toast.error(error.message || "Failed to confirm booking");
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completeBooking(bookingId);
      toast.success("Booking marked as completed");
      fetchBookings();
    } catch (error: any) {
      console.error("Error completing booking:", error);
      toast.error(error.message || "Failed to complete booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {professionalData.name}!
          </h1>
          <p className="text-muted-foreground">
            {professionalData.role} at {professionalData.businessName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCalendarOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{professionalData.rating}</span>
            <span className="text-muted-foreground">
              ({professionalData.totalReviews} reviews)
            </span>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback>{professionalData.avatar}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Calendar View Dialog */}
      <CalendarView
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        bookings={myBookings}
        title="My Calendar"
        description="View and manage your appointments"
      />

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.today.bookings}</div>
            <p className="text-xs text-muted-foreground">Today's Bookings</p>
            <div className="text-xs text-green-600 mt-1">
              {stats.today.confirmed} confirmed, {stats.today.pending} pending
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">€{stats.today.revenue}</div>
            <p className="text-xs text-muted-foreground">Expected Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.thisMonth.bookings}</div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              €{stats.thisMonth.commission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Commission</p>
            <div className="text-xs text-muted-foreground mt-1">
              60% of €{stats.thisMonth.revenue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {stats.thisMonth.newClients}
            </div>
            <p className="text-xs text-muted-foreground">New Clients</p>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Appointments - {new Date().toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Your schedule for today with client details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : todaySchedule.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                        <p className="text-muted-foreground">
                          No appointments scheduled for today
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    todaySchedule.map((appointment) => {
                      const startTime = new Date(appointment.startTime);
                      const endTime = new Date(appointment.endTime);
                      const duration = Math.round(
                        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                      );

                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="font-medium">
                                {startTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {appointment.client?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {appointment.client?.phone || "N/A"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {appointment.service?.name || "Service"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>{duration} min</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                appointment.status
                              )} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(appointment.status)}
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {appointment.notes || "No notes"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {appointment.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmBooking(appointment.id)
                                  }
                                >
                                  Confirm
                                </Button>
                              )}
                              {appointment.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleCompleteBooking(appointment.id)
                                  }
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Performance Analytics</h3>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Trend</CardTitle>
                <CardDescription>
                  Number of appointments{" "}
                  {timeFilter === "week" ? "this week" : "over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFilter === "week" ? "day" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Earnings {timeFilter === "week" ? "this week" : "over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFilter === "week" ? "day" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.totalBookings}
                </div>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  €{stats.overall.totalCommission.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.averageRating}
                </div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.totalClients}
                </div>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Clients
              </CardTitle>
              <CardDescription>Clients you've served recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Client Management</h3>
                <p className="text-muted-foreground mb-4">
                  View your client history and build relationships.
                </p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>Your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {professionalData.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {professionalData.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {professionalData.role}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      <span className="text-sm">
                        {professionalData.rating} (
                        {professionalData.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      EMAIL
                    </Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      PHONE
                    </Label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      BUSINESS
                    </Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.businessName}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      SPECIALITIES
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professionalData.specialities.map((speciality) => (
                        <Badge
                          key={speciality}
                          variant="secondary"
                          className="text-xs"
                        >
                          {speciality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Your milestones and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-gold-500" />
                    <div>
                      <div className="font-medium">Top Performer</div>
                      <div className="text-sm text-muted-foreground">
                        Highest rated professional this month
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">Goal Achiever</div>
                      <div className="text-sm text-muted-foreground">
                        Exceeded monthly booking target
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-medium">Client Favorite</div>
                      <div className="text-sm text-muted-foreground">
                        95% client satisfaction rate
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Member since:{" "}
                    {new Date(professionalData.startDate).toLocaleDateString()}
                  </div>
                  <Button variant="outline" className="w-full">
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
