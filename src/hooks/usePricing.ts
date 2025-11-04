import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';

export interface PricingEntry {
    _id: string;
    planType: 'simple' | 'individual' | 'business';
    region: 'PT' | 'BR' | 'US';
    billingPeriod: 'monthly' | 'yearly';
    currency: 'EUR' | 'BRL' | 'USD';
    price: number; // in cents
    displayPrice: string; // formatted like "€9.99"
    isActive: boolean;
    isFeatured?: boolean;
    discountPercentage?: number;
    originalPrice?: number;
    features?: string[];
    maxBookings?: number;
    maxProfessionals?: number;
    maxClients?: number;
    maxStorage?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PricingMatrix {
    PT: {
        simple?: { monthly?: PricingEntry; yearly?: PricingEntry };
        individual?: { monthly?: PricingEntry; yearly?: PricingEntry };
        business?: { monthly?: PricingEntry; yearly?: PricingEntry };
    };
    BR: {
        simple?: { monthly?: PricingEntry; yearly?: PricingEntry };
        individual?: { monthly?: PricingEntry; yearly?: PricingEntry };
        business?: { monthly?: PricingEntry; yearly?: PricingEntry };
    };
    US: {
        simple?: { monthly?: PricingEntry; yearly?: PricingEntry };
        individual?: { monthly?: PricingEntry; yearly?: PricingEntry };
        business?: { monthly?: PricingEntry; yearly?: PricingEntry };
    };
}

interface UsePricingReturn {
    pricing: PricingEntry[];
    matrix: PricingMatrix | null;
    loading: boolean;
    error: string | null;
    getPriceByRegion: (region: 'PT' | 'BR' | 'US') => Promise<PricingEntry[]>;
    getPriceForPlan: (
        planType: 'simple' | 'individual' | 'business',
        region: 'PT' | 'BR' | 'US',
        billingPeriod?: 'monthly' | 'yearly'
    ) => PricingEntry | null;
    refreshPricing: () => Promise<void>;
}

const CACHE_KEY = 'schedfy-pricing-cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CacheData {
    matrix: PricingMatrix;
    timestamp: number;
}

/**
 * Hook to fetch and manage pricing data from the backend API
 * Includes caching to reduce API calls
 */
export function usePricing(region?: 'PT' | 'BR' | 'US'): UsePricingReturn {
    const [pricing, setPricing] = useState<PricingEntry[]>([]);
    const [matrix, setMatrix] = useState<PricingMatrix | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load cached pricing matrix
    const loadFromCache = useCallback((): PricingMatrix | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const data: CacheData = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - data.timestamp < CACHE_DURATION) {
                return data.matrix;
            }

            // Cache expired, remove it
            localStorage.removeItem(CACHE_KEY);
            return null;
        } catch (err) {
            console.error('Error loading pricing cache:', err);
            return null;
        }
    }, []);

    // Save pricing matrix to cache
    const saveToCache = useCallback((matrixData: PricingMatrix) => {
        try {
            const cacheData: CacheData = {
                matrix: matrixData,
                timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (err) {
            console.error('Error saving pricing cache:', err);
        }
    }, []);

    // Fetch pricing matrix from API
    const fetchPricingMatrix = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to load from cache first
            const cachedMatrix = loadFromCache();
            if (cachedMatrix) {
                setMatrix(cachedMatrix);
                setLoading(false);
                return;
            }

            // Fetch from API
            const response = await apiClient.get<PricingMatrix>('/api/pricing/matrix');
            if (response.data) {
                setMatrix(response.data);
                saveToCache(response.data);
            }
        } catch (err) {
            console.error('Error fetching pricing matrix:', err);
            setError('Failed to load pricing data');

            // Fallback to cached data even if expired
            const cachedMatrix = loadFromCache();
            if (cachedMatrix) {
                setMatrix(cachedMatrix);
            }
        } finally {
            setLoading(false);
        }
    }, [loadFromCache, saveToCache]);

    // Fetch pricing by region
    const getPriceByRegion = useCallback(async (regionCode: 'PT' | 'BR' | 'US'): Promise<PricingEntry[]> => {
        try {
            const response = await apiClient.get<PricingEntry[]>(`/api/pricing/region/${regionCode}`);
            return response.data || [];
        } catch (err) {
            console.error(`Error fetching pricing for region ${regionCode}:`, err);
            return [];
        }
    }, []);

    // Get price for specific plan from matrix
    const getPriceForPlan = useCallback(
        (
            planType: 'simple' | 'individual' | 'business',
            regionCode: 'PT' | 'BR' | 'US',
            billingPeriod: 'monthly' | 'yearly' = 'monthly'
        ): PricingEntry | null => {
            if (!matrix) return null;

            const regionData = matrix[regionCode];
            if (!regionData) return null;

            const planData = regionData[planType];
            if (!planData) return null;

            return planData[billingPeriod] || null;
        },
        [matrix]
    );

    // Refresh pricing data (clear cache and refetch)
    const refreshPricing = useCallback(async () => {
        localStorage.removeItem(CACHE_KEY);
        await fetchPricingMatrix();
    }, [fetchPricingMatrix]);

    // Initial load
    useEffect(() => {
        fetchPricingMatrix();
    }, [fetchPricingMatrix]);

    // Load pricing for specific region if provided
    useEffect(() => {
        if (region && matrix) {
            const regionPricing: PricingEntry[] = [];
            const regionData = matrix[region];

            if (regionData) {
                for (const planData of Object.values(regionData)) {
                    if (planData?.monthly) regionPricing.push(planData.monthly);
                    if (planData?.yearly) regionPricing.push(planData.yearly);
                }
            }

            setPricing(regionPricing);
        }
    }, [region, matrix]);

    return {
        pricing,
        matrix,
        loading,
        error,
        getPriceByRegion,
        getPriceForPlan,
        refreshPricing,
    };
}
