import { useEffect } from "react";
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

  useEffect(() => {
    // Skip check if still loading or not authenticated
    if (isLoading || !user) {
      return;
    }

    // Skip check if already on onboarding page
    if (location.pathname === "/onboarding") {
      return;
    }

    // Skip check if user has no entity (edge case)
    if (!user.entityId) {
      return;
    }

    // Check if entity exists and setup is complete
    if (entity) {
      if (!entity.isOnboardingComplete) {
        console.log(
          "[OnboardingGuard] Entity setup incomplete, redirecting to /onboarding"
        );
        navigate("/onboarding", { replace: true });
      }
    } else {
      // Entity should exist but wasn't loaded - this shouldn't happen
      console.warn("[OnboardingGuard] User has entityId but entity is null");
    }
  }, [user, entity, isLoading, navigate, location.pathname]);

  // Show loading or children
  if (isLoading) {
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
