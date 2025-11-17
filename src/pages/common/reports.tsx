import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useCurrency } from "../../hooks/useCurrency";
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
import { Progress } from "../../components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Download,
  Star,
  CheckCircle,
  DollarSign,
  Target,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "../../components/ui/stat-card";
import { StatsGrid } from "../../components/ui/stats-grid";
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";

/**
 * Unified Reports Page - Adapts to user's plan (Simple, Individual, Business)
 * Consolidates all report variations into a single adaptive component
 */
export default function UnifiedReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const entityId = user?.entityId || user?.id || "";
  const plan = user?.plan || "simple";

  const [dateRange, setDateRange] = useState(
    plan === "business" ? "last-30-days" : "month"
  );
  const [timeRange, setTimeRange] = useState("30d");

  const { bookings } = useBookings({ entityId, autoFetch: true });

  // Calculate stats
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalCompleted = bookings.filter((b) => b.status === "completed").length;
    const uniqueClients = new Set(bookings.map((b) => b.clientId).filter(Boolean));
    const totalClients = uniqueClients.size;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = bookings.filter(
      (b) => new Date(b.createdAt) >= thisMonthStart
    );
    const thisMonthCompleted = thisMonthBookings.filter((b) => b.status === "completed").length;
    const thisMonthClients = new Set(thisMonthBookings.map((b) => b.clientId).filter(Boolean)).size;

    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0);

    const thisMonthRevenue = thisMonthBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0);

    return {
      totalBookings,
      totalCompleted,
      totalClients,
      thisMonthBookings: thisMonthBookings.length,
      thisMonthCompleted,
      thisMonthClients,
      totalRevenue,
      thisMonthRevenue,
      revenueGrowth: 15.2,
      bookingsGrowth: 8.5,
      clientsGrowth: 22.1,
      avgBookingValue: totalCompleted > 0 ? totalRevenue / totalCompleted : 0,
      avgValueGrowth: 6.2,
      clientRetention: 78.5,
      retentionGrowth: 5.3,
      completionRate: totalBookings > 0 ? (totalCompleted / totalBookings) * 100 : 0,
      noShowRate: 5.3,
    };
  }, [bookings]);

  // Service performance
  const servicePerformance = useMemo(() => {
    const serviceStats = new Map();
    bookings.forEach((booking) => {
      const serviceName = booking.service?.name || "Unknown";
      const current = serviceStats.get(serviceName) || { bookings: 0, revenue: 0 };
      serviceStats.set(serviceName, {
        bookings: current.bookings + 1,
        revenue: current.revenue + (booking.pricing?.totalPrice || 0),
      });
    });

    return Array.from(serviceStats.entries())
      .map(([service, stats]) => ({
        service,
        bookings: stats.bookings,
        revenue: stats.revenue,
        avgRating: 4.5,
        avgPrice: stats.revenue / stats.bookings,
        growth: 12.5,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [bookings]);

  // Monthly revenue data
  const revenueData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
        return bookingDate.getMonth() === month.monthIndex && bookingDate.getFullYear() === month.year;
      });

      const completedBookings = monthBookings.filter((b) => b.status === "completed");
      const revenue = completedBookings.reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0);
      const clientIds = new Set(monthBookings.map((b) => b.clientId));

      return {
        month: month.month,
        revenue,
        appointments: monthBookings.length,
        newClients: clientIds.size,
      };
    });
  }, [bookings]);

  // Revenue by day
  const revenueByDay = useMemo(() => {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const revenueMap = new Map();

    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex === 0 ? 6 : dayIndex - 1];
      const current = revenueMap.get(dayName) || { revenue: 0, bookings: 0 };
      revenueMap.set(dayName, {
        revenue: current.revenue + (booking.pricing?.totalPrice || 0),
        bookings: current.bookings + 1,
      });
    });

    return dayNames.map((day) => ({
      day,
      revenue: revenueMap.get(day)?.revenue || 0,
      bookings: revenueMap.get(day)?.bookings || 0,
    }));
  }, [bookings]);

  // Top clients
  const topClients = useMemo(() => {
    const clientMap = new Map();

    bookings.forEach((booking) => {
      if (!booking.clientId) return;
      const current = clientMap.get(booking.clientId) || {
        name: booking.client?.name || "Unknown Client",
        visits: 0,
        revenue: 0,
        lastVisit: booking.startTime,
      };

      clientMap.set(booking.clientId, {
        ...current,
        visits: current.visits + 1,
        revenue: current.revenue + (booking.pricing?.totalPrice || 0),
        lastVisit: new Date(booking.startTime) > new Date(current.lastVisit) ? booking.startTime : current.lastVisit,
      });
    });

    return Array.from(clientMap.values())
      .map((client) => ({ ...client, satisfaction: 5 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [bookings]);

  // Appointment trends
  const appointmentTrends = useMemo(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const trends = dayNames.slice(1).concat([dayNames[0]]).map((day) => ({
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

  const aiInsights = [
    { type: "success", title: "Peak Performance Day", description: "Saturdays generate 24% of weekly revenue", recommendation: "Consider premium Saturday pricing", impact: "High" },
    { type: "opportunity", title: "Service Expansion", description: "Hair treatments show 22% growth", recommendation: "Promote treatment packages", impact: "Medium" },
    { type: "warning", title: "No-Show Pattern", description: "Monday appointments have 12% higher no-show rate", recommendation: "Send extra reminders", impact: "Low" },
    { type: "info", title: "Client Loyalty", description: "Top 4 clients account for 47% of revenue", recommendation: "Implement VIP program", impact: "High" },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "opportunity": return <Target className="h-4 w-4 text-blue-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200";
      case "opportunity": return "bg-blue-50 border-blue-200";
      case "warning": return "bg-yellow-50 border-yellow-200";
      default: return "bg-purple-50 border-purple-200";
    }
  };

  const getGrowthIcon = (growth: number) => growth > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  const getGrowthColor = (growth: number) => growth > 0 ? "text-green-600" : "text-red-600";

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalAppointments = revenueData.reduce((sum, month) => sum + month.appointments, 0);
  const totalNewClients = revenueData.reduce((sum, month) => sum + month.newClients, 0);
  const avgRating = servicePerformance.length > 0 ? servicePerformance.reduce((sum, s) => sum + s.avgRating, 0) / servicePerformance.length : 0;

  // SIMPLE PLAN
  if (plan === "simple") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("reports.title", "Reports & Analytics")}</h1>
            <p className="text-muted-foreground">{t("reports.subtitle", "Simple plan - Essential metrics")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonthBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.thisMonthCompleted} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonthClients}</div>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
              <Progress value={stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Top Services</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicePerformance.slice(0, 5).map((service, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{service.service}</TableCell>
                    <TableCell className="text-right">{service.bookings}</TableCell>
                    <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // INDIVIDUAL PLAN
  if (plan === "individual") {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("reports.title", "Reports & Analytics")}</h1>
            <p className="text-muted-foreground">{t("reports.subtitle", "Individual plan with AI Insights")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-purple-500" />AI Business Insights</CardTitle>
            <CardDescription>Personalized recommendations to grow your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {aiInsights.slice(0, 2).map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{insight.impact}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ResponsiveCardGrid>
          <MobileStatsCard title="Revenue" value={formatCurrency(stats.totalRevenue)} subtitle={`+${stats.revenueGrowth}% growth`} color="blue" />
          <MobileStatsCard title="Bookings" value={stats.totalBookings} subtitle={`+${stats.bookingsGrowth}% growth`} color="green" />
          <MobileStatsCard title="New Clients" value={stats.thisMonthClients} subtitle={`+${stats.clientsGrowth}% growth`} color="purple" />
          <MobileStatsCard title="Avg. Value" value={formatCurrency(stats.avgBookingValue)} subtitle={`+${stats.avgValueGrowth}% growth`} color="yellow" />
          <MobileStatsCard title="Retention" value={`${stats.clientRetention}%`} subtitle={`+${stats.retentionGrowth}% growth`} color="blue" />
          <MobileStatsCard title="Completion" value={`${stats.completionRate.toFixed(1)}%`} subtitle="Success rate" color="green" />
        </ResponsiveCardGrid>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader><CardTitle>Service Performance</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicePerformance.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{service.service}</TableCell>
                        <TableCell className="text-right">{service.bookings}</TableCell>
                        <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`flex items-center justify-end gap-1 ${getGrowthColor(service.growth)}`}>
                            {getGrowthIcon(service.growth)}
                            {service.growth.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader><CardTitle>Top Clients</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Visits</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-right">{client.visits}</TableCell>
                        <TableCell className="text-right">{formatCurrency(client.revenue)}</TableCell>
                        <TableCell className="text-right">{new Date(client.lastVisit).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-4">
              {aiInsights.map((insight, index) => (
                <Card key={index} className={`${getInsightColor(insight.type)} border`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {getInsightIcon(insight.type)}
                      {insight.title}
                      <Badge variant="outline" className="ml-auto">{insight.impact} Impact</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Recommendation:</span>
                      <span className="text-sm">{insight.recommendation}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader><CardTitle>Revenue by Day</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // BUSINESS PLAN
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title", "Advanced Reports & Analytics")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle", "Business plan - Complete analytics suite")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
              <SelectItem value="last-90-days">Last 90 days</SelectItem>
              <SelectItem value="last-12-months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <StatsGrid columns={4}>
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} trend={{ value: "+12.5%", isPositive: true }} subtitle="from last period" />
        <StatCard title="Total Appointments" value={totalAppointments} icon={Calendar} trend={{ value: "+8.2%", isPositive: true }} subtitle="from last period" variant="info" />
        <StatCard title="New Clients" value={totalNewClients} icon={Users} trend={{ value: "+15.3%", isPositive: true }} subtitle="from last period" variant="success" />
        <StatCard title="Average Rating" value={avgRating.toFixed(1)} icon={Star} trend={{ value: "-0.1", isPositive: false }} subtitle="from last period" variant="warning" />
      </StatsGrid>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="border-b overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Appointments by Month</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="appointments" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader><CardTitle>Service Performance</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Avg Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePerformance.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{service.service}</TableCell>
                      <TableCell className="text-right">{service.bookings}</TableCell>
                      <TableCell className="text-right">{formatCurrency(service.revenue)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {service.avgRating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader><CardTitle>Appointment Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="morning" fill="#8884d8" name="Morning" />
                  <Bar dataKey="afternoon" fill="#82ca9d" name="Afternoon" />
                  <Bar dataKey="evening" fill="#ffc658" name="Evening" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
