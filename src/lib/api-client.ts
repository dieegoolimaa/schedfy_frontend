import { ApiResponse, ApiError } from '../types/dto/api';
import { storage } from './storage';

// In development, use empty string to leverage Vite proxy
// In production, use the full API URL from env variable
// In development, use empty string to leverage Vite proxy
// In production, use the full API URL from env variable
const envApiUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL || '';
// Strip trailing /api to avoid duplication with service paths that include it
const API_BASE_URL = envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl;

export class ApiClient {
    private readonly baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private getAuthToken(): string | null {
        return storage.getToken();
    }

    /**
     * Map MongoDB _id to id for frontend compatibility
     */
    private mapMongoIds(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => this.mapMongoIds(item));
        }

        // Handle objects
        if (typeof data === 'object') {
            const mapped: any = {};
            for (const key in data) {
                if (key === '_id') {
                    mapped.id = data[key];
                    mapped._id = data[key]; // Keep _id as well for compatibility
                } else if (typeof data[key] === 'object') {
                    mapped[key] = this.mapMongoIds(data[key]);
                } else {
                    mapped[key] = data[key];
                }
            }
            return mapped;
        }

        return data;
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

        // Map MongoDB _id to id for frontend compatibility
        const mappedData = this.mapMongoIds(data.data || data);

        return {
            data: mappedData,
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
            const networkError: ApiError = {
                message: error.message || 'Network error occurred',
                statusCode: 0,
                error: 'NetworkError',
            };
            throw networkError;
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            }
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
            for (const [key, value] of Object.entries(additionalData)) {
                formData.append(key, String(value));
            }
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
            const uploadError: ApiError = {
                message: error.message || 'File upload failed',
                statusCode: 0,
                error: 'UploadError',
            };
            throw uploadError;
        }
    }
}

export const apiClient = new ApiClient();
