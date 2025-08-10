# Vertex AI Vector Search Setup via Google Cloud Console

Since the gcloud CLI metadata format can be complex, let's set up the Vector Search index through the Google Cloud Console, which provides a user-friendly interface.

## Setup Steps

### 1. Open Google Cloud Console
Visit: https://console.cloud.google.com/vertex-ai/vector-search

### 2. Create New Index
1. Click **"CREATE INDEX"**
2. Fill in the following details:

#### Basic Information
- **Index name**: `customer-embeddings-index`
- **Description**: `Vector search index for customer embeddings in VintuSure`
- **Region**: `us-central1`

#### Configuration
- **Dimensions**: `768` (for textembedding-gecko)
- **Distance measure**: `Cosine distance`
- **Algorithm**: `Tree-AH` (recommended for most use cases)
- **Update method**: `Stream updates` (for real-time updates)

#### Advanced Settings (Optional)
- **Leaf node embedding count**: `1000`
- **Leaf nodes to search percent**: `10`
- **Approximate neighbors count**: `150`

### 3. Create Index Endpoint
After the index is created (this may take 20-60 minutes):

1. Go to **Vector Search > Index Endpoints**
2. Click **"CREATE ENDPOINT"**
3. Fill in:
   - **Endpoint name**: `customer-embeddings-endpoint`
   - **Description**: `Endpoint for customer embeddings vector search`
   - **Region**: `us-central1`

### 4. Deploy Index to Endpoint
1. Once both index and endpoint are created:
2. Go to the **Index Endpoints** section
3. Click on your endpoint
4. Click **"DEPLOY INDEX"**
5. Select your customer-embeddings-index
6. Set **Deployed Index ID**: `customer-embeddings-deployed`
7. Configure resources:
   - **Machine type**: `e2-standard-2` (for development/testing)
   - **Replica count**: `1`
   - **Min replicas**: `1`
   - **Max replicas**: `2` (for auto-scaling)

### 5. Note Important IDs
After setup, note down these values (you'll need them for the Cloud Function):

```
PROJECT_ID: vintusure
REGION: us-central1
INDEX_ID: [from console - looks like: 1234567890123456789]
ENDPOINT_ID: [from console - looks like: 1234567890123456789]
DEPLOYED_INDEX_ID: customer-embeddings-deployed
```

## Alternative: Try CLI with Different Approach

If you prefer CLI, here's an alternative approach:

### Create Index Using REST API via gcloud

```bash
# Create a minimal metadata file
cat > simple-metadata.json << EOF
{
  "contentsDeltaUri": "gs://your-bucket/",
  "config": {
    "dimensions": 768,
    "approximateNeighborsCount": 150,
    "distanceMeasureType": "COSINE_DISTANCE"
  }
}
EOF

# Try creating with REST API
gcloud ai indexes create \\
  --display-name="Customer Embeddings Index" \\
  --metadata-file=simple-metadata.json \\
  --region=us-central1
```

## Environment Variables for Cloud Function

Once the index and endpoint are created, update your Cloud Function with these environment variables:

```bash
# Set environment variables for your Cloud Function
firebase functions:config:set \\
  vertexai.project_id="vintusure" \\
  vertexai.region="us-central1" \\
  vertexai.index_id="YOUR_INDEX_ID" \\
  vertexai.endpoint_id="YOUR_ENDPOINT_ID" \\
  vertexai.deployed_index_id="customer-embeddings-deployed"

# Deploy the updated config
firebase deploy --only functions
```

## Testing the Setup

1. **Verify Index Status**: Check that the index shows as "Ready" in the console
2. **Verify Endpoint Status**: Check that the endpoint shows as "Ready" 
3. **Verify Deployment**: Check that the index is successfully deployed to the endpoint

## Cost Considerations

- **Index creation**: One-time cost
- **Endpoint hosting**: Continuous cost based on machine type and replicas
- **Query costs**: Per-query pricing
- **Storage**: Based on number of vectors stored

For development, start with minimal resources and scale up as needed.

## Next Steps

After the Vector Search setup is complete:

1. Update the Cloud Function to use real Vertex AI embeddings
2. Implement the vector upsert logic with the actual endpoint
3. Test the complete pipeline by creating a customer
4. Verify vectors are stored and queryable

## Troubleshooting

### Common Issues
- **Long creation time**: Index creation can take 20-60 minutes
- **Region restrictions**: Ensure all resources are in the same region
- **Quota limits**: Check your project quotas for Vertex AI
- **Permissions**: Ensure your account has Vertex AI Admin role

### Useful Console Links
- Vector Search: https://console.cloud.google.com/vertex-ai/vector-search
- IAM & Admin: https://console.cloud.google.com/iam-admin
- Quotas: https://console.cloud.google.com/iam-admin/quotas
