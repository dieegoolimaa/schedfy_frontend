import { useState, useEffect } from 'react';
import { Sparkles, X, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Brain, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { AIInsight } from './ai-smart-banner';

interface AIFloatingButtonProps {
    insights: AIInsight[];
    isLoading?: boolean;
    onRefresh?: () => void;
    className?: string;
}

const typeIcons = {
    tip: Lightbulb,
    warning: AlertTriangle,
    opportunity: TrendingUp,
    trend: Sparkles,
};

const typeColors = {
    tip: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
    opportunity: 'text-green-500 bg-green-50 dark:bg-green-950',
    trend: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
};

export function AIFloatingButton({ insights, isLoading, onRefresh, className }: AIFloatingButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    // Show unread indicator when new insights arrive
    useEffect(() => {
        if (insights.length > 0 && !isOpen) {
            setHasUnread(true);
        }
    }, [insights, isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
        setHasUnread(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={handleOpen}
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "h-14 w-14 rounded-full",
                    "bg-gradient-to-br from-purple-500 to-pink-500",
                    "shadow-lg shadow-purple-500/25",
                    "flex items-center justify-center",
                    "transition-all duration-300",
                    "hover:scale-110 hover:shadow-xl hover:shadow-purple-500/30",
                    "active:scale-95",
                    "group",
                    className
                )}
            >
                <Brain className="h-6 w-6 text-white transition-transform group-hover:rotate-12" />

                {/* Pulse animation */}
                <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />

                {/* Unread indicator */}
                {hasUnread && insights.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-background">
                        {insights.length > 9 ? '9+' : insights.length}
                    </span>
                )}
            </button>

            {/* Popover Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className={cn(
                        "fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]",
                        "bg-background border rounded-2xl shadow-2xl",
                        "animate-in slide-in-from-bottom-4 fade-in duration-300"
                    )}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm">AI Insights</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {onRefresh && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={onRefresh}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={cn(
                                            "h-4 w-4",
                                            isLoading && "animate-spin"
                                        )} />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-80 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-6 flex flex-col items-center justify-center gap-3">
                                    <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                                    <p className="text-sm text-muted-foreground">Analyzing your data...</p>
                                </div>
                            ) : insights.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No insights available yet. Keep using Schedfy and AI will learn from your data!
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {insights.slice(0, 5).map((insight) => {
                                        const Icon = typeIcons[insight.type];
                                        return (
                                            <div
                                                key={insight.id}
                                                className="p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "flex-shrink-0 p-2 rounded-lg",
                                                        typeColors[insight.type]
                                                    )}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm mb-0.5">
                                                            {insight.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {insight.message}
                                                        </p>
                                                        {insight.action && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="h-auto p-0 mt-1.5 text-xs"
                                                                onClick={() => {
                                                                    insight.action?.onClick();
                                                                    setIsOpen(false);
                                                                }}
                                                            >
                                                                {insight.action.label}
                                                                <ChevronRight className="h-3 w-3 ml-0.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {insights.length > 5 && (
                            <div className="px-4 py-3 border-t bg-muted/30">
                                <p className="text-xs text-center text-muted-foreground">
                                    +{insights.length - 5} more insights available
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
