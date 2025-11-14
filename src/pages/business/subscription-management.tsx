import { useState } from "react";
import { useCurrency } from "../../hooks/useCurrency";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  CreditCard,
  Crown,
  Star,
  CheckCircle,
  Calendar,
  Download,
  Brain,
  TrendingUp,
  Users,
  Building,
} from "lucide-react";

export function SubscriptionManagementPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const { formatCurrency } = useCurrency();

  // Mock subscription data
  const subscriptionData = {
    current: {
      plan: "Business",
      status: "active",
      price: billingPeriod === "monthly" ? 49.99 : 499.9,
      currency: "EUR",
      startDate: "2023-06-01",
      nextBilling: "2024-02-01",
      features: [
        "Unlimited bookings",
        "Multi-professional management",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Commission tracking",
        "Performance analytics",
        "Export capabilities",
      ],
      addOns: [
        {
          id: "ai-insights",
          name: "AI Business Insights",
          price: billingPeriod === "monthly" ? 19.99 : 199.9,
          active: true,
          description: "AI-powered analytics and business recommendations",
        },
      ],
    },
    usage: {
      bookings: { current: 156, limit: null, percentage: 0 },
      professionals: { current: 8, limit: null, percentage: 0 },
      storage: { current: 2.4, limit: 10, percentage: 24 },
      aiInsights: { current: 45, limit: 100, percentage: 45 },
    },
    billing: {
      totalAmount: billingPeriod === "monthly" ? 69.98 : 699.8,
      nextPayment: "2024-02-01",
      paymentMethod: "**** **** **** 4242",
      invoices: [
        { id: "INV-001", date: "2024-01-01", amount: 69.98, status: "paid" },
        { id: "INV-002", date: "2023-12-01", amount: 69.98, status: "paid" },
        { id: "INV-003", date: "2023-11-01", amount: 69.98, status: "paid" },
      ],
    },
  };

  const plans = [
    {
      id: "simple",
      name: "Simple",
      description: "Perfect for getting started",
      price: billingPeriod === "monthly" ? 9.99 : 99.9,
      popular: false,
      features: [
        "Up to 100 bookings/month",
        "Basic reporting",
        "Email support",
        "Essential features",
      ],
      limits: {
        bookings: 100,
        professionals: 1,
        storage: 1,
      },
    },
    {
      id: "individual",
      name: "Individual",
      description: "Enhanced features for growing businesses",
      price: billingPeriod === "monthly" ? 19.99 : 199.9,
      popular: true,
      features: [
        "Unlimited bookings",
        "Advanced calendar",
        "Client management",
        "Revenue forecasting",
        "Priority support",
      ],
      limits: {
        bookings: null,
        professionals: 3,
        storage: 5,
      },
    },
    {
      id: "business",
      name: "Business",
      description: "Complete solution for teams",
      price: billingPeriod === "monthly" ? 49.99 : 499.9,
      popular: false,
      features: [
        "Everything in Individual",
        "Multi-professional management",
        "Advanced analytics",
        "Commission tracking",
        "Custom branding",
        "Export capabilities",
      ],
      limits: {
        bookings: null,
        professionals: null,
        storage: 10,
      },
    },
  ];

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and AI insights add-on
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment
          </Button>
        </div>
      </div>

      {/* Current Subscription Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  {subscriptionData.current.plan} Plan
                </CardTitle>
                <CardDescription>
                  Active since{" "}
                  {new Date(
                    subscriptionData.current.startDate
                  ).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {subscriptionData.current.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(subscriptionData.billing.totalAmount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {billingPeriod === "monthly" ? "per month" : "per year"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Next billing
                </div>
                <div className="font-medium">
                  {new Date(
                    subscriptionData.billing.nextPayment
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Included Features</h4>
              <div className="grid grid-cols-2 gap-2">
                {subscriptionData.current.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {subscriptionData.current.addOns.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Active Add-ons</h4>
                  {subscriptionData.current.addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="font-medium">{addOn.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {addOn.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(addOn.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {billingPeriod === "monthly" ? "/month" : "/year"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>Current month usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bookings</span>
                  <span>
                    {subscriptionData.usage.bookings.current}
                    {subscriptionData.usage.bookings.limit &&
                      ` / ${subscriptionData.usage.bookings.limit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(subscriptionData.usage.bookings.percentage)}`}
                    style={{
                      width: `${Math.min(subscriptionData.usage.bookings.percentage || 65, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Professionals</span>
                  <span>
                    {subscriptionData.usage.professionals.current}
                    {subscriptionData.usage.professionals.limit &&
                      ` / ${subscriptionData.usage.professionals.limit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(subscriptionData.usage.professionals.percentage)}`}
                    style={{
                      width: `${Math.min(subscriptionData.usage.professionals.percentage || 40, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span>
                    {subscriptionData.usage.storage.current}GB /{" "}
                    {subscriptionData.usage.storage.limit}GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(subscriptionData.usage.storage.percentage)}`}
                    style={{
                      width: `${subscriptionData.usage.storage.percentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI Insights</span>
                  <span>
                    {subscriptionData.usage.aiInsights.current} /{" "}
                    {subscriptionData.usage.aiInsights.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(subscriptionData.usage.aiInsights.percentage)}`}
                    style={{
                      width: `${subscriptionData.usage.aiInsights.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Change Plan</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Available Plans</h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor="billing-toggle" className="text-sm">
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={billingPeriod === "yearly"}
                onCheckedChange={(checked: boolean) =>
                  setBillingPeriod(checked ? "yearly" : "monthly")
                }
              />
              <Label htmlFor="billing-toggle" className="text-sm">
                Yearly{" "}
                <Badge variant="secondary" className="ml-1 text-xs">
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {billingPeriod === "monthly" ? "per month" : "per year"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={
                      subscriptionData.current.plan.toLowerCase() === plan.id
                        ? "outline"
                        : "default"
                    }
                    disabled={
                      subscriptionData.current.plan.toLowerCase() === plan.id
                    }
                  >
                    {subscriptionData.current.plan.toLowerCase() === plan.id
                      ? "Current Plan"
                      : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Available Add-ons</h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-purple-500" />
                    <div>
                      <CardTitle>AI Business Insights</CardTitle>
                      <CardDescription>
                        Advanced AI-powered analytics and recommendations
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      billingPeriod === "monthly" ? 19.99 : 199.9
                    )}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {billingPeriod === "monthly" ? "/month" : "/year"}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-sm">Predictive analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-green-500" />
                      <span className="text-sm">Client behavior insights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Building className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        Business optimization tips
                      </span>
                    </li>
                  </ul>
                  <Button className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Active
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Manage your payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Visa ending in 4242</div>
                      <div className="text-sm text-muted-foreground">
                        Expires 12/26
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Update your billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue="Bella Vita Salon & Spa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">VAT Number</Label>
                    <Input id="vat" defaultValue="PT123456789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue="Rua das Flores, 123, Lisboa, Portugal"
                  />
                </div>
                <Button>Update Billing Information</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                Download and manage your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionData.billing.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Invoice {invoice.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
