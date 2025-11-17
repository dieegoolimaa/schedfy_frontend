import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Building2,
  Users,
  Shield,
  User,
  Briefcase,
  Home,
  FileText,
  Layers,
  Globe,
} from "lucide-react";

export function TestPagesPage() {
  const pageCategories = [
    {
      title: "🏠 Public Pages",
      icon: Home,
      color: "bg-slate-600",
      pages: [
        { name: "Home", path: "/", description: "Landing page" },
        {
          name: "Features",
          path: "/features",
          description: "Features showcase",
        },
        { name: "Pricing", path: "/pricing", description: "Pricing plans" },
        {
          name: "Integrations",
          path: "/integrations",
          description: "Third-party integrations",
        },
        { name: "About", path: "/about", description: "About Schedfy" },
        { name: "Login", path: "/login", description: "User authentication" },
        {
          name: "Register",
          path: "/register",
          description: "New user registration",
        },
        { name: "Terms", path: "/terms", description: "Terms of service" },
        { name: "Privacy", path: "/privacy", description: "Privacy policy" },
        { name: "Contact", path: "/contact", description: "Contact form" },
      ],
    },
    {
      title: "🔐 Auth & Onboarding",
      icon: Shield,
      color: "bg-indigo-600",
      pages: [
        {
          name: "Onboarding",
          path: "/onboarding",
          description: "Setup wizard (protected)",
        },
        {
          name: "Accept Invitation",
          path: "/accept-invitation",
          description: "Team invitation",
        },
        {
          name: "Auth Callback",
          path: "/auth/callback",
          description: "OAuth callback",
        },
        {
          name: "Payment Success",
          path: "/payments/success",
          description: "Stripe success page",
        },
      ],
    },
    {
      title: "📊 Common Pages (All Plans)",
      icon: Layers,
      color: "bg-teal-600",
      description:
        "Adaptive pages that work for Simple, Individual & Business plans",
      pages: [
        {
          name: "Dashboard",
          path: "/entity/dashboard",
          description: "Unified dashboard (adaptive by plan)",
        },
        {
          name: "Bookings",
          path: "/entity/bookings",
          description: "Full booking management (all plans)",
        },
        {
          name: "Services & Packages",
          path: "/entity/services",
          description: "Service catalog & packages",
        },
        {
          name: "Reports",
          path: "/entity/reports",
          description: "Performance reports (adaptive)",
        },
        {
          name: "Settings",
          path: "/entity/settings",
          description: "Business settings (adaptive)",
        },
        {
          name: "Subscription",
          path: "/entity/subscription-management",
          description: "Plan management (all)",
        },
        {
          name: "Payment Management",
          path: "/entity/payment-management",
          description: "Payments (Individual & Business)",
        },
        {
          name: "Professionals",
          path: "/entity/professionals",
          description: "Staff management (Simple & Business)",
        },
        {
          name: "Client Profile",
          path: "/entity/client-profile",
          description: "Customer database",
        },
        {
          name: "Entity Profile",
          path: "/entity/profile",
          description: "Business profile editor",
        },
        {
          name: "Reviews",
          path: "/entity/reviews",
          description: "Customer reviews",
        },
        {
          name: "Notification Preferences",
          path: "/entity/notification-center",
          description: "Notification settings",
        },
      ],
    },
    {
      title: "🏢 Business Plan Only",
      icon: Building2,
      color: "bg-purple-600",
      description: "Exclusive features for Business tier",
      pages: [
        {
          name: "User Management",
          path: "/entity/users",
          description: "Team members & permissions",
        },
        {
          name: "Commissions",
          path: "/entity/commissions-management",
          description: "Commission tracking & payouts",
        },
        {
          name: "Financial Reports",
          path: "/entity/financial-reports",
          description: "Advanced financial analytics",
        },
        {
          name: "Data Analytics",
          path: "/entity/analytics",
          description: "Business intelligence & insights",
        },
        {
          name: "AI Premium",
          path: "/entity/ai-premium",
          description: "AI-powered features",
        },
      ],
    },
    {
      title: "👤 Individual Plan Routes",
      icon: User,
      color: "bg-blue-600",
      description: "Individual plan access points (uses common pages)",
      pages: [
        {
          name: "Dashboard",
          path: "/individual/dashboard",
          description: "→ Redirects to unified dashboard",
        },
        {
          name: "Bookings",
          path: "/individual/bookings",
          description: "→ Uses common booking page",
        },
        {
          name: "Services",
          path: "/individual/services",
          description: "→ Uses common services page",
        },
        {
          name: "Reports",
          path: "/individual/reports",
          description: "→ Uses common reports page",
        },
        {
          name: "Payment Management",
          path: "/individual/payment-management",
          description: "→ Uses common payment page",
        },
      ],
    },
    {
      title: "💼 Simple Plan Routes",
      icon: Briefcase,
      color: "bg-gray-600",
      description: "Simple plan access points (uses common pages)",
      pages: [
        {
          name: "Dashboard",
          path: "/simple/dashboard",
          description: "→ Redirects to unified dashboard",
        },
        {
          name: "Bookings",
          path: "/simple/bookings",
          description: "→ Uses common booking page",
        },
        {
          name: "Services",
          path: "/simple/services",
          description: "→ Uses common services page",
        },
        {
          name: "Reports",
          path: "/simple/reports",
          description: "→ Uses common reports page",
        },
        {
          name: "Settings",
          path: "/simple/settings",
          description: "→ Uses common settings page",
        },
      ],
    },
    {
      title: "👨‍💼 Professional/Staff Pages",
      icon: Users,
      color: "bg-green-600",
      description: "Interface for business staff/attendants",
      pages: [
        {
          name: "Professional Dashboard",
          path: "/professional/dashboard",
          description: "Staff overview & tasks",
        },
        {
          name: "My Bookings",
          path: "/professional/bookings",
          description: "Assigned appointments",
        },
        {
          name: "Schedule",
          path: "/professional/schedule",
          description: "Personal availability",
        },
        {
          name: "Earnings",
          path: "/professional/earnings",
          description: "Commission & payments",
        },
        {
          name: "Profile",
          path: "/professional/profile",
          description: "Professional profile",
        },
        {
          name: "Summary",
          path: "/professional/summary",
          description: "Performance summary",
        },
      ],
    },
    {
      title: "🌐 Public Booking",
      icon: Globe,
      color: "bg-cyan-600",
      pages: [
        {
          name: "Public Entity Profile",
          path: "/book/example-business",
          description: "Customer booking page (/:slug)",
        },
      ],
    },
    {
      title: "🛠️ Utility Pages",
      icon: FileText,
      color: "bg-orange-600",
      pages: [
        {
          name: "Unauthorized",
          path: "/unauthorized",
          description: "403 - Access denied",
        },
        {
          name: "Upgrade Plan",
          path: "/upgrade",
          description: "Plan upgrade prompt",
        },
        {
          name: "Not Found",
          path: "/non-existent-route",
          description: "404 - Page not found",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            📋 Schedfy - Test & Navigate All Pages
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Comprehensive navigation for all Schedfy pages. Test functionality,
            mobile responsiveness, and the new consolidated structure.
          </p>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Badge variant="outline" className="text-xs sm:text-sm">
              Total Pages:{" "}
              {pageCategories.reduce((acc, cat) => acc + cat.pages.length, 0)}
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              ✅ Consolidated Structure
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              📱 Mobile Optimized
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 sm:p-4">
            <div className="text-2xl font-bold text-teal-600">12</div>
            <div className="text-xs text-muted-foreground">Common Pages</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-xs text-muted-foreground">Business Only</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-2xl font-bold text-green-600">6</div>
            <div className="text-xs text-muted-foreground">Professional</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-2xl font-bold text-slate-600">10</div>
            <div className="text-xs text-muted-foreground">Public</div>
          </Card>
        </div>

        {/* Page Categories */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {pageCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.title} className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 sm:p-3 rounded-lg ${category.color} flex-shrink-0`}
                    >
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {category.description ||
                          `${category.pages.length} page${
                            category.pages.length !== 1 ? "s" : ""
                          }`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid gap-2 sm:gap-3">
                    {category.pages.map((page) => (
                      <Link key={page.path} to={page.path} className="group">
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                              {page.name}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                              {page.description}
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <code className="text-xs px-2 py-1 bg-muted rounded hidden lg:inline-block max-w-[150px] truncate">
                              {page.path}
                            </code>
                            <span className="text-primary lg:hidden text-lg">
                              →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testing Instructions */}
        <Card className="border-dashed border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span>🧪</span> Testing Instructions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              How to test the consolidated Schedfy platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">🔄 Test Different Plans</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Use different user accounts or modify your profile to test:
                    <span className="block mt-1 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Simple Plan
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Individual Plan
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Business Plan
                      </Badge>
                    </span>
                    Each plan shows different features and navigation menus.
                    Navigate to plan-specific routes (e.g.,{" "}
                    <code className="text-xs bg-muted px-1 rounded">
                      /simple/dashboard
                    </code>
                    ,
                    <code className="text-xs bg-muted px-1 rounded ml-1">
                      /entity/dashboard
                    </code>
                    ) to see adaptive behavior.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    📱 Test Mobile Responsiveness
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Open DevTools (
                    <code className="px-1 py-0.5 bg-muted rounded">F12</code>),
                    toggle device toolbar (
                    <code className="px-1 py-0.5 bg-muted rounded">
                      Ctrl+Shift+M
                    </code>
                    ), and test breakpoints:
                    <span className="block mt-1 space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        375px - Mobile
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        768px - Tablet
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        1024px+ - Desktop
                      </Badge>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">✅ Test Consolidation</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    All <strong>Common Pages</strong> (Dashboard, Bookings,
                    Reports, etc.) now use a single file that adapts based on
                    the user's plan. Switch plans and verify that features
                    appear/hide correctly:
                    <span className="block mt-1">
                      <code className="text-xs">
                        const plan = user?.plan || "simple";
                      </code>
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">🎯 Priority Pages to Test</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      to="/entity/dashboard"
                      className="text-xs text-primary hover:underline"
                    >
                      → Unified Dashboard
                    </Link>
                    <Link
                      to="/entity/bookings"
                      className="text-xs text-primary hover:underline"
                    >
                      → Booking Management
                    </Link>
                    <Link
                      to="/entity/services"
                      className="text-xs text-primary hover:underline"
                    >
                      → Services & Packages
                    </Link>
                    <Link
                      to="/entity/payment-management"
                      className="text-xs text-primary hover:underline"
                    >
                      → Payment Management
                    </Link>
                    <Link
                      to="/entity/reports"
                      className="text-xs text-primary hover:underline"
                    >
                      → Reports
                    </Link>
                    <Link
                      to="/entity/settings"
                      className="text-xs text-primary hover:underline"
                    >
                      → Settings
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    🔍 Check Backend Integration
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Open DevTools Network tab and verify:
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>API calls are being made correctly</li>
                      <li>Data loads from backend services</li>
                      <li>Stripe webhooks function properly</li>
                      <li>No console errors</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Info */}
        <Card className="border-emerald-500 border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span>🏗️</span> Architecture Changes
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Recent consolidation improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">
                ✅ Eliminated Duplicate Files
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Removed plan-specific folders (<code>/simple/</code>,{" "}
                <code>/individual/</code>, <code>/entity/</code>) containing
                duplicate pages. Now use single adaptive pages in{" "}
                <code>/common/</code>.
              </p>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    BEFORE
                  </Badge>
                  <code className="text-xs">52 .tsx files</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    AFTER
                  </Badge>
                  <code className="text-xs">42 .tsx files (-19.2%)</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">
                🎯 Adaptive Page Pattern
              </h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {`const plan = user?.plan || "simple";

{plan === "simple" && <SimpleFeatures />}
{plan === "individual" && <IndividualFeatures />}
{plan === "business" && <BusinessFeatures />}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">📂 New Structure</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>
                  ✅ <code>/pages/common/</code> - 12 adaptive pages
                </div>
                <div>
                  ✅ <code>/pages/business/</code> - 5 Business-only features
                </div>
                <div>
                  ✅ <code>/pages/professional/</code> - 6 staff pages
                </div>
                <div>
                  ✅ <code>/pages/public/</code> - 1 public booking page
                </div>
                <div>✅ Root pages - Auth, onboarding, marketing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">🏠 Home</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/entity/dashboard">📊 Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/entity/bookings">📅 Bookings</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/professional/dashboard">👨‍💼 Professional</Link>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t">
          <p>
            💡 <strong>Tip:</strong> This page is only visible in development
            mode (
            <code className="px-1 py-0.5 bg-muted rounded">
              import.meta.env.DEV
            </code>
            )
          </p>
        </div>
      </div>
    </div>
  );
}
