import { useState } from "react";
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
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useServices } from "../../hooks/useServices";
import { getAvailableTimeSlots, generateTimeSlots } from "../../lib/utils";

export function IndividualBookingsPage() {
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const { bookings, createBooking } = useBookings({
    entityId,
    autoFetch: true,
  });
  const { services } = useServices({ entityId });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // Form state for creating bookings
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    serviceId: "",
    date: "",
    time: "",
    duration: "",
    price: "",
    notes: "",
  });

  // Handle form submission
  const handleCreateBooking = async () => {
    if (!formData.serviceId || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (!selectedService) {
        toast.error("Selected service not found");
        return;
      }

      // Calculate start and end times
      const [hours, minutes] = formData.time.split(":").map(Number);
      const startDateTime = new Date(formData.date);
      startDateTime.setHours(hours, minutes, 0, 0);

      const duration =
        parseInt(formData.duration) || selectedService.duration || 60;
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      const bookingData = {
        entityId,
        serviceId: formData.serviceId,
        clientInfo: {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          notes: formData.notes,
        },
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        status: "confirmed" as const,
        notes: formData.notes,
        pricing: {
          basePrice: parseFloat(formData.price) || selectedService.price,
          currency: selectedService.currency,
          totalPrice: parseFloat(formData.price) || selectedService.price,
        },
        createdBy: user?.id || "",
      };

      await createBooking(bookingData);

      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        serviceId: "",
        date: "",
        time: "",
        duration: "",
        price: "",
        notes: "",
      });

      toast.success("Booking created successfully!");
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  // Generate available time slots based on selected service and date
  const selectedService = services.find((s) => s.id === formData.serviceId);
  const availableTimeSlots =
    formData.date && selectedService
      ? getAvailableTimeSlots(
          generateTimeSlots(9, 18, 60), // 9 AM to 6 PM, 1-hour intervals
          formData.date,
          parseInt(formData.duration) || selectedService.duration || 60,
          bookings
        )
      : [];

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
      booking.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const today = new Date().toISOString().split("T")[0];
    const bookingDate = new Date(booking.startTime).toISOString().split("T")[0];
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && bookingDate === today) ||
      (dateFilter === "upcoming" && bookingDate >= today);

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
      .reduce(
        (sum, b) => sum + ((b.service as any)?.pricing?.basePrice || 0),
        0
      ),
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
                    <Input
                      id="client-name"
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      placeholder="+351 123 456 789"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="client@email.com"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) =>
                        setFormData({ ...formData, time: value })
                      }
                      disabled={!formData.date || !formData.serviceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special requests or notes..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleCreateBooking}>Create Booking</Button>
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
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Total"
          value={stats.total}
          subtitle="Bookings"
          color="blue"
        />
        <MobileStatsCard
          title="Confirmed"
          value={stats.confirmed}
          subtitle="Scheduled"
          color="green"
        />
        <MobileStatsCard
          title="Completed"
          value={stats.completed}
          subtitle="Finished"
          color="purple"
        />
        <MobileStatsCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting"
          color="yellow"
        />
        <MobileStatsCard
          title="Cancelled"
          value={stats.cancelled}
          subtitle="Canceled"
          color="red"
        />
        <MobileStatsCard
          title="Revenue"
          value={`€${stats.revenue}`}
          subtitle="Total"
          color="blue"
        />
      </ResponsiveCardGrid>

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
                              {(booking.client?.name || "Walk-in Client")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {booking.client?.name || "Walk-in Client"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {booking.client?.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {booking.service?.name || "Service"}
                        </div>
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
                            {new Date(booking.startTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(booking.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.round(
                          (new Date(booking.endTime).getTime() -
                            new Date(booking.startTime).getTime()) /
                            (1000 * 60)
                        )}{" "}
                        min
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          €{(booking.service as any)?.pricing?.basePrice || 0}
                        </span>
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
