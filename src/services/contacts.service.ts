import { apiClient } from "../lib/api-client";

export interface CreateContactData {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    entityId?: string;
    entityName?: string;
    language?: string;
    region?: string;
}

export const contactsService = {
    async createContact(data: CreateContactData) {
        const response = await apiClient.post('/contacts', data);
        return response.data;
    },
};
