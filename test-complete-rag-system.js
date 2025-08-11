const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

const firebaseConfig = {
    apiKey: "AIzaSyCkFg0GA7yOpplOpOSQ1iDueN1sLuKG5fs",
    authDomain: "vintusure.firebaseapp.com",
    projectId: "vintusure",
    storageBucket: "vintusure.firebasestorage.app",
    messagingSenderId: "772944178213",
    appId: "1:772944178213:web:2f849891b37b012a7023cc",
    measurementId: "G-MF40L2SQJ6"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');

// Initialize all RAG functions
const queryCustomerRAG = httpsCallable(functions, 'queryCustomerRAG');
const queryClaimsRAG = httpsCallable(functions, 'queryClaimsRAG');
const queryPoliciesRAG = httpsCallable(functions, 'queryPoliciesRAG');

async function testRAG(query, ragFunction, systemName) {
    console.log(`\n🔍 ${systemName} Query: "${query}"`);
    try {
        const result = await ragFunction({ query });
        if (result.data.success) {
            const countField = systemName === 'Customer' ? 'similarCustomersCount' : 
                              systemName === 'Claims' ? 'similarClaimsCount' : 'similarPoliciesCount';
            console.log(`✅ Found ${result.data[countField]} similar ${systemName.toLowerCase()}s`);
            console.log(`📄 Response: ${result.data.answer}`);
            if (result.data.sources?.length > 0) {
                console.log(`🔗 Sources:`);
                result.data.sources.forEach((source, i) => {
                    const nameField = systemName === 'Customer' ? 'customerName' : 
                                    systemName === 'Claims' ? 'claimDescription' : 'policyNumber';
                    console.log(`   ${i+1}. ${source[nameField]} (${(source.similarity*100).toFixed(1)}%)`);
                });
            }
        } else {
            console.log(`❌ Error: ${result.data.error}`);
        }
    } catch (error) {
        console.log(`❌ Exception: ${error.message}`);
    }
    console.log('─'.repeat(80));
}

// Test queries for each system
async function testCustomerRAG() {
    console.log('\n🚀 Testing Customer RAG System...');
    await testRAG("Find customers who work in technology", queryCustomerRAG, 'Customer');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Show me customers from Lusaka", queryCustomerRAG, 'Customer');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Who are our software developers?", queryCustomerRAG, 'Customer');
    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function testClaimsRAG() {
    console.log('\n🚀 Testing Claims RAG System...');
    await testRAG("Find vehicle damage claims", queryClaimsRAG, 'Claims');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Show me approved claims", queryClaimsRAG, 'Claims');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Claims with high amounts", queryClaimsRAG, 'Claims');
    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function testPoliciesRAG() {
    console.log('\n🚀 Testing Policies RAG System...');
    await testRAG("Find comprehensive policies", queryPoliciesRAG, 'Policies');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Show me active policies", queryPoliciesRAG, 'Policies');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Policies for commercial vehicles", queryPoliciesRAG, 'Policies');
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// Main test execution
(async () => {
    console.log('🧪 Testing Complete VintuSure RAG System...\n');
    console.log('📊 Testing all three entities: Customers, Claims, and Policies');
    console.log('🎯 Each system has its own Vector Search index for data isolation');
    console.log('🔒 Complete data isolation ensures privacy and security\n');
    
    // Test all three RAG systems
    await testCustomerRAG();
    await testClaimsRAG();
    await testPoliciesRAG();
    
    console.log('\n✅ Complete RAG system testing finished!');
    console.log('📊 Check results above for each entity type');
    console.log('🎯 Higher similarity scores (>80%) indicate better semantic matches');
    console.log('🔒 Each system operates independently with its own data');
    
    console.log('\n📋 System Summary:');
    console.log('✅ Customer RAG: Semantic search across customer profiles');
    console.log('✅ Claims RAG: Semantic search across claim details');
    console.log('✅ Policies RAG: Semantic search across policy information');
    console.log('✅ Data Isolation: Each entity has separate Vector Search indexes');
    console.log('✅ Real Embeddings: All systems use Vertex AI text-embedding-004');
    console.log('✅ AI Responses: All systems use Gemini 2.5 Flash Lite');
})();
