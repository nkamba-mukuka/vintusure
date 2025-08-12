import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { RAGService, QueryResponse } from '../../lib/services/ragService';
import { useToast } from '../../hooks/use-toast';
import { Brain, Car, Sparkles, Activity, MessageCircle, Send, Users, FileText, ClipboardList } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import AIContentGenerator from './AIContentGenerator';
import CarPhotoAnalyzer from '../car/CarPhotoAnalyzer';

type ViewType = 'rag' | 'content-generator' | 'car-analyzer';

interface ViewOption {
  id: ViewType;
  name: string;
  icon: React.ElementType;
  description: string;
}

const viewOptions: ViewOption[] = [
  {
    id: 'rag',
    name: 'AI Assistant',
    icon: Brain,
    description: 'Ask questions and get AI-powered answers',
  },
  {
    id: 'content-generator',
    name: 'Document Upload',
    icon: Sparkles,
    description: 'Upload documents for RAG system indexing',
  },
  {
    id: 'car-analyzer',
    name: 'Car Analyzer',
    icon: Car,
    description: 'Analyze car photos for insurance assessment',
  },
];

const VintuSureAIEmbed: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('rag');
  const { toast } = useToast();
  const { user } = useAuthContext();

  const renderView = () => {
    switch (activeView) {
      case 'content-generator':
        return <AIContentGenerator />;
      case 'car-analyzer':
        return (
          <CarPhotoAnalyzer
            onAnalysisComplete={(result) => {
              console.log('Analysis complete:', result);
              toast({
                title: 'Success',
                description: 'Car photo analyzed successfully',
              });
            }}
            onAnalysisError={(error) => {
              console.error('Analysis error:', error);
              toast({
                title: 'Error',
                description: 'Failed to analyze car photo',
                variant: 'destructive',
              });
            }}
          />
        );
      default:
        return <RAGQueryView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Selection */}
      <div className="flex justify-center gap-4 p-4">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          return (
            <TooltipProvider key={option.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeView === option.id ? 'default' : 'outline'}
                    className={`flex items-center gap-2 ${activeView === option.id ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    onClick={() => setActiveView(option.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {option.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{option.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Active View Content */}
      <div className="p-4">
        {renderView()}
      </div>
    </div>
  );
};

// Separate RAG Query component for better organization
const RAGQueryView = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();

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
      const result = await RAGService.askQuestion(query, user?.uid);
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

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Ask VintuSure AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Textarea
              placeholder="Ask about insurance policies, claims, or any related topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuery();
                }
              }}
            />
            <Button
              onClick={handleQuery}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={response.success ? 'default' : 'destructive'}>
                  {response.success ? 'Success' : 'Error'}
                </Badge>
              </div>
              <div className="prose max-w-none">
                {response.answer}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VintuSureAIEmbed;
