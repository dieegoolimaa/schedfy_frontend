export enum NotificationEvent {
    // ============ GESTÃO DE PROFISSIONAIS ============
    /** Convite para novo profissional */
    PROFESSIONAL_INVITATION = 'professional_invitation',

    /** Lembrete de convite não aceito */
    PROFESSIONAL_INVITATION_REMINDER = 'professional_invitation_reminder',

    /** Conta de profissional ativada */
    PROFESSIONAL_ACCOUNT_ACTIVATED = 'professional_account_activated',

    /** Profissional removido da equipe */
    PROFESSIONAL_REMOVED = 'professional_removed',

    // ============ GESTÃO DE ADMINISTRADORES ============
    /** Convite para novo admin (requer 2FA) */
    ADMIN_INVITATION = 'admin_invitation',

    // ============ CICLO DE VIDA DO AGENDAMENTO ============
    /** Novo agendamento criado */
    BOOKING_CREATED = 'booking_created',

    /** Agendamento confirmado pelo profissional */
    BOOKING_CONFIRMED = 'booking_confirmed',

    /** Agendamento reagendado */
    BOOKING_RESCHEDULED = 'booking_rescheduled',

    /** Agendamento cancelado pelo cliente */
    BOOKING_CANCELLED_BY_CLIENT = 'booking_cancelled_by_client',

    /** Agendamento cancelado pelo profissional */
    BOOKING_CANCELLED_BY_PROFESSIONAL = 'booking_cancelled_by_professional',

    /** Agendamento cancelado pelo dono/admin */
    BOOKING_CANCELLED_BY_OWNER = 'booking_cancelled_by_owner',

    /** Agendamento concluído */
    BOOKING_COMPLETED = 'booking_completed',

    /** Cliente não compareceu */
    BOOKING_NO_SHOW = 'booking_no_show',

    // ============ LEMBRETES DE AGENDAMENTO ============
    /** Lembrete 24 horas antes */
    BOOKING_REMINDER_24H = 'booking_reminder_24h',

    /** Lembrete 2 horas antes */
    BOOKING_REMINDER_2H = 'booking_reminder_2h',

    /** Lembrete 30 minutos antes */
    BOOKING_REMINDER_30MIN = 'booking_reminder_30min',

    // ============ GESTÃO DE CLIENTES ============
    /** Boas-vindas ao novo cliente */
    CLIENT_WELCOME = 'client_welcome',

    /** Primeiro agendamento do cliente */
    CLIENT_FIRST_BOOKING = 'client_first_booking',

    /** Aniversário do cliente */
    CLIENT_BIRTHDAY = 'client_birthday',

    /** Recompensa de fidelidade */
    CLIENT_LOYALTY_REWARD = 'client_loyalty_reward',

    // ============ PAGAMENTOS E COBRANÇAS ============
    /** Pagamento recebido */
    PAYMENT_RECEIVED = 'payment_received',

    /** Falha no pagamento */
    PAYMENT_FAILED = 'payment_failed',

    /** Pagamento reembolsado */
    PAYMENT_REFUNDED = 'payment_refunded',

    /** Fatura gerada */
    INVOICE_GENERATED = 'invoice_generated',

    /** Assinatura expirando em breve */
    SUBSCRIPTION_EXPIRING = 'subscription_expiring',

    /** Assinatura expirada */
    SUBSCRIPTION_EXPIRED = 'subscription_expired',

    /** Assinatura renovada */
    SUBSCRIPTION_RENEWED = 'subscription_renewed',

    // ============ AUTENTICAÇÃO DE USUÁRIO ============
    /** Solicitação de redefinição de senha */
    USER_PASSWORD_RESET = 'user_password_reset',

    /** Verificação de email */
    USER_EMAIL_VERIFICATION = 'user_email_verification',

    /** Login de novo dispositivo */
    USER_LOGIN_NEW_DEVICE = 'user_login_new_device',

    // ============ ATUALIZAÇÕES DO NEGÓCIO ============
    /** Perfil da entidade aprovado */
    ENTITY_PROFILE_APPROVED = 'entity_profile_approved',

    /** Perfil da entidade rejeitado */
    ENTITY_PROFILE_REJECTED = 'entity_profile_rejected',

    /** Lembrete de serviço */
    SERVICE_REMINDER = 'service_reminder',

    /** Nova avaliação recebida */
    NEW_REVIEW_RECEIVED = 'new_review_received',

    /** Resposta à avaliação adicionada */
    REVIEW_RESPONSE_ADDED = 'review_response_added',

    /** Relatório semanal */
    WEEKLY_REPORT = 'weekly_report',

    /** Relatório mensal */
    MONTHLY_REPORT = 'monthly_report',

    /** Novo cliente registrado */
    NEW_CLIENT_REGISTERED = 'new_client_registered',

    /** Relatório de comissões do profissional */
    PROFESSIONAL_COMMISSION_REPORT = 'professional_commission_report',

    /** Disponibilidade de serviço atualizada */
    SERVICE_AVAILABILITY_UPDATED = 'service_availability_updated',

    /** Manutenção da entidade agendada */
    ENTITY_MAINTENANCE_SCHEDULED = 'entity_maintenance_scheduled',

    // ============ NOTIFICAÇÕES DO SISTEMA ============
    /** Manutenção do sistema */
    SYSTEM_MAINTENANCE = 'system_maintenance',

    /** Anúncio de nova funcionalidade */
    FEATURE_ANNOUNCEMENT = 'feature_announcement',

    /** Alerta de segurança */
    SECURITY_ALERT = 'security_alert',
}

