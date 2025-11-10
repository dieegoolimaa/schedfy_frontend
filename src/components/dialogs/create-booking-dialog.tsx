import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { type TimeSlot } from "../../services/bookings.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Info, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

interface ServicePackage {
  id: string;
  name: string;
  services: Array<{ id: string; name: string }>;
  pricing: {
    packagePrice: number;
    originalPrice: number;
    discount: number;
    currency: string;
  };
  sessionsIncluded: number;
}

interface PackageSubscription {
  id: string;
  packageId: ServicePackage;
  sessionsRemaining: number;
  status: string;
}

interface BookingSlot {
  id: string;
  serviceId: string;
  date: string;
  slot: TimeSlot | null;
}

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  services: Service[];
  onSubmit: (bookingData: any) => Promise<void>;
  allowMultiple?: boolean;
  clientId?: string; // For showing available package subscriptions
  packages?: ServicePackage[]; // Available packages for purchase
  clientSubscriptions?: PackageSubscription[]; // Client's active subscriptions
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  entityId,
  services,
  onSubmit,
  allowMultiple = true,
  clientId,
  packages = [],
  clientSubscriptions = [],
}: CreateBookingDialogProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usePackage, setUsePackage] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string>("");

  // Multiple bookings state
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([
    { id: "1", serviceId: "", date: "", slot: null },
  ]);

  // Get selected subscription details
  const selectedSubscriptionData = clientSubscriptions.find(
    (sub) => sub.id === selectedSubscription
  );

  // Get all unique service IDs from booking slots
  const selectedServiceIds = [
    ...new Set(
      bookingSlots.filter((bs) => bs.serviceId).map((bs) => bs.serviceId)
    ),
  ];

  // Check if ALL selected services are included in the package
  const allServicesInPackage =
    usePackage && selectedSubscriptionData
      ? selectedServiceIds.every((serviceId) =>
          selectedSubscriptionData.packageId.services.some(
            (s) => s.id === serviceId
          )
        )
      : true;

  // Calculate required sessions
  const requiredSessions = bookingSlots.filter(
    (bs) => bs.serviceId && bs.date && bs.slot
  ).length;
  const hasEnoughSessions = selectedSubscriptionData
    ? selectedSubscriptionData.sessionsRemaining >= requiredSessions
    : false;

  const addBookingSlot = () => {
    const newId = (bookingSlots.length + 1).toString();
    setBookingSlots([
      ...bookingSlots,
      { id: newId, serviceId: "", date: "", slot: null },
    ]);
  };

  const removeBookingSlot = (id: string) => {
    if (bookingSlots.length === 1) {
      toast.error("At least one booking slot is required");
      return;
    }
    setBookingSlots(bookingSlots.filter((slot) => slot.id !== id));
  };

  const updateBookingSlot = (
    id: string,
    field: "serviceId" | "date" | "slot",
    value: string | TimeSlot | null
  ) => {
    setBookingSlots(
      bookingSlots.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              [field]: value,
              // Reset slot when service or date changes
              ...(field === "serviceId" || field === "date"
                ? { slot: null }
                : {}),
            }
          : slot
      )
    );
  };

  const resetForm = () => {
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
    setUsePackage(false);
    setSelectedSubscription("");
    setBookingSlots([{ id: "1", serviceId: "", date: "", slot: null }]);
  };

  const handleSubmit = async () => {
    if (!clientName || !clientPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate all booking slots have service, date and slot
    const validSlots = bookingSlots.filter(
      (bs) => bs.serviceId && bs.date && bs.slot
    );
    if (validSlots.length === 0) {
      toast.error("Please select service, date and time for at least one slot");
      return;
    }

    // Check if any slot is missing service
    const incompleteSlots = bookingSlots.filter(
      (bs) => (bs.date || bs.slot) && !bs.serviceId
    );
    if (incompleteSlots.length > 0) {
      toast.error("Please select a service for all booking slots");
      return;
    }

    // Validate package usage
    if (usePackage) {
      if (!selectedSubscription) {
        toast.error("Please select a package subscription");
        return;
      }
      if (!allServicesInPackage) {
        toast.error(
          "One or more selected services are not included in this package"
        );
        return;
      }
      if (!hasEnoughSessions) {
        toast.error(
          `Not enough sessions. You have ${selectedSubscriptionData?.sessionsRemaining} sessions but need ${requiredSessions}`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      // Create multiple bookings
      for (const bookingSlot of validSlots) {
        await onSubmit({
          clientName,
          clientPhone,
          clientEmail,
          serviceId: bookingSlot.serviceId,
          professionalId: bookingSlot.slot!.professionalId,
          startDateTime: bookingSlot.slot!.startDateTime,
          endDateTime: bookingSlot.slot!.endDateTime,
          notes,
          // Package-related fields
          ...(usePackage &&
            selectedSubscription && {
              isPackageBooking: true,
              packageSubscriptionId: selectedSubscription,
            }),
        });
      }

      toast.success(
        `${validSlots.length} booking${
          validSlots.length > 1 ? "s" : ""
        } created successfully!${
          usePackage
            ? ` ${requiredSessions} session${
                requiredSessions > 1 ? "s" : ""
              } deducted from package.`
            : ""
        }`
      );
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Add a new appointment to your schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Client Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client-name">
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+351 XXX XXX XXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email (Optional)</Label>
              <Input
                id="client-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>

          {/* Package Selection - Only show if client has subscriptions */}
          {clientId &&
            clientSubscriptions.length > 0 &&
            selectedServiceIds.length > 0 && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <Label htmlFor="use-package" className="cursor-pointer">
                      Use Package Session
                    </Label>
                  </div>
                  <Switch
                    id="use-package"
                    checked={usePackage}
                    onCheckedChange={(checked) => {
                      setUsePackage(checked);
                      if (!checked) {
                        setSelectedSubscription("");
                      }
                    }}
                  />
                </div>

                {usePackage && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="subscription">
                        Select Package Subscription{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedSubscription}
                        onValueChange={setSelectedSubscription}
                      >
                        <SelectTrigger id="subscription">
                          <SelectValue placeholder="Choose a subscription" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientSubscriptions
                            .filter((sub) => sub.status === "active")
                            .map((subscription) => {
                              const packageServices =
                                subscription.packageId.services;

                              // Check if ALL selected services are included
                              const allIncluded = selectedServiceIds.every(
                                (serviceId) =>
                                  packageServices.some(
                                    (s) => s.id === serviceId
                                  )
                              );

                              return (
                                <SelectItem
                                  key={subscription.id}
                                  value={subscription.id}
                                  disabled={
                                    !allIncluded ||
                                    subscription.sessionsRemaining === 0
                                  }
                                >
                                  <div className="flex flex-col items-start">
                                    <div className="flex items-center gap-2">
                                      <span>{subscription.packageId.name}</span>
                                      {allIncluded && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {subscription.sessionsRemaining}{" "}
                                          sessions left
                                        </Badge>
                                      )}
                                    </div>
                                    {!allIncluded && (
                                      <span className="text-xs text-muted-foreground">
                                        Some services not included
                                      </span>
                                    )}
                                    {allIncluded &&
                                      subscription.sessionsRemaining === 0 && (
                                        <span className="text-xs text-destructive">
                                          No sessions remaining
                                        </span>
                                      )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Info about package usage */}
                    {selectedSubscription && selectedSubscriptionData && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Package Session Info</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-1 text-sm">
                            <p>
                              <strong>Package:</strong>{" "}
                              {selectedSubscriptionData.packageId.name}
                            </p>
                            <p>
                              <strong>Sessions Available:</strong>{" "}
                              {selectedSubscriptionData.sessionsRemaining}
                            </p>
                            <p>
                              <strong>Sessions Required:</strong>{" "}
                              {requiredSessions}
                            </p>
                            {!hasEnoughSessions && (
                              <p className="text-destructive font-medium mt-2">
                                ⚠️ Not enough sessions available. Please reduce
                                booking slots or choose a different package.
                              </p>
                            )}
                            {hasEnoughSessions && (
                              <p className="text-green-600 font-medium mt-2">
                                ✓ Sufficient sessions available. No payment
                                required.
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Warning if services not in package */}
                    {selectedSubscription &&
                      selectedSubscriptionData &&
                      !allServicesInPackage && (
                        <Alert variant="destructive">
                          <AlertTitle>Services Not Included</AlertTitle>
                          <AlertDescription>
                            One or more selected services are not included in
                            this package. Please select a different package or
                            disable package usage.
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>
                )}

                {!usePackage && (
                  <p className="text-xs text-muted-foreground">
                    Toggle on to use a package session instead of paying per
                    service
                  </p>
                )}
              </div>
            )}

          {/* Date and Time Slots - Multiple if allowed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Booking Slots {allowMultiple && "(You can add multiple)"}
              </h3>
              {allowMultiple && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBookingSlot}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              )}
            </div>

            {bookingSlots.map((bookingSlot, index) => (
              <Card key={bookingSlot.id} className="p-4">
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Booking #{index + 1}
                    </Label>
                    {allowMultiple && bookingSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookingSlot(bookingSlot.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Service Selection for this slot */}
                  <div className="space-y-2">
                    <Label>
                      Service <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bookingSlot.serviceId}
                      onValueChange={(value) =>
                        updateBookingSlot(bookingSlot.id, "serviceId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col items-start">
                              <span>{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration} min
                                {service.price &&
                                  ` • €${service.price.toFixed(2)}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      min={today}
                      value={bookingSlot.date}
                      onChange={(e) =>
                        updateBookingSlot(
                          bookingSlot.id,
                          "date",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {bookingSlot.serviceId && bookingSlot.date && (
                    <TimeSlotPicker
                      entityId={entityId}
                      serviceId={bookingSlot.serviceId}
                      date={bookingSlot.date}
                      selectedSlot={bookingSlot.slot}
                      onSelectSlot={(slot) =>
                        updateBookingSlot(bookingSlot.id, "slot", slot)
                      }
                    />
                  )}

                  {bookingSlot.slot && (
                    <Badge variant="secondary" className="mt-2">
                      Selected:{" "}
                      {bookingSlot.slot.startDateTime
                        .split("T")[1]
                        .substring(0, 5)}{" "}
                      -{" "}
                      {bookingSlot.slot.endDateTime
                        .split("T")[1]
                        .substring(0, 5)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !clientName ||
              !clientPhone ||
              !bookingSlots.some((bs) => bs.serviceId && bs.date && bs.slot) ||
              (usePackage && !selectedSubscription) ||
              (usePackage && !hasEnoughSessions) ||
              (usePackage && !allServicesInPackage) ||
              submitting
            }
          >
            {submitting ? (
              "Creating..."
            ) : (
              <>
                {usePackage ? "Use Package Session" : "Create Booking"}
                {" • "}
                {
                  bookingSlots.filter(
                    (bs) => bs.serviceId && bs.date && bs.slot
                  ).length
                }{" "}
                slot
                {bookingSlots.filter((bs) => bs.serviceId && bs.date && bs.slot)
                  .length > 1
                  ? "s"
                  : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
