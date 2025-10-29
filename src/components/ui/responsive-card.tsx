import * as React from "react";
import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { LucideIcon } from "lucide-react";

interface ResponsiveCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "highlight";
}

export function ResponsiveCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  trend,
  onClick,
  className,
  variant = "default",
}: ResponsiveCardProps) {
  const isClickable = !!onClick;

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const cardVariants = {
    default: "p-4 sm:p-6",
    compact: "p-3 sm:p-4",
    highlight: "p-4 sm:p-6 border-l-4 border-l-primary bg-muted/20",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-2 space-y-0", cardVariants[variant])}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">
            {title}
          </CardTitle>
          {Icon && <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {value}
          </div>
          {description && (
            <CardDescription className="text-xs sm:text-sm">
              {description}
            </CardDescription>
          )}
          {trend && (
            <div
              className={cn(
                "text-xs sm:text-sm font-medium flex items-center gap-1",
                getTrendColor(trend.direction)
              )}
            >
              <span>
                {trend.direction === "up"
                  ? "↗"
                  : trend.direction === "down"
                  ? "↘"
                  : "→"}
              </span>
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile-first card grid container
export function ResponsiveCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 md:gap-6",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile stats card specifically for bookings/dashboard
export function MobileStatsCard({
  title,
  value,
  subtitle,
  color = "blue",
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  className?: string;
}) {
  const colorVariants = {
    blue: "border-l-blue-500 bg-blue-50/50",
    green: "border-l-green-500 bg-green-50/50",
    yellow: "border-l-yellow-500 bg-yellow-50/50",
    red: "border-l-red-500 bg-red-50/50",
    purple: "border-l-purple-500 bg-purple-50/50",
    gray: "border-l-gray-500 bg-gray-50/50",
  };

  const textColorVariants = {
    blue: "text-blue-900",
    green: "text-green-900",
    yellow: "text-yellow-900",
    red: "text-red-900",
    purple: "text-purple-900",
    gray: "text-gray-900",
  };

  return (
    <div
      className={cn(
        "border-l-4 rounded-r-lg p-4 transition-all duration-200 hover:shadow-sm",
        colorVariants[color],
        className
      )}
    >
      <div className="space-y-1">
        <div
          className={cn(
            "text-2xl sm:text-3xl font-bold",
            textColorVariants[color]
          )}
        >
          {value}
        </div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>
    </div>
  );
}
