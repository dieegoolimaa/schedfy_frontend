import { useTranslation } from "react-i18next";
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
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Percent,
  Gift,
  CreditCard,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react";

interface Commission {
  id: string;
  professionalName: string;
  serviceType: string;
  rate: number;
  type: "percentage" | "fixed";
  status: "active" | "inactive";
  createdAt: string;
  totalEarned: number;
}

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: "active" | "inactive" | "expired";
}

interface Discount {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  applicableServices: string[];
  conditions: string;
  validFrom: string;
  validUntil: string;
  status: "active" | "inactive" | "scheduled";
}

export function CommissionsManagementPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("commissions");
  const [isAddCommissionOpen, setIsAddCommissionOpen] = useState(false);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);

  // Mock data
  const commissions: Commission[] = [
    {
      id: "1",
      professionalName: "João Santos",
      serviceType: "Haircut",
      rate: 15,
      type: "percentage",
      status: "active",
      createdAt: "2024-01-15",
      totalEarned: 2450,
    },
    {
      id: "2",
      professionalName: "Maria Silva",
      serviceType: "Massage",
      rate: 50,
      type: "fixed",
      status: "active",
      createdAt: "2024-01-10",
      totalEarned: 1800,
    },
  ];

  const vouchers: Voucher[] = [
    {
      id: "1",
      code: "WELCOME20",
      title: "Welcome Discount",
      description: "20% off for new customers",
      type: "percentage",
      value: 20,
      minAmount: 50,
      maxDiscount: 30,
      usageLimit: 100,
      usedCount: 45,
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      status: "active",
    },
    {
      id: "2",
      code: "SUMMER10",
      title: "Summer Special",
      description: "€10 off summer services",
      type: "fixed",
      value: 10,
      usageLimit: 50,
      usedCount: 12,
      validFrom: "2024-06-01",
      validUntil: "2024-08-31",
      status: "active",
    },
  ];

  const discounts: Discount[] = [
    {
      id: "1",
      name: "Student Discount",
      description: "15% discount for students",
      type: "percentage",
      value: 15,
      applicableServices: ["Haircut", "Hair Color"],
      conditions: "Valid student ID required",
      validFrom: "2024-01-01",
      validUntil: "2024-12-31",
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Active
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("entity.commissions.title", "Commissions & Promotions")}
          </h1>
          <p className="text-base text-muted-foreground">
            {t(
              "entity.commissions.subtitle",
              "Manage commissions, vouchers, and discounts for your business"
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commission Paid
            </CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">€4,250</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12.5%</span>
              <span>this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Vouchers
            </CardTitle>
            <Gift className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {vouchers.filter((v) => v.status === "active").length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {vouchers.reduce((acc, v) => acc + v.usedCount, 0)} total uses
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discount Savings
            </CardTitle>
            <Percent className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">€1,850</div>
            <div className="text-xs text-muted-foreground mt-2">
              Given to customers
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Commission Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">12.5%</div>
            <div className="text-xs text-muted-foreground mt-2">
              Across all services
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="commissions" className="text-sm">
            Commissions
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="text-sm">
            Vouchers
          </TabsTrigger>
          <TabsTrigger value="discounts" className="text-sm">
            Discounts
          </TabsTrigger>
        </TabsList>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Professional Commissions
                  </CardTitle>
                  <CardDescription>
                    Manage commission rates for your professionals
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddCommissionOpen}
                  onOpenChange={setIsAddCommissionOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Commission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Commission</DialogTitle>
                      <DialogDescription>
                        Set up commission rates for professionals
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="professional">Professional</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select professional" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="joao">João Santos</SelectItem>
                            <SelectItem value="maria">Maria Silva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="service">Service Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="haircut">Haircut</SelectItem>
                            <SelectItem value="massage">Massage</SelectItem>
                            <SelectItem value="facial">Facial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Commission Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="rate">Rate</Label>
                          <Input type="number" placeholder="15" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddCommissionOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddCommissionOpen(false)}>
                        Create Commission
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professional</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {commission.professionalName}
                        </TableCell>
                        <TableCell>{commission.serviceType}</TableCell>
                        <TableCell>
                          {commission.type === "percentage"
                            ? `${commission.rate}%`
                            : `€${commission.rate}`}
                        </TableCell>
                        <TableCell>
                          €{commission.totalEarned.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(commission.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vouchers Tab */}
        <TabsContent value="vouchers" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Voucher Codes
                  </CardTitle>
                  <CardDescription>
                    Create and manage promotional voucher codes
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddVoucherOpen}
                  onOpenChange={setIsAddVoucherOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Voucher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Voucher</DialogTitle>
                      <DialogDescription>
                        Set up a promotional voucher code
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="code">Voucher Code</Label>
                          <Input placeholder="SUMMER2024" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="title">Title</Label>
                          <Input placeholder="Summer Sale" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea placeholder="Special summer discount for all services" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Discount Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="value">Value</Label>
                          <Input type="number" placeholder="20" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="limit">Usage Limit</Label>
                          <Input type="number" placeholder="100" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="validFrom">Valid From</Label>
                          <Input type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="validUntil">Valid Until</Label>
                          <Input type="date" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddVoucherOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddVoucherOpen(false)}>
                        Create Voucher
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono font-medium">
                          {voucher.code}
                        </TableCell>
                        <TableCell>{voucher.title}</TableCell>
                        <TableCell>
                          {voucher.type === "percentage"
                            ? `${voucher.value}%`
                            : `€${voucher.value}`}
                        </TableCell>
                        <TableCell>
                          {voucher.usedCount}/{voucher.usageLimit}
                        </TableCell>
                        <TableCell>
                          {new Date(voucher.validUntil).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Service Discounts
                  </CardTitle>
                  <CardDescription>
                    Manage automatic discounts for services
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddDiscountOpen}
                  onOpenChange={setIsAddDiscountOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Discount
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Service Discount</DialogTitle>
                      <DialogDescription>
                        Create an automatic discount rule
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Discount Name</Label>
                        <Input placeholder="Student Discount" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea placeholder="Special discount for students with valid ID" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Discount Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="value">Value</Label>
                          <Input type="number" placeholder="15" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="conditions">Conditions</Label>
                        <Textarea placeholder="Valid student ID required, cannot be combined with other offers" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="validFrom">Valid From</Label>
                          <Input type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="validUntil">Valid Until</Label>
                          <Input type="date" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDiscountOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddDiscountOpen(false)}>
                        Create Discount
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Applicable Services</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-medium">
                          {discount.name}
                        </TableCell>
                        <TableCell>
                          {discount.type === "percentage"
                            ? `${discount.value}%`
                            : `€${discount.value}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {discount.applicableServices
                              .slice(0, 2)
                              .map((service) => (
                                <Badge
                                  key={service}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {service}
                                </Badge>
                              ))}
                            {discount.applicableServices.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{discount.applicableServices.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(discount.validUntil).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(discount.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
