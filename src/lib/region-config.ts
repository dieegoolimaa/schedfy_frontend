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
        locale: 'pt-PT',
        timezone: 'Europe/Lisbon',
        flag: '🇵🇹',
        phonePrefix: '+351',
        dateFormat: 'DD/MM/YYYY',
        priceFormat: {
            simple: '€14,90',
            individual: '€34,90',
            business: '€89,90',
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
            simple: 'R$ 59,90',
            individual: 'R$ 129,90',
            business: 'R$ 349,90',
        },
    },
    US: {
        code: 'US',
        country: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        locale: 'en-US',
        timezone: 'America/New_York',
        flag: '🇺🇸',
        phonePrefix: '+1',
        dateFormat: 'MM/DD/YYYY',
        priceFormat: {
            simple: '$14.90',
            individual: '$34.90',
            business: '$89.90',
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
 * Format price/currency based on region
 */
export function formatPrice(amount: number, currency?: string, region?: RegionCode): string {
    const config = getRegionConfig(region);

    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currency || config.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date based on region (short format: DD/MM/YYYY or MM/DD/YYYY)
 */
export function formatDate(date: Date | string, region?: RegionCode): string {
    const config = getRegionConfig(region);
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '-';

    return new Intl.DateTimeFormat(config.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(dateObj);
}

/**
 * Format date with time based on region
 */
export function formatDateTime(date: Date | string, region?: RegionCode): string {
    const config = getRegionConfig(region);
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '-';

    return new Intl.DateTimeFormat(config.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
}

/**
 * Format date in long format (e.g., "19 de dezembro de 2024")
 */
export function formatDateLong(date: Date | string, region?: RegionCode): string {
    const config = getRegionConfig(region);
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '-';

    return new Intl.DateTimeFormat(config.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj);
}

/**
 * Format relative date (e.g., "há 2 dias", "in 3 hours")
 */
export function formatRelativeDate(date: Date | string, region?: RegionCode): string {
    const config = getRegionConfig(region);
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '-';

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(config.locale, { numeric: 'auto' });

    if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'day');
    }
    if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hour');
    }
    if (Math.abs(diffMins) >= 1) {
        return rtf.format(diffMins, 'minute');
    }
    return rtf.format(diffSecs, 'second');
}

/**
 * Format number based on region
 */
export function formatNumber(value: number, region?: RegionCode): string {
    const config = getRegionConfig(region);
    return new Intl.NumberFormat(config.locale).format(value);
}

/**
 * Format percentage based on region
 */
export function formatPercent(value: number, region?: RegionCode): string {
    const config = getRegionConfig(region);
    return new Intl.NumberFormat(config.locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value);
}

/**
 * Get the locale string for the current region
 */
export function getLocale(region?: RegionCode): string {
    return getRegionConfig(region).locale;
}

/**
 * Get the currency code for the current region
 */
export function getCurrency(region?: RegionCode): CurrencyCode {
    return getRegionConfig(region).currency;
}

/**
 * Get all available regions for selection
 */
export function getAvailableRegions(): RegionConfig[] {
    return Object.values(REGIONS);
}
