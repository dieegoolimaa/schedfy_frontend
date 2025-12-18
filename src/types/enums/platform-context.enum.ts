/**
 * Platform Context Enum
 *
 * Define o contexto da plataforma onde o usuário é criado e opera
 *
 * @enum {string}
 */
export enum PlatformContext {
    /**
     * Usuários da plataforma Schedfy Admin
     * - Platform admins, support, analysts
     * - Acesso ao painel administrativo da Schedfy
     */
    ADMIN = 'admin',

    /**
     * Usuários de clientes (entities) usando Schedfy Frontend
     * - Owners, admins, managers, HR, attendants, professionals
     * - Acesso ao sistema de agendamento da entity
     */
    CLIENT = 'client',
}
