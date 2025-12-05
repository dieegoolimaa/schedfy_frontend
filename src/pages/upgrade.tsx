import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Crown, Zap, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/auth-context";
import { useRegion } from "../contexts/region-context";

export function UpgradePage() {
  const { t } = useTranslation("upgrade");
  const { user } = useAuth();
  const { getPriceDisplay } = useRegion();

  const plans = [
    {
      id: "simple",
      name: "Simple",
      price: getPriceDisplay("simple", "monthly"),
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
      price: getPriceDisplay("individual", "monthly"),
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
      recommended: true,
    },
    {
      id: "business",
      name: "Business",
      price: getPriceDisplay("business", "monthly"),
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
  const availableUpgrades = plans.slice(currentPlanIndex + 1);

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
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("subtitle")}
          </p>
        </div>

        {/* Current Plan */}
        {user && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(user.plan)}
                  <CardTitle className="capitalize">{user.plan} {t("plan")}</CardTitle>
                  <Badge variant="secondary">{t("current")}</Badge>
                </div>
              </div>
              <CardDescription>
                {t("currentPlanDescription", { plan: user.plan })}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Available Upgrades */}
        {availableUpgrades.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {availableUpgrades.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.recommended ? "border-primary" : ""
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
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
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
                  <Button className="w-full" size="lg">
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
            <Button variant="outline">{t("contactSupport")}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
