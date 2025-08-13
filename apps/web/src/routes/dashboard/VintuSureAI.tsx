import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { RAGService, QueryResponse, ExtendedQueryResponse, ClaimsQueryResponse, PoliciesQueryResponse, DocumentsQueryResponse } from '../../lib/services/ragService';
import { useToast } from '../../hooks/use-toast';
import { Brain, Car, ArrowUpToLine, /* Activity, */ MessageCircle, Send, Users, FileText, Shield, FolderOpen } from 'lucide-react';

import AIContentGenerator from '../../components/ai/AIContentGenerator';
import CarPhotoAnalyzer from '../../components/car/CarPhotoAnalyzer';

const VintuSureAI: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | ExtendedQueryResponse | ClaimsQueryResponse | PoliciesQueryResponse | DocumentsQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'rag' | 'content-generator' | 'car-analyzer' | 'customers' | 'policies' | 'claims' | 'documents'>('rag');
  // const [healthStatus, setHealthStatus] = useState<string>('unknown'); // Dev only
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
      let result;
      
      switch (activeView) {
        case 'customers':
          result = await RAGService.queryCustomerRAG(query);
          break;
        case 'policies':
          result = await RAGService.queryPoliciesRAG(query);
          break;
        case 'claims':
          result = await RAGService.queryClaimsRAG(query);
          break;
        case 'documents':
          result = await RAGService.queryDocumentsRAG(query);
          break;
        default:
          result = await RAGService.askQuestion(query);
          break;
      }
      
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

  // const handleHealthCheck = async () => { // Dev only
  //   try {
  //     const health = await RAGService.healthCheck();
  //     setHealthStatus(health.status);
  //     toast({
  //       title: 'Health Check',
  //       description: `Service is ${health.status}`,
  //     });
  //   } catch (error) {
  //     setHealthStatus('unhealthy');
  //     toast({
  //       title: 'Health Check Failed',
  //       description: 'Service is not responding',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  const formatResponse = (text: string) => {
    // Split by common title patterns and format them
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line looks like a title (starts with capital letters, ends with colon, or is all caps)
      const isTitlePattern = /^[A-Z][^.!?]*:$|^[A-Z\s]+$|^\d+\.\s*[A-Z]/.test(line.trim());
      const isSubheading = /^##?\s/.test(line.trim()) || /^\*\*.*\*\*$/.test(line.trim());
      
      if (isTitlePattern || isSubheading) {
        return (
          <h3 key={index} className="text-lg font-semibold text-primary mt-4 mb-2 first:mt-0">
            {line.replace(/^##?\s|\*\*/g, '').trim()}
          </h3>
        );
      }
      
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={index} className="ml-4 mb-1 text-foreground">
            {line.replace(/^[•\-*]\s*/, '')}
          </li>
        );
      }
      
      if (line.trim()) {
        return (
          <p key={index} className="mb-3 text-foreground leading-relaxed">
            {line}
          </p>
        );
      }
      
      return <br key={index} />;
    });
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'customers':
        return 'Customer Information';
      case 'policies':
        return 'Policy Information';
      case 'claims':
        return 'Claims Information';
      case 'documents':
        return 'Document Information';
      case 'content-generator':
        return 'Document Upload';
      case 'car-analyzer':
        return 'Car Analyzer';
      default:
        return 'RAG Assistant';
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'customers':
        return 'Ask questions about customer data and information';
      case 'policies':
        return 'Query policy information and details';
      case 'claims':
        return 'Get information about insurance claims';
      case 'documents':
        return 'Search and query document information';
      case 'content-generator':
        return 'Upload documents for RAG system indexing';
      case 'car-analyzer':
        return 'Analyze car photos for insurance assessment';
      default:
        return 'Ask questions and get AI-powered answers';
    }
  };

  const getExampleQueries = () => {
    switch (activeView) {
      case 'customers':
        return [
          "Find customers who work in technology",
          "Show me customers from Lusaka",
          "Who are our software developers?",
          "Find customers with business insurance",
          "Show me customers in professional services",
          "Who might be interested in family insurance?"
        ];
      case 'policies':
        return [
          "Find comprehensive policies",
          "Show me active policies",
          "Policies for commercial vehicles",
          "What are the premium rates?",
          "Show me policies expiring soon",
          "Find policies with high coverage"
        ];
      case 'claims':
        return [
          "Find vehicle damage claims",
          "Show me approved claims",
          "Claims with high amounts",
          "Recent claims filed",
          "Claims by status",
          "Claims processing time"
        ];
      case 'documents':
        return [
          "Find insurance policy documents",
          "Show me claim-related files",
          "Documents about vehicle coverage",
          "Find PDF files with contract information",
          "Show me recent invoice documents",
          "Documents uploaded this month"
        ];
      default:
        return [
          "What is the process for filing an insurance claim?",
          "How do I calculate premium rates for auto insurance?",
          "What documents are required for policy renewal?",
          "What are the different types of insurance coverage?",
          "How long does it take to process a claim?",
          "What factors affect insurance premium calculations?"
        ];
    }
  };

  const sidebarItems = [
    {
      id: 'rag',
      name: 'RAG Assistant',
      icon: MessageCircle,
      description: 'Ask questions and get AI-powered answers',
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      description: 'Query customer information and data',
    },
    {
      id: 'policies',
      name: 'Policies',
      icon: Shield,
      description: 'Search policy information and details',
    },
    {
      id: 'claims',
      name: 'Claims',
      icon: FileText,
      description: 'Get information about insurance claims',
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FolderOpen,
      description: 'Search and query document information',
    },
    {
      id: 'content-generator',
      name: 'Document Upload',
      icon: ArrowUpToLine,
      description: 'Upload documents for RAG system indexing',
    },
    {
      id: 'car-analyzer',
      name: 'Car Analyzer', 
      icon: Car,
      description: 'Analyze car photos for insurance assessment',
    },
  ];

  return (
    <div className={`flex ${activeView === 'car-analyzer' ? 'min-h-screen' : 'h-screen'} bg-background`}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Icon Menu */}
        <div className="w-full flex justify-center p-4 pb-2">
          <div className="flex space-x-4">
            <TooltipProvider>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveView(item.id as any)}
                        className={`p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                          activeView === item.id
                            ? 'bg-primary/20 text-primary shadow-md'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="mt-2">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-muted-foreground">{item.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            
            {/* Health Status - Dev only */}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleHealthCheck}
                    className="p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Activity 
                      className={`h-6 w-6 ${
                        healthStatus === 'healthy' ? 'text-green-500' : 
                        healthStatus === 'unhealthy' ? 'text-red-500' : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="mt-2">
                  <div className="text-sm">
                    <div className="font-medium text-foreground">System Health</div>
                    <div className="text-muted-foreground">Status: {healthStatus}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col rounded-lg">
          {/* RAG Assistant View */}
          {(activeView === 'rag' || activeView === 'customers' || activeView === 'policies' || activeView === 'claims' || activeView === 'documents') && (
            <div className="flex-1 flex flex-col px-6 pb-6">
              {/* Centered Prompt Input */}
              <div className="w-full max-w-4xl mx-auto mb-6">
                <div className="flex items-center gap-4">
                  <Textarea
                    placeholder={`Ask about ${activeView === 'customers' ? 'customer' : activeView === 'policies' ? 'policy' : activeView === 'claims' ? 'claims' : activeView === 'documents' ? 'document' : 'insurance'} information...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    disabled={isLoading}
                    className="flex-1 resize-none border-2 border-primary/20 rounded-[20px] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAskQuestion} 
                    disabled={isLoading || !query.trim()}
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 p-0 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Response Section */}
              <div className="flex-1 w-full max-w-6xl mx-auto mb-6">
                <Card className="h-full purple-card-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 purple-header">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      {getViewTitle()}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {getViewDescription()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-96 overflow-y-auto bg-muted/30 rounded-lg p-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Generating response...</p>
                          </div>
                        </div>
                      ) : response ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant={response.success ? 'default' : 'destructive'}>
                              {response.success ? 'Success' : 'Error'}
                            </Badge>
                            {response.success && (
                              <Badge variant="secondary">
                                {response.answer?.length || 0} characters
                              </Badge>
                            )}
                            {response.success && 'similarCustomersCount' in response && response.similarCustomersCount && (
                              <Badge variant="outline">
                                {response.similarCustomersCount} customers found
                              </Badge>
                            )}
                            {response.success && 'similarClaimsCount' in response && response.similarClaimsCount && (
                              <Badge variant="outline">
                                {response.similarClaimsCount} claims found
                              </Badge>
                            )}
                            {response.success && 'similarPoliciesCount' in response && response.similarPoliciesCount && (
                              <Badge variant="outline">
                                {response.similarPoliciesCount} policies found
                              </Badge>
                            )}
                            {response.success && 'similarDocumentsCount' in response && response.similarDocumentsCount && (
                              <Badge variant="outline">
                                {response.similarDocumentsCount} documents found
                              </Badge>
                            )}
                          </div>
                          
                          {response.success && response.answer ? (
                            <div className="prose max-w-none dark:prose-invert">
                              {formatResponse(response.answer)}
                            </div>
                          ) : (
                            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                              <p className="text-destructive font-medium">
                                {response.error || 'No response generated'}
                              </p>
                              {response.details && (
                                <p className="text-sm text-destructive/80 mt-2">
                                  Details: {response.details}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium">Ready to assist you</p>
                            <p>Ask a question to get started</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Example Queries */}
              <div className="w-full max-w-6xl mx-auto">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Quick Questions</h3>
                    <p className="text-muted-foreground text-sm">Try these example questions to test the system</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {getExampleQueries().map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start text-left h-auto p-4 text-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                        onClick={() => setQuery(example)}
                        disabled={isLoading}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Generator View */}
          {activeView === 'content-generator' && (
            <div className="flex-1 px-6 pb-6">
              <div className="max-w-4xl mx-auto">
                <AIContentGenerator />
              </div>
            </div>
          )}

          {/* Car Analyzer View */}
          {activeView === 'car-analyzer' && (
            <div className="flex-1 px-6 pb-6 overflow-auto">
              <div className="max-w-7xl mx-auto min-h-full">
                <CarPhotoAnalyzer
                  onAnalysisComplete={(result) => {
                    console.log('Analysis complete:', result);
                  }}
                  onAnalysisError={(error) => {
                    console.error('Analysis error:', error);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VintuSureAI;
