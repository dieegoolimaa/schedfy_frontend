/**
 * Authentication Interfaces - Frontend
 */

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: string;
    region?: string;
    plan?: 'simple' | 'individual' | 'business';
}

export interface AuthResponseData {
    user: AuthUser;
    entity?: any;
    access_token: string;
    refresh_token?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    region?: string;
    entityId?: string;
    createdAt?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
}
