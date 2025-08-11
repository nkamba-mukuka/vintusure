import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { carAnalysisService, type CarAnalysisResult } from '@/lib/services/carAnalysisService';
import { premiumService } from '@/lib/services/premiumService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Car, Upload, X, Camera, RefreshCw, Shield, DollarSign, TrendingUp, AlertCircle, CheckCircle, Image, ExternalLink } from 'lucide-react';
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
    const [analysisResult, setAnalysisResult] = useState<CarAnalysisResult | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            await processCarPhoto(file);
        },
        [onAnalysisComplete, onAnalysisError, toast]
    );

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

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'Image size should be less than 5MB',
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
                title: 'Success',
                description: 'Car photo analyzed successfully',
            });
        } catch (error) {
            clearInterval(progressInterval);
            setAnalysisProgress(0);
            console.error('Error analyzing car photo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to analyze car photo';

            toast({
                title: 'Error',
                description: 'Failed to analyze car photo. Please try again.',
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
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
    });

    const resetAnalysis = () => {
        setPreviewUrl(null);
        setAnalysisResult(null);
        setAnalysisProgress(0);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleCarPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processCarPhoto(file);
        }
    };



    return (
        <div className="space-y-6">
            {!previewUrl ? (
                <Card className={cn(
                    "border-2 border-dashed transition-colors",
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-primary/20 hover:border-primary/40'
                )}>
                    <div
                        {...getRootProps()}
                        className={cn(
                            'p-8 text-center cursor-pointer transition-colors',
                            isDragging
                                ? 'bg-blue-50'
                                : 'hover:bg-muted/50'
                        )}
                    >
                        <input {...getInputProps()} />
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
                                <p className="text-lg font-semibold text-foreground">
                                    {isDragging ? 'Drop your image here' : 'Upload Car Photo'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {isDragging ? 'Drop your image here' : 'Drag and drop or click to browse'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
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
                                    <div className="bg-muted rounded-lg p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Make & Model</p>
                                                <p className="font-medium">{analysisResult.carDetails.make} {analysisResult.carDetails.model}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Year</p>
                                                <p className="font-medium">{analysisResult.carDetails.estimatedYear}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Value</p>
                                                <p className="font-medium">
                                                    {analysisResult.carDetails.estimatedValue
                                                        ? premiumService.formatCurrency(analysisResult.carDetails.estimatedValue)
                                                        : "Not Found"}
                                                </p>
                                                {analysisResult.carDetails.researchSources && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {analysisResult.carDetails.researchSources[0]}
                                                    </p>
                                                )}
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
                                        Insurance Recommendation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-primary/5 rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-gray-500">Recommended Coverage</p>
                                                <p className="font-medium">{analysisResult.insuranceRecommendation.recommendedCoverage}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Premium</p>
                                                <p className="font-medium">{premiumService.formatCurrency(analysisResult.insuranceRecommendation.estimatedPremium)}</p>
                                                {!analysisResult.carDetails.estimatedValue && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Base premium - actual premium may vary after assessment
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Marketplace Recommendations */}
                            {analysisResult.marketplaceRecommendations && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Where to Buy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted rounded-lg p-4">
                                            {analysisResult.marketplaceRecommendations.similarListings?.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Similar Cars:</h4>
                                                    <div className="space-y-2">
                                                        {analysisResult.marketplaceRecommendations.similarListings.map((listing: any, index: number) => (
                                                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0 gap-2">
                                                                <div>
                                                                    <p className="text-sm font-medium">{listing.description}</p>
                                                                    <p className="text-xs text-gray-500">{listing.platform}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium">{premiumService.formatCurrency(listing.price)}</span>
                                                                    <a
                                                                        href={listing.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Marketplaces:</h4>
                                                <div className="grid gap-2">
                                                    {analysisResult.marketplaceRecommendations.marketplaces.map((marketplace: any, index: number) => (
                                                        <a
                                                            key={index}
                                                            href={marketplace.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-card rounded-md hover:bg-muted transition-colors gap-2"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium">{marketplace.name}</p>
                                                                <p className="text-xs text-gray-500">{marketplace.description}</p>
                                                            </div>
                                                            <ExternalLink className="h-4 w-4 text-gray-400" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
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