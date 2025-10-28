import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
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
import {
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
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Users,
  Download,
  Star,
  Award,
  CheckCircle,
} from "lucide-react";

export function SimpleReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";
  const [dateRange, setDateRange] = useState("month");

  const { bookings } = useBookings({ entityId, autoFetch: true });

  // Calculate real stats from bookings data
  const stats = useMemo(() => {
    // Total stats
    const totalBookings = bookings.length;
    const totalCompleted = bookings.filter(
      (b) => b.status === "completed"
    ).length;

    // Get unique clients
    const uniqueClients = new Set(
      bookings.map((b) => b.clientId).filter(Boolean)
    );
    const totalClients = uniqueClients.size;

    // This month stats
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = bookings.filter(
      (b) => new Date(b.createdAt) >= thisMonthStart
    );
    const thisMonthCompleted = thisMonthBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const thisMonthClients = new Set(
      thisMonthBookings.map((b) => b.clientId).filter(Boolean)
    ).size;

    // Last month for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthBookings = bookings.filter((b) => {
      const date = new Date(b.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthCompleted = lastMonthBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const lastMonthClients = new Set(
      lastMonthBookings.map((b) => b.clientId).filter(Boolean)
    ).size;

    // Calculate growth percentages
    const bookingsGrowth =
      lastMonthBookings.length > 0
        ? ((thisMonthBookings.length - lastMonthBookings.length) /
            lastMonthBookings.length) *
          100
        : 0;
    const completedGrowth =
      lastMonthCompleted > 0
        ? ((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) * 100
        : 0;
    const clientsGrowth =
      lastMonthClients > 0
        ? ((thisMonthClients - lastMonthClients) / lastMonthClients) * 100
        : 0;

    return {
      totalBookings,
      totalCompleted,
      totalClients,
      thisMonth: {
        bookings: thisMonthBookings.length,
        completed: thisMonthCompleted,
        clients: thisMonthClients,
        growth: {
          bookings: bookingsGrowth,
          completed: completedGrowth,
          clients: clientsGrowth,
        },
      },
    };
  }, [bookings]);

  // Calculate monthly data for charts (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthBookings = bookings.filter((b) => {
        const date = new Date(b.createdAt);
        return date >= monthDate && date <= monthEnd;
      });

      const completed = monthBookings.filter(
        (b) => b.status === "completed"
      ).length;
      const clients = new Set(
        monthBookings.map((b) => b.clientId).filter(Boolean)
      ).size;

      months.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        bookings: monthBookings.length,
        completed,
        clients,
      });
    }

    return months;
  }, [bookings]);

  // Calculate service distribution
  const serviceData = useMemo(() => {
    const serviceMap = new Map<
      string,
      { bookings: number; completed: number }
    >();

    bookings.forEach((booking) => {
      const serviceName = booking.service?.name || "Other";
      const existing = serviceMap.get(serviceName) || {
        bookings: 0,
        completed: 0,
      };
      existing.bookings++;
      if (booking.status === "completed") {
        existing.completed++;
      }
      serviceMap.set(serviceName, existing);
    });

    const total = bookings.length || 1;
    return Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        bookings: data.bookings,
        completed: data.completed,
        percentage: Math.round((data.bookings / total) * 100),
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5); // Top 5 services
  }, [bookings]);

  // Recent bookings (last 5 completed)
  const recentBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  const pieColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("reports.title", "Reports")}
          </h1>
          <p className="text-muted-foreground">
            {t("reports.subtitle", "Simple business insights and metrics")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{stats.thisMonth.growth.bookings.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Sessions
                </p>
                <p className="text-2xl font-bold">
                  {stats.totalCompleted.toLocaleString()}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{stats.thisMonth.growth.completed.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{stats.thisMonth.growth.clients.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="upgrade">
            <Star className="h-4 w-4 mr-1" />
            Upgrade
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Bookings</CardTitle>
                <CardDescription>
                  Number of bookings over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Completion Trend</CardTitle>
                <CardDescription>
                  Monthly booking completion rate over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>
                  Breakdown of bookings by service type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {serviceData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of each service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceData.map((service) => (
                      <TableRow key={service.name}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>{service.completed}</TableCell>
                        <TableCell>
                          {(
                            (service.completed / service.bookings) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest completed appointments and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No completed bookings yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.client?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {booking.service?.name || "Unknown Service"}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(booking.status)}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Unlock Advanced Analytics
              </CardTitle>
              <CardDescription>
                Upgrade to Individual or Business plan for more detailed
                insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Individual Plan Features
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                      Advanced calendar insights
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                      Client behavior analysis
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                      Revenue forecasting
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                      Custom date ranges
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                      AI-powered insights
                    </li>
                  </ul>
                  <Button className="w-full">
                    Upgrade to Individual - €19.99/month
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Business Plan Features
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                      Everything in Individual
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                      Multi-professional analytics
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                      Performance comparisons
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                      Advanced reporting
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                      Export to Excel/PDF
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Upgrade to Business - €49.99/month
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  💡 <strong>Current Plan:</strong> Simple Plan - Perfect for
                  getting started with basic reporting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
