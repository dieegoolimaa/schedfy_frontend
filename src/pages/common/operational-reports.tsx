import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useClients } from "../../hooks/useClients";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  AlertTriangle,
  Award,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { AIOperationalInsights } from "../../components/reports/ai-operational-insights";

export function OperationalReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const entityId = user?.entityId || user?.id || "";
  const plan = user?.plan || "simple";

  const [timeRange, setTimeRange] = useState("30d");

  // Fetch real data
  const { bookings, fetchBookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  const { clients } = useClients({
    entityId,
    autoFetch: true,
  });

  // Filter bookings based on time range
  const { filteredBookings, growth } = useMemo(() => {
    const now = new Date();
    const rangeMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "12m": 365,
    };
    const days = rangeMap[timeRange] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    const currentPeriod = bookings.filter((b) => new Date(b.startTime) >= startDate);
    const previousPeriod = bookings.filter((b) => {
      const date = new Date(b.startTime);
      return date >= previousStartDate && date < startDate;
    });

    const currentTotal = currentPeriod.length;
    const previousTotal = previousPeriod.length;

    const growthRate = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : currentTotal > 0 ? 100 : 0;

    return { filteredBookings: currentPeriod, growth: growthRate };
  }, [bookings, timeRange]);

  // Calculate Operational Stats
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const completed = filteredBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const cancelled = filteredBookings.filter(
      (b) => b.status === "cancelled"
    ).length;
    const noShow = filteredBookings.filter(
      (b) => b.status === "no-show"
    ).length;

    // New Clients (approximate based on creation date)
    const newClientsCount = clients.filter((c) => {
      // Assuming client has createdAt, otherwise fallback
      const created = (c as any).createdAt
        ? new Date((c as any).createdAt)
        : new Date();
      const now = new Date();
      const rangeMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "12m": 365,
      };
      const days = rangeMap[timeRange] || 30;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return created >= startDate;
    }).length;

    return {
      total,
      completed,
      cancelled,
      noShow,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      newClients: newClientsCount,
      growth,
    };
  }, [filteredBookings, clients, timeRange, growth]);

  // Bookings by Service
  const bookingsByService = useMemo(() => {
    const map = new Map<string, number>();
    filteredBookings.forEach((b) => {
      const name = b.service?.name || "Unknown";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredBookings]);

  // Bookings by Professional (Business Only)
  const professionalStats = useMemo(() => {
    if (plan !== "business") return [];

    const stats = new Map<
      string,
      {
        name: string;
        total: number;
        completed: number;
        cancelled: number;
        revenue: number;
      }
    >();

    filteredBookings.forEach((b) => {
      const name = b.professional?.name || "Unassigned";
      const current = stats.get(name) || {
        name,
        total: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
      };

      current.total++;
      if (b.status === "completed") {
        current.completed++;
        current.revenue += b.pricing?.totalPrice || b.service?.price || 0;
      } else if (b.status === "cancelled") {
        current.cancelled++;
      }

      stats.set(name, current);
    });

    return Array.from(stats.values()).sort((a, b) => b.completed - a.completed);
  }, [filteredBookings, plan]);

  // Detailed Service Stats
  const serviceStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        name: string;
        category: string;
        total: number;
        completed: number;
        revenue: number;
        duration: number;
      }
    >();

    filteredBookings.forEach((b) => {
      const name = b.service?.name || "Unknown Service";
      const current = stats.get(name) || {
        name,
        category: b.service?.category || "General",
        total: 0,
        completed: 0,
        revenue: 0,
        duration: b.service?.duration || 0,
      };

      current.total++;
      if (b.status === "completed") {
        current.completed++;
        current.revenue += b.pricing?.totalPrice || b.service?.price || 0;
      }

      stats.set(name, current);
    });

    return Array.from(stats.values()).sort((a, b) => b.total - a.total);
  }, [filteredBookings]);

  // Busy Hours Analysis
  const busyHours = useMemo(() => {
    const hours = new Array(24).fill(0);
    filteredBookings.forEach((b) => {
      const date = new Date(b.startTime);
      const hour = date.getHours();
      hours[hour]++;
    });

    // Filter to business hours (e.g., 8am to 8pm) for better visualization
    return hours
      .map((count, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        bookings: count,
      }))
      .slice(8, 21);
  }, [filteredBookings]);

  // Status Distribution
  const statusDistribution = useMemo(() => {
    return [
      { name: "Completed", value: stats.completed, color: "#22c55e" },
      { name: "Cancelled", value: stats.cancelled, color: "#ef4444" },
      { name: "No-Show", value: stats.noShow, color: "#f59e0b" },
      {
        name: "Pending",
        value: stats.total - stats.completed - stats.cancelled - stats.noShow,
        color: "#3b82f6",
      },
    ].filter((i) => i.value > 0);
  }, [stats]);

  // Dynamic AI Insights
  const aiInsights = useMemo(() => {
    const insights = [];

    // 1. Peak Time Optimization
    if (busyHours.length > 0) {
      const peakHour = busyHours.reduce((max, curr) =>
        curr.bookings > max.bookings ? curr : max
        , busyHours[0]);

      if (peakHour.bookings > 0) {
        insights.push({
          type: "opportunity",
          title: "Peak Time Optimization",
          description: `High demand observed around ${peakHour.hour}. Consider optimizing staff availability during this time.`,
          impact: "high",
        });
      }
    }

    // 2. Cancellation Alert
    if (stats.cancellationRate > 15) {
      insights.push({
        type: "warning",
        title: "High Cancellation Rate",
        description: `Cancellation rate is ${stats.cancellationRate.toFixed(1)}%. Consider sending reminders earlier or requiring deposits.`,
        impact: "high",
      });
    } else if (stats.cancellationRate > 5) {
      insights.push({
        type: "warning",
        title: "Cancellation Alert",
        description: `Cancellation rate is ${stats.cancellationRate.toFixed(1)}%. Monitor this trend.`,
        impact: "medium",
      });
    }

    // 3. Service Performance
    if (bookingsByService.length > 0) {
      const topService = bookingsByService[0];
      insights.push({
        type: "success",
        title: "Top Performing Service",
        description: `"${topService.name}" is your most popular service with ${topService.value} bookings.`,
        impact: "high",
      });
    }

    // 4. Growth Insight (if we had previous data, but we can use total bookings as a proxy for activity)
    if (stats.total > 0) {
      insights.push({
        type: "info",
        title: "Booking Activity",
        description: `You have managed ${stats.total} bookings in this period.`,
        impact: "medium",
      });
    }

    return insights.slice(0, 3); // Show top 3 insights
  }, [busyHours, stats, bookingsByService]);

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <Award className="h-4 w-4 text-green-500" />;
      default:
        return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Operational Analysis
          </h1>
          <p className="text-muted-foreground">
            360° view of your business operations and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => fetchBookings()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <StatsGrid columns={4}>
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={Calendar}
          trend={{
            value: `${stats.growth > 0 ? "+" : ""}${stats.growth.toFixed(1)}%`,
            isPositive: stats.growth >= 0
          }}
          subtitle="in selected period"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          icon={CheckCircle}
          variant="success"
          subtitle={`${stats.completed} completed`}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${stats.cancellationRate.toFixed(1)}%`}
          icon={XCircle}
          variant="danger"
          subtitle={`${stats.cancelled} cancelled`}
        />
        <StatCard
          title="New Clients"
          value={stats.newClients}
          icon={Users}
          variant="info"
          subtitle="in selected period"
        />
      </StatsGrid>

      {/* AI Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        {aiInsights.map((insight, i) => (
          <Card key={i} className={`border ${getInsightColor(insight.type)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div>
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services Performance</TabsTrigger>
          {plan === "business" && (
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AI Operational Insights */}
          <AIOperationalInsights bookings={filteredBookings} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Busy Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Busy Hours</CardTitle>
                <CardDescription>
                  Booking distribution by hour of day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={busyHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="bookings"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>
                  Distribution of booking outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of service metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Bookings</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">
                      Completion Rate
                    </TableHead>
                    <TableHead className="text-right">Avg Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceStats.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell className="text-right">
                        {service.total}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.completed}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.total > 0
                          ? ((service.completed / service.total) * 100).toFixed(
                            1
                          )
                          : 0}
                        %
                      </TableCell>
                      <TableCell className="text-right">
                        {service.duration} min
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {plan === "business" && (
          <TabsContent value="professionals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Professional Performance</CardTitle>
                  <CardDescription>
                    Operational metrics per professional
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/financial-reports")}
                >
                  View Financial Performance
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professional</TableHead>
                      <TableHead className="text-right">
                        Total Bookings
                      </TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Cancelled</TableHead>
                      <TableHead className="text-right">
                        Completion Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionalStats.map((prof) => (
                      <TableRow key={prof.name}>
                        <TableCell className="font-medium">
                          {prof.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {prof.total}
                        </TableCell>
                        <TableCell className="text-right">
                          {prof.completed}
                        </TableCell>
                        <TableCell className="text-right">
                          {prof.cancelled}
                        </TableCell>
                        <TableCell className="text-right">
                          {prof.total > 0
                            ? ((prof.completed / prof.total) * 100).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
