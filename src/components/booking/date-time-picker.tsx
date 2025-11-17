import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "../time-slot-picker";
import { TimeSlot } from "@/services/bookings.service";

interface DateTimePickerProps {
  entityId: string;
  serviceId: string;
  professionalId?: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  includeOverbooking?: boolean; // Only for internal/authenticated users
}

export function DateTimePicker({
  entityId,
  serviceId,
  professionalId,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotSelect,
  includeOverbooking = false, // Default false for public access
}: DateTimePickerProps) {
  return (
    <div className="space-y-3">
      {/* Compact Calendar */}
      <div className="border rounded-md p-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => onDateChange(date as Date | undefined)}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="w-full"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="border rounded-md p-3">
          <TimeSlotPicker
            entityId={entityId}
            serviceId={serviceId}
            date={format(selectedDate, "yyyy-MM-dd")}
            professionalId={professionalId}
            selectedSlot={selectedSlot}
            onSelectSlot={onSlotSelect}
            includeOverbooking={includeOverbooking}
          />
        </div>
      )}
    </div>
  );
}
