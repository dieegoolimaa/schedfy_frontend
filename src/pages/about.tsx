import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Users,
  Heart,
  Zap,
  Globe,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t("about.values.simplicity.title", "Simplicity First"),
      description: t(
        "about.values.simplicity.desc",
        "We believe scheduling should be intuitive and effortless, not complex and time-consuming."
      ),
    },
    {
      icon: Users,
      title: t("about.values.customer.title", "Customer Focused"),
      description: t(
        "about.values.customer.desc",
        "Every feature we build is designed with our users' success and satisfaction in mind."
      ),
    },
    {
      icon: Zap,
      title: t("about.values.innovation.title", "Continuous Innovation"),
      description: t(
        "about.values.innovation.desc",
        "We leverage AI and modern technology to constantly improve and evolve our platform."
      ),
    },
    {
      icon: Shield,
      title: t("about.values.trust.title", "Trust & Security"),
      description: t(
        "about.values.trust.desc",
        "Your data security and privacy are our top priorities, backed by enterprise-grade protection."
      ),
    },
  ];

  const stats = [
    {
      number: "10,000+",
      label: t("about.stats.users", "Active Users"),
    },
    {
      number: "50,000+",
      label: t("about.stats.bookings", "Monthly Bookings"),
    },
    {
      number: "3",
      label: t("about.stats.countries", "Countries"),
    },
    {
      number: "99.9%",
      label: t("about.stats.uptime", "Uptime"),
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: t("about.timeline.2024.title", "Launch & Growth"),
      description: t(
        "about.timeline.2024.desc",
        "Schedfy launches with support for Portugal, Brazil, and United States. Rapid adoption by small businesses and professionals."
      ),
    },
    {
      year: "2024 Q2",
      title: t("about.timeline.q2.title", "AI Integration"),
      description: t(
        "about.timeline.q2.desc",
        "Introduction of AI-powered analytics and smart scheduling features to help businesses optimize operations."
      ),
    },
    {
      year: "2024 Q3",
      title: t("about.timeline.q3.title", "Mobile Excellence"),
      description: t(
        "about.timeline.q3.desc",
        "Complete mobile optimization and launch of native mobile features for iOS and Android platforms."
      ),
    },
    {
      year: "Future",
      title: t("about.timeline.future.title", "Global Expansion"),
      description: t(
        "about.timeline.future.desc",
        "Planning expansion to additional markets with more integrations and advanced features."
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
              {t("about.hero.title", "Making Scheduling Simple for Everyone")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t(
                "about.hero.subtitle",
                "Schedfy was born from a simple idea: scheduling appointments shouldn't be complicated. We're on a mission to help businesses and professionals manage their time more efficiently."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Target className="w-5 h-5" />
                <span className="font-semibold">
                  {t("about.mission.badge", "Our Mission")}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {t(
                  "about.mission.title",
                  "Empowering Businesses Through Smart Scheduling"
                )}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "about.mission.p1",
                  "We believe that every business, regardless of size, deserves access to professional-grade scheduling tools. Schedfy was created to democratize appointment management and make it accessible to everyone."
                )}
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "about.mission.p2",
                  "Our platform combines intuitive design with powerful features like AI analytics, team management, and seamless calendar integration to help you focus on what matters most: growing your business and serving your clients."
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("about.values.title", "Our Core Values")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "about.values.subtitle",
                "The principles that guide everything we do"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("about.vision.global.title", "Global Reach")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(
                          "about.vision.global.desc",
                          "Starting with Portugal, Brazil, and the United States, we're building a truly global scheduling platform."
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("about.vision.ai.title", "AI-Powered Insights")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(
                          "about.vision.ai.desc",
                          "Leveraging artificial intelligence to provide actionable insights and optimize your business operations."
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("about.vision.community.title", "Community Driven")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t(
                          "about.vision.community.desc",
                          "Built with continuous feedback from our community of business owners and professionals."
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">
                  {t("about.vision.badge", "Our Vision")}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {t(
                  "about.vision.title",
                  "Building the Future of Appointment Management"
                )}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "about.vision.p1",
                  "We envision a world where scheduling is effortless, intelligent, and accessible to everyone. Where small businesses have the same powerful tools as large enterprises."
                )}
              </p>
              <p className="text-lg text-muted-foreground">
                {t(
                  "about.vision.p2",
                  "Through continuous innovation and listening to our users, we're creating the most intuitive and powerful scheduling platform in the market."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("about.timeline.title", "Our Journey")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t(
                "about.timeline.subtitle",
                "Key milestones in the Schedfy story"
              )}
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                </div>
                <Card className="flex-1 p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("about.cta.title", "Join Us on This Journey")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t(
              "about.cta.subtitle",
              "Be part of the scheduling revolution and grow your business with Schedfy"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                {t("about.cta.start", "Start Your Free Trial")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                {t("about.cta.contact", "Get in Touch")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
