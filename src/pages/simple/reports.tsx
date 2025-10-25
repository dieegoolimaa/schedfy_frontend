import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  TrendingDown,
  Calendar,
  Euro,
  Users,
  BarChart3,
  Download,
  Star,
  Award,
} from "lucide-react";

export function SimpleReportsPage() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("month");

  // Mock data for Simple Plan - basic metrics only
  const monthlyData = [
    { month: "Jan", bookings: 45, revenue: 1350, clients: 28 },
    { month: "Feb", bookings: 52, revenue: 1560, clients: 31 },
    { month: "Mar", bookings: 38, revenue: 1140, clients: 25 },
    { month: "Apr", bookings: 61, revenue: 1830, clients: 37 },
    { month: "May", bookings: 58, revenue: 1740, clients: 34 },
    { month: "Jun", bookings: 67, revenue: 2010, clients: 42 },
  ];

  const serviceData = [
    { name: "Haircut", bookings: 125, revenue: 3750, percentage: 35 },
    { name: "Styling", bookings: 89, revenue: 2670, percentage: 25 },
    { name: "Coloring", bookings: 76, revenue: 6080, percentage: 22 },
    { name: "Beard Trim", bookings: 45, revenue: 675, percentage: 13 },
    { name: "Other", bookings: 18, revenue: 450, percentage: 5 },
  ];

  const pieColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  const recentBookings = [
    {
      id: 1,
      client: "Ana Silva",
      service: "Haircut & Styling",
      date: "2024-01-20",
      amount: 35,
      status: "completed",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Beard Trim",
      date: "2024-01-20",
      amount: 15,
      status: "completed",
    },
    {
      id: 3,
      client: "Maria Oliveira",
      service: "Hair Coloring",
      date: "2024-01-19",
      amount: 85,
      status: "completed",
    },
    {
      id: 4,
      client: "Pedro Costa",
      service: "Haircut",
      date: "2024-01-19",
      amount: 25,
      status: "completed",
    },
    {
      id: 5,
      client: "Luisa Fernandes",
      service: "Styling",
      date: "2024-01-18",
      amount: 30,
      status: "completed",
    },
  ];

  const currentStats = {
    totalBookings: 321,
    totalRevenue: 13635,
    totalClients: 197,
    averageBookingValue: 42.5,
    thisMonth: {
      bookings: 67,
      revenue: 2010,
      clients: 42,
      growth: {
        bookings: 12.5,
        revenue: 8.3,
        clients: 15.2,
      },
    },
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold">
                  {currentStats.totalBookings}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{currentStats.thisMonth.growth.bookings}%
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
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  €{currentStats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{currentStats.thisMonth.growth.revenue}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
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
                <p className="text-2xl font-bold">
                  {currentStats.totalClients}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600">
                    +{currentStats.thisMonth.growth.clients}%
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Booking Value
                </p>
                <p className="text-2xl font-bold">
                  €{currentStats.averageBookingValue}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-600">-2.1%</span>
                  <span className="text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
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
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue over the last 6 months
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
                      dataKey="revenue"
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
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg. Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceData.map((service) => (
                      <TableRow key={service.name}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>
                          €{service.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          €{(service.revenue / service.bookings).toFixed(2)}
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.client}
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>
                        {new Date(booking.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>€{booking.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(booking.status)}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
