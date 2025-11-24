import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Textarea } from "../ui/textarea";
import { apiClient } from "../../lib/api-client";

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  professionalName: string;
  professionalId?: string; // Added to track professional ID
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
  notes?: string;
}

interface Professional {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

interface EditBookingDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  professionals?: Professional[]; // Added professionals list
  entityId?: string; // Added to fetch professionals if not provided
}

export function EditBookingDialog({
  booking,
  isOpen,
  onClose,
  onSave,
  professionals = [],
  entityId,
}: Readonly<EditBookingDialogProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Booking | null>(booking);
  const [professionalsList, setProfessionalsList] =
    useState<Professional[]>(professionals);

  // Fetch professionals if entityId is provided and professionals not passed
  useEffect(() => {
    console.log(
      "[EditBookingDialog] useEffect triggered - professionals:",
      professionals?.length,
      "entityId:",
      entityId,
      "isOpen:",
      isOpen
    );

    // If professionals are passed, use them
    if (professionals && professionals.length > 0) {
      console.log(
        "[EditBookingDialog] Using provided professionals:",
        professionals.length,
        "items",
        professionals
      );
      setProfessionalsList(professionals);
    }
    // Otherwise, fetch them if entityId is available
    else if (entityId && isOpen) {
      console.log(
        "[EditBookingDialog] Fetching professionals for entityId:",
        entityId
      );
      // Correct endpoint: /api/users with role=professional
      apiClient
        .get("/api/users", {
          entityId,
          role: "professional",
        })
        .then((res: any) => {
          console.log("[EditBookingDialog] Full API Response:", res);
          console.log("[EditBookingDialog] Response data:", res?.data);
          const data = Array.isArray(res?.data) ? res.data : [];
          console.log(
            "[EditBookingDialog] Fetched professionals count:",
            data.length,
            "Data:",
            data
          );
          setProfessionalsList(data);
        })
        .catch((err) => {
          console.error(
            "[EditBookingDialog] Failed to fetch professionals:",
            err
          );
          setProfessionalsList([]);
        });
    } else {
      console.log(
        "[EditBookingDialog] No professionals to load - professionals:",
        professionals?.length,
        "entityId:",
        entityId,
        "isOpen:",
        isOpen
      );
    }
  }, [entityId, isOpen, professionals]);

  // Update formData when booking prop changes
  useEffect(() => {
    setFormData(booking);
  }, [booking, isOpen]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const updateField = (field: keyof Booking, value: string | number) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  if (!formData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[120]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("entity.bookings.editBooking", "Edit Booking")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "entity.bookings.editBookingDesc",
              "Update booking details and status"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => updateField("clientEmail", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceName">Service</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName || "N/A"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="professionalName">Professional</Label>
                {Array.isArray(professionalsList) &&
                  professionalsList.length > 0 ? (
                  <Select
                    value={formData.professionalId || ""}
                    onValueChange={(value) => {
                      // Find the selected professional
                      const selected = professionalsList.find(
                        (p) => p.id === value
                      );
                      if (selected) {
                        const fullName =
                          `${selected.firstName} ${selected.lastName}`.trim();
                        updateField("professionalName", fullName);
                        setFormData({
                          ...formData,
                          professionalId: selected.id,
                          professionalName: fullName,
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select professional">
                        {formData.professionalName || "Select professional"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {professionalsList.map((prof) => {
                        const fullName =
                          `${prof.firstName} ${prof.lastName}`.trim();
                        return (
                          <SelectItem key={prof.id} value={prof.id}>
                            {fullName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="professionalName"
                    value={formData.professionalName || "N/A"}
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateField("time", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    updateField("duration", Number.parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  updateField("price", Number.parseFloat(e.target.value))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Additional notes about the booking..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSave}>
            {t("common.save", "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
