import { useEffect, useState } from "react";
import { bookingsService, TimeSlot } from "../services/bookings.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  entityId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  professionalId?: string;
  selectedSlot?: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  className?: string;
  includeOverbooking?: boolean; // Only for internal/authenticated users
  duration?: number;
}

export function TimeSlotPicker({
  entityId,
  serviceId,
  date,
  professionalId,
  selectedSlot,
  onSelectSlot,
  className,
  includeOverbooking = false, // Default false for public access
  duration,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId || (!serviceId && !duration) || !date) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("[TimeSlotPicker] Loading slots with params:", {
          entityId,
          serviceId,
          date,
          professionalId,
          includeOverbooking,
        });
        const response = await bookingsService.getAvailableSlots({
          entityId,
          serviceId,
          date,
          professionalId,
          includeOverbooking,
          duration,
        });
        console.log("[TimeSlotPicker] Response:", response);
        setSlots(response.data || []);

        if (!response.data || response.data.length === 0) {
          console.warn("[TimeSlotPicker] No slots available");
          setError("No available time slots for this date");
        }
      } catch (err: any) {
        console.error("[TimeSlotPicker] Error loading time slots:", err);
        console.error("[TimeSlotPicker] Error details:", {
          message: err.message,
          response: err.response,
          stack: err.stack,
        });
        setError(
          err.response?.data?.message || "Failed to load available time slots"
        );
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [entityId, serviceId, date, professionalId, includeOverbooking, duration]);

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium mb-2">Available Times</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium mb-2">Available Times</div>
        <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium mb-2">Available Times</div>
        <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
          No available time slots for this date. Please select another date.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Times
        </div>
        <Badge variant="secondary" className="text-xs">
          {slots.length === 1 ? "1 slot" : `${slots.length} slots`} available
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 max-h-96 overflow-y-auto pr-2 pb-2 scrollbar-thin p-1">
        {slots.map((slot, index) => {
          const isSelected =
            selectedSlot?.time === slot.time &&
            selectedSlot?.professionalId === slot.professionalId;

          return (
            <Button
              key={`${slot.time}-${slot.professionalId}-${index}`}
              variant={
                isSelected
                  ? "default"
                  : slot.isOverbooking
                    ? "destructive"
                    : "outline"
              }
              size="lg"
              className={cn(
                "flex flex-col items-center justify-center h-auto py-4 px-4 transition-all duration-200 relative",
                "min-h-[70px] w-full",
                isSelected
                  ? "ring-2 ring-primary shadow-lg bg-primary text-primary-foreground"
                  : slot.isOverbooking
                    ? "border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-900"
                    : "hover:shadow-md hover:border-primary/50"
              )}
              onClick={() => onSelectSlot(slot)}
              title={
                slot.isOverbooking
                  ? "Fully booked - overbooking available for internal use"
                  : undefined
              }
            >
              <span className="font-bold text-lg leading-tight mb-0.5">
                {slot.time}
              </span>
              {slot.duration && (
                <span className="text-xs opacity-80">{slot.duration} min</span>
              )}
              {slot.isOverbooking && (
                <Badge
                  variant="secondary"
                  className="absolute top-1 left-1 text-[10px] px-1 py-0 h-4 bg-orange-600 text-white"
                >
                  Full
                </Badge>
              )}
              {slot.totalCount &&
                slot.totalCount > 1 &&
                !slot.isOverbooking && (
                  <Badge
                    variant="secondary"
                    className="absolute top-1 left-1 text-[10px] px-1 py-0 h-4"
                  >
                    {slot.availableCount}/{slot.totalCount}
                  </Badge>
                )}
              {isSelected && (
                <CheckCircle className="absolute top-1 right-1 h-4 w-4" />
              )}
            </Button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
          <div className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Selected Time Slot
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="font-medium">{selectedSlot.time}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {selectedSlot.duration} min
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
