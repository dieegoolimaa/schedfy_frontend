import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { apiClient } from "../../lib/api-client";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EarningsData {
  thisMonth: number;
  lastMonth: number;
  total: number;
  pending: number;
  change: number;
}

interface Payment {
  _id: string;
  date: Date;
  amount: number;
  status: "pending" | "paid" | "processing";
  service: string;
  clientName: string;
  commission: number;
}

interface MonthlyData {
  month: string;
  earnings: number;
}

export default function ProfessionalEarningsPage() {
  const { user } = useAuth();
  const professionalId = user?.id || "";

  const [earningsData, setEarningsData] = useState<EarningsData>({
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
    pending: 0,
    change: 0,
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  useEffect(() => {
    fetchEarningsData();
    fetchPayments();
    fetchMonthlyData();
  }, [professionalId]);

  const fetchEarningsData = async () => {
    try {
      const response = await apiClient.get(
        `/api/professionals/${professionalId}/earnings`
      );
      const data = response.data as EarningsData;
      setEarningsData(data);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      // Mock data for demo
      setEarningsData({
        thisMonth: 4250.5,
        lastMonth: 3890.0,
        total: 28450.75,
        pending: 850.0,
        change: 9.3,
      });
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await apiClient.get(
        `/api/professionals/${professionalId}/payments`
      );
      setPayments(
        (response.data as any[]).map((p: any) => ({
          ...p,
          date: new Date(p.date),
        }))
      );
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Mock data for demo
      setPayments([
        {
          _id: "1",
          date: new Date(),
          amount: 120.0,
          status: "paid",
          service: "Haircut",
          clientName: "John Smith",
          commission: 24.0,
        },
        {
          _id: "2",
          date: new Date(Date.now() - 86400000),
          amount: 85.0,
          status: "paid",
          service: "Hair Coloring",
          clientName: "Sarah Johnson",
          commission: 17.0,
        },
        {
          _id: "3",
          date: new Date(Date.now() - 172800000),
          amount: 150.0,
          status: "processing",
          service: "Full Service",
          clientName: "Mike Davis",
          commission: 30.0,
        },
      ]);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await apiClient.get(
        `/api/professionals/${professionalId}/earnings/monthly?period=${selectedPeriod}`
      );
      setMonthlyData(response.data as MonthlyData[]);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      // Mock data for demo
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setMonthlyData(
        months.map((month) => ({
          month,
          earnings: 3000 + Math.random() * 2000,
        }))
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "outline", label: "Processing" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleExportStatement = async () => {
    try {
      toast.success("Statement export coming soon");
      // TODO: Implement PDF export
    } catch (error) {
      toast.error("Failed to export statement");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your commissions and payment history
          </p>
        </div>
        <Button onClick={handleExportStatement}>
          <Download className="h-4 w-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{earningsData.thisMonth.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {earningsData.change > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{earningsData.change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {earningsData.change.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{earningsData.lastMonth.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(subMonths(new Date(), 1), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{earningsData.pending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Earned
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{earningsData.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="tax">Tax Information</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Earnings Trend</CardTitle>
                  <CardDescription>Your earnings over time</CardDescription>
                </div>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Bar
                    dataKey="earnings"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{payment.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.date, "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          €{payment.commission.toFixed(2)}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Month Summary</CardTitle>
                <CardDescription>
                  {format(new Date(), "MMMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Services</span>
                  <span className="font-semibold">{payments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Average Commission
                  </span>
                  <span className="font-semibold">
                    €
                    {payments.length > 0
                      ? (
                          payments.reduce((sum, p) => sum + p.commission, 0) /
                          payments.length
                        ).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Commission Rate</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-medium">Total Earnings</span>
                  <span className="text-xl font-bold">
                    €{earningsData.thisMonth.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        {format(payment.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell>{payment.service}</TableCell>
                      <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">
                        €{payment.commission.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Information Tab */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Year Summary</CardTitle>
              <CardDescription>{new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold mt-1">
                    €{earningsData.total.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Estimated Tax (23%)
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    €{(earningsData.total * 0.23).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className="text-2xl font-bold mt-1">
                    €{(earningsData.total * 0.77).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Important Note</p>
                <p className="text-sm text-muted-foreground">
                  These are estimated figures. Please consult with a tax
                  professional for accurate tax calculation and filing. Tax
                  rates may vary based on your location and individual
                  circumstances.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
