export enum SubscriptionAction {
    /** Assinatura criada */
    CREATED = 'created',

    /** Upgrade de plano */
    UPGRADED = 'upgraded',

    /** Downgrade de plano */
    DOWNGRADED = 'downgraded',

    /** Assinatura cancelada */
    CANCELLED = 'cancelled',

    /** Assinatura reativada */
    REACTIVATED = 'reactivated',

    /** Assinatura expirada */
    EXPIRED = 'expired',

    /** Falha no pagamento */
    PAYMENT_FAILED = 'payment_failed',

    /** Pagamento bem-sucedido */
    PAYMENT_SUCCESS = 'payment_success',
}
