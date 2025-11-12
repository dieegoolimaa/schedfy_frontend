import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { usePromotions } from "@/hooks/usePromotions";
import { useServices } from "@/hooks/useServices";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Plus,
  Percent,
  Tag,
  TrendingDown,
  Edit2,
  Trash2,
  Copy,
  DollarSign,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Commission {
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  appliesTo: "service" | "professional" | "service_category";
  serviceIds?: string[];
  professionalIds?: string[];
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
}

interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  applicableServiceIds?: string[];
  minimumPurchase?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  status: "active" | "inactive" | "expired" | "depleted";
  validFrom: string;
  validUntil: string;
}

interface Discount {
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  appliesTo: "all_services" | "specific_services" | "first_time_clients";
  serviceIds?: string[];
  minimumPurchase?: number;
  status: "active" | "inactive" | "scheduled" | "expired";
  autoApply: boolean;
  validFrom: string;
  validUntil: string;
}

export function CommissionsManagementPage() {
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";
  const { userPackage } = usePermissions();
  const {
    createCommission,
    getCommissions,
    updateCommission,
    createVoucher,
    getVouchers,
    updateVoucher,
    createDiscount,
    getDiscounts,
    updateDiscount,
    deleteCommission,
    deleteVoucher,
    deleteDiscount,
  } = usePromotions();

  // Get services using the hook
  const { services: servicesData, fetchServices } = useServices({
    entityId,
    autoFetch: true,
  });

  // Helper function to format date for input type="date"
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0]; // Returns "yyyy-MM-dd"
    } catch {
      return "";
    }
  };

  // Check if user has access to financial features
  const hasFinancialAccess =
    userPackage === "Individual" || userPackage === "Business";

  // State
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Data for selection - services come from hook
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Commission Dialog State
  const [commissionDialog, setCommissionDialog] = useState(false);
  const [newCommission, setNewCommission] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    appliesTo: "service" as "service" | "professional" | "service_category",
    serviceIds: [] as string[],
    professionalIds: [] as string[],
    validFrom: "",
    validUntil: "",
  });

  // Voucher Dialog State
  const [voucherDialog, setVoucherDialog] = useState(false);
  const [newVoucher, setNewVoucher] = useState<any>({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minimumPurchase: "",
    maxUsageCount: "",
    applicableServiceIds: [] as string[],
    validFrom: "",
    validUntil: "",
  });

  // Discount Dialog State
  const [discountDialog, setDiscountDialog] = useState(false);
  const [newDiscount, setNewDiscount] = useState<any>({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    appliesTo: "all_services" as
      | "all_services"
      | "specific_services"
      | "first_time_clients",
    serviceIds: [] as string[],
    minimumPurchase: "",
    autoApply: false,
    validFrom: "",
    validUntil: "",
  });

  // Edit Dialog States
  const [editCommissionDialog, setEditCommissionDialog] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(
    null
  );
  const [editCommissionForm, setEditCommissionForm] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    appliesTo: "service" as "service" | "professional" | "service_category",
    serviceIds: [] as string[],
    professionalIds: [] as string[],
    validFrom: "",
    validUntil: "",
  });

  const [editVoucherDialog, setEditVoucherDialog] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [editVoucherForm, setEditVoucherForm] = useState<any>({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minimumPurchase: "",
    maxUsageCount: "",
    applicableServiceIds: [] as string[],
    validFrom: "",
    validUntil: "",
  });

  const [editDiscountDialog, setEditDiscountDialog] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [editDiscountForm, setEditDiscountForm] = useState<any>({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    appliesTo: "all_services" as
      | "all_services"
      | "specific_services"
      | "first_time_clients",
    serviceIds: [] as string[],
    minimumPurchase: "",
    autoApply: false,
    validFrom: "",
    validUntil: "",
  });

  // Handlers
  const handleCreateCommission = async () => {
    try {
      const result = await createCommission({
        entityId,
        name: newCommission.name,
        description: newCommission.description,
        type: newCommission.type as any,
        value: Number(newCommission.value) || 0,
        appliesTo: newCommission.appliesTo as any,
        serviceIds:
          newCommission.serviceIds.length > 0
            ? newCommission.serviceIds
            : undefined,
        professionalIds:
          newCommission.professionalIds.length > 0
            ? newCommission.professionalIds
            : undefined,
        isActive: true,
        validFrom: newCommission.validFrom || undefined,
        validUntil: newCommission.validUntil || undefined,
        createdBy: user?.id || "",
      });

      if (result) {
        setCommissionDialog(false);
        setNewCommission({
          name: "",
          description: "",
          type: "percentage",
          value: "",
          appliesTo: "service",
          serviceIds: [],
          professionalIds: [],
          validFrom: "",
          validUntil: "",
        });
        // Refresh the list
        fetchCommissions();
      }
    } catch (error) {
      // Error already handled by usePromotions
    }
  };

  const handleCreateVoucher = async () => {
    try {
      const payload: any = {
        entityId,
        code: newVoucher.code.toUpperCase(),
        name: newVoucher.name,
        description: newVoucher.description,
        type: newVoucher.type,
        value: Number(newVoucher.value) || 0,
        validFrom: newVoucher.validFrom,
        validUntil: newVoucher.validUntil,
        createdBy: user?.id || "",
        maxUsageCount: newVoucher.maxUsageCount
          ? Number(newVoucher.maxUsageCount)
          : undefined,
        minimumPurchase: newVoucher.minimumPurchase
          ? Number(newVoucher.minimumPurchase)
          : undefined,
        applicableServiceIds:
          newVoucher.applicableServiceIds.length > 0
            ? newVoucher.applicableServiceIds
            : undefined,
      };

      const result = await createVoucher(payload);

      if (result) {
        setVoucherDialog(false);
        setNewVoucher({
          code: "",
          name: "",
          description: "",
          type: "percentage",
          value: "",
          minimumPurchase: "",
          maxUsageCount: "",
          applicableServiceIds: [],
          validFrom: "",
          validUntil: "",
        });
        // Refresh the list
        fetchVouchers();
      }
    } catch (error) {
      // Error already handled by usePromotions
    }
  };

  const handleCreateDiscount = async () => {
    try {
      const payload: any = {
        entityId,
        name: newDiscount.name,
        description: newDiscount.description,
        type: newDiscount.type,
        value: Number(newDiscount.value) || 0,
        appliesTo: newDiscount.appliesTo,
        serviceIds:
          newDiscount.serviceIds.length > 0
            ? newDiscount.serviceIds
            : undefined,
        autoApply: !!newDiscount.autoApply,
        validFrom: newDiscount.validFrom,
        validUntil: newDiscount.validUntil,
        minimumPurchase: newDiscount.minimumPurchase
          ? Number(newDiscount.minimumPurchase)
          : undefined,
        createdBy: user?.id || "",
        priority: 1,
      };

      const result = await createDiscount(payload);

      if (result) {
        setDiscountDialog(false);
        setNewDiscount({
          name: "",
          description: "",
          type: "percentage",
          value: "",
          appliesTo: "all_services",
          serviceIds: [],
          minimumPurchase: "",
          autoApply: false,
          validFrom: "",
          validUntil: "",
        });
        // Refresh the list
        fetchDiscounts();
      }
    } catch (error) {
      // Error already handled by usePromotions
    }
  };

  // Delete handlers
  const handleDeleteCommission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commission rule?"))
      return;

    try {
      const success = await deleteCommission(id);
      if (success) {
        toast.success("Commission deleted successfully");
        fetchCommissions();
      }
    } catch (error) {
      console.error("Error deleting commission:", error);
      toast.error("Failed to delete commission");
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;

    try {
      const success = await deleteVoucher(id);
      if (success) {
        toast.success("Voucher deleted successfully");
        fetchVouchers();
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error("Failed to delete voucher");
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount rule?")) return;

    try {
      const success = await deleteDiscount(id);
      if (success) {
        toast.success("Discount deleted successfully");
        fetchDiscounts();
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Failed to delete discount");
    }
  };

  // Edit Handlers
  const openEditCommissionDialog = (commission: Commission) => {
    setEditingCommission(commission);
    setEditCommissionForm({
      name: commission.name,
      description: commission.description || "",
      type: commission.type,
      value: commission.value.toString(),
      appliesTo: commission.appliesTo,
      serviceIds: commission.serviceIds || [],
      professionalIds: commission.professionalIds || [],
      validFrom: formatDateForInput(commission.validFrom),
      validUntil: formatDateForInput(commission.validUntil),
    });
    setEditCommissionDialog(true);
  };

  const handleUpdateCommission = async () => {
    if (!editingCommission) return;

    try {
      const result = await updateCommission(editingCommission.id, {
        name: editCommissionForm.name,
        description: editCommissionForm.description,
        type: editCommissionForm.type as any,
        value: Number(editCommissionForm.value) || 0,
        appliesTo: editCommissionForm.appliesTo as any,
        serviceIds:
          editCommissionForm.serviceIds.length > 0
            ? editCommissionForm.serviceIds
            : undefined,
        professionalIds:
          editCommissionForm.professionalIds.length > 0
            ? editCommissionForm.professionalIds
            : undefined,
        validFrom: editCommissionForm.validFrom || undefined,
        validUntil: editCommissionForm.validUntil || undefined,
      });

      if (result) {
        toast.success("Commission updated successfully");
        setEditCommissionDialog(false);
        setEditingCommission(null);
        fetchCommissions();
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error("Failed to update commission");
    }
  };

  const openEditVoucherDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setEditVoucherForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || "",
      type: voucher.type,
      value: voucher.value.toString(),
      minimumPurchase: voucher.minimumPurchase?.toString() || "",
      maxUsageCount: voucher.maxUsageCount?.toString() || "",
      applicableServiceIds: voucher.applicableServiceIds || [],
      validFrom: formatDateForInput(voucher.validFrom),
      validUntil: formatDateForInput(voucher.validUntil),
    });
    setEditVoucherDialog(true);
  };

  const handleUpdateVoucher = async () => {
    if (!editingVoucher) return;

    try {
      const result = await updateVoucher(editingVoucher.id, {
        code: editVoucherForm.code,
        description: editVoucherForm.description,
        discountType: editVoucherForm.type as any,
        value: Number(editVoucherForm.value) || 0,
        minimumPurchase: editVoucherForm.minimumPurchase
          ? Number(editVoucherForm.minimumPurchase)
          : undefined,
        maxUsageCount: editVoucherForm.maxUsageCount
          ? Number(editVoucherForm.maxUsageCount)
          : undefined,
        applicableServiceIds:
          editVoucherForm.applicableServiceIds.length > 0
            ? editVoucherForm.applicableServiceIds
            : undefined,
        validFrom: editVoucherForm.validFrom || undefined,
        validUntil: editVoucherForm.validUntil || undefined,
      });

      if (result) {
        toast.success("Voucher updated successfully");
        setEditVoucherDialog(false);
        setEditingVoucher(null);
        fetchVouchers();
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("Failed to update voucher");
    }
  };

  const openEditDiscountDialog = (discount: Discount) => {
    setEditingDiscount(discount);
    setEditDiscountForm({
      name: discount.name,
      description: discount.description || "",
      type: discount.type,
      value: discount.value.toString(),
      appliesTo: discount.appliesTo,
      serviceIds: discount.serviceIds || [],
      minimumPurchase: discount.minimumPurchase?.toString() || "",
      autoApply: discount.autoApply,
      validFrom: formatDateForInput(discount.validFrom),
      validUntil: formatDateForInput(discount.validUntil),
    });
    setEditDiscountDialog(true);
  };

  const handleUpdateDiscount = async () => {
    if (!editingDiscount) return;

    try {
      const result = await updateDiscount(editingDiscount.id, {
        name: editDiscountForm.name,
        description: editDiscountForm.description,
        discountType: editDiscountForm.type as any,
        value: Number(editDiscountForm.value) || 0,
        appliesTo: editDiscountForm.appliesTo as any,
        serviceIds:
          editDiscountForm.serviceIds.length > 0
            ? editDiscountForm.serviceIds
            : undefined,
        autoApply: editDiscountForm.autoApply,
        validFrom: editDiscountForm.validFrom || undefined,
        validUntil: editDiscountForm.validUntil || undefined,
      });

      if (result) {
        toast.success("Discount updated successfully");
        setEditDiscountDialog(false);
        setEditingDiscount(null);
        fetchDiscounts();
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error("Failed to update discount");
    }
  };

  // Fetch functions
  const fetchCommissions = async () => {
    if (!hasFinancialAccess) return;
    const data = await getCommissions(entityId);
    const dataArray = Array.isArray(data) ? data : [];
    setCommissions(
      dataArray.map((c) => ({
        id: c._id,
        name: c.name,
        description: c.description,
        type: c.type as any,
        value: c.value,
        appliesTo: c.appliesTo as any,
        isActive: c.isActive,
        validFrom: c.validFrom?.toString(),
        validUntil: c.validUntil?.toString(),
      }))
    );
  };

  const fetchVouchers = async () => {
    if (!hasFinancialAccess) return;
    const data = await getVouchers(entityId);
    const dataArray = Array.isArray(data) ? data : [];
    setVouchers(
      dataArray.map((v: any) => ({
        id: v._id,
        code: v.code,
        name: v.name || v.code, // Fallback to code if name doesn't exist
        description: v.description,
        type: (v.type || v.discountType) as any,
        value: v.value,
        minimumPurchase: v.minimumPurchase,
        maxUsageCount: v.maxUsageCount,
        currentUsageCount: v.currentUsageCount,
        status: v.status as any,
        validFrom: v.validFrom.toString(),
        validUntil: v.validUntil.toString(),
      }))
    );
  };

  const fetchDiscounts = async () => {
    if (!hasFinancialAccess) return;
    const data = await getDiscounts(entityId);
    const dataArray = Array.isArray(data) ? data : [];
    setDiscounts(
      dataArray.map((d: any) => ({
        id: d._id,
        name: d.name,
        description: d.description,
        type: (d.type || d.discountType) as any,
        value: d.value,
        appliesTo: d.appliesTo as any,
        minimumPurchase: d.minimumPurchase || 0,
        status: d.status as any,
        autoApply: d.autoApply,
        validFrom: d.validFrom.toString(),
        validUntil: d.validUntil.toString(),
      }))
    );
  };

  // Load data on mount
  useEffect(() => {
    if (hasFinancialAccess && entityId) {
      fetchCommissions();
      fetchVouchers();
      fetchDiscounts();

      // Fetch professionals for commission assignment
      fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3173"
        }/users?role=PROFESSIONAL&entityId=${entityId}`
      )
        .then((res) => res.json())
        .then((data) => setProfessionals(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error loading professionals:", err));
    }
  }, [hasFinancialAccess, entityId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      expired: "bg-red-100 text-red-800 border-red-200",
      depleted: "bg-orange-100 text-orange-800 border-orange-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return variants[status] || variants.inactive;
  };

  return (
    <div className="space-y-8">
      {/* Access Restriction for Simple Plan */}
      {!hasFinancialAccess && (
        <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Financial Features Not Available
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                  Commissions, vouchers, and discounts are available for
                  Individual and Business plans only. Your Simple plan is
                  focused on appointment management.
                </p>
                <Button
                  onClick={() => {
                    const win = globalThis as typeof window;
                    if (win) win.location.href = "/entity/subscriptions-board";
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Upgrade to Individual or Business Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show content if user has access */}
      {hasFinancialAccess && (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Commissions & Promotions
              </h1>
              <p className="text-muted-foreground">
                Manage commissions, voucher codes, and automatic discounts
              </p>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Commissions
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {commissions.filter((c) => c.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {commissions.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Vouchers
                </CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vouchers.filter((v) => v.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {vouchers.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Discounts
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {discounts.filter((d) => d.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-apply: {discounts.filter((d) => d.autoApply).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Savings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€2,450</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="commissions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="commissions">
                <Percent className="h-4 w-4 mr-2" />
                Commissions
              </TabsTrigger>
              <TabsTrigger value="vouchers">
                <Tag className="h-4 w-4 mr-2" />
                Vouchers
              </TabsTrigger>
              <TabsTrigger value="discounts">
                <TrendingDown className="h-4 w-4 mr-2" />
                Discounts
              </TabsTrigger>
            </TabsList>

            {/* Commissions Tab */}
            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Commission Rules</CardTitle>
                      <CardDescription>
                        Define commission percentages or fixed amounts for
                        services and professionals
                      </CardDescription>
                    </div>
                    <Dialog
                      open={commissionDialog}
                      onOpenChange={setCommissionDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Commission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create Commission Rule</DialogTitle>
                          <DialogDescription>
                            Set up a new commission rule for services or
                            professionals
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="comm-name">Name *</Label>
                            <Input
                              id="comm-name"
                              placeholder="e.g., Haircut Commission"
                              value={newCommission.name}
                              onChange={(e) =>
                                setNewCommission({
                                  ...newCommission,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="comm-desc">Description</Label>
                            <Textarea
                              id="comm-desc"
                              placeholder="Optional description"
                              rows={2}
                              value={newCommission.description}
                              onChange={(e) =>
                                setNewCommission({
                                  ...newCommission,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={newCommission.type}
                                onValueChange={(value) =>
                                  setNewCommission({
                                    ...newCommission,
                                    type: value as "percentage" | "fixed",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage (%)
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    Fixed Amount (€)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Value</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newCommission.value}
                                onChange={(e) =>
                                  setNewCommission({
                                    ...newCommission,
                                    value: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Applies To</Label>
                            <Select
                              value={newCommission.appliesTo}
                              onValueChange={(value) =>
                                setNewCommission({
                                  ...newCommission,
                                  appliesTo: value as
                                    | "service"
                                    | "professional"
                                    | "service_category",
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="service">
                                  Specific Services
                                </SelectItem>
                                <SelectItem value="professional">
                                  Specific Professionals
                                </SelectItem>
                                <SelectItem value="service_category">
                                  Service Category
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Service Selection - only for service type */}
                          {newCommission.appliesTo === "service" && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>Select Services *</Label>
                              <p className="text-sm text-muted-foreground">
                                Choose which services receive this commission
                              </p>

                              {newCommission.serviceIds.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">
                                    Selected Services:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {servicesData
                                      .filter((s: any) =>
                                        newCommission.serviceIds.includes(s._id)
                                      )
                                      .map((service: any) => (
                                        <Badge
                                          key={service._id}
                                          variant="secondary"
                                          className="gap-1"
                                        >
                                          {service.name}
                                          <button
                                            onClick={() => {
                                              setNewCommission({
                                                ...newCommission,
                                                serviceIds:
                                                  newCommission.serviceIds.filter(
                                                    (id: string) =>
                                                      id !== service._id
                                                  ),
                                              });
                                            }}
                                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {servicesData
                                  .filter(
                                    (s: any) =>
                                      !newCommission.serviceIds.includes(s._id)
                                  )
                                  .map((service: any) => (
                                    <Button
                                      key={service._id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewCommission({
                                          ...newCommission,
                                          serviceIds: [
                                            ...newCommission.serviceIds,
                                            service._id,
                                          ],
                                        });
                                      }}
                                    >
                                      + {service.name}
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Professional Selection - only for professional type */}
                          {newCommission.appliesTo === "professional" && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>Select Professionals *</Label>
                              <p className="text-sm text-muted-foreground">
                                Choose which professionals receive this
                                commission
                              </p>

                              {newCommission.professionalIds.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">
                                    Selected Professionals:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {professionals
                                      .filter((p: any) =>
                                        newCommission.professionalIds.includes(
                                          p._id
                                        )
                                      )
                                      .map((professional: any) => (
                                        <Badge
                                          key={professional._id}
                                          variant="secondary"
                                          className="gap-1"
                                        >
                                          {professional.name ||
                                            `${professional.firstName} ${professional.lastName}`}
                                          <button
                                            onClick={() => {
                                              setNewCommission({
                                                ...newCommission,
                                                professionalIds:
                                                  newCommission.professionalIds.filter(
                                                    (id: string) =>
                                                      id !== professional._id
                                                  ),
                                              });
                                            }}
                                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {professionals
                                  .filter(
                                    (p: any) =>
                                      !newCommission.professionalIds.includes(
                                        p._id
                                      )
                                  )
                                  .map((professional: any) => (
                                    <Button
                                      key={professional._id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewCommission({
                                          ...newCommission,
                                          professionalIds: [
                                            ...newCommission.professionalIds,
                                            professional._id,
                                          ],
                                        });
                                      }}
                                    >
                                      +{" "}
                                      {professional.name ||
                                        `${professional.firstName} ${professional.lastName}`}
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valid From</Label>
                              <Input
                                type="date"
                                value={newCommission.validFrom}
                                onChange={(e) =>
                                  setNewCommission({
                                    ...newCommission,
                                    validFrom: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valid Until</Label>
                              <Input
                                type="date"
                                value={newCommission.validUntil}
                                onChange={(e) =>
                                  setNewCommission({
                                    ...newCommission,
                                    validUntil: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setCommissionDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleCreateCommission}>
                              Create Commission
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {commissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No commissions yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first commission rule to start tracking
                        earnings
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Applies To</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>Valid Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell className="font-medium">
                              {commission.name}
                            </TableCell>
                            <TableCell className="capitalize">
                              {commission.type}
                            </TableCell>
                            <TableCell>
                              {commission.type === "percentage"
                                ? `${commission.value}%`
                                : `€${commission.value}`}
                            </TableCell>
                            <TableCell className="capitalize">
                              {commission.appliesTo.replace("_", " ")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {commission.appliesTo === "service" &&
                                commission.serviceIds &&
                                commission.serviceIds.length > 0
                                  ? `${commission.serviceIds.length} service${
                                      commission.serviceIds.length > 1
                                        ? "s"
                                        : ""
                                    }`
                                  : commission.appliesTo === "professional" &&
                                    commission.professionalIds &&
                                    commission.professionalIds.length > 0
                                  ? `${
                                      commission.professionalIds.length
                                    } professional${
                                      commission.professionalIds.length > 1
                                        ? "s"
                                        : ""
                                    }`
                                  : commission.appliesTo === "service_category"
                                  ? "Category"
                                  : "None"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {commission.validFrom && commission.validUntil
                                ? `${new Date(
                                    commission.validFrom
                                  ).toLocaleDateString()} - ${new Date(
                                    commission.validUntil
                                  ).toLocaleDateString()}`
                                : "Permanent"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  commission.isActive
                                    ? getStatusBadge("active")
                                    : getStatusBadge("inactive")
                                }
                              >
                                {commission.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openEditCommissionDialog(commission)
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteCommission(commission.id)
                                  }
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </TabsContent>

            {/* Vouchers Tab - Continued in next message due to length */}
            <TabsContent value="vouchers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Voucher Codes</CardTitle>
                      <CardDescription>
                        Create and manage discount codes that clients can use at
                        checkout
                      </CardDescription>
                    </div>
                    <Dialog
                      open={voucherDialog}
                      onOpenChange={setVoucherDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Voucher
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Voucher Code</DialogTitle>
                          <DialogDescription>
                            Generate a new voucher code for customer discounts
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="vouch-code">Voucher Code *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="vouch-code"
                                placeholder="SUMMER2025"
                                value={newVoucher.code}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    code: e.target.value.toUpperCase(),
                                  })
                                }
                                className="font-mono uppercase"
                              />
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const randomCode = Math.random()
                                    .toString(36)
                                    .substring(2, 10)
                                    .toUpperCase();
                                  setNewVoucher({
                                    ...newVoucher,
                                    code: randomCode,
                                  });
                                }}
                              >
                                Generate
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vouch-name">Name *</Label>
                            <Input
                              id="vouch-name"
                              placeholder="Summer Promotion 2025"
                              value={newVoucher.name}
                              onChange={(e) =>
                                setNewVoucher({
                                  ...newVoucher,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vouch-desc">Description</Label>
                            <Textarea
                              id="vouch-desc"
                              placeholder="20% off all services in Summer"
                              rows={2}
                              value={newVoucher.description}
                              onChange={(e) =>
                                setNewVoucher({
                                  ...newVoucher,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Discount Type</Label>
                              <Select
                                value={newVoucher.type}
                                onValueChange={(value) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    type: value as "percentage" | "fixed",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage (%)
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    Fixed Amount (€)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Discount Value</Label>
                              <Input
                                type="number"
                                min="0"
                                max={
                                  newVoucher.type === "percentage"
                                    ? 100
                                    : undefined
                                }
                                step="0.01"
                                value={newVoucher.value}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    value: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Min. Purchase (€)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={newVoucher.minimumPurchase}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    // keep as string to avoid NaN in controlled input
                                    minimumPurchase: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Uses</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Unlimited"
                                value={newVoucher.maxUsageCount || ""}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    maxUsageCount:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valid From *</Label>
                              <Input
                                type="date"
                                value={newVoucher.validFrom}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    validFrom: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valid Until *</Label>
                              <Input
                                type="date"
                                value={newVoucher.validUntil}
                                onChange={(e) =>
                                  setNewVoucher({
                                    ...newVoucher,
                                    validUntil: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* Applicable Services */}
                          <div className="space-y-2 pt-2 border-t">
                            <Label>Applicable Services (Optional)</Label>
                            <p className="text-sm text-muted-foreground">
                              Select specific services or leave empty to apply
                              to all services
                            </p>
                            <Select
                              value={
                                newVoucher.applicableServiceIds.length > 0
                                  ? "specific"
                                  : "all"
                              }
                              onValueChange={(value) => {
                                if (value === "all") {
                                  setNewVoucher({
                                    ...newVoucher,
                                    applicableServiceIds: [],
                                  });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Services
                                </SelectItem>
                                <SelectItem value="specific">
                                  Specific Services
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {newVoucher.applicableServiceIds.length === 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {servicesData.map((service: any) => (
                                  <Button
                                    key={service._id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setNewVoucher({
                                        ...newVoucher,
                                        applicableServiceIds: [
                                          ...newVoucher.applicableServiceIds,
                                          service._id,
                                        ],
                                      });
                                    }}
                                  >
                                    {service.name}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {newVoucher.applicableServiceIds.length > 0 && (
                              <div className="space-y-2 mt-2">
                                <p className="text-sm font-medium">
                                  Selected Services:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {servicesData
                                    .filter((s: any) =>
                                      newVoucher.applicableServiceIds.includes(
                                        s._id
                                      )
                                    )
                                    .map((service: any) => (
                                      <Badge
                                        key={service._id}
                                        variant="secondary"
                                        className="gap-1"
                                      >
                                        {service.name}
                                        <button
                                          onClick={() => {
                                            setNewVoucher({
                                              ...newVoucher,
                                              applicableServiceIds:
                                                newVoucher.applicableServiceIds.filter(
                                                  (id: string) =>
                                                    id !== service._id
                                                ),
                                            });
                                          }}
                                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {servicesData
                                    .filter(
                                      (s: any) =>
                                        !newVoucher.applicableServiceIds.includes(
                                          s._id
                                        )
                                    )
                                    .map((service: any) => (
                                      <Button
                                        key={service._id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setNewVoucher({
                                            ...newVoucher,
                                            applicableServiceIds: [
                                              ...newVoucher.applicableServiceIds,
                                              service._id,
                                            ],
                                          });
                                        }}
                                      >
                                        + {service.name}
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setVoucherDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleCreateVoucher}>
                              Create Voucher
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {vouchers.length === 0 ? (
                    <div className="text-center py-12">
                      <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No vouchers yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create voucher codes to offer discounts to your clients
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Valid Period</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vouchers.map((voucher) => (
                          <TableRow key={voucher.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                  {voucher.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(voucher.code);
                                    toast.success("Code copied!");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {voucher.name}
                            </TableCell>
                            <TableCell>
                              {voucher.type === "percentage"
                                ? `${voucher.value}%`
                                : `€${voucher.value}`}
                            </TableCell>
                            <TableCell>
                              {voucher.currentUsageCount}
                              {voucher.maxUsageCount
                                ? ` / ${voucher.maxUsageCount}`
                                : " / ∞"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(voucher.validFrom).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                voucher.validUntil
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {voucher.applicableServiceIds &&
                                voucher.applicableServiceIds.length > 0
                                  ? `${
                                      voucher.applicableServiceIds.length
                                    } service${
                                      voucher.applicableServiceIds.length > 1
                                        ? "s"
                                        : ""
                                    }`
                                  : "All services"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(voucher.status)}>
                                {voucher.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditVoucherDialog(voucher)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteVoucher(voucher.id)
                                  }
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </TabsContent>

            {/* Discounts Tab */}
            <TabsContent value="discounts">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Automatic Discounts</CardTitle>
                      <CardDescription>
                        Set up automatic discounts that apply based on
                        conditions
                      </CardDescription>
                    </div>
                    <Dialog
                      open={discountDialog}
                      onOpenChange={setDiscountDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Discount
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Discount Rule</DialogTitle>
                          <DialogDescription>
                            Set up a new automatic or manual discount
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="disc-name">Name *</Label>
                            <Input
                              id="disc-name"
                              placeholder="e.g., First Time Client Discount"
                              value={newDiscount.name}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="disc-desc">Description</Label>
                            <Textarea
                              id="disc-desc"
                              placeholder="Optional description"
                              rows={2}
                              value={newDiscount.description}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Discount Type</Label>
                              <Select
                                value={newDiscount.type}
                                onValueChange={(value) =>
                                  setNewDiscount({
                                    ...newDiscount,
                                    type: value as "percentage" | "fixed",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">
                                    Percentage (%)
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    Fixed Amount (€)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Discount Value</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newDiscount.value}
                                onChange={(e) =>
                                  setNewDiscount({
                                    ...newDiscount,
                                    value: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Applies To</Label>
                            <Select
                              value={newDiscount.appliesTo}
                              onValueChange={(value) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  appliesTo: value as
                                    | "all_services"
                                    | "specific_services"
                                    | "first_time_clients",
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all_services">
                                  All Services
                                </SelectItem>
                                <SelectItem value="specific_services">
                                  Specific Services
                                </SelectItem>
                                <SelectItem value="first_time_clients">
                                  First-Time Clients
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Service Selection - only for specific_services */}
                          {newDiscount.appliesTo === "specific_services" && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>Select Services *</Label>
                              <p className="text-sm text-muted-foreground">
                                Choose which services this discount applies to
                              </p>

                              {newDiscount.serviceIds.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">
                                    Selected Services:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {servicesData
                                      .filter((s: any) =>
                                        newDiscount.serviceIds.includes(s._id)
                                      )
                                      .map((service: any) => (
                                        <Badge
                                          key={service._id}
                                          variant="secondary"
                                          className="gap-1"
                                        >
                                          {service.name}
                                          <button
                                            onClick={() => {
                                              setNewDiscount({
                                                ...newDiscount,
                                                serviceIds:
                                                  newDiscount.serviceIds.filter(
                                                    (id: string) =>
                                                      id !== service._id
                                                  ),
                                              });
                                            }}
                                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {servicesData
                                  .filter(
                                    (s: any) =>
                                      !newDiscount.serviceIds.includes(s._id)
                                  )
                                  .map((service: any) => (
                                    <Button
                                      key={service._id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewDiscount({
                                          ...newDiscount,
                                          serviceIds: [
                                            ...newDiscount.serviceIds,
                                            service._id,
                                          ],
                                        });
                                      }}
                                    >
                                      + {service.name}
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Minimum Purchase (€)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={newDiscount.minimumPurchase}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  // keep as string here to avoid NaN; parse on submit
                                  minimumPurchase: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="auto-apply"
                              checked={newDiscount.autoApply}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  autoApply: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <Label
                              htmlFor="auto-apply"
                              className="cursor-pointer"
                            >
                              Auto-apply at checkout
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valid From *</Label>
                              <Input
                                type="date"
                                value={newDiscount.validFrom}
                                onChange={(e) =>
                                  setNewDiscount({
                                    ...newDiscount,
                                    validFrom: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valid Until *</Label>
                              <Input
                                type="date"
                                value={newDiscount.validUntil}
                                onChange={(e) =>
                                  setNewDiscount({
                                    ...newDiscount,
                                    validUntil: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setDiscountDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleCreateDiscount}>
                              Create Discount
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {discounts.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No discounts yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create automatic discounts to boost bookings
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Applies To</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Auto-Apply</TableHead>
                          <TableHead>Valid Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              {discount.name}
                            </TableCell>
                            <TableCell className="capitalize">
                              {discount.type}
                            </TableCell>
                            <TableCell>
                              {discount.type === "percentage"
                                ? `${discount.value}%`
                                : `€${discount.value}`}
                            </TableCell>
                            <TableCell className="capitalize">
                              {discount.appliesTo.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {discount.appliesTo === "specific_services" &&
                                discount.serviceIds &&
                                discount.serviceIds.length > 0
                                  ? `${discount.serviceIds.length} service${
                                      discount.serviceIds.length > 1 ? "s" : ""
                                    }`
                                  : discount.appliesTo === "specific_services"
                                  ? "No services"
                                  : "All services"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {discount.autoApply ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(
                                discount.validFrom
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                discount.validUntil
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadge(discount.status)}
                              >
                                {discount.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openEditDiscountDialog(discount)
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteDiscount(discount.id)
                                  }
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </TabsContent>
          </Tabs>

          {/* Edit Commission Dialog */}
          <Dialog
            open={editCommissionDialog}
            onOpenChange={setEditCommissionDialog}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Commission</DialogTitle>
                <DialogDescription>
                  Update commission settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editCommissionForm.name}
                    onChange={(e) =>
                      setEditCommissionForm({
                        ...editCommissionForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editCommissionForm.description}
                    onChange={(e) =>
                      setEditCommissionForm({
                        ...editCommissionForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={editCommissionForm.type}
                      onValueChange={(value: any) =>
                        setEditCommissionForm({
                          ...editCommissionForm,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      type="text"
                      value={editCommissionForm.value}
                      onChange={(e) =>
                        setEditCommissionForm({
                          ...editCommissionForm,
                          value: e.target.value,
                        })
                      }
                      placeholder={
                        editCommissionForm.type === "percentage"
                          ? "10"
                          : "50.00"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Applies To *</Label>
                  <Select
                    value={editCommissionForm.appliesTo}
                    onValueChange={(value: any) =>
                      setEditCommissionForm({
                        ...editCommissionForm,
                        appliesTo: value,
                        serviceIds: [],
                        professionalIds: [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Specific Services</SelectItem>
                      <SelectItem value="professional">
                        Specific Professionals
                      </SelectItem>
                      <SelectItem value="service_category">
                        Service Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                {editCommissionForm.appliesTo === "service" && (
                  <div className="space-y-2">
                    <Label>Select Services *</Label>
                    {editCommissionForm.serviceIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {servicesData
                          .filter((s: any) =>
                            editCommissionForm.serviceIds.includes(s._id)
                          )
                          .map((service: any) => (
                            <Badge key={service._id} variant="secondary">
                              {service.name}
                              <button
                                onClick={() =>
                                  setEditCommissionForm({
                                    ...editCommissionForm,
                                    serviceIds:
                                      editCommissionForm.serviceIds.filter(
                                        (id) => id !== service._id
                                      ),
                                  })
                                }
                                className="ml-1"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {servicesData
                        .filter(
                          (s: any) =>
                            !editCommissionForm.serviceIds.includes(s._id)
                        )
                        .map((service: any) => (
                          <Button
                            key={service._id}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditCommissionForm({
                                ...editCommissionForm,
                                serviceIds: [
                                  ...editCommissionForm.serviceIds,
                                  service._id,
                                ],
                              })
                            }
                          >
                            + {service.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Professional Selection */}
                {editCommissionForm.appliesTo === "professional" && (
                  <div className="space-y-2">
                    <Label>Select Professionals *</Label>
                    {editCommissionForm.professionalIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {professionals
                          .filter((p: any) =>
                            editCommissionForm.professionalIds.includes(p._id)
                          )
                          .map((professional: any) => (
                            <Badge key={professional._id} variant="secondary">
                              {professional.name ||
                                `${professional.firstName} ${professional.lastName}`}
                              <button
                                onClick={() =>
                                  setEditCommissionForm({
                                    ...editCommissionForm,
                                    professionalIds:
                                      editCommissionForm.professionalIds.filter(
                                        (id) => id !== professional._id
                                      ),
                                  })
                                }
                                className="ml-1"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {professionals
                        .filter(
                          (p: any) =>
                            !editCommissionForm.professionalIds.includes(p._id)
                        )
                        .map((professional: any) => (
                          <Button
                            key={professional._id}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditCommissionForm({
                                ...editCommissionForm,
                                professionalIds: [
                                  ...editCommissionForm.professionalIds,
                                  professional._id,
                                ],
                              })
                            }
                          >
                            +{" "}
                            {professional.name ||
                              `${professional.firstName} ${professional.lastName}`}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={editCommissionForm.validFrom}
                      onChange={(e) =>
                        setEditCommissionForm({
                          ...editCommissionForm,
                          validFrom: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={editCommissionForm.validUntil}
                      onChange={(e) =>
                        setEditCommissionForm({
                          ...editCommissionForm,
                          validUntil: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditCommissionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCommission}>
                    Update Commission
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Voucher Dialog */}
          <Dialog open={editVoucherDialog} onOpenChange={setEditVoucherDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Voucher</DialogTitle>
                <DialogDescription>Update voucher settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={editVoucherForm.code}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={editVoucherForm.name}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editVoucherForm.description}
                    onChange={(e) =>
                      setEditVoucherForm({
                        ...editVoucherForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={editVoucherForm.type}
                      onValueChange={(value: any) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      type="text"
                      value={editVoucherForm.value}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Applicable Services */}
                <div className="space-y-2">
                  <Label>Applicable Services (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Leave empty to apply to all services
                  </p>
                  {editVoucherForm.applicableServiceIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {servicesData
                        .filter((s: any) =>
                          editVoucherForm.applicableServiceIds.includes(s._id)
                        )
                        .map((service: any) => (
                          <Badge key={service._id} variant="secondary">
                            {service.name}
                            <button
                              onClick={() =>
                                setEditVoucherForm({
                                  ...editVoucherForm,
                                  applicableServiceIds:
                                    editVoucherForm.applicableServiceIds.filter(
                                      (id: string) => id !== service._id
                                    ),
                                })
                              }
                              className="ml-1"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {servicesData
                      .filter(
                        (s: any) =>
                          !editVoucherForm.applicableServiceIds.includes(s._id)
                      )
                      .map((service: any) => (
                        <Button
                          key={service._id}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditVoucherForm({
                              ...editVoucherForm,
                              applicableServiceIds: [
                                ...editVoucherForm.applicableServiceIds,
                                service._id,
                              ],
                            })
                          }
                        >
                          + {service.name}
                        </Button>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Purchase</Label>
                    <Input
                      type="text"
                      value={editVoucherForm.minimumPurchase}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          minimumPurchase: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Usage Count</Label>
                    <Input
                      type="text"
                      value={editVoucherForm.maxUsageCount}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          maxUsageCount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valid From *</Label>
                    <Input
                      type="date"
                      value={editVoucherForm.validFrom}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          validFrom: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until *</Label>
                    <Input
                      type="date"
                      value={editVoucherForm.validUntil}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          validUntil: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditVoucherDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateVoucher}>Update Voucher</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Discount Dialog */}
          <Dialog
            open={editDiscountDialog}
            onOpenChange={setEditDiscountDialog}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Discount</DialogTitle>
                <DialogDescription>Update discount settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editDiscountForm.name}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editDiscountForm.description}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={editDiscountForm.type}
                      onValueChange={(value: any) =>
                        setEditDiscountForm({
                          ...editDiscountForm,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      type="text"
                      value={editDiscountForm.value}
                      onChange={(e) =>
                        setEditDiscountForm({
                          ...editDiscountForm,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Applies To *</Label>
                  <Select
                    value={editDiscountForm.appliesTo}
                    onValueChange={(value: any) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        appliesTo: value,
                        serviceIds: [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_services">All Services</SelectItem>
                      <SelectItem value="specific_services">
                        Specific Services
                      </SelectItem>
                      <SelectItem value="first_time_clients">
                        First-Time Clients
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                {editDiscountForm.appliesTo === "specific_services" && (
                  <div className="space-y-2">
                    <Label>Select Services *</Label>
                    {editDiscountForm.serviceIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {servicesData
                          .filter((s: any) =>
                            editDiscountForm.serviceIds.includes(s._id)
                          )
                          .map((service: any) => (
                            <Badge key={service._id} variant="secondary">
                              {service.name}
                              <button
                                onClick={() =>
                                  setEditDiscountForm({
                                    ...editDiscountForm,
                                    serviceIds:
                                      editDiscountForm.serviceIds.filter(
                                        (id: string) => id !== service._id
                                      ),
                                  })
                                }
                                className="ml-1"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {servicesData
                        .filter(
                          (s: any) =>
                            !editDiscountForm.serviceIds.includes(s._id)
                        )
                        .map((service: any) => (
                          <Button
                            key={service._id}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditDiscountForm({
                                ...editDiscountForm,
                                serviceIds: [
                                  ...editDiscountForm.serviceIds,
                                  service._id,
                                ],
                              })
                            }
                          >
                            + {service.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Minimum Purchase</Label>
                  <Input
                    type="text"
                    value={editDiscountForm.minimumPurchase}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        minimumPurchase: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editDiscountForm.autoApply}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        autoApply: e.target.checked,
                      })
                    }
                  />
                  <Label>Auto-apply discount</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valid From *</Label>
                    <Input
                      type="date"
                      value={editDiscountForm.validFrom}
                      onChange={(e) =>
                        setEditDiscountForm({
                          ...editDiscountForm,
                          validFrom: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until *</Label>
                    <Input
                      type="date"
                      value={editDiscountForm.validUntil}
                      onChange={(e) =>
                        setEditDiscountForm({
                          ...editDiscountForm,
                          validUntil: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditDiscountDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateDiscount}>
                    Update Discount
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
