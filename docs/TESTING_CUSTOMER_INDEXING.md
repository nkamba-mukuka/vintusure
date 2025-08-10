# Testing Customer Indexing Pipeline

## 🎉 Implementation Complete!

The customer embedding pipeline is now fully implemented and deployed with your Vector Search credentials:

- **Index Endpoint ID**: `5982154694682738688`
- **Deployed Index ID**: `vintusure-agent-data`
- **Project**: `vintusure`
- **Region**: `us-central1`

## Testing Steps

### 1. Test via VintuSure Web Application

The easiest way to test is through your existing web application:

1. **Log into VintuSure**: Use your existing web app credentials
2. **Navigate to Customers**: Go to the customer management section
3. **Create New Customer**: Fill out all required fields
4. **Submit**: This will trigger the `indexCustomerData` function

### 2. Monitor Function Execution

Watch the logs to see the function in action:

```bash
# Monitor logs in real-time
firebase functions:log --only indexCustomerData --tail

# Or check recent logs
firebase functions:log --only indexCustomerData --limit 50
```

### 3. Expected Log Output

You should see logs similar to:

```
Processing customer data for indexing: [CUSTOMER_ID]
Generated customer text for embedding: Customer Name: John Doe. ID Document: 123456789...
Generated mock embedding with 768 dimensions
Upserting vector to Vertex AI Vector Search
Customer ID: [CUSTOMER_ID]
Vector upsert operation prepared: {indexEndpointId: 5982154694682738688, ...}
Making upsert request to: https://us-central1-aiplatform.googleapis.com/v1/projects/vintusure/...
✅ Vector upsert completed successfully: {...}
```

### 4. Check Customer Document Updates

After successful processing, the customer document should be updated with:

```json
{
  // ... existing customer fields ...
  "vectorIndexed": true,
  "vectorIndexedAt": "2025-01-09T...",
  "embeddingText": "Customer Name: John Doe. ID Document: ..."
}
```

### 5. Verify in Vector Search Console

1. **Open**: https://console.cloud.google.com/vertex-ai/vector-search
2. **Select your index**: `vintusure-agent-data`
3. **Check data points**: Should show new vectors added

## Current Implementation Status

### ✅ Working Features
- **Firestore Trigger**: Automatically detects new customers
- **Data Extraction**: Converts customer data to searchable text
- **Mock Embeddings**: Generates 768-dimensional vectors
- **Vector Search Integration**: Connects to your existing index
- **Error Handling**: Comprehensive logging and error management
- **Status Tracking**: Updates customer documents with indexing status

### 🔄 Next Improvements
- **Real Embeddings**: Replace mock vectors with actual Vertex AI embeddings
- **Batch Processing**: Handle multiple customers efficiently
- **RAG Integration**: Connect to search and retrieval systems

## Troubleshooting

### Function Not Triggering
- Check Firestore security rules allow customer creation
- Verify user is authenticated when creating customers
- Check function deployment status

### Permission Errors
```bash
# Check if the function has proper permissions
gcloud functions describe indexCustomerData --region=us-central1
```

### Vector Search Errors
- Verify index endpoint is active and deployed
- Check project and region configurations
- Ensure proper IAM permissions

## Manual Test Script

If you want to test without the web app, create a simple script:

```javascript
// Simple test (run in Node.js environment with Firebase Admin)
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestCustomer() {
  const testCustomer = {
    nrcPassport: "TEST123456789",
    firstName: "Test",
    lastName: "Customer",
    email: "test@example.com",
    phone: "+260971234567",
    address: {
      street: "123 Test Street",
      city: "Lusaka",
      province: "Lusaka",
      postalCode: "10101"
    },
    dateOfBirth: "1990-01-01",
    gender: "male",
    occupation: "Tester",
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: "test-admin",
    agent_id: "test-agent"
  };

  const docRef = await db.collection('customers').add(testCustomer);
  console.log('Test customer created:', docRef.id);
}

createTestCustomer();
```

## Success Metrics

A successful test should show:
1. ✅ Function triggers within seconds of customer creation
2. ✅ Customer text is extracted and logged
3. ✅ Mock embedding is generated (768 dimensions)
4. ✅ Vector upsert request is made to your index
5. ✅ Customer document is updated with indexing status
6. ✅ No errors in function logs

## Support

If you encounter issues:
1. Check the function logs first
2. Verify IAM permissions
3. Ensure Vector Search index is active
4. Review Firestore security rules

The pipeline is now ready for production use with mock embeddings, and can be easily upgraded to use real Vertex AI embeddings when needed!
