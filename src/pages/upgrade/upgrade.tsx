import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Crown, Zap, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useRegion } from "../../contexts/region-context";
import { toast as _toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UpgradePage() {
  const { t } = useTranslation("upgrade");
  const { user } = useAuth();
  const { getPriceDisplay, region, regionConfig, pricingLoading } = useRegion();
  const [isLoading, _setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpgrade = (planId: string) => {
    navigate(`/upgrade/checkout?planId=${planId}`);
  };

  const plans = [
    {
      id: "simple",
      name: "Simple",
      price: pricingLoading ? "..." : getPriceDisplay("simple", "monthly"),
      period: "/month",
      description: "Perfect for solo professionals",
      features: [
        "Basic booking management",
        "Simple reporting",
        "Service management",
        "Email support",
      ],
      current: user?.plan === "simple",
      recommended: false,
    },
    {
      id: "individual",
      name: "Individual",
      price: pricingLoading ? "..." : getPriceDisplay("individual", "monthly"),
      period: "/month",
      description: "AI-powered insights for growing businesses",
      features: [
        "Everything in Simple",
        "AI-powered insights",
        "Advanced analytics",
        "Service optimization",
        "Priority support",
      ],
      current: user?.plan === "individual",
      recommended: false,
    },
    {
      id: "business",
      name: "Business",
      price: pricingLoading ? "..." : getPriceDisplay("business", "monthly"),
      period: "/month",
      description: "Complete solution for teams",
      features: [
        "Everything in Individual",
        "Multi-professional management",
        "Team collaboration",
        "Advanced role management",
        "Custom integrations",
        "Dedicated support",
      ],
      current: user?.plan === "business",
      recommended: false,
    },
  ];

  const currentPlanIndex = plans.findIndex((plan) => plan.current);
  let availableUpgrades = plans.slice(currentPlanIndex + 1);

  // Special "Unlimited Bookings" add-on for Simple plan users
  if (user?.plan === "simple") {
    const unlimitedPriceDisplay = pricingLoading ? "..." : getPriceDisplay("simple_unlimited", "monthly");

    const simpleUnlimitedPlan = {
      id: "simple_unlimited",
      name: t("plans.unlimited.name", "Unlimited Bookings"),
      price: unlimitedPriceDisplay,
      period: "/month",
      description: t("plans.unlimited.description", "Remove booking limits from your Simple plan"),
      features: [
        t("plans.unlimited.feature1", "Unlimited bookings"),
        t("plans.unlimited.feature2", "Keep current features"),
        t("plans.unlimited.feature3", "No AI features"),
        t("plans.unlimited.feature4", "Cancel anytime"),
      ],
      current: false,
      recommended: true,
    };

    availableUpgrades = [simpleUnlimitedPlan, ...availableUpgrades];
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "simple":
        return <Star className="h-5 w-5" />;
      case "individual":
        return <Zap className="h-5 w-5" />;
      case "business":
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("goBack")}
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            {user && (
              <Badge variant="secondary" className="text-sm font-normal py-1">
                {t("currentPlan", { plan: user.plan })}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {t("subtitle")}
          </p>
        </div>



        {/* Available Upgrades */}
        {availableUpgrades.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {availableUpgrades.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col h-full relative ${plan.recommended ? "border-primary" : ""
                  }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {t("recommended")}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.id)}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!isLoading}
                  >
                    {isLoading === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("upgradeTo", { plan: plan.name })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {t("highestPlan.title")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("highestPlan.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">{t("returnToDashboard")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("needHelp.title")}</CardTitle>
            <CardDescription>
              {t("needHelp.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/support">
                {t("contactSupport")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
