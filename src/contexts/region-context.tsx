import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RegionCode,
  RegionConfig,
  detectUserRegion,
  getRegionConfig,
  setUserRegion as setStoredRegion,
  getAvailableRegions,
} from '../lib/region-config';

interface RegionContextType {
  region: RegionCode;
  regionConfig: RegionConfig;
  availableRegions: RegionConfig[];
  setRegion: (region: RegionCode) => void;
  isDetecting: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: React.ReactNode;
}

export function RegionProvider({ children }: Readonly<RegionProviderProps>) {
  const { i18n } = useTranslation();
  const [isDetecting, setIsDetecting] = useState(true);
  const [region, setRegionState] = useState<RegionCode>(detectUserRegion());

  useEffect(() => {
    // Auto-detect region on mount
    const detectedRegion = detectUserRegion();
    setRegionState(detectedRegion);
    
    // Update i18n language based on region
    const config = getRegionConfig(detectedRegion);
    if (i18n.language !== config.locale) {
      i18n.changeLanguage(config.locale);
    }
    
    setIsDetecting(false);
  }, [i18n]);

  const setRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    setStoredRegion(newRegion);
    
    // Update i18n language
    const config = getRegionConfig(newRegion);
    i18n.changeLanguage(config.locale);
  };

  const value = useMemo(
    () => ({
      region,
      regionConfig: getRegionConfig(region),
      availableRegions: getAvailableRegions(),
      setRegion,
      isDetecting,
    }),
    [region, isDetecting]
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
