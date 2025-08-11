import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { RAGService, QueryResponse } from '../../lib/services/ragService';
import { useToast } from '../../hooks/use-toast';
import { Brain, Car, Sparkles, MessageCircle, Send, Users, FileText, ClipboardList } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

import AIContentGenerator from '../../components/ai/AIContentGenerator';
import CarPhotoAnalyzer from '../../components/car/CarPhotoAnalyzer';

type QueryType = 'general' | 'customers' | 'policies' | 'claims' | 'documents';

interface QueryPattern {
  type: QueryType;
  patterns: RegExp[];
  examples: string[];
}

const queryPatterns: QueryPattern[] = [
  {
    type: 'policies',
    patterns: [
      /policy.*(?:active|status|expired)/i,
      /(?:active|expired).*policy/i,
      /policy.*number/i,
      /coverage.*(?:details|information)/i,
      /(?:renew|cancel).*policy/i
    ],
    examples: [
      "Is John Doe's policy active?",
      "What's the status of policy POL-123?",
      "Show coverage details for vehicle ABC123"
    ]
  },
  {
    type: 'customers',
    patterns: [
      /customer.*(?:details|information|profile)/i,
      /(?:find|show|get).*customer/i,
      /customer.*history/i,
      /contact.*(?:details|information)/i
    ],
    examples: [
      "Show customer details for John Doe",
      "Find customers in Lusaka",
      "Get customer contact information"
    ]
  },
  {
    type: 'claims',
    patterns: [
      /claim.*(?:status|progress|update)/i,
      /(?:file|submit|process).*claim/i,
      /claim.*number/i,
      /accident.*(?:report|details)/i
    ],
    examples: [
      "What's the status of claim CLM-123?",
      "Show recent claims for John Doe",
      "Find claims filed last month"
    ]
  },
  {
    type: 'documents',
    patterns: [
      /document.*(?:upload|status|type)/i,
      /(?:find|show|get).*document/i,
      /(?:policy|claim).*document/i,
      /(?:upload|download).*(?:file|document)/i
    ],
    examples: [
      "Show policy documents for POL-123",
      "Find documents uploaded last week",
      "Get claim supporting documents"
    ]
  }
];

const VintuSureAI: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'rag' | 'content-generator' | 'car-analyzer'>('rag');
  const [queryType, setQueryType] = useState<'general' | 'customers' | 'policies' | 'claims' | 'documents'>('general');
  const { toast } = useToast();
  const { user } = useAuthContext();

  // Function to determine query type based on content
  const detectQueryType = (query: string): 'general' | 'customers' | 'policies' | 'claims' | 'documents' => {
    const lowerQuery = query.toLowerCase();

    for (const pattern of queryPatterns) {
      if (pattern.patterns.some(p => p.test(lowerQuery))) {
        return pattern.type;
      }
    }

    return 'general';
  };

  const handleQuery = async () => {
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
      // Detect query type if not explicitly set
      const effectiveQueryType = queryType === 'general' ? detectQueryType(query) : queryType;
      let result: QueryResponse;

      // Use appropriate RAG function based on query type
      switch (effectiveQueryType) {
        case 'policies':
          result = await RAGService.queryPoliciesData(query, user?.uid);
          break;
        case 'customers':
          result = await RAGService.queryCustomerData(query, user?.uid);
          break;
        case 'claims':
          result = await RAGService.queryClaimsData(query, user?.uid);
          break;
        case 'documents':
          result = await RAGService.queryDocumentsData(query, user?.uid);
          break;
        default:
          result = await RAGService.askQuestion(query, user?.uid);
      }

      setResponse(result);

      if (result.success) {
        toast({
          title: 'Success',
          description: `Found ${result.similarItemsCount || 0} relevant ${effectiveQueryType} matches`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to get response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with AI service',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render example queries based on current type
  const renderExamples = () => {
    const currentPattern = queryPatterns.find(p => p.type === queryType) || queryPatterns[0];
    return (
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">Example queries:</p>
        <div className="flex flex-wrap gap-2">
          {currentPattern.examples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setQuery(example)}
              className="text-xs"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const queryTypeButtons = [
    { type: 'general', icon: Brain, label: 'General' },
    { type: 'customers', icon: Users, label: 'Customers' },
    { type: 'claims', icon: ClipboardList, label: 'Claims' },
    { type: 'policies', icon: FileText, label: 'Policies' },
    { type: 'documents', icon: FileText, label: 'Documents' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            VintuSure AI Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about insurance, policies, claims, or get help with specific tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Query Type Selection */}
            <div className="flex flex-wrap gap-2">
              {queryTypeButtons.map(({ type, icon: Icon, label }) => (
                <TooltipProvider key={type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={queryType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQueryType(type as QueryType)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch to {label.toLowerCase()} queries</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Query Input */}
            <div className="space-y-2">
              <Textarea
                placeholder={`Ask a ${queryType} question...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleQuery}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Query
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Response Display */}
            {response && (
              <div className="mt-4 space-y-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Response:</span>
                  </div>
                  <p className="whitespace-pre-wrap">{response.answer}</p>
                  {response.sources && response.sources.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {response.sources.map((source, index) => (
                          <Badge key={index} variant="secondary">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VintuSureAI;
