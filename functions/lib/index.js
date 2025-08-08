"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = exports.analyzeCarPhoto = exports.uploadFile = exports.getSignedDownloadUrl = exports.getSignedUploadUrl = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
const https_2 = require("firebase-functions/v2/https");
const storage_1 = require("@google-cloud/storage");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// --- Configuration ---
// Replace with your actual bucket name.
const bucketName = 'vintusure-gcs-bucket';
// Create a new Storage client instance
const storage = new storage_1.Storage();
/**
 * Generates a signed upload URL for a file in Google Cloud Storage.
 * This is a callable function, invoked by the client.
 * @param {object} data - The data sent from the client.
 * @param {string} data.fileName - The full path of the file to upload (e.g., 'agent documents/policies/user123/file.pdf').
 * @param {string} data.contentType - The MIME type of the file (e.g., 'application/pdf').
 * @returns {object} An object containing a success flag and the signed URL.
 */
exports.getSignedUploadUrl = (0, https_2.onRequest)(async (request, response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { fileName, contentType } = request.body;
        // Ensure file name and content type are provided
        if (!fileName || !contentType) {
            response.status(400).json({
                success: false,
                error: 'File name and content type are required.'
            });
            return;
        }
        // Get a reference to the file in the bucket
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        // Configure the options for the signed URL
        const options = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
            contentType: contentType,
        };
        // Generate the signed URL
        const [url] = await file.getSignedUrl(options);
        console.log(`Generated signed upload URL for file: ${fileName}`);
        response.json({ success: true, url: url });
    }
    catch (error) {
        console.error('Error generating signed upload URL:', error);
        response.status(500).json({
            success: false,
            error: 'Failed to generate signed upload URL.'
        });
    }
});
/**
 * Generates a signed download URL for a file in Google Cloud Storage.
 * This is a callable function, invoked by the client.
 * @param {object} data - The data sent from the client.
 * @param {string} data.fileName - The full path of the file to download.
 * @returns {object} An object containing a success flag and the signed URL.
 */
exports.getSignedDownloadUrl = (0, https_2.onRequest)(async (request, response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { fileName } = request.body;
        // Ensure file name is provided
        if (!fileName) {
            response.status(400).json({
                success: false,
                error: 'File name is required.'
            });
            return;
        }
        // Get a reference to the file in the bucket
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        // Configure the options for the signed URL
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // URL expires in 1 hour
        };
        // Generate the signed URL
        const [url] = await file.getSignedUrl(options);
        console.log(`Generated signed download URL for file: ${fileName}`);
        response.json({ success: true, url: url });
    }
    catch (error) {
        console.error('Error generating signed download URL:', error);
        response.status(500).json({
            success: false,
            error: 'Failed to generate signed download URL.'
        });
    }
});
// Legacy function for backward compatibility (can be removed later)
exports.uploadFile = (0, https_2.onRequest)(async (request, response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { fileData, fileName, userId } = request.body;
        if (!fileData || !fileName || !userId) {
            response.status(400).json({
                success: false,
                error: 'File data, file name, and user ID are required.'
            });
            return;
        }
        // Convert base64 to buffer
        const buffer = Buffer.from(fileData, 'base64');
        // Get content type based on file extension
        const contentType = getContentType(fileName);
        // Upload to Google Cloud Storage
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);
        await file.save(buffer, {
            metadata: {
                contentType: contentType,
                metadata: {
                    uploaded_at: new Date().toISOString(),
                    file_size: buffer.length.toString(),
                    content_type: contentType,
                    uploaded_by: userId,
                },
            },
        });
        // Generate signed URL for download
        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        console.log(`File uploaded successfully: ${fileName}`);
        response.json({
            success: true,
            data: {
                url: signedUrl,
                path: fileName,
            },
        });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        response.status(500).json({
            success: false,
            error: 'Failed to upload file.'
        });
    }
});
/**
 * Helper function to determine content type based on file extension
 */
function getContentType(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'application/pdf';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'doc':
            return 'application/msword';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
}
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
        const prompt = `You are an expert car appraiser and insurance advisor in Zambia. Analyze this car image and provide detailed information in the following format:

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
        // Wait for the response to be ready
        const response = await result.response;
        const answer = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) {
            console.error('No text content in Gemini response:', response);
            throw new Error('No response from Gemini');
        }
        // Log the raw response for debugging
        console.log('Raw Gemini response:', answer);
        // Parse the response text into structured data
        const parsedResponse = parseGeminiResponse(answer);
        // Log the parsed response for debugging
        console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
        // Validate the parsed response
        if (!parsedResponse.carDetails.make || !parsedResponse.carDetails.model) {
            console.error('Failed to parse car details:', parsedResponse);
            throw new Error('Failed to parse car details from Gemini response');
        }
        return parsedResponse;
    }
    catch (error) {
        console.error('Error in analyzeCarPhoto:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze car photo: ' + (error instanceof Error ? error.message : 'Unknown error'), error instanceof Error ? error.stack : undefined);
    }
});
// Employee Question-Answering Function
exports.askQuestion = (0, https_1.onCall)({
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
        const vertexAI = new vertexai_1.VertexAI({ project, location });
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
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            success: true
        });
        return {
            success: true,
            answer: sanitizedAnswer
        };
    }
    catch (error) {
        console.error('Error in askQuestion:', error);
        // Log error
        await db.collection('queryLogs').add({
            userId: request.auth?.uid || 'anonymous',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: firestore_1.FieldValue.serverTimestamp(),
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
function parseGeminiResponse(text) {
    console.log('Starting to parse response text:', text.substring(0, 100) + '...');
    const sections = text.split(/\d+\./);
    console.log('Found sections:', sections.length);
    const result = {
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
    }
    catch (error) {
        console.error('Error parsing Gemini response:', error);
        throw error; // Re-throw to be caught by the main function
    }
    // Log final result
    console.log('Final parsed result:', JSON.stringify(result, null, 2));
    return result;
}
//# sourceMappingURL=index.js.map