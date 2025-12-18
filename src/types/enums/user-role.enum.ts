/**
 * Papel/Função de um usuário no sistema
 * 
 * Define hierarquia de permissões e acesso
 * 
 * @enum {string}
 */
export enum UserRole {
    // --- SCHEDFY ADMIN ROLES ---
    /** Super Admin: Acesso total irrestrito (Diego Fernandes) */
    PLATFORM_SUPER_ADMIN = 'platform_super_admin',

    /** Manager: Gerencia times e atribui acessos (abaixo do Super Admin) */
    PLATFORM_MANAGER = 'platform_manager',

    /** RH: Gestão de pessoas/contratações interna */
    PLATFORM_RH = 'platform_rh',

    /** Financeiro: Gestão financeira da plataforma */
    PLATFORM_FINANCE = 'platform_finance',

    /** Operacional: Dia a dia da plataforma (suporte, verificações) */
    PLATFORM_OPERATIONAL = 'platform_operational',

    // --- SCHEDFY FRONTEND (CLIENT) ROLES ---
    /** Owner: Dono da entidade/negócio (Acesso total na entidade) */
    ENTITY_OWNER = 'owner',

    /** Admin: Administrador da entidade (Acessos atribuídos pelo Owner) */
    ENTITY_ADMIN = 'admin',

    /** Profissional: Gerencia agendamentos e serviços */
    ENTITY_PROFESSIONAL = 'professional',
}

/**
 * Roles válidos para usuários da plataforma admin (Schedfy Admin)
 */
export const ADMIN_PLATFORM_ROLES: UserRole[] = [
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.PLATFORM_MANAGER,
    UserRole.PLATFORM_RH,
    UserRole.PLATFORM_FINANCE,
    UserRole.PLATFORM_OPERATIONAL,
];

/**
 * Roles válidos para usuários de entities/clientes (Schedfy Frontend)
 */
export const CLIENT_PLATFORM_ROLES: UserRole[] = [
    UserRole.ENTITY_OWNER,
    UserRole.ENTITY_ADMIN,
    UserRole.ENTITY_PROFESSIONAL,
];

/**
 * Hierarquia de roles (do maior para o menor poder)
 */
export const USER_ROLE_HIERARCHY = [
    // Platform
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.PLATFORM_MANAGER,
    UserRole.PLATFORM_FINANCE, // Assumindo financeiro > RH > Operacional
    UserRole.PLATFORM_RH,
    UserRole.PLATFORM_OPERATIONAL,

    // Client
    UserRole.ENTITY_OWNER,
    UserRole.ENTITY_ADMIN,
    UserRole.ENTITY_PROFESSIONAL,
];

/**
 * Verifica se um role tem permissão maior ou igual a outro
 */
export function hasRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const userIndex = USER_ROLE_HIERARCHY.indexOf(userRole);
    const requiredIndex = USER_ROLE_HIERARCHY.indexOf(requiredRole);
    return userIndex <= requiredIndex;
}

/**
 * Valida se um role é válido para um platform específico
 * 
 * @param role - Role do usuário
 * @param platform - Platform context (admin ou client)
 * @returns true se o role é válido para o platform
 */
export function isRoleValidForPlatform(
    role: UserRole,
    platform: 'admin' | 'client',
): boolean {
    if (platform === 'admin') {
        return ADMIN_PLATFORM_ROLES.includes(role);
    }
    return CLIENT_PLATFORM_ROLES.includes(role);
}
