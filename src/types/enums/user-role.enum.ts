export enum UserRole {
    /** Administrador da plataforma Schedfy (acesso total) */
    PLATFORM_ADMIN = 'platform_admin',

    /** Dono da entidade (empresa ou profissional individual) */
    OWNER = 'owner',

    /** Administrador da entidade */
    ADMIN = 'admin',

    /** Gerente/Manager da entidade */
    MANAGER = 'manager',

    /** Recursos Humanos */
    HR = 'hr',

    /** Atendente/Recepcionista */
    ATTENDANT = 'attendant',

    /** Profissional que presta serviços */
    PROFESSIONAL = 'professional',
}

