import { useAuth } from "../contexts/auth-context";

export function usePermissions() {
    const { user } = useAuth();

    // Get user's package tier - capitalize first letter to match expected format
    const userPlan = user?.plan || "simple";
    const userPackage = userPlan.charAt(0).toUpperCase() + userPlan.slice(1); // "simple" -> "Simple"

    /**
     * Check if user has a specific permission based on package tier
     * Simple: Basic features including services and professionals management
     * Individual: Full individual business features + finances
     * Business: All features including multi-professional management
     */
    const hasPermission = (permission: string): boolean => {
        // Simple plan permissions - INCLUDES services and professionals
        if (userPackage === "Simple") {
            const simplePermissions = [
                "view_bookings",
                "create_bookings",
                "manage_bookings",
                "manage_own_calendar",
                "manage_services",      // ✅ Simple CAN manage services
                "manage_professionals", // ✅ Simple CAN manage professionals
                "view_clients",         // Can view but limited features
            ];
            return simplePermissions.includes(permission);
        }

        // Individual plan permissions
        if (userPackage === "Individual") {
            const individualPermissions = [
                "view_bookings",
                "create_bookings",
                "manage_bookings",
                "manage_clients",
                "manage_services",
                "manage_professionals",
                "manage_own_calendar",
                "manage_finances",      // ❌ Simple CANNOT manage finances
                "view_analytics",
                "manage_promotions",    // ❌ Simple CANNOT manage promotions
                "manage_payments",
            ];
            return individualPermissions.includes(permission);
        }

        // Business plan has all permissions
        if (userPackage === "Business") {
            return true; // Business has access to everything
        }

        return false;
    };

    /**
     * Check if user can access a specific feature
     */
    const checkFeatureAccess = (feature: string): { hasAccess: boolean; reason?: string } => {
        const packageFeatures: Record<string, string[]> = {
            Simple: [
                "bookings",
                "calendar",
                "services",        // ✅ Simple CAN manage services
                "professionals",   // ✅ Simple CAN manage professionals
            ],
            Individual: [
                "bookings",
                "calendar",
                "clients",
                "services",
                "professionals",
                "finances",        // ❌ Simple CANNOT
                "analytics",
                "promotions",      // ❌ Simple CANNOT
                "payments",
            ],
            Business: [
                "bookings",
                "calendar",
                "clients",
                "services",
                "professionals",
                "finances",
                "analytics",
                "promotions",
                "payments",
                "teams",           // ❌ Only Business
                "advanced_analytics",
                "white_label",
            ],
        };

        const currentPackageFeatures = packageFeatures[userPackage] || [];
        const hasAccess = currentPackageFeatures.includes(feature);

        if (!hasAccess) {
            if (userPackage === "Simple") {
                return {
                    hasAccess: false,
                    reason: "Upgrade to Individual or Business plan to access this feature",
                };
            } else if (userPackage === "Individual") {
                return {
                    hasAccess: false,
                    reason: "Upgrade to Business plan to access this feature",
                };
            }
        }

        return { hasAccess: true };
    };

    /**
     * Get minimum package tier required for a feature
     */
    const getRequiredPackage = (feature: string): string => {
        const featureToPackage: Record<string, string> = {
            bookings: "Simple",
            calendar: "Simple",
            clients: "Individual",
            services: "Individual",
            finances: "Individual",
            analytics: "Individual",
            promotions: "Individual",
            payments: "Individual",
            professionals: "Business",
            teams: "Business",
            advanced_analytics: "Business",
            white_label: "Business",
        };

        return featureToPackage[feature] || "Business";
    };

    return {
        hasPermission,
        checkFeatureAccess,
        getRequiredPackage,
        userPackage,
    };
}
