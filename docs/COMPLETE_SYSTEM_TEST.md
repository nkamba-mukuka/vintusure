# 🧪 Complete System Test Guide

## 🎯 **Testing Overview**

We'll test the complete customer embedding and RAG pipeline:

1. **Customer Creation & Indexing** → Real embeddings → Vector Search
2. **RAG Queries** → Semantic search → AI responses

## 📊 **Current System Status**

✅ **Functions Deployed:**
- `indexCustomerData` - Automatic customer indexing with real embeddings
- `queryCustomerRAG` - Complete RAG system for customer queries  
- `analyzeCarPhoto` - Car analysis (existing)
- `askQuestion` - General Q&A (existing)

✅ **Vector Search Index:**
- Index Endpoint ID: `5982154694682738688`
- Deployed Index ID: `vintusure-agent-data`
- Real-time monitoring: ACTIVE

## 🔄 **Test Procedure**

### **Phase 1: Customer Creation & Indexing Test**

#### **Step 1.1: Monitor Logs**
Keep this running in a terminal:
```bash
firebase functions:log --only indexCustomerData --tail
```

#### **Step 1.2: Create Test Customer via Web App**
1. **Open your VintuSure web application**
2. **Navigate to:** Customer Management section
3. **Create new customer** with these details:

**Test Customer 1:**
```
Name: John Tech Developer
NRC/Passport: DEV123456789
Email: john.tech@example.com
Phone: +260971111111
Address: 
  - Street: 123 Technology Street
  - City: Lusaka
  - Province: Lusaka
  - Postal Code: 10101
Date of Birth: 1990-05-15
Gender: Male
Occupation: Software Developer
Status: Active
```

#### **Step 1.3: Expected Log Output**
Watch for these logs (should appear within 10-30 seconds):

```
✅ Processing customer data for indexing: [CUSTOMER_ID]
📝 Generated customer text for embedding: Customer Name: John Tech Developer. ID Document: DEV123456789...
🔄 Generating real embedding for text: Customer Name: John Tech Developer...
🔑 Making embeddings API request...
📡 Embeddings API response received  
✅ Generated real embedding with 768 dimensions
🚀 Upserting vector to Vertex AI Vector Search
📤 Making upsert request to: https://us-central1-aiplatform.googleapis.com/v1/projects/vintusure/...
✅ Vector upsert completed successfully
```

#### **Step 1.4: Verify Customer Document**
Check that the customer document in Firestore now has:
```json
{
  // ... existing customer fields ...
  "vectorIndexed": true,
  "vectorIndexedAt": "[timestamp]",
  "embeddingText": "Customer Name: John Tech Developer..."
}
```

### **Phase 2: Create More Test Customers**

Create additional customers to build a searchable dataset:

**Test Customer 2:**
```
Name: Sarah Marketing Manager  
NRC/Passport: MKT987654321
Email: sarah.marketing@example.com
Phone: +260972222222
Address: Central Business District, Lusaka
Occupation: Marketing Manager
```

**Test Customer 3:**
```
Name: Michael Construction Worker
NRC/Passport: CON555666777
Email: michael.construction@example.com  
Phone: +260973333333
Address: Industrial Area, Kitwe
Occupation: Construction Worker
```

**Test Customer 4:**
```
Name: Lisa Software Engineer
NRC/Passport: ENG111222333
Email: lisa.engineer@example.com
Phone: +260974444444
Address: Technology Park, Lusaka
Occupation: Software Engineer
```

### **Phase 3: RAG System Testing**

After indexing 3-4 customers, test the RAG queries:

#### **Step 3.1: Create RAG Test Script**
```javascript
// test-rag-queries.js
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
                    console.log(`   ${i+1}. ${source.customerName} (${(source.similarity*100).toFixed(1)}%)`);
                });
            }
        } else {
            console.log(`❌ Error: ${result.data.error}`);
        }
    } catch (error) {
        console.log(`❌ Exception: ${error.message}`);
    }
    console.log('─'.repeat(60));
}

// Test queries
(async () => {
    await testRAG("Find customers who work in technology");
    await testRAG("Show me customers from Lusaka");  
    await testRAG("Who are our software developers?");
    await testRAG("Find customers similar to John Tech Developer");
    await testRAG("Show me customers in construction");
})();
```

#### **Step 3.2: Run RAG Tests**
```bash
node test-rag-queries.js
```

#### **Step 3.3: Expected RAG Results**
You should now see:
- **Non-zero customer matches** (e.g., "Found 2 similar customers")
- **Specific customer references** in AI responses
- **Similarity scores** above 70-90% for relevant matches
- **Source attribution** with actual customer names

### **Phase 4: Advanced Testing**

#### **Test Complex Queries:**
```javascript
// After creating more customers, test these:
await testRAG("Compare the occupations of our customers");
await testRAG("Which customers might need professional insurance?");
await testRAG("Find customers in the same city");
await testRAG("Who are our youngest customers?");
await testRAG("Show me patterns in customer addresses");
```

#### **Test Vector Search Console:**
1. Visit: https://console.cloud.google.com/vertex-ai/vector-search
2. Select your index: `vintusure-agent-data`
3. Verify new data points are being added

## 🎯 **Success Indicators**

### **✅ Customer Indexing Success:**
- [ ] Function logs show "Generated real embedding with 768 dimensions"
- [ ] Function logs show "Vector upsert completed successfully"  
- [ ] Customer documents updated with `vectorIndexed: true`
- [ ] No errors in function execution

### **✅ RAG Query Success:**
- [ ] Queries return `similarCustomersCount > 0`
- [ ] AI responses reference specific customer information
- [ ] Sources array contains actual customer data
- [ ] Similarity scores are reasonable (>70% for good matches)

### **✅ End-to-End Success:**
- [ ] Can create customers and see automatic indexing
- [ ] Can query for customers by occupation, location, demographics
- [ ] AI provides intelligent insights about customer data
- [ ] System handles errors gracefully

## 🚨 **Troubleshooting**

### **If Customer Indexing Fails:**
1. Check Firestore security rules allow customer creation
2. Verify user authentication when creating customers
3. Check function logs for specific error messages
4. Verify Vector Search index is active

### **If RAG Queries Return No Results:**
1. Ensure customers have been indexed (check `vectorIndexed: true`)
2. Wait 1-2 minutes after customer creation for indexing to complete
3. Check if Vector Search index has data points
4. Try broader queries initially

### **If Embeddings API Fails:**
- System will fall back to mock embeddings automatically
- Check Vertex AI API quotas and permissions
- Monitor costs in Google Cloud Console

## 📊 **Performance Expectations**

- **Customer Indexing**: 2-5 seconds per customer
- **RAG Query Response**: 3-6 seconds end-to-end
- **Vector Search**: 200-500ms per query
- **Embeddings Generation**: 300-800ms per text

## 🎉 **Success!**

When everything works:
1. **Customers auto-index** with real semantic vectors
2. **RAG queries** return intelligent, contextual responses  
3. **Source attribution** provides transparency
4. **System scales** to handle multiple customers and queries

Your semantic customer search and AI assistant system is production-ready! 🚀
