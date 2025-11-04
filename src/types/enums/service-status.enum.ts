export enum ServiceStatus {
    /** Serviço ativo e disponível para agendamento */
    ACTIVE = 'active',

    /** Serviço inativo (não disponível para agendamento) */
    INACTIVE = 'inactive',

    /** Serviço em rascunho (ainda não publicado) */
    DRAFT = 'draft',
}
