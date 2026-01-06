import React from "react";
import { useAuth } from "../contexts/auth-context";

export function usePlanRestrictions() {
  const { user } = useAuth();

  const isSimplePlan = user?.plan === "simple" || user?.plan === "simple_unlimited";
  const isIndividualPlan = user?.plan === "individual";
  const isBusinessPlan = user?.plan === "business";

  // Features available by plan
  const canViewFinancialReports = !isSimplePlan;
  const canViewPricing = !isSimplePlan;
  const canViewPaymentDetails = !isSimplePlan;
  const canViewCommissions = !isSimplePlan;
  const canViewVouchers = !isSimplePlan;
  const canViewRevenue = !isSimplePlan;
  const canExportFinancialData = !isSimplePlan;
  const canViewTransactionDetails = !isSimplePlan;

  // Advanced business features
  // AI Insights are now available for all plans
  const canViewAdvancedAnalytics = true;
  const canManageMultipleLocations = isBusinessPlan;
  const canViewTeamReports = isBusinessPlan;

  return {
    // Plan info
    currentPlan: user?.plan || "simple",
    isSimplePlan,
    isIndividualPlan,
    isBusinessPlan,

    // Financial restrictions for Simple plan
    canViewFinancialReports,
    canViewPricing,
    canViewPaymentDetails,
    canViewCommissions,
    canViewVouchers,
    canViewRevenue,
    canExportFinancialData,
    canViewTransactionDetails,

    // Business plan features
    canViewAdvancedAnalytics,
    canManageMultipleLocations,
    canViewTeamReports,

    // Helper function to get upgrade message
    getUpgradeMessage: () => {
      if (isSimplePlan) {
        return "Upgrade to Individual or Business plan to access financial reports and analytics.";
      }
      return "";
    },

    // Helper function to get required plan for feature
    getRequiredPlan: (feature: string) => {
      switch (feature) {
        case "financial":
        case "analytics":
          return "individual";
        case "team":
          return "business";
        default:
          return "simple";
      }
    },
  };
}

// Component wrapper for conditional rendering based on plan
export function PlanGate({
  children,
  requiredPlan = "individual",
  fallback = null,
  feature,
}: Readonly<{
  children: React.ReactNode;
  requiredPlan?: "simple" | "simple_unlimited" | "individual" | "business";
  fallback?: React.ReactNode;
  feature?: "financial" | "analytics" | "team";
}>) {
  const {
    currentPlan,
    canViewFinancialReports,
    canViewAdvancedAnalytics,
    canViewTeamReports,
  } = usePlanRestrictions();

  const planHierarchy: Record<string, number> = { simple: 0, simple_unlimited: 0, individual: 1, business: 2 };
  const userPlanLevel = planHierarchy[currentPlan] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan] ?? 0;

  // Feature-specific checks
  if (feature === "financial" && !canViewFinancialReports) {
    return <>{fallback}</>;
  }

  if (feature === "analytics" && !canViewAdvancedAnalytics) {
    return <>{fallback}</>;
  }

  if (feature === "team" && !canViewTeamReports) {
    return <>{fallback}</>;
  }

  // General plan level check
  if (userPlanLevel >= requiredPlanLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Upgrade prompt component
export function UpgradePrompt({
  feature = "financial",
  className = "",
}: Readonly<{
  feature?: "financial" | "analytics" | "team";
  className?: string;
}>) {
  const { getUpgradeMessage, getRequiredPlan } = usePlanRestrictions();

  const requiredPlan = getRequiredPlan(feature);
  const upgradeMessage = getUpgradeMessage();

  if (!upgradeMessage) return null;

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 text-center ${className}`}
    >
      <div className="text-blue-800 font-medium mb-2">
        {feature === "financial" && "Financial Features Locked"}
        {feature === "analytics" && "Advanced Analytics Locked"}
        {feature === "team" && "Team Management Locked"}
      </div>
      <p className="text-blue-700 text-sm mb-3">{upgradeMessage}</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
        Upgrade to{" "}
        {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan
      </button>
    </div>
  );
}
