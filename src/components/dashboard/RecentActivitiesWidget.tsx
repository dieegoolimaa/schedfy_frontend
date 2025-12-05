import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecentActivitiesProps {
    bookings: any[];
    maxItems?: number;
    className?: string;
}

type ActivityType = 'created' | 'confirmed' | 'completed' | 'cancelled' | 'payment' | 'rejected';

interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: Date;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

export function RecentActivitiesWidget({ bookings, maxItems = 10, className }: RecentActivitiesProps) {
    const activities: Activity[] = useMemo(() => {
        const acts: Activity[] = [];

        bookings.forEach((booking) => {
            const createdAt = new Date(booking.createdAt);
            const updatedAt = booking.updatedAt ? new Date(booking.updatedAt) : createdAt;

            // Booking created
            acts.push({
                id: `${booking.id}-created`,
                type: 'created',
                title: 'New Booking',
                description: `${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`,
                timestamp: createdAt,
                icon: Calendar,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            });

            // Status changes
            if (booking.status === 'confirmed' && updatedAt > createdAt) {
                acts.push({
                    id: `${booking.id}-confirmed`,
                    type: 'confirmed',
                    title: 'Booking Confirmed',
                    description: `${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`,
                    timestamp: updatedAt,
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                });
            }

            if (booking.status === 'completed') {
                acts.push({
                    id: `${booking.id}-completed`,
                    type: 'completed',
                    title: 'Service Completed',
                    description: `${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`,
                    timestamp: updatedAt,
                    icon: CheckCircle,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100'
                });
            }

            if (booking.status === 'cancelled') {
                acts.push({
                    id: `${booking.id}-cancelled`,
                    type: 'cancelled',
                    title: 'Booking Cancelled',
                    description: `${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`,
                    timestamp: updatedAt,
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100'
                });
            }

            if (booking.status === 'rejected') {
                acts.push({
                    id: `${booking.id}-rejected`,
                    type: 'rejected',
                    title: 'Booking Rejected',
                    description: `${booking.client?.name || 'Client'} - ${booking.service?.name || 'Service'}`,
                    timestamp: updatedAt,
                    icon: AlertCircle,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100'
                });
            }

            // Payment
            if (booking.paymentStatus === 'paid' && booking.payment) {
                acts.push({
                    id: `${booking.id}-payment`,
                    type: 'payment',
                    title: 'Payment Received',
                    description: `€${booking.payment.paidAmount || booking.pricing?.totalPrice || 0} - ${booking.client?.name || 'Client'}`,
                    timestamp: booking.payment.paidAt ? new Date(booking.payment.paidAt) : updatedAt,
                    icon: DollarSign,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100'
                });
            }
        });

        // Sort by timestamp descending
        acts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return acts.slice(0, maxItems);
    }, [bookings, maxItems]);

    const getRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (activities.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No recent activities</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activities
                    <Badge variant="secondary" className="ml-auto">
                        {activities.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {activities.map((activity, index) => {
                            const Icon = activity.icon;
                            const isLast = index === activities.length - 1;

                            return (
                                <div key={activity.id} className="relative">
                                    {/* Timeline line */}
                                    {!isLast && (
                                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                                    )}

                                    {/* Activity item */}
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={cn(
                                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background",
                                            activity.bgColor
                                        )}>
                                            <Icon className={cn("h-4 w-4", activity.color)} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium leading-none mb-1">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {getRelativeTime(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
