export interface ClaimLocation {
    latitude: number;
    longitude: number;
    address: string;
}

export type DamageType = 'Vehicle' | 'Property' | 'Personal';
export type ClaimStatus = 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';

export interface Claim {
    id: string;
    customerId: string;
    policyId: string;
    incidentDate: string;
    location: ClaimLocation;
    description: string;
    amount: number;
    damageType: DamageType;
    documents: string[];
    status: ClaimStatus;
    approvedAmount?: number;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    agent_id: string;
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
}

export interface ClaimListResponse {
    claims: Claim[];
    total: number;
    lastDoc?: any;
}

// Helper function to convert form data to claim data
export const convertFormDataToClaim = (formData: ClaimFormData): Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'agent_id' | 'status'> => {
    return {
        ...formData,
    };
}; 