import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/contexts/AuthContext'
import { policyService } from '@/lib/services/policyService'
import { claimService } from '@/lib/services/claimService'
import { customerService } from '@/lib/services/customerService'
import LoadingState from '@/components/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
    const { user } = useAuthContext()

    const { data: policiesData, isLoading: policiesLoading } = useQuery({
        queryKey: ['policies'],
        queryFn: () => policyService.list(),
    })

    const { data: claimsData, isLoading: claimsLoading } = useQuery({
        queryKey: ['claims'],
        queryFn: () => claimService.list(),
    })

    const { data: customersData, isLoading: customersLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.list(),
    })

    if (policiesLoading || claimsLoading || customersLoading) {
        return <LoadingState />
    }

    const totalPolicies = policiesData?.total || 0
    const totalClaims = claimsData?.total || 0
    const totalCustomers = customersData?.total || 0
    const activePolicies = policiesData?.policies.filter(p => p.status === 'active').length || 0
    const pendingClaims = claimsData?.claims.filter(c => c.status === 'UnderReview').length || 0

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="mt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Policies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPolicies}</div>
                                <p className="text-sm text-gray-500">{activePolicies} active</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Claims</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalClaims}</div>
                                <p className="text-sm text-gray-500">{pendingClaims} under review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Customers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalCustomers}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 