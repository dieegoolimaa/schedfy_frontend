import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  );

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

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabled && disabled(date)) return true;

    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      day === selected.getDate() &&
      currentMonth.getMonth() === selected.getMonth() &&
      currentMonth.getFullYear() === selected.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onSelect?.(newDate);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-900 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              {monthName}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm text-xs sm:text-sm"
              >
                Today
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-4 sm:p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isDayToday = isToday(day);
              const isDaySelected = isSelected(day);
              const isDayDisabled = isDateDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isDayDisabled}
                  className={cn(
                    "aspect-square rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base font-medium relative overflow-hidden",
                    "focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                    // Default state
                    !isDaySelected &&
                      !isDayToday &&
                      !isDayDisabled &&
                      "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:scale-105 hover:shadow-md",
                    // Today
                    isDayToday &&
                      !isDaySelected &&
                      !isDayDisabled &&
                      "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-900 dark:text-white font-bold ring-2 ring-gray-400 dark:ring-gray-500 hover:scale-105 hover:shadow-md",
                    // Selected
                    isDaySelected &&
                      !isDayDisabled &&
                      "bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 font-bold shadow-lg scale-105 ring-2 ring-gray-900 dark:ring-gray-100",
                    // Disabled
                    isDayDisabled &&
                      "bg-gray-100/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-40"
                  )}
                >
                  {/* Subtle gradient overlay for selected date */}
                  {isDaySelected && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 dark:from-transparent dark:via-black/5 dark:to-black/10" />
                  )}
                  <span className="relative z-10">{day}</span>
                  {/* Today indicator dot */}
                  {isDayToday && !isDaySelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-900 dark:bg-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with legend */}
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300" />
              <span className="text-gray-600 dark:text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-400 dark:ring-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
