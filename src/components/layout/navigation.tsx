import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useFeatureFlags } from "../../contexts/feature-flags-context";
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";
import { LanguageSwitcher } from "../language-switcher";
import { NotificationsDropdown } from "../notifications/notifications-dropdown";
import { GlobalSearch } from "../search/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { features } = useFeatureFlags();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Role-based navigation items - now organized in dropdown groups
  const getNavItems = () => {
    if (user?.role === "platform_admin") {
      return {
        main: [
          { path: "/admin/dashboard", label: t("nav.dashboard", "Dashboard") },
        ],
        management: [
          {
            path: "/admin/business-management",
            label: t("nav.entities", "Entities"),
          },
          {
            path: "/admin/user-management",
            label: t("nav.users", "Users"),
          },
          {
            path: "/admin/subscriptions-board",
            label: t("nav.subscriptions", "Subscriptions"),
          },
          {
            path: "/admin/mass-communications",
            label: t("nav.communications", "Communications"),
          },
          {
            path: "/admin/customer-support",
            label: t("nav.support", "Support"),
          },
        ],
        features: [
          {
            path: "/admin/feature-management",
            label: t("nav.featureManagement", "Feature Management"),
          },
          ...(features.aiPremiumEnabled
            ? [
                {
                  path: "/admin/ai-premium-management",
                  label: t("nav.ai", "AI Premium"),
                },
              ]
            : []),
        ],
        settings: [
          {
            path: "/admin/financial-reports",
            label: t("nav.reports", "Financial Reports"),
          },
          {
            path: "/admin/global-settings",
            label: t("nav.settings", "Settings"),
          },
        ],
      };
    }

    // Business plan users (full entity management)
    if (
      user?.plan === "business" &&
      (user?.role === "owner" ||
        user?.role === "admin" ||
        user?.role === "manager")
    ) {
      return {
        main: [
          { path: "/entity/dashboard", label: t("nav.dashboard", "Dashboard") },
        ],
        operations: [
          {
            path: "/entity/bookings",
            label: t("nav.bookings", "Bookings"),
          },
          { path: "/entity/services", label: t("nav.services", "Services") },
          { path: "/entity/reviews", label: t("nav.reviews", "Reviews") },
          {
            path: "/entity/professionals",
            label: t("nav.professionals", "Professionals"),
          },
          {
            path: "/entity/client-profile",
            label: t("nav.clients", "Clients"),
          },
        ],
        financial: [
          {
            path: "/entity/commissions-management",
            label: t("nav.commissions", "Commissions"),
          },
          {
            path: "/entity/package-management",
            label: t("nav.packages", "Service Packages"),
          },
          { path: "/entity/reports", label: t("nav.reports", "Reports") },
          {
            path: "/entity/financial-reports",
            label: t("nav.financialReports", "Financial Reports"),
          },
        ],
        settings: [
          {
            path: "/entity/notification-center",
            label: t("nav.notifications", "Notifications"),
          },
          ...(features.loyaltyManagementEnabled
            ? [
                {
                  path: "/entity/loyalty-management",
                  label: t("nav.loyalty", "Loyalty"),
                },
              ]
            : []),
          ...(features.aiPremiumEnabled
            ? [
                {
                  path: "/entity/ai-premium",
                  label: t("nav.ai", "AI Premium"),
                },
              ]
            : []),
          {
            path: "/entity/subscription-management",
            label: t("nav.subscription", "Subscription"),
          },
          { path: "/entity/settings", label: t("nav.settings", "Settings") },
        ],
      };
    }

    // Individual plan users (professional features)
    if (user?.plan === "individual") {
      return {
        main: [
          {
            path: "/individual/dashboard",
            label: t("nav.dashboard", "Dashboard"),
          },
        ],
        operations: [
          {
            path: "/individual/bookings",
            label: t("nav.bookings", "Bookings"),
          },
          {
            path: "/individual/services",
            label: t("nav.services", "Services"),
          },
          {
            path: "/individual/reports",
            label: t("nav.reports", "Reports"),
          },
        ],
        financial: [
          {
            path: "/individual/payment-management",
            label: t("nav.payments", "Payments"),
          },
        ],
        settings: [
          {
            path: "/simple/settings",
            label: t("nav.settings", "Settings"),
          },
        ],
      };
    }

    // Professional users (employee)
    if (user?.role === "professional") {
      return {
        main: [
          {
            path: "/professional/dashboard",
            label: t("nav.dashboard", "Dashboard"),
          },
        ],
        operations: [
          {
            path: "/professional/bookings",
            label: t("nav.bookings", "My Appointments"),
          },
          {
            path: "/professional/schedule",
            label: t("nav.schedule", "Schedule"),
          },
        ],
        financial: [
          {
            path: "/professional/earnings",
            label: t("nav.earnings", "Earnings"),
          },
        ],
        settings: [
          {
            path: "/professional/profile",
            label: t("nav.profile", "Profile"),
          },
        ],
      };
    }

    // Simple plan users (basic features)
    if (user?.plan === "simple") {
      return {
        main: [
          {
            path: "/simple/dashboard",
            label: t("nav.dashboard", "Dashboard"),
          },
        ],
        operations: [
          {
            path: "/simple/bookings",
            label: t("nav.bookings", "Bookings"),
          },
          {
            path: "/simple/services",
            label: t("nav.services", "Services"),
          },
          {
            path: "/entity/professionals",
            label: t("nav.professionals", "Professionals"),
          },
          {
            path: "/simple/reports",
            label: t("nav.reports", "Reports"),
          },
        ],
        settings: [
          {
            path: "/simple/settings",
            label: t("nav.settings", "Settings"),
          },
        ],
      };
    }

    // Fallback
    return {
      main: [
        { path: "/simple/dashboard", label: t("nav.dashboard", "Dashboard") },
      ],
    };
  };

  const navItems = getNavItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  if (!user) {
    return (
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary">
                Schedfy
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="ghost" onClick={toggleTheme}>
                {theme === "light" ? "🌙" : "☀️"}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">{t("auth.signIn", "Sign In")}</Link>
              </Button>
              <Button asChild>
                <Link to="/register">{t("auth.signUp", "Sign Up")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Check if user is admin (nav items will be object with groups)
  const isAdminNav = typeof navItems === "object" && "main" in navItems;

  // Render desktop navigation
  const renderDesktopNav = () => {
    if (isAdminNav && "main" in navItems) {
      return (
        <>
          {/* Main Dashboard Link */}
          {navItems.main.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Management/Operations Dropdown */}
          {(navItems.management || navItems.operations) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {navItems.management
                    ? t("nav.management", "Management")
                    : t("nav.operations", "Operations")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(navItems.management || navItems.operations)?.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${
                      location.pathname === item.path ? "bg-accent" : ""
                    }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Financial Dropdown (Business plan only) */}
          {navItems.financial && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.financial", "Financial")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.financial.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${
                      location.pathname === item.path ? "bg-accent" : ""
                    }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Features Dropdown (Admin only) */}
          {navItems.features && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.features", "Features")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.features.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${
                      location.pathname === item.path ? "bg-accent" : ""
                    }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Settings Dropdown */}
          {navItems.settings && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.settings", "Settings")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.settings.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${
                      location.pathname === item.path ? "bg-accent" : ""
                    }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      );
    }

    return null;
  };

  // Toggle section expansion in mobile nav
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Render mobile navigation
  const renderMobileNav = () => {
    if (isAdminNav && "main" in navItems) {
      return (
        <div className="px-2 pt-2 pb-3 space-y-1 max-h-[70vh] overflow-y-auto">
          {/* Main items */}
          {navItems.main.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Management/Operations section - Collapsible */}
          {(navItems.management || navItems.operations) && (
            <div className="pt-1">
              <button
                onClick={() => toggleSection("management")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>
                  {navItems.management
                    ? t("nav.management", "Management")
                    : t("nav.operations", "Operations")}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes("management") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.includes("management") && (
                <div className="mt-1">
                  {(navItems.management || navItems.operations)?.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial section (Business plan only) - Collapsible */}
          {navItems.financial && (
            <div className="pt-1">
              <button
                onClick={() => toggleSection("financial")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>{t("nav.financial", "Financial")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes("financial") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.includes("financial") && (
                <div className="mt-1">
                  {navItems.financial.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Features section (Admin only) - Collapsible */}
          {navItems.features && (
            <div className="pt-1">
              <button
                onClick={() => toggleSection("features")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>{t("nav.features", "Features")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes("features") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.includes("features") && (
                <div className="mt-1">
                  {navItems.features.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings section - Collapsible */}
          {navItems.settings && (
            <div className="pt-1">
              <button
                onClick={() => toggleSection("settings")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>{t("nav.settings", "Settings")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes("settings") ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.includes("settings") && (
                <div className="mt-1">
                  {navItems.settings.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === "platform_admin") return "/admin/dashboard";
    if (user?.plan === "business") return "/entity/dashboard";
    if (user?.plan === "individual") return "/individual/dashboard";
    if (user?.plan === "simple") return "/simple/dashboard";
    return "/";
  };

  return (
    <nav className="border-b sticky top-0 bg-background z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to={getDashboardPath()}
              className="text-lg sm:text-xl font-bold text-primary flex-shrink-0"
            >
              Schedfy
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">{renderDesktopNav()}</div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Global Search */}
            <GlobalSearch />

            {/* Notifications */}
            <NotificationsDropdown />

            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
            <div className="hidden xl:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {t("nav.welcome", "Welcome")},
              </span>
              <span className="font-medium truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-4"
              onClick={handleLogout}
            >
              {t("common.logout", "Logout")}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t">
            {renderMobileNav()}
            {/* Mobile User Info */}
            <div className="pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
