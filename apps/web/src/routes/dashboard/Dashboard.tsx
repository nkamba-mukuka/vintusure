import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/lib/services/policyService';
import { customerService } from '@/lib/services/customerService';
import { claimService } from '@/lib/services/claimService';

import DocumentList from '@/components/documents/DocumentList';
import VintuSureAIEmbed from '@/components/ai/VintuSureAIEmbed';
import { 
  Users, 
  FileText, 
  Shield, 
  Upload, 
  AlertCircle,
  Brain,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardContext {
  activeTab: 'overview' | 'ai';
  setActiveTab: (tab: 'overview' | 'ai') => void;
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { activeTab, setActiveTab } = useOutletContext<DashboardContext>();
  const { theme, toggleTheme } = useTheme();

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
      {/* Dashboard Header with Theme Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold purple-header">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName || 'User'}!</p>
        </div>
        
        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="theme-switcher-button relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 p-0 hover:shadow-md hover:shadow-primary/25 group"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Sun Icon */}
            <Sun 
              className={cn(
                "theme-switcher-icon h-5 w-5 absolute",
                theme === 'light' 
                  ? "active text-primary" 
                  : "inactive text-muted-foreground"
              )}
            />
            {/* Moon Icon */}
            <Moon 
              className={cn(
                "theme-switcher-icon h-5 w-5 absolute",
                theme === 'dark' 
                  ? "active text-primary" 
                  : "inactive text-muted-foreground"
              )}
            />
          </div>
          
          {/* Hover effect ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/30 transition-all duration-200" />
        </Button>
      </div>

      {/* Profile Completion Alert */}
      {user && !user.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50 purple-shadow">
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="purple-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium purple-subheader">Total Policies</CardTitle>
                <Shield className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{policies.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active insurance policies
                </p>
              </CardContent>
            </Card>

            <Card className="purple-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium purple-subheader">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{customers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              </CardContent>
            </Card>

            <Card className="purple-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium purple-subheader">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{claims.length}</div>
                <p className="text-xs text-muted-foreground">
                  Filed claims
                </p>
              </CardContent>
            </Card>

            <Card className="purple-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium purple-subheader">Total Documents</CardTitle>
                <Upload className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{documents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Uploaded documents
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="purple-card-effect">
            <CardHeader>
              <CardTitle className="purple-header">Quick Actions</CardTitle>
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
                        <Card className="purple-card-effect hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium purple-subheader">{action.title}</h3>
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
            <TabsList className="glass-morphism border border-purple-200/30">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Policies */}
                <Card className="purple-card-effect">
                  <CardHeader>
                    <CardTitle className="purple-header">Recent Policies</CardTitle>
                    <CardDescription>
                      Your latest insurance policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {policies.length > 0 ? (
                      <div className="space-y-3">
                        {policies.slice(0, 5).map((policy) => (
                          <div key={policy.id} className="flex items-center justify-between p-3 border border-purple-200/50 rounded-lg hover:bg-purple-50/50 transition-colors duration-200">
                            <div>
                              <p className="font-medium purple-text">{policy.policyNumber}</p>
                              <p className="text-sm text-muted-foreground">{policy.type}</p>
                            </div>
                            <Badge variant={policy.status === 'active' ? 'default' : 'secondary'} className="badge-purple">
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
                <Card className="purple-card-effect">
                  <CardHeader>
                    <CardTitle className="purple-header">Recent Claims</CardTitle>
                    <CardDescription>
                      Your latest insurance claims
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {claims.length > 0 ? (
                      <div className="space-y-3">
                        {claims.slice(0, 5).map((claim) => (
                          <div key={claim.id} className="flex items-center justify-between p-3 border border-purple-200/50 rounded-lg hover:bg-purple-50/50 transition-colors duration-200">
                            <div>
                              <p className="font-medium purple-text">Claim #{claim.id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">{claim.damageType}</p>
                            </div>
                            <Badge variant={claim.status === 'Approved' ? 'default' : 'secondary'} className="badge-purple">
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
        <div className="h-full">
          {/* Embedded VintuSure AI Interface */}
          <VintuSureAIEmbed />
        </div>
      )}

    </div>
  );
} 