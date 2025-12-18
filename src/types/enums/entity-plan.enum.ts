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

    /** Plano individual - profissional individual com recursos avançados */
    INDIVIDUAL = 'individual',

    /** Plano business - empresa com múltiplos profissionais */
    BUSINESS = 'business',
}

/**
 * Limites por plano
 */
export const PLAN_LIMITS = {
    [EntityPlan.SIMPLE]: {
        maxProfessionals: 1,
        maxServices: 10,
        maxClients: 100,
        hasTeamManagement: false,
        hasAdvancedReports: false,
        hasCustomBranding: false,
    },
    [EntityPlan.INDIVIDUAL]: {
        maxProfessionals: 1,
        maxServices: 50,
        maxClients: 500,
        hasTeamManagement: false,
        hasAdvancedReports: true,
        hasCustomBranding: true,
    },
    [EntityPlan.BUSINESS]: {
        maxProfessionals: Infinity,
        maxServices: Infinity,
        maxClients: Infinity,
        hasTeamManagement: true,
        hasAdvancedReports: true,
        hasCustomBranding: true,
    },
};
