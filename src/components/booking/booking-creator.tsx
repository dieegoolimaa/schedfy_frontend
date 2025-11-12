import { useRef } from "react";
import { CreateBookingDialog } from "../dialogs/create-booking-dialog";
import { useBookings } from "../../hooks/useBookings";
import { useAuth } from "../../contexts/auth-context";

export interface BookingCreatorProps {
  /**
   * Controlled state for dialog open/close
   */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /**
   * List of services available for booking
   * Will be mapped to the format expected by CreateBookingDialog
   */
  services: Array<{
    id: string;
    name: string;
    duration?: number;
    price?: number;
  }>;

  /**
   * Optional callback when booking is successfully created
   */
  onSuccess?: () => void;

  /**
   * Optional callback when booking creation fails
   */
  onError?: (error: any) => void;

  /**
   * Override default entity ID (uses auth context by default)
   */
  entityId?: string;

  /**
   * Plan type for different behaviors
   * @default "business" - Shows all features
   * "simple" - Simplified flow, auto-confirmation
   * "individual" - Standard flow
   */
  planType?: "simple" | "individual" | "business";

  /**
   * Show pricing information
   * @default true
   */
  showPricing?: boolean;
}

/**
 * BookingCreator - Unified component for creating bookings across all plan types
 *
 * This component wraps CreateBookingDialog and provides:
 * - Automatic service mapping
 * - Built-in booking creation logic via useBookings hook
 * - Success/error handling with toast notifications
 * - Plan-specific behaviors
 * - Auth context integration
 *
 * @example
 * // Simple usage
 * <BookingCreator
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   services={services}
 *   onSuccess={() => refetchBookings()}
 * />
 *
 * @example
 * // With plan-specific behavior
 * <BookingCreator
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   services={services}
 *   planType="simple"
 *   showPricing={false}
 * />
 */
export function BookingCreator({
  open,
  onOpenChange,
  services,
  onSuccess,
  onError,
  entityId: propEntityId,
  planType = "business",
  showPricing = true,
}: BookingCreatorProps) {
  const { user } = useAuth();
  const entityId = propEntityId || user?.entityId || user?.id || "";

  const { createBooking } = useBookings({
    entityId,
    autoFetch: false, // Don't auto-fetch, let parent control
  });

  // Track if we're in a multi-booking creation
  const bookingCount = useRef(0);
  const expectedCount = useRef(0);

  /**
   * Wrapper for handling dialog close with success callback
   */
  const handleDialogChange = (open: boolean) => {
    // If dialog is closing and we created bookings successfully
    if (!open && bookingCount.current > 0) {
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      // Reset counter
      bookingCount.current = 0;
      expectedCount.current = 0;
    }
    onOpenChange(open);
  };

  /**
   * Handle booking creation
   * Maps dialog data to API format and calls createBooking
   * Note: CreateBookingDialog calls this multiple times for multiple slots
   */
  const handleSubmit = async (bookingData: any) => {
    // Don't set isCreating here - let the dialog control the submission state
    // This allows multiple sequential calls without closing the dialog prematurely

    try {
      // Find the selected service to get pricing info
      const selectedService = services.find(
        (s) => s.id === bookingData.serviceId
      );

      if (!selectedService) {
        throw new Error("Service not found");
      }

      // Map dialog data to API format
      const apiData = {
        entityId,
        serviceId: bookingData.serviceId,
        professionalId: bookingData.professionalId,
        startDateTime: bookingData.startDateTime,
        endDateTime: bookingData.endDateTime,
        clientInfo: {
          name: bookingData.clientName,
          email: bookingData.clientEmail,
          phone: bookingData.clientPhone,
          notes: bookingData.notes,
        },
        // Pricing information (REQUIRED by backend)
        pricing: {
          basePrice: selectedService.price || 0,
          totalPrice: selectedService.price || 0,
          currency: "EUR",
        },
        // Created by (REQUIRED by backend)
        createdBy: user?.id || "",
        // Plan-specific fields
        ...(planType === "simple" && {
          status: "confirmed", // Simple plan auto-confirms
        }),
        // Package-related fields (if provided by dialog)
        ...(bookingData.isPackageBooking && {
          isPackageBooking: bookingData.isPackageBooking,
          packageSubscriptionId: bookingData.packageSubscriptionId,
        }),
      };

      console.log("[BookingCreator] Creating booking:", apiData);

      await createBooking(apiData);

      // Increment successful booking count
      bookingCount.current += 1;

      // NOTE: Don't show toast or close dialog here
      // CreateBookingDialog handles that after ALL bookings are created
      // This is important for multiple booking slots
    } catch (error: any) {
      console.error("[BookingCreator] Failed to create booking:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create booking";

      // Call error callback if provided
      if (onError) {
        onError(error);
      }

      // Throw error so CreateBookingDialog can handle it
      throw new Error(errorMessage);
    }
  };

  // Map services to dialog format
  const mappedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.duration || 60,
    price: showPricing ? s.price : undefined,
  }));

  return (
    <CreateBookingDialog
      open={open}
      onOpenChange={handleDialogChange}
      entityId={entityId}
      services={mappedServices}
      onSubmit={handleSubmit}
    />
  );
}
