import React, { createContext, useContext, useState, useEffect } from "react";

interface FeatureFlags {
  aiPremiumEnabled: boolean;
  loyaltyManagementEnabled: boolean;
  advancedAnalyticsEnabled: boolean;
  multiLocationEnabled: boolean;
}

interface FeatureFlagsContextType {
  features: FeatureFlags;
  updateFeatureFlag: (
    feature: keyof FeatureFlags,
    enabled: boolean
  ) => Promise<void>;
  isFeatureAvailable: (feature: keyof FeatureFlags) => boolean;
}

const defaultFeatures: FeatureFlags = {
  aiPremiumEnabled: false, // Disabled by default until Schedfy admin activates
  loyaltyManagementEnabled: false, // Disabled by default until Schedfy admin activates
  advancedAnalyticsEnabled: true,
  multiLocationEnabled: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
);

export function FeatureFlagsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load feature flags from backend or localStorage
    const loadFeatureFlags = async () => {
      try {
        // Try to load from localStorage first (for development)
        const storedFlags = localStorage.getItem("schedfy-feature-flags");
        if (storedFlags) {
          setFeatures(JSON.parse(storedFlags));
        } else {
          // In production, this would fetch from backend API
          // const response = await fetch('/api/feature-flags');
          // const data = await response.json();
          // setFeatures(data);

          // For now, use defaults
          setFeatures(defaultFeatures);
          localStorage.setItem(
            "schedfy-feature-flags",
            JSON.stringify(defaultFeatures)
          );
        }
      } catch (error) {
        console.error("Failed to load feature flags:", error);
        setFeatures(defaultFeatures);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  const updateFeatureFlag = async (
    feature: keyof FeatureFlags,
    enabled: boolean
  ) => {
    try {
      const updatedFeatures = { ...features, [feature]: enabled };

      // In production, this would update the backend
      // await fetch('/api/feature-flags', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [feature]: enabled })
      // });

      // Update local state and localStorage
      setFeatures(updatedFeatures);
      localStorage.setItem(
        "schedfy-feature-flags",
        JSON.stringify(updatedFeatures)
      );
    } catch (error) {
      console.error("Failed to update feature flag:", error);
      throw error;
    }
  };

  const isFeatureAvailable = (feature: keyof FeatureFlags): boolean => {
    return features[feature];
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <FeatureFlagsContext.Provider
      value={{ features, updateFeatureFlag, isFeatureAvailable }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider"
    );
  }
  return context;
}

// Component to conditionally render based on feature flag
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: Readonly<{
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}>) {
  const { isFeatureAvailable } = useFeatureFlags();

  if (isFeatureAvailable(feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Hook for checking multiple features
export function useFeatureCheck(feature: keyof FeatureFlags): boolean {
  const { isFeatureAvailable } = useFeatureFlags();
  return isFeatureAvailable(feature);
}
