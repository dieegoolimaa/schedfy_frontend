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
import { Loader2, User } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import { useAuth } from "../../contexts/auth-context";
import type { CreateClientDto } from "../../types/models/clients.interface";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
}

export function AddClientDialog({
  open,
  onOpenChange,
  onClientAdded,
}: AddClientDialogProps) {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const entityId = user?.entityId || "";

  const { createClient } = useClients({ entityId });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const clientData: CreateClientDto = {
        entityId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        createdBy: user?.id || entityId,
      };

      await createClient(clientData);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
      });

      // Close dialog
      onOpenChange(false);

      // Notify parent
      onClientAdded?.();
    } catch (error) {
      // Error is already handled by useClients hook with toast
      console.error("Failed to create client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("addClientDialog.title", "Add New Client")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "addClientDialog.description",
              "Add a new client to your client list. Fill in their basic information below."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t("addClientDialog.firstName", "First Name")} *
              </Label>
              <Input
                id="firstName"
                placeholder={t("addClientDialog.firstNamePlaceholder", "John")}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t("addClientDialog.lastName", "Last Name")} *
              </Label>
              <Input
                id="lastName"
                placeholder={t("addClientDialog.lastNamePlaceholder", "Doe")}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("addClientDialog.email", "Email")} *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t(
                  "addClientDialog.emailPlaceholder",
                  "john@example.com"
                )}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {t("addClientDialog.phone", "Phone")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t(
                  "addClientDialog.phonePlaceholder",
                  "+1 (555) 123-4567"
                )}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("addClientDialog.notes", "Notes (Optional)")}
              </Label>
              <Input
                id="notes"
                placeholder={t(
                  "addClientDialog.notesPlaceholder",
                  "Additional information..."
                )}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("addClientDialog.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("addClientDialog.creating", "Creating...")}
                </>
              ) : (
                t("addClientDialog.create", "Add Client")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
