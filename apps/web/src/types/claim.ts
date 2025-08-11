export type DamageType = 'Vehicle' | 'Property' | 'Personal';

export interface ClaimLocation {
    address: string;
    latitude: number;
    longitude: number;
}

export interface Claim {
    id: string;
    customerId: string;
    policyId: string;
    incidentDate: Date;
    location: ClaimLocation;
    description: string;
    amount: number;
    damageType: DamageType;
    documents: string[];
    status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';
    approvedAmount?: number;
    reviewNotes?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    agent_id?: string;
}

export interface ClaimFormData {
    customerId: string;
    policyId: string;
    incidentDate: string;
    location: ClaimLocation;
    description: string;
    amount: number;
    damageType: DamageType;
    documents: string[];
    approvedAmount?: number;
    reviewNotes?: string;
} 