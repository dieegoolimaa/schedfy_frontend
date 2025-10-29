import { useState } from "react";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Euro,
  TrendingUp,
  TrendingDown,
  Star,
  BarChart3,
  Zap,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function IndividualServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock services data for Individual plan with AI insights
  const services = [
    {
      id: 1,
      name: "Hair Coloring",
      category: "Hair Services",
      price: 65,
      duration: 120,
      description: "Professional hair coloring with premium products",
      active: true,
      bookings: 18,
      revenue: 1170,
      rating: 4.9,
      lastBooking: "2024-01-20",
      aiInsight: "High demand - consider adding advanced color techniques",
      popularTimes: ["14:00", "16:00", "18:00"],
      seasonalTrend: "up",
    },
    {
      id: 2,
      name: "Haircut & Styling",
      category: "Hair Services",
      price: 45,
      duration: 60,
      description: "Precision haircut with professional styling",
      active: true,
      bookings: 15,
      revenue: 675,
      rating: 4.8,
      lastBooking: "2024-01-19",
      aiInsight: "Steady performer - bundle with treatments for higher value",
      popularTimes: ["10:00", "14:00", "16:00"],
      seasonalTrend: "stable",
    },
    {
      id: 3,
      name: "Deep Hair Treatment",
      category: "Hair Care",
      price: 75,
      duration: 90,
      description: "Intensive hair treatment for damaged or dry hair",
      active: true,
      bookings: 8,
      revenue: 600,
      rating: 4.7,
      lastBooking: "2024-01-18",
      aiInsight: "Growing trend - promote as add-on to coloring services",
      popularTimes: ["11:00", "15:00"],
      seasonalTrend: "up",
    },
    {
      id: 4,
      name: "Wedding Styling",
      category: "Special Events",
      price: 120,
      duration: 180,
      description: "Complete bridal hair styling for your special day",
      active: true,
      bookings: 4,
      revenue: 480,
      rating: 5,
      lastBooking: "2024-01-15",
      aiInsight: "Premium service - expand marketing for wedding season",
      popularTimes: ["08:00", "09:00"],
      seasonalTrend: "seasonal",
    },
    {
      id: 5,
      name: "Color Correction",
      category: "Hair Services",
      price: 150,
      duration: 240,
      description: "Professional color correction for previous work",
      active: true,
      bookings: 2,
      revenue: 300,
      rating: 4.5,
      lastBooking: "2024-01-12",
      aiInsight: "Specialized service - requires extra consultation time",
      popularTimes: ["09:00", "13:00"],
      seasonalTrend: "stable",
    },
    {
      id: 6,
      name: "Basic Trim",
      category: "Hair Services",
      price: 25,
      duration: 30,
      description: "Quick trim for maintenance",
      active: false,
      bookings: 0,
      revenue: 0,
      rating: 0,
      lastBooking: null,
      aiInsight: "Consider activating for quick appointments",
      popularTimes: [],
      seasonalTrend: "stable",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories", count: services.length },
    { id: "Hair Services", name: "Hair Services", count: 4 },
    { id: "Hair Care", name: "Hair Care", count: 1 },
    { id: "Special Events", name: "Special Events", count: 1 },
  ];

  const aiRecommendations = [
    {
      type: "opportunity",
      title: "Service Bundle Opportunity",
      description:
        'Create "Color & Care" package combining coloring + treatment',
      impact: "Could increase average booking value by 25%",
      action: "Create Bundle",
    },
    {
      type: "pricing",
      title: "Premium Time Pricing",
      description: "Consider 15% markup for Friday-Sunday appointments",
      impact: "Estimated +€340 monthly revenue",
      action: "Adjust Pricing",
    },
    {
      type: "marketing",
      title: "Seasonal Promotion",
      description: "Wedding season approaching - promote bridal packages",
      impact: "40% booking increase expected",
      action: "Launch Campaign",
    },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalServices: services.length,
    activeServices: services.filter((s) => s.active).length,
    totalRevenue: services.reduce((sum, s) => sum + s.revenue, 0),
    avgPrice: services.reduce((sum, s) => sum + s.price, 0) / services.length,
    avgRating:
      services
        .filter((s) => s.rating > 0)
        .reduce((sum, s) => sum + s.rating, 0) /
      services.filter((s) => s.rating > 0).length,
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "pricing":
        return <Euro className="h-4 w-4 text-green-500" />;
      case "marketing":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-blue-50 border-blue-200";
      case "pricing":
        return "bg-green-50 border-green-200";
      case "marketing":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service Management
          </h1>
          <p className="text-muted-foreground">
            Manage services with AI-powered pricing and optimization •
            Individual Plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service offering for your business.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input id="service-name" placeholder="Enter service name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hair-services">
                          Hair Services
                        </SelectItem>
                        <SelectItem value="hair-care">Hair Care</SelectItem>
                        <SelectItem value="special-events">
                          Special Events
                        </SelectItem>
                        <SelectItem value="treatments">Treatments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input id="price" type="number" placeholder="45" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the service..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" />
                  <Label htmlFor="active">Service is active and bookable</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Service</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">
              AI Service Optimizer
            </CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Intelligent recommendations to maximize your service profitability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.title}
                className={`p-4 rounded-lg border ${getInsightColor(rec.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(rec.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                    <div className="text-xs font-medium mt-2 text-blue-600">
                      {rec.impact}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Total"
          value={stats.totalServices}
          subtitle="Services"
          color="blue"
        />
        <MobileStatsCard
          title="Active"
          value={stats.activeServices}
          subtitle="Available"
          color="green"
        />
        <MobileStatsCard
          title="Revenue"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          subtitle="Total"
          color="purple"
        />
        <MobileStatsCard
          title="Avg. Price"
          value={`€${stats.avgPrice.toFixed(0)}`}
          subtitle="Per Service"
          color="yellow"
        />
        <MobileStatsCard
          title="Rating"
          value={`⭐ ${stats.avgRating.toFixed(1)}`}
          subtitle="Average"
          color="yellow"
        />
      </ResponsiveCardGrid>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
        </TabsList>

        {/* Services List */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Portfolio</CardTitle>
              <CardDescription>
                Manage your service offerings and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {service.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">€{service.price}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          {service.duration}min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {service.bookings} bookings
                          </div>
                          <div className="text-xs text-muted-foreground">
                            €{service.revenue} revenue
                          </div>
                          {service.rating > 0 && (
                            <div className="flex items-center text-xs">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {service.rating}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTrendIcon(service.seasonalTrend)}
                          <span
                            className={`ml-1 text-sm ${getTrendColor(
                              service.seasonalTrend
                            )}`}
                          >
                            {service.seasonalTrend}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            service.active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {service.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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

        {/* Performance Analysis */}
        <TabsContent value="performance">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>
                  Which services generate the most revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services
                  .filter((s) => s.revenue > 0)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.bookings} bookings
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">€{service.revenue}</div>
                        <div className="text-sm text-muted-foreground">
                          €{service.price} avg
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Time Slots</CardTitle>
                <CardDescription>
                  When clients prefer your services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services
                  .filter((s) => s.popularTimes.length > 0)
                  .map((service) => (
                    <div key={service.id} className="space-y-2">
                      <div className="font-medium">{service.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {service.popularTimes.map((time) => (
                          <Badge
                            key={time}
                            variant="secondary"
                            className="text-xs"
                          >
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Optimization */}
        <TabsContent value="optimization">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Service Insights</CardTitle>
                <CardDescription>
                  Personalized recommendations for each service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>€{service.price}</span>
                          <span>{service.duration}min</span>
                          <span>{service.bookings} bookings</span>
                          {service.rating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {service.rating}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              {service.aiInsight}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {service.active ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
