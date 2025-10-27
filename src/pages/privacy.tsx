import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
} from "lucide-react";

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <ArrowLeft className="h-5 w-5" />
              Schedfy
            </Link>
            <div className="ml-auto">
              <Link to="/login">
                <Button variant="ghost" className="mr-2">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: October 23, 2025</span>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="grid gap-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  1. Introduction
                </CardTitle>
                <CardDescription>
                  Our commitment to protecting your privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Schedfy ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our
                  appointment scheduling platform and related services.
                </p>
                <p>
                  This Privacy Policy applies to all users of our platform,
                  including business owners, professionals, and clients who book
                  appointments through our system.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  2. Information We Collect
                </CardTitle>
                <CardDescription>
                  Types of data we gather to provide our services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Name, email address, and phone number</li>
                    <li>Business information (name, address, type)</li>
                    <li>Profile photos and professional credentials</li>
                    <li>
                      Payment information (processed securely through Stripe)
                    </li>
                    <li>Appointment history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usage Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Log data (IP address, browser type, device information)
                    </li>
                    <li>Platform usage patterns and feature interactions</li>
                    <li>Performance metrics and analytics data</li>
                    <li>Communication records (support tickets, emails)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cookies and Tracking</h4>
                  <p>
                    We use cookies and similar technologies to enhance your
                    experience, analyze usage patterns, and provide personalized
                    content. You can control cookie settings through your
                    browser preferences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  3. How We Use Your Information
                </CardTitle>
                <CardDescription>
                  The purposes for which we process your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Provision</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Create and manage your account</li>
                    <li>Process appointments and bookings</li>
                    <li>Handle payments and invoicing</li>
                    <li>Provide customer support</li>
                    <li>Send important service notifications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Platform Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Analyze usage patterns to improve features</li>
                    <li>Generate business insights and analytics</li>
                    <li>Develop AI-powered recommendations</li>
                    <li>Conduct research and development</li>
                    <li>Ensure platform security and fraud prevention</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Marketing and Communication
                  </h4>
                  <p>
                    With your consent, we may send you promotional emails about
                    new features, tips, and special offers. You can opt out of
                    marketing communications at any time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>4. Information Sharing and Disclosure</CardTitle>
                <CardDescription>
                  When and how we share your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Within the Platform</h4>
                  <p>
                    Business information and professional profiles may be
                    visible to clients booking appointments. Client information
                    is shared with businesses only for appointment management
                    purposes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Service Providers</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Payment processors (Stripe) for transaction handling
                    </li>
                    <li>Cloud hosting providers (Google Cloud Platform)</li>
                    <li>Email service providers for notifications</li>
                    <li>Analytics tools for platform improvement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Legal Requirements</h4>
                  <p>
                    We may disclose your information if required by law, court
                    order, or to protect our rights, property, or safety, or
                    that of others.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  5. Data Security
                </CardTitle>
                <CardDescription>
                  How we protect your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>End-to-end encryption for data transmission</li>
                    <li>Secure data storage with encryption at rest</li>
                    <li>
                      Regular security audits and vulnerability assessments
                    </li>
                    <li>Multi-factor authentication options</li>
                    <li>Role-based access controls for team members</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Incident Response</h4>
                  <p>
                    In the unlikely event of a data breach, we will notify
                    affected users within 72 hours and take immediate steps to
                    secure the platform and prevent further unauthorized access.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Retention</h4>
                  <p>
                    We retain your information for as long as your account is
                    active and as required for business and legal purposes. You
                    may request account deletion at any time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  6. International Data Transfers
                </CardTitle>
                <CardDescription>
                  Cross-border data processing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Schedfy operates globally and may transfer your information to
                  countries outside your region for processing and storage. We
                  ensure adequate protection through:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    Standard Contractual Clauses (SCCs) with service providers
                  </li>
                  <li>
                    Adequacy decisions by relevant data protection authorities
                  </li>
                  <li>Certification schemes and codes of conduct</li>
                  <li>Binding corporate rules for intra-group transfers</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>7. Your Privacy Rights</CardTitle>
                <CardDescription>
                  Control over your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">GDPR Rights (EU Users)</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Access: Request a copy of your personal data</li>
                    <li>
                      Rectification: Correct inaccurate or incomplete data
                    </li>
                    <li>Erasure: Request deletion of your data</li>
                    <li>Portability: Transfer your data to another service</li>
                    <li>Restriction: Limit how we process your data</li>
                    <li>Objection: Opt out of certain data processing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    CCPA Rights (California Users)
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      Know what personal information is collected and used
                    </li>
                    <li>Delete personal information held by businesses</li>
                    <li>Opt out of the sale of personal information</li>
                    <li>Non-discrimination for exercising privacy rights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Exercising Your Rights</h4>
                  <p>
                    To exercise any of these rights, please contact us at
                    privacy@schedfy.com or through your account settings. We
                    will respond within the timeframes required by applicable
                    law.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>8. Children's Privacy</CardTitle>
                <CardDescription>Protection for users under 18</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our services are not intended for children under 13 (or 16 in
                  the EU). We do not knowingly collect personal information from
                  children. If we become aware that we have collected
                  information from a child, we will take steps to delete it
                  promptly.
                </p>
                <p>
                  For users between 13-18 (or 16-18 in the EU), parental consent
                  may be required for certain features or data processing
                  activities.
                </p>
              </CardContent>
            </Card>

            {/* Updates to Policy */}
            <Card>
              <CardHeader>
                <CardTitle>9. Changes to This Privacy Policy</CardTitle>
                <CardDescription>How we handle policy updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may update this Privacy Policy periodically to reflect
                  changes in our practices, technology, or legal requirements.
                  We will notify you of significant changes through:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Email notification to your registered address</li>
                  <li>Prominent notice on our platform</li>
                  <li>In-app notifications for mobile users</li>
                </ul>
                <p>
                  Your continued use of our services after changes take effect
                  constitutes acceptance of the updated Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>10. Contact Information</CardTitle>
                <CardDescription>
                  How to reach us about privacy matters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p>
                    <strong>Data Protection Officer:</strong>{" "}
                    privacy@schedfy.com
                  </p>
                  <p>
                    <strong>General Inquiries:</strong> support@schedfy.com
                  </p>
                  <p>
                    <strong>Address:</strong> Schedfy, Lisbon, Portugal
                  </p>
                  <p>
                    <strong>Phone:</strong> +351 XXX XXX XXX
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  For EU users: You also have the right to lodge a complaint
                  with your local data protection authority.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-8">
            <Link to="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link to="/terms">
              <Button variant="ghost">Terms of Service</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
