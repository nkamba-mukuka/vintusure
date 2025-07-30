export type PolicyType = 'comprehensive' | 'third_party';
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Vehicle {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    engineNumber: string;
    chassisNumber: string;
    value: number;
    usage: 'private' | 'commercial';
}

export interface Policy {
    id: string;
    policyNumber: string;
    customerId: string;
    type: PolicyType;
    status: PolicyStatus;
    vehicle: Vehicle;
    startDate: Date;
    endDate: Date;
    premium: {
        amount: number;
        currency: string;
        paymentStatus: 'paid' | 'pending' | 'partial';
        paymentMethod?: string;
    };
    documents: {
        id: string;
        type: string;
        url: string;
        uploadedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface PolicyFormData extends Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'documents'> {
    id?: string;
}

export interface PolicyFilters {
    searchTerm?: string;
    status?: PolicyStatus;
    type?: PolicyType;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: keyof Policy;
    sortOrder?: 'asc' | 'desc';
}

export interface PolicyListResponse {
    policies: Policy[];
    total: number;
    page: number;
    limit: number;
}

export interface Claim {
    id: string;
    policyId: string;
    customerId: string;
    incidentDate: string;
    description: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    damageType: 'Vehicle' | 'Property' | 'Personal';
    status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected';
    documents: string[]; // Array of document URLs
    amount: number;
    approvedAmount?: number;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export type ClaimStatus = Claim['status'];
export type DamageType = Claim['damageType']; 