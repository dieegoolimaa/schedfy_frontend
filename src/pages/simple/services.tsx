import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useServices } from "../../hooks/useServices";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
import { Switch } from "../../components/ui/switch";
import {
  Plus,
  Search,
  Clock,
  Euro,
  Edit,
  Trash2,
  Star,
  Scissors,
  Paintbrush,
  Sparkles,
  Award,
  Zap,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AssignProfessionalsDialog } from "../../components/dialogs/assign-professionals-dialog";

export function SimpleServicesPage() {
  const { t } = useTranslation();
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
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingService, setDeletingService] = useState<any>(null);
  const [assignProfessionalsService, setAssignProfessionalsService] =
    useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "60",
    price: "",
    isActive: true,
  });

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
      duration: "60",
      price: "",
      isActive: true,
    });
    setEditingService(null);
  };

  // Handle create service
  const handleCreateService = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createService({
        entityId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        duration: {
          durationType: "fixed" as const,
          duration: parseInt(formData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        pricing: {
          basePrice: parseFloat(formData.price),
          currency: "EUR",
          priceType: "fixed" as const,
        },
        createdBy: user?.id || "",
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };

  // Handle edit service
  const handleEditService = async () => {
    if (!editingService || !formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateService(editingService.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        duration: {
          durationType: "fixed" as const,
          duration: parseInt(formData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        pricing: {
          basePrice: parseFloat(formData.price),
          currency: "EUR",
          priceType: "fixed" as const,
        },
      });

      setEditingService(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  // Handle delete service
  const handleDeleteService = async () => {
    if (!deletingService) return;

    try {
      await deleteService(deletingService.id);
      setDeletingService(null);
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      duration: service.duration?.toString() || "60",
      price: service.price?.toString() || "",
      isActive: service.isActive,
    });
  };

  const categories = [
    "All",
    "Hair",
    "Grooming",
    "Treatment",
    "Styling",
    "Beauty",
    "Nails",
    "Massage",
    "Wellness",
    "Other",
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      service.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    inactive: services.filter((s) => !s.isActive).length,
    avgDuration:
      services.length > 0
        ? services.reduce((sum, s) => sum + (s.duration || 0), 0) /
          services.length
        : 0,
    totalBookings: services.reduce((sum, s) => sum + (s.bookingCount || 0), 0),
    avgPopularity:
      services.length > 0
        ? services.reduce((sum, s) => sum + (s.popularity || 0), 0) /
          services.length
        : 0,
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 70) return "text-green-600";
    if (popularity >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "hair":
        return <Scissors className="h-4 w-4" />;
      case "grooming":
        return <Sparkles className="h-4 w-4" />;
      case "treatment":
        return <Paintbrush className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("services.title", "Services")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "services.subtitle",
              "Manage your service offerings and pricing"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service for your business.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name *</Label>
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
                  <Label htmlFor="service-description">Description</Label>
                  <Textarea
                    id="service-description"
                    placeholder="Describe your service..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="35.00"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
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
                  <Label htmlFor="active">Active service</Label>
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
                    {loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Add Service
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Service Dialog */}
      <Dialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-service-name">Service Name *</Label>
              <Input
                id="edit-service-name"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-service-description">Description</Label>
              <Textarea
                id="edit-service-description"
                placeholder="Describe your service..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  placeholder="60"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (€) *</Label>
              <Input
                id="edit-price"
                type="number"
                placeholder="35.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingService(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditService} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingService?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeletingService(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Total Services"
          value={stats.total}
          subtitle="Services"
          color="blue"
        />
        <MobileStatsCard
          title="Active"
          value={stats.active}
          subtitle="Available"
          color="green"
        />
        <MobileStatsCard
          title="Inactive"
          value={stats.inactive}
          subtitle="Disabled"
          color="red"
        />
        <MobileStatsCard
          title="Avg. Duration"
          value={`${Math.round(stats.avgDuration)}min`}
          subtitle="Per service"
          color="purple"
        />
        <MobileStatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All time"
          color="yellow"
        />
        <MobileStatsCard
          title="Avg. Popularity"
          value={`${Math.round(stats.avgPopularity)}%`}
          subtitle="Rating"
          color="purple"
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
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services Content */}
      {loading && services.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="upgrade">
              <Zap className="h-4 w-4 mr-1" />
              Upgrade
            </TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(service.category)}
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="w-fit">
                          {service.category}
                        </Badge>
                        <Badge
                          variant={service.isActive ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
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
                          onClick={() => setDeletingService(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Euro className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="font-medium">€{service.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Price</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="font-medium">
                            {service.duration} min
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span
                            className={`font-medium ${getPopularityColor(
                              service.popularity || 0
                            )}`}
                          >
                            {service.popularity || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Popularity
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {service.bookingCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total Bookings
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Created: </span>
                        <span className="font-medium">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium text-green-600">
                          €
                          {(
                            (service.bookingCount || 0) * (service.price || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Services Overview</CardTitle>
                <CardDescription>
                  Complete list of all services with key metrics
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
                      <TableHead>Professionals</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(service.category)}
                            <span>{service.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">€{service.price}</span>
                        </TableCell>
                        <TableCell>
                          <span>{service.duration} min</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAssignProfessionalsService(service)
                            }
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            <span>
                              {service.assignedProfessionals?.length || 0}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {service.bookingCount || 0}
                            </div>
                            <div
                              className={`text-sm ${getPopularityColor(
                                service.popularity || 0
                              )}`}
                            >
                              {service.popularity || 0}% popular
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            €
                            {(
                              (service.bookingCount || 0) * (service.price || 0)
                            ).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
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
                              onClick={() => setDeletingService(service)}
                            >
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

          {/* Upgrade Tab */}
          <TabsContent value="upgrade">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Unlock Advanced Service Management
                </CardTitle>
                <CardDescription>
                  Upgrade to Individual or Business plan for more powerful
                  features
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
                        Service add-ons and extras
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Custom service durations
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Service packages and bundles
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Advanced pricing rules
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                        Service popularity insights
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
                        Staff service assignments
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                        Commission tracking
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                        Service performance analytics
                      </li>
                      <li className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-2" />
                        Bulk service management
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
                    basic service management
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Assign Professionals Dialog */}
      {assignProfessionalsService && (
        <AssignProfessionalsDialog
          serviceId={assignProfessionalsService.id}
          serviceName={assignProfessionalsService.name}
          entityId={entityId}
          assignedProfessionalIds={
            assignProfessionalsService.assignedProfessionals || []
          }
          onAssigned={() => {
            setAssignProfessionalsService(null);
            fetchServices(); // Refresh services to show updated professional count
          }}
        />
      )}
    </div>
  );
}
