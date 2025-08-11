export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nrcPassport: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    occupation: string;
    status: 'active' | 'inactive';
    address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    agent_id?: string;
}

export interface CustomerFormData extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id'> {
    id?: string;
    agent_id?: string; // Make agent_id optional for forms
}

export interface CustomerFilters {
    searchTerm?: string;
    status?: Customer['status'];
    sortBy?: keyof Customer;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
}

export interface CustomerListResponse {
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
} 