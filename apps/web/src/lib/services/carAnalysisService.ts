import { functions } from '@/lib/firebase/config';
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';

export interface CarDetails {
    make: string;
    model: string;
    estimatedYear: number;
    bodyType: string;
    condition: string;
    estimatedValue: number;
}

export interface InsuranceRecommendation {
    recommendedCoverage: string;
    estimatedPremium: number;
    coverageDetails: string;
}

export interface MarketplaceListing {
    platform: string;
    url: string;
    price: number;
    description: string;
}

export interface Marketplace {
    name: string;
    url: string;
    description: string;
}

export interface CarAnalysisResult {
    carDetails: CarDetails;
    insuranceRecommendation: InsuranceRecommendation;
    marketplaceRecommendations: {
        similarListings: MarketplaceListing[];
        marketplaces: Marketplace[];
    };
}

export interface CarPhotoAnalysisInput {
    photoBase64: string;
    preferredBudget?: number;
    preferredBodyType?: string;
}

class CarAnalysisError extends Error {
    constructor(message: string, public code?: string, public details?: any) {
        super(message);
        this.name = 'CarAnalysisError';
    }
}

export const carAnalysisService = {
    async analyzeCarPhoto(input: CarPhotoAnalysisInput): Promise<CarAnalysisResult> {
        const analyzeCarPhotoFn = httpsCallable<CarPhotoAnalysisInput, CarAnalysisResult>(
            functions,
            'analyzeCarPhoto'
        );

        try {
            console.log('Calling analyzeCarPhoto function with input:', {
                hasPhoto: !!input.photoBase64,
                photoSize: input.photoBase64?.length,
                preferredBudget: input.preferredBudget,
                preferredBodyType: input.preferredBodyType
            });

            const result = await analyzeCarPhotoFn(input);

            console.log('Received response from analyzeCarPhoto:', {
                hasData: !!result.data,
                dataType: result.data ? typeof result.data : 'undefined',
                data: result.data ? {
                    hasCarDetails: !!result.data.carDetails,
                    hasInsuranceRecommendation: !!result.data.insuranceRecommendation,
                    hasMarketplaceRecommendations: !!result.data.marketplaceRecommendations
                } : null
            });

            if (!result.data) {
                throw new CarAnalysisError('No data received from analysis');
            }

            return result.data;
        } catch (error) {
            console.error('Error analyzing car photo:', {
                error,
                errorType: error?.constructor?.name,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
                errorCode: (error as any)?.code,
                errorDetails: (error as any)?.details,
            });

            // Handle specific error cases
            if (error instanceof Error) {
                if (error.message.includes('CORS')) {
                    throw new CarAnalysisError('Cross-origin request blocked. Please try again.', 'CORS_ERROR', error);
                } else if (error.message.includes('timeout')) {
                    throw new CarAnalysisError('Analysis took too long. Please try with a smaller image.', 'TIMEOUT_ERROR', error);
                } else if (error.message.includes('permission')) {
                    throw new CarAnalysisError('Permission denied. Please check your authentication.', 'PERMISSION_ERROR', error);
                } else if (error.message.includes('invalid-argument')) {
                    throw new CarAnalysisError('Invalid image format or data. Please try a different image.', 'INVALID_INPUT', error);
                } else if (error.message.includes('not-found')) {
                    throw new CarAnalysisError('The requested resource was not found. Please check your configuration.', 'NOT_FOUND', error);
                } else if (error.message.includes('unauthenticated')) {
                    throw new CarAnalysisError('Authentication required. Please sign in and try again.', 'UNAUTHENTICATED', error);
                }
            }

            throw new CarAnalysisError('Failed to analyze car photo. Please try again.', 'UNKNOWN_ERROR', error);
        }
    },

    // Helper function to convert File to base64
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = (error) => reject(error);
        });
    },

    // Helper function to validate image file
    validateImageFile(file: File): { valid: boolean; error?: string } {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                error: 'Invalid file type. Please upload an image file (JPEG, PNG).',
            };
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File too large. Please upload an image smaller than 5MB.',
            };
        }

        return { valid: true };
    },

    // Get recommended marketplaces in Zambia
    getZambianCarMarketplaces(): Array<{ name: string; url: string; description: string }> {
        return [
            {
                name: "JanJapan",
                url: "https://www.janjapan.com",
                description: "Japanese used cars with shipping to Zambia"
            },
            {
                name: "BE FORWARD",
                url: "https://www.beforward.jp",
                description: "Large selection of Japanese used cars with Zambia shipping options"
            },
            {
                name: "Car Zone Zambia",
                url: "https://www.carzonezambia.com",
                description: "Local Zambian car marketplace"
            },
            {
                name: "AutoWorld Zambia",
                url: "https://www.autoworld.co.zm",
                description: "New and used cars in Zambia"
            }
        ];
    }
}; 