import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

export interface CarDetails {
    make: string;
    model: string;
    makeAndModel?: string;
    estimatedYear: number;
    bodyType: string;
    condition: string;
    estimatedValue: number | null; // Can be null if value not found
    researchSources?: string[]; // URLs or descriptions of where value was researched
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

// Minimum values in Zambian Kwacha (only used as absolute last resort)
const MIN_CAR_VALUE = 50000; // 50,000 ZMW
const MIN_PREMIUM = 2500; // 2,500 ZMW

// Default car research marketplaces in Zambia
const DEFAULT_CAR_MARKETPLACES = [
    {
        name: 'UsedCars.co.zm',
        url: 'https://www.usedcars.co.zm/',
        description: 'Zambia\'s leading used car marketplace'
    },
    {
        name: 'CarYandi',
        url: 'https://www.caryandi.com/en',
        description: 'Find and compare cars in Zambia'
    },
    {
        name: 'Toyota Zambia Automark',
        url: 'https://www.toyotazambia.co.zm/used-cars-automark/',
        description: 'Official Toyota used car marketplace'
    },
    {
        name: 'Facebook Marketplace Lusaka',
        url: 'https://www.facebook.com/marketplace/lusaka',
        description: 'Local car listings in Lusaka'
    }
];

// Function to ensure a minimum value
const ensureMinimumValue = (value: number, minimum: number): number => {
    if (!value || value <= 0) {
        return minimum;
    }
    return Math.max(value, minimum);
};

// Helper function to calculate average price from marketplace listings
function getAveragePriceFromListings(listings: MarketplaceListing[]): number | null {
    if (!listings || listings.length === 0) {
        return null;
    }

    const validPrices = listings
        .map(listing => listing.price)
        .filter(price => price && price > 0);

    if (validPrices.length === 0) {
        return null;
    }

    const average = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    return Math.round(average);
}

// Helper function to calculate default premium based on car value
function calculateDefaultPremium(carValue: number | null): number {
    if (!carValue || carValue <= 0) {
        return 5000; // Default premium for unknown value
    }

    // Premium calculation: 3-5% of car value for comprehensive coverage
    const premiumRate = 0.04; // 4% average
    const calculatedPremium = carValue * premiumRate;
    
    // Ensure minimum and maximum premiums
    const minPremium = 3000;
    const maxPremium = 50000;
    
    return Math.max(minPremium, Math.min(maxPremium, Math.round(calculatedPremium)));
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

            // Ensure we have marketplace recommendations
            if (!result.data.marketplaceRecommendations) {
                result.data.marketplaceRecommendations = {
                    similarListings: [],
                    marketplaces: DEFAULT_CAR_MARKETPLACES
                };
            }

            // Try to get car value from marketplace listings first
            if (result.data.carDetails) {
                const averageMarketPrice = getAveragePriceFromListings(
                    result.data.marketplaceRecommendations.similarListings
                );

                // Update estimated value based on available data
                if (averageMarketPrice) {
                    // If we have market data, use it
                    result.data.carDetails.estimatedValue = averageMarketPrice;
                    result.data.carDetails.researchSources = ['Based on current market listings'];
                } else if (!result.data.carDetails.estimatedValue || result.data.carDetails.estimatedValue <= 0) {
                    // Set to null if no value found
                    result.data.carDetails.estimatedValue = null;
                    result.data.carDetails.researchSources = ['Value not found - please contact an agent for assessment'];
                }
            }

            // Calculate insurance premium based on the researched/estimated car value
            if (result.data.insuranceRecommendation) {
                result.data.insuranceRecommendation.estimatedPremium = calculateDefaultPremium(
                    result.data.carDetails.estimatedValue
                );
            }

            // Ensure we have marketplace links
            if (!result.data.marketplaceRecommendations.marketplaces?.length) {
                result.data.marketplaceRecommendations.marketplaces = DEFAULT_CAR_MARKETPLACES;
            }

            // Ensure car details have proper fallback values
            if (result.data.carDetails) {
                if (!result.data.carDetails.makeAndModel) {
                    result.data.carDetails.makeAndModel = `${result.data.carDetails.make} ${result.data.carDetails.model}`.trim();
                }
                if (!result.data.carDetails.make || result.data.carDetails.make === 'Unknown') {
                    result.data.carDetails.make = 'Vehicle';
                }
                if (!result.data.carDetails.model || result.data.carDetails.model === 'Unknown') {
                    result.data.carDetails.model = 'Not Identified';
                }
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
    validateImageFile(file: File): string | null {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return 'Please upload an image file (JPEG, PNG, etc.)';
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return 'Image size should be less than 5MB';
        }

        return null;
    }
}; 