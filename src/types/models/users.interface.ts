/**
 * Users Interfaces - Frontend
 * 
 * Note: The main User interface is in types/dto/auth.ts
 * This file contains user management specific interfaces
 */

import { Region, UserRole } from '../enums';

// Re-export User from auth for convenience
export type { User } from '../dto/auth';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    region?: Region;
    entityId?: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    region?: Region;
    phone?: string;
}

export interface UpdateUserData {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    region?: Region;
}
