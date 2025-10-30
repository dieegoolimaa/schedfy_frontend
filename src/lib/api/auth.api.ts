import { apiClient } from './client';
import { User, Entity } from '../../types/auth';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    plan?: 'simple' | 'individual' | 'business';
    role?: string;
    region?: 'PT' | 'BR' | 'US';
}

export interface AuthResponse {
    user: User;
    entity?: Entity | null;
    access_token: string;  // Backend uses snake_case
    refresh_token?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export const authApi = {
    /**
     * Login with email and password
     */
    async login(credentials: LoginRequest) {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

        // Store tokens
        if (response.data.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
        }
        if (response.data.refresh_token) {
            localStorage.setItem('schedfy-refresh-token', response.data.refresh_token);
        }
        // Store user data
        if (response.data.user) {
            localStorage.setItem('schedfy-user', JSON.stringify(response.data.user));
        }

        return response;
    },

    /**
     * Register a new user
     */
    async register(data: RegisterRequest) {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

        // Store tokens
        if (response.data.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
        }
        if (response.data.refresh_token) {
            localStorage.setItem('schedfy-refresh-token', response.data.refresh_token);
        }
        // Store user data
        if (response.data.user) {
            localStorage.setItem('schedfy-user', JSON.stringify(response.data.user));
        }

        return response;
    },

    /**
     * Get current user profile
     */
    async getProfile() {
        return apiClient.get<User>('/api/auth/profile');
    },

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string) {
        const response = await apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken });

        if (response.data.access_token) {
            localStorage.setItem('schedfy-token', response.data.access_token);
            localStorage.setItem('schedfy-access-token', response.data.access_token);
        }

        return response;
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiClient.post('/api/auth/logout');
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('schedfy-token');
            localStorage.removeItem('schedfy-refresh-token');
            localStorage.removeItem('schedfy-user');
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('schedfy-token');
    },

    /**
     * Get stored user data
     */
    getStoredUser(): User | null {
        const userStr = localStorage.getItem('schedfy-user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },
};
