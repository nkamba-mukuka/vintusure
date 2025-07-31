import { Loader2Icon } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export default function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            {message && (
                <p className="mt-4 text-sm text-gray-600">{message}</p>
            )}
        </div>
    )
} 