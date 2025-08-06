"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCarPhoto = exports.healthCheck = exports.askQuestion = void 0;
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
// Initialize Firebase Admin SDK
(0, firebase_1.getFirebaseApp)();
const db = (0, firestore_1.getFirestore)();
// Initialize Vertex AI
const vertexAI = new vertexai_1.VertexAI({
    project: 'vintusure',
    location: 'us-central1'
});
// Generation configuration
const generationConfig = {
    maxOutputTokens: 2048,
    temperature: 0.9,
    topP: 1,
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        }
    ],
};
// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();
// Rate limiting configuration
const RATE_LIMIT = {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60000, // 1 minute
};
// Input validation and sanitization
function validateAndSanitizeQuery(query) {
    if (!query || typeof query !== 'string') {
        return { isValid: false, sanitizedQuery: '', error: 'Query must be a non-empty string' };
    }
    // Trim whitespace
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
        return { isValid: false, sanitizedQuery: '', error: 'Query cannot be empty' };
    }
    if (trimmedQuery.length > 1000) {
        return { isValid: false, sanitizedQuery: '', error: 'Query too long (max 1000 characters)' };
    }
    // Basic sanitization - remove potentially dangerous characters
    const sanitizedQuery = trimmedQuery
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 1000); // Limit length
    return { isValid: true, sanitizedQuery };
}
// Rate limiting function
function checkRateLimit(userId) {
    const now = Date.now();
    const key = userId || 'anonymous';
    const userLimit = rateLimitStore.get(key);
    if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize rate limit
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT.WINDOW_MS
        });
        return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT.WINDOW_MS };
    }
    if (userLimit.count >= RATE_LIMIT.MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
    }
    // Increment count
    userLimit.count++;
    rateLimitStore.set(key, userLimit);
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - userLimit.count, resetTime: userLimit.resetTime };
}
// Security logging
async function logSecurityEvent(event, userId, details) {
    try {
        await db.collection('securityLogs').add({
            event,
            userId,
            details,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            ip: 'cloud-function', // In production, extract from request context
        });
    }
    catch (error) {
        console.error('Failed to log security event:', error);
    }
}
exports.askQuestion = (0, https_1.onCall)({
    memory: '1GiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    region: 'us-central1'
}, async (request) => {
    try {
        console.log('Received request:', request.data);
        // Extract user ID from Firebase Auth context
        const userId = request.auth?.uid || 'anonymous';
        const query = request.data?.query;
        // Log the request
        await logSecurityEvent('rag_query_request', userId, {
            hasQuery: !!query,
            queryLength: query?.length || 0
        });
        // Validate input
        if (!query) {
            await logSecurityEvent('rag_query_missing', userId, {});
            return {
                success: false,
                error: 'Query is required.',
                details: 'No query provided in request'
            };
        }
        // Check rate limiting
        const rateLimit = checkRateLimit(userId);
        if (!rateLimit.allowed) {
            await logSecurityEvent('rag_rate_limit_exceeded', userId, {
                resetTime: rateLimit.resetTime
            });
            return {
                success: false,
                error: 'Rate limit exceeded.',
                details: `Too many requests. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`
            };
        }
        // Validate and sanitize query
        const validation = validateAndSanitizeQuery(query);
        if (!validation.isValid) {
            await logSecurityEvent('rag_query_validation_failed', userId, {
                error: validation.error
            });
            return {
                success: false,
                error: 'Invalid query.',
                details: validation.error
            };
        }
        // Log successful validation
        await logSecurityEvent('rag_query_validated', userId, {
            originalLength: query.length,
            sanitizedLength: validation.sanitizedQuery.length
        });
        // Create safe prompt
        const prompt = `Answer this insurance-related question: ${validation.sanitizedQuery}`;
        console.log('Using sanitized prompt:', prompt);
        // Get the model
        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-pro',
            generation_config: generationConfig
        });
        console.log('Generating content...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        const response = await result.response;
        const answer = response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate an answer at this time.";
        // Sanitize the answer
        const sanitizedAnswer = answer
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .substring(0, 2000); // Limit answer length
        console.log('Generated sanitized answer:', sanitizedAnswer);
        // Log query usage
        console.log('Logging to Firestore...');
        await db.collection('queryLogs').add({
            userId,
            originalQuery: query,
            sanitizedQuery: validation.sanitizedQuery,
            answer: sanitizedAnswer,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            rateLimitRemaining: rateLimit.remaining,
        });
        // Log successful response
        await logSecurityEvent('rag_query_success', userId, {
            answerLength: sanitizedAnswer.length
        });
        return {
            success: true,
            answer: sanitizedAnswer
        };
    }
    catch (error) {
        console.error("Error in askQuestion function:", error);
        // Log error
        const userId = request.auth?.uid || 'anonymous';
        await logSecurityEvent('rag_query_error', userId, {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Don't expose internal error details to client
        return {
            success: false,
            error: 'Failed to process query.',
            details: 'An internal error occurred. Please try again later.'
        };
    }
});
// Health check endpoint
exports.healthCheck = (0, https_1.onCall)({
    memory: '256MiB',
    timeoutSeconds: 30,
    maxInstances: 10,
    region: 'us-central1'
}, async (request) => {
    const userId = request.auth?.uid || 'anonymous';
    // Log health check
    await logSecurityEvent('health_check', userId, {});
    return {
        status: 'healthy',
        service: 'VintuSure RAG API',
        timestamp: new Date().toISOString()
    };
});
// Car Analysis Function
exports.analyzeCarPhoto = (0, https_1.onCall)({
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
        if (!request.data || !request.data.photoBase64) {
            throw new https_1.HttpsError('invalid-argument', 'No image provided');
        }
        const { photoBase64 } = request.data;
        const userId = request.auth?.uid || 'anonymous';
        // Log the request
        await logSecurityEvent('car_analysis_request', userId, {
            hasImage: !!photoBase64
        });
        // Create the Gemini model
        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-1.0-pro-vision', // Updated model name
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.4,
                top_p: 1,
                top_k: 32,
            },
        });
        // Prepare the prompt
        const prompt = `You are a car expert and insurance advisor in Zambia. Analyze this car image and provide detailed information in the following format:

1. Car Details:
   - Make and model (be specific)
   - Estimated year of manufacture
   - Body type and key features
   - Condition assessment (based on visible aspects)
   - Estimated value in ZMW (Zambian Kwacha) considering local market conditions

2. Insurance Recommendations:
   - Recommended coverage type (Comprehensive vs Third Party)
   - Estimated annual premium in ZMW
   - Key coverage points based on car value and type
   - Additional coverage recommendations

3. Similar Cars in Zambian Market:
   - List 3 similar cars commonly available in Zambia
   - Typical price ranges in ZMW
   - Popular dealers and platforms in Zambia
   - Import considerations if applicable

Please be specific and accurate in your assessment. Focus on the Zambian market context and local insurance requirements.`;
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
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        // Parse the response text into structured data
        const parsedResponse = parseGeminiResponse(text);
        // Log successful analysis
        await logSecurityEvent('car_analysis_success', userId, {
            responseLength: text.length
        });
        return parsedResponse;
    }
    catch (error) {
        console.error('Error in analyzeCarPhoto:', error);
        // Log error
        const userId = request.auth?.uid || 'anonymous';
        await logSecurityEvent('car_analysis_error', userId, {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw new https_1.HttpsError('internal', 'Failed to analyze car photo', error);
    }
});
// Helper function to parse Gemini's response text into structured data
function parseGeminiResponse(text) {
    // Default values
    const result = {
        carDetails: {
            make: '',
            model: '',
            estimatedYear: 0,
            bodyType: '',
            condition: '',
            estimatedValue: 0
        },
        insuranceRecommendation: {
            recommendedCoverage: '',
            estimatedPremium: 0,
            coverageDetails: ''
        },
        marketplaceRecommendations: {
            similarListings: [],
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
    try {
        // Split the text into sections
        const sections = text.split(/\d+\./);
        // Parse Car Details
        if (sections[1]) {
            const carDetails = sections[1];
            const makeModel = carDetails.match(/Make and model:?\s*([^\n]+)/i)?.[1] || '';
            const [make, ...modelParts] = makeModel.split(' ');
            result.carDetails.make = make;
            result.carDetails.model = modelParts.join(' ');
            result.carDetails.estimatedYear = parseInt(carDetails.match(/year:?\s*(\d{4})/i)?.[1] || '0');
            result.carDetails.bodyType = carDetails.match(/body type:?\s*([^\n]+)/i)?.[1] || '';
            result.carDetails.condition = carDetails.match(/condition:?\s*([^\n]+)/i)?.[1] || '';
            result.carDetails.estimatedValue = parseInt(carDetails.match(/value:?\s*(?:ZMW\s*)?(\d+)/i)?.[1] || '0');
        }
        // Parse Insurance Recommendations
        if (sections[2]) {
            const insurance = sections[2];
            result.insuranceRecommendation.recommendedCoverage = insurance.match(/coverage type:?\s*([^\n]+)/i)?.[1] || '';
            result.insuranceRecommendation.estimatedPremium = parseInt(insurance.match(/premium:?\s*(?:ZMW\s*)?(\d+)/i)?.[1] || '0');
            result.insuranceRecommendation.coverageDetails = insurance.match(/coverage points:?\s*([^\n]+)/i)?.[1] || '';
        }
        // Parse Similar Cars
        if (sections[3]) {
            const similar = sections[3];
            const listings = similar.match(/\d+\.\s*([^\n]+)/g) || [];
            result.marketplaceRecommendations.similarListings = listings.map(listing => ({
                platform: "Local Market",
                url: "https://www.carzonezambia.com",
                price: parseInt(listing.match(/(?:ZMW\s*)?(\d+)/)?.[1] || '0'),
                description: listing.trim()
            }));
        }
    }
    catch (error) {
        console.error('Error parsing Gemini response:', error);
    }
    return result;
}
//# sourceMappingURL=index.js.map