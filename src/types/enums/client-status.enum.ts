export enum ClientStatus {
    /** Cliente ativo */
    ACTIVE = 'active',

    /** Cliente inativo */
    INACTIVE = 'inactive',

    /** Cliente bloqueado (não pode mais agendar) */
    BLOCKED = 'blocked',
}
