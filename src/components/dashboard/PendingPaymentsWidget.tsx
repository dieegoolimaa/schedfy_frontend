import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
    CreditCard,
    User,
    Calendar,
    ArrowRight,
    Clock,
    AlertCircle
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { formatPrice } from "../../lib/region-config";

interface PendingPaymentsWidgetProps {
    bookings: any[];
    onProcessPayment: (booking: any) => void;
}

export function PendingPaymentsWidget({ bookings, onProcessPayment }: PendingPaymentsWidgetProps) {
    const { t } = useTranslation(["dashboard", "common"]);

    const pendingBookings = bookings.filter(b =>
        b.status !== 'cancelled' &&
        b.status !== 'no_show' &&
        (b.paymentStatus === 'pending' || b.paymentStatus === 'partial')
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (pendingBookings.length === 0) {
        return (
            <Card className="border-green-100 bg-green-50/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        Pending Payments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <CreditCard className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-green-800">All caught up!</p>
                        <p className="text-xs text-green-600 mt-1">No pending booking payments.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-orange-100 bg-orange-50/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                        {t("pendingPayments", "Pending Payments")}
                    </CardTitle>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                        {pendingBookings.length}
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    Payments waiting to be processed
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] px-4">
                    <div className="space-y-3 py-4">
                        {pendingBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group p-3 rounded-lg border bg-background hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => onProcessPayment(booking)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold truncate max-w-[120px]">
                                                {booking.client?.name || "Client"}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(booking.startTime).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-foreground">
                                            {formatPrice((booking.pricing?.totalPrice || booking.service?.price || 0) / 100)}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] px-1.5 h-4 font-bold uppercase ${booking.paymentStatus === 'partial'
                                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                : 'bg-orange-100 text-orange-700 border-orange-200'
                                                }`}
                                        >
                                            {booking.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[11px] px-2 h-7 gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                    >
                                        Process <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t bg-muted/20">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>Click on a booking to record payment</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
