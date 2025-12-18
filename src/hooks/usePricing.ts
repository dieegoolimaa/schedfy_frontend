import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import type { PricingEntry, PricingMatrix } from '../types/models/pricing.interface';

interface UsePricingReturn {
    pricing: PricingEntry[];
    matrix: PricingMatrix | null;
    loading: boolean;
    error: string | null;
    getPriceByRegion: (region: 'PT' | 'BR' | 'US') => Promise<PricingEntry[]>;
    getPriceForPlan: (
        planType: 'simple' | 'individual' | 'business' | 'ai_insights',
        region: 'PT' | 'BR' | 'US',
        billingPeriod?: 'monthly' | 'yearly'
    ) => PricingEntry | null;
    refreshPricing: () => Promise<void>;
}

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
            const data = storage.getPricingCache();
            if (!data) return null;

            const now = Date.now();

            // Check if cache is still valid
            if (now - data.timestamp < CACHE_DURATION) {
                return data.matrix;
            }

            // Cache expired, remove it
            storage.removePricingCache();
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
            storage.setPricingCache(cacheData);
        } catch (err) {
            console.error('Error saving pricing cache:', err);
        }
    }, []);

    // Fetch pricing matrix from API
    const fetchPricingMatrix = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to load from cache first for immediate display
            const cachedMatrix = loadFromCache();
            if (cachedMatrix) {
                setMatrix(cachedMatrix);
                // Show cached data immediately, then revalidate in background
                setLoading(false);
            }

            // Always fetch from API to get fresh data (Stale-While-Revalidate)
            const response = await apiClient.get<PricingMatrix>('/api/pricing/matrix');
            if (response.data) {
                setMatrix(response.data);
                saveToCache(response.data);
            }
        } catch (err) {
            console.error('Error fetching pricing matrix:', err);
            // If we have cached data, don't show error
            const cachedMatrix = loadFromCache();
            if (!cachedMatrix) {
                setError('Failed to load pricing data');
            }
        } finally {
            setLoading(false);
        }
    }, [loadFromCache, saveToCache]); // Removed 'matrix' to prevent infinite loop

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
            planType: 'simple' | 'individual' | 'business' | 'ai_insights',
            regionCode: 'PT' | 'BR' | 'US',
            billingPeriod: 'monthly' | 'yearly' = 'monthly'
        ): PricingEntry | null => {
            if (!matrix) return null;

            const regionData = matrix[regionCode];
            if (!regionData) return null;

            // Backend returns { monthly: { price: ..., displayPrice: ... }, yearly: { price: ..., displayPrice: ... } }
            const planDataRaw: any = regionData[planType];
            if (!planDataRaw) return null;

            // Transform raw backend structure to frontend PricingEntry interface
            const monthlyData = planDataRaw.monthly;
            const yearlyData = planDataRaw.yearly;

            // Use the data for the requested billing period
            const periodData = billingPeriod === 'monthly' ? monthlyData : yearlyData;
            const baseData = periodData || monthlyData || yearlyData;
            if (!baseData) return null;

            return {
                ...baseData,
                // Include displayPrice for the requested billing period
                displayPrice: periodData?.displayPrice || baseData?.displayPrice,
                // Ensure price follows { monthly, yearly } structure expected by consumers
                price: {
                    monthly: monthlyData?.price, // Raw price number from backend
                    yearly: yearlyData?.price,   // Raw price number from backend
                }
            } as PricingEntry;
        },
        [matrix]
    );

    // Refresh pricing data (clear cache and refetch)
    const refreshPricing = useCallback(async () => {
        storage.removePricingCache();
        await fetchPricingMatrix();
    }, [fetchPricingMatrix]);

    // Initial load - only run once on mount
    useEffect(() => {
        fetchPricingMatrix();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Load pricing for specific region if provided
    useEffect(() => {
        if (region && matrix) {
            const regionPricing: PricingEntry[] = [];
            const regionData = matrix[region];

            if (regionData) {
                for (const planData of Object.values(regionData)) {
                    if (planData) regionPricing.push(planData);
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
