import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { useCurrency } from "../../hooks/useCurrency";
import {
  dashboardService,
  EntityStats,
} from "../../services/dashboard.service";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
  Clock,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { CalendarView } from "../../components/calendar/CalendarView";
import { useEntity } from "../../hooks/useEntity";
import { WorkingHours } from "../../types/models/entities.interface";
import { BookingCreator } from "../../components/booking";
import { useServices } from "../../hooks/useServices";
import { toast } from "sonner";

// Helper functions to extract working hours range
const getEarliestWorkingHour = (workingHours?: WorkingHours): string => {
  if (!workingHours) return "09:00";

  const times = Object.values(workingHours)
    .filter((day) => day.enabled && day.start)
    .map((day) => day.start);

  if (times.length === 0) return "09:00";

  return times.reduce(
    (earliest, time) => (time < earliest ? time : earliest),
    times[0]
  );
};

const getLatestWorkingHour = (workingHours?: WorkingHours): string => {
  if (!workingHours) return "18:00";

  const times = Object.values(workingHours)
    .filter((day) => day.enabled && day.end)
    .map((day) => day.end);

  if (times.length === 0) return "18:00";

  return times.reduce(
    (latest, time) => (time > latest ? time : latest),
    times[0]
  );
};

export function ProfessionalDashboardPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [timeRange, setTimeRange] = useState("7d");
  const [showCalendar, setShowCalendar] = useState(false);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [entityStats, setEntityStats] = useState<EntityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch entity profile to get working hours
  const { entity } = useEntity({ autoFetch: true });

  // Fetch real bookings
  const { bookings, fetchBookings, createBooking } = useBookings({
    entityId: user?.entityId || "",
  });

  // Fetch services
  const { services } = useServices({
    entityId: user?.entityId || "",
    autoFetch: true,
  });

  // Fetch entity stats with period comparison
  useEffect(() => {
    const fetchEntityStats = async () => {
      if (!user?.entityId) return;
      try {
        setStatsLoading(true);
        const stats = await dashboardService.getEntityStats(user.entityId);
        setEntityStats(stats);
      } catch (error) {
        console.error("Error fetching entity stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchEntityStats();
  }, [user?.entityId]);

  // Filter bookings for this professional
  const myBookings = useMemo(() => {
    if (!user?.id) return [];
    return bookings.filter((b) => b.professionalId === user.id);
  }, [bookings, user?.id]);

  // Calculate stats from real bookings
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

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const weeklyBookings = myBookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    return bookingDate >= thisWeekStart;
  });

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyBookings = myBookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    return bookingDate >= thisMonthStart;
  });

  // Professional data from user context
  const professional = {
    name: user?.name || "Professional",
    role: user?.professionalInfo?.jobFunction || "Professional",
    avatar: user?.name
      ? user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      : "PR",
    email: user?.email || "",
    phone: user?.phone || "Not provided",
    rating: 0,
    totalReviews: 0,
    joinDate: user?.createdAt || new Date().toISOString(),
    specialties: user?.professionalInfo?.specialties || [],
    workingHours: "09:00 - 18:00",
    nextBreak: "13:00 - 14:00",
  };

  const stats = {
    todayBookings: todaySchedule.length,
    weeklyBookings: weeklyBookings.length,
    monthlyBookings: monthlyBookings.length,
    todayRevenue: todaySchedule.reduce((sum, b) => {
      const price =
        typeof b.service === "object" && b.service?.price ? b.service.price : 0;
      return sum + price;
    }, 0),
    weeklyRevenue: weeklyBookings.reduce((sum, b) => {
      const price =
        typeof b.service === "object" && b.service?.price ? b.service.price : 0;
      return sum + price;
    }, 0),
    monthlyRevenue: monthlyBookings.reduce((sum, b) => {
      const price =
        typeof b.service === "object" && b.service?.price ? b.service.price : 0;
      return sum + price;
    }, 0),
    completionRate: 0,
    clientSatisfaction: 0,
    averageSessionTime: 45,
    noShowRate: 0,
  };

  // Get upcoming bookings (future bookings only)
  const upcomingBookings = myBookings
    .filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate > new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5); // Show next 5 bookings

  // Format time from Date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">
              {professional.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {professional.name}
            </h1>
            <p className="text-muted-foreground">{professional.role}</p>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium">{professional.rating}</span>
              <span className="text-muted-foreground ml-1">
                ({professional.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCalendar(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">This Week</SelectItem>
              <SelectItem value="30d">This Month</SelectItem>
              <SelectItem value="90d">3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Calendar View Dialog */}
      <CalendarView
        open={showCalendar}
        onOpenChange={setShowCalendar}
        bookings={myBookings}
        title="My Calendar"
        description="View and manage your appointments"
        workingHours={
          entity?.workingHours
            ? {
                start: getEarliestWorkingHour(entity.workingHours),
                end: getLatestWorkingHour(entity.workingHours),
              }
            : { start: "09:00", end: "18:00" }
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={
            entityStats?.revenue.thisMonth
              ? formatCurrency(entityStats.revenue.thisMonth)
              : formatCurrency(stats.monthlyRevenue)
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
                  value: `${Math.abs(entityStats.revenue.change).toFixed(1)}%`,
                  isPositive: entityStats.revenue.change > 0,
                }
              : undefined
          }
        />
        <StatCard
          title="Monthly Bookings"
          value={
            entityStats?.bookings.thisMonth?.toString() ||
            stats.monthlyBookings.toString()
          }
          subtitle={
            entityStats?.bookings.change !== undefined
              ? `${
                  entityStats.bookings.change > 0 ? "+" : ""
                }${entityStats.bookings.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={CalendarIcon}
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
          title="New Clients"
          value={entityStats?.clients.thisMonth?.toString() || "0"}
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
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          subtitle="This month"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your appointments for {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateBookingOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySchedule.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No appointments scheduled for today
                  </TableCell>
                </TableRow>
              ) : (
                todaySchedule.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(appointment.startTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof appointment.client === "string"
                        ? appointment.client
                        : appointment.client?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {typeof appointment.service === "string"
                        ? appointment.service
                        : appointment.service?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {typeof appointment.service === "object" &&
                      appointment.service?.duration
                        ? `${appointment.service.duration}min`
                        : appointment.startTime && appointment.endTime
                        ? `${Math.round(
                            (new Date(appointment.endTime).getTime() -
                              new Date(appointment.startTime).getTime()) /
                              60000
                          )}min`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      €
                      {typeof appointment.service === "object" &&
                      appointment.service?.price
                        ? appointment.service.price
                        : 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(appointment.status)}
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {appointment.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No upcoming bookings
              </p>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {typeof booking.client === "string"
                        ? booking.client
                        : booking.client?.name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.startTime)} at{" "}
                      {formatTime(booking.startTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeof booking.service === "string"
                        ? booking.service
                        : booking.service?.name || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      €
                      {typeof booking.service === "object" &&
                      booking.service?.price
                        ? booking.service.price
                        : 0}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your statistics this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Total Bookings</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <p className="text-2xl font-bold">{stats.monthlyBookings}</p>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Monthly Revenue</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Weekly Bookings</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <p className="text-2xl font-bold">{stats.weeklyBookings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your profile and work details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {professional.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {professional.phone}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Work Schedule</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Working Hours: {professional.workingHours}
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                    Next Break: {professional.nextBreak}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Function</h4>
                <Badge variant="secondary" className="text-sm">
                  {professional.role}
                </Badge>
              </div>

              {professional.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg. Session Time</span>
                    <span>{stats.averageSessionTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>No-Show Rate</span>
                    <span className="text-green-600">{stats.noShowRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Member Since</span>
                    <span>
                      {new Date(professional.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Booking Dialog */}
      <BookingCreator
        open={createBookingOpen}
        onOpenChange={setCreateBookingOpen}
        services={services}
        planType="individual"
        onSuccess={async () => {
          await fetchBookings();
          setCreateBookingOpen(false);
          toast.success("Booking created successfully!");
        }}
      />
    </div>
  );
}
