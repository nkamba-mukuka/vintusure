import * as Sentry from '@sentry/react';

export const initSentry = () => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: process.env.NODE_ENV,
            beforeSend(event) {
                // Check if it's an error event
                if (event.exception) {
                    Sentry.showReportDialog({ eventId: event.event_id });
                }
                return event;
            },
        });
    }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error, {
            extra: context,
        });
    } else {
        console.error('Error:', error, 'Context:', context);
    }
};

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
};

export const clearUserContext = () => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.setUser(null);
    }
};

export const addBreadcrumb = (
    message: string,
    category?: string,
    level?: Sentry.SeverityLevel
) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.addBreadcrumb({
            message,
            category,
            level,
        });
    }
}; 