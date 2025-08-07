import React, { Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingState from '@/components/LoadingState'

// Lazy load route components
const LandingPage = React.lazy(() => import('@/components/landingpage/LandingPage'))
const LoginPage = React.lazy(() => import('@/routes/auth/Login'))
const SignUpPage = React.lazy(() => import('@/routes/auth/SignUp'))
const ForgotPasswordPage = React.lazy(() => import('@/routes/auth/ForgotPassword'))
const ExplorePage = React.lazy(() => import('@/routes/Explore'))
const DashboardPage = React.lazy(() => import('@/routes/dashboard/Dashboard'))
const PoliciesPage = React.lazy(() => import('@/routes/dashboard/policies/Policies'))
const NewPolicyPage = React.lazy(() => import('@/routes/dashboard/policies/NewPolicy'))
const EditPolicyPage = React.lazy(() => import('@/routes/dashboard/policies/EditPolicy'))
const PolicyDetailsPage = React.lazy(() => import('@/routes/dashboard/policies/PolicyDetails'))
const PolicyDocumentsPage = React.lazy(() => import('@/routes/dashboard/policies/PolicyDocuments'))
const ClaimsPage = React.lazy(() => import('@/routes/dashboard/claims/Claims'))
const CustomersPage = React.lazy(() => import('@/routes/dashboard/customers/Customers'))
const NewCustomerPage = React.lazy(() => import('@/routes/dashboard/customers/NewCustomer'))
const EditCustomerPage = React.lazy(() => import('@/routes/dashboard/customers/EditCustomer'))
const RAGTestPage = React.lazy(() => import('@/routes/dashboard/RAGTest'))
const AIGeneratorPage = React.lazy(() => import('@/routes/dashboard/AIGenerator'))
const CarAnalyzerPage = React.lazy(() => import('@/routes/dashboard/CarAnalyzer'))

function ProtectedRoute() {
    const { user, loading } = useAuthContext()

    if (loading) {
        return <LoadingState />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingState />}>
                <Routes>
                    {/* Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/explore" element={<ExplorePage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/policies">
                                <Route index element={<PoliciesPage />} />
                                <Route path="new" element={<NewPolicyPage />} />
                                <Route path=":id">
                                    <Route index element={<PolicyDetailsPage />} />
                                    <Route path="edit" element={<EditPolicyPage />} />
                                    <Route path="documents" element={<PolicyDocumentsPage />} />
                                </Route>
                            </Route>
                            <Route path="/claims" element={<ClaimsPage />} />
                            <Route path="/customers/new" element={<NewCustomerPage />} />
                            <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/rag-test" element={<RAGTestPage />} />
                            <Route path="/ai-generator" element={<AIGeneratorPage />} />
                            <Route path="/car-analyzer" element={<CarAnalyzerPage />} />
                        </Route>
                    </Route>

                    {/* 404 route */}
                    <Route
                        path="*"
                        element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold text-gray-900">404</h1>
                                    <p className="mt-2 text-lg text-gray-600">Page not found</p>
                                </div>
                            </div>
                        }
                    />
                </Routes>
                <Toaster />
            </Suspense>
        </ErrorBoundary>
    )
} 