import { apiClient } from '../lib/api-client';
import type { CreateContactData } from '../types/dto/contacts.dto';

/**
 * Contacts Service
 * Handles contact form submissions
 */
export const contactsService = {
    async createContact(data: CreateContactData) {
        const response = await apiClient.post('/api/contacts', data);
        return response.data;
    },
};
