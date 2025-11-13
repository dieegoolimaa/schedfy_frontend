import { apiClient } from "../lib/api-client";

import { apiClient } from '../lib/api-client';
import type { CreateContactData } from '../types/dto/contacts.dto';

/**

export const contactsService = {
    async createContact(data: CreateContactData) {
        const response = await apiClient.post('/api/contacts', data);
        return response.data;
    },
};
