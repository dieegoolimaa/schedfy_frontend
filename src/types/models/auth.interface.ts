/**
 * Authentication Interfaces - Frontend
 * 
 * Note: User, Entity, AuthState, LoginCredentials, and RegisterData 
 * are now in types/dto/auth.ts as they are API-related DTOs.
 * 
 * This file is kept for backwards compatibility and may contain
 * auth-specific business logic interfaces in the future.
 */

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}

export interface RegisterWithVerificationPayload extends RegisterPayload {
    verificationCode: string;
    businessName?: string;
    businessType?: string;
    timezone?: string;
    locale?: string;
    currency?: string;
}

export interface AuthResponseData {
    user?: AuthUser;
    entity?: any;
    access_token?: string;
    refresh_token?: string;
    requires2FA?: boolean;
    tempToken?: string;
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

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
}
