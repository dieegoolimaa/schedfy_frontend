import { useState } from "react";
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
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Calendar,
  Globe,
  Shield,
  Database,
  Server,
  Zap,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");

  // Mock platform statistics
  const platformStats = {
    totalBusinesses: 1847,
    businessesGrowth: 12.5,
    activeUsers: 5432,
    usersGrowth: 8.3,
    totalRevenue: 89420,
    revenueGrowth: 15.7,
    totalBookings: 12847,
    bookingsGrowth: 9.2,
    averageRevenue: 48.4,
    revenuePerBusiness: 48.4,
    churnRate: 3.2,
    supportTickets: 42,
  };

  const recentBusinesses = [
    {
      id: 1,
      name: "Bella Vista Salon",
      owner: "Sofia Oliveira",
      plan: "Business",
      status: "active",
      joinDate: "2024-01-20",
      revenue: 2450,
      region: "Portugal",
    },
    {
      id: 2,
      name: "Modern Cuts",
      owner: "Carlos Silva",
      plan: "Individual",
      status: "trial",
      joinDate: "2024-01-19",
      revenue: 890,
      region: "Brazil",
    },
    {
      id: 3,
      name: "Elite Barbershop",
      owner: "João Santos",
      plan: "Business",
      status: "active",
      joinDate: "2024-01-18",
      revenue: 3200,
      region: "United States",
    },
    {
      id: 4,
      name: "Style Studio",
      owner: "Ana Costa",
      plan: "Simple",
      status: "active",
      joinDate: "2024-01-17",
      revenue: 540,
      region: "Portugal",
    },
  ];

  const systemMetrics = [
    {
      metric: "Server Uptime",
      value: "99.9%",
      status: "excellent",
      icon: Server,
    },
    { metric: "API Response Time", value: "145ms", status: "good", icon: Zap },
    {
      metric: "Database Performance",
      value: "98.5%",
      status: "excellent",
      icon: Database,
    },
    {
      metric: "Security Score",
      value: "95%",
      status: "excellent",
      icon: Shield,
    },
  ];

  const regionStats = [
    { region: "Portugal", businesses: 892, revenue: 42350, growth: 15.2 },
    { region: "Brazil", businesses: 654, revenue: 28940, growth: 18.7 },
    { region: "United States", businesses: 301, revenue: 18130, growth: 22.1 },
  ];

  const planDistribution = [
    { plan: "Simple", count: 987, percentage: 53.4, revenue: 8769 },
    { plan: "Individual", count: 542, percentage: 29.3, revenue: 10830 },
    { plan: "Business", count: 318, percentage: 17.2, revenue: 15540 },
  ];

  const supportTickets = [
    {
      id: 1,
      title: "Payment processing issue",
      business: "Bella Vista Salon",
      priority: "high",
      status: "open",
      created: "2024-01-20T10:30:00Z",
      agent: "Maria Santos",
    },
    {
      id: 2,
      title: "Feature request: SMS notifications",
      business: "Modern Cuts",
      priority: "medium",
      status: "in-progress",
      created: "2024-01-20T09:15:00Z",
      agent: "Pedro Silva",
    },
    {
      id: 3,
      title: "Calendar integration help",
      business: "Elite Barbershop",
      priority: "low",
      status: "resolved",
      created: "2024-01-19T16:45:00Z",
      agent: "Ana Costa",
    },
  ];

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? "text-green-600" : "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSystemStatus = (status: string) => {
    switch (status) {
      case "excellent":
        return { color: "text-green-600", bg: "bg-green-100" };
      case "good":
        return { color: "text-blue-600", bg: "bg-blue-100" };
      case "warning":
        return { color: "text-yellow-600", bg: "bg-yellow-100" };
      case "critical":
        return { color: "text-red-600", bg: "bg-red-100" };
      default:
        return { color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Administration
          </h1>
          <p className="text-muted-foreground">
            Schedfy platform overview and management dashboard
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
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Businesses
                </p>
                <div className="text-2xl font-bold">
                  {platformStats.totalBusinesses.toLocaleString()}
                </div>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(platformStats.businessesGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(platformStats.businessesGrowth)}`}
              >
                +{platformStats.businessesGrowth}% this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <div className="text-2xl font-bold">
                  {platformStats.activeUsers.toLocaleString()}
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(platformStats.usersGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(platformStats.usersGrowth)}`}
              >
                +{platformStats.usersGrowth}% this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Platform Revenue
                </p>
                <div className="text-2xl font-bold">
                  €{platformStats.totalRevenue.toLocaleString()}
                </div>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(platformStats.revenueGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(platformStats.revenueGrowth)}`}
              >
                +{platformStats.revenueGrowth}% this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </p>
                <div className="text-2xl font-bold">
                  {platformStats.totalBookings.toLocaleString()}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(platformStats.bookingsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(platformStats.bookingsGrowth)}`}
              >
                +{platformStats.bookingsGrowth}% this month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health & Performance</CardTitle>
          <CardDescription>
            Real-time monitoring of platform infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric) => {
              const status = getSystemStatus(metric.status);
              const IconComponent = metric.icon;
              return (
                <div
                  key={metric.metric}
                  className="flex items-center space-x-3"
                >
                  <div className={`p-2 rounded-full ${status.bg}`}>
                    <IconComponent className={`h-4 w-4 ${status.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{metric.metric}</div>
                    <div className={`text-lg font-bold ${status.color}`}>
                      {metric.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="businesses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="plans">Plans & Revenue</TabsTrigger>
          <TabsTrigger value="regions">Regional Stats</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Recent Businesses */}
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Recent Business Registrations</CardTitle>
              <CardDescription>
                Latest businesses that joined the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">
                        {business.name}
                      </TableCell>
                      <TableCell>{business.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{business.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          {business.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        €{business.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(business.status)}
                        >
                          {business.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(business.joinDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans & Revenue */}
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans Distribution</CardTitle>
              <CardDescription>
                Revenue breakdown by subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Market Share</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Avg. Revenue per User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planDistribution.map((plan) => (
                    <TableRow key={plan.plan}>
                      <TableCell className="font-medium">{plan.plan}</TableCell>
                      <TableCell>{plan.count.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={plan.percentage} className="w-20" />
                          <span className="text-sm">{plan.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>€{plan.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        €{(plan.revenue / plan.count).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Statistics */}
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>
                Business distribution and performance by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Businesses</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. per Business</TableHead>
                    <TableHead>Growth Rate</TableHead>
                    <TableHead>Market Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionStats.map((region) => (
                    <TableRow key={region.region}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          {region.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        {region.businesses.toLocaleString()}
                      </TableCell>
                      <TableCell>€{region.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        €{(region.revenue / region.businesses).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getGrowthIcon(region.growth)}
                          <span
                            className={`ml-1 font-medium ${getGrowthColor(region.growth)}`}
                          >
                            +{region.growth}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Progress
                          value={
                            (region.businesses /
                              platformStats.totalBusinesses) *
                            100
                          }
                          className="w-20"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>
                Customer support requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>{ticket.business}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(ticket.priority)}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {(() => {
                            if (ticket.status === "resolved") {
                              return (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              );
                            } else if (ticket.status === "in-progress") {
                              return (
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              );
                            } else {
                              return (
                                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                              );
                            }
                          })()}
                          {ticket.status}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.agent}</TableCell>
                      <TableCell>
                        {new Date(ticket.created).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>
                Recent system events and administrative actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New business registration
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bella Vista Salon joined the platform (Business Plan)
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    2 minutes ago
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New subscription upgrade
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modern Cuts upgraded from Individual to Business Plan
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    12 minutes ago
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New business registration
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wellness Center joined the platform (Simple Plan)
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    28 minutes ago
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Euro className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New subscription</p>
                    <p className="text-xs text-muted-foreground">
                      Elite Barbershop started Individual Plan subscription
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    45 minutes ago
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New business registration
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estética Moderna joined the platform (Business Plan)
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    1 hour ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
