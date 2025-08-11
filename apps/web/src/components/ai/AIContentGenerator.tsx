import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Brain, Search, Database, CheckCircle } from 'lucide-react';
import FileUploadModal from './FileUploadModal';

export default function AIContentGenerator() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { toast } = useToast();

    const handleUploadSuccess = () => {
        toast({
            title: 'Success',
            description: 'Files uploaded successfully! VintuSure AI can now help answer questions about your documents.',
        });
    };

    const features = [
        {
            icon: <Upload className="h-6 w-6" />,
            title: 'Easy Upload',
            description: 'Simply drag and drop your insurance documents or click to browse files',
        },
        {
            icon: <Brain className="h-6 w-6" />,
            title: 'Smart Processing',
            description: 'VintuSure AI automatically reads and understands your documents',
        },
        {
            icon: <Search className="h-6 w-6" />,
            title: 'Quick Answers',
            description: 'Get instant answers to questions about your uploaded documents',
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: 'Secure Storage',
            description: 'Your documents are safely stored with enterprise-grade security',
        },
    ];

    const supportedFormats = [
        { format: 'PDF', icon: <FileText className="h-4 w-4" />, color: 'text-red-500' },
        { format: 'DOC/DOCX', icon: <FileText className="h-4 w-4" />, color: 'text-blue-500' },
        { format: 'JPG/PNG', icon: <FileText className="h-4 w-4" />, color: 'text-green-500' },
        { format: 'TXT', icon: <FileText className="h-4 w-4" />, color: 'text-gray-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                    <Brain className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Upload Files to VintuSure</h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload your insurance documents to help VintuSure AI provide better answers to your questions. 
                    Your files are securely stored and protected with enterprise-grade privacy controls.
                </p>
            </div>

            {/* Main Upload Section */}
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Upload Your Insurance Documents</h3>
                            <p className="text-muted-foreground mb-6">
                                Drag and drop your files or click to browse. Your documents will be securely 
                                uploaded and made available to help answer questions.
                            </p>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-8"
                        >
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Documents
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold">{feature.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Supported Formats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Supported File Formats</span>
                    </CardTitle>
                    <CardDescription>
                        Upload documents in these formats for processing and indexing
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {supportedFormats.map((format, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                                <div className={format.color}>
                                    {format.icon}
                                </div>
                                <span className="font-medium">{format.format}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            <strong>Privacy & Security:</strong> Your documents are encrypted and stored securely. 
                            Only authorized users can access your uploaded files. Maximum file size is 5MB per file.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                        Simple steps to get your documents working with VintuSure AI
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold">Upload Your Files</h4>
                                <p className="text-sm text-muted-foreground">
                                    Upload your insurance policies, claims documents, or any relevant files you want VintuSure to understand.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold">AI Reads Your Documents</h4>
                                <p className="text-sm text-muted-foreground">
                                    VintuSure AI automatically reads and understands the content of your uploaded files.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold">Secure Storage</h4>
                                <p className="text-sm text-muted-foreground">
                                    Your documents are securely stored and protected with enterprise-grade encryption.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                4
                            </div>
                            <div>
                                <h4 className="font-semibold">Get Better Answers</h4>
                                <p className="text-sm text-muted-foreground">
                                    Now when you ask questions, VintuSure AI can provide answers based on your specific documents.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Modal */}
            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
} 