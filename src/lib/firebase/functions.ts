import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

const functions = getFunctions(app);

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