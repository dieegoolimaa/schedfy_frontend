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
  MoreHorizontal,
  TrendingUp,
  Euro,
  Heart,
  Users,
} from "lucide-react";

export function ClientProfilePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock clients data
  const clients = [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "+351 123 456 789",
      avatar: "AS",
      status: "active",
      joinDate: "2023-01-15",
      lastVisit: "2024-01-20",
      totalBookings: 24,
      totalSpent: 980,
      averageSpent: 40.83,
      preferredServices: ["Haircut & Styling", "Hair Coloring"],
      notes: "Prefers appointments in the morning. Allergic to ammonia.",
      address: "Rua das Flores, 123, Lisboa",
      birthDate: "1985-03-15",
      loyaltyPoints: 245,
      referrals: 3,
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "+351 987 654 321",
      avatar: "JS",
      status: "active",
      joinDate: "2023-03-10",
      lastVisit: "2024-01-18",
      totalBookings: 15,
      totalSpent: 450,
      averageSpent: 30,
      preferredServices: ["Haircut", "Beard Trim"],
      notes: "Regular client, comes every 3 weeks.",
      address: "Avenida da Liberdade, 456, Lisboa",
      birthDate: "1978-07-22",
      loyaltyPoints: 150,
      referrals: 1,
    },
    {
      id: 3,
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      phone: "+351 555 123 456",
      avatar: "MO",
      status: "active",
      joinDate: "2022-11-20",
      lastVisit: "2024-01-19",
      totalBookings: 42,
      totalSpent: 1890,
      averageSpent: 45,
      preferredServices: ["Hair Coloring", "Hair Treatment", "Styling"],
      notes: "VIP client. Prefers Sofia as stylist.",
      address: "Rua Augusta, 789, Lisboa",
      birthDate: "1990-12-05",
      loyaltyPoints: 420,
      referrals: 5,
    },
    {
      id: 4,
      name: "Pedro Costa",
      email: "pedro.costa@email.com",
      phone: "+351 444 555 666",
      avatar: "PC",
      status: "inactive",
      joinDate: "2023-06-01",
      lastVisit: "2023-11-15",
      totalBookings: 8,
      totalSpent: 240,
      averageSpent: 30,
      preferredServices: ["Haircut"],
      notes: "Has not visited in over 2 months.",
      address: "Praça do Comércio, 321, Lisboa",
      birthDate: "1992-04-18",
      loyaltyPoints: 80,
      referrals: 0,
    },
  ];

  const recentBookings = [
    {
      id: 1,
      clientId: 1,
      clientName: "Ana Silva",
      service: "Haircut & Styling",
      date: "2024-01-20",
      time: "10:00",
      professional: "Sofia Oliveira",
      amount: 35,
      status: "completed",
    },
    {
      id: 2,
      clientId: 2,
      clientName: "João Santos",
      service: "Beard Trim",
      date: "2024-01-20",
      time: "14:30",
      professional: "Carlos Ferreira",
      amount: 15,
      status: "completed",
    },
    {
      id: 3,
      clientId: 3,
      clientName: "Maria Oliveira",
      service: "Hair Coloring",
      date: "2024-01-19",
      time: "09:00",
      professional: "Sofia Oliveira",
      amount: 85,
      status: "completed",
    },
  ];

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
      client.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
    vip: clients.filter((c) => c.loyaltyPoints >= 400).length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    averageSpent:
      clients.reduce((sum, c) => sum + c.averageSpent, 0) / clients.length,
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
                    <Label htmlFor="client-name">Full Name</Label>
                    <Input id="client-name" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input id="client-phone" placeholder="+351 123 456 789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth-date">Birth Date</Label>
                    <Input id="birth-date" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street address, city" />
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
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Client</Button>
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
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                  {filteredClients.map((client) => {
                    const loyaltyInfo = getLoyaltyTier(client.loyaltyPoints);
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
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Member since{" "}
                                {new Date(client.joinDate).toLocaleDateString()}
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
                              {new Date(client.lastVisit).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className={`font-medium ${loyaltyInfo.color}`}>
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
                              Avg: €{client.averageSpent.toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(client.status)}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
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
                  .sort((a, b) => b.totalSpent - a.totalSpent)
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
                          {getLoyaltyTier(client.loyaltyPoints).tier}
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
    </div>
  );
}
