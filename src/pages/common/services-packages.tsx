import React, { useState, useEffect } from "react";
import { Link2 } from "lucide-react";
import { DirectBookingLinkGenerator } from "@/components/booking/DirectBookingLinkGenerator";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useCurrency } from "../../hooks/useCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Lock,
  Search,
  Tag,
  Percent,
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "../../lib/api";
import { toast } from "sonner";
import { AssignProfessionalsDialog } from "../../components/dialogs/assign-professionals-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
} from "../../types/models/services.interface";
import type {
  ServicePackage,
  PackageSubscription,
} from "../../types/models/packages.interface";
import type {
  CreatePackageDto,
  UpdatePackageDto,
} from "../../types/dto/packages.dto";
import { PackageRecurrence } from "../../types/enums/package-recurrence.enum";

import { useNavigate } from "react-router-dom";
import { usePromotions } from "../../hooks/usePromotions";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";

const ServicesAndPackages: React.FC = () => {
  const { t } = useTranslation("services");
  const { user, entity } = useAuth();
  const { formatCurrency } = useCurrency();
  const { isSimplePlan } = usePlanRestrictions();
  const navigate = useNavigate();
  const { getActiveCommissions, getVouchers, getDiscounts } = usePromotions();

  const [activeCommissions, setActiveCommissions] = useState<any[]>([]);
  const [activeVouchers, setActiveVouchers] = useState<any[]>([]);
  const [activeDiscounts, setActiveDiscounts] = useState<any[]>([]);

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("services");

  // Check user plan
  const userPlan = user?.plan || "simple";
  const hasPackageAccess = userPlan === "individual" || userPlan === "business";
  const isOwnerOrManager = user?.role === "owner" || user?.role === "admin" || user?.role === "professional";

  // Form state for packages
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    services: [] as { serviceId: string; quantity: number }[],
    packagePrice: 0,
    recurrence: PackageRecurrence.ONE_TIME,
    validity: 30,
    sessionsIncluded: 1,
    status: "active" as "active" | "inactive" | "draft",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>("all");

  // Service filters and search
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");

  // Service CRUD states
  const [isServiceCreateModalOpen, setIsServiceCreateModalOpen] =
    useState(false);
  const [isServiceEditModalOpen, setIsServiceEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServiceForLink, setSelectedServiceForLink] = useState<Service | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    category: "",
    customCategory: "",
    duration: "",
    price: "",
    isActive: true,
    isPublic: true,
    requireManualConfirmation: false,
  });

  useEffect(() => {
    if (user?.entityId) {
      fetchData();
    }
  }, [user, statusFilter, recurrenceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const servicesRes = await apiClient.get<Service[]>(
        `/api/services/entity/${user?.entityId}`
      );
      console.log("[DEBUG] Services loaded:", servicesRes.data?.length || 0);
      setServices(servicesRes.data || []);

      // Fetch professionals for Direct Booking Link
      try {
        const profRes: any = await apiClient.get(`/api/users/entity/${user?.entityId}/professionals`);
        const profData = profRes?.data || [];
        const mappedProfs = Array.isArray(profData)
          ? profData.map((u: any) => ({
            id: u.id || u._id,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          }))
          : [];
        setProfessionals(mappedProfs);
      } catch (profError) {
        console.error("Error fetching professionals:", profError);
        setProfessionals([]);
      }

      // Only fetch packages if user has access
      if (hasPackageAccess) {
        const packagesUrl = `/api/packages/entity/${user?.entityId
          }?${new URLSearchParams({
            ...(statusFilter !== "all" && { status: statusFilter }),
            ...(recurrenceFilter !== "all" && { recurrence: recurrenceFilter }),
          } as any)}`;

        const [packagesRes, subscriptionsRes] = await Promise.all([
          apiClient.get<ServicePackage[]>(packagesUrl),
          apiClient.get<PackageSubscription[]>(
            `/api/packages/subscriptions/entity/${user?.entityId}`
          ),
        ]);

        // Validate and clean package data to prevent errors
        const validatedPackages = (packagesRes.data || []).map((pkg) => ({
          ...pkg,
          services: pkg.services.filter((svc) => svc && svc.serviceId), // Remove invalid services
        }));

        setPackages(validatedPackages);
        setSubscriptions(subscriptionsRes.data || []);
      }

      // Fetch promotions data
      if (user?.entityId) {
        const [commissionsData, vouchersData, discountsData] = await Promise.all([
          getActiveCommissions(user.entityId),
          getVouchers(user.entityId),
          getDiscounts(user.entityId)
        ]);

        setActiveCommissions(commissionsData);
        setActiveVouchers(vouchersData.filter(v => v.status === 'active'));
        setActiveDiscounts(discountsData.filter(d => d.status === 'active'));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem criar pacotes");
      return;
    }
    try {
      if (!formData.name || formData.services.length === 0) {
        toast.error("Preencha nome e selecione pelo menos um serviço");
        return;
      }

      if (formData.packagePrice <= 0) {
        toast.error("O preço do pacote deve ser maior que zero");
        return;
      }

      const originalPrice = calculateOriginalPrice();
      if (formData.packagePrice > originalPrice) {
        toast.error(
          `O preço do pacote não pode ser maior que o valor total dos serviços (€${originalPrice.toFixed(
            2
          )})`
        );
        return;
      }

      const payload: CreatePackageDto = {
        entityId: user?.entityId!,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        services: formData.services.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
        pricing: {
          packagePrice: Number(formData.packagePrice.toFixed(2)),
          currency: "EUR",
        },
        recurrence: formData.recurrence,
        validity: formData.validity,
        sessionsIncluded: formData.sessionsIncluded,
        createdBy: user?.id!,
      };

      console.log(
        "[DEBUG] Creating package with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.post("/api/packages", payload);

      toast.success("Pacote criado com sucesso!");
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error creating package:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao criar pacote";
      toast.error(msg);
    }
  };

  const handleUpdatePackage = async () => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem atualizar pacotes");
      return;
    }
    if (!selectedPackage) return;

    try {
      if (!formData.name || formData.services.length === 0) {
        toast.error("Preencha nome e selecione pelo menos um serviço");
        return;
      }

      if (formData.packagePrice <= 0) {
        toast.error("O preço do pacote deve ser maior que zero");
        return;
      }

      const originalPrice = calculateOriginalPrice();
      if (formData.packagePrice > originalPrice) {
        toast.error(
          `O preço do pacote não pode ser maior que o valor total dos serviços (€${originalPrice.toFixed(
            2
          )})`
        );
        return;
      }

      const payload: UpdatePackageDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        services: formData.services.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
        pricing: {
          packagePrice: Number(formData.packagePrice.toFixed(2)),
          currency: "EUR",
        },
        recurrence: formData.recurrence,
        validity: formData.validity,
        sessionsIncluded: formData.sessionsIncluded,
        updatedBy: user?.id!,
      };

      console.log(
        "[DEBUG] Updating package with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.patch(`/api/packages/${selectedPackage._id}`, payload);

      toast.success("Pacote atualizado com sucesso!");
      setIsEditModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error updating package:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao atualizar pacote";
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (packageId: string) => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem alterar status");
      return;
    }
    try {
      console.log("[DEBUG] Toggling status for package ID:", packageId);
      console.log(
        "[DEBUG] PATCH URL:",
        `/api/packages/${packageId}/toggle-status`
      );

      await apiClient.patch(`/api/packages/${packageId}/toggle-status`);

      console.log("[DEBUG] Status toggled successfully");
      toast.success("Status atualizado com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error toggling status:", error);
      console.error("[ERROR] Error response:", error.response);
      console.error("[ERROR] Error data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro ao atualizar status";
      toast.error(errorMessage);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem excluir pacotes");
      return;
    }
    try {
      if (!confirm("Tem certeza que deseja excluir este pacote?")) return;

      console.log("[DEBUG] Deleting package with ID:", packageId);
      console.log("[DEBUG] DELETE URL:", `/api/packages/${packageId}`);

      await apiClient.delete(`/api/packages/${packageId}`);

      console.log("[DEBUG] Package deleted successfully");
      toast.success("Pacote excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error deleting package:", error);
      console.error("[ERROR] Error response:", error.response);
      console.error("[ERROR] Error data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro ao excluir pacote";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      services: pkg.services.map((s) => {
        // Safely extract serviceId
        let extractedServiceId: string;
        if (typeof s.serviceId === "string") {
          extractedServiceId = s.serviceId;
        } else if (s.serviceId && typeof s.serviceId === "object") {
          extractedServiceId =
            (s.serviceId as any)._id || (s.serviceId as any).id || "";
        } else {
          extractedServiceId = "";
        }

        return {
          serviceId: extractedServiceId,
          quantity: s.quantity || 1,
        };
      }),
      packagePrice: pkg.pricing.packagePrice,
      recurrence: pkg.recurrence,
      validity: pkg.validity,
      sessionsIncluded: pkg.sessionsIncluded,
      status: pkg.status,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      services: [],
      packagePrice: 0,
      recurrence: PackageRecurrence.ONE_TIME,
      validity: 30,
      sessionsIncluded: 1,
      status: "active",
    });
    setSelectedPackage(null);
  };

  const calculateOriginalPrice = () => {
    return formData.services.reduce((sum, serviceWithQty) => {
      const service = services.find((s) => s._id === serviceWithQty.serviceId);
      const quantity = serviceWithQty.quantity || 1;
      return sum + (service?.pricing.basePrice || 0) * quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    const originalPrice = calculateOriginalPrice();
    if (originalPrice === 0) return 0;
    return ((originalPrice - formData.packagePrice) / originalPrice) * 100;
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: "default",
      inactive: "secondary",
      draft: "outline",
      expired: "destructive",
      cancelled: "destructive",
      paused: "secondary",
    };

    const labels: any = {
      active: "Ativo",
      inactive: "Inativo",
      draft: "Rascunho",
      expired: "Expirado",
      cancelled: "Cancelado",
      paused: "Pausado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Service metrics and filtering
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(
        serviceSearchTerm.toLowerCase()
      );

    const matchesCategory =
      serviceCategoryFilter === "all" ||
      service.category === serviceCategoryFilter;

    const matchesStatus =
      serviceStatusFilter === "all" ||
      (serviceStatusFilter === "active" && service.status !== "inactive") ||
      (serviceStatusFilter === "inactive" && service.status === "inactive");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeServices = services.filter((s) => s.status !== "inactive");

  // Service CRUD Functions
  const handleCreateService = async () => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem criar serviços");
      return;
    }
    try {
      if (
        !serviceFormData.name ||
        !serviceFormData.category ||
        !serviceFormData.duration ||
        !serviceFormData.duration ||
        (!serviceFormData.price && !isSimplePlan)
      ) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const payload: CreateServiceDto = {
        entityId: user?.entityId!,
        name: serviceFormData.name,
        description: serviceFormData.description || undefined,
        category: serviceFormData.category,
        status: serviceFormData.isActive ? "active" : "inactive",
        duration: {
          durationType: "fixed",
          duration: parseInt(serviceFormData.duration),
        },
        pricing: {
          basePrice: parseFloat(isSimplePlan ? "0" : serviceFormData.price),
          currency: "EUR",
        },
        bookingSettings: {
          requiresManualConfirmation: serviceFormData.requireManualConfirmation,
        },
        createdBy: user?.id!,
      };

      console.log(
        "[DEBUG] Creating service with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.post("/api/services", payload);

      toast.success("Serviço criado com sucesso!");
      setIsServiceCreateModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error creating service:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Erro ao criar serviço");
    }
  };

  const handleUpdateService = async () => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem atualizar serviços");
      return;
    }
    try {
      if (!editingService) return;

      const serviceId = editingService._id || editingService.id;
      if (!serviceId) {
        toast.error("ID do serviço não encontrado");
        return;
      }

      const payload: UpdateServiceDto = {
        name: serviceFormData.name,
        description: serviceFormData.description || undefined,
        category: serviceFormData.category,
        status: serviceFormData.isActive ? "active" : "inactive",
        duration: {
          durationType: "fixed",
          duration: parseInt(serviceFormData.duration),
        },
        pricing: {
          basePrice: parseFloat(isSimplePlan ? "0" : serviceFormData.price),
          currency: "EUR",
        },
        bookingSettings: {
          requiresManualConfirmation: serviceFormData.requireManualConfirmation,
        },
        updatedBy: user?.id!,
      };

      console.log(
        "[DEBUG] Updating service with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.patch(`/api/services/${serviceId}`, payload);

      toast.success("Serviço atualizado com sucesso!");
      setIsServiceEditModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error updating service:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Erro ao atualizar serviço");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!isOwnerOrManager) {
      toast.error("Apenas proprietários ou gerentes podem excluir serviços");
      return;
    }
    try {
      if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

      await apiClient.delete(`/api/services/${serviceId}`);
      toast.success("Serviço excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error(error.response?.data?.message || "Erro ao excluir serviço");
    }
  };

  const openServiceEditModal = (service: Service) => {
    setEditingService(service);

    const durationValue = service.duration.duration;

    setServiceFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      customCategory: "",
      duration: String(durationValue),
      price: String(service.pricing.basePrice),
      isActive: service.status !== "inactive",
      isPublic: service.seo?.isPublic !== false,
      requireManualConfirmation:
        service.bookingSettings?.requiresManualConfirmation || false,
    });
    setShowCustomCategory(false);
    setIsServiceEditModalOpen(true);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      name: "",
      description: "",
      category: "",
      customCategory: "",
      duration: "",
      price: "",
      isActive: true,
      isPublic: true,
      requireManualConfirmation: false,
    });
    setShowCustomCategory(false);
    setEditingService(null);
  };

  const getRecurrenceBadge = (recurrence: string) => {
    return recurrence === "monthly" ? (
      <Badge variant="default">
        <Calendar className="w-3 h-3 mr-1" />
        Mensal
      </Badge>
    ) : (
      <Badge variant="outline">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Pagamento Único
      </Badge>
    );
  };

  // Calculate statistics
  const totalServices = services.length;
  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.status === "active").length;
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const totalRevenue = subscriptions.reduce((sum, sub) => {
    if (
      typeof sub.packageId === "object" &&
      sub.packageId &&
      "pricing" in sub.packageId
    ) {
      return sum + sub.packageId.pricing.packagePrice;
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {hasPackageAccess ? t("subtitleWithPackages") : t("subtitle")}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={hasPackageAccess ? "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalServices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            {hasPackageAccess && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeServices.length} {t("stats.active")}
              </p>
            )}
            {!hasPackageAccess && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("stats.totalCatalog", "Catalog Items")}
              </p>
            )}
          </CardContent>
        </Card>

        {!hasPackageAccess && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("stats.activeServices", "Active Services")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeServices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("stats.availableBooking", "Available for booking")}
              </p>
            </CardContent>
          </Card>
        )}

        {hasPackageAccess && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("stats.totalPackages")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPackages}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activePackages} {t("stats.active")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("stats.subscriptions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  {activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("stats.of")} {totalSubscriptions} {t("stats.total")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("stats.totalRevenue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("stats.fromPackages")}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className={`grid w-full ${hasPackageAccess ? "grid-cols-3" : "grid-cols-1"
            }`}
        >
          <TabsTrigger value="services">{t("tabs.services")} ({totalServices})</TabsTrigger>
          {hasPackageAccess && (
            <>
              <TabsTrigger value="packages">
                {t("tabs.packages")} ({totalPackages})
              </TabsTrigger>
              <TabsTrigger value="subscriptions">
                {t("tabs.subscriptions")} ({totalSubscriptions})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("services.searchPlaceholder")}
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={serviceCategoryFilter}
                onValueChange={setServiceCategoryFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("services.table.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("services.filters.allCategories")}</SelectItem>
                  {Array.from(
                    new Set(services.map((s) => s.category).filter((c): c is string => !!c))
                  )
                    .sort()
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={serviceStatusFilter}
                onValueChange={setServiceStatusFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("services.filters.allStatus")}</SelectItem>
                  <SelectItem value="active">{t("services.status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("services.status.inactive")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setServiceSearchTerm("");
                  setServiceCategoryFilter("all");
                  setServiceStatusFilter("all");
                }}
              >
                {t("actions.reset", "Clear")}
              </Button>
            </div>
          </div>

          {/* Create Service Button */}
          <div className="flex justify-end">
            {isOwnerOrManager && (
              <Dialog
                open={isServiceCreateModalOpen}
                onOpenChange={setIsServiceCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("services.addService")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("services.addService")}</DialogTitle>
                    <DialogDescription>
                      {t("services.form.description", "Add a new service to your catalog")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">{t("services.form.name")} *</Label>
                        <Input
                          id="service-name"
                          value={serviceFormData.name}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder={t("services.form.namePlaceholder", "e.g., Haircut")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-category">{t("services.form.category")} *</Label>
                        <Select
                          value={
                            showCustomCategory
                              ? "custom"
                              : serviceFormData.category
                          }
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomCategory(true);
                              setServiceFormData({
                                ...serviceFormData,
                                category: "",
                              });
                            } else {
                              setShowCustomCategory(false);
                              setServiceFormData({
                                ...serviceFormData,
                                category: value,
                                customCategory: "",
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultoria</SelectItem>
                            <SelectItem value="health">Saúde</SelectItem>
                            <SelectItem value="beauty">Beleza</SelectItem>
                            <SelectItem value="haircut">Corte de Cabelo</SelectItem>
                            <SelectItem value="color">Coloração</SelectItem>
                            <SelectItem value="treatment">Tratamento</SelectItem>
                            <SelectItem value="styling">Penteado</SelectItem>
                            <SelectItem value="manicure">Manicure</SelectItem>
                            <SelectItem value="pedicure">Pedicure</SelectItem>
                            <SelectItem value="massage">Massagem</SelectItem>
                            <SelectItem value="facial">Facial</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                            <SelectItem value="education">Educação</SelectItem>
                            <SelectItem value="events">Eventos</SelectItem>
                            <SelectItem value="cleaning">Limpeza</SelectItem>
                            <SelectItem value="repairs">Reparos</SelectItem>
                            <SelectItem value="legal">Jurídico</SelectItem>
                            <SelectItem value="pet_care">Cuidados Pet</SelectItem>
                            <SelectItem value="automotive">Automotivo</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                            <SelectItem value="custom">
                              ➕ Criar Categoria Personalizada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showCustomCategory && (
                          <Input
                            placeholder="Enter custom category name"
                            value={serviceFormData.customCategory}
                            onChange={(e) =>
                              setServiceFormData({
                                ...serviceFormData,
                                customCategory: e.target.value,
                                category: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-description">Descrição</Label>
                      <Textarea
                        id="service-description"
                        value={serviceFormData.description}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Descreva o serviço..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-duration">
                          Duração (minutos) *
                        </Label>
                        <Input
                          id="service-duration"
                          type="number"
                          min="5"
                          value={serviceFormData.duration}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              duration: e.target.value,
                            })
                          }
                          placeholder="Ex: 60"
                        />
                      </div>

                      {!isSimplePlan && (
                        <div className="space-y-2">
                          <Label htmlFor="service-price">Preço (€) *</Label>
                          <Input
                            id="service-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={serviceFormData.price}
                            onChange={(e) =>
                              setServiceFormData({
                                ...serviceFormData,
                                price: e.target.value,
                              })
                            }
                            placeholder="Ex: 25.00"
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            ℹ️ {t("services.form.vatIncluded", "Price includes VAT/IVA")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* VAT Alert for Non-Simple Plans */}
                    {!isSimplePlan && (
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                        <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                          <span className="font-bold block mb-1">📢 {t("services.form.vatIncluded", "Price includes VAT/IVA")}</span>
                          {t("services.form.vatAlert", "The price you set already includes VAT/IVA. This is the final amount that will be charged to clients.")}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Simple Plan Alert */}
                    {isSimplePlan && (
                      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                          ⚠️ {t("services.form.simplePlanAlert", "Simple plan does not process payments. Prices are for informational purposes only.")}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-active"
                          checked={serviceFormData.isActive}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isActive: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="service-active"
                          className="cursor-pointer"
                        >
                          {t("services.form.isActive")}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-public"
                          checked={serviceFormData.isPublic}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isPublic: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="service-public"
                          className="cursor-pointer"
                        >
                          {t("services.form.isPublic")}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-manual-confirm"
                          checked={serviceFormData.requireManualConfirmation}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              requireManualConfirmation: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="service-manual-confirm"
                          className="cursor-pointer"
                        >
                          {t("services.form.requireManualConfirmation")}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsServiceCreateModalOpen(false);
                        resetServiceForm();
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                    <Button onClick={handleCreateService}>{t("services.addService")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("services.title")}</CardTitle>
              <CardDescription>
                {t("services.form.description", "Manage all available services")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("services.table.name")}</TableHead>
                    <TableHead>{t("services.table.category")}</TableHead>
                    <TableHead>{t("services.table.duration")}</TableHead>
                    {!isSimplePlan && <TableHead>{t("services.table.price")}</TableHead>}
                    <TableHead>{t("services.table.status")}</TableHead>
                    <TableHead className="text-right">{t("services.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isSimplePlan ? 5 : 6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t("services.noServices")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => {
                      const hasCommission = activeCommissions.some(c =>
                        (c.appliesTo === 'service' && c.serviceIds?.includes(service._id || service.id)) ||
                        (c.appliesTo === 'service_category' && c.serviceCategoryIds?.includes(service.category))
                      );

                      const hasVoucher = activeVouchers.some(v =>
                        v.applicableServiceIds?.includes(service._id || service.id)
                      );

                      const hasDiscount = activeDiscounts.some(d =>
                        (d.appliesTo === 'specific_services' && d.serviceIds?.includes(service._id || service.id)) ||
                        (d.appliesTo === 'service_category' && d.serviceCategoryIds?.includes(service.category)) ||
                        d.appliesTo === 'all_services'
                      );

                      return (
                        <TableRow key={service._id}>
                          <TableCell className="font-medium">
                            {service.name}
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {hasCommission && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-yellow-50 text-yellow-700 border-yellow-200 h-5">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {t("promotions.commissions")}
                                </Badge>
                              )}
                              {hasVoucher && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700 border-green-200 h-5">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {t("promotions.vouchers")}
                                </Badge>
                              )}
                              {hasDiscount && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200 h-5">
                                  <Percent className="w-3 h-3 mr-1" />
                                  {t("promotions.discounts")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {service.category || "-"}
                          </TableCell>
                          <TableCell>
                            {typeof service.duration === "object"
                              ? service.duration.duration
                              : service.duration || "-"}{" "}
                            min
                          </TableCell>
                          {!isSimplePlan && (
                            <TableCell>
                              {formatCurrency(service.pricing.basePrice)}
                            </TableCell>
                          )}
                          <TableCell>
                            {(service as any).status !== "inactive" ? (
                              <Badge variant="default">{t("services.status.active")}</Badge>
                            ) : (
                              <Badge variant="secondary">{t("services.status.inactive")}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">


                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openServiceEditModal(service)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <AssignProfessionalsDialog
                                serviceId={service._id || service.id || ""}
                                serviceName={service.name}
                                entityId={user?.entityId || ""}
                                assignedProfessionalIds={
                                  service.professionalIds ||
                                  service.assignedProfessionals ||
                                  service.professionals ||
                                  []
                                }
                                onAssigned={() => fetchData()}
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteService(
                                    service._id || service.id || ""
                                  )
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Service Dialog */}
          <Dialog
            open={isServiceEditModalOpen}
            onOpenChange={setIsServiceEditModalOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="promotions">Promotions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 py-4">

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-name">Nome do Serviço *</Label>
                        <Input
                          id="edit-service-name"
                          value={serviceFormData.name}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-service-category">Categoria *</Label>
                        <Select
                          value={
                            showCustomCategory ? "custom" : serviceFormData.category
                          }
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomCategory(true);
                              setServiceFormData({
                                ...serviceFormData,
                                category: "",
                              });
                            } else {
                              setShowCustomCategory(false);
                              setServiceFormData({
                                ...serviceFormData,
                                category: value,
                                customCategory: "",
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultoria</SelectItem>
                            <SelectItem value="health">Saúde</SelectItem>
                            <SelectItem value="beauty">Beleza</SelectItem>
                            <SelectItem value="haircut">Corte de Cabelo</SelectItem>
                            <SelectItem value="color">Coloração</SelectItem>
                            <SelectItem value="treatment">Tratamento</SelectItem>
                            <SelectItem value="styling">Penteado</SelectItem>
                            <SelectItem value="manicure">Manicure</SelectItem>
                            <SelectItem value="pedicure">Pedicure</SelectItem>
                            <SelectItem value="massage">Massagem</SelectItem>
                            <SelectItem value="facial">Facial</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                            <SelectItem value="education">Educação</SelectItem>
                            <SelectItem value="events">Eventos</SelectItem>
                            <SelectItem value="cleaning">Limpeza</SelectItem>
                            <SelectItem value="repairs">Reparos</SelectItem>
                            <SelectItem value="legal">Jurídico</SelectItem>
                            <SelectItem value="pet_care">Cuidados Pet</SelectItem>
                            <SelectItem value="automotive">Automotivo</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                            <SelectItem value="custom">
                              ➕ Criar Categoria Personalizada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showCustomCategory && (
                          <Input
                            placeholder="Enter custom category name"
                            value={serviceFormData.customCategory}
                            onChange={(e) =>
                              setServiceFormData({
                                ...serviceFormData,
                                customCategory: e.target.value,
                                category: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-service-description">Descrição</Label>
                      <Textarea
                        id="edit-service-description"
                        value={serviceFormData.description}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-duration">
                          Duração (minutos) *
                        </Label>
                        <Input
                          id="edit-service-duration"
                          type="number"
                          min="5"
                          value={serviceFormData.duration}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              duration: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-service-price">Preço (€) *</Label>
                        <Input
                          id="edit-service-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceFormData.price}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              price: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          ℹ️ {t("services.form.vatIncluded", "Price includes VAT/IVA")}
                        </p>
                      </div>
                    </div>

                    {/* VAT Alert */}
                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                      <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                        💡 {t("services.form.vatAlert", "The price you set already includes VAT/IVA. This is the final amount that will be charged to clients.")}
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-service-active"
                          checked={serviceFormData.isActive}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isActive: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="edit-service-active"
                          className="cursor-pointer"
                        >
                          Ativo
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-service-public"
                          checked={serviceFormData.isPublic}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isPublic: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="edit-service-public"
                          className="cursor-pointer"
                        >
                          Visível publicamente
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-service-manual-confirm"
                          checked={serviceFormData.requireManualConfirmation}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              requireManualConfirmation: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="edit-service-manual-confirm"
                          className="cursor-pointer"
                        >
                          Confirmação manual
                        </Label>
                      </div>
                    </div>
                  </div>

                </TabsContent>

                <TabsContent value="promotions" className="space-y-4 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium">Active Promotions</h4>
                      <p className="text-xs text-muted-foreground">
                        Commissions, vouchers, and discounts applying to this service
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsServiceEditModalOpen(false);
                        navigate("/entity/commissions-management");
                      }}
                    >
                      Manage Promotions
                    </Button>
                  </div>

                  {editingService && (
                    <div className="space-y-4">
                      {/* Commissions */}
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-600" />
                          Commissions
                        </h5>
                        {activeCommissions.filter(c =>
                          (c.appliesTo === 'service' && c.serviceIds?.includes(editingService._id || editingService.id)) ||
                          (c.appliesTo === 'service_category' && c.serviceCategoryIds?.includes(editingService.category))
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {activeCommissions.filter(c =>
                              (c.appliesTo === 'service' && c.serviceIds?.includes(editingService._id || editingService.id)) ||
                              (c.appliesTo === 'service_category' && c.serviceCategoryIds?.includes(editingService.category))
                            ).map(commission => (
                              <div key={commission.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                <div>
                                  <p className="font-medium text-sm">{commission.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {commission.type === 'percentage' ? `${commission.value}%` : `€${commission.value}`} commission
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No specific commissions for this service.</p>
                        )}
                      </div>

                      {/* Vouchers */}
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          Vouchers
                        </h5>
                        {activeVouchers.filter(v =>
                          v.applicableServiceIds?.includes(editingService._id || editingService.id)
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {activeVouchers.filter(v =>
                              v.applicableServiceIds?.includes(editingService._id || editingService.id)
                            ).map(voucher => (
                              <div key={voucher._id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                <div>
                                  <p className="font-medium text-sm">{voucher.code}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {voucher.type === 'percentage' ? `${voucher.value}%` : `€${voucher.value}`} off
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No specific vouchers for this service.</p>
                        )}
                      </div>

                      {/* Discounts */}
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-blue-600" />
                          Discounts
                        </h5>
                        {activeDiscounts.filter(d =>
                          (d.appliesTo === 'specific_services' && d.serviceIds?.includes(editingService._id || editingService.id)) ||
                          (d.appliesTo === 'service_category' && d.serviceCategoryIds?.includes(editingService.category)) ||
                          d.appliesTo === 'all_services'
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {activeDiscounts.filter(d =>
                              (d.appliesTo === 'specific_services' && d.serviceIds?.includes(editingService._id || editingService.id)) ||
                              (d.appliesTo === 'service_category' && d.serviceCategoryIds?.includes(editingService.category)) ||
                              d.appliesTo === 'all_services'
                            ).map(discount => (
                              <div key={discount._id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                <div>
                                  <p className="font-medium text-sm">{discount.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {discount.type === 'percentage' ? `${discount.value}%` : `€${discount.value}`} off
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No active discounts apply to this service.</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsServiceEditModalOpen(false);
                    resetServiceForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateService}>Atualizar Serviço</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Packages Tab - Only for Individual/Business */}
        {
          hasPackageAccess && (
            <TabsContent value="packages" className="space-y-4">
              {/* Filters and Create Button */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={recurrenceFilter}
                    onValueChange={setRecurrenceFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="one_time">Pagamento Único</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">

                  {isOwnerOrManager && (
                    <Dialog
                      open={isCreateModalOpen}
                      onOpenChange={setIsCreateModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Pacote
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Criar Novo Pacote</DialogTitle>
                          <DialogDescription>
                            Crie um pacote combinando múltiplos serviços com desconto
                            especial
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {/* Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome do Pacote *</Label>
                            <Input
                              id="name"
                              placeholder="Ex: Pacote Wellness"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              placeholder="Descreva o que está incluso neste pacote..."
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>

                          {/* Services with Quantities */}
                          <div className="space-y-2">
                            <Label>Serviços Inclusos *</Label>
                            <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                              {services.map((service) => {
                                const serviceInPackage = formData.services.find(
                                  (s) => s.serviceId === service._id
                                );
                                const isSelected = !!serviceInPackage;

                                return (
                                  <div
                                    key={service._id}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`service-${service._id}`}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData({
                                            ...formData,
                                            services: [
                                              ...formData.services,
                                              { serviceId: service._id, quantity: 1 },
                                            ],
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            services: formData.services.filter(
                                              (s) => s.serviceId !== service._id
                                            ),
                                          });
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <label
                                      htmlFor={`service-${service._id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      {service.name} -{" "}
                                      {formatCurrency(service.pricing.basePrice)}
                                    </label>
                                    {isSelected && (
                                      <div className="flex items-center gap-2">
                                        <Label
                                          htmlFor={`qty-${service._id}`}
                                          className="text-xs text-muted-foreground"
                                        >
                                          Qty:
                                        </Label>
                                        <Input
                                          id={`qty-${service._id}`}
                                          type="number"
                                          min="1"
                                          value={serviceInPackage.quantity}
                                          onChange={(e) => {
                                            const newQty =
                                              parseInt(e.target.value) || 1;
                                            setFormData({
                                              ...formData,
                                              services: formData.services.map((s) =>
                                                s.serviceId === service._id
                                                  ? { ...s, quantity: newQty }
                                                  : s
                                              ),
                                            });
                                          }}
                                          className="w-20 h-8"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {formData.services.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Preço original:</strong>{" "}
                                {formatCurrency(calculateOriginalPrice())}
                              </p>
                            )}
                          </div>

                          {/* Pricing */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="packagePrice">Preço do Pacote *</Label>
                              <Input
                                id="packagePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.packagePrice || ""}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value);
                                  setFormData({
                                    ...formData,
                                    packagePrice: isNaN(value) ? 0 : value,
                                  });
                                }}
                              />
                              {formData.services.length > 0 &&
                                formData.packagePrice > 0 && (
                                  <p className="text-sm text-green-600">
                                    Desconto: {calculateDiscount().toFixed(1)}%
                                  </p>
                                )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="validity">Validade (dias)</Label>
                              <Input
                                id="validity"
                                type="number"
                                min="7"
                                value={formData.validity || ""}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 30
                                      : parseInt(e.target.value);
                                  setFormData({
                                    ...formData,
                                    validity: isNaN(value) ? 30 : value,
                                  });
                                }}
                              />
                            </div>
                          </div>

                          {/* Recurrence and Sessions */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Recorrência</Label>
                              <Select
                                value={formData.recurrence}
                                onValueChange={(value) =>
                                  setFormData({
                                    ...formData,
                                    recurrence: value as PackageRecurrence,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={PackageRecurrence.ONE_TIME}>
                                    Pagamento Único
                                  </SelectItem>
                                  <SelectItem value={PackageRecurrence.MONTHLY}>
                                    Mensal
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="sessionsIncluded">
                                Sessões Incluídas *
                              </Label>
                              <Input
                                id="sessionsIncluded"
                                type="number"
                                min="1"
                                value={formData.sessionsIncluded}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    sessionsIncluded: parseInt(e.target.value) || 1,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleCreatePackage}>Criar Pacote</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {/* Packages Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Serviços</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Recorrência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhum pacote encontrado. Crie seu primeiro pacote!
                          </TableCell>
                        </TableRow>
                      ) : (
                        packages.map((pkg) => (
                          <TableRow key={pkg._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{pkg.name}</div>
                                {pkg.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {pkg.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                {pkg.services.map((svc, idx) => {
                                  // Safely extract service name
                                  let serviceName = "Serviço Desconhecido";
                                  let serviceId = "";

                                  // Check if serviceId is populated (object)
                                  if (
                                    svc.serviceId &&
                                    typeof svc.serviceId === "object" &&
                                    "name" in svc.serviceId
                                  ) {
                                    serviceName = svc.serviceId.name;
                                    serviceId =
                                      (svc.serviceId as any)._id ||
                                      (svc.serviceId as any).id ||
                                      "";
                                  }
                                  // If serviceId is a string, try to find in local services array
                                  else if (typeof svc.serviceId === "string") {
                                    serviceId = svc.serviceId;
                                    const service = services.find(
                                      (s) =>
                                        s._id === svc.serviceId ||
                                        s.id === svc.serviceId
                                    );
                                    serviceName =
                                      service?.name ||
                                      `Serviço (${svc.serviceId.slice(0, 8)}...)`;
                                  }

                                  const quantity = svc.quantity || 1;
                                  return (
                                    <div
                                      key={serviceId || idx}
                                      className="flex items-center gap-1"
                                    >
                                      <span>{serviceName}</span>
                                      {quantity > 1 && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs px-1 py-0"
                                        >
                                          x{quantity}
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {formatCurrency(pkg.pricing.packagePrice)}
                                </div>
                                <div className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(pkg.pricing.originalPrice)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {pkg.pricing.discount.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getRecurrenceBadge(pkg.recurrence)}
                            </TableCell>
                            <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(pkg)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(pkg._id)}
                                  className={
                                    pkg.status === "active"
                                      ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  }
                                >
                                  {pkg.status === "active"
                                    ? "Desativar"
                                    : "Ativar"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePackage(pkg._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent >
          )
        }

        {/* Subscriptions Tab - Only for Individual/Business */}
        {
          hasPackageAccess && (
            <TabsContent value="subscriptions" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sessões</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhuma assinatura encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscriptions.map((sub) => {
                          const clientName =
                            typeof sub.clientId === "object" && sub.clientId
                              ? sub.clientId.name
                              : "Unknown";
                          const clientEmail =
                            typeof sub.clientId === "object" && sub.clientId
                              ? sub.clientId.email
                              : "";
                          const packageName =
                            typeof sub.packageId === "object" && sub.packageId
                              ? sub.packageId.name
                              : "Unknown";

                          return (
                            <TableRow key={sub._id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{clientName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {clientEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{packageName}</TableCell>
                              <TableCell>{getStatusBadge(sub.status)}</TableCell>
                              <TableCell>
                                {sub.sessionsUsed} / {sub.sessionsTotal}
                              </TableCell>
                              <TableCell>
                                {format(new Date(sub.expiryDate), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell>
                                {format(new Date(sub.createdAt), "dd/MM/yyyy")}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )
        }
      </Tabs >

      {/* Edit Modal */}
      {
        hasPackageAccess && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Pacote</DialogTitle>
                <DialogDescription>
                  Atualize as informações do pacote
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Pacote *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {/* Services with Quantities */}
                <div className="space-y-2">
                  <Label>Serviços Inclusos *</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                    {services.map((service) => {
                      const serviceInPackage = formData.services.find(
                        (s) => s.serviceId === service._id
                      );
                      const isSelected = !!serviceInPackage;

                      return (
                        <div
                          key={service._id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            id={`edit-service-${service._id}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  services: [
                                    ...formData.services,
                                    { serviceId: service._id, quantity: 1 },
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  services: formData.services.filter(
                                    (s) => s.serviceId !== service._id
                                  ),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label
                            htmlFor={`edit-service-${service._id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(service.pricing.basePrice)}
                            </div>
                          </label>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`edit-qty-${service._id}`}
                                className="text-sm text-muted-foreground"
                              >
                                Qtd:
                              </Label>
                              <Input
                                id={`edit-qty-${service._id}`}
                                type="number"
                                min="1"
                                value={serviceInPackage?.quantity || 1}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 1;
                                  setFormData({
                                    ...formData,
                                    services: formData.services.map((s) =>
                                      s.serviceId === service._id
                                        ? { ...s, quantity: qty }
                                        : s
                                    ),
                                  });
                                }}
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {formData.services.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Preço original:</strong>{" "}
                      {formatCurrency(calculateOriginalPrice())}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-packagePrice">Preço do Pacote *</Label>
                    <Input
                      id="edit-packagePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.packagePrice || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setFormData({
                          ...formData,
                          packagePrice: isNaN(value) ? 0 : value,
                        });
                      }}
                    />
                    {formData.services.length > 0 &&
                      formData.packagePrice > 0 && (
                        <p className="text-sm text-green-600">
                          Desconto: {calculateDiscount().toFixed(1)}%
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-validity">Validade (dias)</Label>
                    <Input
                      id="edit-validity"
                      type="number"
                      min="7"
                      value={formData.validity || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 30 : parseInt(e.target.value);
                        setFormData({
                          ...formData,
                          validity: isNaN(value) ? 30 : value,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Recurrence and Sessions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrence">Recorrência</Label>
                    <Select
                      value={formData.recurrence}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          recurrence: value as PackageRecurrence,
                        })
                      }
                    >
                      <SelectTrigger id="edit-recurrence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PackageRecurrence.ONE_TIME}>
                          Pagamento Único
                        </SelectItem>
                        <SelectItem value={PackageRecurrence.MONTHLY}>
                          Mensal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-sessions">Sessões Incluídas</Label>
                    <Input
                      id="edit-sessions"
                      type="number"
                      min="1"
                      value={formData.sessionsIncluded}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sessionsIncluded: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "draft") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePackage}>Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        )
      }

      {/* Upgrade Notice for Simple Plan */}
      {
        !hasPackageAccess && activeTab !== "services" && (
          <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                  <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Pacotes Disponíveis no Plano Individual/Business
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                    Faça upgrade para criar pacotes de serviços com descontos e
                    gerenciar assinaturas.
                  </p>
                  <Button
                    onClick={() => {
                      window.location.href = "/entity/subscriptions-board";
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Fazer Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      <DirectBookingLinkGenerator
        entitySlug={(entity as any)?.slug || entity?.id || user?.entityId || ""}
        entityId={entity?.id || user?.entityId}
        professionals={professionals}
        services={services.map(s => ({
          id: s._id || s.id || "",
          name: s.name,
          duration: typeof s.duration === 'object' ? s.duration.duration : s.duration,
          price: s.pricing?.basePrice
        }))}
        initialServiceId={selectedServiceForLink?._id || selectedServiceForLink?.id}
        open={!!selectedServiceForLink}
        onOpenChange={(open) => !open && setSelectedServiceForLink(null)}
      />

    </div>
  );
};

export default ServicesAndPackages;
