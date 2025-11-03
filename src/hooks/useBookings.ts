import { useState, useEffect, useCallback } from 'react';
import { bookingsService, Booking, CreateBookingDto, UpdateBookingDto } from "../services/bookings.service';
import { toast } from 'sonner';

interface UseBookingsOptions {
    entityId?: string;
    clientId?: string;
    professionalId?: string;
    serviceId?: string;
    autoFetch?: boolean;
}

export function useBookings(options: UseBookingsOptions = {}) {
    const { entityId, clientId, professionalId, serviceId, autoFetch = false } = options;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch bookings based on provided filters
    const fetchBookings = useCallback(async () => {
        if (!entityId && !clientId && !professionalId && !serviceId) {
            setBookings([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let response;
            if (entityId) {
                console.log('[useBookings] entityId sent to API:', entityId, typeof entityId, entityId.length);
                response = await bookingsService.getByEntity(entityId);
            } else if (clientId) {
                response = await bookingsService.getByClient(clientId);
            } else if (professionalId) {
                response = await bookingsService.getByProfessional(professionalId);
            } else if (serviceId) {
                response = await bookingsService.getByService(serviceId);
            }

            if (response) {
                setBookings(response.data);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load bookings';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId, clientId, professionalId, serviceId]);

    // Fetch bookings by date range
    const fetchByDateRange = useCallback(async (startDate: string, endDate: string) => {
        if (!entityId) {
            toast.error('Entity ID is required to fetch bookings by date range');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.getByDateRange(entityId, startDate, endDate);
            setBookings(response.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load bookings';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    // Create a new booking
    const createBooking = useCallback(async (data: CreateBookingDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.create(data);
            setBookings(prev => [...prev, response.data]);

            toast.success('Booking created successfully!');
            return response.data;
        } catch (err: any) {
            // Handle booking conflicts specifically
            if (err.response?.status === 409) {
                const conflictMessage = err.response?.data?.message || 'This time slot is no longer available';
                setError(conflictMessage);
                toast.error(`Booking Conflict: ${conflictMessage}`);
            } else {
                const errorMessage = err.message || 'Failed to create booking';
                setError(errorMessage);
                toast.error(errorMessage);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a booking
    const updateBooking = useCallback(async (id: string, data: UpdateBookingDto) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.update(id, data);
            setBookings(prev => prev.map(booking =>
                booking.id === id ? response.data : booking
            ));

            toast.success('Booking updated successfully!');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update booking';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Cancel a booking
    const cancelBooking = useCallback(async (id: string, reason?: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.cancel(id, reason);
            setBookings(prev => prev.map(booking =>
                booking.id === id ? response.data : booking
            ));

            toast.success('Booking cancelled successfully');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to cancel booking';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Confirm a booking
    const confirmBooking = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.confirm(id);
            setBookings(prev => prev.map(booking =>
                booking.id === id ? response.data : booking
            ));

            toast.success('Booking confirmed!');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to confirm booking';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Complete a booking
    const completeBooking = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.complete(id);
            setBookings(prev => prev.map(booking =>
                booking.id === id ? response.data : booking
            ));

            toast.success('Booking marked as completed');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to complete booking';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark booking as no-show
    const markNoShow = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookingsService.markNoShow(id);
            setBookings(prev => prev.map(booking =>
                booking.id === id ? response.data : booking
            ));

            toast.success('Booking marked as no-show');
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to mark booking as no-show';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a booking
    const deleteBooking = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await bookingsService.delete(id);
            setBookings(prev => prev.filter(booking => booking.id !== id));

            toast.success('Booking deleted successfully');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete booking';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check availability
    const checkAvailability = useCallback(async (data: {
        serviceId: string;
        professionalId?: string;
        startTime: string;
        endTime: string;
    }) => {
        try {
            const response = await bookingsService.checkAvailability(data);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to check availability';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchBookings();
        }
    }, [autoFetch, fetchBookings]);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        fetchByDateRange,
        createBooking,
        updateBooking,
        cancelBooking,
        confirmBooking,
        completeBooking,
        markNoShow,
        deleteBooking,
        checkAvailability,
    };
}
