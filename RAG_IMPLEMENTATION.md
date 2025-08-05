# RAG (Retrieval-Augmented Generation) Implementation

## Overview

This document describes the implementation of a RAG system for VintuSure using Firebase Functions and Google's Vertex AI. The system allows users to ask questions and get AI-generated responses based on a knowledge base.

## Architecture

### Backend (Firebase Functions)

**File**: `functions/src/index.ts`

The backend consists of two main functions:

1. **`askQuestion`** - Main RAG function that processes user queries
2. **`healthCheck`** - Health check endpoint for monitoring

### Frontend (React Web App)

**Files**:
- `apps/web/src/lib/services/ragService.ts` - Service layer for RAG communication
- `apps/web/src/routes/dashboard/RAGTest.tsx` - UI component for testing RAG
- `apps/web/src/components/dashboard/Sidebar.tsx` - Navigation with RAG test link

## Features

### Current Implementation

1. **Vertex AI Integration**: Uses Google's Vertex AI with Gemini 1.5 Flash model
2. **Query Processing**: Accepts user queries and generates AI responses
3. **Response Logging**: Logs all queries and responses to Firestore
4. **Error Handling**: Comprehensive error handling and user feedback
5. **Health Monitoring**: Health check endpoint for service monitoring
6. **Modern UI**: Clean, responsive interface for testing RAG functionality

### Planned RAG Features (Future Implementation)

1. **RAG Corpus Integration**: Connect to Vertex AI RAG corpus for enhanced responses
2. **Document Retrieval**: Retrieve relevant documents from knowledge base
3. **Context-Aware Responses**: Generate responses based on retrieved context
4. **Multi-Modal Support**: Support for text, images, and documents

## Setup Instructions

### Prerequisites

1. Firebase project with Functions enabled
2. Google Cloud project with Vertex AI API enabled
3. Proper authentication and permissions set up

### Backend Setup

1. **Install Dependencies**:
   ```bash
   cd functions
   pnpm install
   ```

2. **Configure Vertex AI**:
   - Ensure your Firebase project has access to Vertex AI
   - Set up proper authentication (service account or default credentials)

3. **Build Functions**:
   ```bash
   pnpm run build
   ```

4. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd apps/web
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access RAG Test Page**:
   Navigate to `/rag-test` in your browser

## Usage

### Testing RAG Functionality

1. **Access the RAG Test Page**:
   - Log into the VintuSure dashboard
   - Click on "RAG Test" in the sidebar navigation

2. **Ask Questions**:
   - Enter your question in the text area
   - Click "Ask Question" to get an AI response
   - View the response in the right panel

3. **Example Queries**:
   - "What is the process for filing an insurance claim?"
   - "How do I calculate premium rates for auto insurance?"
   - "What documents are required for policy renewal?"

### API Usage

#### Ask Question

```typescript
import { RAGService } from '@/lib/services/ragService';

const response = await RAGService.askQuestion(
  "What is insurance?",
  "user-id"
);

if (response.success) {
  console.log(response.answer);
} else {
  console.error(response.error);
}
```

#### Health Check

```typescript
const health = await RAGService.healthCheck();
console.log(health.status); // 'healthy' or 'unhealthy'
```

## Configuration

### Vertex AI Settings

**Model**: `gemini-1.5-flash`
**Location**: `us-central1`
**Project**: `vintusure`

### Generation Configuration

- **Max Output Tokens**: 65,535
- **Temperature**: 1.0
- **Top P**: 0.95
- **Safety Settings**: All categories set to BLOCK_NONE

### RAG Corpus Configuration (Future)

```typescript
const ragCorpus = 'projects/vintusure/locations/us-central1/ragCorpora/2305843009213693952';
```

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Handles connection issues gracefully
2. **API Errors**: Provides detailed error messages
3. **Validation**: Validates input before processing
4. **User Feedback**: Toast notifications for success/error states

## Monitoring and Logging

### Firestore Collections

- **`queryLogs`**: Stores all queries and responses
  - `userId`: User identifier
  - `query`: Original user query
  - `answer`: AI-generated response
  - `timestamp`: Query timestamp
  - `model`: AI model used
  - `ragEnabled`: RAG status flag

### Health Monitoring

- Health check endpoint for service monitoring
- Real-time status indicators in the UI
- Error logging for debugging

## Future Enhancements

### Phase 1: Basic RAG
- [x] Vertex AI integration
- [x] Query processing
- [x] Response generation
- [x] UI for testing

### Phase 2: Enhanced RAG
- [ ] RAG corpus integration
- [ ] Document retrieval
- [ ] Context-aware responses
- [ ] Knowledge base management

### Phase 3: Advanced Features
- [ ] Multi-modal support
- [ ] Conversation history
- [ ] Response quality metrics
- [ ] Custom training data

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (requires Node 20)
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

2. **Deployment Issues**:
   - Ensure proper Firebase permissions
   - Check Google Cloud service account permissions
   - Verify API enablement

3. **Runtime Errors**:
   - Check Firebase Functions logs
   - Verify Vertex AI API access
   - Check authentication configuration

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=true
export NODE_ENV=development
```

## Security Considerations

1. **Authentication**: All endpoints require Firebase authentication
2. **Input Validation**: All user inputs are validated
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Data Privacy**: Ensure compliance with data protection regulations

## Performance Optimization

1. **Caching**: Consider implementing response caching
2. **Connection Pooling**: Optimize database connections
3. **Response Streaming**: Implement streaming for long responses
4. **CDN**: Use CDN for static assets

## Support

For issues and questions:
1. Check the Firebase Functions logs
2. Review the Vertex AI documentation
3. Contact the development team
4. Check the troubleshooting section above 