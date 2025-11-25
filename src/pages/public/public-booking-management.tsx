import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { publicService } from "@/services/public.service";
import { toast } from "sonner";
import {
    Calendar,
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

export function PublicBookingManagementPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<any>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

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
        if (!id) return;
        setCancelling(true);
        try {
            await publicService.cancelBooking(booking.entityId, id, undefined, cancelReason);
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
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending Confirmation
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Cancelled
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
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
                        <CardTitle>Booking Not Found</CardTitle>
                        <CardDescription>
                            We couldn't find the booking you're looking for.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => navigate("/")}>Go Home</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const canCancel =
        booking.status !== "cancelled" &&
        booking.status !== "completed" &&
        new Date(booking.startDateTime) > new Date();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Booking Details
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Manage your appointment with {booking.entityId?.name || "us"}
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
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {format(new Date(booking.startDateTime), "EEEE, MMMM d, yyyy")}
                                </div>
                                <div className="flex items-center gap-2 font-medium pl-6">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {format(new Date(booking.startDateTime), "HH:mm")} -{" "}
                                    {format(new Date(booking.endDateTime), "HH:mm")}
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
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

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

