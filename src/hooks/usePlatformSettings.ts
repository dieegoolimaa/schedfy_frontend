import { useQuery } from "@tanstack/react-query";
import { platformPublicService, PublicSettings, PublicTestimonial } from "../services/platform-public.service";
import { useAuth } from "../contexts/auth-context";

/**
 * Hook to get public platform settings
 */
export function usePlatformSettings() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["platform-settings-public"],
        queryFn: () => platformPublicService.getSettings(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache
    });

    return {
        settings: data,
        isLoading,
        error,
        // Helper getters
        contact: data?.contact,
        socialMedia: data?.socialMedia,
        supportHours: data?.supportHours,
        company: data?.company,
        features: data?.features,
        analytics: data?.analytics,
    };
}

/**
 * Hook to get public testimonials
 */
export function usePublicTestimonials(limit = 10, language = "en") {
    const { data, isLoading, error } = useQuery({
        queryKey: ["platform-testimonials-public", limit, language],
        queryFn: () => platformPublicService.getTestimonials(limit, language),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache
    });

    return {
        testimonials: data || [],
        isLoading,
        error,
    };
}

/**
 * Hook to check feature flags
 */
export function usePlatformFeatures() {
    const { settings, isLoading } = usePlatformSettings();

    return {
        isLoading,
        showTestimonials: settings?.features?.showTestimonials ?? true,
        showPricing: settings?.features?.showPricing ?? true,
        showFaq: settings?.features?.showFaq ?? true,
        showBlog: settings?.features?.showBlog ?? false,
        maintenanceMode: settings?.features?.maintenanceMode ?? false,
        maintenanceMessage: settings?.features?.maintenanceMessage ?? "",
    };
}

/**
 * Payment method from API
 */
export interface PaymentMethodConfig {
    id: string;
    name: string | { [lang: string]: string };
    type: string;
    requiresStripe?: boolean;
    icon?: string;
}

/**
 * Hook to get payment methods for a specific region
 * Fetches from backend API for dynamic configuration
 */
export function usePaymentMethods(region?: string) {
    const { entity } = useAuth();
    // Use entity's region or default to PT
    const regionCode = region || entity?.country || 'PT';

    const { data, isLoading, error } = useQuery({
        queryKey: ["payment-methods", regionCode],
        queryFn: async () => {
            const response = await platformPublicService.getPaymentMethods(regionCode);
            return response;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache
    });

    // Provide fallback methods if API fails
    const fallbackMethods: PaymentMethodConfig[] = getFallbackPaymentMethods(regionCode);

    return {
        methods: data || fallbackMethods,
        isLoading,
        error,
        region: regionCode,
    };
}

/**
 * Fallback payment methods if API is unavailable
 */
function getFallbackPaymentMethods(region: string): PaymentMethodConfig[] {
    switch (region) {
        case 'BR':
            return [
                { id: 'pix', name: 'PIX', type: 'pix' },
                { id: 'card', name: 'Cartão', type: 'card', requiresStripe: true },
                { id: 'boleto', name: 'Boleto', type: 'boleto', requiresStripe: true },
                { id: 'cash', name: 'Dinheiro', type: 'cash' },
            ];
        case 'PT':
            return [
                { id: 'card', name: 'Cartão', type: 'card', requiresStripe: true },
                { id: 'mbway', name: 'MB WAY', type: 'mbway', requiresStripe: true },
                { id: 'multibanco', name: 'Multibanco', type: 'multibanco', requiresStripe: true },
                { id: 'cash', name: 'Dinheiro', type: 'cash' },
            ];
        case 'US':
            return [
                { id: 'card', name: 'Card', type: 'card', requiresStripe: true },
                { id: 'bank_transfer', name: 'Bank Transfer', type: 'bank_transfer' },
                { id: 'cash', name: 'Cash', type: 'cash' },
            ];
        default:
            return [
                { id: 'card', name: 'Card', type: 'card', requiresStripe: true },
                { id: 'cash', name: 'Cash', type: 'cash' },
            ];
    }
}
