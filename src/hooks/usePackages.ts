import { useState, useCallback } from "react";
import { apiClient } from "../lib/api";
import { toast } from "sonner";
import type {
    ServicePackage,
    PackageSubscription,
    PackageFilters
} from "../types/models/packages.interface";
import type {
    CreatePackageDto,
    UpdatePackageDto,
    CreateSubscriptionDto
} from "../types/dto/packages.dto";

/**
 * Custom hook for managing service packages and subscriptions
 * Similar to usePromotions but focused on packages
 */
export function usePackages() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ==================== PACKAGES ====================

    /**
     * Get all packages for an entity with optional filters
     */
    const getPackages = useCallback(
        async (
            entityId: string,
            filters?: PackageFilters
        ): Promise<ServicePackage[]> => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams();
                if (filters?.status && (filters.status as any) !== "all") {
                    queryParams.append("status", filters.status);
                }

                const url = `/api/packages/entity/${entityId}${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;

                const response = await apiClient.get<ServicePackage[]>(url);
                return response.data || [];
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to fetch packages";
                setError(errorMessage);
                toast.error(errorMessage);
                return [];
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Create a new package
     */
    const createPackage = useCallback(
        async (dto: CreatePackageDto): Promise<ServicePackage | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.post<ServicePackage>("/api/packages", dto);

                if (response.data) {
                    toast.success("Package created successfully!");
                    return response.data;
                }

                return null;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to create package";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Update an existing package
     */
    const updatePackage = useCallback(
        async (
            packageId: string,
            dto: UpdatePackageDto
        ): Promise<ServicePackage | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.patch<ServicePackage>(
                    `/api/packages/${packageId}`,
                    dto
                );

                if (response.data) {
                    toast.success("Package updated successfully!");
                    return response.data;
                }

                return null;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to update package";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Delete a package
     */
    const deletePackage = useCallback(async (packageId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await apiClient.delete(`/api/packages/${packageId}`);
            toast.success("Package deleted successfully!");
            return true;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || "Failed to delete package";
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Toggle package status (active/inactive)
     */
    const togglePackageStatus = useCallback(
        async (packageId: string): Promise<ServicePackage | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.patch<ServicePackage>(
                    `/api/packages/${packageId}/toggle-status`
                );

                if (response.data) {
                    toast.success("Package status updated!");
                    return response.data;
                }

                return null;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to toggle status";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ==================== SUBSCRIPTIONS ====================

    /**
     * Get all subscriptions for an entity
     */
    const getSubscriptions = useCallback(
        async (entityId: string): Promise<PackageSubscription[]> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get<PackageSubscription[]>(
                    `/api/packages/subscriptions/entity/${entityId}`
                );
                return response.data || [];
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to fetch subscriptions";
                setError(errorMessage);
                toast.error(errorMessage);
                return [];
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Get active packages for a specific client
     */
    const getClientActivePackages = useCallback(
        async (clientId: string): Promise<PackageSubscription[]> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get<PackageSubscription[]>(
                    `/api/packages/client/${clientId}/active`
                );
                return response.data || [];
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to fetch client packages";
                setError(errorMessage);
                // Don't show error toast for this - it's expected when client has no packages
                return [];
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Get subscriptions expiring soon
     */
    const getExpiringSubscriptions = useCallback(
        async (entityId: string, daysThreshold = 7): Promise<PackageSubscription[]> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get<PackageSubscription[]>(
                    `/api/packages/subscriptions/entity/${entityId}/expiring?days=${daysThreshold}`
                );
                return response.data || [];
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to fetch expiring subscriptions";
                setError(errorMessage);
                return [];
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Create a new subscription (assign package to client)
     */
    const createSubscription = useCallback(
        async (dto: CreateSubscriptionDto): Promise<PackageSubscription | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.post<PackageSubscription>(
                    "/api/packages/subscriptions",
                    dto
                );

                if (response.data) {
                    toast.success("Package assigned to client successfully!");
                    return response.data;
                }

                return null;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to create subscription";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Use a session from a package subscription
     */
    const usePackageSession = useCallback(
        async (
            subscriptionId: string,
            bookingId: string
        ): Promise<PackageSubscription | null> => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.post<PackageSubscription>(
                    `/api/packages/subscriptions/${subscriptionId}/use-session`,
                    { bookingId }
                );

                if (response.data) {
                    return response.data;
                }

                return null;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to use package session";
                setError(errorMessage);
                toast.error(errorMessage);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Cancel a subscription
     */
    const cancelSubscription = useCallback(
        async (subscriptionId: string, reason?: string): Promise<boolean> => {
            try {
                setLoading(true);
                setError(null);

                await apiClient.patch(
                    `/api/packages/subscriptions/${subscriptionId}/cancel`,
                    { reason }
                );

                toast.success("Subscription cancelled successfully!");
                return true;
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message || "Failed to cancel subscription";
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Calculate package statistics
     */
    const calculatePackageStats = useCallback(
        (subscriptions: PackageSubscription[]) => {
            const active = subscriptions.filter((s) => s.status === "active");
            const totalSessions = active.reduce((sum, s) => sum + s.sessionsTotal, 0);
            const usedSessions = active.reduce((sum, s) => sum + s.sessionsUsed, 0);
            const remainingSessions = totalSessions - usedSessions;

            return {
                totalActive: active.length,
                totalSessions,
                usedSessions,
                remainingSessions,
                usagePercentage: totalSessions > 0 ? (usedSessions / totalSessions) * 100 : 0,
            };
        },
        []
    );

    /**
     * Check if a service is included in a package
     */
    const isServiceInPackage = useCallback(
        (packageData: ServicePackage, serviceId: string): boolean => {
            return packageData.services.some((s) => {
                const id = typeof s.serviceId === 'string' ? s.serviceId : (s.serviceId as any)._id || (s.serviceId as any).id;
                return id === serviceId;
            });
        },
        []
    );

    /**
     * Get days until expiry
     */
    const getDaysUntilExpiry = useCallback((expiryDate: string): number => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, []);

    return {
        // State
        loading,
        error,

        // Package CRUD
        getPackages,
        createPackage,
        updatePackage,
        deletePackage,
        togglePackageStatus,

        // Subscription Management
        getSubscriptions,
        getClientActivePackages,
        getExpiringSubscriptions,
        createSubscription,
        usePackageSession,
        cancelSubscription,

        // Utilities
        calculatePackageStats,
        isServiceInPackage,
        getDaysUntilExpiry,
    };
}
