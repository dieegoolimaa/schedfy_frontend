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
} from "lucide-react";

export function TestPagesPage() {
  const pageCategories = [
    {
      title: "Public Pages",
      icon: Home,
      color: "bg-gray-500",
      pages: [
        { name: "Home", path: "/", description: "Landing page" },
        { name: "Login", path: "/login", description: "User login" },
        {
          name: "Register",
          path: "/register",
          description: "User registration",
        },
        {
          name: "Discover",
          path: "/discover",
          description: "Business discovery",
        },
        { name: "Terms", path: "/terms", description: "Terms of service" },
        { name: "Privacy", path: "/privacy", description: "Privacy policy" },
        { name: "Contact", path: "/contact", description: "Contact form" },
      ],
    },
    {
      title: "Admin Pages (Platform)",
      icon: Shield,
      color: "bg-red-500",
      pages: [
        {
          name: "Admin Dashboard",
          path: "/admin/dashboard",
          description: "Platform overview",
        },
        {
          name: "Business Management",
          path: "/admin/business-management",
          description: "Manage all entities",
        },
        {
          name: "User Management",
          path: "/admin/user-management",
          description: "Manage all users",
        },
        {
          name: "Subscriptions Board",
          path: "/admin/subscriptions-board",
          description: "Monitor entity subscriptions",
        },
        {
          name: "Mass Communications",
          path: "/admin/mass-communications",
          description: "Send bulk messages",
        },
        {
          name: "Customer Support",
          path: "/admin/customer-support",
          description: "Support tickets",
        },
        {
          name: "Financial Reports",
          path: "/admin/financial-reports",
          description: "Platform revenue",
        },
        {
          name: "Feature Management",
          path: "/admin/feature-management",
          description: "Toggle features",
        },
        {
          name: "AI Premium Management",
          path: "/admin/ai-premium-management",
          description: "AI features",
        },
        {
          name: "Global Settings",
          path: "/admin/global-settings",
          description: "Platform settings",
        },
      ],
    },
    {
      title: "Business Plan (Entity)",
      icon: Building2,
      color: "bg-purple-500",
      pages: [
        {
          name: "Entity Dashboard",
          path: "/entity/dashboard",
          description: "Business overview",
        },
        {
          name: "Bookings",
          path: "/entity/bookings",
          description: "Manage bookings (consolidated for all plans)",
        },
        {
          name: "Services",
          path: "/entity/services",
          description: "Service catalog",
        },
        {
          name: "Professionals",
          path: "/entity/professionals",
          description: "Staff management",
        },
        {
          name: "Client Profile",
          path: "/entity/client-profile",
          description: "Customer database",
        },
        {
          name: "Commissions",
          path: "/entity/commissions-management",
          description: "Commission tracking",
        },
        {
          name: "Payment Management",
          path: "/entity/payment-management",
          description: "Payment processing",
        },
        {
          name: "Reports",
          path: "/entity/reports",
          description: "Business reports",
        },
        {
          name: "Financial Reports",
          path: "/entity/financial-reports",
          description: "Financial analytics",
        },
        {
          name: "Data Analytics",
          path: "/entity/analytics",
          description: "Advanced analytics",
        },
        {
          name: "Notification Center",
          path: "/entity/notification-center",
          description: "Notifications",
        },
        {
          name: "AI Premium",
          path: "/entity/ai-premium",
          description: "AI features",
        },
        {
          name: "User Management",
          path: "/entity/users",
          description: "Team members",
        },
        {
          name: "Subscription",
          path: "/entity/subscription-management",
          description: "Manage subscription",
        },
        {
          name: "Entity Profile",
          path: "/entity/profile",
          description: "Business profile",
        },
        {
          name: "Settings",
          path: "/entity/settings",
          description: "Business settings",
        },
      ],
    },
    {
      title: "Individual Plan",
      icon: User,
      color: "bg-blue-500",
      pages: [
        {
          name: "Individual Dashboard",
          path: "/individual/dashboard",
          description: "Personal overview",
        },
        {
          name: "Bookings",
          path: "/individual/bookings",
          description: "Manage appointments",
        },
        {
          name: "Services",
          path: "/individual/services",
          description: "Service offerings",
        },
        {
          name: "Reports",
          path: "/individual/reports",
          description: "Performance reports",
        },
      ],
    },
    {
      title: "Simple Plan",
      icon: Briefcase,
      color: "bg-gray-500",
      pages: [
        {
          name: "Simple Dashboard",
          path: "/simple/dashboard",
          description: "Basic overview",
        },
        {
          name: "Bookings",
          path: "/simple/bookings",
          description: "Basic bookings",
        },
        {
          name: "Services",
          path: "/simple/services",
          description: "Service list",
        },
        {
          name: "Reports",
          path: "/simple/reports",
          description: "Basic reports",
        },
      ],
    },
    {
      title: "Professional Pages",
      icon: Users,
      color: "bg-green-500",
      pages: [
        {
          name: "Professional Dashboard",
          path: "/professional/dashboard",
          description: "Staff dashboard",
        },
      ],
    },
    {
      title: "Utility Pages",
      icon: FileText,
      color: "bg-orange-500",
      pages: [
        {
          name: "Unauthorized",
          path: "/unauthorized",
          description: "Access denied",
        },
        { name: "Upgrade", path: "/upgrade", description: "Plan upgrade" },
        { name: "Not Found", path: "/404-test", description: "404 page" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            📋 Schedfy Test Pages
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Navigate to any page to test functionality and mobile responsiveness
          </p>
          <Badge variant="outline" className="text-xs sm:text-sm">
            Total Pages:{" "}
            {pageCategories.reduce((acc, cat) => acc + cat.pages.length, 0)}
          </Badge>
        </div>

        {/* Page Categories */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {pageCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.title} className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 sm:p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {category.pages.length} page
                        {category.pages.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid gap-2 sm:gap-3">
                    {category.pages.map((page) => (
                      <Link key={page.path} to={page.path} className="group">
                        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                              {page.name}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                              {page.description}
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <code className="text-xs px-2 py-1 bg-muted rounded hidden sm:inline-block">
                              {page.path}
                            </code>
                            <span className="text-xs text-muted-foreground sm:hidden">
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
        <Card className="border-dashed">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Testing Instructions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              How to test the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Use the DevRoleSwitcher</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click the ⚙️ icon in the navigation to switch between roles
                    (Simple, Individual, Business, Admin) to test different
                    navigation menus and access controls.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Test Mobile Responsiveness</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Open DevTools (F12), toggle device toolbar (Ctrl+Shift+M),
                    and test at different screen sizes:
                    <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">
                      375px
                    </code>{" "}
                    (mobile),
                    <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">
                      768px
                    </code>{" "}
                    (tablet),
                    <code className="mx-1 px-1 py-0.5 bg-muted rounded text-xs">
                      1024px
                    </code>{" "}
                    (desktop).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Check Dropdown Navigation</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Test the dropdown menus in the navigation bar. On desktop,
                    hover over the dropdowns. On mobile (lg breakpoint), use the
                    hamburger menu to access grouped navigation items.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Verify Card Spacing</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Check that cards have appropriate padding and spacing on
                    mobile (tighter) vs desktop (more spacious). Look for proper
                    text truncation and responsive layouts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Test Key Pages</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Priority pages to test: Admin Dashboard, Entity Dashboard,
                    Subscriptions Board, Mass Communications, Booking
                    Management, and Financial Reports.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">← Back to Home</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/entity/dashboard">Business Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
