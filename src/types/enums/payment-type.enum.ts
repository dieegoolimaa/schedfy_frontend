export enum PaymentType {
    /** Pagamento de assinatura (plano mensal/anual) */
    SUBSCRIPTION = 'subscription',

    /** Pagamento de agendamento de serviço */
    BOOKING = 'booking',

    /** Depósito/sinal */
    DEPOSIT = 'deposit',

    /** Pagamento de insights de IA (recurso premium) */
    AI_INSIGHTS = 'ai_insights',

    /** Pagamento único (sem recorrência) */
    ONE_TIME = 'one_time',

    /** Pagamento manual registrado pelo profissional */
    MANUAL = 'manual',
}
