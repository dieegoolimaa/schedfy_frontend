/**
 * Entities Module Interfaces - Frontend
 */

export interface Entity {
    id: string;
    name: string;
    email: string;
    plan: 'simple' | 'individual' | 'business';
    allowConcurrentBookings: boolean;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    region?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EntityProfile {
    name: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    workingHours?: WorkingHours;
}

export interface UpdateEntityProfileDto {
    name?: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
}

export interface WorkingHoursDay {
    enabled: boolean;
    start: string;
    end: string;
    breakStart?: string;
    breakEnd?: string;
}

export interface WorkingHours {
    monday: WorkingHoursDay;
    tuesday: WorkingHoursDay;
    wednesday: WorkingHoursDay;
    thursday: WorkingHoursDay;
    friday: WorkingHoursDay;
    saturday: WorkingHoursDay;
    sunday: WorkingHoursDay;
}

export interface CompleteOnboardingDto {
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phone: string;
    whatsapp?: string;
    workingHours: WorkingHours;
    firstService?: {
        name: string;
        duration: number;
        price: number;
        description?: string;
    };
}
