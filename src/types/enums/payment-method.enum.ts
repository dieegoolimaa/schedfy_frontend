/**
 * Método de pagamento
 *
 * @enum {string}
 */
export enum PaymentMethod {
    /** Pagamento online via Stripe */
    STRIPE = 'stripe',

    /** Dinheiro */
    CASH = 'cash',

    /** PIX (método brasileiro) */
    PIX = 'pix',

    /** Cartão de débito */
    DEBIT_CARD = 'debit_card',

    /** Cartão de crédito */
    CREDIT_CARD = 'credit_card',

    /** Transferência bancária */
    BANK_TRANSFER = 'bank_transfer',

    /** MB WAY (Portugal) */
    MBWAY = 'mbway',

    /** Terminal de Cartão (TPA) */
    CARD_TERMINAL = 'card_terminal',
}

/**
 * Métodos que requerem processamento online
 */
export const ONLINE_PAYMENT_METHODS = [
    PaymentMethod.STRIPE,
];

/**
 * Métodos manuais (registrados manualmente pelo profissional)
 */
export const MANUAL_PAYMENT_METHODS = [
    PaymentMethod.CASH,
    PaymentMethod.PIX,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.MBWAY,
    PaymentMethod.CARD_TERMINAL,
];
