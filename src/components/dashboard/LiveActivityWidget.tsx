import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Play, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface LiveBooking {
    id: string;
    clientName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    minutesUntilStart?: number;
    minutesUntilEnd?: number;
}

interface LiveData {
    upcoming: LiveBooking[];
    inProgress: LiveBooking[];
}

interface LiveActivityWidgetProps {
    entityId: string;
    className?: string;
}

export function LiveActivityWidget({ entityId, className }: LiveActivityWidgetProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [liveData, setLiveData] = useState<LiveData>({ upcoming: [], inProgress: [] });

    useEffect(() => {
        if (!entityId) return;

        const fetchLive = async () => {
            try {
                const response = await apiClient.get<LiveData>(`/api/bookings/live-status?entityId=${entityId}`);
                setLiveData(response.data);
            } catch (e) {
                console.error('Failed to fetch live status', e);
            } finally {
                setLoading(false);
            }
        };

        fetchLive();
        const interval = setInterval(fetchLive, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, [entityId]);

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="py-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const hasActivity = liveData.upcoming.length > 0 || liveData.inProgress.length > 0;

    // If no activity, we can either hide it or show a "quiet" state.
    // Given the user wants it to "call attention", showing it only when active (or prominent empty state) is better.
    // Let's show a "quiet" state if empty, but make it "loud" if active.

    const formatMinutes = (minutes: number) => {
        if (minutes < 0) return t('dashboard.overdue', 'Overdue');
        if (minutes === 0) return t('dashboard.now', 'Now');

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
        }
        return `${mins} ${t('common.min', 'min')}`;
    };

    return (
        <Card className={`transition-all duration-300 ${hasActivity ? 'border-l-4 border-l-primary shadow-md bg-primary/5' : ''} ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    {hasActivity ? (
                        <span className="relative flex h-3 w-3 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    ) : (
                        <div className="h-3 w-3 rounded-full bg-muted mr-1" />
                    )}
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {t('dashboard.liveUpdates', 'Live Updates')}
                        {hasActivity && <Badge variant="default" className="ml-2 text-xs px-1.5 py-0 h-5">LIVE</Badge>}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* In Progress Section - Most Critical */}
                    {liveData.inProgress.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                                <Play className="h-4 w-4 fill-current" />
                                {t('dashboard.inProgress', 'In Progress')}
                            </h4>
                            <div className="grid gap-3">
                                {liveData.inProgress.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-primary/20 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{b.clientName}</span>
                                            <span className="text-xs text-muted-foreground">{b.serviceName}</span>
                                        </div>
                                        <Badge variant={b.minutesUntilEnd && b.minutesUntilEnd < 5 ? "destructive" : "default"} className="animate-pulse">
                                            {b.minutesUntilEnd !== undefined ? (
                                                b.minutesUntilEnd < 0 ? (
                                                    t('dashboard.overdue', 'Overdue')
                                                ) : (
                                                    <>
                                                        {formatMinutes(b.minutesUntilEnd)} {t('common.left', 'left')}
                                                    </>
                                                )
                                            ) : (
                                                t('common.ongoing', 'Ongoing')
                                            )}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Section */}
                    {liveData.upcoming.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('dashboard.upcoming', 'Upcoming')}
                            </h4>
                            <div className="grid gap-3">
                                {liveData.upcoming.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{b.clientName}</span>
                                            <span className="text-xs text-muted-foreground">{b.serviceName}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-background">
                                            {t('common.in', 'in')} {b.minutesUntilStart !== undefined ? formatMinutes(b.minutesUntilStart) : ''}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasActivity && (
                        <div className="text-center py-4 text-muted-foreground text-sm flex flex-col items-center gap-2">
                            <Calendar className="h-8 w-8 opacity-20" />
                            <p>{t('dashboard.noLiveActivity', 'No active or upcoming bookings right now.')}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
