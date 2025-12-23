import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SchedfySpinner } from "../../components/ui/schedfy-spinner";
import { getDashboardRoute } from "../../lib/utils";
import { storage } from "../../lib/storage";
import { authService } from "../../services/auth.service";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const action = searchParams.get("action");

    if (error) {
      toast.error(`Authentication error: ${error}`);
      navigate("/login");
      return;
    }

    if (action === "impersonate" && token) {
      processImpersonation(token);
      return;
    }

    // No valid action, redirect to login
    toast.error("Invalid callback");
    navigate("/login");
  }, [searchParams, navigate]);

  const processImpersonation = async (token: string) => {
    try {
      toast.info("Starting impersonation session...");

      // Store token immediately
      storage.setToken(token);

      // Fetch user profile to ensure token is valid and get user details
      const response = await authService.getProfile();

      if (response.data) {
        storage.setUser(response.data);
        toast.success(`Impersonating ${response.data.name}`);

        // Navigate to dashboard
        const dashboardRoute = getDashboardRoute(response.data);
        // Use window.location to ensure a full reload with new auth state
        window.location.href = dashboardRoute;
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error: any) {
      console.error("Impersonation error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(`Impersonation failed: ${error.response?.data?.message || error.message}`);
      storage.clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <SchedfySpinner size="xl" className="mx-auto" />
        <h2 className="text-xl font-semibold">Processing your login...</h2>
        <p className="text-muted-foreground">
          Please wait while we authenticate your session.
        </p>
      </div>
    </div>
  );
}
