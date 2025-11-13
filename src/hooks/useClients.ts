import { useState, useEffect, useCallback } from 'react';
import { clientsService } from "../services/clients.service";
import { Client, CreateClientDto, UpdateClientDto } from "../types/models/clients.interface";
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
            console.warn('[useClients] No entityId provided, skipping fetch');
            setClients([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[useClients] Fetching clients for entityId:', entityId);
            const response = await clientsService.getByEntity(entityId);
            console.log('[useClients] Response:', response);
            
            if (response.data) {
                const clientsArray = Array.isArray(response.data) ? response.data : [];
                console.log('[useClients] Fetched', clientsArray.length, 'clients');
                setClients(clientsArray);
            } else {
                console.warn('[useClients] No data in response');
                setClients([]);
            }
        } catch (err: any) {
            console.error('[useClients] Error fetching clients:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load clients';
            setError(errorMessage);
            setClients([]); // Reset to empty array on error
            toast.error(`Failed to load clients: ${errorMessage}`);
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

            const response = await clientsService.search(entityId, query);
            if (response.data) {
                setClients(Array.isArray(response.data) ? response.data : []);
            } else {
                setClients([]);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to search clients';
            setError(errorMessage);
            setClients([]); // Reset to empty array on error
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

            const response = await clientsService.getWithBookings(id);
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
            const response = await clientsService.getStats(id);
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

            console.log('[useClients] Creating client:', data);
            const response = await clientsService.create(data);
            console.log('[useClients] Client created:', response.data);
            
            if (response.data) {
                setClients(prev => {
                    const currentClients = Array.isArray(prev) ? prev : [];
                    const updated = [...currentClients, response.data!];
                    console.log('[useClients] Updated clients count:', updated.length);
                    return updated;
                });
            }

            toast.success('Client created successfully!');
            return response.data;
        } catch (err: any) {
            console.error('[useClients] Error creating client:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create client';
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

            const response = await clientsService.update(id, data);
            if (response.data) {
                setClients(prev => {
                    const currentClients = Array.isArray(prev) ? prev : [];
                    return currentClients.map(client =>
                        client.id === id ? response.data! : client
                    );
                });
            }

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

            await clientsService.delete(id);
            setClients(prev => {
                const currentClients = Array.isArray(prev) ? prev : [];
                return currentClients.filter(client => client.id !== id);
            });

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

            const response = await clientsService.addTags(id, tags);
            if (response.data) {
                setClients(prev => {
                    const currentClients = Array.isArray(prev) ? prev : [];
                    return currentClients.map(client =>
                        client.id === id ? response.data! : client
                    );
                });
            }

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

            const response = await clientsService.removeTags(id, tags);
            if (response.data) {
                setClients(prev => {
                    const currentClients = Array.isArray(prev) ? prev : [];
                    return currentClients.map(client =>
                        client.id === id ? response.data! : client
                    );
                });
            }

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
