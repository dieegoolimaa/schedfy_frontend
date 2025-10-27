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
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Zap,
  Shield,
} from "lucide-react";

export default function Integrations() {
  const { t } = useTranslation();

  const calendarIntegrations = [
    {
      name: "Google Calendar",
      logo: "https://www.google.com/calendar/about/images/calendar-icon.png",
      description: t(
        "integrations.google.description",
        "Sync your appointments automatically with Google Calendar"
      ),
      features: [
        t("integrations.google.feature1", "Two-way synchronization"),
        t("integrations.google.feature2", "Real-time updates"),
        t("integrations.google.feature3", "Automatic conflict detection"),
        t("integrations.google.feature4", "Event reminders"),
        t("integrations.google.feature5", "Color-coded calendars"),
      ],
      availability: "all-plans",
    },
    {
      name: "Apple Calendar",
      logo: "https://www.apple.com/v/calendar/a/images/overview/calendar_icon__dtl6cwk24mu2_large.png",
      description: t(
        "integrations.apple.description",
        "Seamlessly integrate with Apple Calendar (iCal)"
      ),
      features: [
        t("integrations.apple.feature1", "iCloud synchronization"),
        t("integrations.apple.feature2", "Cross-device access"),
        t("integrations.apple.feature3", "Native iOS integration"),
        t("integrations.apple.feature4", "Siri integration"),
        t("integrations.apple.feature5", "Family calendar sharing"),
      ],
      availability: "all-plans",
    },
  ];

  const benefits = [
    {
      icon: Calendar,
      title: t("integrations.benefits.unified.title", "Unified Calendar View"),
      description: t(
        "integrations.benefits.unified.desc",
        "See all your appointments in one place, synced across all your devices"
      ),
    },
    {
      icon: Zap,
      title: t("integrations.benefits.realtime.title", "Real-Time Sync"),
      description: t(
        "integrations.benefits.realtime.desc",
        "Changes made in Schedfy instantly reflect in your calendar apps"
      ),
    },
    {
      icon: Shield,
      title: t("integrations.benefits.secure.title", "Secure Connection"),
      description: t(
        "integrations.benefits.secure.desc",
        "OAuth 2.0 authentication ensures your calendar data stays private"
      ),
    },
    {
      icon: Smartphone,
      title: t("integrations.benefits.mobile.title", "Mobile Access"),
      description: t(
        "integrations.benefits.mobile.desc",
        "Access your appointments on any device with native calendar apps"
      ),
    },
  ];

  const setupSteps = [
    {
      step: 1,
      title: t("integrations.setup.step1.title", "Connect Your Account"),
      description: t(
        "integrations.setup.step1.desc",
        "Go to Settings > Integrations and click 'Connect Calendar'"
      ),
    },
    {
      step: 2,
      title: t("integrations.setup.step2.title", "Authorize Access"),
      description: t(
        "integrations.setup.step2.desc",
        "Sign in with your Google or Apple account to grant permission"
      ),
    },
    {
      step: 3,
      title: t("integrations.setup.step3.title", "Configure Sync"),
      description: t(
        "integrations.setup.step3.desc",
        "Choose which calendars to sync and set your preferences"
      ),
    },
    {
      step: 4,
      title: t("integrations.setup.step4.title", "Start Syncing"),
      description: t(
        "integrations.setup.step4.desc",
        "Your appointments will automatically sync in real-time"
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              {t("integrations.badge", "Calendar Integrations")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("integrations.hero.title", "Sync With Your Favorite Calendar")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t(
                "integrations.hero.subtitle",
                "Keep all your appointments in sync across Google Calendar and Apple Calendar with automatic two-way synchronization."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  {t("integrations.hero.getStarted", "Get Started Free")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">
                  {t("integrations.hero.seeFeatures", "See All Features")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Integration Cards */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t(
                "integrations.available.title",
                "Available Calendar Integrations"
              )}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "integrations.available.subtitle",
                "Connect with the calendar apps you already use"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {calendarIntegrations.map((integration, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-1">
                          {integration.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          {t(
                            `integrations.availability.${integration.availability}`,
                            "All Plans"
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {integration.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("integrations.benefits.title", "Why Sync Your Calendar?")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "integrations.benefits.subtitle",
                "Experience seamless appointment management"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup Guide Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("integrations.setup.title", "Easy Setup in Minutes")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "integrations.setup.subtitle",
                "Connect your calendar in just a few simple steps"
              )}
            </p>
          </div>

          <div className="space-y-8">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < setupSteps.length - 1 && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("integrations.faq.title", "Common Questions")}
            </h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t(
                    "integrations.faq.q1",
                    "Is calendar sync available on all plans?"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t(
                    "integrations.faq.a1",
                    "Yes! Calendar synchronization with Google Calendar and Apple Calendar is available on all subscription plans, including the Simple plan."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t(
                    "integrations.faq.q2",
                    "How often does the calendar sync?"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t(
                    "integrations.faq.a2",
                    "Calendar synchronization happens in real-time. Any changes made in Schedfy or your calendar app are reflected immediately."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t(
                    "integrations.faq.q3",
                    "Can I connect multiple calendars?"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t(
                    "integrations.faq.a3",
                    "Yes, you can connect both Google Calendar and Apple Calendar simultaneously, and sync with multiple calendars within each service."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("integrations.faq.q4", "Is my calendar data secure?")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t(
                    "integrations.faq.a4",
                    "Absolutely. We use OAuth 2.0 authentication and never store your calendar credentials. All data is encrypted in transit and at rest."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("integrations.cta.title", "Ready to Sync Your Calendar?")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t(
              "integrations.cta.subtitle",
              "Start your free trial today and connect your calendar in minutes"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                {t("integrations.cta.start", "Start Free Trial")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                {t("integrations.cta.contact", "Contact Support")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
