"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFunction = exports.healthCheck = exports.askQuestion = void 0;
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
// Initialize Firebase Admin SDK
(0, firebase_1.getFirebaseApp)();
const db = (0, firestore_1.getFirestore)();
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
    maxInstances: 10,
    cors: true,
}, async (request) => {
    try {
        console.log('Received request:', request.data);
        // Extract user ID from Firebase Auth context
        const userId = request.auth?.uid || 'anonymous';
        const { query } = request.data || {};
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
        // Call Vertex AI LLM
        const project = 'vintusure';
        const location = 'us-central1';
        const modelName = 'gemini-2.5-flash-lite';
        console.log('Initializing Vertex AI...');
        const vertexAI = new vertexai_1.VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: modelName });
        console.log('Generating content...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
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
// Health check endpoint with authentication
exports.healthCheck = (0, https_1.onCall)({
    maxInstances: 10,
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
    return {
        message: 'Test function is working!'
    };
});
//# sourceMappingURL=index.js.map