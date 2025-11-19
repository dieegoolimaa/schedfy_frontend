import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../contexts/auth-context";
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
import { Info, Package, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";

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

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  services: Service[];
  onSubmit: (bookingData: any) => Promise<void>;
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
  clientId,
  packages: _packages = [],
  clientSubscriptions = [],
}: CreateBookingDialogProps) {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usePackage, setUsePackage] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string>("");

  // Single booking fields (replaces bookingSlots array)
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState<string | undefined>(
    undefined
  );
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingMode, setBookingMode] = useState<"time" | "professional">(
    "time"
  );

  // Recurring booking state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>(
    []
  );
  const [recurrenceEndType, setRecurrenceEndType] = useState<
    "date" | "occurrences"
  >("occurrences");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(10);

  // Professionals list
  const [professionals, setProfessionals] = useState<any[]>([]);

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
    if (!serviceId) {
      return professionals; // No service selected, show all
    }

    // Find selected service
    const selectedService = services.find((s) => s.id === serviceId);
    if (!selectedService) {
      console.log("[CreateBookingDialog] Service not found:", serviceId);
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
  }, [serviceId, services, professionals]);

  // Get selected subscription details
  const selectedSubscriptionData = clientSubscriptions.find(
    (sub) => sub.id === selectedSubscription
  );

  // Check if selected service is included in the package
  const serviceInPackage =
    usePackage && selectedSubscriptionData && serviceId
      ? selectedSubscriptionData.packageId.services.some(
          (s) => s.id === serviceId
        )
      : true;

  // Calculate required sessions (always 1 for single booking)
  const requiredSessions = serviceId && date && selectedSlot ? 1 : 0;
  const hasEnoughSessions = selectedSubscriptionData
    ? selectedSubscriptionData.sessionsRemaining >= requiredSessions
    : false;

  const resetForm = () => {
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
    setServiceId("");
    setProfessionalId(undefined);
    setDate("");
    setSelectedSlot(null);
    setBookingMode("time");
    setUsePackage(false);
    setSelectedSubscription("");
    setIsRecurring(false);
    setRecurrenceFrequency("weekly");
    setRecurrenceInterval(1);
    setRecurrenceDaysOfWeek([]);
    setRecurrenceEndType("occurrences");
    setRecurrenceEndDate("");
    setRecurrenceOccurrences(10);
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurrenceDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!clientName || !clientPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate booking has service, date and slot
    if (!serviceId || !date || !selectedSlot) {
      toast.error("Please select service, date and time");
      return;
    }

    // Validate professional selection when in professional mode
    if (bookingMode === "professional" && !professionalId) {
      toast.error("Please select a professional");
      return;
    }

    // Validate package usage
    if (usePackage) {
      if (!selectedSubscription) {
        toast.error("Please select a package subscription");
        return;
      }
      if (!serviceInPackage) {
        toast.error("Selected service is not included in this package");
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
      // Check if recurring booking is enabled
      if (isRecurring) {
        // Validate recurrence settings
        if (
          recurrenceFrequency === "weekly" &&
          recurrenceDaysOfWeek.length === 0
        ) {
          toast.error(
            "Please select at least one day of the week for weekly recurrence"
          );
          setSubmitting(false);
          return;
        }

        if (recurrenceEndType === "date" && !recurrenceEndDate) {
          toast.error("Please select an end date for recurrence");
          setSubmitting(false);
          return;
        }

        // Validar serviço selecionado
        const selectedService = services.find((s) => s.id === serviceId);
        if (!selectedService) {
          toast.error("Service not found");
          setSubmitting(false);
          return;
        }

        // Validar user ID
        const userId = user?.id || (user as any)?._id || entityId;
        if (!userId) {
          toast.error("User ID not available");
          setSubmitting(false);
          return;
        }

        // Create recurring booking via API
        const recurringBookingData = {
          booking: {
            entityId: entityId,
            serviceId: serviceId,
            professionalId: selectedSlot.professionalId,
            clientInfo: {
              name: clientName,
              email: clientEmail,
              phone: clientPhone,
              notes: notes,
            },
            startDateTime: selectedSlot.startDateTime,
            endDateTime: selectedSlot.endDateTime,
            pricing: {
              basePrice: selectedService.price || 0,
              totalPrice: selectedService.price || 0,
              currency: "EUR",
            },
            createdBy: userId,
          },
          recurrence: {
            frequency: recurrenceFrequency,
            interval: recurrenceInterval,
            ...(recurrenceFrequency === "weekly" && {
              daysOfWeek: recurrenceDaysOfWeek,
            }),
            endType: recurrenceEndType,
            ...(recurrenceEndType === "date" && { endDate: recurrenceEndDate }),
            ...(recurrenceEndType === "occurrences" && {
              occurrences: recurrenceOccurrences,
            }),
          },
          userId: userId,
        };

        // Log recurring booking data para debug
        console.log("[CreateBookingDialog] Recurring booking data:", {
          booking: recurringBookingData.booking,
          recurrence: recurringBookingData.recurrence,
          userId: recurringBookingData.userId,
          serviceFound: !!selectedService,
          userContext: {
            userId: user?.id,
            userObjectId: (user as any)?._id,
            entityId,
          },
        });

        // Call recurring booking endpoint
        const response = await apiClient.post(
          "/api/bookings/recurring",
          recurringBookingData
        );

        const { totalCreated, errors } = response.data as any;

        if (errors && errors.length > 0) {
          toast.warning(
            `Created ${totalCreated} bookings with ${errors.length} conflicts`
          );
        } else {
          toast.success(
            `Created ${totalCreated} recurring bookings successfully!`
          );
        }
      } else {
        // Regular booking creation (non-recurring)
        await onSubmit({
          clientName,
          clientPhone,
          clientEmail,
          serviceId: serviceId,
          professionalId: selectedSlot.professionalId,
          startDateTime: selectedSlot.startDateTime,
          endDateTime: selectedSlot.endDateTime,
          notes,
          // Package-related fields
          ...(usePackage &&
            selectedSubscription && {
              isPackageBooking: true,
              packageSubscriptionId: selectedSubscription,
            }),
        });

        toast.success(
          `Booking created successfully!${
            usePackage ? ` 1 session deducted from package.` : ""
          }`
        );
      }

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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {clientId && clientSubscriptions.length > 0 && serviceId && (
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

                            // Check if selected service is included
                            const allIncluded = serviceId
                              ? packageServices.some((s) => s.id === serviceId)
                              : false;

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

                  {/* Warning if service not in package */}
                  {selectedSubscription &&
                    selectedSubscriptionData &&
                    !serviceInPackage && (
                      <Alert variant="destructive">
                        <AlertTitle>Service Not Included</AlertTitle>
                        <AlertDescription>
                          Selected service is not included in this package.
                          Please select a different package or disable package
                          usage.
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

          {/* Service, Date and Time */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Service & Time</h3>

            {isRecurring && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Recurring booking will create multiple bookings based on your
                  selected frequency and schedule
                </AlertDescription>
              </Alert>
            )}

            <Card className="p-4">
              <CardContent className="p-0 space-y-3">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label>
                    Service <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={serviceId}
                    onValueChange={(value) => {
                      setServiceId(value);
                      setSelectedSlot(null); // Reset slot when service changes
                    }}
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
                                ` • ${formatCurrency(service.price)}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booking Mode Selection - show when service is selected */}
                {serviceId && (
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
                          setProfessionalId(undefined);
                          setSelectedSlot(null);
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
                        onClick={() => {
                          setBookingMode("professional");
                          setProfessionalId(undefined);
                          setSelectedSlot(null);
                        }}
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
                {serviceId &&
                  bookingMode === "professional" &&
                  availableProfessionalsForService.length > 0 && (
                    <div className="space-y-2">
                      <Label>
                        Select Professional{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={professionalId || ""}
                        onValueChange={(value) => {
                          setProfessionalId(value);
                          setSelectedSlot(null);
                        }}
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
                {serviceId &&
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
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                  />
                </div>

                {serviceId && date && (
                  <TimeSlotPicker
                    entityId={entityId}
                    serviceId={serviceId}
                    date={date}
                    professionalId={
                      bookingMode === "professional" && professionalId
                        ? professionalId
                        : undefined
                    }
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
                    includeOverbooking={true}
                  />
                )}

                {selectedSlot && (
                  <Badge variant="secondary" className="mt-2">
                    Selected:{" "}
                    {selectedSlot.startDateTime.split("T")[1].substring(0, 5)} -{" "}
                    {selectedSlot.endDateTime.split("T")[1].substring(0, 5)}
                  </Badge>
                )}
              </CardContent>
            </Card>
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

          {/* Recurring Booking Section */}
          {!usePackage && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <Label
                      htmlFor="recurring"
                      className="text-base font-semibold"
                    >
                      Recurring Booking
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Create multiple bookings automatically
                    </p>
                  </div>
                </div>
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label>Repeat</Label>
                      <Select
                        value={recurrenceFrequency}
                        onValueChange={(
                          value: "daily" | "weekly" | "monthly"
                        ) => setRecurrenceFrequency(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interval */}
                    <div className="space-y-2">
                      <Label>Every</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={recurrenceInterval}
                          onChange={(e) =>
                            setRecurrenceInterval(Number(e.target.value))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {recurrenceFrequency === "daily" &&
                            `day${recurrenceInterval > 1 ? "s" : ""}`}
                          {recurrenceFrequency === "weekly" &&
                            `week${recurrenceInterval > 1 ? "s" : ""}`}
                          {recurrenceFrequency === "monthly" &&
                            `month${recurrenceInterval > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Days of Week (for weekly) */}
                  {recurrenceFrequency === "weekly" && (
                    <div className="space-y-2">
                      <Label>Repeat on</Label>
                      <div className="flex gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={
                                recurrenceDaysOfWeek.includes(index)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="w-12 h-12"
                              onClick={() => toggleDayOfWeek(index)}
                            >
                              {day}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* End Options */}
                  <div className="space-y-3">
                    <Label>Ends</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="end-occurrences"
                          checked={recurrenceEndType === "occurrences"}
                          onChange={() => setRecurrenceEndType("occurrences")}
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="end-occurrences"
                          className="cursor-pointer flex items-center gap-2"
                        >
                          After
                          <Input
                            type="number"
                            min="2"
                            max="100"
                            value={recurrenceOccurrences}
                            onChange={(e) =>
                              setRecurrenceOccurrences(Number(e.target.value))
                            }
                            disabled={recurrenceEndType !== "occurrences"}
                            className="w-20 h-8"
                          />
                          occurrences
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="end-date"
                          checked={recurrenceEndType === "date"}
                          onChange={() => setRecurrenceEndType("date")}
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="end-date"
                          className="cursor-pointer flex items-center gap-2"
                        >
                          On date
                          <Input
                            type="date"
                            value={recurrenceEndDate}
                            onChange={(e) =>
                              setRecurrenceEndDate(e.target.value)
                            }
                            disabled={recurrenceEndType !== "date"}
                            min={today}
                            className="w-40 h-8"
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Preview</AlertTitle>
                    <AlertDescription>
                      {recurrenceFrequency === "daily" &&
                        `Repeats every ${recurrenceInterval} day${
                          recurrenceInterval > 1 ? "s" : ""
                        }`}
                      {recurrenceFrequency === "weekly" &&
                        `Repeats every ${recurrenceInterval} week${
                          recurrenceInterval > 1 ? "s" : ""
                        }${
                          recurrenceDaysOfWeek.length > 0
                            ? ` on ${recurrenceDaysOfWeek
                                .map(
                                  (d) =>
                                    [
                                      "Sun",
                                      "Mon",
                                      "Tue",
                                      "Wed",
                                      "Thu",
                                      "Fri",
                                      "Sat",
                                    ][d]
                                )
                                .join(", ")}`
                            : ""
                        }`}
                      {recurrenceFrequency === "monthly" &&
                        `Repeats every ${recurrenceInterval} month${
                          recurrenceInterval > 1 ? "s" : ""
                        }`}
                      {recurrenceEndType === "occurrences" &&
                        `, ${recurrenceOccurrences} times`}
                      {recurrenceEndType === "date" &&
                        recurrenceEndDate &&
                        `, until ${new Date(
                          recurrenceEndDate
                        ).toLocaleDateString()}`}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
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
              !serviceId ||
              !date ||
              !selectedSlot ||
              (bookingMode === "professional" && !professionalId) ||
              (usePackage && !selectedSubscription) ||
              (usePackage && !hasEnoughSessions) ||
              (usePackage && !serviceInPackage) ||
              submitting
            }
          >
            {submitting ? (
              "Creating..."
            ) : (
              <>{usePackage ? "Use Package Session" : "Create Booking"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
