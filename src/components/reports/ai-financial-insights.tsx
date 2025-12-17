import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Zap,
    Target,
    Brain,
    Lightbulb,
    ArrowRight,
    DollarSign,
    Users,
    Calendar
} from "lucide-react";
import { cn } from "../../lib/utils";



interface AIFinancialInsightsProps {
    revenue?: number;
    bookings?: any[];
    dateRange?: { start: Date; end: Date };
}

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../../services/reports.service";
import { useAIFeatures } from "../../hooks/useAIFeatures";

export function AIFinancialInsights({ revenue = 0, bookings = [] }: AIFinancialInsightsProps) {
    const { canUseFullInsights } = useAIFeatures();

    // Fetch AI insights from backend
    const { data: insightsData, isLoading } = useQuery({
        queryKey: ['ai-financial-insights'],
        queryFn: reportsService.getFinancialInsights,
        enabled: canUseFullInsights,
    });

    // Financial insights only available for Individual/Business plans
    if (!canUseFullInsights) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const insights = insightsData?.insights || [];

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'prediction': return Brain;
            case 'success': return Zap;
            case 'warning': return AlertCircle;
            default: return Lightbulb;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'prediction': return 'text-purple-600';
            case 'success': return 'text-green-600';
            case 'warning': return 'text-orange-600';
            default: return 'text-blue-600';
        }
    };

    const getInsightBg = (type: string) => {
        switch (type) {
            case 'prediction': return 'bg-purple-50 border-purple-200';
            case 'success': return 'bg-green-50 border-green-200';
            case 'warning': return 'bg-orange-50 border-orange-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Financial Intelligence
                        <Badge variant="secondary" className="ml-auto">
                            Powered by AI
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Smart insights to maximize your revenue and optimize your business performance.
                    </p>
                </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.type);

                    return (
                        <Card
                            key={index}
                            className={cn(
                                "border-2 hover:shadow-lg transition-all cursor-pointer",
                                getInsightBg(insight.type)
                            )}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className={cn("p-2 rounded-lg bg-white/80")}>
                                        <Icon className={cn("h-5 w-5", getInsightColor(insight.type))} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                                            {insight.metric && (
                                                <div className="text-right">
                                                    <div className="font-bold text-sm">{insight.metric.value}</div>
                                                    {insight.metric.change !== undefined && (
                                                        <div className={cn(
                                                            "text-xs flex items-center gap-1",
                                                            insight.metric.change > 0 ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {insight.metric.change > 0 ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            )}
                                                            {Math.abs(insight.metric.change)}%
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground mb-3">
                                            {insight.description}
                                        </p>

                                        {insight.impact && (
                                            <Badge variant="outline" className="text-xs mb-2">
                                                {insight.impact}
                                            </Badge>
                                        )}

                                        {insight.action && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 h-8 text-xs"
                                                onClick={insight.action.onClick}
                                            >
                                                {insight.action.label}
                                                <ArrowRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Performance Indicators
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-accent/50">
                            <DollarSign className="h-5 w-5 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold">€{(revenue / 1000).toFixed(1)}K</div>
                            <div className="text-xs text-muted-foreground mt-1">Total Revenue</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-accent/50">
                            <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{bookings.length}</div>
                            <div className="text-xs text-muted-foreground mt-1">Bookings</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-accent/50">
                            <Users className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-bold">
                                {new Set(bookings.map(b => b.clientId || b.client?.id)).size}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Unique Clients</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
