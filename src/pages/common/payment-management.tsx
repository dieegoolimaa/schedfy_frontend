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
  Building2,
  User,
  Loader2,
  WifiOff,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { paymentsService } from "../../services/payments.service";

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

const getPaymentStatusLabel = (status: string): string => {
  if (status === "succeeded" || status === "completed") return "Pago";
  if (status === "pending") return "Pendente";
  if (status === "refunded") return "Reembolsado";
  return "Falhou";
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Dinheiro", icon: Wallet },
  { value: "pix", label: "PIX", icon: DollarSign },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "debit_card", label: "Cartão de Débito", icon: CreditCard },
  { value: "bank_transfer", label: "Transferência", icon: Banknote },
];

// Status Card Component
function AccountStatusCard({ status, onRefresh }: { status: StripeAccountStatus | null; onRefresh: () => void }) {
  const { t } = useTranslation("payments");

  if (!status) return null;

  const getStatusColor = () => {
    if (status.chargesEnabled && status.payoutsEnabled) return "bg-emerald-500";
    if (status.detailsSubmitted) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (status.chargesEnabled && status.payoutsEnabled) return t("status.active", "Conta Ativa");
    if (status.detailsSubmitted) return t("status.pending", "Verificação Pendente");
    return t("status.incomplete", "Cadastro Incompleto");
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
            <div>
              <p className="font-semibold">{getStatusText()}</p>
              <p className="text-sm text-muted-foreground">
                {status.chargesEnabled ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("status.canReceive", "Pode receber pagamentos")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3 w-3" />
                    {t("status.pendingVerification", "Aguardando verificação")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {status.requirements && ((status.requirements.currentlyDue?.length || 0) > 0 || (status.requirements.pastDue?.length || 0) > 0) && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("status.actionRequired", "Ação Necessária")}</AlertTitle>
            <AlertDescription>
              {t("status.completeInfo", "Complete as informações pendentes para ativar totalmente sua conta.")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Error Fallback Component
function StripeErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
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
              {t("error.stripeConnection", "Não foi possível conectar ao serviço de pagamentos. Isso pode ser causado por:")}
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• {t("error.adBlocker", "Extensões de bloqueio de anúncios")}</li>
              <li>• {t("error.vpn", "VPN ou firewall bloqueando a conexão")}</li>
              <li>• {t("error.network", "Problemas temporários de rede")}</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("actions.retry", "Tentar Novamente")}
            </Button>
            <Button variant="secondary" onClick={() => window.open("https://dashboard.stripe.com", "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("actions.stripeDashboard", "Acessar Dashboard Stripe")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <p className="text-muted-foreground">{message || "Carregando..."}</p>
    </div>
  );
}

// Onboarding Steps Component
function OnboardingProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: Building2, label: "Dados da Empresa", complete: currentStep > 1 },
    { icon: User, label: "Dados Pessoais", complete: currentStep > 2 },
    { icon: Banknote, label: "Conta Bancária", complete: currentStep > 3 },
    { icon: Shield, label: "Verificação", complete: currentStep > 4 },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full 
            ${step.complete ? 'bg-emerald-500 text-white' : index + 1 === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            transition-all duration-300
          `}>
            {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-1 mx-1 rounded ${step.complete ? 'bg-emerald-500' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function UnifiedPaymentManagement() {
  const { t } = useTranslation("payments");
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const plan = user?.plan || "simple";

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
  const [onboardingStep, setOnboardingStep] = useState(1);

  const defaultCurrency = "BRL";

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
        const entityId = user?.entityId;
        if (!entityId) throw new Error('No entityId available');
        const response = await paymentsService.createAccountSession(entityId);
        return response.data.clientSecret;
      };

      const isDark = getEffectiveTheme() === 'dark';

      const instance = loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: isDark ? '#818cf8' : '#4f46e5',
            colorBackground: isDark ? '#18181b' : '#ffffff',
            colorText: isDark ? '#fafafa' : '#09090b',
            colorSecondaryText: isDark ? '#a1a1aa' : '#71717a',
            colorBorder: isDark ? '#3f3f46' : '#e4e4e7',
            colorDanger: '#ef4444',
            borderRadius: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSizeBase: '15px',
            spacingUnit: '4px',
            buttonPrimaryColorBackground: isDark ? '#818cf8' : '#4f46e5',
            buttonPrimaryColorText: '#ffffff',
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
        requirements: response.data.requirements,
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
            colorPrimary: isDark ? '#818cf8' : '#4f46e5',
            colorBackground: isDark ? '#18181b' : '#ffffff',
            colorText: isDark ? '#fafafa' : '#09090b',
            colorSecondaryText: isDark ? '#a1a1aa' : '#71717a',
            colorBorder: isDark ? '#3f3f46' : '#e4e4e7',
            colorDanger: '#ef4444',
            borderRadius: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSizeBase: '15px',
            spacingUnit: '4px',
            buttonPrimaryColorBackground: isDark ? '#818cf8' : '#4f46e5',
            buttonPrimaryColorText: '#ffffff',
          },
        },
      });
    }
  }, [theme, stripeConnectInstance, getEffectiveTheme]);

  // Helpers
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || defaultCurrency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    return found?.label || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const found = PAYMENT_METHODS.find((m) => m.value === method);
    const Icon = found?.icon || Receipt;
    return <Icon className="h-4 w-4" />;
  };

  const exportToCSV = () => {
    toast({ title: "Exportando...", description: "O download iniciará em breve" });
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
        <StripeErrorFallback error={stripeError || "Unknown error"} onRetry={initializeStripe} />
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("title", "Gestão de Pagamentos")}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {t("subtitle", "Management & Payouts")}
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Stripe Secured
              </Badge>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.open("https://dashboard.stripe.com", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("actions.stripeDashboard", "Stripe Dashboard")}
          </Button>
        </div>

        {/* Account Status */}
        {isStripeConnected && (
          <AccountStatusCard status={accountStatus} onRefresh={checkStripeStatus} />
        )}

        {!isStripeConnected ? (
          // ONBOARDING MODE
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("onboarding.title", "Configure seus Pagamentos")}</CardTitle>
                  <CardDescription>
                    {t("onboarding.description", "Complete as etapas abaixo para começar a receber pagamentos online")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <OnboardingProgress currentStep={onboardingStep} />

              <div className="bg-muted/30 rounded-xl p-6 mt-4">
                <ConnectAccountOnboarding
                  onExit={() => {
                    checkStripeStatus();
                    toast({
                      title: t("onboarding.updated", "Status Atualizado"),
                      description: t("onboarding.checkingAccount", "Verificando status da sua conta...")
                    });
                  }}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                {t("onboarding.help", "Precisa de ajuda?")}
              </div>
              <Button variant="link" size="sm">
                {t("actions.contactSupport", "Falar com Suporte")}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // DASHBOARD MODE
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="transactions" className="whitespace-nowrap rounded-md">
                <Receipt className="h-4 w-4 mr-2" />
                {t("tabs.transactions", "Transações")}
              </TabsTrigger>
              <TabsTrigger value="payouts" className="whitespace-nowrap rounded-md">
                <Banknote className="h-4 w-4 mr-2" />
                {t("tabs.payouts", "Saques & Extrato")}
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap rounded-md">
                <Settings className="h-4 w-4 mr-2" />
                {t("tabs.settings", "Configuração")}
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      <CardTitle>{t("filters.title", "Filtros")}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("actions.export", "Exportar")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
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
                          {PAYMENT_METHODS.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
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
                              <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
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
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    {t("payouts.title", "Saques e Extrato")}
                  </CardTitle>
                  <CardDescription>
                    {t("payouts.description", "Gerencie seus saques e visualize o histórico de transferências")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t">
                    <ConnectPayouts />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t("settings.title", "Configuração da Conta")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.description", "Gerencie os dados da sua conta de pagamentos")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t">
                    <ConnectAccountManagement />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ConnectComponentsProvider>
  );
}
