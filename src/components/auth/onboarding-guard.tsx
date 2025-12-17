import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard - Ensures user completes onboarding before accessing dashboard
 * Redirects to /onboarding if entity setup is incomplete
 *
 * Usage:
 * <OnboardingGuard>
 *   <Dashboard />
 * </OnboardingGuard>
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, entity, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [entityCheckComplete, setEntityCheckComplete] = useState(false);

  useEffect(() => {
    // Skip check if still loading or not authenticated
    if (isLoading || !user) {
      return;
    }

    // Skip check if already on onboarding page
    if (location.pathname === "/onboarding") {
      setEntityCheckComplete(true);
      return;
    }

    // Skip check if user has no entity (edge case - platform admin, etc.)
    if (!user.entityId) {
      setEntityCheckComplete(true);
      return;
    }

    // Wait for entity to load if user has entityId
    if (!entity) {
      // Entity is still loading, wait a bit
      const timeout = setTimeout(() => {
        // If entity is still null after waiting, show warning
        console.warn("[OnboardingGuard] Entity not loaded after timeout, user may need to re-login");
        setEntityCheckComplete(true);
      }, 2000); // Wait 2 seconds for entity to load

      return () => clearTimeout(timeout);
    }

    // Check if entity exists and setup is complete
    if (!entity.isOnboardingComplete) {
      console.log(
        "[OnboardingGuard] Entity setup incomplete, redirecting to /onboarding"
      );
      navigate("/onboarding", { replace: true });
    }

    setEntityCheckComplete(true);
  }, [user, entity, isLoading, navigate, location.pathname]);

  // Show loading while checking auth and entity
  if (isLoading || (user?.entityId && !entity && !entityCheckComplete)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

