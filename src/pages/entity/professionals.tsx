import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";
import {
  professionalsApi,
  Professional,
} from "../../lib/api/professionals.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Search, Edit, Trash2, Mail, Phone, Users } from "lucide-react";

export function ProfessionalsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // For Simple and Individual plans, user might be the entity itself
  // For Business plan, user has entityId pointing to the business
  const entityId = user?.entityId || (user?.role === "owner" && user?.id) || "";

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const fetchProfessionals = async () => {
    if (!entityId) {
      toast.error(
        "Entity ID not found. Please ensure you're logged in properly."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[Professionals] Fetching with entityId:", entityId);
      const response = await professionalsApi.getProfessionals({ entityId });
      console.log("[Professionals] API Response:", response);
      const professionalsData = Array.isArray(response.data)
        ? response.data
        : [];
      console.log(
        "[Professionals] Filtered professionals:",
        professionalsData.length
      );
      setProfessionals(professionalsData);
    } catch (error) {
      console.error("Failed to load professionals:", error);
      toast.error("Failed to load professionals for this entity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [entityId]);

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      if (editingProfessional) {
        await professionalsApi.updateProfessional(editingProfessional.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        });
        toast.success("Professional updated");
      } else {
        await professionalsApi.createProfessional({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          entityId,
        });
        toast.success("Professional created");
      }
      setIsDialogOpen(false);
      setEditingProfessional(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "" });
      fetchProfessionals();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save professional"
      );
    }
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      firstName: professional.firstName,
      lastName: professional.lastName,
      email: professional.email || "",
      phone: professional.phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm("Delete this professional?")) return;
    try {
      await professionalsApi.deleteProfessional(professionalId);
      toast.success("Professional deleted");
      fetchProfessionals();
    } catch (error) {
      toast.error("Failed to delete professional");
    }
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${prof.firstName} ${prof.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (prof.email && prof.email.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("professionals.title", "Professionals")}
          </h1>
          <p className="text-muted-foreground">
            Manage professionals and attendants
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProfessional(null);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Professional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProfessional
                  ? "Edit Professional"
                  : "Add New Professional"}
              </DialogTitle>
              <DialogDescription>
                {editingProfessional
                  ? "Update professional information"
                  : "Create new professional account"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+351 123 456 789"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingProfessional
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Total"
          value={professionals.length}
          subtitle="Team members"
          color="blue"
        />
        <MobileStatsCard
          title="Active"
          value={professionals.filter((p) => p.status === "active").length}
          subtitle="Working"
          color="green"
        />
        <MobileStatsCard
          title="Inactive"
          value={professionals.filter((p) => p.status !== "active").length}
          subtitle="Not available"
          color="red"
        />
      </ResponsiveCardGrid>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your professionals and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">
                No professionals found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Add your first professional to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professional</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfessionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={professional.avatar} />
                          <AvatarFallback>
                            {getInitials(
                              professional.firstName,
                              professional.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {`${professional.firstName} ${professional.lastName}` ||
                              "Unnamed Professional"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Since{" "}
                            {professional.createdAt
                              ? new Date(
                                  professional.createdAt
                                ).toLocaleDateString()
                              : "Unknown"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {professional.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {professional.email}
                          </div>
                        )}
                        {professional.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {professional.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {professional.role || "professional"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(professional.status || "inactive")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(professional)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(professional.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
