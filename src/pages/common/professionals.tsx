import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  professionalsService,
  Professional,
} from "../../services/professionals.service";
import { usePromotions } from "../../hooks/usePromotions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { StatsGrid } from "../../components/ui/stats-grid";
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
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Users,
  Send,
  TrendingUp,
  X,
  Briefcase,
  Award,
  DollarSign,
} from "lucide-react";

export function ProfessionalsPage() {
  const { t } = useTranslation("professionals");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getActiveCommissions } = usePromotions();
  const [activeCommissions, setActiveCommissions] = useState<any[]>([]); // Using any[] temporarily to avoid type issues, ideally import Commission type

  // For Simple and Individual plans, user might be the entity itself
  // For Business plan, user has entityId pointing to the business
  const entityId = user?.entityId || (user?.role === "owner" && user?.id) || "";

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);

  // Temporary inputs for adding items to arrays
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobFunction: "",
    bio: "",
    experience: "",
    specialties: [] as string[],
    certifications: [] as string[],
    instagram: "",
    linkedin: "",
    website: "",
    commissionEnabled: false,
    commissionPercentage: "",
    commissionFixedAmount: "",
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
      const response = await professionalsService.getProfessionals({
        entityId,
      });
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

  useEffect(() => {
    if (isDialogOpen && entityId) {
      const loadCommissions = async () => {
        const data = await getActiveCommissions(entityId);
        setActiveCommissions(data);
      };
      loadCommissions();
    }
  }, [isDialogOpen, entityId]);

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please fill required fields");
      return;
    }

    if (!editingProfessional && !formData.email) {
      toast.error("Email is required for new professionals");
      return;
    }

    try {
      const professionalData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      // Add professional info if provided
      if (
        formData.jobFunction ||
        formData.bio ||
        formData.experience ||
        formData.specialties.length > 0 ||
        formData.certifications.length > 0 ||
        formData.instagram ||
        formData.linkedin ||
        formData.website
      ) {
        professionalData.professionalInfo = {
          jobFunction: formData.jobFunction || undefined,
          bio: formData.bio || undefined,
          experience: formData.experience
            ? parseInt(formData.experience)
            : undefined,
          specialties: formData.specialties.filter((s) => s.trim()),
          certifications: formData.certifications.filter((c) => c.trim()),
          socialMedia: {
            instagram: formData.instagram || undefined,
            linkedin: formData.linkedin || undefined,
            website: formData.website || undefined,
          },
        };
      }

      // Add commission if enabled
      if (formData.commissionEnabled) {
        professionalData.commission = {
          enabled: true,
          percentage: formData.commissionPercentage
            ? parseFloat(formData.commissionPercentage)
            : undefined,
          fixedAmount: formData.commissionFixedAmount
            ? parseFloat(formData.commissionFixedAmount)
            : undefined,
        };
      }

      if (editingProfessional) {
        await professionalsService.updateProfessional(
          editingProfessional.id,
          professionalData
        );
        toast.success("Professional updated");
      } else {
        professionalData.entityId = entityId;
        // Create professional via invitation system
        const response = await professionalsService.createProfessional(
          professionalData
        );

        // Show success message about email sent
        const professional = response.data;
        toast.success(
          <div className="space-y-1">
            <p className="font-semibold">Professional invitation sent!</p>
            <p className="text-xs">
              An email has been sent to {formData.email}
            </p>
            <p className="text-xs text-muted-foreground">
              They will receive a link to complete their registration
            </p>
          </div>,
          { duration: 8000 }
        );

        // Also show the invitation link for manual sharing if needed
        if (professional.invitationToken) {
          const invitationLink = `${window.location.origin}/accept-invitation?token=${professional.invitationToken}`;

          setTimeout(() => {
            toast.info(
              <div className="space-y-1">
                <p className="font-semibold">
                  Invitation link (if email fails)
                </p>
                <p className="text-xs break-all">{invitationLink}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(invitationLink);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </Button>
              </div>,
              { duration: 15000 }
            );
          }, 1000);
        }
      }
      setIsDialogOpen(false);
      setEditingProfessional(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobFunction: "",
        bio: "",
        experience: "",
        specialties: [],
        certifications: [],
        instagram: "",
        linkedin: "",
        website: "",
        commissionEnabled: false,
        commissionPercentage: "",
        commissionFixedAmount: "",
      });
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
      jobFunction: (professional as any).professionalInfo?.jobFunction || "",
      bio: (professional as any).professionalInfo?.bio || "",
      experience: (professional as any).professionalInfo?.experience
        ? String((professional as any).professionalInfo.experience)
        : "",
      specialties: (professional as any).professionalInfo?.specialties || [],
      certifications:
        (professional as any).professionalInfo?.certifications || [],
      instagram:
        (professional as any).professionalInfo?.socialMedia?.instagram || "",
      linkedin:
        (professional as any).professionalInfo?.socialMedia?.linkedin || "",
      website:
        (professional as any).professionalInfo?.socialMedia?.website || "",
      commissionEnabled: (professional as any).commission?.enabled || false,
      commissionPercentage: (professional as any).commission?.percentage
        ? String((professional as any).commission.percentage)
        : "",
      commissionFixedAmount: (professional as any).commission?.fixedAmount
        ? String((professional as any).commission.fixedAmount)
        : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm("Delete this professional?")) return;
    try {
      await professionalsService.deleteProfessional(professionalId);
      toast.success("Professional deleted");
      fetchProfessionals();
    } catch (error) {
      toast.error("Failed to delete professional");
    }
  };

  const handleResendInvitation = async (
    professionalId: string,
    email: string
  ) => {
    try {
      const response = await professionalsService.resendInvitation(
        professionalId
      );

      const invitationToken = response.data?.invitationToken;

      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Invitation resent!</p>
          <p className="text-xs">Email sent to {email}</p>
        </div>,
        { duration: 5000 }
      );

      // Also show the link for manual sharing
      if (invitationToken) {
        const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationToken}`;

        setTimeout(() => {
          toast.info(
            <div className="space-y-1">
              <p className="font-semibold">Invitation link</p>
              <p className="text-xs break-all">{invitationLink}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(invitationLink);
                  toast.success("Link copied!");
                }}
              >
                Copy Link
              </Button>
            </div>,
            { duration: 10000 }
          );
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to resend invitation");
    }
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${prof.firstName} ${prof.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      prof.email?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProfessional(null);
              setNewSpecialty("");
              setNewCertification("");
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                jobFunction: "",
                bio: "",
                experience: "",
                specialties: [],
                certifications: [],
                instagram: "",
                linkedin: "",
                website: "",
                commissionEnabled: false,
                commissionPercentage: "",
                commissionFixedAmount: "",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("addProfessional")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfessional
                  ? t("dialog.editTitle")
                  : t("dialog.addTitle")}
              </DialogTitle>
              <DialogDescription>
                {editingProfessional
                  ? t("dialog.editDescription")
                  : t("dialog.addDescription")}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t("tabs.basic")}</TabsTrigger>
                <TabsTrigger value="professional">{t("tabs.professional")}</TabsTrigger>
                <TabsTrigger value="social">{t("tabs.social")}</TabsTrigger>
                <TabsTrigger value="commission">{t("tabs.commission")}</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("form.firstName")} *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder={t("form.firstNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("form.lastName")} *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder={t("form.lastNamePlaceholder")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("form.email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t("form.emailPlaceholder")}
                    disabled={!!editingProfessional}
                  />
                  {!editingProfessional && (
                    <p className="text-xs text-muted-foreground">
                      {t("form.invitationNote")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("form.phone")}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={t("form.phonePlaceholder")}
                  />
                </div>
              </TabsContent>

              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobFunction">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    {t("form.jobFunction")}
                  </Label>
                  <Input
                    id="jobFunction"
                    value={formData.jobFunction}
                    onChange={(e) =>
                      setFormData({ ...formData, jobFunction: e.target.value })
                    }
                    placeholder={t("form.jobFunctionPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("form.bio")}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder={t("form.bioPlaceholder")}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">{t("form.experience")}</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder={t("form.experiencePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Award className="inline h-4 w-4 mr-2" />
                    {t("form.specialties")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder={t("form.addSpecialty")}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newSpecialty.trim()) {
                            setFormData({
                              ...formData,
                              specialties: [
                                ...formData.specialties,
                                newSpecialty.trim(),
                              ],
                            });
                            setNewSpecialty("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newSpecialty.trim()) {
                          setFormData({
                            ...formData,
                            specialties: [
                              ...formData.specialties,
                              newSpecialty.trim(),
                            ],
                          });
                          setNewSpecialty("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        {specialty}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              specialties: formData.specialties.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    <Award className="inline h-4 w-4 mr-2" />
                    Certifications
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newCertification.trim()) {
                            setFormData({
                              ...formData,
                              certifications: [
                                ...formData.certifications,
                                newCertification.trim(),
                              ],
                            });
                            setNewCertification("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newCertification.trim()) {
                          setFormData({
                            ...formData,
                            certifications: [
                              ...formData.certifications,
                              newCertification.trim(),
                            ],
                          });
                          setNewCertification("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        {cert}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              certifications: formData.certifications.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    placeholder="@username or full URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    placeholder="LinkedIn profile URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </TabsContent>

              {/* Commission Tab */}
              <TabsContent value="commission" className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="commissionEnabled">
                      <DollarSign className="inline h-4 w-4 mr-2" />
                      Enable Commission
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set commission rates for this professional
                    </p>
                  </div>
                  <Switch
                    id="commissionEnabled"
                    checked={formData.commissionEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, commissionEnabled: checked })
                    }
                  />
                </div>

                {formData.commissionEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="commissionPercentage">
                        Commission Percentage (%)
                      </Label>
                      <Input
                        id="commissionPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.commissionPercentage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commissionPercentage: e.target.value,
                          })
                        }
                        placeholder="10.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of booking value
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionFixedAmount">
                        Fixed Amount per Booking (€)
                      </Label>
                      <Input
                        id="commissionFixedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.commissionFixedAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commissionFixedAmount: e.target.value,
                          })
                        }
                        placeholder="5.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fixed amount per completed booking
                      </p>
                    </div>
                  </>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium">Advanced Commission Rules</h4>
                      <p className="text-xs text-muted-foreground">
                        Global rules applied via Promotions module
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDialogOpen(false);
                        navigate("/entity/commissions-management");
                      }}
                    >
                      Manage Rules
                    </Button>
                  </div>

                  {formData.commissionEnabled && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2 items-start">
                      <div className="mt-0.5">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Priority Override
                        </p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                          Enabling a specific commission for this professional will override any commission rules defined at the service level.
                        </p>
                      </div>
                    </div>
                  )}

                  {editingProfessional && activeCommissions.length > 0 ? (
                    <div className="space-y-2">
                      {activeCommissions
                        .filter(
                          (c) =>
                            c.appliesTo === "professional" &&
                            (c.professionalIds?.includes(editingProfessional.id) ||
                              c.professionalIds?.length === 0)
                        )
                        .map((commission) => (
                          <div
                            key={commission.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                          >
                            <div>
                              <p className="font-medium text-sm">{commission.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {commission.type === "percentage"
                                  ? `${commission.value}%`
                                  : `€${commission.value}`}{" "}
                                commission
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        ))}
                      {activeCommissions.filter(
                        (c) =>
                          c.appliesTo === "professional" &&
                          (c.professionalIds?.includes(editingProfessional.id) ||
                            c.professionalIds?.length === 0)
                      ).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No specific commission rules for this professional.
                          </p>
                        )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {editingProfessional
                        ? "No active commission rules found."
                        : "Save the professional first to assign specific rules."}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingProfessional
                    ? "Update"
                    : "Create & Send Invitation"}
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

      <StatsGrid columns={3}>
        <StatCard
          title="Total"
          value={professionals.length}
          subtitle="Team members"
          icon={Users}
        />
        <StatCard
          title="Active"
          value={professionals.filter((p) => p.status === "active").length}
          subtitle="Working"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Pending"
          value={professionals.filter((p) => p.status === "pending").length}
          subtitle="Invitations"
          icon={Users}
          variant="warning"
        />
      </StatsGrid>

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
                            {professional.firstName && professional.lastName
                              ? `${professional.firstName} ${professional.lastName}`
                              : "Unnamed Professional"}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {professional.status === "pending" &&
                          professional.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleResendInvitation(
                                  professional.id,
                                  professional.email!
                                )
                              }
                              title="Resend invitation email"
                            >
                              <Send className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
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
    </div >
  );
}
