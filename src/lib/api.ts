const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;

interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

class ApiClient {
    private readonly baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('schedfy-access-token');

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return { data };
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API endpoints
export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        apiClient.post('/api/auth/login', credentials),

    register: (data: { email: string; password: string; name: string; role?: string; region?: string }) =>
        apiClient.post('/api/auth/register', data),

    getProfile: () =>
        apiClient.get('/api/auth/profile'),

    refreshToken: (refreshToken: string) =>
        apiClient.post('/api/auth/refresh', { refreshToken }),

    googleAuth: () => {
        globalThis.location.href = `${API_BASE_URL}/api/auth/google`;
    },
};

// Users API endpoints
export const usersApi = {
    getUsers: () =>
        apiClient.get('/api/users'),

    createUser: (userData: any) =>
        apiClient.post('/api/users', userData),

    updateUser: (id: string, userData: any) =>
        apiClient.put(`/api/users/${id}`, userData),

    deleteUser: (id: string) =>
        apiClient.delete(`/api/users/${id}`),
};