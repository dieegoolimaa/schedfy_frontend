import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";

export function Navigation() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
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

  const navItems = [
    { path: "/dashboard", label: t("nav.dashboard", "Dashboard") },
    { path: "/bookings", label: t("nav.bookings", "Bookings") },
    { path: "/services", label: t("nav.services", "Services") },
    { path: "/reports", label: t("nav.reports", "Reports") },
    { path: "/settings", label: t("nav.settings", "Settings") },
  ];

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

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              Schedfy
            </Link>
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">
                {t("nav.welcome", "Welcome")},
              </span>
              <span className="font-medium">{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t("common.logout", "Logout")}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
