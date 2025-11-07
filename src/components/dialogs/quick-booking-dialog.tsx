import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, Calendar } from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { useAuth } from "../../contexts/auth-context";
import type { CreateBookingDto } from "../../types/models/bookings.interface";

interface QuickBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated?: () => void;
}

export function QuickBookingDialog({
  open,
  onOpenChange,
  onBookingCreated,
}: QuickBookingDialogProps) {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  const entityId = user?.entityId || "";

  const { createBooking } = useBookings({ entityId });
  const { clients, fetchClients } = useClients({ entityId });
  const { services, fetchServices } = useServices({ entityId });

  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load clients and services when dialog opens
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchServices();

      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, date: today }));
    }
  }, [open, fetchClients, fetchServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.date}T${formData.time}`);

      // Find selected service to get duration
      const selectedService = services.find((s) => s.id === formData.serviceId);
      const durationMinutes = selectedService?.duration || 60;

      // Calculate end time
      const endDateTime = new Date(
        startDateTime.getTime() + durationMinutes * 60000
      );

      // Get service pricing - use basePrice from service if available
      const selectedServicePrice =
        (selectedService as any)?.pricing?.basePrice || 0;

      const bookingData: CreateBookingDto = {
        entityId,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        notes: formData.notes || undefined,
        status: "pending",
        pricing: {
          basePrice: selectedServicePrice,
          totalPrice: selectedServicePrice,
          currency: "EUR", // TODO: Get from region config
        },
        createdBy: user?.id || entityId,
      };

      await createBooking(bookingData);

      // Reset form
      setFormData({
        clientId: "",
        serviceId: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        notes: "",
      });

      // Close dialog
      onOpenChange(false);

      // Notify parent
      onBookingCreated?.();
    } catch (error) {
      console.error("Failed to create booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvancedBooking = () => {
    onOpenChange(false);
    navigate("/entity/booking-management");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("quickBookingDialog.title", "Quick Booking")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "quickBookingDialog.description",
              "Create a new booking quickly. For advanced options, use the full booking form."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">
                {t("quickBookingDialog.client", "Client")} *
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="client">
                  <SelectValue
                    placeholder={t(
                      "quickBookingDialog.selectClient",
                      "Select a client"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>
                      {t(
                        "quickBookingDialog.noClients",
                        "No clients available"
                      )}
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">
                {t("quickBookingDialog.service", "Service")} *
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="service">
                  <SelectValue
                    placeholder={t(
                      "quickBookingDialog.selectService",
                      "Select a service"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <SelectItem value="no-services" disabled>
                      {t(
                        "quickBookingDialog.noServices",
                        "No services available"
                      )}
                    </SelectItem>
                  ) : (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} min)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  {t("quickBookingDialog.date", "Date")} *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  {t("quickBookingDialog.time", "Time")} *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("quickBookingDialog.notes", "Notes (Optional)")}
              </Label>
              <Input
                id="notes"
                placeholder={t(
                  "quickBookingDialog.notesPlaceholder",
                  "Add any special notes..."
                )}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleAdvancedBooking}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t("quickBookingDialog.advancedOptions", "Advanced Options")}
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {t("quickBookingDialog.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("quickBookingDialog.creating", "Creating...")}
                  </>
                ) : (
                  t("quickBookingDialog.create", "Create Booking")
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
