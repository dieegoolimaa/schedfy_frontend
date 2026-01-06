import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";

import { usePromotions } from "@/hooks/usePromotions";
import { useServices } from "@/hooks/useServices";
import { useBookings } from "@/hooks/useBookings";
import { useCurrency } from "../../hooks/useCurrency";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatsGrid } from "../../components/ui/stats-grid";
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
import { ServiceBadgeList } from "../../components/ui/service-badge-list";
import { ProfessionalBadgeList } from "../../components/ui/professional-badge-list";
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
import { Commission, Voucher, Discount } from "@/types/models/promotions.interface";

export function CommissionsManagementPage() {
  const { t } = useTranslation("commissions");
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const { formatCurrency } = useCurrency();
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
  const { services: servicesData } = useServices({
    entityId,
    autoFetch: true,
  });

  // Get bookings to calculate savings
  const { bookings } = useBookings({
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
    user?.plan === "individual" || user?.plan === "business";

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
      console.log('Creating commission payload:', {
        entityId,
        name: newCommission.name,
        description: newCommission.description,
        type: newCommission.type,
        value: Number(newCommission.value) || 0,
        appliesTo: newCommission.appliesTo,
        serviceIds:
          newCommission.serviceIds.length > 0
            ? newCommission.serviceIds
            : undefined,
        professionalIds:
          newCommission.professionalIds.length > 0
            ? newCommission.professionalIds
            : undefined,
        isActive: true,
        validFrom: newCommission.validFrom,
        validUntil: newCommission.validUntil,
        serviceCategoryIds: [],
        createdBy: user?.id || "",
      });
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
        serviceCategoryIds: (newCommission as any).serviceCategoryIds || [],
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
        applicableDays: (newVoucher as any).applicableDays || [],
      };

      console.log('Creating voucher payload:', payload);
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
        serviceCategoryIds: (newDiscount as any).serviceCategoryIds || [],
        applicableDays: (newDiscount as any).applicableDays || [],
        applicableTimeStart: undefined,
        applicableTimeEnd: undefined,
        autoApply: !!newDiscount.autoApply,
        validFrom: newDiscount.validFrom,
        validUntil: newDiscount.validUntil,
        minimumPurchase: newDiscount.minimumPurchase
          ? Number(newDiscount.minimumPurchase)
          : undefined,
        createdBy: user?.id || "",
        priority: 1,
      };

      console.log('Creating discount payload:', payload);
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
      appliesTo: commission.appliesTo as any,
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
      console.log('Updating commission payload:', {
        id: editingCommission._id,
        name: editCommissionForm.name,
        description: editCommissionForm.description,
        type: editCommissionForm.type,
        value: Number(editCommissionForm.value) || 0,
        appliesTo: editCommissionForm.appliesTo,
        serviceIds:
          editCommissionForm.serviceIds.length > 0
            ? editCommissionForm.serviceIds
            : undefined,
        professionalIds:
          editCommissionForm.professionalIds.length > 0
            ? editCommissionForm.professionalIds
            : undefined,
        validFrom: editCommissionForm.validFrom,
        validUntil: editCommissionForm.validUntil,
      });
      const result = await updateCommission(editingCommission._id, {
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
      console.log('Updating voucher payload:', {
        id: editingVoucher._id,
        code: editVoucherForm.code,
        description: editVoucherForm.description,
        type: editVoucherForm.type,
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
        validFrom: editVoucherForm.validFrom,
        validUntil: editVoucherForm.validUntil,
      });
      const result = await updateVoucher(editingVoucher._id, {
        code: editVoucherForm.code,
        description: editVoucherForm.description,
        type: editVoucherForm.type as any, // Note: Backend might ignore this if type update is not supported
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
      console.log('Updating discount payload:', {
        id: editingDiscount._id,
        name: editDiscountForm.name,
        description: editDiscountForm.description,
        type: editDiscountForm.type,
        value: Number(editDiscountForm.value) || 0,
        appliesTo: editDiscountForm.appliesTo,
        serviceIds:
          editDiscountForm.serviceIds.length > 0
            ? editDiscountForm.serviceIds
            : undefined,
        autoApply: editDiscountForm.autoApply,
        validFrom: editDiscountForm.validFrom,
        validUntil: editDiscountForm.validUntil,
      });
      const result = await updateDiscount(editingDiscount._id, {
        name: editDiscountForm.name,
        description: editDiscountForm.description,
        type: editDiscountForm.type as any,
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
    setCommissions(data || []);
  };

  const fetchVouchers = async () => {
    if (!hasFinancialAccess) return;
    const data = await getVouchers(entityId);
    setVouchers(data || []);
  };

  const fetchDiscounts = async () => {
    if (!hasFinancialAccess) return;
    const data = await getDiscounts(entityId);
    setDiscounts(data || []);
  };

  // Load data on mount
  useEffect(() => {
    if (hasFinancialAccess && entityId) {
      fetchCommissions();
      fetchVouchers();
      fetchDiscounts();

      // Fetch professionals for commission assignment
      fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3173"
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
                  {t("access.title")}
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                  {t("access.description")}
                </p>
                <Button
                  onClick={() => {
                    const win = globalThis as typeof window;
                    if (win) win.location.href = "/entity/subscriptions-board";
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {t("access.upgrade")}
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
                {t("title")}
              </h1>
              <p className="text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Overview Stats */}
          <StatsGrid columns={4}>
            <Card className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                <CardTitle className="text-sm font-medium">
                  {t("stats.activeCommissions")}
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {commissions.filter((c) => c.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.total")}: {commissions.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.activeVouchers")}
                </CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vouchers.filter((v) => v.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.total")}: {vouchers.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.activeDiscounts")}
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {discounts.filter((d) => d.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.autoApply")}: {discounts.filter((d) => d.autoApply).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("stats.totalSavings")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €
                  {(() => {
                    const now = new Date();
                    const startOfMonth = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      1
                    );
                    const monthlyBookings = Array.isArray(bookings)
                      ? bookings.filter(
                        (b) => new Date(b.createdAt) >= startOfMonth
                      )
                      : [];
                    const totalSavings = monthlyBookings.reduce(
                      (sum, booking) => {
                        return sum + (booking.pricing?.discountAmount || 0);
                      },
                      0
                    );
                    return totalSavings.toFixed(2);
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">{t("stats.thisMonth")}</p>
              </CardContent>
            </Card>
          </StatsGrid>

          {/* Tabs */}
          <Tabs defaultValue="commissions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="commissions">
                <Percent className="h-4 w-4 mr-2" />
                {t("tabs.commissions")}
              </TabsTrigger>
              <TabsTrigger value="vouchers">
                <Tag className="h-4 w-4 mr-2" />
                {t("tabs.vouchers")}
              </TabsTrigger>
              <TabsTrigger value="discounts">
                <TrendingDown className="h-4 w-4 mr-2" />
                {t("tabs.discounts")}
              </TabsTrigger>
            </TabsList>

            {/* Commissions Tab */}
            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("commissions.title")}</CardTitle>
                      <CardDescription>
                        {t("commissions.description")}
                      </CardDescription>
                    </div>
                    <Dialog
                      open={commissionDialog}
                      onOpenChange={setCommissionDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("commissions.add")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("dialog.createCommission")}</DialogTitle>
                          <DialogDescription>
                            {t("commissions.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="comm-name">{t("commissions.form.name")} *</Label>
                            <Input
                              id="comm-name"
                              placeholder={t("commissions.form.namePlaceholder")}
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
                            <Label htmlFor="comm-desc">{t("commissions.form.description")}</Label>
                            <Textarea
                              id="comm-desc"
                              placeholder={t("commissions.form.descriptionPlaceholder")}
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
                              <Label>{t("commissions.form.type")}</Label>
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
                                    {t("commissions.form.percentage")}
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    {t("commissions.form.fixed")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("commissions.form.value")}</Label>
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
                                  {t("commissions.form.service")}
                                </SelectItem>
                                <SelectItem value="professional">
                                  {t("commissions.form.professional")}
                                </SelectItem>
                                <SelectItem value="service_category">
                                  {t("commissions.form.category")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Service Selection - only for service type */}
                          {newCommission.appliesTo === "service" && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>{t("commissions.form.services")} *</Label>
                              <p className="text-sm text-muted-foreground">
                                {t("commissions.description")}
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
                                            type="button"
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
                                      type="button"
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
                              <Label>{t("commissions.form.professionals")} *</Label>
                              <p className="text-sm text-muted-foreground">
                                {t("commissions.description")}
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
                                            type="button"
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
                                      type="button"
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
                              <Label>{t("commissions.form.validFrom")}</Label>
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
                              <Label>{t("commissions.form.validUntil")}</Label>
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
                              {t("dialog.cancel")}
                            </Button>
                            <Button onClick={handleCreateCommission}>
                              {t("dialog.create")}
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
                          <TableHead>{t("commissions.table.name")}</TableHead>
                          <TableHead>{t("commissions.table.type")}</TableHead>
                          <TableHead>{t("commissions.table.value")}</TableHead>
                          <TableHead>{t("commissions.table.appliesTo")}</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>{t("commissions.table.validity")}</TableHead>
                          <TableHead>{t("commissions.table.status")}</TableHead>
                          <TableHead className="w-[100px]">{t("commissions.table.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((commission) => (
                          <TableRow key={commission._id}>
                            <TableCell className="font-medium">
                              {commission.name}
                            </TableCell>
                            <TableCell className="capitalize">
                              {commission.type}
                            </TableCell>
                            <TableCell>
                              {commission.type === "percentage"
                                ? `${commission.value}%`
                                : formatCurrency(commission.value)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {commission.appliesTo.replace("_", " ")}
                            </TableCell>
                            <TableCell>
                              {commission.appliesTo === "service" && commission.serviceIds && commission.serviceIds.length > 0 ? (
                                <ServiceBadgeList
                                  serviceIds={commission.serviceIds}
                                  services={servicesData}
                                  maxDisplay={2}
                                />
                              ) : commission.appliesTo === "professional" && commission.professionalIds && commission.professionalIds.length > 0 ? (
                                <ProfessionalBadgeList
                                  professionalIds={commission.professionalIds}
                                  professionals={professionals}
                                  maxDisplay={2}
                                />
                              ) : commission.appliesTo === "service_category" ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  By Category
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not specified</span>
                              )}
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
                                    handleDeleteCommission(commission._id)
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
                      <CardTitle>{t("vouchers.title")}</CardTitle>
                      <CardDescription>
                        {t("vouchers.description")}
                      </CardDescription>
                    </div>
                    <Dialog
                      open={voucherDialog}
                      onOpenChange={setVoucherDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("vouchers.add")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("dialog.createVoucher")}</DialogTitle>
                          <DialogDescription>
                            {t("vouchers.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="vouch-code">{t("vouchers.form.code")} *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="vouch-code"
                                placeholder={t("vouchers.form.codePlaceholder")}
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
                            <Label htmlFor="vouch-name">{t("vouchers.form.name")} *</Label>
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
                            <Label htmlFor="vouch-desc">{t("vouchers.form.description")}</Label>
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
                              <Label>{t("vouchers.form.type")}</Label>
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
                                    {t("commissions.form.percentage")}
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    {t("commissions.form.fixed")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("vouchers.form.value")}</Label>
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
                              <Label>{t("vouchers.form.minPurchase")} (€)</Label>
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
                              <Label>{t("vouchers.form.maxUsage")}</Label>
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
                              <Label>{t("commissions.form.validFrom")} *</Label>
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
                              <Label>{t("commissions.form.validUntil")} *</Label>
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
                            <Label>{t("vouchers.form.applicableServices")} (Optional)</Label>
                            <p className="text-sm text-muted-foreground">
                              {t("vouchers.description")}
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
                                  {t("discounts.form.allServices")}
                                </SelectItem>
                                <SelectItem value="specific">
                                  {t("commissions.form.service")}
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
                              {t("dialog.cancel")}
                            </Button>
                            <Button onClick={handleCreateVoucher}>
                              {t("dialog.create")}
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
                        {t("vouchers.empty.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("vouchers.empty.description")}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("vouchers.table.code")}</TableHead>
                          <TableHead>{t("vouchers.table.name")}</TableHead>
                          <TableHead>{t("vouchers.table.discount")}</TableHead>
                          <TableHead>{t("vouchers.table.usage")}</TableHead>
                          <TableHead>{t("vouchers.table.validity")}</TableHead>
                          <TableHead>{t("vouchers.table.services")}</TableHead>
                          <TableHead>{t("vouchers.table.status")}</TableHead>
                          <TableHead className="w-[100px]">{t("vouchers.table.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vouchers.map((voucher) => (
                          <TableRow key={voucher._id}>
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
                                    toast.success(t("vouchers.codeCopied"));
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
                                : formatCurrency(voucher.value)}
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
                              <ServiceBadgeList
                                serviceIds={voucher.applicableServiceIds || []}
                                services={servicesData}
                                maxDisplay={2}
                              />
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
                                    handleDeleteVoucher(voucher._id)
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
                      <CardTitle>{t("discounts.title")}</CardTitle>
                      <CardDescription>
                        {t("discounts.description")}
                      </CardDescription>
                    </div>
                    <Dialog
                      open={discountDialog}
                      onOpenChange={setDiscountDialog}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("discounts.add")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("dialog.createDiscount")}</DialogTitle>
                          <DialogDescription>
                            {t("discounts.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="disc-name">{t("discounts.form.name")} *</Label>
                            <Input
                              id="disc-name"
                              placeholder={t("discounts.form.namePlaceholder")}
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
                            <Label htmlFor="disc-desc">{t("discounts.form.description")}</Label>
                            <Textarea
                              id="disc-desc"
                              placeholder={t("discounts.form.descriptionPlaceholder")}
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
                              <Label>{t("discounts.form.type")}</Label>
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
                                    {t("commissions.form.percentage")}
                                  </SelectItem>
                                  <SelectItem value="fixed">
                                    {t("commissions.form.fixed")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("discounts.form.value")}</Label>
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
                            <Label>{t("discounts.form.appliesTo")}</Label>
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
                                  {t("discounts.form.allServices")}
                                </SelectItem>
                                <SelectItem value="specific_services">
                                  {t("discounts.form.specificServices")}
                                </SelectItem>
                                <SelectItem value="first_time_clients">
                                  {t("discounts.form.firstTimeClients")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Service Selection - only for specific_services */}
                          {newDiscount.appliesTo === "specific_services" && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label>{t("discounts.form.selectServices")} *</Label>
                              <p className="text-sm text-muted-foreground">
                                {t("discounts.description")}
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
                            <Label>{t("discounts.form.minPurchase")} (€)</Label>
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
                              {t("discounts.form.autoApply")}
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t("commissions.form.validFrom")} *</Label>
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
                              <Label>{t("commissions.form.validUntil")} *</Label>
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
                              {t("dialog.cancel")}
                            </Button>
                            <Button onClick={handleCreateDiscount}>
                              {t("dialog.create")}
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
                        {t("discounts.empty.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("discounts.empty.description")}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("discounts.table.name")}</TableHead>
                          <TableHead>{t("discounts.table.type")}</TableHead>
                          <TableHead>{t("discounts.table.value")}</TableHead>
                          <TableHead>{t("discounts.table.appliesTo")}</TableHead>
                          <TableHead>{t("discounts.table.services")}</TableHead>
                          <TableHead>{t("discounts.table.autoApply")}</TableHead>
                          <TableHead>{t("discounts.table.validity")}</TableHead>
                          <TableHead>{t("discounts.table.status")}</TableHead>
                          <TableHead className="w-[100px]">{t("discounts.table.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discounts.map((discount) => (
                          <TableRow key={discount._id}>
                            <TableCell className="font-medium">
                              {discount.name}
                            </TableCell>
                            <TableCell className="capitalize">
                              {t(`commissions.form.${discount.type}`)}
                            </TableCell>
                            <TableCell>
                              {discount.type === "percentage"
                                ? `${discount.value}%`
                                : formatCurrency(discount.value)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {discount.appliesTo === "all_services"
                                ? t("discounts.form.allServices")
                                : discount.appliesTo === "specific_services"
                                  ? t("discounts.form.specificServices")
                                  : discount.appliesTo === "first_time_clients"
                                    ? t("discounts.form.firstTime")
                                    : discount.appliesTo}
                            </TableCell>
                            <TableCell>
                              {discount.appliesTo === "specific_services" ? (
                                <ServiceBadgeList
                                  serviceIds={discount.serviceIds || []}
                                  services={servicesData}
                                  maxDisplay={2}
                                />
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {t("discounts.form.allServices")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {discount.autoApply ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {t("common.yes")}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{t("common.no")}</Badge>
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
                                {t(`common.${discount.status}`)}
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
                                    handleDeleteDiscount(discount._id)
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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("dialog.editCommission")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.editCommissionDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("commissions.form.name")} *</Label>
                  <Input
                    value={editCommissionForm.name}
                    onChange={(e) =>
                      setEditCommissionForm({
                        ...editCommissionForm,
                        name: e.target.value,
                      })
                    }
                    placeholder={t("commissions.form.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("commissions.form.description")}</Label>
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
                    <Label>{t("commissions.form.type")} *</Label>
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
                        <SelectItem value="percentage">{t("commissions.form.percentage")}</SelectItem>
                        <SelectItem value="fixed">{t("commissions.form.fixed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("commissions.form.value")} *</Label>
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
                  <Label>{t("commissions.form.appliesTo")} *</Label>
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
                      <SelectItem value="service">{t("commissions.form.service")}</SelectItem>
                      <SelectItem value="professional">
                        {t("commissions.form.professional")}
                      </SelectItem>
                      <SelectItem value="service_category">
                        {t("commissions.form.category")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                {editCommissionForm.appliesTo === "service" && (
                  <div className="space-y-2">
                    <Label>{t("commissions.form.services")} *</Label>
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
                                type="button"
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
                            type="button"
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
                    <Label>{t("commissions.form.professionals")} *</Label>
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
                                type="button"
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
                            type="button"
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
                    <Label>{t("commissions.form.validFrom")}</Label>
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
                    <Label>{t("commissions.form.validUntil")}</Label>
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
                    type="button"
                    onClick={() => setEditCommissionDialog(false)}
                  >
                    {t("dialog.cancel")}
                  </Button>
                  <Button type="button" onClick={handleUpdateCommission}>
                    {t("commissions.form.update")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Voucher Dialog */}
          <Dialog open={editVoucherDialog} onOpenChange={setEditVoucherDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("dialog.editVoucher")}</DialogTitle>
                <DialogDescription>{t("dialog.editVoucherDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("vouchers.form.code")} *</Label>
                    <Input
                      value={editVoucherForm.code}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder={t("vouchers.form.codePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("vouchers.form.name")} *</Label>
                    <Input
                      value={editVoucherForm.name}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          name: e.target.value,
                        })
                      }
                      placeholder={t("vouchers.form.namePlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("vouchers.form.description")}</Label>
                  <Textarea
                    value={editVoucherForm.description}
                    onChange={(e) =>
                      setEditVoucherForm({
                        ...editVoucherForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={t("vouchers.form.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("vouchers.form.type")} *</Label>
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
                        <SelectItem value="percentage">{t("commissions.form.percentage")}</SelectItem>
                        <SelectItem value="fixed">{t("commissions.form.fixed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("vouchers.form.value")} *</Label>
                    <Input
                      type="text"
                      value={editVoucherForm.value}
                      onChange={(e) =>
                        setEditVoucherForm({
                          ...editVoucherForm,
                          value: e.target.value,
                        })
                      }
                      placeholder={
                        editVoucherForm.type === "percentage"
                          ? t("vouchers.form.percentagePlaceholder")
                          : t("vouchers.form.fixedPlaceholder")
                      }
                    />
                  </div>
                </div>

                {/* Applicable Services */}
                <div className="space-y-2">
                  <Label>{t("vouchers.form.applicableServicesOptional")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("vouchers.form.leaveEmpty")}
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
                              type="button"
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
                          type="button"
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
                    <Label>{t("vouchers.form.minPurchase")}</Label>
                    <Input
                      type="text"
                      placeholder={t("vouchers.form.minPurchasePlaceholder")}
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
                    <Label>{t("vouchers.form.maxUsage")}</Label>
                    <Input
                      type="text"
                      placeholder={t("vouchers.form.unlimited")}
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
                    <Label>{t("vouchers.form.validFrom")} *</Label>
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
                    <Label>{t("vouchers.form.validUntil")} *</Label>
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
                    type="button"
                    onClick={() => setEditVoucherDialog(false)}
                  >
                    {t("dialog.cancel")}
                  </Button>
                  <Button type="button" onClick={handleUpdateVoucher}>{t("vouchers.form.update")}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Discount Dialog */}
          <Dialog
            open={editDiscountDialog}
            onOpenChange={setEditDiscountDialog}
          >
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("dialog.editDiscount")}</DialogTitle>
                <DialogDescription>{t("dialog.editDiscountDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("discounts.form.name")} *</Label>
                  <Input
                    value={editDiscountForm.name}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        name: e.target.value,
                      })
                    }
                    placeholder={t("discounts.form.namePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("discounts.form.description")}</Label>
                  <Textarea
                    value={editDiscountForm.description}
                    onChange={(e) =>
                      setEditDiscountForm({
                        ...editDiscountForm,
                        description: e.target.value,
                      })
                    }
                    placeholder={t("discounts.form.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("discounts.form.type")} *</Label>
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
                        <SelectItem value="percentage">{t("commissions.form.percentage")}</SelectItem>
                        <SelectItem value="fixed">{t("commissions.form.fixed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("discounts.form.value")} *</Label>
                    <Input
                      type="text"
                      value={editDiscountForm.value}
                      onChange={(e) =>
                        setEditDiscountForm({
                          ...editDiscountForm,
                          value: e.target.value,
                        })
                      }
                      placeholder={
                        editDiscountForm.type === "percentage"
                          ? t("discounts.form.percentagePlaceholder")
                          : t("discounts.form.fixedPlaceholder")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("discounts.form.appliesTo")} *</Label>
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
                      <SelectItem value="all_services">{t("discounts.form.allServices")}</SelectItem>
                      <SelectItem value="specific_services">
                        {t("discounts.form.specificServices")}
                      </SelectItem>
                      <SelectItem value="first_time_clients">
                        {t("discounts.form.firstTime")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                {editDiscountForm.appliesTo === "specific_services" && (
                  <div className="space-y-2">
                    <Label>{t("discounts.form.specificServices")} *</Label>
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
                                type="button"
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
                            type="button"
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
                  <Label>{t("discounts.form.minPurchase")}</Label>
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
                  <Label>{t("discounts.form.autoApply")}</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("discounts.form.validFrom")} *</Label>
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
                    <Label>{t("discounts.form.validUntil")} *</Label>
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
                    type="button"
                    onClick={() => setEditDiscountDialog(false)}
                  >
                    {t("dialog.cancel")}
                  </Button>
                  <Button type="button" onClick={handleUpdateDiscount}>
                    {t("discounts.form.update")}
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
