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

    clearAuth: () => {
        storage.removeToken();
        storage.removeRefreshToken();
        storage.removeUser();
    }
};
