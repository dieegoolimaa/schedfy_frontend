import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "../../hooks/useCurrency";
import { Booking } from "../../types/models/bookings.interface";
import { Commission, Voucher, Discount } from "../../types/models/promotions.interface";
import { TrendingUp, DollarSign, Tag, Percent } from "lucide-react";

interface PromotionImpactCardProps {
    bookings: Booking[];
    commissions: Commission[];
    vouchers: Voucher[];
    discounts: Discount[];
}

export const PromotionImpactCard: React.FC<PromotionImpactCardProps> = ({
    bookings,
    commissions,
    vouchers,
    discounts,
}) => {
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

            // Check for service specific commission
            const serviceCommission = commissions.find(c =>
                c.appliesTo === 'service' && c.serviceIds?.includes(booking.serviceId) && c.isActive
            );

            if (serviceCommission) {
                commissionValue = serviceCommission.type === 'percentage'
                    ? (price * serviceCommission.value / 100)
                    : serviceCommission.value;
            } else {
                // Check for professional specific commission
                const profCommission = commissions.find(c =>
                    c.appliesTo === 'professional' &&
                    c.professionalIds?.includes(booking.professionalId || '') &&
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
                    <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalDiscountAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        Across {stats.bookingsWithPromotion} bookings
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estimated Commissions</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissionAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        Based on active rules
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promotion Usage</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.promotionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        of completed bookings
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promotional Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.revenueFromPromotions)}</div>
                    <p className="text-xs text-muted-foreground">
                        Generated from discounted bookings
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
