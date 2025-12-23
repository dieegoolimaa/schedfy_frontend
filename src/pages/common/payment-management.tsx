import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useTheme } from "../../components/theme-provider";
import {
  Filter,
  Download,
  CreditCard,
  Wallet,
  Banknote,
  Receipt,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  Shield,
  Loader2,
  WifiOff,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { paymentsService } from "../../services/payments.service";
import { formatPrice, formatDate as formatRegionalDate } from "../../lib/region-config";


// Stripe Connect Embedded Components
import { ConnectComponentsProvider, ConnectAccountOnboarding, ConnectPayouts, ConnectAccountManagement } from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentSource: string;
  description?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
  bookingId?: any;
  professional?: string;
  client?: {
    name: string;
    email: string;
  };
  service?: string;
  fees?: number;
  netAmount?: number;
  transactionId?: string;
}

interface StripeAccountStatus {
  connected: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: {
    currentlyDue: string[];
    pastDue: string[];
  };
}

const getPaymentStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "succeeded" || status === "completed") return "default";
  if (status === "pending") return "secondary";
  if (status === "refunded") return "outline";
  return "destructive";
};

const getPaymentStatusLabel = (status: string, t: any): string => {
  if (status === "succeeded" || status === "completed") return t("status.paid", "Pago");
  if (status === "pending") return t("status.pending", "Pendente");
  if (status === "refunded") return t("status.refunded", "Reembolsado");
  return t("status.failed", "Falhou");
};

const getPaymentMethods = (t: any) => [
  { value: "cash", label: t("paymentMethods.cash", "Dinheiro"), icon: Wallet },
  { value: "pix", label: t("paymentMethods.pix", "PIX"), icon: DollarSign },
  { value: "credit_card", label: t("paymentMethods.creditCard", "Cartão de Crédito"), icon: CreditCard },
  { value: "debit_card", label: t("paymentMethods.debitCard", "Cartão de Débito"), icon: CreditCard },
  { value: "bank_transfer", label: t("paymentMethods.bankTransfer", "Transferência"), icon: Banknote },
];

// Quick Action Card Component - Mobile Optimized
function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  variant = "default",
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "success" | "warning";
  badge?: string;
}) {
  const variantStyles = {
    default: "border-border hover:border-primary/50 hover:bg-primary/5",
    success: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
    warning: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/20 text-emerald-500",
    warning: "bg-amber-500/20 text-amber-500",
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${variantStyles[variant]}`}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:pt-6 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${iconStyles[variant]}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{description}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// Status Banner Component
function StatusBanner({ status, onRefresh }: { status: StripeAccountStatus | null; onRefresh: () => void }) {
  const { t } = useTranslation("payments");

  if (!status) return null;

  const isFullyActive = status.chargesEnabled && status.payoutsEnabled;
  const isPending = status.detailsSubmitted && !isFullyActive;

  const config = isFullyActive ? {
    bg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    title: t("status.active", "Conta Ativa"),
    subtitle: t("status.canReceive", "Pronta para receber pagamentos"),
  } : isPending ? {
    bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
    border: "border-amber-500/20",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    title: t("status.pending", "Em Verificação"),
    subtitle: t("status.pendingVerification", "Aguardando análise do Stripe"),
  } : {
    bg: "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent",
    border: "border-red-500/20",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    title: t("status.incomplete", "Cadastro Incompleto"),
    subtitle: t("status.needsAction", "Complete seu cadastro para ativar"),
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${config.border} ${config.bg}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div>
          <p className="font-medium">{config.title}</p>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Stripe Modal Wrapper - uses Stripe's exact colors & Mobile fullscreen
function StripeModal({
  open,
  onClose,
  title,
  description,
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-0 gap-0 border-[#27272a] dark:bg-[#09090b] bg-[#fafafa] rounded-xl sm:rounded-lg"
      >
        {/* Header with Stripe-matching colors */}
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-[#27272a] dark:bg-[#09090b] bg-[#fafafa] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg dark:bg-[#18181b] bg-[#f4f4f5] flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 dark:text-[#a1a1aa] text-[#52525b]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="dark:text-[#fafafa] text-[#09090b] text-base sm:text-lg">{title}</DialogTitle>
              {description && (
                <DialogDescription className="dark:text-[#71717a] text-[#52525b] text-xs sm:text-sm line-clamp-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content area with Stripe background */}
        <div className="p-4 sm:p-6 dark:bg-[#09090b] bg-[#fafafa] overflow-x-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}


// Loading Component
function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="text-muted-foreground">{message || "A carregar..."}</p>
    </div>
  );
}

// Error Fallback Component
function StripeErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation("payments");

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4 py-8">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("error.connection", "Erro de Conexão")}</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              {t("error.stripeConnection", "Não foi possível conectar ao sistema de pagamentos.")}
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("actions.retry", "Tentar Novamente")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UnifiedPaymentManagement() {
  const { t } = useTranslation("payments");
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const plan = user?.plan || "simple";

  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    paymentSource: "all",
    startDate: "",
    endDate: "",
  });

  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [checkingStripe, setCheckingStripe] = useState(true);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);

  // Modal states
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showPayoutsModal, setShowPayoutsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);


  // Get effective theme
  const getEffectiveTheme = useCallback(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return theme === "system" ? systemTheme : theme;
  }, [theme]);

  // Initialize Stripe Connect
  const initializeStripe = useCallback(async () => {
    if (!user?.entityId || plan === 'simple') return;

    setStripeError(null);
    setCheckingStripe(true);

    try {
      const fetchClientSecret = async () => {
        try {
          const entityId = user?.entityId;
          if (!entityId) throw new Error('No entityId available');
          const response = await paymentsService.createAccountSession(entityId);
          if (!response.data?.clientSecret) {
             console.error("Invalid response from createAccountSession:", response);
             throw new Error("Failed to retrieve client secret");
          }
          return response.data.clientSecret;
        } catch (err) {
          console.error("Error fetching client secret:", err);
          throw err;
        }
      };

      const isDark = getEffectiveTheme() === 'dark';

      const instance = loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: isDark ? '#a1a1aa' : '#18181b',
            colorBackground: isDark ? '#09090b' : '#fafafa',
            colorText: isDark ? '#fafafa' : '#09090b',
            colorSecondaryText: isDark ? '#71717a' : '#52525b',
            colorBorder: isDark ? '#27272a' : '#e4e4e7',
            colorDanger: '#ef4444',
            borderRadius: '8px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSizeBase: '14px',
            spacingUnit: '10px',
          },
        },
      });

      setStripeConnectInstance(instance);
    } catch (error: any) {
      console.error('Failed to initialize Stripe:', error);
      setStripeError(error.message || 'Failed to initialize payment system');
    } finally {
      setCheckingStripe(false);
    }
  }, [user?.entityId, plan, getEffectiveTheme]);

  // Check Stripe account status
  const checkStripeStatus = useCallback(async () => {
    if (!user?.entityId) return;

    try {
      const response = await paymentsService.getConnectStatus(user.entityId);
      const status: StripeAccountStatus = {
        connected: true,
        detailsSubmitted: response.data.detailsSubmitted,
        chargesEnabled: response.data.chargesEnabled,
        payoutsEnabled: response.data.payoutsEnabled,
        requirements: response.data.requirements ?? undefined,
      };
      setAccountStatus(status);
      setIsStripeConnected(response.data.detailsSubmitted);
    } catch (error) {
      console.warn("Failed to check stripe status", error);
      setIsStripeConnected(false);
    }
  }, [user?.entityId]);

  // Load payments
  const loadPayments = useCallback(async () => {
    if (!user?.entityId) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.paymentSource !== "all") queryParams.append("paymentSource", filters.paymentSource);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = plan === "business"
        ? await paymentsService.getBusinessPayments(user.entityId, Object.fromEntries(queryParams))
        : await paymentsService.getIndividualPayments(user.entityId, Object.fromEntries(queryParams));

      setPayments((response.data as any).payments || []);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.entityId, plan, filters]);

  // Effects
  useEffect(() => {
    initializeStripe();
  }, [initializeStripe]);

  useEffect(() => {
    if (user?.entityId) {
      checkStripeStatus();
      loadPayments();
    }
  }, [user?.entityId, checkStripeStatus, loadPayments]);

  // Update Stripe appearance on theme change
  useEffect(() => {
    if (stripeConnectInstance) {
      const isDark = getEffectiveTheme() === 'dark';

      stripeConnectInstance.update({
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: isDark ? '#a1a1aa' : '#18181b',
            colorBackground: isDark ? '#09090b' : '#fafafa',
            colorText: isDark ? '#fafafa' : '#09090b',
            colorSecondaryText: isDark ? '#71717a' : '#52525b',
            colorBorder: isDark ? '#27272a' : '#e4e4e7',
            colorDanger: '#ef4444',
            borderRadius: '8px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSizeBase: '14px',
            spacingUnit: '10px',
          },
        },
      });
    }
  }, [theme, stripeConnectInstance, getEffectiveTheme]);

  // Helpers - Use regional formatting
  const formatCurrency = (amount: number, currency?: string) => {
    return formatPrice(amount, currency);
  };

  const formatDate = (dateString: string) => {
    return formatRegionalDate(dateString);
  };

  const getPaymentMethodLabel = (method: string) => {
    const found = getPaymentMethods(t).find((m) => m.value === method);
    return found?.label || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const found = getPaymentMethods(t).find((m) => m.value === method);
    const Icon = found?.icon || Receipt;
    return <Icon className="h-4 w-4" />;
  };

  const exportToCSV = () => {
    toast({ title: "Exportando...", description: "O download iniciará em breve" });
  };

  // Calculate stats
  const stats = {
    totalRevenue: payments.filter(p => p.status === 'succeeded' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    transactionCount: payments.length,
  };

  // Render: Simple Plan Restriction
  if (plan === 'simple') {
    return (
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-20 bg-card rounded-xl border shadow-sm">
          <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <CreditCard className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{t("restricted.title", "Gestão Financeira")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("restricted.description", "A gestão financeira e cobranças online estão disponíveis apenas nos planos Business e Individual.")}
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/upgrade')} className="mt-4">
            {t("actions.upgrade", "Fazer Upgrade")}
          </Button>
        </div>
      </div>
    );
  }

  // Render: Loading State
  if (checkingStripe) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("title", "Gestão de Pagamentos")}</h1>
            <p className="text-muted-foreground">{t("subtitle", "Management & Payouts")}</p>
          </div>
        </div>
        <LoadingState message={t("loading.stripe", "Conectando ao sistema de pagamentos...")} />
      </div>
    );
  }

  // Render: Stripe Error
  if (stripeError || !stripeConnectInstance) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("title", "Gestão de Pagamentos")}</h1>
            <p className="text-muted-foreground">{t("subtitle", "Management & Payouts")}</p>
          </div>
        </div>
        <StripeErrorFallback onRetry={initializeStripe} />
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("title", "Gestão de Pagamentos")}</h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
              {t("subtitle", "Management & Payouts")}
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Stripe
              </Badge>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Dashboard Stripe
          </Button>
        </div>

        {/* Status Banner */}
        <StatusBanner status={accountStatus} onRefresh={checkStripeStatus} />

        {/* Quick Actions - Stack on mobile */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {!isStripeConnected ? (
            <QuickActionCard
              icon={CreditCard}
              title={t("actions.setupPayments", "Configurar Pagamentos")}
              description={t("actions.setupDescription", "Complete seu cadastro para receber pagamentos")}
              onClick={() => setShowOnboardingModal(true)}
              variant="warning"
              badge="Pendente"
            />
          ) : (
            <>
              <QuickActionCard
                icon={ArrowDownLeft}
                title={t("actions.viewPayouts", "Saques & Extrato")}
                description={t("actions.payoutsDescription", "Visualize saques e histórico de transferências")}
                onClick={() => setShowPayoutsModal(true)}
                variant="success"
              />
              <QuickActionCard
                icon={Settings}
                title={t("actions.accountSettings", "Configurações")}
                description={t("actions.settingsDescription", "Gerencie dados da sua conta Stripe")}
                onClick={() => setShowSettingsModal(true)}
              />
              <QuickActionCard
                icon={ArrowUpRight}
                title={t("actions.stripeDashboard", "Dashboard Completo")}
                description={t("actions.dashboardDescription", "Acesse todas as funcionalidades do Stripe")}
                onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
              />
            </>
          )}
        </div>

        {/* Stats Cards - Responsive grid */}
        {isStripeConnected && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">

            <Card>
              <CardContent className="p-4 sm:pt-6 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("stats.totalRevenue", "Receita Total")}</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:pt-6 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("stats.pending", "Pendente")}</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stats.pendingAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="p-4 sm:pt-6 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("stats.transactions", "Transações")}</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.transactionCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Table */}
        {isStripeConnected && (
          <>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle className="text-base sm:text-lg">{t("filters.title", "Filtros")}</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportToCSV} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    {t("actions.export", "Exportar")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">

                  <div className="space-y-2">
                    <Label>{t("filters.status", "Status")}</Label>
                    <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filters.all", "Todos")}</SelectItem>
                        <SelectItem value="succeeded">{t("status.paid", "Pago")}</SelectItem>
                        <SelectItem value="pending">{t("status.pending", "Pendente")}</SelectItem>
                        <SelectItem value="failed">{t("status.failed", "Falhou")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("filters.method", "Método")}</Label>
                    <Select value={filters.paymentSource} onValueChange={(val) => setFilters({ ...filters, paymentSource: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filters.all", "Todos")}</SelectItem>
                        {getPaymentMethods(t).map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("filters.startDate", "Data Início")}</Label>
                    <Input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("filters.endDate", "Data Fim")}</Label>
                    <Input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("table.title", "Histórico de Pagamentos")}</CardTitle>
                    <CardDescription>
                      {payments.length} {t("table.paymentsFound", "pagamentos encontrados")}
                    </CardDescription>
                  </div>
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{plan === "business" ? t("table.id", "ID") : t("table.date", "Data")}</TableHead>
                        {plan === "business" && <TableHead>{t("table.client", "Cliente")}</TableHead>}
                        <TableHead>{t("table.amount", "Valor")}</TableHead>
                        <TableHead>{t("table.method", "Método")}</TableHead>
                        <TableHead>{t("table.status", "Status")}</TableHead>
                        <TableHead className="text-right">{plan === "business" ? t("table.date", "Data") : ""}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="font-medium">{plan === 'business' ? payment.id.substring(0, 8) : formatDate(payment.paidAt)}</div>
                          </TableCell>
                          {plan === 'business' && (
                            <TableCell>
                              <div className="font-medium">{payment.client?.name || "-"}</div>
                            </TableCell>
                          )}
                          <TableCell className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payment.paymentSource)}
                              <span className="text-sm">{getPaymentMethodLabel(payment.paymentSource)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status, t)}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {plan === 'business' ? formatDate(payment.paidAt) : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                      {payments.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={plan === "business" ? 6 : 5} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Receipt className="h-8 w-8 text-muted-foreground/50" />
                              <p className="text-muted-foreground">{t("table.noPayments", "Nenhum pagamento encontrado")}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Stripe Modals */}
        <StripeModal
          open={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          title={t("modals.onboarding.title", "Configurar Pagamentos")}
          description={t("modals.onboarding.description", "Complete as informações para começar a receber pagamentos")}
        >
          <ConnectAccountOnboarding
            onExit={() => {
              setShowOnboardingModal(false);
              checkStripeStatus();
              toast({
                title: t("onboarding.updated", "Status Atualizado"),
                description: t("onboarding.checkingAccount", "Verificando status da sua conta...")
              });
            }}
          />
        </StripeModal>

        <StripeModal
          open={showPayoutsModal}
          onClose={() => setShowPayoutsModal(false)}
          title={t("modals.payouts.title", "Saques & Extrato")}
          description={t("modals.payouts.description", "Gerencie seus saques e visualize o histórico")}
        >
          <ConnectPayouts />
        </StripeModal>

        <StripeModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title={t("modals.settings.title", "Configurações da Conta")}
          description={t("modals.settings.description", "Gerencie os dados da sua conta de pagamentos")}
        >
          <ConnectAccountManagement />
        </StripeModal>
      </div>
    </ConnectComponentsProvider>
  );
}
