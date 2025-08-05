import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/contexts/AuthContext'
import { claimService } from '@/lib/services/claimService'
import { RAGService, QueryResponse } from '@/lib/services/ragService'
import LoadingState from '@/components/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
    Plus, 
    Search, 
    MessageCircle, 
    FileText,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    HelpCircle,
    Filter,
    Eye,
    Edit
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ClaimsPage() {
    const { user } = useAuthContext()
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [aiQuery, setAiQuery] = useState('')
    const [aiResponse, setAiResponse] = useState<QueryResponse | null>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [showAiAssistant, setShowAiAssistant] = useState(false)

    // User-specific claims data
    const { data: claimsData, isLoading: claimsLoading } = useQuery({
        queryKey: ['claims', user?.uid, searchTerm, statusFilter],
        queryFn: () => claimService.list({ 
            userId: user?.uid,
            searchTerm: searchTerm || undefined,
            status: statusFilter as any || undefined
        }),
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

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'Submitted':
                return 'secondary'
            case 'UnderReview':
                return 'destructive'
            case 'Approved':
                return 'default'
            case 'Rejected':
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Submitted':
                return <Clock className="h-4 w-4" />
            case 'UnderReview':
                return <AlertCircle className="h-4 w-4" />
            case 'Approved':
                return <CheckCircle className="h-4 w-4" />
            case 'Rejected':
                return <AlertCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    if (claimsLoading) {
        return <LoadingState />
    }

    const claims = claimsData?.claims || []
    const totalClaims = claimsData?.total || 0

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
                        <p className="text-gray-600 mt-2">Manage and process insurance claims</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => setShowAiAssistant(!showAiAssistant)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <HelpCircle className="h-4 w-4" />
                            {showAiAssistant ? 'Hide' : 'Show'} AI Assistant
                        </Button>
                        <Link to="/claims/new">
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                New Claim
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* AI Assistant */}
                {showAiAssistant && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Claims AI Assistant
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Need help creating a claim? Ask questions about claim processing, status updates, or get guidance on claim procedures.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Ask about claim processing, status updates, or any claims-related questions..."
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
                            
                            {aiResponse && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        AI Response:
                                    </h4>
                                    <p className="text-blue-800">{aiResponse.answer}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Claims
                                </label>
                                <Input
                                    placeholder="Search by customer name, claim type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="UnderReview">Under Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={() => {
                                        setSearchTerm('')
                                        setStatusFilter('')
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Claims List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Claims ({totalClaims})
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {claims.length > 0 ? (
                            <div className="space-y-4">
                                {claims.map((claim) => (
                                    <div key={claim.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{claim.customerName}</h3>
                                                    <Badge variant={getStatusBadgeVariant(claim.status)} className="flex items-center gap-1">
                                                        {getStatusIcon(claim.status)}
                                                        {claim.status}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Claim Type:</span> {claim.type}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Damage Type:</span> {claim.damageType}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Amount:</span> ${claim.amount}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Filed on {new Date(claim.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/claims/${claim.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/claims/${claim.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || statusFilter 
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Get started by creating your first claim.'
                                    }
                                </p>
                                {!searchTerm && !statusFilter && (
                                    <Link to="/claims/new">
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Create First Claim
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 