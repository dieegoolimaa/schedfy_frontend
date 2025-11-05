/**
 * Shared Enums - Barrel Export
 * 
 * Importar enums compartilhados de um único lugar:
 * import { Region, UserRole, BookingStatus } from '@shared/enums';
 */

// Common enums
export * from './region.enum';
export * from './currency.enum';

// User enums
export * from './user-role.enum';
export * from './user-type.enum';
export * from './user-status.enum';
export * from './invite-type.enum';
export * from './platform-context.enum';

// Entity enums
export * from './entity-plan.enum';
export * from './entity-status.enum';
export * from './subscription-action.enum';

// Booking enums
export * from './booking-status.enum';

// Payment enums
export * from './payment-status.enum';
export * from './payment-type.enum';
export * from './payment-method.enum';

// Service enums
export * from './service-status.enum';
export * from './duration-type.enum';

// Package enums
export * from './package-status.enum';
export * from './package-recurrence.enum';
export * from './subscription-status.enum';

// Client enums
export * from './client-status.enum';
export * from './client-source.enum';

// Permission enums
export * from './permission-category.enum';
export * from './permission-action.enum';
export * from './permission-action-type.enum';

// Notification enums
export * from './notification-event.enum';

// Pricing enums
export * from './plan-type.enum';
export * from './billing-period.enum';
