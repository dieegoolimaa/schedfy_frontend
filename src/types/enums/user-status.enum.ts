export enum UserStatus {
    /** Usuário ativo e pode acessar o sistema */
    ACTIVE = 'active',

    /** Usuário inativo (por escolha do admin ou do próprio usuário) */
    INACTIVE = 'inactive',

    /** Usuário suspenso (violação de termos, pagamento pendente, etc) */
    SUSPENDED = 'suspended',

    /** Usuário criado mas ainda não ativado */
    PENDING = 'pending',
}
