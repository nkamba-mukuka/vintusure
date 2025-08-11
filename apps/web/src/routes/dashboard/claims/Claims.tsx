import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/contexts/AuthContext'
import { claimService } from '@/lib/services/claimService'
import { RAGService, QueryResponse } from '@/lib/services/ragService'
import LoadingState from '@/components/LoadingState'
import ClaimList from '@/components/claims/ClaimList'
import ClaimFiltersBar from '@/components/claims/ClaimFiltersBar'
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
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [aiQuery, setAiQuery] = useState('')
    const [aiResponse, setAiResponse] = useState<QueryResponse | null>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [showAiAssistant, setShowAiAssistant] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    // User-specific claims data
    const { data: claimsData, isLoading: claimsLoading, error: claimsError } = useQuery({
        queryKey: ['claims', user?.uid, searchTerm, statusFilter, currentPage],
        queryFn: () => claimService.list({
            userId: user?.uid,
            limit: 10,
        }),
        enabled: !!user?.uid,
        retry: 1
    })

    const handleClaimDelete = async (claimId: string) => {
        try {
            await claimService.delete(claimId)
            await queryClient.invalidateQueries({ queryKey: ['claims'] })
        } catch (error) {
            console.error('Error deleting claim:', error)
            throw error // Re-throw to let the ClaimList component handle the error
        }
    }

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

    if (claimsError) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-8">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Claims</h2>
                        <p className="text-gray-600 mb-4">There was an error loading your claims.</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </div>
        )
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
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                AI Claims Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ask about claims processing, policies, or get help..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                                />
                                <Button onClick={handleAiQuestion} disabled={isAiLoading}>
                                    {isAiLoading ? 'Thinking...' : 'Ask'}
                                </Button>
                            </div>
                            {aiResponse && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">AI Response:</h4>
                                    <p className="text-gray-700">{aiResponse.answer}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClaims}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {claims.filter(c => c.status === 'Submitted').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {claims.filter(c => c.status === 'UnderReview').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {claims.filter(c => c.status === 'Approved').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <ClaimFiltersBar
                    filters={{
                        searchTerm: searchTerm || undefined,
                        status: statusFilter as any || undefined
                    }}
                    onFilterChange={(filters) => {
                        setSearchTerm(filters.searchTerm || '');
                        setStatusFilter(filters.status || '');
                    }}
                />

                {/* Claims List */}
                <div className="mt-6">
                    {claims.length === 0 && !claimsLoading ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                                <p className="text-gray-600 mb-6">
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
                            </CardContent>
                        </Card>
                    ) : (
                        <ClaimList
                            claims={claims}
                            isLoading={claimsLoading}
                            currentPage={currentPage}
                            totalPages={Math.ceil(totalClaims / 10)}
                            onPageChange={setCurrentPage}
                            onClaimDelete={handleClaimDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    )
} 