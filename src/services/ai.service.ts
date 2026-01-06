/**
 * AI Service - Frontend
 * Handles AI-powered insights and features
 */

import { apiClient } from '../lib/api-client';
import type { ApiResponse } from '../types/dto/api';

export interface AIInsight {
    id: string;
    type: 'revenue' | 'optimization' | 'behavior' | 'staff' | 'marketing' | 'general';
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high';
    value?: string | number;
    trend?: 'up' | 'down' | 'neutral';
}

export interface InsightContext {
    entityId: string;
    pageType?: 'dashboard' | 'revenue' | 'clients' | 'staff' | 'general';
    metrics?: Record<string, any>;
}

export interface InsightsResponse {
    insights: AIInsight[];
    generatedAt: string;
    expiresAt: string;
}

export const aiService = {
    /**
     * Generate AI insights for an entity
     */
    generateInsights: async (entityId: string, context?: Omit<InsightContext, 'entityId'>): Promise<ApiResponse<InsightsResponse>> => {
        return await apiClient.post<InsightsResponse>('/api/ai/insights', {
            entityId,
            context: context || { pageType: 'general' }
        });
    },

    /**
     * Get quick AI insights for a specific page
     */
    getQuickInsights: async (pageType: string = 'general'): Promise<ApiResponse<InsightsResponse>> => {
        return await apiClient.get<InsightsResponse>(`/api/ai/insights/quick?pageType=${pageType}`);
    }
};
