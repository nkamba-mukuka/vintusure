const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase configuration - Updated with actual VintuSure config
const firebaseConfig = {
  apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
  authDomain: "vintusure.firebaseapp.com",
  projectId: "vintusure",
  storageBucket: "vintusure.appspot.com",
  messagingSenderId: "772944178213",
  appId: "1:772944178213:web:2f849891b37b012a7023cc",
  measurementId: "G-MF40L2SQJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Test data
const testUserId = 'test-user-123';
const testAgentId = 'test-agent-456';

// Test customer data
const testCustomer = {
  nrcPassport: '123456789012',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+260955123456',
  address: {
    street: '123 Main Street',
    city: 'Lusaka',
    province: 'Lusaka',
    postalCode: '10101'
  },
  dateOfBirth: '1990-01-15',
  gender: 'male',
  occupation: 'Software Engineer',
  status: 'active',
  createdBy: testUserId,
  agent_id: testAgentId
};

// Test policy data
const testPolicy = {
  type: 'comprehensive',
  status: 'active',
  customerId: '', // Will be set after customer creation
  policyNumber: 'POL-2024-001',
  vehicle: {
    registrationNumber: 'ABC123Z',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    engineNumber: 'ENG123456',
    chassisNumber: 'CHS789012',
    value: 150000,
    usage: 'private'
  },
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  premium: {
    amount: 5000,
    currency: 'ZMW',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer'
  },
  createdBy: testUserId,
  agent_id: testAgentId
};

// Test claim data
const testClaim = {
  policyId: '', // Will be set after policy creation
  customerId: '', // Will be set after customer creation
  incidentDate: '2024-06-15',
  description: 'Vehicle was involved in a minor collision at a traffic light intersection. Front bumper sustained damage.',
  location: {
    latitude: -15.3875,
    longitude: 28.3228,
    address: 'Great East Road, Lusaka, Zambia'
  },
  damageType: 'Vehicle',
  status: 'Submitted',
  documents: [],
  amount: 25000,
  createdBy: testUserId,
  agent_id: testAgentId
};

// Test document data
const testDocument = {
  fileName: 'test-insurance-document.pdf',
  fileType: 'application/pdf',
  fileSize: 1024000,
  fileUrl: 'https://example.com/documents/test-insurance-document.pdf',
  description: 'Test insurance policy document for RAG testing',
  category: 'policy',
  tags: ['test', 'policy', 'insurance', 'rag'],
  uploadedBy: testUserId,
  extractedText: 'This is a test insurance policy document. It contains information about comprehensive coverage for a Toyota Corolla vehicle. The policy covers damage to the vehicle, third party liability, and personal accident benefits. Premium amount is 5000 ZMW payable annually.',
  metadata: {
    pageCount: 5,
    author: 'VintuSure Insurance',
    subject: 'Comprehensive Insurance Policy',
    keywords: ['insurance', 'policy', 'comprehensive', 'vehicle'],
    language: 'en'
  }
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logWithTimestamp = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const checkVectorIndexStatus = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        vectorIndexed: data.vectorIndexed || false,
        vectorIndexedAt: data.vectorIndexedAt,
        vectorIndexingError: data.vectorIndexingError,
        embeddingText: data.embeddingText ? data.embeddingText.substring(0, 100) + '...' : null
      };
    }
    return null;
  } catch (error) {
    console.error(`Error checking vector index status for ${collectionName}/${docId}:`, error);
    return null;
  }
};

// Individual test functions
const testCustomerIndexing = async () => {
  logWithTimestamp('🧪 Testing Customer Indexing...');
  
  try {
    // Create test customer
    logWithTimestamp('📝 Creating test customer...');
    const customerRef = await addDoc(collection(db, 'customers'), {
      ...testCustomer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const customerId = customerRef.id;
    logWithTimestamp(`✅ Customer created with ID: ${customerId}`);

    // Wait for indexing
    logWithTimestamp('⏳ Waiting for customer indexing...');
    await sleep(15000);

    // Check indexing status
    const indexStatus = await checkVectorIndexStatus('customers', customerId);
    logWithTimestamp('📊 Customer Indexing Status:', indexStatus);

    // Test RAG query
    logWithTimestamp('🔍 Testing Customer RAG Query...');
    const ragFunction = httpsCallable(functions, 'queryCustomerRAG');
    const result = await ragFunction({
      query: `Find customer with email ${testCustomer.email}`,
      userId: testUserId
    });

    logWithTimestamp('✅ Customer RAG Result:', {
      success: result.data.success,
      answer: result.data.answer?.substring(0, 200) + '...',
      sourcesCount: result.data.sources?.length || 0
    });

    // Cleanup
    await deleteDoc(doc(db, 'customers', customerId));
    logWithTimestamp('✅ Customer test data cleaned up');

    return { success: true, customerId, indexStatus, ragResult: result.data };

  } catch (error) {
    logWithTimestamp('❌ Customer indexing test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const testClaimsIndexing = async () => {
  logWithTimestamp('🧪 Testing Claims Indexing...');
  
  try {
    // Create test claim
    logWithTimestamp('📝 Creating test claim...');
    const claimRef = await addDoc(collection(db, 'claims'), {
      ...testClaim,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const claimId = claimRef.id;
    logWithTimestamp(`✅ Claim created with ID: ${claimId}`);

    // Wait for indexing
    logWithTimestamp('⏳ Waiting for claim indexing...');
    await sleep(15000);

    // Check indexing status
    const indexStatus = await checkVectorIndexStatus('claims', claimId);
    logWithTimestamp('📊 Claim Indexing Status:', indexStatus);

    // Test RAG query
    logWithTimestamp('🔍 Testing Claims RAG Query...');
    const ragFunction = httpsCallable(functions, 'queryClaimsRAG');
    const result = await ragFunction({
      query: 'Find claims for vehicle damage in Lusaka area',
      userId: testUserId
    });

    logWithTimestamp('✅ Claims RAG Result:', {
      success: result.data.success,
      answer: result.data.answer?.substring(0, 200) + '...',
      sourcesCount: result.data.sources?.length || 0
    });

    // Cleanup
    await deleteDoc(doc(db, 'claims', claimId));
    logWithTimestamp('✅ Claim test data cleaned up');

    return { success: true, claimId, indexStatus, ragResult: result.data };

  } catch (error) {
    logWithTimestamp('❌ Claims indexing test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const testPoliciesIndexing = async () => {
  logWithTimestamp('🧪 Testing Policies Indexing...');
  
  try {
    // Create test policy
    logWithTimestamp('📝 Creating test policy...');
    const policyData = {
      ...testPolicy,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const policyRef = await addDoc(collection(db, 'policies'), policyData);
    const policyId = policyRef.id;
    logWithTimestamp(`✅ Policy created with ID: ${policyId}`);

    // Wait for indexing
    logWithTimestamp('⏳ Waiting for policy indexing...');
    await sleep(15000);

    // Check indexing status
    const indexStatus = await checkVectorIndexStatus('policies', policyId);
    logWithTimestamp('📊 Policy Indexing Status:', indexStatus);

    // Test RAG query
    logWithTimestamp('🔍 Testing Policies RAG Query...');
    const ragFunction = httpsCallable(functions, 'queryPoliciesRAG');
    const result = await ragFunction({
      query: `Find policy for Toyota Corolla with registration ${testPolicy.vehicle.registrationNumber}`,
      userId: testUserId
    });

    logWithTimestamp('✅ Policies RAG Result:', {
      success: result.data.success,
      answer: result.data.answer?.substring(0, 200) + '...',
      sourcesCount: result.data.sources?.length || 0
    });

    // Cleanup
    await deleteDoc(doc(db, 'policies', policyId));
    logWithTimestamp('✅ Policy test data cleaned up');

    return { success: true, policyId, indexStatus, ragResult: result.data };

  } catch (error) {
    logWithTimestamp('❌ Policies indexing test failed:', error.message);
    return { success: false, error: error.message };
  }
};

const testDocumentsIndexing = async () => {
  logWithTimestamp('🧪 Testing Documents Indexing...');
  
  try {
    // Create test document
    logWithTimestamp('📝 Creating test document...');
    const documentData = {
      ...testDocument,
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const documentRef = await addDoc(collection(db, 'documents'), documentData);
    const documentId = documentRef.id;
    logWithTimestamp(`✅ Document created with ID: ${documentId}`);

    // Wait for indexing
    logWithTimestamp('⏳ Waiting for document indexing...');
    await sleep(15000);

    // Check indexing status
    const indexStatus = await checkVectorIndexStatus('documents', documentId);
    logWithTimestamp('📊 Document Indexing Status:', indexStatus);

    // Test RAG query
    logWithTimestamp('🔍 Testing Documents RAG Query...');
    const ragFunction = httpsCallable(functions, 'queryDocumentsRAG');
    const result = await ragFunction({
      query: 'Find documents about comprehensive insurance coverage',
      userId: testUserId
    });

    logWithTimestamp('✅ Documents RAG Result:', {
      success: result.data.success,
      answer: result.data.answer?.substring(0, 200) + '...',
      sourcesCount: result.data.sources?.length || 0
    });

    // Cleanup
    await deleteDoc(doc(db, 'documents', documentId));
    logWithTimestamp('✅ Document test data cleaned up');

    return { success: true, documentId, indexStatus, ragResult: result.data };

  } catch (error) {
    logWithTimestamp('❌ Documents indexing test failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test RAG queries
const testRAGQueries = async () => {
  logWithTimestamp('🧪 Testing RAG Query Functions...');

  const testQueries = [
    {
      name: 'Customer RAG Query',
      function: 'queryCustomerRAG',
      query: 'Find customers who are software engineers in Lusaka'
    },
    {
      name: 'Claims RAG Query',
      function: 'queryClaimsRAG',
      query: 'Show me claims related to vehicle damage in Lusaka'
    },
    {
      name: 'Policies RAG Query',
      function: 'queryPoliciesRAG',
      query: 'Find comprehensive policies for Toyota vehicles'
    },
    {
      name: 'Documents RAG Query',
      function: 'queryDocumentsRAG',
      query: 'Search for insurance policy documents with comprehensive coverage'
    }
  ];

  const results = [];

  for (const testQuery of testQueries) {
    try {
      logWithTimestamp(`Testing ${testQuery.name}...`);
      
      const ragFunction = httpsCallable(functions, testQuery.function);
      const result = await ragFunction({
        query: testQuery.query,
        userId: testUserId
      });

      logWithTimestamp(`✅ ${testQuery.name} Result:`);
      console.log('  Success:', result.data.success);
      console.log('  Answer:', result.data.answer?.substring(0, 200) + '...');
      console.log('  Sources Count:', result.data.sources?.length || 0);
      
      if (result.data.sources && result.data.sources.length > 0) {
        console.log('  Sources:', result.data.sources.map(s => ({
          id: s.customerId || s.claimId || s.policyId || s.documentId,
          similarity: s.similarity,
          info: s.relevantInfo?.substring(0, 50) + '...'
        })));
      }

      results.push({
        name: testQuery.name,
        success: true,
        result: result.data
      });
      
    } catch (error) {
      logWithTimestamp(`❌ ${testQuery.name} failed:`, error.message);
      results.push({
        name: testQuery.name,
        success: false,
        error: error.message
      });
    }
    
    await sleep(2000); // Wait between queries
  }

  return results;
};

// Test general AI question
const testGeneralAIQuestion = async () => {
  logWithTimestamp('🧪 Testing General AI Question...');
  
  try {
    const askQuestionFunction = httpsCallable(functions, 'askQuestion');
    const result = await askQuestionFunction({
      query: 'What are the different types of car insurance coverage available in Zambia?',
      userId: testUserId
    });

    logWithTimestamp('✅ General AI Question Result:');
    console.log('  Success:', result.data.success);
    console.log('  Answer:', result.data.answer?.substring(0, 300) + '...');
    
    return { success: true, result: result.data };
    
  } catch (error) {
    logWithTimestamp('❌ General AI Question failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Main test function
const runIndexingRAGTests = async () => {
  logWithTimestamp('🚀 Starting Complete Indexing and RAG System Tests...');
  
  const testResults = {
    customer: null,
    claims: null,
    policies: null,
    documents: null,
    ragQueries: null,
    generalAI: null
  };

  try {
    // Test individual components
    logWithTimestamp('📋 Testing Individual Components...');
    
    testResults.customer = await testCustomerIndexing();
    await sleep(5000);
    
    testResults.claims = await testClaimsIndexing();
    await sleep(5000);
    
    testResults.policies = await testPoliciesIndexing();
    await sleep(5000);
    
    testResults.documents = await testDocumentsIndexing();
    await sleep(5000);

    // Test RAG queries
    logWithTimestamp('🔍 Testing RAG Queries...');
    testResults.ragQueries = await testRAGQueries();

    // Test general AI
    logWithTimestamp('🤖 Testing General AI...');
    testResults.generalAI = await testGeneralAIQuestion();

    // Summary
    logWithTimestamp('📊 Test Summary:');
    console.log('Customer Indexing:', testResults.customer?.success ? '✅ PASS' : '❌ FAIL');
    console.log('Claims Indexing:', testResults.claims?.success ? '✅ PASS' : '❌ FAIL');
    console.log('Policies Indexing:', testResults.policies?.success ? '✅ PASS' : '❌ FAIL');
    console.log('Documents Indexing:', testResults.documents?.success ? '✅ PASS' : '❌ FAIL');
    console.log('RAG Queries:', testResults.ragQueries?.filter(r => r.success).length + '/' + testResults.ragQueries?.length);
    console.log('General AI:', testResults.generalAI?.success ? '✅ PASS' : '❌ FAIL');

    logWithTimestamp('🎉 All tests completed!');

  } catch (error) {
    logWithTimestamp('❌ Test suite failed:', error.message);
    console.error('Full error:', error);
  }

  return testResults;
};

// Run the tests
if (require.main === module) {
  runIndexingRAGTests()
    .then((results) => {
      logWithTimestamp('🏁 Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      logWithTimestamp('💥 Test script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runIndexingRAGTests,
  testCustomerIndexing,
  testClaimsIndexing,
  testPoliciesIndexing,
  testDocumentsIndexing,
  testRAGQueries,
  testGeneralAIQuestion
};
