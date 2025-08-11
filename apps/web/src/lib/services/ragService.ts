import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export interface QueryRequest {
  query: string;
  userId?: string;
  filters?: {
    customerId?: string;
    policyId?: string;
    claimId?: string;
    documentId?: string;
    status?: string;
    type?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface QueryResponse {
  answer?: string;
  success: boolean;
  error?: string;
  details?: string;
  sources?: any[];
  similarItemsCount?: number;
  metadata?: {
    queryType: string;
    matchedEntities?: {
      customers?: { id: string; name: string }[];
      policies?: { id: string; number: string }[];
      claims?: { id: string; number: string }[];
      documents?: { id: string; name: string }[];
    };
  };
}

export class RAGService {
  /**
   * Send a general query to the RAG system for non-data-specific questions
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
   * Query customer-specific data using the Customer RAG system
   */
  static async queryCustomerData(query: string, userId?: string, filters?: QueryRequest['filters']): Promise<QueryResponse> {
    try {
      const queryCustomerFunction = httpsCallable<QueryRequest, QueryResponse>(
        functions,
        'queryCustomerRAG'
      );

      // Extract customer name or ID from query if present
      const customerNameMatch = query.match(/(?:about|for|of)\s+([A-Za-z\s]+?)(?:'s|\s|$)/i);
      const customerId = filters?.customerId || (customerNameMatch ? undefined : undefined);

      const result = await queryCustomerFunction({
        query,
        userId: userId || 'anonymous',
        filters: {
          ...filters,
          customerId
        }
      });

      return {
        ...result.data,
        metadata: {
          queryType: 'customer',
          ...result.data.metadata
        }
      };
    } catch (error) {
      console.error('Error querying customer data:', error);
      return {
        success: false,
        error: 'Failed to query customer data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query claims-specific data using the Claims RAG system
   */
  static async queryClaimsData(query: string, userId?: string, filters?: QueryRequest['filters']): Promise<QueryResponse> {
    try {
      const queryClaimsFunction = httpsCallable<QueryRequest, QueryResponse>(
        functions,
        'queryClaimsRAG'
      );

      // Extract claim number or status from query if present
      const claimNumberMatch = query.match(/claim\s+(?:number\s+)?([A-Z0-9-]+)/i);
      const statusMatch = query.match(/(?:status|state) (?:is|of|=)\s*(\w+)/i);

      const result = await queryClaimsFunction({
        query,
        userId: userId || 'anonymous',
        filters: {
          ...filters,
          claimId: filters?.claimId || (claimNumberMatch ? claimNumberMatch[1] : undefined),
          status: filters?.status || (statusMatch ? statusMatch[1] : undefined)
        }
      });

      return {
        ...result.data,
        metadata: {
          queryType: 'claim',
          ...result.data.metadata
        }
      };
    } catch (error) {
      console.error('Error querying claims data:', error);
      return {
        success: false,
        error: 'Failed to query claims data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query policy-specific data using the Policies RAG system
   */
  static async queryPoliciesData(query: string, userId?: string, filters?: QueryRequest['filters']): Promise<QueryResponse> {
    try {
      const queryPoliciesFunction = httpsCallable<QueryRequest, QueryResponse>(
        functions,
        'queryPoliciesRAG'
      );

      // Extract policy number, status, or customer name from query
      const policyNumberMatch = query.match(/policy\s+(?:number\s+)?([A-Z0-9-]+)/i);
      const statusMatch = query.match(/(?:status|state|active) (?:is|of|=)\s*(\w+)/i);
      const customerNameMatch = query.match(/(?:about|for|of)\s+([A-Za-z\s]+?)(?:'s|\s|$)/i);

      const result = await queryPoliciesFunction({
        query,
        userId: userId || 'anonymous',
        filters: {
          ...filters,
          policyId: filters?.policyId || (policyNumberMatch ? policyNumberMatch[1] : undefined),
          status: filters?.status || (statusMatch ? statusMatch[1] : undefined),
          customerId: filters?.customerId || (customerNameMatch ? undefined : undefined)
        }
      });

      return {
        ...result.data,
        metadata: {
          queryType: 'policy',
          ...result.data.metadata
        }
      };
    } catch (error) {
      console.error('Error querying policies data:', error);
      return {
        success: false,
        error: 'Failed to query policies data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query document-specific data using the Documents RAG system
   */
  static async queryDocumentsData(query: string, userId?: string, filters?: QueryRequest['filters']): Promise<QueryResponse> {
    try {
      const queryDocumentsFunction = httpsCallable<QueryRequest, QueryResponse>(
        functions,
        'queryDocumentsRAG'
      );

      // Extract document type or date range from query
      const typeMatch = query.match(/type\s+(?:is|of|=)\s*(\w+)/i);
      const dateRangeMatch = query.match(/(?:from|between)\s+(\d{4}-\d{2}-\d{2})\s+(?:to|and)\s+(\d{4}-\d{2}-\d{2})/i);

      const result = await queryDocumentsFunction({
        query,
        userId: userId || 'anonymous',
        filters: {
          ...filters,
          type: filters?.type || (typeMatch ? typeMatch[1] : undefined),
          dateRange: filters?.dateRange || (dateRangeMatch ? {
            start: dateRangeMatch[1],
            end: dateRangeMatch[2]
          } : undefined)
        }
      });

      return {
        ...result.data,
        metadata: {
          queryType: 'document',
          ...result.data.metadata
        }
      };
    } catch (error) {
      console.error('Error querying documents data:', error);
      return {
        success: false,
        error: 'Failed to query documents data',
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