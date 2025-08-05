import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: 'vintusure',
    location: 'us-central1'
});
const model = 'gemini-1.5-flash';
// Generation configuration
const generationConfig = {
    maxOutputTokens: 65535,
    temperature: 1,
    topP: 0.95,
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
export const askQuestion = onRequest(async (req, res) => {
    try {
        console.log('Received RAG request:', req.body);
        const { query, userId = 'anonymous' } = req.body;
        if (!query) {
            res.status(400).json({
                success: false,
                error: 'Query is required.'
            });
            return;
        }
        console.log('Processing query:', query);
        console.log('Generating content with RAG...');
        // Get the generative model
        const generativeModel = vertexAI.getGenerativeModel({
            model: model,
            generation_config: generationConfig,
        });
        // Generate content with RAG
        const result = await generativeModel.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: query }]
                }
            ],
        });
        const fullResponse = result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate an answer at this time.";
        console.log('Full response generated:', fullResponse);
        // Log the query and response to Firestore
        await db.collection('queryLogs').add({
            userId,
            query,
            answer: fullResponse,
            timestamp: FieldValue.serverTimestamp(),
            model: model,
            ragEnabled: true,
        });
        res.json({
            answer: fullResponse,
            success: true
        });
    }
    catch (error) {
        console.error("Error in RAG askQuestion function:", error);
        // Log detailed error information
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to process query with RAG.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Health check endpoint
export const healthCheck = onRequest(async (req, res) => {
    res.json({
        status: 'healthy',
        service: 'VintuSure RAG API',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=index.js.map