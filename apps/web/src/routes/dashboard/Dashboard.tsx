import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/contexts/AuthContext'
import { policyService } from '@/lib/services/policyService'
import { claimService } from '@/lib/services/claimService'
import { customerService } from '@/lib/services/customerService'
import { RAGService, QueryResponse } from '@/lib/services/ragService'
import LoadingState from '@/components/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
    Plus, 
    Search, 
    MessageCircle, 
    TrendingUp, 
    AlertCircle, 
    Clock, 
    CheckCircle,
    FileText,
    Users,
    Shield,
    Calendar,
    DollarSign,
    Activity,
    Lightbulb,
    HelpCircle,
    ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
    const { user } = useAuthContext()
    const { toast } = useToast()
    const [aiQuery, setAiQuery] = useState('')
    const [aiResponse, setAiResponse] = useState<QueryResponse | null>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)

    // User-specific data queries
    const { data: policiesData, isLoading: policiesLoading } = useQuery({
        queryKey: ['policies', user?.uid],
        queryFn: () => policyService.list({ userId: user?.uid }),
        enabled: !!user?.uid
    })

    const { data: claimsData, isLoading: claimsLoading } = useQuery({
        queryKey: ['claims', user?.uid],
        queryFn: () => claimService.list({ userId: user?.uid }),
        enabled: !!user?.uid
    })

    const { data: customersData, isLoading: customersLoading } = useQuery({
        queryKey: ['customers', user?.uid],
        queryFn: () => customerService.list({ userId: user?.uid }),
        enabled: !!user?.uid
    })

    const handleAiQuestion = async () => {
        if (!aiQuery.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a question',
                variant: 'destructive',
            })
            return
        }

        setIsAiLoading(true)
        try {
            const result = await RAGService.askQuestion(aiQuery, user?.uid)
            setAiResponse(result)
            
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'AI response generated successfully',
                })
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to get AI response',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Error asking AI question:', error)
            toast({
                title: 'Error',
                description: 'Failed to communicate with AI assistant',
                variant: 'destructive',
            })
        } finally {
            setIsAiLoading(false)
        }
    }

    if (policiesLoading || claimsLoading || customersLoading) {
        return <LoadingState />
    }

    const totalPolicies = policiesData?.total || 0
    const totalClaims = claimsData?.total || 0
    const totalCustomers = customersData?.total || 0
    const activePolicies = policiesData?.policies?.filter(p => p.status === 'active').length || 0
    const pendingClaims = claimsData?.claims?.filter(c => c.status === 'UnderReview').length || 0
    const recentPolicies = policiesData?.policies?.slice(0, 5) || []
    const recentClaims = claimsData?.claims?.slice(0, 5) || []

    const quickActions = [
        {
            title: 'Create New Policy',
            description: 'Add a new insurance policy',
            icon: <Plus className="h-5 w-5" />,
            link: '/policies/new',
            color: 'bg-blue-500'
        },
        {
            title: 'File New Claim',
            description: 'Process a new insurance claim',
            icon: <FileText className="h-5 w-5" />,
            link: '/claims/new',
            color: 'bg-green-500'
        },
        {
            title: 'Add Customer',
            description: 'Register a new customer',
            icon: <Users className="h-5 w-5" />,
            link: '/customers/new',
            color: 'bg-purple-500'
        },
        {
            title: 'View Reports',
            description: 'Generate and view reports',
            icon: <TrendingUp className="h-5 w-5" />,
            link: '/reports',
            color: 'bg-orange-500'
        }
    ]

    const aiSuggestions = [
        "When is Mukuka Nkamba's policy expiring?",
        "Show me all active policies for this month",
        "What claims are pending review?",
        "Generate a summary of recent customer activities",
        "What are the most common claim types?"
    ]

    return (
        <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.email}</p>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
                        <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
                        <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalPolicies}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {activePolicies} active policies
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalClaims}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {pendingClaims} pending review
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalCustomers}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Registered customers
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Premiums</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(activePolicies * 1500)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Monthly premium value
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Recent Policies */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Recent Policies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentPolicies.length > 0 ? (
                                            recentPolicies.map((policy) => (
                                                <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{policy.vehicle.registrationNumber}</p>
                                                        <p className="text-sm text-gray-600">{policy.type}</p>
                                                    </div>
                                                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                                        {policy.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No recent policies</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Claims */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Claims
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentClaims.length > 0 ? (
                                            recentClaims.map((claim) => (
                                                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{claim.damageType}</p>
                                                        <p className="text-sm text-gray-600">Claim #{claim.id.slice(-6)}</p>
                                                    </div>
                                                    <Badge variant={claim.status === 'UnderReview' ? 'destructive' : 'default'}>
                                                        {claim.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No recent claims</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* AI Assistant Tab */}
                    <TabsContent value="ai-assistant" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    AI Insurance Assistant
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Ask questions about policies, claims, customers, or get insights about your insurance operations.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* AI Suggestions */}
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" />
                                        Quick Questions
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {aiSuggestions.map((suggestion, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAiQuery(suggestion)}
                                                className="text-xs"
                                            >
                                                {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Input */}
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Ask about policies, claims, customers, or any insurance-related questions..."
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <Button 
                                        onClick={handleAiQuestion} 
                                        disabled={isAiLoading}
                                        className="w-full"
                                    >
                                        {isAiLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Search className="h-4 w-4" />
                                                <span>Ask AI Assistant</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                                
                                {/* AI Response */}
                                {aiResponse && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            AI Response:
                                        </h4>
                                        <div className="max-h-64 overflow-y-auto pr-2 ai-response-scrollbar">
                                            <div className="prose prose-sm max-w-none">
                                                <p className="text-blue-800 font-['Roboto'] leading-relaxed whitespace-pre-wrap">
                                                    {aiResponse.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Quick Actions Tab */}
                    <TabsContent value="quick-actions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Quick Actions
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Common tasks and shortcuts for your daily operations.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {quickActions.map((action, index) => (
                                        <Link key={index} to={action.link}>
                                            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`p-3 rounded-lg ${action.color} text-white`}>
                                                            {action.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold">{action.title}</h3>
                                                            <p className="text-sm text-gray-600">{action.description}</p>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Recent Activity Tab */}
                    <TabsContent value="recent-activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Latest updates and activities in your insurance system.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentPolicies.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-3">Recent Policy Updates</h4>
                                            <div className="space-y-2">
                                                {recentPolicies.slice(0, 3).map((policy) => (
                                                    <div key={policy.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">Policy updated for {policy.vehicle.registrationNumber}</p>
                                                            <p className="text-xs text-gray-500">{policy.type} • {policy.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {recentClaims.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-3">Recent Claim Activities</h4>
                                            <div className="space-y-2">
                                                {recentClaims.slice(0, 3).map((claim) => (
                                                    <div key={claim.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">Claim filed for {claim.damageType}</p>
                                                            <p className="text-xs text-gray-500">Claim #{claim.id.slice(-6)} • {claim.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 