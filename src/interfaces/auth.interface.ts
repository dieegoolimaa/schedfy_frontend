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
}

export interface AuthResponse {
    data: {
        user: AuthUser;
        access_token: string;
        refresh_token?: string;
    };
    message?: string;
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
