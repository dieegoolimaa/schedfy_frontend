import { useState } from "react";
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  country: string;
  timezone: string;
  locale: string;
  createdAt: string;
  lastLogin?: string;
}

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function EditUserDialog({
  user,
  isOpen,
  onClose,
  onSave,
}: Readonly<EditUserDialogProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<User | null>(user);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const updateField = (field: keyof User, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("admin.users.editUser", "Edit User")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "admin.users.editUserDesc",
              "Update user information and settings"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => updateField("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform_admin">
                      Platform Admin
                    </SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Business Owner</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regional Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateField("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORTUGAL">Portugal</SelectItem>
                    <SelectItem value="BRAZIL">Brazil</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="locale">Language</Label>
                <Select
                  value={formData.locale}
                  onValueChange={(value) => updateField("locale", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => updateField("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
                  <SelectItem value="America/Sao_Paulo">
                    America/Sao_Paulo
                  </SelectItem>
                  <SelectItem value="America/New_York">
                    America/New_York
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    America/Los_Angeles
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(formData.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="text-sm text-muted-foreground">
                  {formData.lastLogin
                    ? new Date(formData.lastLogin).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>
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

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  status: string;
  professionalId?: string;
}

interface EditServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
}

export function EditServiceDialog({
  service,
  isOpen,
  onClose,
  onSave,
}: Readonly<EditServiceDialogProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Service | null>(service);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const updateField = (field: keyof Service, value: string | number) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t("entity.services.editService", "Edit Service")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "entity.services.editServiceDesc",
              "Update service details and pricing"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  updateField("duration", Number.parseInt(e.target.value))
                }
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">Haircut</SelectItem>
                  <SelectItem value="color">Hair Color</SelectItem>
                  <SelectItem value="treatment">Hair Treatment</SelectItem>
                  <SelectItem value="styling">Hair Styling</SelectItem>
                  <SelectItem value="massage">Massage</SelectItem>
                  <SelectItem value="facial">Facial</SelectItem>
                  <SelectItem value="manicure">Manicure</SelectItem>
                  <SelectItem value="pedicure">Pedicure</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
  notes?: string;
}

interface EditBookingDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

export function EditBookingDialog({
  booking,
  isOpen,
  onClose,
  onSave,
}: Readonly<EditBookingDialogProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Booking | null>(booking);

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

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
                <Select
                  value={formData.serviceName}
                  onValueChange={(value) => updateField("serviceName", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haircut">Haircut</SelectItem>
                    <SelectItem value="Hair Color">Hair Color</SelectItem>
                    <SelectItem value="Massage">Massage</SelectItem>
                    <SelectItem value="Facial">Facial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="professionalName">Professional</Label>
                <Select
                  value={formData.professionalName}
                  onValueChange={(value) =>
                    updateField("professionalName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="João Santos">João Santos</SelectItem>
                    <SelectItem value="Maria Silva">Maria Silva</SelectItem>
                    <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                  </SelectContent>
                </Select>
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
