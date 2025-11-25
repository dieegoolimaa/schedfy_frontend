import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  Wallet,
  Banknote,
  Receipt,
  TrendingDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsGrid } from "@/components/ui/stats-grid";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { paymentsService } from "../../services/payments.service";

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

interface PaymentSummary {
  totalAmount: number;
  totalTransactions: number;
  totalPaid: number;
  totalPending: number;
  byPaymentMethod: Record<string, number>;
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

interface CreatePaymentForm {
  amount: string;
  currency: string;
  paymentMethod: string;
  description: string;
  notes: string;
  paidAt: string;
  bookingId?: string;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Dinheiro", icon: Wallet },
  { value: "pix", label: "PIX", icon: DollarSign },
  { value: "debit_card", label: "Cartão de Débito", icon: CreditCard },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "bank_transfer", label: "Transferência", icon: Banknote },
  { value: "card", label: "Cartão", icon: CreditCard },
  { value: "transfer", label: "Transferência", icon: Banknote },
  { value: "mbway", label: "MB Way", icon: DollarSign },
];

/**
 * Unified Payment Management - Consolidated payment management for all plans
 * Handles Individual and Business plan features conditionally
 * Simple plan shows upgrade message
 */
export default function UnifiedPaymentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const plan = user?.plan || "simple";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    paymentSource: "all",
    startDate: "",
    endDate: "",
  });

  const defaultCurrency = "BRL";

  const [formData, setFormData] = useState<CreatePaymentForm>({
    amount: "",
    currency: defaultCurrency,
    paymentMethod: "cash",
    description: "",
    notes: "",
    paidAt: new Date().toISOString().split("T")[0],
  });

  // Simple plan - show upgrade message
  if (plan === "simple") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">💳</div>
          <h2 className="text-2xl font-bold">Gestão de Pagamentos</h2>
          <p className="text-muted-foreground">
            A gestão avançada de pagamentos está disponível nos planos
            Individual e Business. Faça upgrade do seu plano para rastrear e
            gerenciar transações de pagamento.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user?.entityId) {
      loadPayments();
      loadSummary();
    }
  }, [user?.entityId, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.paymentSource !== "all")
        queryParams.append("paymentSource", filters.paymentSource);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response =
        plan === "business"
          ? await paymentsService.getBusinessPayments(
            user?.entityId || "",
            Object.fromEntries(queryParams)
          )
          : await paymentsService.getIndividualPayments(
            user?.entityId || "",
            Object.fromEntries(queryParams)
          );

      setPayments((response.data as any).payments || []);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response =
        plan === "business"
          ? await paymentsService.getBusinessSummary(
            user?.entityId || "",
            Object.fromEntries(queryParams)
          )
          : await paymentsService.getIndividualSummary(
            user?.entityId || "",
            Object.fromEntries(queryParams)
          );

      setSummary(response.data as any);
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
        toast({
          title: "Erro",
          description: "Informe um valor válido",
          variant: "destructive",
        });
        return;
      }

      const paymentData = {
        entityId: user?.entityId || "",
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        notes: formData.notes,
        paidAt: formData.paidAt,
      };

      if (plan === "business") {
        await paymentsService.createBusinessPayment(paymentData);
      } else {
        await paymentsService.createIndividualPayment(paymentData);
      }

      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso",
      });

      setIsDialogOpen(false);
      setFormData({
        amount: "",
        currency: defaultCurrency,
        paymentMethod: "cash",
        description: "",
        notes: "",
        paidAt: new Date().toISOString().split("T")[0],
      });
      loadPayments();
      loadSummary();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive",
      });
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
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
    const headers =
      plan === "business"
        ? [
          "Data",
          "Cliente",
          "Serviço",
          "Profissional",
          "Método",
          "Valor",
          "Taxa",
          "Status",
        ]
        : ["Data", "Método", "Valor", "Status", "Descrição"];

    const rows = payments.map((payment) => {
      if (plan === "business") {
        return [
          formatDate(payment.paidAt),
          payment.client?.name || "-",
          payment.service || "-",
          payment.professional || "-",
          getPaymentMethodLabel(payment.paymentSource),
          formatCurrency(payment.amount, payment.currency),
          formatCurrency(payment.fees || 0, payment.currency),
          payment.status,
        ];
      }
      return [
        formatDate(payment.paidAt),
        getPaymentMethodLabel(payment.paymentSource),
        formatCurrency(payment.amount, payment.currency),
        payment.status,
        payment.description || "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = globalThis.document.createElement("a");
    a.href = url;
    a.download = `pagamentos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const calculateStats = () => {
    const totalFees = payments
      .filter((p) => p.status === "completed" || p.status === "succeeded")
      .reduce((sum, p) => sum + (p.fees || 0), 0);

    const failedCount = payments.filter((p) => p.status === "failed").length;

    return {
      totalFees,
      failedCount,
    };
  };

  const stats = calculateStats();

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Pagamentos</h1>
          <p className="text-muted-foreground">
            {plan === "business"
              ? "Rastreie e gerencie todas as transações de pagamento"
              : "Gerencie e registre pagamentos manuais"}
          </p>
        </div>
        <div className="flex gap-2">
          {plan === "business" && (
            <Button variant="outline" onClick={loadPayments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                <DialogDescription>
                  Registre pagamentos feitos em dinheiro, PIX ou outras formas
                  offline
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="h-4 w-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paidAt">Data do Pagamento</Label>
                  <Input
                    id="paidAt"
                    type="date"
                    value={formData.paidAt}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAt: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Consulta com Dr. João"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreatePayment}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <StatsGrid columns={4}>
          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                {plan === "business" ? "Receita Total" : "Receita Total"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalPaid, defaultCurrency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalTransactions} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalPending, defaultCurrency)}
              </div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>

          {plan === "business" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxas de Processamento
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalFees, defaultCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.totalPaid > 0
                      ? `${(
                        (stats.totalFees / summary.totalPaid) *
                        100
                      ).toFixed(1)}% da receita`
                      : "0% da receita"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pagamentos Falhados
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.failedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Requerem atenção
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {plan === "individual" &&
            Object.entries(summary.byPaymentMethod)
              .slice(0, 2)
              .map(([method, amount]) => (
                <Card key={method}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {getPaymentMethodLabel(method)}
                    </CardTitle>
                    {getPaymentMethodIcon(method)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(Number(amount), defaultCurrency)}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </StatsGrid>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="succeeded">Pago</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Método</Label>
              <Select
                value={filters.paymentSource}
                onValueChange={(value) =>
                  setFilters({ ...filters, paymentSource: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            {payments.length} pagamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {plan === "business" ? "ID / Reserva" : "Data"}
                </TableHead>
                {plan === "business" && (
                  <>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                  </>
                )}
                <TableHead>
                  {plan === "business" ? "Valor" : "Método"}
                </TableHead>
                <TableHead>
                  {plan === "business" ? "Método" : "Descrição"}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  {plan === "business" ? "Data" : "Valor"}
                </TableHead>
                {plan === "business" && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={plan === "business" ? 8 : 5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    {plan === "business" ? (
                      <>
                        <TableCell>
                          <div className="font-medium">{payment.id}</div>
                          {payment.bookingId && (
                            <div className="text-sm text-muted-foreground">
                              Reserva: {payment.bookingId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.client?.name || "-"}
                            </div>
                            {payment.client?.email && (
                              <div className="text-sm text-muted-foreground">
                                {payment.client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.service || payment.description || "-"}
                            </div>
                            {payment.professional && (
                              <div className="text-sm text-muted-foreground">
                                por {payment.professional}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatCurrency(payment.amount, payment.currency)}
                            </div>
                            {payment.fees && payment.fees > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Taxa:{" "}
                                {formatCurrency(payment.fees, payment.currency)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentSource)}
                            {getPaymentMethodLabel(payment.paymentSource)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPaymentStatusVariant(payment.status)}
                          >
                            {getPaymentStatusLabel(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(payment.paidAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(payment.paidAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === "failed" && (
                              <Button variant="outline" size="sm">
                                Tentar Novamente
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{formatDate(payment.paidAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentSource)}
                            {getPaymentMethodLabel(payment.paymentSource)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {payment.description || "-"}
                            {payment.notes && (
                              <p className="text-xs text-muted-foreground">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPaymentStatusVariant(payment.status)}
                          >
                            {getPaymentStatusLabel(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
