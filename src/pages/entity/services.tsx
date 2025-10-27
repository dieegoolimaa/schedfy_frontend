import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  Euro,
  Users,
  TrendingUp,
  Star,
  Calendar,
} from "lucide-react";

export function ServicesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const entityId = user?.businessId || user?.id || "";

  // Use the services hook with real API
  const {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    fetchServices: _fetchServices, // TODO: Use for manual refresh
  } = useServices({ entityId, autoFetch: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    price: "",
    isActive: false,
    isPublic: true,
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    price: "",
    isActive: false,
    isPublic: true,
  });

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");

  const handleEditService = (service: any) => {
    setEditingService(service);
    // Extract numeric duration value (in case it's an object or number)
    const durationValue =
      typeof service.duration === "object"
        ? service.duration.duration
        : service.duration;
    const priceValue =
      typeof service.price === "object"
        ? service.price.basePrice
        : service.price;

    setEditFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: String(durationValue || ""),
      price: String(priceValue || ""),
      isActive: service.isActive,
      isPublic: service.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteService = (service: any) => {
    setDeletingService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !createFormData.name ||
      !createFormData.category ||
      !createFormData.duration ||
      !createFormData.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setFormLoading(true);
      await createService({
        entityId,
        name: createFormData.name,
        description: createFormData.description,
        category: createFormData.category,
        duration: {
          durationType: "fixed",
          duration: parseInt(createFormData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        pricing: {
          basePrice: parseFloat(createFormData.price),
          currency: "EUR",
          priceType: "fixed",
        },
        status: createFormData.isActive ? "active" : "inactive",
        seo: {
          isPublic: createFormData.isPublic,
        },
        createdBy: user?.id || entityId,
      });

      // Reset form and close dialog
      setCreateFormData({
        name: "",
        description: "",
        category: "",
        duration: "",
        price: "",
        isActive: false,
        isPublic: true,
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook with toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editingService ||
      !editFormData.name ||
      !editFormData.category ||
      !editFormData.duration ||
      !editFormData.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setFormLoading(true);
      await updateService(editingService.id, {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        duration: {
          durationType: "fixed",
          duration: parseInt(editFormData.duration),
          bufferBefore: 0,
          bufferAfter: 0,
        },
        pricing: {
          basePrice: parseFloat(editFormData.price),
          currency: "EUR",
          priceType: "fixed",
        },
        status: editFormData.isActive ? "active" : "inactive",
        seo: {
          isPublic: editFormData.isPublic,
        },
        updatedBy: user?.id || entityId,
      });

      setIsEditDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      // Error is handled in the hook with toast
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingService) return;

    try {
      await deleteService(deletingService.id);
      setIsDeleteDialogOpen(false);
      setDeletingService(null);
    } catch (error) {
      // Error is handled in the hook with toast
    }
  };

  // Compute categories from services
  const categories = services.reduce((acc, service) => {
    const existing = acc.find(
      (cat) => cat.id === service.category.toLowerCase()
    );
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        id: service.category.toLowerCase(),
        name: service.category,
        count: 1,
      });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; count: number }>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    const matchesPriceRange =
      priceRangeFilter === "all" ||
      (priceRangeFilter === "0-25" &&
        service.price >= 0 &&
        service.price <= 25) ||
      (priceRangeFilter === "26-50" &&
        service.price >= 26 &&
        service.price <= 50) ||
      (priceRangeFilter === "51-75" &&
        service.price >= 51 &&
        service.price <= 75) ||
      (priceRangeFilter === "76+" && service.price >= 76);

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesPriceRange
    );
  });

  const activeServices = filteredServices.filter(
    (service) => service.status === "active"
  );
  const totalRevenue = activeServices.reduce(
    (sum, service) => sum + service.price * (service.bookings || 0),
    0
  );
  const avgRating =
    activeServices.length > 0
      ? activeServices.reduce(
          (sum, service) => sum + (service.rating || 0),
          0
        ) / activeServices.length
      : 0;

  // Show loading skeleton while fetching data
  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-4">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("services.title", "Services")}
            </h1>
            <p className="text-muted-foreground">
              {t("services.subtitle", "Manage your service offerings")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <form onSubmit={handleCreateSubmit}>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">Service Name *</Label>
                        <Input
                          id="service-name"
                          placeholder="Enter service name"
                          value={createFormData.name}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          placeholder="e.g., Hair, Nails, Massage"
                          value={createFormData.category}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              category: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your service..."
                        rows={3}
                        value={createFormData.description}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="60"
                          value={createFormData.duration}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              duration: e.target.value,
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (€) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="45.00"
                          step="0.01"
                          value={createFormData.price}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              price: e.target.value,
                            })
                          }
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={createFormData.isActive}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isActive">
                        Make this service active immediately
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={createFormData.isPublic}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            isPublic: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isPublic">
                        Make this service publicly visible
                      </Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={formLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formLoading}>
                        {formLoading ? "Creating..." : "Create Service"}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Services
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeServices.length}</div>
              <p className="text-xs text-muted-foreground">
                {services.filter((s) => s.status === "draft").length} in draft
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From{" "}
                {activeServices.reduce((sum, s) => sum + (s.bookings || 0), 0)}{" "}
                bookings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Across all services
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  activeServices.reduce((sum, s) => sum + s.duration, 0) /
                    activeServices.length
                )}
                min
              </div>
              <p className="text-xs text-muted-foreground">Per service</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isFilterDialogOpen}
              onOpenChange={setIsFilterDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Services</DialogTitle>
                  <DialogDescription>
                    Apply filters to find specific services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Hair">Hair</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Nails">Nails</SelectItem>
                        <SelectItem value="Massage">Massage</SelectItem>
                        <SelectItem value="Wellness">Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price-range-filter">Price Range</Label>
                    <Select
                      value={priceRangeFilter}
                      onValueChange={setPriceRangeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Prices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-25">€0 - €25</SelectItem>
                        <SelectItem value="26-50">€26 - €50</SelectItem>
                        <SelectItem value="51-75">€51 - €75</SelectItem>
                        <SelectItem value="76+">€76+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        setPriceRangeFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={() => setIsFilterDialogOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No services found
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {services.length === 0
                      ? "Get started by creating your first service"
                      : "Try adjusting your filters"}
                  </p>
                  {services.length === 0 && (
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Create Service
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              service.status || "inactive"
                            )}
                          >
                            {service.status || "inactive"}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center">
                          <Euro className="h-3 w-3 mr-1 text-muted-foreground" />
                          €{service.price}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          {service.bookings || 0} bookings
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-muted-foreground" />
                          {(service.rating || 0) > 0
                            ? (service.rating || 0).toFixed(1)
                            : "No ratings"}
                        </div>
                      </div>
                      {service.status === "active" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Popularity</span>
                            <span>{service.popularity}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${service.popularity}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Services Overview</CardTitle>
                <CardDescription>
                  Complete list of all your services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Rating</TableHead>
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
                            <div className="text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>€{service.price}</TableCell>
                        <TableCell>{service.bookings || 0}</TableCell>
                        <TableCell>
                          {(service.rating || 0) > 0 ? (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              {(service.rating || 0).toFixed(1)}
                            </div>
                          ) : (
                            "No ratings"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              service.status || "inactive"
                            )}
                          >
                            {service.status || "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service)}
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

          {/* Analytics View */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Categories</CardTitle>
                  <CardDescription>
                    Distribution of services by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map((category) => {
                    const categoryServices = services.filter(
                      (s) => s.category.toLowerCase() === category.id
                    );
                    const categoryRevenue = categoryServices.reduce(
                      (sum, s) => sum + s.price * (s.bookings || 0),
                      0
                    );

                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {category.count} services • €{categoryRevenue}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (category.count / services.length) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Services</CardTitle>
                  <CardDescription>
                    Services with highest booking rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...activeServices]
                    .sort((a, b) => (b.bookings || 0) - (a.bookings || 0))
                    .slice(0, 5)
                    .map((service, index) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {service.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.bookings || 0} bookings • €
                            {service.price * (service.bookings || 0)}
                          </p>
                        </div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          {service.popularity}%
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service information
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-name">Service Name *</Label>
                    <Input
                      id="edit-service-name"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Input
                      id="edit-category"
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          category: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editFormData.duration}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          duration: e.target.value,
                        })
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (€) *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editFormData.price}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          price: e.target.value,
                        })
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={editFormData.isActive}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isActive">Service is active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isPublic"
                    checked={editFormData.isPublic}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isPublic: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isPublic">
                    Service is publicly visible
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingService?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Service
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
