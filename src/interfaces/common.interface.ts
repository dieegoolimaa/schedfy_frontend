/**
 * Common API Response Interface
 */

export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
}
