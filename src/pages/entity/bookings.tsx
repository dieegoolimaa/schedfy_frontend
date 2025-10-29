import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { getAvailableTimeSlots, generateTimeSlots } from "../../lib/utils";

export function BookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const {
    bookings,
    loading,
    createBooking,
    cancelBooking,
    confirmBooking,
    fetchBookings,
  } = useBookings({ entityId, autoFetch: true });

  const { services, fetchServices } = useServices({ entityId });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (entityId) {
      fetchBookings();
      fetchServices();
    }
  }, [entityId, fetchBookings, fetchServices]);

  // Reset form
  const resetForm = () => {
    setFormData({
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      serviceId: "",
      date: "",
      time: "",
      notes: "",
    });
  };

  // Handle create booking
  const handleCreateBooking = async () => {
    if (
      !formData.clientName ||
      !formData.serviceId ||
      !formData.date ||
      !formData.time
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Find the selected service
    const selectedService = services.find((s) => s.id === formData.serviceId);
    if (!selectedService) {
      toast.error("Please select a valid service");
      return;
    }

    try {
      // Combine date and time into ISO datetime strings
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(
        startDateTime.getMinutes() + (selectedService.duration || 60)
      );

      await createBooking({
        entityId,
        serviceId: formData.serviceId,
        clientInfo: {
          name: formData.clientName,
          email: formData.clientEmail || undefined,
          phone: formData.clientPhone || undefined,
          notes: formData.notes || undefined,
        },
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        status: "confirmed", // Simple Service bookings are auto-confirmed
        notes: formData.notes || undefined,
        pricing: {
          basePrice: selectedService.price || 0,
          totalPrice: selectedService.price || 0,
          currency: selectedService.currency || "EUR",
        },
        createdBy: user?.id || "",
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create booking:", error);
    }
  };

  // Handle confirm booking
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
    } catch (error) {
      console.error("Failed to confirm booking:", error);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId, "Cancelled by user");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.client?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.service?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.client?.phone || "").includes(searchTerm) ||
      (booking.client?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const today = new Date();
    const bookingDate = new Date(booking.startTime);
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = bookingDate.toDateString() === today.toDateString();
    } else if (dateFilter === "week") {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDate = bookingDate >= today && bookingDate <= weekFromNow;
    } else if (dateFilter === "month") {
      matchesDate =
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Generate available time slots based on selected service and date
  const selectedService = services.find((s) => s.id === formData.serviceId);
  const availableTimeSlots =
    formData.date && selectedService
      ? getAvailableTimeSlots(
          generateTimeSlots(9, 18, 60), // 9 AM to 6 PM, 1-hour intervals
          formData.date,
          selectedService.duration || 60,
          bookings
        )
      : [];

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    totalRevenue: bookings
      .filter((b) => b.status === "completed")
      .reduce(
        (sum, b) =>
          sum +
          ((b.service as any)?.pricing?.basePrice ||
            (b.service as any)?.price ||
            0),
        0
      ),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("bookings.title", "Bookings")}
          </h1>
          <p className="text-muted-foreground">
            {t("bookings.subtitle", "Manage your appointment bookings")}
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
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Add a new appointment to your schedule.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name *</Label>
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
                    <Label htmlFor="client-phone">Phone Number</Label>
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
                  <Label htmlFor="client-email">Email (Optional)</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
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
                          {service.name} - €{service.price} ({service.duration}{" "}
                          min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
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
                    <Label htmlFor="time">Time *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) =>
                        setFormData({ ...formData, time: value })
                      }
                      disabled={!formData.date || !formData.serviceId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !formData.date
                              ? "Select date first"
                              : !formData.serviceId
                              ? "Select service first"
                              : "Select time slot"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-slots" disabled>
                            No available slots
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special requirements..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBooking} disabled={loading}>
                    {loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Booking
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
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
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting"
          color="yellow"
        />
        <MobileStatsCard
          title="Completed"
          value={stats.completed}
          subtitle="Finished"
          color="purple"
        />
        <MobileStatsCard
          title="Cancelled"
          value={stats.cancelled}
          subtitle="Canceled"
          color="red"
        />
        <MobileStatsCard
          title="Revenue"
          value={`€${stats.totalRevenue}`}
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
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Booking List</CardTitle>
              <CardDescription>
                All your appointments in a simple list format
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Loading bookings...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">
                          No bookings found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {booking.client?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.client?.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.client.phone}
                                </div>
                              )}
                              {booking.client?.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {booking.client.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {booking.service?.name || "Unknown Service"}
                          </div>
                          {booking.notes && (
                            <div className="text-sm text-muted-foreground">
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
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {booking.service?.duration.duration || 0} min
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            €
                            {(booking.service as any)?.pricing?.basePrice ||
                              (booking.service as any)?.price ||
                              0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              booking.status
                            )} flex items-center gap-1 w-fit`}
                          >
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {booking.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleConfirmBooking(booking.id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm Booking
                                  </DropdownMenuItem>
                                )}
                                {booking.status !== "cancelled" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Calendar View (Simplified for Simple Plan) */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                View your appointments in calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Calendar Coming Soon
                </h3>
                <p className="text-muted-foreground mb-4">
                  Calendar view will be available in a future update.
                </p>
                <Button variant="outline">
                  Upgrade to Individual Plan for Advanced Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
