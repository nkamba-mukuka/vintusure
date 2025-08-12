export interface Customer {
    id: string;
    nrcPassport: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
    };
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    occupation: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    agent_id: string;
    status: 'active' | 'inactive';
}

export interface CustomerFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nrcPassport: string;
    address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
    };
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    occupation: string;
    status: 'active' | 'inactive';
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
    lastDoc?: any;
} 