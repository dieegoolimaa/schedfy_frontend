/**
 * Enhanced Region Context with Dynamic Pricing
 * Combines static region config with dynamic pricing from API
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  RegionCode,
  RegionConfig,
  getRegionConfig,
  detectUserRegion,
  setUserRegion as saveRegion,
  getAvailableRegions,
} from "../lib/region-config";
import { usePricing, PricingEntry } from "../hooks/usePricing";
import i18n from "../i18n/config";

interface RegionContextValue {
  region: RegionCode;
  regionConfig: RegionConfig;
  setRegion: (region: RegionCode) => void;
  availableRegions: RegionConfig[];
  isDetecting: boolean;
  // Dynamic pricing from API
  pricing: PricingEntry[];
  pricingLoading: boolean;
  getPriceDisplay: (
    planType: "simple" | "individual" | "business",
    billingPeriod?: "monthly" | "yearly"
  ) => string;
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [region, setRegionState] = useState<RegionCode>("PT");
  const [isDetecting, setIsDetecting] = useState(true);
  const regionConfig = getRegionConfig(region);
  const availableRegions = getAvailableRegions();

  // Use pricing hook to fetch dynamic prices
  const {
    pricing,
    loading: pricingLoading,
    getPriceForPlan,
  } = usePricing(region);

  // Detect region on mount
  useEffect(() => {
    const detected = detectUserRegion();
    setRegionState(detected);

    // Update i18n language based on region
    const config = getRegionConfig(detected);
    i18n.changeLanguage(config.locale);

    // Wait a bit to show splash screen
    setTimeout(() => {
      setIsDetecting(false);
    }, 300);
  }, []);

  // Update region
  const setRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    saveRegion(newRegion);

    // Update i18n language
    const config = getRegionConfig(newRegion);
    i18n.changeLanguage(config.locale);
  };

  /**
   * Get price display with fallback logic:
   * 1. Try API pricing first
   * 2. Fall back to static pricing if API fails
   */
  const getPriceDisplay = (
    planType: "simple" | "individual" | "business",
    billingPeriod: "monthly" | "yearly" = "monthly"
  ): string => {
    // Try to get from API first
    if (!pricingLoading && pricing.length > 0) {
      const apiPrice = getPriceForPlan(planType, region, billingPeriod);
      if (apiPrice) {
        return apiPrice.displayPrice;
      }
    }

    // Fallback to static pricing (only monthly prices in static config)
    if (billingPeriod === "monthly") {
      return regionConfig.priceFormat[planType];
    }

    // For yearly, calculate from monthly (this is a fallback, API should provide yearly)
    const monthlyPrice = regionConfig.priceFormat[planType];
    return `${monthlyPrice} (yearly pricing not available)`;
  };

  return (
    <RegionContext.Provider
      value={{
        region,
        regionConfig,
        setRegion,
        availableRegions,
        isDetecting,
        pricing,
        pricingLoading,
        getPriceDisplay,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return context;
}
