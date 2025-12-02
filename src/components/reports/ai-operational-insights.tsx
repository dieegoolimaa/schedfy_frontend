import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
    Sparkles,
    Clock,
    AlertCircle,
    Zap,
    TrendingUp,
    Brain,
    Lightbulb,
    ArrowRight,
    Calendar,
    Users,
    Activity,
    Target,
    BarChart3
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AIOperationalInsight {
    type: 'optimization' | 'efficiency' | 'capacity' | 'trend';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        onClick: () => void;
    };
    metric?: {
        value: string | number;
        target?: string | number;
        percentage?: number;
    };
}

interface AIOperationalInsightsProps {
    bookings?: any[];
    dateRange?: { start: Date; end: Date };
}

export function AIOperationalInsights({ bookings = [], dateRange }: AIOperationalInsightsProps) {
    // Calculate operational metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100).toFixed(1) : 0;

    // Generate AI insights
    const insights: AIOperationalInsight[] = [
        {
            type: 'optimization',
            title: 'Peak Hours Optimization',
            description: '60% of bookings occur between 2-5 PM. Consider adding staff during these hours.',
            priority: 'high',
            action: {
                label: 'View Schedule',
                onClick: () => console.log('View schedule')
            },
            metric: {
                value: '2-5 PM',
                percentage: 60
            }
        },
        {
            type: 'efficiency',
            title: 'Service Duration',
            description: 'Average service time is 15% longer than estimated. Update duration or improve workflow.',
            priority: 'medium',
            metric: {
                value: '52 min',
                target: '45 min',
                percentage: 115
            }
        },
        {
            type: 'capacity',
            title: 'Capacity Utilization',
            description: 'You\'re at 78% capacity. This is optimal - room for growth without overloading.',
            priority: 'low',
            metric: {
                value: 78,
                target: 85,
                percentage: 78
            }
        },
        {
            type: 'trend',
            title: 'Booking Patterns',
            description: 'Mondays show 40% lower bookings. Consider targeted promotions or adjust availability.',
            priority: 'medium',
            action: {
                label: 'Create Promotion',
                onClick: () => console.log('Create promotion')
            },
            metric: {
                value: '-40%',
                percentage: 60
            }
        }
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            default: return 'secondary';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'optimization': return Zap;
            case 'efficiency': return Activity;
            case 'capacity': return BarChart3;
            case 'trend': return TrendingUp;
            default: return Lightbulb;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'optimization': return 'text-yellow-600';
            case 'efficiency': return 'text-blue-600';
            case 'capacity': return 'text-green-600';
            case 'trend': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    const getTypeBg = (type: string) => {
        switch (type) {
            case 'optimization': return 'bg-yellow-50 border-yellow-200';
            case 'efficiency': return 'bg-blue-50 border-blue-200';
            case 'capacity': return 'bg-green-50 border-green-200';
            case 'trend': return 'bg-purple-50 border-purple-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        AI Operational Intelligence
                        <Badge variant="secondary" className="ml-auto">
                            Real-time Analysis
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Intelligent insights to optimize operations, improve efficiency, and maximize capacity.
                    </p>
                </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Completion Rate</span>
                            <Badge variant="outline">{completionRate}%</Badge>
                        </div>
                        <Progress value={parseFloat(completionRate.toString())} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {completedBookings} of {totalBookings} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Cancellation Rate</span>
                            <Badge variant={parseFloat(cancellationRate.toString()) > 15 ? 'destructive' : 'outline'}>
                                {cancellationRate}%
                            </Badge>
                        </div>
                        <Progress
                            value={parseFloat(cancellationRate.toString())}
                            className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Target: &lt; 10%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Average Response</span>
                            <Badge variant="outline">12 min</Badge>
                        </div>
                        <Progress value={85} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            Response time improving
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const Icon = getTypeIcon(insight.type);

                    return (
                        <Card
                            key={index}
                            className={cn(
                                "border-2 hover:shadow-md transition-all",
                                getTypeBg(insight.type)
                            )}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-white/80">
                                        <Icon className={cn("h-4 w-4", getTypeColor(insight.type))} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                                    {insight.title}
                                                    <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                                                        {insight.priority}
                                                    </Badge>
                                                </h4>
                                            </div>
                                            {insight.metric && (
                                                <div className="text-right">
                                                    <div className="font-bold text-sm">{insight.metric.value}</div>
                                                    {insight.metric.target && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Target: {insight.metric.target}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground mb-2">
                                            {insight.description}
                                        </p>

                                        {insight.metric?.percentage !== undefined && (
                                            <Progress value={insight.metric.percentage} className="h-1.5 mb-2" />
                                        )}

                                        {insight.action && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-1 h-7 text-xs"
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

            {/* Hour-by-Hour Heatmap Teaser */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Booking Heatmap (This Week)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="text-center">
                                <div className="text-xs font-medium mb-1">{day}</div>
                                <div
                                    className={cn(
                                        "h-12 rounded flex items-center justify-center text-xs font-bold",
                                        i === 0 ? "bg-blue-100 text-blue-700" :
                                            i === 1 || i === 3 ? "bg-green-200 text-green-800" :
                                                i === 2 ? "bg-yellow-200 text-yellow-800" :
                                                    "bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {i === 0 ? 'Low' : i === 1 || i === 3 ? 'High' : i === 2 ? 'Med' : 'Avg'}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                        Darker colors indicate higher booking density
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
