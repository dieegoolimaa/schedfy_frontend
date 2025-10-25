import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/layout/layout";

// Core pages
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { NotFoundPage } from "./pages/not-found";
import { UnauthorizedPage } from "./pages/unauthorized";
import { UpgradePage } from "./pages/upgrade";

// Simple Plan pages
import { SimpleServicesPage } from "./pages/simple/services";
import { SimpleBookingsPage } from "./pages/simple/bookings";
import { SimpleReportsPage } from "./pages/simple/reports";

// Individual Plan pages
import { IndividualServicesPage } from "./pages/individual/services";
import { IndividualBookingsPage } from "./pages/individual/bookings";
import { IndividualReportsPage } from "./pages/individual/reports";

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

// Professional pages
import { ProfessionalDashboardPage } from "./pages/professional/professional-dashboard";

// Admin platform pages
import { AdminDashboardPage } from "./pages/admin/dashboard";
import { BusinessManagementPage as AdminBusinessManagementPage } from "./pages/admin/business-management";

// Public pages
import { BusinessDiscoveryPage } from "./pages/public/business-discovery";

// Route protection components
import {
  ProtectedRoute,
  AdminRoute,
  BusinessRoute,
  EntityRoute,
  IndividualPlusRoute,
  ProfessionalRoute,
} from "./components/auth/role-based-route";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Detect user's locale and set the appropriate language
    const detectedLocale = navigator.language.split("-")[0];
    const supportedLocales = ["en", "pt"];
    const locale = supportedLocales.includes(detectedLocale)
      ? detectedLocale
      : "en";
    i18n.changeLanguage(locale);
  }, [i18n]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="schedfy-ui-theme">
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/discover" element={<BusinessDiscoveryPage />} />

          {/* Special pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />

          {/* Simple Plan Routes */}
          <Route
            path="/simple/services"
            element={
              <ProtectedRoute
                allowedPlans={["simple", "individual", "business"]}
              >
                <Layout>
                  <SimpleServicesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/simple/bookings"
            element={
              <ProtectedRoute
                allowedPlans={["simple", "individual", "business"]}
              >
                <Layout>
                  <SimpleBookingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/simple/reports"
            element={
              <ProtectedRoute
                allowedPlans={["simple", "individual", "business"]}
              >
                <Layout>
                  <SimpleReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Individual Plan Routes */}
          <Route
            path="/individual/services"
            element={
              <IndividualPlusRoute>
                <Layout>
                  <IndividualServicesPage />
                </Layout>
              </IndividualPlusRoute>
            }
          />
          <Route
            path="/individual/bookings"
            element={
              <IndividualPlusRoute>
                <Layout>
                  <IndividualBookingsPage />
                </Layout>
              </IndividualPlusRoute>
            }
          />
          <Route
            path="/individual/reports"
            element={
              <IndividualPlusRoute>
                <Layout>
                  <IndividualReportsPage />
                </Layout>
              </IndividualPlusRoute>
            }
          />

          {/* Business/Entity Plan Routes */}
          <Route
            path="/entity/dashboard"
            element={
              <EntityRoute>
                <Layout>
                  <EntityDashboardPage />
                </Layout>
              </EntityRoute>
            }
          />
          <Route
            path="/entity/bookings"
            element={
              <EntityRoute>
                <Layout>
                  <EntityBookingsPage />
                </Layout>
              </EntityRoute>
            }
          />
          <Route
            path="/entity/services"
            element={
              <EntityRoute>
                <Layout>
                  <EntityServicesPage />
                </Layout>
              </EntityRoute>
            }
          />
          <Route
            path="/entity/reports"
            element={
              <EntityRoute>
                <Layout>
                  <EntityReportsPage />
                </Layout>
              </EntityRoute>
            }
          />
          <Route
            path="/entity/booking-management"
            element={
              <EntityRoute>
                <Layout>
                  <EntityBookingManagementPage />
                </Layout>
              </EntityRoute>
            }
          />
          <Route
            path="/entity/professionals"
            element={
              <EntityRoute>
                <Layout>
                  <EntityProfessionalsPage />
                </Layout>
              </EntityRoute>
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

          {/* Admin Platform Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboardPage />
                </Layout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/businesses"
            element={
              <AdminRoute>
                <Layout>
                  <AdminBusinessManagementPage />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Legacy redirects for backwards compatibility */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <EntityDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
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
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
