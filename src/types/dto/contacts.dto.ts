/**
 * Contacts DTOs
 */

export interface CreateContactData {
    name: string;
    email?: string;
    phone?: string;
    message: string;
    subject?: string;
    type?: 'support' | 'sales' | 'general';
    category?: string;
    language?: string;
    region?: string;
}
