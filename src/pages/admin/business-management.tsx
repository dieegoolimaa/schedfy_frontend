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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Users,
  Calendar,
  Globe,
  Mail,
  Star,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";

export function BusinessManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);

  const handleViewDetails = (business: any) => {
    setSelectedBusiness(business);
    setViewDetailsOpen(true);
  };

  const handleEditBusiness = (business: any) => {
    setSelectedBusiness(business);
    setEditBusinessOpen(true);
  };

  const handleSuspendBusiness = (business: any) => {
    setSelectedBusiness(business);
    setSuspendConfirmOpen(true);
  };

  const handleStatusChange = () => {
    // TODO: Implement API call to update business status
    console.log("Status changed for business:", selectedBusiness?.name);
    setSuspendConfirmOpen(false);
    setSelectedBusiness(null);
  };

  // Mock businesses data
  const businesses = [
    {
      id: 1,
      name: "Bella Vista Salon",
      owner: "Sofia Oliveira",
      email: "sofia@bellavista.pt",
      phone: "+351 123 456 789",
      address: "Rua das Flores, 123, Lisboa",
      plan: "Business",
      status: "active",
      region: "Portugal",
      joinDate: "2023-01-15",
      lastActivity: "2024-01-20T14:30:00Z",
      totalRevenue: 12450,
      monthlyRevenue: 2450,
      totalBookings: 287,
      monthlyBookings: 54,
      professionals: 5,
      rating: 4.8,
      subscriptionEnd: "2024-02-15",
      paymentStatus: "current",
    },
    {
      id: 2,
      name: "Modern Cuts",
      owner: "Carlos Silva",
      email: "carlos@moderncuts.com.br",
      phone: "+55 11 98765 4321",
      address: "Av. Paulista, 456, São Paulo",
      plan: "Individual",
      status: "trial",
      region: "Brazil",
      joinDate: "2024-01-10",
      lastActivity: "2024-01-19T16:45:00Z",
      totalRevenue: 890,
      monthlyRevenue: 890,
      totalBookings: 23,
      monthlyBookings: 23,
      professionals: 2,
      rating: 4.6,
      subscriptionEnd: "2024-01-25",
      paymentStatus: "trial",
    },
    {
      id: 3,
      name: "Elite Barbershop",
      owner: "João Santos",
      email: "joao@elitebarbershop.com",
      phone: "+1 555 123 4567",
      address: "789 Main St, New York, NY",
      plan: "Business",
      status: "active",
      region: "United States",
      joinDate: "2023-06-01",
      lastActivity: "2024-01-20T10:15:00Z",
      totalRevenue: 18920,
      monthlyRevenue: 3200,
      totalBookings: 412,
      monthlyBookings: 68,
      professionals: 7,
      rating: 4.9,
      subscriptionEnd: "2024-06-01",
      paymentStatus: "current",
    },
    {
      id: 4,
      name: "Style Studio",
      owner: "Ana Costa",
      email: "ana@stylestudio.pt",
      phone: "+351 987 654 321",
      address: "Rua Augusta, 321, Porto",
      plan: "Simple",
      status: "suspended",
      region: "Portugal",
      joinDate: "2023-09-15",
      lastActivity: "2024-01-15T09:30:00Z",
      totalRevenue: 3240,
      monthlyRevenue: 540,
      totalBookings: 156,
      monthlyBookings: 26,
      professionals: 1,
      rating: 4.3,
      subscriptionEnd: "2024-01-15",
      paymentStatus: "overdue",
    },
    {
      id: 5,
      name: "Beauty Corner",
      owner: "Maria Fernandes",
      email: "maria@beautycorner.pt",
      phone: "+351 555 789 123",
      address: "Praça da República, 654, Lisboa",
      plan: "Individual",
      status: "pending",
      region: "Portugal",
      joinDate: "2024-01-18",
      lastActivity: "2024-01-20T12:00:00Z",
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalBookings: 0,
      monthlyBookings: 0,
      professionals: 0,
      rating: 0,
      subscriptionEnd: null,
      paymentStatus: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Simple":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Individual":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Business":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || business.status === statusFilter;
    const matchesPlan = planFilter === "all" || business.plan === planFilter;
    const matchesRegion =
      regionFilter === "all" || business.region === regionFilter;

    return matchesSearch && matchesStatus && matchesPlan && matchesRegion;
  });

  const stats = {
    total: businesses.length,
    active: businesses.filter((b) => b.status === "active").length,
    trial: businesses.filter((b) => b.status === "trial").length,
    suspended: businesses.filter((b) => b.status === "suspended").length,
    pending: businesses.filter((b) => b.status === "pending").length,
    totalRevenue: businesses.reduce((sum, b) => sum + b.totalRevenue, 0),
    monthlyRevenue: businesses.reduce((sum, b) => sum + b.monthlyRevenue, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Manage businesses, subscriptions, and account status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Business</DialogTitle>
                <DialogDescription>
                  Manually register a new business on the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-name">Owner Name</Label>
                    <Input id="owner-name" placeholder="Enter owner name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="business@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+351 123 456 789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Street address, city, country"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portugal">Portugal</SelectItem>
                        <SelectItem value="brazil">Brazil</SelectItem>
                        <SelectItem value="united-states">
                          United States
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or comments..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Business</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
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
            <div className="text-2xl font-bold text-blue-600">
              {stats.trial}
            </div>
            <p className="text-xs text-muted-foreground">Trial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.suspended}
            </div>
            <p className="text-xs text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              €{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses, owners, or emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Simple">Simple</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Portugal">Portugal</SelectItem>
              <SelectItem value="Brazil">Brazil</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More
          </Button>
        </div>
      </div>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Businesses</CardTitle>
          <CardDescription>
            Complete list of businesses on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {business.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{business.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {business.owner}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {business.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPlanColor(business.plan)}
                    >
                      {business.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(business.status)}
                    >
                      {business.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        €{business.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total: €{business.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {business.monthlyBookings} bookings
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {business.professionals} staff
                      </div>
                      {business.rating > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {business.rating}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPaymentStatusColor(business.paymentStatus)}
                    >
                      {business.paymentStatus}
                    </Badge>
                    {business.subscriptionEnd && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Until:{" "}
                        {new Date(
                          business.subscriptionEnd
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
                      {business.region}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(business)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditBusiness(business)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Business
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(() => {
                          if (business.status === "active") {
                            return (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleSuspendBusiness(business)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            );
                          } else if (business.status === "suspended") {
                            return (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleSuspendBusiness(business)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            );
                          }
                          return null;
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Business Details: {selectedBusiness?.name}
            </DialogTitle>
            <DialogDescription>
              Complete information about this business
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.owner}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.address}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <Badge variant="outline">{selectedBusiness.plan}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Total Revenue</Label>
                  <p className="text-sm text-muted-foreground">
                    €{selectedBusiness.totalRevenue}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monthly Revenue</Label>
                  <p className="text-sm text-muted-foreground">
                    €{selectedBusiness.monthlyRevenue}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Bookings</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.totalBookings}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Professionals</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedBusiness.professionals}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rating</Label>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {selectedBusiness.rating}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={editBusinessOpen} onOpenChange={setEditBusinessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business: {selectedBusiness?.name}</DialogTitle>
            <DialogDescription>Update business information</DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue={selectedBusiness.name} />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" defaultValue={selectedBusiness.owner} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedBusiness.email}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={selectedBusiness.phone} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  defaultValue={selectedBusiness.address}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setEditBusinessOpen(false)}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditBusinessOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <Dialog open={suspendConfirmOpen} onOpenChange={setSuspendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBusiness?.status === "active" ? "Suspend" : "Reactivate"}{" "}
              Business
            </DialogTitle>
            <DialogDescription>
              {selectedBusiness?.status === "active"
                ? "Are you sure you want to suspend this business? They will lose access to all features."
                : "Are you sure you want to reactivate this business? They will regain full access."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant={
                selectedBusiness?.status === "active"
                  ? "destructive"
                  : "default"
              }
              onClick={handleStatusChange}
            >
              {selectedBusiness?.status === "active" ? "Suspend" : "Reactivate"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSuspendConfirmOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
