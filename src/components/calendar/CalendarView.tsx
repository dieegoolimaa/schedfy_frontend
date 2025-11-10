import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Booking } from "../../types/models/bookings.interface";
import { cn } from "../../lib/utils";

interface CalendarViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  title?: string;
  description?: string;
  workingHours?: {
    start?: string; // "09:00"
    end?: string; // "18:00"
  };
}

type ViewMode = "month" | "week" | "day";

export function CalendarView({
  open,
  onOpenChange,
  bookings,
  title = "Calendar View",
  description = "View and manage your appointments",
  workingHours = { start: "09:00", end: "18:00" },
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Navigation functions
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= startOfDay && bookingDate <= endOfDay;
    });
  };

  // Format date header based on view mode
  const formatDateHeader = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Helper to get week start (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    // Generate 6 weeks
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    return (
      <div className="space-y-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDate(day);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 p-2 border rounded-lg relative",
                  !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                  isToday && "border-primary border-2"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday && "text-primary font-bold"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayBookings.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {dayBookings.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "text-xs p-1 rounded truncate",
                        booking.status === "confirmed" &&
                          "bg-blue-100 text-blue-800",
                        booking.status === "completed" &&
                          "bg-green-100 text-green-800",
                        booking.status === "pending" &&
                          "bg-yellow-100 text-yellow-800",
                        booking.status === "cancelled" &&
                          "bg-red-100 text-red-800"
                      )}
                      title={`${new Date(booking.startTime).toLocaleTimeString(
                        "en-US",
                        { hour: "2-digit", minute: "2-digit" }
                      )} - ${
                        typeof booking.service === "object"
                          ? booking.service?.name
                          : "Service"
                      }`}
                    >
                      {new Date(booking.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      return day;
    });

    // Parse working hours
    const startHour = parseInt(workingHours.start?.split(":")[0] || "9");
    const endHour = parseInt(workingHours.end?.split(":")[0] || "18");

    // Generate hours based on working hours
    const hours = Array.from(
      { length: endHour - startHour + 1 },
      (_, i) => startHour + i
    );

    return (
      <div className="space-y-4">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-2">
          <div className="text-sm font-medium text-muted-foreground"></div>
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "text-center",
                  isToday && "text-primary font-bold"
                )}
              >
                <div className="text-sm font-medium">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={cn("text-lg", isToday && "text-primary")}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 gap-2 border-b last:border-b-0"
            >
              <div className="text-xs text-muted-foreground p-2 text-right">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day) => {
                const dayBookings = getBookingsForDate(day).filter(
                  (booking) => {
                    const bookingHour = new Date(booking.startTime).getHours();
                    return bookingHour === hour;
                  }
                );

                return (
                  <div key={day.toISOString()} className="p-1 min-h-12">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "text-xs p-1 rounded mb-1",
                          booking.status === "confirmed" &&
                            "bg-blue-100 text-blue-800",
                          booking.status === "completed" &&
                            "bg-green-100 text-green-800",
                          booking.status === "pending" &&
                            "bg-yellow-100 text-yellow-800",
                          booking.status === "cancelled" &&
                            "bg-red-100 text-red-800"
                        )}
                      >
                        <div className="font-medium truncate">
                          {typeof booking.service === "object"
                            ? booking.service?.name
                            : "Service"}
                        </div>
                        <div className="text-xs">
                          {new Date(booking.startTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate).sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return (
      <div className="space-y-4">
        {dayBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No appointments scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dayBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">
                      {typeof booking.service === "object"
                        ? booking.service?.name
                        : "Service"}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(booking.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(booking.endTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      booking.status === "confirmed" &&
                        "bg-blue-100 text-blue-800 border-blue-200",
                      booking.status === "completed" &&
                        "bg-green-100 text-green-800 border-green-200",
                      booking.status === "pending" &&
                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                      booking.status === "cancelled" &&
                        "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {booking.status}
                  </Badge>
                </div>

                {booking.client && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {typeof booking.client === "object"
                      ? booking.client.name
                      : booking.client}
                  </div>
                )}

                {typeof booking.service === "object" &&
                  booking.service?.price && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      €{booking.service.price}
                    </div>
                  )}

                {booking.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-2">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{formatDateHeader()}</h3>
            </div>

            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar content */}
          <div>
            {viewMode === "month" && renderMonthView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap text-sm border-t pt-4">
            <span className="font-medium">Status:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
