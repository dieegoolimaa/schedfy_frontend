/**
 * Status de pagamento
 *
 * Usado em: Booking, Payment
 *
 * @enum {string}
 */
export enum PaymentStatus {
    /** Pagamento pendente */
    PENDING = 'pending',

    /** Pagamento parcial realizado */
    PARTIAL = 'partial',

    /** Pagamento completo realizado */
    PAID = 'paid',

    /** Pagamento reembolsado */
    REFUNDED = 'refunded',

    /** Pagamento falhou */
    FAILED = 'failed',
}
