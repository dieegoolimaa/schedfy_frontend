import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { Booking } from "../../types/models/bookings.interface";
import { Commission } from "../../types/models/promotions.interface";
import { DollarSign, Tag, Percent, TrendingUp } from "lucide-react";

interface PromotionImpactCardProps {
    bookings: Booking[];
    commissions: Commission[];
}

export const PromotionImpactCard: React.FC<PromotionImpactCardProps> = ({
    bookings,
    commissions,
}) => {
    const { t } = useTranslation("financial");
    const { formatCurrency } = useCurrency();

    const stats = useMemo(() => {
        let totalDiscountAmount = 0;
        let totalCommissionAmount = 0;
        let bookingsWithPromotion = 0;
        let revenueFromPromotions = 0;

        const completedBookings = bookings.filter(b => b.status === 'completed');

        completedBookings.forEach(booking => {
            const price = booking.pricing?.totalPrice || 0;
            const discount = booking.pricing?.discountAmount || 0;

            if (discount > 0) {
                totalDiscountAmount += discount;
                bookingsWithPromotion++;
                revenueFromPromotions += price;
            }

            // Calculate Commission
            // Logic: Find highest priority commission rule
            // 1. Specific Service
            // 2. Specific Professional
            // 3. Service Category

            let commissionValue = 0;

            // Helper to get ID
            const getId = (id: any): string | undefined => {
                if (!id) return undefined;
                if (typeof id === 'string') return id;
                return id._id;
            };

            const serviceId = getId(booking.serviceId);
            const professionalId = getId(booking.professionalId);

            // Check for service specific commission
            const serviceCommission = commissions.find(c =>
                c.appliesTo === 'service' && serviceId && c.serviceIds?.includes(serviceId) && c.isActive
            );

            if (serviceCommission) {
                commissionValue = serviceCommission.type === 'percentage'
                    ? (price * serviceCommission.value / 100)
                    : serviceCommission.value;
            } else {
                // Check for professional specific commission
                const profCommission = commissions.find(c =>
                    c.appliesTo === 'professional' &&
                    professionalId &&
                    c.professionalIds?.includes(professionalId) &&
                    c.isActive
                );

                if (profCommission) {
                    commissionValue = profCommission.type === 'percentage'
                        ? (price * profCommission.value / 100)
                        : profCommission.value;
                } else {
                    // Check for category (need service category from booking.service)
                    const categoryCommission = commissions.find(c =>
                        c.appliesTo === 'service_category' &&
                        c.serviceCategoryIds?.includes(booking.service?.category || '') &&
                        c.isActive
                    );

                    if (categoryCommission) {
                        commissionValue = categoryCommission.type === 'percentage'
                            ? (price * categoryCommission.value / 100)
                            : categoryCommission.value;
                    }
                }
            }

            totalCommissionAmount += commissionValue;
        });

        return {
            totalDiscountAmount,
            totalCommissionAmount,
            bookingsWithPromotion,
            revenueFromPromotions,
            promotionRate: completedBookings.length > 0 ? (bookingsWithPromotion / completedBookings.length) * 100 : 0
        };
    }, [bookings, commissions]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("impact.totalDiscounts")}</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalDiscountAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("impact.bookingsCount", { count: stats.bookingsWithPromotion })}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("impact.estimatedCommissions")}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissionAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("impact.activeRules")}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("impact.promotionUsage")}</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.promotionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        {t("impact.completedBookings")}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("impact.promotionalRevenue")}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.revenueFromPromotions)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("impact.discountedBookings")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
