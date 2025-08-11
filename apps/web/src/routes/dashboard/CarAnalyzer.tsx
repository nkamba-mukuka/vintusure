import CarPhotoAnalyzer from '@/components/car/CarPhotoAnalyzer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Shield, TrendingUp, Camera } from 'lucide-react';

export default function CarAnalyzerPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Car Photo Analyzer</h1>
                            <p className="text-muted-foreground">
                                AI-powered vehicle analysis for insurance assessment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid gap-6 mb-8 md:grid-cols-3">
                    <Card className="hover-card-effect">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Photo Analysis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Upload a car photo and our AI will automatically detect make, model, year, and condition.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover-card-effect">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Insurance Insights</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Get detailed insurance recommendations and estimated premiums based on vehicle analysis.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover-card-effect">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Market Data</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Access current market values and similar vehicle listings in the Zambian market.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Analyzer Component */}
                <Card className="purple-card-effect">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            Vehicle Analysis Tool
                        </CardTitle>
                        <CardDescription>
                            Upload a clear photo of the vehicle for comprehensive analysis. Our AI will provide detailed information about the car, insurance recommendations, and market insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CarPhotoAnalyzer
                            onAnalysisComplete={(result) => {
                                console.log('Analysis complete:', result);
                            }}
                            onAnalysisError={(error) => {
                                console.error('Analysis error:', error);
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">How It Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">1</Badge>
                                    <div>
                                        <p className="font-medium">Upload Photo</p>
                                        <p className="text-sm text-muted-foreground">Take or upload a clear photo of the vehicle</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">2</Badge>
                                    <div>
                                        <p className="font-medium">AI Analysis</p>
                                        <p className="text-sm text-muted-foreground">Our AI analyzes the image and extracts vehicle details</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">3</Badge>
                                    <div>
                                        <p className="font-medium">Get Results</p>
                                        <p className="text-sm text-muted-foreground">Receive comprehensive analysis and insurance recommendations</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Supported Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                    <span className="text-sm">Vehicle make and model detection</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                    <span className="text-sm">Year and condition assessment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                    <span className="text-sm">Market value estimation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                    <span className="text-sm">Insurance premium calculation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">✓</Badge>
                                    <span className="text-sm">Coverage recommendations</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 