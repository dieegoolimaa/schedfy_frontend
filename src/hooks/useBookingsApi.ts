import { useState, useCallback } from "react";
import { bookingsApi, Booking, CreateBookingDto, UpdateBookingDto, BookingFilters } from "../lib/api/bookings.api";
import { useAuth } from "../contexts/auth-context";

export function useBookingsApi() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch bookings with filters
    const fetchBookings = useCallback(async (filters?: BookingFilters) => {
        if (!user?.entityId) {
            console.warn("[useBookingsApi] No entityId available");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await bookingsApi.getByEntity(user.entityId, filters);

            console.log("[useBookingsApi] Fetched bookings:", response.data);
            setBookings(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.error("[useBookingsApi] Error fetching bookings:", err);
            setError(err.message || "Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    }, [user?.entityId]);

    // Create a new booking
    const createBooking = useCallback(
        async (data: CreateBookingDto) => {
            if (!user?.entityId) {
                throw new Error("No entityId available");
            }

            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.create({
                    ...data,
                    entityId: user.entityId,
                });

                console.log("[useBookingsApi] Created booking:", response.data);

                // Refresh bookings list
                await fetchBookings();

                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error creating booking:", err);
                setError(err.message || "Failed to create booking");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [user?.entityId, fetchBookings]
    );

    // Update a booking
    const updateBooking = useCallback(
        async (id: string, data: UpdateBookingDto) => {
            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.update(id, data);
                console.log("[useBookingsApi] Updated booking:", response.data);

                // Refresh bookings list
                await fetchBookings();

                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error updating booking:", err);
                setError(err.message || "Failed to update booking");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchBookings]
    );

    // Cancel a booking
    const cancelBooking = useCallback(
        async (id: string, reason?: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.cancel(id, reason);

                console.log("[useBookingsApi] Cancelled booking:", response.data);

                // Refresh bookings list
                await fetchBookings();

                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error cancelling booking:", err);
                setError(err.message || "Failed to cancel booking");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchBookings]
    );

    // Confirm a booking
    const confirmBooking = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.confirm(id);

                console.log("[useBookingsApi] Confirmed booking:", response.data);

                // Refresh bookings list
                await fetchBookings();

                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error confirming booking:", err);
                setError(err.message || "Failed to confirm booking");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchBookings]
    );

    // Complete a booking
    const completeBooking = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.complete(id);

                console.log("[useBookingsApi] Completed booking:", response.data);

                // Refresh bookings list
                await fetchBookings();

                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error completing booking:", err);
                setError(err.message || "Failed to complete booking");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchBookings]
    );

    // Check availability for a service
    const checkAvailability = useCallback(
        async (
            serviceId: string,
            startTime: string,
            endTime: string,
            professionalId?: string
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await bookingsApi.checkAvailability({
                    serviceId,
                    professionalId,
                    startTime,
                    endTime,
                });

                console.log("[useBookingsApi] Availability check:", response.data);
                return response.data;
            } catch (err: any) {
                console.error("[useBookingsApi] Error checking availability:", err);
                setError(err.message || "Failed to check availability");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        createBooking,
        updateBooking,
        cancelBooking,
        confirmBooking,
        completeBooking,
        checkAvailability,
    };
}