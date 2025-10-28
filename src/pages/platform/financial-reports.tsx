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
import { Label } from "../../components/ui/label";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  RefreshCw,
  Filter,
  Activity,
} from "lucide-react";

interface FinancialData {
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  aiInsightsRevenue: number;
  refunds: number;
  netRevenue: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  activeSubscriptions: number;
}

interface RegionalFinancialData {
  region: string;
  currency: string;
  revenue: number;
  subscriptions: number;
  averageRevenuePerUser: number;
  growth: number;
}

interface PaymentMethodData {
  method: string;
  revenue: number;
  transactions: number;
  percentage: number;
}

export function FinancialReportsPage() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [dateRange, setDateRange] = useState("last_12_months");

  // Mock financial data
  const monthlyData: FinancialData[] = [
    {
      period: "2023-01",
      totalRevenue: 67850,
      subscriptionRevenue: 58200,
      aiInsightsRevenue: 9650,
      refunds: 1250,
      netRevenue: 66600,
      newSubscriptions: 145,
      churnedSubscriptions: 12,
      activeSubscriptions: 1023,
    },
    {
      period: "2023-02",
      totalRevenue: 72340,
      subscriptionRevenue: 61890,
      aiInsightsRevenue: 10450,
      refunds: 980,
      netRevenue: 71360,
      newSubscriptions: 158,
      churnedSubscriptions: 18,
      activeSubscriptions: 1163,
    },
    {
      period: "2023-03",
      totalRevenue: 78920,
      subscriptionRevenue: 67200,
      aiInsightsRevenue: 11720,
      refunds: 1120,
      netRevenue: 77800,
      newSubscriptions: 172,
      churnedSubscriptions: 15,
      activeSubscriptions: 1320,
    },
    {
      period: "2023-04",
      totalRevenue: 74680,
      subscriptionRevenue: 63950,
      aiInsightsRevenue: 10730,
      refunds: 1340,
      netRevenue: 73340,
      newSubscriptions: 148,
      churnedSubscriptions: 24,
      activeSubscriptions: 1444,
    },
    {
      period: "2023-05",
      totalRevenue: 81560,
      subscriptionRevenue: 69800,
      aiInsightsRevenue: 11760,
      refunds: 890,
      netRevenue: 80670,
      newSubscriptions: 189,
      churnedSubscriptions: 16,
      activeSubscriptions: 1617,
    },
    {
      period: "2023-06",
      totalRevenue: 87430,
      subscriptionRevenue: 74200,
      aiInsightsRevenue: 13230,
      refunds: 1150,
      netRevenue: 86280,
      newSubscriptions: 203,
      churnedSubscriptions: 19,
      activeSubscriptions: 1801,
    },
    {
      period: "2023-07",
      totalRevenue: 89650,
      subscriptionRevenue: 76100,
      aiInsightsRevenue: 13550,
      refunds: 980,
      netRevenue: 88670,
      newSubscriptions: 187,
      churnedSubscriptions: 22,
      activeSubscriptions: 1966,
    },
    {
      period: "2023-08",
      totalRevenue: 92840,
      subscriptionRevenue: 78900,
      aiInsightsRevenue: 13940,
      refunds: 1200,
      netRevenue: 91640,
      newSubscriptions: 194,
      churnedSubscriptions: 17,
      activeSubscriptions: 2143,
    },
    {
      period: "2023-09",
      totalRevenue: 95120,
      subscriptionRevenue: 80800,
      aiInsightsRevenue: 14320,
      refunds: 1080,
      netRevenue: 94040,
      newSubscriptions: 201,
      churnedSubscriptions: 21,
      activeSubscriptions: 2323,
    },
    {
      period: "2023-10",
      totalRevenue: 98760,
      subscriptionRevenue: 83900,
      aiInsightsRevenue: 14860,
      refunds: 1340,
      netRevenue: 97420,
      newSubscriptions: 218,
      churnedSubscriptions: 18,
      activeSubscriptions: 2523,
    },
    {
      period: "2023-11",
      totalRevenue: 102340,
      subscriptionRevenue: 86700,
      aiInsightsRevenue: 15640,
      refunds: 1190,
      netRevenue: 101150,
      newSubscriptions: 235,
      churnedSubscriptions: 23,
      activeSubscriptions: 2735,
    },
    {
      period: "2023-12",
      totalRevenue: 105890,
      subscriptionRevenue: 89500,
      aiInsightsRevenue: 16390,
      refunds: 1280,
      netRevenue: 104610,
      newSubscriptions: 247,
      churnedSubscriptions: 20,
      activeSubscriptions: 2962,
    },
  ];

  const regionalData: RegionalFinancialData[] = [
    {
      region: "Portugal",
      currency: "EUR",
      revenue: 52340,
      subscriptions: 1247,
      averageRevenuePerUser: 41.98,
      growth: 12.5,
    },
    {
      region: "Brazil",
      currency: "BRL",
      revenue: 31560,
      subscriptions: 856,
      averageRevenuePerUser: 36.87,
      growth: 18.3,
    },
    {
      region: "United States",
      currency: "USD",
      revenue: 21990,
      subscriptions: 459,
      averageRevenuePerUser: 47.91,
      growth: 8.7,
    },
  ];

  const paymentMethodData: PaymentMethodData[] = [
    {
      method: "Visa",
      revenue: 45680,
      transactions: 1247,
      percentage: 43.2,
    },
    {
      method: "Mastercard",
      revenue: 32140,
      transactions: 856,
      percentage: 30.4,
    },
    {
      method: "American Express",
      revenue: 18950,
      transactions: 432,
      percentage: 17.9,
    },
    {
      method: "Other",
      revenue: 9120,
      transactions: 198,
      percentage: 8.5,
    },
  ];

  // Calculate totals and metrics
  const currentPeriodData = monthlyData[monthlyData.length - 1]!;
  const previousPeriodData = monthlyData[monthlyData.length - 2]!;

  const revenueGrowth =
    ((currentPeriodData.totalRevenue - previousPeriodData.totalRevenue) /
      previousPeriodData.totalRevenue) *
    100;
  const churnRate =
    (currentPeriodData.churnedSubscriptions /
      currentPeriodData.activeSubscriptions) *
    100;
  const averageRevenuePerUser =
    currentPeriodData.totalRevenue / currentPeriodData.activeSubscriptions;

  const formatCurrency = (amount: number, currency = selectedCurrency) => {
    switch (currency) {
      case "EUR":
        return `€${amount.toLocaleString()}`;
      case "BRL":
        return `R$${amount.toLocaleString()}`;
      case "USD":
        return `$${amount.toLocaleString()}`;
      default:
        return `${amount.toLocaleString()}`;
    }
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("platform.reports.title", "Financial Reports")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "platform.reports.subtitle",
              "Comprehensive financial analytics and reporting"
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t("common.filter", "Filter")}
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t("common.export", "Export")}
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">
                {t("platform.reports.period", "Period")}
              </Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    {t("platform.reports.periods.daily", "Daily")}
                  </SelectItem>
                  <SelectItem value="weekly">
                    {t("platform.reports.periods.weekly", "Weekly")}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t("platform.reports.periods.monthly", "Monthly")}
                  </SelectItem>
                  <SelectItem value="yearly">
                    {t("platform.reports.periods.yearly", "Yearly")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">
                {t("platform.reports.region", "Region")}
              </Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("platform.reports.regions.all", "All Regions")}
                  </SelectItem>
                  <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                  <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">
                {t("platform.reports.currency", "Currency")}
              </Label>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">
                {t("platform.reports.dateRange", "Date Range")}
              </Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30_days">
                    {t("platform.reports.ranges.last30", "Last 30 Days")}
                  </SelectItem>
                  <SelectItem value="last_90_days">
                    {t("platform.reports.ranges.last90", "Last 90 Days")}
                  </SelectItem>
                  <SelectItem value="last_12_months">
                    {t("platform.reports.ranges.last12", "Last 12 Months")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("platform.reports.ranges.custom", "Custom Range")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.reports.metrics.totalRevenue", "Total Revenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentPeriodData.totalRevenue)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getGrowthIcon(revenueGrowth)}
              <span className={getGrowthColor(revenueGrowth)}>
                {revenueGrowth >= 0 ? "+" : ""}
                {revenueGrowth.toFixed(1)}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.reports.metrics.netRevenue", "Net Revenue")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentPeriodData.netRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("platform.reports.metrics.afterRefunds", "After refunds")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.reports.metrics.arpu", "ARPU")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageRevenuePerUser)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("platform.reports.metrics.perUser", "per user")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.reports.metrics.churnRate", "Churn Rate")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {t("platform.reports.metrics.thisMonth", "this month")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            {t("platform.reports.tabs.overview", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="revenue">
            {t("platform.reports.tabs.revenue", "Revenue")}
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            {t("platform.reports.tabs.subscriptions", "Subscriptions")}
          </TabsTrigger>
          <TabsTrigger value="regional">
            {t("platform.reports.tabs.regional", "Regional")}
          </TabsTrigger>
          <TabsTrigger value="payments">
            {t("platform.reports.tabs.payments", "Payments")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("platform.reports.charts.revenueTrend", "Revenue Trend")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.revenueTrendDesc",
                    "Monthly revenue breakdown over time"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="subscriptionRevenue"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Subscriptions"
                    />
                    <Area
                      type="monotone"
                      dataKey="aiInsightsRevenue"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="AI Insights"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subscription Growth */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.charts.subscriptionGrowth",
                    "Subscription Growth"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.subscriptionGrowthDesc",
                    "Active subscriptions over time"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="activeSubscriptions"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Active Subscriptions"
                    />
                    <Line
                      type="monotone"
                      dataKey="newSubscriptions"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="New Subscriptions"
                    />
                    <Line
                      type="monotone"
                      dataKey="churnedSubscriptions"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="Churned Subscriptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.charts.monthlyRevenue",
                    "Monthly Revenue Breakdown"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.monthlyRevenueDesc",
                    "Revenue sources by month"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="subscriptionRevenue"
                      fill="#8884d8"
                      name="Subscriptions"
                    />
                    <Bar
                      dataKey="aiInsightsRevenue"
                      fill="#82ca9d"
                      name="AI Insights"
                    />
                    <Bar dataKey="refunds" fill="#ff8042" name="Refunds" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Refunds */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.charts.revenueVsRefunds",
                    "Revenue vs Refunds"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.revenueVsRefundsDesc",
                    "Net revenue after refunds"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="netRevenue"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Net Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="refunds"
                      stroke="#ff8042"
                      strokeWidth={2}
                      name="Refunds"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Regional Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.charts.regionalRevenue",
                    "Revenue by Region"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.regionalRevenueDesc",
                    "Revenue distribution across regions"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ region, revenue }) =>
                        `${region}: ${formatCurrency(revenue)}`
                      }
                    >
                      {regionalData.map((entry, index) => (
                        <Cell
                          key={entry.region}
                          fill={["#8884d8", "#82ca9d", "#ffc658"][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.regional.performance",
                    "Regional Performance"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.regional.performanceDesc",
                    "Key metrics by region"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("platform.reports.regional.region", "Region")}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.regional.revenue", "Revenue")}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.regional.subs", "Subscriptions")}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.regional.arpu", "ARPU")}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.regional.growth", "Growth")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionalData.map((region) => (
                      <TableRow key={region.region}>
                        <TableCell className="font-medium">
                          {region.region}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(region.revenue, region.currency)}
                        </TableCell>
                        <TableCell>
                          {region.subscriptions.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            region.averageRevenuePerUser,
                            region.currency
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getGrowthIcon(region.growth)}
                            <span className={getGrowthColor(region.growth)}>
                              {region.growth >= 0 ? "+" : ""}
                              {region.growth.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.charts.paymentMethods",
                    "Payment Methods"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.charts.paymentMethodsDesc",
                    "Revenue by payment method"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ method, percentage }) =>
                        `${method}: ${percentage}%`
                      }
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell
                          key={entry.method}
                          fill={
                            ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.reports.payments.methods",
                    "Payment Method Details"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.reports.payments.methodsDesc",
                    "Detailed payment method breakdown"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("platform.reports.payments.method", "Method")}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.payments.revenue", "Revenue")}
                      </TableHead>
                      <TableHead>
                        {t(
                          "platform.reports.payments.transactions",
                          "Transactions"
                        )}
                      </TableHead>
                      <TableHead>
                        {t("platform.reports.payments.percentage", "Share")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethodData.map((method) => (
                      <TableRow key={method.method}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>{method.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(method.revenue)}</TableCell>
                        <TableCell>
                          {method.transactions.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{method.percentage}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
