import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Navigation } from "../components/layout/navigation";
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

export function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calendar,
      title: t("features.calendar.title", "Smart Scheduling"),
      description: t("features.calendar.desc", "Intelligent calendar management with automatic conflicts resolution"),
    },
    {
      icon: Users,
      title: t("features.team.title", "Team Management"),
      description: t("features.team.desc", "Manage multiple team members and locations efficiently"),
    },
    {
      icon: BarChart3,
      title: t("features.analytics.title", "AI Analytics"),
      description: t("features.analytics.desc", "Get insights about your business performance with AI"),
    },
    {
      icon: Smartphone,
      title: t("features.mobile.title", "Mobile First"),
      description: t("features.mobile.desc", "Optimized for mobile devices and tablets"),
    },
    {
      icon: Globe,
      title: t("features.global.title", "Multi-Regional"),
      description: t("features.global.desc", "Support for Portugal, Brazil, and United States"),
    },
    {
      icon: Shield,
      title: t("features.security.title", "Enterprise Security"),
      description: t("features.security.desc", "Bank-level security with OAuth and encryption"),
    },
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Salon Owner, Lisbon",
      content: "Schedfy transformed my salon business. I can now manage 3 locations effortlessly.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "João Silva",
      role: "Dentist, Porto",
      content: "The AI insights helped me optimize my schedule and increase revenue by 30%.",
      rating: 5,
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Personal Trainer, São Paulo",
      content: "My clients love the easy booking system. It's professional and reliable.",
      rating: 5,
      avatar: "AC"
    }
  ];

  const faqItems = [
    {
      question: t("faq.setup.question", "How long does it take to set up?"),
      answer: t("faq.setup.answer", "You can be up and running in less than 5 minutes. No technical knowledge required.")
    },
    {
      question: t("faq.migration.question", "Can I migrate from my current system?"),
      answer: t("faq.migration.answer", "Yes, we offer free migration assistance for all Business plan customers.")
    },
    {
      question: t("faq.support.question", "What support do you provide?"),
      answer: t("faq.support.answer", "We provide 24/7 email support for all plans, with priority phone support for Business customers.")
    },
    {
      question: t("faq.mobile.question", "Is there a mobile app?"),
      answer: t("faq.mobile.answer", "Our web app is fully responsive and works perfectly on mobile. A native app is coming soon.")
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="w-3 h-3 mr-1" />
                  {t("hero.badge", "Trusted by 10,000+ businesses")}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  {t("hero.title", "Simplify Your")} <br />
                  <span className="text-primary">{t("hero.highlight", "Scheduling")}</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                  {t("hero.subtitle", "Professional scheduling platform designed for businesses in Portugal, Brazil, and USA. Powered by AI.")}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/register">
                    {t("common.getStarted", "Get Started")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                  <Link to="/login">
                    {t("common.signIn", "Sign In")}
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {t("hero.feature1", "No setup fees")}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {t("hero.feature2", "Cancel anytime")}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {t("hero.feature3", "Free migration")}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl p-8">
                <div className="bg-background rounded-xl shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t("demo.title", "Today's Schedule")}</h3>
                    <Badge variant="secondary">8 {t("demo.appointments", "appointments")}</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { time: "09:00", client: "Maria Silva", service: "Haircut" },
                      { time: "10:30", client: "João Santos", service: "Consultation" },
                      { time: "14:00", client: "Ana Costa", service: "Massage" },
                    ].map((appointment) => (
                      <div key={`${appointment.time}-${appointment.client}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{appointment.client}</p>
                            <p className="text-xs text-muted-foreground">{appointment.service}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{appointment.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("features.title", "Everything you need to grow")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("features.subtitle", "Powerful features designed to help you manage your business efficiently")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("pricing.title", "Choose Your Plan")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.subtitle", "Start free and scale as you grow. No hidden fees.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Simple Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{t("plans.simple.name", "Simple")}</CardTitle>
                <CardDescription className="text-base">
                  {t("plans.simple.description", "Perfect for individual professionals")}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Up to 50 appointments/month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Basic calendar integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Email notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Mobile responsive</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link to="/register?plan=simple">
                    {t("pricing.startFree", "Start Free Trial")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Individual Plan */}
            <Card className="relative border-primary shadow-lg scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  {t("pricing.popular", "Most Popular")}
                </Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">{t("plans.individual.name", "Individual")}</CardTitle>
                <CardDescription className="text-base">
                  {t("plans.individual.description", "For growing professionals")}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Unlimited appointments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Advanced calendar sync</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">SMS & Email notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Custom booking forms</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/register?plan=individual">
                    {t("pricing.startFree", "Start Free Trial")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{t("plans.business.name", "Business")}</CardTitle>
                <CardDescription className="text-base">
                  {t("plans.business.description", "For teams and businesses")}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">€49.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Everything in Individual</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Team management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Advanced analytics & AI insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Multi-location support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link to="/register?plan=business">
                    {t("pricing.startFree", "Start Free Trial")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("testimonials.title", "Loved by thousands")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("testimonials.subtitle", "See what our customers are saying about Schedfy")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={`${testimonial.name}-star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("faq.title", "Frequently Asked Questions")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("faq.subtitle", "Everything you need to know about Schedfy")}
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((item) => (
              <Card key={item.question}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("cta.title", "Ready to transform your business?")}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {t("cta.subtitle", "Join thousands of businesses already using Schedfy to streamline their operations")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/register">
                {t("cta.start", "Start Free Trial")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">
                {t("cta.contact", "Contact Sales")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Schedfy</h3>
              <p className="text-sm text-muted-foreground">
                {t("footer.description", "Modern scheduling platform for businesses worldwide")}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">{t("footer.product", "Product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">{t("footer.features", "Features")}</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">{t("footer.pricing", "Pricing")}</Link></li>
                <li><Link to="/integrations" className="hover:text-foreground">{t("footer.integrations", "Integrations")}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">{t("footer.company", "Company")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">{t("footer.about", "About")}</Link></li>
                <li><Link to="/blog" className="hover:text-foreground">{t("footer.blog", "Blog")}</Link></li>
                <li><Link to="/careers" className="hover:text-foreground">{t("footer.careers", "Careers")}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">{t("footer.support", "Support")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground">{t("footer.help", "Help Center")}</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">{t("footer.contact", "Contact")}</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">{t("footer.privacy", "Privacy")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Schedfy. {t("footer.rights", "All rights reserved.")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}