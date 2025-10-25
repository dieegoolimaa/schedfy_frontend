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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Euro,
  Clock,
  Star,
  Target,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Zap,
  Award,
  AlertTriangle,
} from "lucide-react";

export function DataAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  // Mock analytics data
  const overviewStats = {
    totalRevenue: 12450,
    revenueGrowth: 15.2,
    totalBookings: 287,
    bookingsGrowth: 8.5,
    newClients: 42,
    clientsGrowth: 22.1,
    avgBookingValue: 43.4,
    avgValueGrowth: 6.2,
    conversionRate: 68.5,
    conversionGrowth: -2.1,
    clientRetention: 84.2,
    retentionGrowth: 5.3,
  };

  const revenueByService = [
    { service: "Hair Coloring", revenue: 4200, bookings: 87, percentage: 33.7 },
    {
      service: "Haircut & Styling",
      revenue: 3150,
      bookings: 105,
      percentage: 25.3,
    },
    {
      service: "Hair Treatment",
      revenue: 2800,
      bookings: 56,
      percentage: 22.5,
    },
    {
      service: "Beard Services",
      revenue: 1350,
      bookings: 54,
      percentage: 10.8,
    },
    { service: "Nail Services", revenue: 950, bookings: 38, percentage: 7.6 },
  ];

  const topProfessionals = [
    {
      name: "Sofia Oliveira",
      revenue: 5200,
      bookings: 124,
      rating: 4.9,
      clientSatisfaction: 98,
      efficiency: 95,
    },
    {
      name: "Carlos Ferreira",
      revenue: 3800,
      bookings: 98,
      rating: 4.8,
      clientSatisfaction: 96,
      efficiency: 92,
    },
    {
      name: "Ana Costa",
      revenue: 2900,
      bookings: 87,
      rating: 4.7,
      clientSatisfaction: 94,
      efficiency: 88,
    },
    {
      name: "João Silva",
      revenue: 2200,
      bookings: 73,
      rating: 4.6,
      clientSatisfaction: 91,
      efficiency: 85,
    },
  ];

  const busyHours = [
    { hour: "09:00", bookings: 12, revenue: 480 },
    { hour: "10:00", bookings: 18, revenue: 720 },
    { hour: "11:00", bookings: 22, revenue: 880 },
    { hour: "12:00", bookings: 8, revenue: 320 },
    { hour: "13:00", bookings: 6, revenue: 240 },
    { hour: "14:00", bookings: 20, revenue: 800 },
    { hour: "15:00", bookings: 25, revenue: 1000 },
    { hour: "16:00", bookings: 24, revenue: 960 },
    { hour: "17:00", bookings: 19, revenue: 760 },
    { hour: "18:00", bookings: 15, revenue: 600 },
  ];

  const clientSegments = [
    {
      segment: "VIP Clients",
      count: 28,
      revenue: 4200,
      avgSpent: 150,
      retention: 95,
    },
    {
      segment: "Regular Clients",
      count: 89,
      revenue: 5680,
      avgSpent: 63.8,
      retention: 87,
    },
    {
      segment: "New Clients",
      count: 42,
      revenue: 1890,
      avgSpent: 45,
      retention: 65,
    },
    {
      segment: "Occasional Clients",
      count: 67,
      revenue: 1350,
      avgSpent: 20.1,
      retention: 45,
    },
  ];

  const aiInsights = [
    {
      type: "opportunity",
      title: "Peak Time Optimization",
      description:
        "Consider adding staff during 15:00-16:00 peak hours to reduce wait times.",
      impact: "high",
      metric: "+€890 potential monthly revenue",
    },
    {
      type: "warning",
      title: "Client Retention Alert",
      description:
        "12 regular clients haven't booked in 45+ days. Send re-engagement offers.",
      impact: "medium",
      metric: "€1,200 at-risk revenue",
    },
    {
      type: "success",
      title: "Service Performance",
      description:
        "Hair Coloring services show 23% higher profit margins than average.",
      impact: "high",
      metric: "+€340 monthly profit",
    },
    {
      type: "info",
      title: "Seasonal Trend",
      description:
        "Wedding season approaching - hair styling bookings typically increase 40%.",
      impact: "medium",
      metric: "Plan for +15 weekly bookings",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Analytics</h1>
          <p className="text-muted-foreground">
            Business intelligence and performance insights
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

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">
              AI-Powered Insights
            </CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Automated analysis reveals key opportunities and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.slice(0, 2).map((insight) => (
              <div
                key={insight.title}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    <div className="text-xs font-medium mt-2 text-blue-600">
                      {insight.metric}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Revenue
                </p>
                <div className="text-2xl font-bold">
                  €{overviewStats.totalRevenue.toLocaleString()}
                </div>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.revenueGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.revenueGrowth)}`}
              >
                {overviewStats.revenueGrowth > 0 ? "+" : ""}
                {overviewStats.revenueGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bookings
                </p>
                <div className="text-2xl font-bold">
                  {overviewStats.totalBookings}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.bookingsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.bookingsGrowth)}`}
              >
                {overviewStats.bookingsGrowth > 0 ? "+" : ""}
                {overviewStats.bookingsGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  New Clients
                </p>
                <div className="text-2xl font-bold">
                  {overviewStats.newClients}
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.clientsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.clientsGrowth)}`}
              >
                {overviewStats.clientsGrowth > 0 ? "+" : ""}
                {overviewStats.clientsGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Value
                </p>
                <div className="text-2xl font-bold">
                  €{overviewStats.avgBookingValue}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.avgValueGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.avgValueGrowth)}`}
              >
                {overviewStats.avgValueGrowth > 0 ? "+" : ""}
                {overviewStats.avgValueGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conversion
                </p>
                <div className="text-2xl font-bold">
                  {overviewStats.conversionRate}%
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.conversionGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.conversionGrowth)}`}
              >
                {overviewStats.conversionGrowth > 0 ? "+" : ""}
                {overviewStats.conversionGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Retention
                </p>
                <div className="text-2xl font-bold">
                  {overviewStats.clientRetention}%
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(overviewStats.retentionGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(overviewStats.retentionGrowth)}`}
              >
                {overviewStats.retentionGrowth > 0 ? "+" : ""}
                {overviewStats.retentionGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="professionals">Professionals</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="clients">Client Segments</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Service Performance */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Analysis</CardTitle>
              <CardDescription>
                Revenue breakdown and profitability by service type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Avg. Value</TableHead>
                    <TableHead>Market Share</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueByService.map((service) => (
                    <TableRow key={service.service}>
                      <TableCell className="font-medium">
                        {service.service}
                      </TableCell>
                      <TableCell>€{service.revenue.toLocaleString()}</TableCell>
                      <TableCell>{service.bookings}</TableCell>
                      <TableCell>
                        €{(service.revenue / service.bookings).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={service.percentage}
                            className="w-20"
                          />
                          <span className="text-sm">{service.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            service.percentage > 25
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {service.percentage > 25 ? "High" : "Normal"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Performance */}
        <TabsContent value="professionals">
          <Card>
            <CardHeader>
              <CardTitle>Professional Performance</CardTitle>
              <CardDescription>
                Individual performance metrics and client satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professional</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProfessionals.map((professional) => (
                    <TableRow key={professional.name}>
                      <TableCell className="font-medium">
                        {professional.name}
                      </TableCell>
                      <TableCell>
                        €{professional.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{professional.bookings}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {professional.rating}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={professional.clientSatisfaction}
                            className="w-16"
                          />
                          <span className="text-sm">
                            {professional.clientSatisfaction}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={professional.efficiency}
                            className="w-16"
                          />
                          <span className="text-sm">
                            {professional.efficiency}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Analysis */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>
                Booking patterns and revenue distribution by time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. Value</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busyHours.map((hour) => {
                    const maxBookings = Math.max(
                      ...busyHours.map((h) => h.bookings)
                    );
                    const utilization = (hour.bookings / maxBookings) * 100;

                    const getUtilizationColor = () => {
                      if (utilization > 80) return "bg-red-100 text-red-800";
                      if (utilization > 60)
                        return "bg-green-100 text-green-800";
                      return "bg-blue-100 text-blue-800";
                    };

                    const getUtilizationText = () => {
                      if (utilization > 80) return "Busy";
                      if (utilization > 60) return "Optimal";
                      return "Available";
                    };

                    return (
                      <TableRow key={hour.hour}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {hour.hour}
                          </div>
                        </TableCell>
                        <TableCell>{hour.bookings}</TableCell>
                        <TableCell>€{hour.revenue}</TableCell>
                        <TableCell>
                          €{(hour.revenue / hour.bookings).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={utilization} className="w-20" />
                            <span className="text-sm">
                              {utilization.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getUtilizationColor()}
                          >
                            {getUtilizationText()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Segments */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Segmentation</CardTitle>
              <CardDescription>
                Client behavior analysis and lifetime value metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. Spent</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>LTV Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientSegments.map((segment) => (
                    <TableRow key={segment.segment}>
                      <TableCell className="font-medium">
                        {segment.segment}
                      </TableCell>
                      <TableCell>{segment.count}</TableCell>
                      <TableCell>€{segment.revenue.toLocaleString()}</TableCell>
                      <TableCell>€{segment.avgSpent}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={segment.retention}
                            className="w-16"
                          />
                          <span className="text-sm">{segment.retention}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={(() => {
                            if (segment.retention > 90)
                              return "bg-purple-100 text-purple-800";
                            if (segment.retention > 80)
                              return "bg-green-100 text-green-800";
                            if (segment.retention > 60)
                              return "bg-blue-100 text-blue-800";
                            return "bg-yellow-100 text-yellow-800";
                          })()}
                        >
                          {(() => {
                            if (segment.retention > 90) return "Excellent";
                            if (segment.retention > 80) return "High";
                            if (segment.retention > 60) return "Medium";
                            return "Low";
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
                      <div className="flex items-center justify-between mt-4">
                        <Badge
                          variant="outline"
                          className={(() => {
                            if (insight.impact === "high")
                              return "bg-red-100 text-red-800";
                            if (insight.impact === "medium")
                              return "bg-yellow-100 text-yellow-800";
                            return "bg-blue-100 text-blue-800";
                          })()}
                        >
                          {insight.impact.toUpperCase()} IMPACT
                        </Badge>
                        <span className="text-sm font-medium text-blue-600">
                          {insight.metric}
                        </span>
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
