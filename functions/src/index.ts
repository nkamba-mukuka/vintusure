import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { VertexAI } from '@google-cloud/vertexai';
import { onRequest } from 'firebase-functions/v2/https';
import { GoogleAuth } from 'google-auth-library';



// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

interface CarDetails {
    make: string;
    model: string;
    makeAndModel?: string; // Add optional field for combined make and model
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

interface QueryRequest {
    query: string;
    userId?: string;
}

interface QueryResponse {
    answer?: string;
    success: boolean;
    error?: string;
    details?: string;
}





// Car Analysis Function
export const analyzeCarPhoto = onCall({
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
    enforceAppCheck: false,
    maxInstances: 10,
    memory: '2GiB',
    region: 'us-central1',
    timeoutSeconds: 180,
}, async (request) => {
    try {
        console.log('Car analysis request received:', {
            hasData: !!request.data,
            hasPhoto: !!request.data?.photoBase64,
            photoSize: request.data?.photoBase64?.length || 0,
            userId: request.auth?.uid || 'anonymous'
        });

        if (!request.data || !request.data.photoBase64) {
            throw new HttpsError('invalid-argument', 'No image provided');
        }

        const { photoBase64 } = request.data;
        const userId = request.auth?.uid || 'anonymous';

        // Validate base64 data
        if (photoBase64.length < 100) {
            throw new HttpsError('invalid-argument', 'Invalid image data provided');
        }

        console.log('Starting car analysis for user:', userId);

        // Initialize Vertex AI
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new VertexAI({ project, location });

        // Create Gemini model with fallback options
        let model;
        try {
            model = vertexAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
                generation_config: {
                    max_output_tokens: 2048,
                    temperature: 0.4,
                    top_p: 1,
                    top_k: 32,
                },
            });
        } catch (modelError) {
            console.error('Error creating Gemini model:', modelError);
            // Fallback to gemini-1.5-flash if 2.5 is not available
            model = vertexAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generation_config: {
                    max_output_tokens: 2048,
                    temperature: 0.4,
                    top_p: 1,
                    top_k: 32,
                },
            });
        }

        // Prepare the prompt
        const prompt = `You are an expert car appraiser and insurance advisor in Zambia. Analyze this car image and provide detailed information in the following JSON format:

{
  "carDetails": {
    "makeAndModel": "Make and Model",
    "year": 2020,
    "bodyType": "SUV/Sedan/Hatchback/etc",
    "condition": "Good/Fair/Excellent",
    "estimatedValue": 150000
  },
  "insurance": {
    "coverageType": "Comprehensive/Third Party",
    "estimatedPremium": 7500,
    "coveragePoints": [
      "Point 1",
      "Point 2",
      "Point 3"
    ]
  },
  "similarCars": [
    {
      "model": "Similar Car Model",
      "priceRange": "120000-180000"
    }
  ]
}

Please be specific and accurate in your assessment. Focus on the Zambian market context and local insurance requirements. Return only valid JSON.`;

        console.log('Sending request to Gemini...');

        // Get response from Gemini
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: 'image/jpeg', data: photoBase64 } }
                ]
            }]
        });

        // Wait for the response to be ready
        const response = await result.response;
        const answer = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            console.error('No text content in Gemini response:', response);
            throw new Error('No response from Gemini');
        }

        // Log the raw response for debugging
        console.log('Raw Gemini response:', answer.substring(0, 200) + '...');

        // Try to parse as JSON first
        let parsedResponse;
        try {
            // Extract JSON from the response (remove any markdown formatting)
            const jsonMatch = answer.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed JSON response');
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (jsonError) {
            console.log('JSON parsing failed, falling back to text parsing:', jsonError);
            // Fallback to text parsing
            parsedResponse = parseGeminiResponse(answer);
        }

        // Validate and structure the response
        const structuredResponse = structureCarAnalysisResponse(parsedResponse);

        // Log the final response for debugging
        console.log('Final structured response:', JSON.stringify(structuredResponse, null, 2));

        return structuredResponse;

    } catch (error) {
        console.error('Error in analyzeCarPhoto:', error);
        
        // Return a fallback response instead of throwing an error
        const fallbackResponse = createFallbackResponse();
        console.log('Returning fallback response due to error');
        
        return fallbackResponse;
    }
});

// Helper function to structure the car analysis response
function structureCarAnalysisResponse(parsedData: any): CarAnalysisResult {
    try {
        return {
            carDetails: {
                make: parsedData.carDetails?.make || 'Unknown',
                model: parsedData.carDetails?.model || 'Unknown',
                makeAndModel: parsedData.carDetails?.makeAndModel || 'Vehicle Not Identified',
                estimatedYear: parsedData.carDetails?.year || new Date().getFullYear(),
                bodyType: parsedData.carDetails?.bodyType || 'Unknown',
                condition: parsedData.carDetails?.condition || 'Unknown',
                estimatedValue: parsedData.carDetails?.estimatedValue || 0
            },
            insuranceRecommendation: {
                recommendedCoverage: parsedData.insurance?.coverageType || 'Comprehensive',
                estimatedPremium: parsedData.insurance?.estimatedPremium || 5000,
                coverageDetails: parsedData.insurance?.coveragePoints?.join(', ') || 'Third-party liability coverage, Personal accident coverage, Medical expenses coverage'
            },
            marketplaceRecommendations: {
                similarListings: (parsedData.similarCars || []).map((car: any) => ({
                    platform: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    price: 0, // Will be calculated from priceRange if available
                    description: car.model || 'Similar vehicle in market'
                })),
                marketplaces: [
                    {
                        name: "Toyota Zambia AutoMark",
                        url: "https://www.toyotazambia.co.zm/used-cars-automark/",
                        description: "Official Toyota certified used vehicles in Zambia"
                    },
                    {
                        name: "Used Cars Zambia",
                        url: "https://www.usedcars.co.zm/",
                        description: "Largest used car marketplace in Zambia"
                    },
                    {
                        name: "Car Yandi",
                        url: "https://www.caryandi.com/en",
                        description: "International car marketplace with Zambian imports"
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error structuring response:', error);
        return createFallbackResponse();
    }
}

// Helper function to create a fallback response
function createFallbackResponse(): CarAnalysisResult {
    return {
        carDetails: {
            make: 'Unknown',
            model: 'Unknown',
            makeAndModel: 'Vehicle Analysis Unavailable',
            estimatedYear: new Date().getFullYear(),
            bodyType: 'Unknown',
            condition: 'Unknown',
            estimatedValue: 0
        },
        insuranceRecommendation: {
            recommendedCoverage: 'Comprehensive',
            estimatedPremium: 5000,
            coverageDetails: 'Third-party liability coverage, Personal accident coverage, Medical expenses coverage, Please contact an agent for detailed assessment'
        },
        marketplaceRecommendations: {
            similarListings: [
                {
                    platform: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    price: 0,
                    description: "Contact agent for market comparison"
                }
            ],
            marketplaces: [
                {
                    name: "Toyota Zambia AutoMark",
                    url: "https://www.toyotazambia.co.zm/used-cars-automark/",
                    description: "Official Toyota certified used vehicles in Zambia"
                },
                {
                    name: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    description: "Largest used car marketplace in Zambia"
                },
                {
                    name: "Car Yandi",
                    url: "https://www.caryandi.com/en",
                    description: "International car marketplace with Zambian imports"
                }
            ]
        }
    };
}

// Employee Question-Answering Function
export const askQuestion = onCall<QueryRequest, Promise<QueryResponse>>({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
}, async (request) => {
    try {
        console.log('Received question request:', request.data);

        // Extract user ID from Firebase Auth context
        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};

        // Validate input
        if (!query) {
            console.error('No query provided');
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }

        // Create context-aware prompt
        const prompt = `You are VintuSure's AI Insurance Assistant. You help employees with insurance-related questions.
        
Context:
- You work for VintuSure, a Zambian insurtech company
- You understand Zambian insurance regulations and market
- You have access to common insurance terms and procedures
- You can help with policy questions, claims processes, and general insurance advice
- Always consider Zambian context and local market conditions

Question from employee: ${query}

Please provide a detailed, professional response that:
1. Directly addresses the question
2. References relevant insurance concepts
3. Considers Zambian insurance context
4. Provides practical, actionable information
5. Includes any relevant policy or regulatory considerations`;

        console.log('Sending prompt to Gemini:', prompt);

        // Initialize Vertex AI
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new VertexAI({ project, location });

        // Create Gemini model
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.3,
                top_p: 0.8,
                top_k: 40,
            },
        });

        // Get response from Gemini
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // Wait for the response to be ready
        const response = await result.response;
        console.log('Received response from Gemini:', response);

        const answer = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            console.error('No text content in Gemini response:', response);
            return {
                success: false,
                error: 'Failed to generate response',
                details: 'No content received from AI'
            };
        }

        // Log the response
        console.log('Generated answer:', answer);

        // Sanitize the answer
        const sanitizedAnswer = answer
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .substring(0, 4000); // Limit answer length

        // Log successful query
        await db.collection('queryLogs').add({
            userId,
            query,
            answer: sanitizedAnswer,
            timestamp: FieldValue.serverTimestamp(),
            success: true
        });

        return {
            success: true,
            answer: sanitizedAnswer
        };
    } catch (error) {
        console.error('Error in askQuestion:', error);

        // Log error
        await db.collection('queryLogs').add({
            userId: request.auth?.uid || 'anonymous',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: FieldValue.serverTimestamp(),
            success: false,
        });

        return {
            success: false,
            error: 'Failed to process query',
            details: error instanceof Error ? error.message : 'An internal error occurred'
        };
    }
});

// Helper function to parse Gemini's response text into structured data
function parseGeminiResponse(text: string): CarAnalysisResult {
    console.log('Starting to parse response text:', text.substring(0, 100) + '...');

    const sections = text.split(/\d+\./);
    console.log('Found sections:', sections.length);

    const result: CarAnalysisResult = {
        carDetails: {
            make: '',
            model: '',
            estimatedYear: new Date().getFullYear(),
            bodyType: '',
            condition: '',
            estimatedValue: 0,
        },
        insuranceRecommendation: {
            recommendedCoverage: '',
            estimatedPremium: 0,
            coverageDetails: '',
        },
        marketplaceRecommendations: {
            similarListings: [],
            marketplaces: [
                {
                    name: "Toyota Zambia AutoMark",
                    url: "https://www.toyotazambia.co.zm/used-cars-automark/",
                    description: "Official Toyota certified used vehicles in Zambia"
                },
                {
                    name: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    description: "Largest used car marketplace in Zambia"
                },
                {
                    name: "Car Yandi",
                    url: "https://www.caryandi.com/en",
                    description: "International car marketplace with Zambian imports"
                },
                {
                    name: "BE FORWARD",
                    url: "https://www.beforward.jp",
                    description: "Japanese used cars with direct shipping to Zambia"
                },
                {
                    name: "Facebook Marketplace Lusaka",
                    url: "https://www.facebook.com/marketplace/lusaka",
                    description: "Local listings in Lusaka area"
                }
            ]
        }
    };

    try {
        // Parse Car Details
        if (sections[1]) {
            console.log('Parsing car details section:', sections[1].substring(0, 100) + '...');
            const carDetails = sections[1];

            // Extract make and model
            const makeModelMatch = carDetails.match(/(?:make|model|vehicle)[:\s]+([^\n]+)/i);
            if (makeModelMatch) {
                console.log('Found make/model:', makeModelMatch[1]);
                const makeModel = makeModelMatch[1].trim();
                const [make, ...modelParts] = makeModel.split(' ');
                result.carDetails.make = make || 'Unknown Make';
                result.carDetails.model = modelParts.join(' ') || 'Unknown Model';
            }

            // Extract year
            const yearMatch = carDetails.match(/(?:year|manufactured|made in|built in)[:\s]+(\d{4})/i);
            if (yearMatch) {
                console.log('Found year:', yearMatch[1]);
                const year = parseInt(yearMatch[1]);
                if (year >= 1900 && year <= new Date().getFullYear()) {
                    result.carDetails.estimatedYear = year;
                }
            }

            // Extract body type
            const bodyTypeMatch = carDetails.match(/(?:body\s*type|style|configuration)[:\s]+([^\n.,]+)/i);
            result.carDetails.bodyType = bodyTypeMatch ? bodyTypeMatch[1].trim() : '';
            console.log('Found body type:', result.carDetails.bodyType);

            // Extract condition
            const conditionMatch = carDetails.match(/(?:condition|state)[:\s]+([^\n.,]+)/i);
            result.carDetails.condition = conditionMatch ? conditionMatch[1].trim() : '';
            console.log('Found condition:', result.carDetails.condition);

            // Extract value
            const valueMatch = carDetails.match(/(?:value|price|worth|cost|estimated)[:\s]+(?:ZMW|K|ZK|K\s+)?(\d[\d,]*)/i);
            if (valueMatch) {
                console.log('Found value:', valueMatch[1]);
                const valueStr = valueMatch[1].replace(/,/g, '');
                result.carDetails.estimatedValue = parseInt(valueStr) || 0;
            }
        }

        // Parse Insurance Recommendations
        if (sections[2]) {
            console.log('Parsing insurance section:', sections[2].substring(0, 100) + '...');
            const insurance = sections[2];

            // Extract coverage type
            const coverageMatch = insurance.match(/(?:coverage|insurance)\s*type[:\s]+([^\n.,]+)/i);
            result.insuranceRecommendation.recommendedCoverage = coverageMatch ? coverageMatch[1].trim() : 'Comprehensive';
            console.log('Found coverage type:', result.insuranceRecommendation.recommendedCoverage);

            // Extract premium
            const premiumMatch = insurance.match(/(?:premium|cost|payment)[:\s]+(?:ZMW|K|ZK|K\s+)?(\d[\d,]*)/i);
            if (premiumMatch) {
                console.log('Found premium:', premiumMatch[1]);
                const premiumStr = premiumMatch[1].replace(/,/g, '');
                result.insuranceRecommendation.estimatedPremium = parseInt(premiumStr) || 0;
            }

            // Extract coverage details
            const detailsMatch = insurance.match(/(?:coverage details|includes|policy)[:\s]+([^\n]+)/i);
            result.insuranceRecommendation.coverageDetails = detailsMatch ? detailsMatch[1].trim() : '';
            console.log('Found coverage details:', result.insuranceRecommendation.coverageDetails);
        }

        // Parse Similar Cars
        if (sections[3]) {
            console.log('Parsing similar cars section:', sections[3].substring(0, 100) + '...');
            const similar = sections[3];

            // Look for listings with prices
            const listings = similar.match(/(?:^\s*|[\n\r]+\s*)[•*-]\s*([^\n]+)/gm) || [];
            console.log('Found listings:', listings.length);

            result.marketplaceRecommendations.similarListings = listings.map(listing => {
                const priceMatch = listing.match(/(?:ZMW|K|ZK|K\s+)?(\d[\d,]*)/);
                const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;

                return {
                    platform: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    price,
                    description: listing.trim().replace(/^[•*-]\s*/, '')
                };
            }).filter(listing => listing.price > 0);
        }

    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        throw error; // Re-throw to be caught by the main function
    }

    // Log final result
    console.log('Final parsed result:', JSON.stringify(result, null, 2));

    return result;
}

// Customer interface matching the frontend types
interface Customer {
    id: string;
    nrcPassport: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
    };
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    occupation: string;
    createdAt: any;
    updatedAt: any;
    createdBy: string;
    agent_id: string;
    status: 'active' | 'inactive';
}

// Customer Data Indexing Function - Triggered when a new customer is created
export const indexCustomerData = onDocumentCreated({
    document: 'customers/{customerId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const customerId = event.params.customerId;
        const customerData = event.data?.data() as Customer;

        if (!customerData) {
            console.error('No customer data found in document');
            return;
        }

        console.log(`Processing customer data for indexing: ${customerId}`);

        // Extract and concatenate relevant customer data for embedding
        const customerText = createCustomerEmbeddingText(customerData);

        console.log(`Generated customer text for embedding: ${customerText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(customerText);

        console.log(`Generated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Vertex AI Vector Search
        await upsertCustomerVector(customerId, embedding, customerText);

        console.log(`Successfully indexed customer ${customerId} to Vector Search`);

        // Update the customer document with indexing status
        await db.collection('customers').doc(customerId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: customerText
        });

    } catch (error) {
        console.error(`Error indexing customer ${event.params.customerId}:`, error);
        
        // Update the customer document with error status
        await db.collection('customers').doc(event.params.customerId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Claims Data Indexing Function - Triggered when a new claim is created
export const indexClaimData = onDocumentCreated({
    document: 'claims/{claimId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const claimId = event.params.claimId;
        const claimData = event.data?.data() as Claim;

        if (!claimData) {
            console.error('No claim data found in document');
            return;
        }

        console.log(`Processing claim data for indexing: ${claimId}`);

        // Extract and concatenate relevant claim data for embedding
        const claimText = createClaimEmbeddingText(claimData);

        console.log(`Generated claim text for embedding: ${claimText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(claimText);

        console.log(`Generated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Claims Vector Search
        await upsertClaimVector(claimId, embedding, claimText);

        console.log(`Successfully indexed claim ${claimId} to Vector Search`);

        // Update the claim document with indexing status
        await db.collection('claims').doc(claimId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: claimText
        });

    } catch (error) {
        console.error(`Error indexing claim ${event.params.claimId}:`, error);
        
        // Update the claim document with error status
        await db.collection('claims').doc(event.params.claimId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Policies Data Indexing Function - Triggered when a new policy is created
export const indexPolicyData = onDocumentCreated({
    document: 'policies/{policyId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const policyId = event.params.policyId;
        const policyData = event.data?.data() as Policy;

        if (!policyData) {
            console.error('No policy data found in document');
            return;
        }

        console.log(`Processing policy data for indexing: ${policyId}`);

        // Extract and concatenate relevant policy data for embedding
        const policyText = createPolicyEmbeddingText(policyData);

        console.log(`Generated policy text for embedding: ${policyText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(policyText);

        console.log(`Generated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Policies Vector Search
        await upsertPolicyVector(policyId, embedding, policyText);

        console.log(`Successfully indexed policy ${policyId} to Vector Search`);

        // Update the policy document with indexing status
        await db.collection('policies').doc(policyId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: policyText
        });

    } catch (error) {
        console.error(`Error indexing policy ${event.params.policyId}:`, error);
        
        // Update the policy document with error status
        await db.collection('policies').doc(event.params.policyId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Documents Data Indexing Function - Triggered when a new document is created
export const indexDocumentData = onDocumentCreated({
    document: 'documents/{documentId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const documentId = event.params.documentId;
        const documentData = event.data?.data() as Document;

        if (!documentData) {
            console.error('No document data found in document');
            return;
        }

        console.log(`Processing document data for indexing: ${documentId}`);

        // Extract and concatenate relevant document data for embedding
        const documentText = createDocumentEmbeddingText(documentData);

        console.log(`Generated document text for embedding: ${documentText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(documentText);

        console.log(`Generated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Documents Vector Search
        await upsertDocumentVector(documentId, embedding, documentText);

        console.log(`Successfully indexed document ${documentId} to Vector Search`);

        // Update the document with indexing status
        await db.collection('documents').doc(documentId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: documentText
        });

    } catch (error) {
        console.error(`Error indexing document ${event.params.documentId}:`, error);
        
        // Update the document with error status
        await db.collection('documents').doc(event.params.documentId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// ============================================================================
// STREAMING UPDATE TRIGGERS - Real-time indexing on document updates
// ============================================================================

// Customer Data Update Indexing Function - Triggered when a customer is updated
export const updateCustomerIndex = onDocumentUpdated({
    document: 'customers/{customerId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const customerId = event.params.customerId;
        const beforeData = event.data?.before.data() as Customer;
        const afterData = event.data?.after.data() as Customer;

        if (!afterData) {
            console.error('No customer data found in updated document');
            return;
        }

        // Check if relevant fields have changed to avoid unnecessary re-indexing
        const relevantFieldsChanged = 
            beforeData?.firstName !== afterData.firstName ||
            beforeData?.lastName !== afterData.lastName ||
            beforeData?.email !== afterData.email ||
            beforeData?.occupation !== afterData.occupation ||
            beforeData?.address?.city !== afterData.address?.city ||
            beforeData?.status !== afterData.status;

        if (!relevantFieldsChanged) {
            console.log(`No relevant fields changed for customer ${customerId}, skipping re-indexing`);
            return;
        }

        console.log(`Processing customer update for re-indexing: ${customerId}`);

        // Extract and concatenate relevant customer data for embedding
        const customerText = createCustomerEmbeddingText(afterData);

        console.log(`Generated updated customer text for embedding: ${customerText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(customerText);

        console.log(`Generated updated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Vertex AI Vector Search
        await upsertCustomerVector(customerId, embedding, customerText);

        console.log(`Successfully re-indexed customer ${customerId} to Vector Search`);

        // Update the customer document with indexing status
        await db.collection('customers').doc(customerId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: customerText,
            vectorIndexingError: null // Clear any previous errors
        });

    } catch (error) {
        console.error(`Error re-indexing customer ${event.params.customerId}:`, error);
        
        // Update the customer document with error status
        await db.collection('customers').doc(event.params.customerId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Claims Data Update Indexing Function - Triggered when a claim is updated
export const updateClaimIndex = onDocumentUpdated({
    document: 'claims/{claimId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const claimId = event.params.claimId;
        const beforeData = event.data?.before.data() as Claim;
        const afterData = event.data?.after.data() as Claim;

        if (!afterData) {
            console.error('No claim data found in updated document');
            return;
        }

        // Check if relevant fields have changed to avoid unnecessary re-indexing
        const relevantFieldsChanged = 
            beforeData?.description !== afterData.description ||
            beforeData?.status !== afterData.status ||
            beforeData?.damageType !== afterData.damageType ||
            beforeData?.amount !== afterData.amount ||
            beforeData?.location?.address !== afterData.location?.address;

        if (!relevantFieldsChanged) {
            console.log(`No relevant fields changed for claim ${claimId}, skipping re-indexing`);
            return;
        }

        console.log(`Processing claim update for re-indexing: ${claimId}`);

        // Extract and concatenate relevant claim data for embedding
        const claimText = createClaimEmbeddingText(afterData);

        console.log(`Generated updated claim text for embedding: ${claimText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(claimText);

        console.log(`Generated updated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Claims Vector Search
        await upsertClaimVector(claimId, embedding, claimText);

        console.log(`Successfully re-indexed claim ${claimId} to Vector Search`);

        // Update the claim document with indexing status
        await db.collection('claims').doc(claimId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: claimText,
            vectorIndexingError: null // Clear any previous errors
        });

    } catch (error) {
        console.error(`Error re-indexing claim ${event.params.claimId}:`, error);
        
        // Update the claim document with error status
        await db.collection('claims').doc(event.params.claimId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Policies Data Update Indexing Function - Triggered when a policy is updated
export const updatePolicyIndex = onDocumentUpdated({
    document: 'policies/{policyId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const policyId = event.params.policyId;
        const beforeData = event.data?.before.data() as Policy;
        const afterData = event.data?.after.data() as Policy;

        if (!afterData) {
            console.error('No policy data found in updated document');
            return;
        }

        // Check if relevant fields have changed to avoid unnecessary re-indexing
        const relevantFieldsChanged = 
            beforeData?.type !== afterData.type ||
            beforeData?.status !== afterData.status ||
            beforeData?.vehicle?.make !== afterData.vehicle?.make ||
            beforeData?.vehicle?.model !== afterData.vehicle?.model ||
            beforeData?.vehicle?.registrationNumber !== afterData.vehicle?.registrationNumber ||
            beforeData?.premium?.amount !== afterData.premium?.amount;

        if (!relevantFieldsChanged) {
            console.log(`No relevant fields changed for policy ${policyId}, skipping re-indexing`);
            return;
        }

        console.log(`Processing policy update for re-indexing: ${policyId}`);

        // Extract and concatenate relevant policy data for embedding
        const policyText = createPolicyEmbeddingText(afterData);

        console.log(`Generated updated policy text for embedding: ${policyText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(policyText);

        console.log(`Generated updated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Policies Vector Search
        await upsertPolicyVector(policyId, embedding, policyText);

        console.log(`Successfully re-indexed policy ${policyId} to Vector Search`);

        // Update the policy document with indexing status
        await db.collection('policies').doc(policyId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: policyText,
            vectorIndexingError: null // Clear any previous errors
        });

    } catch (error) {
        console.error(`Error re-indexing policy ${event.params.policyId}:`, error);
        
        // Update the policy document with error status
        await db.collection('policies').doc(event.params.policyId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// Documents Data Update Indexing Function - Triggered when a document is updated
export const updateDocumentIndex = onDocumentUpdated({
    document: 'documents/{documentId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const documentId = event.params.documentId;
        const beforeData = event.data?.before.data() as Document;
        const afterData = event.data?.after.data() as Document;

        if (!afterData) {
            console.error('No document data found in updated document');
            return;
        }

        // Check if relevant fields have changed to avoid unnecessary re-indexing
        const relevantFieldsChanged = 
            beforeData?.fileName !== afterData.fileName ||
            beforeData?.description !== afterData.description ||
            beforeData?.category !== afterData.category ||
            beforeData?.tags?.join(',') !== afterData.tags?.join(',') ||
            beforeData?.extractedText !== afterData.extractedText;

        if (!relevantFieldsChanged) {
            console.log(`No relevant fields changed for document ${documentId}, skipping re-indexing`);
            return;
        }

        console.log(`Processing document update for re-indexing: ${documentId}`);

        // Extract and concatenate relevant document data for embedding
        const documentText = createDocumentEmbeddingText(afterData);

        console.log(`Generated updated document text for embedding: ${documentText}`);

        // Generate embedding using Vertex AI
        const embedding = await generateCustomerEmbedding(documentText);

        console.log(`Generated updated embedding vector of length: ${embedding.length}`);

        // Upsert the embedding to Documents Vector Search
        await upsertDocumentVector(documentId, embedding, documentText);

        console.log(`Successfully re-indexed document ${documentId} to Vector Search`);

        // Update the document with indexing status
        await db.collection('documents').doc(documentId).update({
            vectorIndexed: true,
            vectorIndexedAt: FieldValue.serverTimestamp(),
            embeddingText: documentText,
            vectorIndexingError: null // Clear any previous errors
        });

    } catch (error) {
        console.error(`Error re-indexing document ${event.params.documentId}:`, error);
        
        // Update the document with error status
        await db.collection('documents').doc(event.params.documentId).update({
            vectorIndexed: false,
            vectorIndexingError: error instanceof Error ? error.message : 'Unknown error',
            vectorIndexedAt: FieldValue.serverTimestamp()
        });

        throw error;
    }
});

// ============================================================================
// STREAMING DELETE TRIGGERS - Real-time cleanup on document deletion
// ============================================================================

// Customer Data Delete Indexing Function - Triggered when a customer is deleted
export const deleteCustomerIndex = onDocumentDeleted({
    document: 'customers/{customerId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const customerId = event.params.customerId;
        const customerData = event.data?.data() as Customer;

        console.log(`Processing customer deletion for index cleanup: ${customerId}`);

        // Remove the customer vector from Vertex AI Vector Search
        await deleteCustomerVector(customerId);

        console.log(`Successfully removed customer ${customerId} from Vector Search`);

    } catch (error) {
        console.error(`Error removing customer ${event.params.customerId} from index:`, error);
        // Don't throw error for delete operations as the document is already gone
    }
});

// Claims Data Delete Indexing Function - Triggered when a claim is deleted
export const deleteClaimIndex = onDocumentDeleted({
    document: 'claims/{claimId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const claimId = event.params.claimId;
        const claimData = event.data?.data() as Claim;

        console.log(`Processing claim deletion for index cleanup: ${claimId}`);

        // Remove the claim vector from Vertex AI Vector Search
        await deleteClaimVector(claimId);

        console.log(`Successfully removed claim ${claimId} from Vector Search`);

    } catch (error) {
        console.error(`Error removing claim ${event.params.claimId} from index:`, error);
        // Don't throw error for delete operations as the document is already gone
    }
});

// Policies Data Delete Indexing Function - Triggered when a policy is deleted
export const deletePolicyIndex = onDocumentDeleted({
    document: 'policies/{policyId}',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 60,
}, async (event) => {
    try {
        const policyId = event.params.policyId;
        const policyData = event.data?.data() as Policy;

        console.log(`Processing policy deletion for index cleanup: ${policyId}`);

        // Remove the policy vector from Vertex AI Vector Search
        await deletePolicyVector(policyId);

        console.log(`Successfully removed policy ${policyId} from Vector Search`);

    } catch (error) {
        console.error(`Error removing policy ${event.params.policyId} from index:`, error);
        // Don't throw error for delete operations as the document is already gone
    }
});

// Helper function to create searchable text from customer data
function createCustomerEmbeddingText(customer: Customer): string {
    const addressText = `${customer.address.street}, ${customer.address.city}, ${customer.address.province}, ${customer.address.postalCode}`;
    
    return [
        `Customer Name: ${customer.firstName} ${customer.lastName}`,
        `ID Document: ${customer.nrcPassport}`,
        `Email: ${customer.email}`,
        `Phone: ${customer.phone}`,
        `Address: ${addressText}`,
        `Date of Birth: ${customer.dateOfBirth}`,
        `Gender: ${customer.gender}`,
        `Occupation: ${customer.occupation}`,
        `Status: ${customer.status}`
    ].join('. ');
}

// Helper function to create searchable text from claim data
function createClaimEmbeddingText(claim: Claim): string {
    return [
        `Claim ID: ${claim.id}`,
        `Policy ID: ${claim.policyId}`,
        `Customer ID: ${claim.customerId}`,
        `Incident Date: ${claim.incidentDate}`,
        `Description: ${claim.description}`,
        `Location: ${claim.location.address}`,
        `Damage Type: ${claim.damageType}`,
        `Status: ${claim.status}`,
        `Amount: ${claim.amount}`,
        `Approved Amount: ${claim.approvedAmount || 'Not approved'}`,
        `Review Notes: ${claim.reviewNotes || 'No notes'}`
    ].join('. ');
}

// Helper function to create searchable text from policy data
function createPolicyEmbeddingText(policy: Policy): string {
    const startDate = policy.startDate?.toDate ? policy.startDate.toDate().toISOString().split('T')[0] : policy.startDate;
    const endDate = policy.endDate?.toDate ? policy.endDate.toDate().toISOString().split('T')[0] : policy.endDate;
    
    return [
        `Policy ID: ${policy.id}`,
        `Policy Number: ${policy.policyNumber}`,
        `Customer ID: ${policy.customerId}`,
        `Type: ${policy.type}`,
        `Status: ${policy.status}`,
        `Vehicle: ${policy.vehicle.make} ${policy.vehicle.model} ${policy.vehicle.year} (${policy.vehicle.registrationNumber})`,
        `Vehicle Value: ${policy.vehicle.value}`,
        `Usage: ${policy.vehicle.usage}`,
        `Start Date: ${startDate}`,
        `End Date: ${endDate}`,
        `Premium: ${policy.premium.amount} ${policy.premium.currency}`,
        `Payment Status: ${policy.premium.paymentStatus}`,
        `Payment Method: ${policy.premium.paymentMethod}`
    ].join('. ');
}

// Helper function to create searchable text from document data
function createDocumentEmbeddingText(document: Document): string {
    const uploadDate = document.uploadedAt?.toDate ? document.uploadedAt.toDate().toISOString().split('T')[0] : document.uploadedAt;
    
    const baseText = [
        `Document ID: ${document.id}`,
        `File Name: ${document.fileName}`,
        `File Type: ${document.fileType}`,
        `File Size: ${document.fileSize} bytes`,
        `Category: ${document.category}`,
        `Description: ${document.description || 'No description'}`,
        `Tags: ${document.tags.join(', ') || 'No tags'}`,
        `Upload Date: ${uploadDate}`,
        `Uploaded By: ${document.uploadedBy}`
    ];

    // Add extracted text if available
    if (document.extractedText) {
        baseText.push(`Extracted Content: ${document.extractedText.substring(0, 1000)}...`);
    }

    // Add metadata if available
    if (document.metadata) {
        if (document.metadata.author) baseText.push(`Author: ${document.metadata.author}`);
        if (document.metadata.subject) baseText.push(`Subject: ${document.metadata.subject}`);
        if (document.metadata.keywords?.length) baseText.push(`Keywords: ${document.metadata.keywords.join(', ')}`);
        if (document.metadata.language) baseText.push(`Language: ${document.metadata.language}`);
        if (document.metadata.pageCount) baseText.push(`Pages: ${document.metadata.pageCount}`);
    }

    return baseText.join('. ');
}

// Generate embedding using Vertex AI Embeddings API
async function generateCustomerEmbedding(text: string): Promise<number[]> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';

        console.log('Generating real embedding for text:', text.substring(0, 100) + '...');

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for embeddings');
        }

        // Prepare the embeddings API request
        const embeddingsUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/text-embedding-004:predict`;
        
        const requestBody = {
            instances: [
                {
                    content: text,
                    task_type: "RETRIEVAL_DOCUMENT",
                    title: "Customer Information"
                }
            ]
        };

        console.log('Making embeddings API request...');

        const response = await fetch(embeddingsUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Embeddings API failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Embeddings API response received');

        // Extract the embedding vector from the response
        if (!result.predictions || !result.predictions[0] || !result.predictions[0].embeddings) {
            throw new Error('Invalid embeddings response format');
        }

        const embedding = result.predictions[0].embeddings.values;
        
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error('Invalid embedding vector in response');
        }

        console.log(`✅ Generated real embedding with ${embedding.length} dimensions`);
        return embedding;

    } catch (error) {
        console.error('Error generating customer embedding:', error);
        
        // Fallback to mock embedding if API fails (for development)
        console.log('Falling back to mock embedding due to error');
        const mockEmbedding = Array.from({ length: 768 }, (_, i) => {
            return Math.sin(text.charCodeAt(i % text.length) + i) * 0.1;
        });
        
        console.log(`Generated fallback mock embedding with ${mockEmbedding.length} dimensions`);
        return mockEmbedding;
    }
}

// Upsert customer vector to Vertex AI Vector Search
async function upsertCustomerVector(customerId: string, embedding: number[], text: string): Promise<void> {
    try {
        const project = process.env.GOOGLE_CLOUD_PROJECT || 'vintusure';
        const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        const indexEndpointId = process.env.CUSTOMER_INDEX_ENDPOINT_ID || '5982154694682738688';
        const deployedIndexId = process.env.CUSTOMER_DEPLOYED_INDEX_ID || 'customer_embeddings_deployed';

        console.log('Upserting vector to Vertex AI Vector Search');
        console.log(`Customer ID: ${customerId}`);
        console.log(`Embedding dimensions: ${embedding.length}`);
        console.log(`Text: ${text.substring(0, 100)}...`);
        
        // Validate embedding vector
        if (!embedding || embedding.length === 0) {
            throw new Error('Empty or invalid embedding vector provided');
        }
        
        if (embedding.some(val => typeof val !== 'number' || isNaN(val))) {
            throw new Error('Embedding vector contains invalid numeric values');
        }
        
        console.log('Embedding validation passed:', {
            length: embedding.length,
            minValue: Math.min(...embedding),
            maxValue: Math.max(...embedding),
            sampleValues: embedding.slice(0, 5)
        });

        // Initialize Vertex AI client
        const vertexAI = new VertexAI({ project, location });

        // Prepare the data point for upsert
        const datapoint = {
            datapoint_id: customerId,
            feature_vector: embedding,
            restricts: [
                {
                    namespace: 'customer_type',
                    allow_list: ['customer']
                }
            ],
            numeric_restricts: [],
            crowding_tag: {
                crowding_attribute: 'customer'
            }
        };

        console.log('Preparing vector upsert request...');

        // Note: The VertexAI SDK might not have direct vector search upsert methods
        // We may need to use the REST API or a different approach
        // For now, we'll log the operation and mark it as successful
        
        console.log('Vector upsert operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: customerId,
            vectorDimensions: embedding.length
        });

        // Implement actual REST API call to Vector Search endpoint
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        console.log('Authentication details:', {
            hasToken: !!accessToken.token,
            tokenLength: accessToken.token?.length || 0,
            tokenPrefix: accessToken.token?.substring(0, 20) + '...' || 'none'
        });

        if (!accessToken.token) {
            throw new Error('Failed to get access token');
        }

        // Prepare the upsert request for streaming updates
        const upsertUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:upsertDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapoints: [datapoint]
        };

        console.log('Making upsert request to:', upsertUrl);

        const response = await fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Vector upsert API error details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                errorBody: errorBody,
                requestUrl: upsertUrl,
                requestBody: JSON.stringify(requestBody, null, 2)
            });
            throw new Error(`Vector upsert failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Vector upsert completed successfully:', result);

    } catch (error) {
        console.error('Error upserting customer vector:', error);
        
        // Log detailed error information for debugging
        console.error('Vector upsert error details:', {
            customerId,
            embeddingLength: embedding?.length,
            textLength: text?.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        
        // For now, don't throw the error to prevent customer creation from failing
        // TODO: Fix the underlying vector search issue
        console.warn('Vector upsert failed, but continuing with customer creation');
        
        // You can uncomment the line below to make it fail fast during debugging
        // throw error;
    }
}

// Upsert claim vector to Claims Vector Search
async function upsertClaimVector(claimId: string, embedding: number[], text: string): Promise<void> {
    try {
        const project = process.env.GOOGLE_CLOUD_PROJECT || 'vintusure';
        const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        const indexEndpointId = process.env.CLAIMS_INDEX_ENDPOINT_ID || '979781408580960256';
        const deployedIndexId = process.env.CLAIMS_DEPLOYED_INDEX_ID || 'claims_embeddings_deployed';

        console.log('Upserting claim vector to Vertex AI Vector Search');
        console.log(`Claim ID: ${claimId}`);
        console.log(`Embedding dimensions: ${embedding.length}`);
        console.log(`Text: ${text.substring(0, 100)}...`);
        
        // Validate embedding vector
        if (!embedding || embedding.length === 0) {
            throw new Error('Empty or invalid embedding vector provided');
        }
        
        if (embedding.some(val => typeof val !== 'number' || isNaN(val))) {
            throw new Error('Embedding vector contains invalid numeric values');
        }
        
        console.log('Claim embedding validation passed:', {
            length: embedding.length,
            minValue: Math.min(...embedding),
            maxValue: Math.max(...embedding),
            sampleValues: embedding.slice(0, 5)
        });

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        console.log('Claim authentication details:', {
            hasToken: !!accessToken.token,
            tokenLength: accessToken.token?.length || 0,
            tokenPrefix: accessToken.token?.substring(0, 20) + '...' || 'none'
        });

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector upsert');
        }

        // Prepare the upsert request
        const upsertUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:upsertDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapoints: [
                {
                    datapoint_id: claimId,
                    feature_vector: embedding,
                    restricts: [
                        {
                            namespace: "claim_data",
                            allow_list: ["all"]
                        }
                    ],
                    crowding_tag: "claim"
                }
            ]
        };

        console.log('Preparing claim vector upsert request...');
        console.log('Claim vector upsert operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: claimId,
            vectorDimensions: embedding.length
        });

        console.log('Making claim upsert request to:', upsertUrl);

        const response = await fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Claim vector upsert API error details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                errorBody: errorBody,
                requestUrl: upsertUrl,
                requestBody: JSON.stringify(requestBody, null, 2)
            });
            throw new Error(`Claim vector upsert failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Claim vector upsert completed successfully:', result);

    } catch (error) {
        console.error('Error upserting claim vector:', error);
        
        // Log detailed error information for debugging
        console.error('Claim vector upsert error details:', {
            claimId,
            embeddingLength: embedding?.length,
            textLength: text?.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        
        // For now, don't throw the error to prevent claim creation from failing
        // TODO: Fix the underlying vector search issue
        console.warn('Claim vector upsert failed, but continuing with claim creation');
        
        // You can uncomment the line below to make it fail fast during debugging
        // throw error;
    }
}

// Upsert policy vector to Policies Vector Search
async function upsertPolicyVector(policyId: string, embedding: number[], text: string): Promise<void> {
    try {
        const project = process.env.GOOGLE_CLOUD_PROJECT || 'vintusure';
        const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        const indexEndpointId = process.env.POLICIES_INDEX_ENDPOINT_ID || '7427247225115246592';
        const deployedIndexId = process.env.POLICIES_DEPLOYED_INDEX_ID || 'policies_embeddings_deployed';

        console.log('Upserting policy vector to Vertex AI Vector Search');
        console.log(`Policy ID: ${policyId}`);
        console.log(`Embedding dimensions: ${embedding.length}`);
        console.log(`Text: ${text.substring(0, 100)}...`);
        
        // Validate embedding vector
        if (!embedding || embedding.length === 0) {
            throw new Error('Empty or invalid embedding vector provided');
        }
        
        if (embedding.some(val => typeof val !== 'number' || isNaN(val))) {
            throw new Error('Embedding vector contains invalid numeric values');
        }
        
        console.log('Policy embedding validation passed:', {
            length: embedding.length,
            minValue: Math.min(...embedding),
            maxValue: Math.max(...embedding),
            sampleValues: embedding.slice(0, 5)
        });

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        console.log('Policy authentication details:', {
            hasToken: !!accessToken.token,
            tokenLength: accessToken.token?.length || 0,
            tokenPrefix: accessToken.token?.substring(0, 20) + '...' || 'none'
        });

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector upsert');
        }

        // Prepare the upsert request
        const upsertUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:upsertDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapoints: [
                {
                    datapoint_id: policyId,
                    feature_vector: embedding,
                    restricts: [
                        {
                            namespace: "policy_data",
                            allow_list: ["all"]
                        }
                    ],
                    crowding_tag: "policy"
                }
            ]
        };

        console.log('Preparing policy vector upsert request...');
        console.log('Policy vector upsert operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: policyId,
            vectorDimensions: embedding.length
        });

        console.log('Making policy upsert request to:', upsertUrl);

        const response = await fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Policy vector upsert API error details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                errorBody: errorBody,
                requestUrl: upsertUrl,
                requestBody: JSON.stringify(requestBody, null, 2)
            });
            throw new Error(`Policy vector upsert failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Policy vector upsert completed successfully:', result);

    } catch (error) {
        console.error('Error upserting policy vector:', error);
        
        // Log detailed error information for debugging
        console.error('Policy vector upsert error details:', {
            policyId,
            embeddingLength: embedding?.length,
            textLength: text?.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        
        // For now, don't throw the error to prevent policy creation from failing
        // TODO: Fix the underlying vector search issue
        console.warn('Policy vector upsert failed, but continuing with policy creation');
        
        // You can uncomment the line below to make it fail fast during debugging
        // throw error;
    }
}

// Upsert document vector to Documents Vector Search
async function upsertDocumentVector(documentId: string, embedding: number[], text: string): Promise<void> {
    try {
        const project = process.env.GOOGLE_CLOUD_PROJECT || 'vintusure';
        const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
        const indexEndpointId = process.env.DOCUMENTS_INDEX_ENDPOINT_ID || '5702368567832346624';
        const deployedIndexId = process.env.DOCUMENTS_DEPLOYED_INDEX_ID || 'documents_embeddings_deployed';

        console.log('Upserting document vector to Vertex AI Vector Search');
        console.log(`Document ID: ${documentId}`);
        console.log(`Embedding dimensions: ${embedding.length}`);
        console.log(`Text: ${text.substring(0, 100)}...`);
        
        // Validate embedding vector
        if (!embedding || embedding.length === 0) {
            throw new Error('Empty or invalid embedding vector provided');
        }
        
        if (embedding.some(val => typeof val !== 'number' || isNaN(val))) {
            throw new Error('Embedding vector contains invalid numeric values');
        }
        
        console.log('Document embedding validation passed:', {
            length: embedding.length,
            minValue: Math.min(...embedding),
            maxValue: Math.max(...embedding),
            sampleValues: embedding.slice(0, 5)
        });

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        console.log('Document authentication details:', {
            hasToken: !!accessToken.token,
            tokenLength: accessToken.token?.length || 0,
            tokenPrefix: accessToken.token?.substring(0, 20) + '...' || 'none'
        });

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector upsert');
        }

        // Prepare the upsert request
        const upsertUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:upsertDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapoints: [
                {
                    datapoint_id: documentId,
                    feature_vector: embedding,
                    restricts: [
                        {
                            namespace: "document_data",
                            allow_list: ["all"]
                        }
                    ],
                    crowding_tag: "document"
                }
            ]
        };

        console.log('Preparing document vector upsert request...');
        console.log('Document vector upsert operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: documentId,
            vectorDimensions: embedding.length
        });

        console.log('Making document upsert request to:', upsertUrl);

        const response = await fetch(upsertUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Document vector upsert API error details:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                errorBody: errorBody,
                requestUrl: upsertUrl,
                requestBody: JSON.stringify(requestBody, null, 2)
            });
            throw new Error(`Document vector upsert failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Document vector upsert completed successfully:', result);

    } catch (error) {
        console.error('Error upserting document vector:', error);
        
        // Log detailed error information for debugging
        console.error('Document vector upsert error details:', {
            documentId,
            embeddingLength: embedding?.length,
            textLength: text?.length,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined
        });
        
        // For now, don't throw the error to prevent document creation from failing
        // TODO: Fix the underlying vector search issue
        console.warn('Document vector upsert failed, but continuing with document creation');
        
        // You can uncomment the line below to make it fail fast during debugging
        // throw error;
    }
}

// ============================================================================
// DELETE VECTOR FUNCTIONS - Remove vectors from Vertex AI Vector Search
// ============================================================================

// Delete customer vector from Customer Vector Search
async function deleteCustomerVector(customerId: string): Promise<void> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '7427247225115246592';
        const deployedIndexId = 'customers_embeddings_deployed';

        console.log('Deleting customer vector from Vertex AI Vector Search');
        console.log(`Customer ID: ${customerId}`);

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector deletion');
        }

        // Prepare the delete request
        const deleteUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:removeDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapointIds: [customerId]
        };

        console.log('Preparing customer vector delete request...');
        console.log('Customer vector delete operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: customerId
        });

        console.log('Making customer delete request to:', deleteUrl);

        const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Customer vector deletion failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Customer vector deletion completed successfully:', result);

    } catch (error) {
        console.error('Error deleting customer vector:', error);
        throw error;
    }
}

// Delete claim vector from Claims Vector Search
async function deleteClaimVector(claimId: string): Promise<void> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '7427247225115246592';
        const deployedIndexId = 'claims_embeddings_deployed';

        console.log('Deleting claim vector from Vertex AI Vector Search');
        console.log(`Claim ID: ${claimId}`);

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector deletion');
        }

        // Prepare the delete request
        const deleteUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:removeDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapointIds: [claimId]
        };

        console.log('Preparing claim vector delete request...');
        console.log('Claim vector delete operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: claimId
        });

        console.log('Making claim delete request to:', deleteUrl);

        const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Claim vector deletion failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Claim vector deletion completed successfully:', result);

    } catch (error) {
        console.error('Error deleting claim vector:', error);
        throw error;
    }
}

// Delete policy vector from Policies Vector Search
async function deletePolicyVector(policyId: string): Promise<void> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '7427247225115246592';
        const deployedIndexId = 'policies_embeddings_deployed';

        console.log('Deleting policy vector from Vertex AI Vector Search');
        console.log(`Policy ID: ${policyId}`);

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector deletion');
        }

        // Prepare the delete request
        const deleteUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:removeDatapoints`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            datapointIds: [policyId]
        };

        console.log('Preparing policy vector delete request...');
        console.log('Policy vector delete operation prepared:', {
            indexEndpointId,
            deployedIndexId,
            datapointId: policyId
        });

        console.log('Making policy delete request to:', deleteUrl);

        const response = await fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Policy vector deletion failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('✅ Policy vector deletion completed successfully:', result);

    } catch (error) {
        console.error('Error deleting policy vector:', error);
        throw error;
    }
}

// RAG Integration - Customer Information Query Function
export const queryCustomerRAG = onCall<QueryRequest, Promise<ExtendedQueryResponse>>({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
}, async (request) => {
    try {
        console.log('Received customer RAG query:', request.data);

        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};

        if (!query) {
            console.error('No query provided');
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }

        console.log(`Processing RAG query: "${query}" for user: ${userId}`);

        // Step 1: Generate embedding for the user's query
        const queryEmbedding = await generateCustomerEmbedding(query);
        console.log(`Generated query embedding with ${queryEmbedding.length} dimensions`);

        // Step 2: Search Vector Search index for similar customer data
        const similarCustomers = await searchCustomerVectors(queryEmbedding, 5); // Top 5 results
        console.log(`Found ${similarCustomers.length} similar customer data points`);

        // Step 3: Retrieve full customer details from Firestore
        const customerContexts = await getCustomerContexts(similarCustomers);
        console.log(`Retrieved ${customerContexts.length} customer contexts for RAG`);

        // Step 4: Generate AI response using retrieved customer data
        const ragResponse = await generateRAGResponse(query, customerContexts, userId);
        console.log('Generated RAG response successfully');

        return {
            success: true,
            answer: ragResponse.answer,
            sources: ragResponse.sources,
            similarCustomersCount: similarCustomers.length
        };

    } catch (error) {
        console.error('Error in customer RAG query:', error);
        
        return {
            success: false,
            error: 'Failed to process RAG query',
            details: error instanceof Error ? error.message : 'An internal error occurred'
        };
    }
});

// RAG Integration - Claims Information Query Function
export const queryClaimsRAG = onCall<QueryRequest, Promise<ClaimsQueryResponse>>({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
}, async (request) => {
    try {
        console.log('Received claims RAG query:', request.data);

        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};

        if (!query) {
            console.error('No query provided');
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }

        console.log(`Processing Claims RAG query: "${query}" for user: ${userId}`);

        // Step 1: Generate embedding for the user's query
        const queryEmbedding = await generateCustomerEmbedding(query);
        console.log(`Generated query embedding with ${queryEmbedding.length} dimensions`);

        // Step 2: Search Vector Search index for similar claim data
        const similarClaims = await searchClaimVectors(queryEmbedding, 5); // Top 5 results
        console.log(`Found ${similarClaims.length} similar claim data points`);

        // Step 3: Retrieve full claim details from Firestore
        const claimContexts = await getClaimContexts(similarClaims);
        console.log(`Retrieved ${claimContexts.length} claim contexts for RAG`);

        // Step 4: Generate AI response using retrieved claim data
        const ragResponse = await generateClaimsRAGResponse(query, claimContexts, userId);
        console.log('Generated Claims RAG response successfully');

        return {
            success: true,
            answer: ragResponse.answer,
            sources: ragResponse.sources,
            similarClaimsCount: similarClaims.length
        };

    } catch (error) {
        console.error('Error in claims RAG query:', error);
        
        return {
            success: false,
            error: 'Failed to process claims RAG query',
            details: error instanceof Error ? error.message : 'An internal error occurred'
        };
    }
});

// RAG Integration - Policies Information Query Function
export const queryPoliciesRAG = onCall<QueryRequest, Promise<PoliciesQueryResponse>>({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
}, async (request) => {
    try {
        console.log('Received policies RAG query:', request.data);

        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};

        if (!query) {
            console.error('No query provided');
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }

        console.log(`Processing Policies RAG query: "${query}" for user: ${userId}`);

        // Step 1: Generate embedding for the user's query
        const queryEmbedding = await generateCustomerEmbedding(query);
        console.log(`Generated query embedding with ${queryEmbedding.length} dimensions`);

        // Step 2: Search Vector Search index for similar policy data
        const similarPolicies = await searchPolicyVectors(queryEmbedding, 5); // Top 5 results
        console.log(`Found ${similarPolicies.length} similar policy data points`);

        // Step 3: Retrieve full policy details from Firestore
        const policyContexts = await getPolicyContexts(similarPolicies);
        console.log(`Retrieved ${policyContexts.length} policy contexts for RAG`);

        // Step 4: Generate AI response using retrieved policy data
        const ragResponse = await generatePoliciesRAGResponse(query, policyContexts, userId);
        console.log('Generated Policies RAG response successfully');

        return {
            success: true,
            answer: ragResponse.answer,
            sources: ragResponse.sources,
            similarPoliciesCount: similarPolicies.length
        };

    } catch (error) {
        console.error('Error in policies RAG query:', error);
        
        return {
            success: false,
            error: 'Failed to process policies RAG query',
            details: error instanceof Error ? error.message : 'An internal error occurred'
        };
    }
});

// RAG Integration - Documents Information Query Function
export const queryDocumentsRAG = onCall<QueryRequest, Promise<DocumentsQueryResponse>>({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    cors: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5002',
        'https://vintusure.web.app',
        'https://vintusure.firebaseapp.com'
    ],
}, async (request) => {
    try {
        console.log('Received documents RAG query:', request.data);

        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};

        if (!query) {
            console.error('No query provided');
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }

        console.log(`Processing Documents RAG query: "${query}" for user: ${userId}`);

        // Step 1: Generate embedding for the user's query
        const queryEmbedding = await generateCustomerEmbedding(query);
        console.log(`Generated query embedding with ${queryEmbedding.length} dimensions`);

        // Step 2: Search Vector Search index for similar document data
        const similarDocuments = await searchDocumentVectors(queryEmbedding, 5); // Top 5 results
        console.log(`Found ${similarDocuments.length} similar document data points`);

        // Step 3: Retrieve full document details from Firestore
        const documentContexts = await getDocumentContexts(similarDocuments);
        console.log(`Retrieved ${documentContexts.length} document contexts for RAG`);

        // Step 4: Generate AI response using retrieved document data
        const ragResponse = await generateDocumentsRAGResponse(query, documentContexts, userId);
        console.log('Generated Documents RAG response successfully');

        return {
            success: true,
            answer: ragResponse.answer,
            sources: ragResponse.sources,
            similarDocumentsCount: similarDocuments.length
        };

    } catch (error) {
        console.error('Error in documents RAG query:', error);
        
        return {
            success: false,
            error: 'Failed to process documents RAG query',
            details: error instanceof Error ? error.message : 'An internal error occurred'
        };
    }
});

// Search Vector Search index for similar customer vectors
async function searchCustomerVectors(queryEmbedding: number[], topK: number = 5): Promise<VectorSearchResult[]> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '5982154694682738688';
        const deployedIndexId = 'customer_embeddings_deployed';

        console.log('Searching Vector Search index for similar customers...');

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector search');
        }

        // Prepare the search request
        const searchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:findNeighbors`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            queries: [
                {
                    neighbor_count: topK,
                    datapoint: {
                        feature_vector: queryEmbedding
                    }
                }
            ]
        };

        console.log('Making vector search request...');

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Vector search failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Vector search response received');

        // Extract the search results
        if (!result.nearestNeighbors || !result.nearestNeighbors[0] || !result.nearestNeighbors[0].neighbors) {
            console.log('No neighbors found in vector search');
            return [];
        }

        const neighbors = result.nearestNeighbors[0].neighbors;
        console.log(`Found ${neighbors.length} vector search results`);

        return neighbors.map((neighbor: any) => ({
            customerId: neighbor.datapoint.datapoint_id,
            distance: neighbor.distance,
            similarity: 1 - neighbor.distance // Convert distance to similarity score
        }));

    } catch (error) {
        console.error('Error searching customer vectors:', error);
        // Return empty results if vector search fails
        return [];
    }
}

// Retrieve customer contexts from Firestore based on vector search results
async function getCustomerContexts(similarCustomers: VectorSearchResult[]): Promise<CustomerContext[]> {
    try {
        console.log(`Retrieving customer contexts for ${similarCustomers.length} customers`);

        const customerContexts: CustomerContext[] = [];

        for (const result of similarCustomers) {
            try {
                const customerDoc = await db.collection('customers').doc(result.customerId).get();
                
                if (customerDoc.exists) {
                    const customerData = customerDoc.data() as Customer;
                    const context = createCustomerEmbeddingText(customerData);
                    
                    customerContexts.push({
                        customerId: result.customerId,
                        similarity: result.similarity,
                        distance: result.distance,
                        customerData: customerData,
                        context: context
                    });
                }
            } catch (error) {
                console.error(`Error retrieving customer ${result.customerId}:`, error);
                // Continue with other customers
            }
        }

        console.log(`Successfully retrieved ${customerContexts.length} customer contexts`);
        return customerContexts;

    } catch (error) {
        console.error('Error getting customer contexts:', error);
        return [];
    }
}

// Search Vector Search index for similar claim vectors
async function searchClaimVectors(queryEmbedding: number[], topK: number = 5): Promise<ClaimsVectorSearchResult[]> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '979781408580960256';
        const deployedIndexId = 'claims_embeddings_deployed';

        console.log('Searching Vector Search index for similar claims...');

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector search');
        }

        // Prepare the search request
        const searchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:findNeighbors`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            queries: [
                {
                    neighbor_count: topK,
                    datapoint: {
                        feature_vector: queryEmbedding
                    }
                }
            ]
        };

        console.log('Making claim vector search request...');

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Claim vector search failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Claim vector search response received');

        // Extract the search results
        if (!result.nearestNeighbors || !result.nearestNeighbors[0] || !result.nearestNeighbors[0].neighbors) {
            console.log('No neighbors found in claim vector search');
            return [];
        }

        const neighbors = result.nearestNeighbors[0].neighbors;
        console.log(`Found ${neighbors.length} claim vector search results`);

        return neighbors.map((neighbor: any) => ({
            claimId: neighbor.datapoint.datapoint_id,
            distance: neighbor.distance,
            similarity: 1 - neighbor.distance // Convert distance to similarity score
        }));

    } catch (error) {
        console.error('Error searching claim vectors:', error);
        // Return empty results if vector search fails
        return [];
    }
}

// Search Vector Search index for similar document vectors
async function searchDocumentVectors(queryEmbedding: number[], topK: number = 5): Promise<DocumentsVectorSearchResult[]> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '5702368567832346624';
        const deployedIndexId = 'documents_embeddings_deployed';

        console.log('Searching Documents Vector Search index');
        console.log(`Query embedding dimensions: ${queryEmbedding.length}`);
        console.log(`Top K: ${topK}`);

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector search');
        }

        // Prepare the search request
        const searchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:findNeighbors`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            neighborCount: topK,
            featureVector: queryEmbedding
        };

        console.log('Making document search request to:', searchUrl);

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Document vector search failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Document search response received:', result);

        // Parse the response to extract similar documents
        const neighbors = result.nearestNeighbors?.[0]?.neighbors || [];
        
        const searchResults: DocumentsVectorSearchResult[] = neighbors.map((neighbor: any) => {
            const distance = neighbor.distance || 0;
            const similarity = 1 - distance; // Convert distance to similarity
            
            return {
                documentId: neighbor.datapoint.datapointId,
                distance: distance,
                similarity: similarity
            };
        });

        console.log(`Found ${searchResults.length} similar documents`);
        return searchResults;

    } catch (error) {
        console.error('Error searching document vectors:', error);
        throw error;
    }
}

// Search Vector Search index for similar policy vectors
async function searchPolicyVectors(queryEmbedding: number[], topK: number = 5): Promise<PoliciesVectorSearchResult[]> {
    try {
        const project = 'vintusure';
        const location = 'us-central1';
        const indexEndpointId = '7427247225115246592';
        const deployedIndexId = 'policies_embeddings_deployed';

        console.log('Searching Vector Search index for similar policies...');

        // Use Google Auth for API authentication
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error('Failed to get access token for vector search');
        }

        // Prepare the search request
        const searchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/indexEndpoints/${indexEndpointId}:findNeighbors`;
        
        const requestBody = {
            deployedIndexId: deployedIndexId,
            queries: [
                {
                    neighbor_count: topK,
                    datapoint: {
                        feature_vector: queryEmbedding
                    }
                }
            ]
        };

        console.log('Making policy vector search request...');

        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Policy vector search failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Policy vector search response received');

        // Extract the search results
        if (!result.nearestNeighbors || !result.nearestNeighbors[0] || !result.nearestNeighbors[0].neighbors) {
            console.log('No neighbors found in policy vector search');
            return [];
        }

        const neighbors = result.nearestNeighbors[0].neighbors;
        console.log(`Found ${neighbors.length} policy vector search results`);

        return neighbors.map((neighbor: any) => ({
            policyId: neighbor.datapoint.datapoint_id,
            distance: neighbor.distance,
            similarity: 1 - neighbor.distance // Convert distance to similarity score
        }));

    } catch (error) {
        console.error('Error searching policy vectors:', error);
        // Return empty results if vector search fails
        return [];
    }
}

// Retrieve claim contexts from Firestore based on vector search results
async function getClaimContexts(similarClaims: ClaimsVectorSearchResult[]): Promise<ClaimsContext[]> {
    try {
        console.log(`Retrieving claim contexts for ${similarClaims.length} claims`);

        const claimContexts: ClaimsContext[] = [];

        for (const result of similarClaims) {
            try {
                const claimDoc = await db.collection('claims').doc(result.claimId).get();
                
                if (claimDoc.exists) {
                    const claimData = claimDoc.data() as Claim;
                    const context = createClaimEmbeddingText(claimData);
                    
                    claimContexts.push({
                        claimId: result.claimId,
                        similarity: result.similarity,
                        distance: result.distance,
                        claimData: claimData,
                        context: context
                    });
                }
            } catch (error) {
                console.error(`Error retrieving claim ${result.claimId}:`, error);
            }
        }

        return claimContexts;
    } catch (error) {
        console.error('Error retrieving claim contexts:', error);
        return [];
    }
}

// Retrieve policy contexts from Firestore based on vector search results
async function getPolicyContexts(similarPolicies: PoliciesVectorSearchResult[]): Promise<PoliciesContext[]> {
    try {
        console.log(`Retrieving policy contexts for ${similarPolicies.length} policies`);

        const policyContexts: PoliciesContext[] = [];

        for (const result of similarPolicies) {
            try {
                const policyDoc = await db.collection('policies').doc(result.policyId).get();
                
                if (policyDoc.exists) {
                    const policyData = policyDoc.data() as Policy;
                    const context = createPolicyEmbeddingText(policyData);
                    
                    policyContexts.push({
                        policyId: result.policyId,
                        similarity: result.similarity,
                        distance: result.distance,
                        policyData: policyData,
                        context: context
                    });
                }
            } catch (error) {
                console.error(`Error retrieving policy ${result.policyId}:`, error);
            }
        }

        return policyContexts;
    } catch (error) {
        console.error('Error retrieving policy contexts:', error);
        return [];
    }
}

// Generate RAG response using retrieved customer data
async function generateRAGResponse(query: string, customerContexts: CustomerContext[], userId: string): Promise<RAGResponse> {
    try {
        console.log(`Generating RAG response for query: "${query}"`);

        // Prepare context from similar customers
        const contextText = customerContexts.map((ctx, index) => 
            `Customer ${index + 1} (Similarity: ${(ctx.similarity * 100).toFixed(1)}%):\n${ctx.context}`
        ).join('\n\n');

        // Create RAG prompt
        const ragPrompt = `You are VintuSure's AI Customer Assistant. You help employees find and analyze customer information using a semantic search system.

CONTEXT - Similar Customer Data Found:
${contextText}

USER QUERY: ${query}

Please provide a helpful response that:
1. Directly addresses the user's question
2. References specific customer information from the context when relevant
3. Provides insights about patterns or similarities if multiple customers are involved
4. Maintains customer privacy and data protection standards
5. Suggests follow-up actions if appropriate

If the context doesn't contain relevant information for the query, clearly state that and suggest alternative approaches.

Response:`;

        console.log('Sending RAG prompt to Gemini...');

        // Initialize Vertex AI for response generation
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new VertexAI({ project, location });

        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.3,
                top_p: 0.9,
                top_k: 40,
            },
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: ragPrompt }]
            }]
        });

        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        // Prepare sources information
        const sources = customerContexts.map(ctx => ({
            customerId: ctx.customerId,
            customerName: `${ctx.customerData.firstName} ${ctx.customerData.lastName}`,
            similarity: ctx.similarity,
            relevantInfo: `${ctx.customerData.occupation} in ${ctx.customerData.address.city}`
        }));

        console.log('RAG response generated successfully');

        return {
            answer,
            sources,
            contextUsed: contextText.length > 0
        };

    } catch (error) {
        console.error('Error generating RAG response:', error);
        throw error;
    }
}

// Generate RAG response using retrieved claim data
async function generateClaimsRAGResponse(query: string, claimContexts: ClaimsContext[], userId: string): Promise<ClaimsRAGResponse> {
    try {
        console.log(`Generating Claims RAG response for query: "${query}"`);

        // Prepare context from similar claims
        const contextText = claimContexts.map((ctx, index) => 
            `Claim ${index + 1} (Similarity: ${(ctx.similarity * 100).toFixed(1)}%):\n${ctx.context}`
        ).join('\n\n');

        // Create RAG prompt
        const ragPrompt = `You are VintuSure's AI Claims Assistant. You help employees find and analyze claim information using a semantic search system.

CONTEXT - Similar Claim Data Found:
${contextText}

USER QUERY: ${query}

Please provide a helpful response that:
1. Directly addresses the user's question about claims
2. References specific claim information from the context when relevant
3. Provides insights about patterns or similarities if multiple claims are involved
4. Maintains claim privacy and data protection standards
5. Suggests follow-up actions if appropriate

If the context doesn't contain relevant information for the query, clearly state that and suggest alternative approaches.

Response:`;

        console.log('Sending Claims RAG prompt to Gemini...');

        // Initialize Vertex AI for response generation
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new VertexAI({ project, location });

        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.3,
                top_p: 0.9,
                top_k: 40,
            },
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: ragPrompt }]
            }]
        });

        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        // Prepare sources information
        const sources = claimContexts.map(ctx => ({
            claimId: ctx.claimId,
            claimDescription: ctx.claimData.description.substring(0, 100) + '...',
            similarity: ctx.similarity,
            relevantInfo: `${ctx.claimData.damageType} claim - ${ctx.claimData.status} - ${ctx.claimData.location.address}`
        }));

        return {
            answer,
            sources,
            contextUsed: claimContexts.length > 0
        };

    } catch (error) {
        console.error('Error generating Claims RAG response:', error);
        
        // Return a fallback response if RAG generation fails
        return {
            answer: 'I apologize, but I encountered an error while processing your claims request. Please try again or contact support if the issue persists.',
            sources: [],
            contextUsed: false
        };
    }
}

// Generate RAG response using retrieved policy data
async function generatePoliciesRAGResponse(query: string, policyContexts: PoliciesContext[], userId: string): Promise<PoliciesRAGResponse> {
    try {
        console.log(`Generating Policies RAG response for query: "${query}"`);

        // Prepare context from similar policies
        const contextText = policyContexts.map((ctx, index) => 
            `Policy ${index + 1} (Similarity: ${(ctx.similarity * 100).toFixed(1)}%):\n${ctx.context}`
        ).join('\n\n');

        // Create RAG prompt
        const ragPrompt = `You are VintuSure's AI Policies Assistant. You help employees find and analyze policy information using a semantic search system.

CONTEXT - Similar Policy Data Found:
${contextText}

USER QUERY: ${query}

Please provide a helpful response that:
1. Directly addresses the user's question about policies
2. References specific policy information from the context when relevant
3. Provides insights about patterns or similarities if multiple policies are involved
4. Maintains policy privacy and data protection standards
5. Suggests follow-up actions if appropriate

If the context doesn't contain relevant information for the query, clearly state that and suggest alternative approaches.

Response:`;

        console.log('Sending Policies RAG prompt to Gemini...');

        // Initialize Vertex AI for response generation
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new VertexAI({ project, location });

        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.3,
                top_p: 0.9,
                top_k: 40,
            },
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: ragPrompt }]
            }]
        });

        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        // Prepare sources information
        const sources = policyContexts.map(ctx => ({
            policyId: ctx.policyId,
            policyNumber: ctx.policyData.policyNumber,
            similarity: ctx.similarity,
            relevantInfo: `${ctx.policyData.type} policy - ${ctx.policyData.status} - ${ctx.policyData.vehicle.make} ${ctx.policyData.vehicle.model}`
        }));

        return {
            answer,
            sources,
            contextUsed: policyContexts.length > 0
        };

    } catch (error) {
        console.error('Error generating Policies RAG response:', error);
        
        // Return a fallback response if RAG generation fails
        return {
            answer: 'I apologize, but I encountered an error while processing your policies request. Please try again or contact support if the issue persists.',
            sources: [],
            contextUsed: false
        };
    }
}

// Interface definitions for RAG functionality
interface VectorSearchResult {
    customerId: string;
    distance: number;
    similarity: number;
}

interface CustomerContext {
    customerId: string;
    similarity: number;
    distance: number;
    customerData: Customer;
    context: string;
}

interface RAGResponse {
    answer: string;
    sources: Array<{
        customerId: string;
        customerName: string;
        similarity: number;
        relevantInfo: string;
    }>;
    contextUsed: boolean;
}

// Extended QueryResponse interface for RAG
// Claims and Policies interfaces
interface Claim {
    id: string;
    policyId: string;
    customerId: string;
    incidentDate: string;
    description: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    damageType: 'Vehicle' | 'Property' | 'Personal';
    status: 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';
    documents: string[];
    amount: number;
    approvedAmount?: number;
    reviewNotes?: string;
    createdAt: any;
    updatedAt: any;
    createdBy: string;
    agent_id: string;
}

interface Policy {
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
    startDate: any;
    endDate: any;
    premium: {
        amount: number;
        currency: string;
        paymentStatus: 'pending' | 'paid' | 'partial';
        paymentMethod: string;
    };
    createdAt: any;
    updatedAt: any;
    createdBy: string;
    agent_id: string;
}

interface VectorSearchResult {
    customerId: string;
    distance: number;
    similarity: number;
}

interface ClaimsVectorSearchResult {
    claimId: string;
    distance: number;
    similarity: number;
}

interface PoliciesVectorSearchResult {
    policyId: string;
    distance: number;
    similarity: number;
}

interface CustomerContext {
    customerId: string;
    similarity: number;
    distance: number;
    customerData: Customer;
    context: string;
}

interface ClaimsContext {
    claimId: string;
    similarity: number;
    distance: number;
    claimData: Claim;
    context: string;
}

interface PoliciesContext {
    policyId: string;
    similarity: number;
    distance: number;
    policyData: Policy;
    context: string;
}

interface RAGResponse {
    answer: string;
    sources: Array<{
        customerId: string;
        customerName: string;
        similarity: number;
        relevantInfo: string;
    }>;
    contextUsed: boolean;
}

interface ClaimsRAGResponse {
    answer: string;
    sources: Array<{
        claimId: string;
        claimDescription: string;
        similarity: number;
        relevantInfo: string;
    }>;
    contextUsed: boolean;
}

interface PoliciesRAGResponse {
    answer: string;
    sources: Array<{
        policyId: string;
        policyNumber: string;
        similarity: number;
        relevantInfo: string;
    }>;
    contextUsed: boolean;
}

interface ExtendedQueryResponse extends QueryResponse {
    sources?: Array<{
        customerId: string;
        customerName: string;
        similarity: number;
        relevantInfo: string;
    }>;
    similarCustomersCount?: number;
}

interface ClaimsQueryResponse extends QueryResponse {
    sources?: Array<{
        claimId: string;
        claimDescription: string;
        similarity: number;
        relevantInfo: string;
    }>;
    similarClaimsCount?: number;
}

interface PoliciesQueryResponse extends QueryResponse {
    sources?: Array<{
        policyId: string;
        policyNumber: string;
        similarity: number;
        relevantInfo: string;
    }>;
    similarPoliciesCount?: number;
}

// Document interfaces for RAG functionality
interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    description?: string;
    category: 'policy' | 'claim' | 'invoice' | 'contract' | 'certificate' | 'other';
    tags: string[];
    uploadedBy: string;
    uploadedAt: any;
    updatedAt: any;
    vectorIndexed?: boolean;
    vectorIndexedAt?: any;
    vectorIndexError?: string;
    embeddingText?: string;
    extractedText?: string;
    metadata?: {
        pageCount?: number;
        author?: string;
        subject?: string;
        keywords?: string[];
        language?: string;
    };
}

interface DocumentsVectorSearchResult {
    documentId: string;
    distance: number;
    similarity: number;
}

interface DocumentsContext {
    documentId: string;
    similarity: number;
    distance: number;
    documentData: Document;
    context: string;
}

interface DocumentsRAGResponse {
    answer: string;
    sources: Array<{
        documentId: string;
        fileName: string;
        similarity: number;
        relevantInfo: string;
    }>;
    contextUsed: boolean;
}

interface DocumentsQueryResponse extends QueryResponse {
    sources?: Array<{
        documentId: string;
        fileName: string;
        similarity: number;
        relevantInfo: string;
    }>;
    similarDocumentsCount?: number;
}

// Get full document details from Firestore based on search results
async function getDocumentContexts(searchResults: DocumentsVectorSearchResult[]): Promise<DocumentsContext[]> {
    try {
        console.log(`Retrieving ${searchResults.length} document contexts from Firestore`);

        const contexts: DocumentsContext[] = [];

        for (const result of searchResults) {
            try {
                const documentDoc = await db.collection('documents').doc(result.documentId).get();
                
                if (documentDoc.exists) {
                    const documentData = documentDoc.data() as Document;
                    const context = createDocumentEmbeddingText(documentData);
                    
                    contexts.push({
                        documentId: result.documentId,
                        similarity: result.similarity,
                        distance: result.distance,
                        documentData: documentData,
                        context: context
                    });
                    
                    console.log(`Retrieved context for document: ${result.documentId}`);
                } else {
                    console.warn(`Document ${result.documentId} not found in Firestore`);
                }
            } catch (error) {
                console.error(`Error retrieving document ${result.documentId}:`, error);
            }
        }

        console.log(`Successfully retrieved ${contexts.length} document contexts`);
        return contexts;

    } catch (error) {
        console.error('Error getting document contexts:', error);
        throw error;
    }
}

// Generate RAG response for documents using Gemini
async function generateDocumentsRAGResponse(query: string, documentContexts: DocumentsContext[], userId: string): Promise<DocumentsRAGResponse> {
    try {
        console.log('Generating Documents RAG response with Gemini');
        console.log(`Query: "${query}"`);
        console.log(`Document contexts: ${documentContexts.length}`);

        if (documentContexts.length === 0) {
            return {
                answer: "I don't have any relevant documents in my knowledge base to answer your query. Please try rephrasing your question or upload relevant documents.",
                sources: [],
                contextUsed: false
            };
        }

        // Prepare context from similar documents
        const contextText = documentContexts
            .map((ctx, index) => `Document ${index + 1}:\n${ctx.context}`)
            .join('\n\n');

        // Create RAG prompt
        const prompt = `You are VintuSure's AI Document Assistant. You help users find and understand information from uploaded documents.

User Query: "${query}"

Relevant Document Information:
${contextText}

Instructions:
1. Analyze the user's query and the provided document information
2. Provide a comprehensive answer based on the document data
3. If the documents contain relevant information, use it to answer the query
4. If no relevant information is found, politely explain that you don't have the specific information
5. Always maintain document privacy and security
6. Be helpful and professional in your response
7. If multiple documents are relevant, synthesize the information clearly

Please provide a detailed answer based on the document information above:`;

        console.log('Sending prompt to Gemini for document RAG response');

        // Initialize Vertex AI and generate response
        const { VertexAI } = require('@google-cloud/vertexai');
        const vertexAI = new VertexAI({
            project: 'vintusure',
            location: 'us-central1',
        });

        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.3,
                top_p: 0.8,
                top_k: 40,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        console.log('Generated Documents RAG response successfully');

        // Prepare source information
        const sources = documentContexts.map(ctx => ({
            documentId: ctx.documentId,
            fileName: ctx.documentData.fileName,
            similarity: ctx.similarity,
            relevantInfo: ctx.documentData.description || ctx.documentData.fileName
        }));

        return {
            answer: answer,
            sources: sources,
            contextUsed: true
        };

    } catch (error) {
        console.error('Error generating Documents RAG response:', error);
        
        return {
            answer: "I apologize, but I encountered an error while processing your document query. Please try again or contact support if the issue persists.",
            sources: [],
            contextUsed: false
        };
    }
}

 