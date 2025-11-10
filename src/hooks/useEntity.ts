import { useState, useEffect, useCallback } from "react";
import { entitiesService, EntityProfile } from "../services/entities.service";
import { toast } from "sonner";

interface UseEntityOptions {
    entityId?: string;
    autoFetch?: boolean;
}

export function useEntity(options: UseEntityOptions = {}) {
    const { autoFetch = false } = options;

    const [entity, setEntity] = useState<EntityProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEntity = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await entitiesService.getProfile();
            setEntity(response.data);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch entity profile";
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchEntity();
        }
    }, [autoFetch, fetchEntity]);

    return {
        entity,
        loading,
        error,
        fetchEntity,
    };
}
