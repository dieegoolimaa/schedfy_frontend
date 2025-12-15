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
  const variantIcons = {
    default: "text-foreground",
    success: "text-green-500",
    warning: "text-amber-500",
    danger: "text-red-500",
    info: "text-blue-500",
  };

  const iconBgColors = {
    default: "bg-primary/10",
    success: "bg-green-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
    info: "bg-blue-500/10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card text-card-foreground rounded-xl border border-border p-4 transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-foreground truncate">
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.isPositive
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg shrink-0", iconBgColors[variant])}>
            <Icon
              className={cn("h-5 w-5", variantIcons[variant])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
