import { useState, useEffect, useCallback } from 'react';
import { servicesApi, Service, CreateServiceDto, UpdateServiceDto } from '../lib/api/services.api';
import { toast } from 'sonner';

interface UseServicesOptions {
    entityId?: string;
    autoFetch?: boolean;
}

// Transform backend service structure to UI-friendly format
function transformService(service: any): Service {
    // Handle both old flat structure and new nested structure
    const duration = typeof service.duration === 'object'
        ? service.duration.duration
        : service.duration;

    const price = typeof service.pricing === 'object'
        ? service.pricing.basePrice
        : service.price;

    const currency = typeof service.pricing === 'object'
        ? service.pricing.currency
        : (service.currency || 'EUR');

    const isActive = service.status === 'active' || service.isActive === true;
    const isPublic = service.seo?.isPublic ?? service.isPublic ?? true;

    return {
        ...service,
        duration,
        price,
        currency,
        isActive,
        isPublic,
        status: service.status || (isActive ? 'active' : 'inactive'),
        bookings: service.analytics?.totalBookings || service.bookingCount || 0,
        bookingCount: service.analytics?.totalBookings || service.bookingCount || 0,
        image: service.coverImage || service.imageUrl,
        imageUrl: service.coverImage || service.imageUrl,
        slug: service.seo?.slug || service.slug || '',
        professionalIds: service.assignedProfessionals || service.professionalIds || [],
        // These would ideally come from backend analytics
        rating: service.analytics?.averageRating || service.rating || 0,
        popularity: service.popularity || 0,
    };
}

export function useServices(options: UseServicesOptions = {}) {
    const { entityId, autoFetch = false } = options;

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch services
    const fetchServices = useCallback(async () => {
        if (!entityId) {
            setServices([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.getByEntity(entityId);
            setServices(response.data.map(transformService));
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load services';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    // Fetch active services only
    const fetchActiveServices = useCallback(async () => {
        if (!entityId) {
            setServices([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.getActiveByEntity(entityId);
            setServices(response.data.map(transformService));
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load active services';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    // Create a new service
    const createService = useCallback(async (data: CreateServiceDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.create(data);
            const transformedService = transformService(response.data);
            setServices(prev => [...prev, transformedService]);

            toast.success('Service created successfully!');
            return transformedService;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create service';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update an existing service
    const updateService = useCallback(async (id: string, data: UpdateServiceDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.update(id, data);
            const transformedService = transformService(response.data);
            setServices(prev => prev.map(service =>
                service.id === id ? transformedService : service
            ));

            toast.success('Service updated successfully!');
            return transformedService;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update service';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a service
    const deleteService = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await servicesApi.delete(id);
            setServices(prev => prev.filter(service => service.id !== id));

            toast.success('Service deleted successfully!');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete service';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Upload service image
    const uploadServiceImage = useCallback(async (serviceId: string, file: File) => {
        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.uploadImage(serviceId, file);
            const imageUrl = (response.data as any)?.imageUrl || '';

            setServices(prev => prev.map(service =>
                service.id === serviceId ? { ...service, imageUrl } : service
            ));

            toast.success('Image uploaded successfully!');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to upload image';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Assign professional to service
    const assignProfessional = useCallback(async (serviceId: string, professionalId: string) => {
        try {
            setLoading(true);
            setError(null);

            await servicesApi.assignProfessional(serviceId, professionalId);
            // Refresh the specific service
            const response = await servicesApi.getById(serviceId);
            setServices(prev => prev.map(service =>
                service.id === serviceId ? response.data : service
            ));

            toast.success('Professional assigned successfully!');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to assign professional';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch on mount if autoFetch is true
    useEffect(() => {
        if (autoFetch && entityId) {
            fetchServices();
        }
    }, [autoFetch, entityId, fetchServices]);

    return {
        services,
        loading,
        error,
        fetchServices,
        fetchActiveServices,
        createService,
        updateService,
        deleteService,
        uploadServiceImage,
        assignProfessional,
        refetch: fetchServices, // Alias for convenience
    };
}
