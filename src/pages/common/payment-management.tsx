import { useState, useEffect } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

export default function UnifiedPaymentManagement() {
  const { t } = useTranslation("payments");
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const plan = user?.plan || "simple";

  const [payments, setPayments] = useState<Payment[]>([]);
  // const [loading, setLoading] = useState(true); // Temporarily unused, keeping for structure
  const [filters, setFilters] = useState({
    status: "all",
    paymentSource: "all",
    startDate: "",
    endDate: "",
  });

  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [checkingStripe, setCheckingStripe] = useState(true);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

  const defaultCurrency = "BRL";

  // Initialize Stripe Connect Instance (Once)
  useEffect(() => {
    if (user?.entityId && plan !== 'simple') {
      const fetchClientSecret = async () => {
        const response = await paymentsService.createAccountSession(user!.entityId);
        return response.data.clientSecret;
      };

      const instance = loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            // Initial variables will be updated by the second effect primarily
            // But valid initial is needed
            colorPrimary: '#0f172a',
            borderRadius: '8px',
          },
        },
      });

      setStripeConnectInstance(instance);
    }
  }, [user?.entityId]);

  // Update Appearance on Theme Change
  useEffect(() => {
    if (stripeConnectInstance) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const effectiveTheme = theme === "system" ? systemTheme : theme;
      const stripeTheme = effectiveTheme === 'dark' ? 'night' : 'stripe';
      const buttonColor = effectiveTheme === 'dark' ? '#f8fafc' : '#0f172a';
      const backgroundColor = effectiveTheme === 'dark' ? '#171717' : '#ffffff';

      stripeConnectInstance.update({
        appearance: {
          overlays: 'dialog',
          theme: stripeTheme as any,
          variables: {
            colorPrimary: buttonColor,
            colorBackground: backgroundColor,
            borderRadius: '8px',
          },
        },
      });
    }
  }, [theme, stripeConnectInstance]);

  useEffect(() => {
    if (user?.entityId) {
      checkStripeStatus();
      loadPayments();
    }
  }, [user?.entityId, filters]);

  const checkStripeStatus = async () => {
    try {
      const response = await paymentsService.getConnectStatus(user?.entityId || "");
      console.log("Stripe Status:", response.data);

      // If details are submitted, we consider them "connected" enough to show the dashboard.
      // The dashboard components will handle pending verification states.
      setIsStripeConnected(response.data.detailsSubmitted);
    } catch (error) {
      console.warn("Failed to check stripe status", error);
      setIsStripeConnected(false);
    } finally {
      setCheckingStripe(false);
    }
  };

  const loadPayments = async () => {
    try {
      // setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.paymentSource !== "all") queryParams.append("paymentSource", filters.paymentSource);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = plan === "business"
        ? await paymentsService.getBusinessPayments(user?.entityId || "", Object.fromEntries(queryParams))
        : await paymentsService.getIndividualPayments(user?.entityId || "", Object.fromEntries(queryParams));

      setPayments((response.data as any).payments || []);
    } catch (error) {
      // Silent error
    } finally {
      // setLoading(false);
    }
  };

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

  const navigate = useNavigate();

  if (plan === 'simple') {
    return (
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-20 bg-card rounded-lg border shadow-sm">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestão Financeira Restrita</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A gestão financeira e cobranças online estão disponíveis apenas nos planos Business e Individual. Faça um upgrade para acessar.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/upgrade')}>
            Fazer Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (!stripeConnectInstance || checkingStripe) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing secure payments...</p>
        </div>
      </div>
    );
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Management & Payouts
            </p>
          </div>
        </div>

        {!isStripeConnected ? (
          // ONBOARDING MODE
          <Card className="border-2 border-primary/10 bg-slate-50/50">
            <CardHeader>
              <CardTitle>Ative seus recebimentos</CardTitle>
              <CardDescription>Para receber pagamentos online, precisamos de algumas informações da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectAccountOnboarding
                onExit={() => {
                  checkStripeStatus();
                  toast({ title: "Verificando...", description: "Atualizando status da conta." });
                }}
              />
            </CardContent>
          </Card>
        ) : (
          // DASHBOARD MODE
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="transactions" className="whitespace-nowrap">
                <Receipt className="h-4 w-4 mr-2" />
                Transações do Schedfy
              </TabsTrigger>
              <TabsTrigger value="payouts" className="whitespace-nowrap">
                <Banknote className="h-4 w-4 mr-2" />
                Saques & Extrato (Stripe)
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap">
                <Settings className="h-4 w-4 mr-2" />
                Configuração da Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {/* Custom Transaction Table (Preserved per user needs) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      <CardTitle>{t("filters.title")}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("actions.export")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>{t("filters.status")}</Label>
                      <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("filters.all")}</SelectItem>
                          <SelectItem value="succeeded">{t("status.paid")}</SelectItem>
                          <SelectItem value="pending">{t("status.pending")}</SelectItem>
                          <SelectItem value="failed">{t("status.failed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("filters.method")}</Label>
                      <Select value={filters.paymentSource} onValueChange={(val) => setFilters({ ...filters, paymentSource: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("filters.all")}</SelectItem>
                          {PAYMENT_METHODS.map(m => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("filters.startDate")}</Label>
                      <Input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("filters.endDate")}</Label>
                      <Input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("table.title")}</CardTitle>
                  <CardDescription>
                    {payments.length} {t("table.paymentsFound")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{plan === "business" ? t("table.id") : t("table.date")}</TableHead>
                          {plan === "business" && <TableHead>{t("table.client")}</TableHead>}
                          <TableHead>{t("table.amount")}</TableHead>
                          <TableHead>{t("table.method")}</TableHead>
                          <TableHead>{t("table.status")}</TableHead>
                          <TableHead className="text-right">{plan === "business" ? t("table.date") : ""}</TableHead>
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
                            <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(payment.paymentSource)}
                                {getPaymentMethodLabel(payment.paymentSource)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {plan === 'business' ? formatDate(payment.paidAt) : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                        {payments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={plan === "business" ? 6 : 5} className="text-center text-muted-foreground">
                              {t("table.noPayments")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="mt-4">
              <div className="p-8">
                <ConnectPayouts />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <div className="p-8">
                <ConnectAccountManagement />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ConnectComponentsProvider>
  );
}
