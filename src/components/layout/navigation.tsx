import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useFeatureFlags } from "../../contexts/feature-flags-context";
import { usePermissions } from "../../hooks/use-permissions";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState } from "react";

export function Navigation() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { features } = useFeatureFlags();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { canViewPage, hasDirectPermission } = usePermissions();

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
          { path: "/admin/dashboard", label: t("nav.commandCenter", "Command Center") },
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
          { path: "/entity/dashboard", label: t("nav.commandCenter", "Command Center") },
        ],
        operations: [
          {
            path: "/entity/services-packages",
            label: t("nav.servicesPackages", "Services & Packages"),
          },
          { path: "/entity/reviews", label: t("nav.reviews", "Reviews") },

          {
            path: "/entity/users",
            label: t("nav.users", "Team & Roles"),
          },
          {
            path: "/entity/client-profile",
            label: t("nav.clients", "Clients"),
          },
          {
            path: "/entity/reports",
            label: t("nav.operationalReports", "Operational Analysis"),
          },
        ],
        financial: [
          {
            path: "/entity/commissions-management",
            label: t("nav.commissions", "Commissions"),
          },
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
          ...(features.aiPremiumEnabled
            ? [
              {
                path: "/entity/ai-premium",
                label: t("nav.ai", "AI Premium"),
              },
            ]
            : []),
          ...(hasDirectPermission('canManageSubscription') ? [{
            path: "/entity/subscription-management",
            label: t("nav.subscription", "Subscription"),
          }] : []),
          ...(hasDirectPermission('canEditEntitySettings') ? [{
            path: "/entity/settings",
            label: t("nav.settings", "Settings"),
          }] : []),
          {
            path: "/entity/support",
            label: t("nav.support", "Support"),
          },
        ],
      };
    }

    // Individual plan users (professional features)
    if (user?.plan === "individual") {
      return {
        main: [
          {
            path: "/individual/dashboard",
            label: t("nav.commandCenter", "Command Center"),
          },
        ],
        operations: [
          {
            path: "/individual/services",
            label: t("nav.services", "Services"),
          },
        ],
        clients: [
          {
            path: "/individual/clients",
            label: t("nav.clients", "Clients"),
          },
          {
            path: "/individual/reviews",
            label: t("nav.reviews", "Reviews"),
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
          ...(hasDirectPermission('canManageSubscription') ? [{
            path: "/individual/subscription",
            label: t("nav.subscription", "Subscription"),
          }] : []),
          ...(hasDirectPermission('canEditEntitySettings') ? [{
            path: "/simple/settings", // Note: The original code points to /simple/settings for individual?? Check consistent path or use /individual/settings if exists? Original code used /simple/settings so keeping it or fixing it? 
            // Original code at line 204 says /simple/settings. I will trust existing code for that line but append support.
            label: t("nav.settings", "Settings"),
          }] : []),
          {
            path: "/individual/support",
            label: t("nav.support", "Support"),
          },
        ],
      };
    }

    // PROFESSIONAL users - DYNAMIC based on permissions
    if (user?.role === "professional") {
      const navItems: any = {
        main: [
          {
            path: "/professional/dashboard",
            label: t("nav.commandCenter", "Command Center"),
          },
        ],
        operations: [],
        financial: [],
        settings: [],
      };

      // Add pages based on permissions
      if (canViewPage("clients")) {
        navItems.operations.push({
          path: "/entity/client-profile",
          label: t("nav.clients", "Clients"),
        });
      }

      if (canViewPage("schedule")) {
        navItems.operations.push({
          path: "/professional/schedule",
          label: t("nav.schedule", "Schedule"),
        });
      }

      // Allow professionals to view operational reports
      // Using generic /reports route or /professional/reports if created
      navItems.operations.push({
        path: "/professional/reports",
        label: t("nav.operationalReports", "Operational Analysis"),
      });

      // Financial section hidden for professionals as requested
      // if (canViewPage("earnings") || canViewPage("reports")) {
      //   navItems.financial.push({
      //     path: "/professional/earnings",
      //     label: t("nav.earnings", "Earnings"),
      //   });
      // }

      return navItems;
    }

    // Simple plan users (basic features)
    if (user?.plan === "simple") {
      return {
        main: [
          {
            path: "/simple/dashboard",
            label: t("nav.commandCenter", "Command Center"),
          },
        ],
        operations: [
          {
            path: "/simple/services",
            label: t("nav.services", "Services"),
          },
          {
            path: "/entity/users",
            label: t("nav.users", "Team & Roles"),
          },
          {
            path: "/simple/reports",
            label: t("nav.reports", "Reports"),
          },
        ],
        settings: [
          ...(hasDirectPermission('canManageSubscription') ? [{
            path: "/simple/subscription",
            label: t("nav.subscription", "Subscription"),
          }] : []),
          ...(hasDirectPermission('canEditEntitySettings') ? [{
            path: "/simple/settings",
            label: t("nav.settings", "Settings"),
          }] : []),
          {
            path: "/simple/support",
            label: t("nav.support", "Support"),
          },
        ],
      };
    }

    // Fallback
    return {
      main: [
        { path: "/simple/dashboard", label: t("nav.commandCenter", "Command Center") },
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
          {navItems.main.map((item: any) => (
            <Link
              key={item.path}
              to={item.path}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Management/Operations Dropdown */}
          {(navItems.management || navItems.operations) && (navItems.management?.length > 0 || navItems.operations?.length > 0) && (
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
                {(navItems.management || navItems.operations)?.map((item: any) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${location.pathname === item.path ? "bg-accent" : ""
                      }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Financial Dropdown (Business plan only) */}
          {navItems.financial && navItems.financial.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.financial", "Financial")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.financial.map((item: any) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${location.pathname === item.path ? "bg-accent" : ""
                      }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Features Dropdown (Admin only) */}
          {navItems.features && navItems.features.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.features", "Features")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.features.map((item: any) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${location.pathname === item.path ? "bg-accent" : ""
                      }`}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Settings Dropdown */}
          {navItems.settings && navItems.settings.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium h-10">
                  {t("nav.settings", "Settings")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navItems.settings.map((item: any) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer ${location.pathname === item.path ? "bg-accent" : ""
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
          {navItems.main.map((item: any) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.path
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
                  className={`h-4 w-4 transition-transform ${expandedSections.includes("management") ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.includes("management") && (
                <div className="mt-1">
                  {(navItems.management || navItems.operations)?.map((item: any) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${location.pathname === item.path
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
                  className={`h-4 w-4 transition-transform ${expandedSections.includes("financial") ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.includes("financial") && (
                <div className="mt-1">
                  {navItems.financial.map((item: any) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${location.pathname === item.path
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
                  className={`h-4 w-4 transition-transform ${expandedSections.includes("features") ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.includes("features") && (
                <div className="mt-1">
                  {navItems.features.map((item: any) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${location.pathname === item.path
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
          {navItems.settings && navItems.settings.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => toggleSection("settings")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>{t("nav.settings", "Settings")}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expandedSections.includes("settings") ? "rotate-180" : ""
                    }`}
                />
              </button>
              {expandedSections.includes("settings") && (
                <div className="mt-1">
                  {navItems.settings.map((item: any) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-6 py-2 rounded-md text-sm ${location.pathname === item.path
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
            {/* Dev Tools Badge - Only in development */}
            {import.meta.env.DEV && (
              <Link to="/test-pages">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-1 text-xs border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  🧪 Dev Tools
                </Button>
              </Link>
            )}

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full ml-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("nav.profile", "My Profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout", "Logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
