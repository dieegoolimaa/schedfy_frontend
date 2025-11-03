/**
 * Common API Response Interface
 */

export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    status?: number;
}

export interface ApiError extends Error {
    message: string;
    statusCode: number;
    error?: string;
    errors?: any;
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
