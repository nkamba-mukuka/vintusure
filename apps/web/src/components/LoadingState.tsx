import { Loader2Icon } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    className?: string;
    variant?: 'spinner' | 'skeleton' | 'pulse';
    size?: 'sm' | 'md' | 'lg';
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div 
            className={`shimmer rounded-md bg-muted ${className}`}
            role="status"
            aria-label="Loading content"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="border rounded-lg p-6 w-full animate-fade-in">
            <div className="space-y-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="border rounded-lg w-full animate-fade-in">
            <div className="p-4 border-b">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LoadingState({ 
    message = 'Loading...', 
    className = '',
    variant = 'spinner',
    size = 'md'
}: LoadingStateProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const containerSizeClasses = {
        sm: 'min-h-[100px]',
        md: 'min-h-[200px]',
        lg: 'min-h-[300px]'
    };

    if (variant === 'skeleton') {
        return (
            <div className={`space-y-4 ${className}`}>
                <SkeletonCard />
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className={`flex items-center justify-center ${containerSizeClasses[size]} ${className}`}>
                <div className="space-y-4 text-center">
                    <div className={`${sizeClasses[size]} bg-primary rounded-full mx-auto pulse-primary`} />
                    <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`flex items-center justify-center ${containerSizeClasses[size]} ${className}`}
            role="status"
            aria-live="polite"
            aria-label={message}
        >
            <div className="flex flex-col items-center gap-4">
                <Loader2Icon 
                    className={`${sizeClasses[size]} animate-spin text-primary`}
                    aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
} 