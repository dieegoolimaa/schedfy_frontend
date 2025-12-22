import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  BarChart3,
  Smartphone,
  Globe,
  Shield,
  Clock,
  Bell,
  CreditCard,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Features() {
  const { t } = useTranslation("features");

  const features = [
    {
      icon: Calendar,
      title: t("features.smartScheduling.title", "Smart Scheduling"),
      description: t(
        "features.smartScheduling.desc",
        "Intelligent calendar management with automatic conflict resolution and smart booking suggestions."
      ),
      benefits: [
        t("features.smartScheduling.benefit1", "Automatic conflict detection"),
        t("features.smartScheduling.benefit2", "Drag & drop interface"),
        t("features.smartScheduling.benefit3", "Recurring appointments"),
        t("features.smartScheduling.benefit4", "Calendar sync (Google, Apple)"),
      ],
    },
    {
      icon: Users,
      title: t("features.teamManagement.title", "Team Management"),
      description: t(
        "features.teamManagement.desc",
        "Manage multiple team members, locations, and resources efficiently in one centralized platform."
      ),
      benefits: [
        t("features.teamManagement.benefit1", "Multi-professional support"),
        t("features.teamManagement.benefit2", "Role-based permissions"),
        t("features.teamManagement.benefit3", "Commission tracking"),
        t("features.teamManagement.benefit4", "Performance analytics"),
      ],
    },
    {
      icon: BarChart3,
      title: t("features.analytics.title", "AI-Powered Analytics"),
      description: t(
        "features.analytics.desc",
        "Get deep insights about your business performance with AI-driven analytics and recommendations."
      ),
      benefits: [
        t("features.analytics.benefit1", "Revenue forecasting"),
        t("features.analytics.benefit2", "Customer insights"),
        t("features.analytics.benefit3", "Performance metrics"),
        t("features.analytics.benefit4", "Smart recommendations"),
      ],
    },
    {
      icon: Smartphone,
      title: t("features.mobile.title", "Mobile First Design"),
      description: t(
        "features.mobile.desc",
        "Fully optimized for mobile devices and tablets with native app-like experience."
      ),
      benefits: [
        t("features.mobile.benefit1", "Responsive design"),
        t("features.mobile.benefit2", "Touch-friendly interface"),
        t("features.mobile.benefit3", "Offline mode support"),
        t("features.mobile.benefit4", "Push notifications"),
      ],
    },
    {
      icon: Globe,
      title: t("features.multiRegional.title", "Multi-Regional Support"),
      description: t(
        "features.multiRegional.desc",
        "Built for Portugal, Brazil, and United States with localized features and payment methods."
      ),
      benefits: [
        t("features.multiRegional.benefit1", "Multiple languages (EN/PT)"),
        t("features.multiRegional.benefit2", "Regional currencies"),
        t("features.multiRegional.benefit3", "Local payment methods"),
        t("features.multiRegional.benefit4", "Timezone management"),
      ],
    },
    {
      icon: Shield,
      title: t("features.security.title", "Enterprise Security"),
      description: t(
        "features.security.desc",
        "Bank-level security with OAuth authentication, data encryption, and GDPR compliance."
      ),
      benefits: [
        t("features.security.benefit1", "OAuth 2.0 authentication"),
        t("features.security.benefit2", "End-to-end encryption"),
        t("features.security.benefit3", "GDPR compliant"),
        t("features.security.benefit4", "Regular security audits"),
      ],
    },
    {
      icon: Clock,
      title: t("features.automation.title", "Smart Automation"),
      description: t(
        "features.automation.desc",
        "Automate repetitive tasks with intelligent workflows and automated notifications."
      ),
      benefits: [
        t("features.automation.benefit1", "Automated reminders"),
        t("features.automation.benefit2", "Workflow automation"),
        t("features.automation.benefit3", "Smart scheduling"),
        t("features.automation.benefit4", "Auto-confirmation"),
      ],
    },
    {
      icon: Bell,
      title: t("features.notifications.title", "Smart Notifications"),
      description: t(
        "features.notifications.desc",
        "Keep clients informed with automated SMS, email, and push notifications."
      ),
      benefits: [
        t("features.notifications.benefit1", "Multi-channel delivery"),
        t("features.notifications.benefit2", "Custom templates"),
        t("features.notifications.benefit3", "Automated reminders"),
        t("features.notifications.benefit4", "Real-time alerts"),
      ],
    },
    {
      icon: CreditCard,
      title: t("features.payments.title", "Payment Processing"),
      description: t(
        "features.payments.desc",
        "Accept payments securely with integrated payment processing and invoicing."
      ),
      benefits: [
        t("features.payments.benefit1", "Multiple payment methods"),
        t("features.payments.benefit2", "Automated invoicing"),
        t("features.payments.benefit3", "Payment tracking"),
        t("features.payments.benefit4", "Commission management"),
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: t("features.additional.integrations", "Third-Party Integrations"),
      description: t(
        "features.additional.integrationsDesc",
        "Connect with Google Calendar, Apple Calendar, and more"
      ),
    },
    {
      icon: Users,
      title: t("features.additional.clientManagement", "Client Management"),
      description: t(
        "features.additional.clientManagementDesc",
        "Complete CRM with client history and preferences"
      ),
    },
    {
      icon: BarChart3,
      title: t("features.additional.reporting", "Advanced Reporting"),
      description: t(
        "features.additional.reportingDesc",
        "Custom reports and data export capabilities"
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
              {t(
                "features.hero.title",
                "Powerful Features for Modern Businesses"
              )}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t(
                "features.hero.subtitle",
                "Everything you need to manage appointments, teams, and grow your business efficiently."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  {t("features.hero.getStarted", "Get Started Free")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">
                  {t("features.hero.seePricing", "See Pricing")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("features.additional.title", "And Much More")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "features.additional.subtitle",
                "Discover all the features that make Schedfy the perfect scheduling solution"
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("features.cta.title", "Ready to Transform Your Business?")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t(
              "features.cta.subtitle",
              "Join thousands of businesses already using Schedfy"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                {t("features.cta.start", "Start Free Trial")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                {t("features.cta.contact", "Contact Sales")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
