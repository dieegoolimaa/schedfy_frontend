import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { getDashboardRoute } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function DashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        const dashboardRoute = getDashboardRoute(user);
        console.log(
          `[DashboardRedirect] Redirecting user ${user.email} (${user.role}, ${user.plan}) to ${dashboardRoute}`
        );
        navigate(dashboardRoute, { replace: true });
      } else {
        // If not authenticated, redirect to home
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">
          Redirecting to your dashboard...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we take you to the right place.
        </p>
      </div>
    </div>
  );
}
