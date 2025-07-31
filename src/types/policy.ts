import { Timestamp } from 'firebase/firestore'

export type PolicyType = 'comprehensive' | 'third_party'
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type PaymentStatus = 'pending' | 'paid' | 'partial'
export type VehicleUsage = 'private' | 'commercial'

export interface Vehicle {
    registrationNumber: string
    make: string
    model: string
    year: number
    engineNumber: string
    chassisNumber: string
    value: number
    usage: VehicleUsage
}

export interface Premium {
    amount: number
    currency: string
    paymentStatus: PaymentStatus
    paymentMethod: string
}

export interface Policy {
    id: string
    type: PolicyType
    status: PolicyStatus
    customerId: string
    policyNumber: string
    vehicle: Vehicle
    startDate: Timestamp
    endDate: Timestamp
    premium: Premium
    createdAt: Timestamp
    updatedAt: Timestamp
    createdBy: string
}

export interface PolicyFormData extends Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'documents'> {
    id?: string;
}

export interface PolicyFilters {
    searchTerm?: string
    status?: PolicyStatus
    type?: PolicyType
    customerId?: string
    startDate?: Date
    endDate?: Date
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