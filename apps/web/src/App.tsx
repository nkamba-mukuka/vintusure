import React, { Suspense, memo } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingState from '@/components/LoadingState'

// Optimized lazy loading with better caching and preloading
const LandingPage = React.lazy(() => import('@/components/landingpage/LandingPage'))
const LoginPage = React.lazy(() => import('@/routes/auth/Login'))
const SignUpPage = React.lazy(() => import('@/routes/auth/SignUp'))
const ForgotPasswordPage = React.lazy(() => import('@/routes/auth/ForgotPassword'))
const ProfileOnboardingPage = React.lazy(() => import('@/routes/auth/ProfileOnboarding'))
const ExplorePage = React.lazy(() => import('@/routes/Explore'))

// Dashboard routes with higher priority
const DashboardPage = React.lazy(() => import('@/routes/dashboard/Dashboard'))
const ProfilePage = React.lazy(() => import('@/routes/dashboard/Profile'))
const SettingsPage = React.lazy(() => import('@/routes/dashboard/Settings'))

// Policy management routes
const PoliciesPage = React.lazy(() => import('@/routes/dashboard/policies/Policies'))
const NewPolicyPage = React.lazy(() => import('@/routes/dashboard/policies/NewPolicy'))
const EditPolicyPage = React.lazy(() => import('@/routes/dashboard/policies/EditPolicy'))
const PolicyDetailsPage = React.lazy(() => import('@/routes/dashboard/policies/PolicyDetails'))
const PolicyDocumentsPage = React.lazy(() => import('@/routes/dashboard/policies/PolicyDocuments'))

// Claims management routes
const ClaimsPage = React.lazy(() => import('@/routes/dashboard/claims/Claims'))
const NewClaimPage = React.lazy(() => import('@/routes/dashboard/claims/NewClaim'))
const EditClaimPage = React.lazy(() => import('@/routes/dashboard/claims/EditClaim'))
const ClaimDetailsPage = React.lazy(() => import('@/routes/dashboard/claims/ClaimDetails'))

// Customer management routes
const CustomersPage = React.lazy(() => import('@/routes/dashboard/customers/Customers'))
const NewCustomerPage = React.lazy(() => import('@/routes/dashboard/customers/NewCustomer'))
const EditCustomerPage = React.lazy(() => import('@/routes/dashboard/customers/EditCustomer'))

// AI routes - heavier components loaded separately
const RAGTestPage = React.lazy(() => import('@/routes/dashboard/RAGTest'))
const AIGeneratorPage = React.lazy(() => import('@/routes/dashboard/AIGenerator'))
const CarAnalyzerPage = React.lazy(() => import('@/routes/dashboard/CarAnalyzer'))
const VintuSureAIPage = React.lazy(() => import('@/routes/dashboard/VintuSureAI'))



// Memoized route components for better performance
const ProtectedRoute = memo(() => {
    const { user, loading } = useAuthContext()

    if (loading) {
        return <LoadingState message="Authenticating..." variant="pulse" />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Check if profile is completed
    if (!user.profileCompleted) {
        return <Navigate to="/onboarding" replace />
    }

    return <Outlet />
})

const OnboardingRoute = memo(() => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <LoadingState message="Setting up your profile..." variant="pulse" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If profile is already completed, redirect to dashboard
  if (user.profileCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense fallback={<LoadingState message="Loading profile setup..." />}>
      <ProfileOnboardingPage />
    </Suspense>
  )
})

// Add display names for debugging
ProtectedRoute.displayName = 'ProtectedRoute'
OnboardingRoute.displayName = 'OnboardingRoute'

export default function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingState />}>
                <Routes>
                    {/* Landing Page */}
                    <Route 
                        path="/" 
                        element={
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingState message="Loading VintuSure..." />}>
                                    <LandingPage />
                                </Suspense>
                            </ErrorBoundary>
                        } 
                    />

                    {/* Public Routes */}
                    <Route 
                        path="/login" 
                        element={
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingState message="Loading sign in..." />}>
                                    <LoginPage />
                                </Suspense>
                            </ErrorBoundary>
                        } 
                    />
                    <Route 
                        path="/signup" 
                        element={
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingState message="Loading sign up..." />}>
                                    <SignUpPage />
                                </Suspense>
                            </ErrorBoundary>
                        } 
                    />
                    <Route 
                        path="/forgot-password" 
                        element={
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingState message="Loading password reset..." />}>
                                    <ForgotPasswordPage />
                                </Suspense>
                            </ErrorBoundary>
                        } 
                    />
                    <Route 
                        path="/explore" 
                        element={
                            <ErrorBoundary>
                                <Suspense fallback={<LoadingState message="Loading explorer..." />}>
                                    <ExplorePage />
                                </Suspense>
                            </ErrorBoundary>
                        } 
                    />

                    {/* Onboarding route */}
                    <Route path="/onboarding" element={<OnboardingRoute />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route 
                                path="/dashboard" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading dashboard..." />}>
                                            <DashboardPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/profile" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading profile..." />}>
                                            <ProfilePage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/settings" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading settings..." />}>
                                            <SettingsPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route path="/policies">
                                <Route 
                                    index 
                                    element={
                                        <ErrorBoundary>
                                            <Suspense fallback={<LoadingState message="Loading policies..." />}>
                                                <PoliciesPage />
                                            </Suspense>
                                        </ErrorBoundary>
                                    } 
                                />
                                <Route 
                                    path="new" 
                                    element={
                                        <ErrorBoundary>
                                            <Suspense fallback={<LoadingState message="Loading new policy form..." />}>
                                                <NewPolicyPage />
                                            </Suspense>
                                        </ErrorBoundary>
                                    } 
                                />
                                <Route path=":id">
                                    <Route 
                                        index 
                                        element={
                                            <ErrorBoundary>
                                                <Suspense fallback={<LoadingState message="Loading policy details..." />}>
                                                    <PolicyDetailsPage />
                                                </Suspense>
                                            </ErrorBoundary>
                                        } 
                                    />
                                    <Route 
                                        path="edit" 
                                        element={
                                            <ErrorBoundary>
                                                <Suspense fallback={<LoadingState message="Loading policy editor..." />}>
                                                    <EditPolicyPage />
                                                </Suspense>
                                            </ErrorBoundary>
                                        } 
                                    />
                                    <Route 
                                        path="documents" 
                                        element={
                                            <ErrorBoundary>
                                                <Suspense fallback={<LoadingState message="Loading documents..." />}>
                                                    <PolicyDocumentsPage />
                                                </Suspense>
                                            </ErrorBoundary>
                                        } 
                                    />
                                </Route>
                            </Route>
                            <Route path="/claims">
                                <Route 
                                    index 
                                    element={
                                        <ErrorBoundary>
                                            <Suspense fallback={<LoadingState message="Loading claims..." />}>
                                                <ClaimsPage />
                                            </Suspense>
                                        </ErrorBoundary>
                                    } 
                                />
                                <Route 
                                    path="new" 
                                    element={
                                        <ErrorBoundary>
                                            <Suspense fallback={<LoadingState message="Loading new claim form..." />}>
                                                <NewClaimPage />
                                            </Suspense>
                                        </ErrorBoundary>
                                    } 
                                />
                                <Route path=":id">
                                    <Route 
                                        index 
                                        element={
                                            <ErrorBoundary>
                                                <Suspense fallback={<LoadingState message="Loading claim details..." />}>
                                                    <ClaimDetailsPage />
                                                </Suspense>
                                            </ErrorBoundary>
                                        } 
                                    />
                                    <Route 
                                        path="edit" 
                                        element={
                                            <ErrorBoundary>
                                                <Suspense fallback={<LoadingState message="Loading claim editor..." />}>
                                                    <EditClaimPage />
                                                </Suspense>
                                            </ErrorBoundary>
                                        } 
                                    />
                                </Route>
                            </Route>
                            <Route 
                                path="/customers/new" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading new customer form..." />}>
                                            <NewCustomerPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/customers/:id/edit" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading customer editor..." />}>
                                            <EditCustomerPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/customers" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading customers..." />}>
                                            <CustomersPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/rag-test" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading AI assistant..." />}>
                                            <RAGTestPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/ai-generator" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading AI generator..." />}>
                                            <AIGeneratorPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/car-analyzer" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading car analyzer..." />}>
                                            <CarAnalyzerPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/vintusure-ai" 
                                element={
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingState message="Loading VintuSure AI..." />}>
                                            <VintuSureAIPage />
                                        </Suspense>
                                    </ErrorBoundary>
                                } 
                            />
                            
                        </Route>
                    </Route>

                    {/* 404 route */}
                    <Route
                        path="*"
                        element={
                            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                                <div className="text-center space-y-6 max-w-md">
                                    <div className="space-y-4">
                                        <h1 className="text-6xl font-bold text-primary animate-bounce-in">404</h1>
                                        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            The page you're looking for doesn't exist or has been moved.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => window.history.back()}
                                            className="btn-secondary px-6 py-2 rounded-md transition-all duration-200"
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/'}
                                            className="btn-primary px-6 py-2 rounded-md transition-all duration-200"
                                        >
                                            Go Home
                                        </button>
                                    </div>
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