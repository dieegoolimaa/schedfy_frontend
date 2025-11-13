import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardWithComparisonProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  description?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function StatCardWithComparison({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  description,
  className,
}: StatCardWithComparisonProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return Minus;
    return change > 0 ? ArrowUp : ArrowDown;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-gray-500";
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const getTrendBgColor = () => {
    if (change === undefined || change === 0) return "bg-gray-100";
    return change > 0 ? "bg-green-100" : "bg-red-100";
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();
  const trendBgColor = getTrendBgColor();

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>

        {change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                trendBgColor,
                trendColor
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
