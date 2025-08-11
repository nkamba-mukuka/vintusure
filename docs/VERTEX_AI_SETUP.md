# Vertex AI Vector Search Setup Guide

This guide will help you set up Vertex AI Vector Search for the customer embedding pipeline.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Required APIs enabled:
   - Vertex AI API
   - Cloud Functions API  
   - Firebase API
   - Cloud Firestore API

## Step 1: Enable Required APIs

Run the following commands in Google Cloud Shell or with `gcloud` CLI:

```bash
# Set your project ID
export PROJECT_ID="vintusure"

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled --filter="name:(aiplatform.googleapis.com OR cloudfunctions.googleapis.com OR firebase.googleapis.com OR firestore.googleapis.com)"
```

## Step 2: Create Vertex AI Vector Search Index

### Create the Index

```bash
# Set variables
export PROJECT_ID="vintusure"
export REGION="us-central1"
export INDEX_NAME="customer-embeddings-index"
export DISPLAY_NAME="Customer Embeddings Index"

# Create the index
gcloud ai indexes create \
  --region=$REGION \
  --display-name="$DISPLAY_NAME" \
  --description="Vector search index for customer embeddings" \
  --config='{
    "algorithm_config": {
      "tree_ah_config": {
        "leaf_node_embedding_count": 1000,
        "leaf_nodes_to_search_percent": 10
      }
    },
    "dimensions": 768,
    "approximate_neighbors_count": 150,
    "distance_measure_type": "COSINE_DISTANCE",
    "feature_norm_type": "UNIT_L2_NORM"
  }' \
  --metadata-schema-uri="gs://google-cloud-aiplatform/schema/metadataschema/text_embeddings.yaml"
```

### Deploy the Index to an Endpoint

```bash
# Create an endpoint
gcloud ai index-endpoints create \
  --region=$REGION \
  --display-name="customer-embeddings-endpoint"

# Get the endpoint ID (you'll need this)
export ENDPOINT_ID=$(gcloud ai index-endpoints list --region=$REGION --filter="displayName:customer-embeddings-endpoint" --format="value(name)" | cut -d'/' -f6)

# Get the index ID (you'll need this)
export INDEX_ID=$(gcloud ai indexes list --region=$REGION --filter="displayName:Customer Embeddings Index" --format="value(name)" | cut -d'/' -f6)

# Deploy the index to the endpoint
gcloud ai index-endpoints deploy-index $ENDPOINT_ID \
  --region=$REGION \
  --index=$INDEX_ID \
  --deployed-index-id="customer-embeddings-deployed" \
  --display-name="Customer Embeddings Deployed Index"
```

## Step 3: Configure Service Account Permissions

```bash
# Create a service account for Cloud Functions
gcloud iam service-accounts create vertex-ai-functions \
  --display-name="Vertex AI Functions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-ai-functions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-ai-functions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/ml.developer"
```

## Step 4: Update Environment Variables

Add these environment variables to your Cloud Function configuration:

```bash
# In your Cloud Function environment
VERTEX_AI_PROJECT_ID=vintusure
VERTEX_AI_REGION=us-central1
VERTEX_AI_INDEX_ENDPOINT=projects/vintusure/locations/us-central1/indexEndpoints/[ENDPOINT_ID]
VERTEX_AI_DEPLOYED_INDEX_ID=customer-embeddings-deployed
```

## Step 5: Test the Setup

1. Deploy your updated Cloud Function
2. Create a test customer in Firestore
3. Check Cloud Function logs to verify execution
4. Verify the vector was added to your index in the Vertex AI Console

## Important Notes

- The mock embedding implementation should be replaced with actual Vertex AI Embeddings API calls
- Vector dimensions must match between embedding model and index (768 for text-embedding-gecko)
- Consider implementing batch processing for better performance
- Monitor costs as Vector Search can be expensive with large datasets

## Troubleshooting

### Common Issues

1. **"Index not found" errors**: Verify the index was created and deployed successfully
2. **Permission denied**: Ensure the service account has proper IAM roles
3. **Dimension mismatch**: Check that embedding dimensions match index configuration
4. **API not enabled**: Verify all required APIs are enabled in your project

### Useful Commands

```bash
# List all indexes
gcloud ai indexes list --region=$REGION

# List all endpoints  
gcloud ai index-endpoints list --region=$REGION

# Check index deployment status
gcloud ai index-endpoints describe $ENDPOINT_ID --region=$REGION
```
