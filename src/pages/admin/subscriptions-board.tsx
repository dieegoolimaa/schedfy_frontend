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
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  Eye,
  Filter,
  Search,
  Download,
  Shield,
  TrendingUp,
  CreditCard,
  AlertCircle,
  BarChart3,
  Mail,
  Phone,
  Calendar,
  Building2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

type SubscriptionStatus =
  | "active"
  | "pending"
  | "overdue"
  | "suspended"
  | "cancelled";
type PaymentStatus = "paid" | "pending" | "failed" | "overdue";
type SubscriptionPlan = "simple" | "individual" | "business";

interface EntitySubscription {
  id: string;
  entityId: string;
  entityName: string;
  contactName: string;
  email: string;
  phone: string;
  plan: SubscriptionPlan;
  monthlyFee: number;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  daysOverdue: number;
  totalRevenue: number;
  activeUsers: number;
  lastCommunicationSent?: string;
  communicationsSent: number;
  notes: string;
}

export function SubscriptionsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] =
    useState<EntitySubscription | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Mock data - Entity Subscriptions
  const [subscriptions] = useState<EntitySubscription[]>([
    {
      id: "SUB001",
      entityId: "ENT001",
      entityName: "Beauty Salon Premium",
      contactName: "Maria Silva",
      email: "maria@beautysalon.com",
      phone: "+351 912 345 678",
      plan: "business",
      monthlyFee: 49.99,
      subscriptionStatus: "active",
      paymentStatus: "paid",
      currentPeriodStart: "2024-10-01",
      currentPeriodEnd: "2024-10-31",
      nextBillingDate: "2024-11-01",
      lastPaymentDate: "2024-10-01",
      lastPaymentAmount: 49.99,
      daysOverdue: 0,
      totalRevenue: 599.88,
      activeUsers: 5,
      lastCommunicationSent: "2024-10-20",
      communicationsSent: 12,
      notes: "",
    },
    {
      id: "SUB002",
      entityId: "ENT002",
      entityName: "Spa Wellness Center",
      contactName: "João Santos",
      email: "joao@spawellness.com",
      phone: "+351 923 456 789",
      plan: "business",
      monthlyFee: 49.99,
      subscriptionStatus: "overdue",
      paymentStatus: "overdue",
      currentPeriodStart: "2024-09-15",
      currentPeriodEnd: "2024-10-15",
      nextBillingDate: "2024-10-15",
      lastPaymentDate: "2024-09-15",
      lastPaymentAmount: 49.99,
      daysOverdue: 9,
      totalRevenue: 449.91,
      activeUsers: 3,
      lastCommunicationSent: "2024-10-22",
      communicationsSent: 15,
      notes: "3 payment reminders sent, no response",
    },
    {
      id: "SUB003",
      entityId: "ENT003",
      entityName: "Dental Care Clinic",
      contactName: "Ana Costa",
      email: "ana@dentalcare.com",
      phone: "+351 934 567 890",
      plan: "individual",
      monthlyFee: 19.99,
      subscriptionStatus: "active",
      paymentStatus: "paid",
      currentPeriodStart: "2024-10-10",
      currentPeriodEnd: "2024-11-10",
      nextBillingDate: "2024-11-10",
      lastPaymentDate: "2024-10-10",
      lastPaymentAmount: 19.99,
      daysOverdue: 0,
      totalRevenue: 239.88,
      activeUsers: 2,
      lastCommunicationSent: "2024-10-15",
      communicationsSent: 8,
      notes: "",
    },
    {
      id: "SUB004",
      entityId: "ENT004",
      entityName: "Fitness Studio Pro",
      contactName: "Pedro Oliveira",
      email: "pedro@fitnesspro.com",
      phone: "+351 945 678 901",
      plan: "simple",
      monthlyFee: 9.99,
      subscriptionStatus: "suspended",
      paymentStatus: "failed",
      currentPeriodStart: "2024-09-01",
      currentPeriodEnd: "2024-10-01",
      nextBillingDate: "2024-10-01",
      lastPaymentDate: "2024-09-01",
      lastPaymentAmount: 9.99,
      daysOverdue: 23,
      totalRevenue: 89.91,
      activeUsers: 1,
      lastCommunicationSent: "2024-10-23",
      communicationsSent: 18,
      notes: "Suspended due to non-payment. Sent final notice.",
    },
    {
      id: "SUB005",
      entityId: "ENT005",
      entityName: "Hair & Beauty Studio",
      contactName: "Carla Ferreira",
      email: "carla@hairbeauty.com",
      phone: "+351 956 789 012",
      plan: "business",
      monthlyFee: 49.99,
      subscriptionStatus: "pending",
      paymentStatus: "pending",
      currentPeriodStart: "2024-10-24",
      currentPeriodEnd: "2024-11-24",
      nextBillingDate: "2024-11-24",
      daysOverdue: 0,
      totalRevenue: 0,
      activeUsers: 1,
      lastCommunicationSent: "2024-10-24",
      communicationsSent: 2,
      notes: "New subscription - first payment pending",
    },
  ]);

  // Statistics
  const stats = {
    totalSubscriptions: 156,
    activeSubscriptions: 132,
    overdueSubscriptions: 12,
    suspendedSubscriptions: 8,
    monthlyRecurringRevenue: 4847.5,
    overdueAmount: 847.23,
    averageSubscriptionValue: 31.07,
    churnRate: 2.3,
  };

  const getSubscriptionStatusBadge = (status: SubscriptionStatus) => {
    const variants = {
      active: { color: "bg-green-500", label: "Active" },
      pending: { color: "bg-yellow-500", label: "Pending" },
      overdue: { color: "bg-orange-500", label: "Overdue" },
      suspended: { color: "bg-red-500", label: "Suspended" },
      cancelled: { color: "bg-gray-500", label: "Cancelled" },
    };
    return variants[status];
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants = {
      paid: { color: "bg-green-500", label: "Paid", icon: CheckCircle },
      pending: { color: "bg-yellow-500", label: "Pending", icon: Clock },
      failed: { color: "bg-red-500", label: "Failed", icon: XCircle },
      overdue: { color: "bg-orange-500", label: "Overdue", icon: AlertCircle },
    };
    return variants[status];
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    const variants = {
      simple: { color: "bg-gray-500", label: "Simple - €9.99" },
      individual: { color: "bg-blue-500", label: "Individual - €19.99" },
      business: { color: "bg-purple-500", label: "Business - €49.99" },
    };
    return variants[plan];
  };

  const handleViewDetails = (subscription: EntitySubscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsDialogOpen(true);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sub.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Subscriptions Board
            </h1>
          </div>
          <p className="text-muted-foreground">
            Monitor entity subscriptions, payments, and communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} active
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8.2% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.monthlyRecurringRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly Recurring Revenue
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Payments
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overdueSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              €{stats.overdueAmount.toLocaleString()} overdue
            </p>
            <div className="mt-2 flex items-center text-xs text-red-600">
              <AlertCircle className="mr-1 h-3 w-3" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.suspendedSubscriptions} suspended
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Below target (5%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessageSquare className="mr-2 h-4 w-4" />
            Communications Log
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Entity Subscriptions</CardTitle>
                  <CardDescription>
                    Monitor subscription status and payments for all entities
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entities..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => {
                    const statusBadge = getSubscriptionStatusBadge(
                      sub.subscriptionStatus
                    );
                    const paymentBadge = getPaymentStatusBadge(
                      sub.paymentStatus
                    );
                    const planBadge = getPlanBadge(sub.plan);
                    const PaymentIcon = paymentBadge.icon;

                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {sub.entityName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {sub.entityId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {sub.contactName}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {sub.email}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {sub.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={planBadge.color}>
                            {planBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentBadge.color}>
                            <PaymentIcon className="mr-1 h-3 w-3" />
                            {paymentBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.daysOverdue > 0 ? (
                            <span className="text-red-600 font-semibold">
                              {sub.daysOverdue} days
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          €{sub.totalRevenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(sub)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Log Tab */}
        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                Recent communications sent to entities about their subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    entity: "Spa Wellness Center",
                    type: "Payment Overdue Notice",
                    channel: "Email + SMS",
                    date: "2024-10-22 10:30",
                    status: "delivered",
                  },
                  {
                    entity: "Fitness Studio Pro",
                    type: "Suspension Warning",
                    channel: "Email",
                    date: "2024-10-23 14:15",
                    status: "read",
                  },
                  {
                    entity: "Beauty Salon Premium",
                    type: "Renewal Reminder",
                    channel: "WhatsApp",
                    date: "2024-10-20 09:00",
                    status: "delivered",
                  },
                  {
                    entity: "Hair & Beauty Studio",
                    type: "Welcome Message",
                    channel: "Email",
                    date: "2024-10-24 16:45",
                    status: "delivered",
                  },
                ].map((comm, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{comm.entity}</span>
                        <Badge variant="outline" className="text-xs">
                          {comm.channel}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {comm.type}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {comm.date}
                      </div>
                    </div>
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {comm.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>
                  Monthly recurring revenue breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-sm">Business Plan</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">€3,499.30</div>
                      <div className="text-xs text-muted-foreground">
                        70 entities
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: "72%" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Individual Plan</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">€999.50</div>
                      <div className="text-xs text-muted-foreground">
                        50 entities
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500" />
                      <span className="text-sm">Simple Plan</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">€359.64</div>
                      <div className="text-xs text-muted-foreground">
                        36 entities
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: "8%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Health</CardTitle>
                <CardDescription>
                  Current status of all subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {stats.activeSubscriptions}
                      </div>
                      <div className="text-xs text-muted-foreground">84.6%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500" />
                      <span className="text-sm">Overdue</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {stats.overdueSubscriptions}
                      </div>
                      <div className="text-xs text-muted-foreground">7.7%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm">Suspended</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {stats.suspendedSubscriptions}
                      </div>
                      <div className="text-xs text-muted-foreground">5.1%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">4</div>
                      <div className="text-xs text-muted-foreground">2.6%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Subscription Details - {selectedSubscription?.entityName}
            </DialogTitle>
            <DialogDescription>
              Complete subscription and payment information
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Entity Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Entity Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Entity Name:</span>
                    <div className="text-muted-foreground">
                      {selectedSubscription.entityName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Entity ID:</span>
                    <div className="text-muted-foreground font-mono">
                      {selectedSubscription.entityId}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Contact Person:</span>
                    <div className="text-muted-foreground">
                      {selectedSubscription.contactName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Active Users:</span>
                    <div className="text-muted-foreground">
                      {selectedSubscription.activeUsers}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <div className="text-muted-foreground">
                      {selectedSubscription.email}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <div className="text-muted-foreground">
                      {selectedSubscription.phone}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Plan:</span>
                    <Badge
                      className={`ml-2 ${getPlanBadge(selectedSubscription.plan).color}`}
                    >
                      {getPlanBadge(selectedSubscription.plan).label}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge
                      className={`ml-2 ${getSubscriptionStatusBadge(selectedSubscription.subscriptionStatus).color}`}
                    >
                      {
                        getSubscriptionStatusBadge(
                          selectedSubscription.subscriptionStatus
                        ).label
                      }
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Monthly Fee:</span>
                    <div className="text-muted-foreground">
                      €{selectedSubscription.monthlyFee.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total Revenue:</span>
                    <div className="text-muted-foreground font-bold">
                      €{selectedSubscription.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Current Period:</span>
                    <div className="text-muted-foreground">
                      {new Date(
                        selectedSubscription.currentPeriodStart
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        selectedSubscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Next Billing:</span>
                    <div className="text-muted-foreground">
                      {new Date(
                        selectedSubscription.nextBillingDate
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  {selectedSubscription.lastPaymentDate && (
                    <>
                      <div>
                        <span className="font-medium">Last Payment:</span>
                        <div className="text-muted-foreground">
                          {new Date(
                            selectedSubscription.lastPaymentDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Last Amount:</span>
                        <div className="text-muted-foreground">
                          €{selectedSubscription.lastPaymentAmount?.toFixed(2)}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedSubscription.daysOverdue > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium">Days Overdue:</span>
                      <span className="ml-2 text-red-600 font-bold">
                        {selectedSubscription.daysOverdue} days
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Communication Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Communication History
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Communications Sent:
                      </span>
                      <span className="font-medium">
                        {selectedSubscription.communicationsSent}
                      </span>
                    </div>
                    {selectedSubscription.lastCommunicationSent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Communication:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedSubscription.lastCommunicationSent
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedSubscription.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubscription.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Communication
                  </Button>
                  <Button variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
