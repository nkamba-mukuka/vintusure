import { Link } from "react-router-dom"
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Shield, Car, TrendingUp, User, Building2, Brain } from 'lucide-react'
import vintusureLogo from '@/assets/vintusure-logo.ico'
import SEO, { createOrganizationSchema, createWebPageSchema, createSoftwareApplicationSchema } from '@/components/SEO'

export default function LandingPage() {
    const { user } = useAuthContext()

    // Structured data for better SEO
    const organizationSchema = createOrganizationSchema()
    const webPageSchema = createWebPageSchema(
        "VintuSure - AI-Powered Insurance Intelligence Platform",
        "Advanced RAG technology for insurance companies in Zambia. Enhance your knowledge management and customer support with AI-powered solutions.",
        "/"
    )
    const softwareApplicationSchema = createSoftwareApplicationSchema()

    // Combine all structured data
    const combinedStructuredData = {
        "@context": "https://schema.org",
        "@graph": [organizationSchema, webPageSchema, softwareApplicationSchema]
    }

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="AI-Powered Insurance Intelligence Platform"
                description="VintuSure provides advanced RAG (Retrieval-Augmented Generation) services to insurance companies in Zambia, enhancing knowledge management and customer support capabilities with cutting-edge AI technology."
                keywords="AI insurance platform, insurance technology Zambia, RAG insurance, artificial intelligence insurance, customer support automation, insurance knowledge management, insurtech Zambia, insurance AI assistant, document processing insurance, insurance chatbot"
                url="/"
                type="website"
                structuredData={combinedStructuredData}
                image="/images/vintusure-hero-image.png"
            />
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
                <nav 
                    className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
                    role="navigation"
                    aria-label="Main navigation"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Skip to main content link for screen readers */}
                            <a 
                                href="#main-content"
                                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
                            >
                                Skip to main content
                            </a>
                            
                            <div className="flex items-center space-x-2">
                                <img 
                                    src={vintusureLogo} 
                                    alt="VintuSure company logo" 
                                    className="h-8 w-8"
                                    role="img"
                                />
                                <span 
                                    className="text-2xl font-bold text-primary"
                                    aria-label="VintuSure brand name"
                                >
                                    VintuSure
                                </span>
                            </div>
                            <div className="flex gap-4" role="group" aria-label="User actions">
                                {user ? (
                                    <Button 
                                        variant="purple" 
                                        asChild
                                        aria-label="Go to user dashboard"
                                    >
                                        <Link to="/dashboard">Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button 
                                            variant="ghost" 
                                            asChild
                                            aria-label="Sign in to your account"
                                        >
                                            <Link to="/login">Sign In</Link>
                                        </Button>
                                        <Button 
                                            variant="purple" 
                                            asChild
                                            aria-label="Create a new account"
                                        >
                                            <Link to="/signup">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main 
                    id="main-content"
                    className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-56"
                    role="main"
                >
                    <div className="text-center">
                        <h1 
                            className="text-4xl font-bold tracking-tight text-primary sm:text-6xl animate-fade-in"
                            role="heading"
                            aria-level={1}
                        >
                            AI-Powered Insurance Intelligence
                        </h1>
                        <p 
                            className="mt-6 text-lg leading-8 text-muted-foreground animate-slide-in-from-bottom"
                            role="text"
                            aria-describedby="hero-description"
                        >
                            VintuSure is an AI-powered online platform that provides advanced RAG (Retrieval-Augmented Generation)
                            services to insurance companies, enhancing their knowledge management and customer support capabilities.
                        </p>
                        <div 
                            className="mt-10 flex items-center justify-center gap-x-6 animate-bounce-in"
                            role="group"
                            aria-label="Get started options"
                        >
                            {user ? (
                                <Button 
                                    variant="purple" 
                                    size="lg" 
                                    asChild 
                                    className="btn-primary group"
                                    aria-label="Access your VintuSure dashboard"
                                >
                                    <Link to="/dashboard" className="flex items-center gap-2">
                                        <Building2 
                                            className="h-5 w-5 transition-transform group-hover:scale-110" 
                                            aria-hidden="true" 
                                        />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        variant="purple" 
                                        size="lg" 
                                        asChild 
                                        className="btn-primary group"
                                        aria-label="Sign in as an insurance agent"
                                    >
                                        <Link to="/login" className="flex items-center gap-2">
                                            <Building2 
                                                className="h-5 w-5 transition-transform group-hover:scale-110" 
                                                aria-hidden="true" 
                                            />
                                            I'm an Agent
                                        </Link>
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        asChild 
                                        className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                        aria-label="Explore VintuSure as a customer"
                                    >
                                        <Link to="/explore" className="flex items-center gap-2">
                                            <User 
                                                className="h-5 w-5 transition-transform group-hover:scale-110" 
                                                aria-hidden="true" 
                                            />
                                            I'm a Customer
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section 
                    className="mx-auto max-w-7xl px-6 lg:px-8 py-24"
                    role="region"
                    aria-labelledby="features-heading"
                >
                    <h2 
                        id="features-heading"
                        className="text-3xl font-bold text-center mb-12 text-primary"
                        role="heading"
                        aria-level={2}
                    >
                        Why Choose VintuSure for Your Insurance Business?
                    </h2>
                    <div 
                        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                        role="list"
                        aria-label="VintuSure platform features"
                    >
                        {/* Feature 1 */}
                        <div 
                            className="rounded-xl border bg-card p-6 hover-card-effect animate-slide-in-stagger"
                            role="listitem"
                            tabIndex={0}
                            aria-describedby="feature-1-desc"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div 
                                    className="bg-gradient-to-br from-primary/10 to-purple-100 p-3 rounded-full mb-4 transition-transform duration-300 hover:scale-110"
                                    aria-hidden="true"
                                >
                                    <Shield className="h-12 w-12 text-primary" />
                                </div>
                                <h3 
                                    className="text-xl font-semibold text-primary mb-3"
                                    role="heading"
                                    aria-level={3}
                                >
                                    Advanced RAG Technology
                                </h3>
                                <p 
                                    id="feature-1-desc"
                                    className="text-muted-foreground leading-relaxed"
                                >
                                    State-of-the-art Retrieval-Augmented Generation for intelligent document processing and knowledge retrieval.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div 
                            className="rounded-xl border bg-card p-6 hover-card-effect animate-slide-in-stagger"
                            role="listitem"
                            tabIndex={0}
                            aria-describedby="feature-2-desc"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div 
                                    className="bg-gradient-to-br from-primary/10 to-purple-100 p-3 rounded-full mb-4 transition-transform duration-300 hover:scale-110"
                                    aria-hidden="true"
                                >
                                    <Car className="h-12 w-12 text-primary" />
                                </div>
                                <h3 
                                    className="text-xl font-semibold text-primary mb-3"
                                    role="heading"
                                    aria-level={3}
                                >
                                    Multi-Insurance Support
                                </h3>
                                <p 
                                    id="feature-2-desc"
                                    className="text-muted-foreground leading-relaxed"
                                >
                                    Comprehensive platform supporting various insurance types and company needs.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div 
                            className="rounded-xl border bg-card p-6 hover-card-effect animate-slide-in-stagger"
                            role="listitem"
                            tabIndex={0}
                            aria-describedby="feature-3-desc"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div 
                                    className="bg-gradient-to-br from-primary/10 to-purple-100 p-3 rounded-full mb-4 transition-transform duration-300 hover:scale-110"
                                    aria-hidden="true"
                                >
                                    <Brain className="h-12 w-12 text-primary" />
                                </div>
                                <h3 
                                    className="text-xl font-semibold text-primary mb-3"
                                    role="heading"
                                    aria-level={3}
                                >
                                    AI-Powered Assistance
                                </h3>
                                <p 
                                    id="feature-3-desc"
                                    className="text-muted-foreground leading-relaxed"
                                >
                                    Intelligent AI assistance for enhanced customer service and operational efficiency.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div 
                            className="rounded-xl border bg-card p-6 hover-card-effect animate-slide-in-stagger"
                            role="listitem"
                            tabIndex={0}
                            aria-describedby="feature-4-desc"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div 
                                    className="bg-gradient-to-br from-primary/10 to-purple-100 p-3 rounded-full mb-4 transition-transform duration-300 hover:scale-110"
                                    aria-hidden="true"
                                >
                                    <TrendingUp className="h-12 w-12 text-primary" />
                                </div>
                                <h3 
                                    className="text-xl font-semibold text-primary mb-3"
                                    role="heading"
                                    aria-level={3}
                                >
                                    Scalable Solutions
                                </h3>
                                <p 
                                    id="feature-4-desc"
                                    className="text-muted-foreground leading-relaxed"
                                >
                                    Flexible and scalable platform that grows with your insurance business needs.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer 
                    className="border-t border-border bg-background/80 backdrop-blur-sm py-8"
                    role="contentinfo"
                    aria-label="Site footer"
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div 
                                className="flex items-center space-x-2 mb-4 md:mb-0"
                                role="group"
                                aria-label="VintuSure branding"
                            >
                                <img 
                                    src={vintusureLogo} 
                                    alt="VintuSure company logo" 
                                    className="h-6 w-6"
                                    role="img"
                                />
                                <span 
                                    className="text-lg font-semibold text-primary"
                                    aria-label="VintuSure company name"
                                >
                                    VintuSure
                                </span>
                            </div>
                            <div 
                                className="text-sm text-muted-foreground"
                                role="text"
                                aria-label="Copyright information"
                            >
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