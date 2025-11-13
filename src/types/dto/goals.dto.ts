/**
 * Goals DTOs
 */

import { GoalType, GoalPeriod } from '../models/goals.interface';

export interface CreateGoalDto {
    entityId: string;
    name: string;
    description?: string;
    type: GoalType;
    targetValue: number;
    period: GoalPeriod;
    startDate: string | Date;
    endDate: string | Date;
    assignedTo?: string[];
    metadata?: {
        unit?: string;
        currency?: string;
        icon?: string;
        color?: string;
        serviceIds?: string[];
        professionalIds?: string[];
        tags?: string[];
    };
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
    status?: 'active' | 'completed' | 'cancelled';
    currentValue?: number;
}
