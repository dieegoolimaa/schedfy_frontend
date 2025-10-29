import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedPlans?: string[];
  requireOwner?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  allowedPlans,
  requireOwner = false,
}: Readonly<ProtectedRouteProps>) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user's plan is allowed
  if (allowedPlans && !allowedPlans.includes(user.plan)) {
    console.log(`[ProtectedRoute] Plan check failed:`, {
      userPlan: user.plan,
      userPlanType: typeof user.plan,
      allowedPlans,
      currentPath: location.pathname,
      includes: allowedPlans.includes(user.plan),
      user: { id: user.id, email: user.email, role: user.role },
    });

    // Don't redirect to upgrade if user is already on upgrade page to prevent loops
    if (location.pathname !== "/upgrade") {
      console.log(`[ProtectedRoute] Redirecting to /upgrade`);
      return <Navigate to="/upgrade" replace />;
    }

    // If user is already on upgrade page, allow access to prevent being stuck
    console.log(
      `[ProtectedRoute] User already on upgrade page, allowing access`
    );
    return <>{children}</>;
  }

  console.log(`[ProtectedRoute] Access granted:`, {
    userPlan: user.plan,
    allowedPlans,
    currentPath: location.pathname,
  });

  // Check if route requires owner role
  if (requireOwner && user.role !== "owner") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Specialized protected route for platform admins
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["platform_admin"]}>
      {children}
    </ProtectedRoute>
  );
}

// Specialized protected route for business owners and managers
export function BusinessRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      allowedRoles={["owner", "admin", "manager"]}
      allowedPlans={["individual", "business"]}
    >
      {children}
    </ProtectedRoute>
  );
}

// Specialized protected route for entity/business plan users
export function EntityRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedPlans={["business"]}>{children}</ProtectedRoute>
  );
}

// Specialized protected route for individual and business plan users
export function IndividualPlusRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedPlans={["individual", "business"]}>
      {children}
    </ProtectedRoute>
  );
}

// Specialized protected route for professionals/attendants
export function ProfessionalRoute({
  children,
  requireBusinessPlan = false,
}: {
  children: React.ReactNode;
  requireBusinessPlan?: boolean;
}) {
  const { user } = useAuth();

  // If requires Business plan, check it
  if (requireBusinessPlan && user?.plan !== "business") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <ProtectedRoute
      allowedRoles={["professional", "attendant", "owner", "admin", "manager"]}
    >
      {children}
    </ProtectedRoute>
  );
}
