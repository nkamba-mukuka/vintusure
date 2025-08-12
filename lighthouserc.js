module.exports = {
    ci: {
        collect: {
            startServerCommand: 'npm run preview',
            url: ['http://localhost:4173'],
            numberOfRuns: 3,
        },
        assert: {
            preset: 'lighthouse:recommended',
            assertions: {
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.9 }],

                // Performance budgets
                'resource-size': ['error', { maxNumericValue: 1000 }],
                'dom-size': ['error', { maxNumericValue: 1500 }],
                'total-blocking-time': ['error', { maxNumericValue: 300 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
                'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
                'speed-index': ['error', { maxNumericValue: 3000 }],
                'interactive': ['error', { maxNumericValue: 3500 }],

                // Accessibility requirements
                'aria-allowed-attr': 'error',
                'aria-hidden-body': 'error',
                'aria-hidden-focus': 'error',
                'aria-required-attr': 'error',
                'aria-required-children': 'error',
                'aria-required-parent': 'error',
                'aria-roles': 'error',
                'aria-valid-attr-value': 'error',
                'aria-valid-attr': 'error',
                'button-name': 'error',
                'color-contrast': 'error',
                'document-title': 'error',
                'form-field-multiple-labels': 'error',
                'html-has-lang': 'error',
                'image-alt': 'error',
                'input-image-alt': 'error',
                'label': 'error',
                'link-name': 'error',
                'list': 'error',
                'listitem': 'error',
                'meta-viewport': 'error',
                'valid-lang': 'error',

                // PWA requirements
                'installable-manifest': 'error',
                'service-worker': 'error',
                'splash-screen': 'error',
                'themed-omnibox': 'error',
                'content-width': 'error',
                'viewport': 'error',

                // Best practices
                'no-document-write': 'error',
                'no-vulnerable-libraries': 'error',
                'password-inputs-can-be-pasted-into': 'error',
                'uses-https': 'error',
                'uses-long-cache-ttl': 'warning',
                'uses-optimized-images': 'warning',
                'uses-text-compression': 'error',
                'uses-responsive-images': 'warning',
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
}; 