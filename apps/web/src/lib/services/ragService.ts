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

export interface ExtendedQueryResponse extends QueryResponse {
  sources?: any[];
  similarCustomersCount?: number;
}

export interface ClaimsQueryResponse extends QueryResponse {
  sources?: any[];
  similarClaimsCount?: number;
}

export interface PoliciesQueryResponse extends QueryResponse {
  sources?: any[];
  similarPoliciesCount?: number;
}

export interface DocumentsQueryResponse extends QueryResponse {
  sources?: any[];
  similarDocumentsCount?: number;
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
   * Query customer information using RAG
   */
  static async queryCustomerRAG(query: string, userId?: string): Promise<ExtendedQueryResponse> {
    try {
      const queryCustomerRAGFunction = httpsCallable<QueryRequest, ExtendedQueryResponse>(
        functions,
        'queryCustomerRAG'
      );

      const result = await queryCustomerRAGFunction({
        query,
        userId: userId || 'anonymous'
      });

      return result.data;
    } catch (error) {
      console.error('Error calling Customer RAG service:', error);
      return {
        success: false,
        error: 'Failed to get customer information from RAG system',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query policies information using RAG
   */
  static async queryPoliciesRAG(query: string, userId?: string): Promise<PoliciesQueryResponse> {
    try {
      const queryPoliciesRAGFunction = httpsCallable<QueryRequest, PoliciesQueryResponse>(
        functions,
        'queryPoliciesRAG'
      );

      const result = await queryPoliciesRAGFunction({
        query,
        userId: userId || 'anonymous'
      });

      return result.data;
    } catch (error) {
      console.error('Error calling Policies RAG service:', error);
      return {
        success: false,
        error: 'Failed to get policies information from RAG system',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query claims information using RAG
   */
  static async queryClaimsRAG(query: string, userId?: string): Promise<ClaimsQueryResponse> {
    try {
      const queryClaimsRAGFunction = httpsCallable<QueryRequest, ClaimsQueryResponse>(
        functions,
        'queryClaimsRAG'
      );

      const result = await queryClaimsRAGFunction({
        query,
        userId: userId || 'anonymous'
      });

      return result.data;
    } catch (error) {
      console.error('Error calling Claims RAG service:', error);
      return {
        success: false,
        error: 'Failed to get claims information from RAG system',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query documents information using RAG
   */
  static async queryDocumentsRAG(query: string, userId?: string): Promise<DocumentsQueryResponse> {
    try {
      const queryDocumentsRAGFunction = httpsCallable<QueryRequest, DocumentsQueryResponse>(
        functions,
        'queryDocumentsRAG'
      );

      const result = await queryDocumentsRAGFunction({
        query,
        userId: userId || 'anonymous'
      });

      return result.data;
    } catch (error) {
      console.error('Error calling Documents RAG service:', error);
      return {
        success: false,
        error: 'Failed to get documents information from RAG system',
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