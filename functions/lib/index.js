import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
export const askQuestion = onRequest(async (req, res) => {
    try {
        console.log('Received request:', req.body);
        const { query } = req.body;
        const userId = 'anonymous'; // Simplified for testing
        if (!query) {
            res.status(400).json({ error: 'Query is required.' });
            return;
        }
        // Since RAG is not implemented yet, we'll just use the query directly
        const prompt = `Answer this insurance-related question: ${query}`;
        console.log('Using prompt:', prompt);
        // Call Vertex AI LLM
        const project = 'vintusure'; // Updated to use our actual project ID
        console.log('Using project ID:', project);
        const location = 'us-central1';
        const modelName = 'gemini-pro'; // Updated to use the correct model name
        console.log('Initializing Vertex AI...');
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: modelName });
        console.log('Generating content...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate an answer at this time.";
        console.log('Generated answer:', answer);
        // Log query usage
        console.log('Logging to Firestore...');
        await db.collection('queryLogs').add({
            userId,
            query,
            answer,
            timestamp: FieldValue.serverTimestamp(),
        });
        res.json({ answer });
    }
    catch (error) {
        console.error("Error in askQuestion function:", error);
        // Log detailed error information
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
        res.status(500).json({
            error: 'Failed to process query.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=index.js.map