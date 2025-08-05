import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { RAGService, QueryResponse } from '../../lib/services/ragService';
import { useToast } from '../../hooks/use-toast';

const RAGTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('unknown');
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a query',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await RAGService.askQuestion(query);
      setResponse(result);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Response generated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to get response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with RAG service',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const health = await RAGService.healthCheck();
      setHealthStatus(health.status);
      toast({
        title: 'Health Check',
        description: `Service is ${health.status}`,
      });
    } catch (error) {
      setHealthStatus('unhealthy');
      toast({
        title: 'Health Check Failed',
        description: 'Service is not responding',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RAG System Test</h1>
          <p className="text-muted-foreground">
            Test the Retrieval-Augmented Generation system with your queries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={healthStatus === 'healthy' ? 'default' : 'destructive'}>
            {healthStatus}
          </Badge>
          <Button variant="outline" onClick={handleHealthCheck}>
            Health Check
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Enter your question and get an AI-generated response using RAG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Your Question</Label>
              <Textarea
                id="query"
                placeholder="Ask about insurance policies, claims, or any related topic..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              onClick={handleAskQuestion} 
              disabled={isLoading || !query.trim()}
              className="w-full"
            >
              {isLoading ? 'Generating Response...' : 'Ask Question'}
            </Button>
          </CardContent>
        </Card>

        {/* Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
            <CardDescription>
              Generated response from the RAG system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={response.success ? 'default' : 'destructive'}>
                    {response.success ? 'Success' : 'Error'}
                  </Badge>
                  {response.success && (
                    <Badge variant="secondary">
                      {response.answer?.length || 0} characters
                    </Badge>
                  )}
                </div>
                
                {response.success && response.answer ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{response.answer}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-destructive">
                      {response.error || 'No response generated'}
                    </p>
                    {response.details && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Details: {response.details}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No response yet. Ask a question to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Example Queries</CardTitle>
          <CardDescription>
            Try these example questions to test the RAG system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "What is the process for filing an insurance claim?",
              "How do I calculate premium rates for auto insurance?",
              "What documents are required for policy renewal?",
              "What are the different types of insurance coverage available?",
              "How long does it take to process a claim?",
              "What factors affect insurance premium calculations?"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3"
                onClick={() => setQuery(example)}
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RAGTest; 