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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Star,
  Euro,
  Zap,
} from "lucide-react";

export function IndividualBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Mock bookings data for Individual plan
  const bookings = [
    {
      id: 1,
      clientName: "Ana Silva",
      clientEmail: "ana.silva@email.com",
      clientPhone: "+351 123 456 789",
      service: "Hair Coloring + Styling",
      date: "2024-01-20",
      time: "10:00",
      duration: 120,
      price: 85,
      status: "confirmed",
      notes: "First time client, prefers natural colors",
      aiSuggestion: "Recommend hair treatment for damaged hair",
    },
    {
      id: 2,
      clientName: "Maria Santos",
      clientEmail: "maria.santos@email.com",
      clientPhone: "+351 987 654 321",
      service: "Haircut & Blow Dry",
      date: "2024-01-20",
      time: "14:30",
      duration: 60,
      price: 45,
      status: "completed",
      notes: "Regular client, usual style",
      aiSuggestion: "Client satisfaction is high, consider loyalty rewards",
    },
    {
      id: 3,
      clientName: "João Costa",
      clientEmail: "joao.costa@email.com",
      clientPhone: "+351 555 123 456",
      service: "Hair Treatment",
      date: "2024-01-21",
      time: "09:30",
      duration: 90,
      price: 65,
      status: "pending",
      notes: "Deep conditioning treatment requested",
      aiSuggestion: "Follow up with hair care routine recommendations",
    },
    {
      id: 4,
      clientName: "Carla Oliveira",
      clientEmail: "carla.oliveira@email.com",
      clientPhone: "+351 444 555 666",
      service: "Wedding Styling",
      date: "2024-01-22",
      time: "08:00",
      duration: 180,
      price: 150,
      status: "confirmed",
      notes: "Wedding at 14:00, romantic style preferred",
      aiSuggestion: "Schedule trial session beforehand",
    },
    {
      id: 5,
      clientName: "Pedro Silva",
      clientEmail: "pedro.silva@email.com",
      clientPhone: "+351 777 888 999",
      service: "Color Correction",
      date: "2024-01-19",
      time: "11:00",
      duration: 240,
      price: 120,
      status: "cancelled",
      notes: "Previous color job went wrong, needs correction",
      aiSuggestion: "Reschedule with extra time buffer",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const today = new Date().toISOString().split("T")[0];
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && booking.date === today) ||
      (dateFilter === "upcoming" && booking.date >= today);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    revenue: bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.price, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Booking Management
          </h1>
          <p className="text-muted-foreground">
            Manage appointments with AI-powered insights • Individual Plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input id="client-name" placeholder="Enter client name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input id="client-phone" placeholder="+351 123 456 789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="client@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="haircut">
                          Haircut & Styling
                        </SelectItem>
                        <SelectItem value="coloring">Hair Coloring</SelectItem>
                        <SelectItem value="treatment">
                          Hair Treatment
                        </SelectItem>
                        <SelectItem value="wedding">Wedding Styling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input id="price" type="number" placeholder="45" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" type="number" placeholder="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special requests or notes..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Booking</Button>
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
            <CardTitle className="text-purple-900">AI Assistant</CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Intelligent booking insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Star className="h-4 w-4 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-sm">Optimization Tip</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consider 15-minute buffer between long treatments for better
                    schedule flow
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Euro className="h-4 w-4 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-sm">Revenue Insight</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wedding bookings show 40% higher average value - promote
                    seasonal packages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.confirmed}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
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
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">€{stats.revenue}</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Booking List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                Manage your appointments with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Insight</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {booking.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {booking.clientName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {booking.clientPhone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.service}</div>
                        {booking.notes && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {booking.notes}
                          </div>
                        )}
                      </TableCell>
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
                      <TableCell>{booking.duration} min</TableCell>
                      <TableCell>
                        <span className="font-medium">€{booking.price}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(booking.status)}
                          <Badge
                            variant="outline"
                            className={`ml-2 ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-purple-600">
                          <Zap className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {booking.aiSuggestion}
                          </span>
                        </div>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Visual calendar with booking overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Calendar integration coming soon</p>
                <p className="text-sm">
                  Full calendar view with drag-and-drop scheduling
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Patterns</CardTitle>
                <CardDescription>
                  AI analysis of your booking trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Peak Time Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Most bookings occur between 14:00-16:00. Consider
                        premium pricing during peak hours.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Star className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Service Popularity
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hair coloring services have 85% rebooking rate. Perfect
                        for building loyal clientele.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Euro className="h-4 w-4 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Revenue Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bundle treatments with styling for 25% higher average
                        transaction value.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Insights</CardTitle>
                <CardDescription>
                  Understanding your client base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Client Preferences
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        65% of clients prefer morning appointments. Optimize
                        your schedule accordingly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">
                        Communication Tips
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send reminder 24h before appointments to reduce no-shows
                        by 40%.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-red-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-sm">Seasonal Trends</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Wedding season approaching - expect 60% increase in
                        styling bookings.
                      </p>
                    </div>
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
