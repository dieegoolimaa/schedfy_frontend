import { apiClient } from "@/lib/api-client";

export interface AIInsightMetric {
    value: string | number;
    target?: string | number;
    percentage?: number;
    change?: number;
}

export interface AIInsight {
    type: string;
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    impact?: string;
    metric?: AIInsightMetric;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface AIInsightsResponse {
    insights: AIInsight[];
}

export const reportsService = {
    getOperationalInsights: async (): Promise<AIInsightsResponse> => {
        const response = await apiClient.get<AIInsightsResponse>('/api/reports/ai-insights/operational');
        return response.data;
    },

    getFinancialInsights: async (): Promise<AIInsightsResponse> => {
        const response = await apiClient.get<AIInsightsResponse>('/api/reports/ai-insights/financial');
        return response.data;
    }
};
