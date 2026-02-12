# VintuSure Indexing and RAG System Tests

This test suite validates the indexing and RAG (Retrieval-Augmented Generation) functionality for the VintuSure insurance system. It tests customer, claim, policy creation, and document upload with vector indexing and semantic search capabilities.

## 🎯 Test Overview

The test suite covers:

1. **Customer Indexing & RAG** - Tests customer data creation, vector indexing, and semantic search
2. **Claims Indexing & RAG** - Tests claim data creation, vector indexing, and semantic search  
3. **Policies Indexing & RAG** - Tests policy data creation, vector indexing, and semantic search
4. **Documents Indexing & RAG** - Tests document upload, vector indexing, and semantic search
5. **General AI Queries** - Tests the general question-answering functionality
6. **RAG Query Functions** - Tests all RAG endpoints with various queries

## 🚀 Quick Start

### Prerequisites

1. **Firebase Configuration**: Update the Firebase config in `test-indexing-rag-system.js`
2. **Dependencies**: Install required packages
3. **Firebase Functions**: Ensure your Firebase functions are deployed
4. **Vector Search Indexes**: Verify your Vertex AI Vector Search indexes are set up

### Installation

```bash
# Install dependencies
npm install firebase firebase-admin dotenv

# Or use the provided package.json
cp test-package.json package.json
npm install
```

### Configuration

1. **Update Firebase Config**: Replace the placeholder config in `test-indexing-rag-system.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

2. **Environment Variables** (optional): Create a `.env` file:

```env
FIREBASE_PROJECT_ID=vintusure
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 🧪 Running Tests

### Complete Test Suite

Run all tests in sequence:

```bash
node test-indexing-rag-system.js
```

### Individual Component Tests

Test specific components:

```bash
# Test customer indexing and RAG
node -e "require('./test-indexing-rag-system.js').testCustomerIndexing()"

# Test claims indexing and RAG  
node -e "require('./test-indexing-rag-system.js').testClaimsIndexing()"

# Test policies indexing and RAG
node -e "require('./test-indexing-rag-system.js').testPoliciesIndexing()"

# Test documents indexing and RAG
node -e "require('./test-indexing-rag-system.js').testDocumentsIndexing()"

# Test RAG queries only
node -e "require('./test-indexing-rag-system.js').testRAGQueries()"

# Test general AI questions
node -e "require('./test-indexing-rag-system.js').testGeneralAIQuestion()"
```

### Using npm Scripts

If you're using the provided `package.json`:

```bash
# Run complete test suite
npm test

# Run individual tests
npm run test:customer
npm run test:claims
npm run test:policies
npm run test:documents
npm run test:rag
```

## 📊 Test Results

The test suite provides detailed logging with timestamps and structured results:

### Expected Output

```
[2024-01-15T10:30:00.000Z] 🚀 Starting Complete Indexing and RAG System Tests...
[2024-01-15T10:30:01.000Z] 📋 Testing Individual Components...
[2024-01-15T10:30:01.000Z] 🧪 Testing Customer Indexing...
[2024-01-15T10:30:01.000Z] 📝 Creating test customer...
[2024-01-15T10:30:02.000Z] ✅ Customer created with ID: abc123...
[2024-01-15T10:30:02.000Z] ⏳ Waiting for customer indexing...
[2024-01-15T10:30:17.000Z] 📊 Customer Indexing Status: {
  "vectorIndexed": true,
  "vectorIndexedAt": "2024-01-15T10:30:15.000Z",
  "embeddingText": "Customer Name: John Doe. ID Document: 123456789012..."
}
[2024-01-15T10:30:17.000Z] 🔍 Testing Customer RAG Query...
[2024-01-15T10:30:18.000Z] ✅ Customer RAG Result: {
  "success": true,
  "answer": "I found a customer matching your query...",
  "sourcesCount": 1
}
```

### Test Summary

```
📊 Test Summary:
Customer Indexing: ✅ PASS
Claims Indexing: ✅ PASS  
Policies Indexing: ✅ PASS
Documents Indexing: ✅ PASS
RAG Queries: 4/4
General AI: ✅ PASS
```

## 🔧 Test Components

### 1. Customer Indexing Test

- Creates a test customer with complete profile data
- Waits for automatic vector indexing (15 seconds)
- Verifies indexing status in Firestore
- Tests customer-specific RAG queries
- Cleans up test data

### 2. Claims Indexing Test

- Creates a test claim with incident details
- Waits for automatic vector indexing
- Verifies indexing status
- Tests claims-specific RAG queries
- Cleans up test data

### 3. Policies Indexing Test

- Creates a test policy with vehicle and coverage details
- Waits for automatic vector indexing
- Verifies indexing status
- Tests policies-specific RAG queries
- Cleans up test data

### 4. Documents Indexing Test

- Creates a test document with metadata and extracted text
- Waits for automatic vector indexing
- Verifies indexing status
- Tests documents-specific RAG queries
- Cleans up test data

### 5. RAG Query Tests

Tests all RAG endpoints with various query types:

- **Customer RAG**: `queryCustomerRAG`
- **Claims RAG**: `queryClaimsRAG`  
- **Policies RAG**: `queryPoliciesRAG`
- **Documents RAG**: `queryDocumentsRAG`

### 6. General AI Test

Tests the general question-answering functionality using `askQuestion`.

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify Firebase config is correct
   - Check network connectivity
   - Ensure Firebase project is active

2. **Function Not Found Errors**
   - Verify Firebase functions are deployed
   - Check function names match exactly
   - Ensure proper CORS configuration

3. **Indexing Timeout Errors**
   - Increase wait time in test script
   - Check Vertex AI Vector Search indexes are active
   - Verify embedding generation is working

4. **Authentication Errors**
   - Check Firebase authentication setup
   - Verify service account permissions
   - Ensure proper API keys

### Debug Mode

Enable detailed logging by modifying the test script:

```javascript
// Add debug logging
console.log('Debug: Function response:', JSON.stringify(result, null, 2));
```

### Manual Verification

Check indexing status manually:

```javascript
// Check if document is indexed
const docRef = doc(db, 'customers', 'customer-id');
const docSnap = await getDoc(docRef);
console.log('Indexing status:', docSnap.data().vectorIndexed);
```

## 📋 Test Data

The test suite uses realistic test data:

- **Customer**: John Doe, Software Engineer in Lusaka
- **Policy**: Comprehensive Toyota Corolla coverage
- **Claim**: Vehicle damage claim in Lusaka
- **Document**: Insurance policy document with extracted text

## 🔄 Continuous Testing

For continuous integration:

```bash
# Run tests and save results
node test-indexing-rag-system.js > test-results.log 2>&1

# Check exit code
echo $?
```

## 📈 Performance Monitoring

Monitor test performance:

- **Indexing Time**: Typically 10-15 seconds per document
- **RAG Query Time**: Typically 2-5 seconds per query
- **Vector Search Accuracy**: Check similarity scores in results

## 🚨 Security Notes

- Test data is automatically cleaned up after each test
- No sensitive data is logged or stored
- Use test Firebase project for testing
- Verify proper access controls are in place

## 📞 Support

For issues with the test suite:

1. Check the troubleshooting section
2. Verify Firebase and Vertex AI setup
3. Review function logs in Firebase Console
4. Check Vector Search index status

## 🔄 Updates

Keep the test suite updated with:

- New data types and fields
- Updated function signatures
- New RAG capabilities
- Performance improvements
