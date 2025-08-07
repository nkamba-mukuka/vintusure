import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Shield, Car, Users, FileText, TrendingUp, User, Building2 } from 'lucide-react'
import vintusureLogo from '@/assets/vintusure-logo.ico'

export default function LandingPage() {
    const { user } = useAuthContext()

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F3E2D6' }}>
            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Navigation */}
                <nav className="flex items-center justify-between p-6 lg:px-8">
                    <div className="flex items-center space-x-2">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                        <span className="text-2xl font-bold text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>VintuSure</span>
                    </div>


                    <div className="flex items-center space-x-4">
                        {user ? (
                            <Link to="/dashboard">
                                <Button variant="default" className="bg-gray-800 text-white hover:bg-gray-700" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="bg-gray-800 text-white hover:bg-gray-700" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="default" className="bg-gray-800 text-white hover:bg-gray-700" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                            AI-Powered Insurance Intelligence
                        </h1>
                        <p className="text-xl md:text-2xl mb-12 text-gray-700 max-w-2xl mx-auto">
                            VintuSure is an AI-powered online platform that provides advanced RAG (Retrieval-Augmented Generation)
                            services to insurance companies, enhancing their knowledge management and customer support capabilities.
                        </p>


                        {/* Main Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                            {/* I'm an Agent Button */}
                            {user ? (
                                <Link to="/dashboard">
                                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                        <Building2 className="h-6 w-6" />
                                        <span style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>Go to Dashboard</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/login">
                                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                        <Building2 className="h-6 w-6" />
                                        <span style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>I'm an Agent</span>
                                    </Button>
                                </Link>
                            )}


                            {/* I'm a Customer Button */}
                            <Link to="/explore">
                                <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 bg-white/80 backdrop-blur-sm" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                    <User className="h-6 w-6" />
                                    <span style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>I'm a Customer</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-16 px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                            Why Choose VintuSure for Your Insurance Business?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300">
                                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-800" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>Advanced RAG Technology</h3>
                                    <p className="text-gray-700" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.2)' }}>
                                        State-of-the-art Retrieval-Augmented Generation for intelligent document processing and knowledge retrieval.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="rounded-lg p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#E9E1F5', boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                    <Car className="h-12 w-12 mx-auto mb-4 text-gray-800" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>Multi-Insurance Support</h3>
                                    <p className="text-gray-700" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.2)' }}>
                                        Comprehensive platform supporting various insurance types and company needs.
                                    </p>
                                </div>
                            </div>


                            <div className="text-center">
                                <div className="rounded-lg p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#E9E1F5', boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-800" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>AI-Powered Assistance</h3>
                                    <p className="text-gray-700" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.2)' }}>
                                        Intelligent AI assistance for enhanced customer service and operational efficiency.
                                    </p>
                                </div>
                            </div>


                            <div className="text-center">
                                <div className="rounded-lg p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#E9E1F5', boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-800" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>Scalable Solutions</h3>
                                    <p className="text-gray-700" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.2)' }}>
                                        Flexible and scalable platform that grows with your insurance business needs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 px-6 lg:px-8 border-t border-gray-300 bg-white/80 backdrop-blur-sm" style={{ boxShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <img src={vintusureLogo} alt="VintuSure Logo" className="h-6 w-6" />
                            <span className="text-lg font-semibold text-gray-800" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.3)' }}>VintuSure</span>
                        </div>
                        <div className="text-gray-600 text-sm" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.2)' }}>
                            © 2024 VintuSure. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
} 