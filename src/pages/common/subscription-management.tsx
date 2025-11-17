import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { subscriptionsService } from "../../services/subscriptions.service";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

/**
 * Unified Subscription Management - Adapts to user's plan (Simple, Individual, Business)
 * Consolidates all subscription management variations into a single adaptive component
 */
export default function UnifiedSubscriptionManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const plan = user?.plan || "simple";

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsService.getCurrentSubscription();
      setSubscription(data);
      setAiInsightsEnabled(data?.aiInsightsSubscribed || false);
    } catch (error) {
      console.error("Failed to load subscription:", error);
      toast.error(t("subscriptions.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleAiInsightsToggle = async (enabled: boolean) => {
    if (plan === "simple") {
      toast.error(t("subscriptions.upgradeRequired"));
      return;
    }

    try {
      setUpdating(true);
      if (enabled) {
        await subscriptionsService.subscribeToAiInsights();
        toast.success(t("subscriptions.aiInsights.enabled"));
      } else {
        await subscriptionsService.unsubscribeFromAiInsights();
        toast.success(t("subscriptions.aiInsights.disabled"));
      }
      setAiInsightsEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle AI Insights:", error);
      toast.error(t("subscriptions.aiInsights.toggleError"));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/upgrade");
  };

  const handleManagePayment = () => {
    navigate("/payment-management");
  };

  const handleCancelSubscription = async () => {
    if (!confirm(t("subscriptions.confirmCancel"))) return;

    try {
      setUpdating(true);
      await subscriptionsService.cancelSubscription();
      toast.success(t("subscriptions.cancelSuccess"));
      loadSubscription();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error(t("subscriptions.cancelError"));
    } finally {
      setUpdating(false);
    }
  };

  // Plan features mapping
  const planFeatures = {
    simple: [
      {
        icon: Calendar,
        text: t("subscriptions.features.basicBooking"),
        included: true,
      },
      {
        icon: Users,
        text: t("subscriptions.features.singleUser"),
        included: true,
      },
      {
        icon: Clock,
        text: t("subscriptions.features.basicSchedule"),
        included: true,
      },
      {
        icon: BarChart3,
        text: t("subscriptions.features.basicReports"),
        included: false,
      },
      {
        icon: Zap,
        text: t("subscriptions.features.aiInsights"),
        included: false,
      },
      {
        icon: Users,
        text: t("subscriptions.features.multiUser"),
        included: false,
      },
    ],
    individual: [
      {
        icon: Calendar,
        text: t("subscriptions.features.advancedBooking"),
        included: true,
      },
      {
        icon: Users,
        text: t("subscriptions.features.clientManagement"),
        included: true,
      },
      {
        icon: BarChart3,
        text: t("subscriptions.features.advancedReports"),
        included: true,
      },
      {
        icon: Zap,
        text: t("subscriptions.features.aiInsights"),
        included: aiInsightsEnabled,
      },
      {
        icon: TrendingUp,
        text: t("subscriptions.features.analytics"),
        included: true,
      },
      {
        icon: Users,
        text: t("subscriptions.features.multiUser"),
        included: false,
      },
    ],
    business: [
      {
        icon: Calendar,
        text: t("subscriptions.features.unlimitedBooking"),
        included: true,
      },
      {
        icon: Users,
        text: t("subscriptions.features.multiUser"),
        included: true,
      },
      {
        icon: BarChart3,
        text: t("subscriptions.features.premiumReports"),
        included: true,
      },
      {
        icon: Zap,
        text: t("subscriptions.features.aiInsights"),
        included: true,
      },
      {
        icon: TrendingUp,
        text: t("subscriptions.features.advancedAnalytics"),
        included: true,
      },
      {
        icon: Shield,
        text: t("subscriptions.features.prioritySupport"),
        included: true,
      },
    ],
  };

  const currentFeatures =
    planFeatures[plan as keyof typeof planFeatures] || planFeatures.simple;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("subscriptions.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subscriptions.description")}
          </p>
        </div>
        {plan !== "business" && (
          <Button onClick={handleUpgrade} size="lg">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("subscriptions.upgrade")}
          </Button>
        )}
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {t("subscriptions.currentPlan")}
                <Badge variant={plan === "business" ? "default" : "secondary"}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t(`subscriptions.planDescription.${plan}`)}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {plan === "simple"
                  ? t("subscriptions.free")
                  : plan === "individual"
                  ? "€29/mo"
                  : "€99/mo"}
              </p>
              {subscription?.nextBillingDate && (
                <p className="text-sm text-muted-foreground">
                  {t("subscriptions.nextBilling")}:{" "}
                  {new Date(subscription.nextBillingDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                {feature.included ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-300" />
                )}
                <feature.icon className="w-4 h-4 text-muted-foreground" />
                <span
                  className={feature.included ? "" : "text-muted-foreground"}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex gap-2">
            {plan !== "simple" && (
              <>
                <Button variant="outline" onClick={handleManagePayment}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t("subscriptions.managePayment")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={updating}
                >
                  {t("subscriptions.cancel")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Add-on (Individual/Business) */}
      {(plan === "individual" || plan === "business") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  {t("subscriptions.aiInsights.title")}
                </CardTitle>
                <CardDescription>
                  {t("subscriptions.aiInsights.description")}
                </CardDescription>
              </div>
              {plan === "individual" && (
                <Switch
                  checked={aiInsightsEnabled}
                  onCheckedChange={handleAiInsightsToggle}
                  disabled={updating}
                />
              )}
              {plan === "business" && (
                <Badge variant="default">{t("subscriptions.included")}</Badge>
              )}
            </div>
          </CardHeader>
          {plan === "individual" && aiInsightsEnabled && (
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  {t("subscriptions.aiInsights.activeMessage")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">+€15/mo</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Billing History */}
      {plan !== "simple" && subscription?.billingHistory && (
        <Card>
          <CardHeader>
            <CardTitle>{t("subscriptions.billingHistory")}</CardTitle>
            <CardDescription>
              {t("subscriptions.billingHistoryDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscription.billingHistory.map(
                (invoice: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA for Simple Plan */}
      {plan === "simple" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{t("subscriptions.upgradePrompt.title")}</CardTitle>
            <CardDescription>
              {t("subscriptions.upgradePrompt.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Plan</CardTitle>
                  <p className="text-2xl font-bold">€29/mo</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("subscriptions.planDescription.individual")}
                  </p>
                  <Button onClick={handleUpgrade} className="w-full">
                    {t("subscriptions.selectPlan")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Plan</CardTitle>
                  <p className="text-2xl font-bold">€99/mo</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("subscriptions.planDescription.business")}
                  </p>
                  <Button onClick={handleUpgrade} className="w-full">
                    {t("subscriptions.selectPlan")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
