import { useState } from "react";
import { useCurrency } from "../../hooks/useCurrency";
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
  Maximize2,
  Minimize2,
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
  workingHours?: any; // Accepts simple range {start, end} or full Entity WorkingHours
  asTab?: boolean; // If true, render without Dialog wrapper
  defaultView?: ViewMode;
  onEditBooking?: (booking: Booking) => void;
}

type ViewMode = "month" | "week" | "day";

export function CalendarView({
  open,
  onOpenChange,
  bookings,
  title = "Calendar View",
  description = "View and manage your appointments",
  workingHours, // Now accepts full object or simple range
  asTab = false,
  defaultView = "week",
  onEditBooking,
}: CalendarViewProps) {
  // Helper to get range for a specific date or overall
  const getHoursRange = (date?: Date) => {
    // Default fallback
    let start = 9;
    let end = 18;

    console.log(
      "[CalendarView] getHoursRange called. Date:",
      date,
      "workingHours:",
      workingHours
    );

    if (workingHours) {
      // Check if it's the full entity structure (has 'monday', 'tuesday' etc)
      const isFullConfig = "monday" in workingHours;
      console.log("[CalendarView] isFullConfig:", isFullConfig);

      if (isFullConfig) {
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];

        if (date) {
          // Specific day range (for Day View)
          const dayName = days[date.getDay()];
          const dayConfig = (workingHours as any)[dayName];
          console.log(
            "[CalendarView] Day View - Day:",
            dayName,
            "Config:",
            dayConfig
          );

          if (dayConfig?.enabled && dayConfig.start && dayConfig.end) {
            start = parseInt(dayConfig.start.split(":")[0]);
            end = parseInt(dayConfig.end.split(":")[0]);
          } else {
            // If closed, we might want to show a standard range or handle differently
            console.log(
              "[CalendarView] Day is closed or invalid config, using default 9-18"
            );
          }
        } else {
          // Union range (for Week View) - find min start and max end across all enabled days
          let minStart = 24;
          let maxEnd = 0;
          let hasEnabled = false;

          Object.entries(workingHours).forEach(([key, day]: [string, any]) => {
            // Skip non-day keys like _id if present
            if (!days.includes(key)) return;

            if (day?.enabled && day.start && day.end) {
              hasEnabled = true;
              const s = parseInt(day.start.split(":")[0]);
              const e = parseInt(day.end.split(":")[0]);
              if (!isNaN(s) && s < minStart) minStart = s;
              if (!isNaN(e) && e > maxEnd) maxEnd = e;
            }
          });

          console.log(
            "[CalendarView] Week View - Calculated range:",
            minStart,
            "-",
            maxEnd,
            "hasEnabled:",
            hasEnabled
          );

          if (hasEnabled) {
            start = minStart;
            end = maxEnd;
          }
        }
      } else {
        // Simple { start, end } structure fallback
        const simple: { start: string; end: string } | any = workingHours;
        if (simple.start && simple.end) {
          start = parseInt(simple.start.split(":")[0]);
          end = parseInt(simple.end.split(":")[0]);
        }
      }
    }

    // Ensure valid range
    if (isNaN(start)) start = 9;
    if (isNaN(end)) end = 18;

    console.log("[CalendarView] Final Range:", start, "-", end);

    // Generate array
    return Array.from(
      { length: Math.max(1, end - start + 1) },
      (_, i) => start + i
    );
  };
  const { formatCurrency } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBookingsGroup, setSelectedBookingsGroup] = useState<
    Booking[] | null
  >(null);
  const [showBookingsGroupDialog, setShowBookingsGroupDialog] = useState(false);

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
        <div className="grid grid-cols-7 gap-1">
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
                      )} - ${typeof booking.service === "object"
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

    // Generate hours based on working hours (Union of the week)
    const hours = getHoursRange(); // No date passed = union of all days

    return (
      <div className="space-y-4">
        {/* Desktop view: Grid layout */}
        <div className="hidden md:block space-y-4">
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
          <div className="h-[600px] overflow-y-auto border rounded-lg">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 gap-2 border-b last:border-b-0 h-20"
              >
                <div className="text-sm font-medium text-muted-foreground p-3 text-right bg-muted/30 sticky left-0">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDays.map((day) => {
                  const dayBookings = getBookingsForDate(day).filter(
                    (booking) => {
                      const bookingHour = new Date(
                        booking.startTime
                      ).getHours();
                      return bookingHour === hour;
                    }
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      className="p-1 h-full hover:bg-muted/20 transition-colors overflow-hidden"
                    >
                      <div className="space-y-1 h-full">
                        {dayBookings.length > 1 ? (
                          <div
                            onClick={() => {
                              setSelectedBookingsGroup(dayBookings);
                              setShowBookingsGroupDialog(true);
                            }}
                            className="h-full w-full bg-primary/5 border border-primary/20 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors p-1 text-center"
                          >
                            <span className="font-bold text-primary text-sm">
                              {dayBookings.length} bookings
                            </span>
                            <span className="text-[10px] text-primary underline mt-0.5">
                              See them
                            </span>
                          </div>
                        ) : (
                          dayBookings.map((booking) => (
                            <div
                              key={booking.id}
                              onClick={() => handleBookingClick(booking)}
                              className={cn(
                                "relative p-1.5 rounded-md cursor-pointer hover:shadow-lg transition-all border-l-4 h-full flex flex-col justify-between group overflow-hidden",
                                booking.status === "confirmed" &&
                                "bg-blue-50 border-blue-500 hover:bg-blue-100",
                                booking.status === "completed" &&
                                "bg-green-50 border-green-500 hover:bg-green-100",
                                booking.status === "pending" &&
                                "bg-amber-50 border-amber-500 hover:bg-amber-100",
                                booking.status === "cancelled" &&
                                "bg-red-50 border-red-500 hover:bg-red-100"
                              )}
                            >
                              {/* Time Badge */}
                              <div className="flex items-center justify-between mb-0.5">
                                <div
                                  className={cn(
                                    "text-[10px] font-bold px-1 py-0.5 rounded",
                                    booking.status === "confirmed" &&
                                    "bg-blue-200 text-blue-900",
                                    booking.status === "completed" &&
                                    "bg-green-200 text-green-900",
                                    booking.status === "pending" &&
                                    "bg-amber-200 text-amber-900",
                                    booking.status === "cancelled" &&
                                    "bg-red-200 text-red-900"
                                  )}
                                >
                                  {new Date(
                                    booking.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </div>
                              </div>

                              {/* Client Name - Most Important */}
                              <div className="font-bold text-[10px] leading-tight truncate mb-0.5 text-gray-900">
                                {typeof booking.client === "object"
                                  ? booking.client?.name
                                  : booking.client || "Client"}
                              </div>

                              {/* Service Name */}
                              <div className="text-[9px] leading-tight truncate text-gray-700 mb-0.5">
                                {typeof booking.service === "object"
                                  ? booking.service?.name
                                  : "Service"}
                              </div>

                              {/* Professional - Small text at bottom */}
                              {booking.professional && (
                                <div className="text-[8px] leading-tight truncate text-gray-500 mt-auto">
                                  {typeof booking.professional === "object"
                                    ? booking.professional?.name
                                    : booking.professional}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view: Vertical list of days */}
        <div className="md:hidden space-y-3">
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDate(day).sort(
              (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
            );

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border rounded-lg overflow-hidden",
                  isToday && "border-primary border-2"
                )}
              >
                {/* Day header */}
                <div
                  className={cn(
                    "p-3 border-b",
                    isToday ? "bg-primary/10" : "bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {day.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold",
                          isToday && "text-primary"
                        )}
                      >
                        {day.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {dayBookings.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dayBookings.length === 1 ? "booking" : "bookings"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookings list */}
                <div className="divide-y">
                  {dayBookings.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground italic">
                      No bookings scheduled
                    </div>
                  ) : (
                    dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                          booking.status === "confirmed" && "bg-blue-50/50",
                          booking.status === "completed" && "bg-green-50/50",
                          booking.status === "pending" && "bg-yellow-50/50",
                          booking.status === "cancelled" && "bg-red-50/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Time indicator */}
                          <div className="flex-shrink-0">
                            <div className="text-sm font-semibold">
                              {new Date(booking.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(
                                (new Date(booking.endTime).getTime() -
                                  new Date(booking.startTime).getTime()) /
                                60000
                              )}{" "}
                              min
                            </div>
                          </div>

                          {/* Booking info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {typeof booking.service === "object"
                                ? booking.service?.name
                                : "Service"}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground truncate">
                              <User className="h-3 w-3" />
                              {typeof booking.client === "object"
                                ? booking.client?.name
                                : booking.client || "Client"}
                            </div>
                            {booking.professional && (
                              <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {typeof booking.professional === "object"
                                  ? booking.professional?.name
                                  : booking.professional}
                              </div>
                            )}
                          </div>

                          {/* Status badge */}
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
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

    // Generate hours based on working hours for THIS specific day
    const hours = getHoursRange(currentDate);

    return (
      <div className="space-y-4">
        {/* Day Summary */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-primary">
              {dayBookings.length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {dayBookings.filter((b) => b.status === "completed").length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {dayBookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              Confirmed
            </div>
          </div>
        </div>

        {dayBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No appointments scheduled</p>
            <p className="text-sm">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-2 h-[600px] overflow-y-auto">
            {/* Desktop: Timeline view */}
            <div className="hidden md:block space-y-2">
              {hours.map((hour) => {
                const hourBookings = dayBookings.filter((booking) => {
                  const bookingHour = new Date(booking.startTime).getHours();
                  return bookingHour === hour;
                });

                return (
                  <div key={hour} className="flex gap-4 h-20">
                    {/* Time column */}
                    <div className="w-20 flex-shrink-0 text-right pt-1">
                      <div className="text-sm font-semibold text-muted-foreground">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    </div>

                    {/* Bookings column */}
                    <div className="flex-1 border-l-2 border-muted pl-4 pb-4 h-full overflow-hidden">
                      {hourBookings.length === 0 ? (
                        <div className="h-full flex items-center text-sm text-muted-foreground italic">
                          Free time
                        </div>
                      ) : hourBookings.length > 1 ? (
                        <div
                          onClick={() => {
                            setSelectedBookingsGroup(hourBookings);
                            setShowBookingsGroupDialog(true);
                          }}
                          className="h-full w-full bg-primary/5 border border-primary/20 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors p-4 text-center"
                        >
                          <span className="font-bold text-primary text-lg">
                            {hourBookings.length} bookings
                          </span>
                          <span className="text-xs text-primary underline mt-1">
                            See them
                          </span>
                        </div>
                      ) : (
                        <div className="h-full">
                          {hourBookings.map((booking) => (
                            <div
                              key={booking.id}
                              onClick={() => handleBookingClick(booking)}
                              className={cn(
                                "relative border-l-4 rounded-lg p-2.5 cursor-pointer hover:shadow-xl transition-all h-full flex items-center justify-between group",
                                booking.status === "confirmed" &&
                                "bg-blue-50 border-blue-500 hover:bg-blue-100",
                                booking.status === "completed" &&
                                "bg-green-50 border-green-500 hover:bg-green-100",
                                booking.status === "pending" &&
                                "bg-amber-50 border-amber-500 hover:bg-amber-100",
                                booking.status === "cancelled" &&
                                "bg-red-50 border-red-500 hover:bg-red-100"
                              )}
                            >
                              {/* Left: Time with Icon */}
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-14 h-14 rounded-lg",
                                    booking.status === "confirmed" &&
                                    "bg-blue-100",
                                    booking.status === "completed" &&
                                    "bg-green-100",
                                    booking.status === "pending" &&
                                    "bg-amber-100",
                                    booking.status === "cancelled" &&
                                    "bg-red-100"
                                  )}
                                >
                                  <div className="text-center">
                                    <div className="text-base font-bold text-gray-900 leading-tight">
                                      {new Date(
                                        booking.startTime
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Center: Main Info */}
                                <div className="flex-1 min-w-0">
                                  {/* Service Name */}
                                  <div className="font-bold text-sm text-gray-900 truncate">
                                    {typeof booking.service === "object"
                                      ? booking.service?.name
                                      : "Service"}
                                  </div>

                                  {/* Client */}
                                  <div className="flex items-center gap-1.5 text-xs text-gray-700 mt-0.5">
                                    <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium truncate">
                                      {typeof booking.client === "object"
                                        ? booking.client?.name
                                        : booking.client || "Client"}
                                    </span>
                                  </div>

                                  {/* Professional */}
                                  {booking.professional && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                                      <span>Por:</span>
                                      <span className="truncate">
                                        {typeof booking.professional ===
                                          "object"
                                          ? booking.professional?.name
                                          : booking.professional}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Status Badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex-shrink-0 text-[10px] h-5",
                                  booking.status === "confirmed" &&
                                  "bg-blue-100 text-blue-800 border-blue-300",
                                  booking.status === "completed" &&
                                  "bg-green-100 text-green-800 border-green-300",
                                  booking.status === "pending" &&
                                  "bg-amber-100 text-amber-800 border-amber-300",
                                  booking.status === "cancelled" &&
                                  "bg-red-100 text-red-800 border-red-300"
                                )}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Simple list view */}
            <div className="md:hidden space-y-2">
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className={cn(
                    "border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all",
                    booking.status === "confirmed" &&
                    "bg-blue-50 border-blue-500",
                    booking.status === "completed" &&
                    "bg-green-50 border-green-500",
                    booking.status === "pending" &&
                    "bg-yellow-50 border-yellow-500",
                    booking.status === "cancelled" && "bg-red-50 border-red-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Clock className="h-4 w-4" />
                        {new Date(booking.startTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}{" "}
                        -{" "}
                        {new Date(booking.endTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
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
                      <div className="font-semibold text-base truncate">
                        {typeof booking.service === "object"
                          ? booking.service?.name
                          : "Service"}
                      </div>

                      {/* Client */}
                      {booking.client && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="truncate">
                            {typeof booking.client === "object"
                              ? booking.client.name
                              : booking.client}
                          </span>
                        </div>
                      )}

                      {/* Professional */}
                      {booking.professional && (
                        <div className="text-xs text-muted-foreground truncate">
                          with{" "}
                          {typeof booking.professional === "object"
                            ? booking.professional?.name
                            : booking.professional}
                        </div>
                      )}

                      {/* Price */}
                      {typeof booking.service === "object" &&
                        booking.service?.price && (
                          <div className="flex items-center gap-1 text-sm font-semibold text-green-700">
                            <DollarSign className="h-4 w-4" />€
                            {booking.service.price}
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
          </div>
        )}
      </div>
    );
  };

  // Calendar content (used in both Dialog and Tab modes)
  const calendarContent = (
    <div
      className={cn(
        "space-y-6 transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-[100] p-4 sm:p-6 overflow-y-auto bg-white dark:bg-background flex flex-col"
          : "pt-4 px-4 md:pt-0 md:px-0" // Add padding on mobile when not fullscreen
      )}
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center justify-between md:justify-start gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-24 md:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[105]">
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Fullscreen Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="md:hidden"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center">
          <h3 className="text-base md:text-lg font-semibold text-center">
            {formatDateHeader()}
          </h3>
        </div>

        <div className="flex items-center gap-2 hidden md:flex">
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[105]">
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Fullscreen Summary */}
      {isFullscreen && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg border mb-4">
          <div className="flex flex-col items-center justify-center p-2 bg-background rounded shadow-sm">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total</span>
            <span className="text-xl font-bold">{bookings.length}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-background rounded shadow-sm border-l-4 border-blue-500">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Confirmed</span>
            <span className="text-xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-background rounded shadow-sm border-l-4 border-yellow-500">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Pending</span>
            <span className="text-xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-background rounded shadow-sm border-l-4 border-green-500">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Completed</span>
            <span className="text-xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "completed").length}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-background rounded shadow-sm col-span-2 md:col-span-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Est. Revenue</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(
                bookings.reduce((sum, b) => {
                  const price =
                    typeof b.service === "object"
                      ? (b.service as any)?.price || 0
                      : 0;
                  return sum + price;
                }, 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Calendar content */}
      <div>
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>

      {/* Legend */}
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-sm border-t pt-4 mt-auto">
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
          <DialogContent className="max-w-md z-[110]">
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
                        ? selectedBooking.professional?.name
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
                      "bg-blue-100 text-blue-800",
                      selectedBooking.status === "completed" &&
                      "bg-green-100 text-green-800",
                      selectedBooking.status === "pending" &&
                      "bg-yellow-100 text-yellow-800",
                      selectedBooking.status === "cancelled" &&
                      "bg-red-100 text-red-800"
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
                        {formatCurrency(selectedBooking.service.price)}
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

                {/* Actions */}
                {onEditBooking && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => {
                        onEditBooking(selectedBooking);
                        setShowBookingDetails(false);
                      }}
                    >
                      Edit Booking
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Grouped Bookings Dialog */}
        <Dialog
          open={showBookingsGroupDialog}
          onOpenChange={setShowBookingsGroupDialog}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto z-[110]">
            <DialogHeader>
              <DialogTitle>Bookings in this slot</DialogTitle>
              <DialogDescription>
                {selectedBookingsGroup && selectedBookingsGroup.length > 0
                  ? `${new Date(
                    selectedBookingsGroup[0].startTime
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })} at ${new Date(
                    selectedBookingsGroup[0].startTime
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                  : "Selected bookings"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              {selectedBookingsGroup?.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => {
                    handleBookingClick(booking);
                    setShowBookingsGroupDialog(false);
                  }}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                    booking.status === "confirmed" &&
                    "bg-blue-50 border-blue-200",
                    booking.status === "completed" &&
                    "bg-green-50 border-green-200",
                    booking.status === "pending" &&
                    "bg-yellow-50 border-yellow-200",
                    booking.status === "cancelled" && "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {typeof booking.service === "object"
                          ? booking.service?.name
                          : "Service"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {typeof booking.client === "object"
                          ? booking.client?.name
                          : booking.client || "Client"}
                      </div>
                      {booking.professional && (
                        <div className="text-xs text-muted-foreground mt-1">
                          with{" "}
                          {typeof booking.professional === "object"
                            ? booking.professional?.name
                            : booking.professional}
                        </div>
                      )}
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
                </div>
              ))}
            </div>
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
        <DialogContent className="max-w-md z-[110]">
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
                      ? selectedBooking.professional?.name
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
                    "bg-blue-100 text-blue-800",
                    selectedBooking.status === "completed" &&
                    "bg-green-100 text-green-800",
                    selectedBooking.status === "pending" &&
                    "bg-yellow-100 text-yellow-800",
                    selectedBooking.status === "cancelled" &&
                    "bg-red-100 text-red-800"
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
                      {formatCurrency(selectedBooking.service.price)}
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

              {/* Actions */}
              {onEditBooking && (
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      onEditBooking(selectedBooking);
                      setShowBookingDetails(false);
                    }}
                  >
                    Edit Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grouped Bookings Dialog */}
      <Dialog
        open={showBookingsGroupDialog}
        onOpenChange={setShowBookingsGroupDialog}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto z-[110]">
          <DialogHeader>
            <DialogTitle>Bookings in this slot</DialogTitle>
            <DialogDescription>
              {selectedBookingsGroup && selectedBookingsGroup.length > 0
                ? `${new Date(
                  selectedBookingsGroup[0].startTime
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })} at ${new Date(
                  selectedBookingsGroup[0].startTime
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
                : "Selected bookings"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {selectedBookingsGroup?.map((booking) => (
              <div
                key={booking.id}
                onClick={() => {
                  handleBookingClick(booking);
                  setShowBookingsGroupDialog(false);
                }}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                  booking.status === "confirmed" &&
                  "bg-blue-50 border-blue-200",
                  booking.status === "completed" &&
                  "bg-green-50 border-green-200",
                  booking.status === "pending" &&
                  "bg-yellow-50 border-yellow-200",
                  booking.status === "cancelled" && "bg-red-50 border-red-200"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {typeof booking.service === "object"
                        ? booking.service?.name
                        : "Service"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {typeof booking.client === "object"
                        ? booking.client?.name
                        : booking.client || "Client"}
                    </div>
                    {booking.professional && (
                      <div className="text-xs text-muted-foreground mt-1">
                        with{" "}
                        {typeof booking.professional === "object"
                          ? booking.professional?.name
                          : booking.professional}
                      </div>
                    )}
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
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
