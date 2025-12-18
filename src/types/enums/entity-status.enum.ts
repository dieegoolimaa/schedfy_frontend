/**
 * Status de uma entidade/empresa
 *
 * @enum {string}
 */
export enum EntityStatus {
    /** Entidade ativa com acesso total */
    ACTIVE = 'active',

    /** Entidade inativa (por escolha do dono) */
    INACTIVE = 'inactive',

    /** Entidade suspensa (pagamento pendente, violação de termos) */
    SUSPENDED = 'suspended',

    /** Entidade em período de teste gratuito */
    TRIAL = 'trial',
}
