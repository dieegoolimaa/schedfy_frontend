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
  MoreHorizontal,
  Star,
  Scissors,
  Paintbrush,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";

export function SimpleServicesPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock services data for Simple Plan
  const services = [
    {
      id: 1,
      name: "Haircut & Styling",
      description: "Professional haircut with personalized styling",
      category: "Hair",
      price: 35,
      duration: 60,
      active: true,
      popularity: 85,
      lastBooking: "2024-01-20",
      totalBookings: 127,
    },
    {
      id: 2,
      name: "Hair Coloring",
      description: "Full hair coloring service with premium products",
      category: "Hair",
      price: 85,
      duration: 120,
      active: true,
      popularity: 72,
      lastBooking: "2024-01-19",
      totalBookings: 89,
    },
    {
      id: 3,
      name: "Beard Trim",
      description: "Professional beard trimming and shaping",
      category: "Grooming",
      price: 15,
      duration: 30,
      active: true,
      popularity: 68,
      lastBooking: "2024-01-20",
      totalBookings: 156,
    },
    {
      id: 4,
      name: "Hair Styling Only",
      description: "Styling service for special occasions",
      category: "Hair",
      price: 30,
      duration: 45,
      active: true,
      popularity: 45,
      lastBooking: "2024-01-18",
      totalBookings: 67,
    },
    {
      id: 5,
      name: "Shampoo & Blow Dry",
      description: "Basic hair wash and blow dry service",
      category: "Hair",
      price: 20,
      duration: 30,
      active: false,
      popularity: 23,
      lastBooking: "2024-01-10",
      totalBookings: 34,
    },
    {
      id: 6,
      name: "Hair Treatment",
      description: "Deep conditioning and repair treatment",
      category: "Treatment",
      price: 45,
      duration: 60,
      active: true,
      popularity: 58,
      lastBooking: "2024-01-17",
      totalBookings: 78,
    },
  ];

  const categories = ["All", "Hair", "Grooming", "Treatment", "Styling"];

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
    active: services.filter((s) => s.active).length,
    inactive: services.filter((s) => !s.active).length,
    avgDuration:
      services.reduce((sum, s) => sum + s.duration, 0) / services.length,
    totalBookings: services.reduce((sum, s) => sum + s.totalBookings, 0),
    avgPopularity:
      services.reduce((sum, s) => sum + s.popularity, 0) / services.length,
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
                  Create a new service for your business.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="service-name">Service Name</Label>
                  <Input id="service-name" placeholder="Enter service name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-description">Description</Label>
                  <Textarea
                    id="service-description"
                    placeholder="Describe your service..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem
                            key={category}
                            value={category.toLowerCase()}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="35.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Active service</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Service</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(stats.avgDuration)}min
            </div>
            <p className="text-xs text-muted-foreground">Avg. Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(stats.avgPopularity)}%
            </div>
            <p className="text-xs text-muted-foreground">Avg. Popularity</p>
          </CardContent>
        </Card>
      </div>

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
                        variant={service.active ? "default" : "secondary"}
                        className="w-fit"
                      >
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
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
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span
                          className={`font-medium ${getPopularityColor(service.popularity)}`}
                        >
                          {service.popularity}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Popularity
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{service.totalBookings}</div>
                      <p className="text-xs text-muted-foreground">
                        Total Bookings
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Last booked:{" "}
                      </span>
                      <span className="font-medium">
                        {new Date(service.lastBooking).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Revenue: </span>
                      <span className="font-medium text-green-600">
                        €
                        {(
                          service.totalBookings * service.price
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
                        <div className="space-y-1">
                          <div className="font-medium">
                            {service.totalBookings}
                          </div>
                          <div
                            className={`text-sm ${getPopularityColor(service.popularity)}`}
                          >
                            {service.popularity}% popular
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          €
                          {(
                            service.totalBookings * service.price
                          ).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={service.active ? "default" : "secondary"}
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
    </div>
  );
}
