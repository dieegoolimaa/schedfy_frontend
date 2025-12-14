import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import {
  RegionCode,
  RegionConfig,
  detectUserRegion,
  getRegionConfig,
  setUserRegion as setStoredRegion,
  getAvailableRegions,
} from "../lib/region-config";
import { usePricing } from "../hooks/usePricing";
import type { PricingEntry } from "../types/models/pricing.interface";
import { storage } from "../lib/storage";

interface RegionContextType {
  region: RegionCode;
  regionConfig: RegionConfig;
  availableRegions: RegionConfig[];
  setRegion: (region: RegionCode) => void;
  isDetecting: boolean;
  // Dynamic pricing
  pricing: PricingEntry[];
  pricingLoading: boolean;
  getPriceDisplay: (
    planType: "simple" | "individual" | "business",
    billingPeriod?: "monthly" | "yearly"
  ) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: React.ReactNode;
}

export function RegionProvider({ children }: Readonly<RegionProviderProps>) {
  const { i18n } = useTranslation();
  const [isDetecting, setIsDetecting] = useState(true);
  const [region, setRegionState] = useState<RegionCode>(detectUserRegion());

  // Fetch dynamic pricing from API
  const {
    pricing,
    loading: pricingLoading,
    getPriceForPlan,
  } = usePricing(region);

  useEffect(() => {
    // Auto-detect region on mount
    const detectedRegion = detectUserRegion();
    setRegionState(detectedRegion);

    // Only update i18n language if user hasn't manually selected one
    const manualLanguage = storage.getLanguage();
    if (!manualLanguage) {
      const config = getRegionConfig(detectedRegion);
      if (i18n.language !== config.locale) {
        i18n.changeLanguage(config.locale);
      }
    }

    setIsDetecting(false);
  }, [i18n]);

  const setRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    setStoredRegion(newRegion);

    // Only update language if user hasn't manually selected one
    // OR if switching to Brazil (always use PT for Brazil)
    const manualLanguage = storage.getLanguage();
    const config = getRegionConfig(newRegion);

    // Special handling: Brazil always uses pt-BR
    if (newRegion === "BR") {
      i18n.changeLanguage("pt");
      storage.setLanguage("pt");
    }
    // If no manual language choice, sync with region
    else if (!manualLanguage) {
      i18n.changeLanguage(config.locale);
    }
  };

  // Helper function to get price display with API-first, fallback-to-static logic
  const regionConfig = getRegionConfig(region);
  const getPriceDisplay = useCallback(
    (planType: string, billingPeriod: string = "monthly") => {
      // Try to get price from API first
      if (!pricingLoading && pricing.length > 0) {
        const apiPrice = getPriceForPlan(
          planType as "simple" | "individual" | "business",
          region,
          billingPeriod as "monthly" | "yearly"
        );
        if (apiPrice && apiPrice.price) {
          const price = apiPrice.price[billingPeriod as "monthly" | "yearly"];
          const currency = apiPrice.currency;

          // Only proceed if price is defined
          if (price !== undefined && currency) {
            // Format price using Intl.NumberFormat
            try {
              return new Intl.NumberFormat(regionConfig.locale, {
                style: "currency",
                currency: currency,
              }).format(price / 100);
            } catch (e) {
              // Fallback if formatting fails
              return `${currency} ${price}`;
            }
          }
        }
      }
      // Fallback to static pricing from region config
      return (
        regionConfig.priceFormat[
        planType as keyof typeof regionConfig.priceFormat
        ] || "N/A"
      );
    },
    [pricing, pricingLoading, getPriceForPlan, region, regionConfig]
  );

  const value = useMemo(
    () => ({
      region,
      regionConfig,
      availableRegions: getAvailableRegions(),
      setRegion,
      isDetecting,
      pricing,
      pricingLoading,
      getPriceDisplay,
    }),
    [
      region,
      regionConfig,
      isDetecting,
      pricing,
      pricingLoading,
      getPriceDisplay,
    ]
  );

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
