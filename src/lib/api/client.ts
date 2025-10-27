import { ApiResponse, ApiError } from '../../types/api';

// In development, use empty string to leverage Vite proxy
// In production, use the full API URL from env variable
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export class ApiClient {
    private readonly baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('schedfy-token');
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        let data: any;
        if (isJson) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error: ApiError = {
                message: data.message || data.error || 'An error occurred',
                statusCode: response.status,
                error: data.error,
                errors: data.errors,
            };
            throw error;
        }

        return {
            data: data.data || data,
            message: data.message,
            status: response.status,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAuthToken();

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            credentials: 'include', // Important for CORS with credentials
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse<T>(response);
        } catch (error: any) {
            // If it's already an ApiError, rethrow it
            if (error.statusCode) {
                throw error;
            }

            // Handle network errors
            throw {
                message: error.message || 'Network error occurred',
                statusCode: 0,
                error: 'NetworkError',
            } as ApiError;
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
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

    async uploadFile<T>(
        endpoint: string,
        file: File,
        additionalData?: Record<string, any>
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
        }

        const token = this.getAuthToken();
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            return await this.handleResponse<T>(response);
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            throw {
                message: error.message || 'File upload failed',
                statusCode: 0,
                error: 'UploadError',
            } as ApiError;
        }
    }
}

export const apiClient = new ApiClient();
