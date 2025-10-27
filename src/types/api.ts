// Common API Response Types
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Query params for lists
export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
}
