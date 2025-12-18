import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SchedfySpinner } from "../../components/ui/schedfy-spinner";
import { getDashboardRoute } from "../../lib/utils";
import { storage } from "../../lib/storage";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const action = searchParams.get("action");

    if (error) {
      toast.error(`OAuth error: ${error}`);
      navigate("/login");
      return;
    }

    if (action === "impersonate" && token) {
      processImpersonation(token);
      return;
    }

    if (code && state) {
      // Process OAuth callback
      processOAuthCallback(code, state);
    } else {
      toast.error("Invalid OAuth callback");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const processOAuthCallback = async (code: string, state: string) => {
    try {
      // In a real app, send the code to your backend to exchange for tokens
      console.log("OAuth callback - Code:", code, "State:", state);

      // Simulate backend processing
      toast.info("Processing OAuth callback...");

      setTimeout(() => {
        // Mock successful OAuth processing
        const mockUser = {
          id: state === "login" ? "google-123456" : "google-789012",
          email: state === "login" ? "user@gmail.com" : "newuser@gmail.com",
          name: state === "login" ? "John Doe" : "Jane Smith",
          role: "owner" as const,
          platform: "client" as const,
          avatar: "https://lh3.googleusercontent.com/a/default-user",
          provider: "google",
          plan: "business" as const,
          entityId: "entity-123",
          country: "PT" as const,
          timezone: "Europe/Lisbon",
          locale: "en",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store auth data
        storage.setUser(mockUser);
        storage.setToken(`mock-jwt-token-oauth-${state}`);

        toast.success(
          `Google ${state === "login" ? "login" : "registration"} successful!`
        );

        // Navigate to appropriate dashboard based on user type
        const dashboardRoute = getDashboardRoute(mockUser);
        navigate(dashboardRoute);
      }, 2000);
    } catch (error) {
      console.error("OAuth callback error:", error);
      toast.error("Failed to process OAuth callback");
      navigate("/login");
    }
  };

  const processImpersonation = async (token: string) => {
    try {
      toast.info("Starting impersonation session...");

      // Store token immediately
      storage.setToken(token);

      // Fetch user profile to ensure token is valid and get user details
      const { authService } = await import("../../services/auth.service");
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
