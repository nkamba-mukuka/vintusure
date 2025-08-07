import { Link } from "react-router-dom"
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Shield, Car, Users, FileText, TrendingUp, User, Building2, Brain } from 'lucide-react'
import vintusureLogo from '@/assets/vintusure-logo.ico'

export default function LandingPage() {
    const { user } = useAuthContext()

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-purple-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                                <span className="text-2xl font-bold text-primary">VintuSure</span>
                            </div>
                            <div className="flex gap-4">
                                {user ? (
                                    <Button variant="purple" asChild>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" asChild>
                                            <Link to="/login">Sign In</Link>
                                        </Button>
                                        <Button variant="purple" asChild>
                                            <Link to="/signup">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                            AI-Powered Insurance Intelligence
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            VintuSure is an AI-powered online platform that provides advanced RAG (Retrieval-Augmented Generation)
                            services to insurance companies, enhancing their knowledge management and customer support capabilities.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {user ? (
                                <Button variant="purple" size="lg" asChild>
                                    <Link to="/dashboard" className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="purple" size="lg" asChild>
                                        <Link to="/login" className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            I'm an Agent
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link to="/explore" className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            I'm a Customer
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                    <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                        Why Choose VintuSure for Your Insurance Business?
                    </h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Feature 1 */}
                        <div className="rounded-xl border bg-card p-6 hover-card-effect">
                            <Shield className="h-12 w-12 mb-4 text-primary" />
                            <h3 className="text-xl font-semibold text-primary mb-3">Advanced RAG Technology</h3>
                            <p className="text-muted-foreground">
                                State-of-the-art Retrieval-Augmented Generation for intelligent document processing and knowledge retrieval.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="rounded-xl border bg-card p-6 hover-card-effect">
                            <Car className="h-12 w-12 mb-4 text-primary" />
                            <h3 className="text-xl font-semibold text-primary mb-3">Multi-Insurance Support</h3>
                            <p className="text-muted-foreground">
                                Comprehensive platform supporting various insurance types and company needs.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="rounded-xl border bg-card p-6 hover-card-effect">
                            <Brain className="h-12 w-12 mb-4 text-primary" />
                            <h3 className="text-xl font-semibold text-primary mb-3">AI-Powered Assistance</h3>
                            <p className="text-muted-foreground">
                                Intelligent AI assistance for enhanced customer service and operational efficiency.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="rounded-xl border bg-card p-6 hover-card-effect">
                            <TrendingUp className="h-12 w-12 mb-4 text-primary" />
                            <h3 className="text-xl font-semibold text-primary mb-3">Scalable Solutions</h3>
                            <p className="text-muted-foreground">
                                Flexible and scalable platform that grows with your insurance business needs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-border bg-background/80 backdrop-blur-sm py-8">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-2 mb-4 md:mb-0">
                                <img src={vintusureLogo} alt="VintuSure Logo" className="h-6 w-6" />
                                <span className="text-lg font-semibold text-primary">VintuSure</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                © 2024 VintuSure. All rights reserved.
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Decorative element */}
                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-purple-200 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>
        </div>
    )
} 