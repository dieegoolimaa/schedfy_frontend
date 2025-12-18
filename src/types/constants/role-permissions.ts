import { UserRole } from '../enums/user-role.enum';

export const PERMISSIONS = {
    // --- PLATFORM (ADMIN) RESOURCES ---
    PLATFORM_USERS: {
        VIEW: 'platform_users:view',
        CREATE: 'platform_users:create',
        EDIT: 'platform_users:edit',
        DELETE: 'platform_users:delete',
        MANAGE: 'platform_users:manage', // Implies all above
    },
    ENTITIES: {
        VIEW: 'entities:view',
        CREATE: 'entities:create',
        EDIT: 'entities:edit',
        DELETE: 'entities:delete',
        MANAGE: 'entities:manage',
        IMPERSONATE: 'entities:impersonate',
    },
    SUBSCRIPTIONS: {
        VIEW: 'subscriptions:view',
        EDIT: 'subscriptions:edit',
        MANAGE: 'subscriptions:manage',
    },
    PLATFORM_FINANCE: {
        VIEW: 'platform_finance:view',
        MANAGE: 'platform_finance:manage',
    },
    PLATFORM_LOGS: {
        VIEW: 'platform_logs:view',
    },

    // --- ENTITY (CLIENT) RESOURCES ---
    BOOKINGS: {
        VIEW: 'bookings:view',
        VIEW_OWN: 'bookings:view_own', // Only own bookings
        CREATE: 'bookings:create',
        EDIT: 'bookings:edit',
        EDIT_OWN: 'bookings:edit_own',
        DELETE: 'bookings:delete',
        MANAGE: 'bookings:manage',
    },
    SERVICES: {
        VIEW: 'services:view',
        MANAGE: 'services:manage',
    },
    CLIENTS: {
        VIEW: 'clients:view',
        MANAGE: 'clients:manage',
    },
    ENTITY_USERS: {
        VIEW: 'entity_users:view',
        MANAGE: 'entity_users:manage',
    },
    ENTITY_FINANCE: {
        VIEW: 'entity_finance:view',
        MANAGE: 'entity_finance:manage',
    },
    SCHEDULE: {
        VIEW: 'schedule:view',
        MANAGE: 'schedule:manage',
    },
};

/**
 * Default permissions for each role.
 * User permissions can be customized on top of these defaults.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
    // --- PLATFORM ROLES ---
    [UserRole.PLATFORM_SUPER_ADMIN]: ['*'], // Access to EVERYTHING

    [UserRole.PLATFORM_MANAGER]: [
        PERMISSIONS.PLATFORM_USERS.MANAGE,
        PERMISSIONS.ENTITIES.MANAGE,
        PERMISSIONS.SUBSCRIPTIONS.MANAGE,
        PERMISSIONS.PLATFORM_FINANCE.VIEW,
        PERMISSIONS.PLATFORM_LOGS.VIEW,
    ],

    [UserRole.PLATFORM_RH]: [
        PERMISSIONS.PLATFORM_USERS.MANAGE, // Hire/Fire internal staff
    ],

    [UserRole.PLATFORM_FINANCE]: [
        PERMISSIONS.PLATFORM_FINANCE.MANAGE,
        PERMISSIONS.SUBSCRIPTIONS.MANAGE,
        PERMISSIONS.ENTITIES.VIEW, // Need to see who pays
    ],

    [UserRole.PLATFORM_OPERATIONAL]: [
        PERMISSIONS.ENTITIES.VIEW,
        PERMISSIONS.ENTITIES.EDIT, // Reset passwords, fix configs
        PERMISSIONS.ENTITIES.IMPERSONATE, // Support
        PERMISSIONS.PLATFORM_LOGS.VIEW,
        PERMISSIONS.BOOKINGS.VIEW, // Debugging client issues
    ],

    // --- ENTITY ROLES ---
    [UserRole.ENTITY_OWNER]: ['*'], // Access to EVERYTHING within the Entity

    [UserRole.ENTITY_ADMIN]: [
        PERMISSIONS.BOOKINGS.MANAGE,
        PERMISSIONS.SERVICES.MANAGE,
        PERMISSIONS.CLIENTS.MANAGE,
        PERMISSIONS.ENTITY_USERS.MANAGE,
        PERMISSIONS.SCHEDULE.MANAGE,
        PERMISSIONS.ENTITY_FINANCE.VIEW, // Often Admins can see but not withdraw
    ],

    [UserRole.ENTITY_PROFESSIONAL]: [
        PERMISSIONS.BOOKINGS.VIEW_OWN,
        PERMISSIONS.BOOKINGS.CREATE, // Standard for professionals to book themselves
        PERMISSIONS.BOOKINGS.EDIT_OWN,
        PERMISSIONS.SCHEDULE.MANAGE, // Manage own schedule availability
        PERMISSIONS.CLIENTS.VIEW, // View clients they appoint with
        PERMISSIONS.SERVICES.VIEW,
    ],
};
