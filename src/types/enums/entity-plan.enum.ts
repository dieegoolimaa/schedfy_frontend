/**
 * Plano/Pacote de uma entidade
 *
 * Define recursos e limites disponíveis
 *
 * @enum {string}
 */
export enum EntityPlan {
    /** Plano simples - profissional individual sem equipe */
    SIMPLE = 'simple',

    /** Plano simples com agendamentos ilimitados */
    SIMPLE_UNLIMITED = 'simple_unlimited',

    /** Plano individual - profissional individual com recursos avançados */
    INDIVIDUAL = 'individual',

    /** Plano business - empresa com múltiplos profissionais */
    BUSINESS = 'business',
}

/**
 * Limites por plano
 *
 * Simple/Simple_Unlimited: Profissionais ilimitados, SEM clientes fidelizados
 * Individual: 1 profissional, clientes ilimitados
 * Business: Profissionais ilimitados, clientes ilimitados
 */
export const PLAN_LIMITS = {
    [EntityPlan.SIMPLE]: {
        maxProfessionals: Infinity,
        maxServices: 10,
        maxClients: 0,
        hasTeamManagement: true,
        hasAdvancedReports: false,
        hasCustomBranding: false,
        hasClientManagement: false,
    },
    [EntityPlan.SIMPLE_UNLIMITED]: {
        maxProfessionals: Infinity,
        maxServices: 10,
        maxClients: 0,
        hasTeamManagement: true,
        hasAdvancedReports: false,
        hasCustomBranding: false,
        hasClientManagement: false,
    },
    [EntityPlan.INDIVIDUAL]: {
        maxProfessionals: 1,
        maxServices: 50,
        maxClients: Infinity,
        hasTeamManagement: false,
        hasAdvancedReports: true,
        hasCustomBranding: true,
        hasClientManagement: true,
    },
    [EntityPlan.BUSINESS]: {
        maxProfessionals: Infinity,
        maxServices: Infinity,
        maxClients: Infinity,
        hasTeamManagement: true,
        hasAdvancedReports: true,
        hasCustomBranding: true,
        hasClientManagement: true,
    },
};
