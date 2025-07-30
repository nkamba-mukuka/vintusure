'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <Button onClick={this.handleRetry}>Try Again</Button>
                </div>
            );
        }

        return this.props.children;
    }
} 