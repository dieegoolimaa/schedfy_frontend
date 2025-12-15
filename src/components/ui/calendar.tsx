import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";


export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    mode === "single" && selected instanceof Date
      ? selected
      : mode === "range" && selected && "from" in selected && selected.from
        ? selected.from
        : new Date()
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

    if (mode === "single" && selected instanceof Date) {
      return (
        day === selected.getDate() &&
        currentMonth.getMonth() === selected.getMonth() &&
        currentMonth.getFullYear() === selected.getFullYear()
      );
    }

    if (mode === "range" && selected && "from" in selected) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const from = selected.from;
      const to = selected.to;

      if (from && !to) {
        return date.toDateString() === from.toDateString();
      }

      if (from && to) {
        return (
          date.toDateString() === from.toDateString() ||
          date.toDateString() === to.toDateString()
        );
      }
    }

    return false;
  };

  const isInRange = (day: number) => {
    if (mode !== "range" || !selected || !("from" in selected)) return false;

    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const from = selected.from;
    const to = selected.to;

    if (from && to) {
      return date > from && date < to;
    }

    return false;
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (mode === "single") {
      onSelect?.(newDate);
    } else if (mode === "range") {
      const currentRange =
        selected && "from" in selected
          ? selected
          : { from: undefined, to: undefined };

      if (!currentRange.from || (currentRange.from && currentRange.to)) {
        // Start new range
        onSelect?.({ from: newDate, to: undefined });
      } else {
        // Complete the range
        if (newDate >= currentRange.from) {
          onSelect?.({ from: currentRange.from, to: newDate });
        } else {
          onSelect?.({ from: newDate, to: currentRange.from });
        }
      }
    }
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
    <div className={cn("w-full max-w-sm mx-auto", className)}>
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5">

        {/* Header - Clean & Minimal */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white pl-1">
            {monthName}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers - Subtle */}
        <div className="grid grid-cols-7 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-[13px] font-medium text-gray-400 dark:text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const isDayToday = isToday(day);
            const isDaySelected = isSelected(day);
            const isDayInRange = isInRange(day);
            const isDayDisabled = isDateDisabled(day);

            return (
              <div key={day} className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isDayDisabled}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all relative z-10",

                    // Selected State (Solid Black/White circle)
                    isDaySelected && !isDayDisabled
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                      : "",

                    // Today State (Subtle dot or ring if not selected)
                    !isDaySelected && isDayToday && !isDayDisabled
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "",

                    // Default Interactive State
                    !isDaySelected && !isDayDisabled && !isDayToday
                      ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      : "",

                    // Disabled State
                    isDayDisabled && "text-gray-300 dark:text-gray-700 cursor-not-allowed",

                    // Range styling (if needed in future, currently background is better)
                    isDayInRange && !isDaySelected && "bg-gray-50 dark:bg-white/5 rounded-none"
                  )}
                >
                  {day}
                  {/* Tiny dot for Today if not selected */}
                  {isDayToday && !isDaySelected && (
                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Optional Footer: Today Button */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-center">
          <button
            onClick={goToToday}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Jump to Today
          </button>
        </div>
      </div>
    </div>
  );
}
