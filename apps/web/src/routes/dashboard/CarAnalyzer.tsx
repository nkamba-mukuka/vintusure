import CarPhotoAnalyzer from '@/components/car/CarPhotoAnalyzer';

export default function CarAnalyzerPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Car Photo Analyzer</h1>
                    <p className="mt-2 text-gray-600">
                        Upload a photo of a car and our AI will analyze it to provide detailed information about the vehicle,
                        insurance recommendations, and similar cars available in the Zambian market.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <CarPhotoAnalyzer
                            onAnalysisComplete={(result) => {
                                console.log('Analysis complete:', result);
                            }}
                            onAnalysisError={(error) => {
                                console.error('Analysis error:', error);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 