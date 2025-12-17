import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Progress } from './progress';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { useAuth } from '../../contexts/auth-context';

interface UsageLimitBarProps {
    type: 'bookings' | 'professionals' | 'clients';
    showUpgradeButton?: boolean;
    compact?: boolean;
    usageItem: {
        used: number;
        limit: number | null;
        percentage: number;
        unlimited: boolean;
    };
}

/**
 * Displays a single usage limit bar
 */
export function UsageLimitBar({ type, showUpgradeButton = true, compact = false, usageItem }: UsageLimitBarProps) {
    const { t } = useTranslation();

    if (!usageItem) return null;

    const labels: Record<string, string> = {
        bookings: t('usage.bookings', 'Bookings this month'),
        professionals: t('usage.professionals', 'Professionals'),
        clients: t('usage.clients', 'Clients'),
    };

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-primary';
    };

    if (usageItem.unlimited) {
        return (
            <div className={compact ? 'text-sm' : ''}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">{labels[type]}</span>
                    <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {t('usage.unlimited', 'Unlimited')}
                    </Badge>
                </div>
            </div>
        );
    }

    const isNearLimit = usageItem.percentage >= 80;
    const isAtLimit = usageItem.percentage >= 100;

    return (
        <div className={compact ? 'text-sm' : ''}>
            <div className="flex justify-between items-center mb-1">
                <span className="text-muted-foreground">{labels[type]}</span>
                <span className={`font-medium ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : ''}`}>
                    {usageItem.used}/{usageItem.limit}
                </span>
            </div>
            <div className="relative">
                <Progress value={usageItem.percentage} className="h-2" />
                <div
                    className={`absolute inset-0 h-2 rounded-full transition-all ${getProgressColor(usageItem.percentage)}`}
                    style={{ width: `${Math.min(100, usageItem.percentage)}%` }}
                />
            </div>
            {isNearLimit && showUpgradeButton && (
                <div className="mt-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">
                        {isAtLimit
                            ? t('usage.limitReached', 'Limit reached!')
                            : t('usage.nearLimit', 'Approaching limit')}
                    </span>
                    <Link to="/upgrade" className="ml-auto">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {t('usage.upgrade', 'Upgrade')}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

/**
 * Full usage card with all limits displayed
 */
export function UsageCard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { usage, loading } = useUsageLimits();

    if (loading || !usage) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-2 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-2 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const planLabels: Record<string, string> = {
        simple: t('plans.simple.name', 'Simple'),
        individual: t('plans.individual.name', 'Individual'),
        business: t('plans.business.name', 'Business'),
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('usage.title', 'Usage & Limits')}</CardTitle>
                    {user?.plan && (
                        <Badge variant="outline">
                            {planLabels[user.plan] || user.plan}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <UsageLimitBar type="bookings" usageItem={usage.bookings} />
                <UsageLimitBar type="professionals" usageItem={usage.professionals} />
                <UsageLimitBar type="clients" usageItem={usage.clients} />

                {user?.plan !== 'business' && (
                    <div className="pt-4 border-t">
                        <Link to="/upgrade">
                            <Button className="w-full" variant="default">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {t('usage.upgradeForMore', 'Upgrade for more bookings')}
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Compact usage indicator for headers/sidebars
 */
export function UsageIndicator() {
    const { usage, loading, isNearLimit } = useUsageLimits();

    if (loading || !usage) return null;

    const bookings = usage.bookings;
    if (bookings.unlimited) return null;

    const showWarning = isNearLimit('bookings');

    return (
        <Link to="/upgrade" className="flex items-center gap-2 text-sm">
            <div className="w-20">
                <Progress value={bookings.percentage} className="h-1.5" />
            </div>
            <span className={showWarning ? 'text-yellow-500 font-medium' : 'text-muted-foreground'}>
                {bookings.used}/{bookings.limit}
            </span>
            {showWarning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </Link>
    );
}
