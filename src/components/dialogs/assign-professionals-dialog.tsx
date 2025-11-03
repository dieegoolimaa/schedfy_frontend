import { useState, useEffect } from "react";
import { UserCheck, Loader2, Users as UsersIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { servicesService } from '../../services/services.service';
import {
  professionalsService,
  type Professional,
} from "../../services/professionals.service";

interface AssignProfessionalsDialogProps {
  serviceId: string;
  serviceName: string;
  entityId: string;
  assignedProfessionalIds?: string[];
  onAssigned?: () => void;
}

export function AssignProfessionalsDialog({
  serviceId,
  serviceName,
  entityId,
  assignedProfessionalIds = [],
  onAssigned,
}: AssignProfessionalsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignedProfessionalIds
  );

  useEffect(() => {
    if (open) {
      loadProfessionals();
      setSelectedIds(assignedProfessionalIds);
    }
  }, [open, assignedProfessionalIds]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const response = await professionalsService.getByEntity(entityId);
      setProfessionals(response.data || []);
    } catch (error) {
      console.error("Failed to load professionals:", error);
      toast.error("Failed to load professionals");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProfessional = (professionalId: string) => {
    setSelectedIds((prev) =>
      prev.includes(professionalId)
        ? prev.filter((id) => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Determine which professionals to assign and unassign
      const toAssign = selectedIds.filter(
        (id) => !assignedProfessionalIds.includes(id)
      );
      const toUnassign = assignedProfessionalIds.filter(
        (id) => !selectedIds.includes(id)
      );

      // Assign new professionals
      for (const professionalId of toAssign) {
        await servicesService.assignProfessional(serviceId, professionalId);
      }

      // Unassign removed professionals
      for (const professionalId of toUnassign) {
        await servicesService.unassignProfessional(serviceId, professionalId);
      }

      toast.success(
        `Successfully updated professional assignments for ${serviceName}`
      );
      setOpen(false);

      if (onAssigned) {
        onAssigned();
      }
    } catch (error: any) {
      console.error("Failed to update assignments:", error);
      toast.error(
        error?.message || "Failed to update professional assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Assign Professionals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Assign Professionals to Service
          </DialogTitle>
          <DialogDescription>
            Select which professionals can provide{" "}
            <strong>{serviceName}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading && professionals.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No professionals found</p>
            <p className="text-xs mt-1">
              Add team members to assign them to services
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <div className="space-y-3">
              {professionals.map((professional) => {
                const isSelected = selectedIds.includes(professional.id);
                return (
                  <div
                    key={professional.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={`prof-${professional.id}`}
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleToggleProfessional(professional.id)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`prof-${professional.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {professional.firstName} {professional.lastName}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {professional.email}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {professional.role}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} of {professionals.length} selected
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || professionals.length === 0}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
