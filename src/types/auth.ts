export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    plan: "simple" | "individual" | "business";
    role: "owner" | "admin" | "manager" | "hr" | "attendant" | "professional" | "platform_admin";
    entityId?: string; // MongoDB ObjectId for the entity this user belongs to
    country: "PT" | "BR" | "US";
    timezone: string;
    locale: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
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
    plan?: "simple" | "individual" | "business";
    businessName?: string;
    businessType?: string;
    region?: string;
    country?: "PT" | "BR" | "US";
    acceptTerms: boolean;
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