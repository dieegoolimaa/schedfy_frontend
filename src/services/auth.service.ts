/**
 * Authentication Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type { ApiResponse } from '../interfaces/common.interface';
import type {
    LoginCredentials,
    RegisterData,
    RefreshTokenRequest,
    AuthUser,
    AuthResponseData,
    RefreshTokenResponse
} from '../interfaces/auth.interface';

export const authService = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<AuthResponseData>('/api/auth/login', credentials);

        // Store tokens
        if (response.data?.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
        }
        if (response.data?.refresh_token) {
            localStorage.setItem('schedfy-refresh-token', response.data.refresh_token);
        }
        // Store user data
        if (response.data?.user) {
            localStorage.setItem('schedfy-user', JSON.stringify(response.data.user));
        }

        return response;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterData): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<AuthResponseData>('/api/auth/register', data);

        // Store tokens
        if (response.data?.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
        }
        if (response.data?.refresh_token) {
            localStorage.setItem('schedfy-refresh-token', response.data.refresh_token);
        }
        // Store user data
        if (response.data?.user) {
            localStorage.setItem('schedfy-user', JSON.stringify(response.data.user));
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
     * Refresh authentication token
     */
    refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
        const payload: RefreshTokenRequest = { refreshToken };
        const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', payload);

        if (response.data?.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
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
            localStorage.removeItem('schedfy-token');
            localStorage.removeItem('schedfy-access-token');
            localStorage.removeItem('schedfy-refresh-token');
            localStorage.removeItem('schedfy-user');
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('schedfy-token');
    },

    /**
     * Get stored user data
     */
    getStoredUser: (): AuthUser | null => {
        const userStr = localStorage.getItem('schedfy-user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },
};