import { Link } from "react-router-dom";
import { MarketingHeader } from "../../components/layout/marketing-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Calendar, Shield, Users } from "lucide-react";
import { useRegion } from "../../contexts/region-context";
import { EntityPlan, BillingPeriod } from "../../types/enums";

export function TermsPage() {
  const { getPriceDisplay } = useRegion();

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using the
              Schedfy platform.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: October 23, 2025</span>
            </div>
          </div>

          {/* Terms Content */}
          <div className="grid gap-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  1. Introduction
                </CardTitle>
                <CardDescription>
                  Welcome to Schedfy, your comprehensive appointment scheduling
                  solution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to Schedfy ("we," "our," or "us"). These Terms of
                  Service ("Terms") govern your use of our website, mobile
                  application, and related services (collectively, the
                  "Service") operated by Schedfy.
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of these terms,
                  then you may not access the Service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle>2. Service Description</CardTitle>
                <CardDescription>
                  Understanding what Schedfy provides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Schedfy is a cloud-based appointment scheduling and business
                  management platform that enables businesses to manage
                  appointments, clients, services, and payments. Our Service
                  includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Online appointment booking system</li>
                  <li>Client and professional management</li>
                  <li>Payment processing and invoicing</li>
                  <li>Business analytics and reporting</li>
                  <li>AI-powered insights and recommendations</li>
                  <li>Multi-language and multi-currency support</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  3. User Accounts
                </CardTitle>
                <CardDescription>
                  Account creation and responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <p>
                    To use certain features of our Service, you must create an
                    account. You agree to provide accurate, current, and
                    complete information during registration and to update such
                    information as necessary.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Security</h4>
                  <p>
                    You are responsible for safeguarding your account
                    credentials and for all activities that occur under your
                    account. You must notify us immediately of any unauthorized
                    use of your account.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Account Types</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      <strong>Simple:</strong> Basic appointment management
                      ({getPriceDisplay(EntityPlan.SIMPLE, BillingPeriod.MONTHLY)}/month)
                    </li>
                    <li>
                      <strong>Individual:</strong> Enhanced features for solo
                      professionals ({getPriceDisplay(EntityPlan.INDIVIDUAL, BillingPeriod.MONTHLY)}/month)
                    </li>
                    <li>
                      <strong>Business:</strong> Complete business management
                      suite ({getPriceDisplay(EntityPlan.BUSINESS, BillingPeriod.MONTHLY)}/month)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>4. Payment and Billing</CardTitle>
                <CardDescription>
                  Subscription fees and payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subscription Fees</h4>
                  <p>
                    Access to our Service requires a paid subscription. Fees are
                    charged monthly in advance and are non-refundable except as
                    required by law or as specifically permitted in these Terms.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <p>
                    We use third-party payment processors, including Stripe, to
                    handle payments. Your payment information is processed
                    securely and in accordance with industry standards.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Price Changes</h4>
                  <p>
                    We reserve the right to modify subscription fees with 30
                    days' written notice. Continued use of the Service after fee
                    changes constitutes acceptance of the new fees.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle>5. Acceptable Use Policy</CardTitle>
                <CardDescription>
                  Guidelines for using our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful, threatening, or offensive content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Use the Service for any unlawful business activities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data and Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>6. Data and Privacy</CardTitle>
                <CardDescription>
                  How we handle your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our Privacy Policy, which
                  is incorporated into these Terms by reference.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Data Security</h4>
                  <p>
                    We implement industry-standard security measures to protect
                    your data, including encryption, secure servers, and regular
                    security audits.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Retention</h4>
                  <p>
                    We retain your data for as long as your account is active
                    and as required for business and legal purposes. You may
                    request data deletion in accordance with applicable laws.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Liability and Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle>7. Limitation of Liability</CardTitle>
                <CardDescription>Important legal limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCHEDFY SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                  OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                  PROFITS, DATA, USE, OR GOODWILL.
                </p>
                <p>
                  Our total liability for any claims arising from or relating to
                  these Terms or the Service shall not exceed the amount you
                  paid to us in the twelve (12) months preceding the claim.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>8. Termination</CardTitle>
                <CardDescription>
                  How accounts may be terminated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You may terminate your account at any time by contacting our
                  support team. We may terminate or suspend your account
                  immediately for violations of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service ceases
                  immediately, but provisions that by their nature should
                  survive termination will remain in effect.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>9. Contact Information</CardTitle>
                <CardDescription>
                  How to reach us regarding these Terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> geral@schedfy.com
                  </p>
                  <p>
                    <strong>Address:</strong> Schedfy, Lisbon, Portugal
                  </p>
                  <p>
                    <strong>Phone:</strong> +351 915 536 144
                  </p>
                </div>
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
            <Link to="/privacy">
              <Button variant="ghost">Privacy Policy</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
