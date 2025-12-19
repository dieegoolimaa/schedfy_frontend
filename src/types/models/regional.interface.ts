/**
 * Regional Configuration Types
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

export type RegionCode = 'PT' | 'BR' | 'US';
export type CurrencyCode = 'EUR' | 'BRL' | 'USD';
export type LocaleCode = 'en' | 'en-US' | 'pt-BR' | 'pt-PT';

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

export interface RegionConfig {
    code: RegionCode;
    country: string;
    currency: CurrencyCode;
    currencySymbol: string;
    locale: LocaleCode;
    timezone: string;
    flag: string;
    phonePrefix: string;
    dateFormat: string;
    priceFormat: {
        simple: string;
        individual: string;
        business: string;
    };
}
