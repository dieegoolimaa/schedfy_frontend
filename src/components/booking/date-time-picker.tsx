import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "../time-slot-picker";
import { TimeSlot } from "@/services/bookings.service";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  entityId: string;
  serviceId: string;
  professionalId?: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function DateTimePicker({
  entityId,
  serviceId,
  professionalId,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotSelect,
}: DateTimePickerProps) {
  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Select Date</h3>
        </div>
        <Calendar
          selected={selectedDate}
          onSelect={onDateChange}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="rounded-md border w-full"
        />
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card className="p-4">
          <TimeSlotPicker
            entityId={entityId}
            serviceId={serviceId}
            date={format(selectedDate, "yyyy-MM-dd")}
            professionalId={professionalId}
            selectedSlot={selectedSlot}
            onSelectSlot={onSlotSelect}
          />
        </Card>
      )}
    </div>
  );
}
