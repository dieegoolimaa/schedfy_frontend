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
  asTab?: boolean; // If true, render without Dialog wrapper
}

type ViewMode = "month" | "week" | "day";

export function CalendarView({
  open,
  onOpenChange,
  bookings,
  title = "Calendar View",
  description = "View and manage your appointments",
  workingHours = { start: "09:00", end: "18:00" },
  asTab = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Debug: log bookings
  console.log("[CalendarView] Received bookings:", bookings.length, bookings);

  const handleBookingClick = (booking: Booking) => {
    console.log("[CalendarView] Booking clicked:", booking);
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

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
                      onClick={() => handleBookingClick(booking)}
                      className={cn(
                        "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
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
            const dayBookings = getBookingsForDate(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "text-center p-2 rounded-lg",
                  isToday && "bg-primary/10 border-2 border-primary"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    isToday && "text-primary"
                  )}
                >
                  {day.getDate()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dayBookings.length}{" "}
                  {dayBookings.length === 1 ? "booking" : "bookings"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[500px] overflow-y-auto border rounded-lg">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 gap-2 border-b last:border-b-0"
            >
              <div className="text-sm font-medium text-muted-foreground p-3 text-right bg-muted/30 sticky left-0">
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
                  <div
                    key={day.toISOString()}
                    className="p-1 min-h-16 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => handleBookingClick(booking)}
                          className={cn(
                            "text-xs p-2 rounded-lg cursor-pointer hover:shadow-md transition-all border",
                            booking.status === "confirmed" &&
                              "bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200",
                            booking.status === "completed" &&
                              "bg-green-100 text-green-900 border-green-200 hover:bg-green-200",
                            booking.status === "pending" &&
                              "bg-yellow-100 text-yellow-900 border-yellow-200 hover:bg-yellow-200",
                            booking.status === "cancelled" &&
                              "bg-red-100 text-red-900 border-red-200 hover:bg-red-200"
                          )}
                        >
                          <div className="font-semibold truncate">
                            {new Date(booking.startTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                          </div>
                          <div className="font-medium truncate">
                            {typeof booking.service === "object"
                              ? booking.service?.name
                              : "Service"}
                          </div>
                          <div className="text-xs opacity-90 truncate flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {typeof booking.client === "object"
                              ? booking.client?.name
                              : booking.client || "Client"}
                          </div>
                          {booking.professional && (
                            <div className="text-xs opacity-75 truncate">
                              {typeof booking.professional === "object"
                                ? booking.professional?.name ||
                                  `${booking.professional?.firstName || ""} ${
                                    booking.professional?.lastName || ""
                                  }`.trim()
                                : booking.professional}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
        {/* Day Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {dayBookings.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Appointments
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dayBookings.filter((b) => b.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dayBookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
        </div>

        {dayBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No appointments scheduled</p>
            <p className="text-sm">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {/* Timeline view */}
            {hours.map((hour) => {
              const hourBookings = dayBookings.filter((booking) => {
                const bookingHour = new Date(booking.startTime).getHours();
                return bookingHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4">
                  {/* Time column */}
                  <div className="w-20 flex-shrink-0 text-right pt-1">
                    <div className="text-sm font-semibold text-muted-foreground">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                  </div>

                  {/* Bookings column */}
                  <div className="flex-1 border-l-2 border-muted pl-4 pb-4 min-h-16">
                    {hourBookings.length === 0 ? (
                      <div className="h-12 flex items-center text-sm text-muted-foreground italic">
                        Free time
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {hourBookings.map((booking) => (
                          <div
                            key={booking.id}
                            onClick={() => handleBookingClick(booking)}
                            className={cn(
                              "border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all",
                              booking.status === "confirmed" &&
                                "bg-blue-50 border-blue-500 hover:bg-blue-100",
                              booking.status === "completed" &&
                                "bg-green-50 border-green-500 hover:bg-green-100",
                              booking.status === "pending" &&
                                "bg-yellow-50 border-yellow-500 hover:bg-yellow-100",
                              booking.status === "cancelled" &&
                                "bg-red-50 border-red-500 hover:bg-red-100"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                {/* Time */}
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    booking.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(booking.endTime).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                  <span className="text-xs text-muted-foreground font-normal">
                                    (
                                    {Math.round(
                                      (new Date(booking.endTime).getTime() -
                                        new Date(booking.startTime).getTime()) /
                                        60000
                                    )}{" "}
                                    min)
                                  </span>
                                </div>

                                {/* Service */}
                                <div className="font-semibold text-base">
                                  {typeof booking.service === "object"
                                    ? booking.service?.name
                                    : "Service"}
                                </div>

                                {/* Client */}
                                {booking.client && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {typeof booking.client === "object"
                                        ? booking.client.name
                                        : booking.client}
                                    </span>
                                  </div>
                                )}

                                {/* Professional */}
                                {booking.professional && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>
                                      {typeof booking.professional === "object"
                                        ? booking.professional?.name
                                        : booking.professional}
                                    </span>
                                  </div>
                                )}

                                {/* Price */}
                                {typeof booking.service === "object" &&
                                  booking.service?.price && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                      <DollarSign className="h-4 w-4" />€
                                      {booking.service.price}
                                    </div>
                                  )}

                                {/* Notes preview */}
                                {booking.notes && (
                                  <div className="text-xs text-muted-foreground italic line-clamp-1">
                                    "{booking.notes}"
                                  </div>
                                )}
                              </div>

                              {/* Status Badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex-shrink-0",
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Calendar content (used in both Dialog and Tab modes)
  const calendarContent = (
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
  );

  // If used as tab, render content directly without Dialog wrapper
  if (asTab) {
    return (
      <>
        {calendarContent}

        {/* Booking Details Dialog */}
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete information about this appointment
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Client Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client
                  </h3>
                  <p className="text-sm">
                    {typeof selectedBooking.client === "object"
                      ? selectedBooking.client?.name
                      : selectedBooking.client || "N/A"}
                  </p>
                </div>

                {/* Service Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Service</h3>
                  <p className="text-sm">
                    {typeof selectedBooking.service === "object"
                      ? selectedBooking.service?.name
                      : selectedBooking.service || "N/A"}
                  </p>
                </div>

                {/* Professional Information */}
                {selectedBooking.professional && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Professional
                    </h3>
                    <p className="text-sm">
                      {typeof selectedBooking.professional === "object"
                        ? selectedBooking.professional?.name ||
                          `${selectedBooking.professional?.firstName || ""} ${
                            selectedBooking.professional?.lastName || ""
                          }`.trim()
                        : selectedBooking.professional || "Not assigned"}
                    </p>
                  </div>
                )}

                {/* Date & Time */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date & Time
                  </h3>
                  <p className="text-sm">
                    {new Date(selectedBooking.startTime).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedBooking.startTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                    {selectedBooking.endTime &&
                      ` - ${new Date(
                        selectedBooking.endTime
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedBooking.status === "confirmed" &&
                        "bg-blue-100 text-blue-800 border-blue-200",
                      selectedBooking.status === "completed" &&
                        "bg-green-100 text-green-800 border-green-200",
                      selectedBooking.status === "pending" &&
                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                      selectedBooking.status === "cancelled" &&
                        "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>

                {/* Price */}
                {typeof selectedBooking.service === "object" &&
                  selectedBooking.service?.price && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price
                      </h3>
                      <p className="text-sm">
                        €{selectedBooking.service.price}
                      </p>
                    </div>
                  )}

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Otherwise render inside Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {calendarContent}
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Client Information */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h3>
                <p className="text-sm">
                  {typeof selectedBooking.client === "object"
                    ? selectedBooking.client?.name
                    : selectedBooking.client || "N/A"}
                </p>
              </div>

              {/* Service Information */}
              <div className="space-y-2">
                <h3 className="font-semibold">Service</h3>
                <p className="text-sm">
                  {typeof selectedBooking.service === "object"
                    ? selectedBooking.service?.name
                    : selectedBooking.service || "N/A"}
                </p>
              </div>

              {/* Professional Information */}
              {selectedBooking.professional && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Professional
                  </h3>
                  <p className="text-sm">
                    {typeof selectedBooking.professional === "object"
                      ? selectedBooking.professional?.name ||
                        `${selectedBooking.professional?.firstName || ""} ${
                          selectedBooking.professional?.lastName || ""
                        }`.trim()
                      : selectedBooking.professional || "Not assigned"}
                  </p>
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Date & Time
                </h3>
                <p className="text-sm">
                  {new Date(selectedBooking.startTime).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
                <p className="text-sm font-medium">
                  {new Date(selectedBooking.startTime).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  {selectedBooking.endTime &&
                    ` - ${new Date(selectedBooking.endTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}`}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h3 className="font-semibold">Status</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    selectedBooking.status === "confirmed" &&
                      "bg-blue-100 text-blue-800 border-blue-200",
                    selectedBooking.status === "completed" &&
                      "bg-green-100 text-green-800 border-green-200",
                    selectedBooking.status === "pending" &&
                      "bg-yellow-100 text-yellow-800 border-yellow-200",
                    selectedBooking.status === "cancelled" &&
                      "bg-red-100 text-red-800 border-red-200"
                  )}
                >
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* Price */}
              {typeof selectedBooking.service === "object" &&
                selectedBooking.service?.price && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price
                    </h3>
                    <p className="text-sm">€{selectedBooking.service.price}</p>
                  </div>
                )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
