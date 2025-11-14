import { useState, useMemo } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { StatCard } from "../../components/ui/stat-card";
import { StatsGrid } from "../../components/ui/stats-grid";
import { Button } from "../../components/ui/button";
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
import { Calendar, Download, DollarSign, Users, Star } from "lucide-react";

export function ReportsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const [dateRange, setDateRange] = useState("last-30-days");

  // Fetch real data from API
  const { bookings } = useBookings({ entityId, autoFetch: true });

  // Calculate monthly revenue data from bookings
  const revenueData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const last12Months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last12Months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    return last12Months.map((month) => {
      const monthBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        return (
          bookingDate.getMonth() === month.monthIndex &&
          bookingDate.getFullYear() === month.year
        );
      });

      const completedBookings = monthBookings.filter(
        (b) => b.status === "completed"
      );
      const revenue = completedBookings.reduce(
        (sum, b) => sum + (b.pricing?.totalPrice || 0),
        0
      );

      // Count new clients (first booking in this month)
      const clientIds = new Set(monthBookings.map((b) => b.clientId));

      return {
        month: month.month,
        revenue,
        appointments: monthBookings.length,
        newClients: clientIds.size,
      };
    });
  }, [bookings]);

  // Calculate service performance from real bookings
  const servicePerformance = useMemo(() => {
    const serviceStats = new Map<
      string,
      { bookings: number; revenue: number; ratings: number[] }
    >();

    bookings.forEach((booking) => {
      const serviceName = booking.service?.name || "Unknown";
      const current = serviceStats.get(serviceName) || {
        bookings: 0,
        revenue: 0,
        ratings: [],
      };

      serviceStats.set(serviceName, {
        bookings: current.bookings + 1,
        revenue: current.revenue + (booking.pricing?.totalPrice || 0),
        ratings: current.ratings, // TODO: Add ratings when available
      });
    });

    return Array.from(serviceStats.entries())
      .map(([service, stats]) => ({
        service,
        bookings: stats.bookings,
        revenue: stats.revenue,
        avgRating: 4.5, // TODO: Calculate from real ratings
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [bookings]);

  // Client demographics - placeholder (would need client age data from API)
  const clientDemographics = [
    { age: "18-25", count: 0, percentage: 0 },
    { age: "26-35", count: 0, percentage: 0 },
    { age: "36-45", count: 0, percentage: 0 },
    { age: "46-55", count: 0, percentage: 0 },
    { age: "56+", count: 0, percentage: 0 },
  ];

  // Appointment trends by day and time from real bookings
  const appointmentTrends = useMemo(() => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const trends = dayNames
      .slice(1)
      .concat([dayNames[0]])
      .map((day) => ({
        day,
        morning: 0,
        afternoon: 0,
        evening: 0,
      }));

    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const dayIndex = date.getDay();
      const hour = date.getHours();
      const dayName = dayNames[dayIndex];

      const trend = trends.find((t) => t.day === dayName);
      if (trend) {
        if (hour < 12) trend.morning++;
        else if (hour < 18) trend.afternoon++;
        else trend.evening++;
      }
    });

    return trends;
  }, [bookings]);

  // Hourly bookings distribution
  const hourlyBookings = useMemo(() => {
    const hours = Array.from({ length: 10 }, (_, i) => ({
      hour: `${9 + i}:00`,
      bookings: 0,
    }));

    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const hour = date.getHours();
      if (hour >= 9 && hour < 19) {
        hours[hour - 9].bookings++;
      }
    });

    return hours;
  }, [bookings]);

  const pieChartColors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
  ];

  const totalRevenue = revenueData.reduce(
    (sum, month) => sum + month.revenue,
    0
  );
  const totalAppointments = revenueData.reduce(
    (sum, month) => sum + month.appointments,
    0
  );
  const totalNewClients = revenueData.reduce(
    (sum, month) => sum + month.newClients,
    0
  );
  const avgRating =
    servicePerformance.reduce((sum, service) => sum + service.avgRating, 0) /
    servicePerformance.length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("reports.title", "Reports")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "reports.subtitle",
                "Analytics and insights for your business"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-3-months">Last 3 months</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <StatsGrid columns={4}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            trend={{ value: "+12.5%", isPositive: true }}
            subtitle="from last period"
          />

          <StatCard
            title="Total Appointments"
            value={totalAppointments}
            icon={Calendar}
            trend={{ value: "+8.2%", isPositive: true }}
            subtitle="from last period"
            variant="info"
          />

          <StatCard
            title="New Clients"
            value={totalNewClients}
            icon={Users}
            trend={{ value: "+15.3%", isPositive: true }}
            subtitle="from last period"
            variant="success"
          />

          <StatCard
            title="Average Rating"
            value={avgRating.toFixed(1)}
            icon={Star}
            trend={{ value: "-0.1", isPositive: false }}
            subtitle="from last period"
            variant="warning"
          />
        </StatsGrid>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b overflow-x-auto">
            <TabsList className="w-full justify-start flex-nowrap h-auto p-0 bg-transparent inline-flex min-w-full">
              <TabsTrigger value="overview" className="whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="whitespace-nowrap">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="services" className="whitespace-nowrap">
                Services
              </TabsTrigger>
              <TabsTrigger value="clients" className="whitespace-nowrap">
                Clients
              </TabsTrigger>
              <TabsTrigger value="trends" className="whitespace-nowrap">
                Trends
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Monthly revenue over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Distribution</CardTitle>
                  <CardDescription>Appointments by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="morning" fill="#8884d8" name="Morning" />
                        <Bar
                          dataKey="afternoon"
                          fill="#82ca9d"
                          name="Afternoon"
                        />
                        <Bar dataKey="evening" fill="#ffc658" name="Evening" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue breakdown by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Appointments</CardTitle>
                  <CardDescription>
                    Correlation between revenue and appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          name="Revenue (€)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="appointments"
                          stroke="#82ca9d"
                          name="Appointments"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
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
                      <TableHead>Service</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Rating</TableHead>
                      <TableHead>Revenue per Booking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicePerformance.map((service) => (
                      <TableRow key={service.service}>
                        <TableCell className="font-medium">
                          {service.service}
                        </TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>{formatCurrency(service.revenue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {service.avgRating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(service.revenue / service.bookings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Demographics</CardTitle>
                  <CardDescription>
                    Age distribution of your clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientDemographics}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {clientDemographics.map((entry, index) => (
                            <Cell
                              key={entry.age}
                              fill={
                                pieChartColors[index % pieChartColors.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Clients Trend</CardTitle>
                  <CardDescription>
                    Monthly new client acquisition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="newClients"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Demographics Breakdown</CardTitle>
                <CardDescription>Detailed age group analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientDemographics.map((demo) => (
                    <div key={demo.age} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{demo.age} years</span>
                        <span className="text-sm text-muted-foreground">
                          {demo.count} clients ({demo.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${demo.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>Busiest times of the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyBookings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Patterns</CardTitle>
                  <CardDescription>Appointment patterns by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={appointmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="morning"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="afternoon"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                        <Area
                          type="monotone"
                          dataKey="evening"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
