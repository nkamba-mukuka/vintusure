import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RAGService, QueryResponse } from '@/lib/services/ragService';
import { useToast } from '@/hooks/use-toast';
import { 
    Shield, 
    Car, 
    Home, 
    Heart, 
    Users, 
    Phone, 
    Mail, 
    MapPin, 
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
    ShieldCheck
} from 'lucide-react';
import vintusureLogo from '@/assets/vintusure-logo.ico';

const Explore: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<QueryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
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

    const insuranceProducts = [
        {
            icon: <Car className="h-8 w-8" />,
            title: 'Auto Insurance',
            description: 'Comprehensive coverage for your vehicle with competitive rates and excellent customer service.',
            features: ['Collision Coverage', 'Liability Protection', 'Roadside Assistance', 'Flexible Payment Plans'],
            coverage: ['Third Party Liability', 'Comprehensive Coverage', 'Personal Injury Protection', 'Uninsured Motorist'],
            benefits: ['24/7 Claims Support', 'Quick Claim Processing', 'Nationwide Coverage', 'Competitive Premiums']
        },
        {
            icon: <Home className="h-8 w-8" />,
            title: 'Home Insurance',
            description: 'Protect your home and belongings with our comprehensive home insurance policies.',
            features: ['Property Coverage', 'Personal Liability', 'Natural Disaster Protection', 'Contents Insurance'],
            coverage: ['Building Coverage', 'Contents Coverage', 'Personal Liability', 'Additional Living Expenses'],
            benefits: ['Natural Disaster Protection', 'Theft Coverage', 'Liability Protection', 'Fast Claims Service']
        },
        {
            icon: <Heart className="h-8 w-8" />,
            title: 'Health Insurance',
            description: 'Quality healthcare coverage for you and your family with extensive network coverage.',
            features: ['Medical Coverage', 'Prescription Drugs', 'Preventive Care', 'Emergency Services'],
            coverage: ['Inpatient Care', 'Outpatient Services', 'Prescription Medications', 'Preventive Care'],
            benefits: ['Extensive Network', 'No Pre-authorization for Emergencies', 'Family Coverage', 'Wellness Programs']
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'Life Insurance',
            description: 'Secure your family\'s future with our life insurance policies and financial planning.',
            features: ['Death Benefit', 'Cash Value', 'Flexible Premiums', 'Family Protection'],
            coverage: ['Term Life Insurance', 'Whole Life Insurance', 'Universal Life Insurance', 'Accidental Death'],
            benefits: ['Financial Security', 'Tax Benefits', 'Flexible Payment Options', 'Family Protection']
        }
    ];

    const agentInfo = {
        name: 'Sarah Johnson',
        phone: '+1 (555) 123-4567',
        email: 'sarah.johnson@vintusure.com',
        location: 'Downtown Business District',
        specialties: ['Auto Insurance', 'Home Insurance', 'Commercial Policies'],
        experience: '15+ years',
        languages: ['English', 'Spanish'],
        availability: 'Mon-Fri 9AM-6PM, Sat 10AM-2PM'
    };

    const faqData = [
        {
            id: 'general',
            title: 'General Insurance Questions',
            items: [
                {
                    question: 'What is insurance and why do I need it?',
                    answer: 'Insurance is a financial product that provides protection against financial losses. It helps you manage risks by transferring the cost of potential losses to an insurance company in exchange for premium payments. You need insurance to protect yourself, your family, and your assets from unexpected events that could cause financial hardship.'
                },
                {
                    question: 'How do I choose the right insurance coverage?',
                    answer: 'Choosing the right insurance coverage depends on your individual needs, lifestyle, and financial situation. Consider factors like your assets, family situation, budget, and risk tolerance. Our agents can help you assess your needs and recommend appropriate coverage levels.'
                },
                {
                    question: 'What factors affect my insurance premium?',
                    answer: 'Several factors can affect your insurance premium, including your age, driving record (for auto insurance), claims history, coverage limits, deductibles, location, and the type of coverage you choose. Maintaining a good record and comparing quotes can help you get better rates.'
                }
            ]
        },
        {
            id: 'auto',
            title: 'Auto Insurance',
            items: [
                {
                    question: 'What does auto insurance cover?',
                    answer: 'Auto insurance typically covers liability for bodily injury and property damage, collision damage to your vehicle, comprehensive coverage for non-collision events (theft, vandalism, natural disasters), and medical payments or personal injury protection. Coverage varies by policy and state requirements.'
                },
                {
                    question: 'How much auto insurance do I need?',
                    answer: 'The amount of auto insurance you need depends on your state\'s minimum requirements, your assets, and your risk tolerance. Most experts recommend carrying more than the minimum required coverage to protect your assets in case of a serious accident.'
                },
                {
                    question: 'What should I do after an accident?',
                    answer: 'After an accident, ensure everyone is safe, call emergency services if needed, exchange information with other parties, document the scene with photos, notify your insurance company promptly, and avoid admitting fault. Keep all documentation for your claim.'
                }
            ]
        },
        {
            id: 'home',
            title: 'Home Insurance',
            items: [
                {
                    question: 'What does home insurance cover?',
                    answer: 'Home insurance typically covers damage to your home and personal property from covered perils like fire, theft, vandalism, and certain natural disasters. It also provides liability protection if someone is injured on your property and covers additional living expenses if your home becomes uninhabitable.'
                },
                {
                    question: 'How much home insurance do I need?',
                    answer: 'You should have enough coverage to rebuild your home and replace your personal property. Consider the replacement cost of your home (not market value), the value of your personal belongings, and your liability exposure. An insurance agent can help you determine appropriate coverage levels.'
                },
                {
                    question: 'What is not covered by home insurance?',
                    answer: 'Home insurance typically doesn\'t cover damage from floods, earthquakes, normal wear and tear, maintenance issues, or intentional damage. You may need separate policies for flood or earthquake coverage. Review your policy carefully to understand exclusions.'
                }
            ]
        },
        {
            id: 'claims',
            title: 'Claims Process',
            items: [
                {
                    question: 'How do I file a claim?',
                    answer: 'To file a claim, contact your insurance company as soon as possible after an incident. Provide details about what happened, document any damage with photos, keep receipts for temporary repairs, and cooperate with the claims adjuster. Your agent can guide you through the process.'
                },
                {
                    question: 'How long does it take to process a claim?',
                    answer: 'Claim processing time varies depending on the complexity of the claim, the type of insurance, and the amount of damage. Simple claims may be processed in a few days, while complex claims may take weeks or months. Your insurance company will provide updates throughout the process.'
                },
                {
                    question: 'What if my claim is denied?',
                    answer: 'If your claim is denied, review the denial letter carefully to understand the reason. You can appeal the decision by providing additional documentation, requesting a review, or filing a complaint with your state\'s insurance department. Consider consulting with an attorney for complex cases.'
                }
            ]
        }
    ];

    const policyOverviews = [
        {
            title: 'Understanding Policy Terms',
            content: 'Insurance policies contain specific terms and conditions that define what is covered, excluded, and required. Key terms include premium (the cost), deductible (what you pay before coverage kicks in), coverage limits (maximum payout), and exclusions (what\'s not covered). Understanding these terms helps you make informed decisions.',
            icon: <FileText className="h-5 w-5" />
        },
        {
            title: 'Premium Payment Options',
            content: 'Most insurance companies offer flexible payment options including monthly, quarterly, semi-annual, and annual payments. Some companies offer discounts for paying annually or setting up automatic payments. Choose the option that best fits your budget and preferences.',
            icon: <DollarSign className="h-5 w-5" />
        },
        {
            title: 'Policy Renewal Process',
            content: 'Insurance policies typically renew automatically unless you cancel or the company chooses not to renew. You\'ll receive renewal notices before your policy expires. Review your coverage annually to ensure it still meets your needs and compare rates from other companies.',
            icon: <Calendar className="h-5 w-5" />
        },
        {
            title: 'Making Changes to Your Policy',
            content: 'You can usually make changes to your policy mid-term, such as adding or removing coverage, changing deductibles, or updating information. Contact your agent or insurance company to discuss changes. Some changes may affect your premium or require additional underwriting.',
            icon: <ShieldCheck className="h-5 w-5" />
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
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Explore Insurance Solutions
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover comprehensive insurance coverage options and get expert guidance from our AI assistant. 
                        Connect with our experienced agents for personalized service.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
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
                    <div className="space-y-6">
                        {/* Agent Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Contact Our Agent</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{agentInfo.name}</h3>
                                    <p className="text-sm text-gray-600">Senior Insurance Agent</p>
                                    <p className="text-xs text-gray-500 mt-1">{agentInfo.experience} Experience</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{agentInfo.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-4 w-4 text-gray-500" />
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
                                            <Mail className="h-4 w-4 mr-2" />
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