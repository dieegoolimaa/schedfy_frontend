export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    plan: "simple" | "individual" | "business";
    role: "owner" | "admin" | "manager" | "hr" | "attendant" | "professional" | "platform_admin";
    platform: "admin" | "client"; // Platform context: admin (schedfy_admin) or client (schedfy_frontend)
    entityId?: string; // MongoDB ObjectId for the entity this user belongs to
    country: "PT" | "BR" | "US";
    timezone: string;
    locale: string;
    isEmailVerified: boolean;
    phone?: string;
    professionalInfo?: {
        jobFunction?: string;
        specialties?: string[];
        bio?: string;
        experience?: number;
        certifications?: string[];
        socialMedia?: {
            instagram?: string;
            linkedin?: string;
            website?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface AuthEntity {
    id: string;
    name: string;
    isOnboardingComplete: boolean;
    onboardingStatus?: {
        hasAddress: boolean;
        hasPhone: boolean;
        hasBusinessHours: boolean;
        hasServices: boolean;
        hasPaymentMethods: boolean;
    };
}

// Re-export Entity from models for convenience
export type { Entity } from '../models/entities.interface';

export interface AuthState {
    user: User | null;
    entity: AuthEntity | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    role?: string;
    plan?: "simple" | "individual" | "business";
    businessName?: string;
    businessType?: string;
    region?: string;
    country?: "PT" | "BR" | "US";
    acceptTerms?: boolean;
    acceptMarketing?: boolean;
}

export interface ResetPasswordData {
    email: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface OAuthProvider {
    id: "google" | "microsoft" | "apple";
    name: string;
    icon: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}