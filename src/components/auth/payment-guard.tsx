import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Entity } from "@/types/models/entities.interface";

interface PaymentGuardProps {
    children: React.ReactNode;
}

export function PaymentGuard({ children }: PaymentGuardProps) {
    const { entity, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading || !entity) return;

        const currentEntity = entity as unknown as Entity;
        const path = location.pathname;

        // Allow access to subscription pages to fix issues
        if (path.includes('/subscription') || path.includes('/settings')) {
            return;
        }

        // Check for first payment completion
        // We skip this check for 'simple' plan if it's considered free, but assuming it's paid:
        // If status is 'trialing', we allow access.
        // If status is 'active' but hasCompletedFirstPayment is false, it might be a migration issue or a bug, 
        // but strictly speaking, if they are active, they are good.
        // The flag hasCompletedFirstPayment is useful if we want to enforce an initial payment flow.

        // Check for blocking payment issues
        if (currentEntity.hasPaymentIssue) {
            // We can decide to block completely or just show the banner.
            // For 'past_due', we might allow access for a grace period (handled by banner).
            // For 'unpaid' or 'payment_failed' on initial sub, we might block.

            if (currentEntity.paymentIssueType === 'unpaid' || (currentEntity.paymentIssueType === 'payment_failed' && !currentEntity.hasCompletedFirstPayment)) {
                if (currentEntity.plan === 'simple') {
                    navigate('/simple/subscription');
                } else if (currentEntity.plan === 'individual') {
                    navigate('/individual/subscription');
                } else {
                    navigate('/entity/subscription');
                }
            }
        }

    }, [entity, isLoading, navigate, location.pathname]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}
