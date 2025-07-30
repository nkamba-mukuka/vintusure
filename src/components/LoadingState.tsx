'use client';

import { Loader2Icon } from 'lucide-react';

interface LoadingStateProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    message?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export default function LoadingState({
    size = 'md',
    fullScreen = false,
    message = 'Loading...',
}: LoadingStateProps) {
    const containerClasses = fullScreen
        ? 'fixed inset-0 bg-white/80 backdrop-blur-sm'
        : 'w-full';
    const heightClasses = fullScreen ? 'h-screen' : 'h-64';

    return (
        <div className={containerClasses}>
            <div className={`${heightClasses} flex flex-col items-center justify-center`}>
                <Loader2Icon className={`${sizeClasses[size]} animate-spin text-gray-900`} />
                {message && (
                    <p className="mt-4 text-sm text-gray-500">{message}</p>
                )}
            </div>
        </div>
    );
} 