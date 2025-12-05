
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { StatCard } from "../../components/ui/stat-card";
import { StatsGrid } from "../../components/ui/stats-grid";
import { useCurrency } from "../../hooks/useCurrency";
import {
  dashboardService,
  EntityStats,
} from "../../services/dashboard.service";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import { LiveActivityWidget } from "../../components/dashboard/LiveActivityWidget";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import {
  Clock,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  DollarSign,
  Users,
  Calendar as CalendarIcon,
  ExternalLink,
  Store,
} from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
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
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [entityStats, setEntityStats] = useState<EntityStats | null>(null);
  const [, setStatsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch entity profile to get working hours
  const { entity } = useEntity({ autoFetch: true });

  // Fetch real bookings
  const { bookings, fetchBookings } = useBookings({
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

  const pendingBookingsCount = myBookings.filter(
    (b) => b.status === "pending"
  ).length;

  // Calculate stats from real bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TODAY'S SCHEDULE - Only bookings for today
  const todaySchedule = myBookings
    .filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= today && bookingDate < tomorrow;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  // This week (from Sunday to now)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const weeklyBookings = myBookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    return bookingDate >= thisWeekStart && bookingDate <= new Date();
  });

  // This month (from 1st to now)
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const monthlyBookings = myBookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    return bookingDate >= thisMonthStart && bookingDate <= new Date();
  });

  // Calculate correct revenue using pricing.basePrice or price
  const getBookingPrice = (booking: any) => {
    if (typeof booking.service === "object") {
      return (booking.service as any)?.pricing?.basePrice || booking.service?.price || 0;
    }
    return 0;
  };

  // Calculate completion rate
  const completedBookings = monthlyBookings.filter(b => b.status === "completed").length;
  const calculatedCompletionRate = monthlyBookings.length > 0
    ? Math.round((completedBookings / monthlyBookings.length) * 100)
    : 0;

  // Calculate working hours from entity
  const workingHoursDisplay = entity?.workingHours
    ? `${getEarliestWorkingHour(entity.workingHours)} - ${getLatestWorkingHour(entity.workingHours)}`
    : "09:00 - 18:00";

  // Calculate next break time
  const calculateNextBreak = () => {
    if (!entity?.workingHours) return "Not configured";

    const now = new Date();
    const currentDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()];
    const daySchedule = (entity.workingHours as any)[currentDay];

    if (daySchedule?.breakStart && daySchedule?.breakEnd) {
      const [breakHour, breakMin] = daySchedule.breakStart.split(":");
      const breakTime = new Date();
      breakTime.setHours(parseInt(breakHour), parseInt(breakMin), 0);

      if (breakTime > now) {
        return `${daySchedule.breakStart} - ${daySchedule.breakEnd}`;
      }
    }
    return "No break scheduled";
  };

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
    workingHours: workingHoursDisplay,
    nextBreak: calculateNextBreak(),
  };

  const stats = {
    todayBookings: todaySchedule.length,
    weeklyBookings: weeklyBookings.length,
    monthlyBookings: monthlyBookings.length,
    todayRevenue: todaySchedule.reduce((sum, b) => sum + getBookingPrice(b), 0),
    weeklyRevenue: weeklyBookings.reduce((sum, b) => sum + getBookingPrice(b), 0),
    monthlyRevenue: monthlyBookings.reduce((sum, b) => sum + getBookingPrice(b), 0),
    completionRate: calculatedCompletionRate,
    clientSatisfaction: 0,
    averageSessionTime: 45,
    noShowRate: monthlyBookings.length > 0
      ? Math.round((monthlyBookings.filter(b => b.status === "no-show").length / monthlyBookings.length) * 100)
      : 0,
  };

  // UPCOMING BOOKINGS - Only FUTURE bookings (exclude today)
  const upcomingBookings = myBookings
    .filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      // Only bookings AFTER today (tomorrow onwards)
      return bookingDate >= tomorrow;
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
          {(entity as any)?.slug && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/book/${(entity as any).slug}`;
                window.open(url, "_blank");
              }}
            >
              <Store className="h-4 w-4 mr-2" />
              View Business Profile
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/professional/bookings"}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            All Bookings
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchBookings()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>

      {/* Pending Bookings Alert */}
      {pendingBookingsCount > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Action Required</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-700">
            <span>
              You have {pendingBookingsCount} pending booking{pendingBookingsCount > 1 ? 's' : ''} that require confirmation.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 hover:bg-amber-100 text-amber-900 w-full sm:w-auto"
              onClick={() => navigate("/professional/bookings?status=pending")}
            >
              Review Pending
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Live Activity Widget */}
      <LiveActivityWidget entityId={user?.entityId || ""} />

      {/* Quick Stats */}
      <StatsGrid columns={4}>
        <StatCard
          title="Monthly Revenue"
          value={
            entityStats?.revenue.thisMonth
              ? formatCurrency(entityStats.revenue.thisMonth)
              : formatCurrency(stats.monthlyRevenue)
          }
          subtitle={
            entityStats?.revenue.change !== undefined
              ? `${entityStats.revenue.change > 0 ? "+" : ""
              }${entityStats.revenue.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={DollarSign}
          variant="success"
          trend={
            entityStats?.revenue.change !== undefined
              ? {
                value: `${Math.abs(entityStats.revenue.change).toFixed(1)}% `,
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
              ? `${entityStats.bookings.change > 0 ? "+" : ""
              }${entityStats.bookings.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={CalendarIcon}
          variant="info"
          trend={
            entityStats?.bookings.change !== undefined
              ? {
                value: `${Math.abs(entityStats.bookings.change).toFixed(1)}% `,
                isPositive: entityStats.bookings.change > 0,
              }
              : undefined
          }
        />
        <StatCard
          title="New Clients"
          value={entityStats?.clients.newThisMonth?.toString() || "0"}
          subtitle={
            entityStats?.clients.change !== undefined
              ? `${entityStats.clients.change > 0 ? "+" : ""
              }${entityStats.clients.change.toFixed(1)}% vs last month`
              : undefined
          }
          icon={Users}
          variant="default"
          trend={
            entityStats?.clients.change !== undefined
              ? {
                value: `${Math.abs(entityStats.clients.change).toFixed(1)}% `,
                isPositive: entityStats.clients.change > 0,
              }
              : undefined
          }
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}% `}
          subtitle="This month"
          icon={CheckCircle}
          variant="success"
        />
      </StatsGrid>



      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next appointments (starting tomorrow)</CardDescription>
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
        services={services.map(s => ({
          ...s,
          id: s.id || '',
          duration: typeof s.duration === 'object' ? (s.duration as any).duration : s.duration,
          price: (s as any).pricing?.basePrice || (s as any).price || 0
        }))}
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
