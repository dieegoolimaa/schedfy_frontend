/**
 * Region Configuration
 * Handles country/region detection, currency, language, and localization
 */

import type {
    RegionCode,
    CurrencyCode,
    LocaleCode,
    RegionConfig
} from '../types/models/regional.interface';
import { storage } from './storage';

export type { RegionCode, CurrencyCode, LocaleCode, RegionConfig };

export const REGIONS: Record<RegionCode, RegionConfig> = {
    PT: {
        code: 'PT',
        country: 'Portugal',
        currency: 'EUR',
        currencySymbol: '€',
        locale: 'en',
        timezone: 'Europe/Lisbon',
        flag: '🇵🇹',
        phonePrefix: '+351',
        dateFormat: 'DD/MM/YYYY',
        priceFormat: {
            simple: '€9.99',
            individual: '€19.99',
            business: '€49.99',
        },
    },
    BR: {
        code: 'BR',
        country: 'Brazil',
        currency: 'BRL',
        currencySymbol: 'R$',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        flag: '🇧🇷',
        phonePrefix: '+55',
        dateFormat: 'DD/MM/YYYY',
        priceFormat: {
            simple: 'R$ 49,90',
            individual: 'R$ 99,90',
            business: 'R$ 249,90',
        },
    },
    US: {
        code: 'US',
        country: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        locale: 'en',
        timezone: 'America/New_York',
        flag: '🇺🇸',
        phonePrefix: '+1',
        dateFormat: 'MM/DD/YYYY',
        priceFormat: {
            simple: '$9.99',
            individual: '$19.99',
            business: '$49.99',
        },
    },
};

/**
 * Detect user's region based on browser/system settings
 */
export function detectUserRegion(): RegionCode {
    // 1. Check localStorage first (user preference) - HIGHEST PRIORITY
    const stored = storage.getRegion() as RegionCode;
    if (stored && REGIONS[stored]) {
        return stored;
    }

    // 2. Try to detect from browser language
    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith('pt-br')) {
        return 'BR';
    }

    if (browserLang.startsWith('pt-pt') || browserLang === 'pt') {
        return 'PT';
    }

    // 3. Try to detect from timezone
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (timezone.includes('Sao_Paulo') || timezone.includes('Brasilia') || timezone.includes('Recife') || timezone.includes('Manaus')) {
            return 'BR';
        }

        if (timezone.includes('Lisbon') || timezone.includes('Porto') || timezone.includes('Madeira') || timezone.includes('Azores')) {
            return 'PT';
        }

        // European timezones that are not specifically Portuguese should default to PT
        if (timezone.startsWith('Europe/')) {
            return 'PT';
        }

        if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago') || timezone.startsWith('America/')) {
            // Only use US for English-speaking Americas
            if (browserLang.startsWith('en')) {
                return 'US';
            }
        }
    } catch (e) {
        console.warn('Failed to detect timezone', e);
    }

    // 4. Default to Portugal (where the business is based)
    return 'PT';
}

/**
 * Get region configuration
 */
export function getRegionConfig(region?: RegionCode): RegionConfig {
    const code = region || detectUserRegion();
    return REGIONS[code];
}

/**
 * Set user's preferred region
 */
export function setUserRegion(region: RegionCode): void {
    storage.setRegion(region);

    // Update i18n locale
    const config = REGIONS[region];
    storage.setLocale(config.locale);

    // Trigger storage event for other tabs
    globalThis.dispatchEvent(new StorageEvent('storage', {
        key: 'schedfy-region',
        newValue: region,
    }));
}

/**
 * Format price based on region
 */
export function formatPrice(amount: number, region?: RegionCode): string {
    const config = getRegionConfig(region);

    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date based on region
 */
export function formatDate(date: Date | string, region?: RegionCode): string {
    const config = getRegionConfig(region);
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(config.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(dateObj);
}

/**
 * Get all available regions for selection
 */
export function getAvailableRegions(): RegionConfig[] {
    return Object.values(REGIONS);
}
