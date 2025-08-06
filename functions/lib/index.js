"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.testFunction = exports.healthCheck = exports.askQuestion = void 0;
=======
exports.analyzeCarPhoto = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
<<<<<<< HEAD
<<<<<<< HEAD
=======
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
>>>>>>> 43a853f8d45051f4acf0819db2793f05c22ba728
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
<<<<<<< HEAD
    cors: true,
=======
    region: 'us-central1'
>>>>>>> 43a853f8d45051f4acf0819db2793f05c22ba728
=======
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
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
}, async (request) => {
    try {
        if (!request.data || !request.data.photoBase64) {
            throw new https_1.HttpsError('invalid-argument', 'No image provided');
        }
        const { photoBase64 } = request.data;
        const userId = request.auth?.uid || 'anonymous';
<<<<<<< HEAD
<<<<<<< HEAD
        const { query } = request.data || {};
=======
        const query = request.data?.query;
>>>>>>> 43a853f8d45051f4acf0819db2793f05c22ba728
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
<<<<<<< HEAD
        // Call Vertex AI LLM
        const project = 'vintusure';
        const location = 'us-central1';
        const modelName = 'gemini-2.5-flash-lite';
        console.log('Initializing Vertex AI...');
        const vertexAI = new vertexai_1.VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: modelName });
=======
        // Get the model
        const model = vertexAI.preview.getGenerativeModel({
            model: 'gemini-pro',
            generation_config: generationConfig
        });
>>>>>>> 43a853f8d45051f4acf0819db2793f05c22ba728
        console.log('Generating content...');
=======
        // Initialize Vertex AI
        const project = 'vintusure';
        const location = 'us-central1';
        const vertexAI = new vertexai_1.VertexAI({ project, location });
        // Create Gemini model
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generation_config: {
                max_output_tokens: 2048,
                temperature: 0.4,
                top_p: 1,
                top_k: 32,
            },
        });
        // Prepare the prompt
        const prompt = `You are an expert car appraiser and insurance advisor in Zambia with access to current market data. Research and provide SPECIFIC, REAL market information for this car. DO NOT provide generic estimates - use actual market data from Zambia and common import sources.

RESEARCH REQUIREMENTS:
1. Check current listings on:
   - www.usedcars.co.zm
   - www.toyotazambia.co.zm
   - www.caryandi.com
   - www.beforward.jp (Zambia prices)
   - Facebook Marketplace Lusaka

2. Reference current insurance rates from:
   - ZSIC
   - Madison Insurance
   - Goldman Insurance
   - Professional Insurance

3. Consider import costs:
   - Current shipping rates from Japan/UK/SA
   - Import duties and taxes
   - Clearance fees at Zambian borders

Now analyze this car image and provide detailed information in this format:

1. Car Details (Use SPECIFIC numbers from research):
   - Make and model (identify exact trim level if visible)
   - Estimated year (based on visible features and model history)
   - Body type and key features (list all visible features)
   - Condition assessment (detailed evaluation)
   - Estimated value in ZMW (provide EXACT number based on:
     * Current identical/similar listings in Zambia
     * Recent sale prices from dealers
     * Import costs if similar to foreign listings
     * Adjustments for condition and mileage)

2. Insurance Details (Use REAL insurance provider data):
   - Recommended coverage type with specific reasoning
   - Estimated annual premium in ZMW (use ACTUAL rates from:
     * Current ZSIC/Madison/Goldman rate cards
     * Vehicle category and value brackets
     * Standard market premiums for this type)
   - Coverage details including:
     * Mandatory Zambian requirements
     * Recommended additional coverage
     * Specific policy limits and features
     * Any model-specific considerations

3. Market Analysis (Use CURRENT market data):
   - List 3 similar vehicles currently listed in Zambia:
     * Exact model, year, condition
     * CURRENT listing price in ZMW
     * Specific dealer/platform where listed
     * URL if available
   - Best places to buy/import this vehicle:
     * Local dealers with current stock
     * Import sources with costs
     * Popular platforms with active listings
   - Market insights:
     * Current demand and availability
     * Price trends (last 3-6 months)
     * Common issues and parts availability
     * Resale value projections

IMPORTANT: 
- Provide EXACT numbers from your research
- Include SPECIFIC prices from current listings
- Reference REAL insurance rates
- Use ACTUAL market data, not estimates
- If exact data isn't available, use the closest comparable vehicles/listings

Your response must be detailed and based on CURRENT market research, not general estimates.`;
        // Get response from Gemini
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
        const result = await model.generateContent({
            contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: photoBase64 } }
                    ]
                }]
        });
        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) {
            throw new Error('No response from Gemini');
        }
        // Parse the response text into structured data
        const parsedResponse = parseGeminiResponse(answer);
        return parsedResponse;
    }
    catch (error) {
        throw new https_1.HttpsError('internal', 'Failed to analyze car photo', error instanceof Error ? error.message : undefined);
    }
});
<<<<<<< HEAD
// Health check endpoint with authentication
exports.healthCheck = (0, https_1.onCall)({
    memory: '256MiB',
    timeoutSeconds: 30,
    maxInstances: 10,
<<<<<<< HEAD
    cors: true,
}, (request) => {
    try {
        const userId = request.auth?.uid || 'anonymous';
        // Log health check (fire and forget)
        logSecurityEvent('health_check', userId, {});
        return {
            status: 'healthy',
            service: 'VintuSure RAG API',
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Health check error:', error);
        return {
            status: 'error',
            service: 'VintuSure RAG API',
            timestamp: new Date().toISOString()
        };
    }
});
// Simple test function for debugging
exports.testFunction = (0, https_1.onCall)({
    maxInstances: 10,
    cors: true,
}, () => {
=======
    region: 'us-central1'
}, async (request) => {
    const userId = request.auth?.uid || 'anonymous';
    // Log health check
    await logSecurityEvent('health_check', userId, {});
>>>>>>> 43a853f8d45051f4acf0819db2793f05c22ba728
    return {
        message: 'Test function is working!'
=======
// Helper function to parse Gemini's response text into structured data
function parseGeminiResponse(text) {
    const sections = text.split(/\d+\./);
    const result = {
        carDetails: {
            make: '',
            model: '',
            estimatedYear: new Date().getFullYear(),
            bodyType: '',
            condition: '',
            estimatedValue: 0, // Will only use fallback if no value found
        },
        insuranceRecommendation: {
            recommendedCoverage: '',
            estimatedPremium: 0, // Will only use fallback if no value found
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
>>>>>>> 358bab339ae23ea56fcb881bd4beb96a58138f16
    };
    try {
        // Helper function to extract numbers from text with flexible formats
        const extractNumber = (text, patterns) => {
            for (const pattern of patterns) {
                const matches = text.match(pattern);
                if (matches) {
                    const numStr = matches[1].replace(/[^\d.]/g, '');
                    const num = parseInt(numStr);
                    if (!isNaN(num) && num > 0)
                        return num;
                }
            }
            return 0;
        };
        // Parse Car Details
        if (sections[1]) {
            const carDetails = sections[1];
            // Extract make and model with trim level
            const makeModelMatch = carDetails.match(/(?:make|model|vehicle)(?:[:\s]+)([^\n]+)/i);
            if (makeModelMatch) {
                const makeModel = makeModelMatch[1].trim();
                const [make, ...modelParts] = makeModel.split(' ');
                result.carDetails.make = make || 'Unknown Make';
                result.carDetails.model = modelParts.join(' ') || 'Unknown Model';
            }
            // Extract year - try multiple patterns
            const yearPatterns = [
                /(?:year|manufactured|made in|built in)[:\s]+(\d{4})/i,
                /(\d{4})\s+(?:model|year|make)/i,
                /(?:is a|appears to be|circa)\s+(\d{4})/i
            ];
            const year = extractNumber(carDetails, yearPatterns);
            if (year >= 1900 && year <= new Date().getFullYear()) {
                result.carDetails.estimatedYear = year;
            }
            // Extract body type
            const bodyTypeMatch = carDetails.match(/(?:body\s*type|style|configuration)[:\s]+([^\n.,]+)/i);
            result.carDetails.bodyType = bodyTypeMatch ? bodyTypeMatch[1].trim() : '';
            // Extract condition
            const conditionMatch = carDetails.match(/(?:condition|state)[:\s]+([^\n.,]+)/i);
            result.carDetails.condition = conditionMatch ? conditionMatch[1].trim() : '';
            // Try to find any value in the entire response first
            const valuePatterns = [
                /(?:value|price|worth|cost|estimated at)[:\s]+(?:ZMW|K|ZK|K\s+)?(\d[\d,]*(?:\.\d{1,2})?)/i,
                /(?:ZMW|K|ZK|K\s+)(\d[\d,]*(?:\.\d{1,2})?)/i,
                /(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ZMW|K|ZK|kwacha)/i
            ];
            // Search in car details section first
            let value = extractNumber(carDetails, valuePatterns);
            // If no value found, search in entire text
            if (value === 0) {
                value = extractNumber(text, valuePatterns);
            }
            // Only use fallback if no value found
            if (value > 0) {
                result.carDetails.estimatedValue = value;
            }
            else {
                // Fallback calculation as absolute last resort
                const baseValue = 250000;
                const yearFactor = Math.max(0.5, (result.carDetails.estimatedYear - 2000) / 20);
                const conditionFactor = result.carDetails.condition.toLowerCase().includes('excellent') ? 1.2 :
                    result.carDetails.condition.toLowerCase().includes('good') ? 1.0 :
                        result.carDetails.condition.toLowerCase().includes('fair') ? 0.8 : 0.6;
                result.carDetails.estimatedValue = Math.round(baseValue * yearFactor * conditionFactor);
            }
        }
        // Parse Insurance Recommendations
        if (sections[2]) {
            const insurance = sections[2];
            // Extract coverage type
            const coverageMatch = insurance.match(/(?:coverage|insurance)\s*type[:\s]+([^\n.,]+)/i);
            result.insuranceRecommendation.recommendedCoverage = coverageMatch ? coverageMatch[1].trim() : 'Comprehensive';
            // Try to find premium in insurance section first
            const premiumPatterns = [
                /(?:premium|insurance cost|annual cost|yearly payment)[:\s]+(?:ZMW|K|ZK|K\s+)?(\d[\d,]*(?:\.\d{1,2})?)/i,
                /(?:ZMW|K|ZK|K\s+)(\d[\d,]*(?:\.\d{1,2})?)\s+(?:per year|annually|premium)/i
            ];
            let premium = extractNumber(insurance, premiumPatterns);
            // If no premium found in insurance section, try entire text
            if (premium === 0) {
                premium = extractNumber(text, premiumPatterns);
            }
            // Only use fallback if no premium found
            if (premium > 0) {
                result.insuranceRecommendation.estimatedPremium = premium;
            }
            else if (result.carDetails.estimatedValue > 0) {
                // Fallback calculation based on car value as last resort
                const premiumRate = result.insuranceRecommendation.recommendedCoverage.toLowerCase().includes('comprehensive') ? 0.06 : 0.03;
                result.insuranceRecommendation.estimatedPremium = Math.round(result.carDetails.estimatedValue * premiumRate);
            }
            // Extract coverage details
            const detailsMatch = insurance.match(/(?:coverage details|policy includes|insurance includes)[:\s]+([^\n]+)/i);
            result.insuranceRecommendation.coverageDetails = detailsMatch ? detailsMatch[1].trim() :
                `${result.insuranceRecommendation.recommendedCoverage} coverage with estimated annual premium of ZMW ${result.insuranceRecommendation.estimatedPremium}`;
        }
        // Parse Similar Cars and Marketplaces
        if (sections[3]) {
            const similar = sections[3];
            // Look for listings with prices
            const listingPatterns = [
                /(?:^\s*|[\n\r]+\s*)[•*-]\s*([^\n]+)/gm,
                /(?:similar|comparable|available)(?:[^.]*?)(?:ZMW|K|ZK|K\s+)?(\d[\d,]*)/gi
            ];
            const listings = [];
            // Try to find structured listings first
            const bulletListings = similar.match(listingPatterns[0]) || [];
            for (const listing of bulletListings) {
                const price = extractNumber(listing, [/(?:ZMW|K|ZK|K\s+)?(\d[\d,]*(?:\.\d{1,2})?)/]);
                if (price > 0) {
                    listings.push({ text: listing.trim().replace(/^[•*-]\s*/, ''), price });
                }
            }
            // If no structured listings found, try to find any price mentions
            if (listings.length === 0) {
                const priceMatches = similar.match(listingPatterns[1]) || [];
                for (const match of priceMatches) {
                    const price = extractNumber(match, [/(\d[\d,]*(?:\.\d{1,2})?)/]);
                    if (price > 0) {
                        listings.push({ text: match.trim(), price });
                    }
                }
            }
            // Convert found listings to the required format
            result.marketplaceRecommendations.similarListings = listings.map(({ text, price }) => ({
                platform: "Used Cars Zambia",
                url: "https://www.usedcars.co.zm/",
                price,
                description: text
            }));
            // Only add fallback listing if no listings were found
            if (result.marketplaceRecommendations.similarListings.length === 0 && result.carDetails.estimatedValue > 0) {
                result.marketplaceRecommendations.similarListings.push({
                    platform: "Used Cars Zambia",
                    url: "https://www.usedcars.co.zm/",
                    price: Math.round(result.carDetails.estimatedValue * 0.9),
                    description: `Similar ${result.carDetails.make} ${result.carDetails.model} (${result.carDetails.estimatedYear})`
                });
            }
        }
    }
    catch (error) {
        console.error('Error parsing Gemini response:', error);
    }
    return result;
}
//# sourceMappingURL=index.js.map