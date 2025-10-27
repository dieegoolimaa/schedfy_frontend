import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X } from "lucide-react";

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.simple.name", "Simple"),
      price: "€9.99",
      period: t("pricing.period", "/month"),
      description: t(
        "pricing.simple.description",
        "Perfect for individual professionals starting their journey"
      ),
      popular: false,
      features: [
        {
          name: t("pricing.simple.feature1", "Up to 50 bookings/month"),
          included: true,
        },
        {
          name: t("pricing.simple.feature2", "Basic calendar management"),
          included: true,
        },
        {
          name: t("pricing.simple.feature3", "Client management"),
          included: true,
        },
        {
          name: t("pricing.simple.feature4", "Email notifications"),
          included: true,
        },
        {
          name: t("pricing.simple.feature5", "Mobile app access"),
          included: true,
        },
        {
          name: t("pricing.simple.feature6", "Basic reporting"),
          included: true,
        },
        {
          name: t("pricing.simple.feature7", "Team management"),
          included: false,
        },
        { name: t("pricing.simple.feature8", "AI analytics"), included: false },
        {
          name: t("pricing.simple.feature9", "Advanced integrations"),
          included: false,
        },
        {
          name: t("pricing.simple.feature10", "Priority support"),
          included: false,
        },
      ],
      cta: t("pricing.simple.cta", "Start Free Trial"),
      link: "/register?plan=simple",
    },
    {
      name: t("pricing.individual.name", "Individual"),
      price: "€19.99",
      period: t("pricing.period", "/month"),
      description: t(
        "pricing.individual.description",
        "Ideal for growing professionals with expanding client base"
      ),
      popular: true,
      features: [
        {
          name: t("pricing.individual.feature1", "Up to 200 bookings/month"),
          included: true,
        },
        {
          name: t("pricing.individual.feature2", "Advanced calendar features"),
          included: true,
        },
        {
          name: t("pricing.individual.feature3", "Client CRM"),
          included: true,
        },
        {
          name: t("pricing.individual.feature4", "SMS + Email notifications"),
          included: true,
        },
        {
          name: t("pricing.individual.feature5", "Mobile app access"),
          included: true,
        },
        {
          name: t("pricing.individual.feature6", "Advanced reporting"),
          included: true,
        },
        {
          name: t(
            "pricing.individual.feature7",
            "Calendar sync (Google, Apple)"
          ),
          included: true,
        },
        {
          name: t("pricing.individual.feature8", "Basic AI insights"),
          included: true,
        },
        {
          name: t("pricing.individual.feature9", "Team management"),
          included: false,
        },
        {
          name: t("pricing.individual.feature10", "Priority support"),
          included: false,
        },
      ],
      cta: t("pricing.individual.cta", "Start Free Trial"),
      link: "/register?plan=individual",
    },
    {
      name: t("pricing.business.name", "Business"),
      price: "€49.99",
      period: t("pricing.period", "/month"),
      description: t(
        "pricing.business.description",
        "Complete solution for businesses with multiple professionals"
      ),
      popular: false,
      features: [
        {
          name: t("pricing.business.feature1", "Unlimited bookings"),
          included: true,
        },
        {
          name: t("pricing.business.feature2", "Multi-location support"),
          included: true,
        },
        {
          name: t("pricing.business.feature3", "Team management"),
          included: true,
        },
        {
          name: t("pricing.business.feature4", "Role-based permissions"),
          included: true,
        },
        {
          name: t("pricing.business.feature5", "Commission tracking"),
          included: true,
        },
        {
          name: t("pricing.business.feature6", "Advanced AI analytics"),
          included: true,
        },
        {
          name: t("pricing.business.feature7", "Custom integrations"),
          included: true,
        },
        {
          name: t("pricing.business.feature8", "Priority support"),
          included: true,
        },
        {
          name: t("pricing.business.feature9", "Financial reports"),
          included: true,
        },
        {
          name: t("pricing.business.feature10", "White-label option"),
          included: true,
        },
      ],
      cta: t("pricing.business.cta", "Start Free Trial"),
      link: "/register?plan=business",
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
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("pricing.hero.title", "Simple, Transparent Pricing")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t(
                "pricing.hero.subtitle",
                "Choose the perfect plan for your business. All plans include a 14-day free trial."
              )}
            </p>
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
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">
                      {t("pricing.popular", "Most Popular")}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
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
                          className={`text-sm ${
                            feature.included
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
