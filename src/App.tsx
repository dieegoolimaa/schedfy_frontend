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
import { SimpleServicesPage } from "./pages/simple/services";
import { SimpleBookingsPage } from "./pages/simple/bookings";
import { SimpleReportsPage } from "./pages/simple/reports";
import { SimpleSettingsPage } from "./pages/simple/settings";
import { ClientProfilePage as SimpleClientProfilePage } from "./pages/simple/client-profile";

// Individual Plan pages
import IndividualDashboardPage from "./pages/individual/dashboard";
import { IndividualServicesPage } from "./pages/individual/services";
import { IndividualBookingsPage } from "./pages/individual/bookings";
import { IndividualReportsPage } from "./pages/individual/reports";
import IndividualPaymentManagementPage from "./pages/individual/payment-management";
import { ClientProfilePage as IndividualClientProfilePage } from "./pages/individual/client-profile";
import IndividualPackageManagementPage from "./pages/individual/package-management";

// Business/Entity Plan pages
import EntityDashboardPage from "./pages/entity/dashboard";
import { BookingsPage as EntityBookingsPage } from "./pages/entity/bookings";
import { ServicesPage as EntityServicesPage } from "./pages/entity/services";
import { ReportsPage as EntityReportsPage } from "./pages/entity/reports";
import { BookingManagementPage as EntityBookingManagementPage } from "./pages/entity/booking-management";
import { ProfessionalsPage as EntityProfessionalsPage } from "./pages/entity/professionals";
import { EntityProfilePage } from "./pages/entity/entity-profile";
import { UserManagementPage as EntityUserManagementPage } from "./pages/entity/user-management";
import { SubscriptionManagementPage as EntitySubscriptionManagementPage } from "./pages/entity/subscription-management";
import { ClientProfilePage as EntityClientProfilePage } from "./pages/entity/client-profile";
import { DataAnalyticsPage as EntityDataAnalyticsPage } from "./pages/entity/data-analytics";
import { SettingsPage as EntitySettingsPage } from "./pages/entity/settings";
import { CommissionsManagementPage } from "./pages/entity/commissions-management";
import { PaymentManagementPage } from "./pages/entity/payment-management";
import { FinancialReportsPage as EntityFinancialReportsPage } from "./pages/entity/financial-reports";
import { AIPremiumPage } from "./pages/entity/ai-premium";
import { LoyaltyManagementPage } from "./pages/entity/loyalty-management";
import { NotificationCenterPage } from "./pages/entity/notification-center";
import PackageManagementPage from "./pages/business/package-management";

// Professional pages
import { ProfessionalDashboardPage } from "./pages/professional/professional-dashboard";

// Public pages
import { BusinessDiscoveryPage } from "./pages/public/business-discovery";
import { PublicEntityProfilePage } from "./pages/public/entity-profile";

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
                <Route path="/discover" element={<BusinessDiscoveryPage />} />
                <Route
                  path="/book/:slug"
                  element={<PublicEntityProfilePage />}
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
                          <SimpleBookingsPage />
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
                          <SimpleClientProfilePage />
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
                          <IndividualServicesPage />
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
                          <IndividualBookingsPage />
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
                          <IndividualClientProfilePage />
                        </Layout>
                      </OnboardingGuard>
                    </IndividualPlusRoute>
                  }
                />
                <Route
                  path="/individual/package-management"
                  element={
                    <IndividualPlusRoute>
                      <OnboardingGuard>
                        <Layout>
                          <IndividualPackageManagementPage />
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
                <Route
                  path="/entity/bookings"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <EntityBookingsPage />
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
                          <EntityServicesPage />
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
                <Route
                  path="/entity/booking-management"
                  element={
                    <EntityRoute>
                      <OnboardingGuard>
                        <Layout>
                          <EntityBookingManagementPage />
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
                        <EntityClientProfilePage />
                      </Layout>
                    </EntityRoute>
                  }
                />
                <Route
                  path="/entity/client-profile"
                  element={
                    <EntityRoute>
                      <Layout>
                        <EntityClientProfilePage />
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

                {/* Legacy redirects for backwards compatibility */}
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EntityBookingsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EntityServicesPage />
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
