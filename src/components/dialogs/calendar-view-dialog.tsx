import { useState } from "react";
import { useBookings } from "../../hooks/useBookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  onCreateBooking?: () => void;
  onViewAllBookings?: () => void;
}

export const CalendarViewDialog = ({
  open,
  onOpenChange,
  entityId,
  onCreateBooking,
  onViewAllBookings,
}: CalendarViewDialogProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const { bookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getBookingsForDate = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    targetDate.setHours(0, 0, 0, 0);

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === targetDate.getTime();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (day: number) => {
    return day > 0 && day <= getDaysInMonth(currentDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: number[] = [];

  // Add previous month's trailing days
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(-i);
  }

  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calendar View</DialogTitle>
          <DialogDescription>
            View and manage your appointments and schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {monthName} {year}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex border rounded-md">
                <Button
                  variant={view === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("day")}
                  className="rounded-none rounded-l-md"
                >
                  Day
                </Button>
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("week")}
                  className="rounded-none"
                >
                  Week
                </Button>
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("month")}
                  className="rounded-none rounded-r-md"
                >
                  Month
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayBookings = day > 0 ? getBookingsForDate(day) : [];
                const isCurrentDay = day > 0 && isToday(day);
                const currentMonth = isCurrentMonth(day);

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border-r border-b last:border-r-0 ${
                      !currentMonth
                        ? "bg-muted/30 text-muted-foreground"
                        : isCurrentDay
                        ? "bg-primary/10 border-primary"
                        : "bg-background"
                    }`}
                  >
                    {day > 0 && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isCurrentDay ? "text-primary font-bold" : ""
                          }`}
                        >
                          {day}
                        </div>
                        {dayBookings.length > 0 && (
                          <div className="space-y-1">
                            {dayBookings.slice(0, 2).map((booking) => (
                              <div
                                key={booking.id}
                                className="text-xs p-1 bg-blue-100 dark:bg-blue-900/30 rounded border-l-2 border-blue-500 truncate"
                              >
                                {new Date(booking.startTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayBookings.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {bookings.length} total appointments this month
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              {onCreateBooking && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={onCreateBooking}
                >
                  Create New Booking
                </Button>
              )}
              {onViewAllBookings && (
                <Button variant="outline" onClick={onViewAllBookings}>
                  View All Bookings
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
