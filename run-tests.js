#!/usr/bin/env node

const { 
  runIndexingRAGTests,
  testCustomerIndexing,
  testClaimsIndexing,
  testPoliciesIndexing,
  testDocumentsIndexing,
  testRAGQueries,
  testGeneralAIQuestion
} = require('./test-indexing-rag-system.js');

const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const showHelp = () => {
  console.log(`
VintuSure Indexing and RAG Test Runner

Usage: node run-tests.js [option]

Options:
  --all, -a          Run complete test suite (default)
  --customer, -c     Test customer indexing and RAG only
  --claims, -cl      Test claims indexing and RAG only
  --policies, -p     Test policies indexing and RAG only
  --documents, -d    Test documents indexing and RAG only
  --rag, -r          Test RAG queries only
  --ai, -ai          Test general AI questions only
  --help, -h         Show this help message

Examples:
  node run-tests.js --all
  node run-tests.js --customer
  node run-tests.js --rag
  node run-tests.js -c -p
`);
};

const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  logWithTimestamp('🚀 Starting VintuSure Indexing and RAG Tests...');

  try {
    if (args.includes('--all') || args.includes('-a')) {
      logWithTimestamp('📋 Running complete test suite...');
      const results = await runIndexingRAGTests();
      logWithTimestamp('✅ Complete test suite finished');
      return results;
    }

    const results = {};

    if (args.includes('--customer') || args.includes('-c')) {
      logWithTimestamp('🧪 Testing Customer Indexing...');
      results.customer = await testCustomerIndexing();
    }

    if (args.includes('--claims') || args.includes('-cl')) {
      logWithTimestamp('🧪 Testing Claims Indexing...');
      results.claims = await testClaimsIndexing();
    }

    if (args.includes('--policies') || args.includes('-p')) {
      logWithTimestamp('🧪 Testing Policies Indexing...');
      results.policies = await testPoliciesIndexing();
    }

    if (args.includes('--documents') || args.includes('-d')) {
      logWithTimestamp('🧪 Testing Documents Indexing...');
      results.documents = await testDocumentsIndexing();
    }

    if (args.includes('--rag') || args.includes('-r')) {
      logWithTimestamp('🧪 Testing RAG Queries...');
      results.ragQueries = await testRAGQueries();
    }

    if (args.includes('--ai') || args.includes('-ai')) {
      logWithTimestamp('🧪 Testing General AI...');
      results.generalAI = await testGeneralAIQuestion();
    }

    // Summary
    logWithTimestamp('📊 Test Summary:');
    if (results.customer) {
      console.log('Customer Indexing:', results.customer.success ? '✅ PASS' : '❌ FAIL');
    }
    if (results.claims) {
      console.log('Claims Indexing:', results.claims.success ? '✅ PASS' : '❌ FAIL');
    }
    if (results.policies) {
      console.log('Policies Indexing:', results.policies.success ? '✅ PASS' : '❌ FAIL');
    }
    if (results.documents) {
      console.log('Documents Indexing:', results.documents.success ? '✅ PASS' : '❌ FAIL');
    }
    if (results.ragQueries) {
      console.log('RAG Queries:', results.ragQueries.filter(r => r.success).length + '/' + results.ragQueries.length);
    }
    if (results.generalAI) {
      console.log('General AI:', results.generalAI.success ? '✅ PASS' : '❌ FAIL');
    }

    logWithTimestamp('✅ Tests completed!');
    return results;

  } catch (error) {
    logWithTimestamp('❌ Test runner failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the test runner
if (require.main === module) {
  main()
    .then(() => {
      logWithTimestamp('🏁 Test runner completed');
      process.exit(0);
    })
    .catch((error) => {
      logWithTimestamp('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { main };
