/**
 * Regional Configuration for Frontend
 * 
 * Provides country/region-specific configuration
 */

export enum SupportedRegion {
    PORTUGAL = 'PT',
    BRAZIL = 'BR',
    UNITED_STATES = 'US',
    SPAIN = 'ES',
    FRANCE = 'FR',
    UNITED_KINGDOM = 'GB',
}

export enum SupportedLanguage {
    PORTUGUESE_PT = 'pt-PT',
    PORTUGUESE_BR = 'pt-BR',
    ENGLISH_US = 'en-US',
    ENGLISH_GB = 'en-GB',
    SPANISH = 'es-ES',
    FRENCH = 'fr-FR',
}

export interface RegionalConfig {
    code: SupportedRegion;
    name: string;
    language: SupportedLanguage;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    phonePrefix: string;
    supportEmail: string;
    supportPhone: string;
}

export const REGIONAL_CONFIGS: Record<SupportedRegion, RegionalConfig> = {
    [SupportedRegion.PORTUGAL]: {
        code: SupportedRegion.PORTUGAL,
        name: 'Portugal',
        language: SupportedLanguage.PORTUGUESE_PT,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        phonePrefix: '+351',
        supportEmail: 'suporte@schedfy.pt',
        supportPhone: '+351 XXX XXX XXX',
    },
    [SupportedRegion.BRAZIL]: {
        code: SupportedRegion.BRAZIL,
        name: 'Brasil',
        language: SupportedLanguage.PORTUGUESE_BR,
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        phonePrefix: '+55',
        supportEmail: 'suporte@schedfy.com.br',
        supportPhone: '+55 XX XXXXX-XXXX',
    },
    [SupportedRegion.UNITED_STATES]: {
        code: SupportedRegion.UNITED_STATES,
        name: 'United States',
        language: SupportedLanguage.ENGLISH_US,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        phonePrefix: '+1',
        supportEmail: 'support@schedfy.com',
        supportPhone: '+1 XXX XXX XXXX',
    },
    [SupportedRegion.SPAIN]: {
        code: SupportedRegion.SPAIN,
        name: 'España',
        language: SupportedLanguage.SPANISH,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        phonePrefix: '+34',
        supportEmail: 'soporte@schedfy.es',
        supportPhone: '+34 XXX XXX XXX',
    },
    [SupportedRegion.FRANCE]: {
        code: SupportedRegion.FRANCE,
        name: 'France',
        language: SupportedLanguage.FRENCH,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        phonePrefix: '+33',
        supportEmail: 'support@schedfy.fr',
        supportPhone: '+33 X XX XX XX XX',
    },
    [SupportedRegion.UNITED_KINGDOM]: {
        code: SupportedRegion.UNITED_KINGDOM,
        name: 'United Kingdom',
        language: SupportedLanguage.ENGLISH_GB,
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        phonePrefix: '+44',
        supportEmail: 'support@schedfy.co.uk',
        supportPhone: '+44 XXXX XXX XXX',
    },
};

/**
 * Get regional configuration by region code
 */
export function getRegionalConfig(region: SupportedRegion): RegionalConfig {
    return REGIONAL_CONFIGS[region];
}

/**
 * Detect region from browser language
 */
export function detectRegion(): SupportedRegion {
    const browserLang = navigator.language || 'en-US';

    const langMap: Record<string, SupportedRegion> = {
        'pt-PT': SupportedRegion.PORTUGAL,
        'pt': SupportedRegion.PORTUGAL,
        'pt-BR': SupportedRegion.BRAZIL,
        'en-US': SupportedRegion.UNITED_STATES,
        'en': SupportedRegion.UNITED_STATES,
        'en-GB': SupportedRegion.UNITED_KINGDOM,
        'es': SupportedRegion.SPAIN,
        'es-ES': SupportedRegion.SPAIN,
        'fr': SupportedRegion.FRANCE,
        'fr-FR': SupportedRegion.FRANCE,
    };

    return langMap[browserLang] || SupportedRegion.UNITED_STATES;
}
