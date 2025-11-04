/**
 * Common Interfaces (Non-API)
 * 
 * Note: API response types (ApiResponse, ApiError, PaginatedResponse) 
 * are now in types/dto/api.ts
 */

export interface ErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
}
