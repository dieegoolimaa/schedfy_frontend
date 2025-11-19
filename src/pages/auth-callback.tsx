import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getDashboardRoute } from "../lib/utils";
import { storage } from "../lib/storage";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`OAuth error: ${error}`);
      navigate("/login");
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">Processing your login...</h2>
        <p className="text-muted-foreground">
          Please wait while we complete your Google authentication.
        </p>
      </div>
    </div>
  );
}
