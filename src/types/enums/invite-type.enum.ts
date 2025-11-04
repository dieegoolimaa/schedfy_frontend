export enum InviteType {
    /** 
     * Convite para administrador
     * Requer 2FA (autenticação de dois fatores) no primeiro acesso
     */
    ADMIN = 'admin',

    /** 
     * Convite para profissional
     * Não requer 2FA
     */
    PROFESSIONAL = 'professional',
}
