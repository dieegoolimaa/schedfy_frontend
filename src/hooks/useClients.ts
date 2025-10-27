import { useState, useEffect, useCallback } from 'react';
import { clientsApi, Client, CreateClientDto, UpdateClientDto } from '../lib/api/clients.api';
import { toast } from 'sonner';

interface UseClientsOptions {
    entityId?: string;
    autoFetch?: boolean;
}

export function useClients(options: UseClientsOptions = {}) {
    const { entityId, autoFetch = false } = options;

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch clients
    const fetchClients = useCallback(async () => {
        if (!entityId) {
            setClients([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.getByEntity(entityId);
            setClients(response.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load clients';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    // Search clients
    const searchClients = useCallback(async (query: string) => {
        if (!entityId) {
            toast.error('Entity ID is required to search clients');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.search(entityId, query);
            setClients(response.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to search clients';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    // Get client with bookings
    const getClientWithBookings = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.getWithBookings(id);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load client details';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get client statistics
    const getClientStats = useCallback(async (id: string) => {
        try {
            const response = await clientsApi.getStats(id);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load client statistics';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    // Create a new client
    const createClient = useCallback(async (data: CreateClientDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.create(data);
            setClients(prev => [...prev, response.data]);

            toast.success('Client created successfully!');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create client';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a client
    const updateClient = useCallback(async (id: string, data: UpdateClientDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.update(id, data);
            setClients(prev => prev.map(client =>
                client.id === id ? response.data : client
            ));

            toast.success('Client updated successfully!');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update client';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a client
    const deleteClient = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await clientsApi.delete(id);
            setClients(prev => prev.filter(client => client.id !== id));

            toast.success('Client deleted successfully');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete client';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Add tags to a client
    const addTags = useCallback(async (id: string, tags: string[]) => {
        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.addTags(id, tags);
            setClients(prev => prev.map(client =>
                client.id === id ? response.data : client
            ));

            toast.success('Tags added successfully');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to add tags';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Remove tags from a client
    const removeTags = useCallback(async (id: string, tags: string[]) => {
        try {
            setLoading(true);
            setError(null);

            const response = await clientsApi.removeTags(id, tags);
            setClients(prev => prev.map(client =>
                client.id === id ? response.data : client
            ));

            toast.success('Tags removed successfully');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to remove tags';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchClients();
        }
    }, [autoFetch, fetchClients]);

    return {
        clients,
        loading,
        error,
        fetchClients,
        searchClients,
        getClientWithBookings,
        getClientStats,
        createClient,
        updateClient,
        deleteClient,
        addTags,
        removeTags,
    };
}
