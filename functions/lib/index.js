import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { onObjectFinalized, onObjectDeleted } from 'firebase-functions/v2/storage';
import { VertexAI } from '@google-cloud/vertexai';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
const storage = getStorage();
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
// Firestore Triggers
// Trigger when a new policy is created
export const onPolicyCreated = onDocumentCreated('policies/{policyId}', async (event) => {
    try {
        const policyData = event.data?.data();
        const policyId = event.params.policyId;
        console.log(`New policy created: ${policyId}`, policyData);
        // Update policy status and send notifications
        await db.collection('policies').doc(policyId).update({
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp()
        });
        // Send notification to customer
        if (policyData?.customerId) {
            await db.collection('notifications').add({
                userId: policyData.customerId,
                type: 'policy_created',
                title: 'Policy Created Successfully',
                message: `Your policy ${policyData.policyNumber} has been created and is now active.`,
                timestamp: FieldValue.serverTimestamp(),
                read: false
            });
        }
    }
    catch (error) {
        console.error('Error in onPolicyCreated trigger:', error);
    }
});
// Trigger when a policy is updated
export const onPolicyUpdated = onDocumentUpdated('policies/{policyId}', async (event) => {
    try {
        const beforeData = event.data?.before.data();
        const afterData = event.data?.after.data();
        const policyId = event.params.policyId;
        console.log(`Policy updated: ${policyId}`, { before: beforeData, after: afterData });
        // Update last modified timestamp
        await db.collection('policies').doc(policyId).update({
            lastUpdated: FieldValue.serverTimestamp()
        });
        // Log policy changes for audit
        await db.collection('policyAuditLogs').add({
            policyId,
            action: 'updated',
            beforeData,
            afterData,
            timestamp: FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error('Error in onPolicyUpdated trigger:', error);
    }
});
// Trigger when a claim is created
export const onClaimCreated = onDocumentCreated('claims/{claimId}', async (event) => {
    try {
        const claimData = event.data?.data();
        const claimId = event.params.claimId;
        console.log(`New claim created: ${claimId}`, claimData);
        // Update claim status
        await db.collection('claims').doc(claimId).update({
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp()
        });
        // Send notification to customer
        if (claimData?.customerId) {
            await db.collection('notifications').add({
                userId: claimData.customerId,
                type: 'claim_submitted',
                title: 'Claim Submitted',
                message: `Your claim ${claimData.claimNumber} has been submitted and is under review.`,
                timestamp: FieldValue.serverTimestamp(),
                read: false
            });
        }
        // Send notification to admin/agent
        await db.collection('adminNotifications').add({
            type: 'new_claim',
            title: 'New Claim Submitted',
            message: `A new claim ${claimData?.claimNumber} has been submitted and requires review.`,
            claimId,
            timestamp: FieldValue.serverTimestamp(),
            read: false
        });
    }
    catch (error) {
        console.error('Error in onClaimCreated trigger:', error);
    }
});
// Trigger when a customer is created
export const onCustomerCreated = onDocumentCreated('customers/{customerId}', async (event) => {
    try {
        const customerData = event.data?.data();
        const customerId = event.params.customerId;
        console.log(`New customer created: ${customerId}`, customerData);
        // Update customer metadata
        await db.collection('customers').doc(customerId).update({
            createdAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp(),
            status: 'active'
        });
        // Create customer profile
        await db.collection('customerProfiles').doc(customerId).set({
            customerId,
            policies: [],
            claims: [],
            documents: [],
            preferences: {},
            createdAt: FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error('Error in onCustomerCreated trigger:', error);
    }
});
// Authentication Triggers
// Trigger when a new user signs up
export const onUserSignUp = beforeUserCreated(async (event) => {
    try {
        const user = event.data;
        console.log(`New user signing up: ${user.uid}`, user);
        // Create customer record
        await db.collection('customers').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            phoneNumber: user.phoneNumber || '',
            emailVerified: user.emailVerified || false,
            createdAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp(),
            status: 'active'
        });
        // Send welcome notification
        await db.collection('notifications').add({
            userId: user.uid,
            type: 'welcome',
            title: 'Welcome to VintuSure!',
            message: 'Thank you for joining VintuSure. Your account has been created successfully.',
            timestamp: FieldValue.serverTimestamp(),
            read: false
        });
    }
    catch (error) {
        console.error('Error in onUserSignUp trigger:', error);
    }
});
// Storage Triggers
// Trigger when a document is uploaded
export const onDocumentUploaded = onObjectFinalized(async (event) => {
    try {
        const filePath = event.data.name;
        const bucketName = event.data.bucket;
        console.log(`Document uploaded: ${filePath} in bucket: ${bucketName}`);
        // Extract metadata from file path
        const pathParts = filePath.split('/');
        const userId = pathParts[1]; // Assuming path structure: users/{userId}/documents/{filename}
        const fileName = pathParts[pathParts.length - 1];
        // Get file metadata
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [metadata] = await file.getMetadata();
        // Create document record in Firestore
        await db.collection('documents').add({
            userId,
            fileName,
            filePath,
            bucketName,
            contentType: metadata.contentType,
            size: metadata.size,
            uploadedAt: FieldValue.serverTimestamp(),
            status: 'pending_review',
            metadata: {
                originalName: fileName,
                uploadedBy: userId,
                fileType: metadata.contentType
            }
        });
        // Send notification to user
        await db.collection('notifications').add({
            userId,
            type: 'document_uploaded',
            title: 'Document Uploaded',
            message: `Your document "${fileName}" has been uploaded successfully and is pending review.`,
            timestamp: FieldValue.serverTimestamp(),
            read: false
        });
    }
    catch (error) {
        console.error('Error in onDocumentUploaded trigger:', error);
    }
});
// Trigger when a document is deleted
export const onDocumentDeleted = onObjectDeleted(async (event) => {
    try {
        const filePath = event.data.name;
        const bucketName = event.data.bucket;
        console.log(`Document deleted: ${filePath} from bucket: ${bucketName}`);
        // Update document status in Firestore
        const documentsRef = db.collection('documents');
        const query = documentsRef.where('filePath', '==', filePath);
        const snapshot = await query.get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({
                status: 'deleted',
                deletedAt: FieldValue.serverTimestamp()
            });
        }
    }
    catch (error) {
        console.error('Error in onDocumentDeleted trigger:', error);
    }
});
//# sourceMappingURL=index.js.map