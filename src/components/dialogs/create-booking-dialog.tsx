import { useState, useEffect, useMemo } from "react";
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
import { X, Plus, Info, Package, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

interface Alert {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

interface AlertTitle {
  children: React.ReactNode;
}

interface AlertDescription {
  children: React.ReactNode;
}

const Alert = ({ children, variant }: Alert) => (
  <div
    className={`rounded-lg border p-4 ${
      variant === "destructive"
        ? "border-destructive bg-destructive/10"
        : "border-primary/20 bg-primary/5"
    }`}
  >
    {children}
  </div>
);

const AlertTitle = ({ children }: AlertTitle) => (
  <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>
);

const AlertDescription = ({ children }: AlertDescription) => (
  <div className="text-sm text-muted-foreground [&_p]:leading-relaxed">
    {children}
  </div>
);

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
  professionalIds?: string[];
  assignedProfessionals?: string[];
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
  professionalId?: string;
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

  // Booking mode: 'time' or 'professional'
  const [bookingMode, setBookingMode] = useState<"time" | "professional">(
    "time"
  );

  // Professionals list
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Multiple bookings state
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([
    { id: "1", serviceId: "", professionalId: undefined, date: "", slot: null },
  ]);

  // Load professionals when dialog opens
  useEffect(() => {
    if (open && entityId) {
      console.log(
        "[CreateBookingDialog] Loading professionals for entity:",
        entityId
      );
      const loadProfessionals = async () => {
        try {
          const response = await apiClient.get(`/api/users`, {
            role: "professional",
            entityId,
          });
          console.log(
            "[CreateBookingDialog] Professionals loaded:",
            response.data
          );
          setProfessionals(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error("Error loading professionals:", error);
          setProfessionals([]);
        }
      };
      loadProfessionals();
    }
  }, [open, entityId]);

  // Filter professionals by selected service
  // Only show professionals assigned to the selected service
  const availableProfessionalsForService = useMemo(() => {
    // Get current booking slot
    const currentSlot = bookingSlots[0];
    if (!currentSlot?.serviceId) {
      return professionals; // No service selected, show all
    }

    // Find selected service
    const selectedService = services.find(
      (s) => s.id === currentSlot.serviceId
    );
    if (!selectedService) {
      console.log(
        "[CreateBookingDialog] Service not found:",
        currentSlot.serviceId
      );
      return professionals;
    }

    // Check if service has assigned professionals
    const assignedProfessionalIds = selectedService.professionalIds || [];

    console.log("[CreateBookingDialog] Filtering professionals:", {
      service: selectedService.name,
      assignedProfessionalIds,
      assignedProfessionalIdsType: assignedProfessionalIds.map(
        (id: any) => typeof id
      ),
      allProfessionals: professionals.length,
      professionalsIds: professionals.map((p) => ({
        id: p.id || p._id,
        type: typeof (p.id || p._id),
      })),
    });

    // If no professionals assigned to service, show all (fallback)
    if (assignedProfessionalIds.length === 0) {
      console.log(
        "[CreateBookingDialog] No professionals assigned to service, showing all"
      );
      return professionals;
    }

    // Convert assigned IDs to strings for comparison (handles both ObjectId and string formats)
    const assignedIdsAsStrings = assignedProfessionalIds.map((id: any) =>
      String(id)
    );

    // Filter professionals by service assignment
    const filtered = professionals.filter((prof) => {
      const profId = String(prof.id || prof._id);
      return assignedIdsAsStrings.includes(profId);
    });

    console.log("[CreateBookingDialog] Filtered professionals:", {
      filtered: filtered.length,
      professionalNames: filtered.map((p) => `${p.firstName} ${p.lastName}`),
    });

    return filtered;
  }, [bookingSlots, services, professionals]);

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
      {
        id: newId,
        serviceId: "",
        professionalId: undefined,
        date: "",
        slot: null,
      },
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
    field: "serviceId" | "professionalId" | "date" | "slot",
    value: string | TimeSlot | null | undefined
  ) => {
    setBookingSlots(
      bookingSlots.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              [field]: value,
              // Reset slot when service, professional, or date changes
              ...(field === "serviceId" ||
              field === "professionalId" ||
              field === "date"
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
    setBookingMode("time");
    setBookingSlots([
      {
        id: "1",
        serviceId: "",
        professionalId: undefined,
        date: "",
        slot: null,
      },
    ]);
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

    // Validate professional selection when in professional mode
    if (bookingMode === "professional") {
      const missingProfessional = bookingSlots.filter(
        (bs) => bs.serviceId && !bs.professionalId
      );
      if (missingProfessional.length > 0) {
        toast.error("Please select a professional for all booking slots");
        return;
      }
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

                  {/* Booking Mode Selection - ALWAYS show when service is selected */}
                  {bookingSlot.serviceId && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Booking Preference
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Card
                          className={`cursor-pointer transition-all ${
                            bookingMode === "time"
                              ? "ring-2 ring-primary shadow-sm"
                              : "hover:shadow-sm"
                          }`}
                          onClick={() => {
                            setBookingMode("time");
                            updateBookingSlot(
                              bookingSlot.id,
                              "professionalId",
                              undefined
                            );
                          }}
                        >
                          <CardContent className="p-4 text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <h4 className="text-sm font-medium">By Time</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Any professional
                            </p>
                          </CardContent>
                        </Card>
                        <Card
                          className={`cursor-pointer transition-all ${
                            bookingMode === "professional"
                              ? "ring-2 ring-primary shadow-sm"
                              : "hover:shadow-sm"
                          }`}
                          onClick={() => setBookingMode("professional")}
                        >
                          <CardContent className="p-4 text-center">
                            <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <h4 className="text-sm font-medium">
                              By Professional
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Choose professional
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Professional Selection - Only show if mode is 'professional' */}
                  {bookingSlot.serviceId &&
                    bookingMode === "professional" &&
                    availableProfessionalsForService.length > 0 && (
                      <div className="space-y-2">
                        <Label>
                          Select Professional{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={bookingSlot.professionalId || ""}
                          onValueChange={(value) =>
                            updateBookingSlot(
                              bookingSlot.id,
                              "professionalId",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a professional" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProfessionalsForService.map(
                              (professional) => (
                                <SelectItem
                                  key={professional.id || professional._id}
                                  value={professional.id || professional._id}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {professional.firstName}{" "}
                                      {professional.lastName}
                                    </span>
                                    {professional.rating && (
                                      <span className="text-xs text-muted-foreground">
                                        ⭐ {professional.rating}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Warning when "By Professional" selected but no professionals available */}
                  {bookingSlot.serviceId &&
                    bookingMode === "professional" &&
                    availableProfessionalsForService.length === 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-800">
                          ⚠️ No professionals available for this service. Please
                          use "By Time" mode.
                        </p>
                      </div>
                    )}

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
                      professionalId={
                        bookingMode === "professional" &&
                        bookingSlot.professionalId
                          ? bookingSlot.professionalId
                          : undefined
                      }
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
              (bookingMode === "professional" &&
                bookingSlots.some(
                  (bs) => bs.serviceId && !bs.professionalId
                )) ||
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
