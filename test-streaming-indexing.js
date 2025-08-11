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

// Test streaming indexing with creation, update, and deletion
const testStreamingIndexing = async () => {
  logWithTimestamp('🚀 Starting Streaming Indexing Test Suite...');
  
  const testResults = {
    customer: { create: null, update: null, delete: null },
    claim: { create: null, update: null, delete: null },
    policy: { create: null, update: null, delete: null }
  };

  try {
    // ============================================================================
    // CUSTOMER STREAMING INDEXING TESTS
    // ============================================================================
    logWithTimestamp('🧪 Testing Customer Streaming Indexing...');

    // 1. Create customer and test indexing
    logWithTimestamp('📝 Creating test customer...');
    const customerRef = await addDoc(collection(db, 'customers'), {
      ...testCustomer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const customerId = customerRef.id;
    logWithTimestamp(`✅ Customer created with ID: ${customerId}`);

    // Wait for creation indexing
    logWithTimestamp('⏳ Waiting for customer creation indexing...');
    await sleep(15000);

    // Check creation indexing status
    const createIndexStatus = await checkVectorIndexStatus('customers', customerId);
    logWithTimestamp('📊 Customer Creation Indexing Status:', createIndexStatus);
    testResults.customer.create = { success: createIndexStatus?.vectorIndexed === true, status: createIndexStatus };

    // 2. Update customer and test re-indexing
    logWithTimestamp('🔄 Updating customer data...');
    await updateDoc(doc(db, 'customers', customerId), {
      firstName: 'Jane',
      occupation: 'Data Scientist',
      updatedAt: serverTimestamp()
    });
    logWithTimestamp('✅ Customer updated');

    // Wait for update indexing
    logWithTimestamp('⏳ Waiting for customer update indexing...');
    await sleep(15000);

    // Check update indexing status
    const updateIndexStatus = await checkVectorIndexStatus('customers', customerId);
    logWithTimestamp('📊 Customer Update Indexing Status:', updateIndexStatus);
    testResults.customer.update = { success: updateIndexStatus?.vectorIndexed === true, status: updateIndexStatus };

    // 3. Test RAG query after update
    logWithTimestamp('🔍 Testing Customer RAG Query after update...');
    const customerRagFunction = httpsCallable(functions, 'queryCustomerRAG');
    const customerRagResult = await customerRagFunction({
      query: 'Find customer who is a data scientist',
      userId: testUserId
    });
    logWithTimestamp('✅ Customer RAG Result after update:', {
      success: customerRagResult.data.success,
      answer: customerRagResult.data.answer?.substring(0, 200) + '...',
      sourcesCount: customerRagResult.data.sources?.length || 0
    });

    // 4. Delete customer and test cleanup
    logWithTimestamp('🗑️ Deleting customer...');
    await deleteDoc(doc(db, 'customers', customerId));
    logWithTimestamp('✅ Customer deleted');

    // Wait for delete cleanup
    logWithTimestamp('⏳ Waiting for customer deletion cleanup...');
    await sleep(10000);

    // Test RAG query after deletion (should not find the deleted customer)
    logWithTimestamp('🔍 Testing Customer RAG Query after deletion...');
    const customerRagResultAfterDelete = await customerRagFunction({
      query: 'Find customer Jane Doe who is a data scientist',
      userId: testUserId
    });
    logWithTimestamp('✅ Customer RAG Result after deletion:', {
      success: customerRagResultAfterDelete.data.success,
      answer: customerRagResultAfterDelete.data.answer?.substring(0, 200) + '...',
      sourcesCount: customerRagResultAfterDelete.data.sources?.length || 0
    });
    testResults.customer.delete = { success: true, ragResult: customerRagResultAfterDelete.data };

    await sleep(5000);

    // ============================================================================
    // CLAIM STREAMING INDEXING TESTS
    // ============================================================================
    logWithTimestamp('🧪 Testing Claim Streaming Indexing...');

    // 1. Create claim and test indexing
    logWithTimestamp('📝 Creating test claim...');
    const claimRef = await addDoc(collection(db, 'claims'), {
      ...testClaim,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const claimId = claimRef.id;
    logWithTimestamp(`✅ Claim created with ID: ${claimId}`);

    // Wait for creation indexing
    logWithTimestamp('⏳ Waiting for claim creation indexing...');
    await sleep(15000);

    // Check creation indexing status
    const claimCreateIndexStatus = await checkVectorIndexStatus('claims', claimId);
    logWithTimestamp('📊 Claim Creation Indexing Status:', claimCreateIndexStatus);
    testResults.claim.create = { success: claimCreateIndexStatus?.vectorIndexed === true, status: claimCreateIndexStatus };

    // 2. Update claim and test re-indexing
    logWithTimestamp('🔄 Updating claim data...');
    await updateDoc(doc(db, 'claims', claimId), {
      status: 'UnderReview',
      amount: 30000,
      updatedAt: serverTimestamp()
    });
    logWithTimestamp('✅ Claim updated');

    // Wait for update indexing
    logWithTimestamp('⏳ Waiting for claim update indexing...');
    await sleep(15000);

    // Check update indexing status
    const claimUpdateIndexStatus = await checkVectorIndexStatus('claims', claimId);
    logWithTimestamp('📊 Claim Update Indexing Status:', claimUpdateIndexStatus);
    testResults.claim.update = { success: claimUpdateIndexStatus?.vectorIndexed === true, status: claimUpdateIndexStatus };

    // 3. Test RAG query after update
    logWithTimestamp('🔍 Testing Claim RAG Query after update...');
    const claimRagFunction = httpsCallable(functions, 'queryClaimsRAG');
    const claimRagResult = await claimRagFunction({
      query: 'Find claims under review with amount 30000',
      userId: testUserId
    });
    logWithTimestamp('✅ Claim RAG Result after update:', {
      success: claimRagResult.data.success,
      answer: claimRagResult.data.answer?.substring(0, 200) + '...',
      sourcesCount: claimRagResult.data.sources?.length || 0
    });

    // 4. Delete claim and test cleanup
    logWithTimestamp('🗑️ Deleting claim...');
    await deleteDoc(doc(db, 'claims', claimId));
    logWithTimestamp('✅ Claim deleted');

    // Wait for delete cleanup
    logWithTimestamp('⏳ Waiting for claim deletion cleanup...');
    await sleep(10000);

    // Test RAG query after deletion
    logWithTimestamp('🔍 Testing Claim RAG Query after deletion...');
    const claimRagResultAfterDelete = await claimRagFunction({
      query: 'Find claims under review with amount 30000',
      userId: testUserId
    });
    logWithTimestamp('✅ Claim RAG Result after deletion:', {
      success: claimRagResultAfterDelete.data.success,
      answer: claimRagResultAfterDelete.data.answer?.substring(0, 200) + '...',
      sourcesCount: claimRagResultAfterDelete.data.sources?.length || 0
    });
    testResults.claim.delete = { success: true, ragResult: claimRagResultAfterDelete.data };

    await sleep(5000);

    // ============================================================================
    // POLICY STREAMING INDEXING TESTS
    // ============================================================================
    logWithTimestamp('🧪 Testing Policy Streaming Indexing...');

    // 1. Create policy and test indexing
    logWithTimestamp('📝 Creating test policy...');
    const policyRef = await addDoc(collection(db, 'policies'), {
      ...testPolicy,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    const policyId = policyRef.id;
    logWithTimestamp(`✅ Policy created with ID: ${policyId}`);

    // Wait for creation indexing
    logWithTimestamp('⏳ Waiting for policy creation indexing...');
    await sleep(15000);

    // Check creation indexing status
    const policyCreateIndexStatus = await checkVectorIndexStatus('policies', policyId);
    logWithTimestamp('📊 Policy Creation Indexing Status:', policyCreateIndexStatus);
    testResults.policy.create = { success: policyCreateIndexStatus?.vectorIndexed === true, status: policyCreateIndexStatus };

    // 2. Update policy and test re-indexing
    logWithTimestamp('🔄 Updating policy data...');
    await updateDoc(doc(db, 'policies', policyId), {
      'vehicle.make': 'Honda',
      'vehicle.model': 'Civic',
      'premium.amount': 6000,
      updatedAt: serverTimestamp()
    });
    logWithTimestamp('✅ Policy updated');

    // Wait for update indexing
    logWithTimestamp('⏳ Waiting for policy update indexing...');
    await sleep(15000);

    // Check update indexing status
    const policyUpdateIndexStatus = await checkVectorIndexStatus('policies', policyId);
    logWithTimestamp('📊 Policy Update Indexing Status:', policyUpdateIndexStatus);
    testResults.policy.update = { success: policyUpdateIndexStatus?.vectorIndexed === true, status: policyUpdateIndexStatus };

    // 3. Test RAG query after update
    logWithTimestamp('🔍 Testing Policy RAG Query after update...');
    const policyRagFunction = httpsCallable(functions, 'queryPoliciesRAG');
    const policyRagResult = await policyRagFunction({
      query: 'Find comprehensive policies for Honda Civic vehicles',
      userId: testUserId
    });
    logWithTimestamp('✅ Policy RAG Result after update:', {
      success: policyRagResult.data.success,
      answer: policyRagResult.data.answer?.substring(0, 200) + '...',
      sourcesCount: policyRagResult.data.sources?.length || 0
    });

    // 4. Delete policy and test cleanup
    logWithTimestamp('🗑️ Deleting policy...');
    await deleteDoc(doc(db, 'policies', policyId));
    logWithTimestamp('✅ Policy deleted');

    // Wait for delete cleanup
    logWithTimestamp('⏳ Waiting for policy deletion cleanup...');
    await sleep(10000);

    // Test RAG query after deletion
    logWithTimestamp('🔍 Testing Policy RAG Query after deletion...');
    const policyRagResultAfterDelete = await policyRagFunction({
      query: 'Find comprehensive policies for Honda Civic vehicles',
      userId: testUserId
    });
    logWithTimestamp('✅ Policy RAG Result after deletion:', {
      success: policyRagResultAfterDelete.data.success,
      answer: policyRagResultAfterDelete.data.answer?.substring(0, 200) + '...',
      sourcesCount: policyRagResultAfterDelete.data.sources?.length || 0
    });
    testResults.policy.delete = { success: true, ragResult: policyRagResultAfterDelete.data };

    // ============================================================================
    // SUMMARY
    // ============================================================================
    logWithTimestamp('📊 Streaming Indexing Test Summary:');
    
    console.log('\n🎯 Customer Tests:');
    console.log(`  Create: ${testResults.customer.create?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Update: ${testResults.customer.update?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Delete: ${testResults.customer.delete?.success ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n🎯 Claim Tests:');
    console.log(`  Create: ${testResults.claim.create?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Update: ${testResults.claim.update?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Delete: ${testResults.claim.delete?.success ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n🎯 Policy Tests:');
    console.log(`  Create: ${testResults.policy.create?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Update: ${testResults.policy.update?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Delete: ${testResults.policy.delete?.success ? '✅ PASS' : '❌ FAIL'}`);

    const totalTests = 9; // 3 operations × 3 collections
    const passedTests = [
      testResults.customer.create?.success,
      testResults.customer.update?.success,
      testResults.customer.delete?.success,
      testResults.claim.create?.success,
      testResults.claim.update?.success,
      testResults.claim.delete?.success,
      testResults.policy.create?.success,
      testResults.policy.update?.success,
      testResults.policy.delete?.success
    ].filter(Boolean).length;

    console.log(`\n📈 Overall Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      logWithTimestamp('🎉 All streaming indexing tests passed!');
    } else {
      logWithTimestamp('⚠️ Some streaming indexing tests failed. Check the logs above for details.');
    }

    logWithTimestamp('🏁 Streaming indexing test suite completed!');

  } catch (error) {
    logWithTimestamp('❌ Streaming indexing test suite failed:', error.message);
    console.error('Full error:', error);
  }

  return testResults;
};

// Run the tests
if (require.main === module) {
  testStreamingIndexing()
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
  testStreamingIndexing
};
