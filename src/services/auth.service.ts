/**
 * Authentication Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import { storage } from '../lib/storage';
import type { ApiResponse } from '../types/dto/api';
import type { LoginCredentials } from '../types/dto/auth';
import type {
    RegisterPayload,
    RegisterWithVerificationPayload,
    RefreshTokenRequest,
    AuthUser,
    AuthResponseData,
    RefreshTokenResponse
} from '../types/models/auth.interface';

export const authService = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<AuthResponseData>('/api/auth/login', credentials);

        // Store tokens
        if (response.data?.access_token) {
            storage.setToken(response.data.access_token);
        }
        if (response.data?.refresh_token) {
            storage.setRefreshToken(response.data.refresh_token);
        }
        // Store user data
        if (response.data?.user) {
            storage.setUser(response.data.user);
        }

        return response;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<AuthResponseData>('/api/auth/register', data);

        // Store tokens
        if (response.data?.access_token) {
            storage.setToken(response.data.access_token);
        }
        if (response.data?.refresh_token) {
            storage.setRefreshToken(response.data.refresh_token);
        }
        // Store user data
        if (response.data?.user) {
            storage.setUser(response.data.user);
        }

        return response;
    },

    /**
     * Send verification code to email (before registration)
     */
    sendVerificationCode: async (email: string): Promise<ApiResponse<{ success: boolean; message: string; expiresIn: number; code?: string }>> => {
        return await apiClient.post('/api/onboarding/send-verification-code', { email });
    },

    /**
     * Verify the code sent to email
     */
    verifyCode: async (email: string, code: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
        return await apiClient.post('/api/onboarding/verify-code', { email, code });
    },

    /**
     * Verify email with token (from verification link)
     */
    verifyEmail: async (token: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
        return await apiClient.post('/api/auth/verify-email', { token });
    },

    /**
     * Register new user with verified email code
     */
    registerWithVerification: async (data: RegisterWithVerificationPayload): Promise<ApiResponse<AuthResponseData>> => {
        // Transform to match backend expectations for onboarding
        const payload = {
            businessName: data.businessName || 'My Business',
            ownerName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            username: data.email.split('@')[0],
            password: data.password,
            verificationCode: data.verificationCode,
            businessType: data.businessType || 'other',
            plan: data.plan || 'simple', // Include plan
            billingPeriod: data.billingPeriod || 'month', // Include billing period
            region: data.region || 'BR', // Include region code
            timezone: data.timezone || 'America/Sao_Paulo',
            locale: data.locale || 'pt-BR',
            currency: data.currency || 'BRL',
        };

        const response = await apiClient.post<any>('/api/onboarding/entity-with-verification', payload);

        // Handle both access_token and accessToken naming
        const accessToken = response.data?.access_token || response.data?.accessToken;
        const refreshToken = response.data?.refresh_token || response.data?.refreshToken;

        // Store tokens
        if (accessToken) {
            storage.setToken(accessToken);
        }
        if (refreshToken) {
            storage.setRefreshToken(refreshToken);
        }
        // Store user data
        if (response.data?.user) {
            storage.setUser(response.data.user);
        }

        return response;
    },

    /**
     * Verify 2FA code during login
     */
    verify2FA: async (tempToken: string, code: string): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<AuthResponseData>('/api/auth/2fa/verify-login', {
            tempToken,
            code,
        });

        // Store tokens
        if (response.data?.access_token) {
            storage.setToken(response.data.access_token);
        }
        if (response.data?.refresh_token) {
            storage.setRefreshToken(response.data.refresh_token);
        }
        // Store user data
        if (response.data?.user) {
            storage.setUser(response.data.user);
        }

        return response;
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<ApiResponse<AuthUser>> => {
        return await apiClient.get<AuthUser>('/api/auth/profile');
    },

    /**
     * Change password for authenticated user
     */
    changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
        return await apiClient.patch('/api/auth/change-password', {
            userId,
            currentPassword,
            newPassword
        });
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
        const payload: RefreshTokenRequest = { refreshToken };
        const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', payload);

        if (response.data?.access_token) {
            storage.setToken(response.data.access_token);
        }

        return response;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await apiClient.post('/api/auth/logout');
        } finally {
            // Clear local storage regardless of API response
            storage.clearAuth();
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!storage.getToken();
    },

    /**
     * Request password reset email
     */
    requestPasswordReset: async (email: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.post('/api/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.post('/api/auth/reset-password', {
            token,
            newPassword
        });
    },

    /**
     * Get stored user data
     */
    getStoredUser: (): AuthUser | null => {
        return storage.getUser();
    },
};