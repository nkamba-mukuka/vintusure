import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    Shield,
    Users,
    Bot
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

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Error',
                description: 'Please upload an image file (JPEG, PNG, etc.)',
                variant: 'destructive',
            });
            return;
        }

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
            const base64 = await carAnalysisService.fileToBase64(file);
            const result = await carAnalysisService.analyzeCarPhoto({ photoBase64: base64 });
            setCarAnalysis(result);
            toast({
                title: 'Success',
                description: 'Car photo analyzed successfully',
            });
        } catch (error) {
            console.error('Error analyzing car photo:', error);
            toast({
                title: 'Error',
                description: 'Failed to analyze car photo. Please try again.',
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

    const agents = [
        {
            name: 'Sarah Johnson',
            company: 'VintuSure Insurance Partners',
            phone: '+260 97 1234567',
            email: 'sarah.johnson@vintusure.com',
            location: 'Lusaka, Zambia',
            specialties: ['Motor Insurance', 'Fleet Coverage', 'Commercial Vehicles'],
            experience: '15+ years',
            languages: ['English', 'Nyanja', 'Bemba'],
            availability: 'Mon-Fri 8AM-5PM, Sat 9AM-1PM'
        },
        {
            name: 'Michael Banda',
            company: 'VintuSure Insurance Partners',
            phone: '+260 96 9876543',
            email: 'michael.banda@vintusure.com',
            location: 'Kitwe, Zambia',
            specialties: ['Personal Insurance', 'Business Insurance', 'Life Insurance'],
            experience: '12+ years',
            languages: ['English', 'Bemba', 'Tonga'],
            availability: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM'
        },
        {
            name: 'Grace Mwale',
            company: 'VintuSure Insurance Partners',
            phone: '+260 95 4567890',
            email: 'grace.mwale@vintusure.com',
            location: 'Ndola, Zambia',
            specialties: ['Health Insurance', 'Travel Insurance', 'Property Insurance'],
            experience: '10+ years',
            languages: ['English', 'Nyanja', 'Bemba'],
            availability: 'Mon-Fri 9AM-5PM, Sat 10AM-1PM'
        }
    ];

    const faqData = [
        {
            id: 'vintusure',
            title: 'About VintuSure Platform',
            items: [
                {
                    question: 'What is VintuSure and how does it help insurance agents?',
                    answer: 'VintuSure is an AI-enabled SaaS platform designed to assist insurance agents in providing better service to their clients. Our platform offers AI-powered car valuation, insurance recommendations, market analysis, and automated document processing to streamline insurance operations.'
                },
                {
                    question: 'How does the AI car analysis feature work?',
                    answer: 'Our AI analyzes uploaded car photos to identify make, model, year, and condition. It then provides accurate vehicle valuations, insurance recommendations, and finds similar vehicles in the market. This helps agents provide more accurate quotes and better serve their clients.'
                },
                {
                    question: 'What types of insurance can VintuSure help with?',
                    answer: 'VintuSure currently specializes in motor insurance but our platform is designed to expand to other insurance types. We provide comprehensive coverage options, third-party liability, and AI-powered premium calculations based on accurate vehicle valuations.'
                },
                {
                    question: 'How secure is the VintuSure platform?',
                    answer: 'VintuSure prioritizes data security and privacy. We use industry-standard encryption, secure cloud infrastructure, and follow strict data protection protocols. No sensitive personal data is stored or processed without proper authorization.'
                },
                {
                    question: 'Can I integrate VintuSure with my existing insurance systems?',
                    answer: 'Yes, VintuSure is designed to integrate with existing insurance management systems. Our API allows seamless data exchange and workflow integration to enhance your current processes without disruption.'
                },
                {
                    question: 'What support does VintuSure provide to insurance agents?',
                    answer: 'We provide comprehensive support including AI-powered tools, training resources, technical support, and access to our network of insurance professionals. Our platform is designed to make insurance agents more efficient and provide better service to clients.'
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

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <Link to="/" className="flex items-center space-x-2">
                                <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                                <span className="text-xl font-bold text-primary">VintuSure</span>
                            </Link>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center space-x-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="purple" className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        Ask VintuSure AI
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Bot className="h-5 w-5" />
                                            Ask VintuSure AI
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">Upload Car Photo for Analysis</h3>
                                            <div
                                                ref={dropZoneRef}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDragOver={handleDragOver}
                                                onDrop={handleDrop}
                                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
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
                                                <div className="space-y-4">
                                                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                                        <Image className="h-8 w-8 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">Upload Car Photo</h3>
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
                                        </div>

                                        {/* Analysis Results */}
                                        {carAnalysis && (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h3 className="font-semibold mb-3">Car Details</h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Make & Model</p>
                                                            <p className="font-medium">{carAnalysis.carDetails.make} {carAnalysis.carDetails.model}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Estimated Year</p>
                                                            <p className="font-medium">{carAnalysis.carDetails.estimatedYear}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Estimated Value</p>
                                                            <p className="font-medium">{premiumService.formatCurrency(carAnalysis.carDetails.estimatedValue)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <h3 className="font-semibold mb-3">Insurance Recommendation</h3>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Recommended Coverage</p>
                                                            <p className="font-medium">{carAnalysis.insuranceRecommendation.recommendedCoverage}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Estimated Premium</p>
                                                            <p className="font-medium">{premiumService.formatCurrency(carAnalysis.insuranceRecommendation.estimatedPremium)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/5 hover:text-primary">
                                        <Users className="h-4 w-4" />
                                        Agents
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Insurance Agents
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {agents.map((agent, index) => (
                                            <Card key={index}>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                                                    <CardDescription className="font-medium text-blue-600">
                                                        {agent.company}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{agent.phone}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{agent.email}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{agent.location}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{agent.availability}</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium mb-2">Specialties:</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {agent.specialties.map((specialty, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {specialty}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Button className="w-full" asChild>
                                                        <a href={`mailto:${agent.email}?subject=Insurance Inquiry`}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Contact Agent
                                                        </a>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Link to="/">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-primary/5 hover:text-primary"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Home</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Hero Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 text-primary">
                        AI-Powered Insurance Solutions
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                        VintuSure helps insurance agents provide better service with AI-powered car analysis,
                        accurate valuations, and intelligent insurance recommendations.
                    </p>
                </div>

                {/* AI Assistant Section */}
                <section className="mb-8">
                    <Card className="hover-card-effect">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Bot className="h-6 w-6 text-primary" />
                                <CardTitle>VintuSure AI Assistant</CardTitle>
                            </div>
                            <CardDescription>
                                Ask questions about insurance products, coverage options, or general insurance information.
                                Our AI assistant provides guidance to help insurance agents serve their clients better.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Ask about insurance products, coverage options, or any insurance-related questions..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <Button
                                    onClick={handleAskQuestion}
                                    disabled={isLoading}
                                    className="w-full"
                                    variant="purple"
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
                                <div className="mt-6 p-4 bg-card rounded-lg max-h-64 overflow-y-auto border">
                                    <h4 className="font-semibold mb-2 text-primary">AI Response:</h4>
                                    <p className="text-muted-foreground">{response.answer}</p>
                                    <div className="mt-3 p-2 bg-primary/5 rounded border-l-4 border-primary">
                                        <div className="flex items-center space-x-2">
                                            <Info className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-primary">
                                                This is general information only. For personalized advice, please contact our agents.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Insurance Products */}
                <section className="mb-8">
                    <h2 className="text-3xl font-bold mb-6 text-primary">Insurance Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insuranceProducts.map((product, index) => (
                            <Card key={index} className="hover-card-effect">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-primary">
                                            {product.icon}
                                        </div>
                                        <CardTitle className="text-xl">{product.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-muted-foreground mb-4">
                                        {product.description}
                                    </CardDescription>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-sm text-primary mb-2">Key Features:</h4>
                                            <div className="space-y-1">
                                                {product.features.map((feature, featureIndex) => (
                                                    <div key={featureIndex} className="flex items-center space-x-2">
                                                        <CheckCircle className="h-3 w-3 text-primary" />
                                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-primary mb-2">Coverage Includes:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {product.coverage.map((item, itemIndex) => (
                                                    <Badge key={itemIndex} variant="secondary" className="text-xs hover:bg-primary/5">
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
                <section className="mb-8">
                    <h2 className="text-3xl font-bold mb-6 text-primary">Understanding Insurance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {policyOverviews.map((overview, index) => (
                            <Card key={index} className="hover-card-effect">
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-primary">
                                            {overview.icon}
                                        </div>
                                        <CardTitle className="text-lg">{overview.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-muted-foreground">
                                        {overview.content}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq-section">
                    <h2 className="text-3xl font-bold mb-6 text-primary">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqData.map((category) => (
                            <Card key={category.id} className="hover-card-effect">
                                <CardHeader>
                                    <CardTitle className="text-xl text-primary">{category.title}</CardTitle>
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
                                                        className="w-full justify-between p-4 h-auto hover:bg-primary/5 hover:text-primary"
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
                                                    <p className="text-muted-foreground">{item.answer}</p>
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
        </div>
    );
};

export default Explore; 