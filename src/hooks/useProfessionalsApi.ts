import { useState, useEffect, useCallback } from "react";
import { professionalsService, Professional } from "../services/professionals.service";
import { useAuth } from "../contexts/auth-context";

export function useProfessionalsApi() {
    const { user } = useAuth();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all professionals for the entity
    const fetchProfessionals = useCallback(async () => {
        if (!user?.entityId) {
            console.warn("[useProfessionalsApi] No entityId available");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await professionalsService.getProfessionals({
                entityId: user.entityId,
            });

            console.log("[useProfessionalsApi] Fetched professionals:", response.data);
            // Response is array directly from users endpoint
            setProfessionals(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error("[useProfessionalsApi] Error fetching professionals:", err);
            setError(err.message || "Failed to fetch professionals");
        } finally {
            setLoading(false);
        }
    }, [user?.entityId]);

    // Get professionals for a specific service
    const getProfessionalsForService = useCallback(
        (serviceId: string) => {
            return professionals.filter((prof) =>
                prof.services?.some((s: string) => s === serviceId)
            );
        },
        [professionals]
    );

    // Check if a professional is available at a specific time
    const isProfessionalAvailable = useCallback(
        async (professionalId: string, date: string, startTime: string, endTime: string) => {
            if (!user?.entityId) {
                throw new Error("No entityId available");
            }

            setLoading(true);
            setError(null);

            try {
                const response = await professionalsService.checkAvailability({
                    professionalId,
                    date,
                    startTime,
                    endTime,
                });

                console.log("[useProfessionalsApi] Availability check:", response.data);
                return response.data?.available || false;
            } catch (err: any) {
                console.error("[useProfessionalsApi] Error checking availability:", err);
                setError(err.message || "Failed to check availability");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [user?.entityId]
    );

    // Load professionals on mount
    useEffect(() => {
        if (user?.entityId) {
            fetchProfessionals();
        }
    }, [user?.entityId, fetchProfessionals]);

    return {
        professionals,
        loading,
        error,
        fetchProfessionals,
        getProfessionalsForService,
        isProfessionalAvailable,
    };
}
