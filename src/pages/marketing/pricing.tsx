import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";
import { useRegion } from "@/contexts/region-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const { t } = useTranslation("pricing");
  const { getPriceDisplay } = useRegion();
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");

  // Dynamic plans - 3 plans only (Simple Unlimited is internal upgrade)
  const plans = [
    {
      id: "simple",
      name: t("simple.name", "Simple"),
      type: "simple",
      price: getPriceDisplay("simple", billingPeriod === "month" ? "monthly" : "yearly"),
      period: billingPeriod === "month" ? t("perMonth", "/month") : t("perYear", "/year"),
      description: t("simple.description", "For teams and establishments"),
      popular: false,
      features: [
        { name: t("simple.feature1", "Up to 150 bookings/month"), included: true },
        { name: t("simple.feature2", "Unlimited professionals"), included: true },
        { name: t("simple.feature3", "Email notifications"), included: true },
        { name: t("simple.feature4", "Mobile responsive"), included: true },
        { name: t("simple.feature5", "Basic reports"), included: true },
        { name: t("simple.feature6", "AI Insights included"), included: true },
        { name: t("simple.feature9", "No client management"), included: false },
      ],
      cta: t("simple.cta", "Start Free"),
      link: `/register?plan=simple&billing=${billingPeriod}`,
    },
    {
      id: "individual",
      name: t("individual.name", "Individual"),
      type: "individual",
      price: getPriceDisplay("individual", billingPeriod === "month" ? "monthly" : "yearly"),
      period: billingPeriod === "month" ? t("perMonth", "/month") : t("perYear", "/year"),
      description: t("individual.description", "For solo professionals"),
      popular: false,
      features: [
        { name: t("individual.feature1", "Unlimited bookings"), included: true },
        { name: t("individual.feature2", "1 professional"), included: true },
        { name: t("individual.feature3", "SMS & Email notifications"), included: true },
        { name: t("individual.feature4", "AI Insights included"), included: true },
        { name: t("individual.feature5", "Unlimited client management"), included: true },
        { name: t("individual.feature6", "Custom branding"), included: true },
        { name: t("individual.feature9", "Advanced reporting"), included: true },
      ],
      cta: t("individual.cta", "Start Free Trial"),
      link: `/register?plan=individual&billing=${billingPeriod}`,
    },
    {
      id: "business",
      name: t("business.name", "Business"),
      type: "business",
      price: getPriceDisplay("business", billingPeriod === "month" ? "monthly" : "yearly"),
      period: billingPeriod === "month" ? t("perMonth", "/month") : t("perYear", "/year"),
      description: t("business.description", "Complete solution for enterprises"),
      popular: false,
      features: [
        { name: t("business.feature1", "Everything in Individual"), included: true },
        { name: t("business.feature2", "Unlimited professionals"), included: true },
        { name: t("business.feature3", "Advanced AI analytics"), included: true },
        { name: t("business.feature4", "Multi-location support"), included: true },
        { name: t("business.feature5", "Priority support"), included: true },
        { name: t("business.feature6", "Custom integrations"), included: true },
        { name: t("business.feature10", "Unlimited clients"), included: true },
      ],
      cta: t("business.cta", "Contact Sales"),
      link: `/register?plan=business&billing=${billingPeriod}`,
    },
  ];

  const faqs = [
    {
      question: t("pricing.faq.q1", "Can I change my plan later?"),
      answer: t(
        "pricing.faq.a1",
        "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
      ),
    },
    {
      question: t("pricing.faq.q2", "Is there a free trial?"),
      answer: t(
        "pricing.faq.a2",
        "Yes, all plans come with a 14-day free trial. No credit card required to start."
      ),
    },
    {
      question: t("pricing.faq.q3", "What payment methods do you accept?"),
      answer: t(
        "pricing.faq.a3",
        "We accept all major credit cards, debit cards, and local payment methods for Portugal, Brazil, and United States."
      ),
    },
    {
      question: t("pricing.faq.q4", "Can I cancel anytime?"),
      answer: t(
        "pricing.faq.a4",
        "Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees."
      ),
    },
    {
      question: t(
        "pricing.faq.q5",
        "Do you offer discounts for annual billing?"
      ),
      answer: t(
        "pricing.faq.a5",
        "Yes! Save 20% when you choose annual billing. Contact our sales team for more information."
      ),
    },
    {
      question: t("pricing.faq.q6", "What happens to my data if I cancel?"),
      answer: t(
        "pricing.faq.a6",
        "Your data remains accessible for 30 days after cancellation. You can export it anytime during this period."
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("hero.title", "Simple, Transparent Pricing")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("hero.subtitle", "Choose the perfect plan for your business. All plans include a 14-day free trial.")}
            </p>
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Label htmlFor="billing-period" className={`text-sm font-medium ${billingPeriod === "month" ? "text-primary" : "text-muted-foreground"}`}>
                {t("billing.monthly", "Monthly")}
              </Label>
              <Switch
                id="billing-period"
                checked={billingPeriod === "year"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "year" : "month")}
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="billing-period" className={`text-sm font-medium ${billingPeriod === "year" ? "text-primary" : "text-muted-foreground"}`}>
                  {t("billing.yearly", "Yearly")}
                </Label>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {t("billing.save", "Save 20%")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative flex flex-col ${plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border"
                  }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("pricing.taxNotice", "Prices exclude VAT")}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${feature.included
                            ? "text-foreground"
                            : "text-muted-foreground/70"
                            }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to={plan.link}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("pricing.compare.title", "All Plans Include")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "pricing.compare.subtitle",
                "Core features available across all subscription tiers"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              t("pricing.allPlans.feature1", "Secure cloud storage"),
              t("pricing.allPlans.feature2", "Mobile & web access"),
              t("pricing.allPlans.feature3", "Client notifications"),
              t("pricing.allPlans.feature4", "Payment processing"),
              t("pricing.allPlans.feature5", "Data encryption"),
              t("pricing.allPlans.feature6", "Regular updates"),
              t("pricing.allPlans.feature7", "24/7 system monitoring"),
              t("pricing.allPlans.feature8", "GDPR compliance"),
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("pricing.faq.title", "Frequently Asked Questions")}
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("pricing.cta.title", "Ready to Get Started?")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t(
              "pricing.cta.subtitle",
              "Start your 14-day free trial. No credit card required."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                {t("pricing.cta.start", "Start Free Trial")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                {t("pricing.cta.contact", "Contact Sales")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
