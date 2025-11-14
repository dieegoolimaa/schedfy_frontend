import { useState, useEffect, useMemo } from "react";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { useCurrency } from "../../hooks/useCurrency";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";
import { BookingCreator } from "../../components/booking";
import { BookingsKanban } from "../../components/bookings/bookings-kanban";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { EditBookingDialog } from "../../components/dialogs/edit-dialogs";
import { CalendarView } from "../../components/calendar/CalendarView";
import {
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  User,
  Calendar as CalendarIcon,
  CreditCard,
  Eye,
  DollarSign,
  Hourglass,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import PaymentForm from "../../components/payments/PaymentForm";

export function BookingManagementPage() {
  const { t } = useTranslation("bookings");
  const { canViewPricing, canViewPaymentDetails } = usePlanRestrictions();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const entityId = user?.entityId || user?.id || "";
  console.log("[BookingManagementPage] entityId from user context:", entityId);

  // Use the bookings hook with real API
  const {
    bookings,
    loading,
    fetchBookings,
    completeBooking,
    cancelBooking,
    createBooking: _createBooking,
    updateBooking,
  } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // View mode state (list or kanban)
  const [viewMode, setViewMode] = useState<"list" | "kanban">(() => {
    const saved = localStorage.getItem("bookingsViewMode");
    return (saved as "list" | "kanban") || "list";
  });

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem("bookingsViewMode", viewMode);
  }, [viewMode]);

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Additional filter states
  const [serviceFilter, setServiceFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const handlePaymentClick = (booking: any) => {
    setSelectedBookingForPayment(booking);
    setPaymentDialogOpen(true);
  };

  // Handle manual confirmation of bookings
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await apiClient.patch(`/api/bookings/${bookingId}/confirm`);
      toast.success("Booking confirmed successfully");
      fetchBookings();
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      toast.error("Failed to confirm booking");
    }
  };

  const handleRejectBooking = async (bookingId: string, reason?: string) => {
    try {
      await apiClient.patch(`/api/bookings/${bookingId}/reject`, {
        reason: reason || "Booking rejected by professional",
      });
      toast.success("Booking rejected");
      fetchBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
      toast.error("Failed to reject booking");
    }
  };

  // View booking details
  const handleViewDetails = (booking: any) => {
    setSelectedBookingDetails(booking);
    setIsDetailsDialogOpen(true);
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
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      case "no-show":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Fetch related entities so we can display names instead of raw IDs
  const { clients } = useClients({ entityId, autoFetch: true });
  const { services: servicesFromApi } = useServices({
    entityId,
    autoFetch: true,
  });

  const [professionalsList, setProfessionalsList] = useState<any[]>([]);
  useEffect(() => {
    if (!entityId) {
      console.log(
        "[BookingManagement] No entityId, skipping professionals load"
      );
      return;
    }

    let mounted = true;
    (async () => {
      try {
        console.log(
          "[BookingManagement] Fetching professionals for entityId:",
          entityId
        );
        // Correct endpoint: /api/users with role=professional
        const res: any = await apiClient.get("/api/users", {
          entityId,
          role: "professional",
        });
        console.log("[BookingManagement] Full API response:", res);

        const data = res?.data || [];
        console.log(
          "[BookingManagement] Professionals loaded:",
          data.length,
          "items",
          data
        );
        if (mounted) setProfessionalsList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("[BookingManagement] Error loading professionals:", e);
        if (mounted) setProfessionalsList([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [entityId]);

  // USE REAL DATA FROM API (not mocks!)
  const services = servicesFromApi || [];

  // Load entity data to get working hours
  const [_entityData, setEntityData] = useState<any>(null);
  useEffect(() => {
    if (!entityId) return;

    (async () => {
      try {
        console.log(
          "[BookingManagement] Loading entity data for ID:",
          entityId
        );
        const res = await apiClient.get(`/business/entity/${entityId}`);
        console.log("[BookingManagement] Entity data loaded:", res.data);
        setEntityData(res.data);
      } catch (e) {
        console.error("[BookingManagement] Error loading entity:", e);
      }
    })();
  }, [entityId]);

  // Generate time slots based on entity working hours
  // Available for future use with calendar/scheduling features
  // @ts-ignore - Function available for future use
  const _generateTimeSlots = (
    workingHours: any,
    selectedDate?: string
  ): string[] => {
    if (!workingHours) {
      // Default slots if no working hours configured
      return [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
      ];
    }

    const dayOfWeek = selectedDate
      ? new Date(selectedDate)
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase()
      : "monday";

    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule?.enabled) {
      return []; // Closed on this day
    }

    const slots: string[] = [];
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    };

    const start = parseTime(daySchedule.start);
    const end = parseTime(daySchedule.end);
    const breakStart = daySchedule.breakStart
      ? parseTime(daySchedule.breakStart)
      : null;
    const breakEnd = daySchedule.breakEnd
      ? parseTime(daySchedule.breakEnd)
      : null;

    // Generate slots every 30 minutes
    for (let time = start; time < end; time += 30) {
      // Skip break time
      if (breakStart && breakEnd && time >= breakStart && time < breakEnd) {
        continue;
      }
      slots.push(formatTime(time));
    }

    return slots;
  };

  // Debug: Log when real data loads
  useEffect(() => {
    if (servicesFromApi && servicesFromApi.length > 0) {
      console.log(
        "[BookingManagement] ✅ REAL SERVICES LOADED FROM API:",
        servicesFromApi
      );
    }
  }, [servicesFromApi]);

  useEffect(() => {
    if (professionalsList && professionalsList.length > 0) {
      console.log(
        "[BookingManagement] ✅ REAL PROFESSIONALS LOADED FROM API:",
        professionalsList
      );
    }
  }, [professionalsList]);

  useEffect(() => {
    if (clients && clients.length > 0) {
      console.log(
        "[BookingManagement] ✅ REAL CLIENTS LOADED FROM API:",
        clients
      );
    }
  }, [clients]);

  useEffect(() => {
    console.log("[BookingManagement] BOOKINGS DATA:", {
      count: bookings.length,
      loading,
      bookings,
      entityId,
    });
  }, [bookings, loading, entityId]);

  // Derive bookings with populated client/service/professional objects when available
  const displayBookings = useMemo(() => {
    return bookings.map((b) => {
      // Resolve client
      const clientObj =
        b.client && typeof b.client === "object"
          ? b.client
          : clients.find((c: any) => String(c.id) === String(b.clientId)) ||
            (b.client
              ? { id: b.client, name: String(b.client), isFirstTime: false }
              : undefined);

      // Resolve service
      const serviceObj =
        b.service && typeof b.service === "object"
          ? b.service
          : servicesFromApi.find(
              (s: any) => String(s.id) === String(b.serviceId)
            ) ||
            (b.serviceId
              ? { id: b.serviceId, name: String(b.serviceId), price: 0 }
              : undefined);

      // Resolve professional
      const professionalObj =
        b.professional && typeof b.professional === "object"
          ? b.professional
          : professionalsList.find(
              (p: any) => String(p.id) === String(b.professionalId)
            ) ||
            (b.professionalId
              ? { id: b.professionalId, name: String(b.professionalId) }
              : undefined);

      return {
        ...b,
        client: clientObj,
        service: serviceObj,
        professional: professionalObj,
      };
    });
  }, [bookings, clients, servicesFromApi, professionalsList]);

  const filteredBookings = displayBookings.filter((booking) => {
    const matchesSearch =
      (booking.client?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.service?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.professional?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClientSearch =
      clientSearchTerm === "" ||
      (booking.client?.name || "")
        .toLowerCase()
        .includes(clientSearchTerm.toLowerCase()) ||
      (booking.client?.email || "")
        .toLowerCase()
        .includes(clientSearchTerm.toLowerCase()) ||
      (
        (booking.client && "phone" in booking.client && booking.client.phone) ||
        ""
      ).includes(clientSearchTerm);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const today = new Date().toISOString().split("T")[0];
    const bookingDate = booking.startTime
      ? booking.startTime.split("T")[0]
      : "";
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && bookingDate === today) ||
      (dateFilter === "upcoming" && new Date(bookingDate) > new Date(today)) ||
      (dateFilter === "past" && new Date(bookingDate) < new Date(today));

    const matchesService =
      serviceFilter === "all" || booking.service?.name === serviceFilter;

    const matchesProfessional =
      professionalFilter === "all" ||
      booking.professional?.name === professionalFilter;

    // Payment status removed as it's not in the Booking model
    const matchesPayment = paymentFilter === "all"; // Placeholder

    return (
      matchesSearch &&
      matchesClientSearch &&
      matchesStatus &&
      matchesDate &&
      matchesService &&
      matchesProfessional &&
      matchesPayment
    );
  });

  console.log("[BookingManagement] Filtering:", {
    totalBookings: displayBookings.length,
    filteredBookings: filteredBookings.length,
    dateFilter,
    today: new Date().toISOString().split("T")[0],
    bookings: displayBookings.map((b) => ({
      id: b.id,
      startTime: b.startTime,
      bookingDate: b.startTime ? b.startTime.split("T")[0] : "",
      client: b.client?.name,
      service: b.service?.name,
      professional: b.professional?.name,
    })),
  });

  const stats = {
    total: displayBookings.length,
    confirmed: displayBookings.filter((b) => b.status === "confirmed").length,
    pending: displayBookings.filter((b) => b.status === "pending").length,
    pendingConfirmation: displayBookings.filter(
      (b) =>
        b.status === "pending" &&
        (b as any).service?.bookingSettings?.requireManualConfirmation
    ).length,
    completed: displayBookings.filter((b) => b.status === "completed").length,
    cancelled: displayBookings.filter((b) => b.status === "cancelled").length,
    revenue: displayBookings
      .filter((b) => b.service)
      .reduce(
        (sum, b) =>
          sum +
          ((b.service as any)?.pricing?.basePrice ||
            (b.service as any)?.price ||
            0),
        0
      ),
  };

  // Show loading skeleton
  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("bookings.management.title", "Booking Management")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "bookings.management.subtitle",
              "View, edit, and manage all bookings for your entity"
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center border rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">
                {t("views.list", "List")}
              </span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">
                {t("views.kanban", "Kanban")}
              </span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCalendarViewOpen(true)}
            className="hidden sm:flex"
          >
            <CalendarIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t("actions.calendar", "Calendar")}
            </span>
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t("actions.newBooking", "New Booking")}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title={t("stats.totalBookings", "Total Bookings")}
          value={stats.total}
          icon={CalendarIcon}
        />

        {/* Highlight Pending Confirmation if there are any */}
        {stats.pendingConfirmation > 0 && (
          <StatCard
            title={t("stats.awaitingConfirmation", "Awaiting Confirmation")}
            value={stats.pendingConfirmation}
            icon={AlertCircle}
            variant="warning"
            className="col-span-2 sm:col-span-1"
          />
        )}

        <StatCard
          title={t("stats.confirmed", "Confirmed")}
          value={stats.confirmed}
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          title={t("stats.pending", "Pending")}
          value={stats.pending}
          icon={Hourglass}
          variant="warning"
        />

        <StatCard
          title={t("stats.completed", "Completed")}
          value={stats.completed}
          icon={Clock}
          variant="info"
        />

        <StatCard
          title={t("stats.cancelled", "Cancelled")}
          value={stats.cancelled}
          icon={XCircle}
          variant="danger"
        />

        {canViewPricing && (
          <StatCard
            title={t("stats.revenue", "Revenue")}
            value={formatCurrency(stats.revenue)}
            icon={DollarSign}
            variant="success"
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.bookingsPlaceholder", "Search bookings...")}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="relative flex-1 md:flex-initial md:w-64">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.clientsPlaceholder", "Search clients...")}
            value={clientSearchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setClientSearchTerm(e.target.value)
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
              <SelectItem value="pending">⏳ Pending Confirmation</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
                <DialogDescription>
                  Apply additional filters to refine your booking search
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service-filter">Service</Label>
                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("filters.allServices", "All Services")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("filters.allServices", "All Services")}
                      </SelectItem>
                      <SelectItem value="Haircut & Styling">
                        Haircut & Styling
                      </SelectItem>
                      <SelectItem value="Full Manicure">
                        Full Manicure
                      </SelectItem>
                      <SelectItem value="Deep Tissue Massage">
                        Deep Tissue Massage
                      </SelectItem>
                      <SelectItem value="Color Treatment">
                        Color Treatment
                      </SelectItem>
                      <SelectItem value="Facial Treatment">
                        Facial Treatment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="professional-filter">Professional</Label>
                  <Select
                    value={professionalFilter}
                    onValueChange={setProfessionalFilter}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "filters.allProfessionals",
                          "All Professionals"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("filters.allProfessionals", "All Professionals")}
                      </SelectItem>
                      <SelectItem value="João Santos">João Santos</SelectItem>
                      <SelectItem value="Sofia Oliveira">
                        Sofia Oliveira
                      </SelectItem>
                      <SelectItem value="Carlos Ferreira">
                        Carlos Ferreira
                      </SelectItem>
                      <SelectItem value="Maria Silva">Maria Silva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {canViewPaymentDetails && (
                  <div>
                    <Label htmlFor="payment-filter">Payment Status</Label>
                    <Select
                      value={paymentFilter}
                      onValueChange={setPaymentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("filters.allPayments", "All Payments")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("filters.all", "All")}
                        </SelectItem>
                        <SelectItem value="paid">
                          {t("filters.paid", "Paid")}
                        </SelectItem>
                        <SelectItem value="pending">
                          {t("filters.pending", "Pending")}
                        </SelectItem>
                        <SelectItem value="partial">
                          {t("filters.partial", "Partial")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setServiceFilter("all");
                      setProfessionalFilter("all");
                      setPaymentFilter("all");
                    }}
                  >
                    {t("actions.clearFilters", "Clear Filters")}
                  </Button>
                  <Button onClick={() => setIsFilterDialogOpen(false)}>
                    {t("actions.applyFilters", "Apply Filters")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bookings View - List or Kanban (Kanban only on desktop) */}
      {viewMode === "list" ||
      (typeof window !== "undefined" && window.innerWidth < 768) ? (
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Complete list of all bookings with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Professional</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        {canViewPaymentDetails && (
                          <TableHead>Payment</TableHead>
                        )}
                        {canViewPricing && <TableHead>Revenue</TableHead>}
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    booking.client && "avatar" in booking.client
                                      ? (booking.client as { avatar?: string })
                                          .avatar
                                      : undefined
                                  }
                                />
                                <AvatarFallback className="text-xs">
                                  {booking.client?.name
                                    ? booking.client.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                    : ""}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {booking.client?.name}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.client &&
                                  "phone" in booking.client &&
                                  booking.client.phone
                                    ? booking.client.phone
                                    : ""}
                                </div>
                                {booking.client?.isFirstTime && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    First Time
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.service?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(booking.service as any)?.duration?.duration ||
                                  (booking.service as any)?.duration ||
                                  0}
                                min • {(booking.service as any)?.category}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1 text-muted-foreground" />
                              {booking.professional?.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.startTime
                                  ? new Date(
                                      booking.startTime
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {booking.startTime
                                  ? new Date(
                                      booking.startTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className={getStatusColor(booking.status)}
                              >
                                {getStatusIcon(booking.status)}
                                <span className="ml-1 capitalize">
                                  {booking.status}
                                </span>
                              </Badge>
                              {booking.status === "pending" &&
                                (booking as any).service?.bookingSettings
                                  ?.requireManualConfirmation && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-800 border-orange-200 text-xs"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Awaiting Confirmation
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                          {canViewPaymentDetails && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={getPaymentStatusColor(
                                    booking.paymentStatus || "pending"
                                  )}
                                >
                                  {booking.paymentStatus || "pending"}
                                </Badge>
                                {booking.paymentStatus === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePaymentClick(booking)}
                                  >
                                    Process
                                  </Button>
                                )}
                                {booking.paymentStatus === "paid" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePaymentClick(booking)}
                                  >
                                    Details
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                          {canViewPricing && (
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(
                                  (booking.service as any)?.pricing
                                    ?.basePrice ||
                                    (booking.service as any)?.price ||
                                    0
                                )}
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {/* View Details Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(booking)}
                                title={t("actions.viewDetails", "View Details")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {/* Quick Confirm Button for Pending Bookings */}
                              {booking.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmBooking(booking.id)
                                  }
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title={t(
                                    "actions.confirmBooking",
                                    "Confirm Booking"
                                  )}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {/* More Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const editData = {
                                        id: booking.id.toString(),
                                        clientName: booking.client?.name || "",
                                        clientEmail:
                                          booking.client?.email || "",
                                        serviceName:
                                          booking.service?.name || "",
                                        professionalName:
                                          booking.professional?.name || "",
                                        professionalId:
                                          booking.professionalId || "",
                                        date: booking.startTime
                                          ? new Date(booking.startTime)
                                              .toISOString()
                                              .split("T")[0]
                                          : "",
                                        time: booking.startTime
                                          ? new Date(
                                              booking.startTime
                                            ).toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: false,
                                            })
                                          : "",
                                        duration:
                                          (booking.service as any)?.duration
                                            ?.duration ||
                                          (booking.service as any)?.duration ||
                                          60,
                                        price:
                                          (booking.service as any)?.pricing
                                            ?.basePrice ||
                                          (booking.service as any)?.price ||
                                          0,
                                        status: booking.status,
                                        notes: booking.notes || "",
                                      };

                                      console.log(
                                        "[BookingManagement] Opening edit dialog with",
                                        professionalsList.length,
                                        "professionals:",
                                        professionalsList
                                      );
                                      console.log(
                                        "[BookingManagement] Edit data:",
                                        editData
                                      );
                                      setEditingBooking(editData);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Booking
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBookingDetails(booking);
                                      setIsDetailsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />

                                  {/* Confirm/Reject actions for pending bookings */}
                                  {booking.status === "pending" &&
                                    (booking as any).service?.bookingSettings
                                      ?.requireManualConfirmation && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={async () => {
                                            if (
                                              confirm(
                                                "Confirm this booking? The client will be notified."
                                              )
                                            ) {
                                              await handleConfirmBooking(
                                                booking.id
                                              );
                                            }
                                          }}
                                          className="text-green-600"
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Confirm Booking
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={async () => {
                                            const reason = prompt(
                                              "Reason for rejection (optional):"
                                            );
                                            if (reason !== null) {
                                              await handleRejectBooking(
                                                booking.id,
                                                reason
                                              );
                                            }
                                          }}
                                          className="text-red-600"
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Reject Booking
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                  <DropdownMenuItem
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          t(
                                            "confirmations.markCompleted",
                                            "Are you sure you want to mark this booking as completed?"
                                          )
                                        )
                                      ) {
                                        try {
                                          await completeBooking(booking.id);
                                          toast.success(
                                            t(
                                              "messages.bookingCompleted",
                                              "Booking completed successfully"
                                            )
                                          );
                                          fetchBookings();
                                        } catch (error) {
                                          toast.error(
                                            t(
                                              "messages.failedComplete",
                                              "Failed to complete booking"
                                            )
                                          );
                                          console.error(error);
                                        }
                                      }
                                    }}
                                    disabled={booking.status === "completed"}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t(
                                      "actions.markCompleted",
                                      "Mark as Completed"
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          t(
                                            "confirmations.cancelBooking",
                                            "Are you sure you want to cancel this booking?"
                                          )
                                        )
                                      ) {
                                        try {
                                          await cancelBooking(booking.id);
                                          toast.success(
                                            t(
                                              "messages.bookingCancelled",
                                              "Booking cancelled successfully"
                                            )
                                          );
                                          fetchBookings();
                                        } catch (error) {
                                          toast.error(
                                            t(
                                              "messages.failedCancel",
                                              "Failed to cancel booking"
                                            )
                                          );
                                          console.error(error);
                                        }
                                      }
                                    }}
                                    disabled={
                                      booking.status === "cancelled" ||
                                      booking.status === "completed"
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t(
                                      "actions.cancelBooking",
                                      "Cancel Booking"
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handlePaymentClick(booking)}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {t(
                                      "actions.processPayment",
                                      "Process Payment"
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {t("kanban.title", "Kanban Board")} ({filteredBookings.length}{" "}
                {t("kanban.bookings", "bookings")})
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "kanban.description",
                  "Drag and drop bookings to update their status"
                )}
              </p>
            </div>
          </div>
          <BookingsKanban
            bookings={filteredBookings.map((booking) => ({
              _id: booking.id,
              clientId: {
                _id: booking.client?.id || "",
                firstName: booking.client?.name?.split(" ")[0] || "Unknown",
                lastName:
                  booking.client?.name?.split(" ").slice(1).join(" ") || "",
                avatar:
                  booking.client && "avatar" in booking.client
                    ? (booking.client.avatar as string | undefined)
                    : undefined,
              },
              serviceId: booking.service
                ? {
                    _id: booking.service.id || "",
                    name: booking.service.name || "",
                  }
                : undefined,
              professionalId: booking.professional
                ? {
                    _id: booking.professional.id || "",
                    firstName: booking.professional.name?.split(" ")[0] || "",
                    lastName:
                      booking.professional.name
                        ?.split(" ")
                        .slice(1)
                        .join(" ") || "",
                  }
                : undefined,
              date: booking.date || "",
              time: booking.time || "",
              status: booking.status === "no-show" ? "no_show" : booking.status,
              totalPrice:
                "price" in booking && typeof booking.price === "number"
                  ? booking.price
                  : "totalPrice" in booking &&
                    typeof booking.totalPrice === "number"
                  ? booking.totalPrice
                  : 0,
              isRecurring:
                "recurrenceParentId" in booking && booking.recurrenceParentId
                  ? true
                  : false,
              recurrenceParentId:
                "recurrenceParentId" in booking
                  ? (booking.recurrenceParentId as string)
                  : undefined,
            }))}
            onRefresh={fetchBookings}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <EditBookingDialog
        booking={editingBooking}
        isOpen={isEditDialogOpen}
        professionals={professionalsList}
        entityId={entityId}
        onClose={() => {
          console.log("[BookingManagement] Closing edit dialog");
          setIsEditDialogOpen(false);
          setEditingBooking(null);
        }}
        onSave={async (updatedBooking) => {
          try {
            // Prepare data for API update
            const updateData: any = {
              status: updatedBooking.status,
              notes: updatedBooking.notes,
            };

            // If professional changed, update professionalId
            if (updatedBooking.professionalId) {
              updateData.professionalId = updatedBooking.professionalId;
            }

            // If date/time changed, update startDateTime and endDateTime
            if (updatedBooking.date && updatedBooking.time) {
              const [hours, minutes] = updatedBooking.time.split(":");
              const startDateTime = new Date(updatedBooking.date);
              startDateTime.setHours(
                Number.parseInt(hours),
                Number.parseInt(minutes),
                0,
                0
              );

              const endDateTime = new Date(startDateTime);
              endDateTime.setMinutes(
                startDateTime.getMinutes() + (updatedBooking.duration || 60)
              );

              updateData.startDateTime = startDateTime.toISOString();
              updateData.endDateTime = endDateTime.toISOString();
            }

            await updateBooking(updatedBooking.id, updateData);
            toast.success("Booking updated successfully");
            setIsEditDialogOpen(false);
            setEditingBooking(null);
            fetchBookings();
          } catch (error) {
            console.error("Failed to update booking:", error);
            toast.error("Failed to update booking");
          }
        }}
      />

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Management</DialogTitle>
            <DialogDescription>
              Manage payment for{" "}
              {selectedBookingForPayment?.client?.name || "client"}'s booking
            </DialogDescription>
          </DialogHeader>
          {selectedBookingForPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Booking Details</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Service:</strong>{" "}
                      {selectedBookingForPayment.service?.name || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Professional:</strong>{" "}
                      {selectedBookingForPayment.professional?.name || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong>{" "}
                      {selectedBookingForPayment.startTime
                        ? new Date(
                            selectedBookingForPayment.startTime
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}{" "}
                      at{" "}
                      {selectedBookingForPayment.startTime
                        ? new Date(
                            selectedBookingForPayment.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Duration:</strong>{" "}
                      {selectedBookingForPayment.service?.duration || 0}min
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Payment Information
                  </Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Amount:</strong> €
                      {selectedBookingForPayment.service?.price || 0}
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-md text-xs font-medium border ${getPaymentStatusColor(
                          selectedBookingForPayment.paymentStatus || "pending"
                        )}`}
                      >
                        {selectedBookingForPayment.paymentStatus || "pending"}
                      </span>
                    </p>
                    {selectedBookingForPayment.paymentStatus === "paid" && (
                      <p className="text-sm">
                        <strong>Paid at:</strong>{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedBookingForPayment.paymentStatus === "pending" && (
                <div className="space-y-4">
                  <Label htmlFor="payment-method">
                    {t("payment.paymentMethod", "Payment Method")}
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "payment.selectMethod",
                          "Select payment method"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        {t("payment.methods.cash", "Cash")}
                      </SelectItem>
                      <SelectItem value="card">
                        {t("payment.methods.card", "Credit/Debit Card")}
                      </SelectItem>
                      <SelectItem value="transfer">
                        {t("payment.methods.transfer", "Bank Transfer")}
                      </SelectItem>
                      <SelectItem value="mbway">
                        {t("payment.methods.mbway", "MB Way")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {paymentMethod === "card" ? (
                    // In-app card flow using Stripe Elements
                    <PaymentForm
                      bookingId={selectedBookingForPayment.id}
                      clientName={selectedBookingForPayment.client?.name}
                      onSuccess={async () => {
                        try {
                          await completeBooking(
                            String(selectedBookingForPayment.id)
                          );
                        } catch (err) {
                          console.error(err);
                        } finally {
                          await fetchBookings();
                          setPaymentDialogOpen(false);
                        }
                      }}
                      onCancel={() => setPaymentDialogOpen(false)}
                    />
                  ) : (
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-notes">
                          {t("payment.notes", "Payment Notes")}
                        </Label>
                        <Textarea
                          id="payment-notes"
                          placeholder={t(
                            "payment.notesPlaceholder",
                            "Add any payment-related notes..."
                          )}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={async () => {
                            try {
                              // For non-card methods we mark booking as completed.
                              await completeBooking(
                                String(selectedBookingForPayment.id)
                              );
                              await fetchBookings();
                              toast.success(
                                t(
                                  "messages.paymentRecorded",
                                  "Booking completed and payment recorded"
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              toast.error(
                                t(
                                  "messages.failedComplete",
                                  "Failed to complete booking"
                                )
                              );
                            } finally {
                              setPaymentDialogOpen(false);
                            }
                          }}
                        >
                          {t("actions.markPaid", "Mark as Paid")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPaymentDialogOpen(false)}
                        >
                          {t("actions.close", "Close")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("details.title", "Booking Details")}</DialogTitle>
          </DialogHeader>
          {selectedBookingDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Client
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedBookingDetails.client?.name || "N/A"}
                  </p>
                  {selectedBookingDetails.client?.email && (
                    <p className="text-xs text-muted-foreground">
                      {selectedBookingDetails.client.email}
                    </p>
                  )}
                  {selectedBookingDetails.client?.phone && (
                    <p className="text-xs text-muted-foreground">
                      {selectedBookingDetails.client.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      className={getStatusColor(selectedBookingDetails.status)}
                    >
                      {selectedBookingDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Service
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedBookingDetails.service?.name || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBookingDetails.service?.duration || 0} min • €
                    {selectedBookingDetails.service?.price || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Professional
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedBookingDetails.professional?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedBookingDetails.startTime
                      ? new Date(
                          selectedBookingDetails.startTime
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedBookingDetails.startTime
                      ? new Date(
                          selectedBookingDetails.startTime
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={getPaymentStatusColor(
                        selectedBookingDetails.paymentStatus
                      )}
                    >
                      {selectedBookingDetails.paymentStatus || "pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedBookingDetails.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notes
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedBookingDetails.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedBookingDetails?.status === "pending" && (
                  <Button
                    onClick={() => {
                      handleConfirmBooking(selectedBookingDetails.id);
                      setIsDetailsDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Booking Dialog */}
      <BookingCreator
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        services={services}
        planType="business"
        onSuccess={async () => {
          await fetchBookings();
        }}
      />

      {/* Calendar View Dialog */}
      <CalendarView
        open={isCalendarViewOpen}
        onOpenChange={setIsCalendarViewOpen}
        bookings={bookings}
        title={t("calendar.title", "Booking Calendar")}
        description={t(
          "calendar.description",
          "View all bookings in calendar format"
        )}
      />
    </div>
  );
}
