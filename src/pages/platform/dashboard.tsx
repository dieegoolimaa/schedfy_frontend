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
import { Progress } from "../../components/ui/progress";
import {
  AreaChart,
  Area,
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
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Globe,
  Brain,
  CreditCard,
  MessageSquare,
  Settings,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export function PlatformDashboardPage() {
  const { t } = useTranslation();

  // Mock data for platform metrics
  const platformMetrics = {
    totalEntities: 1247,
    activeEntities: 1156,
    totalUsers: 8934,
    activeUsers: 7821,
    monthlyRevenue: 87430,
    yearlyRevenue: 924680,
    openTickets: 23,
    aiInsightsUsers: 342,
    currency: "EUR",
  };

  const revenueData = [
    { month: "Jan", subscriptions: 78450, aiInsights: 12340, total: 90790 },
    { month: "Feb", subscriptions: 82150, aiInsights: 13890, total: 96040 },
    { month: "Mar", subscriptions: 86230, aiInsights: 15670, total: 101900 },
    { month: "Apr", subscriptions: 83450, aiInsights: 14230, total: 97680 },
    { month: "May", subscriptions: 89120, aiInsights: 16780, total: 105900 },
    { month: "Jun", subscriptions: 87430, aiInsights: 15340, total: 102770 },
  ];

  const planDistribution = [
    { name: "Simple", value: 45, count: 561, color: "#8884d8" },
    { name: "Individual", value: 35, count: 436, color: "#82ca9d" },
    { name: "Business", value: 20, count: 249, color: "#ffc658" },
  ];

  const regionDistribution = [
    { name: "Portugal", entities: 567, revenue: 34520, color: "#0088FE" },
    { name: "Brazil", entities: 421, revenue: 28940, color: "#00C49F" },
    { name: "USA", entities: 259, revenue: 24970, color: "#FFBB28" },
  ];

  const criticalAlerts = [
    {
      id: 1,
      type: "payment",
      message: "Multiple payment failures detected in BR region",
      severity: "high",
      timestamp: "2024-01-20T10:30:00Z",
    },
    {
      id: 2,
      type: "performance",
      message: "API response time increased by 15% in last hour",
      severity: "medium",
      timestamp: "2024-01-20T09:45:00Z",
    },
    {
      id: 3,
      type: "support",
      message: "Support ticket volume up 25% today",
      severity: "low",
      timestamp: "2024-01-20T08:20:00Z",
    },
  ];

  const recentTickets = [
    {
      id: "#TK-001",
      subject: "Payment processing issue",
      entity: "Beautiful Salon",
      priority: "high",
      status: "open",
      created: "2024-01-20T10:00:00Z",
    },
    {
      id: "#TK-002",
      subject: "Feature request: Custom fields",
      entity: "Hair Studio Pro",
      priority: "medium",
      status: "in_progress",
      created: "2024-01-20T09:30:00Z",
    },
    {
      id: "#TK-003",
      subject: "Account activation help",
      entity: "Wellness Center",
      priority: "low",
      status: "resolved",
      created: "2024-01-20T08:15:00Z",
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "performance":
        return <BarChart3 className="h-4 w-4" />;
      case "support":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800";
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("platform.dashboard.title", "Platform Dashboard")}
          </h1>
          <p className="text-base text-muted-foreground">
            {t(
              "platform.dashboard.subtitle",
              "Monitor and manage the Schedfy platform"
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            {t("common.settings", "Settings")}
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("platform.dashboard.reports", "View Reports")}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t("platform.dashboard.alerts", "Critical Alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border ${getAlertColor(alert.severity)} gap-3`}
                >
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("platform.metrics.totalEntities", "Total Entities")}
            </CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {platformMetrics.totalEntities.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12.5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("platform.metrics.activeUsers", "Active Users")}
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {platformMetrics.activeUsers.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+8.2%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("platform.metrics.monthlyRevenue", "Monthly Revenue")}
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              €{platformMetrics.monthlyRevenue.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+15.3%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("platform.metrics.aiInsights", "AI Insights Users")}
            </CardTitle>
            <Brain className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {platformMetrics.aiInsightsUsers}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+23.1%</span>
              <span>adoption rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              {t("platform.charts.revenue", "Revenue Overview")}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t(
                "platform.charts.revenueDesc",
                "Monthly revenue from subscriptions and AI insights"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `€${value.toLocaleString()}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="aiInsights"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("platform.charts.plans", "Plan Distribution")}
            </CardTitle>
            <CardDescription>
              {t(
                "platform.charts.plansDesc",
                "Distribution of entities across subscription plans"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              {t("platform.support.recentTickets", "Recent Support Tickets")}
            </CardTitle>
            <CardDescription>
              {platformMetrics.openTickets}{" "}
              {t("platform.support.openTickets", "open tickets")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.id} • {ticket.entity}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getTicketStatusColor(ticket.status)}
                  >
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              {t("platform.support.viewAll", "View All Tickets")}
            </Button>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              {t("platform.regional.title", "Regional Performance")}
            </CardTitle>
            <CardDescription>
              {t("platform.regional.desc", "Entities and revenue by region")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionDistribution.map((region) => (
                <div key={region.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{region.name}</span>
                    <span>€{region.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={
                        (region.entities / platformMetrics.totalEntities) * 100
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {region.entities} entities
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("platform.quickActions.title", "Quick Actions")}
          </CardTitle>
          <CardDescription>
            {t(
              "platform.quickActions.desc",
              "Shortcuts to common management tasks"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col space-y-2"
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm">
                {t("platform.actions.manageEntities", "Manage Entities")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col space-y-2"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">
                {t("platform.actions.manageUsers", "Manage Users")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col space-y-2"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">
                {t("platform.actions.subscriptions", "Subscriptions")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col space-y-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">
                {t("platform.actions.support", "Support")}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
