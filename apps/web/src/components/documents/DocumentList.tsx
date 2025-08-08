import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Download, 
    Trash2, 
    Eye, 
    Calendar,
    FileImage,
    File,
    FileType
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/lib/services/documentService';

interface Document {
    url: string;
    path: string;
    name: string;
    type: string;
    description: string;
    uploadedAt?: Date;
}

interface DocumentListProps {
    documents: Document[];
    onDocumentDelete: (path: string) => void;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return <FileType className="h-8 w-8 text-red-500" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <FileImage className="h-8 w-8 text-green-500" />;
        case 'doc':
        case 'docx':
            return <FileText className="h-8 w-8 text-blue-500" />;
        default:
            return <File className="h-8 w-8 text-gray-500" />;
    }
};

const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'policy':
            return 'default';
        case 'claim':
            return 'destructive';
        case 'invoice':
            return 'secondary';
        case 'contract':
            return 'outline';
        case 'certificate':
            return 'default';
        default:
            return 'secondary';
    }
};

export default function DocumentList({ documents, onDocumentDelete }: DocumentListProps) {
    const { toast } = useToast();

    const handleDownload = async (doc: Document) => {
        try {
            const response = await fetch(doc.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast({
                title: 'Success',
                description: 'Document downloaded successfully',
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: 'Error',
                description: 'Failed to download document',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (doc: Document) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                // Use document service (removed DEV mode check)
                await documentService.deleteDocument(doc.path);
                onDocumentDelete(doc.path);
                
                toast({
                    title: 'Success',
                    description: 'Document deleted successfully',
                });
            } catch (error) {
                console.error('Delete error:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to delete document',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleView = (doc: Document) => {
        window.open(doc.url, '_blank');
    };

    if (documents.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                    <p className="text-gray-500 text-center">
                        Upload your first document to get started
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {documents.map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                                <div className="flex-shrink-0">
                                    {getFileIcon(doc.name)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                            {doc.name}
                                        </h3>
                                        <Badge variant={getTypeBadgeVariant(doc.type)}>
                                            {doc.type}
                                        </Badge>
                                    </div>
                                    
                                    {doc.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {doc.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {doc.uploadedAt && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {doc.uploadedAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>
                                                {doc.name.split('.').pop()?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(doc)}
                                    title="View document"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(doc)}
                                    title="Download document"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(doc)}
                                    title="Delete document"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
