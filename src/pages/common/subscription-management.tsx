import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { useRegion } from "../../contexts/region-context";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  CreditCard,
  Crown,
  CheckCircle,
  Calendar,
  Download,
  Brain,
  TrendingUp,
  Users,
  Building,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function SubscriptionManagementPage() {
  const { t } = useTranslation("subscription");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { formatCurrency } = useCurrency();
  const { getPriceDisplay } = useRegion();

  // Helper to get numeric price for a plan (for calculations)
  const getNumericPrice = (planType: "simple" | "individual" | "business"): number => {
    const priceStr = getPriceDisplay(planType, billingPeriod);
    // Extract numeric value from formatted price (e.g., "€9.99" -> 9.99)
    const numericMatch = priceStr.match(/[\d,.]+/);
    if (numericMatch) {
      return parseFloat(numericMatch[0].replace(",", "."));
    }
    // Fallback prices if API fails
    const fallbackPrices: Record<string, Record<string, number>> = {
      simple: { monthly: 14.90, yearly: 149.00 },
      individual: { monthly: 34.90, yearly: 349.00 },
      business: { monthly: 89.90, yearly: 899.00 },
    };
    return fallbackPrices[planType]?.[billingPeriod] || 0;
  };

  const { user } = useAuth();
  const currentPlan = (user?.plan || "simple") as "simple" | "individual" | "business";

  // Trial calculations
  const trialDays = 14;
  const userCreatedAt = new Date(user?.createdAt || Date.now());
  const trialEndDate = new Date(userCreatedAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  // Assume on trial if within trial period and not simple (or if simple has trial, adjust here)
  // User request implies "Start Free Trial" exists for plans.
  const isOnTrial = currentPlan !== 'simple' && daysRemaining > 0;

  // Mock subscription data (would come from API in real app)
  const currentPrice = getNumericPrice(currentPlan);

  // AI Insights pricing (monthly only)
  const aiInsightsPriceDisplay = getPriceDisplay("ai_insights", "monthly");
  const aiInsightsNumericPrice = (() => {
    const match = aiInsightsPriceDisplay.match(/[\d,.]+/);
    if (match) return parseFloat(match[0].replace(",", "."));
    return 9.90; // Fallback
  })();

  const subscriptionData = {
    current: {
      plan: currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1),
      status: isOnTrial ? "trialing" : "active",
      price: isOnTrial ? 0 : currentPrice, // Price is 0 during trial? Usually yes.
      priceDisplay: isOnTrial ? getPriceDisplay(currentPlan, billingPeriod) : getPriceDisplay(currentPlan, billingPeriod),
      currency: "EUR",
      startDate: userCreatedAt.toISOString(),
      nextBilling: isOnTrial ? trialEndDate.toISOString() : "2024-02-01",
      features: [
        t("features.unlimitedBookings", "Unlimited bookings"),
        t("features.multiProfessional", "Multi-professional management"),
        t("features.advancedAnalytics", "Advanced analytics"),
        t("features.prioritySupport", "Priority support"),
        t("features.commissionTracking", "Commission tracking"),
        t("features.performanceAnalytics", "Performance analytics"),
        t("features.exportCapabilities", "Export capabilities"),
      ],
      addOns: currentPlan === 'business' ? [
        {
          id: "ai-insights",
          name: t("addOns.aiInsights.name", "AI Business Insights"),
          price: aiInsightsNumericPrice,
          priceDisplay: aiInsightsPriceDisplay,
          active: true,
          description: t("addOns.aiInsights.description", "AI-powered analytics and business recommendations"),
        },
      ] : [],
    },
    usage: {
      bookings: { current: 156, limit: currentPlan === 'simple' ? 50 : null, percentage: 0 },
      professionals: { current: 1, limit: currentPlan === 'simple' ? 1 : null, percentage: 0 },
      storage: { current: 0.5, limit: 10, percentage: 5 },
      aiInsights: { current: 12, limit: 100, percentage: 12 },
    },
    billing: {
      totalAmount: currentPrice + (currentPlan === 'business' ? aiInsightsNumericPrice : 0),
      nextPayment: "2024-02-01",
      paymentMethod: "**** **** **** 4242",
      invoices: [] as { id: string; date: string; amount: number; status: string }[],
    },
  };

  const plans = [
    {
      id: "simple",
      name: t("plans.simple.name", "Simple"),
      description: t("plans.simple.description", "Perfect for getting started"),
      price: getNumericPrice("simple"),
      priceDisplay: getPriceDisplay("simple", billingPeriod),
      popular: false,
      features: [
        t("plans.simple.feature1", "Up to 100 bookings/month"),
        t("plans.simple.feature2", "Basic reporting"),
        t("plans.simple.feature3", "Email support"),
        t("plans.simple.feature4", "Essential features"),
      ],
      limits: {
        bookings: 100,
        professionals: 1,
        storage: 1,
      },
    },
    {
      id: "individual",
      name: t("plans.individual.name", "Individual"),
      description: t("plans.individual.description", "Enhanced features for growing businesses"),
      price: getNumericPrice("individual"),
      priceDisplay: getPriceDisplay("individual", billingPeriod),
      popular: false,
      features: [
        t("plans.individual.feature1", "Unlimited bookings"),
        t("plans.individual.feature2", "Advanced calendar"),
        t("plans.individual.feature3", "Client management"),
        t("plans.individual.feature4", "Revenue forecasting"),
        t("plans.individual.feature5", "Priority support"),
      ],
      limits: {
        bookings: null,
        professionals: 3,
        storage: 5,
      },
    },
    {
      id: "business",
      name: t("plans.business.name", "Business"),
      description: t("plans.business.description", "Complete solution for teams"),
      price: getNumericPrice("business"),
      priceDisplay: getPriceDisplay("business", billingPeriod),
      popular: false,
      features: [
        t("plans.business.feature1", "Everything in Individual"),
        t("plans.business.feature2", "Multi-professional management"),
        t("plans.business.feature3", "Advanced analytics"),
        t("plans.business.feature4", "Commission tracking"),
        t("plans.business.feature5", "Custom branding"),
        t("plans.business.feature6", "Export capabilities"),
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
            {t("title", "Subscription Management")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle", "Manage your subscription and AI insights add-on")}
          </p>
        </div>
        {currentPlan !== 'simple' && (
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("actions.downloadInvoice", "Download Invoice")}
            </Button>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              {t("actions.updatePayment", "Update Payment")}
            </Button>
          </div>
        )}
      </div>

      {/* Current Subscription Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  {subscriptionData.current.plan} {t("plan.plan", "Plan")}
                </CardTitle>
                <CardDescription>
                  {t("plan.activeSince", "Active since")}{" "}
                  {new Date(
                    subscriptionData.current.startDate
                  ).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isOnTrial && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Trial: {daysRemaining} days left
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`${subscriptionData.current.status === 'trialing' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'}`}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t(
                  "plan.status." + subscriptionData.current.status,
                  subscriptionData.current.status
                )}
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
                  {billingPeriod === "monthly"
                    ? t("billing.perMonth", "per month")
                    : t("billing.perYear", "per year")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("billing.taxNotice", "Prices exclude VAT")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {isOnTrial ? "Trial Ends On" : t("billing.nextBilling", "Next billing")}
                </div>
                <div className="font-medium">
                  {new Date(
                    subscriptionData.billing.nextPayment
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">
                {t("plan.includedFeatures", "Included Features")}
              </h4>
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
                  <h4 className="font-medium">
                    {t("plan.activeAddOns", "Active Add-ons")}
                  </h4>
                  {subscriptionData.current.addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="font-medium">
                            {t("addOns.aiInsights.name", addOn.name)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t(
                              "addOns.aiInsights.description",
                              addOn.description
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(addOn.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {billingPeriod === "monthly"
                            ? t("billing.perMonth", "per month")
                            : t("billing.perYear", "per year")}
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
            <CardTitle>{t("usage.title", "Usage Overview")}</CardTitle>
            <CardDescription>
              {t("usage.description", "Current month usage statistics")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("usage.bookings", "Bookings")}</span>
                  <span>
                    {subscriptionData.usage.bookings.current}
                    {subscriptionData.usage.bookings.limit &&
                      ` / ${subscriptionData.usage.bookings.limit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      subscriptionData.usage.bookings.percentage
                    )}`}
                    style={{
                      width: `${Math.min(
                        subscriptionData.usage.bookings.percentage || 65,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("usage.professionals", "Professionals")}</span>
                  <span>
                    {subscriptionData.usage.professionals.current}
                    {subscriptionData.usage.professionals.limit &&
                      ` / ${subscriptionData.usage.professionals.limit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      subscriptionData.usage.professionals.percentage
                    )}`}
                    style={{
                      width: `${Math.min(
                        subscriptionData.usage.professionals.percentage || 40,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("usage.storage", "Storage")}</span>
                  <span>
                    {subscriptionData.usage.storage.current}GB /{" "}
                    {subscriptionData.usage.storage.limit}GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      subscriptionData.usage.storage.percentage
                    )}`}
                    style={{
                      width: `${subscriptionData.usage.storage.percentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("usage.aiInsights", "AI Insights")}</span>
                  <span>
                    {subscriptionData.usage.aiInsights.current} /{" "}
                    {subscriptionData.usage.aiInsights.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      subscriptionData.usage.aiInsights.percentage
                    )}`}
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
          <TabsTrigger value="plans">
            {t("tabs.changePlan", "Change Plan")}
          </TabsTrigger>
          <TabsTrigger value="addons">
            {t("tabs.addOns", "Add-ons")}
          </TabsTrigger>
          <TabsTrigger value="billing">
            {t("tabs.billing", "Billing")}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            {t("tabs.invoices", "Invoices")}
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t("plans.title", "Available Plans")}
            </h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor="billing-toggle" className="text-sm">
                {t("billing.monthly", "Monthly")}
              </Label>
              <Switch
                id="billing-toggle"
                checked={billingPeriod === "yearly"}
                onCheckedChange={(checked: boolean) =>
                  setBillingPeriod(checked ? "yearly" : "monthly")
                }
              />
              <Label htmlFor="billing-toggle" className="text-sm">
                {t("billing.yearly", "Yearly")}{" "}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {t("billing.save20", "Save 20%")}
                </Badge>
              </Label>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""
                  }`}
              >
                <CardHeader>
                  <div className="text-center">
                    <CardTitle className="text-xl">
                      {t(`plans.${plan.id}.name`, plan.name)}
                    </CardTitle>
                    <CardDescription>
                      {t(`plans.${plan.id}.description`, plan.description)}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {billingPeriod === "monthly"
                          ? t("billing.perMonth", "per month")
                          : t("billing.perYear", "per year")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("billing.taxNotice", "Prices exclude VAT")}
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
                      currentPlan === plan.id
                        ? "outline"
                        : "default"
                    }
                    disabled={
                      currentPlan === plan.id
                    }
                  >
                    {currentPlan === plan.id
                      ? t("plans.currentPlan", "Current Plan")
                      : t("plans.upgrade", "Upgrade")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              {t("addOns.title", "Available Add-ons")}
            </h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-purple-500" />
                    <div>
                      <CardTitle>
                        {t("addOns.aiInsights.name", "AI Business Insights")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "addOns.aiInsights.description",
                          "Advanced AI-powered analytics and recommendations"
                        )}
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
                      {billingPeriod === "monthly"
                        ? t("billing.perMonth", "/month")
                        : t("billing.perYear", "/year")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground -mt-2 mb-2">
                    {t("billing.taxNotice", "Prices exclude VAT")}
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t(
                          "addOns.aiInsights.features.predictive",
                          "Predictive analytics"
                        )}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t(
                          "addOns.aiInsights.features.clientBehavior",
                          "Client behavior insights"
                        )}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Building className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t(
                          "addOns.aiInsights.features.optimization",
                          "Business optimization tips"
                        )}
                      </span>
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    disabled={subscriptionData.current.addOns.some(a => a.id === 'ai-insights')}
                    onClick={() => {
                      if (isOnTrial) {
                        if (confirm("Subscribing to AI Business Insights will end your free trial immediately and you will be charged for the plan + add-on. Do you want to continue?")) {
                          toast.info("Redirecting to payment...");
                          // Logic to process immediate charge would go here
                        }
                      } else {
                        toast.success("AI Insights added to your plan!");
                      }
                    }}
                  >
                    {subscriptionData.current.addOns.some(a => a.id === 'ai-insights') ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t("addOns.active", "Active")}
                      </>
                    ) : (
                      t("actions.add", "Add to Plan")
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Booking Capacity Boost Add-on */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle>
                        {t("addOns.bookingBoost.name", "Booking Capacity Boost")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "addOns.bookingBoost.description",
                          "Expand your monthly booking capacity"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      billingPeriod === "monthly" ? 4.99 : 49.9
                    )}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {billingPeriod === "monthly"
                        ? t("billing.perMonth", "/month")
                        : t("billing.perYear", "/year")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground -mt-2 mb-2">
                    {t("billing.taxNotice", "Prices exclude VAT")}
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t("addOns.bookingBoost.features.extra50", "+50 Bookings per month")}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t("addOns.bookingBoost.features.flexible", "Flexible - cancel anytime")}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm">
                        {t("addOns.bookingBoost.features.stackable", "Stackable packages")}
                      </span>
                    </li>
                  </ul>
                  <Button className="w-full">
                    {t("actions.add", "Add to Plan")}
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
                <CardTitle>
                  {t("billing.paymentMethod.title", "Payment Method")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "billing.paymentMethod.description",
                    "Manage your payment information"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {t(
                          "billing.paymentMethod.cardEnding",
                          "Visa ending in 4242"
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("billing.paymentMethod.expires", "Expires")} 12/26
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    {t("actions.update", "Update")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("billing.information.title", "Billing Information")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "billing.information.description",
                    "Update your billing details"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      {t("billing.information.companyName", "Company Name")}
                    </Label>
                    <Input id="company" defaultValue="Bella Vita Salon & Spa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">
                      {t("billing.information.vatNumber", "VAT Number")}
                    </Label>
                    <Input id="vat" defaultValue="PT123456789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {t("billing.information.address", "Address")}
                  </Label>
                  <Input
                    id="address"
                    defaultValue="Rua das Flores, 123, Lisboa, Portugal"
                  />
                </div>
                <Button>
                  {t(
                    "billing.information.update",
                    "Update Billing Information"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>{t("invoices.title", "Invoice History")}</CardTitle>
              <CardDescription>
                {t("invoices.description", "Download and manage your invoices")}
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
                        <div className="font-medium">
                          {t("invoices.invoice", "Invoice")} {invoice.id}
                        </div>
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
                          {t(
                            `invoices.status.${invoice.status}`,
                            invoice.status
                          )}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t("actions.download", "Download")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}

export default SubscriptionManagementPage;
