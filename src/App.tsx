import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import SimpleDashboardPage from "./pages/simple/dashboard";
import { SimpleReportsPage } from "./pages/simple/reports";
import { SimpleSettingsPage } from "./pages/simple/settings";

// Individual Plan pages
import IndividualDashboardPage from "./pages/individual/dashboard";
import { IndividualReportsPage } from "./pages/individual/reports";
import IndividualPaymentManagementPage from "./pages/individual/payment-management";

// Business/Entity Plan pages
import EntityDashboardPage from "./pages/business/dashboard";
import { ReportsPage as EntityReportsPage } from "./pages/business/reports";
import { ProfessionalsPage as EntityProfessionalsPage } from "./pages/business/professionals";
import { UserManagementPage as EntityUserManagementPage } from "./pages/business/user-management";
import { SubscriptionManagementPage as EntitySubscriptionManagementPage } from "./pages/business/subscription-management";
import { DataAnalyticsPage as EntityDataAnalyticsPage } from "./pages/business/data-analytics";

// Common pages (shared across all plan types)
import { ClientProfilePage } from "./pages/common/client-profile";
import { EntityProfilePage } from "./pages/common/entity-profile";
import { BookingManagementPage } from "./pages/common/booking-management";
import { ServicesPage } from "./pages/common/services";
import { SettingsPage as EntitySettingsPage } from "./pages/business/settings";
import { CommissionsManagementPage } from "./pages/business/commissions-management";
import { PaymentManagementPage } from "./pages/business/payment-management";
import { FinancialReportsPage as EntityFinancialReportsPage } from "./pages/business/financial-reports";
import { AIPremiumPage } from "./pages/business/ai-premium";
import { LoyaltyManagementPage } from "./pages/business/loyalty-management";
import { NotificationCenterPage } from "./pages/business/notification-center";
import PackageManagementPage from "./pages/business/package-management";
import ReviewsManagementPage from "./pages/reviews-management";

// Professional pages
import { ProfessionalDashboardPage } from "./pages/professional/professional-dashboard";
import ProfessionalProfilePage from "./pages/professional/profile";
import ProfessionalBookingsPage from "./pages/professional/bookings";
import ProfessionalSchedulePage from "./pages/professional/schedule";
import ProfessionalEarningsPage from "./pages/professional/earnings";

// Public pages
// import { PublicEntityProfilePage } from "./pages/public/entity-profile";
import { NewEntityProfilePage } from "./pages/public/entity-profile-new";

// Legal and informational pages
import { TermsPage } from "./pages/terms";
import { PrivacyPage } from "./pages/privacy";
import { ContactPage } from "./pages/contact";
import FeaturesPage from "./pages/features";
import PricingPage from "./pages/pricing";
import IntegrationsPage from "./pages/integrations";
import AboutPage from "./pages/about";
import PaymentsSuccessPage from "./pages/payments/success";

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
  const { i18n } = useTranslation();

  useEffect(() => {
    // Region detection is now handled by RegionProvider
    // Keep this for backward compatibility with manual locale changes
    const storedLocale = localStorage.getItem("schedfy-locale");
    if (storedLocale && i18n.language !== storedLocale) {
      i18n.changeLanguage(storedLocale);
    }
  }, [i18n]);

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
                  element={<NewEntityProfilePage />}
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

                {/* Test/Demo pages */}
                <Route path="/test-pages" element={<TestPagesPage />} />

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
                          <SimpleDashboardPage />
                        </Layout>
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/simple/services"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <OnboardingGuard>
                        <Layout>
                          <ServicesPage />
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
                          <BookingManagementPage />
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
                          <SimpleReportsPage />
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
                          <SimpleSettingsPage />
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

                {/* Individual Plan Routes */}
                <Route
                  path="/individual/dashboard"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <IndividualDashboardPage />
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
                          <ServicesPage />
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
                          <BookingManagementPage />
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
                          ```
                          <IndividualReportsPage />
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
                          <IndividualPaymentManagementPage />
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
                          <BookingManagementPage />
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
                          <EntityDashboardPage />
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
                          <BookingManagementPage />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                {/* Legacy route - redirect to /entity/bookings */}
                <Route
                  path="/entity/booking-management"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <BookingManagementPage />
                        </Layout>
                      </OnboardingGuard>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/services"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <ServicesPage />
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
                          <EntityReportsPage />
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
                        ```
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
                          <NotificationCenterPage />
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
                  path="/entity/professionals"
                  element={
                    <ProtectedRoute
                      allowedPlans={["simple", "individual", "business"]}
                    >
                      <Layout>
                        <EntityProfessionalsPage />
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
                  path="/entity/loyalty-management"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <LoyaltyManagementPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/users"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <EntityUserManagementPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/subscription"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <EntitySubscriptionManagementPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/subscription-management"
                  element={
                    <BusinessRoute>
                      <Layout>
                        <EntitySubscriptionManagementPage />
                      </Layout>
                    </BusinessRoute>
                  }
                />
                <Route
                  path="/entity/clients"
                  element={
                    <EntityRoute>
                      <Layout>
                        <ClientProfilePage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/client-profile"
                  element={
                    <EntityRoute>
                      <Layout>
                        <ClientProfilePage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/analytics"
                  element={
                    <EntityRoute>
                      <Layout>
                        <EntityDataAnalyticsPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/settings"
                  element={
                    <EntityRoute>
                      <Layout>
                        <EntitySettingsPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/payment-management"
                  element={
                    <EntityRoute>
                      <Layout>
                        <PaymentManagementPage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/package-management"
                  element={
                    <EntityRoute>
                      <Layout>
                        <PackageManagementPage />
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
                        <ProfessionalBookingsPage />
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
                        <BookingManagementPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ServicesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EntityReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EntitySettingsPage />
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
