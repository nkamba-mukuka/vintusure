import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

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

export const carAnalysisService = {
    async analyzeCarPhoto(input: CarPhotoAnalysisInput): Promise<CarAnalysisResult> {
        const analyzeCarPhotoFn = httpsCallable<CarPhotoAnalysisInput, CarAnalysisResult>(
            functions,
            'analyzeCarPhoto'
        );

        try {
            const result = await analyzeCarPhotoFn(input);

            if (!result.data) {
                throw new Error('No data received from analysis');
            }

            return result.data;
        } catch (error) {
            console.error('Error analyzing car photo:', error);

            // Provide more specific error messages
            if (error instanceof Error) {
                if (error.message.includes('CORS')) {
                    throw new Error('Cross-origin request blocked. Please try again.');
                } else if (error.message.includes('timeout')) {
                    throw new Error('Analysis took too long. Please try with a smaller image.');
                } else if (error.message.includes('permission')) {
                    throw new Error('Permission denied. Please check your authentication.');
                }
            }

            throw error;
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