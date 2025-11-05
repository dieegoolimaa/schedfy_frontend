/**
 * Platform Context Enum
 * 
 * Defines the platform context for users:
 * - ADMIN: Users who manage the Schedfy platform (schedfy_admin)
 * - CLIENT: Users who use the platform (entity owners, managers, professionals, etc.) (schedfy_frontend)
 */
export enum PlatformContext {
    ADMIN = 'admin',
    CLIENT = 'client',
}

export const PLATFORM_LABELS: Record<PlatformContext, string> = {
    [PlatformContext.ADMIN]: 'Administração',
    [PlatformContext.CLIENT]: 'Cliente',
};
