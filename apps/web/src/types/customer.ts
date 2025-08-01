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
    createdAt: Date;
    updatedAt: Date;
    createdBy: string; // Reference to user who created the customer
    status: 'active' | 'inactive';
}

export interface CustomerFormData extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {
    id?: string;
}

export interface CustomerFilters {
    searchTerm?: string;
    status?: Customer['status'];
    sortBy?: keyof Customer;
    sortOrder?: 'asc' | 'desc';
}

export interface CustomerListResponse {
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
} 