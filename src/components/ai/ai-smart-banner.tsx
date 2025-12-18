import { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export interface AIInsight {
    id: string;
    type: 'tip' | 'warning' | 'opportunity' | 'trend';
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    priority?: 'low' | 'medium' | 'high';
}

interface AISmartBannerProps {
    insights: AIInsight[];
    isLoading?: boolean;
    className?: string;
    onDismiss?: (insightId: string) => void;
}

const typeConfig = {
    tip: {
        icon: Lightbulb,
        gradient: 'from-blue-500/10 to-cyan-500/10',
        border: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-500',
        accent: 'bg-blue-500',
    },
    warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500/10 to-orange-500/10',
        border: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-500',
        accent: 'bg-amber-500',
    },
    opportunity: {
        icon: TrendingUp,
        gradient: 'from-green-500/10 to-emerald-500/10',
        border: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-500',
        accent: 'bg-green-500',
    },
    trend: {
        icon: Sparkles,
        gradient: 'from-purple-500/10 to-pink-500/10',
        border: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-500',
        accent: 'bg-purple-500',
    },
};

export function AISmartBanner({ insights, isLoading, className, onDismiss }: AISmartBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    // Banner visibility - can be hidden when all insights are dismissed
    const isVisible = insights.length > 0;

    // Filter out dismissed insights
    const activeInsights = insights.filter(i => !dismissed.has(i.id));

    // Auto-rotate insights every 10 seconds
    useEffect(() => {
        if (activeInsights.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeInsights.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [activeInsights.length]);

    // Reset index if current is out of bounds
    useEffect(() => {
        if (currentIndex >= activeInsights.length) {
            setCurrentIndex(0);
        }
    }, [activeInsights.length, currentIndex]);

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set(prev).add(id));
        onDismiss?.(id);
    };

    if (!isVisible || activeInsights.length === 0) {
        return null;
    }

    if (isLoading) {
        return (
            <div className={cn(
                "relative overflow-hidden rounded-lg border p-4",
                "bg-gradient-to-r from-muted/50 to-muted/30",
                "animate-pulse",
                className
            )}>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                </div>
            </div>
        );
    }

    const currentInsight = activeInsights[currentIndex];
    if (!currentInsight) return null;

    const config = typeConfig[currentInsight.type];
    const Icon = config.icon;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-lg border transition-all duration-500",
            `bg-gradient-to-r ${config.gradient}`,
            config.border,
            className
        )}>
            {/* Accent bar */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.accent)} />

            <div className="flex items-start gap-4 p-4 pl-5">
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 p-2 rounded-full bg-background/80 backdrop-blur-sm",
                    "shadow-sm"
                )}>
                    <Icon className={cn("h-5 w-5", config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            AI Insight
                        </span>
                        {activeInsights.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                                {currentIndex + 1}/{activeInsights.length}
                            </span>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{currentInsight.title}</h4>
                    <p className="text-sm text-muted-foreground">{currentInsight.message}</p>

                    {currentInsight.action && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-sm font-medium"
                            onClick={currentInsight.action.onClick}
                        >
                            {currentInsight.action.label}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>

                {/* Navigation dots */}
                {activeInsights.length > 1 && (
                    <div className="flex gap-1.5 self-center">
                        {activeInsights.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    idx === currentIndex
                                        ? config.accent
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Dismiss button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDismiss(currentInsight.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
