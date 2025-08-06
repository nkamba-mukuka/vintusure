import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getFirebaseApp } from './firebase';

// Define the CarAnalysisResult interface here instead of importing
interface CarDetails {
    make: string;
    model: string;
    estimatedYear: number;
    bodyType: string;
    condition: string;
    estimatedValue: number;
}

interface InsuranceRecommendation {
    recommendedCoverage: string;
    estimatedPremium: number;
    coverageDetails: string;
}

interface MarketplaceListing {
    platform: string;
    url: string;
    price: number;
    description: string;
}

interface Marketplace {
    name: string;
    url: string;
    description: string;
}

interface CarAnalysisResult {
    carDetails: CarDetails;
    insuranceRecommendation: InsuranceRecommendation;
    marketplaceRecommendations: {
        similarListings: MarketplaceListing[];
        marketplaces: Marketplace[];
    };
}

// Initialize Firebase Admin SDK
getFirebaseApp();
const db = getFirestore();

// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || '',
    location: 'us-central1',
});

// Security logging
async function logSecurityEvent(event: string, userId: string, details: any) {
    try {
        await db.collection('securityLogs').add({
            event,
            userId,
            details,
            timestamp: FieldValue.serverTimestamp(),
            ip: 'cloud-function', // In production, extract from request context
        });
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}

// Car Analysis Function
export const analyzeCarPhoto = onCall({
    cors: [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
    maxInstances: 10,
    memory: '2GiB',
    region: 'us-central1',
    timeoutSeconds: 180,
}, async (request) => {
    try {
        if (!request.data || !request.data.photoBase64) {
            throw new HttpsError('invalid-argument', 'No image provided');
        }

        const { photoBase64 } = request.data;
        const userId = request.auth?.uid || 'anonymous';

        // Log the request
        await logSecurityEvent('car_analysis_request', userId, {
            hasImage: !!photoBase64
        });

        // Create the Gemini model
        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-pro-vision',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.4,
                top_p: 1,
                top_k: 32,
            },
        });

        // Prepare the prompt
        const prompt = `Analyze this car image and provide detailed information in the following format:
1. Car Details:
   - Make and model
   - Estimated year
   - Body type
   - Condition assessment
   - Estimated value in ZMW (Zambian Kwacha)

2. Insurance Recommendations:
   - Recommended coverage type
   - Estimated annual premium
   - Key coverage points

3. Similar Cars:
   - List 3 similar cars typically available in the Zambian market
   - Include typical price ranges
   - Suggest reliable dealers or platforms

Please be specific and accurate in your assessment. Focus on details visible in the image and common market values in Zambia.`;

        // Get response from Gemini
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    { inline_data: { data: photoBase64, mime_type: 'image/jpeg' } }
                ]
            }]
        });

        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        // Log successful analysis
        await logSecurityEvent('car_analysis_success', userId, {
            responseLength: text.length
        });

        // Parse the response and format it
        const analysis: CarAnalysisResult = {
            carDetails: {
                make: "Toyota", // Extract from response
                model: "Corolla", // Extract from response
                estimatedYear: 2020, // Extract from response
                bodyType: "Sedan", // Extract from response
                condition: "Good", // Extract from response
                estimatedValue: 250000 // Extract from response
            },
            insuranceRecommendation: {
                recommendedCoverage: "Comprehensive", // Extract from response
                estimatedPremium: 15000, // Extract from response
                coverageDetails: "Includes collision, theft, and third-party coverage" // Extract from response
            },
            marketplaceRecommendations: {
                similarListings: [
                    {
                        platform: "BE FORWARD",
                        url: "https://www.beforward.jp",
                        price: 200000,
                        description: "2019 Toyota Corolla - Similar condition"
                    }
                ],
                marketplaces: [
                    {
                        name: "BE FORWARD",
                        url: "https://www.beforward.jp",
                        description: "Japanese used cars with Zambia shipping options"
                    },
                    {
                        name: "Car Zone Zambia",
                        url: "https://www.carzonezambia.com",
                        description: "Local Zambian car marketplace"
                    }
                ]
            }
        };

        return analysis;
    } catch (error) {
        console.error('Error in analyzeCarPhoto:', error);

        // Log error
        const userId = request.auth?.uid || 'anonymous';
        await logSecurityEvent('car_analysis_error', userId, {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw new HttpsError('internal', 'Failed to analyze car photo', error);
    }
}); 