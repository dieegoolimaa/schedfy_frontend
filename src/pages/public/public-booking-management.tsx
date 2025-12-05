import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { publicService } from "@/services/public.service";
import { toast } from "sonner";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    CreditCard,
    XCircle,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Booking } from "@/types/models/bookings.interface";

interface PopulatedBooking extends Omit<Booking, 'entityId' | 'serviceId' | 'professionalId'> {
    entityId: any;
    serviceId: any;
    professionalId?: any;
}

export function PublicBookingManagementPage() {
    const { t } = useTranslation("publicBooking");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<PopulatedBooking | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // Reschedule State
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduling, setRescheduling] = useState(false);

    useEffect(() => {
        if (selectedDate && booking) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate, booking]);

    const fetchSlots = async (date: Date) => {
        if (!booking) return;
        setLoadingSlots(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const entityId = typeof booking.entityId === 'string' ? booking.entityId : booking.entityId._id;
            const serviceId = typeof booking.serviceId === 'string' ? booking.serviceId : booking.serviceId._id;
            const professionalId = booking.professionalId
                ? (typeof booking.professionalId === 'string' ? booking.professionalId : booking.professionalId._id)
                : undefined;

            const response = await publicService.getAvailableSlots(entityId, {
                serviceId: serviceId,
                date: dateStr,
                professionalId: professionalId,
            });
            setAvailableSlots(response.data);
        } catch (error) {
            console.error("Failed to fetch slots:", error);
            toast.error("Failed to load available times");
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleReschedule = async () => {
        if (!selectedSlot || !selectedDate || !booking) return;
        setRescheduling(true);
        try {
            const [time, professionalId] = selectedSlot.split('|');
            const [hours, minutes] = time.split(':').map(Number);

            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(hours, minutes, 0, 0);

            // Calculate end time based on service duration (assuming 60 mins if not available, or fetch service details)
            // Ideally we should have service duration. For now, let's assume the backend handles duration or we use a default.
            // Better: The backend update usually takes startDateTime and calculates endDateTime if not provided, or we need to provide it.
            // Let's try to calculate it if we have service duration in booking object.
            // Note: serviceId is populated, so we might have duration there.
            const duration = booking.serviceId?.duration || 60;
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            await publicService.updateBooking(id!, {
                startDateTime: startDateTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
                professionalId: professionalId || (typeof booking.professionalId === 'string' ? booking.professionalId : booking.professionalId?._id),
                status: 'pending', // Reset to pending for approval if needed
                notes: `${booking.notes || ''}\n[Rescheduled from ${format(new Date(booking.startDateTime!), 'yyyy-MM-dd HH:mm')}]`.trim()
            });

            toast.success("Booking rescheduled successfully");
            setRescheduleDialogOpen(false);
            // Refresh booking
            const response = await publicService.getBookingById(id!);
            setBooking(response.data);
        } catch (error) {
            console.error("Failed to reschedule:", error);
            toast.error("Failed to reschedule booking");
        } finally {
            setRescheduling(false);
        }
    };

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return;
            try {
                const response = await publicService.getBookingById(id);
                setBooking(response.data);
            } catch (error) {
                console.error("Failed to fetch booking:", error);
                toast.error("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleCancelBooking = async () => {
        if (!id || !booking) return;
        setCancelling(true);
        try {
            const entityId = typeof booking.entityId === 'string' ? booking.entityId : booking.entityId._id;
            await publicService.cancelBooking(entityId, id, undefined, cancelReason);
            toast.success("Booking cancelled successfully");
            setCancelDialogOpen(false);
            // Refresh booking details
            const response = await publicService.getBookingById(id);
            setBooking(response.data);
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            toast.error("Failed to cancel booking");
        } finally {
            setCancelling(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t("status.confirmed")}
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> {t("status.pending")}
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> {t("status.cancelled")}
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t("status.completed")}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>{t("notFound.title")}</CardTitle>
                        <CardDescription>
                            {t("notFound.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => navigate("/")}>{t("notFound.goHome")}</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const canCancel =
        booking.status !== "cancelled" &&
        booking.status !== "completed" &&
        booking.startDateTime &&
        new Date(booking.startDateTime) > new Date();

    const canReschedule =
        booking &&
        ['pending', 'confirmed'].includes(booking.status) &&
        booking.startDateTime &&
        new Date(booking.startDateTime) > new Date();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("title")}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t("subtitle", { entity: booking.entityId?.name || t("us") })}
                    </p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {booking.serviceId?.name || "Service"}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {booking.entityId?.name}
                                </CardDescription>
                            </div>
                            {getStatusBadge(booking.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Date & Time
                                </Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                    {booking.startDateTime && format(new Date(booking.startDateTime), "EEEE, MMMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-2 font-medium pl-6">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {booking.startDateTime && format(new Date(booking.startDateTime), "HH:mm")} -{" "}
                                    {booking.endDateTime && format(new Date(booking.endDateTime), "HH:mm")}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Professional
                                </Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <User className="w-4 h-4 text-primary" />
                                    {booking.professionalId
                                        ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}`
                                        : "Any Professional"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Location
                                </Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {booking.entityId?.address ||
                                        booking.entityId?.location ||
                                        "Online / Remote"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Price
                                </Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    {booking.pricing?.totalPrice
                                        ? formatCurrency(booking.pricing.totalPrice)
                                        : "Free / Consult"}
                                </div>
                            </div>
                        </div>

                        {booking.notes && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-900/50">
                                <Label className="text-yellow-800 dark:text-yellow-200 text-xs uppercase tracking-wider mb-1 block">
                                    Your Notes
                                </Label>
                                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                    {booking.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-gray-50/50 dark:bg-gray-800/50 border-t p-6 flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                                const slug = booking.entityId?.publicProfile?.slug || booking.entityId?.slug || booking.entityId?.username;
                                if (slug) {
                                    navigate(`/book/${slug}`);
                                } else {
                                    navigate(-1);
                                }
                            }}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to {booking.entityId?.name || "Business"}
                            </Button>
                            {canReschedule && (
                                <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary">
                                            Reschedule
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Reschedule Appointment</DialogTitle>
                                            <DialogDescription>
                                                Select a new date and time for your appointment.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="flex justify-center border rounded-md p-2">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={setSelectedDate as any}
                                                    className="rounded-md border shadow-sm"
                                                    disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                />
                                            </div>

                                            {selectedDate && (
                                                <div className="space-y-2">
                                                    <Label>Available Times for {format(selectedDate, 'MMMM d, yyyy')}</Label>
                                                    {loadingSlots ? (
                                                        <div className="flex justify-center py-4">
                                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                        </div>
                                                    ) : availableSlots.length > 0 ? (
                                                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                                                            {availableSlots.map((slot: any) => (
                                                                <Button
                                                                    key={`${slot.time}-${slot.professionalId || 'any'}`}
                                                                    variant={selectedSlot === `${slot.time}|${slot.professionalId || ''}` ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => setSelectedSlot(`${slot.time}|${slot.professionalId || ''}`)}
                                                                    className="w-full"
                                                                >
                                                                    {slot.time}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground text-center py-2">
                                                            No slots available for this date.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setRescheduleDialogOpen(false)}
                                                disabled={rescheduling}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleReschedule}
                                                disabled={!selectedSlot || rescheduling}
                                            >
                                                {rescheduling ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Confirming...
                                                    </>
                                                ) : (
                                                    "Confirm Reschedule"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {canCancel && (
                            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">Cancel Booking</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Cancel Booking</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to cancel this booking? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="reason" className="mb-2 block">
                                            Reason for cancellation (optional)
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="I can't make it..."
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCancelDialogOpen(false)}
                                            disabled={cancelling}
                                        >
                                            Keep Booking
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleCancelBooking}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                "Yes, Cancel Booking"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

