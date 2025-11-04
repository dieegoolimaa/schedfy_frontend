export enum PermissionActionType {
    /** Pode visualizar a página/recurso */
    VIEW = 'view',

    /** Pode criar novos itens */
    CREATE = 'create',

    /** Pode editar itens existentes */
    UPDATE = 'update',

    /** Pode deletar itens */
    DELETE = 'delete',

    /** Pode exportar dados */
    EXPORT = 'export',

    /** Pode importar dados */
    IMPORT = 'import',

    /** Controle total (todas as ações) */
    MANAGE = 'manage',
}

