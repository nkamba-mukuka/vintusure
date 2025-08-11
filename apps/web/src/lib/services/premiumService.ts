import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

export interface PremiumCalculationInput {
    vehicleValue: number;
    vehicleType: 'car' | 'truck' | 'motorcycle';
    usage: 'private' | 'commercial';
    coverageType: 'comprehensive' | 'third_party';
    driverAge?: number;
    claimHistory?: number;
    vehicleAge: number;
}

export interface PremiumBreakdown {
    basePremium: number;
    taxes: {
        vat: number;
        levy: number;
    };
    fees: {
        adminFee: number;
        stampDuty: number;
    };
    adjustments: {
        ageDiscount?: number;
        noClaimsBonus?: number;
        vehicleAgeLoading?: number;
        usageLoading?: number;
    };
    total: number;
}

export const premiumService = {
    async calculatePremium(input: PremiumCalculationInput): Promise<PremiumBreakdown> {
        const calculatePremiumFn = httpsCallable<PremiumCalculationInput, PremiumBreakdown>(
            functions,
            'calculatePremium'
        );

        try {
            const result = await calculatePremiumFn(input);
            return result.data;
        } catch (error) {
            console.error('Error calculating premium:', error);
            throw error;
        }
    },

    // Helper function to format currency
    formatCurrency: (amount: number | null): string => {
        if (amount === null) return 'Not Found';
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: 'ZMW',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Helper function to calculate percentage
    calculatePercentage(amount: number, total: number): string {
        return `${((amount / total) * 100).toFixed(1)}%`;
    },
}; 