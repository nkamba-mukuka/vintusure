import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, functions } from './config';

// Export the functions instance
export { functions };

// Helper function to get the current user's ID token
export const getIdToken = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No user logged in');
    }
    return user.getIdToken();
};

// Define function types
export interface AIGenerationRequest {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIGenerationResponse {
    text: string;
    success: boolean;
    error?: string;
}

// Define callable functions
export const generateAIContent = httpsCallable<AIGenerationRequest, AIGenerationResponse>(
    functions,
    'generateAIContent'
);

export const analyzeCarPhoto = httpsCallable(functions, 'analyzeCarPhoto');
export const indexDocument = httpsCallable(functions, 'indexDocument');
export const queryRAG = httpsCallable(functions, 'queryRAG');
export const healthCheck = httpsCallable(functions, 'healthCheck');

// Premium calculation function
export const calculatePremium = httpsCallable<{
    vehicleValue: number;
    vehicleType: string;
    usage: 'private' | 'commercial';
    coverageType: 'comprehensive' | 'third_party';
}, {
    premium: number;
    breakdown: {
        basePremium: number;
        taxes: number;
        fees: number;
    };
}>(functions, 'calculatePremium');

// Claim notification function
export const sendClaimNotification = httpsCallable<{
    claimId: string;
    type: 'submission' | 'update' | 'approval' | 'rejection';
    recipientId: string;
}, {
    success: boolean;
    messageId?: string;
    error?: string;
}>(functions, 'sendClaimNotification');

// Policy expiry notification function
export const sendPolicyExpiryNotification = httpsCallable<{
    policyId: string;
    daysUntilExpiry: number;
    recipientId: string;
}, {
    success: boolean;
    messageId?: string;
    error?: string;
}>(functions, 'sendPolicyExpiryNotification');

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZM', {
        style: 'currency',
        currency: 'ZMW',
    }).format(amount);
};

// Helper function to calculate days until expiry
export const calculateDaysUntilExpiry = (expiryDate: Date): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 