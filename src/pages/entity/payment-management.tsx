import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
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
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  Calendar,
  Search,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";

export function PaymentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Mock payment data
  const payments = [
    {
      id: "PAY-001",
      bookingId: "BK-1001",
      client: { name: "Ana Silva", email: "ana@email.com" },
      service: "Haircut & Styling",
      professional: "João Santos",
      amount: 45.0,
      method: "card",
      status: "completed",
      date: "2024-01-20T10:30:00Z",
      fees: 1.35,
      netAmount: 43.65,
      transactionId: "txn_1234567890",
    },
    {
      id: "PAY-002",
      bookingId: "BK-1002",
      client: { name: "Carlos Lima", email: "carlos@email.com" },
      service: "Beard Trim",
      professional: "Sofia Oliveira",
      amount: 25.0,
      method: "cash",
      status: "completed",
      date: "2024-01-20T14:15:00Z",
      fees: 0,
      netAmount: 25.0,
      transactionId: null,
    },
    {
      id: "PAY-003",
      bookingId: "BK-1003",
      client: { name: "Maria Santos", email: "maria@email.com" },
      service: "Hair Coloring",
      professional: "João Santos",
      amount: 85.0,
      method: "transfer",
      status: "pending",
      date: "2024-01-21T09:00:00Z",
      fees: 0.85,
      netAmount: 84.15,
      transactionId: "txn_0987654321",
    },
    {
      id: "PAY-004",
      bookingId: "BK-1004",
      client: { name: "Pedro Costa", email: "pedro@email.com" },
      service: "Manicure",
      professional: "Sofia Oliveira",
      amount: 35.0,
      method: "mbway",
      status: "failed",
      date: "2024-01-21T16:30:00Z",
      fees: 1.05,
      netAmount: 33.95,
      transactionId: "txn_5555666677",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    totalFees: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.fees, 0),
    pendingAmount: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    completedCount: payments.filter((p) => p.status === "completed").length,
    pendingCount: payments.filter((p) => p.status === "pending").length,
    failedCount: payments.filter((p) => p.status === "failed").length,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: "default" as const, label: "Completed" },
      pending: { variant: "secondary" as const, label: "Pending" },
      failed: { variant: "destructive" as const, label: "Failed" },
      refunded: { variant: "outline" as const, label: "Refunded" },
    };
    const statusConfig =
      config[status as keyof typeof config] || config.completed;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const config = {
      card: { label: "Card", icon: "💳" },
      cash: { label: "Cash", icon: "💵" },
      transfer: { label: "Transfer", icon: "🏦" },
      mbway: { label: "MB Way", icon: "📱" },
    };
    const methodConfig = config[method as keyof typeof config] || config.card;
    return (
      <div className="flex items-center gap-1">
        <span>{methodConfig.icon}</span>
        <span>{methodConfig.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Payments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedCount} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Fees
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.totalFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.totalFees / stats.totalRevenue) * 100).toFixed(1)}% of
              revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Payments
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="mbway">MB Way</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            Complete list of all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">{payment.id}</div>
                    <div className="text-sm text-muted-foreground">
                      Booking: {payment.bookingId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.client.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.service}</div>
                      <div className="text-sm text-muted-foreground">
                        by {payment.professional}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        €{payment.amount.toFixed(2)}
                      </div>
                      {payment.fees > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Fee: €{payment.fees.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === "failed" && (
                        <Button variant="outline" size="sm">
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
