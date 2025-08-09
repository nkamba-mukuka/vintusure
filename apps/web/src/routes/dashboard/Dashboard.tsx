import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/lib/services/policyService';
import { customerService } from '@/lib/services/customerService';
import { claimService } from '@/lib/services/claimService';

import DocumentList from '@/components/documents/DocumentList';
import { 
  Users, 
  FileText, 
  Shield, 
  Upload, 
  AlertCircle,
  UserCheck,
  BarChart3,
  Brain,
  Car
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');

  const [documents, setDocuments] = useState<any[]>([]);

  // Fetch dashboard data
  const { data: policiesData } = useQuery({
    queryKey: ['policies', user?.uid],
    queryFn: () => policyService.list({ userId: user?.uid }),
    enabled: !!user?.uid,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers', user?.uid],
    queryFn: () => customerService.list({ userId: user?.uid }),
    enabled: !!user?.uid,
  });

  const { data: claimsData } = useQuery({
    queryKey: ['claims', user?.uid],
    queryFn: () => claimService.list({ userId: user?.uid }),
    enabled: !!user?.uid,
  });

  // Load documents from localStorage in development
  useEffect(() => {
    // Removed development mode document loading
    // Documents will be loaded from Google Cloud Storage in production
  }, []);



  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const policies = policiesData?.policies || [];
  const customers = customersData?.customers || [];
  const claims = claimsData?.claims || [];

  const quickActions = [
    {
      title: 'New Policy',
      description: 'Create a new insurance policy',
      icon: Shield,
      link: '/policies/new',
    },
    {
      title: 'New Customer',
      description: 'Add a new customer',
      icon: Users,
      link: '/customers/new',
    },
    {
      title: 'New Claim',
      description: 'File a new claim',
      icon: FileText,
      link: '/claims/new',
    },

  ];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Completion Alert */}
      {user && !user.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Complete Your Profile</h3>
                <p className="text-sm text-orange-700">
                  Please complete your profile information to access all features.
                </p>
              </div>
              <Link to="/onboarding">
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your insurance business today.
          </p>
        </div>
        {user?.profileCompleted && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            Profile Complete
          </Badge>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-background border rounded-lg p-1 shadow-sm">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className={`transition-all duration-200 px-6 py-2 ${
              activeTab === 'overview' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overall Information
          </Button>
          <Button 
            variant={activeTab === 'ai' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ai')}
            className={`transition-all duration-200 px-6 py-2 ${
              activeTab === 'ai' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <Brain className="h-4 w-4 mr-2" />
            VintuSure AI
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">
              Active insurance policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">
              Filed claims
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access frequently used features quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.title}>
                  <Link to={action.link}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Policies</CardTitle>
                <CardDescription>
                  Your latest insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length > 0 ? (
                  <div className="space-y-3">
                    {policies.slice(0, 5).map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{policy.policyNumber}</p>
                          <p className="text-sm text-muted-foreground">{policy.type}</p>
                        </div>
                        <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No policies found</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>
                  Your latest insurance claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length > 0 ? (
                  <div className="space-y-3">
                    {claims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Claim #{claim.id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">{claim.damageType}</p>
                        </div>
                        <Badge variant={claim.status === 'Approved' ? 'default' : 'secondary'}>
                          {claim.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No claims found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentList 
            documents={documents} 
            onDocumentDelete={handleDocumentDelete}
          />
        </TabsContent>
      </Tabs>
      </>
      )}

      {/* VintuSure AI Tab Content */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                VintuSure AI Assistant
              </CardTitle>
              <CardDescription>
                Access AI-powered tools for content generation, analysis, and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* AI Content Generator */}
                <Link to="/ai-generator">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Content Generator</h3>
                          <p className="text-sm text-muted-foreground">Generate insurance content with AI</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Car Analyzer */}
                <Link to="/car-analyzer">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Car Analyzer</h3>
                          <p className="text-sm text-muted-foreground">Analyze vehicle damage with AI</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* RAG Test */}
                <Link to="/rag-test">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">RAG Assistant</h3>
                          <p className="text-sm text-muted-foreground">Knowledge-based AI assistance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>
                Explore what VintuSure AI can help you with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Content Generation</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Generate policy descriptions</li>
                    <li>• Create claim summaries</li>
                    <li>• Draft customer communications</li>
                    <li>• Generate marketing content</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Analysis & Insights</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Vehicle damage assessment</li>
                    <li>• Risk analysis</li>
                    <li>• Policy recommendations</li>
                    <li>• Document analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
} 