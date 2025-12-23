import { apiClient } from "@/lib/api-client";

// ===== Types =====

export interface PublicSettings {
    contact: {
        email: string;
        phone: string;
        whatsapp: string;
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
            zipCode: string;
        };
    };
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
        youtube: string;
        tiktok: string;
    };
    supportHours: {
        timezone: string;
        weekdays: { start: string; end: string };
        saturday: { start: string; end: string };
        sunday: { open: boolean; start: string; end: string };
    };
    company: {
        companyName: string;
    };
    features: {
        showTestimonials: boolean;
        showPricing: boolean;
        showFaq: boolean;
        showBlog: boolean;
        maintenanceMode: boolean;
        maintenanceMessage: string;
    };
    analytics: {
        metaTitle: string;
        metaDescription: string;
    };
}

export interface PublicTestimonial {
    id: string;
    authorName: string;
    authorRole?: string;
    authorLocation?: string;
    content: string;
    rating: number;
    authorAvatar?: string;
    companyName?: string;
}

export interface PaymentMethodConfig {
    id: string;
    name: string | { [lang: string]: string };
    type: string;
    requiresStripe?: boolean;
    stripePaymentMethodType?: string;
    icon?: string;
}

// ===== Service =====

class PlatformPublicService {
    private cachedSettings: PublicSettings | null = null;
    private cachedTestimonials: PublicTestimonial[] | null = null;
    private settingsPromise: Promise<PublicSettings> | null = null;

    /**
     * Get public platform settings (cached)
     */
    async getSettings(): Promise<PublicSettings> {
        // Return cached if available
        if (this.cachedSettings) {
            return this.cachedSettings;
        }

        // Return pending promise if already fetching
        if (this.settingsPromise) {
            return this.settingsPromise;
        }

        // Fetch from API
        this.settingsPromise = this.fetchSettings();
        return this.settingsPromise;
    }

    private async fetchSettings(): Promise<PublicSettings> {
        try {
            const response = await apiClient.get<{ success: boolean; data: PublicSettings }>(
                "/api/platform-settings/public"
            );
            this.cachedSettings = response.data.data;
            return this.cachedSettings;
        } catch (error) {
            console.error("Failed to fetch platform settings:", error);
            // Return default settings on error
            return this.getDefaultSettings();
        } finally {
            this.settingsPromise = null;
        }
    }

    /**
     * Get public testimonials
     */
    async getTestimonials(limit = 10, language = "en"): Promise<PublicTestimonial[]> {
        if (this.cachedTestimonials) {
            return this.cachedTestimonials;
        }

        try {
            const response = await apiClient.get<{ success: boolean; data: PublicTestimonial[] }>(
                `/api/platform-settings/testimonials/public?limit=${limit}&lang=${language}`
            );
            this.cachedTestimonials = response.data.data;
            return this.cachedTestimonials;
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
            return this.getDefaultTestimonials();
        }
    }

    /**
     * Get payment methods for a specific region
     */
    async getPaymentMethods(region: string): Promise<PaymentMethodConfig[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: PaymentMethodConfig[] }>(
                `/api/platform-settings/payment-methods/public?region=${region}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error("Failed to fetch payment methods:", error);
            return [];
        }
    }

    /**
     * Clear cache (useful after language change)
     */
    clearCache(): void {
        this.cachedSettings = null;
        this.cachedTestimonials = null;
    }

    /**
     * Default settings when API is unavailable
     */
    private getDefaultSettings(): PublicSettings {
        return {
            contact: {
                email: "support@schedfy.com",
                phone: "",
                whatsapp: "",
                address: {
                    street: "",
                    city: "Lisbon",
                    state: "",
                    country: "Portugal",
                    zipCode: "",
                },
            },
            socialMedia: {
                facebook: "",
                instagram: "",
                twitter: "",
                linkedin: "",
                youtube: "",
                tiktok: "",
            },
            supportHours: {
                timezone: "Europe/Lisbon",
                weekdays: { start: "09:00", end: "18:00" },
                saturday: { start: "10:00", end: "14:00" },
                sunday: { open: false, start: "", end: "" },
            },
            company: {
                companyName: "Schedfy",
            },
            features: {
                showTestimonials: true,
                showPricing: true,
                showFaq: true,
                showBlog: false,
                maintenanceMode: false,
                maintenanceMessage: "",
            },
            analytics: {
                metaTitle: "Schedfy - Modern Appointment Scheduling",
                metaDescription: "Professional appointment scheduling for businesses worldwide",
            },
        };
    }

    /**
     * Default testimonials when API is unavailable
     */
    private getDefaultTestimonials(): PublicTestimonial[] {
        return [
            {
                id: "1",
                authorName: "Maria Santos",
                authorRole: "Salon Owner",
                authorLocation: "Lisbon, Portugal",
                content: "Schedfy transformed my salon business. I can now manage 3 locations effortlessly.",
                rating: 5,
                authorAvatar: "MS",
            },
            {
                id: "2",
                authorName: "João Silva",
                authorRole: "Dentist",
                authorLocation: "Porto, Portugal",
                content: "The AI insights helped me optimize my schedule and increase revenue by 30%.",
                rating: 5,
                authorAvatar: "JS",
            },
            {
                id: "3",
                authorName: "Ana Costa",
                authorRole: "Personal Trainer",
                authorLocation: "São Paulo, Brazil",
                content: "My clients love the easy booking system. It's professional and reliable.",
                rating: 5,
                authorAvatar: "AC",
            },
        ];
    }
}

export const platformPublicService = new PlatformPublicService();
