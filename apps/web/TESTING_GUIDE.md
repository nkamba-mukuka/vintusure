# Testing Guide for VintuSure

This guide covers all aspects of testing in the VintuSure project, including unit tests, integration tests, E2E tests, and quality assurance.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Test Coverage](#test-coverage)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Best Practices](#best-practices)

## Quick Start

### Running All Tests
```bash
# Run all tests (unit + E2E)
npm run test:all

# Run only unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Installing Dependencies
```bash
# Install all dependencies including Playwright browsers
npm install
npx playwright install --with-deps
```

## Unit Testing

### Framework
- **Vitest**: Fast unit test runner
- **Testing Library**: React component testing utilities
- **Jest DOM**: Custom DOM element matchers

### Writing Unit Tests

#### Basic Component Test
```tsx
import { render, screen } from '@/test/test-utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Testing with Mock Data
```tsx
import { render, screen, mockUser } from '@/test/test-utils'
import { UserProfile } from '@/components/UserProfile'

describe('UserProfile Component', () => {
  it('displays user information', () => {
    render(<UserProfile user={mockUser} />)
    
    expect(screen.getByText(mockUser.firstName)).toBeInTheDocument()
    expect(screen.getByText(mockUser.lastName)).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })
})
```

### Testing Hooks
```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth Hook', () => {
  it('returns user when authenticated', async () => {
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined()
    })
  })
})
```

## Integration Testing

### Testing API Calls
```tsx
import { render, screen, waitFor } from '@/test/test-utils'
import { CustomerList } from '@/components/CustomerList'
import { customerService } from '@/lib/services/customerService'

// Mock the service
vi.mock('@/lib/services/customerService')

describe('CustomerList Integration', () => {
  it('loads and displays customers', async () => {
    const mockCustomers = [mockCustomer]
    vi.mocked(customerService.getCustomers).mockResolvedValue(mockCustomers)
    
    render(<CustomerList />)
    
    await waitFor(() => {
      expect(screen.getByText(mockCustomers[0].firstName)).toBeInTheDocument()
    })
  })
})
```

### Testing Form Submissions
```tsx
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { CustomerForm } from '@/components/CustomerForm'

describe('CustomerForm Integration', () => {
  it('submits form data correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<CustomerForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      })
    })
  })
})
```

## E2E Testing

### Framework
- **Playwright**: Cross-browser E2E testing
- **Multiple browsers**: Chrome, Firefox, Safari
- **Mobile testing**: Responsive design validation

### Writing E2E Tests

#### Basic Page Test
```tsx
import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display main content', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('heading', { name: /VintuSure/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible()
  })
})
```

#### Testing User Flows
```tsx
test.describe('Authentication Flow', () => {
  test('user can sign up and access dashboard', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup')
    
    // Fill signup form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.fill('[name="confirmPassword"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/)
    
    // Complete onboarding
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.click('button[type="submit"]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
  })
})
```

### Testing Responsive Design
```tsx
test('should be responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  
  // Check mobile menu
  const menuButton = page.getByRole('button', { name: /menu/i })
  await expect(menuButton).toBeVisible()
  
  await menuButton.click()
  await expect(page.getByRole('navigation')).toBeVisible()
})
```

## Accessibility Testing

### Automated Accessibility Tests
```tsx
import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test('should meet accessibility standards', async ({ page }) => {
  await page.goto('/')
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
```

### Manual Accessibility Checklist
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus indicators are visible

## Performance Testing

### Lighthouse CI
```bash
# Run performance tests locally
npx lhci autorun

# Run with custom configuration
npx lhci collect --url=http://localhost:4173/
npx lhci assert
```

### Performance Metrics
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 300ms

## Test Coverage

### Coverage Goals
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Generating Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

### Coverage Exclusions
- Test files
- Configuration files
- Type definitions
- Build artifacts

## CI/CD Pipeline

### GitHub Actions Workflow
The CI/CD pipeline runs on every push and pull request:

1. **Unit Tests**: Vitest with coverage
2. **E2E Tests**: Playwright across browsers
3. **Security Audit**: npm audit
4. **Lighthouse CI**: Performance testing
5. **Accessibility Tests**: Automated a11y checks

### Pipeline Stages
```yaml
test:
  - Linting
  - Type checking
  - Unit tests with coverage
  - E2E tests

security:
  - Dependency audit
  - Vulnerability scanning

quality:
  - Lighthouse performance
  - Accessibility testing
  - Code coverage reporting
```

## Best Practices

### Test Organization
```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   ├── services/       # Service tests
│   └── utils/          # Utility tests
├── e2e/                # E2E tests
└── test/               # Test utilities
    ├── setup.ts        # Test setup
    └── test-utils.tsx  # Custom render function
```

### Naming Conventions
- Test files: `ComponentName.test.tsx`
- Test suites: `ComponentName`
- Test cases: Descriptive action/behavior

### Test Data
- Use factory functions for test data
- Keep test data realistic
- Use TypeScript for type safety

### Mocking
- Mock external dependencies
- Use vi.mock() for module mocking
- Provide realistic mock implementations

### Assertions
- Use specific assertions
- Test behavior, not implementation
- Use custom matchers for common patterns

### Error Testing
```tsx
it('handles errors gracefully', async () => {
  vi.mocked(apiService.fetchData).mockRejectedValue(new Error('Network error'))
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
  })
})
```

### Async Testing
```tsx
it('loads data asynchronously', async () => {
  render(<AsyncComponent />)
  
  // Show loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Common Issues

#### Test Environment Setup
```bash
# Clear test cache
npm run test -- --clearCache

# Run tests in watch mode
npm run test -- --watch

# Debug failing tests
npm run test -- --reporter=verbose
```

#### E2E Test Issues
```bash
# Install browsers
npx playwright install

# Run with headed mode
npm run test:e2e:headed

# Debug with trace
npx playwright test --trace on
```

#### Coverage Issues
```bash
# Regenerate coverage
rm -rf coverage/
npm run test:coverage

# Check coverage thresholds
npm run test:coverage -- --coverage.threshold.global.lines=70
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Accessibility Testing Guide](https://www.a11yproject.com/checklist/)
