import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useEntity } from "../../hooks/useEntity";
import { useBookings } from "../../hooks/useBookings";
import { useCurrency } from "../../hooks/useCurrency";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";
import { BookingCreator } from "../../components/booking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { StatsGrid } from "../../components/ui/stats-grid";
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
  DialogFooter,
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
  Banknote,
  Smartphone,
  Building2,
  CheckCircle2,
  FileText,
  Hourglass,
  LayoutList,
  Mail,
  Play,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface BookingManagementPageProps {
  forcedProfessionalId?: string;
}

export function BookingManagementPage({ forcedProfessionalId }: BookingManagementPageProps) {
  const { t } = useTranslation("bookings");
  const { canViewPricing, canViewPaymentDetails } = usePlanRestrictions();
  const { user } = useAuth();
  const { entity: fullEntity } = useEntity({ autoFetch: true }); // Fetch full entity profile
  const { formatCurrency } = useCurrency();
  const entityId = user?.entityId || user?.id || "";



  // Use the bookings hook with real API
  const {
    bookings,
    loading,
    fetchBookings,
    completeBooking,
    cancelBooking,
    createBooking: _createBooking,
    updateBooking,
    cancelRecurringSeries,
  } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [dateFilter, setDateFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [taxId, setTaxId] = useState<string>("");
  const [customPaymentAmount, setCustomPaymentAmount] = useState<string>(""); // State for custom amount
  const [isEditingAmount, setIsEditingAmount] = useState(false); // State for edit mode
  const [paymentLoading, setPaymentLoading] = useState(false);

  // View mode state (list or calendar)
  const [viewMode, setViewMode] = useState<"list" | "calendar">(() => {
    const saved = localStorage.getItem("bookingsViewMode");
    return (saved as "list" | "calendar") || "calendar";
  });

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem("bookingsViewMode", viewMode);
  }, [viewMode]);

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [recurringSeriesBookings, setRecurringSeriesBookings] = useState<any[]>(
    []
  );
  const [isRecurringSeriesDialogOpen, setIsRecurringSeriesDialogOpen] =
    useState(false);

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

      // If filtering by pending, reset to show the confirmed booking
      if (statusFilter === 'pending') {
        setStatusFilter('all');
        searchParams.delete('status');
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      toast.error("Failed to confirm booking");
    }
  };

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const openRejectDialog = (bookingId: string) => {
    setBookingToReject(bookingId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (bookingToReject) {
      handleRejectBooking(bookingToReject, rejectReason);
      setRejectDialogOpen(false);
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
  }


  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/api/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(t('bookings.statusUpdated', 'Status updated successfully'));
      fetchBookings();

      // If filtering by pending and moving away from pending, reset filter
      if (statusFilter === 'pending' && newStatus !== 'pending') {
        setStatusFilter('all');
        searchParams.delete('status');
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error(t('bookings.statusUpdateFailed', 'Failed to update status'));
    }
  };

  // View booking details

  // View booking details
  const handleViewDetails = (booking: any) => {
    setSelectedBookingDetails(booking);
    setIsDetailsDialogOpen(true);
  };

  // View recurring series - filtra bookings já carregados
  const handleViewRecurringSeries = (parentBookingId: string) => {
    // Filtra bookings que fazem parte desta série
    const seriesBookings = displayBookings.filter(
      (b) =>
        (b as any).recurrence?.parentBookingId === parentBookingId ||
        b.id === parentBookingId
    );

    // Ordena por data
    const sortedSeries = seriesBookings.sort((a, b) => {
      const dateA = new Date(a.startTime || 0);
      const dateB = new Date(b.startTime || 0);
      return dateA.getTime() - dateB.getTime();
    });

    setRecurringSeriesBookings(sortedSeries);
    setIsRecurringSeriesDialogOpen(true);
  };

  // Cancel recurring series
  const handleCancelRecurringSeries = async (parentBookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel all future bookings in this series?"
      )
    ) {
      return;
    }

    try {
      await cancelRecurringSeries(parentBookingId);
      // Recarrega bookings para atualizar a lista
      await fetchBookings();
      setIsRecurringSeriesDialogOpen(false);
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to cancel recurring series:", error);
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
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";

      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
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

      case "in_progress":
        return <Play className="h-4 w-4" />;
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


    let mounted = true;
    (async () => {
      try {
        // Correct endpoint: /api/users with isProfessional=true
        const res: any = await apiClient.get("/api/users", {
          entityId,
          isProfessional: true,
        });


        const data = res?.data || [];
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
        const res = await apiClient.get(`/business/entity/${entityId}`);
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
    }
  }, [servicesFromApi]);

  useEffect(() => {
    if (professionalsList && professionalsList.length > 0) {
    }
  }, [professionalsList]);

  useEffect(() => {
    if (clients && clients.length > 0) {
    }
  }, [clients]);

  useEffect(() => { }, [bookings, loading, entityId]);

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

  const filteredBookings = displayBookings
    .filter((booking) => {
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
          (booking.client &&
            "phone" in booking.client &&
            booking.client.phone) ||
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
        (dateFilter === "upcoming" &&
          new Date(bookingDate) > new Date(today)) ||
        (dateFilter === "past" && new Date(bookingDate) < new Date(today));

      const matchesService =
        serviceFilter === "all" || booking.service?.name === serviceFilter;

      const matchesProfessional = forcedProfessionalId
        ? (String(booking.professional?.id) === String(forcedProfessionalId) || String(booking.professionalId) === String(forcedProfessionalId))
        : (professionalFilter === "all" || booking.professional?.name === professionalFilter);

      const matchesPayment =
        paymentFilter === "all" ||
        (booking.paymentStatus || "pending") === paymentFilter;

      return (
        matchesSearch &&
        matchesClientSearch &&
        matchesStatus &&
        matchesDate &&
        matchesService &&
        matchesProfessional &&
        matchesPayment
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateA - dateB;
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
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
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
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-l-none"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">
                {t("views.calendar", "Calendar")}
              </span>
            </Button>
          </div>

          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t("actions.newBooking", "New Booking")}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid columns={5}>
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
      </StatsGrid>

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
              <SelectItem value="pending">Pending Confirmation</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
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
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!forcedProfessionalId && (
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
                        {professionalsList.map((professional) => (
                          <SelectItem
                            key={professional.id || professional._id}
                            value={
                              `${professional.firstName || ""} ${professional.lastName || ""
                                }`.trim() || professional.name
                            }
                          >
                            {`${professional.firstName || ""} ${professional.lastName || ""
                              }`.trim() || professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

      {/* Bookings View - List or Calendar */}
      {viewMode === "list" ? (
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
                              <div className="font-medium flex items-center gap-2">
                                {booking.service?.name}
                                {(booking as any).recurrence?.isRecurring && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs cursor-pointer hover:bg-blue-100"
                                    onClick={() => {
                                      const parentId =
                                        (booking as any).recurrence
                                          ?.parentBookingId || booking.id;
                                      handleViewRecurringSeries(parentId);
                                    }}
                                    title="Click to view all bookings in series"
                                  >
                                    <svg
                                      className="h-3 w-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                    {(booking as any).recurrence
                                      ?.currentOccurrence
                                      ? `${(booking as any).recurrence
                                        .currentOccurrence
                                      }/${(booking as any).recurrence
                                        .totalOccurrences || "?"
                                      }`
                                      : "Recurring"}
                                  </Badge>
                                )}
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
                                  {booking.status === "pending" && (
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
                                        onClick={() => openRejectDialog(booking.id)}
                                        className="text-red-600"
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Booking
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}



                                  {booking.status === 'confirmed' && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                      className="text-blue-600"
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      Start Appointment
                                    </DropdownMenuItem>
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
                                    disabled={booking.status === 'cancelled' || booking.paymentStatus === 'paid'}
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
        <Card>
          <CardContent className="p-0 sm:p-6">
            <CalendarView
              open={false}
              onOpenChange={() => { }}
              bookings={filteredBookings as any}
              asTab={true}
              defaultView="week"
              workingHours={fullEntity?.workingHours || { start: "08:00", end: "23:00" }}
              onEditBooking={(booking) => {
                // Map the booking object to the flat structure expected by EditBookingDialog
                const mappedBooking: any = {
                  id: booking.id,
                  clientName: typeof booking.client === 'object' ? booking.client?.name : booking.client,
                  clientEmail: typeof booking.client === 'object' ? booking.client?.email : '',
                  serviceName: typeof booking.service === 'object' ? booking.service?.name : 'Service',
                  professionalName: typeof booking.professional === 'object' ? booking.professional?.name : booking.professional,
                  professionalId: typeof booking.professional === 'object' ? booking.professional?.id : undefined,
                  date: new Date(booking.startTime).toISOString().split('T')[0],
                  time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                  duration: typeof booking.service === 'object' ? booking.service?.duration : 60,
                  price: typeof booking.service === 'object' ? booking.service?.price : 0,
                  status: booking.status,
                  notes: booking.notes
                };


                setEditingBooking(mappedBooking);
                setIsEditDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <EditBookingDialog
        booking={editingBooking}
        isOpen={isEditDialogOpen}
        professionals={professionalsList}
        entityId={entityId}
        onClose={() => {

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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="p-6 bg-primary/5 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Management
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Process payment for booking #{selectedBookingForPayment?.id?.slice(-6)}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedBookingForPayment && (
            <div className="p-6 space-y-8">
              {/* Booking Summary Card */}
              <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">{selectedBookingForPayment.service?.name || "Service"}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {selectedBookingForPayment.client?.name || "Client"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedBookingForPayment.startTime
                      ? new Date(selectedBookingForPayment.startTime).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center border-l pl-4 min-w-[150px]">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  {selectedBookingForPayment.paymentStatus === 'paid' ? (
                    <span className="text-3xl font-bold text-primary">
                      €{selectedBookingForPayment.payment?.paidAmount || selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0}
                    </span>
                  ) : (
                    isEditingAmount ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-primary">€</span>
                        <Input
                          type="number"
                          className="w-24 text-right text-xl font-bold h-10"
                          value={customPaymentAmount}
                          onChange={(e) => setCustomPaymentAmount(e.target.value)}
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingAmount(false)}>✓</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setIsEditingAmount(false); setCustomPaymentAmount(""); }}>✕</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <span className="text-3xl font-bold text-primary">
                          €{customPaymentAmount || selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          onClick={() => {
                            setCustomPaymentAmount((selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0).toString());
                            setIsEditingAmount(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    )
                  )}
                  <Badge variant={selectedBookingForPayment.paymentStatus === 'paid' ? 'success' : 'outline'} className="mt-1 capitalize">
                    {selectedBookingForPayment.paymentStatus || "pending"}
                  </Badge>
                </div>
              </div>

              {/* Cost Breakdown */}
              {selectedBookingForPayment.paymentStatus !== 'paid' && (
                <div className="bg-muted/30 p-4 rounded-lg border text-sm space-y-2 mb-4">
                  <h4 className="font-semibold mb-2">Price Breakdown</h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>€{selectedBookingForPayment.pricing?.basePrice || selectedBookingForPayment.service?.price || 0}</span>
                  </div>
                  {selectedBookingForPayment.pricing?.voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher Discount</span>
                      <span>-€{selectedBookingForPayment.pricing.voucherDiscount}</span>
                    </div>
                  )}
                  {selectedBookingForPayment.pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-€{selectedBookingForPayment.pricing.discountAmount}</span>
                    </div>
                  )}
                  {selectedBookingForPayment.pricing?.commissionAmount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Commission</span>
                      <span>€{selectedBookingForPayment.pricing.commissionAmount}</span>
                    </div>
                  )}
                  {selectedBookingForPayment.pricing?.additionalCharges > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Additional Charges</span>
                      <span>+€{selectedBookingForPayment.pricing.additionalCharges}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>€{customPaymentAmount || selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0}</span>
                  </div>
                </div>
              )}

              {/* Payment Status Handling */}
              {selectedBookingForPayment.paymentStatus === "paid" ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">Payment Completed</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      This booking has been fully paid. You can now issue a receipt or invoice.
                    </p>
                  </div>

                  {/* Payment Details Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md bg-muted/30 p-4 rounded-lg border text-sm">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Payment Date</span>
                      <span className="font-medium">
                        {selectedBookingForPayment.payment?.paidAmount
                          ? new Date().toLocaleDateString() // Fallback if date not available
                          : new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Method</span>
                      <span className="font-medium capitalize">
                        {selectedBookingForPayment.payment?.method || "Card"}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1 col-span-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Transaction ID</span>
                      <span className="font-mono text-xs text-muted-foreground break-all text-left">
                        {selectedBookingForPayment.payment?.transactionIds?.[0] ||
                          selectedBookingForPayment.payment?.stripePaymentIntentId ||
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-4 w-full">
                    <Button variant="outline" className="gap-2 min-w-[140px]" onClick={async () => {
                      try {
                        toast.loading("Sending invoice...");
                        await apiClient.post(`/api/payments/send-invoice-by-booking/${selectedBookingForPayment.id}`);
                        toast.dismiss();
                        toast.success("Invoice sent to client email");
                      } catch (err) {
                        toast.dismiss();
                        toast.error("Failed to send invoice");
                      }
                    }}>
                      <Mail className="w-4 h-4" />
                      Send Invoice
                    </Button>

                    {/* View Receipt Button */}
                    {selectedBookingForPayment.payment?.transactionIds?.[0] && (
                      <Button variant="secondary" className="gap-2 min-w-[140px]" onClick={() => {
                        const paymentId = selectedBookingForPayment.payment.transactionIds[0];
                        window.open(`/payments/${paymentId}/receipt`, '_blank');
                      }}>
                        <FileText className="w-4 h-4" />
                        View Receipt
                      </Button>
                    )}

                    <Button variant="destructive" className="gap-2 min-w-[140px]" onClick={async () => {
                      const paymentId = selectedBookingForPayment.payment?.transactionIds?.[0];

                      if (!paymentId) {
                        toast.error("Payment ID not found. Cannot refund.");
                        return;
                      }

                      if (!confirm("Are you sure you want to refund this payment? This action cannot be undone.")) return;

                      try {
                        toast.loading("Processing refund...");
                        await apiClient.patch(`/api/payments/${paymentId}/refund`, {
                          reason: 'Requested by professional'
                        });
                        toast.dismiss();
                        toast.success("Payment refunded successfully");
                        await fetchBookings();
                        setPaymentDialogOpen(false);
                      } catch (err) {
                        toast.dismiss();
                        console.error(err);
                        toast.error("Failed to refund payment");
                      }
                    }}>
                      <RotateCcw className="w-4 h-4" />
                      Refund
                    </Button>

                    <Button variant="ghost" className="min-w-[100px]" onClick={() => {
                      setPaymentDialogOpen(false);
                      setSelectedBookingForPayment(null);
                      setTaxId("");
                      setPaymentMethod("card");
                    }}>
                      Close
                    </Button>
                  </div>
                </div>

              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Select Payment Method</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'card', label: 'Card', icon: CreditCard },
                        { id: 'cash', label: 'Cash', icon: Banknote },
                        { id: 'mbway', label: 'MB Way', icon: Smartphone },
                        { id: 'transfer', label: 'Transfer', icon: Building2 },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                            ${paymentMethod === method.id
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20 text-muted-foreground'}
                          `}
                        >
                          <method.icon className="w-6 h-6 mb-2" />
                          <span className="text-sm font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="tax-id">NIF / Tax ID (Optional)</Label>
                        <Input
                          id="tax-id"
                          placeholder="123 456 789"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-notes">Payment Notes (Optional)</Label>
                        <Textarea
                          id="payment-notes"
                          placeholder={`Add details about the ${paymentMethod} payment...`}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="min-w-[140px]"
                          disabled={paymentLoading}
                          onClick={async () => {
                            setPaymentLoading(true);
                            console.log('[Payment] Starting payment process...');
                            console.log('[Payment] Booking ID:', selectedBookingForPayment.id);
                            console.log('[Payment] Tax ID:', taxId);
                            console.log('[Payment] Payment Method:', paymentMethod);

                            try {
                              const payload: any = {
                                taxId,
                                paymentMethod
                              };

                              // Only send custom amount if it was edited
                              if (customPaymentAmount && parseFloat(customPaymentAmount) > 0) {
                                payload.amount = parseFloat(customPaymentAmount);
                              }
                              // Call API to complete booking
                              console.log('[Payment] Calling completeBooking API with payload:', payload);
                              const response = await apiClient.patch(`/api/bookings/${selectedBookingForPayment.id}/complete`, payload);
                              console.log('[Payment] API Response:', response);

                              // Reload bookings
                              console.log('[Payment] Fetching updated bookings...');
                              await fetchBookings();
                              console.log('[Payment] Bookings refreshed successfully');

                              // Show success
                              toast.success("Payment recorded successfully");

                              // Update local state to show success view instead of closing
                              console.log('[Payment] Updating local state for success view...');

                              if (response.data) {
                                console.log('[Payment] Response data:', response.data);

                                // Update the selected booking with fresh data from backend
                                const responseData = response.data as any;
                                const updatedData = {
                                  ...selectedBookingForPayment,
                                  paymentStatus: 'paid',
                                  status: 'completed',
                                  payment: {
                                    status: 'paid',
                                    paidAmount: parseFloat(customPaymentAmount) || responseData?.pricing?.totalPrice || selectedBookingForPayment.pricing?.totalPrice,
                                    method: paymentMethod,
                                    transactionIds: responseData?.payment?.transactionIds || [],
                                    stripePaymentIntentId: responseData?.payment?.stripePaymentIntentId
                                  }
                                };

                                setSelectedBookingForPayment(updatedData);
                              } else {
                                // Fallback if no data returned (shouldn't happen)
                                setSelectedBookingForPayment({
                                  ...selectedBookingForPayment,
                                  paymentStatus: 'paid',
                                  status: 'completed'
                                });
                              }

                              // Don't close dialog
                              // setPaymentDialogOpen(false); 
                              console.log('[Payment] Payment process completed successfully');
                            } catch (err: any) {
                              console.error('[Payment] Payment process failed:', err);
                              console.error('[Payment] Error details:', {
                                message: err.message,
                                response: err.response?.data,
                                status: err.response?.status,
                                stack: err.stack
                              });

                              // Show detailed error to user
                              const errorMessage = err.response?.data?.message
                                || err.message
                                || "Failed to record payment. Please try again.";

                              toast.error(`Payment Error: ${errorMessage}`);

                              // Don't close dialog on error so user can retry
                            } finally {
                              setPaymentLoading(false);
                            }
                          }}
                        >
                          {paymentLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      < Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking. This will be sent to the client.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject}>Reject Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Booking Details Dialog */}
      < Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} >
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

              {/* Recurring Booking Information */}
              {selectedBookingDetails.recurrence?.isRecurring && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Recurring Booking
                  </Label>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-300"
                      >
                        {selectedBookingDetails.recurrence.frequency ===
                          "weekly"
                          ? "Weekly"
                          : selectedBookingDetails.recurrence.frequency ===
                            "daily"
                            ? "Daily"
                            : selectedBookingDetails.recurrence.frequency ===
                              "monthly"
                              ? "Monthly"
                              : selectedBookingDetails.recurrence.frequency}
                      </Badge>
                    </div>
                    {selectedBookingDetails.recurrence.interval &&
                      selectedBookingDetails.recurrence.interval > 1 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Interval:
                          </span>
                          <span className="font-medium">
                            Every {selectedBookingDetails.recurrence.interval}{" "}
                            {selectedBookingDetails.recurrence.frequency ===
                              "weekly"
                              ? "weeks"
                              : selectedBookingDetails.recurrence.frequency ===
                                "daily"
                                ? "days"
                                : "months"}
                          </span>
                        </div>
                      )}
                    {selectedBookingDetails.recurrence.daysOfWeek &&
                      selectedBookingDetails.recurrence.daysOfWeek.length >
                      0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Days:</span>
                          <span className="font-medium">
                            {selectedBookingDetails.recurrence.daysOfWeek
                              .map(
                                (day: number) =>
                                  [
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                  ][day]
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    {selectedBookingDetails.recurrence.currentOccurrence &&
                      selectedBookingDetails.recurrence.totalOccurrences && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Occurrence:
                          </span>
                          <span className="font-medium">
                            {
                              selectedBookingDetails.recurrence
                                .currentOccurrence
                            }{" "}
                            of{" "}
                            {selectedBookingDetails.recurrence.totalOccurrences}
                          </span>
                        </div>
                      )}
                    {selectedBookingDetails.recurrence.endDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ends on:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedBookingDetails.recurrence.endDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {selectedBookingDetails.recurrence.parentBookingId &&
                      !selectedBookingDetails.recurrence.currentOccurrence && (
                        <div className="text-xs text-blue-700 mt-2">
                          ℹ️ This is the first booking in a recurring series
                        </div>
                      )}
                    {selectedBookingDetails.recurrence.parentBookingId &&
                      selectedBookingDetails.recurrence.currentOccurrence &&
                      selectedBookingDetails.recurrence.currentOccurrence >
                      1 && (
                        <div className="text-xs text-blue-700 mt-2">
                          ℹ️ Part of recurring booking series
                        </div>
                      )}

                    {/* View Series Button */}
                    <div className="mt-3 pt-2 border-t border-blue-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const parentId =
                            selectedBookingDetails.recurrence.parentBookingId ||
                            selectedBookingDetails.id;
                          handleViewRecurringSeries(parentId);
                        }}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        View All Bookings in Series
                      </Button>
                    </div>
                  </div>
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
      </Dialog >

      {/* Create Booking Dialog */}
      < BookingCreator
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        services={
          services.map(s => ({
            ...s,
            id: s.id || '',
            duration: typeof s.duration === 'object' ? (s.duration as any).duration : s.duration,
            price: (s as any).pricing?.basePrice || (s as any).price || 0
          }))
        }
        planType="business"
        onSuccess={async () => {
          await fetchBookings();
        }}
      />

      {/* Recurring Series Dialog */}
      <Dialog
        open={isRecurringSeriesDialogOpen}
        onOpenChange={setIsRecurringSeriesDialogOpen}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Recurring Booking Series
            </DialogTitle>
            <DialogDescription>
              All bookings in this recurring series (
              {recurringSeriesBookings.length} total)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Series Summary */}
            {recurringSeriesBookings.length > 0 &&
              recurringSeriesBookings[0].recurrence && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Service:</span>
                      <p className="font-medium">
                        {recurringSeriesBookings[0].service?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Professional:
                      </span>
                      <p className="font-medium">
                        {recurringSeriesBookings[0].professional?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <p className="font-medium capitalize">
                        {recurringSeriesBookings[0].recurrence.frequency}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total Bookings:
                      </span>
                      <p className="font-medium">
                        {recurringSeriesBookings.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Bookings List */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringSeriesBookings.map((booking, index) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.startTime
                              ? new Date(booking.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.startTime
                              ? new Date(booking.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {booking.client?.name}
                        </div>
                        {booking.client?.phone && (
                          <div className="text-sm text-muted-foreground">
                            {booking.client.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(booking.status)}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">
                            {booking.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleViewDetails(booking);
                              setIsRecurringSeriesDialogOpen(false);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status !== "cancelled" &&
                            booking.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (confirm("Cancel this booking?")) {
                                    try {
                                      await cancelBooking(booking.id);
                                      // Recarrega bookings e atualiza a série
                                      await fetchBookings();
                                      // Refiltra a série localmente
                                      const parentId =
                                        recurringSeriesBookings[0].recurrence
                                          ?.parentBookingId ||
                                        recurringSeriesBookings[0].id;
                                      handleViewRecurringSeries(parentId);
                                    } catch (error) {
                                      console.error(
                                        "Failed to cancel booking:",
                                        error
                                      );
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsRecurringSeriesDialogOpen(false)}
              >
                Close
              </Button>
              {recurringSeriesBookings.length > 0 &&
                recurringSeriesBookings[0].recurrence?.parentBookingId && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const parentId =
                        recurringSeriesBookings[0].recurrence.parentBookingId ||
                        recurringSeriesBookings[0].id;
                      handleCancelRecurringSeries(parentId);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel All Future Bookings
                  </Button>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}

