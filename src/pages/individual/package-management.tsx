import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { user } = useAuth();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
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
    packagePrice: 0,
    currency: "BRL",
    recurrence: "one_time" as "monthly" | "one_time",
    validity: 30,
    sessionsIncluded: 1,
    status: "active" as "active" | "inactive" | "draft",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.entityId) {
      fetchData();
    }
  }, [user, statusFilter, recurrenceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build query params manually
      const packagesUrl = `/api/packages/entity/${
        user?.entityId
      }?${new URLSearchParams({
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(recurrenceFilter !== "all" && { recurrence: recurrenceFilter }),
      } as any)}`;

      const [packagesRes, subscriptionsRes, servicesRes] = await Promise.all([
        apiClient.get<ServicePackage[]>(packagesUrl),
        apiClient.get<PackageSubscription[]>(
          `/api/packages/subscriptions/entity/${user?.entityId}`
        ),
        apiClient.get<Service[]>(`/api/services/entity/${user?.entityId}`),
      ]);

      setPackages(packagesRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      if (!formData.name || formData.services.length === 0) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      await apiClient.post("/api/packages", {
        entityId: user?.entityId,
        ...formData,
      });

      toast.success("Pacote criado com sucesso!");
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error creating package:", error);
      toast.error(error.response?.data?.message || "Erro ao criar pacote");
    }
  };

  const handleUpdatePackage = async () => {
    try {
      if (!selectedPackage) return;

      await apiClient.patch(`/api/packages/${selectedPackage._id}`, formData);

      toast.success("Pacote atualizado com sucesso!");
      setIsEditModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error updating package:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar pacote");
    }
  };

  const handleToggleStatus = async (packageId: string) => {
    try {
      await apiClient.patch(`/api/packages/${packageId}/toggle-status`);
      toast.success("Status atualizado com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar status");
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      if (!confirm("Tem certeza que deseja excluir este pacote?")) return;

      await apiClient.delete(`/api/packages/${packageId}`);
      toast.success("Pacote excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting package:", error);
      toast.error(error.response?.data?.message || "Erro ao excluir pacote");
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      services: pkg.services.map((s) => s._id),
      packagePrice: pkg.pricing.packagePrice,
      currency: pkg.pricing.currency,
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
      currency: "BRL",
      recurrence: "one_time",
      validity: 30,
      sessionsIncluded: 1,
      status: "active",
    });
    setSelectedPackage(null);
  };

  const calculateOriginalPrice = () => {
    return formData.services.reduce((sum, serviceId) => {
      const service = services.find((s) => s._id === serviceId);
      return sum + (service?.pricing.basePrice || 0);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Gerenciamento de Pacotes
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie pacotes de serviços com preços especiais
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activePackages} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              {activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {totalSubscriptions} totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              R$ {totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de pacotes vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
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
              pacotes convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Desconto Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              {packages.length > 0
                ? (
                    packages.reduce((sum, p) => sum + p.pricing.discount, 0) /
                    packages.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              oferecido nos pacotes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Pacotes ({totalPackages})</TabsTrigger>
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
                    Configure um pacote com múltiplos serviços e preço especial
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
                      {services.map((service) => (
                        <div
                          key={service._id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`service-${service._id}`}
                            checked={formData.services.includes(service._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  services: [...formData.services, service._id],
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
                            {service.name} - R${" "}
                            {service.pricing.basePrice.toFixed(2)}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.services.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Preço original:</strong> R${" "}
                        {calculateOriginalPrice().toFixed(2)}
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
                        value={formData.packagePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packagePrice: parseFloat(e.target.value),
                          })
                        }
                      />
                      {formData.services.length > 0 &&
                        formData.packagePrice > 0 && (
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
                        type="number"
                        min="7"
                        value={formData.validity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validity: parseInt(e.target.value),
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
                        type="number"
                        min="1"
                        value={formData.sessionsIncluded}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sessionsIncluded: parseInt(e.target.value),
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
                  <Button onClick={handleCreatePackage}>Criar Pacote</Button>
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
                              R$ {pkg.pricing.packagePrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground line-through">
                              R$ {pkg.pricing.originalPrice.toFixed(2)}
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
                        <TableCell>{pkg.sessionsIncluded} sessões</TableCell>
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
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell>
                            {format(new Date(sub.startDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(sub.expiryDate), "dd/MM/yyyy")}
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
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.packagePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packagePrice: parseFloat(e.target.value),
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
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePackage}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;
