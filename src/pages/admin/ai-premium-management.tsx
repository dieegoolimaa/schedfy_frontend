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
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  Settings,
  Sparkles,
  Crown,
  Eye,
  Edit,
  Plus,
  Activity,
  DollarSign,
  Server,
} from "lucide-react";

export function AIPremiumManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // AI Service Statistics
  const aiStats = {
    totalCompanies: 127,
    activeSubscriptions: 89,
    totalCreditsUsed: 24750,
    monthlyRevenue: 8945,
    averageUsagePerCompany: 278,
    topFeature: "Smart Scheduling",
    apiCalls: 156_342,
    uptime: 99.7,
  };

  // Company AI Usage Data
  const companyUsage = [
    {
      id: "1",
      companyName: "Bella Vita Salon",
      plan: "AI Premium",
      creditsUsed: 1245,
      creditsLimit: 2000,
      monthlySpend: 149.99,
      features: [
        "Smart Scheduling",
        "Customer Insights",
        "Revenue Optimization",
      ],
      status: "active",
      lastUsed: "2024-10-23",
      apiCalls: 2456,
    },
    {
      id: "2",
      companyName: "Studio Hair Premium",
      plan: "AI Basic",
      creditsUsed: 456,
      creditsLimit: 1000,
      monthlySpend: 79.99,
      features: ["Smart Scheduling", "Basic Analytics"],
      status: "active",
      lastUsed: "2024-10-22",
      apiCalls: 1123,
    },
    {
      id: "3",
      companyName: "Elite Beauty Clinic",
      plan: "AI Enterprise",
      creditsUsed: 3421,
      creditsLimit: 5000,
      monthlySpend: 299.99,
      features: ["All AI Features", "Custom Models", "API Access"],
      status: "active",
      lastUsed: "2024-10-23",
      apiCalls: 5687,
    },
    {
      id: "4",
      companyName: "Modern Cuts Barbershop",
      plan: "AI Premium",
      creditsUsed: 789,
      creditsLimit: 2000,
      monthlySpend: 149.99,
      features: ["Smart Scheduling", "Customer Insights"],
      status: "suspended",
      lastUsed: "2024-10-15",
      apiCalls: 234,
    },
  ];

  // AI Features Configuration
  const aiFeatures = [
    {
      id: "smart-scheduling",
      name: "Smart Scheduling",
      description: "AI-powered appointment optimization",
      creditCost: 5,
      isEnabled: true,
      usageCount: 15623,
      category: "Scheduling",
    },
    {
      id: "customer-insights",
      name: "Customer Insights",
      description: "Advanced customer behavior analysis",
      creditCost: 10,
      isEnabled: true,
      usageCount: 8942,
      category: "Analytics",
    },
    {
      id: "revenue-optimization",
      name: "Revenue Optimization",
      description: "AI-driven pricing and revenue suggestions",
      creditCost: 15,
      isEnabled: true,
      usageCount: 4521,
      category: "Business Intelligence",
    },
    {
      id: "predictive-booking",
      name: "Predictive Booking",
      description: "Forecast booking patterns and demand",
      creditCost: 12,
      isEnabled: false,
      usageCount: 0,
      category: "Analytics",
    },
    {
      id: "automated-marketing",
      name: "Automated Marketing",
      description: "AI-generated marketing campaigns",
      creditCost: 8,
      isEnabled: true,
      usageCount: 2156,
      category: "Marketing",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "AI Basic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "AI Premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "AI Enterprise":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Premium Management
          </h1>
          <p className="text-muted-foreground">
            Manage AI services, usage, and company subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            AI Settings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add AI Feature
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI Subscriptions
                </CardTitle>
                <Crown className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aiStats.activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {aiStats.totalCompanies} companies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${aiStats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Credits Used
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aiStats.totalCreditsUsed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  API Uptime
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiStats.uptime}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Real-time AI service status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Smart Scheduling API</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Customer Insights Engine</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Revenue Optimization</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Degraded
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>ML Model Training</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Overview
                </CardTitle>
                <CardDescription>AI feature usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Smart Scheduling</span>
                    <span>15,623 uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Insights</span>
                    <span>8,942 uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue Optimization</span>
                    <span>4,521 uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "23%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Automated Marketing</span>
                    <span>2,156 uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: "11%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company AI Subscriptions</CardTitle>
              <CardDescription>
                Manage AI service subscriptions for all companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Credits Usage</TableHead>
                    <TableHead>Monthly Spend</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyUsage.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {company.companyName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {company.features.length} features enabled
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPlanColor(company.plan)}
                        >
                          {company.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{company.creditsUsed}</span>
                            <span className="text-muted-foreground">
                              / {company.creditsLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-purple-600 h-1 rounded-full"
                              style={{
                                width: `${(company.creditsUsed / company.creditsLimit) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${company.monthlySpend}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(company.status)}
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{company.lastUsed}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  AI Usage Details - {company.companyName}
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed AI service usage and configuration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Plan</Label>
                                    <div className="font-medium">
                                      {company.plan}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <Badge
                                      variant="outline"
                                      className={getStatusColor(company.status)}
                                    >
                                      {company.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Credits Used</Label>
                                    <div className="font-medium">
                                      {company.creditsUsed} /{" "}
                                      {company.creditsLimit}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>API Calls</Label>
                                    <div className="font-medium">
                                      {company.apiCalls.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Enabled Features</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {company.features.map((feature) => (
                                      <Badge key={feature} variant="outline">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Features Configuration</CardTitle>
              <CardDescription>
                Manage available AI features and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <div>
                          <h3 className="font-medium">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                        <span>Cost: {feature.creditCost} credits</span>
                        <span>
                          Usage: {feature.usageCount.toLocaleString()}
                        </span>
                        <Badge variant="outline">{feature.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={(checked) => {
                          console.log(`Toggle ${feature.id}:`, checked);
                        }}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>AI service revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Revenue Dashboard
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced analytics charts will be integrated here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
                <CardDescription>AI feature usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Usage Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Detailed usage pattern analysis coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
