import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import LoadingState from './components/LoadingState';

// Lazy load components
const LandingPage = lazy(() => import('./components/landingpage/LandingPage'));
const Login = lazy(() => import('./routes/auth/Login'));
const SignUp = lazy(() => import('./routes/auth/SignUp'));
const ForgotPassword = lazy(() => import('./routes/auth/ForgotPassword'));
const ProfileOnboarding = lazy(() => import('./routes/auth/ProfileOnboarding'));
const Dashboard = lazy(() => import('./routes/dashboard/Dashboard'));
const Profile = lazy(() => import('./routes/dashboard/Profile'));
const Settings = lazy(() => import('./routes/dashboard/Settings'));
const Customers = lazy(() => import('./routes/dashboard/customers/Customers'));
const NewCustomer = lazy(() => import('./routes/dashboard/customers/NewCustomer'));
const EditCustomer = lazy(() => import('./routes/dashboard/customers/EditCustomer'));
const Policies = lazy(() => import('./routes/dashboard/policies/Policies'));
const NewPolicy = lazy(() => import('./routes/dashboard/policies/NewPolicy'));
const EditPolicy = lazy(() => import('./routes/dashboard/policies/EditPolicy'));
const PolicyDetails = lazy(() => import('./routes/dashboard/policies/PolicyDetails'));
const PolicyDocuments = lazy(() => import('./routes/dashboard/policies/PolicyDocuments'));
const Claims = lazy(() => import('./routes/dashboard/claims/Claims'));
const NewClaim = lazy(() => import('./routes/dashboard/claims/NewClaim'));
const EditClaim = lazy(() => import('./routes/dashboard/claims/EditClaim'));
const ClaimDetails = lazy(() => import('./routes/dashboard/claims/ClaimDetails'));
const CarAnalyzer = lazy(() => import('./routes/dashboard/CarAnalyzer'));
const AIGenerator = lazy(() => import('./routes/dashboard/AIGenerator'));
const VintuSureAI = lazy(() => import('./routes/dashboard/VintuSureAI'));
const RAGTest = lazy(() => import('./routes/dashboard/RAGTest'));

export default function AppRoutes() {
    const { user, loading } = useAuthContext();

    if (loading) {
        return <LoadingState />;
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                {user ? (
                    <>
                        {/* Profile Onboarding */}
                        <Route path="/onboarding" element={<ProfileOnboarding />} />

                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />

                        {/* Customer Routes */}
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/customers/new" element={<NewCustomer />} />
                        <Route path="/customers/:id/edit" element={<EditCustomer />} />

                        {/* Policy Routes */}
                        <Route path="/policies" element={<Policies />} />
                        <Route path="/policies/new" element={<NewPolicy />} />
                        <Route path="/policies/:id" element={<PolicyDetails />} />
                        <Route path="/policies/:id/edit" element={<EditPolicy />} />
                        <Route path="/policies/:id/documents" element={<PolicyDocuments />} />

                        {/* Claim Routes */}
                        <Route path="/claims" element={<Claims />} />
                        <Route path="/claims/new" element={<NewClaim />} />
                        <Route path="/claims/:id" element={<ClaimDetails />} />
                        <Route path="/claims/:id/edit" element={<EditClaim />} />

                        {/* AI Features */}
                        <Route path="/car-analyzer" element={<CarAnalyzer />} />
                        <Route path="/ai-generator" element={<AIGenerator />} />
                        <Route path="/vintusure-ai" element={<VintuSureAI />} />
                        <Route path="/rag-test" element={<RAGTest />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" replace />} />
                )}
            </Routes>
        </Suspense>
    );
} 