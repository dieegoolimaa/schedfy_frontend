import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "./components/layout/layout";

// Core pages
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { OnboardingPage } from "./pages/onboarding";
import { AuthCallbackPage } from "./pages/auth-callback";
import { AcceptInvitationPage } from "./pages/accept-invitation";
import { NotFoundPage } from "./pages/not-found";
import { UnauthorizedPage } from "./pages/unauthorized";
import { UpgradePage } from "./pages/upgrade";

// Simple Plan pages
// (All consolidated in /common)

// Individual Plan pages
// (All consolidated in /common)

// Business/Entity Plan pages
// (All consolidated in /common)

// Common pages (shared across all plan types)
import { ClientProfilePage } from "./pages/common/client-profile";
import { EntityProfilePage } from "./pages/common/entity-profile";


import { OperationalReportsPage } from "./pages/common/operational-reports";
import UnifiedSettingsPage from "./pages/common/settings";
import CommandCenter from "./pages/common/command-center";
import SimpleCommandCenter from "./pages/simple/command-center";
import UnifiedPaymentManagement from "./pages/common/payment-management";
import { CommissionsManagementPage } from "./pages/business/commissions-management";
import { FinancialReportsPage as EntityFinancialReportsPage } from "./pages/business/financial-reports";
import { AIPremiumPage } from "./pages/business/ai-premium";
import NotificationPreferences from "./pages/common/notification-preferences";
import ServicesAndPackagesPage from "./pages/common/services-packages";
import ReviewsManagementPage from "./pages/common/reviews-management";
import UserManagementPage from "./pages/common/user-management";
import SimpleServicesPage from "./pages/simple/services";
import { SimpleSubscriptionPage } from "./pages/simple/subscription";
import { IndividualSubscriptionPage } from "./pages/individual/subscription";
import { EntitySubscriptionPage } from "./pages/entity/subscription";

// Professional pages
import { ProfessionalDashboardPage } from "./pages/professional/professional-dashboard";
import ProfessionalProfilePage from "./pages/professional/profile";
import ProfessionalSchedulePage from "./pages/professional/schedule";
import ProfessionalEarningsPage from "./pages/professional/earnings";

// Public pages
import { PublicEntityProfilePage } from "./pages/public/entity-profile";
import { PublicBookingManagementPage } from "./pages/public/public-booking-management";

// Legal and informational pages
import { TermsPage } from "./pages/terms";
import { PrivacyPage } from "./pages/privacy";
import { ContactPage } from "./pages/contact";
import FeaturesPage from "./pages/features";
import PricingPage from "./pages/pricing";
import IntegrationsPage from "./pages/integrations";
import AboutPage from "./pages/about";
import PaymentsSuccessPage from "./pages/payments/success";
import ReceiptPage from "./pages/payments/receipt";

// Test/Demo pages
import { TestPagesPage } from "./pages/test-pages";

// Route protection components
import {
  ProtectedRoute,
  BusinessRoute,
  EntityRoute,
  IndividualPlusRoute,
  ProfessionalRoute,
} from "./components/auth/role-based-route";
import { OnboardingGuard } from "./components/auth/onboarding-guard";
import { DashboardRedirect } from "./components/auth/dashboard-redirect";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";
import { RegionProvider } from "./contexts/region-context";
import { RegionInitializer } from "./components/region-initializer";
import { FeatureFlagsProvider } from "./contexts/feature-flags-context";

function App() {
  useTranslation();

  // Region detection is now handled by RegionProvider
  // Legacy locale handling removed to prevent conflicts with RegionProvider

  return (
    <ThemeProvider defaultTheme="system" storageKey="schedfy-ui-theme">
      <RegionProvider>
        <RegionInitializer>
          <AuthProvider>
            <FeatureFlagsProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/accept-invitation"
                  element={<AcceptInvitationPage />}
                />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route
                  path="/book/:slug"
                  element={<PublicEntityProfilePage />}
                />
                <Route
                  path="/bookings/:id"
                  element={<PublicBookingManagementPage />}
                />

                {/* Onboarding route - protected but without OnboardingGuard */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Legal and informational pages */}
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Public marketing pages */}
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Test/Demo pages - Only available in development */}
                {import.meta.env.DEV && (
                  <Route path="/test-pages" element={<TestPagesPage />} />
                )}

                {/* Special pages */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/upgrade" element={<UpgradePage />} />

                {/* Simple Plan Routes */}
                <Route
                  path="/simple/dashboard"
                  element={
                    <ProtectedRoute allowedPlans={["simple"]}>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="simple" />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simple/services"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <SimpleServicesPage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simple/bookings"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <SimpleCommandCenter planType="simple" />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simple/reports"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <OperationalReportsPage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simple/settings"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <UnifiedSettingsPage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/simple/client-profile"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <ClientProfilePage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/simple/subscription"
                  element={
                    <ProtectedRoute allowedPlans={["simple"]}>
                      <OnboardingGuard>
                        <Layout>
                          <SimpleSubscriptionPage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Individual Plan Routes */}
                <Route
                  path="/individual/dashboard"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="individual" />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/services"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <ServicesAndPackagesPage />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/bookings"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="individual" />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/reports"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <OperationalReportsPage />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/payment-management"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <UnifiedPaymentManagement />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/client-profile"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <ClientProfilePage />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/booking-management"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="individual" />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />

                <Route
                  path="/individual/subscription"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <IndividualSubscriptionPage />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />

                {/* Business/Entity Plan Routes */}
                <Route
                  path="/entity/dashboard"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="business" />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                {/* Bookings - Consolidated page for all plans */}
                <Route
                  path="/entity/bookings"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <CommandCenter planType="business" />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                {/* Legacy route - redirect to /entity/bookings */}
                <Route
                  path="/entity/services"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <ServicesAndPackagesPage />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/reports"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <OperationalReportsPage />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/financial-reports"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <EntityFinancialReportsPage />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/notification-center"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <NotificationPreferences />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />

                {/* Payments return handler (Stripe Checkout) */}
                <Route
                  path="/payments/success"
                  element={<PaymentsSuccessPage />}
                />
                <Route
                  path="/payments/:id/receipt"
                  element={<ReceiptPage />}
                />
                <Route
                  path="/entity/commissions-management"
                  element={
                    <EntityRoute>
                      <Layout>
                        <CommissionsManagementPage />
                      </Layout>
                    </EntityRoute>
                  }
                />

                <Route
                  path="/entity/users"
                  element={
                    <ProtectedRoute allowedPlans={["simple", "business"]}>
                      <Layout>
                        <UserManagementPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entity/profile"
                  element={
                    <EntityRoute>
                      <Layout>
                        <EntityProfilePage />
                      </Layout>
                    </EntityRoute>
                  }
                />

                <Route
                  path="/entity/subscription"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <EntitySubscriptionPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/subscription-management"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <EntitySubscriptionPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/clients"
                  element={
                    <IndividualPlusRoute>
                      <Layout>
                        <ClientProfilePage />
                      </Layout>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/entity/client-profile"
                  element={
                    <IndividualPlusRoute>
                      <Layout>
                        <ClientProfilePage />
                      </Layout>
                    </IndividualPlusRoute>
                  }
                />

                <Route
                  path="/entity/settings"
                  element={
                    <EntityRoute>
                      <Layout>
                        <UnifiedSettingsPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/payment-management"
                  element={
                    <EntityRoute>
                      <Layout>
                        <UnifiedPaymentManagement />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/services-packages"
                  element={
                    <EntityRoute>
                      <Layout>
                        <ServicesAndPackagesPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/reviews"
                  element={
                    <EntityRoute>
                      <Layout>
                        <ReviewsManagementPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/ai-premium"
                  element={
                    <EntityRoute>
                      <Layout>
                        <AIPremiumPage />
                      </Layout>
                    </EntityRoute>
                  }
                />

                {/* Professional Routes */}
                <Route
                  path="/professional/dashboard"
                  element={
                    <ProfessionalRoute>
                      <Layout>
                        <ProfessionalDashboardPage />
                      </Layout>
                    </ProfessionalRoute>
                  }
                />
                <Route
                  path="/professional/profile"
                  element={
                    <ProfessionalRoute>
                      <Layout>
                        <ProfessionalProfilePage />
                      </Layout>
                    </ProfessionalRoute>
                  }
                />
                <Route
                  path="/professional/bookings"
                  element={
                    <ProfessionalRoute>
                      <Layout>
                        <CommandCenter />
                      </Layout>
                    </ProfessionalRoute>
                  }
                />
                <Route
                  path="/professional/schedule"
                  element={
                    <ProfessionalRoute>
                      <Layout>
                        <ProfessionalSchedulePage />
                      </Layout>
                    </ProfessionalRoute>
                  }
                />
                <Route
                  path="/professional/earnings"
                  element={
                    <ProfessionalRoute>
                      <Layout>
                        <ProfessionalEarningsPage />
                      </Layout>
                    </ProfessionalRoute>
                  }
                />

                {/* Legacy redirects for backwards compatibility */}
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CommandCenter />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ServicesAndPackagesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <OperationalReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UnifiedSettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Generic Profile Route - Accessible to ALL authenticated users */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfessionalProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </FeatureFlagsProvider>
          </AuthProvider>
        </RegionInitializer>
      </RegionProvider>
    </ThemeProvider>
  );
}

export default App;
