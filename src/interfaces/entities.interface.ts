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
    businessHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    firstService?: {
        name: string;
        duration: number;
        price: number;
        description?: string;
    };
}
