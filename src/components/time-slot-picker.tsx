import { useEffect, useState } from "react";
import { bookingsApi, TimeSlot } from "@/lib/api/bookings.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  entityId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  professionalId?: string;
  selectedSlot?: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  className?: string;
}

export function TimeSlotPicker({
  entityId,
  serviceId,
  date,
  professionalId,
  selectedSlot,
  onSelectSlot,
  className,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId || !serviceId || !date) {
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
        });
        const response = await bookingsApi.getAvailableSlots({
          entityId,
          serviceId,
          date,
          professionalId,
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
  }, [entityId, serviceId, date, professionalId]);

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
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Available Times ({slots.length} slots)
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-h-80 overflow-y-auto pr-2">
        {slots.map((slot, index) => {
          const isSelected =
            selectedSlot?.time === slot.time &&
            selectedSlot?.professionalId === slot.professionalId;

          // Extract first name from professional name
          const firstName = slot.professionalName?.split(" ")[0] || "Staff";

          return (
            <Button
              key={`${slot.time}-${slot.professionalId}-${index}`}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center h-auto py-2.5 px-2 min-h-[60px]",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => onSelectSlot(slot)}
            >
              <span className="font-semibold text-base">{slot.time}</span>
              {slot.professionalName && (
                <span className="text-xs opacity-70 flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[80px]">{firstName}</span>
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
          <div className="font-medium">Selected Time</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {selectedSlot.time} ({selectedSlot.duration} minutes)
            </span>
          </div>
          {selectedSlot.professionalName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{selectedSlot.professionalName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
