import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { carAnalysisService } from '@/lib/services/carAnalysisService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Car, Upload, X, Camera, RefreshCw, Shield, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarPhotoAnalyzerProps {
    onAnalysisComplete?: (result: any) => void;
    onAnalysisError?: (error: Error) => void;
}

export default function CarPhotoAnalyzer({
    onAnalysisComplete,
    onAnalysisError,
}: CarPhotoAnalyzerProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const { toast } = useToast();

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Check file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload an image file (JPEG, PNG)',
                    variant: 'destructive',
                });
                return;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please upload an image smaller than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            // Create preview
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
            setAnalysisResult(null);
            setAnalysisProgress(0);

            // Start analysis with progress simulation
            setIsAnalyzing(true);
            const progressInterval = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            try {
                const base64 = await carAnalysisService.fileToBase64(file);
                const result = await carAnalysisService.analyzeCarPhoto({ photoBase64: base64 });

                clearInterval(progressInterval);
                setAnalysisProgress(100);

                setAnalysisResult(result);
                onAnalysisComplete?.(result);

                toast({
                    title: 'Analysis Complete',
                    description: 'Car photo analyzed successfully',
                });
            } catch (error) {
                clearInterval(progressInterval);
                setAnalysisProgress(0);
                console.error('Error analyzing car photo:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to analyze car photo';

                toast({
                    title: 'Analysis Failed',
                    description: errorMessage,
                    variant: 'destructive',
                });

                if (error instanceof Error) {
                    onAnalysisError?.(error);
                }
            } finally {
                setIsAnalyzing(false);
            }

            // Cleanup preview URL
            return () => URL.revokeObjectURL(preview);
        },
        [onAnalysisComplete, onAnalysisError, toast]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
    });

    const resetAnalysis = () => {
        setPreviewUrl(null);
        setAnalysisResult(null);
        setAnalysisProgress(0);
    };

    const formatCurrency = (amount: number | null) => {
        if (!amount) return 'Not available';
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: 'ZMW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {!previewUrl ? (
                <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'p-8 text-center cursor-pointer transition-colors',
                            isDragActive
                                ? 'bg-primary/5'
                                : 'hover:bg-muted/50'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Camera className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">
                                    {isDragActive ? 'Drop the photo here' : 'Upload Car Photo'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Drag & drop or click to select a photo
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                <span>Supports: JPEG, PNG (max 5MB)</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-primary" />
                                Car Photo Analysis
                            </CardTitle>
                            <CardDescription>
                                AI-powered analysis for insurance assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Car preview"
                                    className="w-full rounded-lg shadow-md"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-background/90 hover:bg-background"
                                    onClick={resetAnalysis}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {isAnalyzing ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                                        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-foreground">Analyzing Photo</p>
                                        <p className="text-sm text-muted-foreground">
                                            Our AI is examining the car details...
                                        </p>
                                    </div>
                                    <div className="w-full max-w-xs">
                                        <Progress value={analysisProgress} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1 text-center">
                                            {analysisProgress}% complete
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : analysisResult ? (
                        <div className="space-y-6">
                            {/* Car Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5 text-primary" />
                                        Car Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Make & Model</span>
                                                <span className="font-semibold">{analysisResult.carDetails.makeAndModel || `${analysisResult.carDetails.make} ${analysisResult.carDetails.model}`}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Year</span>
                                                <span className="font-semibold">{analysisResult.carDetails.estimatedYear || 'Not detected'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Body Type</span>
                                                <span className="font-semibold">{analysisResult.carDetails.bodyType || 'Not detected'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Condition</span>
                                                <Badge variant={analysisResult.carDetails.condition === 'Good' ? 'default' : 'secondary'}>
                                                    {analysisResult.carDetails.condition || 'Unknown'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Estimated Value</span>
                                                <span className="font-semibold text-primary">
                                                    {formatCurrency(analysisResult.carDetails.estimatedValue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Insurance Recommendations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Insurance Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Coverage Type</span>
                                            <Badge variant="outline" className="text-primary border-primary">
                                                {analysisResult.insuranceRecommendation.recommendedCoverage}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Estimated Premium</span>
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(analysisResult.insuranceRecommendation.estimatedPremium)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div>
                                            <h4 className="font-medium mb-2">Key Coverage Points</h4>
                                            <ul className="space-y-2">
                                                {analysisResult.insuranceRecommendation.coverageDetails.split(', ').map((point: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Market Data */}
                            {analysisResult.marketplaceRecommendations.similarListings && analysisResult.marketplaceRecommendations.similarListings.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Market Data
                                        </CardTitle>
                                        <CardDescription>
                                            Similar cars in the Zambian market
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {analysisResult.marketplaceRecommendations.similarListings.map((car: any, index: number) => (
                                                <div key={index} className="p-3 bg-muted rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{car.description}</span>
                                                        <Badge variant="secondary">
                                                            {car.price > 0 ? formatCurrency(car.price) : 'Price on request'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={resetAnalysis}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Analyze Another Photo
                                </Button>
                                <Button className="flex-1">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Get Insurance Quote
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
} 