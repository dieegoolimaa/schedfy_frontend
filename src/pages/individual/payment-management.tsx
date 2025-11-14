import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
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
}

interface PaymentSummary {
  totalAmount: number;
  totalTransactions: number;
  totalPaid: number;
  totalPending: number;
  byPaymentMethod: Record<string, number>;
}

// Helper functions for payment status
const getPaymentStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" => {
  if (status === "succeeded") return "default";
  if (status === "pending") return "secondary";
  return "destructive";
};

const getPaymentStatusLabel = (status: string): string => {
  if (status === "succeeded") return "Pago";
  if (status === "pending") return "Pendente";
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
];

export default function IndividualPaymentManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Default currency for individual plan
  const defaultCurrency = "BRL";

  const [formData, setFormData] = useState<CreatePaymentForm>({
    amount: "",
    currency: defaultCurrency,
    paymentMethod: "cash",
    description: "",
    notes: "",
    paidAt: new Date().toISOString().split("T")[0],
  });

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

      const response = await paymentsService.getIndividualPayments(
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

      const response = await paymentsService.getIndividualSummary(
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

      await paymentsService.createIndividualPayment({
        entityId: user?.entityId || "",
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        notes: formData.notes,
        paidAt: formData.paidAt,
      });

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
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
    const headers = ["Data", "Método", "Valor", "Status", "Descrição"];
    const rows = payments.map((payment) => [
      formatDate(payment.paidAt),
      getPaymentMethodLabel(payment.paymentSource),
      formatCurrency(payment.amount, payment.currency),
      payment.status,
      payment.description || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = globalThis.document.createElement("a");
    a.href = url;
    a.download = `pagamentos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

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
            Gerencie e registre pagamentos manuais
          </p>
        </div>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePayment}>Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <StatsGrid columns={4}>
          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                Receita Total
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

          {Object.entries(summary.byPaymentMethod)
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
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
                <TableHead>Data</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
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
                      <Badge variant={getPaymentStatusVariant(payment.status)}>
                        {getPaymentStatusLabel(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
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
