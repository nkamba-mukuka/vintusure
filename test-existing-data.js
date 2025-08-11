const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, limit } = require('firebase/firestore');
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

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logWithTimestamp = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Test existing data indexing status
const testExistingDataIndexing = async () => {
  logWithTimestamp('🧪 Testing Existing Data Indexing Status...');
  
  const collections = ['customers', 'claims', 'policies', 'documents'];
  const results = {};

  for (const collectionName of collections) {
    try {
      logWithTimestamp(`📊 Checking ${collectionName} collection...`);
      
      // Get a sample of documents from the collection
      const q = query(collection(db, collectionName), limit(5));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        logWithTimestamp(`ℹ️  No documents found in ${collectionName} collection`);
        results[collectionName] = { count: 0, indexed: 0, notIndexed: 0 };
        continue;
      }

      let indexedCount = 0;
      let notIndexedCount = 0;
      const sampleDocs = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const isIndexed = data.vectorIndexed === true;
        
        if (isIndexed) {
          indexedCount++;
        } else {
          notIndexedCount++;
        }

        sampleDocs.push({
          id: doc.id,
          vectorIndexed: isIndexed,
          vectorIndexedAt: data.vectorIndexedAt,
          vectorIndexingError: data.vectorIndexingError
        });
      });

      results[collectionName] = {
        count: querySnapshot.size,
        indexed: indexedCount,
        notIndexed: notIndexedCount,
        sampleDocs: sampleDocs.slice(0, 3) // Show first 3 docs
      };

      logWithTimestamp(`✅ ${collectionName}: ${indexedCount}/${querySnapshot.size} documents indexed`);

    } catch (error) {
      logWithTimestamp(`❌ Error checking ${collectionName}:`, error.message);
      results[collectionName] = { error: error.message };
    }
  }

  return results;
};

// Test RAG queries with existing data
const testRAGWithExistingData = async () => {
  logWithTimestamp('🧪 Testing RAG Queries with Existing Data...');

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

// Test general AI functionality
const testGeneralAI = async () => {
  logWithTimestamp('🧪 Testing General AI Functionality...');
  
  const testQuestions = [
    'What are the different types of car insurance coverage available in Zambia?',
    'How do I file a claim for vehicle damage?',
    'What documents do I need for a comprehensive insurance policy?',
    'What is the difference between comprehensive and third-party insurance?'
  ];

  const results = [];

  for (const question of testQuestions) {
    try {
      logWithTimestamp(`Testing question: "${question.substring(0, 50)}..."`);
      
      const askQuestionFunction = httpsCallable(functions, 'askQuestion');
      const result = await askQuestionFunction({
        query: question,
        userId: testUserId
      });

      logWithTimestamp(`✅ AI Response:`);
      console.log('  Success:', result.data.success);
      console.log('  Answer:', result.data.answer?.substring(0, 200) + '...');
      
      results.push({
        question: question,
        success: true,
        result: result.data
      });
      
    } catch (error) {
      logWithTimestamp(`❌ AI question failed:`, error.message);
      results.push({
        question: question,
        success: false,
        error: error.message
      });
    }
    
    await sleep(2000); // Wait between questions
  }

  return results;
};

// Main test function
const runExistingDataTests = async () => {
  logWithTimestamp('🚀 Starting Existing Data Indexing and RAG Tests...');
  
  const testResults = {
    indexing: null,
    ragQueries: null,
    generalAI: null
  };

  try {
    // Test existing data indexing status
    logWithTimestamp('📋 Testing Existing Data Indexing...');
    testResults.indexing = await testExistingDataIndexing();

    // Test RAG queries
    logWithTimestamp('🔍 Testing RAG Queries...');
    testResults.ragQueries = await testRAGWithExistingData();

    // Test general AI
    logWithTimestamp('🤖 Testing General AI...');
    testResults.generalAI = await testGeneralAI();

    // Summary
    logWithTimestamp('📊 Test Summary:');
    
    // Indexing summary
    console.log('📊 Indexing Status:');
    Object.entries(testResults.indexing).forEach(([collection, data]) => {
      if (data.error) {
        console.log(`  ${collection}: ❌ ERROR - ${data.error}`);
      } else {
        console.log(`  ${collection}: ${data.indexed}/${data.count} indexed`);
      }
    });

    // RAG summary
    const ragSuccessCount = testResults.ragQueries.filter(r => r.success).length;
    console.log(`🔍 RAG Queries: ${ragSuccessCount}/${testResults.ragQueries.length} successful`);

    // AI summary
    const aiSuccessCount = testResults.generalAI.filter(r => r.success).length;
    console.log(`🤖 General AI: ${aiSuccessCount}/${testResults.generalAI.length} successful`);

    logWithTimestamp('🎉 All tests completed!');

  } catch (error) {
    logWithTimestamp('❌ Test suite failed:', error.message);
    console.error('Full error:', error);
  }

  return testResults;
};

// Run the tests
if (require.main === module) {
  runExistingDataTests()
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
  runExistingDataTests,
  testExistingDataIndexing,
  testRAGWithExistingData,
  testGeneralAI
};
