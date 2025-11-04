export enum BookingStatus {
    /** Agendamento criado, aguardando confirmação do profissional */
    PENDING = 'pending',

    /** Agendamento confirmado pelo profissional */
    CONFIRMED = 'confirmed',

    /** Serviço em andamento */
    IN_PROGRESS = 'in_progress',

    /** Serviço concluído com sucesso */
    COMPLETED = 'completed',

    /** Agendamento cancelado (por cliente ou profissional) */
    CANCELLED = 'cancelled',

    /** Cliente não compareceu no horário agendado */
    NO_SHOW = 'no_show',
}

