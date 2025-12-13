import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { useBookings } from "../../hooks/useBookings";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";
import { CreateBookingDto } from "../../types/models/bookings.interface";

interface BlockTimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityId: string;
    professionalId?: string;
    onSuccess?: () => void;
    professionals?: Array<{ id: string; name: string }>;
}

export function BlockTimeDialog({
    open,
    onOpenChange,
    entityId,
    professionalId: initialProfessionalId,
    onSuccess,
    professionals = [],
}: BlockTimeDialogProps) {
    const { user } = useAuth();
    const { createBooking } = useBookings({ entityId, autoFetch: false });
    const [loading, setLoading] = useState(false);

    // Form State
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [reason, setReason] = useState("");
    const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<string[]>(
        initialProfessionalId
            ? [initialProfessionalId]
            : (user?.role === 'professional' ? [user.id] : [])
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        try {
            setLoading(true);

            if (selectedProfessionalIds.length === 0) {
                toast.error("Please select at least one professional");
                setLoading(false);
                return;
            }

            // Format date strings
            const startDateTime = `${date}T${startTime}:00`;
            const endDateTime = `${date}T${endTime}:00`;

            // Validate times
            if (new Date(startDateTime) >= new Date(endDateTime)) {
                toast.error("End time must be after start time");
                setLoading(false);
                return;
            }

            // Create blocking events
            await Promise.all(selectedProfessionalIds.map(async (profId) => {
                const payload: CreateBookingDto = {
                    entityId,
                    professionalId: profId,
                    startDateTime,
                    endDateTime,
                    status: 'blocked',
                    internalNotes: reason || "Time blocked by admin",
                    pricing: {
                        basePrice: 0,
                        totalPrice: 0,
                        currency: "EUR"
                    },
                    createdBy: user?.id || entityId,
                    clientInfo: {
                        name: "Blocked Time",
                        notes: reason
                    }
                };

                if (profId === 'all') return; // Skip invalid

                await createBooking(payload);
            }));

            toast.success("Time blocked successfully for selected professionals");

            if (onSuccess) onSuccess();
            onOpenChange(false);

            // Reset form
            setReason("");
            setStartTime("09:00");
            setEndTime("10:00");
        } catch (error) {
            console.error("Failed to block time:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-orange-500" />
                        Block Time
                    </DialogTitle>
                    <DialogDescription>
                        Prevent bookings during this period. This will be visible as "Blocked" on the calendar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    className="pl-9"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    className="pl-9"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {professionals.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Select Professionals</Label>
                                <div className="space-x-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-blue-600"
                                        onClick={() => setSelectedProfessionalIds(professionals.map(p => p.id))}
                                    >
                                        Select All
                                    </Button>
                                    <span className="text-gray-300">|</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-gray-500"
                                        onClick={() => setSelectedProfessionalIds([])}
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            <div className="border rounded-md p-2 max-h-[150px] overflow-y-auto space-y-2">
                                {professionals.map((professional) => (
                                    <div key={professional.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                                        <Checkbox
                                            id={`prof-${professional.id}`}
                                            checked={selectedProfessionalIds.includes(professional.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedProfessionalIds([...selectedProfessionalIds, professional.id]);
                                                } else {
                                                    setSelectedProfessionalIds(selectedProfessionalIds.filter(id => id !== professional.id));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`prof-${professional.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                        >
                                            {professional.name}
                                            {user?.id === professional.id && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                                {selectedProfessionalIds.length} selected
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Textarea
                            placeholder="e.g., Staff Meeting, Personal Time, Maintenance"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                            {loading ? "Blocking..." : "Block Time"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
