import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../contexts/auth-context";
import { usePermissions } from "../../hooks/usePermissions";
import { usePackages } from "../../hooks/usePackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/ui/stats-grid";
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
  Package,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "../../lib/api";
import { toast } from "sonner";

interface Service {
  _id: string;
  name: string;
  pricing: {
    basePrice: number;
    currency: string;
  };
}

interface ServicePackage {
  _id: string;
  entityId: string;
  name: string;
  description?: string;
  services: Service[];
  pricing: {
    originalPrice: number;
    packagePrice: number;
    discount: number;
    currency: string;
  };
  recurrence: "monthly" | "one_time";
  validity: number;
  sessionsIncluded: number;
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

interface PackageSubscription {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  entityId: string;
  packageId: ServicePackage;
  status: "active" | "expired" | "cancelled" | "paused";
  startDate: string;
  expiryDate: string;
  sessionsUsed: number;
  sessionsTotal: number;
  autoRenew: boolean;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

const PackageManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency, getCurrencyCode } = useCurrency();
  const { userPackage } = usePermissions();
  const {
    loading: packagesLoading,
    getPackages,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackageStatus,
    getSubscriptions,
  } = usePackages();

  // Check if user has access to packages feature (Individual and Business only)
  const hasPackageAccess =
    userPackage === "Individual" || userPackage === "Business";

  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("packages");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    services: [] as string[],
    packagePrice: "",
    currency: "BRL",
    recurrence: "one_time" as "monthly" | "one_time",
    validity: "",
    sessionsIncluded: "",
    status: "active" as "active" | "inactive" | "draft",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.entityId && hasPackageAccess) {
      fetchData();
    }
  }, [user, statusFilter, recurrenceFilter, hasPackageAccess]);

  const fetchData = async () => {
    if (!user?.entityId || !hasPackageAccess) return;

    try {
      const [packagesData, subscriptionsData, servicesRes] = await Promise.all([
        getPackages(user.entityId, {
          status: statusFilter,
          recurrence: recurrenceFilter,
        }),
        getSubscriptions(user.entityId),
        apiClient.get<Service[]>(`/api/services/entity/${user.entityId}`),
      ]);

      setPackages(Array.isArray(packagesData) ? packagesData : []);
      setSubscriptions(
        Array.isArray(subscriptionsData) ? subscriptionsData : []
      );
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Error already handled by usePackages hook
    }
  };

  const handleCreatePackage = async () => {
    try {
      if (!formData.name || formData.services.length === 0) {
        toast.error(t("packages:messages.fillRequired"));
        return;
      }

      const result = await createPackage({
        entityId: user?.entityId!,
        name: formData.name,
        description: formData.description,
        services: formData.services,
        packagePrice: Number(formData.packagePrice) || 0,
        currency: formData.currency,
        recurrence: formData.recurrence,
        validity: Number(formData.validity) || 30,
        sessionsIncluded: Number(formData.sessionsIncluded) || 1,
        status: formData.status,
      });

      if (result) {
        setIsCreateModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error: any) {
      console.error("Error creating package:", error);
      // Error already handled by usePackages hook
    }
  };

  const handleUpdatePackage = async () => {
    try {
      if (!selectedPackage) return;

      const result = await updatePackage(selectedPackage._id, {
        name: formData.name,
        description: formData.description,
        packagePrice: Number(formData.packagePrice) || 0,
        status: formData.status,
      });

      if (result) {
        setIsEditModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error: any) {
      console.error("Error updating package:", error);
      // Error already handled by usePackages hook
    }
  };

  const handleToggleStatus = async (packageId: string) => {
    const result = await togglePackageStatus(packageId);
    if (result) {
      fetchData();
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      if (!confirm(t("packages:messages.deleteConfirm"))) return;

      const success = await deletePackage(packageId);
      if (success) {
        fetchData();
      }
    } catch (error: any) {
      console.error("Error deleting package:", error);
      // Error already handled by usePackages hook
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      services: Array.isArray(pkg.services)
        ? pkg.services.map((s) => s._id)
        : [],
      packagePrice: pkg.pricing.packagePrice.toString(),
      currency: pkg.pricing.currency,
      recurrence: pkg.recurrence,
      validity: pkg.validity.toString(),
      sessionsIncluded: pkg.sessionsIncluded.toString(),
      status: pkg.status,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      services: [],
      packagePrice: "",
      currency: "BRL",
      recurrence: "one_time",
      validity: "",
      sessionsIncluded: "",
      status: "active",
    });
    setSelectedPackage(null);
  };

  const calculateOriginalPrice = () => {
    if (!Array.isArray(services)) return 0;
    return formData.services.reduce((sum, serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return sum + (service?.pricing.basePrice || 0);
    }, 0);
  };

  const calculateDiscount = () => {
    const originalPrice = calculateOriginalPrice();
    if (originalPrice === 0) return 0;
    const packagePrice = Number(formData.packagePrice) || 0;
    return ((originalPrice - packagePrice) / originalPrice) * 100;
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

    return (
      <Badge variant={variants[status] || "default"}>
        {t(`packages:status.${status}`, status)}
      </Badge>
    );
  };

  const getRecurrenceBadge = (recurrence: string) => {
    return recurrence === "monthly" ? (
      <Badge variant="default">
        <Calendar className="w-3 h-3 mr-1" />
        {t("packages:form.monthly")}
      </Badge>
    ) : (
      <Badge variant="outline">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {t("packages:form.oneTime")}
      </Badge>
    );
  };

  // Calculate statistics
  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.status === "active").length;
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  ).length;
  const totalRevenue = subscriptions.reduce(
    (sum, sub) => sum + sub.packageId.pricing.packagePrice,
    0
  );

  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Restriction for Simple Plan */}
      {!hasPackageAccess && (
        <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {t("packages:restrictions.title")}
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                  {t("packages:restrictions.description")}
                </p>
                <Button
                  onClick={() => {
                    const win = globalThis as typeof window;
                    if (win) win.location.href = "/entity/subscriptions-board";
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {t("packages:restrictions.upgrade")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show content if user has access */}
      {hasPackageAccess && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8" />
                {t("packages:title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("packages:description")}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <StatsGrid columns={5}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("packages:stats.totalPackages")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPackages}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activePackages} {t("packages:stats.active")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("packages:stats.activeSubscriptions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  {activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("packages:stats.of")} {totalSubscriptions}{" "}
                  {t("packages:stats.total")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("packages:stats.totalRevenue")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("packages:stats.fromSoldPackages")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("packages:stats.conversionRate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  {totalPackages > 0
                    ? ((activeSubscriptions / totalPackages) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("packages:stats.packagesConverted")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("packages:stats.avgDiscount")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  {packages.length > 0
                    ? (
                        packages.reduce(
                          (sum, p) => sum + p.pricing.discount,
                          0
                        ) / packages.length
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("packages:stats.offeredInPackages")}
                </p>
              </CardContent>
            </Card>
          </StatsGrid>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="packages">
                Pacotes ({totalPackages})
              </TabsTrigger>
              <TabsTrigger value="subscriptions">
                Assinaturas ({totalSubscriptions})
              </TabsTrigger>
            </TabsList>

            {/* Packages Tab */}
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
                      <SelectItem value="draft">Rascunhos</SelectItem>
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
                      <SelectItem value="monthly">Mensais</SelectItem>
                      <SelectItem value="one_time">Pagamento Único</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Pacote</DialogTitle>
                      <DialogDescription>
                        Configure um pacote com múltiplos serviços e preço
                        especial
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Pacote *</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Pacote Bronze"
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

                      {/* Services */}
                      <div className="space-y-2">
                        <Label>Serviços Inclusos *</Label>
                        <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                          {Array.isArray(services) && services.length > 0 ? (
                            services.map((service) => (
                              <div
                                key={service._id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`service-${service._id}`}
                                  checked={formData.services.includes(
                                    service._id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        services: [
                                          ...formData.services,
                                          service._id,
                                        ],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        services: formData.services.filter(
                                          (id) => id !== service._id
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
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No services available. Please create services
                              first.
                            </p>
                          )}
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
                          <Label htmlFor="packagePrice">
                            Preço do Pacote *
                          </Label>
                          <Input
                            id="packagePrice"
                            type="text"
                            placeholder="0.00"
                            value={formData.packagePrice}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                packagePrice: e.target.value,
                              })
                            }
                          />
                          {formData.services.length > 0 &&
                            Number(formData.packagePrice) > 0 && (
                              <p className="text-sm text-green-600">
                                Desconto: {calculateDiscount().toFixed(1)}%
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currency">Moeda</Label>
                          <Select
                            value={formData.currency}
                            onValueChange={(value) =>
                              setFormData({ ...formData, currency: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BRL">BRL (R$)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Recurrence and Validity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="recurrence">Recorrência *</Label>
                          <Select
                            value={formData.recurrence}
                            onValueChange={(value: "monthly" | "one_time") =>
                              setFormData({ ...formData, recurrence: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one_time">
                                Pagamento Único
                              </SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="validity">Validade (dias) *</Label>
                          <Input
                            id="validity"
                            type="text"
                            placeholder="30"
                            value={formData.validity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                validity: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Sessions and Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sessionsIncluded">
                            Sessões Incluídas *
                          </Label>
                          <Input
                            id="sessionsIncluded"
                            type="text"
                            placeholder="1"
                            value={formData.sessionsIncluded}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sessionsIncluded: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(
                              value: "active" | "inactive" | "draft"
                            ) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
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
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePackage}>
                        Criar Pacote
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                        <TableHead>Validade</TableHead>
                        <TableHead>Sessões</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
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
                              <div className="text-sm">
                                {pkg.services.length} serviços
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
                            <TableCell>{pkg.validity} dias</TableCell>
                            <TableCell>
                              {pkg.sessionsIncluded} sessões
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
                                >
                                  {pkg.status === "active" ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePackage(pkg._id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
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
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Pacote</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Sessões</TableHead>
                        <TableHead>Progresso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhuma assinatura encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscriptions.map((sub) => {
                          const usagePercentage =
                            (sub.sessionsUsed / sub.sessionsTotal) * 100;
                          return (
                            <TableRow key={sub._id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {sub.clientId.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {sub.clientId.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{sub.packageId.name}</TableCell>
                              <TableCell>
                                {getStatusBadge(sub.status)}
                              </TableCell>
                              <TableCell>
                                {format(new Date(sub.startDate), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(
                                    new Date(sub.expiryDate),
                                    "dd/MM/yyyy"
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {sub.sessionsUsed} / {sub.sessionsTotal}
                              </TableCell>
                              <TableCell>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${usagePercentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {usagePercentage.toFixed(0)}% usado
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
            </TabsContent>
          </Tabs>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Pacote</DialogTitle>
                <DialogDescription>
                  Atualize as informações do pacote
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Same form fields as create modal */}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-packagePrice">Preço do Pacote *</Label>
                    <Input
                      id="edit-packagePrice"
                      type="text"
                      placeholder="0.00"
                      value={formData.packagePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packagePrice: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive" | "draft") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
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
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePackage}>Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default PackageManagement;
