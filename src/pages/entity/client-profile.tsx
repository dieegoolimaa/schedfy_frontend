import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
  useEffect,
} from "react";
import { useAuth } from "../../contexts/auth-context";
import { useClients } from "../../hooks/useClients";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
  Calendar,
  Clock,
  Phone,
  Mail,
  Edit,
  TrendingUp,
  Euro,
  Heart,
  Users,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

export function ClientProfilePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClientData, setEditingClientData] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);

  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const {
    clients,
    loading: clientsLoading,
    fetchClients,
    getClientWithBookings,
    createClient,
    updateClient,
    deleteClient,
  } = useClients({ entityId, autoFetch: true });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    notes: "",
  });

  const handleViewClient = async (client: any) => {
    try {
      const full = await getClientWithBookings(String(client.id));
      setSelectedClient(full);
      setShowClientDetails(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load client details");
    }
  };

  const openEditClient = (client: any) => {
    setEditingClientData({ ...client });
    setIsEditDialogOpen(true);
  };

  const handleEditClientSave = async () => {
    if (!editingClientData || !editingClientData.id) return;
    try {
      await updateClient(String(editingClientData.id), {
        firstName: editingClientData.firstName || "",
        lastName: editingClientData.lastName || "",
        email: editingClientData.email || "",
        phone: editingClientData.phone || "",
        address: editingClientData.address || "",
        notes: editingClientData.notes || "",
        dateOfBirth: editingClientData.birthDate || "",
      });
      setIsEditDialogOpen(false);
      fetchClients();
      toast.success("Client updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update client");
    }
  };

  const confirmDeleteClient = (client: any) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete?.id) return;
    try {
      await deleteClient(String(clientToDelete.id));
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete client");
    }
  };

  const getClientBookings = (clientId: number) => {
    return recentBookings.filter((booking) => booking.clientId === clientId);
  };

  // Build a small recent bookings feed by fetching bookings for the first
  // few clients (kept lightweight). This populates the "Recent Activity" tab.
  useEffect(() => {
    let cancelled = false;
    if (!clients || clients.length === 0) {
      setRecentBookings([]);
      return;
    }

    (async () => {
      try {
        const topClients = clients.slice(0, 10);
        const results = await Promise.all(
          topClients.map((c: any) =>
            getClientWithBookings(String(c.id)).catch(() => null)
          )
        );

        const bookings = results
          .filter(Boolean)
          .flatMap((res: any) =>
            (res.bookings || []).map((b: any) => ({
              ...b,
              clientName: res.name,
            }))
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 20);

        if (!cancelled) setRecentBookings(bookings as any[]);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clients, getClientWithBookings]);

  const handleAddClientSubmit = async () => {
    try {
      await createClient({
        entityId,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        email: newClient.email,
        phone: newClient.phone || undefined,
        notes: newClient.notes || undefined,
        dateOfBirth: newClient.birthDate || undefined,
        createdBy: user?.id || entityId,
      });
      setNewClient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        address: "",
        notes: "",
      });
      // refresh list (createClient already appends but ensure consistency)
      fetchClients();
      toast.success("Client created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create client");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "vip":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 400) return { tier: "VIP", color: "text-purple-600" };
    if (points >= 200) return { tier: "Gold", color: "text-yellow-600" };
    if (points >= 100) return { tier: "Silver", color: "text-gray-600" };
    return { tier: "Bronze", color: "text-amber-700" };
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || "").includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
    vip: clients.filter((c) => (c.loyaltyPoints || 0) >= 400).length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    averageSpent:
      clients.reduce((sum, c) => sum + (c.averageSpent || 0), 0) /
      clients.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Profiles</h1>
          <p className="text-muted-foreground">
            Manage client profiles and link to bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client profile.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-firstName">First Name</Label>
                    <Input
                      id="client-firstName"
                      placeholder="Enter first name"
                      value={newClient.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({
                          ...newClient,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-lastName">Last Name</Label>
                    <Input
                      id="client-lastName"
                      placeholder="Enter last name"
                      value={newClient.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({ ...newClient, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="client@email.com"
                      value={newClient.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      placeholder="+351 123 456 789"
                      value={newClient.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({ ...newClient, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth-date">Birth Date</Label>
                    <Input
                      id="birth-date"
                      type="date"
                      value={newClient.birthDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({
                          ...newClient,
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address, city"
                      value={newClient.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({ ...newClient, address: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred-services">Preferred Services</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircut">Haircut</SelectItem>
                      <SelectItem value="styling">Styling</SelectItem>
                      <SelectItem value="coloring">Hair Coloring</SelectItem>
                      <SelectItem value="treatment">Hair Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special notes, preferences, allergies..."
                    rows={3}
                    value={newClient.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewClient({ ...newClient, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleAddClientSubmit}>Add Client</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {clientsLoading ? (
          // show skeletons while loading
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Clients</p>
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
                <div className="text-2xl font-bold text-purple-600">
                  {stats.vip}
                </div>
                <p className="text-xs text-muted-foreground">VIP Clients</p>
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
                  €{stats.averageSpent.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Avg. Spent</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">All Clients</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Clients List */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>
                Complete list of all clients with their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Loyalty</TableHead>
                    <TableHead>Spending</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsLoading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredClients.map((client) => {
                        const loyaltyInfo = getLoyaltyTier(
                          client.loyaltyPoints || 0
                        );
                        return (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="text-xs">
                                    {client.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {client.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Member since{" "}
                                    {new Date(
                                      client.joinDate || 0
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {client.email}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {client.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {client.totalBookings} bookings
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Last:{" "}
                                  {new Date(
                                    client.lastVisit || 0
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div
                                  className={`font-medium ${loyaltyInfo.color}`}
                                >
                                  {loyaltyInfo.tier}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {client.loyaltyPoints} points
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  €{client.totalSpent}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Avg: €{(client.averageSpent || 0).toFixed(2)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(client.status || "")}
                              >
                                {client.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClient(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditClient(client)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDeleteClient(client)}
                                >
                                  Delete
                                </Button>
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

        {/* Recent Activity */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Activity</CardTitle>
              <CardDescription>
                Latest bookings and client interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Professional</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.clientName}</div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.professional}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">€{booking.amount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>
                  Clients with highest spending and loyalty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...clients]
                  .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                  .slice(0, 5)
                  .map((client, index) => (
                    <div
                      key={client.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {client.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {client.totalBookings} bookings
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          €{client.totalSpent}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getLoyaltyTier(client.loyaltyPoints || 0).tier}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Statistics</CardTitle>
                <CardDescription>
                  Key metrics about your client base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm font-medium">
                        Retention Rate
                      </span>
                    </div>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-xs text-muted-foreground">
                      Last 6 months
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Euro className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">
                        Avg. Lifetime Value
                      </span>
                    </div>
                    <div className="text-2xl font-bold">€642</div>
                    <p className="text-xs text-muted-foreground">Per client</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium">Referrals</span>
                    </div>
                    <div className="text-2xl font-bold">9</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm font-medium">New Clients</span>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback>{selectedClient?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedClient?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Client Profile & Booking History
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Born:{" "}
                          {new Date(
                            selectedClient.birthDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedClient.address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Client Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Total Bookings</Label>
                          <p className="text-2xl font-bold">
                            {selectedClient.totalBookings}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm">Total Spent</Label>
                          <p className="text-2xl font-bold">
                            €{selectedClient.totalSpent}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm">Average Spent</Label>
                          <p className="text-xl font-semibold">
                            €{selectedClient.averageSpent}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm">Loyalty Points</Label>
                          <p className="text-xl font-semibold">
                            {selectedClient.loyaltyPoints}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Label className="text-sm">Loyalty Tier</Label>
                        <div
                          className={`text-lg font-semibold ${
                            getLoyaltyTier(selectedClient.loyaltyPoints).color
                          }`}
                        >
                          {getLoyaltyTier(selectedClient.loyaltyPoints).tier}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedClient.notes}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Booking History Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>
                      Complete history of {selectedClient.name}'s appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Professional</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getClientBookings(selectedClient.id).length > 0 ? (
                          getClientBookings(selectedClient.id).map(
                            (booking) => (
                              <TableRow key={booking.id}>
                                <TableCell className="font-medium">
                                  {booking.service}
                                </TableCell>
                                <TableCell>{booking.professional}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                      {new Date(
                                        booking.date
                                      ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {booking.time}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    €{booking.amount}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      booking.status === "completed"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-blue-100 text-blue-800 border-blue-200"
                                    }
                                  >
                                    {booking.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No bookings found for this client
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Preferences</CardTitle>
                    <CardDescription>
                      {selectedClient.name}'s preferred services and
                      professionals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Preferred Services
                      </Label>
                      <div className="flex gap-2 mt-2">
                        {selectedClient.preferredServices.map(
                          (
                            service:
                              | string
                              | number
                              | boolean
                              | ReactElement<
                                  any,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | ReactPortal
                              | Iterable<ReactNode>
                              | null
                              | undefined,
                            index: Key | null | undefined
                          ) => (
                            <Badge key={index} variant="outline">
                              {service}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">
                          Client Since
                        </Label>
                        <p className="text-sm mt-1">
                          {new Date(
                            selectedClient.joinDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Last Visit
                        </Label>
                        <p className="text-sm mt-1">
                          {new Date(
                            selectedClient.lastVisit
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Referrals Made
                        </Label>
                        <p className="text-sm mt-1">
                          {selectedClient.referrals} clients
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getStatusColor(
                            selectedClient.status
                          )}`}
                        >
                          {selectedClient.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information</DialogDescription>
          </DialogHeader>
          {editingClientData && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editingClientData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingClientData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingClientData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birth Date</Label>
                  <Input
                    type="date"
                    value={editingClientData.birthDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        birthDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editingClientData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingClientData({
                      ...editingClientData,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editingClientData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditingClientData({
                      ...editingClientData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClientSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {clientToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={handleDeleteClient}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
