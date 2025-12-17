import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useEntity } from "../../hooks/useEntity";
import { useBookings } from "../../hooks/useBookings";
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
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
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
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
    Repeat,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    User,
    Calendar as CalendarIcon,
    CreditCard,
    Play,
    Eye,
    Banknote,
    Smartphone,
    Building2,
    CheckCircle2,
    FileText,
    Hourglass,
    LayoutList,
    Mail,
    Loader2,
    RotateCcw,
    X,
    Lock,
} from "lucide-react";
import { LiveActivityWidget } from "../../components/dashboard/LiveActivityWidget";
import { RecentActivitiesWidget } from "../../components/dashboard/RecentActivitiesWidget";
import { BlockTimeDialog } from "../../components/dialogs/block-time-dialog";
import { UsageCard } from "../../components/ui/usage-limits";

interface CommandCenterProps {
    forcedProfessionalId?: string;
    planType?: 'simple' | 'individual' | 'business';
}

export function CommandCenter({ forcedProfessionalId }: CommandCenterProps) {
    const { t } = useTranslation(["bookings", "payments"]);
    const { canViewPaymentDetails, isSimplePlan } = usePlanRestrictions();
    const { user } = useAuth();
    const { entity: fullEntity } = useEntity({ autoFetch: true }); // Fetch full entity profile
    // const { formatCurrency } = useCurrency();
    const entityId = user?.entityId || user?.id || "";

    // If no forced ID is provided but user is a professional, restrict to their own ID
    const effectiveProfessionalId = forcedProfessionalId || (user?.role === 'professional' ? user?.id : undefined);



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
    const [expiredPromotionsCount, setExpiredPromotionsCount] = useState(0);

    // View mode state (list or calendar)
    const [viewMode, setViewMode] = useState<"list" | "calendar">(() => {
        const saved = localStorage.getItem("bookingsViewMode");
        return (saved as "list" | "calendar") || "calendar";
    });

    // Update localStorage when view mode changes
    useEffect(() => {
        localStorage.setItem("bookingsViewMode", viewMode);
    }, [viewMode]);

    // Check for expired promotions
    useEffect(() => {
        if (entityId) {
            apiClient.get(`/promotions/discounts?entityId=${entityId}`)
                .then(res => {
                    if (res.data && Array.isArray(res.data)) {
                        const expired = res.data.filter((d: any) =>
                            d.status === 'active' && d.validUntil && new Date(d.validUntil) < new Date()
                        );
                        setExpiredPromotionsCount(expired.length);
                    }
                })
                .catch(err => console.error("Failed to fetch promotions status", err));
        }
    }, [entityId]);

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
    const [isBlockTimeDialogOpen, setIsBlockTimeDialogOpen] = useState(false);

    // Additional filter states
    const [serviceFilter, setServiceFilter] = useState("all");
    const [professionalFilter, setProfessionalFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("all");
        setServiceFilter("all");
        setProfessionalFilter("all");
        setPaymentFilter("all");
        setSearchParams({});
    };

    // const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter !== "all" || serviceFilter !== "all" || professionalFilter !== "all" || paymentFilter !== "all";

    const handlePaymentClick = (booking: any) => {
        // Reset all payment-related state for a clean slate
        setPaymentMethod("card");
        setTaxId("");
        setCustomPaymentAmount("");
        setIsEditingAmount(false);
        setPaymentLoading(false);

        // Set the booking and open dialog
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
            case "blocked":
                return "bg-gray-300 text-gray-900 border-gray-400";
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
            case "blocked":
                return <Lock className="h-4 w-4" />;

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
                const res: any = await apiClient.get(`/api/users/entity/${entityId}/professionals`);


                const data = res?.data || [];
                // Map users to include 'name' property for dropdowns
                const mappedData = Array.isArray(data)
                    ? data.map((u: any) => ({
                        ...u,
                        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
                    }))
                    : [];

                if (mounted) setProfessionalsList(mappedData);
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
                    .includes(searchTerm.toLowerCase()) ||
                (booking.client?.email || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (
                    (booking.client &&
                        "phone" in booking.client &&
                        booking.client.phone) ||
                    ""
                ).includes(searchTerm);

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

            const matchesProfessional = effectiveProfessionalId
                ? (String(booking.professional?.id) === String(effectiveProfessionalId) || String(booking.professionalId) === String(effectiveProfessionalId))
                : (professionalFilter === "all" || booking.professional?.name === professionalFilter);

            const matchesPayment =
                paymentFilter === "all" ||
                (booking.paymentStatus || "pending") === paymentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate &&
                matchesService &&
                matchesProfessional &&
                matchesPayment
            );
        })
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

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
        today: displayBookings.filter((b) => {
            const bookingDate = new Date(b.startTime);
            const today = new Date();
            return bookingDate.toDateString() === today.toDateString();
        }).length,
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
        <div className="space-y-6">
            {/* Modern Header with Gradient */}
            {/* Modern Header - Dark Theme Optimized */}
            <div className="relative overflow-hidden rounded-xl border bg-card p-6">
                <div className="relative z-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <CalendarIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {t("commandCenter.title")}
                                </h1>
                            </div>
                            <p className="text-muted-foreground">
                                {t("commandCenter.subtitle")}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">


                            <div className="flex items-center border rounded-lg bg-background">
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-r-none"
                                >
                                    <LayoutList className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">{t("list")}</span>
                                </Button>
                                <Button
                                    variant={viewMode === "calendar" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("calendar")}
                                    className="rounded-l-none"
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">{t("calendar")}</span>
                                </Button>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsBlockTimeDialogOpen(true)}
                            >
                                <Lock className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Block Time</span>
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">{t("newBooking")}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Time Dialog */}
            <BlockTimeDialog
                open={isBlockTimeDialogOpen}
                onOpenChange={setIsBlockTimeDialogOpen}
                entityId={entityId}
                professionals={professionalsList}
                onSuccess={() => {
                    fetchBookings();
                    toast.success("Time blocked successfully");
                }}
            />

            {/* Quick Actions Bar */}

            {/* Quick Actions Bar */}

            {/* Layout: Usage & Quick Actions */}



            {
                expiredPromotionsCount > 0 && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Expired Promotions Warning</AlertTitle>
                        <AlertDescription>
                            You have {expiredPromotionsCount} active promotion(s) that have expired. Please update them in the Promotions module.
                        </AlertDescription>
                    </Alert>
                )
            }

            {/* Interactive Stats Cards */}
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
                        placeholder={t("search.bookingsPlaceholder", "Search bookings, clients...")}
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
                            <SelectItem value="all">{t("allStatus")}</SelectItem>
                            <SelectItem value="pending">{t("status.pending")}</SelectItem>
                            <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                            <SelectItem value="in_progress">{t("status.inProgress")}</SelectItem>
                            <SelectItem value="completed">{t("status.completed")}</SelectItem>
                            <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allDates")}</SelectItem>
                            <SelectItem value="today">{t("filters.today")}</SelectItem>
                            <SelectItem value="upcoming">{t("filters.upcoming")}</SelectItem>
                            <SelectItem value="past">{t("filters.past")}</SelectItem>
                        </SelectContent>
                    </Select>
                    {canViewPaymentDetails && (
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allPayments")}</SelectItem>
                                <SelectItem value="paid">{t("filters.paid")}</SelectItem>
                                <SelectItem value="pending">{t("filters.pending")}</SelectItem>
                                <SelectItem value="failed">{t("filters.failed", "Failed")}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}


                    <Dialog
                        open={isFilterDialogOpen}
                        onOpenChange={setIsFilterDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                {t("moreFilters")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("moreFilters")}</DialogTitle>
                                <DialogDescription>
                                    {t("filters.advancedDescription", "Apply additional filters to refine your booking search")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="service-filter">{t("table.service")}</Label>
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
                                {!effectiveProfessionalId && (
                                    <div>
                                        <Label htmlFor="professional-filter">{t("table.professional")}</Label>
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
                                        <Label htmlFor="payment-filter">{t("table.payment")}</Label>
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

            {/* Split-View Layout: Main Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                {/* Main Content - List/Calendar View */}
                <div className="min-w-0">
                    {viewMode === "list" ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("bookingsCount")} ({filteredBookings.length})</CardTitle>
                                <CardDescription>
                                    {t("completeList")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 bg-transparent">
                                <div className="space-y-3">
                                    {filteredBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-card border rounded-xl shadow-sm hover:border-primary/50 transition-all duration-200"
                                        >
                                            {/* Left: Client Info */}
                                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-sm">
                                                        <AvatarImage
                                                            src={
                                                                booking.client && "avatar" in booking.client
                                                                    ? (booking.client as { avatar?: string }).avatar
                                                                    : undefined
                                                            }
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                                                            {booking.client?.name
                                                                ? booking.client.name
                                                                    .split(" ")
                                                                    .map((n: string) => n[0])
                                                                    .join("")
                                                                : "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {booking.client?.isFirstTime && (
                                                        <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] h-4 sm:h-5 min-w-0 bg-blue-500 border-2 border-background shadow-sm">
                                                            {t("status.new", "New")}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                                                            {booking.client?.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                                        {booking.client && "phone" in booking.client
                                                            ? booking.client.phone
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle: Service & Time */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 w-full sm:w-auto flex-1 sm:px-6">
                                                <div className="flex flex-col">
                                                    <div className="font-medium text-sm sm:text-base text-foreground flex items-center gap-2">
                                                        {booking.service?.name}
                                                        {(booking as any).recurrence?.isRecurring && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] h-5 px-1 bg-accent text-accent-foreground border-border cursor-pointer hover:bg-accent/80"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const parentId = (booking as any).recurrence?.parentBookingId || booking.id;
                                                                    handleViewRecurringSeries(parentId);
                                                                }}
                                                            >
                                                                <Repeat className="h-3 w-3 mr-1" />
                                                                {t("recurring.series", "Series")}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span>
                                                            {new Date(booking.startTime).toLocaleDateString()} at{" "}
                                                            {new Date(booking.startTime).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions & Status */}
                                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                                                {/* Status Badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                      capitalize whitespace-nowrap px-2 py-0.5 h-6 sm:h-7
                                                      ${getStatusColor(booking.status)}
                                                    `}
                                                >
                                                    {getStatusIcon(booking.status)}
                                                    <span className="ml-1.5">{t(`status.${booking.status}`, booking.status)}</span>
                                                </Badge>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1">
                                                    {booking.status === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50/10"
                                                            onClick={() => handleConfirmBooking(booking.id)}
                                                            title="Confirm Booking"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                {t("actions.view")}
                                                            </DropdownMenuItem>

                                                            {booking.status === "pending" && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleConfirmBooking(booking.id)}
                                                                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        {t("actions.confirm")}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => openRejectDialog(booking.id)}
                                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        {t("actions.reject")}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const mappedBooking: any = {
                                                                        id: booking.id,
                                                                        clientName: typeof booking.client === 'object' ? booking.client?.name : booking.client,
                                                                        clientEmail: typeof booking.client === 'object' ? booking.client?.email : '',
                                                                        serviceName: typeof booking.service === 'object' ? booking.service?.name : 'Service',
                                                                        professionalName: typeof booking.professional === 'object' ? booking.professional?.name : booking.professional,
                                                                        professionalId: typeof booking.professional === 'object' ? booking.professional?.id : undefined,
                                                                        date: new Date(booking.startTime).toISOString().split('T')[0],
                                                                        time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                                                                        duration: typeof (booking.service as any)?.duration === 'object' ? (booking.service as any)?.duration?.duration || 60 : (booking.service as any)?.duration || 60,
                                                                        price: typeof booking.service === 'object' ? (booking.service as any)?.price : 0,
                                                                        status: booking.status,
                                                                        notes: booking.notes
                                                                    };
                                                                    setEditingBooking(mappedBooking);
                                                                    setIsEditDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                {t("actions.edit")}
                                                            </DropdownMenuItem>

                                                            {booking.status === 'confirmed' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                                                    className="text-blue-600"
                                                                >
                                                                    <Play className="mr-2 h-4 w-4" />
                                                                    {t("actions.startAppointment", "Start Appointment")}
                                                                </DropdownMenuItem>
                                                            )}

                                                            {booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'blocked' && (
                                                                <DropdownMenuItem
                                                                    onClick={async () => {
                                                                        if (confirm(t("confirmations.markCompleted", "Are you sure you want to mark this booking as completed?"))) {
                                                                            try {
                                                                                await completeBooking(booking.id);
                                                                                toast.success(t("messages.bookingCompleted", "Booking completed successfully"));
                                                                                fetchBookings();
                                                                            } catch (error) {
                                                                                toast.error(t("messages.failedComplete", "Failed to complete booking"));
                                                                                console.error(error);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    {t("actions.markCompleted", "Mark as Completed")}
                                                                </DropdownMenuItem>
                                                            )}

                                                            {canViewPaymentDetails && booking.status !== 'blocked' && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handlePaymentClick(booking)}
                                                                        disabled={booking.status === 'cancelled' || booking.paymentStatus === 'paid'}
                                                                    >
                                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                                        {t("payment.processPayment")}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            {booking.status !== "cancelled" && booking.status !== "completed" && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            if ((booking as any).recurrence?.isRecurring) {
                                                                                setRecurringSeriesBookings([booking]);
                                                                                setIsRecurringSeriesDialogOpen(true);
                                                                            } else {
                                                                                cancelBooking(booking.id);
                                                                            }
                                                                        }}
                                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        {t("actions.cancel")}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredBookings.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-lg border-2 border-dashed border-border">
                                            <div className="p-4 rounded-full bg-muted mb-4">
                                                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground">{t("noBookingsFound")}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {t("tryAdjustingFilters")}
                                            </p>
                                        </div>
                                    )}
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
                                            duration: typeof (booking.service as any)?.duration === 'object' ? (booking.service as any)?.duration?.duration || 60 : (booking.service as any)?.duration || 60,
                                            price: typeof booking.service === 'object' ? (booking.service as any)?.price : 0,
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

                </div >
                {/* End Main Content */}

                {/* Sidebar - Right Panel (Desktop Only) */}
                <div className="space-y-4 hidden lg:block">
                    {/* Live Activity Widget - Moved to Top */}
                    <LiveActivityWidget entityId={entityId} />

                    {/* Usage Limits */}
                    <UsageCard />

                    {/* Quick Actions - Compact Sidebar Version */}
                    <Card>
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {t("quickActions", "Quick Actions")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4 pt-0">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-2"
                                onClick={() => navigate('/entity/profile')}
                            >
                                <Building2 className="mr-2 h-4 w-4 text-primary" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{t("companyProfile", "Company Profile")}</span>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-2"
                                onClick={() => {
                                    setStatusFilter('pending');
                                    setViewMode('list');
                                }}
                            >
                                <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{stats.pendingConfirmation} {t("pendingActions")}</span>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-2"
                                onClick={() => {
                                    setDateFilter('today');
                                    setViewMode('list');
                                }}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{stats.today} {t("todaysBookings")}</span>
                                </div>
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-destructive"
                                onClick={resetFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                {t("actions.clearFilters", "Clear All Filters")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Activities Widget */}
                    <RecentActivitiesWidget
                        bookings={displayBookings.slice(0, 20)}
                        maxItems={15}
                    />
                </div>
            </div >
            {/* End Split-View Layout */}

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    {/* Dynamic Header based on payment status */}
                    <div className={`p-6 border-b ${selectedBookingForPayment?.paymentStatus === 'paid' ? 'bg-green-50' :
                        selectedBookingForPayment?.paymentStatus === 'refunded' ? 'bg-orange-50' :
                            selectedBookingForPayment?.paymentStatus === 'partial' ? 'bg-blue-50' :
                                selectedBookingForPayment?.paymentStatus === 'failed' ? 'bg-red-50' :
                                    'bg-primary/5'
                        }`}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                <CreditCard className={`w-5 h-5 ${selectedBookingForPayment?.paymentStatus === 'paid' ? 'text-green-600' :
                                    selectedBookingForPayment?.paymentStatus === 'refunded' ? 'text-orange-600' :
                                        selectedBookingForPayment?.paymentStatus === 'partial' ? 'text-blue-600' :
                                            selectedBookingForPayment?.paymentStatus === 'failed' ? 'text-red-600' :
                                                'text-primary'
                                    }`} />
                                Payment Management
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Process payment for booking #{selectedBookingForPayment?.id?.slice(-6)}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedBookingForPayment && (
                        <div className="p-6 space-y-6">
                            {/* Booking Status Indicator Banner */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${selectedBookingForPayment.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                                selectedBookingForPayment.status === 'confirmed' ? 'bg-blue-50 border-blue-200' :
                                    selectedBookingForPayment.status === 'in_progress' ? 'bg-purple-50 border-purple-200' :
                                        selectedBookingForPayment.status === 'completed' ? 'bg-green-50 border-green-200' :
                                            selectedBookingForPayment.status === 'cancelled' ? 'bg-red-50 border-red-200' :
                                                selectedBookingForPayment.status === 'no_show' ? 'bg-gray-50 border-gray-200' :
                                                    'bg-muted/50 border-muted'
                                }`}>
                                <div className={`w-3 h-3 rounded-full animate-pulse ${selectedBookingForPayment.status === 'pending' ? 'bg-yellow-500' :
                                    selectedBookingForPayment.status === 'confirmed' ? 'bg-blue-500' :
                                        selectedBookingForPayment.status === 'in_progress' ? 'bg-purple-500' :
                                            selectedBookingForPayment.status === 'completed' ? 'bg-green-500' :
                                                selectedBookingForPayment.status === 'cancelled' ? 'bg-red-500' :
                                                    selectedBookingForPayment.status === 'no_show' ? 'bg-gray-500' :
                                                        'bg-muted-foreground'
                                    }`} />
                                <div className="flex-1">
                                    <span className="text-sm font-medium capitalize">
                                        Booking Status: {selectedBookingForPayment.status?.replace('_', ' ')}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedBookingForPayment.status === 'pending' && 'Awaiting confirmation from professional'}
                                        {selectedBookingForPayment.status === 'confirmed' && 'Booking confirmed, ready for appointment'}
                                        {selectedBookingForPayment.status === 'in_progress' && 'Appointment is currently ongoing'}
                                        {selectedBookingForPayment.status === 'completed' && 'Appointment has been completed'}
                                        {selectedBookingForPayment.status === 'cancelled' && 'This booking has been cancelled'}
                                        {selectedBookingForPayment.status === 'no_show' && 'Client did not show up for appointment'}
                                    </p>
                                </div>
                                <Badge variant="outline" className={`capitalize ${selectedBookingForPayment.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                                    selectedBookingForPayment.status === 'confirmed' ? 'border-blue-500 text-blue-700' :
                                        selectedBookingForPayment.status === 'in_progress' ? 'border-purple-500 text-purple-700' :
                                            selectedBookingForPayment.status === 'completed' ? 'border-green-500 text-green-700' :
                                                selectedBookingForPayment.status === 'cancelled' ? 'border-red-500 text-red-700' :
                                                    selectedBookingForPayment.status === 'no_show' ? 'border-gray-500 text-gray-700' :
                                                        ''
                                    }`}>
                                    {selectedBookingForPayment.status?.replace('_', ' ')}
                                </Badge>
                            </div>

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
                                        {selectedBookingForPayment.startTime && (
                                            <span className="text-xs">
                                                @ {new Date(selectedBookingForPayment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-center border-l pl-4 min-w-[150px]">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedBookingForPayment.paymentStatus === 'partial' ? 'Remaining' : 'Total Amount'}
                                    </span>
                                    {/* Amount Display based on payment status */}
                                    {selectedBookingForPayment.paymentStatus === 'paid' || selectedBookingForPayment.paymentStatus === 'refunded' ? (
                                        <span className={`text-3xl font-bold ${selectedBookingForPayment.paymentStatus === 'refunded' ? 'text-orange-600 line-through' : 'text-green-600'
                                            }`}>
                                            €{selectedBookingForPayment.payment?.paidAmount || selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0}
                                        </span>
                                    ) : selectedBookingForPayment.paymentStatus === 'partial' ? (
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-blue-600">
                                                €{(selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0) - (selectedBookingForPayment.payment?.paidAmount || 0)}
                                            </span>
                                            <div className="text-xs text-muted-foreground">
                                                of €{selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0} total
                                            </div>
                                        </div>
                                    ) : isEditingAmount ? (
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
                                    )}
                                    {/* Payment Status Badge with appropriate styling */}
                                    <Badge
                                        variant={
                                            selectedBookingForPayment.paymentStatus === 'paid' ? 'default' :
                                                selectedBookingForPayment.paymentStatus === 'refunded' ? 'destructive' :
                                                    selectedBookingForPayment.paymentStatus === 'partial' ? 'secondary' :
                                                        selectedBookingForPayment.paymentStatus === 'failed' ? 'destructive' :
                                                            'outline'
                                        }
                                        className={`mt-1 capitalize ${selectedBookingForPayment.paymentStatus === 'paid' ? 'bg-green-500' :
                                            selectedBookingForPayment.paymentStatus === 'refunded' ? 'bg-orange-500' :
                                                selectedBookingForPayment.paymentStatus === 'partial' ? 'bg-blue-500 text-white' :
                                                    selectedBookingForPayment.paymentStatus === 'failed' ? 'bg-red-500' :
                                                        ''
                                            }`}
                                    >
                                        {selectedBookingForPayment.paymentStatus || "pending"}
                                    </Badge>
                                </div>
                            </div>

                            {/* REFUNDED STATE */}
                            {selectedBookingForPayment.paymentStatus === "refunded" && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                                        <RotateCcw className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold tracking-tight text-orange-700">Payment Refunded</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            This payment has been fully refunded to the client.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md bg-orange-50 p-4 rounded-lg border border-orange-200 text-sm">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Refund Amount</span>
                                            <span className="font-medium text-orange-700">
                                                €{selectedBookingForPayment.payment?.refundAmount || selectedBookingForPayment.payment?.paidAmount || 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Refund Date</span>
                                            <span className="font-medium">
                                                {selectedBookingForPayment.payment?.refundedAt
                                                    ? new Date(selectedBookingForPayment.payment.refundedAt).toLocaleDateString()
                                                    : new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                        {selectedBookingForPayment.payment?.refundReason && (
                                            <div className="flex flex-col items-start gap-1 col-span-2">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider">Reason</span>
                                                <span className="font-medium text-left">{selectedBookingForPayment.payment.refundReason}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="ghost" className="min-w-[100px]" onClick={() => {
                                        setPaymentDialogOpen(false);
                                        setSelectedBookingForPayment(null);
                                    }}>
                                        Close
                                    </Button>
                                </div>
                            )}

                            {/* FAILED STATE */}
                            {selectedBookingForPayment.paymentStatus === "failed" && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                                        <XCircle className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold tracking-tight text-red-700">Payment Failed</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto">
                                            The payment attempt was unsuccessful. You can retry below.
                                        </p>
                                    </div>
                                    {selectedBookingForPayment.payment?.failureReason && (
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-sm w-full max-w-md">
                                            <span className="text-red-700 font-medium">Error: </span>
                                            <span className="text-red-600">{selectedBookingForPayment.payment.failureReason}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button
                                            className="gap-2"
                                            onClick={() => {
                                                // Reset to pending to allow retry
                                                setSelectedBookingForPayment({
                                                    ...selectedBookingForPayment,
                                                    paymentStatus: 'pending'
                                                });
                                            }}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Retry Payment
                                        </Button>
                                        <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* PARTIAL PAYMENT STATE */}
                            {selectedBookingForPayment.paymentStatus === "partial" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    {/* Partial Payment Info Banner */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-blue-800">Partial Payment Received</h4>
                                                <p className="text-sm text-blue-600">A deposit or partial payment has been made</p>
                                            </div>
                                        </div>

                                        {/* Payment Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-700">Payment Progress</span>
                                                <span className="font-medium text-blue-800">
                                                    €{selectedBookingForPayment.payment?.paidAmount || 0} of €{selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0}
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, ((selectedBookingForPayment.payment?.paidAmount || 0) / (selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 1)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-blue-600">
                                                <span>
                                                    {Math.round(((selectedBookingForPayment.payment?.paidAmount || 0) / (selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 1)) * 100)}% paid
                                                </span>
                                                <span>
                                                    €{(selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0) - (selectedBookingForPayment.payment?.paidAmount || 0)} remaining
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection for remaining amount */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Complete Remaining Payment</Label>
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
                                                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                            : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20 text-muted-foreground'}
                                                    `}
                                                >
                                                    <method.icon className="w-6 h-6 mb-2" />
                                                    <span className="text-sm font-medium">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            className="min-w-[160px] bg-blue-600 hover:bg-blue-700"
                                            disabled={paymentLoading}
                                            onClick={async () => {
                                                setPaymentLoading(true);
                                                try {
                                                    const remainingAmount = (selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0) - (selectedBookingForPayment.payment?.paidAmount || 0);
                                                    const response = await apiClient.patch(`/api/bookings/${selectedBookingForPayment.id}/complete`, {
                                                        taxId,
                                                        paymentMethod,
                                                        amount: remainingAmount
                                                    });
                                                    await fetchBookings();
                                                    toast.success("Remaining payment recorded successfully");
                                                    const responseData = response.data as any;
                                                    setSelectedBookingForPayment({
                                                        ...selectedBookingForPayment,
                                                        paymentStatus: 'paid',
                                                        status: 'completed',
                                                        payment: {
                                                            ...selectedBookingForPayment.payment,
                                                            status: 'paid',
                                                            paidAmount: selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price,
                                                            method: paymentMethod,
                                                            transactionIds: responseData?.payment?.transactionIds || selectedBookingForPayment.payment?.transactionIds || [],
                                                        }
                                                    });
                                                } catch (err: any) {
                                                    toast.error(`Payment Error: ${err.response?.data?.message || err.message || "Failed to record payment"}`);
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
                                                    Complete Payment
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* PAID STATE */}
                            {selectedBookingForPayment.paymentStatus === "paid" && (
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
                                                {selectedBookingForPayment.payment?.paidAt
                                                    ? new Date(selectedBookingForPayment.payment.paidAt).toLocaleDateString()
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
                                                // Update local state to show refunded view
                                                setSelectedBookingForPayment({
                                                    ...selectedBookingForPayment,
                                                    paymentStatus: 'refunded',
                                                    payment: {
                                                        ...selectedBookingForPayment.payment,
                                                        refundedAt: new Date().toISOString(),
                                                        refundAmount: selectedBookingForPayment.payment?.paidAmount,
                                                        refundReason: 'Requested by professional'
                                                    }
                                                });
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
                            )}

                            {/* PENDING STATE (default) */}
                            {(!selectedBookingForPayment.paymentStatus || selectedBookingForPayment.paymentStatus === "pending") && (
                                <>
                                    {/* Cost Breakdown */}
                                    <div className="bg-muted/30 p-4 rounded-lg border text-sm space-y-2">
                                        <h4 className="font-semibold mb-2">Price Breakdown</h4>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Base Price</span>
                                            <span>€{(selectedBookingForPayment.pricing?.basePrice ?? selectedBookingForPayment.service?.price ?? 0).toFixed(2)}</span>
                                        </div>

                                        {/* Discounts */}
                                        {selectedBookingForPayment.pricing?.discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount {selectedBookingForPayment.pricing?.discountReason ? `(${selectedBookingForPayment.pricing.discountReason})` : ''}</span>
                                                <span>-€{Number(selectedBookingForPayment.pricing.discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* Additional Charges (Sum) */}
                                        {Array.isArray(selectedBookingForPayment.pricing?.additionalCharges) && selectedBookingForPayment.pricing.additionalCharges.length > 0 && (
                                            <div className="flex justify-between text-orange-600">
                                                <span>Additional Charges</span>
                                                <span>+€{(selectedBookingForPayment.pricing.additionalCharges.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)).toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t pt-2 flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>€{(parseFloat(customPaymentAmount) || selectedBookingForPayment.pricing?.totalPrice || selectedBookingForPayment.service?.price || 0).toFixed(2)}</span>
                                        </div>

                                        {/* Internal Info - Commission (Separate section or clearly marked) */}
                                        {selectedBookingForPayment.commission?.commissionAmount > 0 && (
                                            <div className="mt-2 pt-2 border-t border-dashed text-xs text-muted-foreground">
                                                <div className="flex justify-between">
                                                    <span>Professional Commission {selectedBookingForPayment.commission?.commissionPercentage ? `(${selectedBookingForPayment.commission.commissionPercentage}%)` : ''}</span>
                                                    <span>€{Number(selectedBookingForPayment.commission.commissionAmount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Method Selection */}
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
                                                                            paidAt: new Date().toISOString(),
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
                                </>
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
                                        {selectedBookingDetails.status === 'blocked'
                                            ? t('status.blockedTime', 'Blocked Time')
                                            : (selectedBookingDetails.client?.name || "N/A")}
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

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Time
                                        </Label>
                                        <p className="text-sm font-medium">
                                            {selectedBookingDetails.endTime
                                                ? new Date(
                                                    selectedBookingDetails.endTime
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "N/A"}
                                        </p>
                                    </div>
                                    {canViewPaymentDetails && selectedBookingDetails.status?.toLowerCase() !== 'blocked' && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Payment Status
                                            </Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={getPaymentStatusColor(
                                                        selectedBookingDetails.paymentStatus
                                                    )}
                                                >
                                                    {selectedBookingDetails.paymentStatus || "pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {
                                selectedBookingDetails.notes && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Notes
                                        </Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                                            {selectedBookingDetails.notes}
                                        </p>
                                    </div>
                                )
                            }

                            {/* Recurring Booking Information */}
                            {
                                selectedBookingDetails.recurrence?.isRecurring && (
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
                                )
                            }

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
                        </div >
                    )
                    }
                </DialogContent >
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
                planType={(user?.plan as 'simple' | 'individual' | 'business') || 'business'}
                showPricing={!isSimplePlan}
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

export default CommandCenter;
