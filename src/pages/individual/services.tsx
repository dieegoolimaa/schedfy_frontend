import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useServices } from "../../hooks/useServices";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";

export function IndividualServicesPage() {
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    fetchServices,
  } = useServices({ entityId, autoFetch: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    currency: "EUR",
    duration: "",
    isActive: true,
    isPublic: true,
    requireManualConfirmation: false, // For Individual/Business plans
  });

  useEffect(() => {
    if (entityId) {
      fetchServices();
    }
  }, [entityId, fetchServices]);

  useEffect(() => {
    if (entityId) {
      fetchServices();
    }
  }, [entityId, fetchServices]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      currency: "EUR",
      duration: "",
      isActive: true,
      isPublic: true,
      requireManualConfirmation: false,
    });
    setSelectedService(null);
  };

  // Handle create service
  const handleCreateService = async () => {
    try {
      await createService({
        entityId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricing: {
          basePrice: parseFloat(formData.price),
          currency: formData.currency,
          priceType: "fixed",
        },
        duration: {
          durationType: "fixed",
          duration: parseInt(formData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        status: formData.isActive ? "active" : "inactive",
        bookingSettings: {
          requireManualConfirmation: formData.requireManualConfirmation,
          allowOnlineBooking: formData.isPublic,
        },
        createdBy: user?.id || "",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Service created successfully!");
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };

  // Handle update service
  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      await updateService(selectedService.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricing: {
          basePrice: parseFloat(formData.price),
          currency: formData.currency,
          priceType: "fixed",
        },
        duration: {
          durationType: "fixed",
          duration: parseInt(formData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        status: formData.isActive ? "active" : "inactive",
        bookingSettings: {
          allowOnlineBooking: formData.isPublic,
        },
      });

      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Service updated successfully!");
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  // Handle delete service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await deleteService(serviceId);
      toast.success("Service deleted successfully!");
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (service: any) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      price: service.price?.toString() || "0",
      currency: service.currency || "EUR",
      duration: service.duration?.toString() || "60",
      isActive: service.isActive,
      isPublic: service.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  // Calculate stats
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const totalRevenue = services.reduce(
    (sum, s) => sum + (s.price * (s.bookings || 0) || 0),
    0
  );
  const avgBookings =
    services.length > 0
      ? (
          services.reduce((sum, s) => sum + (s.bookings || 0), 0) /
          services.length
        ).toFixed(1)
      : "0";

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [
    { id: "all", name: "All Categories", count: services.length },
    ...Array.from(new Set(services.map((s) => s.category).filter(Boolean))).map(
      (cat) => ({
        id: cat as string,
        name: cat as string,
        count: services.filter((s) => s.category === cat).length,
      })
    ),
  ];

  // AI Recommendations (can be static for now, or fetched from backend later)
  const aiRecommendations = [
    {
      type: "opportunity",
      title: "Service Bundle Opportunity",
      description: 'Create "Color & Care" package combining popular services',
      impact: "Could increase average booking value by 25%",
      action: "Create Bundle",
    },
    {
      type: "pricing",
      title: "Premium Time Pricing",
      description: "Consider 15% markup for Friday-Sunday appointments",
      impact: "Estimated additional monthly revenue",
      action: "Adjust Pricing",
    },
    {
      type: "marketing",
      title: "Seasonal Promotion",
      description: "Wedding season approaching - promote special packages",
      impact: "40% booking increase expected",
      action: "Launch Campaign",
    },
  ];

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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
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
                    <Input
                      id="service-name"
                      placeholder="Enter service name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Hair Services"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="45"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the service..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="active">Service is active and bookable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireManualConfirmation"
                    checked={formData.requireManualConfirmation}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        requireManualConfirmation: checked,
                      })
                    }
                  />
                  <Label htmlFor="requireManualConfirmation">
                    Require manual confirmation for bookings
                    <span className="text-xs text-muted-foreground block mt-1">
                      When enabled, bookings will require your approval before
                      being confirmed
                    </span>
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateService} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Service"
                    )}
                  </Button>
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
      {loading ? (
        <ResponsiveCardGrid>
          <MobileStatsCard
            title="Loading..."
            value="--"
            subtitle="Fetching data..."
            color="gray"
          />
          <MobileStatsCard
            title="Loading..."
            value="--"
            subtitle="Fetching data..."
            color="gray"
          />
          <MobileStatsCard
            title="Loading..."
            value="--"
            subtitle="Fetching data..."
            color="gray"
          />
          <MobileStatsCard
            title="Loading..."
            value="--"
            subtitle="Fetching data..."
            color="gray"
          />
        </ResponsiveCardGrid>
      ) : (
        <ResponsiveCardGrid>
          <MobileStatsCard
            title="Total"
            value={totalServices.toString()}
            subtitle="Services"
            color="blue"
          />
          <MobileStatsCard
            title="Active"
            value={activeServices.toString()}
            subtitle="Available"
            color="green"
          />
          <MobileStatsCard
            title="Revenue"
            value={`€${totalRevenue.toLocaleString()}`}
            subtitle="Total"
            color="purple"
          />
          <MobileStatsCard
            title="Avg. Bookings"
            value={avgBookings}
            subtitle="Per Service"
            color="yellow"
          />
        </ResponsiveCardGrid>
      )}

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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No services found. Create your first service to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
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
                          <Badge variant="outline">
                            {service.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {service.currency} {service.price}
                          </span>
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
                              {service.bookings || 0} bookings
                            </div>
                            {service.rating && service.rating > 0 && (
                              <div className="flex items-center text-xs">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                {service.rating}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="ml-1 text-sm text-green-600">
                              Active
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              service.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                <CardTitle>Top Services by Bookings</CardTitle>
                <CardDescription>
                  Most popular services in your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services
                  .filter((s) => (s.bookings || 0) > 0)
                  .sort((a, b) => (b.bookings || 0) - (a.bookings || 0))
                  .slice(0, 5)
                  .map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.category || "Uncategorized"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {service.bookings || 0} bookings
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.currency} {service.price}
                        </div>
                      </div>
                    </div>
                  ))}
                {services.filter((s) => (s.bookings || 0) > 0).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No booking data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status Overview</CardTitle>
                <CardDescription>Active vs inactive services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Active Services</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {activeServices}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Inactive Services</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">
                    {totalServices - activeServices}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Optimization Tab */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Service Insights</CardTitle>
              <CardDescription>
                Intelligent recommendations based on your service data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {service.category || "Uncategorized"}
                      </p>
                    </div>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-semibold">
                        {service.currency} {service.price}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Duration
                      </div>
                      <div className="font-semibold">{service.duration}min</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Bookings
                      </div>
                      <div className="font-semibold">
                        {service.bookings || 0}
                      </div>
                    </div>
                  </div>
                  {service.rating && service.rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-muted-foreground">rating</span>
                    </div>
                  )}
                </div>
              ))}
              {services.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Create services to see AI-powered insights
                </div>
              )}
            </CardContent>
          </Card>
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
                          <span>
                            {service.currency} {service.price}
                          </span>
                          <span>{service.duration}min</span>
                          <span>{service.bookings || 0} bookings</span>
                          {service.rating && service.rating > 0 && (
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
                              {service.description ||
                                "No additional insights available"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {service.isActive ? (
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
