/**
 * Users Interfaces - Frontend
 */

export interface User {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: string;
    region?: string;
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
    role?: string;
    region?: string;
    phone?: string;
}

export interface UpdateUserData {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    region?: string;
}
