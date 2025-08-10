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
const queryCustomerRAG = httpsCallable(functions, 'queryCustomerRAG');

async function testRAG(query) {
    console.log(`\n🔍 Query: "${query}"`);
    try {
        const result = await queryCustomerRAG({ query });
        if (result.data.success) {
            console.log(`✅ Found ${result.data.similarCustomersCount} similar customers`);
            console.log(`📄 Response: ${result.data.answer}`);
            if (result.data.sources?.length > 0) {
                console.log(`🔗 Sources:`);
                result.data.sources.forEach((source, i) => {
                    console.log(`   ${i+1}. ${source.customerName} (${(source.similarity*100).toFixed(1)}%) - ${source.relevantInfo}`);
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

// Test queries
(async () => {
    console.log('🚀 Testing RAG System with Real Customer Data...\n');
    
    // Basic queries
    await testRAG("Find customers who work in technology");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Show me customers from Lusaka");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Who are our software developers?");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Find customers similar to John Tech Developer");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Show me customers in construction");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Advanced queries
    await testRAG("Compare the occupations of our customers");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Which customers might need professional insurance?");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRAG("Find customers in the same city");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ RAG testing completed!');
    console.log('📊 Check similarity scores and source attribution above.');
    console.log('🎯 Higher scores (>80%) indicate better semantic matches.');
})();
