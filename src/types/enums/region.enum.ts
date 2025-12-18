/**
 * Região/País suportado pela plataforma
 *
 * Usado em: User, Entity, Pricing
 *
 * @enum {string}
 */
export enum Region {
    /** Portugal */
    PORTUGAL = 'PT',

    /** Brasil */
    BRAZIL = 'BR',

    /** Estados Unidos */
    USA = 'US',
}

/**
 * Mapeamento de região para moeda padrão
 */
export const REGION_CURRENCY_MAP: Record<Region, string> = {
    [Region.PORTUGAL]: 'EUR',
    [Region.BRAZIL]: 'BRL',
    [Region.USA]: 'USD',
};

/**
 * Mapeamento de região para timezone padrão
 */
export const REGION_TIMEZONE_MAP: Record<Region, string> = {
    [Region.PORTUGAL]: 'Europe/Lisbon',
    [Region.BRAZIL]: 'America/Sao_Paulo',
    [Region.USA]: 'America/New_York',
};

/**
 * Mapeamento de região para locale padrão
 */
export const REGION_LOCALE_MAP: Record<Region, string> = {
    [Region.PORTUGAL]: 'pt-PT',
    [Region.BRAZIL]: 'pt-BR',
    [Region.USA]: 'en-US',
};
