/**
 * API Module - Central export file for Frontend
 * 
 * This file provides backward compatibility by re-exporting all interfaces and services.
 * New code should import directly from @/interfaces or @/services instead.
 * 
 * @deprecated Use direct imports from @/interfaces and @/services
 * @example
 * // Old way (deprecated)
 * import { authApi, LoginCredentials } from '@/lib/api'
 * 
 * // New way (recommended)
 * import { authService } from '@/services'
 * import type { LoginCredentials } from '@/interfaces'
 */

// Export API client
export { apiClient } from './api-client';

// Export all interfaces
export type * from '../types/models';

// Export all services with backward compatible names
export { authService as authApi } from '../services/auth.service';
export { usersService as usersApi } from '../services/users.service';
export { bookingsService as bookingsApi } from '../services/bookings.service';
export { servicesService as servicesApi } from '../services/services.service';
export { clientsService as clientsApi } from '../services/clients.service';
export { entitiesService as entitiesApi } from '../services/entities.service';
export { professionalsService as professionalsApi } from '../services/professionals.service';
export { paymentsService as paymentsApi } from '../services/payments.service';
export { publicService as publicApi } from '../services/public.service';
