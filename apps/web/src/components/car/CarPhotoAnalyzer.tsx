import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { carAnalysisService } from '@/lib/services/carAnalysisService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Car, Upload, X, Camera, RefreshCw } from 'lucide-react';
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

            // Start analysis
            setIsAnalyzing(true);
            try {
                const base64 = await carAnalysisService.fileToBase64(file);
                const result = await carAnalysisService.analyzeCarPhoto({ photoBase64: base64 });

                setAnalysisResult(result);
                onAnalysisComplete?.(result);

                toast({
                    title: 'Analysis Complete',
                    description: 'Car photo analyzed successfully',
                });
            } catch (error) {
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
    };

    return (
        <div className="space-y-6">
            {!previewUrl ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                        isDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                        <Camera className="h-10 w-10 text-gray-400" />
                        <div>
                            <p className="text-base font-medium text-gray-900">
                                {isDragActive ? 'Drop the photo here' : 'Upload Car Photo'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Drag & drop or click to select a photo
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">
                            Supports: JPEG, PNG (max 5MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Car preview"
                            className="w-full rounded-lg shadow-md"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                            onClick={resetAnalysis}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {isAnalyzing ? (
                        <Card className="p-6">
                            <div className="flex flex-col items-center gap-4">
                                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                                <div className="text-center">
                                    <p className="font-medium text-gray-900">Analyzing Photo</p>
                                    <p className="text-sm text-gray-500">
                                        Our AI is examining the car details...
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : analysisResult ? (
                        <Card className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Car Details</h3>
                                    <div className="mt-2 space-y-2">
                                        <p><strong>Make and Model:</strong> {analysisResult.carDetails.makeAndModel}</p>
                                        <p><strong>Year:</strong> {analysisResult.carDetails.year}</p>
                                        <p><strong>Body Type:</strong> {analysisResult.carDetails.bodyType}</p>
                                        <p><strong>Condition:</strong> {analysisResult.carDetails.condition}</p>
                                        <p><strong>Estimated Value:</strong> {analysisResult.carDetails.estimatedValue} ZMW</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold">Insurance Recommendations</h3>
                                    <div className="mt-2 space-y-2">
                                        <p><strong>Coverage Type:</strong> {analysisResult.insurance.coverageType}</p>
                                        <p><strong>Estimated Premium:</strong> {analysisResult.insurance.estimatedPremium} ZMW/year</p>
                                        <div>
                                            <strong>Key Coverage Points:</strong>
                                            <ul className="list-disc list-inside ml-2">
                                                {analysisResult.insurance.coveragePoints.map((point: string, index: number) => (
                                                    <li key={index}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold">Similar Cars</h3>
                                    <div className="mt-2 space-y-2">
                                        {analysisResult.similarCars.map((car: any, index: number) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded">
                                                <p><strong>{car.model}</strong></p>
                                                <p className="text-sm text-gray-600">Price Range: {car.priceRange} ZMW</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={resetAnalysis}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Analyze Another Photo
                                </Button>
                            </div>
                        </Card>
                    ) : null}
                </div>
            )}
        </div>
    );
} 