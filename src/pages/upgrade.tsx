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
import { useAuth } from "../contexts/auth-context";

export function UpgradePage() {
  const { user } = useAuth();

  const plans = [
    {
      id: "simple",
      name: "Simple",
      price: "€9.99",
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
      price: "€19.99",
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
      price: "€49.99",
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
              Go Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Upgrade Your Plan
          </h1>
          <p className="text-muted-foreground mt-2">
            Unlock more features and capabilities for your business
          </p>
        </div>

        {/* Current Plan */}
        {user && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(user.plan)}
                  <CardTitle className="capitalize">{user.plan} Plan</CardTitle>
                  <Badge variant="secondary">Current</Badge>
                </div>
              </div>
              <CardDescription>
                You're currently on the {user.plan} plan
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
                className={`relative ${
                  plan.recommended ? "border-primary" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Recommended
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
                    Upgrade to {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                You're on the highest plan!
              </CardTitle>
              <CardDescription className="text-center">
                You have access to all Schedfy features. Thank you for being a
                Business customer!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help Choosing?</CardTitle>
            <CardDescription>
              Our team is here to help you find the perfect plan for your
              business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
