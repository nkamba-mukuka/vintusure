import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/lib/services/policyService';
import { customerService } from '@/lib/services/customerService';
import { claimService } from '@/lib/services/claimService';

import VintuSureAIEmbed from '@/components/ai/VintuSureAIEmbed';
import {
  Users,
  FileText,
  Shield,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardContext {
  activeTab: 'overview' | 'ai';
  setActiveTab: (tab: 'overview' | 'ai') => void;
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { activeTab, setActiveTab } = useOutletContext<DashboardContext>();

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
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Completion Alert */}
      {user && !user.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50 purple-shadow">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-orange-900 text-sm sm:text-base">Complete Your Profile</h3>
                <p className="text-xs sm:text-sm text-orange-700 mt-1">
                  Please complete your profile information to access all features.
                </p>
              </div>
              <Link to="/onboarding" className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 w-full sm:w-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            <Card className="purple-card-effect sm:col-span-2 lg:col-span-1">
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
          </div>

          {/* Quick Actions */}
          <Card className="purple-card-effect">
            <CardHeader>
              <CardTitle className="purple-header text-lg sm:text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Access frequently used features quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.title}>
                      <Link to={action.link}>
                        <Card className="purple-card-effect hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium purple-subheader text-sm sm:text-base truncate">{action.title}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{action.description}</p>
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

          {/* Recent Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Policies */}
            <Card className="purple-card-effect">
              <CardHeader>
                <CardTitle className="purple-header text-lg sm:text-xl">Recent Policies</CardTitle>
                <CardDescription>
                  Your latest insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length > 0 ? (
                  <div className="space-y-3">
                    {policies.slice(0, 5).map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{policy.policyNumber}</p>
                          <p className="text-xs text-muted-foreground truncate">{policy.type}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {policy.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No policies yet</p>
                    <Link to="/policies/new">
                      <Button variant="outline" size="sm" className="mt-2">
                        Create First Policy
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card className="purple-card-effect">
              <CardHeader>
                <CardTitle className="purple-header text-lg sm:text-xl">Recent Customers</CardTitle>
                <CardDescription>
                  Your latest customer registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customers.length > 0 ? (
                  <div className="space-y-3">
                    {customers.slice(0, 5).map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {customer.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No customers yet</p>
                    <Link to="/customers/new">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add First Customer
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-primary">AI Assistant</h2>
          </div>
          <VintuSureAIEmbed />
        </div>
      )}
    </div>
  );
} 