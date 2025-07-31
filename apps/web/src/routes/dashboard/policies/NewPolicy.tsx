import PolicyForm from '@/components/policies/PolicyForm'
import { useAuthContext } from '@/contexts/AuthContext'
import LoadingState from '@/components/LoadingState'

export default function NewPolicyPage() {
    const { loading } = useAuthContext()

    if (loading) {
        return <LoadingState />
    }

    return (
        <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Create New Policy</h1>
                <div className="mt-4">
                    <PolicyForm />
                </div>
            </div>
        </div>
    )
} 