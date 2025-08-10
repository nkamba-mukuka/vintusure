# **To-Do List: Customer Onboarding for Vertex AI RAG**

This is a prioritized checklist to guide you through the implementation of the customer data ingestion pipeline described in the technical document.

## **Phase 1: Foundational Setup**

* \[ \] **Create/Configure Google Cloud Project**: Ensure billing is enabled and all necessary APIs are activated (Firebase, Vertex AI, Cloud Functions).  
* \[ \] **Setup Firebase Firestore**: (already implemented)  
  * \[ \] Create a customers collection.  
  * \[ \] Define a basic schema for customer documents.  
  * \[ \] Write and deploy security rules to allow only authenticated users to create documents in the customers collection.  
* \[ \] **Setup Vertex AI Vector Search**:(already implemented)  
  * \[ \] Create a Vector Search index.  
  * \[ \] Configure the index to use a STREAMING update method.  
  * \[ \] Deploy the index to an endpoint.  
* \[ \] **Configure IAM Roles**:(already implemented)  
  * \[ \] Create a service account for your Cloud Function.  
  * \[ \] Grant the service account the Vertex AI User and Vertex AI Embeddings API User roles.

## **Phase 2: Cloud Function Development**

* \[ \] **Create a New Firebase Cloud Function**: Set up a new function, for example, named indexCustomerData.  
* \[ \] **Set the Trigger**: Configure the function to trigger on an onCreate event for the /customers/{customerId} path.  
* \[ \] **Implement the Logic**:  
  * \[ \] Write code to extract relevant data fields from the Firestore snapshot.  
  * \[ \] Concatenate the data into a single text string for embedding.  
  * \[ \] Add the necessary code to call the Vertex AI Embeddings API(textembedding-001) with the prepared text.  
  * \[ \] Implement the logic to take the returned vector and upsert it into your deployed Vertex AI Vector Search index, using the customerId as the data point ID.  
* \[ \] **Error Handling & Logging**:  
  * \[ \] Add try...catch blocks to handle potential API errors.  
  * \[ \] Use functions.logger.log to record the status of each step for debugging.  
* \[ \] **Deploy the Function**: Deploy the Cloud Function to your Firebase project.

## **Phase 3: Testing & Integration**

* \[ \] **Manual Test**: Manually create a new customer document in your Firestore customers collection.  
* \[ \] **Verify Function Execution**: Check the Cloud Functions logs to confirm the function ran without errors and the data was processed.  
* \[ \] **Verify Vector Indexing**: Use the Vertex AI Console to confirm the new customer data point was added to your Vector Search index.  
* \[ \] **Final Integration**: Connect your RAG engine to the Vector Search index to test that it can successfully retrieve and use the new customer information to answer a query.