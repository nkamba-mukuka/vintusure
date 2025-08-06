import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RAGService, QueryResponse } from '@/lib/services/ragService';
import { carAnalysisService, type CarAnalysisResult, type CarDetails, type InsuranceRecommendation, type MarketplaceListing, type Marketplace } from '@/lib/services/carAnalysisService';
import { premiumService } from '@/lib/services/premiumService';
import { useToast } from '@/hooks/use-toast';
import {
    Car,
    MessageCircle,
    ArrowLeft,
    Search,
    FileText,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Calculator,
    Clock,
    CheckCircle,
    AlertCircle,
    Info,
    Calendar,
    DollarSign,
    ShieldCheck,
    Upload,
    Image,
    ExternalLink,
    Shield
} from 'lucide-react';
import vintusureLogo from '@/assets/vintusure-logo.ico';

const Explore: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<QueryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
    const [carAnalysis, setCarAnalysis] = useState<CarAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleAskQuestion = async () => {
        if (!query.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a question',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Ensure no sensitive data is accessed by using anonymous user
            const result = await RAGService.askQuestion(query, 'anonymous');
            setResponse(result);

            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Response generated successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to get response',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error asking question:', error);
            toast({
                title: 'Error',
                description: 'Failed to communicate with AI assistant',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        await processCarPhoto(file);
    };

    const processCarPhoto = async (file: File) => {
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Error',
                description: 'Please upload an image file (JPEG, PNG, etc.)',
                variant: 'destructive',
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'Image size should be less than 5MB',
                variant: 'destructive',
            });
            return;
        }

        setIsAnalyzing(true);
        try {
            console.log('Starting car photo analysis...', {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            const base64 = await carAnalysisService.fileToBase64(file);
            console.log('Converted image to base64', {
                base64Length: base64.length,
                firstChars: base64.substring(0, 50) + '...'
            });

            try {
                const result = await carAnalysisService.analyzeCarPhoto({ photoBase64: base64 });
                console.log('Analysis result:', {
                    hasResult: !!result,
                    carDetails: result?.carDetails ? {
                        hasMake: !!result.carDetails.make,
                        hasModel: !!result.carDetails.model,
                        hasYear: !!result.carDetails.estimatedYear,
                    } : null,
                    insuranceRecommendation: result?.insuranceRecommendation ? {
                        hasCoverage: !!result.insuranceRecommendation.recommendedCoverage,
                        hasPremium: !!result.insuranceRecommendation.estimatedPremium,
                    } : null,
                    marketplaceRecommendations: result?.marketplaceRecommendations ? {
                        listingsCount: result.marketplaceRecommendations.similarListings?.length,
                        marketplacesCount: result.marketplaceRecommendations.marketplaces?.length,
                    } : null
                });

                setCarAnalysis(result);
                toast({
                    title: 'Success',
                    description: 'Car photo analyzed successfully',
                });
            } catch (err) {
                const error = err as Error & { code?: string; details?: unknown };
                console.error('Error from car analysis service:', {
                    error,
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    stack: error.stack,
                });

                let errorMessage = 'Failed to analyze car photo';

                console.log('Error instance details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    isCarAnalysisError: error.name === 'CarAnalysisError',
                    additionalProps: Object.keys(error),
                });

                if (error.message.includes('CORS')) {
                    errorMessage = 'Server connection error. Please try again.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Analysis took too long. Please try with a smaller image.';
                } else if (error.message.includes('permission')) {
                    errorMessage = 'Permission denied. Please check your connection.';
                } else if (error.message.includes('not-found')) {
                    errorMessage = 'AI service not available. Please try again later.';
                } else if (error.message.includes('invalid-argument')) {
                    errorMessage = 'Invalid image format. Please try a different image.';
                } else if (error.message.includes('unauthenticated')) {
                    errorMessage = 'Please sign in to use this feature.';
                }

                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
            }
        } catch (err) {
            const error = err as Error;
            console.error('Error in image processing:', {
                error,
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            toast({
                title: 'Error',
                description: 'Failed to process image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCarPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processCarPhoto(file);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const insuranceProducts = [
        {
            icon: <Car className="h-8 w-8" />,
            title: 'Motor Insurance',
            description: 'Comprehensive coverage for your vehicle with competitive rates. Get instant AI-powered car valuation and insurance recommendations.',
            features: [
                'Comprehensive Coverage',
                'Third Party Liability',
                'AI-Powered Car Valuation',
                'Instant Premium Calculation'
            ],
            coverage: [
                'Accident Coverage',
                'Theft Protection',
                'Third Party Damage',
                'Natural Disasters'
            ],
            benefits: [
                '24/7 Claims Support',
                'Quick Claim Processing',
                'Nationwide Coverage',
                'Competitive Premiums'
            ]
        }
    ];

    const agentInfo = {
        name: 'Sarah Johnson',
        phone: '+260 97 1234567',
        email: 'sarah.johnson@vintusure.com',
        location: 'Lusaka, Zambia',
        specialties: ['Motor Insurance', 'Fleet Coverage', 'Commercial Vehicles'],
        experience: '15+ years',
        languages: ['English', 'Nyanja', 'Bemba'],
        availability: 'Mon-Fri 8AM-5PM, Sat 9AM-1PM'
    };

    const faqData = [
        {
            id: 'motor',
            title: 'Motor Insurance FAQ',
            items: [
                {
                    question: 'What types of motor insurance do you offer?',
                    answer: 'We offer two main types of motor insurance: Comprehensive Coverage and Third Party Insurance. Comprehensive covers both your vehicle and third-party damages, while Third Party covers only damages to other vehicles or property.'
                },
                {
                    question: 'How is my premium calculated?',
                    answer: 'Your premium is calculated based on several factors including your vehicle\'s value, make and model, age, usage type (personal or commercial), and your driving history. Our AI system helps provide accurate vehicle valuations for better premium estimates.'
                },
                {
                    question: 'What should I do after a car accident?',
                    answer: 'After ensuring everyone\'s safety: 1) Document the scene with photos, 2) Exchange information with other parties, 3) Contact our 24/7 claims service, 4) Don\'t admit fault, and 5) Keep all documentation for your claim.'
                },
                {
                    question: 'How do I make a claim?',
                    answer: 'You can initiate a claim through our 24/7 hotline or online platform. Have your policy number, incident details, and any supporting documentation (photos, police report) ready. Our team will guide you through the process.'
                }
            ]
        }
    ];

    const policyOverviews = [
        {
            title: 'Understanding Motor Insurance',
            content: 'Motor insurance provides financial protection against vehicle damage, theft, and third-party liability. Our AI-powered system helps you choose the right coverage based on your vehicle\'s actual market value and your specific needs.',
            icon: <Car className="h-5 w-5" />
        },
        {
            title: 'Premium Calculation',
            content: 'We use advanced AI technology to accurately value your vehicle and calculate fair premiums. Factors include vehicle make/model, year, condition, and market value in Zambia.',
            icon: <Calculator className="h-5 w-5" />
        },
        {
            title: 'Claims Process',
            content: 'Our streamlined claims process ensures quick resolution. Document the incident, submit through our platform, and track your claim status in real-time.',
            icon: <FileText className="h-5 w-5" />
        },
        {
            title: 'Vehicle Security Tips',
            content: 'Protect your vehicle and potentially reduce premiums with security measures like tracking devices, immobilizers, and safe parking practices.',
            icon: <Shield className="h-5 w-5" />
        }
    ];

    const handleQuickLink = (action: string) => {
        switch (action) {
            case 'faq':
                // Scroll to FAQ section
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'claims':
                // Show claims process info
                toast({
                    title: 'Claims Process',
                    description: 'Contact our agent for personalized claims assistance. We\'re here to help you through every step.',
                });
                break;
            case 'quote':
                // Show quote information
                toast({
                    title: 'Get a Quote',
                    description: 'Contact our agent for a personalized quote. We\'ll assess your needs and provide competitive rates.',
                });
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <Link to="/" className="flex items-center space-x-2">
                                <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                                <span className="text-xl font-bold text-gray-800">VintuSure</span>
                            </Link>
                        </div>
                        <Link to="/">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back to Home</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Hero Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Smart Motor Insurance Solutions
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        Upload your car photo for instant AI-powered valuation, insurance recommendations, and market insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Car Analysis Section */}
                        <section>
                            <Card className="overflow-hidden">
                                <CardHeader className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                        <CardTitle className="text-lg sm:text-xl">Car Photo Analysis & Insurance Estimate</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm sm:text-base">
                                        Upload a photo of a car to get AI-powered analysis, insurance recommendations, and find similar cars in the Zambian market.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6">
                                    {/* Upload Section */}
                                    <div
                                        ref={dropZoneRef}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${isDragging
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleCarPhotoUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                                <Image className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold">Upload Car Photo</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {isDragging ? 'Drop your image here' : 'Drag and drop or click to browse'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Maximum file size: 5MB
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleBrowseClick}
                                                disabled={isAnalyzing}
                                                className="w-full sm:w-auto"
                                            >
                                                {isAnalyzing ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Analyzing...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <Upload className="h-4 w-4" />
                                                        <span>Browse Files</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Analysis Results */}
                                    {carAnalysis && (
                                        <div className="space-y-4 sm:space-y-6">
                                            {/* Car Details */}
                                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-semibold mb-2 sm:mb-3">Car Details</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Make & Model</p>
                                                        <p className="font-medium">{carAnalysis.carDetails.make} {carAnalysis.carDetails.model}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Estimated Year</p>
                                                        <p className="font-medium">{carAnalysis.carDetails.estimatedYear}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Body Type</p>
                                                        <p className="font-medium">{carAnalysis.carDetails.bodyType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Condition</p>
                                                        <p className="font-medium">{carAnalysis.carDetails.condition}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Estimated Value</p>
                                                        <p className="font-medium">{premiumService.formatCurrency(carAnalysis.carDetails.estimatedValue)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Insurance Recommendation */}
                                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                                                <h3 className="font-semibold mb-2 sm:mb-3">Insurance Recommendation</h3>
                                                <div className="space-y-2 sm:space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Recommended Coverage</p>
                                                        <p className="font-medium">{carAnalysis.insuranceRecommendation.recommendedCoverage}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Estimated Premium</p>
                                                        <p className="font-medium">{premiumService.formatCurrency(carAnalysis.insuranceRecommendation.estimatedPremium)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Coverage Details</p>
                                                        <p className="text-sm">{carAnalysis.insuranceRecommendation.coverageDetails}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Marketplace Recommendations */}
                                            <div>
                                                <h3 className="font-semibold mb-2 sm:mb-3">Similar Cars in the Market</h3>
                                                <div className="space-y-3 sm:space-y-4">
                                                    {carAnalysis.marketplaceRecommendations.similarListings.map((listing, index) => (
                                                        <Card key={index}>
                                                            <CardContent className="p-3 sm:p-4">
                                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                                                    <div>
                                                                        <h4 className="font-medium">{listing.description}</h4>
                                                                        <p className="text-sm text-gray-500">{listing.platform}</p>
                                                                        <p className="font-medium text-blue-600">{premiumService.formatCurrency(listing.price)}</p>
                                                                    </div>
                                                                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                                                                        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-1">
                                                                            <span>View</span>
                                                                            <ExternalLink className="h-3 w-3" />
                                                                        </a>
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>

                                                <div className="mt-4">
                                                    <h3 className="font-semibold mb-2 sm:mb-3">Recommended Marketplaces</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {carAnalysis.marketplaceRecommendations.marketplaces.map((marketplace, index) => (
                                                            <Card key={index}>
                                                                <CardContent className="p-3 sm:p-4">
                                                                    <h4 className="font-medium">{marketplace.name}</h4>
                                                                    <p className="text-sm text-gray-500 mb-2">{marketplace.description}</p>
                                                                    <Button variant="outline" size="sm" asChild className="w-full">
                                                                        <a href={marketplace.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-1">
                                                                            <span>Visit Site</span>
                                                                            <ExternalLink className="h-3 w-3" />
                                                                        </a>
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Insurance Products */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Insurance Products</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {insuranceProducts.map((product, index) => (
                                    <Card key={index} className="hover:shadow-lg transition-all duration-300">
                                        <CardHeader>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-blue-600">
                                                    {product.icon}
                                                </div>
                                                <CardTitle className="text-xl">{product.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-gray-600 mb-4">
                                                {product.description}
                                            </CardDescription>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h4>
                                                    <div className="space-y-1">
                                                        {product.features.map((feature, featureIndex) => (
                                                            <div key={featureIndex} className="flex items-center space-x-2">
                                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                                <span className="text-sm text-gray-700">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Coverage Includes:</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.coverage.map((item, itemIndex) => (
                                                            <Badge key={itemIndex} variant="secondary" className="text-xs">
                                                                {item}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Policy Overviews */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">Understanding Insurance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {policyOverviews.map((overview, index) => (
                                    <Card key={index} className="hover:shadow-lg transition-all duration-300">
                                        <CardHeader>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-blue-600">
                                                    {overview.icon}
                                                </div>
                                                <CardTitle className="text-lg">{overview.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-gray-600">
                                                {overview.content}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* AI Assistant */}
                        <section>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <MessageCircle className="h-6 w-6 text-blue-600" />
                                        <CardTitle>AI Insurance Assistant</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Ask questions about our insurance products, coverage options, or general insurance information.
                                        Our AI assistant provides general guidance only and cannot access personal data.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Ask about our insurance products, coverage options, or any insurance-related questions..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button
                                            onClick={handleAskQuestion}
                                            disabled={isLoading}
                                            className="w-full"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Search className="h-4 w-4" />
                                                    <span>Ask Question</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>

                                    {response && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-semibold mb-2 text-gray-800">AI Response:</h4>
                                            <p className="text-gray-700">{response.answer}</p>
                                            <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                                <div className="flex items-center space-x-2">
                                                    <Info className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-blue-800">
                                                        This is general information only. For personalized advice, please contact our agent.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq-section">
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqData.map((category) => (
                                    <Card key={category.id}>
                                        <CardHeader>
                                            <CardTitle className="text-xl">{category.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {category.items.map((item, index) => (
                                                    <Collapsible
                                                        key={index}
                                                        open={activeFAQ === `${category.id}-${index}`}
                                                        onOpenChange={() => setActiveFAQ(
                                                            activeFAQ === `${category.id}-${index}`
                                                                ? null
                                                                : `${category.id}-${index}`
                                                        )}
                                                    >
                                                        <CollapsibleTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-between p-4 h-auto"
                                                            >
                                                                <span className="text-left font-medium">{item.question}</span>
                                                                {activeFAQ === `${category.id}-${index}` ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="px-4 pb-4">
                                                            <p className="text-gray-600">{item.answer}</p>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Agent Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                    <Shield className="h-5 w-5" />
                                    <span>Contact Our Agent</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-base sm:text-lg">{agentInfo.name}</h3>
                                    <p className="text-sm text-gray-600">Senior Insurance Agent</p>
                                    <p className="text-xs text-gray-500 mt-1">{agentInfo.experience} Experience</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Shield className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.availability}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <h4 className="font-medium mb-2">Specialties:</h4>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {agentInfo.specialties.map((specialty, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {specialty}
                                            </Badge>
                                        ))}
                                    </div>
                                    <h4 className="font-medium mb-2">Languages:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {agentInfo.languages.map((language, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {language}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <Button className="w-full" asChild>
                                        <a href={`mailto:${agentInfo.email}?subject=Insurance Inquiry`}>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Send Email
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Quick Links</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleQuickLink('faq')}
                                >
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    FAQ
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleQuickLink('claims')}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Claims Process
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleQuickLink('quote')}
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Get Quote
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Security Notice */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-blue-800">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>Security Notice</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-blue-700">
                                    <p>This is a public information platform. No sensitive personal data is accessible here.</p>
                                    <p>For personalized service and policy management, please contact our agent or log into your secure account.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore; 