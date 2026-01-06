import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useEntity } from "../../hooks/useEntity";
import { useBookings } from "../../hooks/useBookings";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";

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
    X,
    LayoutList,
    Play,
    Hourglass,
    Eye,
} from "lucide-react";

interface CommandCenterProps {
    forcedProfessionalId?: string;
    planType?: 'simple' | 'individual' | 'business';
}

export function CommandCenter({ forcedProfessionalId }: CommandCenterProps) {
    const { t } = useTranslation("bookings");
    const { user } = useAuth();
    const { entity: fullEntity } = useEntity({ autoFetch: true }); // Fetch full entity profile
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

    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [dateFilter, setDateFilter] = useState("all");
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

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

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("all");
        setServiceFilter("all");
        setProfessionalFilter("all");
        setSearchParams({});
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter !== "all" || serviceFilter !== "all" || professionalFilter !== "all";



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

            return matchesSearch && matchesStatus && matchesDate && matchesService && matchesProfessional;
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
        today: displayBookings.filter((b) => {
            const bookingDate = new Date(b.startTime);
            const today = new Date();
            return bookingDate.toDateString() === today.toDateString();
        }).length,
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
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 p-6">
                <div className="relative z-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <CalendarIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {t("commandCenter.title")}
                                </h1>
                            </div>
                            <p className="text-muted-foreground">
                                {t("commandCenter.subtitle")}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">


                            {/* View Mode Toggle */}
                            <div className="flex items-center border rounded-lg bg-white/80 dark:bg-gray-900/80">
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-r-none"
                                >
                                    <LayoutList className="h-4 w-4 mr-2" />
                                    <span className="hidden lg:inline">List</span>
                                </Button>
                                <Button
                                    variant={viewMode === "calendar" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("calendar")}
                                    className="rounded-l-none"
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    <span className="hidden lg:inline">Calendar</span>
                                </Button>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => navigate(`/book/${(fullEntity as any)?.slug || entityId}`)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">{t("newBooking")}</span>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-full blur-3xl -z-0"></div>
            </div>

            {/* Quick Actions Bar */}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 transition-all"
                    onClick={() => {
                        setStatusFilter('pending');
                        setViewMode('list'); // Auto-switch to list when filtering
                    }}
                >
                    <div className="p-2 rounded-lg bg-orange-100">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.pendingConfirmation}</div>
                        <div className="text-xs text-muted-foreground">{t("pendingActions")}</div>
                    </div>
                </Button>

                <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 hover:bg-green-50 hover:border-green-200 transition-all"
                    onClick={() => {
                        setDateFilter('today');
                        setViewMode('list'); // Auto-switch to list when filtering
                    }}
                >
                    <div className="p-2 rounded-lg bg-green-100">
                        <CalendarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats.today}</div>
                        <div className="text-xs text-muted-foreground">{t("todaysBookings")}</div>
                    </div>
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 hover:bg-red-50 hover:border-red-200 transition-all"
                        onClick={resetFilters}
                    >
                        <div className="p-2 rounded-lg bg-red-100">
                            <X className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{t("reset")}</div>
                            <div className="text-xs text-muted-foreground">{t("activeFilters")}</div>
                        </div>
                    </Button>
                )}
            </div>

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
                            <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                            <SelectItem value="pending">{t("stats.awaitingConfirmation")}</SelectItem>
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
                            <SelectItem value="all">{t("filters.allDates")}</SelectItem>
                            <SelectItem value="today">{t("filters.today")}</SelectItem>
                            <SelectItem value="upcoming">{t("filters.upcoming")}</SelectItem>
                            <SelectItem value="past">{t("filters.past")}</SelectItem>
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
                                {!effectiveProfessionalId && (
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

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setServiceFilter("all");
                                            setProfessionalFilter("all");
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
                                <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
                                <CardDescription>
                                    Complete list of all bookings with detailed information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 bg-gray-50/50">
                                <div className="space-y-3">
                                    {filteredBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                                        >
                                            {/* Left: Client Info */}
                                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-sm">
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
                                                        <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] h-4 sm:h-5 min-w-0 bg-blue-500 border-2 border-white shadow-sm">
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">
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
                                                    <div className="font-medium text-sm sm:text-base text-gray-900 flex items-center gap-2">
                                                        {booking.service?.name}
                                                        {(booking as any).recurrence?.isRecurring && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] h-5 px-1 bg-purple-50 text-purple-700 border-purple-100 cursor-pointer hover:bg-purple-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const parentId = (booking as any).recurrence?.parentBookingId || booking.id;
                                                                    handleViewRecurringSeries(parentId);
                                                                }}
                                                            >
                                                                <Repeat className="h-3 w-3 mr-1" />
                                                                Series
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span>{booking.professional?.name}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span>{(booking.service as any)?.duration} min</span>
                                                        {(booking.service as any)?.category && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <span>{(booking.service as any)?.category}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-100 w-fit">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                                        <span className="font-medium text-gray-700">
                                                            {booking.startTime
                                                                ? new Date(booking.startTime).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                                        <span className="font-medium text-gray-700">
                                                            {booking.startTime
                                                                ? new Date(booking.startTime).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Status & Actions */}
                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusColor(booking.status)} px-2.5 py-0.5`}
                                                    >
                                                        {getStatusIcon(booking.status)}
                                                        <span className="ml-1.5 capitalize">{booking.status}</span>
                                                    </Badge>

                                                    {booking.status === "pending" && (booking as any).service?.bookingSettings?.requireManualConfirmation && (
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0.5">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Awaiting Confirmation
                                                        </Badge>
                                                    )}


                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                                        onClick={() => handleViewDetails(booking)}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {booking.status === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleConfirmBooking(booking.id)}
                                                            title="Confirm Booking"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {booking.status === 'confirmed' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                                            title="Start Appointment"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {booking.status === 'in_progress' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                                                            title="Mark as Completed"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}



                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>

                                                            {booking.status === "pending" && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleConfirmBooking(booking.id)}
                                                                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                                    >
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Confirm Booking
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => openRejectDialog(booking.id)}
                                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Reject Booking
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setEditingBooking(booking);
                                                                    setIsEditDialogOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Booking
                                                            </DropdownMenuItem>

                                                            {booking.status === 'confirmed' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                                                    className="text-blue-600"
                                                                >
                                                                    <Play className="mr-2 h-4 w-4" />
                                                                    Start Appointment
                                                                </DropdownMenuItem>
                                                            )}

                                                            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
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
                                                                        Cancel Booking
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
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                                <CalendarIcon className="h-full w-full" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Try adjusting your filters or create a new booking.
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

                </div >
                {/* End Main Content */}

                {/* Sidebar - Right Panel (Desktop Only) */}
                <div className="space-y-4 hidden lg:block">
                    {/* Widgets removed for Simple plan */}
                </div>
            </div >
            {/* End Split-View Layout */}



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
                                        {selectedBookingDetails.service?.duration || 0} min
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
