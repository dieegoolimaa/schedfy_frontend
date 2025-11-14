import { useState } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Download,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function IndividualReportsPage() {
  const { formatCurrency } = useCurrency();
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data for Individual plan with AI insights
  const stats = {
    totalRevenue: 2850,
    revenueGrowth: 15.2,
    totalBookings: 47,
    bookingsGrowth: 8.5,
    newClients: 12,
    clientsGrowth: 22.1,
    avgBookingValue: 60.6,
    avgValueGrowth: 6.2,
    clientRetention: 78.5,
    retentionGrowth: 5.3,
    completionRate: 94.7,
    noShowRate: 5.3,
  };

  const servicePerformance = [
    {
      service: "Hair Coloring",
      bookings: 18,
      revenue: 1260,
      avgPrice: 70,
      growth: 12.5,
    },
    {
      service: "Haircut & Styling",
      bookings: 15,
      revenue: 675,
      avgPrice: 45,
      growth: 8.2,
    },
    {
      service: "Hair Treatment",
      bookings: 8,
      revenue: 520,
      avgPrice: 65,
      growth: 22.1,
    },
    {
      service: "Wedding Styling",
      bookings: 4,
      revenue: 320,
      avgPrice: 80,
      growth: 35,
    },
    {
      service: "Color Correction",
      bookings: 2,
      revenue: 240,
      avgPrice: 120,
      growth: -10.5,
    },
  ];

  const topClients = [
    {
      name: "Ana Silva",
      visits: 6,
      revenue: 420,
      lastVisit: "2024-01-18",
      satisfaction: 5,
    },
    {
      name: "Maria Santos",
      visits: 5,
      revenue: 315,
      lastVisit: "2024-01-16",
      satisfaction: 5,
    },
    {
      name: "Carla Oliveira",
      visits: 4,
      revenue: 380,
      lastVisit: "2024-01-15",
      satisfaction: 4,
    },
    {
      name: "João Costa",
      visits: 3,
      revenue: 195,
      lastVisit: "2024-01-12",
      satisfaction: 5,
    },
  ];

  const revenueByDay = [
    { day: "Monday", revenue: 285, bookings: 5 },
    { day: "Tuesday", revenue: 420, bookings: 7 },
    { day: "Wednesday", revenue: 315, bookings: 6 },
    { day: "Thursday", revenue: 380, bookings: 8 },
    { day: "Friday", revenue: 525, bookings: 9 },
    { day: "Saturday", revenue: 680, bookings: 12 },
    { day: "Sunday", revenue: 245, bookings: 4 },
  ];

  const aiInsights = [
    {
      type: "success",
      title: "Peak Performance Day",
      description:
        "Saturdays generate 24% of weekly revenue with highest client satisfaction.",
      recommendation: "Consider premium Saturday pricing",
      impact: "High",
    },
    {
      type: "opportunity",
      title: "Service Expansion",
      description:
        "Hair treatments show 22% growth and 85% client satisfaction.",
      recommendation: "Promote treatment packages to existing clients",
      impact: "Medium",
    },
    {
      type: "warning",
      title: "No-Show Pattern",
      description: "Monday appointments have 12% higher no-show rate.",
      recommendation: "Send extra reminders for Monday bookings",
      impact: "Low",
    },
    {
      type: "info",
      title: "Client Loyalty",
      description: "Top 4 clients account for 47% of total revenue.",
      recommendation: "Implement VIP loyalty program",
      impact: "High",
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "opportunity":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Reports
          </h1>
          <p className="text-muted-foreground">
            Analytics and insights with AI recommendations • Individual Plan
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
            </SelectContent>
          </Select>
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

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">
              AI Business Intelligence
            </CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Automated insights to grow your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.slice(0, 2).map((insight) => (
              <div
                key={insight.title}
                className={`p-4 rounded-lg border ${getInsightColor(
                  insight.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    <div className="text-xs font-medium mt-2 text-blue-600">
                      💡 {insight.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${stats.revenueGrowth > 0 ? "+" : ""}${
            stats.revenueGrowth
          }% growth`}
          color="blue"
        />
        <MobileStatsCard
          title="Bookings"
          value={stats.totalBookings}
          subtitle={`${stats.bookingsGrowth > 0 ? "+" : ""}${
            stats.bookingsGrowth
          }% growth`}
          color="green"
        />
        <MobileStatsCard
          title="New Clients"
          value={stats.newClients}
          subtitle={`${stats.clientsGrowth > 0 ? "+" : ""}${
            stats.clientsGrowth
          }% growth`}
          color="purple"
        />
        <MobileStatsCard
          title="Avg. Value"
          value={formatCurrency(stats.avgBookingValue)}
          subtitle={`${stats.avgValueGrowth > 0 ? "+" : ""}${
            stats.avgValueGrowth
          }% growth`}
          color="yellow"
        />
        <MobileStatsCard
          title="Retention"
          value={`${stats.clientRetention}%`}
          subtitle={`${stats.retentionGrowth > 0 ? "+" : ""}${
            stats.retentionGrowth
          }% growth`}
          color="blue"
        />
        <MobileStatsCard
          title="Completion"
          value={`${stats.completionRate}%`}
          subtitle="Success rate"
          color="green"
        />
      </ResponsiveCardGrid>

      {/* Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Service Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="clients">Top Clients</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Service Performance */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of service popularity and profitability
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
                    <TableHead>Growth</TableHead>
                    <TableHead>Performance</TableHead>
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
                      <TableCell>{formatCurrency(service.avgPrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getGrowthIcon(service.growth)}
                          <span
                            className={`ml-1 font-medium ${getGrowthColor(
                              service.growth
                            )}`}
                          >
                            {service.growth > 0 ? "+" : ""}
                            {service.growth}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={(() => {
                            if (service.growth > 15)
                              return "bg-green-100 text-green-800";
                            if (service.growth > 0)
                              return "bg-blue-100 text-blue-800";
                            return "bg-yellow-100 text-yellow-800";
                          })()}
                        >
                          {(() => {
                            if (service.growth > 15) return "Excellent";
                            if (service.growth > 0) return "Good";
                            return "Needs Attention";
                          })()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analysis */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Day of Week</CardTitle>
              <CardDescription>
                Understanding your busiest and most profitable days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Avg. per Booking</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueByDay.map((day) => {
                    const avgPerBooking = day.revenue / day.bookings;
                    const maxRevenue = Math.max(
                      ...revenueByDay.map((d) => d.revenue)
                    );
                    const performance = (day.revenue / maxRevenue) * 100;

                    return (
                      <TableRow key={day.day}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        <TableCell>{formatCurrency(day.revenue)}</TableCell>
                        <TableCell>{day.bookings}</TableCell>
                        <TableCell>{formatCurrency(avgPerBooking)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={performance} className="w-20" />
                            <span className="text-sm">
                              {performance.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Clients */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>
                Your most valuable clients and their preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. per Visit</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Satisfaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client.name}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.visits}</TableCell>
                      <TableCell>{formatCurrency(client.revenue)}</TableCell>
                      <TableCell>
                        {formatCurrency(client.revenue / client.visits)}
                      </TableCell>
                      <TableCell>
                        {new Date(client.lastVisit).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{client.satisfaction}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights">
          <div className="grid gap-6 lg:grid-cols-2">
            {aiInsights.map((insight) => (
              <Card
                key={insight.title}
                className={`border ${getInsightColor(insight.type)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <p className="text-muted-foreground mt-2">
                        {insight.description}
                      </p>
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <p className="text-sm font-medium text-blue-600">
                          💡 Recommendation: {insight.recommendation}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Badge
                          variant="outline"
                          className={(() => {
                            if (insight.impact === "High")
                              return "bg-red-100 text-red-800";
                            if (insight.impact === "Medium")
                              return "bg-yellow-100 text-yellow-800";
                            return "bg-green-100 text-green-800";
                          })()}
                        >
                          {insight.impact.toUpperCase()} IMPACT
                        </Badge>
                        <Button variant="outline" size="sm">
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
