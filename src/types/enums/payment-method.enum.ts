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
}

