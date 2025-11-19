import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = "default",
  onClick,
}: StatCardProps) {
  const variantColors = {
    default: "text-gray-900 dark:text-white",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const iconBgColors = {
    default: "bg-gray-100 dark:bg-gray-700",
    success: "bg-green-100 dark:bg-green-900/20",
    warning: "bg-amber-100 dark:bg-amber-900/20",
    danger: "bg-red-100 dark:bg-red-900/20",
    info: "bg-blue-100 dark:bg-blue-900/20",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3
              className={cn(
                "text-xl sm:text-2xl font-bold truncate",
                variantColors[variant]
              )}
            >
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg shrink-0", iconBgColors[variant])}>
            <Icon
              className={cn("h-4 w-4 sm:h-5 sm:w-5", variantColors[variant])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
