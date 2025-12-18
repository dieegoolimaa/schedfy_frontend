/**
 * Schedfy Loading Spinner
 * 
 * A branded loading spinner using the Schedfy "s" logo
 * with an animated border effect.
 */
import { cn } from "@/lib/utils";

interface SchedfySpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
};

const borderSizeMap = {
    sm: "border-2",
    md: "border-2",
    lg: "border-3",
    xl: "border-4",
};

export function SchedfySpinner({ size = "md", className }: SchedfySpinnerProps) {
    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            {/* Animated spinning border */}
            <div
                className={cn(
                    "absolute inset-0 rounded-lg border-transparent animate-spin",
                    borderSizeMap[size],
                    "border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/50"
                )}
                style={{ animationDuration: "1s" }}
            />
            {/* Logo container */}
            <div className={cn("relative", sizeMap[size])}>
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect x="0" y="0" width="32" height="32" rx="6" fill="currentColor" className="text-foreground dark:text-white" />
                    <text
                        x="16"
                        y="18"
                        dominantBaseline="central"
                        textAnchor="middle"
                        fontFamily="Arial, sans-serif"
                        fontSize="20"
                        fontWeight="bold"
                        fill="currentColor"
                        className="text-background dark:text-black"
                    >
                        s
                    </text>
                </svg>
            </div>
        </div>
    );
}

/**
 * Full page loading overlay with Schedfy spinner
 */
interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message }: PageLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <SchedfySpinner size="xl" />
            {message && (
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            )}
        </div>
    );
}

/**
 * Inline loading spinner (replaces Loader2 in buttons)
 */
interface InlineSpinnerProps {
    className?: string;
}

export function InlineSpinner({ className }: InlineSpinnerProps) {
    return (
        <div className={cn("inline-flex items-center justify-center w-4 h-4", className)}>
            <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
