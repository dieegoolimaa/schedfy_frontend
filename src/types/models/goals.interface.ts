/**
 * Goals Interfaces
 */

export enum GoalType {
    BOOKINGS = 'bookings',
    REVENUE = 'revenue',
    NEW_CLIENTS = 'new_clients',
    RETENTION = 'retention',
    CUSTOM = 'custom'
}

export enum GoalPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly'
}

export interface Goal {
    _id: string;
    entityId: string;
    name: string;
    description?: string;
    type: GoalType;
    targetValue: number;
    currentValue: number;
    period: GoalPeriod;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'cancelled';
    assignedTo?: string[];
    createdBy: string;
    metadata?: {
        unit?: string;
        currency?: string;
        icon?: string;
        color?: string;
        serviceIds?: string[];
        professionalIds?: string[];
        tags?: string[];
    };
    createdAt: string;
    updatedAt: string;
}
