import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export interface QueryRequest {
  query: string;
  userId?: string;
}

export interface QueryResponse {
  answer?: string;
  success: boolean;
  error?: string;
  details?: string;
}

export class RAGService {
  /**
   * Send a query to the RAG system and get an AI-generated response
   */
  static async askQuestion(query: string, userId?: string): Promise<QueryResponse> {
    try {
      const askQuestionFunction = httpsCallable<QueryRequest, QueryResponse>(
        functions,
        'askQuestion'
      );

      const result = await askQuestionFunction({
        query,
        userId: userId || 'anonymous'
      });

      return result.data;
    } catch (error) {
      console.error('Error calling RAG service:', error);
      return {
        success: false,
        error: 'Failed to get response from RAG system',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if the RAG service is healthy
   */
  static async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const healthCheckFunction = httpsCallable(functions, 'healthCheck');
      const result = await healthCheckFunction();
      return result.data as { status: string; service: string; timestamp: string };
    } catch (error) {
      console.error('Error checking RAG service health:', error);
      throw error;
    }
  }
} 