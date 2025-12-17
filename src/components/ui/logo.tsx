import { cn } from "../../lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

/**
 * Schedfy Logo Component
 * 
 * Displays the Schedfy brand logo - black rounded square with white "s"
 */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
    const iconSizeClasses = {
        sm: "h-8 w-8 text-base",
        md: "h-9 w-9 text-lg",
        lg: "h-12 w-12 text-2xl",
    };

    const textSizeClasses = {
        sm: "text-xl",
        md: "text-xl",
        lg: "text-2xl",
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Logo Icon - Black rounded square with white S */}
            <div
                className={cn(
                    "flex items-center justify-center rounded-xl bg-black flex-shrink-0",
                    iconSizeClasses[size]
                )}
            >
                <span className="text-white font-semibold leading-none">s</span>
            </div>

            {/* Text - Only show if showText is true */}
            {showText && (
                <span
                    className={cn(
                        "font-semibold tracking-tight",
                        textSizeClasses[size]
                    )}
                >
                    Schedfy
                </span>
            )}
        </div>
    );
}

/**
 * Logo Icon Only - for favicon-like usage
 */
export function LogoIcon({
    className,
    size = "md",
}: {
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizeClasses = {
        sm: "h-6 w-6 text-sm",
        md: "h-8 w-8 text-base",
        lg: "h-10 w-10 text-xl",
    };

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-xl bg-black flex-shrink-0",
                sizeClasses[size],
                className
            )}
        >
            <span className="text-white font-semibold leading-none">s</span>
        </div>
    );
}

/**
 * Simple text-only logo for minimal usage
 */
export function LogoText({
    className,
    size = "md",
}: {
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
    };

    return (
        <span
            className={cn("font-semibold tracking-tight", sizeClasses[size], className)}
        >
            Schedfy
        </span>
    );
}
