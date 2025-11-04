export enum PermissionAction {
    /** Criar novo item */
    CREATE = 'create',

    /** Ler/Visualizar item */
    READ = 'read',

    /** Atualizar/Editar item existente */
    UPDATE = 'update',

    /** Deletar item */
    DELETE = 'delete',

    /** Controle total (todas as ações) */
    MANAGE = 'manage',
}
