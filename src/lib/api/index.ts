// Export API client
export { apiClient, ApiClient } from './client';

// Export all API modules
export * from './auth.api';
export * from './services.api';
export * from './bookings.api';
export * from './clients.api';
export * from './entities.api';

// Re-export types
export type { ApiResponse, ApiError, PaginatedResponse, QueryParams } from '../../types/api';
