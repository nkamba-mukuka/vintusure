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
    nextPaymentDate?: string
}

export interface Policy {
    id: string;
    type: 'comprehensive' | 'third_party';
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    customerId: string;
    policyNumber: string;
    vehicle: {
        registrationNumber: string;
        make: string;
        model: string;
        year: number;
        engineNumber: string;
        chassisNumber: string;
        value: number;
        usage: 'private' | 'commercial';
    };
    startDate: string;
    endDate: string;
    premium: {
        amount: number;
        currency: string;
        paymentStatus: 'pending' | 'paid' | 'partial';
        nextPaymentDate?: string;
    };
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    agent_id: string;
}

export interface PolicyFormData {
    type: 'comprehensive' | 'third_party';
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    customerId: string;
    vehicle: {
        registrationNumber: string;
        make: string;
        model: string;
        year: number;
        engineNumber: string;
        chassisNumber: string;
        value: number;
        usage: 'private' | 'commercial';
    };
    startDate: string;
    endDate: string;
    premium: {
        amount: number;
        currency: string;
        paymentStatus: 'pending' | 'paid' | 'partial';
        nextPaymentDate?: string;
    };
    policyNumber?: string;
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
    lastDoc?: any;
}

export interface Claim {
    id: string;
    policyId: string;
    customerId: string;
    incidentDate: string; // Changed from Date to string to match claim.ts
    description: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    damageType: 'Vehicle' | 'Property' | 'Personal';
    status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';
    documents: string[]; // Array of document URLs
    amount: number;
    approvedAmount?: number;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    agent_id: string; // ID of the agent who created the claim
}

export type ClaimStatus = Claim['status'];
export type DamageType = Claim['damageType']; 