export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'schedfy-access-token',
    REFRESH_TOKEN: 'schedfy-refresh-token',
    TOKEN: 'schedfy-token',
    USER: 'schedfy-user',
    LANGUAGE: 'schedfy-language',
    THEME: 'schedfy-ui-theme',
    PRICING_CACHE: 'schedfy-pricing-cache',
    REGION: 'schedfy-region',
    LOCALE: 'schedfy-locale',
    // Registration/Onboarding persistence
    REGISTRATION_DATA: 'schedfy-registration-data',
    REGISTRATION_STEP: 'schedfy-registration-step',
    ONBOARDING_DATA: 'schedfy-onboarding-data',
    ONBOARDING_STEP: 'schedfy-onboarding-step',
    PENDING_VERIFICATION: 'schedfy-pending-verification',
} as const;

export const storage = {
    getToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN),
    setToken: (token: string) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },
    removeToken: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    setRefreshToken: (token: string) => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
    removeRefreshToken: () => localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),

    getUser: () => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    },
    setUser: (user: any) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
    removeUser: () => localStorage.removeItem(STORAGE_KEYS.USER),

    getLanguage: () => localStorage.getItem(STORAGE_KEYS.LANGUAGE),
    setLanguage: (lang: string) => localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang),

    getRegion: () => localStorage.getItem(STORAGE_KEYS.REGION),
    setRegion: (region: string) => localStorage.setItem(STORAGE_KEYS.REGION, region),

    getLocale: () => localStorage.getItem(STORAGE_KEYS.LOCALE),
    setLocale: (locale: string) => localStorage.setItem(STORAGE_KEYS.LOCALE, locale),

    getTheme: () => localStorage.getItem(STORAGE_KEYS.THEME),
    setTheme: (theme: string) => localStorage.setItem(STORAGE_KEYS.THEME, theme),

    getPricingCache: () => {
        const cache = localStorage.getItem(STORAGE_KEYS.PRICING_CACHE);
        return cache ? JSON.parse(cache) : null;
    },
    setPricingCache: (data: any) => localStorage.setItem(STORAGE_KEYS.PRICING_CACHE, JSON.stringify(data)),
    removePricingCache: () => localStorage.removeItem(STORAGE_KEYS.PRICING_CACHE),

    // Registration data persistence
    getRegistrationData: () => {
        const data = localStorage.getItem(STORAGE_KEYS.REGISTRATION_DATA);
        return data ? JSON.parse(data) : null;
    },
    setRegistrationData: (data: any) => localStorage.setItem(STORAGE_KEYS.REGISTRATION_DATA, JSON.stringify(data)),
    removeRegistrationData: () => localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DATA),

    getRegistrationStep: () => {
        const step = localStorage.getItem(STORAGE_KEYS.REGISTRATION_STEP);
        return step ? parseInt(step, 10) : 1;
    },
    setRegistrationStep: (step: number) => localStorage.setItem(STORAGE_KEYS.REGISTRATION_STEP, step.toString()),
    removeRegistrationStep: () => localStorage.removeItem(STORAGE_KEYS.REGISTRATION_STEP),

    // Onboarding data persistence
    getOnboardingData: () => {
        const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
        return data ? JSON.parse(data) : null;
    },
    setOnboardingData: (data: any) => localStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data)),
    removeOnboardingData: () => localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA),

    getOnboardingStep: () => {
        const step = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
        return step ? parseInt(step, 10) : 1;
    },
    setOnboardingStep: (step: number) => localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString()),
    removeOnboardingStep: () => localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP),

    // Pending verification (email + expiry)
    getPendingVerification: () => {
        const data = localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION);
        if (!data) return null;
        const parsed = JSON.parse(data);
        // Check if expired (10 minutes)
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
            localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION);
            return null;
        }
        return parsed;
    },
    setPendingVerification: (email: string, step: number) => {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
        localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify({ email, step, expiresAt }));
    },
    removePendingVerification: () => localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION),

    // Clear registration/onboarding data on completion
    clearRegistrationFlow: () => {
        storage.removeRegistrationData();
        storage.removeRegistrationStep();
        storage.removePendingVerification();
    },
    clearOnboardingFlow: () => {
        storage.removeOnboardingData();
        storage.removeOnboardingStep();
    },

    clearAuth: () => {
        storage.removeToken();
        storage.removeRefreshToken();
        storage.removeUser();
    }
};
